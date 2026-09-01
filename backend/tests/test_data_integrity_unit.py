"""Fast regressions for deletion coverage and scoped admin analytics."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from helpers.account_deletion import delete_user_records
from helpers.admin_analytics import get_ai_insight_records


class DeleteResult:
    deleted_count = 1


class Cursor:
    def __init__(self, rows):
        self.rows = rows

    async def to_list(self, _limit):
        return list(self.rows)


class Collection:
    def __init__(self, rows=()):
        self.rows = list(rows)
        self.deleted_queries = []
        self.find_queries = []
        self.count = 0
        self.distinct_values = []

    def find(self, query, projection):
        self.find_queries.append((query, projection))
        return Cursor(self.rows)

    async def delete_many(self, query):
        self.deleted_queries.append(query)
        return DeleteResult()

    async def count_documents(self, _query):
        return self.count

    async def distinct(self, _field, _query):
        return list(self.distinct_values)


class FakeDb:
    def __init__(self):
        names = {
            "users",
            "user_sessions",
            "sessions",
            "matches",
            "chat_messages",
            "chat_reads",
            "mood_entries",
            "feedback_entries",
            "feedback",
            "risk_scores",
            "reports",
            "support_messages",
            "notifications",
            "email_verifications",
            "password_resets",
            "safeguarding_alerts",
        }
        for name in names:
            setattr(self, name, Collection())


def test_account_deletion_covers_current_and_legacy_user_data():
    async def scenario():
        db = FakeDb()
        db.matches.rows = [
            {
                "id": "match-1",
                "user_id": "other-user",
                "matched_user_id": "user-1",
            }
        ]

        deleted = await delete_user_records(db, "user-1", "student@example.ac.uk")

        assert {
            "feedback_entries",
            "risk_scores",
            "chat_reads",
            "password_resets",
        }.issubset(deleted)
        assert db.feedback_entries.deleted_queries == [{"user_id": "user-1"}]
        assert db.risk_scores.deleted_queries == [{"user_id": "user-1"}]
        assert db.password_resets.deleted_queries == [
            {"email": "student@example.ac.uk"}
        ]

        message_links = db.chat_messages.deleted_queries[0]["$or"]
        assert {"match_id": {"$in": ["match-1"]}} in message_links
        assert {"pair_id": {"$in": ["other-user:user-1"]}} in message_links

        report_links = db.reports.deleted_queries[0]["$or"]
        assert {"reported_user_id": "user-1"} in report_links

    asyncio.run(scenario())


def test_university_ai_insights_scope_moods_and_alerts_to_student_ids():
    async def scenario():
        db = FakeDb()
        db.users.distinct_values = ["u-1", "u-2"]
        since = datetime(2026, 8, 1, tzinfo=timezone.utc)

        result = await get_ai_insight_records(db, "University of Manchester", since)

        assert result["total_students"] == 2
        expected_scope = {"$in": ["u-1", "u-2"]}
        assert db.mood_entries.find_queries[0][0]["user_id"] == expected_scope
        assert db.safeguarding_alerts.find_queries[0][0]["user_id"] == expected_scope

    asyncio.run(scenario())


def test_platform_ai_insights_keep_platform_wide_scope():
    async def scenario():
        db = FakeDb()
        db.users.count = 17
        since = datetime(2026, 8, 1, tzinfo=timezone.utc)

        result = await get_ai_insight_records(db, None, since)

        assert result["total_students"] == 17
        assert "user_id" not in db.mood_entries.find_queries[0][0]
        assert "user_id" not in db.safeguarding_alerts.find_queries[0][0]

    asyncio.run(scenario())
