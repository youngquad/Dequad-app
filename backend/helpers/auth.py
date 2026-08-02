from fastapi import Request, Depends, HTTPException
from typing import Optional
from datetime import datetime, timezone
from database import db
from models import User
import logging

logger = logging.getLogger(__name__)


async def get_session_token(request: Request) -> Optional[str]:
    """Return the caller's session token or ``None``.

    Accepted sources:
      1. ``Authorization: Bearer <token>`` header (primary path used by the
         React/Expo frontend).
      2. ``session_token`` httpOnly cookie (issued alongside the header on
         login for browsers that prefer cookie auth).
      3. ``?token=<session_token>`` query string — ACCEPTED ONLY FOR CSV
         EXPORT / FILE-DOWNLOAD ENDPOINTS where the browser cannot inject a
         custom header on ``<a href>`` / ``Linking.openURL`` downloads
         (SEC-004 hardening, 2026-07). All other endpoints ignore the
         query param, so a session token leaked via referrer or URL logs
         can only be used against these download routes.
    """
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header[7:]

    # Whitelist of paths that legitimately need query-string auth for
    # browser-initiated downloads. Keep this list tight.
    path = request.url.path
    if path.startswith("/api/admin/") and (path.endswith("/export") or "/export/" in path or path.endswith(".csv")):
        tok = request.query_params.get("token")
        if tok:
            return tok
    if path.startswith("/api/university-admin/") and path.endswith("/export"):
        tok = request.query_params.get("token")
        if tok:
            return tok

    session_token = request.cookies.get("session_token")
    if session_token:
        return session_token

    return None


async def get_current_user(request: Request) -> User:
    session_token = await get_session_token(request)
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})

    if not session:
        session = await db.sessions.find_one({"session_token": session_token}, {"_id": 0})

    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")

    return User(**user_doc)


async def get_optional_user(request: Request) -> Optional[User]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


async def require_university_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ["admin", "university_admin"]:
        raise HTTPException(status_code=403, detail="University admin access required")
    return current_user


async def get_university_admin_university(current_user: User = Depends(get_current_user)) -> str:
    if current_user.role == "admin":
        return None
    if current_user.role == "university_admin":
        return current_user.university_admin_for
    raise HTTPException(status_code=403, detail="Admin access required")
