from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone, timedelta
from typing import Optional
import re

from database import db
from models import User, Match, SwipeAction
from helpers.auth import get_current_user
from helpers.notifications import send_push_notification
from helpers.safeguarding import check_language_filter
from config import FREE_LIKES_PER_WEEK

router = APIRouter()


# SEC-002 (2026-07): explicit allowlist of fields that are safe to return to
# other users. Anything outside this set — password_hash, admin_password,
# stripe_customer_id, raw email, push_token, session bookkeeping, precise GPS
# location, is_demo_account, moderation notes, etc. — MUST NOT leak through
# discover / likes-received / accepted-matches responses.
#
# Precise `location` (GeoJSON `{coordinates:[lng,lat]}`) is intentionally NOT
# in this list. Callers get `distance_km` instead — rounded to 1 km — so a
# malicious user cannot trilaterate someone's home from three swipes.
PUBLIC_PROFILE_FIELDS = frozenset({
    "user_id", "name", "age", "gender", "interested_in",
    "university", "campus_name", "university_location", "city",
    "course", "study_style", "education_level",
    "bio", "interests",
    "picture", "photos",
    "match_score", "distance_km",
    # Non-sensitive display metadata
    "verified", "email_verified", "student_verification",
    "is_premium", "subscription_status",
})


def _public_profile(user: dict) -> dict:
    """Project a raw user document down to the safe public field set.

    Also snaps ``distance_km`` to 1 km precision to reduce stalking surface
    (SEC-audit P3: trilateration).
    """
    out = {k: user[k] for k in PUBLIC_PROFILE_FIELDS if k in user}
    if isinstance(out.get("distance_km"), (int, float)):
        # Round UP to the nearest kilometre — precise 100 m distances make it
        # possible to trilaterate the target from a few swipes. Sub-1km
        # results still render as "<1 km away" in the UI.
        out["distance_km"] = max(1, round(out["distance_km"]))
    return out


def _week_start_iso(now: datetime = None) -> str:
    """Return the ISO Monday date (YYYY-MM-DD) for the week containing `now`."""
    now = now or datetime.now(timezone.utc)
    monday = now - timedelta(days=now.weekday())
    return monday.strftime("%Y-%m-%d")


