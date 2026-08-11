from fastapi import APIRouter, Depends, HTTPException
import re
from datetime import datetime, timezone
from pydantic import BaseModel

from database import db
from models import User
from helpers.auth import get_current_user

router = APIRouter()

EXPO_TOKEN_RE = re.compile(r"^Expo(nent)?PushToken\[.+\]$")


class PushTokenRequest(BaseModel):
    token: str
    platform: str = "android"


@router.post("/notifications/register-push-token")
async def register_push_token(data: PushTokenRequest, current_user: User = Depends(get_current_user)):
    if not EXPO_TOKEN_RE.match(data.token or ""):
        raise HTTPException(status_code=400, detail="Invalid Expo push token format.")
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$set": {
            "push_token": data.token,
            "push_token_platform": data.platform,
            "push_token_updated_at": datetime.now(timezone.utc),
        }},
    )
    return {"success": True}


@router.get("/notifications")
async def get_notifications(current_user: User = Depends(get_current_user)):
    notifications = await db.notifications.find(
        {"user_id": current_user.user_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    return notifications


@router.post("/notifications/read/{notification_id}")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.user_id},
        {"$set": {"read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True}


@router.post("/notifications/read-all")
async def mark_all_notifications_read(current_user: User = Depends(get_current_user)):
    await db.notifications.update_many(
        {"user_id": current_user.user_id, "read": False},
        {"$set": {"read": True}}
    )
    return {"success": True}


@router.get("/notifications/unread-count")
async def get_unread_count(current_user: User = Depends(get_current_user)):
    count = await db.notifications.count_documents(
        {"user_id": current_user.user_id, "read": False}
    )
    return {"count": count}
