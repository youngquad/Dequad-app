from fastapi import APIRouter, Request, Response, Depends, HTTPException
from datetime import datetime, timezone, timedelta
from typing import Optional
import hashlib
import secrets
import uuid
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
from config import ADMIN_SECRET_CODE

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    user = await db.users.find_one({"email": data.email.lower()}, {"_id": 0})
    if not user or user.get("role") != "admin":
        return {"message": "If an admin account exists with this email, a reset link has been sent."}

    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    await db.password_resets.delete_many({"email": data.email.lower()})
    await db.password_resets.insert_one({
        "email": data.email.lower(),
        "token": reset_token,
        "created_at": datetime.now(timezone.utc),
        "expires_at": expires_at,
        "used": False
    })

    reset_url = f"https://review-extractor-2.preview.emergentagent.com/admin/reset-password?token={reset_token}"

    if is_smtp_configured():
        subject = "DEQUAD Admin Password Reset"
        html_body = create_password_reset_email_html(user.get("name", "Admin"), reset_url)
        text_body = f"""
Hi {user.get("name", "Admin")},

We received a request to reset your admin password for DEQUAD.

Click here to reset your password:
{reset_url}

This link expires in 1 hour.

If you didn't request this reset, please ignore this email.

- DEQUAD Team
        """
        await send_email_async([data.email.lower()], subject, html_body, text_body)
        logger.info(f"Password reset email sent to {data.email.lower()}")
    else:
        logger.warning(f"SMTP not configured - password reset token: {reset_token}")

    return {"message": "If an admin account exists with this email, a reset link has been sent."}


@router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest):
    reset_record = await db.password_resets.find_one({
        "token": data.token, "used": False,
        "expires_at": {"$gt": datetime.now(timezone.utc)}
    })
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    password_hash = hashlib.sha256(data.new_password.encode()).hexdigest()
    result = await db.users.update_one(
        {"email": reset_record["email"]},
        {"$set": {"admin_password": password_hash}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update password")

    await db.password_resets.update_one({"token": data.token}, {"$set": {"used": True}})
    logger.info(f"Password reset successful for {reset_record['email']}")
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


@router.post("/auth/admin-login")
async def admin_login(data: AdminLoginRequest):
    user = await db.users.find_one({"email": data.email.lower()}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    stored_password = user.get("admin_password")

    if data.admin_code == ADMIN_SECRET_CODE:
        password_hash = hashlib.sha256(data.password.encode()).hexdigest()
        await db.users.update_one(
            {"email": data.email.lower()},
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
    existing_user = await db.users.find_one({"email": session_data.email}, {"_id": 0})

    if not existing_user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = {
            "user_id": user_id,
            "email": session_data.email,
            "name": session_data.name,
            "picture": session_data.picture,
            "role": "student",
            "interests": [],
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(new_user)
    else:
        user_id = existing_user["user_id"]

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

    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
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