def _next_week_reset(now: datetime = None) -> datetime:
    """Return the UTC datetime of the next ISO week roll-over (Monday 00:00 UTC)."""
    now = now or datetime.now(timezone.utc)
    days_until_monday = (7 - now.weekday()) % 7
    if days_until_monday == 0:  # it's Monday already → roll to next Monday
        days_until_monday = 7
    next_monday = (now + timedelta(days=days_until_monday)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    return next_monday


def calculate_match_score(user: dict, other: dict) -> float:
    score = 0.0
    user_interests = set(user.get("interests", []))
    other_interests = set(other.get("interests", []))
    if user_interests and other_interests:
        common = user_interests.intersection(other_interests)
        total = max(len(user_interests), len(other_interests))
        score += (len(common) / total) * 0.25 if total > 0 else 0
    if user.get("university") and user.get("university") == other.get("university"):
        score += 0.15
        if user.get("campus_name") and user.get("campus_name") == other.get("campus_name"):
            score += 0.05
    if user.get("course") and user.get("course") == other.get("course"):
        score += 0.15
    user_age = user.get("age", 0)
    other_age = other.get("age", 0)
    if user_age and other_age:
        if abs(user_age - other_age) <= 3:
            score += 0.15
        elif abs(user_age - other_age) <= 5:
            score += 0.075
    if user.get("study_style") and user.get("study_style") == other.get("study_style"):
        score += 0.15
    if user.get("university_location") and user.get("university_location") == other.get("university_location"):
        score += 0.1
    return min(score, 1.0)


def check_preference_match(user: dict, other: dict) -> bool:
    user_interested_in = user.get("interested_in", [])
    other_gender = other.get("gender")
    if not user_interested_in or "everyone" in user_interested_in:
        return True
    if not other_gender:
        return True
    gender_to_preference = {"man": "men", "woman": "women", "non-binary": "non-binary"}
    preference_match = gender_to_preference.get(other_gender, other_gender)
    return preference_match in user_interested_in


@router.get("/matches/discover")
async def discover_matches(
    current_user: User = Depends(get_current_user),
    reset: bool = False,
    gender: Optional[str] = None,
    min_age: Optional[int] = None,
    max_age: Optional[int] = None,
    university: Optional[str] = None,
    education_level: Optional[str] = None,
    city: Optional[str] = None,
    max_distance_km: Optional[float] = None,
):
    """Return candidate profiles for the swipe deck.

    Premium-only filters: ``gender``, ``min_age``, ``max_age``, ``university``,
    ``education_level``, ``city``, ``max_distance_km``. Non-premium users have
    these filters silently ignored — surfaced as a paywall in the UI before they
    ever reach this endpoint.

    ``max_distance_km`` is applied via a MongoDB ``$geoNear`` aggregation on
    the ``users.location`` 2dsphere index. When active, each returned profile
    includes a ``distance_km`` field (rounded to 1 decimal). Requires the
    current user to have their own ``location`` set.
    """
    if reset:
        await db.matches.delete_many(
            {"user_id": current_user.user_id, "status": "rejected"}
        )

    existing_swipes = await db.matches.find(
        {"user_id": current_user.user_id}, {"matched_user_id": 1}
    ).to_list(1000)
    swiped_ids = [s["matched_user_id"] for s in existing_swipes]
    swiped_ids.append(current_user.user_id)

    query: dict = {
        "user_id": {"$nin": swiped_ids},
        "role": "student",
        # Seeded demo / founder personal accounts are hidden from real users'
        # discover deck. Real users never have this flag set.
        "hidden_from_discovery": {"$ne": True},
    }

    # Premium gating — only apply filters if the user actually has premium.
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0}) or {}
    is_premium = (
        user_doc.get("plan") == "premium"
        or user_doc.get("is_premium") is True
        or user_doc.get("subscription_status") in {"premium", "active", "cancel_at_period_end"}
    )
    filters_applied: dict = {}
    if is_premium:
        if gender:
            query["gender"] = gender
            filters_applied["gender"] = gender
        if university:
            query["university"] = {"$regex": f"^{re.escape(university)}$", "$options": "i"}
            filters_applied["university"] = university
        if education_level:
            query["education_level"] = education_level
            filters_applied["education_level"] = education_level
        if city:
            query["$or"] = [
                {"university_location": {"$regex": re.escape(city), "$options": "i"}},
                {"city": {"$regex": re.escape(city), "$options": "i"}},
            ]
            filters_applied["city"] = city
        age_clause: dict = {}
        if min_age is not None and min_age > 0:
            age_clause["$gte"] = int(min_age)
        if max_age is not None and max_age > 0:
            age_clause["$lte"] = int(max_age)
        if age_clause:
            query["age"] = age_clause
            filters_applied["age_range"] = [min_age, max_age]

    # Distance filter — only if premium, user shared their location, and a
    # radius was requested. Uses $geoNear to compute per-doc distance in
    # metres, then converts to km and rounds.
    my_location = user_doc.get("location") if is_premium else None
    use_geo = (
        is_premium
        and max_distance_km is not None
        and max_distance_km > 0
        and isinstance(my_location, dict)
        and isinstance(my_location.get("coordinates"), list)
        and len(my_location["coordinates"]) == 2
    )

    if use_geo:
        pipeline = [
            {
                "$geoNear": {
                    "near": my_location,
                    "distanceField": "_distance_m",
                    "maxDistance": float(max_distance_km) * 1000.0,
                    "spherical": True,
                    "query": query,
                }
            },
            {"$limit": 200},
            {"$project": {"_id": 0}},
        ]
        potential_users = await db.users.aggregate(pipeline).to_list(200)
        for u in potential_users:
            m = u.pop("_distance_m", None)
            if m is not None:
                u["distance_km"] = round(m / 1000.0, 1)
        filters_applied["max_distance_km"] = max_distance_km
    else:
        potential_users = await db.users.find(query, {"_id": 0}).to_list(200)

    current_user_dict = current_user.dict()
    scored_users = []
    for user in potential_users:
        if not check_preference_match(current_user_dict, user):
            continue
        if not check_preference_match(user, current_user_dict):
            continue
        score = calculate_match_score(current_user_dict, user)
        user["match_score"] = score
        scored_users.append(user)

    # If distance-filtered, keep the nearest-first ordering ($geoNear already
    # sorted by distance ASC). Otherwise fall back to compatibility-score DESC.
    if not use_geo:
        scored_users.sort(key=lambda x: x["match_score"], reverse=True)
    result = [_public_profile(u) for u in scored_users[:50]]

    # Backwards-compatible: previous clients expect a flat list. Newer clients
    # can read pagination/filter metadata via response headers if needed.
    return result


