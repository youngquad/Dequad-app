"""Backend tests for native Email/Password auth + admin-login regression.

Covers:
- POST /api/auth/register (success, invalid email, short password, duplicate)
- POST /api/auth/email-login (success, wrong password, non-existent email)
- GET  /api/auth/me with Authorization: Bearer <session_token>
- POST /api/auth/logout invalidates session
- Regression: POST /api/auth/admin-login (seeded admin success, non-@dequad.com 403)
"""

import os
import time
import uuid
import pytest
import requests
from dotenv import dotenv_values
from pymongo import MongoClient

_frontend_env = dotenv_values("/app/frontend/.env")
_backend_env = dotenv_values("/app/backend/.env")

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or _frontend_env["REACT_APP_BACKEND_URL"]).rstrip("/")
API = f"{BASE_URL}/api"

_mongo = MongoClient(os.environ.get("MONGO_URL") or _backend_env["MONGO_URL"])
_db = _mongo[os.environ.get("DB_NAME") or _backend_env["DB_NAME"]]


def _force_verify(email: str):
    """2026-06 OTP flow: registration no longer returns a session token, the
    account must be email-verified first. Tests short-circuit the emailed OTP
    by flipping the flag directly in Mongo."""
    _db.users.update_one({"email": email.lower()}, {"$set": {"email_verified": True}})
    _db.email_verifications.delete_one({"email": email.lower()})

# Seeded admin per /app/memory/test_credentials.md
ADMIN_EMAIL = "quadri.yusuf@dequad.com"
ADMIN_PASSWORD = "Oluwatobi11@"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def fresh_user():
    ts = int(time.time())
    # Use a known student-subdomain so the email passes the UK student-email
    # policy without needing a `confirm_student` attestation.
    return {
        "email": f"e2e_test_{ts}_{uuid.uuid4().hex[:6]}@student.leeds.ac.uk",
        "password": "Test12345!",
        "name": "E2E Test User",
    }


@pytest.fixture(scope="module")
def registered_user(client, fresh_user):
    """Register once, share across login/me/logout tests."""
    r = client.post(f"{API}/auth/register", json=fresh_user)
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    body = r.json()
    assert body.get("email_verification_required") is True
    assert "user" in body and body["user"]["email"] == fresh_user["email"].lower()
    _force_verify(fresh_user["email"])
    login = client.post(
        f"{API}/auth/email-login",
        json={"email": fresh_user["email"], "password": fresh_user["password"]},
    )
    assert login.status_code == 200, login.text
    return {"creds": fresh_user, "user": login.json()["user"], "session_token": login.json()["session_token"]}


# --- /auth/register ---------------------------------------------------------

class TestRegister:
    def test_register_success_requires_email_verification(self, client):
        ts = int(time.time())
        creds = {
            "email": f"TEST_reg_{ts}_{uuid.uuid4().hex[:6]}@student.leeds.ac.uk",
            "password": "Test12345!",
            "name": "TEST Register",
        }
        r = client.post(f"{API}/auth/register", json=creds)
        assert r.status_code == 200, r.text
        body = r.json()
        # user payload
        assert body["user"]["email"] == creds["email"].lower()
        assert body["user"]["role"] == "student"
        assert "user_id" in body["user"]
        assert "password_hash" not in body["user"]
        assert "_id" not in body["user"]
        # 2026-06 OTP flow: no session issued until email is verified
        assert body.get("email_verification_required") is True
        assert body["user"].get("email_verified") is False
        assert body.get("session_token") is None
        # login must be blocked pre-verification
        pre = client.post(
            f"{API}/auth/email-login",
            json={"email": creds["email"], "password": creds["password"]},
        )
        assert pre.status_code in (401, 403), pre.text

    def test_register_invalid_email_returns_400(self, client):
        r = client.post(f"{API}/auth/register", json={"email": "not-an-email", "password": "Test12345!"})
        assert r.status_code == 400, r.text
        assert "valid email" in r.json().get("detail", "").lower()

    def test_register_invalid_email_no_tld_returns_400(self, client):
        r = client.post(f"{API}/auth/register", json={"email": "user@localhost", "password": "Test12345!"})
        assert r.status_code == 400, r.text

    def test_register_short_password_returns_400(self, client):
        ts = int(time.time())
        r = client.post(
            f"{API}/auth/register",
            json={"email": f"TEST_short_{ts}@student.leeds.ac.uk", "password": "short1"},
        )
        assert r.status_code == 400, r.text
        assert "8 characters" in r.json().get("detail", "")

    def test_register_duplicate_email_returns_409(self, client, registered_user):
        # Re-register with the same email created in the module fixture.
        r = client.post(f"{API}/auth/register", json=registered_user["creds"])
        assert r.status_code == 409, r.text
        assert "already exists" in r.json().get("detail", "").lower()


