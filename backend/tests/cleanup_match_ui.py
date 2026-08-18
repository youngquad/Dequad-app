"""Clean temporary users created for Playwright match-celebration testing."""
from __future__ import annotations

import json
from pathlib import Path

from dotenv import dotenv_values
from pymongo import MongoClient

state_path = Path("/app/test_reports/ui_match_accounts.json")
if not state_path.exists():
    print("No UI match account state to clean")
    raise SystemExit(0)

accounts = json.loads(state_path.read_text(encoding="utf-8"))
user_ids = [account["user_id"] for account in accounts.values()]
emails = [account["email"] for account in accounts.values()]
env = dotenv_values("/app/backend/.env")
client = MongoClient(env["MONGO_URL"])
db = client[env["DB_NAME"]]
results = {
    "matches": db.matches.delete_many({"$or": [{"user_id": {"$in": user_ids}}, {"matched_user_id": {"$in": user_ids}}]}).deleted_count,
    "chat_messages": db.chat_messages.delete_many({"$or": [{"sender_id": {"$in": user_ids}}, {"recipient_id": {"$in": user_ids}}]}).deleted_count,
    "notifications": db.notifications.delete_many({"user_id": {"$in": user_ids}}).deleted_count,
    "sessions": db.user_sessions.delete_many({"user_id": {"$in": user_ids}}).deleted_count,
    "verifications": db.email_verifications.delete_many({"email": {"$in": emails}}).deleted_count,
    "users": db.users.delete_many({"user_id": {"$in": user_ids}}).deleted_count,
}
client.close()
state_path.unlink()
print(json.dumps(results))
