# DEQUAD / Educare App - PRD

## Original Problem Statement
"Get app review from GitHub" — User imported existing GitHub repo `https://github.com/youngquad/Educare-updated-app`. Subsequent requests added: report-a-profile, racism/curse-word language filter, and live customer support chat.

## Architecture
- **Backend**: FastAPI (Python) on port 8001, MongoDB via motor.
  - Routers: auth, profile, mood, feedback, matches, chat, notifications, university_admin, admin, subscription, core, **reports (new)**, **support (new)**.
  - LLM: Emergent LLM Key + `emergentintegrations` (OpenAI gpt-4o-mini) for support AI replies.
  - Safeguarding: `check_language_filter` (racism + profanity, word-boundary regex) + `check_safeguarding_content` (crisis keywords).
- **Frontend**: Expo Router (React Native + react-native-web) on port 3000.
- **DB**: Local MongoDB.

## Setup (2026-01)
- Repo cloned to `/app`; backend + frontend services managed by supervisor; both RUNNING.
- Seed: admin + 12 demo students + 1 university admin on startup.

## Features Shipped This Session
1. **Report a Profile** — `POST /api/reports`, `GET /api/reports/my` (existing `GET /api/admin/reports` unchanged). UI: red flag button on each matches profile card + likes-you card; reusable `ReportProfileModal` with 9 reasons + optional details (max 500 chars). Self-report blocked; duplicate pending report blocked.
2. **Racist & Curse Language Filter** — applied to: profile bio/course/university free-text fields, swipe comments (existing), chat messages (existing), report reasons, support messages (both directions). Word-boundary regex matching prevents false positives like "Pakistani"/"Japanese"/"Hispanic"/"suspicious".
3. **Live Customer Support Chat** — `/(main)/support` screen, accessible from Profile screen. `POST /api/support/message` (auto AI reply via gpt-4o-mini), `GET /api/support/messages` (user thread). Admin: `GET /api/support/admin/conversations`, `GET /api/support/admin/messages/{user_id}`, `POST /api/support/admin/reply`. Crisis keywords in support chat trigger SafeguardingAlert (source=`support_chat`).

## Tested
- Backend: 24/24 pytest tests (`/app/backend/tests/test_reports_support.py`). All language-filter false-positives also verified fixed by hand.
- Frontend: Manual screenshot tests — Profile screen "Contact Support" CTA visible; Matches screen red flag (report) button visible; Report modal opens with reasons.

## Backlog / Next Steps
- P1: Admin Support inbox UI in admin dashboard (backend endpoints exist; need frontend screen).
- P1: Push notification to user when an admin replies in support.
- P2: Swap LIVE Stripe keys in `.env` for test keys before payments QA.
- P2: Mobile build via EAS — `frontend/DEPLOYMENT_GUIDE.md`.

## Credentials
- See `/app/memory/test_credentials.md`.
