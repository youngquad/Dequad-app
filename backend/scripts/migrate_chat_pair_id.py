"""
One-off migration: backfill `pair_id` on every legacy `chat_messages` doc and
create a supporting index.

`pair_id` is the deterministic conversation key `f"{min(uid_a, uid_b)}:{max(uid_a, uid_b)}"`
which lets the chat read path do a single indexed equality lookup instead of
a $in over both sibling match.id values (the original symmetric-fix workaround).

Idempotent: skips docs that already have pair_id, and uses `create_index` which is
a no-op if the index already exists. Safe to run on every backend boot.

Usage (one-off CLI):
    python -m scripts.migrate_chat_pair_id

Usage (programmatic, e.g. from server startup):
    from scripts.migrate_chat_pair_id import migrate_chat_pair_id
    await migrate_chat_pair_id()
"""
import asyncio
import logging
import os
import sys

from motor.motor_asyncio import AsyncIOMotorClient

# Make the script runnable both as `python -m scripts.migrate_chat_pair_id`
# AND directly with `python scripts/migrate_chat_pair_id.py`.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logger = logging.getLogger(__name__)


def _pair_id_for(user_a: str, user_b: str) -> str:
    return f"{min(user_a, user_b)}:{max(user_a, user_b)}"


async def migrate_chat_pair_id(db=None) -> dict:
    """Backfill pair_id on legacy chat messages and ensure the pair_id index exists.
    Returns a dict with `scanned`, `updated`, `unresolved` counts for logging."""
    if db is None:
        # Lazy import so the script can be invoked outside the app context too.
        from database import db as default_db  # type: ignore
        db = default_db

    # Ensure index first (cheap, idempotent).
    await db.chat_messages.create_index("pair_id")
    await db.chat_messages.create_index([("pair_id", 1), ("created_at", 1)])

    # Map every match.id -> (user_id, matched_user_id) so we can derive the pair.
    match_owner: dict[str, tuple[str, str]] = {}
    async for m in db.matches.find({}, {"_id": 0, "id": 1, "user_id": 1, "matched_user_id": 1}):
        match_owner[m["id"]] = (m["user_id"], m["matched_user_id"])

    scanned = updated = unresolved = 0
    # Only touch legacy docs that don't yet have pair_id.
    async for msg in db.chat_messages.find({"pair_id": {"$exists": False}}, {"_id": 1, "match_id": 1}):
        scanned += 1
        owners = match_owner.get(msg.get("match_id"))
        if not owners:
            unresolved += 1
            continue
        pair_id = _pair_id_for(*owners)
        await db.chat_messages.update_one({"_id": msg["_id"]}, {"$set": {"pair_id": pair_id}})
        updated += 1

    result = {"scanned": scanned, "updated": updated, "unresolved": unresolved}
    logger.info(f"chat_messages pair_id migration: {result}")
    return result


async def _main():
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
    mongo_url = os.environ["MONGO_URL"]
    db_name = os.environ["DB_NAME"]
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    result = await migrate_chat_pair_id(db)
    print(result)


if __name__ == "__main__":
    asyncio.run(_main())
