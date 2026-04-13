import logging
import httpx
from database import db
from models import Notification

logger = logging.getLogger(__name__)


async def send_push_notification(user_id: str, title: str, body: str, notification_type: str, data: dict = {}):
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user or not user.get("push_token") or not user.get("notifications_enabled", True):
        return None

    notification = Notification(
        user_id=user_id,
        title=title,
        body=body,
        notification_type=notification_type,
        data=data
    )
    await db.notifications.insert_one(notification.dict())

    push_token = user.get("push_token")
    if push_token and push_token.startswith("ExponentPushToken"):
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    "https://exp.host/--/api/v2/push/send",
                    json={
                        "to": push_token,
                        "title": title,
                        "body": body,
                        "data": data,
                        "sound": "default"
                    }
                )
        except Exception as e:
            logger.error(f"Push notification error: {e}")

    return notification
