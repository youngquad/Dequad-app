from fastapi import APIRouter, Request, Response, Depends, HTTPException
from datetime import datetime, timezone, timedelta
from typing import Optional
from pymongo import ReturnDocument
from pydantic import BaseModel
import hashlib
import secrets
import uuid
import os
import asyncio
import httpx
import logging

from database import db
from models import (
    User, UserSession, SessionDataResponse,
    AdminLoginRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from helpers.auth import get_session_token, get_current_user
from helpers.passwords import hash_password, verify_and_maybe_rehash
from helpers.email import (
    is_smtp_configured, send_email_async, create_password_reset_email_html,
    send_welcome_email,
)
from helpers.uk_student_email import classify_email
from helpers.login_lockout import (
    clear_login_failures,
    ensure_login_allowed,
    record_login_failure,
)
from config import ADMIN_SECRET_CODE

logger = logging.getLogger(__name__)
router = APIRouter()

# Legacy/blocked accounts that must never authenticate again, without a
# destructive DB delete running automatically on every boot (SEC follow-up,
# 2026-08). Adedapo.Ajuwon is intentionally blocked from student login (2026-06).
BLOCKED_LEGACY_EMAILS = {
    "yusuff@dequad.com", "gerald@dequad.com", "dapo@dequad.com",
    "chinyere@dequad.com", "adedapo.ajuwon@dequad.com",
}


# ---- Email-verification (OTP) helpers -----------------------------------

OTP_TTL_MINUTES = 15
OTP_MAX_ATTEMPTS = 5
OTP_RESEND_COOLDOWN_SECONDS = 60


def _generate_otp() -> str:
    """6-digit numeric code, leading zeros preserved."""
    return f"{secrets.randbelow(1_000_000):06d}"


def _hash_otp(code: str) -> str:
    return hashlib.sha256(code.encode()).hexdigest()


def _build_otp_email(code: str) -> tuple[str, str]:
    html = f"""
<p>Hi,</p>
<p>Welcome to DEQUAD. Use the code below to verify your university email:</p>
<p style="text-align:center;font-size:36px;letter-spacing:10px;font-weight:800;color:#7B61FF;margin:24px 0;">
  {code}
</p>
<p>This code expires in {OTP_TTL_MINUTES} minutes.</p>
<p>If you didn't sign up to DEQUAD, you can safely ignore this email.</p>
<p>— DEQUAD</p>
""".strip()
    text = (
        f"Your DEQUAD verification code is: {code}\n\n"
        f"It expires in {OTP_TTL_MINUTES} minutes.\n\n"
        f"If you didn't sign up to DEQUAD, you can safely ignore this email.\n\n"
        f"— DEQUAD"
    )
    return html, text


async def _send_verification_otp(email: str, *, force: bool = False) -> dict:
    """Create + email a fresh 6-digit verification code.

    Returns dict with keys:
      - sent (bool): whether SMTP actually delivered
      - cooldown_seconds (int|None): seconds left if rate-limited
    """
    now = datetime.now(timezone.utc)
    existing = await db.email_verifications.find_one({"email": email})
    if existing and not force:
        last_sent = existing.get("last_sent_at")
        if isinstance(last_sent, datetime):
            if last_sent.tzinfo is None:
                last_sent = last_sent.replace(tzinfo=timezone.utc)
            elapsed = (now - last_sent).total_seconds()
            if elapsed < OTP_RESEND_COOLDOWN_SECONDS:
                return {"sent": False, "cooldown_seconds": int(OTP_RESEND_COOLDOWN_SECONDS - elapsed)}

    code = _generate_otp()
    record = {
        "email": email,
        "code_hash": _hash_otp(code),
        "expires_at": now + timedelta(minutes=OTP_TTL_MINUTES),
        "attempts": 0,
        "last_sent_at": now,
        "created_at": existing.get("created_at") if existing else now,
    }
    await db.email_verifications.update_one(
        {"email": email}, {"$set": record}, upsert=True
    )

    sent = False
    if is_smtp_configured():
        try:
            html, text = _build_otp_email(code)
            sent = await send_email_async(
                [email],
                subject="Your DEQUAD verification code",
                html_body=html,
                text_body=text,
            )
        except Exception as exc:
            logger.warning(f"Failed to send verification OTP to {email}: {exc}")
            sent = False
    else:
        logger.info("SMTP not configured — OTP generated but not emailed")

    # Dev-mode: surface the code in logs so testers can verify without an inbox.
    if os.environ.get("DEV_LOG_OTP", "").lower() in ("1", "true", "yes"):
        logger.warning(f"[DEV_LOG_OTP] {email} -> {code}")

    return {"sent": sent, "cooldown_seconds": None}


class VerifyEmailRequest(BaseModel):
    email: str
    code: str


class ResendVerificationRequest(BaseModel):
    email: str


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

    # Bcrypt hash for the new password (SEC-003).
    password_hash = hash_password(data.new_password)
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

    password_hash = hash_password(data.password)
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
        # Email-ownership verification (OTP). Account exists but cannot log in
        # until the user proves they actually own the .ac.uk inbox by entering
        # the 6-digit code we just emailed.
        "email_verified": False,
    }
    await db.users.insert_one(user_doc)
    user_doc.pop("password_hash", None)
    user_doc.pop("_id", None)

    # Fire-and-confirm the OTP email. `_send_verification_otp` is idempotent
    # and rate-limited; on first signup the cooldown is irrelevant.
    otp_result = await _send_verification_otp(email_lower, force=True)

    # Do NOT issue a session token yet — login is blocked until the email is
    # verified. The frontend should redirect to /verify-email after this call.
    return {
        "user": user_doc,
        "email_verification_required": True,
        "email_verification_sent": otp_result["sent"],
    }


