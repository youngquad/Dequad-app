"""Regression tests for low-rating alerts, admin analytics/exports, and auth safeguards."""
from __future__ import annotations

import csv
import io
import os
import re
import uuid
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

CREDS_PATH = Path("/app/memory/test_credentials.md")
RUN_MARKER = f"TEST_ALERTS_{uuid.uuid4().hex[:10]}"
STATE: dict[str, object] = {}


def _credential(pattern: str) -> str:
    content = CREDS_PATH.read_text(encoding="utf-8")
    match = re.search(pattern, content, re.MULTILINE | re.IGNORECASE)
    if not match:
        pytest.skip(f"Credential matching {pattern!r} is missing")
    return match.group(1).strip().strip("`")


@pytest.fixture(scope="session")
def student_credentials() -> dict[str, str]:
    return {
        "email": _credential(r"^\s*- Email:\s*(ui\.tester@student\.beds\.ac\.uk)\s*$"),
        "password": _credential(r"^\s*- Password:\s*(UiTester123!)\s*$"),
    }


@pytest.fixture(scope="session")
def admin_credentials() -> dict[str, str]:
    content = CREDS_PATH.read_text(encoding="utf-8")
    section = content.split("## Admin (Platform owner)", 1)[1].split("##", 1)[0]
    values = {}
    for key, pattern in {
        "email": r"- Email:\s*([^\s]+)",
        "password": r"- Password:\s*([^\s]+)",
        "admin_code": r"- Admin code.*?`([^`]+)`",
    }.items():
        match = re.search(pattern, section)
        if not match:
            pytest.skip(f"Admin {key} is missing from test_credentials.md")
        values[key] = match.group(1).strip().strip("`")
    return values


@pytest.fixture(scope="session")
def db():
    mongo_url = BACKEND_ENV.get("MONGO_URL")
    db_name = BACKEND_ENV.get("DB_NAME")
    if not mongo_url or not db_name:
        pytest.skip("MONGO_URL or DB_NAME missing")
    client = MongoClient(mongo_url)
    database = client[db_name]
    yield database
    # Remove only records created by this test run.
    database.safeguarding_alerts.delete_many({"content": {"$regex": RUN_MARKER}})
    database.mood_entries.delete_many({"notes": {"$regex": RUN_MARKER}})
    feedback_docs = list(database.feedback_entries.find({"feedback": {"$regex": RUN_MARKER}}, {"id": 1}))
    database.feedback_entries.delete_many({"feedback": {"$regex": RUN_MARKER}})
    # risk_scores have no entry id/marker; remove only scores created in this run for the test user.
    if STATE.get("student_user_id") and feedback_docs:
        database.risk_scores.delete_many({
            "user_id": STATE["student_user_id"],
            "risk_score": {"$in": [20, 70]},
        })
    client.close()


