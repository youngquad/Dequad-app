from fastapi import APIRouter, Depends, HTTPException, Response
from typing import Optional
from datetime import datetime, timezone, timedelta
import re
import uuid
import csv
import io
import logging

from database import db
from models import User, UserSession, UniversityAdminCreate, UniversityAdminLogin
from helpers.auth import get_current_user, require_admin, require_university_admin
from helpers.passwords import hash_password, verify_and_maybe_rehash

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/university-admin/register")
async def register_university_admin(data: UniversityAdminCreate, admin: User = Depends(require_admin)):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    password_hash = hash_password(data.password)
    uni_admin = {
        "user_id": str(uuid.uuid4()),
        "email": data.email, "name": data.name,
        "role": "university_admin", "university_admin_for": data.university,
        "university": data.university, "admin_password": password_hash,
        "created_at": datetime.now(timezone.utc), "profile_completed": True
    }
    await db.users.insert_one(uni_admin)
    return {"success": True, "message": f"University admin created for {data.university}"}


@router.post("/university-admin/login")
async def university_admin_login(data: UniversityAdminLogin):
    user = await db.users.find_one({"email": data.email, "role": "university_admin"}, {"_id": 0})
    if not user or not user.get("admin_password"):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    ok, new_hash = verify_and_maybe_rehash(data.password, user["admin_password"])
    if not ok:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if new_hash:
        try:
            await db.users.update_one(
                {"user_id": user["user_id"]},
                {"$set": {"admin_password": new_hash}},
            )
        except Exception as e:  # noqa: BLE001
            logger.warning(f"Lazy uni-admin rehash failed for {data.email}: {e}")
    # Never return the password hash to the client, even on the login response.
    user.pop("admin_password", None)

    session_token = f"uni_admin_session_{uuid.uuid4().hex}"
    session = UserSession(
        user_id=user["user_id"], session_token=session_token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    await db.sessions.insert_one(session.dict())
    return {"session_token": session_token, "user": user}


@router.get("/university-admin/stats")
async def get_university_admin_stats(current_user: User = Depends(require_university_admin)):
    university = current_user.university_admin_for
    if current_user.role == "admin":
        return {"error": "Please specify university or use main admin dashboard"}

    total_students = await db.users.count_documents({"role": "student", "university": university})
    premium_students = await db.users.count_documents({
        "role": "student", "university": university,
        "$or": [{"plan": "premium"}, {"is_premium": True}]
    })
    free_students = total_students - premium_students

    uni_students = await db.users.find({"role": "student", "university": university}, {"user_id": 1}).to_list(10000)
    student_ids = [s["user_id"] for s in uni_students]

    total_mood_entries = await db.mood_entries.count_documents({"user_id": {"$in": student_ids}})
    mood_pipeline = [
        {"$match": {"user_id": {"$in": student_ids}}},
        {"$group": {"_id": None, "avg_mood": {"$avg": "$mood_score"}}}
    ]
    avg_mood_result = await db.mood_entries.aggregate(mood_pipeline).to_list(1)
    avg_mood = avg_mood_result[0]["avg_mood"] if avg_mood_result else 0

    safeguarding_alerts = await db.safeguarding_alerts.count_documents({"user_id": {"$in": student_ids}})
    unacknowledged_alerts = await db.safeguarding_alerts.count_documents({"user_id": {"$in": student_ids}, "acknowledged": False})
    matches_count = await db.matches.count_documents({"user_id": {"$in": student_ids}, "status": "accepted"})
    feedback_count = await db.feedback_entries.count_documents({"user_id": {"$in": student_ids}})

    course_pipeline = [
        {"$match": {"role": "student", "university": university, "course": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": "$course", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}, {"$limit": 10}
    ]
    courses = await db.users.aggregate(course_pipeline).to_list(10)

    return {
        "university": university, "total_students": total_students,
        "premium_students": premium_students, "free_students": free_students,
        "conversion_rate": round((premium_students / max(total_students, 1)) * 100, 2),
        "total_mood_entries": total_mood_entries,
        "average_mood": round(avg_mood, 1) if avg_mood else 0,
        "safeguarding_alerts": safeguarding_alerts,
        "unacknowledged_alerts": unacknowledged_alerts,
        "matches_count": matches_count, "feedback_count": feedback_count,
        "courses": [{"course": c["_id"], "count": c["count"]} for c in courses]
    }


@router.get("/university-admin/students")
async def get_university_students(
    current_user: User = Depends(require_university_admin),
    limit: int = 50, offset: int = 0, search: Optional[str] = None
):
    university = current_user.university_admin_for
    query = {"role": "student", "university": university}
    if search:
        # re.escape neutralises regex metachars in user input — prevents ReDoS
        # via crafted patterns and avoids accidental matches (SEC-audit P3).
        needle = re.escape(search)
        query["$or"] = [
            {"name": {"$regex": needle, "$options": "i"}},
            {"email": {"$regex": needle, "$options": "i"}},
            {"course": {"$regex": needle, "$options": "i"}}
        ]

    # Explicitly project out BOTH password fields so staff don't see hashes.
    _proj = {"_id": 0, "admin_password": 0, "password_hash": 0}
    students = await db.users.find(query, _proj).skip(offset).limit(limit).to_list(limit)
    total = await db.users.count_documents(query)
    return {"students": students, "total": total, "limit": limit, "offset": offset}


@router.get("/university-admin/mood-trends")
async def get_university_mood_trends(current_user: User = Depends(require_university_admin)):
    university = current_user.university_admin_for
    students = await db.users.find({"role": "student", "university": university}, {"user_id": 1}).to_list(10000)
    student_ids = [s["user_id"] for s in students]
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)

    pipeline = [
        {"$match": {"user_id": {"$in": student_ids}, "created_at": {"$gte": thirty_days_ago}}},
        {"$group": {"_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}}, "avg_mood": {"$avg": "$mood_score"}, "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    trends = await db.mood_entries.aggregate(pipeline).to_list(30)
    return {
        "university": university,
        "trends": [{"date": t["_id"], "avg_mood": round(t["avg_mood"], 1), "entries": t["count"]} for t in trends]
    }


@router.get("/university-admin/safeguarding-alerts")
async def get_university_safeguarding_alerts(
    current_user: User = Depends(require_university_admin),
    acknowledged: Optional[bool] = None
):
    university = current_user.university_admin_for
    students = await db.users.find({"role": "student", "university": university}, {"user_id": 1}).to_list(10000)
    student_ids = [s["user_id"] for s in students]

    query = {"user_id": {"$in": student_ids}}
    if acknowledged is not None:
        query["acknowledged"] = acknowledged

    alerts = await db.safeguarding_alerts.find(query, {"_id": 0}).sort("created_at", -1).limit(100).to_list(100)
    return alerts


@router.put("/university-admin/safeguarding-alerts/{alert_id}/acknowledge")
async def acknowledge_university_alert(alert_id: str, current_user: User = Depends(require_university_admin)):
    university = current_user.university_admin_for
    alert = await db.safeguarding_alerts.find_one({"alert_id": alert_id}, {"_id": 0})
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    student = await db.users.find_one({"user_id": alert["user_id"]}, {"_id": 0})
    if student and student.get("university") != university:
        raise HTTPException(status_code=403, detail="Cannot acknowledge alerts from other universities")

    await db.safeguarding_alerts.update_one(
        {"alert_id": alert_id},
        {"$set": {"acknowledged": True, "acknowledged_by": current_user.email, "acknowledged_at": datetime.now(timezone.utc)}}
    )
    return {"success": True}


@router.get("/university-admin/export/students")
async def export_university_students(current_user: User = Depends(require_university_admin)):
    university = current_user.university_admin_for
    students = await db.users.find(
        {"role": "student", "university": university}, {"_id": 0, "admin_password": 0, "password_hash": 0}
    ).to_list(10000)

    output = io.StringIO()
    fieldnames = ["user_id", "name", "email", "course", "age", "gender", "pronouns", "study_style", "plan", "created_at"]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
    writer.writeheader()
    for student in students:
        row = {
            "user_id": student.get("user_id"), "name": student.get("name"),
            "email": student.get("email"), "course": student.get("course"),
            "age": student.get("age"), "gender": student.get("gender"),
            "pronouns": student.get("pronouns"), "study_style": student.get("study_style"),
            "plan": student.get("plan", "free"), "created_at": str(student.get("created_at", ""))
        }
        writer.writerow(row)

    return Response(
        content=output.getvalue(), media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={university.replace(' ', '_')}_students.csv"}
    )
