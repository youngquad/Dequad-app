"""Regression tests for the DEQUAD staff-demo seeding (2026-06).

Staff at `@dequad.com` are seeded by `seed.py` so the wider team can log in to
the student app during UKES / investor demos. Public registration with a
`@dequad.com` address is blocked by the `.ac.uk` student-email policy.

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
STAFF_PASSWORD = os.environ.get("SEED_STAFF_PASSWORD", "DequadStaff2026!")


STAFF_ACCOUNTS = [
    ("yusuff@dequad.com", "Yusuff Adeagbo"),
    ("gerald@dequad.com", "Dr Gerald Marfo"),
    ("dapo@dequad.com", "Adedapo Ajuwon"),
    ("chinyere@dequad.com", "Chinyere Jennifer"),
]


@pytest.mark.parametrize("email,name", STAFF_ACCOUNTS)
def test_staff_demo_login_succeeds(email: str, name: str) -> None:
    resp = requests.post(
        f"{API_URL}/api/auth/email-login",
        json={"email": email, "password": STAFF_PASSWORD},
        timeout=15,
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["user"]["email"] == email
    assert body["user"]["name"] == name
    assert body["user"]["role"] == "student"
    assert body.get("session_token")


def test_staff_demo_login_wrong_password_rejected() -> None:
    resp = requests.post(
        f"{API_URL}/api/auth/email-login",
        json={"email": "yusuff@dequad.com", "password": "WrongPass123!"},
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
