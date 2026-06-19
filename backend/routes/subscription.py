from fastapi import APIRouter, Depends, HTTPException, Request
from datetime import datetime, timezone
import hashlib
import uuid
import os
import logging
import stripe

from database import db
from models import User, CreateCheckoutRequest, UniversitySubscriptionRequest
from helpers.auth import get_current_user
from config import (
    STRIPE_WEBHOOK_SECRET, STRIPE_UNIVERSITY_WEBHOOK_SECRET,
    STRIPE_PRICE_AMOUNT, STRIPE_PRICE_CURRENCY,
    STRIPE_PRODUCT_NAME, UNIVERSITY_PRICE_AMOUNT, UNIVERSITY_PRICE_CURRENCY,
    UNIVERSITY_PRODUCT_NAME, FREE_LIKES_PER_WEEK
)
from routes.matches import _week_start_iso, _next_week_reset

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/subscription/create-payment-sheet")
async def create_payment_sheet(current_user: User = Depends(get_current_user)):
    try:
        user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
        stripe_customer_id = user_doc.get("stripe_customer_id")

        if not stripe_customer_id:
            customer = stripe.Customer.create(email=current_user.email, name=current_user.name, metadata={"user_id": current_user.user_id})
            stripe_customer_id = customer.id
            await db.users.update_one({"user_id": current_user.user_id}, {"$set": {"stripe_customer_id": stripe_customer_id}})

        ephemeral_key = stripe.EphemeralKey.create(customer=stripe_customer_id, stripe_version="2023-10-16")
        existing_subs = stripe.Subscription.list(customer=stripe_customer_id, status="incomplete", limit=1)

        if existing_subs.data:
            subscription = existing_subs.data[0]
        else:
            try:
                products = stripe.Product.list(limit=1)
                product_id = products.data[0].id if products.data else stripe.Product.create(name=STRIPE_PRODUCT_NAME).id
            except Exception as e:
                logger.warning(f"Product creation issue: {e}")
                product_id = None

            if product_id:
                subscription = stripe.Subscription.create(
                    customer=stripe_customer_id,
                    items=[{"price_data": {"currency": STRIPE_PRICE_CURRENCY, "unit_amount": STRIPE_PRICE_AMOUNT, "recurring": {"interval": "month"}, "product": product_id}}],
                    payment_behavior="default_incomplete", payment_settings={"save_default_payment_method": "on_subscription"},
                    expand=["latest_invoice.payments"], metadata={"user_id": current_user.user_id}
                )
            else:
                price = stripe.Price.create(currency=STRIPE_PRICE_CURRENCY, unit_amount=STRIPE_PRICE_AMOUNT, recurring={"interval": "month"}, product_data={"name": STRIPE_PRODUCT_NAME})
                subscription = stripe.Subscription.create(
                    customer=stripe_customer_id, items=[{"price": price.id}],
                    payment_behavior="default_incomplete", payment_settings={"save_default_payment_method": "on_subscription"},
                    expand=["latest_invoice.payments"], metadata={"user_id": current_user.user_id}
                )

        invoice = stripe.Invoice.retrieve(subscription.latest_invoice, expand=["payments"])
        if invoice.payments and invoice.payments.data:
            payment_intent = stripe.PaymentIntent.retrieve(invoice.payments.data[0].payment.payment_intent)
        else:
            payment_intent = stripe.PaymentIntent.create(amount=STRIPE_PRICE_AMOUNT, currency=STRIPE_PRICE_CURRENCY,
                customer=stripe_customer_id, metadata={"subscription_id": subscription.id, "user_id": current_user.user_id})

        return {"paymentIntent": payment_intent.client_secret, "ephemeralKey": ephemeral_key.secret,
                "customer": stripe_customer_id, "publishableKey": os.environ.get("STRIPE_PUBLISHABLE_KEY", ""), "subscriptionId": subscription.id}
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}"); raise HTTPException(status_code=400, detail=str(e))


