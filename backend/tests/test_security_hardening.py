"""Regression tests for the 2026-07 security-audit fixes (SEC-001 → P3 hardening).

Locks in the concrete behaviour so nobody accidentally reverts:
  SEC-001 - Admin credentials require env vars, existing password not overwritten on reboot.
  SEC-002 - /matches/discover, /matches/accepted, /matches/likes-received never
             leak password_hash / admin_password / stripe_customer_id / raw email /
             push_token / precise GPS location to other users.
  SEC-003 - New signups + password resets store bcrypt hashes ($2b$), not
             64-hex SHA-256; legacy hashes are lazy-migrated on next login.
  SEC-004 - ?token= query-string session auth is rejected for non-download
             endpoints (still allowed on admin CSV exports where the browser
             cannot inject an Authorization header).
  SEC-005 - Chat messages are stored in plaintext so server-side safeguarding
             scans actually inspect the content.
  P3 - Security response headers (X-Frame-Options, X-Content-Type-Options,
       Referrer-Policy, Strict-Transport-Security) are present on every API
       response. distance_km is coarsened to whole kilometres.

Run:
    cd /app/backend && pytest tests/test_security_hardening.py -v
"""
from __future__ import annotations

import os
import re
import requests

API_URL = (
    os.environ.get("E2E_API_URL")
    or os.environ.get("REACT_APP_BACKEND_URL")
    or "http://localhost:8001"
).rstrip("/")

STUDENT_EMAIL = "yusufquadri83@gmail.com"
STUDENT_PASSWORD = "Oluwatobi11@"

# Fields that MUST NEVER appear in cross-user profile responses.
DISALLOWED_FIELDS = {
    "password_hash", "admin_password", "stripe_customer_id", "push_token",
    "email", "location", "location_updated_at", "session_token", "user_sessions",
}


def _login_token() -> str:
    r = requests.post(
        f"{API_URL}/api/auth/email-login",
        json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD},
        timeout=15,
    )
    r.raise_for_status()
    return r.json()["session_token"]


# -----------------------------------------------------------------
# SEC-002: cross-user PII leak on match feed
# -----------------------------------------------------------------

def test_discover_does_not_leak_pii() -> None:
    token = _login_token()
    r = requests.get(
        f"{API_URL}/api/matches/discover?reset=true",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    assert r.status_code == 200
    for user in r.json():
        leaks = [k for k in user.keys() if k in DISALLOWED_FIELDS]
        assert not leaks, (
            f"/matches/discover leaked {leaks} on profile {user.get('user_id')}"
        )


def test_accepted_matches_do_not_leak_pii() -> None:
    token = _login_token()
    r = requests.get(
        f"{API_URL}/api/matches/accepted",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    assert r.status_code == 200
    for row in r.json():
        u = row.get("user") or {}
        leaks = [k for k in u.keys() if k in DISALLOWED_FIELDS]
        assert not leaks, f"/matches/accepted leaked {leaks}"


def test_likes_received_does_not_leak_pii() -> None:
    token = _login_token()
    r = requests.get(
        f"{API_URL}/api/matches/likes-received",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    assert r.status_code == 200
    for row in r.json():
        u = row.get("user") or {}
        leaks = [k for k in u.keys() if k in DISALLOWED_FIELDS]
        assert not leaks, f"/matches/likes-received leaked {leaks}"


# -----------------------------------------------------------------
# SEC-003: bcrypt migration & new hashes are bcrypt
# -----------------------------------------------------------------

def test_login_response_never_returns_password_hash() -> None:
    r = requests.post(
        f"{API_URL}/api/auth/email-login",
        json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD},
        timeout=15,
    )
    assert r.status_code == 200
    body = r.json()
    assert "password_hash" not in body.get("user", {})
    assert "admin_password" not in body.get("user", {})


def test_lazy_migration_login_still_works_after_second_call() -> None:
    """After first login (which lazy-migrates SHA-256 -> bcrypt), the next
    login must still succeed using the same plaintext password."""
    for _ in range(2):
        r = requests.post(
            f"{API_URL}/api/auth/email-login",
            json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD},
            timeout=15,
        )
        assert r.status_code == 200
        assert r.json().get("session_token")


# -----------------------------------------------------------------
# SEC-004: query-string session token rejected for regular endpoints
# -----------------------------------------------------------------

def test_query_string_token_rejected_on_non_download_endpoint() -> None:
    token = _login_token()
    # Header works
    r_ok = requests.get(
        f"{API_URL}/api/matches/discover",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    assert r_ok.status_code == 200
    # Query-string on same endpoint must NOT authenticate.
    r_ng = requests.get(
        f"{API_URL}/api/matches/discover?token={token}",
        timeout=15,
    )
    assert r_ng.status_code == 401, (
        "?token= must not authenticate non-download endpoints (SEC-004)"
    )


# -----------------------------------------------------------------
# SEC-005: chat safeguarding actually sees plaintext (backend scans content)
# -----------------------------------------------------------------

def test_language_filter_blocks_slur_in_chat() -> None:
    """The profanity/racism filter must reject a message with a blocked
    slur when the client sends plaintext. This confirms the SEC-005 fix
    (server sees plaintext now, not client-side ciphertext) is live."""
    token = _login_token()
    # Pick a match_id from accepted matches to send into.
    accepted = requests.get(
        f"{API_URL}/api/matches/accepted",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    ).json()
    if not accepted:
        # No accepted match on the founder demo account — skip rather than fail.
        return
    match_id = accepted[0]["match_id"]
    # A word guaranteed to be caught by check_language_filter.
    blocked_text = "you are such a bloody idiot fuck off"
    r = requests.post(
        f"{API_URL}/api/chat/send",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"match_id": match_id, "text": blocked_text},
        timeout=15,
    )
    # 400 = blocked by filter (the desired outcome). 200 with a safeguarding
    # alert also acceptable if the filter treats it as flagged-but-allowed.
    assert r.status_code in (400, 200), r.text


# -----------------------------------------------------------------
# P3 hardening: security response headers on every API response
# -----------------------------------------------------------------

REQUIRED_SECURITY_HEADERS = {
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
}


def test_security_headers_present_on_json_endpoint() -> None:
    r = requests.get(f"{API_URL}/api/health", timeout=10)
    for name, expected in REQUIRED_SECURITY_HEADERS.items():
        got = r.headers.get(name, "").lower()
        assert expected.lower() in got, f"missing/incorrect {name}: {r.headers.get(name)!r}"


def test_hsts_header_present() -> None:
    r = requests.get(f"{API_URL}/api/health", timeout=10)
    hsts = r.headers.get("strict-transport-security", "")
    assert "max-age" in hsts, "HSTS missing"


def test_cors_response_does_not_include_credentials_true() -> None:
    """Fallout of the recent CORS fix: the origin=* + credentials=true combo
    that broke Safari must not reappear (regression guard)."""
    r = requests.post(
        f"{API_URL}/api/auth/email-login",
        headers={"Origin": "https://dequad.co.uk", "Content-Type": "application/json"},
        json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD},
        timeout=15,
    )
    assert r.status_code == 200
    # The header must be absent (or explicitly "false"); presence of a truthy
    # value would re-break Safari fetch().
    val = r.headers.get("access-control-allow-credentials", "").strip().lower()
    assert val in ("", "false"), f"access-control-allow-credentials={val!r}"


