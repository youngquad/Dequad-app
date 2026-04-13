import logging
import asyncio
from datetime import datetime, timezone
from database import db
from models import SafeguardingAlert, LearnedKeyword, AILearningInsight
from helpers.email import send_safeguarding_email_to_admins
from config import EMERGENT_LLM_KEY
from emergentintegrations.llm.chat import LlmChat, UserMessage
import uuid
import json

logger = logging.getLogger(__name__)

# ==================== SAFEGUARDING KEYWORDS ====================

SAFEGUARDING_KEYWORDS = [
    "kill myself", "want to die", "end my life", "ending my life", "suicide",
    "suicidal", "end it", "take my life", "taking my life",
    "no reason to live", "end it all", "ending it all", "better off dead",
    "can't go on", "give up on life", "don't want to be here", "want to disappear",
    "not worth living", "life isn't worth", "no point living", "rather be dead",
    "wish i was dead", "wish i were dead", "wanna die", "i want to die",
    "self harm", "self-harm", "selfharm", "cut myself", "cutting myself",
    "hurt myself", "hurting myself", "harm myself", "harming myself",
    "slit my wrists", "overdose", "take pills", "jump off", "hang myself",
    "kill someone", "hurt someone", "harm someone", "want to hurt",
    "going to hurt", "attack someone", "violent thoughts",
    "can't take it anymore", "cant take it anymore", "no way out",
    "hopeless", "no hope", "nobody cares", "no one cares",
    "nobody would miss me", "no one would miss me", "better without me",
    "world would be better", "everyone hates me"
]

CRISIS_RESOURCES = {
    "samaritans": {
        "name": "Samaritans", "phone": "116 123",
        "description": "Free 24/7 emotional support - Someone to listen without judgement",
        "available": "24 hours a day, 7 days a week", "website": "https://www.samaritans.org"
    },
    "shout": {
        "name": "Shout Crisis Text Line", "phone": "Text SHOUT to 85258",
        "description": "Free, confidential text support for when you can't talk",
        "available": "24/7", "website": "https://giveusashout.org"
    },
    "papyrus": {
        "name": "PAPYRUS HOPELineUK", "phone": "0800 068 4141",
        "description": "For young people under 35 - Text 07860 039967",
        "available": "9am-midnight every day", "website": "https://www.papyrus-uk.org"
    },
    "student_minds": {
        "name": "Student Minds", "phone": "Visit website",
        "description": "UK's student mental health charity - Resources & peer support",
        "available": "Online resources 24/7", "website": "https://www.studentminds.org.uk"
    },
    "nhs_111": {
        "name": "NHS 111", "phone": "111",
        "description": "Non-emergency medical help and mental health support",
        "available": "24 hours a day", "website": "https://111.nhs.uk"
    },
    "emergency": {
        "name": "Emergency Services", "phone": "999",
        "description": "For immediate danger to life - Call or go to A&E",
        "available": "24 hours a day"
    },
    "calm": {
        "name": "CALM (Campaign Against Living Miserably)", "phone": "0800 58 58 58",
        "description": "For men who need to talk - Webchat also available",
        "available": "5pm-midnight every day", "website": "https://www.thecalmzone.net"
    }
}

# AI learned keywords set (loaded on startup)
AI_LEARNED_KEYWORDS = set()

# Profanity & racist language filter
PROFANITY_WORDS = [
    "fuck", "fucking", "fucker", "fck", "f*ck", "fuk",
    "shit", "shite", "sh1t", "bullshit",
    "bitch", "b1tch", "biatch",
    "ass", "asshole", "arsehole", "arse",
    "bastard", "dick", "dickhead", "cock", "cunt",
    "wanker", "twat", "piss", "prick", "slut", "whore",
    "damn", "dammit", "crap", "bollocks",
]

RACIST_WORDS = [
    "nigger", "nigga", "n1gger", "n1gga",
    "chink", "ch1nk", "gook",
    "spic", "sp1c", "wetback",
    "kike", "k1ke",
    "paki", "pak1",
    "cracker", "honky",
    "beaner", "coon", "darkie",
    "jap", "raghead", "towelhead",
    "wog", "zipperhead", "redskin",
    "white supremacy", "white power",
    "heil hitler", "sieg heil",
]


def check_language_filter(text: str) -> dict:
    """Check text for profanity and racist language. Returns filter result."""
    if not text:
        return {"blocked": False, "reason": None, "matched": []}

    text_lower = text.lower()
    # Normalize common substitutions
    normalized = text_lower.replace("@", "a").replace("0", "o").replace("1", "i").replace("3", "e").replace("$", "s")

    matched_racist = []
    for word in RACIST_WORDS:
        if word in text_lower or word in normalized:
            matched_racist.append(word)

    if matched_racist:
        return {
            "blocked": True,
            "reason": "racist_language",
            "message": "Your message contains language that violates our community guidelines. Racist or discriminatory language is not tolerated.",
            "matched": matched_racist
        }

    matched_profanity = []
    words_in_text = text_lower.split()
    for word in PROFANITY_WORDS:
        if word in words_in_text or word in normalized.split():
            matched_profanity.append(word)

    if matched_profanity:
        return {
            "blocked": True,
            "reason": "profanity",
            "message": "Your message contains inappropriate language. Please keep conversations respectful.",
            "matched": matched_profanity
        }

    return {"blocked": False, "reason": None, "matched": []}


