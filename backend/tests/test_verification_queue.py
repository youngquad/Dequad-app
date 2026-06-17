"""Tests for the admin "Pending student verification" queue.

Endpoints:
  GET    /api/admin/pending-verifications
  POST   /api/admin/pending-verifications/:uid/approve
  POST   /api/admin/pending-verifications/:uid/reject

The queue surfaces accounts whose student_verification ∈
{"self_declared", "pending_review"}.
"""
from __future__ import annotations
import os
import time
import uuid

import httpx
import pytest

API = (os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")) + "/api"
ADMIN_EMAIL = "quadri.yusuf@dequad.com"
ADMIN_PASSWORD = "Oluwatobi11@"


@pytest.fixture(scope="module")
def http():
    with httpx.Client(timeout=30.0, follow_redirects=True) as c:
        yield c


@pytest.fixture(scope="module")
def admin_token(http):
    r = http.post(
        f"{API}/auth/admin-login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    )
    assert r.status_code == 200, r.text
    return r.json()["session_token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


def _register_self_declared(http) -> tuple[str, str]:
    """Register a fresh bare-`.ac.uk` user with confirm_student=True.
    Returns (user_id, email)."""
    email = f"q_{int(time.time())}_{uuid.uuid4().hex[:6]}@kcl.ac.uk"
    r = http.post(
        f"{API}/auth/register",
        json={
            "email": email,
            "password": "Test12345!",
            "confirm_student": True,
            "name": "Queue Tester",
        },
    )
    assert r.status_code == 200, r.text
    return r.json()["user"]["user_id"], email


class TestListEndpoint:
    def test_list_returns_count_and_users(self, http, auth_headers):
        # Ensure at least one row in the queue.
        uid, _ = _register_self_declared(http)
        try:
            r = http.get(f"{API}/admin/pending-verifications", headers=auth_headers)
            assert r.status_code == 200, r.text
            body = r.json()
            assert isinstance(body["count"], int) and body["count"] >= 1
            assert isinstance(body["users"], list)
            row = next((u for u in body["users"] if u["user_id"] == uid), None)
            assert row is not None, "Newly-registered self-declared user missing from queue"
            assert row["student_verification"] == "self_declared"
            assert row["auth_method"] == "password"
            assert "kcl.ac.uk" in row["university"]
            # never leak the hash
            assert "password_hash" not in row
        finally:
            # cleanup
            http.post(f"{API}/admin/pending-verifications/{uid}/reject", headers=auth_headers)

    def test_list_requires_admin_auth(self, http):
        r = http.get(f"{API}/admin/pending-verifications")
        assert r.status_code in (401, 403), r.text


class TestApprove:
    def test_approve_moves_user_out_of_queue(self, http, auth_headers):
        uid, _ = _register_self_declared(http)
        r = http.post(
            f"{API}/admin/pending-verifications/{uid}/approve",
            headers=auth_headers,
        )
        assert r.status_code == 200, r.text
        assert r.json()["student_verification"] == "verified"

        # Should no longer appear in the queue.
        listing = http.get(f"{API}/admin/pending-verifications", headers=auth_headers).json()
        assert all(u["user_id"] != uid for u in listing["users"])

    def test_approve_twice_returns_404(self, http, auth_headers):
        uid, _ = _register_self_declared(http)
        http.post(f"{API}/admin/pending-verifications/{uid}/approve", headers=auth_headers)
        r = http.post(f"{API}/admin/pending-verifications/{uid}/approve", headers=auth_headers)
        assert r.status_code == 404, r.text

    def test_approve_unknown_user_returns_404(self, http, auth_headers):
        r = http.post(
            f"{API}/admin/pending-verifications/user_does_not_exist/approve",
            headers=auth_headers,
        )
        assert r.status_code == 404, r.text


class TestReject:
    def test_reject_deletes_account_and_revokes_login(self, http, auth_headers):
        uid, email = _register_self_declared(http)
        r = http.post(
            f"{API}/admin/pending-verifications/{uid}/reject",
            headers=auth_headers,
        )
        assert r.status_code == 200, r.text
        assert r.json()["deleted"] is True

        # Login with the rejected account's credentials should fail.
        login = http.post(
            f"{API}/auth/email-login",
            json={"email": email, "password": "Test12345!"},
        )
        assert login.status_code == 401, login.text

    def test_cannot_reject_already_processed(self, http, auth_headers):
        uid, _ = _register_self_declared(http)
        http.post(f"{API}/admin/pending-verifications/{uid}/reject", headers=auth_headers)
        r = http.post(f"{API}/admin/pending-verifications/{uid}/reject", headers=auth_headers)
        assert r.status_code == 404, r.text