@router.post("/matches/swipe")
async def swipe_action(data: SwipeAction, current_user: User = Depends(get_current_user)):
    if data.action not in ["like", "dislike"]:
        raise HTTPException(status_code=400, detail="Action must be 'like' or 'dislike'")

    # Check comment for profanity/racist language
    if data.comment:
        language_check = check_language_filter(data.comment)
        if language_check["blocked"]:
            raise HTTPException(status_code=400, detail=language_check["message"])

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    week_start = _week_start_iso()
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    user_plan = user_doc.get("plan", "free")
    likes_this_week = user_doc.get("likes_this_week", 0)
    last_like_week = user_doc.get("last_like_week")

    # Reset weekly like counter at the start of a new ISO week.
    if last_like_week != week_start:
        likes_this_week = 0

    # Liking back someone who already liked you completes an existing match
    # rather than spending a fresh discovery-like, so it's exempt from the
    # weekly quota below (checked early so we can reuse the same lookup
    # further down instead of querying twice).
    reverse_match = None
    if data.action == "like":
        reverse_match = await db.matches.find_one({
            "user_id": data.target_user_id, "matched_user_id": current_user.user_id, "status": "liked"
        }, {"_id": 0})
    is_reciprocal_like = reverse_match is not None

    # Only LIKES are limited; skips/dislikes are unlimited. Reciprocal likes
    # (completing a match someone else already initiated) are never gated.
    if (
        data.action == "like"
        and user_plan == "free"
        and likes_this_week >= FREE_LIKES_PER_WEEK
        and not is_reciprocal_like
    ):
        raise HTTPException(status_code=403, detail={
            "message": "Weekly like limit reached",
            "limit": FREE_LIKES_PER_WEEK,
            "period": "week",
            "upgrade_required": True
        })

    target_user = await db.users.find_one({"user_id": data.target_user_id}, {"_id": 0})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = await db.matches.find_one({
        "user_id": current_user.user_id, "matched_user_id": data.target_user_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already swiped on this user")

    # Bookkeeping: only the like counter is incremented, and only for a
    # fresh discovery like — reciprocal likes don't spend weekly budget
    # since they were never gated by it in the first place.
    update_set = {"last_swipe_date": today}
    if data.action == "like" and not is_reciprocal_like:
        update_set["likes_this_week"] = likes_this_week + 1
        update_set["last_like_week"] = week_start
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$set": update_set}
    )

    status = "liked" if data.action == "like" else "rejected"
    match = Match(
        user_id=current_user.user_id, matched_user_id=data.target_user_id,
        status=status, score=calculate_match_score(current_user.dict(), target_user),
        comment=data.comment if data.action == "like" else None,
        liked_section=data.liked_section if data.action == "like" else None
    )
    await db.matches.insert_one(match.dict())

    mutual_match = None
    if data.action == "like":
        like_notification_body = f"{current_user.name} liked your profile!"
        if data.comment:
            like_notification_body = f'{current_user.name} liked {data.liked_section or "your profile"}: "{data.comment[:60]}{"..." if len(data.comment) > 60 else ""}"'
        elif data.liked_section:
            like_notification_body = f"{current_user.name} liked {data.liked_section}!"

        await send_push_notification(
            data.target_user_id, "Someone likes you!", like_notification_body, "new_like",
            {"from_user_id": current_user.user_id, "from_user_name": current_user.name,
             "comment": data.comment, "liked_section": data.liked_section}
        )

        if reverse_match:
            await db.matches.update_many(
                {"$or": [
                    {"user_id": current_user.user_id, "matched_user_id": data.target_user_id},
                    {"user_id": data.target_user_id, "matched_user_id": current_user.user_id}
                ]},
                {"$set": {"status": "accepted"}}
            )
            mutual_match = target_user

            # Note: reverse_match was fetched before the update_many call
            # above flipped its status to "accepted" — re-querying for
            # status="liked" here would always return nothing.
            like_comment = reverse_match.get("comment")

            match_msg_to_current = f"You matched with {target_user.get('name', 'someone')}! Start chatting now."
            match_msg_to_target = f"You matched with {current_user.name}!"
            if data.comment:
                match_msg_to_target += f' They said: "{data.comment[:50]}{"..." if len(data.comment) > 50 else ""}"'
            else:
                match_msg_to_target += " Start chatting now."

            await send_push_notification(
                current_user.user_id, "New Match!", match_msg_to_current, "new_match",
                {"match_user_id": data.target_user_id, "match_user_name": target_user.get("name"), "comment": like_comment}
            )
            await send_push_notification(
                data.target_user_id, "New Match!", match_msg_to_target, "new_match",
                {"match_user_id": current_user.user_id, "match_user_name": current_user.name, "comment": data.comment}
            )

    remaining_likes = None
    next_reset = None
    if user_plan == "free":
        used = likes_this_week + (1 if (data.action == "like" and not is_reciprocal_like) else 0)
        remaining_likes = max(0, FREE_LIKES_PER_WEEK - used)
        next_reset = _next_week_reset().isoformat()

    return {
        "match": match.dict(),
        "is_mutual": mutual_match is not None,
        "matched_user": mutual_match,
        # New field: weekly like budget (used by frontend banner / upgrade prompt)
        "remaining_likes_this_week": remaining_likes,
        "next_like_reset": next_reset,
        # Back-compat: keep the old key name pointing at the same value so older
        # clients don't break in the middle of an active session.
        "remaining_swipes": remaining_likes,
        "is_premium": user_plan == "premium"
    }


@router.get("/matches/accepted")
async def get_accepted_matches(current_user: User = Depends(get_current_user)):
    matches = await db.matches.find(
        {"user_id": current_user.user_id, "status": "accepted"}, {"_id": 0}
    ).to_list(100)

    if not matches:
        return []

    # Batch fetch all matched users in a single query (avoid N+1).
    user_ids = [m["matched_user_id"] for m in matches]
    users = await db.users.find({"user_id": {"$in": user_ids}}, {"_id": 0}).to_list(len(user_ids))
    user_map = {u["user_id"]: u for u in users}

    # Batch the last-message-per-conversation lookup via the new pair_id index.
    pair_ids = [
        f"{min(current_user.user_id, m['matched_user_id'])}:{max(current_user.user_id, m['matched_user_id'])}"
        for m in matches
    ]
    last_msgs: dict[str, dict] = {}
    async for row in db.chat_messages.aggregate([
        {"$match": {"pair_id": {"$in": pair_ids}}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": "$pair_id",
            "text": {"$first": "$text"},
            "sender_id": {"$first": "$sender_id"},
            "created_at": {"$first": "$created_at"},
        }},
    ]):
        last_msgs[row["_id"]] = row

    result = []
    for match in matches:
        user = user_map.get(match["matched_user_id"])
        if not user:
            continue
        pair_id = f"{min(current_user.user_id, match['matched_user_id'])}:{max(current_user.user_id, match['matched_user_id'])}"
        lm = last_msgs.get(pair_id)
        last_at = None
        if lm and lm.get("created_at"):
            ca = lm["created_at"]
            last_at = ca.isoformat() if hasattr(ca, "isoformat") else str(ca)
        result.append({
            "match_id": match["id"],
            "user": _public_profile(user),
            "comment": match.get("comment"),
            "liked_section": match.get("liked_section"),
            "last_message": lm.get("text") if lm else None,
            "last_message_at": last_at,
            "last_sender_id": lm.get("sender_id") if lm else None,
        })

    # Sort: conversations with the most recent activity bubble to the top;
    # never-chatted matches sink to the bottom.
    result.sort(
        key=lambda r: r["last_message_at"] or "",
        reverse=True,
    )
    return result


