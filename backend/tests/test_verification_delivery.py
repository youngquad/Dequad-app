# OTP email delivery-status feature: /api/auth/verification-delivery + register + resend cooldown + forgot-password regression
import os
import time
import uuid
import pytest
import requests
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv("/app/frontend/.env")
load_dotenv("/app/backend/.env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
mdb = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]

RID = uuid.uuid4().hex[:8]
BOUNCE_EMAIL = f"qa.bounce.{RID}@beds.ac.uk"
SENT_EMAIL = f"qa.sent.{RID}@student.leeds.ac.uk"


def _register(email):
    return requests.post(f"{API}/auth/register", json={
        "email": email, "password": "QaTest123!", "name": "QA Test", "confirm_student": True,
    }, timeout=30)


def _delivery(email):
    return requests.get(f"{API}/auth/verification-delivery", params={"email": email}, timeout=30)


@pytest.fixture(scope="module", autouse=True)
def cleanup():
    yield
    mdb.users.delete_many({"email": {"$in": [BOUNCE_EMAIL, SENT_EMAIL]}})
    mdb.email_verifications.delete_many({"email": {"$in": [BOUNCE_EMAIL, SENT_EMAIL]}})


# Unknown email returns neutral response
def test_unknown_email_delivery():
    r = _delivery("does.not.exist@nowhere.ac.uk")
    assert r.status_code == 200
    assert r.json() == {"status": "unknown", "deliverable": True, "message": None}


# Missing email param -> 422
def test_missing_email_param():
    r = requests.get(f"{API}/auth/verification-delivery", timeout=30)
    assert r.status_code == 422


# Register fake beds.ac.uk -> bounce detected
def test_register_bounce_flow():
    r = _register(BOUNCE_EMAIL)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d.get("email_verification_required") is True
    assert d.get("email_verification_sent") is True
    rec = mdb.email_verifications.find_one({"email": BOUNCE_EMAIL})
    assert rec and isinstance(rec.get("provider_email_id"), str) and rec["provider_email_id"]
    assert rec.get("send_failed") is False
    final = None
    seen = []
    for _ in range(9):
        time.sleep(5)
        j = _delivery(BOUNCE_EMAIL).json()
        seen.append(j["status"])
        if j["status"] == "bounced":
            final = j
            break
    print("statuses seen:", seen)
    assert final, f"never bounced: {seen}"
    assert final["deliverable"] is False
    assert "mail server rejected" in final["message"]
    rec = mdb.email_verifications.find_one({"email": BOUNCE_EMAIL})
    assert rec["delivery_status"] == "bounced"
    print("delivery_detail:", rec.get("delivery_detail"))


# Case-insensitive email lookup
def test_delivery_case_insensitive():
    j = _delivery(BOUNCE_EMAIL.upper()).json()
    assert j["status"] == "bounced"


# Register non-bouncing address -> sent/delivered, never bounced in 20s
def test_register_sent_flow():
    r = _register(SENT_EMAIL)
    assert r.status_code == 200, r.text
    assert r.json().get("email_verification_sent") is True
    seen = []
    for _ in range(4):
        time.sleep(5)
        j = _delivery(SENT_EMAIL).json()
        seen.append(j["status"])
        assert j["deliverable"] is True, j
    print("statuses seen:", seen)
    assert seen[-1] in ("sent", "delivered", "delivery_delayed")


# Resend cooldown enforced
def test_resend_cooldown():
    r = requests.post(f"{API}/auth/resend-verification", json={"email": SENT_EMAIL}, timeout=30)
    assert r.status_code == 200
    j = r.json()
    assert j["sent"] is False and isinstance(j["cooldown_seconds"], int) and j["cooldown_seconds"] > 0


# Forgot-password regression
def test_forgot_password_ok():
    r = requests.post(f"{API}/auth/forgot-password", json={"email": SENT_EMAIL}, timeout=30)
    assert r.status_code == 200
    assert "reset link" in r.json()["message"]


# Login regression
def test_login_existing():
    r = requests.post(f"{API}/auth/email-login", json={"email": "ui.tester@student.beds.ac.uk", "password": "UiTester123!"}, timeout=30)
    assert r.status_code == 200, r.text
    assert r.json()["user"]["email"] == "ui.tester@student.beds.ac.uk"
