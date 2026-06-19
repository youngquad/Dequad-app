"""Regression: clicking "Refresh" on the Connect/matches deck must bring back
every previously-skipped (disliked) profile, not just ones older than 7 days.

Run with:
    cd /app/backend && pytest tests/test_discover_refresh.py -v
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

TEST_EMAIL = "yusufquadri83@gmail.com"
TEST_PASSWORD = "Oluwatobi11@"


def _login_token() -> str:
    r = requests.post(
        f"{API_URL}/api/auth/email-login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        timeout=15,
    )
    r.raise_for_status()
    return r.json()["session_token"]


def test_refresh_brings_back_skipped_profile() -> None:
    """Skip a profile, then call discover?reset=true — the profile must be back."""
    token = _login_token()
    headers = {"Authorization": f"Bearer {token}"}
    json_headers = {**headers, "Content-Type": "application/json"}

    # Hard reset to start from a clean slate
    requests.get(f"{API_URL}/api/matches/discover?reset=true", headers=headers, timeout=15)

    deck = requests.get(f"{API_URL}/api/matches/discover", headers=headers, timeout=15).json()
    assert deck, "Discover deck unexpectedly empty"
    target_id = deck[0]["user_id"]

    # Skip the top profile
    r = requests.post(
        f"{API_URL}/api/matches/swipe",
        headers=json_headers,
        json={"target_user_id": target_id, "action": "dislike"},
        timeout=15,
    )
    assert r.status_code == 200, r.text

    # Confirm excluded
    deck_after_skip = requests.get(
        f"{API_URL}/api/matches/discover", headers=headers, timeout=15
    ).json()
    ids_after_skip = [u["user_id"] for u in deck_after_skip]
    assert target_id not in ids_after_skip, "Skipped profile should be excluded from the deck"

    # Refresh = reset=true. Skipped profile must reappear.
    deck_after_reset = requests.get(
        f"{API_URL}/api/matches/discover?reset=true", headers=headers, timeout=15
    ).json()
    ids_after_reset = [u["user_id"] for u in deck_after_reset]
    assert target_id in ids_after_reset, "Refresh should bring back the skipped profile immediately"
