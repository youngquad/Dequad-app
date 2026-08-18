"""Regression coverage for reciprocal weekly-like exemptions and match celebration response data."""
from __future__ import annotations

import os
import re
import time
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values
from pymongo import MongoClient

FRONTEND_ENV = dotenv_values("/app/frontend/.env")
BACKEND_ENV = dotenv_values("/app/backend/.env")
BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or FRONTEND_ENV.get("REACT_APP_BACKEND_URL") or "").rstrip("/")
if not BASE_URL:
    raise RuntimeError("REACT_APP_BACKEND_URL is missing")

PASSWORD = "TestMatch123!"
RUN_ID = uuid.uuid4().hex[:10]
OTP_LOG = Path("/var/log/supervisor/backend.err.log")
STATE: dict[str, object] = {}


def _week_start_iso() -> str:
    now = datetime.now(timezone.utc)
    return (now - timedelta(days=now.weekday())).strftime("%Y-%m-%d")


def _otp_for(email: str) -> str:
    pattern = re.compile(rf"\[DEV_LOG_OTP\]\s+{re.escape(email)}\s+->\s+(\d{{6}})", re.IGNORECASE)
    for _ in range(20):
        text = OTP_LOG.read_text(encoding="utf-8", errors="replace")
        matches = pattern.findall(text)
        if matches:
            return matches[-1]
        time.sleep(0.25)
    pytest.fail(f"OTP for {email} did not appear in {OTP_LOG}")


def _register_and_verify(label: str) -> dict:
    email = f"test{label}.{RUN_ID}@student.leeds.ac.uk"
    name = f"TEST {label.upper()} {RUN_ID}"
    register = requests.post(
        f"{BASE_URL}/api/auth/register",
        json={"email": email, "password": PASSWORD, "name": name, "confirm_student": True},
        timeout=30,
    )
    assert register.status_code == 200, register.text
    registered = register.json()
    assert registered["email_verification_required"] is True
    assert registered["user"]["email"] == email
    assert registered["user"]["email_verified"] is False

    verify = requests.post(
        f"{BASE_URL}/api/auth/verify-email",
        json={"email": email, "code": _otp_for(email)},
        timeout=30,
    )
    assert verify.status_code == 200, verify.text
    body = verify.json()
    assert body["email_verified"] is True
    assert body["user"]["email"] == email
    assert isinstance(body["session_token"], str) and body["session_token"]
    return {
        "email": email,
        "name": name,
        "user_id": body["user"]["user_id"],
        "token": body["session_token"],
    }


def _session(account: dict) -> requests.Session:
    session = requests.Session()
    session.headers.update({
        "Authorization": f"Bearer {account['token']}",
        "Content-Type": "application/json",
    })
    return session


@pytest.fixture(scope="session")
def matching_setup():
    client = MongoClient(BACKEND_ENV["MONGO_URL"])
    db = client[BACKEND_ENV["DB_NAME"]]
    accounts: dict[str, dict] = {}
    try:
        for label in ("a", "b", "c"):
            accounts[label] = _register_and_verify(label)

        # Compatible complete profiles so A and B are eligible for each other's UI deck.
        shared = {
            "university": "University of Leeds",
            "university_location": "Leeds, UK",
            "course": "Computer Science",
            "age": 21,
            "study_style": "visual",
            "bio": f"TEST matching profile {RUN_ID}",
            "interests": ["Programming", "Music"],
            "interested_in": ["everyone"],
        }
        genders = {"a": "woman", "b": "man", "c": "non-binary"}
        for label, account in accounts.items():
            response = _session(account).put(
                f"{BASE_URL}/api/profile", json={**shared, "gender": genders[label]}, timeout=20
            )
            assert response.status_code == 200, response.text
            assert response.json()["university"] == shared["university"]

        STATE["accounts"] = accounts
        STATE["db"] = db
        yield accounts, db
    finally:
        user_ids = [a["user_id"] for a in accounts.values()]
        emails = [a["email"] for a in accounts.values()]
        if user_ids:
            db.matches.delete_many({"$or": [{"user_id": {"$in": user_ids}}, {"matched_user_id": {"$in": user_ids}}]})
            db.chat_messages.delete_many({"$or": [{"sender_id": {"$in": user_ids}}, {"recipient_id": {"$in": user_ids}}]})
            db.notifications.delete_many({"user_id": {"$in": user_ids}})
            db.user_sessions.delete_many({"user_id": {"$in": user_ids}})
            db.users.delete_many({"user_id": {"$in": user_ids}})
        if emails:
            db.email_verifications.delete_many({"email": {"$in": emails}})
        client.close()


