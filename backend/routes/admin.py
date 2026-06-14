from fastapi import APIRouter, Depends, HTTPException, Response
from typing import Optional
from datetime import datetime, timezone, timedelta
import csv
import io
import uuid
import json
import urllib.parse
import logging

from database import db
from models import (
    User, KeywordActionRequest, AlertFeedbackRequest
)
from helpers.auth import require_admin
from helpers.email import (
    is_smtp_configured, send_email_async, get_admin_emails,
    create_safeguarding_email_html, create_safeguarding_email_text,
    SMTP_HOST, SMTP_PORT, SMTP_FROM_EMAIL, SMTP_FROM_NAME,
)
from helpers.safeguarding import (
    CRISIS_RESOURCES, SAFEGUARDING_KEYWORDS, AI_LEARNED_KEYWORDS,
    record_alert_feedback, detect_behavioral_anomalies
)
from config import EMERGENT_LLM_KEY
from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)
router = APIRouter()


# ==================== ADMIN STATS ====================

@router.get("/admin/stats")
async def get_admin_stats(admin: User = Depends(require_admin)):
    total_users = await db.users.count_documents({})
    total_students = await db.users.count_documents({"role": "student"})
    total_feedback = await db.feedback_entries.count_documents({})
    total_matches = await db.matches.count_documents({"status": "accepted"})
    pending_reports = await db.reports.count_documents({"status": "pending"})

    premium_students = await db.users.count_documents({"role": "student", "plan": "premium"})
    free_students = total_students - premium_students

    university_pipeline = [
        {"$match": {"role": "student", "university": {"$exists": True, "$ne": None, "$ne": ""}}},
        {"$group": {
            "_id": "$university", "total_students": {"$sum": 1},
            "premium_count": {"$sum": {"$cond": [{"$eq": ["$plan", "premium"]}, 1, 0]}},
            "free_count": {"$sum": {"$cond": [{"$or": [{"$eq": ["$plan", "free"]}, {"$eq": ["$plan", None]}]}, 1, 0]}}
        }},
        {"$sort": {"total_students": -1}}, {"$limit": 20}
    ]
    universities_breakdown = await db.users.aggregate(university_pipeline).to_list(20)

    university_stats = []
    for uni in universities_breakdown:
        if uni["_id"]:
            university_stats.append({
                "university": uni["_id"], "total_students": uni["total_students"],
                "premium_count": uni["premium_count"], "free_count": uni["free_count"],
                "premium_percentage": round((uni["premium_count"] / uni["total_students"]) * 100, 1) if uni["total_students"] > 0 else 0
            })

    risk_scores = await db.risk_scores.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    avg_risk = sum(r.get("risk_score", 0) for r in risk_scores) / len(risk_scores) if risk_scores else 0

    total_alerts = await db.safeguarding_alerts.count_documents({})
    unacknowledged_alerts = await db.safeguarding_alerts.count_documents({"acknowledged": False})
    high_risk_alerts = await db.safeguarding_alerts.count_documents({"risk_level": "high"})

    return {
        "total_users": total_users, "total_students": total_students,
        "total_feedback": total_feedback, "total_matches": total_matches,
        "pending_reports": pending_reports, "average_risk_score": round(avg_risk, 2),
        "recent_risk_scores": risk_scores[:20],
        "subscription_stats": {
            "premium_students": premium_students, "free_students": free_students,
            "premium_percentage": round((premium_students / total_students) * 100, 1) if total_students > 0 else 0
        },
        "university_breakdown": university_stats, "total_universities": len(university_stats),
        "safeguarding_summary": {
            "total_alerts": total_alerts, "unacknowledged": unacknowledged_alerts, "high_risk": high_risk_alerts
        }
    }


# ==================== ADMIN USER MANAGEMENT ====================

@router.get("/admin/reports")
async def get_reports(admin: User = Depends(require_admin)):
    reports = await db.reports.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reports


