from fastapi import Request, Depends, HTTPException
from typing import Optional
from datetime import datetime, timezone
from database import db
from models import User
import logging

logger = logging.getLogger(__name__)


async def get_session_token(request: Request) -> Optional[str]:
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
        logger.info(f"Session token from header: {token[:20]}...")
        return token

    token_param = request.query_params.get("token")
    if token_param:
        logger.info(f"Session token from query param: {token_param[:20]}...")
        return token_param

    session_token = request.cookies.get("session_token")
    if session_token:
        logger.info(f"Session token from cookie: {session_token[:20]}...")
        return session_token

    logger.warning("No session token found in request")
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
