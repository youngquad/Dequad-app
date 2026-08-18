"""Look up a user's user_id by email. Read-only, makes no changes.

Run with:
  cd /app/backend && python scripts/lookup_user_id.py yusufquadri83@gmail.com
"""
from __future__ import annotations
import asyncio
import os
import sys


async def _main():
    from dotenv import load_dotenv
    from motor.motor_asyncio import AsyncIOMotorClient

    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
    mongo_url = os.environ["MONGO_URL"]
    db_name = os.environ["DB_NAME"]
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]

    email = sys.argv[1].lower().strip()
    user = await db.users.find_one(
        {"email": email},
        {"_id": 0, "user_id": 1, "email": 1, "role": 1, "plan": 1, "photos": 1, "gender": 1, "hidden_from_discovery": 1},
    )
    if not user:
        print(f"No user found for {email}")
        return
    photos = user.pop("photos", [])
    print(user)
    print(f"photos: {len(photos)} saved")
    for i, p in enumerate(photos):
        print(f"  [{i}] {'base64 data URI' if p.startswith('data:') else p} (len={len(p)} chars)")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/lookup_user_id.py <email>")
        sys.exit(1)
    asyncio.run(_main())