@router.post("/admin/block/{user_id}")
async def block_user(user_id: str, admin: User = Depends(require_admin)):
    result = await db.users.update_one({"user_id": user_id}, {"$set": {"blocked": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"blocked": True, "user_id": user_id}


@router.get("/admin/users")
async def get_all_users(admin: User = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return users


@router.post("/admin/make-admin/{user_id}")
async def make_admin(user_id: str, admin: User = Depends(require_admin)):
    result = await db.users.update_one({"user_id": user_id}, {"$set": {"role": "admin"}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User promoted to admin", "user_id": user_id}


@router.get("/admin/university-admins")
async def list_university_admins(admin: User = Depends(require_admin)):
    admins = await db.users.find({"role": "university_admin"}, {"_id": 0, "admin_password": 0}).to_list(100)
    return admins


@router.delete("/admin/university-admins/{user_id}")
async def delete_university_admin(user_id: str, admin: User = Depends(require_admin)):
    result = await db.users.delete_one({"user_id": user_id, "role": "university_admin"})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="University admin not found")
    return {"success": True}


# ==================== SAFEGUARDING ====================

@router.get("/admin/safeguarding-alerts/unread-count")
async def safeguarding_unread_count(admin: User = Depends(require_admin)):
    """Cheap polling endpoint for the Safeguarding nav badge."""
    unacknowledged = await db.safeguarding_alerts.count_documents({"acknowledged": False})
    high_risk = await db.safeguarding_alerts.count_documents({
        "acknowledged": False,
        "risk_level": {"$in": ["high", "critical"]},
    })
    return {"unread": unacknowledged, "high_risk": high_risk}


@router.get("/admin/safeguarding-alerts")
async def get_safeguarding_alerts(admin: User = Depends(require_admin)):
    alerts = await db.safeguarding_alerts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {
        "alerts": alerts,
        "unacknowledged_count": len([a for a in alerts if not a.get("acknowledged", False)]),
        "high_risk_count": len([a for a in alerts if a.get("risk_level") == "high"]),
        "total_count": len(alerts)
    }


@router.post("/admin/safeguarding-alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, admin: User = Depends(require_admin)):
    result = await db.safeguarding_alerts.update_one(
        {"alert_id": alert_id},
        {"$set": {"acknowledged": True, "acknowledged_by": admin.user_id, "acknowledged_at": datetime.now(timezone.utc)}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert acknowledged", "alert_id": alert_id}


@router.post("/admin/safeguarding-alerts/{alert_id}/feedback")
async def provide_alert_feedback(alert_id: str, data: AlertFeedbackRequest, admin: User = Depends(require_admin)):
    await record_alert_feedback(alert_id, data.was_true_positive, data.notes, admin.user_id)
    logger.info(f"Alert {alert_id} marked as {'true' if data.was_true_positive else 'false'} positive by {admin.email}")
    return {"success": True, "message": "Feedback recorded for AI learning"}


# ==================== AI RISK ANALYSIS ====================

@router.get("/admin/ai-risk-analysis/{user_id}")
async def admin_ai_risk_analysis(user_id: str, admin: User = Depends(require_admin)):
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    mood_entries = await db.mood_entries.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(50)
    feedback_entries = await db.feedback_entries.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(50)

    mood_data = [{"mood": e.get("mood"), "notes": e.get("notes"), "date": str(e.get("created_at"))} for e in mood_entries]
    feedback_data = [{"mood": e.get("mood"), "feedback": e.get("feedback"), "topic": e.get("lecture_topic"), "date": str(e.get("created_at"))} for e in feedback_entries]

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"admin_risk_{user_id}_{uuid.uuid4().hex[:8]}",
            system_message="""You are a student wellbeing AI assistant helping university administrators assess student risk levels.
            Analyze the student's mood entries and feedback to provide a comprehensive risk assessment.
            Provide your response in JSON format with:
            {"overall_risk_score": 0-100, "risk_level": "low"|"medium"|"high"|"critical",
             "key_concerns": [], "positive_indicators": [],
             "recommendation": "brief recommendation", "summary": "2-3 sentence summary"}"""
        ).with_model("openai", "gpt-4o")

        response = await chat.send_message(UserMessage(
            text=f"Student: {user.get('name', 'Unknown')}\nUniversity: {user.get('university')}\nCourse: {user.get('course')}\n\nMood Entries: {mood_data}\n\nFeedback Entries: {feedback_data}"
        ))

        try:
            ai_result = json.loads(response)
        except json.JSONDecodeError:
            ai_result = {"overall_risk_score": 50, "risk_level": "medium", "key_concerns": ["Unable to parse AI response"],
                         "positive_indicators": [], "recommendation": response[:500], "summary": "AI analysis returned non-JSON response"}
    except Exception as e:
        logger.error(f"Admin AI analysis error: {e}")
        avg_mood = sum(e.get("mood", 5) for e in mood_entries) / max(len(mood_entries), 1) if mood_entries else 5
        basic_risk = max(0, 100 - (avg_mood * 10))
        ai_result = {
            "overall_risk_score": round(basic_risk),
            "risk_level": "high" if basic_risk > 70 else "medium" if basic_risk > 40 else "low",
            "key_concerns": ["AI analysis unavailable - using basic scoring"],
            "positive_indicators": [], "recommendation": "Review student's data manually",
            "summary": f"Basic risk assessment based on average mood: {avg_mood:.1f}/10"
        }

    return {
        "user": {"user_id": user.get("user_id"), "name": user.get("name"), "email": user.get("email"), "university": user.get("university"), "course": user.get("course")},
        "ai_analysis": ai_result,
        "data_summary": {"total_mood_entries": len(mood_entries), "total_feedback_entries": len(feedback_entries),
                         "average_mood": sum(e.get("mood", 5) for e in mood_entries) / max(len(mood_entries), 1) if mood_entries else None}
    }


@router.get("/admin/crisis-resources")
async def get_crisis_resources(admin: User = Depends(require_admin)):
    return {"resources": CRISIS_RESOURCES, "keywords": SAFEGUARDING_KEYWORDS}


@router.get("/admin/email-config")
async def get_email_config(admin: User = Depends(require_admin)):
    return {
        "smtp_configured": is_smtp_configured(), "smtp_host": SMTP_HOST or "Not configured",
        "smtp_port": SMTP_PORT, "smtp_from_email": SMTP_FROM_EMAIL, "smtp_from_name": SMTP_FROM_NAME,
        "message": "SMTP is configured and ready" if is_smtp_configured() else "SMTP not configured"
    }


@router.post("/admin/test-email")
async def test_email_notification(admin: User = Depends(require_admin)):
    if not is_smtp_configured():
        return {"success": False, "message": "SMTP not configured", "required_env_vars": [
            "SMTP_HOST", "SMTP_PORT", "SMTP_USERNAME", "SMTP_PASSWORD"]}

    admin_emails = await get_admin_emails()
    if not admin_emails:
        return {"success": False, "message": "No admin users found"}

    test_alert = {
        "alert_id": "test_" + str(uuid.uuid4())[:8], "user_id": "test_user",
        "user_name": "Test Student", "user_email": "test@example.com", "source": "mood",
        "content": "This is a TEST email notification.", "risk_level": "medium",
        "matched_keywords": ["test keyword"],
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    }

    try:
        subject = "TEST - Safeguarding Email Notification"
        html_body = create_safeguarding_email_html(test_alert)
        text_body = create_safeguarding_email_text(test_alert)
        success = await send_email_async(admin_emails, subject, html_body, text_body)
        return {"success": success, "message": f"Test email sent to {len(admin_emails)} admin(s)" if success else "Failed", "recipients": admin_emails}
    except Exception as e:
        return {"success": False, "message": f"Error: {str(e)}"}


# ==================== DATA EXPORTS ====================

@router.get("/admin/export/students")
async def export_students_csv(admin: User = Depends(require_admin), start_date: Optional[str] = None, end_date: Optional[str] = None):
    query = {"role": "student"}
    if start_date or end_date:
        query["created_at"] = {}
        if start_date: query["created_at"]["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date: query["created_at"]["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

    students = await db.users.find(query, {"_id": 0, "hashed_password": 0}).to_list(10000)
    output = io.StringIO()
    if students:
        fieldnames = ["user_id", "email", "name", "university", "university_location", "campus_name", "course", "age", "gender", "ethnicity", "plan", "created_at"]
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        for student in students:
            student["created_at"] = str(student.get("created_at", ""))
            writer.writerow(student)
    return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=students_export.csv"})


@router.get("/admin/export/mood-history")
async def export_mood_history_csv(admin: User = Depends(require_admin), start_date: Optional[str] = None, end_date: Optional[str] = None, user_id: Optional[str] = None):
    query = {}
    if user_id: query["user_id"] = user_id
    if start_date or end_date:
        query["created_at"] = {}
        if start_date: query["created_at"]["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date: query["created_at"]["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

    mood_entries = await db.mood_entries.find(query, {"_id": 0}).sort("created_at", -1).to_list(50000)
    user_ids = list(set(e.get("user_id") for e in mood_entries))
    users = await db.users.find({"user_id": {"$in": user_ids}}, {"_id": 0, "user_id": 1, "name": 1, "email": 1}).to_list(10000)
    user_map = {u["user_id"]: u for u in users}

    output = io.StringIO()
    fieldnames = ["user_id", "user_name", "user_email", "mood", "notes", "created_at"]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
    writer.writeheader()
    for entry in mood_entries:
        user_info = user_map.get(entry.get("user_id"), {})
        writer.writerow({"user_id": entry.get("user_id"), "user_name": user_info.get("name", "Unknown"), "user_email": user_info.get("email", "Unknown"),
                         "mood": entry.get("mood"), "notes": entry.get("notes", ""), "created_at": str(entry.get("created_at", ""))})
    return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=mood_history_export.csv"})


@router.get("/admin/export/feedback-history")
async def export_feedback_history_csv(admin: User = Depends(require_admin), start_date: Optional[str] = None, end_date: Optional[str] = None, user_id: Optional[str] = None):
    query = {}
    if user_id: query["user_id"] = user_id
    if start_date or end_date:
        query["created_at"] = {}
        if start_date: query["created_at"]["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date: query["created_at"]["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

    feedback_entries = await db.feedback_entries.find(query, {"_id": 0}).sort("created_at", -1).to_list(50000)
    user_ids = list(set(e.get("user_id") for e in feedback_entries))
    users = await db.users.find({"user_id": {"$in": user_ids}}, {"_id": 0, "user_id": 1, "name": 1, "email": 1}).to_list(10000)
    user_map = {u["user_id"]: u for u in users}

    output = io.StringIO()
    fieldnames = ["user_id", "user_name", "user_email", "mood", "feedback", "lecture_topic", "risk_score", "created_at"]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
    writer.writeheader()
    for entry in feedback_entries:
        user_info = user_map.get(entry.get("user_id"), {})
        writer.writerow({"user_id": entry.get("user_id"), "user_name": user_info.get("name", "Unknown"), "user_email": user_info.get("email", "Unknown"),
                         "mood": entry.get("mood"), "feedback": entry.get("feedback", ""), "lecture_topic": entry.get("lecture_topic", ""),
                         "risk_score": entry.get("risk_score", 0), "created_at": str(entry.get("created_at", ""))})
    return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=feedback_history_export.csv"})


@router.get("/admin/export/safeguarding-alerts")
async def export_safeguarding_alerts_csv(admin: User = Depends(require_admin), start_date: Optional[str] = None, end_date: Optional[str] = None, risk_level: Optional[str] = None):
    query = {}
    if risk_level: query["risk_level"] = risk_level
    if start_date or end_date:
        query["created_at"] = {}
        if start_date: query["created_at"]["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date: query["created_at"]["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

    alerts = await db.safeguarding_alerts.find(query, {"_id": 0}).sort("created_at", -1).to_list(10000)
    output = io.StringIO()
    fieldnames = ["alert_id", "user_id", "user_name", "user_email", "source", "risk_level", "matched_keywords", "content", "acknowledged", "acknowledged_by", "created_at"]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
    writer.writeheader()
    for alert in alerts:
        writer.writerow({"alert_id": alert.get("alert_id"), "user_id": alert.get("user_id"), "user_name": alert.get("user_name"),
                         "user_email": alert.get("user_email"), "source": alert.get("source"), "risk_level": alert.get("risk_level"),
                         "matched_keywords": ", ".join(alert.get("matched_keywords", [])), "content": alert.get("content", "")[:500],
                         "acknowledged": alert.get("acknowledged", False), "acknowledged_by": alert.get("acknowledged_by", ""),
                         "created_at": str(alert.get("created_at", ""))})
    return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=safeguarding_alerts_export.csv"})


@router.get("/admin/export/subscriptions")
async def export_subscriptions_csv(admin: User = Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0}).to_list(100000)
    stripe_subs = await db.stripe_subscriptions.find({}, {"_id": 0}).to_list(10000)
    stripe_map = {s.get("user_id"): s for s in stripe_subs}

    output = io.StringIO()
    fieldnames = ["user_id", "name", "email", "subscription_status", "is_premium", "stripe_customer_id", "subscription_start", "subscription_end", "payment_status", "created_at"]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
    writer.writeheader()
    for user in users:
        stripe_info = stripe_map.get(user.get("user_id"), {})
        writer.writerow({"user_id": user.get("user_id"), "name": user.get("name"), "email": user.get("email"),
                         "subscription_status": user.get("subscription_status", "free"), "is_premium": user.get("is_premium", False),
                         "stripe_customer_id": stripe_info.get("stripe_customer_id", ""),
                         "subscription_start": str(stripe_info.get("created_at", "")), "subscription_end": str(stripe_info.get("current_period_end", "")),
                         "payment_status": stripe_info.get("status", ""), "created_at": str(user.get("created_at", ""))})
    return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=subscriptions_export.csv"})


# ==================== ANALYTICS ====================

@router.get("/admin/analytics/subscriptions")
async def get_subscription_analytics(admin: User = Depends(require_admin)):
    all_users = await db.users.find({}, {"_id": 0}).to_list(100000)
    free_users = premium_users = 0
    for user in all_users:
        if user.get("is_premium") or user.get("subscription_status") == "premium":
            premium_users += 1
        else:
            free_users += 1

    subscriptions = await db.stripe_subscriptions.find({}, {"_id": 0}).to_list(10000)
    monthly_price = 4.99
    active_subscriptions = sum(1 for s in subscriptions if s.get("status") == "active")
    monthly_revenue = active_subscriptions * monthly_price
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    recent_subscriptions = await db.stripe_subscriptions.find({"created_at": {"$gte": thirty_days_ago}}, {"_id": 0}).to_list(1000)
    cancellations = await db.stripe_subscriptions.find({"status": "cancelled"}, {"_id": 0}).to_list(1000)
    churn_rate = (len(cancellations) / max(premium_users + len(cancellations), 1)) * 100

    daily_stats = []
    for i in range(7):
        day = datetime.now(timezone.utc) - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_subs = await db.stripe_subscriptions.count_documents({"created_at": {"$gte": day_start, "$lt": day_end}})
        daily_stats.append({"date": day_start.strftime("%Y-%m-%d"), "new_subscriptions": day_subs})
    daily_stats.reverse()

    return {
        "total_users": len(all_users), "free_users": free_users, "premium_users": premium_users,
        "conversion_rate": round((premium_users / max(len(all_users), 1)) * 100, 2),
        "active_subscriptions": active_subscriptions, "monthly_revenue": round(monthly_revenue, 2),
        "annual_revenue_estimate": round(monthly_revenue * 12, 2),
        "new_subscriptions_30d": len(recent_subscriptions),
        "cancelled_subscriptions": len(cancellations), "churn_rate": round(churn_rate, 2),
        "daily_stats": daily_stats, "currency": "GBP"
    }


@router.get("/admin/analytics/mood-trends")
async def get_mood_trends(admin: User = Depends(require_admin), start_date: Optional[str] = None, end_date: Optional[str] = None, group_by: str = "day"):
    query = {}
    if not start_date:
        start_date = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    query["created_at"] = {"$gte": datetime.fromisoformat(start_date.replace('Z', '+00:00'))}
    if end_date:
        query["created_at"]["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

    mood_entries = await db.mood_entries.find(query, {"_id": 0}).sort("created_at", 1).to_list(100000)
    trends = {}
    for entry in mood_entries:
        created_at = entry.get("created_at")
        if not created_at: continue
        if group_by == "day": key = created_at.strftime("%Y-%m-%d")
        elif group_by == "week": key = created_at.strftime("%Y-W%W")
        else: key = created_at.strftime("%Y-%m")
        if key not in trends: trends[key] = {"total_mood": 0, "count": 0}
        trends[key]["total_mood"] += entry.get("mood", 5)
        trends[key]["count"] += 1

    result = [{"date": k, "average_mood": round(v["total_mood"] / v["count"], 2), "entry_count": v["count"]} for k, v in sorted(trends.items())]
    return {"trends": result, "group_by": group_by}


@router.get("/admin/analytics/university-comparison")
async def get_university_comparison(admin: User = Depends(require_admin), start_date: Optional[str] = None, end_date: Optional[str] = None):
    students = await db.users.find({"role": "student", "university": {"$exists": True, "$ne": None}}, {"_id": 0, "user_id": 1, "university": 1}).to_list(10000)
    university_users = {}
    for student in students:
        uni = student.get("university", "Unknown")
        university_users.setdefault(uni, []).append(student["user_id"])

    date_query = {}
    if start_date: date_query["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    if end_date: date_query["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

    comparison = []
    for university, user_ids in university_users.items():
        mood_query = {"user_id": {"$in": user_ids}}
        if date_query: mood_query["created_at"] = date_query
        mood_entries = await db.mood_entries.find(mood_query, {"_id": 0, "mood": 1}).to_list(50000)
        feedback_count = await db.feedback_entries.count_documents(mood_query)
        avg_mood = sum(e.get("mood", 5) for e in mood_entries) / len(mood_entries) if mood_entries else 0
        alert_query = {"user_id": {"$in": user_ids}}
        if date_query: alert_query["created_at"] = date_query
        alert_count = await db.safeguarding_alerts.count_documents(alert_query)
        comparison.append({"university": university, "student_count": len(user_ids), "average_mood": round(avg_mood, 2),
                           "mood_entries": len(mood_entries), "feedback_entries": feedback_count,
                           "safeguarding_alerts": alert_count, "engagement_rate": round(len(mood_entries) / max(len(user_ids), 1), 2)})
    comparison.sort(key=lambda x: x["student_count"], reverse=True)
    return {"universities": comparison}


@router.get("/admin/analytics/risk-distribution")
async def get_risk_distribution(admin: User = Depends(require_admin), start_date: Optional[str] = None, end_date: Optional[str] = None):
    query = {}
    if start_date or end_date:
        query["created_at"] = {}
        if start_date: query["created_at"]["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date: query["created_at"]["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

    feedback_entries = await db.feedback_entries.find(query, {"_id": 0, "risk_score": 1}).to_list(50000)
    distribution = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    for entry in feedback_entries:
        score = entry.get("risk_score", 0)
        if score <= 30: distribution["low"] += 1
        elif score <= 60: distribution["medium"] += 1
        elif score <= 80: distribution["high"] += 1
        else: distribution["critical"] += 1

    alerts = await db.safeguarding_alerts.find(query.copy(), {"_id": 0, "risk_level": 1}).to_list(10000)
    alert_distribution = {"high": 0, "medium": 0}
    for a in alerts:
        level = a.get("risk_level", "medium")
        if level in alert_distribution: alert_distribution[level] += 1

    return {"risk_score_distribution": distribution, "safeguarding_alert_distribution": alert_distribution,
            "total_feedback_entries": len(feedback_entries), "total_safeguarding_alerts": len(alerts)}


@router.post("/admin/analytics/bulk-ai-analysis")
async def bulk_ai_analysis(admin: User = Depends(require_admin), university: Optional[str] = None, limit: int = 50):
    query = {"role": "student"}
    if university: query["university"] = university
    students = await db.users.find(query, {"_id": 0}).limit(limit).to_list(limit)

    results = []
    high_risk_count = medium_risk_count = 0
    for student in students:
        user_id = student.get("user_id")
        mood_entries = await db.mood_entries.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).limit(20).to_list(20)
        if mood_entries:
            avg_mood = sum(e.get("mood", 5) for e in mood_entries) / len(mood_entries)
            risk_score = max(0, 100 - (avg_mood * 10))
        else:
            avg_mood = None; risk_score = 50
        alert_count = await db.safeguarding_alerts.count_documents({"user_id": user_id})
        if risk_score > 70 or alert_count > 0: risk_level = "high"; high_risk_count += 1
        elif risk_score > 40: risk_level = "medium"; medium_risk_count += 1
        else: risk_level = "low"
        results.append({"user_id": user_id, "name": student.get("name"), "email": student.get("email"),
                         "university": student.get("university"), "average_mood": round(avg_mood, 2) if avg_mood else None,
                         "risk_score": round(risk_score), "risk_level": risk_level,
                         "mood_entries_count": len(mood_entries), "safeguarding_alerts": alert_count})
    results.sort(key=lambda x: x["risk_score"], reverse=True)
    return {"students_analyzed": len(results), "high_risk_count": high_risk_count, "medium_risk_count": medium_risk_count,
            "low_risk_count": len(results) - high_risk_count - medium_risk_count, "university_filter": university, "results": results}


@router.get("/admin/universities")
async def get_universities_list(admin: User = Depends(require_admin)):
    pipeline = [
        {"$match": {"role": "student", "university": {"$exists": True, "$ne": None, "$ne": ""}}},
        {"$group": {"_id": "$university", "student_count": {"$sum": 1}}},
        {"$sort": {"student_count": -1}}
    ]
    universities = await db.users.aggregate(pipeline).to_list(100)
    result = [{"name": uni["_id"], "student_count": uni["student_count"]} for uni in universities if uni["_id"]]
    return {"universities": result, "total_universities": len(result)}


@router.get("/admin/university/{university_name}/students")
async def get_university_students_admin(university_name: str, admin: User = Depends(require_admin)):
    university_decoded = urllib.parse.unquote(university_name)
    students = await db.users.find(
        {"role": "student", "university": {"$regex": f"^{university_decoded}$", "$options": "i"}},
        {"_id": 0, "admin_password": 0}
    ).to_list(1000)

    enriched_students = []
    user_ids = [s.get("user_id") for s in students if s.get("user_id")]
    bulk = await _bulk_mood_and_alerts(user_ids, mood_limit=30)
    for student in students:
        user_id = student.get("user_id")
        b = bulk.get(user_id, {"avg_mood": None, "mood_count": 0, "alert_count": 0})
        avg_mood = b["avg_mood"]
        alert_count = b["alert_count"]
        risk_score = max(0, 100 - (avg_mood * 10)) if avg_mood else 50
        risk_level = "high" if alert_count > 0 or risk_score > 70 else "medium" if risk_score > 40 else "low"
        enriched_students.append({
            "user_id": user_id, "name": student.get("name"), "email": student.get("email"),
            "course": student.get("course"), "campus_name": student.get("campus_name"),
            "average_mood": round(avg_mood, 2) if avg_mood else None, "mood_entries_count": b["mood_count"],
            "safeguarding_alerts": alert_count, "risk_score": round(risk_score), "risk_level": risk_level,
            "created_at": str(student.get("created_at", ""))
        })
    enriched_students.sort(key=lambda x: x["risk_score"], reverse=True)
    high_risk = len([s for s in enriched_students if s["risk_level"] == "high"])
    medium_risk = len([s for s in enriched_students if s["risk_level"] == "medium"])
    return {"university": university_decoded, "total_students": len(enriched_students),
            "high_risk_count": high_risk, "medium_risk_count": medium_risk,
            "low_risk_count": len(enriched_students) - high_risk - medium_risk, "students": enriched_students}


@router.post("/admin/university/{university_name}/ai-analysis")
async def university_ai_analysis(university_name: str, admin: User = Depends(require_admin)):
    university_decoded = urllib.parse.unquote(university_name)
    students = await db.users.find(
        {"role": "student", "university": {"$regex": f"^{university_decoded}$", "$options": "i"}}, {"_id": 0}
    ).to_list(500)
    if not students:
        raise HTTPException(status_code=404, detail="No students found for this university")

    all_mood_data = []; all_feedback_data = []; student_summaries = []
    user_ids = [s.get("user_id") for s in students if s.get("user_id")]

    # Batch-fetch all mood and feedback entries (limited per user) + alert counts.
    all_moods_by_user: dict[str, list] = {uid: [] for uid in user_ids}
    async for m in db.mood_entries.find({"user_id": {"$in": user_ids}}, {"_id": 0}).sort("created_at", -1):
        bucket = all_moods_by_user.get(m["user_id"])
        if bucket is not None and len(bucket) < 30:
            bucket.append(m)

    all_fb_by_user: dict[str, list] = {uid: [] for uid in user_ids}
    async for f in db.feedback_entries.find({"user_id": {"$in": user_ids}}, {"_id": 0}).sort("created_at", -1):
        bucket = all_fb_by_user.get(f["user_id"])
        if bucket is not None and len(bucket) < 20:
            bucket.append(f)

    alert_counts = {r["_id"]: r["c"] async for r in db.safeguarding_alerts.aggregate([
        {"$match": {"user_id": {"$in": user_ids}}},
        {"$group": {"_id": "$user_id", "c": {"$sum": 1}}},
    ])}

    for student in students:
        user_id = student.get("user_id")
        mood_entries = all_moods_by_user.get(user_id, [])
        feedback_entries = all_fb_by_user.get(user_id, [])
        alert_count = alert_counts.get(user_id, 0)
        avg_mood = sum(e.get("mood", 5) for e in mood_entries) / len(mood_entries) if mood_entries else None
        all_mood_data.extend(mood_entries); all_feedback_data.extend(feedback_entries)
        student_summaries.append({"name": student.get("name"), "course": student.get("course"),
                                  "avg_mood": round(avg_mood, 1) if avg_mood else "N/A", "mood_count": len(mood_entries), "alerts": alert_count})

    total_moods = [e.get("mood", 5) for e in all_mood_data]
    university_avg_mood = sum(total_moods) / len(total_moods) if total_moods else 0

    try:
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"uni_analysis_{uuid.uuid4().hex[:8]}",
            system_message="""You are a university student wellbeing analyst. Provide response in JSON:
{"overall_wellbeing_score": 0-100, "wellbeing_trend": "improving"|"stable"|"declining",
 "key_concerns": [], "positive_aspects": [], "recommendations": [],
 "priority_interventions": [], "summary": "2-3 sentence summary"}"""
        ).with_model("openai", "gpt-4o")
        response = await chat.send_message(UserMessage(
            text=f"University: {university_decoded}\nStudents: {len(students)}\nAvg Mood: {university_avg_mood:.1f}/10\nSummaries: {student_summaries[:20]}"
        ))
        try: ai_analysis = json.loads(response)
        except json.JSONDecodeError:
            ai_analysis = {"overall_wellbeing_score": round(university_avg_mood * 10), "wellbeing_trend": "stable",
                           "key_concerns": ["Unable to parse AI response"], "positive_aspects": [], "recommendations": [response[:500]],
                           "priority_interventions": [], "summary": "AI returned non-JSON"}
    except Exception as e:
        logger.error(f"University AI analysis error: {e}")
        ai_analysis = {"overall_wellbeing_score": round(university_avg_mood * 10), "wellbeing_trend": "stable",
                       "key_concerns": ["AI unavailable"], "positive_aspects": [], "recommendations": ["Manual review recommended"],
                       "priority_interventions": [], "summary": f"Basic: Avg mood {university_avg_mood:.1f}/10 across {len(students)} students"}

    return {"university": university_decoded, "analysis_timestamp": datetime.now(timezone.utc).isoformat(),
            "stats": {"total_students": len(students), "average_mood": round(university_avg_mood, 2),
                      "total_mood_entries": len(all_mood_data), "total_feedback_entries": len(all_feedback_data)},
            "ai_analysis": ai_analysis}


# ==================== ANALYTICS OVERVIEW & RETENTION ====================

async def calculate_student_engagement(user_id: str) -> dict:
    """Single-user engagement stats. Kept for the per-student detail endpoint."""
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7); month_ago = now - timedelta(days=30)
    mood_entries_week = await db.mood_entries.count_documents({"user_id": user_id, "created_at": {"$gte": week_ago}})
    mood_entries_month = await db.mood_entries.count_documents({"user_id": user_id, "created_at": {"$gte": month_ago}})
    feedback_entries_week = await db.feedback_entries.count_documents({"user_id": user_id, "created_at": {"$gte": week_ago}})
    feedback_entries_month = await db.feedback_entries.count_documents({"user_id": user_id, "created_at": {"$gte": month_ago}})
    chat_messages_week = await db.chat_messages.count_documents({"sender_id": user_id, "created_at": {"$gte": week_ago}})
    matches_count = await db.matches.count_documents({"user_id": user_id, "status": "accepted"})
    engagement_score = min(100, mood_entries_week * 10 + feedback_entries_week * 15 + chat_messages_week * 5 + matches_count * 5)
    recent_moods = await db.mood_entries.find({"user_id": user_id, "created_at": {"$gte": month_ago}}, {"mood": 1}).to_list(100)
    avg_mood = sum(m["mood"] for m in recent_moods) / len(recent_moods) if recent_moods else 0
    recent_risks = await db.risk_scores.find({"user_id": user_id, "created_at": {"$gte": month_ago}}, {"risk_score": 1}).to_list(100)
    avg_risk = sum(r["risk_score"] for r in recent_risks) / len(recent_risks) if recent_risks else 0
    return {"engagement_score": engagement_score, "mood_entries_week": mood_entries_week, "mood_entries_month": mood_entries_month,
            "feedback_entries_week": feedback_entries_week, "feedback_entries_month": feedback_entries_month,
            "chat_messages_week": chat_messages_week, "matches_count": matches_count,
            "average_mood": round(avg_mood, 1), "average_risk": round(avg_risk, 1)}


async def _bulk_engagement_stats(user_ids: list[str]) -> dict[str, dict]:
    """
    Batch version of `calculate_student_engagement` — computes engagement for every user_id
    in `user_ids` in a constant number of MongoDB round-trips (6 aggregations + 2 counts)
    instead of N*6. Returns: {user_id: engagement_dict}.
    """
    if not user_ids:
        return {}
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    in_filter = {"$in": user_ids}

    # Per-user weekly mood entry counts.
    mood_week = {r["_id"]: r["c"] async for r in db.mood_entries.aggregate([
        {"$match": {"user_id": in_filter, "created_at": {"$gte": week_ago}}},
        {"$group": {"_id": "$user_id", "c": {"$sum": 1}}},
    ])}
    # Per-user monthly mood entry counts + avg mood.
    mood_month = {r["_id"]: r async for r in db.mood_entries.aggregate([
        {"$match": {"user_id": in_filter, "created_at": {"$gte": month_ago}}},
        {"$group": {"_id": "$user_id", "c": {"$sum": 1}, "avg": {"$avg": "$mood"}}},
    ])}
    # Per-user weekly + monthly feedback entry counts.
    fb_week = {r["_id"]: r["c"] async for r in db.feedback_entries.aggregate([
        {"$match": {"user_id": in_filter, "created_at": {"$gte": week_ago}}},
        {"$group": {"_id": "$user_id", "c": {"$sum": 1}}},
    ])}
    fb_month = {r["_id"]: r["c"] async for r in db.feedback_entries.aggregate([
        {"$match": {"user_id": in_filter, "created_at": {"$gte": month_ago}}},
        {"$group": {"_id": "$user_id", "c": {"$sum": 1}}},
    ])}
    # Per-user weekly chat-message counts (sender side).
    chat_week = {r["_id"]: r["c"] async for r in db.chat_messages.aggregate([
        {"$match": {"sender_id": in_filter, "created_at": {"$gte": week_ago}}},
        {"$group": {"_id": "$sender_id", "c": {"$sum": 1}}},
    ])}
    # Per-user accepted matches.
    matches_cnt = {r["_id"]: r["c"] async for r in db.matches.aggregate([
        {"$match": {"user_id": in_filter, "status": "accepted"}},
        {"$group": {"_id": "$user_id", "c": {"$sum": 1}}},
    ])}
    # Per-user monthly avg risk score.
    risk_avg = {r["_id"]: r["avg"] async for r in db.risk_scores.aggregate([
        {"$match": {"user_id": in_filter, "created_at": {"$gte": month_ago}}},
        {"$group": {"_id": "$user_id", "avg": {"$avg": "$risk_score"}}},
    ])}

    out = {}
    for uid in user_ids:
        m_week = mood_week.get(uid, 0)
        m_month_doc = mood_month.get(uid, {"c": 0, "avg": 0})
        m_month = m_month_doc.get("c", 0)
        avg_mood = m_month_doc.get("avg") or 0
        f_week = fb_week.get(uid, 0)
        f_month = fb_month.get(uid, 0)
        c_week = chat_week.get(uid, 0)
        m_cnt = matches_cnt.get(uid, 0)
        avg_risk = risk_avg.get(uid) or 0
        engagement_score = min(100, m_week * 10 + f_week * 15 + c_week * 5 + m_cnt * 5)
        out[uid] = {
            "engagement_score": engagement_score,
            "mood_entries_week": m_week, "mood_entries_month": m_month,
            "feedback_entries_week": f_week, "feedback_entries_month": f_month,
            "chat_messages_week": c_week, "matches_count": m_cnt,
            "average_mood": round(avg_mood, 1), "average_risk": round(avg_risk, 1),
        }
    return out


async def _bulk_mood_and_alerts(user_ids: list[str], mood_limit: int = 30) -> dict[str, dict]:
    """
    Returns per-user {avg_mood, mood_count, alert_count} computed with 2 aggregations + 1 count agg.
    avg_mood is computed from the most-recent up-to-`mood_limit` mood entries per user.
    """
    if not user_ids:
        return {}
    in_filter = {"$in": user_ids}
    # Avg + count over the most recent N mood entries per user.
    mood_stats = {}
    async for r in db.mood_entries.aggregate([
        {"$match": {"user_id": in_filter}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": "$user_id",
            "moods": {"$push": "$mood"},
        }},
    ]):
        moods = (r.get("moods") or [])[:mood_limit]
        if moods:
            mood_stats[r["_id"]] = {"avg_mood": sum(moods) / len(moods), "mood_count": len(moods)}
        else:
            mood_stats[r["_id"]] = {"avg_mood": None, "mood_count": 0}

    alerts = {r["_id"]: r["c"] async for r in db.safeguarding_alerts.aggregate([
        {"$match": {"user_id": in_filter}},
        {"$group": {"_id": "$user_id", "c": {"$sum": 1}}},
    ])}

    out = {}
    for uid in user_ids:
        m = mood_stats.get(uid, {"avg_mood": None, "mood_count": 0})
        out[uid] = {
            "avg_mood": m["avg_mood"],
            "mood_count": m["mood_count"],
            "alert_count": alerts.get(uid, 0),
        }
    return out


@router.get("/admin/analytics/overview")
async def get_analytics_overview(admin: User = Depends(require_admin)):
    now = datetime.now(timezone.utc); week_ago = now - timedelta(days=7); month_ago = now - timedelta(days=30)
    total_students = await db.users.count_documents({"role": "student"})
    active_mood = await db.mood_entries.distinct("user_id", {"created_at": {"$gte": week_ago}})
    active_feedback = await db.feedback_entries.distinct("user_id", {"created_at": {"$gte": week_ago}})
    active_chat = await db.chat_messages.distinct("sender_id", {"created_at": {"$gte": week_ago}})
    active_users = set(active_mood + active_feedback + active_chat)
    engagement_rate = (len(active_users) / total_students * 100) if total_students > 0 else 0
    all_moods = await db.mood_entries.find({"created_at": {"$gte": month_ago}}, {"mood": 1}).to_list(10000)
    platform_avg_mood = sum(m["mood"] for m in all_moods) / len(all_moods) if all_moods else 0
    high_risk = await db.risk_scores.distinct("user_id", {"risk_score": {"$gte": 70}, "created_at": {"$gte": week_ago}})
    medium_risk = await db.risk_scores.distinct("user_id", {"risk_score": {"$gte": 40, "$lt": 70}, "created_at": {"$gte": week_ago}})
    low_risk = await db.risk_scores.distinct("user_id", {"risk_score": {"$lt": 40}, "created_at": {"$gte": week_ago}})
    uni_stats = await db.users.aggregate([
        {"$match": {"role": "student", "university": {"$ne": None}}},
        {"$group": {"_id": "$university", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}, {"$limit": 10}
    ]).to_list(10)
    return {"total_students": total_students, "active_students_week": len(active_users),
            "engagement_rate": round(engagement_rate, 1), "platform_average_mood": round(platform_avg_mood, 1),
            "high_risk_count": len(high_risk), "medium_risk_count": len(medium_risk), "low_risk_count": len(low_risk),
            "university_breakdown": [{"university": u["_id"], "students": u["count"]} for u in uni_stats]}


@router.get("/admin/analytics/at-risk-students")
async def get_at_risk_students(admin: User = Depends(require_admin)):
    students = await db.users.find({"role": "student"}, {"_id": 0}).to_list(1000)
    user_ids = [s["user_id"] for s in students if s.get("user_id")]
    engagement_map = await _bulk_engagement_stats(user_ids)
    at_risk_students = []
    for student in students:
        engagement = engagement_map.get(student["user_id"], {
            "engagement_score": 0, "average_mood": 0, "average_risk": 0,
            "mood_entries_week": 0, "feedback_entries_week": 0, "matches_count": 0,
        })
        risk_factors = []; dropout_risk = 0
        if engagement["engagement_score"] < 20: risk_factors.append("Very low platform engagement"); dropout_risk += 30
        elif engagement["engagement_score"] < 40: risk_factors.append("Low platform engagement"); dropout_risk += 15
        if 0 < engagement["average_mood"] < 4: risk_factors.append("Consistently low mood"); dropout_risk += 25
        elif 0 < engagement["average_mood"] < 6: risk_factors.append("Below average mood"); dropout_risk += 10
        if engagement["average_risk"] > 70: risk_factors.append("High wellbeing risk score"); dropout_risk += 30
        elif engagement["average_risk"] > 50: risk_factors.append("Elevated wellbeing risk"); dropout_risk += 15
        if engagement["mood_entries_week"] == 0 and engagement["feedback_entries_week"] == 0: risk_factors.append("No recent activity"); dropout_risk += 20
        if engagement["matches_count"] == 0: risk_factors.append("No peer connections"); dropout_risk += 10
        dropout_risk = min(100, dropout_risk)
        if dropout_risk >= 30:
            at_risk_students.append({"user_id": student["user_id"], "name": student.get("name", "Unknown"),
                "email": student.get("email", ""), "university": student.get("university"), "course": student.get("course"),
                "dropout_risk": dropout_risk, "risk_level": "High" if dropout_risk >= 60 else "Medium" if dropout_risk >= 40 else "Low",
                "risk_factors": risk_factors, "engagement_score": engagement["engagement_score"],
                "average_mood": engagement["average_mood"],
                "last_activity": {"mood_entries_week": engagement["mood_entries_week"], "feedback_entries_week": engagement["feedback_entries_week"]}})
    at_risk_students.sort(key=lambda x: x["dropout_risk"], reverse=True)
    return {"total_at_risk": len(at_risk_students),
            "high_risk": len([s for s in at_risk_students if s["risk_level"] == "High"]),
            "medium_risk": len([s for s in at_risk_students if s["risk_level"] == "Medium"]),
            "students": at_risk_students[:50]}


@router.get("/admin/analytics/student/{user_id}")
async def get_student_analytics(user_id: str, admin: User = Depends(require_admin)):
    student = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not student: raise HTTPException(status_code=404, detail="Student not found")
    engagement = await calculate_student_engagement(user_id)
    mood_history = await db.mood_entries.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(30)
    feedback_history = await db.feedback_entries.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(20)
    risk_history = await db.risk_scores.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(30)
    return {"student": student, "engagement": engagement, "mood_history": mood_history, "feedback_history": feedback_history, "risk_history": risk_history}


@router.get("/admin/analytics/retention")
async def get_retention_analytics(admin: User = Depends(require_admin)):
    now = datetime.now(timezone.utc); week_ago = now - timedelta(days=7); month_ago = now - timedelta(days=30)
    universities = await db.users.distinct("university", {"role": "student", "university": {"$ne": None}})
    retention_data = []
    for uni in universities:
        if not uni: continue
        total_students = await db.users.count_documents({"role": "student", "university": uni})
        uni_students = await db.users.find({"role": "student", "university": uni}, {"user_id": 1}).to_list(1000)
        uni_user_ids = [s["user_id"] for s in uni_students]
        active_week = await db.mood_entries.distinct("user_id", {"user_id": {"$in": uni_user_ids}, "created_at": {"$gte": week_ago}})
        active_month = await db.mood_entries.distinct("user_id", {"user_id": {"$in": uni_user_ids}, "created_at": {"$gte": month_ago}})
        uni_moods = await db.mood_entries.find({"user_id": {"$in": uni_user_ids}, "created_at": {"$gte": month_ago}}, {"mood": 1}).to_list(10000)
        avg_mood = sum(m["mood"] for m in uni_moods) / len(uni_moods) if uni_moods else 0
        at_risk = await db.risk_scores.distinct("user_id", {"user_id": {"$in": uni_user_ids}, "risk_score": {"$gte": 60}, "created_at": {"$gte": week_ago}})
        weekly_retention = (len(active_week) / total_students * 100) if total_students > 0 else 0
        monthly_retention = (len(active_month) / total_students * 100) if total_students > 0 else 0
        retention_data.append({"university": uni, "total_students": total_students,
            "active_weekly": len(active_week), "active_monthly": len(active_month),
            "weekly_retention_rate": round(weekly_retention, 1), "monthly_retention_rate": round(monthly_retention, 1),
            "average_mood": round(avg_mood, 1), "at_risk_count": len(at_risk),
            "health_status": "Good" if avg_mood >= 6 and weekly_retention >= 50 else "Attention Needed" if avg_mood >= 4 else "Critical"})
    retention_data.sort(key=lambda x: x["weekly_retention_rate"], reverse=True)
    return {"universities": retention_data, "total_universities": len(retention_data)}


@router.post("/admin/analytics/ai-insights")
async def get_ai_insights(admin: User = Depends(require_admin)):
    now = datetime.now(timezone.utc); month_ago = now - timedelta(days=30)
    total_students = await db.users.count_documents({"role": "student"})
    all_moods = await db.mood_entries.find({"created_at": {"$gte": month_ago}}, {"mood": 1, "user_id": 1}).to_list(10000)
    mood_distribution = {i: 0 for i in range(1, 11)}
    for m in all_moods: mood_distribution[m["mood"]] = mood_distribution.get(m["mood"], 0) + 1
    risk_scores = await db.risk_scores.find({"created_at": {"$gte": month_ago}}, {"risk_score": 1}).to_list(10000)
    high_risk = len([r for r in risk_scores if r["risk_score"] >= 70])
    medium_risk = len([r for r in risk_scores if 40 <= r["risk_score"] < 70])
    low_risk = len([r for r in risk_scores if r["risk_score"] < 40])
    uni_counts = await db.users.aggregate([
        {"$match": {"role": "student", "university": {"$ne": None}}},
        {"$group": {"_id": "$university", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}, {"$limit": 5}
    ]).to_list(5)

    try:
        chat = LlmChat(api_key=EMERGENT_LLM_KEY, session_id=f"admin_insights_{uuid.uuid4().hex[:8]}",
            system_message="""You are an educational analytics AI. Respond in JSON:
{"summary": "overview", "retention_insights": [], "dropout_risk_factors": [],
 "recommendations": [], "priority_actions": [], "positive_trends": []}"""
        ).with_model("openai", "gpt-4o")
        response = await chat.send_message(UserMessage(
            text=f"Platform (30d): Students={total_students}, Moods={len(all_moods)}, Distribution={mood_distribution}, Risk: H={high_risk} M={medium_risk} L={low_risk}, Unis={[{'name': u['_id'], 'students': u['count']} for u in uni_counts]}"
        ))
        try: insights = json.loads(response)
        except json.JSONDecodeError: insights = {"summary": response, "retention_insights": [], "dropout_risk_factors": [], "recommendations": [], "priority_actions": [], "positive_trends": []}
    except Exception as e:
        logger.error(f"AI insights error: {e}")
        insights = {"summary": "Unable to generate AI insights", "retention_insights": [], "dropout_risk_factors": [], "recommendations": [], "priority_actions": [], "positive_trends": []}

    return {"insights": insights, "data_summary": {"total_students": total_students, "mood_entries_count": len(all_moods),
            "high_risk_count": high_risk, "medium_risk_count": medium_risk, "low_risk_count": low_risk}}


# ==================== AI LEARNING ====================

@router.get("/admin/ai-learning/keywords")
async def get_learned_keywords(status: Optional[str] = None, admin: User = Depends(require_admin)):
    query = {}
    if status: query["status"] = status
    keywords = await db.ai_learned_keywords.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    pending_count = await db.ai_learned_keywords.count_documents({"status": "pending"})
    approved_count = await db.ai_learned_keywords.count_documents({"status": "approved"})
    rejected_count = await db.ai_learned_keywords.count_documents({"status": "rejected"})
    return {"keywords": keywords, "stats": {"pending": pending_count, "approved": approved_count, "rejected": rejected_count, "total": pending_count + approved_count + rejected_count}}


@router.post("/admin/ai-learning/keywords/{keyword_id}/action")
async def action_keyword(keyword_id: str, data: KeywordActionRequest, admin: User = Depends(require_admin)):
    keyword = await db.ai_learned_keywords.find_one({"keyword_id": keyword_id})
    if not keyword: raise HTTPException(status_code=404, detail="Keyword not found")
    update_data = {"status": "approved" if data.action == "approve" else "rejected", "approved_by": admin.user_id, "updated_at": datetime.now(timezone.utc)}
    if data.risk_category: update_data["risk_category"] = data.risk_category
    await db.ai_learned_keywords.update_one({"keyword_id": keyword_id}, {"$set": update_data})
    if data.action == "approve":
        AI_LEARNED_KEYWORDS.add(keyword["keyword"].lower())
        logger.info(f"Admin {admin.email} approved keyword: {keyword['keyword']}")
    return {"success": True, "message": f"Keyword {data.action}d"}


@router.get("/admin/ai-learning/insights")
async def get_learning_insights(limit: int = 50, admin: User = Depends(require_admin)):
    insights = await db.ai_learning_insights.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    unreviewed = await db.ai_learning_insights.count_documents({"reviewed": False})
    return {"insights": insights, "unreviewed_count": unreviewed}


@router.post("/admin/ai-learning/insights/{insight_id}/review")
async def review_insight(insight_id: str, action: str = "reviewed", admin: User = Depends(require_admin)):
    await db.ai_learning_insights.update_one({"insight_id": insight_id}, {"$set": {"reviewed": True, "reviewed_by": admin.user_id, "action_taken": action}})
    return {"success": True}


@router.get("/admin/ai-learning/stats")
async def get_ai_learning_stats(admin: User = Depends(require_admin)):
    keyword_stats = {"pending": await db.ai_learned_keywords.count_documents({"status": "pending"}),
                     "approved": await db.ai_learned_keywords.count_documents({"status": "approved"}),
                     "rejected": await db.ai_learned_keywords.count_documents({"status": "rejected"})}
    alert_stats = {"total_with_feedback": await db.safeguarding_alerts.count_documents({"was_true_positive": {"$exists": True}}),
                   "true_positives": await db.safeguarding_alerts.count_documents({"was_true_positive": True}),
                   "false_positives": await db.safeguarding_alerts.count_documents({"was_true_positive": False})}
    alert_stats["accuracy_rate"] = round((alert_stats["true_positives"] / alert_stats["total_with_feedback"]) * 100, 1) if alert_stats["total_with_feedback"] > 0 else None
    insight_stats = {"total": await db.ai_learning_insights.count_documents({}),
                     "unreviewed": await db.ai_learning_insights.count_documents({"reviewed": False}), "by_type": {}}
    for it in await db.ai_learning_insights.aggregate([{"$group": {"_id": "$insight_type", "count": {"$sum": 1}}}]).to_list(20):
        insight_stats["by_type"][it["_id"]] = it["count"]
    keyword_coverage = {"built_in": len(SAFEGUARDING_KEYWORDS), "learned_approved": keyword_stats["approved"],
                        "total_active": len(SAFEGUARDING_KEYWORDS) + keyword_stats["approved"]}
    return {"keywords": keyword_stats, "alerts": alert_stats, "insights": insight_stats, "keyword_coverage": keyword_coverage, "learning_active": True}


@router.post("/admin/ai-learning/trigger-analysis")
async def trigger_behavioral_analysis(admin: User = Depends(require_admin)):
    await detect_behavioral_anomalies()
    return {"success": True, "message": "Behavioral analysis completed"}
