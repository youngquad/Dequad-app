# DEQUAD / Educare App - PRD

## Original Problem Statement
"Get app review from GitHub" — User requested to import an existing GitHub repo (`https://github.com/youngquad/Educare-updated-app`) into the workspace and set it up to run in this environment.

## Architecture
- **Backend**: FastAPI (Python) on port 8001, MongoDB via motor, routed via supervisor.
  - Routes: auth, profile, mood, feedback, matches, chat, notifications, university_admin, admin, subscription, core
  - Integrations present: Stripe (live keys configured), Emergent LLM Key, SMTP (Gmail)
- **Frontend**: Expo Router (React Native + react-native-web) on port 3000.
- **DB**: MongoDB on default localhost:27017, DB name `test_database`.

## Setup Completed (2026-01)
- Repo cloned to `/app` (replacing initial scaffold).
- Backend imports & seed run successfully on startup. Admin + 12 demo profiles seeded.
- Frontend Expo web build compiled successfully and is reachable via public preview URL.
- Both `backend` and `frontend` services managed by supervisor are RUNNING.

## Verified
- `GET /api/` → `{"message":"DEQUAD API","status":"running"}` ✅
- Frontend loads landing page (DEQUAD wellbeing companion) ✅

## Backlog / Next Steps
- Functional walkthrough of auth (email/Google), mood tracking, matches, chat, admin dashboard.
- If user wants Stripe testing, swap live keys for test keys.
- Mobile (iOS/Android) builds via EAS (see `frontend/DEPLOYMENT_GUIDE.md`).
