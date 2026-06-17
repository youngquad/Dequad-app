from fastapi import APIRouter, Request, Response, Depends, HTTPException
from datetime import datetime, timezone, timedelta
from typing import Optional
from pymongo import ReturnDocument
from pydantic import BaseModel
import hashlib
import secrets
import uuid
import os
import httpx
import logging

from database import db
from models import (
    User, UserSession, SessionDataResponse,
    AdminLoginRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from helpers.auth import get_session_token, get_current_user
from helpers.email import (
    is_smtp_configured, send_email_async, create_password_reset_email_html
)
from helpers.uk_student_email import classify_email
from config import ADMIN_SECRET_CODE

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    """Send a password-reset link to any registered user (admin OR student).

    Response is intentionally uniform whether or not the email exists, to
    prevent account enumeration. The role baked into the reset record
    decides which password field gets updated when the user clicks the link.
    """
    email_lower = data.email.lower().strip()
    generic_response = {"message": "If an account exists with this email, a reset link has been sent."}

    user = await db.users.find_one({"email": email_lower}, {"_id": 0})
    if not user:
        return generic_response

    role = user.get("role", "student")
    # Admins reset `admin_password`; students reset `password_hash`. Only
    # accounts that already have one of those fields can use this flow —
    # Google-only accounts (no password set yet) get a generic response so we
    # don't leak that the account exists but is OAuth-only.
    if role == "admin":
        if not user.get("admin_password"):
            return generic_response
    else:
        if not user.get("password_hash"):
            return generic_response

    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    await db.password_resets.delete_many({"email": email_lower})
    await db.password_resets.insert_one({
        "email": email_lower,
        "token": reset_token,
        "role": role,
        "created_at": datetime.now(timezone.utc),
        "expires_at": expires_at,
        "used": False,
    })

    app_url = os.environ.get("APP_URL", "").rstrip("/")
    # Admins still use the legacy /admin/reset-password page; students get the
    # in-app screen under (auth)/reset-password.
    reset_path = "/admin/reset-password" if role == "admin" else "/reset-password"
    reset_url = f"{app_url}{reset_path}?token={reset_token}"

    if is_smtp_configured():
        subject = "DEQUAD Password Reset" if role != "admin" else "DEQUAD Admin Password Reset"
        html_body = create_password_reset_email_html(user.get("name", role.title()), reset_url)
        text_body = f"""
Hi {user.get("name", role.title())},

We received a request to reset your DEQUAD password.

Click here to reset your password:
{reset_url}

This link expires in 1 hour.

If you didn't request this reset, please ignore this email.

- DEQUAD Team
        """
        await send_email_async([email_lower], subject, html_body, text_body)
        logger.info(f"Password reset email sent to {email_lower} (role={role})")
    else:
        logger.warning(f"SMTP not configured - password reset token for {email_lower}: {reset_token}")

    return generic_response


@router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest):
    reset_record = await db.password_resets.find_one({
        "token": data.token, "used": False,
        "expires_at": {"$gt": datetime.now(timezone.utc)}
    })
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    password_hash = hashlib.sha256(data.new_password.encode()).hexdigest()
    # Update the correct field based on the role captured when the token was
    # issued. Falls back to admin_password for legacy records that don't carry
    # a role (pre-existing admin reset tokens).
    role = reset_record.get("role", "admin")
    field = "admin_password" if role == "admin" else "password_hash"
    result = await db.users.update_one(
        {"email": reset_record["email"]},
        {"$set": {field: password_hash}},
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update password")

    await db.password_resets.update_one({"token": data.token}, {"$set": {"used": True}})
    logger.info(f"Password reset successful for {reset_record['email']} (role={role})")
    return {"message": "Password reset successful. You can now login with your new password."}


@router.get("/auth/verify-reset-token")
async def verify_reset_token(token: str):
    reset_record = await db.password_resets.find_one({
        "token": token, "used": False,
        "expires_at": {"$gt": datetime.now(timezone.utc)}
    })
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    return {"valid": True, "email": reset_record["email"]}


class EmailRegisterRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    # User must tick "I confirm I am a current student at a UK university"
    # before we accept bare-domain `.ac.uk` addresses. Required by the UK
    # student-email policy (see helpers/uk_student_email.py).
    confirm_student: bool = False


class EmailLoginRequest(BaseModel):
    email: str
    password: str


@router.post("/auth/register")
async def email_register(data: EmailRegisterRequest, response: Response):
    """Create a student account with an email + password.

    Applies the UK student-email policy: only `.ac.uk` addresses are
    accepted, obvious staff/alumni patterns are hard-rejected, known
    student-subdomain emails (`student.*.ac.uk`, etc.) are auto-approved,
    and bare `.ac.uk` addresses require an explicit `confirm_student`
    attestation and get flagged for admin review.
    """
    email_lower = (data.email or "").lower().strip()
    if "@" not in email_lower or "." not in email_lower.split("@")[-1]:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    if len(data.password or "") < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    verdict = classify_email(email_lower)
    if verdict.verdict in ("blocked", "not_uk_academic"):
        raise HTTPException(status_code=403, detail=verdict.reason)
    if verdict.verdict == "needs_attestation" and not data.confirm_student:
        raise HTTPException(
            status_code=400,
            detail="Please confirm you are currently enrolled as a student at a UK university.",
        )

    existing = await db.users.find_one({"email": email_lower})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists. Try signing in instead.")

    password_hash = hashlib.sha256(data.password.encode()).hexdigest()
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    # "auto" → known student subdomain, no review needed.
    # "self_declared" → bare .ac.uk + checkbox ticked. Flagged for admin review.
    student_verification = "auto" if verdict.verdict == "auto_student" else "self_declared"
    user_doc = {
        "user_id": user_id,
        "email": email_lower,
        "name": data.name or email_lower.split("@")[0].replace(".", " ").title(),
        "password_hash": password_hash,
        "role": "student",
        "interests": [],
        "created_at": datetime.now(timezone.utc),
        "student_verification": student_verification,
        "student_attested_at": (
            datetime.now(timezone.utc) if verdict.verdict == "needs_attestation" else None
        ),
    }
    await db.users.insert_one(user_doc)
    user_doc.pop("password_hash", None)
    user_doc.pop("_id", None)

    session_token = secrets.token_urlsafe(32)
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
    })

    response.set_cookie(
        key="session_token", value=session_token,
        httponly=True, secure=True, samesite="none", path="/", max_age=7 * 24 * 60 * 60,
    )
    return {"user": user_doc, "session_token": session_token}