@router.post("/subscription/confirm-payment")
async def confirm_subscription_payment(current_user: User = Depends(get_current_user)):
    try:
        user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
        stripe_customer_id = user_doc.get("stripe_customer_id")
        if not stripe_customer_id: raise HTTPException(status_code=400, detail="No customer found")
        subscriptions = stripe.Subscription.list(customer=stripe_customer_id, status="active", limit=1)
        if subscriptions.data:
            await db.users.update_one({"user_id": current_user.user_id}, {"$set": {"plan": "premium", "subscription_id": subscriptions.data[0].id}})
            return {"success": True, "plan": "premium", "message": "Subscription activated!"}
        return {"success": False, "message": "No active subscription found"}
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}"); raise HTTPException(status_code=400, detail=str(e))


@router.post("/subscription/create-checkout")
async def create_checkout_session(data: CreateCheckoutRequest, current_user: User = Depends(get_current_user)):
    try:
        user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
        stripe_customer_id = user_doc.get("stripe_customer_id")
        if not stripe_customer_id:
            customer = stripe.Customer.create(email=current_user.email, name=current_user.name, metadata={"user_id": current_user.user_id})
            stripe_customer_id = customer.id
            await db.users.update_one({"user_id": current_user.user_id}, {"$set": {"stripe_customer_id": stripe_customer_id}})

        # Default to a WEB-friendly success/cancel URL (browser can navigate to it).
        # The mobile app can override these by passing `dequad://...` deep links in the request body.
        app_url = os.environ.get("APP_URL", "").rstrip("/")
        default_success = f"{app_url}/subscription-success?session_id={{CHECKOUT_SESSION_ID}}" if app_url else "dequad://subscription-success?session_id={CHECKOUT_SESSION_ID}"
        default_cancel = f"{app_url}/subscription" if app_url else "dequad://subscription-cancel"

        checkout_session = stripe.checkout.Session.create(
            customer=stripe_customer_id, mode="subscription", payment_method_types=["card", "link"],
            line_items=[{"price_data": {"currency": STRIPE_PRICE_CURRENCY, "unit_amount": STRIPE_PRICE_AMOUNT,
                "recurring": {"interval": "month"}, "product_data": {"name": STRIPE_PRODUCT_NAME, "description": "Unlimited swipes, priority matching, and premium features"}}, "quantity": 1}],
            success_url=data.success_url or default_success,
            cancel_url=data.cancel_url or default_cancel,
            metadata={"user_id": current_user.user_id}, allow_promotion_codes=True, billing_address_collection="auto",
            payment_method_options={"card": {"request_three_d_secure": "automatic"}}
        )
        return {"checkout_url": checkout_session.url, "session_id": checkout_session.id}
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}"); raise HTTPException(status_code=400, detail=str(e))


@router.get("/subscription/status")
async def get_subscription_status(current_user: User = Depends(get_current_user)):
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    plan = user_doc.get("plan", "free")
    week_start = _week_start_iso()
    likes_this_week = user_doc.get("likes_this_week", 0)
    if user_doc.get("last_like_week") != week_start:
        likes_this_week = 0
    remaining_likes = max(0, FREE_LIKES_PER_WEEK - likes_this_week) if plan == "free" else None
    next_reset = _next_week_reset().isoformat() if plan == "free" else None
    return {
        "plan": plan,
        "is_premium": plan == "premium",
        "stripe_customer_id": user_doc.get("stripe_customer_id"),
        # Cancel-at-period-end state (set when user cancels — premium still
        # active until `cancel_at`).
        "subscription_status": user_doc.get("subscription_status"),
        "cancel_at_period_end": user_doc.get("subscription_status") == "cancel_at_period_end",
        "cancel_at": user_doc.get("subscription_cancel_at"),
        # New weekly-likes fields
        "likes_this_week": likes_this_week if plan == "free" else 0,
        "remaining_likes_this_week": remaining_likes,
        "weekly_like_limit": FREE_LIKES_PER_WEEK if plan == "free" else None,
        "next_like_reset": next_reset,
        # Back-compat aliases (older clients)
        "remaining_swipes": remaining_likes,
        "daily_limit": FREE_LIKES_PER_WEEK if plan == "free" else None,
        "swipes_today": likes_this_week if plan == "free" else 0,
        "price": f"\u00a3{STRIPE_PRICE_AMOUNT / 100:.2f}/month",
    }


