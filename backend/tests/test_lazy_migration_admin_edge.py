"""Iteration_12 stress test: admin doc with BOTH admin_password (legacy SHA-256)
AND password_hash (bcrypt) — a real-world scenario for a user who's an admin
but was previously a student. Ensures admin-login lazy-migrates admin_password
to bcrypt WITHOUT touching password_hash.

Runs directly against MongoDB + preview URL, restores state at teardown.
"""
from __future__ import annotations
import os, hashlib, asyncio, requests, pytest
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import dotenv_values

_backend_env = dotenv_values("/app/backend/.env")
_frontend_env = dotenv_values("/app/frontend/.env")

API_URL = (os.environ.get("REACT_APP_BACKEND_URL") or _frontend_env["REACT_APP_BACKEND_URL"]).rstrip("/")
MONGO_URL = os.environ.get("MONGO_URL") or _backend_env["MONGO_URL"]
DB_NAME = os.environ.get("DB_NAME") or _backend_env["DB_NAME"]

ADMIN_EMAIL = "quadri.yusuf@dequad.com"
ADMIN_PASSWORD = "Oluwatobi11@"
ADMIN_CODE = "DEQUAD_ADMIN_2024"


def _sha256(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


async def _run():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    original = await db.users.find_one({"email": ADMIN_EMAIL}, {"_id": 0})
    assert original, "admin account missing"
    orig_admin_pw = original.get("admin_password")
    orig_pw_hash = original.get("password_hash")

    try:
        # Force the "both fields present, admin_password is legacy SHA-256" state.
        legacy_admin = _sha256(ADMIN_PASSWORD)
        synthetic_bcrypt_ph = "$2b$12$" + "a" * 53  # placeholder we must NOT touch
        # Use a real bcrypt hash if available so we can prove non-mutation.
        if orig_pw_hash and orig_pw_hash.startswith("$2b$"):
            synthetic_bcrypt_ph = orig_pw_hash
        await db.users.update_one(
            {"email": ADMIN_EMAIL},
            {"$set": {"admin_password": legacy_admin, "password_hash": synthetic_bcrypt_ph}},
        )

        # (1) admin-login — must succeed
        r = requests.post(
            f"{API_URL}/api/auth/admin-login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD, "admin_code": "wrong-so-no-reset"},
            timeout=15,
        )
        assert r.status_code == 200, f"first admin-login failed: {r.status_code} {r.text}"

        # (2) Inspect DB
        doc = await db.users.find_one({"email": ADMIN_EMAIL}, {"_id": 0})
        assert doc["admin_password"].startswith("$2b$"), \
            f"admin_password not lazy-migrated to bcrypt: {doc['admin_password'][:10]!r}"
        assert doc["password_hash"] == synthetic_bcrypt_ph, \
            "password_hash was mutated by admin_login (must be untouched)"

        # (3) admin-login again — must still succeed on the freshly-migrated bcrypt
        r2 = requests.post(
            f"{API_URL}/api/auth/admin-login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD, "admin_code": "wrong-so-no-reset"},
            timeout=15,
        )
        assert r2.status_code == 200, f"second admin-login failed: {r2.status_code} {r2.text}"
    finally:
        # Restore
        restore = {}
        if orig_admin_pw is not None:
            restore["admin_password"] = orig_admin_pw
        if orig_pw_hash is not None:
            restore["password_hash"] = orig_pw_hash
        if restore:
            await db.users.update_one({"email": ADMIN_EMAIL}, {"$set": restore})
        client.close()


def test_admin_login_lazy_migrates_admin_password_when_both_hashes_present():
    asyncio.run(_run())
