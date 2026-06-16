"""Backend tests for the unified password-reset flow (students + admins).

Covers /api/auth/forgot-password, /api/auth/verify-reset-token,
/api/auth/reset-password — for both student and admin roles, plus
edge cases (account enumeration, token reuse, weak password).

SMTP delivery is not relied upon. The reset token is read straight from
the `password_resets` collection in MongoDB.
"""

import os
import time
import uuid
import hashlib
import pytest
import requests
from pathlib import Path
from pymongo import MongoClient


# --- Env loading (REACT_APP_BACKEND_URL + MONGO_URL/DB_NAME) -----------------

def _load_env_file(path: Path) -> dict:
    out = {}
    if not path.exists():
        return out
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


_FE_ENV = _load_env_file(Path("/app/frontend/.env"))
_BE_ENV = _load_env_file(Path("/app/backend/.env"))

BASE_URL = (
    os.environ.get("REACT_APP_BACKEND_URL")
    or _FE_ENV.get("REACT_APP_BACKEND_URL")
).rstrip("/")
API = f"{BASE_URL}/api"

MONGO_URL = os.environ.get("MONGO_URL") or _BE_ENV.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME") or _BE_ENV.get("DB_NAME")
ADMIN_SECRET_CODE = os.environ.get("ADMIN_SECRET_CODE") or _BE_ENV.get("ADMIN_SECRET_CODE")

ADMIN_EMAIL = "quadri.yusuf@dequad.com"
ORIGINAL_ADMIN_PASSWORD = "Oluwatobi11@"


@pytest.fixture(scope="module")
def mongo_db():
    client = MongoClient(MONGO_URL)
    yield client[DB_NAME]
    client.close()


@pytest.fixture(scope="module")
def http():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _admin_login(http, **payload):
    """POST /api/auth/admin-login with retry/backoff on 429 rate limits."""
    for delay in (0, 3, 6, 12, 20, 30, 45):
        if delay:
            time.sleep(delay)
        r = http.post(f"{API}/auth/admin-login", json=payload)
        if r.status_code != 429:
            return r
    return r  # last response (still 429)


def _reset_password(http, **payload):
    """POST /api/auth/reset-password with retry/backoff on 429 rate limits."""
    for delay in (0, 3, 6, 12, 20):
        if delay:
            time.sleep(delay)
        r = http.post(f"{API}/auth/reset-password", json=payload)
        if r.status_code != 429:
            return r
    return r


def _read_reset_record(db, email: str) -> dict:
    """Return the latest reset record for email (None if missing)."""
    return db.password_resets.find_one(
        {"email": email.lower()}, sort=[("created_at", -1)]
    )


# --- Student happy path: register → forgot → verify → reset → login ---------

