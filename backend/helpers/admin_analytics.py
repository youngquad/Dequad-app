"""Query helpers for correctly scoped admin analytics."""

from __future__ import annotations

from datetime import datetime


async def get_ai_insight_records(db, university: str | None, since: datetime) -> dict:
    """Return student, mood, and alert data from one consistent scope."""
    student_query = {"role": "student"}
    mood_query = {"created_at": {"$gte": since}}
    alert_query = {"created_at": {"$gte": since}}

    if university:
        student_query["university"] = university
        student_ids = await db.users.distinct("user_id", student_query)
        total_students = len(student_ids)
        user_scope = {"$in": student_ids}
        mood_query["user_id"] = user_scope
        alert_query["user_id"] = user_scope
    else:
        total_students = await db.users.count_documents(student_query)

    moods = await db.mood_entries.find(
        mood_query,
        {"_id": 0, "mood": 1, "user_id": 1},
    ).to_list(10000)
    alerts = await db.safeguarding_alerts.find(
        alert_query,
        {"_id": 0, "risk_level": 1, "user_id": 1},
    ).to_list(10000)
    return {"total_students": total_students, "moods": moods, "alerts": alerts}
