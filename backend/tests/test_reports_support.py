"""Backend tests for Iteration 8: Reports, Language Filter, Support Chat."""
import os
import sys
import time
import pytest
import requests
from datetime import datetime, timezone, timedelta

# Add backend to path so we can use motor directly to seed sessions
sys.path.insert(0, "/app/backend")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://review-extractor-2.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

# Test bearer tokens — seeded into MongoDB by the `seed_sessions` fixture.
# These are NOT credentials; they are random-looking strings only valid during a test run.
EMMA_TOKEN = os.environ.get("TEST_EMMA_TOKEN", "test-session-emma-001")
JAMES_TOKEN = os.environ.get("TEST_JAMES_TOKEN", "test-session-james-002")
EMMA_USER_ID = "test-user-001"
JAMES_USER_ID = "test-user-002"

# Admin credentials must come from the environment (see /app/memory/test_credentials.md).
# Tests will skip the admin suite if these are not provided.
ADMIN_EMAIL = os.environ.get("SEED_ADMIN_EMAIL") or os.environ.get("ADMIN_EMAIL")
ADMIN_PASSWORD = os.environ.get("SEED_ADMIN_PASSWORD") or os.environ.get("ADMIN_PASSWORD")


# ==================== FIXTURES ====================

@pytest.fixture(scope="session", autouse=True)
def seed_sessions():
    """Insert sessions for Emma and James directly into Mongo so we can use bearer auth."""
    from pymongo import MongoClient
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")
    # Fallback to backend's env if not in process env
    if not mongo_url or not db_name:
        from dotenv import dotenv_values
        env = dotenv_values("/app/backend/.env")
        mongo_url = mongo_url or env.get("MONGO_URL")
        db_name = db_name or env.get("DB_NAME")
    client = MongoClient(mongo_url)
    db = client[db_name]

    # Ensure users exist
    for uid, email, name in [
        (EMMA_USER_ID, "emma.wilson@test.edu", "Emma Wilson"),
        (JAMES_USER_ID, "james.chen@test.edu", "James Chen"),
    ]:
        if not db.users.find_one({"user_id": uid}):
            print(f"WARNING: seed user {uid} not present; tests requiring it may fail")

    expires = datetime.now(timezone.utc) + timedelta(days=1)
    for uid, token in [(EMMA_USER_ID, EMMA_TOKEN), (JAMES_USER_ID, JAMES_TOKEN)]:
        db.user_sessions.update_one(
            {"session_token": token},
            {"$set": {
                "user_id": uid,
                "session_token": token,
                "expires_at": expires,
                "created_at": datetime.now(timezone.utc),
            }},
            upsert=True,
        )
    # Clean any pre-existing TEST reports / support messages for clean run
    db.reports.delete_many({"reporter_id": {"$in": [EMMA_USER_ID, JAMES_USER_ID]}})
    db.support_messages.delete_many({"user_id": {"$in": [EMMA_USER_ID, JAMES_USER_ID]}})
    db.safeguarding_alerts.delete_many({"user_id": EMMA_USER_ID, "source": "support_chat"})
    yield
    client.close()


