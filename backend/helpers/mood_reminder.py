import asyncio
import logging
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from database import db
from helpers.notifications import send_push_notification

logger = logging.getLogger(__name__)

CHECK_INTERVAL_SECONDS = 600  # 10 minutes
REMINDER_HOUR_UK = 18  # 6 PM Europe/London
UK_TZ = ZoneInfo("Europe/London")

REMINDER_MESSAGES = [
    ("How are you feeling today?", "Take 10 seconds to check in with your mood on DEQUAD."),
    ("Your daily mood check-in", "A quick check-in keeps your streak alive. How's today going?"),
    ("Quick mood check", "Rate your day in seconds — your future self will thank you."),
]


async def process_mood_reminders(force: bool = False) -> int:
    """Send the daily mood check-in reminder during the 6 PM UK hour.

    `force=True` skips the time-window check (used by tests).
    """
    now_uk = datetime.now(UK_TZ)
    if not force and now_uk.hour != REMINDER_HOUR_UK:
        return 0

    today = now_uk.strftime("%Y-%m-%d")
    start_of_day_utc = now_uk.replace(hour=0, minute=0, second=0, microsecond=0).astimezone(timezone.utc)
    title, body = REMINDER_MESSAGES[now_uk.toordinal() % len(REMINDER_MESSAGES)]

    sent = 0
    while True:
        # Atomic claim per user per day — restarts never double-send.
        user = await db.users.find_one_and_update(
            {
                "role": "student",
                "email_verified": {"$ne": False},
                "hidden_from_discovery": {"$ne": True},
                "push_token": {"$regex": "^Expo"},
                "mood_reminder_last_sent": {"$ne": today},
            },
            {"$set": {"mood_reminder_last_sent": today}},
        )
        if not user:
            break
        # Skip anyone who already logged their mood today.
        logged = await db.mood_entries.find_one({
            "user_id": user["user_id"],
            "created_at": {"$gte": start_of_day_utc.replace(tzinfo=None)},
        })
        if logged:
            continue
        await send_push_notification(
            user_id=user["user_id"],
            title=title,
            body=body,
            notification_type="mood_reminder",
            data={"route": "/(main)/mood"},
        )
        sent += 1
    return sent


async def mood_reminder_worker():
    while True:
        try:
            sent = await process_mood_reminders()
            if sent:
                logger.info(f"mood reminder: sent {sent} notification(s)")
        except asyncio.CancelledError:
            raise
        except Exception as e:
            logger.error(f"mood reminder worker error: {e}")
        await asyncio.sleep(CHECK_INTERVAL_SECONDS)
