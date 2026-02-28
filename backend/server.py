from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx
from emergentintegrations.llm.chat import LlmChat, UserMessage
import stripe
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

# Stripe Configuration
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
stripe.api_key = STRIPE_SECRET_KEY

# Stripe Price Configuration (£4.99/month)
STRIPE_PRICE_AMOUNT = 499  # in pence
STRIPE_PRICE_CURRENCY = "gbp"
STRIPE_PRODUCT_NAME = "Educare Premium"

# Swipe limits
FREE_SWIPES_PER_DAY = 5

# ==================== SMTP EMAIL CONFIGURATION ====================
# SMTP Configuration for Admin Email Notifications
# Configure these in your .env file when ready:
# SMTP_HOST=smtp.gmail.com (or your SMTP server)
# SMTP_PORT=587
# SMTP_USERNAME=your-email@gmail.com
# SMTP_PASSWORD=your-app-password
# SMTP_FROM_EMAIL=noreply@educare.com
# SMTP_FROM_NAME=Educare Safeguarding

SMTP_HOST = os.environ.get('SMTP_HOST', '')
SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
SMTP_USERNAME = os.environ.get('SMTP_USERNAME', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
SMTP_FROM_EMAIL = os.environ.get('SMTP_FROM_EMAIL', 'noreply@educare.com')
SMTP_FROM_NAME = os.environ.get('SMTP_FROM_NAME', 'Educare Safeguarding')

def is_smtp_configured() -> bool:
    """Check if SMTP is properly configured"""
    return bool(SMTP_HOST and SMTP_USERNAME and SMTP_PASSWORD)

def send_email_sync(to_emails: List[str], subject: str, html_body: str, text_body: str = None):
    """
    Send email via SMTP (synchronous version for threading)
    """
    if not is_smtp_configured():
        logger.warning("SMTP not configured - email notification skipped")
        return False
    
    if not to_emails:
        logger.warning("No recipient emails provided")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        msg['To'] = ', '.join(to_emails)
        
        # Attach plain text and HTML versions
        if text_body:
            part1 = MIMEText(text_body, 'plain')
            msg.attach(part1)
        
        part2 = MIMEText(html_body, 'html')
        msg.attach(part2)
        
        # Connect and send
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL, to_emails, msg.as_string())
        
        logger.info(f"Email sent successfully to {len(to_emails)} recipients")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False

async def send_email_async(to_emails: List[str], subject: str, html_body: str, text_body: str = None):
    """
    Send email via SMTP (async wrapper)
    """
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, send_email_sync, to_emails, subject, html_body, text_body)

async def get_admin_emails() -> List[str]:
    """
    Get all admin user emails from the database
    """
    admins = await db.users.find(
        {"role": "admin"},
        {"_id": 0, "email": 1}
    ).to_list(100)
    
    return [admin["email"] for admin in admins if admin.get("email")]