def check_safeguarding_content(text: str) -> dict:
    if not text:
        return {"flagged": False, "risk_level": "none", "matched_keywords": []}

    text_lower = text.lower()
    matched_keywords = []

    for keyword in SAFEGUARDING_KEYWORDS:
        if keyword in text_lower:
            matched_keywords.append(keyword)

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


async def create_safeguarding_alert(user, source: str, content: str, safeguarding_result: dict):
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

    asyncio.create_task(send_safeguarding_email_to_admins(alert_data))
    return alert


# ==================== AI LEARNING FUNCTIONS ====================

async def load_approved_keywords():
    global AI_LEARNED_KEYWORDS
    approved = await db.ai_learned_keywords.find({"status": "approved"}).to_list(1000)
    AI_LEARNED_KEYWORDS = set(k["keyword"].lower() for k in approved)
    logger.info(f"Loaded {len(AI_LEARNED_KEYWORDS)} approved AI-learned keywords")


async def analyze_text_for_new_patterns(text: str, source: str):
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

        try:
            result = json.loads(response.text.strip().replace("```json", "").replace("```", ""))

            for suggestion in result.get("suggested_keywords", []):
                keyword = suggestion.get("keyword", "").lower().strip()
                if keyword and len(keyword) > 3:
                    existing = await db.ai_learned_keywords.find_one({"keyword": keyword})
                    if not existing:
                        new_keyword = LearnedKeyword(
                            keyword=keyword,
                            context_examples=[f"[{source}] {text[:100]}..."],
                            risk_category=suggestion.get("risk_category", "medium"),
                            confidence_score=0.6,
                            frequency_score=1
                        )
                        await db.ai_learned_keywords.insert_one(new_keyword.dict())
                        logger.info(f"AI suggested new keyword: {keyword}")
                    else:
                        await db.ai_learned_keywords.update_one(
                            {"keyword": keyword},
                            {
                                "$inc": {"frequency_score": 1},
                                "$push": {"context_examples": {"$each": [f"[{source}] {text[:100]}..."], "$slice": -10}}
                            }
                        )

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
    await db.safeguarding_alerts.update_one(
        {"alert_id": alert_id},
        {"$set": {
            "was_true_positive": was_true_positive,
            "feedback_notes": notes,
            "feedback_by": admin_id,
            "feedback_at": datetime.now(timezone.utc)
        }}
    )

    if not was_true_positive:
        alert = await db.safeguarding_alerts.find_one({"alert_id": alert_id})
        if alert:
            insight = AILearningInsight(
                insight_type="false_positive",
                title="False Positive Recorded",
                description=f"Alert marked as false positive. Keywords: {alert.get('matched_keywords', [])}",
                data={"alert_id": alert_id, "matched_keywords": alert.get("matched_keywords", []), "source": alert.get("source")},
                severity="info"
            )
            await db.ai_learning_insights.insert_one(insight.dict())


async def detect_behavioral_anomalies():
    seven_days_ago = datetime.now(timezone.utc) - __import__('datetime').timedelta(days=7)

    pipeline = [
        {"$match": {"created_at": {"$gte": seven_days_ago}}},
        {"$lookup": {"from": "users", "localField": "user_id", "foreignField": "user_id", "as": "user"}},
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
        if uni_data.get("mood_count", 0) >= 10:
            low_mood_ratio = uni_data.get("low_moods", 0) / uni_data.get("mood_count", 1)
            if low_mood_ratio > 0.4:
                existing = await db.ai_learning_insights.find_one({
                    "insight_type": "university_concern",
                    "data.university": uni_data["_id"],
                    "created_at": {"$gte": seven_days_ago}
                })

                if not existing:
                    insight = AILearningInsight(
                        insight_type="university_concern",
                        title=f"High Distress Pattern: {uni_data['_id'] or 'Unknown University'}",
                        description=f"Detected elevated distress levels. {int(low_mood_ratio*100)}% of mood entries are low. Average mood: {uni_data['avg_mood']:.1f}",
                        data={"university": uni_data["_id"], "avg_mood": uni_data["avg_mood"], "low_mood_ratio": low_mood_ratio, "sample_size": uni_data["mood_count"]},
                        severity="warning"
                    )
                    await db.ai_learning_insights.insert_one(insight.dict())
