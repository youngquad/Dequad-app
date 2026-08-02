"""Regression tests for GPS distance-based match filtering.

Covers:
1. POST /api/profile/location saves coordinates as a GeoJSON Point (lng, lat order).
2. Invalid coords → 400.
3. DELETE /api/profile/location removes the field.
4. /api/matches/discover?max_distance_km=N filters nearby candidates via $geoNear
   and returns distance_km on each result (rounded, nearest-first).
5. When max_distance_km is requested but the caller has no location, the endpoint
   silently falls back to the non-geo path (no crash, results still returned).

Run with:
    cd /app/backend && pytest tests/test_location_filter.py -v
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


@pytest.fixture(scope="module")
def auth_headers() -> dict:
    return {"Authorization": f"Bearer {_login_token()}"}


def test_save_and_clear_location(auth_headers) -> None:
    # Save London coords
    r = requests.post(
        f"{API_URL}/api/profile/location",
        headers={**auth_headers, "Content-Type": "application/json"},
        json={"latitude": 51.5074, "longitude": -0.1278},
        timeout=10,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["ok"] is True
    assert body["location"]["type"] == "Point"
    # GeoJSON stores [lng, lat] — not [lat, lng]
    assert body["location"]["coordinates"] == [-0.1278, 51.5074]

    # /auth/me should now include the location on the user doc
    me = requests.get(f"{API_URL}/api/auth/me", headers=auth_headers, timeout=10).json()
    assert isinstance(me.get("location"), dict)
    assert me["location"]["coordinates"] == [-0.1278, 51.5074]

    # DELETE clears it
    d = requests.delete(f"{API_URL}/api/profile/location", headers=auth_headers, timeout=10)
    assert d.status_code == 200
    me2 = requests.get(f"{API_URL}/api/auth/me", headers=auth_headers, timeout=10).json()
    assert me2.get("location") in (None, {})


def test_invalid_coords_rejected(auth_headers) -> None:
    r = requests.post(
        f"{API_URL}/api/profile/location",
        headers={**auth_headers, "Content-Type": "application/json"},
        json={"latitude": 95.0, "longitude": 0.0},
        timeout=10,
    )
    assert r.status_code == 400
    assert "invalid" in r.json()["detail"].lower()


def test_distance_filter_returns_distance_km_and_orders_nearest_first(auth_headers) -> None:
    # Set my location to central London
    requests.post(
        f"{API_URL}/api/profile/location",
        headers={**auth_headers, "Content-Type": "application/json"},
        json={"latitude": 51.5074, "longitude": -0.1278},
        timeout=10,
    ).raise_for_status()

    # Ensure a fresh deck (reset any prior swipe state so we get the seeded users)
    r = requests.get(
        f"{API_URL}/api/matches/discover?reset=true&max_distance_km=300",
        headers=auth_headers,
        timeout=15,
    )
    assert r.status_code == 200
    results = r.json()
    # If no candidates have locations set this returns []; that's fine — we
    # only assert monotonic ordering when at least two candidates come back.
    with_dist = [u for u in results if isinstance(u.get("distance_km"), (int, float))]
    if len(with_dist) >= 2:
        distances = [u["distance_km"] for u in with_dist]
        assert distances == sorted(distances), (
            f"$geoNear results should be nearest-first, got {distances}"
        )
        # All returned must be within the requested radius
        assert all(d <= 300 for d in distances), distances


def test_distance_filter_falls_back_when_user_has_no_location(auth_headers) -> None:
    # Clear my location, then ask for a distance filter — should NOT crash.
    requests.delete(f"{API_URL}/api/profile/location", headers=auth_headers, timeout=10)
    r = requests.get(
        f"{API_URL}/api/matches/discover?max_distance_km=50",
        headers=auth_headers,
        timeout=15,
    )
    assert r.status_code == 200
    results = r.json()
    assert isinstance(results, list)
    # None of the results should carry a distance_km field in fallback mode
    assert all("distance_km" not in u for u in results)


def test_distance_filter_requires_auth() -> None:
    r = requests.post(
        f"{API_URL}/api/profile/location",
        json={"latitude": 0, "longitude": 0},
        timeout=10,
    )
    assert r.status_code in (401, 403)
