"""Create temporary compatible users for manual Playwright match-celebration testing."""
from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import dotenv_values
from pymongo import MongoClient

import sys
sys.path.insert(0, "/app/backend")
from helpers.passwords import hash_password  # noqa: E402

frontend_env = dotenv_values("/app/frontend/.env")
backend_env = dotenv_values("/app/backend/.env")
base_url = (os.environ.get("REACT_APP_BACKEND_URL") or frontend_env["REACT_APP_BACKEND_URL"]).rstrip("/")
run_id = uuid.uuid4().hex[:10]
password = "MatchUi123!"
client = MongoClient(backend_env["MONGO_URL"])
db = client[backend_env["DB_NAME"]]

accounts = {}
for label, gender in (("a", "woman"), ("b", "man"), ("c", "non-binary")):
    email = f"testui{label}.{run_id}@student.leeds.ac.uk"
    user_id = f"test_ui_{label}_{run_id}"
    name = f"Test UI {label.upper()} {run_id}"
    doc = {
        "user_id": user_id,
        "email": email,
        "name": name,
        "password_hash": hash_password(password),
        "role": "student",
        "email_verified": True,
        "student_verification": "auto",
        "plan": "free",
        "likes_this_week": 0,
        "interests": ["Programming", "Music", "Gaming"],
        "university": "University of Leeds",
        "university_location": "Leeds, UK",
        "campus_name": "Main Campus",
        "course": "Computer Science",
        "age": 21 if label == "a" else 22,
        "gender": gender,
        "interested_in": ["everyone"],
        "study_style": "visual",
        "bio": f"Temporary match celebration test profile {run_id}",
        "photos": [],
        "created_at": datetime.now(timezone.utc),
        "hidden_from_discovery": False,
    }
    db.users.insert_one(doc)
    login = requests.post(
        f"{base_url}/api/auth/email-login",
        json={"email": email, "password": password},
        timeout=20,
    )
    login.raise_for_status()
    accounts[label] = {
        "email": email,
        "password": password,
        "user_id": user_id,
        "name": name,
        "token": login.json()["session_token"],
    }

# Only B likes A: B is the reciprocal candidate; C remains non-reciprocal
# so the same capped A session can exercise both UI branches.
for liker_label in ("b",):
    like = requests.post(
        f"{base_url}/api/matches/swipe",
        headers={"Authorization": f"Bearer {accounts[liker_label]['token']}"},
        json={"target_user_id": accounts["a"]["user_id"], "action": "like", "liked_section": "photo"},
        timeout=20,
    )
    like.raise_for_status()
    assert like.json()["is_mutual"] is False

if os.environ.get("LIMIT_A") == "1":
    now = datetime.now(timezone.utc)
    week_start = (now - __import__("datetime").timedelta(days=now.weekday())).strftime("%Y-%m-%d")
    db.users.update_one(
        {"user_id": accounts["a"]["user_id"]},
        {"$set": {"plan": "free", "likes_this_week": 3, "last_like_week": week_start}},
    )
Path("/app/test_reports/ui_match_accounts.json").write_text(json.dumps(accounts, indent=2), encoding="utf-8")
print(json.dumps({"run_id": run_id, "a_email": accounts["a"]["email"], "b_user_id": accounts["b"]["user_id"]}))
client.close()
