"""Shared, account-aware login lockout helpers.

The HTTP rate limiter is deliberately broad protection against traffic floods.
Authentication failures need a separate counter so five bad passwords for one
account do not lock every user behind the same university/NAT IP out of the
application.
"""

from __future__ import annotations

import hashlib
import os
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request


LOGIN_FAILURE_LIMIT = int(os.environ.get("LOGIN_FAILURE_LIMIT", "5"))
LOGIN_LOCKOUT_SECONDS = int(os.environ.get("LOGIN_LOCKOUT_SECONDS", "900"))


def _client_ip(request: Request) -> str:
    forwarded = (
        request.headers.get("cf-connecting-ip")
        or request.headers.get("x-real-ip")
        or request.headers.get("x-forwarded-for")
    )
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    return request.client.host if request.client else "unknown"


def _attempt_id(scope: str, email: str, request: Request) -> str:
    # Hash the identifier so the operational collection does not become a
    # second plaintext email directory if it is ever exported for debugging.
    identifier = f"{scope}:{email.casefold().strip()}:{_client_ip(request)}"
    return hashlib.sha256(identifier.encode("utf-8")).hexdigest()


def _as_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


async def ensure_login_attempt_index(db) -> None:
    """Expire stale counters automatically; safe to call on every startup."""
    await db.login_attempts.create_index("expires_at", expireAfterSeconds=0)


async def ensure_login_allowed(db, scope: str, email: str, request: Request) -> None:
    attempt_id = _attempt_id(scope, email, request)
    record = await db.login_attempts.find_one({"_id": attempt_id})
    if not record:
        return

    now = datetime.now(timezone.utc)
    expires_at = _as_utc(record.get("expires_at"))
    if not expires_at or expires_at <= now:
        await db.login_attempts.delete_one({"_id": attempt_id})
        return

    if int(record.get("failures", 0)) >= LOGIN_FAILURE_LIMIT:
        retry_after = max(1, int((expires_at - now).total_seconds()))
        raise HTTPException(
            status_code=429,
            detail="Too many failed sign-in attempts. Please try again later.",
            headers={"Retry-After": str(retry_after)},
        )


async def record_login_failure(db, scope: str, email: str, request: Request) -> None:
    now = datetime.now(timezone.utc)
    attempt_id = _attempt_id(scope, email, request)
    await db.login_attempts.update_one(
        {"_id": attempt_id},
        {
            "$inc": {"failures": 1},
            "$set": {
                "last_failed_at": now,
                "expires_at": now + timedelta(seconds=LOGIN_LOCKOUT_SECONDS),
            },
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )


async def clear_login_failures(db, scope: str, email: str, request: Request) -> None:
    await db.login_attempts.delete_one({"_id": _attempt_id(scope, email, request)})