@router.post("/auth/verify-email")
async def verify_email(data: VerifyEmailRequest, response: Response):
    """Consume the 6-digit OTP and activate the account."""
    email_lower = (data.email or "").lower().strip()
    code = (data.code or "").strip()
    if not code.isdigit() or len(code) != 6:
        raise HTTPException(status_code=400, detail="Enter the 6-digit code from your email.")

    record = await db.email_verifications.find_one({"email": email_lower})
    if not record:
        raise HTTPException(status_code=404, detail="No pending verification for this email. Sign up first or resend the code.")

    expires_at = record.get("expires_at")
    if isinstance(expires_at, datetime) and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="That code has expired. Tap 'Resend code' to get a new one.")

    attempts = int(record.get("attempts", 0))
    if attempts >= OTP_MAX_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Too many incorrect attempts. Tap 'Resend code' for a new one.")

    if _hash_otp(code) != record.get("code_hash"):
        await db.email_verifications.update_one(
            {"email": email_lower}, {"$inc": {"attempts": 1}}
        )
        remaining = OTP_MAX_ATTEMPTS - attempts - 1
        raise HTTPException(
            status_code=401,
            detail=f"Incorrect code. {remaining} attempt(s) remaining."
            if remaining > 0
            else "Incorrect code. Please request a new one.",
        )

    user = await db.users.find_one({"email": email_lower}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Account not found.")

    await db.users.update_one(
        {"email": email_lower},
        {"$set": {"email_verified": True, "email_verified_at": datetime.now(timezone.utc)}},
    )
    await db.email_verifications.delete_one({"email": email_lower})

    user["email_verified"] = True
    user.pop("password_hash", None)
    user.pop("admin_password", None)

    # Fire-and-forget branded welcome email — must not delay the login response.
    if is_smtp_configured():
        app_url = os.environ.get("APP_URL", "").rstrip("/")
        asyncio.create_task(send_welcome_email(email_lower, user.get("name", ""), app_url))

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
    return {"user": user, "session_token": session_token, "email_verified": True}


@router.post("/auth/resend-verification")
async def resend_verification(data: ResendVerificationRequest):
    """Send a fresh OTP to a pending account. Rate-limited to once per 60s."""
    email_lower = (data.email or "").lower().strip()
    user = await db.users.find_one({"email": email_lower}, {"_id": 0})
    # Uniform response regardless of existence — prevents account enumeration.
    if not user or user.get("email_verified"):
        return {"sent": True, "message": "If an unverified account exists for that email, a new code has been sent."}
    result = await _send_verification_otp(email_lower)
    if result.get("cooldown_seconds"):
        return {
            "sent": False,
            "cooldown_seconds": result["cooldown_seconds"],
            "message": f"Please wait {result['cooldown_seconds']}s before requesting another code.",
        }
    return {"sent": result["sent"], "message": "A new verification code has been sent."}


@router.post("/auth/email-login")
async def email_login(data: EmailLoginRequest, response: Response, request: Request):
    """Email + password sign-in for existing accounts (non-Google users)."""
    email_lower = (data.email or "").lower().strip()
    await ensure_login_allowed(db, "student", email_lower, request)
    if email_lower in BLOCKED_LEGACY_EMAILS:
        await record_login_failure(db, "student", email_lower, request)
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    user = await db.users.find_one({"email": email_lower}, {"_id": 0})
    if not user or not user.get("password_hash"):
        await record_login_failure(db, "student", email_lower, request)
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    ok, new_hash = verify_and_maybe_rehash(data.password, user["password_hash"])
    if not ok:
        await record_login_failure(db, "student", email_lower, request)
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    await clear_login_failures(db, "student", email_lower, request)
    if new_hash:
        # Legacy SHA-256 hash matched — persist the fresh bcrypt hash so the
        # next login uses the strong scheme. Fire-and-forget style; on DB
        # error we still allow the login through.
        try:
            await db.users.update_one(
                {"user_id": user["user_id"]},
                {"$set": {"password_hash": new_hash}},
            )
        except Exception as e:  # noqa: BLE001
            logger.warning(f"Lazy password rehash failed for {email_lower}: {e}")

    # Block login for accounts that haven't completed the OTP verification yet.
    # Pre-OTP-rollout accounts (no `email_verified` field at all) are grand-
    # fathered in by treating missing-field as True. Seeded staff/test profiles
    # are also marked verified in seed.py.
    email_verified = user.get("email_verified", True)
    if email_verified is False:
        # Auto-resend a fresh code (rate-limited) so the user isn't dead-ended.
        try:
            await _send_verification_otp(email_lower)
        except Exception as exc:  # noqa: BLE001
            logger.warning(f"Auto-resend OTP on login failed for {email_lower}: {exc}")
        raise HTTPException(
            status_code=403,
            detail="Please verify your university email before signing in. We've just sent a fresh 6-digit code to your inbox.",
        )

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
async def admin_login(data: AdminLoginRequest, response: Response, request: Request):
    email_lower = (data.email or "").lower().strip()
    await ensure_login_allowed(db, "admin", email_lower, request)
    if email_lower in BLOCKED_LEGACY_EMAILS:
        await record_login_failure(db, "admin", email_lower, request)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not email_lower.endswith("@dequad.com"):
        raise HTTPException(
            status_code=403,
            detail="Admin sign-in is restricted to @dequad.com email addresses.",
        )

    user = await db.users.find_one({"email": email_lower}, {"_id": 0})
    if not user:
        await record_login_failure(db, "admin", email_lower, request)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    stored_password = user.get("admin_password")

    # Never treat a missing configuration value as a valid recovery code.
    # Previously, ADMIN_SECRET_CODE="" plus admin_code="" could promote any
    # existing @dequad.com account to platform admin.
    if (
        ADMIN_SECRET_CODE
        and data.admin_code
        and secrets.compare_digest(data.admin_code, ADMIN_SECRET_CODE)
    ):
        password_hash = hash_password(data.password)
        await db.users.update_one(
            {"email": email_lower},
            {"$set": {"role": "admin", "admin_password": password_hash}}
        )
        user["role"] = "admin"
        stored_password = password_hash

    if not stored_password:
        await record_login_failure(db, "admin", email_lower, request)
        raise HTTPException(status_code=401, detail="Admin password not set. Use admin code to set up.")

    ok, new_hash = verify_and_maybe_rehash(data.password, stored_password)
    if not ok:
        await record_login_failure(db, "admin", email_lower, request)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await clear_login_failures(db, "admin", email_lower, request)
    if new_hash:
        try:
            await db.users.update_one(
                {"email": email_lower},
                {"$set": {"admin_password": new_hash}},
            )
        except Exception as e:  # noqa: BLE001
            logger.warning(f"Lazy admin password rehash failed for {email_lower}: {e}")

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

    response.set_cookie(
        key="session_token", value=session_token,
        httponly=True, secure=True, samesite="none", path="/",
        max_age=7 * 24 * 60 * 60,
    )

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


@router.delete("/auth/me")
async def delete_my_account(
    response: Response,
    current_user: User = Depends(get_current_user),
):
    """Permanently delete the calling user and all data linked to them.

    Required by Apple App Store guideline 5.1.1(v) — in-app account deletion.
    Cascades across every collection the user owns. This is irreversible.
    """
    uid = current_user.user_id
    email = (current_user.email or "").lower().strip()

    # Cancel any active Stripe subscription first so we don't keep billing them.
    user_doc = await db.users.find_one({"user_id": uid}, {"_id": 0}) or {}
    stripe_customer_id = user_doc.get("stripe_customer_id")
    if stripe_customer_id:
        try:
            import stripe as _stripe  # local import to avoid hard dep on this path
            from config import STRIPE_SECRET_KEY as _SK
            _stripe.api_key = _SK
            subs = _stripe.Subscription.list(customer=stripe_customer_id, status="active", limit=5)
            for s in subs.data:
                try:
                    _stripe.Subscription.cancel(s.id)
                except Exception as exc:
                    logger.warning(f"Failed to cancel Stripe sub {s.id} during delete: {exc}")
        except Exception as exc:
            logger.warning(f"Stripe cleanup skipped during delete for {email}: {exc}")

    # Cascade-delete every collection that references the user.
    deleted_counts = {
        "users": (await db.users.delete_many({"user_id": uid})).deleted_count,
        "user_sessions": (await db.user_sessions.delete_many({"user_id": uid})).deleted_count,
        "sessions": (await db.sessions.delete_many({"user_id": uid})).deleted_count,
        "matches": (await db.matches.delete_many(
            {"$or": [{"user_id": uid}, {"matched_user_id": uid}, {"target_user_id": uid}]}
        )).deleted_count,
        "chat_messages": (await db.chat_messages.delete_many(
            {"$or": [{"sender_id": uid}, {"recipient_id": uid}]}
        )).deleted_count,
        "mood_entries": (await db.mood_entries.delete_many({"user_id": uid})).deleted_count,
        "feedback": (await db.feedback.delete_many({"user_id": uid})).deleted_count,
        "reports": (await db.reports.delete_many(
            {"$or": [{"reporter_id": uid}, {"reported_id": uid}]}
        )).deleted_count,
        "support_messages": (await db.support_messages.delete_many({"user_id": uid})).deleted_count,
        "notifications": (await db.notifications.delete_many({"user_id": uid})).deleted_count,
        "email_verifications": (await db.email_verifications.delete_many({"email": email})).deleted_count,
        "safeguarding_alerts": (await db.safeguarding_alerts.delete_many({"user_id": uid})).deleted_count,
    }

    response.delete_cookie(key="session_token", path="/")
    response.delete_cookie(key="session_token", path="/", domain=None, secure=True, samesite="none")

    logger.info(f"Account permanently deleted: {email} ({uid}) — counts: {deleted_counts}")
    return {
        "success": True,
        "message": "Your account and all associated data have been permanently deleted.",
        "deleted": deleted_counts,
    }