@router.post("/auth/email-login")
async def email_login(data: EmailLoginRequest, response: Response):
    """Email + password sign-in for existing accounts (non-Google users)."""
    email_lower = (data.email or "").lower().strip()
    user = await db.users.find_one({"email": email_lower}, {"_id": 0})
    if not user or not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    if hashlib.sha256(data.password.encode()).hexdigest() != user["password_hash"]:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user.pop("password_hash", None)
    user.pop("admin_password", None)

    session_token = secrets.token_urlsafe(32)
    await db.user_sessions.delete_many({"user_id": user["user_id"]})
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
    })

    response.set_cookie(
        key="session_token", value=session_token,
        httponly=True, secure=True, samesite="none", path="/", max_age=7 * 24 * 60 * 60,
    )
    return {"user": user, "session_token": session_token}


@router.post("/auth/admin-login")
async def admin_login(data: AdminLoginRequest):
    email_lower = (data.email or "").lower().strip()
    if not email_lower.endswith("@dequad.com"):
        raise HTTPException(
            status_code=403,
            detail="Admin sign-in is restricted to @dequad.com email addresses.",
        )

    user = await db.users.find_one({"email": email_lower}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    stored_password = user.get("admin_password")

    if data.admin_code == ADMIN_SECRET_CODE:
        password_hash = hashlib.sha256(data.password.encode()).hexdigest()
        await db.users.update_one(
            {"email": email_lower},
            {"$set": {"role": "admin", "admin_password": password_hash}}
        )
        user["role"] = "admin"
        stored_password = password_hash

    if not stored_password:
        raise HTTPException(status_code=401, detail="Admin password not set. Use admin code to set up.")

    password_hash = hashlib.sha256(data.password.encode()).hexdigest()
    if stored_password != password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="This account does not have admin privileges")

    session_token = f"admin_session_{uuid.uuid4().hex}"
    await db.sessions.insert_one({
        "session_token": session_token,
        "user_id": user["user_id"],
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "is_admin_session": True
    })

    return {
        "session_token": session_token,
        "is_admin": True,
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "role": "admin"
        }
    }


@router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    data = await request.json()
    session_id = data.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session_id")
            user_data = auth_response.json()
        except Exception as e:
            logger.error(f"Auth API error: {e}")
            raise HTTPException(status_code=500, detail="Authentication failed")

    session_data = SessionDataResponse(**user_data)

    # UK student-email policy. Google sign-in has no checkbox surface during
    # the popup, so bare `.ac.uk` accounts are accepted but flagged as
    # `pending_review`; the admin dashboard surfaces these for manual
    # verification. Staff and non-academic emails are hard-rejected — except
    # for accounts that are already admins (so the dequad.com team can keep
    # signing in via Google without triggering the student policy).
    email_lower = (session_data.email or "").lower().strip()
    existing_user = await db.users.find_one(
        {"email": email_lower}, {"role": 1, "student_verification": 1, "_id": 0}
    )
    is_existing_admin = bool(existing_user and existing_user.get("role") == "admin")

    if not is_existing_admin:
        verdict = classify_email(email_lower)
        if verdict.verdict in ("blocked", "not_uk_academic"):
            logger.info(f"rejecting google signin for {email_lower}: {verdict.reason}")
            raise HTTPException(status_code=403, detail=verdict.reason)
        student_verification = (
            "auto" if verdict.verdict == "auto_student" else "pending_review"
        )
    else:
        # Preserve whatever verification status the admin already has (or none).
        student_verification = existing_user.get("student_verification", "auto")

    # Atomic upsert by email — replaces the previous check-then-insert which had
    # a race condition that created duplicate users when the client retried the
    # session-exchange call (e.g. before the recent CORS fix landed). The
    # `$setOnInsert` block only runs when a brand-new doc is created.
    new_user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = await db.users.find_one_and_update(
        {"email": email_lower},
        {
            "$setOnInsert": {
                "user_id": new_user_id,
                "role": "student",
                "interests": [],
                "created_at": datetime.now(timezone.utc),
                "student_verification": student_verification,
            },
            "$set": {
                "email": email_lower,
                "name": session_data.name,
                "picture": session_data.picture,
            },
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
        projection={"_id": 0},
    )
    user_id = user_doc["user_id"]

    session_doc = {
        "user_id": user_id,
        "session_token": session_data.session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one(session_doc)

    response.set_cookie(
        key="session_token", value=session_data.session_token,
        httponly=True, secure=True, samesite="none", path="/", max_age=7*24*60*60
    )

    return {"user": user_doc, "session_token": session_data.session_token}


@router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = await get_session_token(request)
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
        await db.sessions.delete_many({"session_token": session_token})
    response.delete_cookie(key="session_token", path="/")
    response.delete_cookie(key="session_token", path="/", domain=None, secure=True, samesite="none")
    return {"message": "Logged out"}
