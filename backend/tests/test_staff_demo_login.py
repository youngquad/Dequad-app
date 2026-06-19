"""Regression tests for the DEQUAD staff-demo seeding (2026-06).

Staff at `firstname.lastname@dequad.com` are seeded by `seed.py` so the wider
team can log in to the student app during UKES / investor demos. Public
registration with a `@dequad.com` address is blocked by the `.ac.uk`
student-email policy. `Yusuff.Adeagbo@dequad.com` is the only real mailbox of
the four and has its own per-person password; the other three are demo-only
profiles sharing a generic demo password.

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
STAFF_ACCOUNTS = [
    ("Yusuff.Adeagbo@dequad.com", "Yusuff Adeagbo", "YusuffAdeagbo11@"),
    ("Gerald.Marfo@dequad.com", "Dr Gerald Marfo", GENERIC_STAFF_PASSWORD),
    ("Adedapo.Ajuwon@dequad.com", "Adedapo Ajuwon", GENERIC_STAFF_PASSWORD),
    ("Chinyere.Jennifer@dequad.com", "Chinyere Jennifer", GENERIC_STAFF_PASSWORD),
]


@pytest.mark.parametrize("email,name,password", STAFF_ACCOUNTS)
def test_staff_demo_login_succeeds(email: str, name: str, password: str) -> None:
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


def test_legacy_first_name_only_emails_removed() -> None:
    """The old `yusuff@dequad.com`-style accounts must no longer log in."""
    for old_email in ("yusuff@dequad.com", "gerald@dequad.com", "dapo@dequad.com", "chinyere@dequad.com"):
        resp = requests.post(
            f"{API_URL}/api/auth/email-login",
            json={"email": old_email, "password": GENERIC_STAFF_PASSWORD},
            timeout=15,
        )
        assert resp.status_code == 401, f"Legacy {old_email} should be removed: {resp.status_code} {resp.text}"
