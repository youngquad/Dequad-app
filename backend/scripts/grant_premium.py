"""One-off: manually grant Premium to a specific account (no payment involved
— for comping a beta tester). Sets plan="premium" directly.

Run with:
  cd /app/backend && python scripts/grant_premium.py <email>

To revoke:
  cd /app/backend && python scripts/grant_premium.py <email> --revoke
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
    revoke = "--revoke" in sys.argv

    user = await db.users.find_one({"email": email}, {"_id": 0, "user_id": 1, "email": 1, "plan": 1})
    if not user:
        print(f"No user found for {email}")
        return

    new_plan = "free" if revoke else "premium"
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"plan": new_plan, "subscription_status": "active" if not revoke else "free"}},
    )
    print(f"{email} (user_id={user['user_id']}): plan {user.get('plan')} -> {new_plan}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/grant_premium.py <email> [--revoke]")
        sys.exit(1)
    asyncio.run(_main())
