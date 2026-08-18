"""One-off QA helper: create a test student account with 3 distinct photos so
you can verify the Connect screen's tap-left/right photo browsing.

Deliberately omits `gender` and sets `interested_in: ["everyone"]` so this
account passes the two-way preference check in routes/matches.py
(check_preference_match) and shows up in ANY real user's discover deck,
regardless of their own gender/preference settings.

Run with:
  cd /app/backend && python scripts/create_test_photo_user.py

Safe to re-run — it's idempotent (looks up by email first).
To remove it afterwards:
  cd /app/backend && python scripts/create_test_photo_user.py --delete
"""
from __future__ import annotations
import asyncio
import os
import sys
import uuid
from datetime import datetime, timezone

TEST_EMAIL = "dequad-test-photos@example.com"

PHOTOS = [
    "https://picsum.photos/id/1005/900/1200",
    "https://picsum.photos/id/1011/900/1200",
    "https://picsum.photos/id/1027/900/1200",
]


async def _main():
    from dotenv import load_dotenv
    from motor.motor_asyncio import AsyncIOMotorClient

    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
    mongo_url = os.environ["MONGO_URL"]
    db_name = os.environ["DB_NAME"]
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    if "--delete" in sys.argv:
        res = await db.users.delete_many({"email": TEST_EMAIL})
        print(f"Deleted {res.deleted_count} test user(s) with email {TEST_EMAIL}")
        return

    existing = await db.users.find_one({"email": TEST_EMAIL}, {"_id": 0, "user_id": 1})
    if existing:
        print(f"Test user already exists: user_id={existing['user_id']}")
        return

    doc = {
        "user_id": str(uuid.uuid4()),
        "email": TEST_EMAIL,
        "name": "Photo QA Test",
        "role": "student",
        "interested_in": ["everyone"],
        # No "gender" key on purpose — check_preference_match treats a
        # missing gender as an automatic pass for anyone viewing this profile.
        "age": 22,
        "bio": "Test account for QA'ing the Connect photo browser — safe to delete anytime.",
        "interests": ["Coffee", "Photography", "Hiking"],
        "photos": PHOTOS,
        "profile_completed": True,
        "hidden_from_discovery": False,
        "created_at": datetime.now(timezone.utc),
    }
    await db.users.insert_one(doc)
    print(f"Created test user: user_id={doc['user_id']}, email={TEST_EMAIL}, photos={len(PHOTOS)}")
    print("It should now appear in the Connect discover deck for any real account.")
    print("Delete it later with: python scripts/create_test_photo_user.py --delete")


if __name__ == "__main__":
    asyncio.run(_main())