@router.post("/subscription/cancel")
async def cancel_subscription(current_user: User = Depends(get_current_user)):
    """Cancel the user's subscription **at the end of the current billing period**.

    Stripe stops auto-renewing the subscription but the user keeps premium access
    until ``current_period_end``. No refund is issued — the user has already paid
    for the current period. Direct-debit / card collection is *not* triggered for
    the next cycle.

    To resume before the period ends, call ``POST /subscription/resume``.
    """
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    stripe_customer_id = user_doc.get("stripe_customer_id")
    if not stripe_customer_id:
        await db.users.update_one(
            {"user_id": current_user.user_id},
            {"$set": {"plan": "free", "subscription_status": "free", "is_premium": False}},
        )
        return {"message": "No active subscription to cancel", "plan": "free"}
    try:
        subscriptions = stripe.Subscription.list(customer=stripe_customer_id, status="active", limit=1)
        if not subscriptions.data:
            await db.users.update_one(
                {"user_id": current_user.user_id},
                {"$set": {"plan": "free", "subscription_status": "free", "is_premium": False}},
            )
            return {"message": "No active subscription to cancel", "plan": "free"}

        sub = subscriptions.data[0]
        # Cancel at period end — premium stays active until current_period_end,
        # no refund, no further charges.
        updated = stripe.Subscription.modify(sub.id, cancel_at_period_end=True)
        period_end_iso = datetime.fromtimestamp(updated.current_period_end, tz=timezone.utc).isoformat()

        await db.users.update_one(
            {"user_id": current_user.user_id},
            {"$set": {
                # Keep plan = premium until the period actually ends; a Stripe
                # webhook (customer.subscription.deleted) will flip it to free.
                "plan": "premium",
                "is_premium": True,
                "subscription_status": "cancel_at_period_end",
                "subscription_cancel_at": period_end_iso,
                "subscription_id": sub.id,
            }},
        )
        return {
            "message": "Subscription will end at the end of the current billing period. You keep premium until then — no refund issued.",
            "plan": "premium",
            "cancel_at_period_end": True,
            "current_period_end": period_end_iso,
        }
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}"); raise HTTPException(status_code=400, detail=str(e))


@router.post("/subscription/resume")
async def resume_subscription(current_user: User = Depends(get_current_user)):
    """Undo a pending cancellation — the subscription auto-renews again."""
    user_doc = await db.users.find_one({"user_id": current_user.user_id}, {"_id": 0})
    stripe_customer_id = user_doc.get("stripe_customer_id")
    if not stripe_customer_id:
        raise HTTPException(status_code=400, detail="No subscription found")
    try:
        subscriptions = stripe.Subscription.list(customer=stripe_customer_id, status="active", limit=1)
        if not subscriptions.data:
            raise HTTPException(status_code=400, detail="No active subscription found")
        sub = subscriptions.data[0]
        if not sub.cancel_at_period_end:
            return {"message": "Subscription is already active", "plan": "premium"}
        stripe.Subscription.modify(sub.id, cancel_at_period_end=False)
        await db.users.update_one(
            {"user_id": current_user.user_id},
            {"$set": {
                "plan": "premium",
                "is_premium": True,
                "subscription_status": "active",
                "subscription_cancel_at": None,
            }},
        )
        return {"message": "Subscription resumed. It will auto-renew at the next billing date.", "plan": "premium"}
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {e}"); raise HTTPException(status_code=400, detail=str(e))


