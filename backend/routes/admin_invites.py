"""Admin invitation flow.

An existing admin invites a new staff member by email. The invite is stored in
the ``admin_invites`` collection with a cryptographic token. The invite email
contains a one-time link to ``/admin/accept-invite?token=…``. The recipient
accepts by submitting a name + password; their account is created (or upgraded
if it already exists) with the ``admin`` role.

Security properties:
- Only existing admins can create or revoke invites (``require_admin``).
- Invite tokens are 32 bytes of ``secrets.token_urlsafe`` (≈256 bits of entropy).
- Invites expire 7 days after creation.
- Each token is single-use — the status flips to ``accepted`` once consumed.
- No email-domain check is enforced — the calling admin is the trust anchor.
"""
from __future__ import annotations

import logging
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from database import db
from helpers.auth import require_admin
from helpers.email import is_smtp_configured, send_email_async
from helpers.passwords import hash_password
from models import User

logger = logging.getLogger(__name__)
router = APIRouter()


INVITE_TTL = timedelta(days=7)


def _ensure_utc(value):
    """MongoDB returns naive datetimes for tz-aware writes — re-attach UTC."""
    if isinstance(value, datetime) and value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


# ---------- request / response schemas ----------


class AdminInviteCreate(BaseModel):
    email: EmailStr
    note: Optional[str] = None  # optional context, e.g. "CTO, joining 1 Jul"


class AdminInviteAccept(BaseModel):
    token: str
    name: str
    password: str


# ---------- helpers ----------


def _app_url() -> str:
    return (os.environ.get("APP_URL") or "https://dequad.co.uk").rstrip("/")


def _build_invite_link(token: str) -> str:
    return f"{_app_url()}/admin/accept-invite?token={token}"


def _invite_to_public(doc: dict) -> dict:
    return {
        "id": doc.get("id"),
        "email": doc.get("email"),
        "status": doc.get("status"),
        "invited_by_name": doc.get("invited_by_name"),
        "invited_by_email": doc.get("invited_by_email"),
        "note": doc.get("note"),
        "created_at": (
            _ensure_utc(doc["created_at"]).isoformat()
            if isinstance(doc.get("created_at"), datetime)
            else doc.get("created_at")
        ),
        "expires_at": (
            _ensure_utc(doc["expires_at"]).isoformat()
            if isinstance(doc.get("expires_at"), datetime)
            else doc.get("expires_at")
        ),
        "accepted_at": (
            _ensure_utc(doc["accepted_at"]).isoformat()
            if isinstance(doc.get("accepted_at"), datetime)
            else doc.get("accepted_at")
        ),
        "invite_link": _build_invite_link(doc["token"]) if doc.get("status") == "pending" else None,
    }


def _build_invite_email(invite: dict, inviter_name: str) -> tuple[str, str]:
    link = _build_invite_link(invite["token"])
    expires_human = invite["expires_at"].strftime("%d %b %Y")
    html = f"""
<p>Hi,</p>
<p><strong>{inviter_name}</strong> has invited you to join the DEQUAD admin team.</p>
<p>Click the button below to set your password and access the admin dashboard:</p>
<p style="text-align:center;margin:24px 0;">
  <a href="{link}" style="display:inline-block;padding:12px 28px;background:#7B61FF;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">
    Accept admin invitation
  </a>
</p>
<p>This link is valid until <strong>{expires_human}</strong> and can be used once.</p>
<p>If you weren't expecting this, you can safely ignore the email.</p>
<p>— DEQUAD</p>
""".strip()
    text = (
        f"Hi,\n\n"
        f"{inviter_name} has invited you to join the DEQUAD admin team.\n\n"
        f"Set your password using this link (valid until {expires_human}):\n\n"
        f"{link}\n\n"
        f"If you weren't expecting this, you can safely ignore the email.\n\n"
        f"— DEQUAD"
    )
    return html, text


# ---------- admin-only endpoints ----------