@pytest.fixture(scope="session")
def student_session(student_credentials):
    session = requests.Session()
    response = session.post(
        f"{BASE_URL}/api/auth/email-login", json=student_credentials, timeout=20
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert isinstance(body.get("session_token"), str) and body["session_token"]
    assert body.get("user", {}).get("email") == student_credentials["email"]
    STATE["student_user_id"] = body["user"]["user_id"]
    STATE["student_name"] = body["user"]["name"]
    STATE["student_email"] = body["user"]["email"]
    STATE["student_university"] = body["user"].get("university")
    session.headers.update({"Authorization": f"Bearer {body['session_token']}"})
    return session


@pytest.fixture(scope="session")
def admin_session(admin_credentials):
    session = requests.Session()
    response = session.post(
        f"{BASE_URL}/api/auth/admin-login", json=admin_credentials, timeout=20
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body.get("is_admin") is True
    assert body.get("user", {}).get("role") == "admin"
    assert isinstance(body.get("session_token"), str) and body["session_token"]
    session.headers.update({"Authorization": f"Bearer {body['session_token']}"})
    return session


# Low mood alert and normal mood negative control.
def test_low_mood_creates_identified_alert(student_session, admin_session, db):
    notes = f"feeling a bit tired today {RUN_MARKER}_LOW_MOOD"
    response = student_session.post(
        f"{BASE_URL}/api/mood", json={"mood": 3, "notes": notes}, timeout=20
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["mood"] == 3 and body["notes"] == notes

    alert = db.safeguarding_alerts.find_one({"content": {"$regex": f"{RUN_MARKER}_LOW_MOOD"}}, {"_id": 0})
    assert alert is not None
    assert alert["source"] == "low_mood"
    assert alert["risk_level"] == "low"
    assert alert["user_name"] == STATE["student_name"]
    assert alert["user_email"] == STATE["student_email"]
    assert "Mood rating: 3/10" in alert["content"] and notes in alert["content"]
    STATE["low_mood_alert_id"] = alert["alert_id"]

    admin_response = admin_session.get(f"{BASE_URL}/api/admin/safeguarding-alerts", timeout=20)
    assert admin_response.status_code == 200, admin_response.text
    listed = next(a for a in admin_response.json()["alerts"] if a["alert_id"] == alert["alert_id"])
    assert listed["user_name"] == STATE["student_name"]
    assert listed["user_email"] == STATE["student_email"]


def test_normal_mood_does_not_create_low_mood_alert(student_session, db):
    notes = f"feeling steady today {RUN_MARKER}_NORMAL_MOOD"
    response = student_session.post(
        f"{BASE_URL}/api/mood", json={"mood": 7, "notes": notes}, timeout=20
    )
    assert response.status_code == 200, response.text
    assert response.json()["mood"] == 7
    assert db.safeguarding_alerts.count_documents({"content": {"$regex": f"{RUN_MARKER}_NORMAL_MOOD"}}) == 0


# Anonymous low lecture rating alert and normal rating negative control.
def test_low_feedback_creates_anonymous_alert(student_session, admin_session, db):
    feedback = f"The pacing was difficult to follow {RUN_MARKER}_LOW_FEEDBACK"
    topic = "TEST Quantum revision"
    response = student_session.post(
        f"{BASE_URL}/api/feedback",
        json={"mood": 2, "feedback": feedback, "lecture_topic": topic},
        timeout=20,
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["mood"] == 2 and body["feedback"] == feedback and body["lecture_topic"] == topic

    alert = db.safeguarding_alerts.find_one({"content": {"$regex": f"{RUN_MARKER}_LOW_FEEDBACK"}}, {"_id": 0})
    assert alert is not None
    assert alert["source"] == "low_lecture_rating"
    assert alert["risk_level"] == "low"
    assert alert["user_name"] == "Anonymous Student"
    assert alert["user_email"] == "anonymous"
    assert "Rating: 2/10" in alert["content"] and topic in alert["content"] and feedback in alert["content"]
    STATE["low_feedback_alert_id"] = alert["alert_id"]

    admin_response = admin_session.get(f"{BASE_URL}/api/admin/safeguarding-alerts", timeout=20)
    assert admin_response.status_code == 200, admin_response.text
    listed = next(a for a in admin_response.json()["alerts"] if a["alert_id"] == alert["alert_id"])
    assert listed["user_name"] == "Anonymous Student" and listed["user_email"] == "anonymous"


def test_normal_feedback_does_not_create_low_rating_alert(student_session, db):
    feedback = f"Clear and useful session {RUN_MARKER}_NORMAL_FEEDBACK"
    response = student_session.post(
        f"{BASE_URL}/api/feedback",
        json={"mood": 8, "feedback": feedback, "lecture_topic": "TEST Seminar"},
        timeout=20,
    )
    assert response.status_code == 200, response.text
    assert response.json()["mood"] == 8
    assert db.safeguarding_alerts.count_documents({"content": {"$regex": f"{RUN_MARKER}_NORMAL_FEEDBACK"}}) == 0


def test_acknowledge_new_alerts(admin_session, db):
    for key in ("low_mood_alert_id", "low_feedback_alert_id"):
        alert_id = STATE[key]
        response = admin_session.post(
            f"{BASE_URL}/api/admin/safeguarding-alerts/{alert_id}/acknowledge", json={}, timeout=20
        )
        assert response.status_code == 200, response.text
        assert response.json() == {"message": "Alert acknowledged", "alert_id": alert_id}
        assert db.safeguarding_alerts.find_one({"alert_id": alert_id})["acknowledged"] is True


# Growth analytics and feedback-history CSV university filter.
def test_growth_analytics_shape(admin_session):
    response = admin_session.get(f"{BASE_URL}/api/admin/growth-analytics", timeout=40)
    assert response.status_code == 200, response.text
    body = response.json()
    assert isinstance(body["total_real_students"], int)
    assert len(body["dau_series"]) == 30 and len(body["signup_series"]) == 30
    assert set(body["retention"]) == {"d1", "d7", "d30"}
    assert set(body["mood_completion"]) >= {"last_7d_users", "last_30d_users"}
    assert set(body["engagement"]) == {"total_matches_accepted", "matches_last_7d", "chat_messages_last_7d"}


def test_feedback_export_unfiltered_and_filtered(admin_session, db):
    # Temporarily attribute the UI test account to a synthetic university, then
    # restore the exact prior value. This avoids depending on seeded feedback.
    user_id = STATE["student_user_id"]
    original = db.users.find_one({"user_id": user_id}, {"university": 1})
    represented = f"TEST University {RUN_MARKER}"
    db.users.update_one({"user_id": user_id}, {"$set": {"university": represented}})
    try:
        unfiltered = admin_session.get(f"{BASE_URL}/api/admin/export/feedback-history", timeout=30)
        assert unfiltered.status_code == 200, unfiltered.text
        assert "text/csv" in unfiltered.headers.get("content-type", "")
        all_rows = list(csv.DictReader(io.StringIO(unfiltered.text)))
        assert any(RUN_MARKER in row["feedback"] for row in all_rows)

        filtered = admin_session.get(
            f"{BASE_URL}/api/admin/export/feedback-history", params={"university": represented}, timeout=30
        )
        assert filtered.status_code == 200, filtered.text
        filtered_rows = list(csv.DictReader(io.StringIO(filtered.text)))
        assert filtered_rows
        assert any(RUN_MARKER in row["feedback"] for row in filtered_rows)
        assert all(row["university"].casefold() == represented.casefold() for row in filtered_rows)
        assert len(all_rows) >= len(filtered_rows)
    finally:
        if original and "university" in original:
            db.users.update_one({"user_id": user_id}, {"$set": {"university": original["university"]}})
        else:
            db.users.update_one({"user_id": user_id}, {"$unset": {"university": ""}})


# Regression: histories contain both newly submitted records.
def test_student_mood_and_feedback_histories(student_session):
    mood_response = student_session.get(f"{BASE_URL}/api/mood", timeout=20)
    assert mood_response.status_code == 200, mood_response.text
    moods = mood_response.json()
    assert any(RUN_MARKER in (row.get("notes") or "") and row["mood"] == 3 for row in moods)
    assert any(RUN_MARKER in (row.get("notes") or "") and row["mood"] == 7 for row in moods)

    feedback_response = student_session.get(f"{BASE_URL}/api/feedback", timeout=20)
    assert feedback_response.status_code == 200, feedback_response.text
    entries = feedback_response.json()
    assert any(RUN_MARKER in row["feedback"] and row["mood"] == 2 for row in entries)
    assert any(RUN_MARKER in row["feedback"] and row["mood"] == 8 for row in entries)


# Auth playbook checks that are safe and non-destructive.
def test_student_login_sets_secure_httponly_cookie(student_credentials):
    response = requests.post(f"{BASE_URL}/api/auth/email-login", json=student_credentials, timeout=20)
    assert response.status_code == 200, response.text
    cookie = response.headers.get("set-cookie", "").lower()
    assert "session_token=" in cookie
    assert "httponly" in cookie and "secure" in cookie and "samesite=none" in cookie


def test_password_hash_is_bcrypt(db, student_credentials):
    user = db.users.find_one({"email": student_credentials["email"]})
    assert isinstance(user.get("password_hash"), str)
    assert user["password_hash"].startswith("$2b$")



def test_admin_login_sets_secure_httponly_cookie(admin_credentials):
    response = requests.post(f"{BASE_URL}/api/auth/admin-login", json=admin_credentials, timeout=20)
    assert response.status_code == 200, response.text
    cookie = response.headers.get("set-cookie", "").lower()
    assert "session_token=" in cookie
    assert "httponly" in cookie and "secure" in cookie and "samesite=none" in cookie


def test_cors_uses_explicit_allowed_origin(student_credentials):
    response = requests.post(
        f"{BASE_URL}/api/auth/email-login",
        headers={"Origin": BASE_URL},
        json=student_credentials,
        timeout=20,
    )
    assert response.status_code == 200, response.text
    assert response.headers.get("access-control-allow-origin") == BASE_URL


def test_bruteforce_lockout_after_five_failures():
    bogus = {"email": f"{RUN_MARKER.lower()}@student.beds.ac.uk", "password": "WrongPassword123!"}
    statuses = []
    for _ in range(6):
        response = requests.post(f"{BASE_URL}/api/auth/email-login", json=bogus, timeout=20)
        statuses.append(response.status_code)
    assert statuses[:5] == [401] * 5
    assert statuses[5] == 429, f"Expected lockout after 5 failures, got statuses {statuses}"
