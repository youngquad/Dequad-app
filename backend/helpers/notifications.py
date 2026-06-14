import logging
import httpx
from database import db
from models import Notification

logger = logging.getLogger(__name__)


async def send_push_notification(
    user_id: str,
    title: str,
    body: str,
    notification_type: str,
    data: dict | None = None,
):
    # Avoid the Python "mutable default argument" foot-gun — a `{}` default is
    # created once at import time and re-used (and potentially mutated) by every
    # caller. Use None + explicit assignment instead.
    data = data if data is not None else {}

    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        return None
    if not user.get("notifications_enabled", True):
        return None

    # Always persist the in-app notification (bell icon / inbox).
    notification = Notification(
        user_id=user_id,
        title=title,
        body=body,
        notification_type=notification_type,
        data=data
    )
    await db.notifications.insert_one(notification.dict())

    # Send Expo push only if the user has a real device token.
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