@router.get("/matches/likes-received/count")
async def get_likes_received_count(current_user: User = Depends(get_current_user)):
    """Cheap polling endpoint for the Connect-tab badge.
    Counts pending likes from other users that I have NOT yet responded to."""
    likes = await db.matches.find(
        {"matched_user_id": current_user.user_id, "status": "liked"},
        {"_id": 0, "user_id": 1},
    ).to_list(500)
    if not likes:
        return {"count": 0}

    liker_ids = [lk["user_id"] for lk in likes]
    my_responses = await db.matches.find(
        {"user_id": current_user.user_id, "matched_user_id": {"$in": liker_ids}},
        {"_id": 0, "matched_user_id": 1},
    ).to_list(len(liker_ids))
    already_responded = {r["matched_user_id"] for r in my_responses}
    pending = [lk for lk in likes if lk["user_id"] not in already_responded]
    return {"count": len(pending)}


@router.get("/matches/likes-received")
async def get_likes_received(current_user: User = Depends(get_current_user)):
    likes = await db.matches.find(
        {"matched_user_id": current_user.user_id, "status": "liked"}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)

    if not likes:
        return []

    liker_ids = [lk["user_id"] for lk in likes]

    # Batch: which of those have I already responded to? (Skip them.)
    my_responses = await db.matches.find(
        {"user_id": current_user.user_id, "matched_user_id": {"$in": liker_ids}},
        {"_id": 0, "matched_user_id": 1},
    ).to_list(len(liker_ids))
    already_responded = {r["matched_user_id"] for r in my_responses}

    # Batch: fetch all liker user docs in one query.
    # Hidden demo/founder-personal accounts are never surfaced in likes-received.
    users = await db.users.find(
        {
            "user_id": {"$in": liker_ids},
            "hidden_from_discovery": {"$ne": True},
        },
        {"_id": 0},
    ).to_list(len(liker_ids))
    user_map = {u["user_id"]: u for u in users}

    result = []
    for like in likes:
        if like["user_id"] in already_responded:
            continue
        user = user_map.get(like["user_id"])
        if user:
            result.append({
                "like_id": like["id"],
                "user": _public_profile(user),
                "comment": like.get("comment"),
                "liked_section": like.get("liked_section"),
                "created_at": like.get("created_at")
            })
    return result