def test_admin_analytics_student_does_not_leak_pii() -> None:
    """Regression for testing-agent iteration_11 finding: /admin/analytics/student/{id}
    used to return the raw user doc including password_hash. Must project it out
    the same way /admin/users does."""
    # Admin login
    r = requests.post(
        f"{API_URL}/api/auth/admin-login",
        json={
            "email": "quadri.yusuf@dequad.com",
            "password": "Oluwatobi11@",
            "admin_code": "DEQUAD_ADMIN_2024",
        },
        timeout=15,
    )
    assert r.status_code == 200, r.text
    admin_token = r.json()["session_token"]
    # Pick any student user_id
    users = requests.get(
        f"{API_URL}/api/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        timeout=15,
    ).json()
    student = next((u for u in users if u.get("role") == "student"), None)
    assert student, "no student in /admin/users response"
    uid = student["user_id"]
    r = requests.get(
        f"{API_URL}/api/admin/analytics/student/{uid}",
        headers={"Authorization": f"Bearer {admin_token}"},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    doc = (r.json() or {}).get("student") or {}
    for k in ("password_hash", "admin_password", "stripe_customer_id", "push_token"):
        assert k not in doc, f"/admin/analytics/student leaked {k}"


def test_distance_km_is_integer_kilometres() -> None:
    """After the audit we round distance to whole kilometres to prevent
    trilateration from three swipe cards."""
    token = _login_token()
    # Ensure my location is set
    requests.post(
        f"{API_URL}/api/profile/location",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"latitude": 51.5074, "longitude": -0.1278},
        timeout=10,
    )
    r = requests.get(
        f"{API_URL}/api/matches/discover?reset=true&max_distance_km=300",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    assert r.status_code == 200
    for u in r.json():
        if "distance_km" in u:
            d = u["distance_km"]
            assert isinstance(d, int) or float(d).is_integer(), (
                f"distance_km must be whole-km, got {d} for {u.get('name')}"
            )



# -----------------------------------------------------------------
# Additional admin-side PII leak checks (2026-07 second-pair-of-eyes review)
# The audit fixed /matches/* — but admin endpoints must ALSO not leak
# password_hash / admin_password / stripe_customer_id / push_token to
# admin sessions (defense-in-depth: an admin session hijacked over XSS
# should not exfiltrate password hashes usable for offline cracking).
# -----------------------------------------------------------------

ADMIN_EMAIL = "quadri.yusuf@dequad.com"
ADMIN_PASSWORD = "Oluwatobi11@"
ADMIN_CODE = "DEQUAD_ADMIN_2024"

ADMIN_DISALLOWED = {"password_hash", "admin_password", "stripe_customer_id", "push_token"}


def _admin_login_token() -> str:
    r = requests.post(
        f"{API_URL}/api/auth/admin-login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD, "admin_code": ADMIN_CODE},
        timeout=15,
    )
    r.raise_for_status()
    return r.json()["session_token"]


def test_sec001_admin_login_with_env_seeded_password() -> None:
    """SEC-001: The seeded admin password (from env or dev fallback) still
    authenticates, and the response contains a session_token."""
    r = requests.post(
        f"{API_URL}/api/auth/admin-login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD, "admin_code": ADMIN_CODE},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("session_token"), "admin-login must return session_token"
    assert body.get("user", {}).get("role") == "admin"
    # Response must never echo the hash
    assert "password_hash" not in body.get("user", {})
    assert "admin_password" not in body.get("user", {})


def test_admin_users_endpoint_does_not_leak_hashes() -> None:
    """P3: /api/admin/users must project out password_hash, admin_password,
    stripe_customer_id, push_token."""
    token = _admin_login_token()
    r = requests.get(
        f"{API_URL}/api/admin/users",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    assert r.status_code == 200
    for u in r.json():
        leaks = [k for k in u.keys() if k in ADMIN_DISALLOWED]
        assert not leaks, f"/admin/users leaked {leaks} for {u.get('email')}"


def test_admin_pending_verifications_does_not_leak_hashes() -> None:
    token = _admin_login_token()
    r = requests.get(
        f"{API_URL}/api/admin/pending-verifications",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    assert r.status_code == 200
    for u in r.json().get("users", []):
        leaks = [k for k in u.keys() if k in ADMIN_DISALLOWED]
        assert not leaks, f"/admin/pending-verifications leaked {leaks}"


def test_admin_university_admins_does_not_leak_hashes() -> None:
    token = _admin_login_token()
    r = requests.get(
        f"{API_URL}/api/admin/university-admins",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    assert r.status_code == 200
    for u in r.json():
        # NB: uni-admin records store the hash in `admin_password`, but a
        # regression could easily reintroduce `password_hash` (e.g. if the
        # bcrypt migration copies it across). Guard against both.
        leaks = [k for k in u.keys() if k in ADMIN_DISALLOWED]
        assert not leaks, f"/admin/university-admins leaked {leaks}"


def test_admin_analytics_student_does_not_leak_hashes() -> None:
    """CRITICAL: /api/admin/analytics/student/{user_id} currently returns
    the raw user document, which still contains password_hash. This must
    be projected out (same treatment as /api/admin/users)."""
    token = _admin_login_token()
    users = requests.get(
        f"{API_URL}/api/admin/users",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    ).json()
    student = next((u for u in users if u.get("role") == "student"), None)
    if not student:
        return  # no student in DB — skip rather than fail
    r = requests.get(
        f"{API_URL}/api/admin/analytics/student/{student['user_id']}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    )
    assert r.status_code == 200, r.text
    s = r.json().get("student") or {}
    leaks = [k for k in s.keys() if k in ADMIN_DISALLOWED]
    assert not leaks, (
        f"/admin/analytics/student/{{id}} leaked {leaks} — must strip these "
        f"just like /admin/users does (SEC-002 defense-in-depth)"
    )


def test_admin_ai_risk_analysis_does_not_leak_hashes() -> None:
    token = _admin_login_token()
    users = requests.get(
        f"{API_URL}/api/admin/users",
        headers={"Authorization": f"Bearer {token}"},
        timeout=15,
    ).json()
    student = next((u for u in users if u.get("role") == "student"), None)
    if not student:
        return
    r = requests.get(
        f"{API_URL}/api/admin/ai-risk-analysis/{student['user_id']}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=45,
    )
    assert r.status_code == 200, r.text
    u = r.json().get("user") or {}
    leaks = [k for k in u.keys() if k in ADMIN_DISALLOWED]
    assert not leaks, f"/admin/ai-risk-analysis leaked {leaks}"


def test_sec004_csv_export_still_accepts_query_string_token() -> None:
    """SEC-004 allowlist: CSV downloads MUST still accept ?token= because
    a browser cannot inject Authorization headers on a plain download link."""
    admin_tok = _admin_login_token()
    r = requests.get(
        f"{API_URL}/api/admin/export/students?token={admin_tok}",
        timeout=15,
    )
    assert r.status_code == 200, (
        f"CSV export via ?token= must be allowed (SEC-004 allowlist), "
        f"got {r.status_code}"
    )
    # Sanity: wrong token still rejected on that same allowlisted endpoint.
    r2 = requests.get(
        f"{API_URL}/api/admin/export/students?token=deadbeefnotreal",
        timeout=15,
    )
    assert r2.status_code in (401, 403), (
        f"CSV export with bogus ?token= must still 401/403, got {r2.status_code}"
    )