def create_safeguarding_email_html(alert_data: dict) -> str:
    """
    Create HTML email body for safeguarding alert
    """
    risk_color = "#EF4444" if alert_data["risk_level"] == "high" else "#F59E0B"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #111827; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
            .alert-badge {{ display: inline-block; background: {risk_color}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; text-transform: uppercase; }}
            .content {{ background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }}
            .info-row {{ margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }}
            .label {{ font-weight: bold; color: #6b7280; }}
            .keywords {{ background: #fef2f2; border: 1px solid #fecaca; padding: 10px; border-radius: 4px; margin: 10px 0; }}
            .keyword-tag {{ display: inline-block; background: #EF4444; color: white; padding: 4px 8px; border-radius: 4px; margin: 2px; font-size: 12px; }}
            .content-box {{ background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 15px 0; }}
            .action-btn {{ display: inline-block; background: #6366F1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }}
            .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🛡️ Educare Safeguarding Alert</h1>
                <div class="alert-badge">{alert_data["risk_level"]} RISK</div>
            </div>
            <div class="content">
                <p>A safeguarding concern has been detected and requires your attention.</p>
                
                <div class="info-row">
                    <span class="label">Student:</span> {alert_data["user_name"]}
                </div>
                <div class="info-row">
                    <span class="label">Email:</span> {alert_data["user_email"]}
                </div>
                <div class="info-row">
                    <span class="label">Source:</span> {alert_data["source"].replace('_', ' ').title()}
                </div>
                <div class="info-row">
                    <span class="label">Time:</span> {alert_data["created_at"]}
                </div>
                
                <div class="keywords">
                    <span class="label">Matched Keywords:</span><br>
                    {"".join([f'<span class="keyword-tag">{kw}</span>' for kw in alert_data["matched_keywords"]])}
                </div>
                
                <div class="content-box">
                    <span class="label">Content:</span><br>
                    <p>{alert_data["content"][:500]}{"..." if len(alert_data["content"]) > 500 else ""}</p>
                </div>
                
                <p><strong>Recommended Action:</strong> Please review this alert in the admin dashboard and follow your institution's safeguarding procedures.</p>
            </div>
            <div class="footer">
                <p>This is an automated notification from Educare Safeguarding System.<br>
                Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    return html

def create_safeguarding_email_text(alert_data: dict) -> str:
    """
    Create plain text email body for safeguarding alert
    """
    text = f"""
EDUCARE SAFEGUARDING ALERT - {alert_data["risk_level"].upper()} RISK

A safeguarding concern has been detected and requires your attention.

Student: {alert_data["user_name"]}
Email: {alert_data["user_email"]}
Source: {alert_data["source"].replace('_', ' ').title()}
Time: {alert_data["created_at"]}

Matched Keywords: {', '.join(alert_data["matched_keywords"])}

Content:
{alert_data["content"][:500]}{"..." if len(alert_data["content"]) > 500 else ""}

Recommended Action: Please review this alert in the admin dashboard and follow your institution's safeguarding procedures.

---
This is an automated notification from Educare Safeguarding System.
    """
    return text

async def send_safeguarding_email_to_admins(alert_data: dict):
    """
    Send safeguarding alert email to all admin users
    """
    try:
        # Get all admin emails
        admin_emails = await get_admin_emails()
        
        if not admin_emails:
            logger.warning("No admin users found to send safeguarding email")
            return
        
        # Create email content
        subject = f"🚨 Safeguarding Alert [{alert_data['risk_level'].upper()}] - {alert_data['user_name']}"
        html_body = create_safeguarding_email_html(alert_data)
        text_body = create_safeguarding_email_text(alert_data)
        
        # Send email
        success = await send_email_async(admin_emails, subject, html_body, text_body)
        
        if success:
            logger.info(f"Safeguarding email sent to {len(admin_emails)} admins for alert {alert_data.get('alert_id', 'unknown')}")
        else:
            logger.warning(f"Failed to send safeguarding email for alert {alert_data.get('alert_id', 'unknown')}")
            
    except Exception as e:
        logger.error(f"Error sending safeguarding email: {e}")

# ==================== SAFEGUARDING MATRIX ====================
# Keywords that indicate potential crisis/self-harm
SAFEGUARDING_KEYWORDS = [
    # Suicide-related
    "kill myself", "want to die", "end my life", "ending my life", "suicide",
    "suicidal", "end it", "take my life", "taking my life",
    "no reason to live", "end it all", "ending it all", "better off dead",
    "can't go on", "give up on life", "don't want to be here", "want to disappear",
    "not worth living", "life isn't worth", "no point living", "rather be dead",
    "wish i was dead", "wish i were dead", "wanna die", "i want to die",
    
    # Self-harm related
    "self harm", "self-harm", "selfharm", "cut myself", "cutting myself",
    "hurt myself", "hurting myself", "harm myself", "harming myself",
    "slit my wrists", "overdose", "take pills", "jump off", "hang myself",
    
    # Harm to others
    "kill someone", "hurt someone", "harm someone", "want to hurt",
    "going to hurt", "attack someone", "violent thoughts",
    
    # Severe distress indicators
    "can't take it anymore", "cant take it anymore", "no way out",
    "hopeless", "no hope", "nobody cares", "no one cares",
    "nobody would miss me", "no one would miss me", "better without me",
    "world would be better", "everyone hates me"
]

# UK Crisis Resources - Comprehensive list for students
CRISIS_RESOURCES = {
    "samaritans": {
        "name": "Samaritans",
        "phone": "116 123",
        "description": "Free 24/7 emotional support - Someone to listen without judgement",
        "available": "24 hours a day, 7 days a week",
        "website": "https://www.samaritans.org"
    },
    "shout": {
        "name": "Shout Crisis Text Line",
        "phone": "Text SHOUT to 85258",
        "description": "Free, confidential text support for when you can't talk",
        "available": "24/7",
        "website": "https://giveusashout.org"
    },
    "papyrus": {
        "name": "PAPYRUS HOPELineUK",
        "phone": "0800 068 4141",
        "description": "For young people under 35 - Text 07860 039967",
        "available": "9am-midnight every day",
        "website": "https://www.papyrus-uk.org"
    },
    "student_minds": {
        "name": "Student Minds",
        "phone": "Visit website",
        "description": "UK's student mental health charity - Resources & peer support",
        "available": "Online resources 24/7",
        "website": "https://www.studentminds.org.uk"
    },
    "nhs_111": {
        "name": "NHS 111",
        "phone": "111",
        "description": "Non-emergency medical help and mental health support",
        "available": "24 hours a day",
        "website": "https://111.nhs.uk"
    },
    "emergency": {
        "name": "Emergency Services",
        "phone": "999",
        "description": "For immediate danger to life - Call or go to A&E",
        "available": "24 hours a day"
    },
    "calm": {
        "name": "CALM (Campaign Against Living Miserably)",
        "phone": "0800 58 58 58",
        "description": "For men who need to talk - Webchat also available",
        "available": "5pm-midnight every day",
        "website": "https://www.thecalmzone.net"
    }
}

def check_safeguarding_content(text: str) -> dict:
    """
    Check text for safeguarding concerns and return risk level with resources
    Uses both built-in keywords and AI-learned keywords
    """
    if not text:
        return {"flagged": False, "risk_level": "none", "matched_keywords": []}
    
    text_lower = text.lower()
    matched_keywords = []
    
    # Check built-in keywords
    for keyword in SAFEGUARDING_KEYWORDS:
        if keyword in text_lower:
            matched_keywords.append(keyword)
    
    # Check AI-learned keywords
    for keyword in AI_LEARNED_KEYWORDS:
        if keyword in text_lower and keyword not in matched_keywords:
            matched_keywords.append(f"[AI] {keyword}")
    
    if len(matched_keywords) >= 2:
        risk_level = "high"
    elif len(matched_keywords) == 1:
        risk_level = "medium"
    else:
        risk_level = "none"
    
    return {
        "flagged": len(matched_keywords) > 0,
        "risk_level": risk_level,
        "matched_keywords": matched_keywords,
        "resources": CRISIS_RESOURCES if matched_keywords else None
    }

# Initialize AI learned keywords set
AI_LEARNED_KEYWORDS = set()

# Create the main app
app = FastAPI(title="Educare API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    photos: List[str] = []  # Up to 3 profile photos in base64
    role: str = "student"  # student, admin
    interests: List[str] = []
    university: Optional[str] = None
    university_location: Optional[str] = None
    campus_name: Optional[str] = None
    course: Optional[str] = None
    age: Optional[int] = None
    study_style: Optional[str] = None
    bio: Optional[str] = None
    ethnicity: Optional[str] = None
    pronouns: Optional[str] = None  # he/him, she/her, they/them, he/they, she/they, any pronouns, prefer not to say
    show_pronouns: bool = True  # Whether to display pronouns on profile
    interested_in: List[str] = []  # men, women, non-binary, everyone
    gender: Optional[str] = None  # man, woman, non-binary
    push_token: Optional[str] = None
    notifications_enabled: bool = True
    # Subscription fields
    plan: str = "free"  # free, premium
    stripe_customer_id: Optional[str] = None
    swipes_today: int = 0
    last_swipe_date: Optional[str] = None  # YYYY-MM-DD format
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MoodEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    mood: int  # 1-10
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FeedbackEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    mood: int
    feedback: str
    lecture_topic: Optional[str] = None
    risk_score: Optional[int] = None
    ai_analysis: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Match(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    matched_user_id: str
    status: str = "pending"  # pending, accepted, rejected
    score: float = 0.0
    comment: Optional[str] = None  # Optional comment when liking (Hinge-style)
    liked_section: Optional[str] = None  # Which section was liked
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_id: str
    sender_id: str
    text: str  # Encrypted text
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Report(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reported_user_id: str
    reporter_id: str
    reason: str
    status: str = "pending"  # pending, reviewed, resolved
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    body: str
    notification_type: str  # new_match, new_message
    data: dict = {}
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== REQUEST/RESPONSE MODELS ====================

class SessionDataResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

class MoodCreate(BaseModel):
    mood: int
    notes: Optional[str] = None

class FeedbackCreate(BaseModel):
    mood: int
    feedback: str
    lecture_topic: Optional[str] = None

class ProfileUpdate(BaseModel):
    interests: Optional[List[str]] = None
    university: Optional[str] = None
    university_location: Optional[str] = None
    campus_name: Optional[str] = None
    course: Optional[str] = None
    age: Optional[int] = None
    study_style: Optional[str] = None
    bio: Optional[str] = None
    ethnicity: Optional[str] = None
    pronouns: Optional[str] = None
    show_pronouns: Optional[bool] = None
    interested_in: Optional[List[str]] = None
    gender: Optional[str] = None
    push_token: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    photos: Optional[List[str]] = None  # Up to 3 photos in base64

class SwipeAction(BaseModel):
    target_user_id: str
    action: str  # like, dislike
    comment: Optional[str] = None  # Optional comment when liking (Hinge-style)
    liked_section: Optional[str] = None  # Which section was liked (photo, bio, interests, course)

class SendMessage(BaseModel):
    match_id: str
    text: str

class ReportCreate(BaseModel):
    reported_user_id: str
    reason: str

class SafeguardingAlert(BaseModel):
    alert_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    user_name: str
    user_email: str
    source: str  # mood, chat, feedback
    content: str
    risk_level: str  # medium, high
    matched_keywords: List[str]
    acknowledged: bool = False
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # AI Learning feedback
    was_true_positive: Optional[bool] = None  # Admin marks if this was a real concern
    feedback_notes: Optional[str] = None

# ==================== AI LEARNING MODELS ====================

class LearnedKeyword(BaseModel):
    keyword_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    keyword: str
    context_examples: List[str] = []  # Anonymized examples of usage
    suggested_by_ai: bool = True
    risk_category: str = "medium"  # low, medium, high
    frequency_score: int = 0  # How often this pattern appears
    confidence_score: float = 0.0  # AI's confidence in this keyword
    status: str = "pending"  # pending, approved, rejected
    approved_by: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BehavioralPattern(BaseModel):
    pattern_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pattern_type: str  # mood_decline, activity_drop, keyword_escalation, time_pattern
    description: str
    anonymized_data: dict = {}  # Aggregated, anonymized pattern data
    detection_count: int = 0  # How many times this pattern was detected
    alert_threshold: float = 0.7  # When to trigger alerts
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AILearningInsight(BaseModel):
    insight_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    insight_type: str  # new_keyword, pattern_detected, risk_adjustment, behavioral_anomaly
    title: str
    description: str
    data: dict = {}
    severity: str = "info"  # info, warning, critical
    reviewed: bool = False
    reviewed_by: Optional[str] = None
    action_taken: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== AUTH HELPERS ====================

async def get_session_token(request: Request) -> Optional[str]:
    # Check Authorization header first (important for admin routes)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:]
        logger.info(f"Session token from header: {token[:20]}...")
        return token
    
    # Fall back to cookie
    session_token = request.cookies.get("session_token")
    if session_token:
        logger.info(f"Session token from cookie: {session_token[:20]}...")
        return session_token
    
    logger.warning("No session token found in request")
    return None

async def get_current_user(request: Request) -> User:
    session_token = await get_session_token(request)
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check user_sessions first (regular users)
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    
    # If not found, check sessions collection (admin users)
    if not session:
        session = await db.sessions.find_one({"session_token": session_token}, {"_id": 0})
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiration with timezone awareness
    expires_at = session["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_doc)

async def get_optional_user(request: Request) -> Optional[User]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None

async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ==================== NOTIFICATION HELPERS ====================

async def send_push_notification(user_id: str, title: str, body: str, notification_type: str, data: dict = {}):
    """Send push notification to user via Expo Push Service"""
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user or not user.get("push_token") or not user.get("notifications_enabled", True):
        return None
    
    # Store notification in database
    notification = Notification(
        user_id=user_id,
        title=title,
        body=body,
        notification_type=notification_type,
        data=data
    )
    await db.notifications.insert_one(notification.dict())
    
    # Send via Expo Push API
    push_token = user.get("push_token")
    if push_token and push_token.startswith("ExponentPushToken"):
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    "https://exp.host/--/api/v2/push/send",
                    json={
                        "to": push_token,
                        "title": title,
                        "body": body,
                        "data": data,
                        "sound": "default"
                    }
                )
        except Exception as e:
            logger.error(f"Push notification error: {e}")
    
    return notification

# ==================== AUTH ENDPOINTS ====================

# Admin secret code for first-time admin setup
ADMIN_SECRET_CODE = "EDUCARE_ADMIN_2024"

class AdminLoginRequest(BaseModel):
    email: str
    password: str
    admin_code: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

def create_password_reset_email_html(name: str, reset_url: str) -> str:
    """Create HTML email for password reset"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #6366F1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }}
            .button {{ display: inline-block; background: #6366F1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }}
            .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }}
            .warning {{ background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>We received a request to reset your admin password for Educare. Click the button below to set a new password:</p>
                
                <div style="text-align: center;">
                    <a href="{reset_url}" class="button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-size: 12px;">{reset_url}</p>
                
                <div class="warning">
                    <strong>⚠️ This link expires in 1 hour.</strong><br>
                    If you didn't request this reset, please ignore this email.
                </div>
            </div>
            <div class="footer">
                <p>This is an automated message from Educare.<br>Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """

@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    """Request password reset for admin account"""
    import secrets
    
    # Find user by email
    user = await db.users.find_one(
        {"email": data.email.lower()},
        {"_id": 0}
    )
    
    # Always return success to prevent email enumeration
    if not user or user.get("role") != "admin":
        return {"message": "If an admin account exists with this email, a reset link has been sent."}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Store reset token in database
    await db.password_resets.delete_many({"email": data.email.lower()})  # Remove old tokens
    await db.password_resets.insert_one({
        "email": data.email.lower(),
        "token": reset_token,
        "created_at": datetime.now(timezone.utc),
        "expires_at": expires_at,
        "used": False
    })
    
    # Create reset URL (frontend will handle this route)
    reset_url = f"https://github-retriever-1.preview.emergentagent.com/admin/reset-password?token={reset_token}"
    
    # Send email
    if is_smtp_configured():
        subject = "🔐 Educare Admin Password Reset"
        html_body = create_password_reset_email_html(user.get("name", "Admin"), reset_url)
        text_body = f"""
Hi {user.get("name", "Admin")},

We received a request to reset your admin password for Educare.

Click here to reset your password:
{reset_url}

This link expires in 1 hour.

If you didn't request this reset, please ignore this email.

- Educare Team
        """
        
        await send_email_async([data.email.lower()], subject, html_body, text_body)
        logger.info(f"Password reset email sent to {data.email.lower()}")
    else:
        logger.warning(f"SMTP not configured - password reset token: {reset_token}")
    
    return {"message": "If an admin account exists with this email, a reset link has been sent."}

@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPasswordRequest):
    """Reset password using token"""
    import hashlib
    
    # Find valid reset token
    reset_record = await db.password_resets.find_one({
        "token": data.token,
        "used": False,
        "expires_at": {"$gt": datetime.now(timezone.utc)}
    })
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Validate password
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    # Hash new password
    password_hash = hashlib.sha256(data.new_password.encode()).hexdigest()
    
    # Update user password
    result = await db.users.update_one(
        {"email": reset_record["email"]},
        {"$set": {"admin_password": password_hash}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update password")
    
    # Mark token as used
    await db.password_resets.update_one(
        {"token": data.token},
        {"$set": {"used": True}}
    )
    
    logger.info(f"Password reset successful for {reset_record['email']}")
    
    return {"message": "Password reset successful. You can now login with your new password."}

@api_router.get("/auth/verify-reset-token")
async def verify_reset_token(token: str):
    """Verify if a reset token is valid"""
    reset_record = await db.password_resets.find_one({
        "token": token,
        "used": False,
        "expires_at": {"$gt": datetime.now(timezone.utc)}
    })
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    return {"valid": True, "email": reset_record["email"]}

@api_router.post("/auth/admin-login")
async def admin_login(data: AdminLoginRequest):
    """Admin login endpoint with email/password"""
    import hashlib
    
    # Find user by email
    user = await db.users.find_one(
        {"email": data.email.lower()},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check password (simple hash for demo - use proper hashing in production)
    stored_password = user.get("admin_password")
    
    # If admin_code is provided and matches, allow setting up admin access
    if data.admin_code == ADMIN_SECRET_CODE:
        # Upgrade user to admin and set password
        password_hash = hashlib.sha256(data.password.encode()).hexdigest()
        await db.users.update_one(
            {"email": data.email.lower()},
            {"$set": {
                "role": "admin",
                "admin_password": password_hash
            }}
        )
        user["role"] = "admin"
        stored_password = password_hash
    
    # Verify password
    if not stored_password:
        raise HTTPException(status_code=401, detail="Admin password not set. Use admin code to set up.")
    
    password_hash = hashlib.sha256(data.password.encode()).hexdigest()
    if stored_password != password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check if user is admin
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="This account does not have admin privileges")
    
    # Create session token
    session_token = f"admin_session_{uuid.uuid4().hex}"
    
    # Store session
    await db.sessions.insert_one({
        "session_token": session_token,
        "user_id": user["user_id"],
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "is_admin_session": True
    })
    
    return {
        "session_token": session_token,
        "is_admin": True,
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "role": "admin"
        }
    }

@api_router.post("/auth/session")
async def exchange_session(request: Request, response: Response):
    """Exchange session_id for session_token"""
    data = await request.json()
    session_id = data.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth API
    async with httpx.AsyncClient() as client:
        try:
            auth_response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if auth_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session_id")
            
            user_data = auth_response.json()
        except Exception as e:
            logger.error(f"Auth API error: {e}")
            raise HTTPException(status_code=500, detail="Authentication failed")
    
    session_data = SessionDataResponse(**user_data)
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": session_data.email}, {"_id": 0})
    
    if not existing_user:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = {
            "user_id": user_id,
            "email": session_data.email,
            "name": session_data.name,
            "picture": session_data.picture,
            "role": "student",
            "interests": [],
            "created_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(new_user)
    else:
        user_id = existing_user["user_id"]
    
    # Store session
    session_doc = {
        "user_id": user_id,
        "session_token": session_data.session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc)
    }
    
    # Remove old sessions for this user
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_data.session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    
    # Get user data
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    return {"user": user_doc, "session_token": session_data.session_token}

@api_router.get("/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = await get_session_token(request)
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ==================== PROFILE ENDPOINTS ====================

@api_router.put("/profile")
async def update_profile(data: ProfileUpdate, current_user: User = Depends(get_current_user)):
    """Update user profile"""
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    
    if update_data:
        await db.users.update_one(
            {"user_id": current_user.user_id},
            {"$set": update_data}
        )
    
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    return User(**user_doc)

# ==================== MOOD ENDPOINTS ====================

async def create_safeguarding_alert(user: User, source: str, content: str, safeguarding_result: dict):
    """Create a safeguarding alert for admin review and send email notification"""
    alert = SafeguardingAlert(
        user_id=user.user_id,
        user_name=user.name,
        user_email=user.email,
        source=source,
        content=content,
        risk_level=safeguarding_result["risk_level"],
        matched_keywords=safeguarding_result["matched_keywords"]
    )
    await db.safeguarding_alerts.insert_one(alert.dict())
    logger.warning(f"SAFEGUARDING ALERT: {safeguarding_result['risk_level']} risk detected for user {user.user_id} in {source}")
    
    # Send email notification to all admins (non-blocking)
    alert_data = {
        "alert_id": alert.alert_id,
        "user_id": user.user_id,
        "user_name": user.name,
        "user_email": user.email,
        "source": source,
        "content": content,
        "risk_level": safeguarding_result["risk_level"],
        "matched_keywords": safeguarding_result["matched_keywords"],
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    }
    
    # Fire and forget - don't wait for email to send
    asyncio.create_task(send_safeguarding_email_to_admins(alert_data))
    
    return alert

@api_router.post("/mood")
async def create_mood(data: MoodCreate, current_user: User = Depends(get_current_user)):
    """Log mood entry with safeguarding check"""
    if data.mood < 1 or data.mood > 10:
        raise HTTPException(status_code=400, detail="Mood must be between 1 and 10")
    
    # Check for safeguarding concerns in notes
    safeguarding_result = check_safeguarding_content(data.notes or "")
    
    mood_entry = MoodEntry(
        user_id=current_user.user_id,
        mood=data.mood,
        notes=data.notes
    )
    
    await db.mood_entries.insert_one(mood_entry.dict())
    
    # If safeguarding concern detected, create alert for admin
    if safeguarding_result["flagged"]:
        await create_safeguarding_alert(
            current_user,
            "mood",
            data.notes or "",
            safeguarding_result
        )
    
    # Trigger AI pattern learning in background (for low mood or concerning content)
    if data.notes and (data.mood <= 3 or len(data.notes) > 50):
        import asyncio
        asyncio.create_task(analyze_text_for_new_patterns(data.notes, "mood"))
    
    # Return mood entry with safeguarding info if flagged
    response = mood_entry.dict()
    if safeguarding_result["flagged"]:
        response["safeguarding_alert"] = {
            "flagged": True,
            "risk_level": safeguarding_result["risk_level"],
            "resources": safeguarding_result["resources"],
            "message": "We noticed you may be going through a difficult time. Please know that support is available."
        }
    
    return response

@api_router.get("/mood", response_model=List[MoodEntry])
async def get_mood_history(current_user: User = Depends(get_current_user)):
    """Get mood history for current user"""
    entries = await db.mood_entries.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return [MoodEntry(**e) for e in entries]

# ==================== FEEDBACK & AI RISK PREDICTION ====================

@api_router.post("/feedback")
async def submit_feedback(data: FeedbackCreate, current_user: User = Depends(get_current_user)):
    """Submit lecture feedback with safeguarding check (AI analysis is admin-only)"""
    if data.mood < 1 or data.mood > 10:
        raise HTTPException(status_code=400, detail="Mood must be between 1 and 10")
    
    # Check for safeguarding concerns in feedback
    safeguarding_result = check_safeguarding_content(data.feedback)
    
    # Basic risk scoring (no AI for regular users - AI analysis is admin-only)
    risk_score = max(0, 100 - (data.mood * 10))
    ai_analysis = ""  # AI analysis only shown to admins
    
    feedback_entry = FeedbackEntry(
        user_id=current_user.user_id,
        mood=data.mood,
        feedback=data.feedback,
        lecture_topic=data.lecture_topic,
        risk_score=risk_score,
        ai_analysis=ai_analysis
    )
    
    await db.feedback_entries.insert_one(feedback_entry.dict())
    
    # Log to risk_scores for admin dashboard
    await db.risk_scores.insert_one({
        "user_id": current_user.user_id,
        "user_name": current_user.name,
        "risk_score": risk_score,
        "created_at": datetime.now(timezone.utc)
    })
    
    # If safeguarding concern detected, create alert for admin
    if safeguarding_result["flagged"]:
        await create_safeguarding_alert(
            current_user,
            "feedback",
            data.feedback,
            safeguarding_result
        )
    
    # Return feedback WITHOUT AI analysis (users don't see risk scores)
    response = {
        "entry_id": feedback_entry.id,
        "mood": feedback_entry.mood,
        "feedback": feedback_entry.feedback,
        "lecture_topic": feedback_entry.lecture_topic,
        "created_at": feedback_entry.created_at,
        "message": "Thank you for your feedback!"
    }
    
    # Add safeguarding info if flagged
    if safeguarding_result["flagged"]:
        response["safeguarding_alert"] = {
            "flagged": True,
            "risk_level": safeguarding_result["risk_level"],
            "resources": safeguarding_result["resources"],
            "message": "We noticed you may be going through a difficult time. Please know that support is available."
        }
    
    return response

@api_router.get("/feedback", response_model=List[FeedbackEntry])
async def get_feedback_history(current_user: User = Depends(get_current_user)):
    """Get feedback history for current user"""
    entries = await db.feedback_entries.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return [FeedbackEntry(**e) for e in entries]

# ==================== MATCHING ENDPOINTS ====================

def calculate_match_score(user: dict, other: dict) -> float:
    """Calculate match score based on interests, university, campus, course, age, study_style, ethnicity"""
    score = 0.0
    
    # Interest similarity (25%)
    user_interests = set(user.get("interests", []))
    other_interests = set(other.get("interests", []))
    if user_interests and other_interests:
        common = user_interests.intersection(other_interests)
        total = max(len(user_interests), len(other_interests))
        score += (len(common) / total) * 0.25 if total > 0 else 0
    
    # Same university (15%)
    if user.get("university") and user.get("university") == other.get("university"):
        score += 0.15
        # Bonus for same campus (5%)
        if user.get("campus_name") and user.get("campus_name") == other.get("campus_name"):
            score += 0.05
    
    # Same course (15%)
    if user.get("course") and user.get("course") == other.get("course"):
        score += 0.15
    
    # Age proximity (15%)
    user_age = user.get("age", 0)
    other_age = other.get("age", 0)
    if user_age and other_age:
        if abs(user_age - other_age) <= 3:
            score += 0.15
        elif abs(user_age - other_age) <= 5:
            score += 0.075
    
    # Same study style (15%)
    if user.get("study_style") and user.get("study_style") == other.get("study_style"):
        score += 0.15
    
    # Same location (10%)
    if user.get("university_location") and user.get("university_location") == other.get("university_location"):
        score += 0.1
    
    return min(score, 1.0)  # Cap at 1.0

def check_preference_match(user: dict, other: dict) -> bool:
    """Check if other matches user's dating preferences"""
    user_interested_in = user.get("interested_in", [])
    other_gender = other.get("gender")
    
    # If no preferences set or "everyone" is selected, match everyone
    if not user_interested_in or "everyone" in user_interested_in:
        return True
    
    # If other hasn't set gender, allow the match
    if not other_gender:
        return True
    
    # Map gender to preference format
    gender_to_preference = {
        "man": "men",
        "woman": "women",
        "non-binary": "non-binary"
    }
    
    preference_match = gender_to_preference.get(other_gender, other_gender)
    return preference_match in user_interested_in

@api_router.get("/matches/discover")
async def discover_matches(current_user: User = Depends(get_current_user)):
    """Get potential matches for swiping"""
    # Get users we haven't swiped on yet
    existing_swipes = await db.matches.find(
        {"user_id": current_user.user_id},
        {"matched_user_id": 1}
    ).to_list(1000)
    
    swiped_ids = [s["matched_user_id"] for s in existing_swipes]
    swiped_ids.append(current_user.user_id)  # Exclude self
    
    # Get potential matches
    potential_users = await db.users.find(
        {
            "user_id": {"$nin": swiped_ids},
            "role": "student"
        },
        {"_id": 0}
    ).to_list(100)
    
    # Filter by preferences and calculate scores
    current_user_dict = current_user.dict()
    scored_users = []
    for user in potential_users:
        # Check if user matches current user's preferences
        if not check_preference_match(current_user_dict, user):
            continue
        # Check if current user matches the other user's preferences (mutual)
        if not check_preference_match(user, current_user_dict):
            continue
        
        score = calculate_match_score(current_user_dict, user)
        user["match_score"] = score
        scored_users.append(user)
    
    # Sort by score descending
    scored_users.sort(key=lambda x: x["match_score"], reverse=True)
    
    return scored_users[:50]  # Limit to 50

@api_router.post("/matches/swipe")
async def swipe_action(data: SwipeAction, current_user: User = Depends(get_current_user)):
    """Process swipe action (like/dislike)"""
    if data.action not in ["like", "dislike"]:
        raise HTTPException(status_code=400, detail="Action must be 'like' or 'dislike'")
    
    # Check swipe limit for free users
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    user_plan = user_doc.get("plan", "free")
    swipes_today = user_doc.get("swipes_today", 0)
    last_swipe_date = user_doc.get("last_swipe_date")
    
    # Reset swipes if it's a new day
    if last_swipe_date != today:
        swipes_today = 0
    
    # Check limit for free users
    if user_plan == "free" and swipes_today >= FREE_SWIPES_PER_DAY:
        raise HTTPException(
            status_code=403, 
            detail={
                "message": "Daily swipe limit reached",
                "limit": FREE_SWIPES_PER_DAY,
                "upgrade_required": True
            }
        )
    
    # Check if target user exists
    target_user = await db.users.find_one({"user_id": data.target_user_id}, {"_id": 0})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already swiped
    existing = await db.matches.find_one({
        "user_id": current_user.user_id,
        "matched_user_id": data.target_user_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="Already swiped on this user")
    
    # Update swipe count
    await db.users.update_one(
        {"user_id": current_user.user_id},
        {"$set": {"swipes_today": swipes_today + 1, "last_swipe_date": today}}
    )
    
    status = "liked" if data.action == "like" else "rejected"
    
    match = Match(
        user_id=current_user.user_id,
        matched_user_id=data.target_user_id,
        status=status,
        score=calculate_match_score(current_user.dict(), target_user),
        comment=data.comment if data.action == "like" else None,
        liked_section=data.liked_section if data.action == "like" else None
    )
    
    await db.matches.insert_one(match.dict())
    
    # Check for mutual match
    mutual_match = None
    if data.action == "like":
        # Send notification that someone liked them (with comment if provided)
        like_notification_body = f"{current_user.name} liked your profile!"
        if data.comment:
            like_notification_body = f'{current_user.name} liked {data.liked_section or "your profile"}: "{data.comment[:60]}{"..." if len(data.comment) > 60 else ""}"'
        elif data.liked_section:
            like_notification_body = f"{current_user.name} liked {data.liked_section}!"
        
        await send_push_notification(
            data.target_user_id,
            "Someone likes you! ❤️",
            like_notification_body,
            "new_like",
            {"from_user_id": current_user.user_id, "from_user_name": current_user.name, "comment": data.comment, "liked_section": data.liked_section}
        )
        
        reverse_match = await db.matches.find_one({
            "user_id": data.target_user_id,
            "matched_user_id": current_user.user_id,
            "status": "liked"
        }, {"_id": 0})
        
        if reverse_match:
            # Update both to accepted
            await db.matches.update_many(
                {
                    "$or": [
                        {"user_id": current_user.user_id, "matched_user_id": data.target_user_id},
                        {"user_id": data.target_user_id, "matched_user_id": current_user.user_id}
                    ]
                },
                {"$set": {"status": "accepted"}}
            )
            mutual_match = target_user
            
            # Get the original like comment if it exists
            original_like = await db.matches.find_one({
                "user_id": data.target_user_id,
                "matched_user_id": current_user.user_id,
                "status": "liked"
            })
            like_comment = original_like.get("comment") if original_like else None
            
            # Send push notifications to both users about the match
            match_msg_to_current = f"You matched with {target_user.get('name', 'someone')}! Start chatting now."
            match_msg_to_target = f"You matched with {current_user.name}!"
            if data.comment:
                match_msg_to_target += f' They said: "{data.comment[:50]}{"..." if len(data.comment) > 50 else ""}"'
            else:
                match_msg_to_target += " Start chatting now."
            
            await send_push_notification(
                current_user.user_id,
                "New Match! 💕",
                match_msg_to_current,
                "new_match",
                {"match_user_id": data.target_user_id, "match_user_name": target_user.get("name"), "comment": like_comment}
            )
            await send_push_notification(
                data.target_user_id,
                "New Match! 💕",
                match_msg_to_target,
                "new_match",
                {"match_user_id": current_user.user_id, "match_user_name": current_user.name, "comment": data.comment}
            )
    
    # Return remaining swipes info for free users
    remaining_swipes = None
    if user_plan == "free":
        remaining_swipes = FREE_SWIPES_PER_DAY - (swipes_today + 1)
    
    return {
        "match": match.dict(),
        "is_mutual": mutual_match is not None,
        "matched_user": mutual_match,
        "remaining_swipes": remaining_swipes,
        "is_premium": user_plan == "premium"
    }

@api_router.get("/matches/accepted")
async def get_accepted_matches(current_user: User = Depends(get_current_user)):
    """Get list of accepted matches"""
    matches = await db.matches.find(
        {
            "user_id": current_user.user_id,
            "status": "accepted"
        },
        {"_id": 0}
    ).to_list(100)
    
    # Get matched user details
    result = []
    for match in matches:
        user = await db.users.find_one(
            {"user_id": match["matched_user_id"]},
            {"_id": 0}
        )
        if user:
            result.append({
                "match_id": match["id"],
                "user": user,
                "comment": match.get("comment"),
                "liked_section": match.get("liked_section")
            })
    
    return result

@api_router.get("/matches/likes-received")
async def get_likes_received(current_user: User = Depends(get_current_user)):
    """Get list of users who liked you (with their comments) - Hinge-style"""
    likes = await db.matches.find(
        {
            "matched_user_id": current_user.user_id,
            "status": "liked"
        },
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Get the users who liked current user
    result = []
    for like in likes:
        # Check if current user has already responded to this like
        response = await db.matches.find_one({
            "user_id": current_user.user_id,
            "matched_user_id": like["user_id"]
        })
        
        if response:
            continue  # Already responded, skip
        
        user = await db.users.find_one(
            {"user_id": like["user_id"]},
            {"_id": 0}
        )
        if user:
            result.append({
                "like_id": like["id"],
                "user": user,
                "comment": like.get("comment"),
                "liked_section": like.get("liked_section"),
                "created_at": like.get("created_at")
            })
    
    return result

# ==================== CHAT ENDPOINTS ====================

@api_router.post("/chat/send")
async def send_message(data: SendMessage, current_user: User = Depends(get_current_user)):
    """Send encrypted message"""
    # Verify match exists and is accepted
    match = await db.matches.find_one({
        "id": data.match_id,
        "$or": [
            {"user_id": current_user.user_id},
            {"matched_user_id": current_user.user_id}
        ],
        "status": "accepted"
    }, {"_id": 0})
    
    if not match:
        raise HTTPException(status_code=403, detail="Match not found or not accepted")
    
    # Check for safeguarding concerns in message
    safeguarding_result = check_safeguarding_content(data.text)
    
    message = ChatMessage(
        match_id=data.match_id,
        sender_id=current_user.user_id,
        text=data.text  # Expect encrypted text from client
    )
    
    await db.chat_messages.insert_one(message.dict())
    
    # If safeguarding concern detected, create alert for admin
    if safeguarding_result["flagged"]:
        await create_safeguarding_alert(
            current_user,
            "chat",
            data.text,
            safeguarding_result
        )
    
    # Send push notification to the other user
    # Determine the recipient (the other person in the match)
    if match["user_id"] == current_user.user_id:
        recipient_id = match["matched_user_id"]
    else:
        recipient_id = match["user_id"]
    
    await send_push_notification(
        recipient_id,
        f"New message from {current_user.name}",
        "You have a new message. Tap to read.",
        "new_message",
        {"match_id": data.match_id, "sender_name": current_user.name}
    )
    
    # Return message with safeguarding info if flagged
    response = message.dict()
    if safeguarding_result["flagged"]:
        response["safeguarding_alert"] = {
            "flagged": True,
            "risk_level": safeguarding_result["risk_level"],
            "resources": safeguarding_result["resources"],
            "message": "We noticed you may be going through a difficult time. Please know that support is available."
        }
    
    return response

@api_router.get("/chat/{match_id}")
async def get_messages(match_id: str, current_user: User = Depends(get_current_user)):
    """Get chat messages for a match"""
    # Verify match exists and user is part of it
    match = await db.matches.find_one({
        "id": match_id,
        "$or": [
            {"user_id": current_user.user_id},
            {"matched_user_id": current_user.user_id}
        ],
        "status": "accepted"
    }, {"_id": 0})
    
    if not match:
        raise HTTPException(status_code=403, detail="Match not found or not accepted")
    
    messages = await db.chat_messages.find(
        {"match_id": match_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(500)
    
    return [ChatMessage(**m) for m in messages]

# ==================== REPORT ENDPOINTS ====================

@api_router.post("/reports")
async def create_report(data: ReportCreate, current_user: User = Depends(get_current_user)):
    """Report a user"""
    report = Report(
        reported_user_id=data.reported_user_id,
        reporter_id=current_user.user_id,
        reason=data.reason
    )
    
    await db.reports.insert_one(report.dict())
    return report

# ==================== NOTIFICATION ENDPOINTS ====================

@api_router.get("/notifications")
async def get_notifications(current_user: User = Depends(get_current_user)):
    """Get user's notifications"""
    notifications = await db.notifications.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return notifications

@api_router.post("/notifications/read/{notification_id}")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    """Mark notification as read"""
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.user_id},
        {"$set": {"read": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"success": True}

@api_router.post("/notifications/read-all")
async def mark_all_notifications_read(current_user: User = Depends(get_current_user)):
    """Mark all notifications as read"""
    await db.notifications.update_many(
        {"user_id": current_user.user_id, "read": False},
        {"$set": {"read": True}}
    )
    
    return {"success": True}

@api_router.get("/notifications/unread-count")
async def get_unread_count(current_user: User = Depends(get_current_user)):
    """Get count of unread notifications"""
    count = await db.notifications.count_documents({
        "user_id": current_user.user_id,
        "read": False
    })
    
    return {"count": count}

# ==================== ADMIN ENDPOINTS ====================

@api_router.get("/admin/stats")
async def get_admin_stats(admin: User = Depends(require_admin)):
    """Get admin dashboard statistics including subscription and university data"""
    total_users = await db.users.count_documents({})
    total_students = await db.users.count_documents({"role": "student"})
    total_feedback = await db.feedback_entries.count_documents({})
    total_matches = await db.matches.count_documents({"status": "accepted"})
    pending_reports = await db.reports.count_documents({"status": "pending"})
    
    # Subscription stats
    premium_students = await db.users.count_documents({"role": "student", "plan": "premium"})
    free_students = total_students - premium_students
    
    # University breakdown with subscription info
    university_pipeline = [
        {"$match": {"role": "student", "university": {"$exists": True, "$ne": None, "$ne": ""}}},
        {"$group": {
            "_id": "$university",
            "total_students": {"$sum": 1},
            "premium_count": {
                "$sum": {"$cond": [{"$eq": ["$plan", "premium"]}, 1, 0]}
            },
            "free_count": {
                "$sum": {"$cond": [{"$or": [{"$eq": ["$plan", "free"]}, {"$eq": ["$plan", None]}]}, 1, 0]}
            }
        }},
        {"$sort": {"total_students": -1}},
        {"$limit": 20}
    ]
    
    universities_breakdown = await db.users.aggregate(university_pipeline).to_list(20)
    
    # Format university data
    university_stats = []
    for uni in universities_breakdown:
        if uni["_id"]:
            university_stats.append({
                "university": uni["_id"],
                "total_students": uni["total_students"],
                "premium_count": uni["premium_count"],
                "free_count": uni["free_count"],
                "premium_percentage": round((uni["premium_count"] / uni["total_students"]) * 100, 1) if uni["total_students"] > 0 else 0
            })
    
    # Get recent risk scores
    risk_scores = await db.risk_scores.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Calculate average risk
    avg_risk = 0
    if risk_scores:
        avg_risk = sum(r.get("risk_score", 0) for r in risk_scores) / len(risk_scores)
    
    # Safeguarding alerts summary
    total_alerts = await db.safeguarding_alerts.count_documents({})
    unacknowledged_alerts = await db.safeguarding_alerts.count_documents({"acknowledged": False})
    high_risk_alerts = await db.safeguarding_alerts.count_documents({"risk_level": "high"})
    
    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_feedback": total_feedback,
        "total_matches": total_matches,
        "pending_reports": pending_reports,
        "average_risk_score": round(avg_risk, 2),
        "recent_risk_scores": risk_scores[:20],
        # Subscription stats
        "subscription_stats": {
            "premium_students": premium_students,
            "free_students": free_students,
            "premium_percentage": round((premium_students / total_students) * 100, 1) if total_students > 0 else 0
        },
        # University breakdown
        "university_breakdown": university_stats,
        "total_universities": len(university_stats),
        # Safeguarding summary
        "safeguarding_summary": {
            "total_alerts": total_alerts,
            "unacknowledged": unacknowledged_alerts,
            "high_risk": high_risk_alerts
        }
    }

@api_router.get("/admin/reports")
async def get_reports(admin: User = Depends(require_admin)):
    """Get all reports"""
    reports = await db.reports.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reports

@api_router.post("/admin/block/{user_id}")
async def block_user(user_id: str, admin: User = Depends(require_admin)):
    """Block a user"""
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"blocked": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"blocked": True, "user_id": user_id}

@api_router.get("/admin/users")
async def get_all_users(admin: User = Depends(require_admin)):
    """Get all users"""
    users = await db.users.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return users

@api_router.post("/admin/make-admin/{user_id}")
async def make_admin(user_id: str, admin: User = Depends(require_admin)):
    """Make a user an admin"""
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"role": "admin"}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User promoted to admin", "user_id": user_id}

# ==================== ADMIN SAFEGUARDING ENDPOINTS ====================

@api_router.get("/admin/safeguarding-alerts")
async def get_safeguarding_alerts(admin: User = Depends(require_admin)):
    """Get all safeguarding alerts (Admin Only)"""
    alerts = await db.safeguarding_alerts.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(500)
    
    return {
        "alerts": alerts,
        "unacknowledged_count": len([a for a in alerts if not a.get("acknowledged", False)]),
        "high_risk_count": len([a for a in alerts if a.get("risk_level") == "high"]),
        "total_count": len(alerts)
    }

@api_router.post("/admin/safeguarding-alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, admin: User = Depends(require_admin)):
    """Acknowledge a safeguarding alert (Admin Only)"""
    result = await db.safeguarding_alerts.update_one(
        {"alert_id": alert_id},
        {"$set": {
            "acknowledged": True,
            "acknowledged_by": admin.user_id,
            "acknowledged_at": datetime.now(timezone.utc)
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    return {"message": "Alert acknowledged", "alert_id": alert_id}

@api_router.get("/admin/ai-risk-analysis/{user_id}")
async def admin_ai_risk_analysis(user_id: str, admin: User = Depends(require_admin)):
    """Get AI-powered risk analysis for a specific student (Admin Only)"""
    # Get user info
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's mood entries and feedback
    mood_entries = await db.mood_entries.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    feedback_entries = await db.feedback_entries.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    # Prepare data for AI analysis
    mood_data = [{"mood": e.get("mood"), "notes": e.get("notes"), "date": str(e.get("created_at"))} for e in mood_entries]
    feedback_data = [{"mood": e.get("mood"), "feedback": e.get("feedback"), "topic": e.get("lecture_topic"), "date": str(e.get("created_at"))} for e in feedback_entries]
    
    # Get AI risk analysis
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"admin_risk_{user_id}_{uuid.uuid4().hex[:8]}",
            system_message="""You are a student wellbeing AI assistant helping university administrators assess student risk levels.
            
            Analyze the student's mood entries and feedback to provide a comprehensive risk assessment.
            
            Provide your response in JSON format with:
            {
                "overall_risk_score": 0-100,
                "risk_level": "low" | "medium" | "high" | "critical",
                "key_concerns": ["concern1", "concern2"],
                "positive_indicators": ["indicator1", "indicator2"],
                "recommendation": "brief recommendation for admin",
                "summary": "2-3 sentence summary of overall wellbeing"
            }
            
            Consider factors like:
            - Mood trends (declining = higher risk)
            - Concerning language in notes/feedback
            - Engagement levels
            - Signs of stress, isolation, or disengagement"""
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(
            text=f"""Student: {user.get('name', 'Unknown')}
University: {user.get('university', 'Not specified')}
Course: {user.get('course', 'Not specified')}

Mood Entries (last 50):
{mood_data}

Feedback Entries (last 50):
{feedback_data}"""
        )
        
        response = await chat.send_message(user_message)
        
        import json
        try:
            ai_result = json.loads(response)
        except json.JSONDecodeError:
            ai_result = {
                "overall_risk_score": 50,
                "risk_level": "medium",
                "key_concerns": ["Unable to parse AI response"],
                "positive_indicators": [],
                "recommendation": response[:500],
                "summary": "AI analysis returned non-JSON response"
            }
            
    except Exception as e:
        logger.error(f"Admin AI analysis error: {e}")
        # Calculate basic risk score
        avg_mood = sum(e.get("mood", 5) for e in mood_entries) / max(len(mood_entries), 1) if mood_entries else 5
        basic_risk = max(0, 100 - (avg_mood * 10))
        
        ai_result = {
            "overall_risk_score": round(basic_risk),
            "risk_level": "high" if basic_risk > 70 else "medium" if basic_risk > 40 else "low",
            "key_concerns": ["AI analysis unavailable - using basic scoring"],
            "positive_indicators": [],
            "recommendation": "Review student's data manually",
            "summary": f"Basic risk assessment based on average mood: {avg_mood:.1f}/10"
        }
    
    return {
        "user": {
            "user_id": user.get("user_id"),
            "name": user.get("name"),
            "email": user.get("email"),
            "university": user.get("university"),
            "course": user.get("course")
        },
        "ai_analysis": ai_result,
        "data_summary": {
            "total_mood_entries": len(mood_entries),
            "total_feedback_entries": len(feedback_entries),
            "average_mood": sum(e.get("mood", 5) for e in mood_entries) / max(len(mood_entries), 1) if mood_entries else None
        }
    }

@api_router.get("/admin/crisis-resources")
async def get_crisis_resources(admin: User = Depends(require_admin)):
    """Get crisis resources configuration (Admin Only)"""
    return {
        "resources": CRISIS_RESOURCES,
        "keywords": SAFEGUARDING_KEYWORDS
    }

@api_router.get("/admin/email-config")
async def get_email_config(admin: User = Depends(require_admin)):
    """Check email configuration status (Admin Only)"""
    return {
        "smtp_configured": is_smtp_configured(),
        "smtp_host": SMTP_HOST if SMTP_HOST else "Not configured",
        "smtp_port": SMTP_PORT,
        "smtp_from_email": SMTP_FROM_EMAIL,
        "smtp_from_name": SMTP_FROM_NAME,
        "message": "SMTP is configured and ready" if is_smtp_configured() else "SMTP not configured. Add SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD to .env file"
    }

@api_router.post("/admin/test-email")
async def test_email_notification(admin: User = Depends(require_admin)):
    """Send a test safeguarding email notification (Admin Only)"""
    if not is_smtp_configured():
        return {
            "success": False,
            "message": "SMTP not configured. Please add SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD to backend/.env file",
            "required_env_vars": [
                "SMTP_HOST (e.g., smtp.gmail.com)",
                "SMTP_PORT (default: 587)",
                "SMTP_USERNAME (your email)",
                "SMTP_PASSWORD (app password)",
                "SMTP_FROM_EMAIL (optional)",
                "SMTP_FROM_NAME (optional)"
            ]
        }
    
    # Get admin emails
    admin_emails = await get_admin_emails()
    if not admin_emails:
        return {
            "success": False,
            "message": "No admin users found in the database"
        }
    
    # Create test alert data
    test_alert = {
        "alert_id": "test_" + str(uuid.uuid4())[:8],
        "user_id": "test_user",
        "user_name": "Test Student",
        "user_email": "test@example.com",
        "source": "mood",
        "content": "This is a TEST email notification. If you received this, your safeguarding email notifications are working correctly.",
        "risk_level": "medium",
        "matched_keywords": ["test keyword"],
        "created_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    }
    
    try:
        # Create email content
        subject = "🧪 TEST - Safeguarding Email Notification"
        html_body = create_safeguarding_email_html(test_alert)
        text_body = create_safeguarding_email_text(test_alert)
        
        # Send email
        success = await send_email_async(admin_emails, subject, html_body, text_body)
        
        return {
            "success": success,
            "message": f"Test email sent to {len(admin_emails)} admin(s)" if success else "Failed to send test email",
            "recipients": admin_emails
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error sending test email: {str(e)}"
        }

# ==================== DATA EXPORT ENDPOINTS ====================

import csv
import io

@api_router.get("/admin/export/students")
async def export_students_csv(
    admin: User = Depends(require_admin),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Export all student data as CSV (Admin Only)"""
    query = {"role": "student"}
    
    # Apply date filters if provided
    if start_date or end_date:
        query["created_at"] = {}
        if start_date:
            query["created_at"]["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            query["created_at"]["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    students = await db.users.find(query, {"_id": 0, "hashed_password": 0}).to_list(10000)
    
    # Create CSV
    output = io.StringIO()
    if students:
        fieldnames = ["user_id", "email", "name", "university", "university_location", "campus_name", 
                     "course", "age", "gender", "ethnicity", "plan", "created_at"]
        writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        for student in students:
            student["created_at"] = str(student.get("created_at", ""))
            writer.writerow(student)
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=students_export.csv"}
    )

@api_router.get("/admin/export/mood-history")
async def export_mood_history_csv(
    admin: User = Depends(require_admin),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_id: Optional[str] = None
):
    """Export mood history as CSV (Admin Only)"""
    query = {}
    
    if user_id:
        query["user_id"] = user_id
    
    if start_date or end_date:
        query["created_at"] = {}
        if start_date:
            query["created_at"]["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            query["created_at"]["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    mood_entries = await db.mood_entries.find(query, {"_id": 0}).sort("created_at", -1).to_list(50000)
    
    # Get user names for enrichment
    user_ids = list(set(e.get("user_id") for e in mood_entries))
    users = await db.users.find({"user_id": {"$in": user_ids}}, {"_id": 0, "user_id": 1, "name": 1, "email": 1}).to_list(10000)
    user_map = {u["user_id"]: u for u in users}
    
    output = io.StringIO()
    fieldnames = ["user_id", "user_name", "user_email", "mood", "notes", "created_at"]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
    writer.writeheader()
    
    for entry in mood_entries:
        user_info = user_map.get(entry.get("user_id"), {})
        row = {
            "user_id": entry.get("user_id"),
            "user_name": user_info.get("name", "Unknown"),
            "user_email": user_info.get("email", "Unknown"),
            "mood": entry.get("mood"),
            "notes": entry.get("notes", ""),
            "created_at": str(entry.get("created_at", ""))
        }
        writer.writerow(row)
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=mood_history_export.csv"}
    )

@api_router.get("/admin/export/feedback-history")
async def export_feedback_history_csv(
    admin: User = Depends(require_admin),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_id: Optional[str] = None
):
    """Export feedback history as CSV (Admin Only)"""
    query = {}
    
    if user_id:
        query["user_id"] = user_id
    
    if start_date or end_date:
        query["created_at"] = {}
        if start_date:
            query["created_at"]["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            query["created_at"]["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    feedback_entries = await db.feedback_entries.find(query, {"_id": 0}).sort("created_at", -1).to_list(50000)
    
    # Get user names
    user_ids = list(set(e.get("user_id") for e in feedback_entries))
    users = await db.users.find({"user_id": {"$in": user_ids}}, {"_id": 0, "user_id": 1, "name": 1, "email": 1}).to_list(10000)
    user_map = {u["user_id"]: u for u in users}
    
    output = io.StringIO()
    fieldnames = ["user_id", "user_name", "user_email", "mood", "feedback", "lecture_topic", "risk_score", "created_at"]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
    writer.writeheader()
    
    for entry in feedback_entries:
        user_info = user_map.get(entry.get("user_id"), {})
        row = {
            "user_id": entry.get("user_id"),
            "user_name": user_info.get("name", "Unknown"),
            "user_email": user_info.get("email", "Unknown"),
            "mood": entry.get("mood"),
            "feedback": entry.get("feedback", ""),
            "lecture_topic": entry.get("lecture_topic", ""),
            "risk_score": entry.get("risk_score", 0),
            "created_at": str(entry.get("created_at", ""))
        }
        writer.writerow(row)
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=feedback_history_export.csv"}
    )

@api_router.get("/admin/export/safeguarding-alerts")
async def export_safeguarding_alerts_csv(
    admin: User = Depends(require_admin),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    risk_level: Optional[str] = None
):
    """Export safeguarding alerts as CSV (Admin Only)"""
    query = {}
    
    if risk_level:
        query["risk_level"] = risk_level
    
    if start_date or end_date:
        query["created_at"] = {}
        if start_date:
            query["created_at"]["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            query["created_at"]["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    alerts = await db.safeguarding_alerts.find(query, {"_id": 0}).sort("created_at", -1).to_list(10000)
    
    output = io.StringIO()
    fieldnames = ["alert_id", "user_id", "user_name", "user_email", "source", "risk_level", 
                 "matched_keywords", "content", "acknowledged", "acknowledged_by", "created_at"]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction='ignore')
    writer.writeheader()
    
    for alert in alerts:
        row = {
            "alert_id": alert.get("alert_id"),
            "user_id": alert.get("user_id"),
            "user_name": alert.get("user_name"),
            "user_email": alert.get("user_email"),
            "source": alert.get("source"),
            "risk_level": alert.get("risk_level"),
            "matched_keywords": ", ".join(alert.get("matched_keywords", [])),
            "content": alert.get("content", "")[:500],  # Truncate for CSV
            "acknowledged": alert.get("acknowledged", False),
            "acknowledged_by": alert.get("acknowledged_by", ""),
            "created_at": str(alert.get("created_at", ""))
        }
        writer.writerow(row)
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=safeguarding_alerts_export.csv"}
    )

# ==================== ADVANCED ANALYTICS ENDPOINTS ====================

@api_router.get("/admin/analytics/mood-trends")
async def get_mood_trends(
    admin: User = Depends(require_admin),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    group_by: str = "day"  # day, week, month
):
    """Get mood trends over time for charts (Admin Only)"""
    query = {}
    
    # Default to last 30 days if no dates provided
    if not start_date:
        start_date = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    
    query["created_at"] = {"$gte": datetime.fromisoformat(start_date.replace('Z', '+00:00'))}
    if end_date:
        query["created_at"]["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    mood_entries = await db.mood_entries.find(query, {"_id": 0}).sort("created_at", 1).to_list(100000)
    
    # Group by date
    trends = {}
    for entry in mood_entries:
        created_at = entry.get("created_at")
        if not created_at:
            continue
        
        if group_by == "day":
            key = created_at.strftime("%Y-%m-%d")
        elif group_by == "week":
            key = created_at.strftime("%Y-W%W")
        else:  # month
            key = created_at.strftime("%Y-%m")
        
        if key not in trends:
            trends[key] = {"total_mood": 0, "count": 0}
        
        trends[key]["total_mood"] += entry.get("mood", 5)
        trends[key]["count"] += 1
    
    # Calculate averages
    result = []
    for date_key, data in sorted(trends.items()):
        avg_mood = data["total_mood"] / data["count"] if data["count"] > 0 else 0
        result.append({
            "date": date_key,
            "average_mood": round(avg_mood, 2),
            "entry_count": data["count"]
        })
    
    return {"trends": result, "group_by": group_by}

@api_router.get("/admin/analytics/university-comparison")
async def get_university_comparison(
    admin: User = Depends(require_admin),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get engagement and mood comparison by university (Admin Only)"""
    # Get all students grouped by university
    students = await db.users.find(
        {"role": "student", "university": {"$exists": True, "$ne": None}},
        {"_id": 0, "user_id": 1, "university": 1}
    ).to_list(10000)
    
    # Group by university
    university_users = {}
    for student in students:
        uni = student.get("university", "Unknown")
        if uni not in university_users:
            university_users[uni] = []
        university_users[uni].append(student["user_id"])
    
    # Build date query
    date_query = {}
    if start_date:
        date_query["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    if end_date:
        date_query["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    # Calculate metrics for each university
    comparison = []
    for university, user_ids in university_users.items():
        mood_query = {"user_id": {"$in": user_ids}}
        if date_query:
            mood_query["created_at"] = date_query
        
        mood_entries = await db.mood_entries.find(mood_query, {"_id": 0, "mood": 1}).to_list(50000)
        feedback_count = await db.feedback_entries.count_documents(mood_query)
        
        avg_mood = sum(e.get("mood", 5) for e in mood_entries) / len(mood_entries) if mood_entries else 0
        
        # Count safeguarding alerts
        alert_query = {"user_id": {"$in": user_ids}}
        if date_query:
            alert_query["created_at"] = date_query
        alert_count = await db.safeguarding_alerts.count_documents(alert_query)
        
        comparison.append({
            "university": university,
            "student_count": len(user_ids),
            "average_mood": round(avg_mood, 2),
            "mood_entries": len(mood_entries),
            "feedback_entries": feedback_count,
            "safeguarding_alerts": alert_count,
            "engagement_rate": round(len(mood_entries) / max(len(user_ids), 1), 2)
        })
    
    # Sort by student count
    comparison.sort(key=lambda x: x["student_count"], reverse=True)
    
    return {"universities": comparison}

@api_router.get("/admin/analytics/risk-distribution")
async def get_risk_distribution(
    admin: User = Depends(require_admin),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get risk score distribution for charts (Admin Only)"""
    query = {}
    
    if start_date or end_date:
        query["created_at"] = {}
        if start_date:
            query["created_at"]["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            query["created_at"]["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    # Get risk scores from feedback
    feedback_entries = await db.feedback_entries.find(query, {"_id": 0, "risk_score": 1}).to_list(50000)
    
    # Categorize risk scores
    distribution = {
        "low": 0,      # 0-30
        "medium": 0,   # 31-60
        "high": 0,     # 61-80
        "critical": 0  # 81-100
    }
    
    for entry in feedback_entries:
        score = entry.get("risk_score", 0)
        if score <= 30:
            distribution["low"] += 1
        elif score <= 60:
            distribution["medium"] += 1
        elif score <= 80:
            distribution["high"] += 1
        else:
            distribution["critical"] += 1
    
    # Get safeguarding alerts distribution
    alert_query = query.copy()
    alerts = await db.safeguarding_alerts.find(alert_query, {"_id": 0, "risk_level": 1}).to_list(10000)
    
    alert_distribution = {"high": 0, "medium": 0}
    for alert in alerts:
        level = alert.get("risk_level", "medium")
        if level in alert_distribution:
            alert_distribution[level] += 1
    
    return {
        "risk_score_distribution": distribution,
        "safeguarding_alert_distribution": alert_distribution,
        "total_feedback_entries": len(feedback_entries),
        "total_safeguarding_alerts": len(alerts)
    }

@api_router.post("/admin/analytics/bulk-ai-analysis")
async def bulk_ai_analysis(
    admin: User = Depends(require_admin),
    university: Optional[str] = None,
    limit: int = 50
):
    """Run AI analysis on multiple students at once (Admin Only)"""
    # Get students to analyze
    query = {"role": "student"}
    if university:
        query["university"] = university
    
    students = await db.users.find(query, {"_id": 0}).limit(limit).to_list(limit)
    
    results = []
    high_risk_count = 0
    medium_risk_count = 0
    
    for student in students:
        user_id = student.get("user_id")
        
        # Get recent mood entries
        mood_entries = await db.mood_entries.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(20).to_list(20)
        
        # Calculate basic risk metrics
        if mood_entries:
            avg_mood = sum(e.get("mood", 5) for e in mood_entries) / len(mood_entries)
            risk_score = max(0, 100 - (avg_mood * 10))
        else:
            avg_mood = None
            risk_score = 50  # Unknown
        
        # Check for safeguarding alerts
        alert_count = await db.safeguarding_alerts.count_documents({"user_id": user_id})
        
        # Determine risk level
        if risk_score > 70 or alert_count > 0:
            risk_level = "high"
            high_risk_count += 1
        elif risk_score > 40:
            risk_level = "medium"
            medium_risk_count += 1
        else:
            risk_level = "low"
        
        results.append({
            "user_id": user_id,
            "name": student.get("name"),
            "email": student.get("email"),
            "university": student.get("university"),
            "average_mood": round(avg_mood, 2) if avg_mood else None,
            "risk_score": round(risk_score),
            "risk_level": risk_level,
            "mood_entries_count": len(mood_entries),
            "safeguarding_alerts": alert_count
        })
    
    # Sort by risk score (highest first)
    results.sort(key=lambda x: x["risk_score"], reverse=True)
    
    return {
        "students_analyzed": len(results),
        "high_risk_count": high_risk_count,
        "medium_risk_count": medium_risk_count,
        "low_risk_count": len(results) - high_risk_count - medium_risk_count,
        "university_filter": university,
        "results": results
    }

@api_router.get("/admin/universities")
async def get_universities_list(admin: User = Depends(require_admin)):
    """Get list of all universities with student counts (Admin Only)"""
    # Aggregate universities
    pipeline = [
        {"$match": {"role": "student", "university": {"$exists": True, "$ne": None, "$ne": ""}}},
        {"$group": {
            "_id": "$university",
            "student_count": {"$sum": 1}
        }},
        {"$sort": {"student_count": -1}}
    ]
    
    universities = await db.users.aggregate(pipeline).to_list(100)
    
    result = []
    for uni in universities:
        if uni["_id"]:
            result.append({
                "name": uni["_id"],
                "student_count": uni["student_count"]
            })
    
    return {
        "universities": result,
        "total_universities": len(result)
    }

@api_router.get("/admin/university/{university_name}/students")
async def get_university_students(
    university_name: str,
    admin: User = Depends(require_admin)
):
    """Get all students from a specific university with their risk data (Admin Only)"""
    import urllib.parse
    university_decoded = urllib.parse.unquote(university_name)
    
    students = await db.users.find(
        {"role": "student", "university": {"$regex": f"^{university_decoded}$", "$options": "i"}},
        {"_id": 0, "admin_password": 0}
    ).to_list(1000)
    
    enriched_students = []
    for student in students:
        user_id = student.get("user_id")
        
        # Get mood stats
        mood_entries = await db.mood_entries.find(
            {"user_id": user_id},
            {"_id": 0, "mood": 1}
        ).sort("created_at", -1).limit(30).to_list(30)
        
        avg_mood = sum(e.get("mood", 5) for e in mood_entries) / len(mood_entries) if mood_entries else None
        
        # Get alert count
        alert_count = await db.safeguarding_alerts.count_documents({"user_id": user_id})
        
        # Calculate risk
        if avg_mood:
            risk_score = max(0, 100 - (avg_mood * 10))
        else:
            risk_score = 50
        
        if alert_count > 0 or risk_score > 70:
            risk_level = "high"
        elif risk_score > 40:
            risk_level = "medium"
        else:
            risk_level = "low"
        
        enriched_students.append({
            "user_id": user_id,
            "name": student.get("name"),
            "email": student.get("email"),
            "course": student.get("course"),
            "campus_name": student.get("campus_name"),
            "average_mood": round(avg_mood, 2) if avg_mood else None,
            "mood_entries_count": len(mood_entries),
            "safeguarding_alerts": alert_count,
            "risk_score": round(risk_score),
            "risk_level": risk_level,
            "created_at": str(student.get("created_at", ""))
        })
    
    # Sort by risk score (highest first)
    enriched_students.sort(key=lambda x: x["risk_score"], reverse=True)
    
    high_risk = len([s for s in enriched_students if s["risk_level"] == "high"])
    medium_risk = len([s for s in enriched_students if s["risk_level"] == "medium"])
    
    return {
        "university": university_decoded,
        "total_students": len(enriched_students),
        "high_risk_count": high_risk,
        "medium_risk_count": medium_risk,
        "low_risk_count": len(enriched_students) - high_risk - medium_risk,
        "students": enriched_students
    }

@api_router.post("/admin/university/{university_name}/ai-analysis")
async def university_ai_analysis(
    university_name: str,
    admin: User = Depends(require_admin)
):
    """Run comprehensive AI analysis for all students in a university (Admin Only)"""
    import urllib.parse
    university_decoded = urllib.parse.unquote(university_name)
    
    # Get all students from university
    students = await db.users.find(
        {"role": "student", "university": {"$regex": f"^{university_decoded}$", "$options": "i"}},
        {"_id": 0}
    ).to_list(500)
    
    if not students:
        raise HTTPException(status_code=404, detail="No students found for this university")
    
    # Gather all mood and feedback data
    all_mood_data = []
    all_feedback_data = []
    student_summaries = []
    
    for student in students:
        user_id = student.get("user_id")
        
        mood_entries = await db.mood_entries.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(30).to_list(30)
        
        feedback_entries = await db.feedback_entries.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(20).to_list(20)
        
        alert_count = await db.safeguarding_alerts.count_documents({"user_id": user_id})
        
        avg_mood = sum(e.get("mood", 5) for e in mood_entries) / len(mood_entries) if mood_entries else None
        
        all_mood_data.extend(mood_entries)
        all_feedback_data.extend(feedback_entries)
        
        student_summaries.append({
            "name": student.get("name"),
            "course": student.get("course"),
            "avg_mood": round(avg_mood, 1) if avg_mood else "N/A",
            "mood_count": len(mood_entries),
            "alerts": alert_count
        })
    
    # Calculate university-wide stats
    total_moods = [e.get("mood", 5) for e in all_mood_data]
    university_avg_mood = sum(total_moods) / len(total_moods) if total_moods else 0
    
    # Run AI analysis
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"uni_analysis_{uuid.uuid4().hex[:8]}",
            system_message="""You are a university student wellbeing analyst. Analyze the aggregated data for a university and provide insights.

Provide your response in JSON format:
{
    "overall_wellbeing_score": 0-100,
    "wellbeing_trend": "improving" | "stable" | "declining",
    "key_concerns": ["concern1", "concern2", "concern3"],
    "positive_aspects": ["positive1", "positive2"],
    "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
    "priority_interventions": ["intervention1", "intervention2"],
    "summary": "2-3 sentence executive summary"
}"""
        ).with_model("openai", "gpt-4o")
        
        analysis_prompt = f"""University: {university_decoded}
Total Students: {len(students)}
University Average Mood: {university_avg_mood:.1f}/10
Total Mood Entries: {len(all_mood_data)}
Total Feedback Entries: {len(all_feedback_data)}

Student Summaries (sample):
{student_summaries[:20]}

Recent Feedback Comments (sample):
{[f.get('feedback', '')[:100] for f in all_feedback_data[:10]]}
"""
        
        response = await chat.send_message(UserMessage(text=analysis_prompt))
        
        import json
        try:
            ai_analysis = json.loads(response)
        except json.JSONDecodeError:
            ai_analysis = {
                "overall_wellbeing_score": round(university_avg_mood * 10),
                "wellbeing_trend": "stable",
                "key_concerns": ["Unable to parse AI response"],
                "positive_aspects": [],
                "recommendations": [response[:500]],
                "priority_interventions": [],
                "summary": "AI analysis returned non-JSON response"
            }
    except Exception as e:
        logger.error(f"University AI analysis error: {e}")
        ai_analysis = {
            "overall_wellbeing_score": round(university_avg_mood * 10),
            "wellbeing_trend": "stable",
            "key_concerns": ["AI analysis unavailable"],
            "positive_aspects": [],
            "recommendations": ["Manual review recommended"],
            "priority_interventions": [],
            "summary": f"Basic analysis: Average mood {university_avg_mood:.1f}/10 across {len(students)} students"
        }
    
    return {
        "university": university_decoded,
        "analysis_timestamp": datetime.now(timezone.utc).isoformat(),
        "stats": {
            "total_students": len(students),
            "average_mood": round(university_avg_mood, 2),
            "total_mood_entries": len(all_mood_data),
            "total_feedback_entries": len(all_feedback_data)
        },
        "ai_analysis": ai_analysis
    }

# ==================== ANALYTICS ENDPOINTS ====================

async def calculate_student_engagement(user_id: str) -> dict:
    """Calculate engagement metrics for a student"""
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # Count activities
    mood_entries_week = await db.mood_entries.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": week_ago}
    })
    
    mood_entries_month = await db.mood_entries.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": month_ago}
    })
    
    feedback_entries_week = await db.feedback_entries.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": week_ago}
    })
    
    feedback_entries_month = await db.feedback_entries.count_documents({
        "user_id": user_id,
        "created_at": {"$gte": month_ago}
    })
    
    chat_messages_week = await db.chat_messages.count_documents({
        "sender_id": user_id,
        "created_at": {"$gte": week_ago}
    })
    
    matches_count = await db.matches.count_documents({
        "user_id": user_id,
        "status": "accepted"
    })
    
    # Calculate engagement score (0-100)
    engagement_score = min(100, (
        mood_entries_week * 10 +
        feedback_entries_week * 15 +
        chat_messages_week * 5 +
        matches_count * 5
    ))
    
    # Get average mood
    recent_moods = await db.mood_entries.find(
        {"user_id": user_id, "created_at": {"$gte": month_ago}},
        {"mood": 1}
    ).to_list(100)
    
    avg_mood = 0
    if recent_moods:
        avg_mood = sum(m["mood"] for m in recent_moods) / len(recent_moods)
    
    # Get average risk score
    recent_risks = await db.risk_scores.find(
        {"user_id": user_id, "created_at": {"$gte": month_ago}},
        {"risk_score": 1}
    ).to_list(100)
    
    avg_risk = 0
    if recent_risks:
        avg_risk = sum(r["risk_score"] for r in recent_risks) / len(recent_risks)
    
    return {
        "engagement_score": engagement_score,
        "mood_entries_week": mood_entries_week,
        "mood_entries_month": mood_entries_month,
        "feedback_entries_week": feedback_entries_week,
        "feedback_entries_month": feedback_entries_month,
        "chat_messages_week": chat_messages_week,
        "matches_count": matches_count,
        "average_mood": round(avg_mood, 1),
        "average_risk": round(avg_risk, 1)
    }

@api_router.get("/admin/analytics/overview")
async def get_analytics_overview(admin: User = Depends(require_admin)):
    """Get comprehensive analytics overview for student retention and engagement"""
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # Total counts
    total_students = await db.users.count_documents({"role": "student"})
    
    # Active students (any activity in last 7 days)
    active_mood_users = await db.mood_entries.distinct("user_id", {"created_at": {"$gte": week_ago}})
    active_feedback_users = await db.feedback_entries.distinct("user_id", {"created_at": {"$gte": week_ago}})
    active_chat_users = await db.chat_messages.distinct("sender_id", {"created_at": {"$gte": week_ago}})
    
    active_users = set(active_mood_users + active_feedback_users + active_chat_users)
    active_count = len(active_users)
    
    # Engagement rate
    engagement_rate = (active_count / total_students * 100) if total_students > 0 else 0
    
    # Average mood across platform
    all_moods = await db.mood_entries.find(
        {"created_at": {"$gte": month_ago}},
        {"mood": 1}
    ).to_list(10000)
    
    platform_avg_mood = 0
    if all_moods:
        platform_avg_mood = sum(m["mood"] for m in all_moods) / len(all_moods)
    
    # Risk distribution
    high_risk_students = await db.risk_scores.distinct("user_id", {
        "risk_score": {"$gte": 70},
        "created_at": {"$gte": week_ago}
    })
    
    medium_risk_students = await db.risk_scores.distinct("user_id", {
        "risk_score": {"$gte": 40, "$lt": 70},
        "created_at": {"$gte": week_ago}
    })
    
    low_risk_students = await db.risk_scores.distinct("user_id", {
        "risk_score": {"$lt": 40},
        "created_at": {"$gte": week_ago}
    })
    
    # University breakdown
    university_stats = await db.users.aggregate([
        {"$match": {"role": "student", "university": {"$ne": None}}},
        {"$group": {
            "_id": "$university",
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]).to_list(10)
    
    return {
        "total_students": total_students,
        "active_students_week": active_count,
        "engagement_rate": round(engagement_rate, 1),
        "platform_average_mood": round(platform_avg_mood, 1),
        "high_risk_count": len(high_risk_students),
        "medium_risk_count": len(medium_risk_students),
        "low_risk_count": len(low_risk_students),
        "university_breakdown": [{"university": u["_id"], "students": u["count"]} for u in university_stats]
    }

@api_router.get("/admin/analytics/at-risk-students")
async def get_at_risk_students(admin: User = Depends(require_admin)):
    """Get list of students at risk of dropping out with AI analysis"""
    # Get all students
    students = await db.users.find(
        {"role": "student"},
        {"_id": 0}
    ).to_list(1000)
    
    at_risk_students = []
    
    for student in students:
        user_id = student["user_id"]
        
        # Calculate engagement
        engagement = await calculate_student_engagement(user_id)
        
        # Determine risk factors
        risk_factors = []
        dropout_risk = 0
        
        # Low engagement
        if engagement["engagement_score"] < 20:
            risk_factors.append("Very low platform engagement")
            dropout_risk += 30
        elif engagement["engagement_score"] < 40:
            risk_factors.append("Low platform engagement")
            dropout_risk += 15
        
        # Low mood
        if engagement["average_mood"] > 0 and engagement["average_mood"] < 4:
            risk_factors.append("Consistently low mood")
            dropout_risk += 25
        elif engagement["average_mood"] > 0 and engagement["average_mood"] < 6:
            risk_factors.append("Below average mood")
            dropout_risk += 10
        
        # High risk scores
        if engagement["average_risk"] > 70:
            risk_factors.append("High wellbeing risk score")
            dropout_risk += 30
        elif engagement["average_risk"] > 50:
            risk_factors.append("Elevated wellbeing risk")
            dropout_risk += 15
        
        # No recent activity
        if engagement["mood_entries_week"] == 0 and engagement["feedback_entries_week"] == 0:
            risk_factors.append("No recent activity")
            dropout_risk += 20
        
        # No social connections
        if engagement["matches_count"] == 0:
            risk_factors.append("No peer connections")
            dropout_risk += 10
        
        dropout_risk = min(100, dropout_risk)
        
        if dropout_risk >= 30:  # Only include students with significant risk
            at_risk_students.append({
                "user_id": user_id,
                "name": student.get("name", "Unknown"),
                "email": student.get("email", ""),
                "university": student.get("university"),
                "course": student.get("course"),
                "dropout_risk": dropout_risk,
                "risk_level": "High" if dropout_risk >= 60 else "Medium" if dropout_risk >= 40 else "Low",
                "risk_factors": risk_factors,
                "engagement_score": engagement["engagement_score"],
                "average_mood": engagement["average_mood"],
                "last_activity": {
                    "mood_entries_week": engagement["mood_entries_week"],
                    "feedback_entries_week": engagement["feedback_entries_week"]
                }
            })
    
    # Sort by risk level
    at_risk_students.sort(key=lambda x: x["dropout_risk"], reverse=True)
    
    return {
        "total_at_risk": len(at_risk_students),
        "high_risk": len([s for s in at_risk_students if s["risk_level"] == "High"]),
        "medium_risk": len([s for s in at_risk_students if s["risk_level"] == "Medium"]),
        "students": at_risk_students[:50]  # Top 50 at-risk students
    }

@api_router.get("/admin/analytics/student/{user_id}")
async def get_student_analytics(user_id: str, admin: User = Depends(require_admin)):
    """Get detailed analytics for a specific student"""
    student = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    engagement = await calculate_student_engagement(user_id)
    
    # Get mood history
    mood_history = await db.mood_entries.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(30)
    
    # Get feedback history
    feedback_history = await db.feedback_entries.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(20)
    
    # Get risk score history
    risk_history = await db.risk_scores.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(30)
    
    return {
        "student": student,
        "engagement": engagement,
        "mood_history": mood_history,
        "feedback_history": feedback_history,
        "risk_history": risk_history
    }

@api_router.get("/admin/analytics/retention")
async def get_retention_analytics(admin: User = Depends(require_admin)):
    """Get student retention analytics by university"""
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    
    # Get all universities
    universities = await db.users.distinct("university", {"role": "student", "university": {"$ne": None}})
    
    retention_data = []
    
    for uni in universities:
        if not uni:
            continue
            
        # Total students at university
        total_students = await db.users.count_documents({
            "role": "student",
            "university": uni
        })
        
        # Get active students at university
        uni_students = await db.users.find(
            {"role": "student", "university": uni},
            {"user_id": 1}
        ).to_list(1000)
        
        uni_user_ids = [s["user_id"] for s in uni_students]
        
        active_week = await db.mood_entries.distinct("user_id", {
            "user_id": {"$in": uni_user_ids},
            "created_at": {"$gte": week_ago}
        })
        
        active_month = await db.mood_entries.distinct("user_id", {
            "user_id": {"$in": uni_user_ids},
            "created_at": {"$gte": month_ago}
        })
        
        # Get average mood for university
        uni_moods = await db.mood_entries.find(
            {"user_id": {"$in": uni_user_ids}, "created_at": {"$gte": month_ago}},
            {"mood": 1}
        ).to_list(10000)
        
        avg_mood = 0
        if uni_moods:
            avg_mood = sum(m["mood"] for m in uni_moods) / len(uni_moods)
        
        # Get at-risk count for university
        at_risk = await db.risk_scores.distinct("user_id", {
            "user_id": {"$in": uni_user_ids},
            "risk_score": {"$gte": 60},
            "created_at": {"$gte": week_ago}
        })
        
        weekly_retention = (len(active_week) / total_students * 100) if total_students > 0 else 0
        monthly_retention = (len(active_month) / total_students * 100) if total_students > 0 else 0
        
        retention_data.append({
            "university": uni,
            "total_students": total_students,
            "active_weekly": len(active_week),
            "active_monthly": len(active_month),
            "weekly_retention_rate": round(weekly_retention, 1),
            "monthly_retention_rate": round(monthly_retention, 1),
            "average_mood": round(avg_mood, 1),
            "at_risk_count": len(at_risk),
            "health_status": "Good" if avg_mood >= 6 and weekly_retention >= 50 else "Attention Needed" if avg_mood >= 4 else "Critical"
        })
    
    # Sort by retention rate
    retention_data.sort(key=lambda x: x["weekly_retention_rate"], reverse=True)
    
    return {
        "universities": retention_data,
        "total_universities": len(retention_data)
    }

@api_router.post("/admin/analytics/ai-insights")
async def get_ai_insights(admin: User = Depends(require_admin)):
    """Get AI-powered insights on student retention and wellbeing"""
    # Gather platform data
    now = datetime.now(timezone.utc)
    month_ago = now - timedelta(days=30)
    
    total_students = await db.users.count_documents({"role": "student"})
    
    # Get mood distribution
    all_moods = await db.mood_entries.find(
        {"created_at": {"$gte": month_ago}},
        {"mood": 1, "user_id": 1}
    ).to_list(10000)
    
    mood_distribution = {i: 0 for i in range(1, 11)}
    for m in all_moods:
        mood_distribution[m["mood"]] = mood_distribution.get(m["mood"], 0) + 1
    
    # Get risk distribution
    risk_scores = await db.risk_scores.find(
        {"created_at": {"$gte": month_ago}},
        {"risk_score": 1}
    ).to_list(10000)
    
    high_risk = len([r for r in risk_scores if r["risk_score"] >= 70])
    medium_risk = len([r for r in risk_scores if 40 <= r["risk_score"] < 70])
    low_risk = len([r for r in risk_scores if r["risk_score"] < 40])
    
    # Get university data
    university_counts = await db.users.aggregate([
        {"$match": {"role": "student", "university": {"$ne": None}}},
        {"$group": {"_id": "$university", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]).to_list(5)
    
    # Generate AI insights
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"admin_insights_{uuid.uuid4().hex[:8]}",
            system_message="""You are an educational analytics AI assistant. Analyze the provided student wellbeing data and generate actionable insights for university administrators.

Focus on:
1. Student retention risks
2. Dropout prediction factors
3. Engagement improvement suggestions
4. University-specific recommendations
5. Early intervention opportunities

Respond in JSON format:
{
    "summary": "Brief overview of platform health",
    "retention_insights": ["insight1", "insight2"],
    "dropout_risk_factors": ["factor1", "factor2"],
    "recommendations": ["recommendation1", "recommendation2"],
    "priority_actions": ["action1", "action2"],
    "positive_trends": ["trend1", "trend2"]
}"""
        ).with_model("openai", "gpt-4o")
        
        data_summary = f"""
Platform Data (Last 30 days):
- Total Students: {total_students}
- Mood Entries: {len(all_moods)}
- Mood Distribution: {mood_distribution}
- Risk Scores: High={high_risk}, Medium={medium_risk}, Low={low_risk}
- Top Universities: {[{'name': u['_id'], 'students': u['count']} for u in university_counts]}
"""
        
        user_message = UserMessage(text=data_summary)
        response = await chat.send_message(user_message)
        
        import json
        try:
            insights = json.loads(response)
        except json.JSONDecodeError:
            insights = {
                "summary": response,
                "retention_insights": [],
                "dropout_risk_factors": [],
                "recommendations": [],
                "priority_actions": [],
                "positive_trends": []
            }
        
    except Exception as e:
        logger.error(f"AI insights error: {e}")
        insights = {
            "summary": "Unable to generate AI insights at this time",
            "retention_insights": [],
            "dropout_risk_factors": [],
            "recommendations": [],
            "priority_actions": [],
            "positive_trends": []
        }
    
    return {
        "insights": insights,
        "data_summary": {
            "total_students": total_students,
            "mood_entries_count": len(all_moods),
            "high_risk_count": high_risk,
            "medium_risk_count": medium_risk,
            "low_risk_count": low_risk
        }
    }

# ==================== SUBSCRIPTION & BILLING ENDPOINTS ====================

class CreateCheckoutRequest(BaseModel):
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None

@api_router.post("/subscription/create-payment-sheet")
async def create_payment_sheet(current_user: User = Depends(get_current_user)):
    """Create a Stripe Payment Sheet for in-app premium subscription"""
    try:
        # Create or retrieve Stripe customer
        user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
        stripe_customer_id = user_doc.get("stripe_customer_id")
        
        if not stripe_customer_id:
            # Create new Stripe customer
            customer = stripe.Customer.create(
                email=current_user.email,
                name=current_user.name,
                metadata={"user_id": current_user.user_id}
            )
            stripe_customer_id = customer.id
            
            # Save customer ID to database
            await db.users.update_one(
                {"user_id": current_user.user_id},
                {"$set": {"stripe_customer_id": stripe_customer_id}}
            )
        
        # Create ephemeral key for the customer
        ephemeral_key = stripe.EphemeralKey.create(
            customer=stripe_customer_id,
            stripe_version="2023-10-16"
        )
        
        # Create a subscription with payment_behavior for immediate charge
        # First check if there's an existing incomplete subscription
        existing_subs = stripe.Subscription.list(
            customer=stripe_customer_id,
            status="incomplete",
            limit=1
        )
        
        if existing_subs.data:
            # Use existing incomplete subscription
            subscription = existing_subs.data[0]
        else:
            # Create or get product first
            try:
                # Try to find existing product
                products = stripe.Product.list(limit=1)
                if products.data:
                    product_id = products.data[0].id
                else:
                    # Create new product
                    product = stripe.Product.create(name=STRIPE_PRODUCT_NAME)
                    product_id = product.id
            except Exception as e:
                # Fallback: create product inline
                logger.warning(f"Could not create/find product, using inline creation: {e}")
                product_id = None
            
            # Create new subscription with incomplete status to get PaymentIntent
            if product_id:
                subscription = stripe.Subscription.create(
                    customer=stripe_customer_id,
                    items=[{
                        "price_data": {
                            "currency": STRIPE_PRICE_CURRENCY,
                            "unit_amount": STRIPE_PRICE_AMOUNT,
                            "recurring": {"interval": "month"},
                            "product": product_id
                        }
                    }],
                    payment_behavior="default_incomplete",
                    payment_settings={"save_default_payment_method": "on_subscription"},
                    expand=["latest_invoice.payments"],
                    metadata={"user_id": current_user.user_id}
                )
            else:
                # Alternative approach: create price separately
                price = stripe.Price.create(
                    currency=STRIPE_PRICE_CURRENCY,
                    unit_amount=STRIPE_PRICE_AMOUNT,
                    recurring={"interval": "month"},
                    product_data={"name": STRIPE_PRODUCT_NAME}
                )
                
                subscription = stripe.Subscription.create(
                    customer=stripe_customer_id,
                    items=[{"price": price.id}],
                    payment_behavior="default_incomplete",
                    payment_settings={"save_default_payment_method": "on_subscription"},
                    expand=["latest_invoice.payments"],
                    metadata={"user_id": current_user.user_id}
                )
        
        # Get the client secret from the payment intent
        # Access payment intent through the payments array
        invoice_id = subscription.latest_invoice
        invoice = stripe.Invoice.retrieve(invoice_id, expand=["payments"])
        
        if invoice.payments and invoice.payments.data:
            payment_intent_id = invoice.payments.data[0].payment.payment_intent
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        else:
            # Fallback: create a payment intent manually
            payment_intent = stripe.PaymentIntent.create(
                amount=STRIPE_PRICE_AMOUNT,
                currency=STRIPE_PRICE_CURRENCY,
                customer=stripe_customer_id,
                metadata={"subscription_id": subscription.id, "user_id": current_user.user_id}
            )
        
        return {
            "paymentIntent": payment_intent.client_secret,
            "ephemeralKey": ephemeral_key.secret,
            "customer": stripe_customer_id,
            "publishableKey": os.environ.get("STRIPE_PUBLISHABLE_KEY", ""),
            "subscriptionId": subscription.id
        }
    
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error creating payment sheet: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/subscription/confirm-payment")
async def confirm_subscription_payment(current_user: User = Depends(get_current_user)):
    """Confirm subscription after successful Payment Sheet completion"""
    try:
        user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
        stripe_customer_id = user_doc.get("stripe_customer_id")
        
        if not stripe_customer_id:
            raise HTTPException(status_code=400, detail="No customer found")
        
        # Check for active subscription
        subscriptions = stripe.Subscription.list(
            customer=stripe_customer_id,
            status="active",
            limit=1
        )
        
        if subscriptions.data:
            # Update user to premium
            await db.users.update_one(
                {"user_id": current_user.user_id},
                {"$set": {"plan": "premium", "subscription_id": subscriptions.data[0].id}}
            )
            return {"success": True, "plan": "premium", "message": "Subscription activated!"}
        
        return {"success": False, "message": "No active subscription found"}
    
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error confirming payment: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/subscription/create-checkout")
async def create_checkout_session(data: CreateCheckoutRequest, current_user: User = Depends(get_current_user)):
    """Create a Stripe checkout session for premium subscription (fallback/web)"""
    try:
        # Create or retrieve Stripe customer
        user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
        stripe_customer_id = user_doc.get("stripe_customer_id")
        
        if not stripe_customer_id:
            # Create new Stripe customer
            customer = stripe.Customer.create(
                email=current_user.email,
                name=current_user.name,
                metadata={"user_id": current_user.user_id}
            )
            stripe_customer_id = customer.id
            
            # Save customer ID to database
            await db.users.update_one(
                {"user_id": current_user.user_id},
                {"$set": {"stripe_customer_id": stripe_customer_id}}
            )
        
        # Create checkout session with multiple payment methods
        # Apple Pay and Google Pay are automatically available through "card" when enabled in Stripe Dashboard
        # Using automatic_payment_methods for best coverage across all payment types
        checkout_session = stripe.checkout.Session.create(
            customer=stripe_customer_id,
            mode="subscription",
            payment_method_types=["card", "link"],  # Card includes Apple Pay & Google Pay when enabled
            line_items=[{
                "price_data": {
                    "currency": STRIPE_PRICE_CURRENCY,
                    "unit_amount": STRIPE_PRICE_AMOUNT,
                    "recurring": {"interval": "month"},
                    "product_data": {
                        "name": STRIPE_PRODUCT_NAME,
                        "description": "Unlimited swipes, priority matching, and premium features"
                    },
                },
                "quantity": 1,
            }],
            success_url=data.success_url or "educare://subscription-success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=data.cancel_url or "educare://subscription-cancel",
            metadata={"user_id": current_user.user_id},
            # Enable promotional codes if you want to offer discounts
            allow_promotion_codes=True,
            # Billing address collection
            billing_address_collection="auto",
            # Payment method options for better UX
            payment_method_options={
                "card": {
                    "request_three_d_secure": "automatic"
                }
            }
        )
        
        return {
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id
        }
    
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/subscription/status")
async def get_subscription_status(current_user: User = Depends(get_current_user)):
    """Get current subscription status for user"""
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    swipes_today = user_doc.get("swipes_today", 0)
    last_swipe_date = user_doc.get("last_swipe_date")
    
    # Reset swipes if it's a new day
    if last_swipe_date != today:
        swipes_today = 0
    
    plan = user_doc.get("plan", "free")
    remaining_swipes = FREE_SWIPES_PER_DAY - swipes_today if plan == "free" else None
    
    return {
        "plan": plan,
        "is_premium": plan == "premium",
        "stripe_customer_id": user_doc.get("stripe_customer_id"),
        "swipes_today": swipes_today if plan == "free" else 0,
        "remaining_swipes": remaining_swipes,
        "daily_limit": FREE_SWIPES_PER_DAY if plan == "free" else None,
        "price": f"£{STRIPE_PRICE_AMOUNT / 100:.2f}/month"
    }

@api_router.post("/subscription/cancel")
async def cancel_subscription(current_user: User = Depends(get_current_user)):
    """Cancel user's premium subscription"""
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    stripe_customer_id = user_doc.get("stripe_customer_id")
    
    if not stripe_customer_id:
        raise HTTPException(status_code=400, detail="No active subscription")
    
    try:
        # List active subscriptions for this customer
        subscriptions = stripe.Subscription.list(
            customer=stripe_customer_id,
            status="active",
            limit=1
        )
        
        if not subscriptions.data:
            raise HTTPException(status_code=400, detail="No active subscription found")
        
        # Cancel the subscription
        stripe.Subscription.cancel(subscriptions.data[0].id)
        
        # Update user plan in database
        await db.users.update_one(
            {"user_id": current_user.user_id},
            {"$set": {"plan": "free"}}
        )
        
        return {"message": "Subscription cancelled successfully", "plan": "free"}
    
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error cancelling subscription: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/subscription/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing Stripe signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    event_type = event["type"]
    event_data = event["data"]["object"]
    
    logger.info(f"Processing Stripe webhook: {event_type}")
    
    if event_type == "checkout.session.completed":
        # Payment successful, upgrade user to premium
        user_id = event_data.get("metadata", {}).get("user_id")
        customer_id = event_data.get("customer")
        
        if user_id:
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "plan": "premium",
                    "stripe_customer_id": customer_id
                }}
            )
            logger.info(f"User {user_id} upgraded to premium")
    
    elif event_type == "customer.subscription.deleted":
        # Subscription cancelled or expired
        customer_id = event_data.get("customer")
        
        if customer_id:
            await db.users.update_one(
                {"stripe_customer_id": customer_id},
                {"$set": {"plan": "free"}}
            )
            logger.info(f"Subscription deleted for customer {customer_id}")
    
    elif event_type == "customer.subscription.updated":
        # Subscription updated (could be paused, resumed, etc.)
        customer_id = event_data.get("customer")
        status = event_data.get("status")
        
        if customer_id:
            plan = "premium" if status == "active" else "free"
            await db.users.update_one(
                {"stripe_customer_id": customer_id},
                {"$set": {"plan": plan}}
            )
            logger.info(f"Subscription updated for customer {customer_id}, status: {status}")
    
    elif event_type == "invoice.payment_failed":
        # Payment failed, downgrade user
        customer_id = event_data.get("customer")
        
        if customer_id:
            await db.users.update_one(
                {"stripe_customer_id": customer_id},
                {"$set": {"plan": "free"}}
            )
            logger.info(f"Payment failed for customer {customer_id}, downgraded to free")
    
    return {"received": True}

# ==================== AI LEARNING SYSTEM ====================

# Store approved keywords learned by AI
AI_LEARNED_KEYWORDS = set()

async def load_approved_keywords():
    """Load approved keywords from database into memory"""
    global AI_LEARNED_KEYWORDS
    approved = await db.ai_learned_keywords.find({"status": "approved"}).to_list(1000)
    AI_LEARNED_KEYWORDS = set(k["keyword"].lower() for k in approved)
    logger.info(f"Loaded {len(AI_LEARNED_KEYWORDS)} approved AI-learned keywords")

async def analyze_text_for_new_patterns(text: str, source: str):
    """Use AI to analyze text for potential new concerning patterns (anonymized)"""
    if not text or len(text) < 20:
        return
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"pattern_analysis_{uuid.uuid4().hex[:8]}",
            system_message="""You are an AI that analyzes text to identify potentially concerning language patterns for student wellbeing monitoring.
            
            Your task is to identify any phrases or patterns that might indicate:
            - Mental health struggles (anxiety, depression, stress)
            - Social isolation
            - Academic distress
            - Self-harm or crisis indicators
            
            IMPORTANT: Only suggest NEW patterns that are NOT common/obvious keywords like "suicide", "kill", "harm" etc.
            Look for subtle phrases, metaphors, or emerging slang that young people might use.
            
            Return JSON with:
            {
                "suggested_keywords": [
                    {"keyword": "phrase", "risk_category": "low|medium|high", "reasoning": "why this is concerning"}
                ],
                "behavioral_insight": "any notable pattern or context observed (anonymized)"
            }
            
            Return empty arrays if nothing notable found. Be conservative - only suggest genuinely concerning patterns."""
        ).with_model("openai", "gpt-4o")
        
        response = await chat.send_message(
            UserMessage(text=f"Analyze this text from {source} for concerning patterns:\n\n{text[:500]}")
        )
        
        import json
        try:
            result = json.loads(response.text.strip().replace("```json", "").replace("```", ""))
            
            # Store any suggested keywords for admin review
            for suggestion in result.get("suggested_keywords", []):
                keyword = suggestion.get("keyword", "").lower().strip()
                if keyword and len(keyword) > 3:
                    # Check if keyword already exists
                    existing = await db.ai_learned_keywords.find_one({"keyword": keyword})
                    if not existing:
                        new_keyword = LearnedKeyword(
                            keyword=keyword,
                            context_examples=[f"[{source}] {text[:100]}..."],  # Truncated for privacy
                            risk_category=suggestion.get("risk_category", "medium"),
                            confidence_score=0.6,
                            frequency_score=1
                        )
                        await db.ai_learned_keywords.insert_one(new_keyword.dict())
                        logger.info(f"AI suggested new keyword: {keyword}")
                    else:
                        # Update frequency if exists
                        await db.ai_learned_keywords.update_one(
                            {"keyword": keyword},
                            {
                                "$inc": {"frequency_score": 1},
                                "$push": {"context_examples": {"$each": [f"[{source}] {text[:100]}..."], "$slice": -10}}
                            }
                        )
            
            # Store behavioral insight if any
            if result.get("behavioral_insight"):
                insight = AILearningInsight(
                    insight_type="behavioral_pattern",
                    title="New Behavioral Pattern Detected",
                    description=result["behavioral_insight"],
                    data={"source": source},
                    severity="info"
                )
                await db.ai_learning_insights.insert_one(insight.dict())
                
        except json.JSONDecodeError:
            pass
            
    except Exception as e:
        logger.error(f"Error in pattern analysis: {e}")

async def record_alert_feedback(alert_id: str, was_true_positive: bool, notes: str = None, admin_id: str = None):
    """Record admin feedback on alerts to improve AI learning"""
    await db.safeguarding_alerts.update_one(
        {"alert_id": alert_id},
        {
            "$set": {
                "was_true_positive": was_true_positive,
                "feedback_notes": notes,
                "feedback_by": admin_id,
                "feedback_at": datetime.now(timezone.utc)
            }
        }
    )
    
    # If false positive, record for learning
    if not was_true_positive:
        alert = await db.safeguarding_alerts.find_one({"alert_id": alert_id})
        if alert:
            insight = AILearningInsight(
                insight_type="false_positive",
                title="False Positive Recorded",
                description=f"Alert marked as false positive. Keywords: {alert.get('matched_keywords', [])}",
                data={
                    "alert_id": alert_id,
                    "matched_keywords": alert.get("matched_keywords", []),
                    "source": alert.get("source")
                },
                severity="info"
            )
            await db.ai_learning_insights.insert_one(insight.dict())

async def detect_behavioral_anomalies():
    """Periodically analyze aggregated data for behavioral anomalies"""
    # Get mood trends over last 7 days
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    
    # Aggregate mood data by university (anonymized)
    pipeline = [
        {"$match": {"created_at": {"$gte": seven_days_ago}}},
        {"$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "user_id",
            "as": "user"
        }},
        {"$unwind": {"path": "$user", "preserveNullAndEmptyArrays": True}},
        {"$group": {
            "_id": "$user.university",
            "avg_mood": {"$avg": "$mood"},
            "mood_count": {"$sum": 1},
            "low_moods": {"$sum": {"$cond": [{"$lte": ["$mood", 3]}, 1, 0]}}
        }}
    ]
    
    results = await db.mood_entries.aggregate(pipeline).to_list(100)
    
    for uni_data in results:
        if uni_data.get("mood_count", 0) >= 10:  # Only analyze if enough data
            low_mood_ratio = uni_data.get("low_moods", 0) / uni_data.get("mood_count", 1)
            
            if low_mood_ratio > 0.4:  # More than 40% low moods
                # Check if insight already exists
                existing = await db.ai_learning_insights.find_one({
                    "insight_type": "university_concern",
                    "data.university": uni_data["_id"],
                    "created_at": {"$gte": seven_days_ago}
                })
                
                if not existing:
                    insight = AILearningInsight(
                        insight_type="university_concern",
                        title=f"High Distress Pattern: {uni_data['_id'] or 'Unknown University'}",
                        description=f"Detected elevated distress levels. {int(low_mood_ratio*100)}% of mood entries are low (≤3). Average mood: {uni_data['avg_mood']:.1f}",
                        data={
                            "university": uni_data["_id"],
                            "avg_mood": uni_data["avg_mood"],
                            "low_mood_ratio": low_mood_ratio,
                            "sample_size": uni_data["mood_count"]
                        },
                        severity="warning"
                    )
                    await db.ai_learning_insights.insert_one(insight.dict())

# ==================== AI LEARNING API ENDPOINTS ====================

@api_router.get("/admin/ai-learning/keywords")
async def get_learned_keywords(status: Optional[str] = None, admin: User = Depends(require_admin)):
    """Get AI-suggested keywords for admin review"""
    query = {}
    if status:
        query["status"] = status
    
    keywords = await db.ai_learned_keywords.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    
    # Get stats
    pending_count = await db.ai_learned_keywords.count_documents({"status": "pending"})
    approved_count = await db.ai_learned_keywords.count_documents({"status": "approved"})
    rejected_count = await db.ai_learned_keywords.count_documents({"status": "rejected"})
    
    return {
        "keywords": keywords,
        "stats": {
            "pending": pending_count,
            "approved": approved_count,
            "rejected": rejected_count,
            "total": pending_count + approved_count + rejected_count
        }
    }

class KeywordActionRequest(BaseModel):
    action: str  # approve, reject
    risk_category: Optional[str] = None

@api_router.post("/admin/ai-learning/keywords/{keyword_id}/action")
async def action_keyword(keyword_id: str, data: KeywordActionRequest, admin: User = Depends(require_admin)):
    """Approve or reject an AI-suggested keyword"""
    keyword = await db.ai_learned_keywords.find_one({"keyword_id": keyword_id})
    if not keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")
    
    update_data = {
        "status": "approved" if data.action == "approve" else "rejected",
        "approved_by": admin.user_id,
        "updated_at": datetime.now(timezone.utc)
    }
    
    if data.risk_category:
        update_data["risk_category"] = data.risk_category
    
    await db.ai_learned_keywords.update_one(
        {"keyword_id": keyword_id},
        {"$set": update_data}
    )
    
    # If approved, add to active keywords
    if data.action == "approve":
        AI_LEARNED_KEYWORDS.add(keyword["keyword"].lower())
        logger.info(f"Admin {admin.email} approved keyword: {keyword['keyword']}")
    
    return {"success": True, "message": f"Keyword {data.action}d"}

@api_router.get("/admin/ai-learning/insights")
async def get_learning_insights(limit: int = 50, admin: User = Depends(require_admin)):
    """Get AI learning insights and behavioral patterns"""
    insights = await db.ai_learning_insights.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).to_list(limit)
    
    # Get unreviewed count
    unreviewed = await db.ai_learning_insights.count_documents({"reviewed": False})
    
    return {
        "insights": insights,
        "unreviewed_count": unreviewed
    }

@api_router.post("/admin/ai-learning/insights/{insight_id}/review")
async def review_insight(insight_id: str, action: str = "reviewed", admin: User = Depends(require_admin)):
    """Mark an insight as reviewed"""
    await db.ai_learning_insights.update_one(
        {"insight_id": insight_id},
        {
            "$set": {
                "reviewed": True,
                "reviewed_by": admin.user_id,
                "action_taken": action
            }
        }
    )
    return {"success": True}

class AlertFeedbackRequest(BaseModel):
    was_true_positive: bool
    notes: Optional[str] = None

@api_router.post("/admin/safeguarding-alerts/{alert_id}/feedback")
async def provide_alert_feedback(alert_id: str, data: AlertFeedbackRequest, admin: User = Depends(require_admin)):
    """Provide feedback on a safeguarding alert (was it a true positive?)"""
    await record_alert_feedback(alert_id, data.was_true_positive, data.notes, admin.user_id)
    
    # Log for learning
    insight_type = "true_positive_confirmed" if data.was_true_positive else "false_positive_reported"
    logger.info(f"Alert {alert_id} marked as {'true' if data.was_true_positive else 'false'} positive by {admin.email}")
    
    return {"success": True, "message": "Feedback recorded for AI learning"}

@api_router.get("/admin/ai-learning/stats")
async def get_ai_learning_stats(admin: User = Depends(require_admin)):
    """Get overall AI learning statistics"""
    # Keyword stats
    keyword_stats = {
        "pending": await db.ai_learned_keywords.count_documents({"status": "pending"}),
        "approved": await db.ai_learned_keywords.count_documents({"status": "approved"}),
        "rejected": await db.ai_learned_keywords.count_documents({"status": "rejected"})
    }
    
    # Alert feedback stats
    alert_stats = {
        "total_with_feedback": await db.safeguarding_alerts.count_documents({"was_true_positive": {"$exists": True}}),
        "true_positives": await db.safeguarding_alerts.count_documents({"was_true_positive": True}),
        "false_positives": await db.safeguarding_alerts.count_documents({"was_true_positive": False})
    }
    
    # Calculate accuracy if we have feedback
    if alert_stats["total_with_feedback"] > 0:
        alert_stats["accuracy_rate"] = round(
            (alert_stats["true_positives"] / alert_stats["total_with_feedback"]) * 100, 1
        )
    else:
        alert_stats["accuracy_rate"] = None
    
    # Insight stats
    insight_stats = {
        "total": await db.ai_learning_insights.count_documents({}),
        "unreviewed": await db.ai_learning_insights.count_documents({"reviewed": False}),
        "by_type": {}
    }
    
    # Count by type
    insight_types = await db.ai_learning_insights.aggregate([
        {"$group": {"_id": "$insight_type", "count": {"$sum": 1}}}
    ]).to_list(20)
    
    for it in insight_types:
        insight_stats["by_type"][it["_id"]] = it["count"]
    
    # Built-in vs learned keywords
    keyword_coverage = {
        "built_in": len(SAFEGUARDING_KEYWORDS),
        "learned_approved": keyword_stats["approved"],
        "total_active": len(SAFEGUARDING_KEYWORDS) + keyword_stats["approved"]
    }
    
    return {
        "keywords": keyword_stats,
        "alerts": alert_stats,
        "insights": insight_stats,
        "keyword_coverage": keyword_coverage,
        "learning_active": True
    }

@api_router.post("/admin/ai-learning/trigger-analysis")
async def trigger_behavioral_analysis(admin: User = Depends(require_admin)):
    """Manually trigger behavioral anomaly detection"""
    await detect_behavioral_anomalies()
    return {"success": True, "message": "Behavioral analysis completed"}

# ==================== HEALTH CHECK ====================

@api_router.get("/")
async def root():
    return {"message": "Educare API", "status": "running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== STARTUP EVENT: SEED DATA ====================

@app.on_event("startup")
async def seed_admin_and_test_users():
    """Seed admin user and test profiles on startup"""
    import hashlib
    
    # Admin credentials
    admin_email = "yusufquadri83@gmail.com"
    admin_password = "Oluwatobi11@"
    admin_password_hash = hashlib.sha256(admin_password.encode()).hexdigest()
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        admin_user = {
            "user_id": str(uuid.uuid4()),
            "email": admin_email,
            "name": "Yusuf Quadri",
            "role": "admin",
            "admin_password": admin_password_hash,
            "password_hash": admin_password_hash,
            "created_at": datetime.now(timezone.utc),
            "profile_completed": True,
            "interests": [],
            "subscription_status": "premium",
            "is_premium": True
        }
        await db.users.insert_one(admin_user)
        logger.info(f"Admin user created: {admin_email}")
    else:
        # Update password hash if admin exists
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {
                "admin_password": admin_password_hash,
                "password_hash": admin_password_hash,
                "role": "admin",
                "subscription_status": "premium",
                "is_premium": True
            }}
        )
        logger.info(f"Admin user updated: {admin_email}")
    
    # Create test/dummy profiles for matching with photos
    test_profiles = [
        {
            "user_id": "test-user-001",
            "email": "emma.wilson@test.edu",
            "name": "Emma Wilson",
            "age": 21,
            "gender": "female",
            "interested_in": ["male", "female", "non-binary"],
            "university": "University of Manchester",
            "campus_name": "Main Campus",
            "course": "Computer Science",
            "study_style": "Visual Learner",
            "bio": "Passionate about AI and machine learning! Looking for study partners who love coding as much as I do.",
            "interests": ["Programming", "AI", "Gaming", "Music", "Coffee"],
            "photos": ["https://images.unsplash.com/photo-1765648636065-fd5c0884b629?w=400&h=400&fit=crop"],
            "picture": "https://images.unsplash.com/photo-1765648636065-fd5c0884b629?w=400&h=400&fit=crop",
            "role": "student",
            "profile_completed": True,
            "created_at": datetime.now(timezone.utc),
            "subscription_status": "free"
        },
        {
            "user_id": "test-user-002",
            "email": "james.chen@test.edu",
            "name": "James Chen",
            "age": 22,
            "gender": "male",
            "interested_in": ["male", "female", "non-binary"],
            "university": "University of Birmingham",
            "campus_name": "Edgbaston",
            "course": "Data Science",
            "study_style": "Night Owl",
            "bio": "Data nerd by day, gamer by night. Always up for deep discussions about tech and philosophy.",
            "interests": ["Data Science", "Philosophy", "Gaming", "Hiking", "Photography"],
            "photos": ["https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400&h=400&fit=crop"],
            "picture": "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400&h=400&fit=crop",
            "role": "student",
            "profile_completed": True,
            "created_at": datetime.now(timezone.utc),
            "subscription_status": "free"
        },
        {
            "user_id": "test-user-003",
            "email": "sofia.martinez@test.edu",
            "name": "Sofia Martinez",
            "age": 20,
            "gender": "female",
            "interested_in": ["male", "female", "non-binary"],
            "university": "University of Leeds",
            "campus_name": "Main Campus",
            "course": "Psychology",
            "study_style": "Early Bird",
            "bio": "Psychology student fascinated by human behavior. Love yoga, meditation, and meaningful conversations.",
            "interests": ["Psychology", "Yoga", "Reading", "Art", "Travel"],
            "photos": ["https://images.unsplash.com/photo-1765648636178-60e73bcc865e?w=400&h=400&fit=crop"],
            "picture": "https://images.unsplash.com/photo-1765648636178-60e73bcc865e?w=400&h=400&fit=crop",
            "role": "student",
            "profile_completed": True,
            "created_at": datetime.now(timezone.utc),
            "subscription_status": "free"
        },
        {
            "user_id": "test-user-004",
            "email": "alex.thompson@test.edu",
            "name": "Alex Thompson",
            "age": 23,
            "gender": "non-binary",
            "interested_in": ["male", "female", "non-binary"],
            "university": "University of Bristol",
            "campus_name": "Clifton",
            "course": "Environmental Science",
            "study_style": "Group Study",
            "bio": "Eco-warrior saving the planet one study session at a time! Let's discuss climate change over coffee.",
            "interests": ["Environment", "Sustainability", "Hiking", "Coffee", "Documentaries"],
            "photos": ["https://images.pexels.com/photos/5538626/pexels-photo-5538626.jpeg?w=400&h=400&fit=crop"],
            "picture": "https://images.pexels.com/photos/5538626/pexels-photo-5538626.jpeg?w=400&h=400&fit=crop",
            "role": "student",
            "profile_completed": True,
            "created_at": datetime.now(timezone.utc),
            "subscription_status": "free"
        },
        {
            "user_id": "test-user-005",
            "email": "priya.patel@test.edu",
            "name": "Priya Patel",
            "age": 21,
            "gender": "female",
            "interested_in": ["male", "female", "non-binary"],
            "university": "University of Warwick",
            "campus_name": "Main Campus",
            "course": "Business Analytics",
            "study_style": "Visual Learner",
            "bio": "Future entrepreneur building the next big thing! Love networking and brainstorming sessions.",
            "interests": ["Business", "Startups", "Finance", "Networking", "Fitness"],
            "photos": ["https://images.pexels.com/photos/7683910/pexels-photo-7683910.jpeg?w=400&h=400&fit=crop"],
            "picture": "https://images.pexels.com/photos/7683910/pexels-photo-7683910.jpeg?w=400&h=400&fit=crop",
            "role": "student",
            "profile_completed": True,
            "created_at": datetime.now(timezone.utc),
            "subscription_status": "premium"
        }
    ]
    
    for profile in test_profiles:
        existing = await db.users.find_one({"user_id": profile["user_id"]})
        if not existing:
            await db.users.insert_one(profile)
            logger.info(f"Test profile created: {profile['name']}")
        else:
            # Update existing profile with all fields including role and interested_in
            await db.users.update_one(
                {"user_id": profile["user_id"]},
                {"$set": {
                    "photos": profile["photos"], 
                    "picture": profile["picture"],
                    "role": "student",
                    "interested_in": profile["interested_in"],
                    "gender": profile["gender"]
                }}
            )
            logger.info(f"Test profile updated: {profile['name']}")
    
    logger.info("Seed data initialization complete")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
