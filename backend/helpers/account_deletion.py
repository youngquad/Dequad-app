"""Account-deletion cascade shared by the authenticated deletion route."""

from __future__ import annotations


def _pair_id(user_a: str, user_b: str) -> str:
    return f"{min(user_a, user_b)}:{max(user_a, user_b)}"


async def delete_user_records(db, user_id: str, email: str) -> dict[str, int]:
    """Delete records owned by, addressed to, or otherwise linked to a user."""
    match_query = {
        "$or": [
            {"user_id": user_id},
            {"matched_user_id": user_id},
            {"target_user_id": user_id},
        ]
    }
    matches = await db.matches.find(
        match_query,
        {"_id": 0, "id": 1, "user_id": 1, "matched_user_id": 1},
    ).to_list(10000)
    match_ids = [match["id"] for match in matches if match.get("id")]
    pair_ids = list(
        {
            _pair_id(match["user_id"], match["matched_user_id"])
            for match in matches
            if match.get("user_id") and match.get("matched_user_id")
        }
    )

    message_links = [
        {"sender_id": user_id},
        {"recipient_id": user_id},  # legacy message schema
    ]
    read_links = [{"user_id": user_id}]
    if match_ids:
        message_links.append({"match_id": {"$in": match_ids}})
        read_links.append({"match_id": {"$in": match_ids}})  # legacy read schema
    if pair_ids:
        message_links.append({"pair_id": {"$in": pair_ids}})
        read_links.append({"pair_id": {"$in": pair_ids}})

    # Delete dependent records before the account itself. If a collection
    # operation fails, the user keeps a valid account/session and can retry.
    deleted = {
        "chat_messages": (
            await db.chat_messages.delete_many({"$or": message_links})
        ).deleted_count,
        "chat_reads": (
            await db.chat_reads.delete_many({"$or": read_links})
        ).deleted_count,
        # Keep match documents until both chat collections are clean so a
        # retry can still derive every legacy match_id/current pair_id.
        "matches": (await db.matches.delete_many(match_query)).deleted_count,
        "mood_entries": (
            await db.mood_entries.delete_many({"user_id": user_id})
        ).deleted_count,
        "feedback_entries": (
            await db.feedback_entries.delete_many({"user_id": user_id})
        ).deleted_count,
        "feedback_legacy": (
            await db.feedback.delete_many({"user_id": user_id})
        ).deleted_count,
        "risk_scores": (
            await db.risk_scores.delete_many({"user_id": user_id})
        ).deleted_count,
        "reports": (
            await db.reports.delete_many(
                {
                    "$or": [
                        {"reporter_id": user_id},
                        {"reported_user_id": user_id},
                        {"reported_id": user_id},
                    ]
                }
            )
        ).deleted_count,
        "support_messages": (
            await db.support_messages.delete_many({"user_id": user_id})
        ).deleted_count,
        "notifications": (
            await db.notifications.delete_many({"user_id": user_id})
        ).deleted_count,
        "email_verifications": (
            await db.email_verifications.delete_many({"email": email})
        ).deleted_count,
        "password_resets": (
            await db.password_resets.delete_many({"email": email})
        ).deleted_count,
        "safeguarding_alerts": (
            await db.safeguarding_alerts.delete_many({"user_id": user_id})
        ).deleted_count,
    }
    deleted["users"] = (await db.users.delete_many({"user_id": user_id})).deleted_count
    deleted["user_sessions"] = (
        await db.user_sessions.delete_many({"user_id": user_id})
    ).deleted_count
    deleted["sessions"] = (
        await db.sessions.delete_many({"user_id": user_id})
    ).deleted_count
    return deleted
