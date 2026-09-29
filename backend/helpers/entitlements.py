"""Feature entitlements: Connect is free; Mood, Feedback and Discovery filters
need Premium *or* an active university licence matching the student's email domain."""
from datetime import datetime, timezone
from typing import Optional

from fastapi import Depends, HTTPException

from database import db
from models import User
from helpers.auth import get_current_user

PREMIUM_FEATURES = ["mood", "feedback", "filters"]
PREMIUM_REQUIRED_CODE = "PREMIUM_REQUIRED"


def email_domain(email: Optional[str]) -> str:
    if not email or "@" not in email:
        return ""
    return email.rsplit("@", 1)[1].strip().lower()


def domain_matches(user_domain: str, licence_domain: str) -> bool:
    ld = licence_domain.strip().lower().lstrip("@")
    return bool(ld) and (user_domain == ld or user_domain.endswith("." + ld))


def licence_is_active(lic: dict, now: Optional[datetime] = None) -> bool:
    if not lic.get("active", False):
        return False
    now_iso = (now or datetime.now(timezone.utc)).isoformat()
    starts = lic.get("starts_at")
    ends = lic.get("ends_at")
    if starts and starts > now_iso:
        return False
    if ends and ends <= now_iso:
        return False
    return True


async def find_licence_for_email(email: Optional[str]) -> Optional[dict]:
    domain = email_domain(email)
    if not domain:
        return None
    licences = await db.university_licences.find({"active": True}, {"_id": 0}).to_list(500)
    for lic in licences:
        if licence_is_active(lic) and any(domain_matches(domain, d) for d in lic.get("domains", [])):
            return lic
    return None


async def find_licence_for_university(name: Optional[str]) -> Optional[dict]:
    if not name:
        return None
    import re
    return await db.university_licences.find_one(
        {"name": {"$regex": f"^{re.escape(name.strip())}$", "$options": "i"}}, {"_id": 0}
    )


def is_paid_premium(user_doc: dict) -> bool:
    return (
        user_doc.get("plan") == "premium"
        or user_doc.get("is_premium") is True
        or user_doc.get("subscription_status") in {"premium", "active", "cancel_at_period_end"}
    )


async def get_entitlements(user_doc: dict) -> dict:
    paid = is_paid_premium(user_doc)
    lic = None if paid else await find_licence_for_email(user_doc.get("email"))
    full = paid or lic is not None
    return {
        "is_paid_premium": paid,
        "university_licensed": lic is not None,
        "licence_university": lic.get("name") if lic else None,
        "licence_ends_at": lic.get("ends_at") if lic else None,
        "has_full_access": full,
        "access_source": "premium" if paid else ("university" if lic else "free"),
        "locked_features": [] if full else PREMIUM_FEATURES,
    }


async def user_has_full_access(user_id: str) -> bool:
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0, "email": 1, "plan": 1, "is_premium": 1, "subscription_status": 1}) or {}
    return (await get_entitlements(user_doc))["has_full_access"]


async def require_full_access(current_user: User = Depends(get_current_user)) -> User:
    if not await user_has_full_access(current_user.user_id):
        raise HTTPException(
            status_code=403,
            detail={
                "code": PREMIUM_REQUIRED_CODE,
                "message": "This feature is available with DEQUAD Premium, or free when your university is a DEQUAD partner.",
            },
        )
    return current_user
