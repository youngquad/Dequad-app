"""Seed a mutual match + messages between ui.tester and a temp user for chat UI testing."""
from __future__ import annotations

import os
import sys
import uuid
from datetime import datetime, timezone

import requests
from dotenv import dotenv_values
from pymongo import MongoClient

sys.path.insert(0, "/app/backend")
from helpers.passwords import hash_password  # noqa: E402

frontend_env = dotenv_values("/app/frontend/.env")
backend_env = dotenv_values("/app/backend/.env")
base_url = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env["REACT_APP_BACKEND_URL"]).rstrip("/")

client = MongoClient(backend_env["MONGO_URL"])
db = client[backend_env["DB_NAME"]]

TESTER_EMAIL = "ui.tester@student.beds.ac.uk"
TESTER_PASSWORD = "UiTester123!"
run_id = uuid.uuid4().hex[:8]
peer_email = f"testchat.{run_id}@student.leeds.ac.uk"
peer_password = "ChatUi123!"
peer_id = f"test_chat_{run_id}"

tester = db.users.find_one({"email": TESTER_EMAIL}, {"_id": 0, "user_id": 1})
assert tester, "tester account missing"
tester_id = tester["user_id"]

db.users.insert_one({
    "user_id": peer_id,
    "email": peer_email,
    "name": f"Chat Peer {run_id}",
    "password_hash": hash_password(peer_password),
    "role": "student",
    "email_verified": True,
    "student_verification": "auto",
    "plan": "free",
    "likes_this_week": 0,
    "interests": ["Music", "Gaming", "Coffee"],
    "university": "University of Leeds",
    "university_location": "Leeds, UK",
    "campus_name": "Main Campus",
    "course": "Computer Science",
    "age": 22,
    "gender": "woman",
    "interested_in": ["everyone"],
    "study_style": "visual",
    "bio": f"Temp chat UI test profile {run_id}",
    "photos": ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600"],
    "created_at": datetime.now(timezone.utc),
    "hidden_from_discovery": False,
})


def login(email, password):
    r = requests.post(f"{base_url}/api/auth/email-login", json={"email": email, "password": password}, timeout=20)
    r.raise_for_status()
    return r.json()["session_token"]


peer_token = login(peer_email, peer_password)
tester_token = login(TESTER_EMAIL, TESTER_PASSWORD)

# peer likes tester
r = requests.post(f"{base_url}/api/matches/swipe", headers={"Authorization": f"Bearer {peer_token}"},
                  json={"target_user_id": tester_id, "action": "like", "liked_section": "photo"}, timeout=20)
print("peer like:", r.status_code, r.text[:200])
# tester likes back -> mutual
r = requests.post(f"{base_url}/api/matches/swipe", headers={"Authorization": f"Bearer {tester_token}"},
                  json={"target_user_id": peer_id, "action": "like", "liked_section": "photo"}, timeout=20)
print("tester like:", r.status_code, r.text[:300])

accepted = requests.get(f"{base_url}/api/matches/accepted", headers={"Authorization": f"Bearer {tester_token}"}, timeout=20).json()
print("accepted:", accepted)
match_id = accepted[0]["match_id"] if accepted and "match_id" in accepted[0] else (accepted[0]["id"] if accepted else None)
assert match_id, f"no match found: {accepted}"

for token, text in ((peer_token, "Hey! This is a plaintext seeded message."),
                    (tester_token, "Hello back from the tester account."),
                    (peer_token, "Second message to verify thread ordering.")):
    r = requests.post(f"{base_url}/api/chat/send", headers={"Authorization": f"Bearer {token}"},
                      json={"match_id": match_id, "text": text}, timeout=20)
    print("send:", r.status_code, r.text[:150])

print("MATCH_ID:", match_id)
print("PEER_EMAIL:", peer_email)