# --- /auth/email-login ------------------------------------------------------

class TestEmailLogin:
    def test_email_login_success(self, client, registered_user):
        r = client.post(
            f"{API}/auth/email-login",
            json={
                "email": registered_user["creds"]["email"],
                "password": registered_user["creds"]["password"],
            },
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["user"]["email"] == registered_user["creds"]["email"].lower()
        assert "password_hash" not in body["user"]
        assert isinstance(body.get("session_token"), str) and len(body["session_token"]) > 10
        assert "session_token" in r.cookies

    def test_email_login_wrong_password_returns_401(self, client, registered_user):
        r = client.post(
            f"{API}/auth/email-login",
            json={"email": registered_user["creds"]["email"], "password": "WrongPass99!"},
        )
        assert r.status_code == 401, r.text
        assert r.json().get("detail") == "Invalid email or password."

    def test_email_login_nonexistent_email_returns_401(self, client):
        r = client.post(
            f"{API}/auth/email-login",
            json={
                "email": f"no_such_user_{uuid.uuid4().hex[:8]}@example.com",
                "password": "Whatever12!",
            },
        )
        assert r.status_code == 401, r.text
        # Same message – must not leak existence
        assert r.json().get("detail") == "Invalid email or password."


# --- /auth/me + /auth/logout ------------------------------------------------

class TestMeAndLogout:
    def test_me_with_bearer_token_returns_current_user(self, client, registered_user):
        # Use a *fresh* email-login so we own a known token (the register fixture's
        # token is still valid because email-login replaces only the prior session
        # for the same user_id; however the register token belongs to a different
        # user_id space — but in our impl email-login deletes ALL prior sessions
        # for that user. So just use the email-login token below.
        login = client.post(
            f"{API}/auth/email-login",
            json={
                "email": registered_user["creds"]["email"],
                "password": registered_user["creds"]["password"],
            },
        )
        assert login.status_code == 200
        token = login.json()["session_token"]

        # Use a bare session (no cookies) to make sure auth came from the header.
        bare = requests.Session()
        r = bare.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["email"] == registered_user["creds"]["email"].lower()
        assert body["user_id"] == registered_user["user"]["user_id"]
        assert "_id" not in body

    def test_logout_invalidates_session(self, client, registered_user):
        # Fresh login so this test doesn't interfere with concurrent tests.
        login = client.post(
            f"{API}/auth/email-login",
            json={
                "email": registered_user["creds"]["email"],
                "password": registered_user["creds"]["password"],
            },
        )
        assert login.status_code == 200
        token = login.json()["session_token"]

        bare = requests.Session()
        # Confirm token works.
        pre = bare.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert pre.status_code == 200

        # Logout with same token.
        out = bare.post(f"{API}/auth/logout", headers={"Authorization": f"Bearer {token}"})
        assert out.status_code == 200, out.text

        # Now /me with same token should be unauthorised.
        post = bare.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert post.status_code == 401, post.text


# --- /auth/admin-login regression ------------------------------------------

class TestAdminLoginRegression:
    def test_admin_login_seeded_admin_succeeds(self, client):
        r = client.post(
            f"{API}/auth/admin-login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("is_admin") is True
        assert body["user"]["email"] == ADMIN_EMAIL.lower()
        assert body["user"]["role"] == "admin"
        assert isinstance(body.get("session_token"), str) and body["session_token"].startswith("admin_session_")

    def test_admin_login_non_dequad_email_returns_403(self, client):
        r = client.post(
            f"{API}/auth/admin-login",
            json={"email": "someone@gmail.com", "password": "whatever"},
        )
        assert r.status_code == 403, r.text
        assert "@dequad.com" in r.json().get("detail", "")
