"""Manual one-off cleanup: hard-delete leftover rows for legacy/blocked staff
accounts. NOT run automatically on boot — these emails are already blocked at
login time via BLOCKED_LEGACY_EMAILS in routes/auth.py, so this script is only
needed to tidy up existing rows. Run with:

    python3 -m scripts.purge_blocked_legacy_accounts
"""
import asyncio
import logging

from database import db
from routes.auth import BLOCKED_LEGACY_EMAILS

logger = logging.getLogger(__name__)


async def purge_blocked_legacy_accounts() -> int:
    result = await db.users.delete_many({"email": {"$in": list(BLOCKED_LEGACY_EMAILS)}})
    logger.info(f"Removed {result.deleted_count} legacy/blocked staff account(s)")
    return result.deleted_count


if __name__ == "__main__":
    asyncio.run(purge_blocked_legacy_accounts())