# Fresh likes spend one weekly allowance and status/likes endpoints report the budget.
def test_normal_like_increments_weekly_counter_and_status(matching_setup):
    accounts, db = matching_setup
    b, a = accounts["b"], accounts["a"]
    response = _session(b).post(
        f"{BASE_URL}/api/matches/swipe",
        json={"target_user_id": a["user_id"], "action": "like"},
        timeout=20,
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["is_mutual"] is False
    assert body["matched_user"] is None
    assert body["match"]["user_id"] == b["user_id"]
    assert body["match"]["matched_user_id"] == a["user_id"]
    assert body["remaining_likes_this_week"] == 2

    b_doc = db.users.find_one({"user_id": b["user_id"]})
    assert b_doc["likes_this_week"] == 1
    assert b_doc["last_like_week"] == _week_start_iso()

    status = _session(b).get(f"{BASE_URL}/api/subscription/status", timeout=20)
    assert status.status_code == 200, status.text
    status_body = status.json()
    assert status_body["likes_this_week"] == 1
    assert status_body["remaining_likes_this_week"] == 2
    assert status_body["remaining_swipes"] == 2

    likes = _session(a).get(f"{BASE_URL}/api/matches/likes-received", timeout=20)
    assert likes.status_code == 200, likes.text
    assert any(row["user"]["user_id"] == b["user_id"] for row in likes.json())


# Free users at the cap cannot spend a fourth non-reciprocal like.
def test_non_reciprocal_like_at_weekly_limit_is_structured_403(matching_setup):
    accounts, db = matching_setup
    a, c = accounts["a"], accounts["c"]
    db.users.update_one(
        {"user_id": a["user_id"]},
        {"$set": {"plan": "free", "likes_this_week": 3, "last_like_week": _week_start_iso()}},
    )
    response = _session(a).post(
        f"{BASE_URL}/api/matches/swipe",
        json={"target_user_id": c["user_id"], "action": "like"},
        timeout=20,
    )
    assert response.status_code == 403, response.text
    detail = response.json()["detail"]
    assert detail["message"] == "Weekly like limit reached"
    assert detail["upgrade_required"] is True
    assert detail["limit"] == 3
    assert db.matches.count_documents({"user_id": a["user_id"], "matched_user_id": c["user_id"]}) == 0
    assert db.users.find_one({"user_id": a["user_id"]})["likes_this_week"] == 3


# Dislikes remain unlimited even when the weekly like allowance is exhausted.


# Reciprocal likes below the cap must not make the response budget diverge from persisted status.
def test_reciprocal_like_under_limit_reports_unchanged_budget(matching_setup):
    accounts, db = matching_setup
    b, c = accounts["b"], accounts["c"]
    c_like = _session(c).post(
        f"{BASE_URL}/api/matches/swipe",
        json={"target_user_id": b["user_id"], "action": "like"},
        timeout=20,
    )
    assert c_like.status_code == 200, c_like.text
    assert c_like.json()["remaining_likes_this_week"] == 2

    reciprocal = _session(b).post(
        f"{BASE_URL}/api/matches/swipe",
        json={"target_user_id": c["user_id"], "action": "like"},
        timeout=20,
    )
    assert reciprocal.status_code == 200, reciprocal.text
    body = reciprocal.json()
    assert body["is_mutual"] is True
    assert db.users.find_one({"user_id": b["user_id"]})["likes_this_week"] == 1
    assert body["remaining_likes_this_week"] == 2

    status = _session(b).get(f"{BASE_URL}/api/subscription/status", timeout=20)
    assert status.status_code == 200, status.text
    assert status.json()["remaining_likes_this_week"] == 2

def test_dislike_at_weekly_limit_succeeds_without_increment(matching_setup):
    accounts, db = matching_setup
    a, c = accounts["a"], accounts["c"]
    response = _session(a).post(
        f"{BASE_URL}/api/matches/swipe",
        json={"target_user_id": c["user_id"], "action": "dislike"},
        timeout=20,
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["match"]["status"] == "rejected"
    assert body["is_mutual"] is False
    assert db.users.find_one({"user_id": a["user_id"]})["likes_this_week"] == 3


# Reciprocal likes bypass the cap and return all data needed by the celebration UI.
def test_reciprocal_like_at_limit_creates_mutual_match_without_increment(matching_setup):
    accounts, db = matching_setup
    a, b = accounts["a"], accounts["b"]
    response = _session(a).post(
        f"{BASE_URL}/api/matches/swipe",
        json={"target_user_id": b["user_id"], "action": "like", "liked_section": "photo"},
        timeout=20,
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["is_mutual"] is True
    assert body["matched_user"]["user_id"] == b["user_id"]
    assert body["matched_user"]["name"] == b["name"]
    assert isinstance(body["match"]["id"], str) and body["match"]["id"]
    assert body["match"]["status"] == "liked"  # response is the inserted pre-update model
    assert body["remaining_likes_this_week"] == 0

    assert db.users.find_one({"user_id": a["user_id"]})["likes_this_week"] == 3
    rows = list(db.matches.find({
        "$or": [
            {"user_id": a["user_id"], "matched_user_id": b["user_id"]},
            {"user_id": b["user_id"], "matched_user_id": a["user_id"]},
        ]
    }))
    assert len(rows) == 2
    assert all(row["status"] == "accepted" for row in rows)

    accepted = _session(a).get(f"{BASE_URL}/api/matches/accepted", timeout=20)
    assert accepted.status_code == 200, accepted.text
    accepted_row = next(row for row in accepted.json() if row["user"]["user_id"] == b["user_id"])
    assert isinstance(accepted_row["match_id"], str) and accepted_row["match_id"]

    status = _session(a).get(f"{BASE_URL}/api/subscription/status", timeout=20)
    assert status.status_code == 200, status.text
    assert status.json()["likes_this_week"] == 3
    assert status.json()["remaining_likes_this_week"] == 0
