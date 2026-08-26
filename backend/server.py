from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import asyncio
import logging
import os

from database import db, client
from helpers.safeguarding import load_approved_keywords
from helpers.first_match_nudge import first_match_nudge_worker
from helpers.mood_reminder import mood_reminder_worker
from helpers.middleware import RequestLoggingMiddleware, RateLimitMiddleware, SecurityHeadersMiddleware
from seed import seed_admin_and_test_users
from scripts.migrate_chat_pair_id import migrate_chat_pair_id
from scripts.migrate_dedupe_users import ensure_email_unique_index

from routes import auth, profile, mood, feedback, matches, chat, notifications, university_admin, admin, admin_invites, subscription, core, reports, support

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("server")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    # Non-destructive only: ensure the unique index on users.email exists so
    # the duplicate-row bug can't recur. The actual dedupe (which hard-deletes
    # stale rows) is NOT run automatically — it's a manual one-off via
    # `python3 -m scripts.migrate_dedupe_users`, run only when duplicates are
    # known to exist.
    try:
        await ensure_email_unique_index(db)
    except Exception as e:
        logger.error(f"users.email unique index check failed (non-fatal): {e}")
    await seed_admin_and_test_users()
    await load_approved_keywords()
    # 2dsphere index on users.location powers distance-based match filtering
    # ($near / $geoNear). Idempotent — Mongo no-ops if the index already exists.
    try:
        await db.users.create_index([("location", "2dsphere")], sparse=True)
        logger.info("users.location 2dsphere index ensured")
    except Exception as e:
        logger.error(f"users.location 2dsphere index failed (non-fatal): {e}")
    # Idempotent chat migration: backfills pair_id on legacy messages and
    # ensures the supporting index exists. Safe to run on every boot.
    try:
        result = await migrate_chat_pair_id(db)
        logger.info(f"chat pair_id migration: {result}")
    except Exception as e:
        logger.error(f"chat pair_id migration failed (non-fatal): {e}")
    # Background worker: push a "first match" nudge 24h after signup.
    nudge_task = asyncio.create_task(first_match_nudge_worker())
    # Background worker: daily 6 PM UK mood check-in reminder.
    mood_task = asyncio.create_task(mood_reminder_worker())
    yield
    # Shutdown
    for task in (nudge_task, mood_task):
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
    client.close()


app = FastAPI(title="DEQUAD API", lifespan=lifespan)


@app.get("/health")
async def infra_health_check():
    """Unprefixed health route for infra probes that hit the backend pod
    directly (bypassing the /api ingress prefix used by the app itself)."""
    return {"status": "healthy"}


# Middleware order: outermost runs first → CORS → Logging → Rate Limit → Route
app.add_middleware(RateLimitMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
# CORS: per spec, `allow_origins=["*"]` cannot be combined with `allow_credentials=True`.
# Modern browsers reject the response and the client thinks the request "failed" even when
# the server returned 200. Use an explicit allow-list (env-overridable) instead.
_default_origins = [
    "https://dequad.co.uk",
    "https://www.dequad.co.uk",
    "https://review-extractor-2.emergent.host",
    "https://review-extractor-2.preview.emergentagent.com",
    "http://localhost:3000",
    "http://localhost:19006",  # Expo web dev
]
_extra = [o.strip() for o in os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",") if o.strip()]
ALLOWED_ORIGINS = list({*_default_origins, *_extra})

# NOTE: The Kubernetes ingress in front of this backend already emits
#   Access-Control-Allow-Origin: *
# on every response. Per the CORS spec, `*` origin CANNOT be combined with
# `Access-Control-Allow-Credentials: true` — Safari strictly enforces this and
# fails the fetch with "Load failed" (Chrome sometimes lets it through, which is
# why the bug only showed up on iOS/macOS Safari).
#
# The frontend authenticates via the `Authorization: Bearer <token>` header and
# uses `credentials: 'omit'` on all fetches, so we don't actually need the
# browser to send cookies cross-origin. Disable credentials mode on CORS so the
# combined response is spec-compliant and Safari stops rejecting it.
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https://([a-zA-Z0-9-]+\.)*(emergentagent\.com|emergent\.host|dequad\.co\.uk)$",
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers under /api prefix
app.include_router(core.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(mood.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")
app.include_router(matches.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(university_admin.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(admin_invites.router, prefix="/api")
app.include_router(subscription.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(support.router, prefix="/api")

# Static mount for downloadable marketing assets (Instagram posts, PDFs, etc.)
# generated by /app/backend/scripts. Lives under /api so the Kubernetes ingress
# routes it to the backend pod. Served read-only.
_marketing_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "marketing")
if os.path.isdir(_marketing_dir):
    app.mount("/api/marketing", StaticFiles(directory=_marketing_dir), name="marketing")

# Static mount for downloadable visa-submission documents (business plan,
# financial model, CV templates, appendices).
_visa_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "visa_appendices")
if os.path.isdir(_visa_dir):
    app.mount("/api/visa-docs", StaticFiles(directory=_visa_dir), name="visa-docs")
