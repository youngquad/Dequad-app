"""Fast unit regressions for login lockout and shared-network rate limits."""

from __future__ import annotations

import asyncio

from fastapi import HTTPException
from starlette.requests import Request
from starlette.responses import JSONResponse

from helpers.login_lockout import (
    clear_login_failures,
    ensure_login_allowed,
    record_login_failure,
)
from helpers.middleware import RateLimitMiddleware


class FakeLoginAttempts:
    def __init__(self):
        self.records = {}

    async def find_one(self, query):
        record = self.records.get(query["_id"])
        return dict(record) if record else None

    async def delete_one(self, query):
        self.records.pop(query["_id"], None)

    async def update_one(self, query, update, upsert=False):
        record = self.records.setdefault(query["_id"], {"_id": query["_id"]})
        for key, value in update.get("$setOnInsert", {}).items():
            record.setdefault(key, value)
        for key, value in update.get("$inc", {}).items():
            record[key] = record.get(key, 0) + value
        record.update(update.get("$set", {}))


class FakeDb:
    def __init__(self):
        self.login_attempts = FakeLoginAttempts()


def _request(path="/api/auth/email-login", ip="203.0.113.10"):
    return Request({
        "type": "http",
        "method": "POST",
        "path": path,
        "headers": [],
        "client": (ip, 12345),
        "scheme": "https",
        "server": ("testserver", 443),
        "query_string": b"",
    })


def test_sixth_failed_login_is_locked_but_other_account_is_not():
    async def scenario():
        db = FakeDb()
        request = _request()

        for _ in range(5):
            await ensure_login_allowed(db, "student", "one@example.com", request)
            await record_login_failure(db, "student", "one@example.com", request)

        try:
            await ensure_login_allowed(db, "student", "one@example.com", request)
        except HTTPException as exc:
            assert exc.status_code == 429
            assert int(exc.headers["Retry-After"]) > 0
        else:
            raise AssertionError("sixth attempt should have been locked")

        # A different account on the same campus/NAT IP remains available.
        await ensure_login_allowed(db, "student", "two@example.com", request)

    asyncio.run(scenario())


def test_successful_login_clears_prior_failures():
    async def scenario():
        db = FakeDb()
        request = _request()
        for _ in range(4):
            await record_login_failure(db, "student", "one@example.com", request)
        await clear_login_failures(db, "student", "one@example.com", request)
        await ensure_login_allowed(db, "student", "one@example.com", request)
        assert db.login_attempts.records == {}

    asyncio.run(scenario())


def test_auth_rate_limit_buckets_are_isolated_by_endpoint():
    async def scenario():
        limiter = RateLimitMiddleware(lambda scope, receive, send: None)
        limiter.AUTH_LIMIT = 1

        async def ok(_request):
            return JSONResponse({"ok": True})

        register = await limiter.dispatch(_request("/api/auth/register"), ok)
        login = await limiter.dispatch(_request("/api/auth/email-login"), ok)
        second_login = await limiter.dispatch(_request("/api/auth/email-login"), ok)

        assert register.status_code == 200
        assert login.status_code == 200
        assert second_login.status_code == 429

    asyncio.run(scenario())
