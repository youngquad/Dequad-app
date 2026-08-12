import asyncio
import logging
from datetime import datetime, timedelta, timezone

from database import db
from helpers.notifications import send_push_notification

logger = logging.getLogger(__name__)

CHECK_INTERVAL_SECONDS = 600  # 10 minutes
NUDGE_AFTER_HOURS = 24
NUDGE_WINDOW_MAX_HOURS = 72  # don't nudge accounts older than this (avoids blasting legacy users)


async def _pick_suggestion(user: dict) -> dict | None:
    """Pick one candidate profile the user hasn't swiped on — same university first."""
    swipes = await db.matches.find(
        {"user_id": user["user_id"]}, {"matched_user_id": 1}
    ).to_list(1000)
    excluded = [s["matched_user_id"] for s in swipes] + [user["user_id"]]
    base = {
        "user_id": {"$nin": excluded},
        "role": "student",
        "hidden_from_discovery": {"$ne": True},
        "email_verified": {"$ne": False},
    }
    if user.get("university"):
        candidate = await db.users.find_one(
            {**base, "university": user["university"]}, {"_id": 0, "name": 1, "university": 1, "user_id": 1}
        )
        if candidate:
            return candidate
    return await db.users.find_one(base, {"_id": 0, "name": 1, "university": 1, "user_id": 1})


async def process_first_match_nudges() -> int:
    """Claim + nudge all eligible users. Returns number of nudges sent."""
    now = datetime.now(timezone.utc)
    sent = 0
    while True:
        # Atomic claim so restarts / overlapping runs never double-send.
        user = await db.users.find_one_and_update(
            {
                "role": "student",
                "email_verified": {"$ne": False},
                "hidden_from_discovery": {"$ne": True},
                "first_match_nudge_sent": {"$ne": True},
                "created_at": {
                    "$lte": now - timedelta(hours=NUDGE_AFTER_HOURS),
                    "$gte": now - timedelta(hours=NUDGE_WINDOW_MAX_HOURS),
                },
            },
            {"$set": {"first_match_nudge_sent": True, "first_match_nudge_at": now}},
        )
        if not user:
            break
        suggestion = await _pick_suggestion(user)
        if not suggestion:
            continue
        first_name = (user.get("name") or "there").split(" ")[0]
        match_name = (suggestion.get("name") or "Someone").split(" ")[0]
        uni = suggestion.get("university") or "a UK university"
        await send_push_notification(
            user_id=user["user_id"],
            title=f"👋 {first_name}, someone's waiting to meet you",
            body=f"{match_name} from {uni} could be your first match. Come say hi!",
            notification_type="first_match_nudge",
            data={"route": "/(main)/matches"},
        )
        sent += 1
    return sent


async def first_match_nudge_worker():
    while True:
        try:
            sent = await process_first_match_nudges()
            if sent:
                logger.info(f"first-match nudge: sent {sent} notification(s)")
        except asyncio.CancelledError:
            raise
        except Exception as e:
            logger.error(f"first-match nudge worker error: {e}")
        await asyncio.sleep(CHECK_INTERVAL_SECONDS)
