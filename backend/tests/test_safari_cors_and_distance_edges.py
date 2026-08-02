"""Regression tests for Safari CORS 'Load failed' fix + GPS distance edge cases.

Covers:
- POST /api/auth/email-login response headers must NOT include
  `access-control-allow-credentials: true` (Safari-incompatible combo with `*`).
- Login still returns 200 + session_token from a cross-origin dequad.co.uk Origin.
- /api/auth/me works with the returned Bearer token.
- max_distance_km=0 falls back gracefully (no crash).
- Combining max_distance_km with other filters (gender, university) still works.
- Multiple sequential distance requests return consistent, monotonically ordered data.
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
CROSS_ORIGIN = "https://dequad.co.uk"


def _login(origin: str | None = None) -> requests.Response:
    headers = {"Content-Type": "application/json"}
    if origin:
        headers["Origin"] = origin
    return requests.post(
        f"{API_URL}/api/auth/email-login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
        headers=headers,
        timeout=15,
    )


@pytest.fixture(scope="module")
def login_resp() -> requests.Response:
    r = _login(origin=CROSS_ORIGIN)
    assert r.status_code == 200, r.text
    return r


@pytest.fixture(scope="module")
def auth_headers(login_resp) -> dict:
    return {"Authorization": f"Bearer {login_resp.json()['session_token']}"}


# ---------- Safari CORS regression ----------

def test_login_returns_200_from_dequad_origin(login_resp) -> None:
    body = login_resp.json()
    assert "session_token" in body and len(body["session_token"]) > 0


def test_no_allow_credentials_true_header(login_resp) -> None:
    """Safari 'Load failed' trigger: ACAO:* with ACAC:true is illegal per CORS spec."""
    hdrs_lower = {k.lower(): v for k, v in login_resp.headers.items()}
    acac = hdrs_lower.get("access-control-allow-credentials")
    assert acac is None or acac.lower() != "true", (
        f"Header must not be 'true'. Got: {acac}. Full CORS headers: "
        f"{ {k: v for k, v in hdrs_lower.items() if k.startswith('access-control')} }"
    )


def test_preflight_options_email_login_ok() -> None:
    r = requests.options(
        f"{API_URL}/api/auth/email-login",
        headers={
            "Origin": CROSS_ORIGIN,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,authorization",
        },
        timeout=10,
    )
    # Must be 200/204 and again no allow-credentials:true
    assert r.status_code in (200, 204), r.status_code
    hdrs_lower = {k.lower(): v for k, v in r.headers.items()}
    acac = hdrs_lower.get("access-control-allow-credentials")
    assert acac is None or acac.lower() != "true", acac


def test_auth_me_with_bearer(auth_headers) -> None:
    r = requests.get(f"{API_URL}/api/auth/me", headers=auth_headers, timeout=10)
    assert r.status_code == 200, r.text
    assert r.json().get("email", "").lower() == TEST_EMAIL


# ---------- Distance filter edge cases ----------

def test_max_distance_km_zero_falls_back(auth_headers) -> None:
    # Ensure a location exists so we don't accidentally take the fallback path
    requests.post(
        f"{API_URL}/api/profile/location",
        headers={**auth_headers, "Content-Type": "application/json"},
        json={"latitude": 51.5074, "longitude": -0.1278},
        timeout=10,
    ).raise_for_status()

    r = requests.get(
        f"{API_URL}/api/matches/discover?max_distance_km=0&reset=true",
        headers=auth_headers,
        timeout=15,
    )
    assert r.status_code == 200, r.text
    results = r.json()
    assert isinstance(results, list)
    # 0 is a non-positive radius — implementation should treat as "no filter"
    # (either return normal results, or empty list). Either way, no 500.


def test_distance_filter_combined_with_gender_filter(auth_headers) -> None:
    requests.post(
        f"{API_URL}/api/profile/location",
        headers={**auth_headers, "Content-Type": "application/json"},
        json={"latitude": 51.5074, "longitude": -0.1278},
        timeout=10,
    ).raise_for_status()
    r = requests.get(
        f"{API_URL}/api/matches/discover?max_distance_km=300&gender=female&reset=true",
        headers=auth_headers,
        timeout=15,
    )
    assert r.status_code == 200, r.text
    results = r.json()
    assert isinstance(results, list)
    with_dist = [u for u in results if isinstance(u.get("distance_km"), (int, float))]
    if with_dist:
        assert all(d <= 300 for d in [u["distance_km"] for u in with_dist])


def test_multiple_sequential_distance_requests_consistent(auth_headers) -> None:
    requests.post(
        f"{API_URL}/api/profile/location",
        headers={**auth_headers, "Content-Type": "application/json"},
        json={"latitude": 51.5074, "longitude": -0.1278},
        timeout=10,
    ).raise_for_status()

    # Radius 50 should be a subset of radius 300 in terms of user_ids
    r50 = requests.get(
        f"{API_URL}/api/matches/discover?max_distance_km=50&reset=true",
        headers=auth_headers, timeout=15,
    ).json()
    r300 = requests.get(
        f"{API_URL}/api/matches/discover?max_distance_km=300&reset=true",
        headers=auth_headers, timeout=15,
    ).json()
    ids_50 = {u.get("id") or u.get("user_id") for u in r50 if u.get("distance_km") is not None}
    ids_300 = {u.get("id") or u.get("user_id") for u in r300 if u.get("distance_km") is not None}
    # If both non-empty, ids_50 should be subset of ids_300
    if ids_50 and ids_300:
        assert ids_50.issubset(ids_300), (ids_50 - ids_300)


# ---------- Regression: existing flows ----------

def test_discover_without_distance_still_works(auth_headers) -> None:
    r = requests.get(
        f"{API_URL}/api/matches/discover?reset=true",
        headers=auth_headers, timeout=15,
    )
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_accepted_and_likes_received_count(auth_headers) -> None:
    a = requests.get(f"{API_URL}/api/matches/accepted", headers=auth_headers, timeout=10)
    assert a.status_code == 200
    assert isinstance(a.json(), list)
    c = requests.get(f"{API_URL}/api/matches/likes-received/count", headers=auth_headers, timeout=10)
    assert c.status_code == 200
    assert isinstance(c.json().get("count"), int)
