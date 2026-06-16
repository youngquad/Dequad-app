import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import asyncio
import logging
from typing import List
from config import SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_FROM_NAME
from database import db

logger = logging.getLogger(__name__)


def is_smtp_configured() -> bool:
    return bool(SMTP_HOST and SMTP_USERNAME and SMTP_PASSWORD)


def send_email_sync(to_emails: List[str], subject: str, html_body: str, text_body: str = None):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
        msg["To"] = ", ".join(to_emails)

        if text_body:
            msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM_EMAIL, to_emails, msg.as_string())

        logger.info(f"Email sent successfully to {to_emails}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        return False


async def send_email_async(to_emails: List[str], subject: str, html_body: str, text_body: str = None):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, send_email_sync, to_emails, subject, html_body, text_body)


async def get_admin_emails() -> List[str]:
    """Return all addresses that should receive admin-level emails (safeguarding alerts, etc.).

    Includes every user with `role: "admin"` in the database, plus any addresses in the
    `SAFEGUARDING_ALERT_EMAILS` env var (comma-separated). Useful for routing alerts to
    a dedicated mailbox (e.g. safeguarding@dequad.com) without changing the platform-owner
    account.
    """
    import os as _os
    admins = await db.users.find(
        {"role": "admin"},
        {"_id": 0, "email": 1}
    ).to_list(100)
    emails = {a["email"] for a in admins if a.get("email")}
    extras = [
        e.strip()
        for e in _os.environ.get("SAFEGUARDING_ALERT_EMAILS", "").split(",")
        if e.strip()
    ]
    emails.update(extras)
    return list(emails)