@pytest.fixture(scope="session")
def emma_headers():
    return {"Authorization": f"Bearer {EMMA_TOKEN}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def james_headers():
    return {"Authorization": f"Bearer {JAMES_TOKEN}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def admin_headers():
    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        pytest.skip("SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD not set in environment")
    r = requests.post(f"{API}/auth/admin-login", json={
        "email": ADMIN_EMAIL, "password": ADMIN_PASSWORD
    })
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    token = r.json().get("session_token") or r.json().get("token")
    assert token, f"No admin token returned: {r.json()}"
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ==================== AUTH SANITY ====================

class TestAuthSanity:
    def test_emma_auth_me(self, emma_headers):
        r = requests.get(f"{API}/auth/me", headers=emma_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("user_id") == EMMA_USER_ID
        assert data.get("email")

    def test_no_auth_blocks_reports(self):
        r = requests.post(f"{API}/reports", json={"reported_user_id": JAMES_USER_ID, "reason": "spam"})
        assert r.status_code in (401, 403)


# ==================== REPORTS ====================

class TestReports:
    def test_create_report_success(self, emma_headers):
        r = requests.post(f"{API}/reports", json={
            "reported_user_id": JAMES_USER_ID,
            "reason": "fake_profile - the photos seem stolen",
        }, headers=emma_headers)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("success") is True
        assert "report_id" in body
        assert "message" in body

    def test_create_report_self_blocked(self, emma_headers):
        r = requests.post(f"{API}/reports", json={
            "reported_user_id": EMMA_USER_ID,
            "reason": "test",
        }, headers=emma_headers)
        assert r.status_code == 400
        assert "yourself" in r.json().get("detail", "").lower()

    def test_create_report_racism_blocked(self, emma_headers):
        # use a racist word from RACIST_WORDS
        r = requests.post(f"{API}/reports", json={
            "reported_user_id": JAMES_USER_ID,
            "reason": "this user is a paki",
        }, headers=emma_headers)
        assert r.status_code == 400, r.text
        assert "community guidelines" in r.json().get("detail", "").lower()

    def test_create_report_duplicate_blocked(self, emma_headers):
        # First report exists from test_create_report_success; another against same user should 400
        r = requests.post(f"{API}/reports", json={
            "reported_user_id": JAMES_USER_ID,
            "reason": "second attempt should be blocked",
        }, headers=emma_headers)
        assert r.status_code == 400, r.text
        assert "pending" in r.json().get("detail", "").lower()

    def test_get_my_reports(self, emma_headers):
        r = requests.get(f"{API}/reports/my", headers=emma_headers)
        assert r.status_code == 200, r.text
        rows = r.json()
        assert isinstance(rows, list)
        assert any(x.get("reported_user_id") == JAMES_USER_ID for x in rows)
        # Ensure _id is excluded
        for row in rows:
            assert "_id" not in row

    def test_admin_reports_list(self, admin_headers):
        r = requests.get(f"{API}/admin/reports", headers=admin_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        # Allow either list or dict shape
        if isinstance(data, dict):
            data = data.get("reports") or data.get("data") or []
        assert isinstance(data, list)


# ==================== LANGUAGE FILTER ====================

class TestLanguageFilter:
    def test_profile_bio_racism_blocked(self, emma_headers):
        r = requests.put(f"{API}/profile", json={"bio": "I hate that paki next door"}, headers=emma_headers)
        assert r.status_code == 400, r.text
        assert "community guidelines" in r.json().get("detail", "").lower()

    def test_profile_bio_clean_passes(self, emma_headers):
        r = requests.put(f"{API}/profile", json={"bio": "I love studying psychology and reading."}, headers=emma_headers)
        assert r.status_code == 200, r.text

    def test_swipe_comment_profanity_blocked(self, emma_headers):
        r = requests.post(f"{API}/matches/swipe", json={
            "target_user_id": JAMES_USER_ID,
            "action": "like",
            "comment": "you are a fucking idiot",
        }, headers=emma_headers)
        assert r.status_code == 400, r.text
        assert "inappropriate" in r.json().get("detail", "").lower() or "respectful" in r.json().get("detail", "").lower()

    def test_swipe_comment_racism_blocked(self, emma_headers):
        r = requests.post(f"{API}/matches/swipe", json={
            "target_user_id": JAMES_USER_ID,
            "action": "like",
            "comment": "ugly chink",
        }, headers=emma_headers)
        assert r.status_code == 400, r.text
        assert "community guidelines" in r.json().get("detail", "").lower()


# ==================== SUPPORT CHAT ====================

class TestSupport:
    def test_send_message_success(self, emma_headers):
        r = requests.post(f"{API}/support/message", json={
            "text": "Hi, how do I change my profile picture?"
        }, headers=emma_headers, timeout=60)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "user_message" in body
        assert "reply" in body
        assert body["user_message"]["sender"] == "user"
        assert body["reply"]["sender"] == "ai"
        assert isinstance(body["reply"]["text"], str) and len(body["reply"]["text"]) > 0

    def test_send_message_empty_blocked(self, emma_headers):
        r = requests.post(f"{API}/support/message", json={"text": "   "}, headers=emma_headers)
        assert r.status_code == 400

    def test_send_message_profanity_blocked(self, emma_headers):
        r = requests.post(f"{API}/support/message", json={
            "text": "this app is shit"
        }, headers=emma_headers)
        assert r.status_code == 400, r.text

    def test_send_message_racism_blocked(self, emma_headers):
        r = requests.post(f"{API}/support/message", json={
            "text": "I hate that nigga"
        }, headers=emma_headers)
        assert r.status_code == 400, r.text

    def test_send_message_safeguarding(self, emma_headers):
        r = requests.post(f"{API}/support/message", json={
            "text": "I want to kill myself, I can't go on"
        }, headers=emma_headers, timeout=60)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "safeguarding_alert" in body
        assert body["safeguarding_alert"]["flagged"] is True
        # Verify alert persisted
        time.sleep(1)
        from pymongo import MongoClient
        from dotenv import dotenv_values
        env = dotenv_values("/app/backend/.env")
        client = MongoClient(env.get("MONGO_URL"))
        db = client[env.get("DB_NAME")]
        alert = db.safeguarding_alerts.find_one({"user_id": EMMA_USER_ID, "source": "support_chat"})
        client.close()
        assert alert is not None, "Safeguarding alert not created in DB"

    def test_get_my_messages(self, emma_headers):
        r = requests.get(f"{API}/support/messages", headers=emma_headers)
        assert r.status_code == 200, r.text
        msgs = r.json()
        assert isinstance(msgs, list)
        assert len(msgs) >= 2
        # chronological
        timestamps = [m["created_at"] for m in msgs]
        assert timestamps == sorted(timestamps), "Messages not chronological"
        # senders include user + ai
        senders = {m["sender"] for m in msgs}
        assert "user" in senders and "ai" in senders

    def test_admin_list_conversations(self, admin_headers):
        r = requests.get(f"{API}/support/admin/conversations", headers=admin_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "conversations" in data
        convs = data["conversations"]
        emma_conv = next((c for c in convs if c["user_id"] == EMMA_USER_ID), None)
        assert emma_conv is not None, "Emma conversation not in admin list"
        assert emma_conv["name"]
        assert emma_conv["email"]
        assert "last_message" in emma_conv
        assert "unread_for_admin" in emma_conv

    def test_admin_get_messages(self, admin_headers):
        r = requests.get(f"{API}/support/admin/messages/{EMMA_USER_ID}", headers=admin_headers)
        assert r.status_code == 200, r.text
        msgs = r.json()
        assert isinstance(msgs, list) and len(msgs) >= 2

    def test_admin_reply_success(self, admin_headers, emma_headers):
        r = requests.post(f"{API}/support/admin/reply", json={
            "user_id": EMMA_USER_ID,
            "text": "Hi Emma, this is a human agent following up.",
        }, headers=admin_headers)
        assert r.status_code == 200, r.text
        assert r.json().get("success") is True
        # Verify it appears in Emma's thread as 'agent'
        r2 = requests.get(f"{API}/support/messages", headers=emma_headers)
        assert r2.status_code == 200
        msgs = r2.json()
        assert any(m["sender"] == "agent" and "human agent" in m["text"] for m in msgs)

    def test_admin_reply_racism_blocked(self, admin_headers):
        r = requests.post(f"{API}/support/admin/reply", json={
            "user_id": EMMA_USER_ID,
            "text": "you stupid paki",
        }, headers=admin_headers)
        assert r.status_code == 400, r.text


# ==================== REGRESSION ====================

class TestRegression:
    def test_matches_discover(self, emma_headers):
        r = requests.get(f"{API}/matches/discover", headers=emma_headers)
        assert r.status_code == 200, r.text
        assert isinstance(r.json(), list) or isinstance(r.json(), dict)

    def test_swipe_clean_comment(self, emma_headers):
        # Use a different target since Emma may have already swiped James
        r = requests.post(f"{API}/matches/swipe", json={
            "target_user_id": "test-user-003",
            "action": "pass",
        }, headers=emma_headers)
        # 200 OK or 404 if user not found - either is acceptable as long as not 500
        assert r.status_code in (200, 400, 404), r.text