class TestStudentResetFlow:
    @pytest.fixture(scope="class")
    def student(self, http):
        ts = int(time.time())
        creds = {
            "email": f"student_reset_{ts}_{uuid.uuid4().hex[:6]}@example.com",
            "password": "Original123!",
            "name": "Student Reset",
        }
        r = http.post(f"{API}/auth/register", json=creds)
        assert r.status_code == 200, r.text
        return creds

    def test_forgot_password_creates_student_reset_record(self, http, mongo_db, student):
        r = http.post(f"{API}/auth/forgot-password", json={"email": student["email"]})
        assert r.status_code == 200, r.text
        assert "If an account exists" in r.json().get("message", "")

        rec = _read_reset_record(mongo_db, student["email"])
        assert rec is not None, "No password_resets record was created for the student."
        assert rec["role"] == "student", f"Expected role='student' on reset record, got {rec.get('role')!r}"
        assert rec["used"] is False
        assert isinstance(rec["token"], str) and len(rec["token"]) > 20

    def test_verify_reset_token_valid(self, http, mongo_db, student):
        rec = _read_reset_record(mongo_db, student["email"])
        r = http.get(f"{API}/auth/verify-reset-token", params={"token": rec["token"]})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["valid"] is True
        assert body["email"] == student["email"].lower()

    def test_verify_reset_token_invalid_returns_400(self, http):
        r = http.get(f"{API}/auth/verify-reset-token", params={"token": "definitely-bogus-token"})
        assert r.status_code == 400, r.text

    def test_reset_password_short_returns_400(self, http, mongo_db, student):
        rec = _read_reset_record(mongo_db, student["email"])
        r = http.post(f"{API}/auth/reset-password", json={"token": rec["token"], "new_password": "short"})
        assert r.status_code == 400, r.text
        # Token must still be unused after the failed attempt
        rec_after = _read_reset_record(mongo_db, student["email"])
        assert rec_after["used"] is False

    def test_reset_password_updates_password_hash_not_admin_password(
        self, http, mongo_db, student
    ):
        rec = _read_reset_record(mongo_db, student["email"])
        new_pw = "BrandNew456!"
        r = http.post(
            f"{API}/auth/reset-password",
            json={"token": rec["token"], "new_password": new_pw},
        )
        assert r.status_code == 200, r.text

        user_doc = mongo_db.users.find_one({"email": student["email"].lower()})
        expected_hash = hashlib.sha256(new_pw.encode()).hexdigest()
        assert user_doc["password_hash"] == expected_hash, "password_hash was not updated"
        assert "admin_password" not in user_doc or not user_doc.get("admin_password"), (
            "admin_password should NOT be set on a student reset"
        )
        # Role must remain student
        assert user_doc.get("role") == "student", (
            f"Role unexpectedly changed to {user_doc.get('role')!r} after student reset"
        )

        # Track new password for follow-up tests on the class
        student["password"] = new_pw

    def test_email_login_works_with_new_password(self, http, student):
        r = http.post(
            f"{API}/auth/email-login",
            json={"email": student["email"], "password": "BrandNew456!"},
        )
        assert r.status_code == 200, r.text
        assert r.json()["user"]["email"] == student["email"].lower()

    def test_email_login_old_password_rejected(self, http, student):
        r = http.post(
            f"{API}/auth/email-login",
            json={"email": student["email"], "password": "Original123!"},
        )
        assert r.status_code == 401, r.text

    def test_reset_token_cannot_be_reused(self, http, mongo_db, student):
        # The reset record from the happy path should now be marked used.
        rec = _read_reset_record(mongo_db, student["email"])
        assert rec["used"] is True, "Reset token should have been marked used after success"
        r = http.post(
            f"{API}/auth/reset-password",
            json={"token": rec["token"], "new_password": "TryAgain789!"},
        )
        assert r.status_code == 400, r.text


# --- Account-enumeration guarantees -----------------------------------------

class TestForgotPasswordEnumeration:
    GENERIC_MSG = "If an account exists with this email, a reset link has been sent."

    def test_non_existent_email_returns_generic_message(self, http):
        r = http.post(
            f"{API}/auth/forgot-password",
            json={"email": f"ghost_{uuid.uuid4().hex[:8]}@example.com"},
        )
        assert r.status_code == 200, r.text
        assert r.json().get("message") == self.GENERIC_MSG

    def test_google_only_user_returns_generic_message_and_no_record(
        self, http, mongo_db
    ):
        # Seed a Google-only user (no password_hash, no admin_password).
        ts = int(time.time())
        email = f"googleonly_{ts}_{uuid.uuid4().hex[:6]}@example.com"
        mongo_db.users.insert_one({
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": email,
            "name": "Google Only",
            "role": "student",
            "interests": [],
        })
        try:
            r = http.post(f"{API}/auth/forgot-password", json={"email": email})
            assert r.status_code == 200, r.text
            assert r.json().get("message") == self.GENERIC_MSG
            # MUST NOT create a reset record for the OAuth-only user.
            assert mongo_db.password_resets.find_one({"email": email}) is None
        finally:
            mongo_db.users.delete_one({"email": email})

    def test_existing_student_returns_same_generic_message(self, http, mongo_db):
        ts = int(time.time())
        creds = {
            "email": f"realstudent_{ts}_{uuid.uuid4().hex[:6]}@example.com",
            "password": "Original123!",
        }
        reg = http.post(f"{API}/auth/register", json=creds)
        assert reg.status_code == 200, reg.text
        try:
            r = http.post(f"{API}/auth/forgot-password", json={"email": creds["email"]})
            assert r.status_code == 200, r.text
            assert r.json().get("message") == self.GENERIC_MSG
        finally:
            mongo_db.users.delete_one({"email": creds["email"].lower()})
            mongo_db.password_resets.delete_many({"email": creds["email"].lower()})