def create_safeguarding_email_html(alert_data: dict) -> str:
    risk_color = "#DC2626" if alert_data.get("risk_level") == "high" else "#F59E0B"
    risk_bg = "#FEE2E2" if alert_data.get("risk_level") == "high" else "#FEF3C7"
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: {risk_color}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
            .content {{ background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }}
            .alert-box {{ background: {risk_bg}; border: 2px solid {risk_color}; border-radius: 8px; padding: 15px; margin: 15px 0; }}
            .field {{ margin: 10px 0; }}
            .label {{ font-weight: bold; color: #374151; }}
            .footer {{ text-align: center; padding: 15px; color: #6b7280; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>DEQUAD Safeguarding Alert</h1>
                <p style="margin: 0; font-size: 18px;">Risk Level: {alert_data.get("risk_level", "unknown").upper()}</p>
            </div>
            <div class="content">
                <div class="alert-box">
                    <div class="field"><span class="label">Student:</span> {alert_data.get("user_name", "Unknown")}</div>
                    <div class="field"><span class="label">Email:</span> {alert_data.get("user_email", "Unknown")}</div>
                    <div class="field"><span class="label">Source:</span> {alert_data.get("source", "Unknown")}</div>
                    <div class="field"><span class="label">Time:</span> {alert_data.get("created_at", "Unknown")}</div>
                </div>
                <div class="field">
                    <span class="label">Matched Keywords:</span>
                    <p style="color: {risk_color}; font-weight: bold;">{', '.join(alert_data.get("matched_keywords", []))}</p>
                </div>
                <div class="field">
                    <span class="label">Content:</span>
                    <p style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb;">
                        {alert_data.get("content", "No content available")[:500]}
                    </p>
                </div>
                <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
                    Please review this alert in the admin dashboard and take appropriate action.
                </p>
            </div>
            <div class="footer">
                <p>This is an automated notification from DEQUAD Safeguarding System.<br>
                Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """


def create_safeguarding_email_text(alert_data: dict) -> str:
    return f"""
DEQUAD SAFEGUARDING ALERT - {alert_data["risk_level"].upper()} RISK

Student: {alert_data.get("user_name", "Unknown")}
Email: {alert_data.get("user_email", "Unknown")}
Source: {alert_data.get("source", "Unknown")}
Time: {alert_data.get("created_at", "Unknown")}

Matched Keywords: {', '.join(alert_data.get("matched_keywords", []))}

Content:
{alert_data.get("content", "No content available")[:500]}

Please review this alert in the admin dashboard.

This is an automated notification from DEQUAD Safeguarding System.
"""


async def send_safeguarding_email_to_admins(alert_data: dict):
    if not is_smtp_configured():
        logger.warning("SMTP not configured - skipping safeguarding email notification")
        return

    admin_emails = await get_admin_emails()
    if not admin_emails:
        logger.warning("No admin emails found for safeguarding notification")
        return

    risk_emoji = "HIGH" if alert_data.get("risk_level") == "high" else "MEDIUM"
    subject = f"DEQUAD Safeguarding Alert [{risk_emoji} RISK] - {alert_data.get('user_name', 'Unknown Student')}"
    html_body = create_safeguarding_email_html(alert_data)
    text_body = create_safeguarding_email_text(alert_data)

    try:
        success = await send_email_async(admin_emails, subject, html_body, text_body)
        if success:
            logger.info(f"Safeguarding email sent to {len(admin_emails)} admin(s)")
        else:
            logger.error("Failed to send safeguarding email")
    except Exception as e:
        logger.error(f"Error sending safeguarding email: {e}")


def create_support_reply_email_html(student_name: str, agent_name: str, reply_text: str, app_url: str) -> str:
    import html as _html
    safe_reply = _html.escape(reply_text).replace("\n", "<br>")
    safe_name = _html.escape(student_name or "there")
    safe_agent = _html.escape(agent_name or "DEQUAD Support")
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; margin: 0; padding: 0; }}
            .container {{ max-width: 560px; margin: 0 auto; padding: 24px; }}
            .header {{ background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 24px; text-align: center; border-radius: 12px 12px 0 0; }}
            .header h1 {{ margin: 0; font-size: 22px; }}
            .content {{ background: white; padding: 28px; border: 1px solid #e5e7eb; border-top: none; }}
            .agent-row {{ display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }}
            .agent-badge {{ background: #10B981; color: white; font-size: 11px; padding: 4px 8px; border-radius: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }}
            .agent-name {{ font-weight: 700; color: #111827; }}
            .reply-box {{ background: #F3F4F6; border-left: 4px solid #6366F1; padding: 16px 18px; border-radius: 8px; color: #1f2937; font-size: 15px; margin: 4px 0 20px 0; }}
            .button {{ display: inline-block; background: #6366F1; color: white !important; padding: 12px 22px; text-decoration: none; border-radius: 8px; margin: 8px 0 4px 0; font-weight: 600; }}
            .footer {{ text-align: center; padding: 18px; color: #6b7280; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>You have a reply from DEQUAD Support</h1>
            </div>
            <div class="content">
                <p>Hi {safe_name},</p>
                <div class="agent-row">
                    <span class="agent-badge">Human Agent</span>
                    <span class="agent-name">{safe_agent}</span>
                </div>
                <div class="reply-box">{safe_reply}</div>
                <div style="text-align: center;">
                    <a href="{app_url}" class="button">Open the conversation</a>
                </div>
                <p style="margin-top: 22px; color: #6b7280; font-size: 13px;">
                    We're here whenever you need us — feel free to reply directly in the app.
                </p>
            </div>
            <div class="footer">
                <p>You're receiving this because a DEQUAD support agent replied to your conversation.<br>
                You can turn off these emails from <strong>Profile → Push Notifications</strong> in the app.</p>
            </div>
        </div>
    </body>
    </html>
    """


def create_support_reply_email_text(student_name: str, agent_name: str, reply_text: str, app_url: str) -> str:
    return f"""Hi {student_name or 'there'},

You have a new reply from DEQUAD Support ({agent_name or 'Human Agent'}):

---
{reply_text}
---

Open the conversation: {app_url}

You can turn off these emails from Profile -> Push Notifications in the app.
"""


async def send_support_reply_email(student_email: str, student_name: str, agent_name: str, reply_text: str, app_url: str) -> bool:
    if not is_smtp_configured():
        logger.warning("SMTP not configured - skipping support reply email")
        return False
    if not student_email:
        return False
    subject = "You have a reply from DEQUAD Support"
    html_body = create_support_reply_email_html(student_name, agent_name, reply_text, app_url)
    text_body = create_support_reply_email_text(student_name, agent_name, reply_text, app_url)
    try:
        return await send_email_async([student_email], subject, html_body, text_body)
    except Exception as e:
        logger.error(f"Support reply email error: {e}")
        return False


def create_support_inbound_email_html(student_name: str, student_email: str, message_text: str, university: str = "") -> str:
    import html as _html
    safe_text = _html.escape(message_text).replace("\n", "<br>")
    safe_name = _html.escape(student_name or "Unknown student")
    safe_email = _html.escape(student_email or "")
    safe_uni = _html.escape(university or "")
    uni_line = f"<div><strong>University:</strong> {safe_uni}</div>" if safe_uni else ""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; line-height: 1.6; color: #1f2937; background: #f9fafb; margin: 0; padding: 0; }}
            .container {{ max-width: 560px; margin: 0 auto; padding: 24px; }}
            .header {{ background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 20px 24px; border-radius: 12px 12px 0 0; }}
            .header h1 {{ margin: 0; font-size: 18px; font-weight: 700; }}
            .content {{ background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }}
            .meta {{ background: #F3F4F6; padding: 12px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 14px; }}
            .meta div {{ margin: 2px 0; }}
            .message-box {{ background: #EEF2FF; border-left: 4px solid #6366F1; padding: 14px 16px; border-radius: 8px; color: #1f2937; font-size: 14px; }}
            .button {{ display: inline-block; background: #6366F1; color: white !important; padding: 11px 20px; text-decoration: none; border-radius: 8px; margin: 16px 0 0 0; font-weight: 600; font-size: 14px; }}
            .footer {{ text-align: center; padding: 14px; color: #6b7280; font-size: 11px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>New support message from a student</h1>
            </div>
            <div class="content">
                <div class="meta">
                    <div><strong>From:</strong> {safe_name}</div>
                    <div><strong>Email:</strong> {safe_email}</div>
                    {uni_line}
                </div>
                <div class="message-box">{safe_text}</div>
                <p style="color:#6b7280;font-size:12px;margin-top:14px;">The student has already received an instant AI auto-reply. Open the admin inbox to follow up as a human agent if needed.</p>
            </div>
            <div class="footer">
                <p>Automated notification from DEQUAD Support.<br>
                Throttled: at most one email per student per 30 minutes.</p>
            </div>
        </div>
    </body>
    </html>
    """


def create_support_inbound_email_text(student_name: str, student_email: str, message_text: str, university: str = "") -> str:
    return f"""New support message from a student.

From: {student_name or 'Unknown'}
Email: {student_email or ''}
University: {university or 'N/A'}

Message:
{message_text}

The student has already received an instant AI auto-reply.
Open the admin inbox to follow up as a human agent if needed.

This is an automated notification (throttled: at most one per student per 30 minutes).
"""


async def send_support_inbound_email_to_admins(
    student_id: str,
    student_name: str,
    student_email: str,
    message_text: str,
    university: str = "",
) -> bool:
    """Notify admins when a student sends a new support message.

    Throttles per-student to one email per 30 minutes (DB-tracked) so a chatty
    student can't flood the admin inbox.
    """
    if not is_smtp_configured():
        return False

    from datetime import datetime, timezone, timedelta
    throttle_window = datetime.now(timezone.utc) - timedelta(minutes=30)
    recent = await db.support_messages.find_one({
        "user_id": student_id,
        "sender": "user",
        "admin_email_sent_at": {"$gte": throttle_window},
    })
    if recent:
        logger.info(f"Support inbound email throttled for {student_id}")
        return False

    admin_emails = await get_admin_emails()
    if not admin_emails:
        return False

    subject = f"DEQUAD Support: new message from {student_name or 'a student'}"
    html_body = create_support_inbound_email_html(student_name, student_email, message_text, university)
    text_body = create_support_inbound_email_text(student_name, student_email, message_text, university)

    try:
        success = await send_email_async(admin_emails, subject, html_body, text_body)
        if success:
            # Mark the latest user message as having triggered an admin notification.
            from datetime import datetime as _dt, timezone as _tz
            latest = await db.support_messages.find_one(
                {"user_id": student_id, "sender": "user"},
                sort=[("created_at", -1)],
                projection={"id": 1, "_id": 0},
            )
            if latest:
                await db.support_messages.update_one(
                    {"id": latest["id"]},
                    {"$set": {"admin_email_sent_at": _dt.now(_tz.utc)}},
                )
            logger.info(f"Support inbound email sent to {len(admin_emails)} admin(s) for student {student_id}")
        return success
    except Exception as e:
        logger.error(f"Support inbound email error: {e}")
        return False


def create_password_reset_email_html(name: str, reset_url: str) -> str:
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
                <h1>Password Reset</h1>
            </div>
            <div class="content">
                <p>Hi {name},</p>
                <p>We received a request to reset your DEQUAD password. Click the button below to set a new password:</p>
                <div style="text-align: center;">
                    <a href="{reset_url}" class="button">Reset Password</a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-size: 12px;">{reset_url}</p>
                <div class="warning">
                    <strong>This link expires in 1 hour.</strong><br>
                    If you didn't request this reset, please ignore this email.
                </div>
            </div>
            <div class="footer">
                <p>This is an automated message from DEQUAD.<br>Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
