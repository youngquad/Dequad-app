"""One-time migration: deduplicate user records that share an email and add a unique
index on `users.email` so the bug can never recur.

Root cause: `POST /api/auth/session` previously did a check-then-insert which raced when
the client retried the call (which happened in production due to the now-fixed CORS bug).
Multiple concurrent calls for the same email each saw "user not found" and each created
a fresh row.

This migration:
  1. Finds every (email, count > 1) group in the `users` collection.
  2. For each group, KEEPS the oldest record (lowest `created_at`, falling back to the
     first by Mongo _id) and treats every other record as a "stale" duplicate.
  3. Re-links every related collection (sessions, matches, chats, etc.) from each stale
     user_id → the kept user_id. Idempotent set-based updates.
  4. Deletes the stale user docs.
  5. Creates a unique index on `email` (case-sensitive — emails are already lowercased
     elsewhere at write time).

Idempotent. Safe to run on every boot.
"""
from __future__ import annotations
import logging
from typing import Iterable
from pymongo.errors import DuplicateKeyError, OperationFailure

logger = logging.getLogger(__name__)

# Collections + the field(s) on each that reference a user_id we may need to relink.
# Keys are collection names, values are list of fields that store user_ids.
USER_ID_REFERENCES: dict[str, list[str]] = {
    "user_sessions": ["user_id"],
    "sessions": ["user_id"],
    "matches": ["user_id", "matched_user_id", "swiped_user_id", "swiper_id", "target_user_id"],
    "chat_messages": ["sender_id", "receiver_id", "user_id"],
    "mood_entries": ["user_id"],
    "feedback": ["user_id"],
    "safeguarding_alerts": ["user_id"],
    "reports": ["reporter_id", "reported_user_id"],
    "support_messages": ["user_id"],
    "support_conversations": ["user_id"],
    "push_tokens": ["user_id"],
    "subscriptions": ["user_id"],
    "swipes": ["user_id", "target_user_id"],
    "likes": ["user_id", "target_user_id"],
}


async def _relink_user_ids(db, old_id: str, new_id: str) -> int:
    """Replace old_id → new_id on every known reference field. Returns total docs touched."""
    total = 0
    for coll_name, fields in USER_ID_REFERENCES.items():
        coll = db[coll_name]
        for field in fields:
            try:
                res = await coll.update_many({field: old_id}, {"$set": {field: new_id}})
                total += res.modified_count
            except OperationFailure:
                # Collection may not exist yet — that's fine
                continue
    return total


async def _email_duplicate_groups(db) -> list[dict]:
    pipeline = [
        {"$match": {"email": {"$type": "string"}}},
        {
            "$group": {
                "_id": "$email",
                "count": {"$sum": 1},
                "docs": {
                    "$push": {
                        "_id": "$_id",
                        "user_id": "$user_id",
                        "created_at": "$created_at",
                        "role": "$role",
                    }
                },
            }
        },
        {"$match": {"count": {"$gt": 1}}},
    ]
    return await db.users.aggregate(pipeline).to_list(1000)


def _pick_kept(docs: Iterable[dict]) -> dict:
    """Keep the doc with the oldest `created_at` (most likely the one with real data).
    Tie-breaker: lowest Mongo _id."""
    def key(d: dict):
        return (d.get("created_at") or "9999", str(d.get("_id")))
    return min(docs, key=key)


async def ensure_email_unique_index(db) -> None:
    """Just the safe, non-destructive part: ensure the unique index on
    `users.email` exists. Called automatically on every boot. Does NOT touch
    any existing documents."""
    try:
        await db.users.create_index("email", unique=True, name="email_unique")
        logger.info("Ensured unique index users.email")
    except DuplicateKeyError as e:
        logger.error(
            f"Unique index creation failed — duplicates still present: {e}. "
            f"Run `python3 -m scripts.migrate_dedupe_users` manually to merge them first."
        )
    except OperationFailure as e:
        # 85 = IndexOptionsConflict (index already exists with different options)
        if getattr(e, "code", None) == 85:
            logger.info("users.email index already exists with different options — leaving as-is")
        else:
            raise


async def dedupe_users_and_index_email(db) -> dict:
    """Run the dedupe + add unique email index. DESTRUCTIVE (hard-deletes stale
    duplicate rows) — intentionally NOT wired into server.py's automatic
    startup path. Run manually via `python3 -m scripts.migrate_dedupe_users`
    only when duplicate-email rows are known to exist."""
    stats = {"duplicate_emails": 0, "users_merged": 0, "refs_relinked": 0, "users_deleted": 0}

    groups = await _email_duplicate_groups(db)
    stats["duplicate_emails"] = len(groups)

    for group in groups:
        docs = group["docs"]
        kept = _pick_kept(docs)
        kept_user_id = kept.get("user_id")
        if not kept_user_id:
            logger.warning(f"Skipping email '{group['_id']}' — kept doc has no user_id")
            continue

        stale = [d for d in docs if d.get("user_id") and d.get("user_id") != kept_user_id]
        for s in stale:
            relinked = await _relink_user_ids(db, s["user_id"], kept_user_id)
            stats["refs_relinked"] += relinked

        # Delete every stale row by _id (not by user_id, in case user_id is the same/missing)
        stale_object_ids = [d["_id"] for d in docs if d["_id"] != kept["_id"]]
        if stale_object_ids:
            res = await db.users.delete_many({"_id": {"$in": stale_object_ids}})
            stats["users_deleted"] += res.deleted_count
            stats["users_merged"] += 1
            logger.info(
                f"Merged email='{group['_id']}': kept user_id={kept_user_id}, "
                f"deleted {res.deleted_count} dup(s), relinked refs"
            )

    await ensure_email_unique_index(db)
    logger.info(f"User dedupe migration: {stats}")
    return stats


if __name__ == "__main__":
    import asyncio
    from database import db as _db

    asyncio.run(dedupe_users_and_index_email(_db))