@router.post("/admin/invites")
async def create_admin_invite(
    data: AdminInviteCreate,
    admin: User = Depends(require_admin),
):
    """Create a fresh invite. Revokes any earlier pending invite for the same email."""
    email = data.email.lower().strip()

    # Best-effort revoke of older pending invites for this email
    await db.admin_invites.update_many(
        {"email": email, "status": "pending"},
        {"$set": {"status": "revoked", "revoked_at": datetime.now(timezone.utc)}},
    )

    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    invite = {
        "id": str(uuid.uuid4()),
        "token": token,
        "email": email,
        "invited_by": admin.user_id,
        "invited_by_email": admin.email,
        "invited_by_name": admin.name,
        "note": (data.note or "").strip() or None,
        "status": "pending",
        "created_at": now,
        "expires_at": now + INVITE_TTL,
        "accepted_at": None,
    }
    await db.admin_invites.insert_one(invite)

    # Send the invitation email (non-fatal if SMTP fails — admin can still copy the link).
    email_sent = False
    if is_smtp_configured():
        try:
            html, text = _build_invite_email(invite, admin.name)
            email_sent = await send_email_async(
                [email],
                subject=f"You're invited to the DEQUAD admin team",
                html_body=html,
                text_body=text,
            )
        except Exception as exc:
            logger.warning(f"Failed to send admin invite email to {email}: {exc}")
            email_sent = False
    else:
        logger.info("SMTP not configured — invite created without sending email")

    public = _invite_to_public(invite)
    public["email_sent"] = email_sent
    return public


@router.get("/admin/invites")
async def list_admin_invites(admin: User = Depends(require_admin)):
    # Auto-expire any past-deadline invites that are still pending.
    now = datetime.now(timezone.utc)
    await db.admin_invites.update_many(
        {"status": "pending", "expires_at": {"$lt": now}},
        {"$set": {"status": "expired"}},
    )
    docs = await db.admin_invites.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [_invite_to_public(d) for d in docs]


@router.delete("/admin/invites/{invite_id}")
async def revoke_admin_invite(invite_id: str, admin: User = Depends(require_admin)):
    result = await db.admin_invites.update_one(
        {"id": invite_id, "status": "pending"},
        {"$set": {"status": "revoked", "revoked_at": datetime.now(timezone.utc)}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="No pending invite with that id")
    return {"revoked": True, "id": invite_id}


# ---------- public endpoints (no auth — token IS the auth) ----------


@router.get("/admin/invites/by-token/{token}")
async def get_invite_by_token(token: str):
    """Public endpoint used by the accept-invite page on load to render the recipient's email."""
    doc = await db.admin_invites.find_one({"token": token}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if doc["status"] != "pending":
        raise HTTPException(status_code=410, detail=f"Invitation already {doc['status']}")
    if _ensure_utc(doc["expires_at"]) < datetime.now(timezone.utc):
        await db.admin_invites.update_one(
            {"token": token}, {"$set": {"status": "expired"}}
        )
        raise HTTPException(status_code=410, detail="Invitation has expired")
    return {
        "email": doc["email"],
        "invited_by_name": doc.get("invited_by_name"),
        "expires_at": _ensure_utc(doc["expires_at"]).isoformat(),
    }


@router.post("/admin/invites/accept")
async def accept_admin_invite(data: AdminInviteAccept):
    """Consume an invitation token. Creates/promotes the user to admin."""
    if not data.password or len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    doc = await db.admin_invites.find_one({"token": data.token}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Invitation not found")
    if doc["status"] != "pending":
        raise HTTPException(status_code=410, detail=f"Invitation already {doc['status']}")
    if _ensure_utc(doc["expires_at"]) < datetime.now(timezone.utc):
        await db.admin_invites.update_one(
            {"token": data.token}, {"$set": {"status": "expired"}}
        )
        raise HTTPException(status_code=410, detail="Invitation has expired")

    email = doc["email"]
    password_hash = hash_password(data.password)
    now = datetime.now(timezone.utc)

    existing = await db.users.find_one({"email": email})
    if existing:
        # Upgrade the existing record to admin, replacing the admin password.
        await db.users.update_one(
            {"email": email},
            {"$set": {
                "role": "admin",
                "name": data.name.strip() or existing.get("name") or email,
                "admin_password": password_hash,
                "auth_method": existing.get("auth_method") or "email",
                "profile_completed": True,
            }},
        )
        user_id = existing.get("user_id") or existing.get("id")
        action = "upgraded"
    else:
        user_id = f"admin-{uuid.uuid4().hex[:8]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": data.name.strip() or email,
            "role": "admin",
            "admin_password": password_hash,
            "auth_method": "email",
            "profile_completed": True,
            "created_at": now,
        })
        action = "created"

    await db.admin_invites.update_one(
        {"token": data.token},
        {"$set": {
            "status": "accepted",
            "accepted_at": now,
            "accepted_user_id": user_id,
        }},
    )

    logger.info(f"Admin invite accepted: {email} {action} as admin by token")
    return {
        "success": True,
        "action": action,
        "email": email,
        "login_url": f"{_app_url()}/admin/login",
    }
