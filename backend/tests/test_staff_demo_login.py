"""Regression tests for the DEQUAD demo-login seeding (2026-06, revised).

Three account groups exist for demos:
1. Staff `firstname.lastname@dequad.com` — seeded by `seed.py` so the wider team
   can log in to the student app during UKES / investor demos.
2. Founder's personal student-side account `yusufquadri83@gmail.com`.
3. Blocked staff: `Adedapo.Ajuwon@dequad.com` is intentionally not allowed to
   sign in.

Public registration with a `@dequad.com` address is blocked by the `.ac.uk`
student-email policy regardless.

Run with:
    cd /app/backend && pytest tests/test_staff_demo_login.py -v
"""
from __future__ import annotations

import os
import pytest
import requests


API_URL = (
    os.environ.get("E2E_API_URL")
    or os.environ.get("REACT_APP_BACKEND_URL")
    or "http://localhost:8001"
).rstrip("/")
GENERIC_STAFF_PASSWORD = os.environ.get("SEED_STAFF_PASSWORD", "DequadStaff2026!")


# (login_email, expected_user_name, password)
ALLOWED_ACCOUNTS = [
    ("Yusuff.Adeagbo@dequad.com", "Yusuff Adeagbo", "YusuffAdeagbo11@"),
    ("Gerald.Marfo@dequad.com", "Dr Gerald Marfo", GENERIC_STAFF_PASSWORD),
    ("Chinyere.Jennifer@dequad.com", "Chinyere Jennifer", GENERIC_STAFF_PASSWORD),
    ("yusufquadri83@gmail.com", "Yusuf Quadri", "Oluwatobi11@"),
]

# Accounts that must NOT be able to log in (blocked / legacy / removed)
BLOCKED_ACCOUNTS = [
    ("Adedapo.Ajuwon@dequad.com", GENERIC_STAFF_PASSWORD),
    # Legacy first-name-only emails
    ("yusuff@dequad.com", GENERIC_STAFF_PASSWORD),
    ("gerald@dequad.com", GENERIC_STAFF_PASSWORD),
    ("dapo@dequad.com", GENERIC_STAFF_PASSWORD),
    ("chinyere@dequad.com", GENERIC_STAFF_PASSWORD),
]


@pytest.mark.parametrize("email,name,password", ALLOWED_ACCOUNTS)
def test_allowed_demo_login_succeeds(email: str, name: str, password: str) -> None:
    resp = requests.post(
        f"{API_URL}/api/auth/email-login",
        json={"email": email, "password": password},
        timeout=15,
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["user"]["email"] == email.lower()
    assert body["user"]["name"] == name
    assert body["user"]["role"] == "student"
    assert body.get("session_token")


@pytest.mark.parametrize("email,password", BLOCKED_ACCOUNTS)
def test_blocked_account_login_rejected(email: str, password: str) -> None:
    resp = requests.post(
        f"{API_URL}/api/auth/email-login",
        json={"email": email, "password": password},
        timeout=15,
    )
    assert resp.status_code == 401, f"{email} should be blocked: {resp.status_code} {resp.text}"


def test_staff_demo_login_wrong_password_rejected() -> None:
    resp = requests.post(
        f"{API_URL}/api/auth/email-login",
        json={"email": "Yusuff.Adeagbo@dequad.com", "password": "WrongPass123!"},
        timeout=15,
    )
    assert resp.status_code == 401


def test_register_blocks_dequad_dot_com() -> None:
    """Public registration with @dequad.com must be rejected by the .ac.uk policy."""
    resp = requests.post(
        f"{API_URL}/api/auth/register",
        json={"email": "newhire@dequad.com", "password": "SomePass123!", "name": "New Hire"},
        timeout=15,
    )
    assert resp.status_code == 403
    assert ".ac.uk" in resp.json().get("detail", "")
