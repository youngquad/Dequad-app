"""Regression: in-app account deletion (Apple Guideline 5.1.1(v))."""
from __future__ import annotations

import os
import re
import subprocess
import time
import uuid

import pytest
import requests


API_URL = (
    os.environ.get("E2E_API_URL")
    or os.environ.get("REACT_APP_BACKEND_URL")
    or "http://localhost:8001"
).rstrip("/")


def _fresh_email() -> str:
    return f"del.{uuid.uuid4().hex[:8]}@student.leeds.ac.uk"


def _otp_from_logs(email: str) -> str:
    for _ in range(10):
        time.sleep(0.4)
        out = subprocess.check_output(
            ["tail", "-n", "200", "/var/log/supervisor/backend.err.log"], text=True
        )
        for line in reversed(out.splitlines()):
            if "DEV_LOG_OTP" in line and email in line:
                m = re.search(r"-> (\d{6})", line)
                if m:
                    return m.group(1)
    raise AssertionError(f"OTP not found in logs for {email}")


@pytest.fixture
def verified_user():
    email = _fresh_email()
    requests.post(
        f"{API_URL}/api/auth/register",
        json={"email": email, "password": "TestPass123!", "name": "Delete Test"},
        timeout=15,
    )
    otp = _otp_from_logs(email)
    r = requests.post(
        f"{API_URL}/api/auth/verify-email",
        json={"email": email, "code": otp},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    yield email, r.json()["session_token"]
    # Best-effort cleanup
    subprocess.run(
        ["python", "-c", (
            "import asyncio\n"
            "from database import db\n"
            "async def m():\n"
            f"    await db.users.delete_many({{'email': '{email}'}})\n"
            "asyncio.run(m())\n"
        )],
        cwd="/app/backend",
        check=False,
        timeout=10,
    )


def test_delete_account_returns_success_with_cascade_counts(verified_user):
    email, token = verified_user
    resp = requests.delete(
        f"{API_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["success"] is True
    assert "permanently deleted" in body["message"].lower()
    assert "deleted" in body
    assert body["deleted"]["users"] == 1


def test_login_fails_after_delete(verified_user):
    email, token = verified_user
    requests.delete(
        f"{API_URL}/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    resp = requests.post(
        f"{API_URL}/api/auth/email-login",
        json={"email": email, "password": "TestPass123!"},
        timeout=15,
    )
    assert resp.status_code == 401


def test_delete_requires_auth():
    """Calling DELETE /auth/me without a token must return 401."""
    resp = requests.delete(f"{API_URL}/api/auth/me", timeout=15)
    assert resp.status_code == 401
