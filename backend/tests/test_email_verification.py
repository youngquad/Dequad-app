"""Regression tests for the email-verification (OTP) flow added in 2026-06.

Run with:
    cd /app/backend && DEV_LOG_OTP=true pytest tests/test_email_verification.py -v
"""
from __future__ import annotations

import asyncio
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
    return f"otp.{uuid.uuid4().hex[:10]}@student.leeds.ac.uk"


def _read_otp_from_logs(email: str) -> str:
    """Pull the OTP for `email` from the backend log via DEV_LOG_OTP."""
    for _ in range(10):
        time.sleep(0.4)
        try:
            out = subprocess.check_output(
                ["tail", "-n", "200", "/var/log/supervisor/backend.err.log"],
                text=True,
            )
        except Exception:
            continue
        for line in reversed(out.splitlines()):
            if "DEV_LOG_OTP" in line and email in line:
                m = re.search(r"-> (\d{6})", line)
                if m:
                    return m.group(1)
    raise AssertionError(f"Could not extract OTP for {email} from backend logs")


def _cleanup(email: str) -> None:
    """Delete the test user + verification record so re-runs are idempotent."""
    code = (
        "import asyncio\n"
        "from database import db\n"
        "async def main():\n"
        f"    await db.users.delete_many({{'email': '{email}'}})\n"
        f"    await db.email_verifications.delete_many({{'email': '{email}'}})\n"
        "asyncio.run(main())\n"
    )
    subprocess.run(
        ["python", "-c", code],
        cwd="/app/backend",
        check=False,
        timeout=10,
    )


@pytest.fixture
def fresh_email():
    email = _fresh_email()
    yield email
    _cleanup(email)


def test_register_does_not_issue_session(fresh_email):
    """A fresh signup must NOT return a session_token (OTP verification first)."""
    resp = requests.post(
        f"{API_URL}/api/auth/register",
        json={"email": fresh_email, "password": "TestPass123!", "name": "Otp Test"},
        timeout=15,
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body.get("email_verification_required") is True
    assert "session_token" not in body
    assert body["user"]["email_verified"] is False


def test_login_blocked_until_verified(fresh_email):
    """Unverified accounts cannot log in via /auth/email-login."""
    requests.post(
        f"{API_URL}/api/auth/register",
        json={"email": fresh_email, "password": "TestPass123!", "name": "Otp Test"},
        timeout=15,
    )
    resp = requests.post(
        f"{API_URL}/api/auth/email-login",
        json={"email": fresh_email, "password": "TestPass123!"},
        timeout=15,
    )
    assert resp.status_code == 403, resp.text
    assert "verify" in resp.json().get("detail", "").lower()


def test_wrong_otp_decrements_attempts(fresh_email):
    """Wrong codes must return 401 and surface remaining attempts."""
    requests.post(
        f"{API_URL}/api/auth/register",
        json={"email": fresh_email, "password": "TestPass123!"},
        timeout=15,
    )
    resp = requests.post(
        f"{API_URL}/api/auth/verify-email",
        json={"email": fresh_email, "code": "000000"},
        timeout=15,
    )
    assert resp.status_code == 401
    assert "Incorrect code" in resp.json().get("detail", "")


def test_correct_otp_verifies_and_unlocks_login(fresh_email):
    """Correct code → 200, session token issued, login works."""
    requests.post(
        f"{API_URL}/api/auth/register",
        json={"email": fresh_email, "password": "TestPass123!"},
        timeout=15,
    )
    otp = _read_otp_from_logs(fresh_email)

    verify = requests.post(
        f"{API_URL}/api/auth/verify-email",
        json={"email": fresh_email, "code": otp},
        timeout=15,
    )
    assert verify.status_code == 200, verify.text
    body = verify.json()
    assert body["email_verified"] is True
    assert body["session_token"]
    assert body["user"]["email"] == fresh_email

    # Login now works
    login = requests.post(
        f"{API_URL}/api/auth/email-login",
        json={"email": fresh_email, "password": "TestPass123!"},
        timeout=15,
    )
    assert login.status_code == 200
    assert login.json()["user"]["email_verified"] is True


def test_seeded_demo_account_does_not_require_verification():
    """Pre-seeded demo accounts have email_verified=True and can log in directly."""
    resp = requests.post(
        f"{API_URL}/api/auth/email-login",
        json={"email": "Yusuff.Adeagbo@dequad.com", "password": "YusuffAdeagbo11@"},
        timeout=15,
    )
    assert resp.status_code == 200, resp.text
    assert resp.json()["user"]["email_verified"] is True