# --- Admin regression: full reset round-trip, then restore password ---------

class TestAdminResetRegression:
    """Reset the admin password, verify it works, then restore via admin_code."""

    NEW_ADMIN_PASSWORD = f"AdminTemp_{uuid.uuid4().hex[:8]}!"

    def test_admin_forgot_password_creates_admin_role_record(self, http, mongo_db):
        r = http.post(f"{API}/auth/forgot-password", json={"email": ADMIN_EMAIL})
        assert r.status_code == 200, r.text

        rec = _read_reset_record(mongo_db, ADMIN_EMAIL)
        assert rec is not None
        assert rec["role"] == "admin", f"Expected role='admin' on admin reset record, got {rec.get('role')!r}"
        assert rec["used"] is False

    def test_admin_reset_password_updates_admin_password_field(self, http, mongo_db):
        rec = _read_reset_record(mongo_db, ADMIN_EMAIL)
        r = _reset_password(http, token=rec["token"], new_password=self.NEW_ADMIN_PASSWORD)
        assert r.status_code == 200, r.text

        user_doc = mongo_db.users.find_one({"email": ADMIN_EMAIL.lower()})
        expected_hash = hashlib.sha256(self.NEW_ADMIN_PASSWORD.encode()).hexdigest()
        assert user_doc["admin_password"] == expected_hash, (
            "admin_password was not updated on admin reset"
        )
        # Role must remain admin
        assert user_doc.get("role") == "admin"

    def test_admin_login_succeeds_with_new_password(self, http):
        r = _admin_login(http, email=ADMIN_EMAIL, password=self.NEW_ADMIN_PASSWORD)
        assert r.status_code == 200, r.text
        assert r.json()["is_admin"] is True

    def test_admin_login_old_password_rejected(self, http):
        r = _admin_login(http, email=ADMIN_EMAIL, password=ORIGINAL_ADMIN_PASSWORD)
        assert r.status_code == 401, r.text

    def test_restore_admin_password_via_admin_code(self, http, mongo_db):
        """Use the ADMIN_SECRET_CODE override on /admin-login to reset the
        admin password back to the canonical Oluwatobi11@. Guards future
        test runs and human admins from being locked out.
        """
        assert ADMIN_SECRET_CODE, "ADMIN_SECRET_CODE missing from /app/backend/.env"
        r = _admin_login(
            http,
            email=ADMIN_EMAIL,
            password=ORIGINAL_ADMIN_PASSWORD,
            admin_code=ADMIN_SECRET_CODE,
        )
        assert r.status_code == 200, r.text

        # Confirm canonical login is back.
        r2 = _admin_login(http, email=ADMIN_EMAIL, password=ORIGINAL_ADMIN_PASSWORD)
        assert r2.status_code == 200, r2.text
        assert r2.json()["is_admin"] is True

        # Verify hash in DB matches the canonical password.
        user_doc = mongo_db.users.find_one({"email": ADMIN_EMAIL.lower()})
        assert user_doc["admin_password"] == hashlib.sha256(
            ORIGINAL_ADMIN_PASSWORD.encode()
        ).hexdigest()