@router.post("/subscription/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    if not sig_header: raise HTTPException(status_code=400, detail="Missing Stripe signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
    except ValueError: raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError: raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event["type"]; event_data = event["data"]["object"]
    logger.info(f"Stripe webhook: {event_type}")

    if event_type == "checkout.session.completed":
        user_id = event_data.get("metadata", {}).get("user_id")
        customer_id = event_data.get("customer")
        if user_id:
            await db.users.update_one({"user_id": user_id}, {"$set": {"plan": "premium", "stripe_customer_id": customer_id}})
            logger.info(f"User {user_id} upgraded to premium")
    elif event_type == "customer.subscription.deleted":
        customer_id = event_data.get("customer")
        if customer_id:
            await db.users.update_one({"stripe_customer_id": customer_id}, {"$set": {"plan": "free"}})
    elif event_type == "customer.subscription.updated":
        customer_id = event_data.get("customer"); status = event_data.get("status")
        if customer_id:
            await db.users.update_one({"stripe_customer_id": customer_id}, {"$set": {"plan": "premium" if status == "active" else "free"}})
    elif event_type == "invoice.payment_failed":
        customer_id = event_data.get("customer")
        if customer_id:
            await db.users.update_one({"stripe_customer_id": customer_id}, {"$set": {"plan": "free"}})
    return {"received": True}


# ==================== UNIVERSITY SUBSCRIPTION ====================

@router.post("/stripe/create-university-checkout")
async def create_university_checkout(data: UniversitySubscriptionRequest):
    try:
        customer = stripe.Customer.create(email=data.admin_email, name=data.admin_name,
            metadata={"university": data.university_name, "expected_students": str(data.expected_students or 0), "contact_phone": data.contact_phone or ""})
        app_url = os.environ.get("APP_URL", "").rstrip("/")
        checkout_session = stripe.checkout.Session.create(
            customer=customer.id, mode="subscription", payment_method_types=["card"],
            line_items=[{"price_data": {"currency": UNIVERSITY_PRICE_CURRENCY, "unit_amount": UNIVERSITY_PRICE_AMOUNT,
                "recurring": {"interval": "month"}, "product_data": {"name": UNIVERSITY_PRODUCT_NAME,
                    "description": f"Dashboard access for {data.university_name}"}}, "quantity": 1}],
            success_url=data.success_url or f"{app_url}/university-subscription-success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=data.cancel_url or app_url,
            metadata={"university": data.university_name, "admin_email": data.admin_email, "admin_name": data.admin_name,
                      "type": "university_subscription"}, allow_promotion_codes=True
        )
        return {"checkout_url": checkout_session.url, "session_id": checkout_session.id}
    except stripe.error.StripeError as e:
        logger.error(f"Stripe university checkout error: {e}"); raise HTTPException(status_code=400, detail=str(e))


@router.post("/stripe/university-webhook")
async def university_stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    if not sig_header: raise HTTPException(status_code=400, detail="Missing Stripe signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_UNIVERSITY_WEBHOOK_SECRET)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid webhook")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})
        if metadata.get("type") == "university_subscription":
            university = metadata.get("university")
            admin_email = metadata.get("admin_email")
            admin_name = metadata.get("admin_name")
            import secrets, string
            password = ''.join(secrets.choice(string.ascii_letters + string.digits + "!@#$%") for _ in range(12))
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            existing = await db.users.find_one({"email": admin_email, "role": "university_admin"})
            if not existing:
                uni_admin = {
                    "user_id": f"uni-admin-{uuid.uuid4().hex[:8]}", "email": admin_email, "name": admin_name,
                    "role": "university_admin", "university_admin_for": university, "university": university,
                    "admin_password": password_hash, "created_at": datetime.now(timezone.utc),
                    "profile_completed": True, "subscription_type": "university", "subscription_status": "active",
                    "stripe_customer_id": session.get("customer")
                }
                await db.users.insert_one(uni_admin)
                logger.info(f"University admin auto-created: {admin_email} for {university}")
    return {"received": True}
