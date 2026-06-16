# DEQUAD / Educare App - PRD

## Original Problem Statement
"Get app review from GitHub" — User imported existing GitHub repo `https://github.com/youngquad/Educare-updated-app`. Subsequent requests added: report-a-profile, racism/curse-word language filter, live customer support chat, swipe limits with countdown, match-back fix, unread badges, EAS mobile build guide.

## Architecture
- **Backend**: FastAPI (Python) on port 8001, MongoDB via motor.
  - Routers: auth, profile, mood, feedback, matches, chat, notifications, university_admin, admin, subscription, core, reports, support.
  - LLM: Emergent LLM Key + `emergentintegrations` (OpenAI gpt-4o-mini) for support AI replies.
  - Safeguarding: `check_language_filter` (racism + profanity, word-boundary regex) + `check_safeguarding_content` (crisis keywords).
- **Frontend**: Expo Router (React Native + react-native-web) on port 3000. SDK 54.
- **DB**: Local MongoDB.

## Features Shipped
1. **Report a Profile** — `POST /api/reports`, modal with 9 reasons.
2. **Racist & Curse Language Filter** — applied across bio, swipe comments, chat, reports, support messages.
3. **Live Customer Support Chat** — user + admin threads, AI auto-reply, crisis-keyword safeguarding hook.
4. **Admin Support Inbox UI** — `AdminSupportInbox.tsx` with unread badge.
5. **Push + Email Notifications** — admin replies notify user via Expo push + email fallback.
6. **Swipe Limits** — unlimited skips, 3 likes/week, countdown timer UI.
7. **Match-back Fix** — mutual likes now correctly create a chat thread.
8. **pair_id Migration** — chat messages now fetched bidirectionally via deterministic `pair_id` (`/app/backend/scripts/migrate_chat_pair_id.py`).
9. **Chat Inbox UI** — removed emails, added last-message preview + timestamp.
10. **Unread Badges** — Admin (Support, Safeguarding) + Student (Chat, Connect) tabs.
11. **EAS Build Guide + Helper Script (2026-02)** — `/app/EAS_BUILD_GUIDE.md`, `/app/BETA_OPTION_A.md`, and `/app/scripts/build.sh` (validate / dev / preview / prod / submit / ota / register-device / list-devices / doctor commands).
14. **Auth Theme Refresh (2026-02)** — All auth screens (student login, forgot password, reset password, admin login) restyled to match the Hinge-style landing page palette (soft blue `#F6FAFE` background, white cards, navy text `#0F2942`, Playfair Display headings, navy/blue pill buttons, teal accents). DEQUAD heart logo + wordmark consistent on every screen.
    - Admin Access link **removed** from student login. Admin portal now has its own dedicated page at `/(admin)/login` and is reachable via a "Staff login" link in the landing-page footer.
    - Added student "Forgot password" + "Reset password" pages at `/(auth)/forgot-password` and `/(auth)/reset-password`.
    - Backend `/api/auth/forgot-password` + `/api/auth/reset-password` extended to support students (role baked into reset record; updates `password_hash` for students, `admin_password` for admins).
    - New reusable `DequadLogo` component at `/app/frontend/src/components/DequadLogo.tsx` (universal via `react-native-svg`).
    - Tested: 16/16 password-reset backend tests pass (`/app/test_reports/iteration_10.json`); 12/12 email-auth regression suite still green.

13. **Native Email/Password Auth (2026-02)** — Added alongside Google OAuth so non-Google beta testers can sign up.
    - `POST /api/auth/register` (email + password + optional name; rejects invalid format / <8 char password / duplicate email)
    - `POST /api/auth/email-login` (returns user + session_token + httpOnly cookie; uniform error for unknown email / wrong password)
    - Frontend UI at `/app/frontend/app/(auth)/login.tsx` with testids `auth-{name|email|password}-input`, `auth-submit`, `auth-mode-toggle`, `auth-error`.
    - Tested: 12/12 backend tests pass (`/app/backend/tests/test_email_auth.py`, report `/app/test_reports/iteration_9.json`).
    - **Note**: `.ac.uk` student-email restriction is temporarily relaxed per user request — re-enable before public launch.

12. **Code Quality Pass (2026-02)** — Critical fixes from external code review applied:
    - Removed hardcoded admin/test credentials from `tests/test_reports_support.py` + `tests/test_refactored_backend.py` (now read from `SEED_ADMIN_*`/`SEED_UNI_ADMIN_*` env vars; tests skip if not set)
    - Pre-initialized `risk_level` in `helpers/safeguarding.py:check_safeguarding_content` to remove undefined-path warning
    - Fixed dynamic `__import__('datetime')` usage in `safeguarding.py:detect_behavioral_anomalies` (proper `timedelta` import)
    - Wrapped `processSessionId`, `checkExistingSession` in `useCallback` in `AuthContext.tsx` to eliminate stale-closure warnings on the URL-callback + session-check `useEffect`s
    - Replaced stdlib `random` with `secrets.SystemRandom()` in `seed.py` (demo data; satisfies static analysis)

## Tested
- Backend: pytest suite + `/app/test_reports/iteration_8.json`.
- Frontend: testing_agent_v3_fork passes; manual screenshot smoke tests for badges/inbox.
- Build scripts: `./scripts/build.sh validate` confirms `app.json` + `eas.json` are valid JSON.

## Backlog / Next Steps
- **P0**: Re-enable `.ac.uk` student email restriction before public launch (single block at top of `/api/auth/register` and the email-domain check in `/api/auth/session`).
- **P0 (security)**: Migrate password hashing from plain SHA-256 → bcrypt/argon2 (applies to `password_hash` AND `admin_password`). Add a one-time migration on next login.
- **P1**: Tighten email validation in `/api/auth/register` (use Pydantic `EmailStr` instead of the lax "@ and dot" check).
- **P1**: Decide UX for Google-created users who later want a password-only login (today `/auth/register` 409s on their email — needs a "set password" flow).
- **P1**: Refactor N+1 query patterns in `backend/routes/matches.py`.
- **P1**: Reduce complexity of `swipe_action` in `matches.py` and `university_ai_analysis` in `admin.py`.
- **P2**: Break down massive frontend components (`dashboard.tsx`, `profile.tsx`, `matches.tsx`).
- **P2**: Move JWT tokens from `localStorage` to `httpOnly` cookies / in-memory + refresh tokens in `src/services/api.ts`.
- **P2**: Replace array-index keys with stable IDs in React lists (e.g. `matches.tsx`).
- **P2**: Keep an eye on Safeguarding red-badge edge cases.
- **P2**: Periodic cleanup of `e2e_test_*` / `TEST_*` users created by the regression suite.

## Credentials
- See `/app/memory/test_credentials.md`.

## Build / Deploy
- Mobile builds: see `/app/EAS_BUILD_GUIDE.md` (Node 20, yarn, EAS commands, iOS/Android signing checklists).
- Helper: `/app/scripts/build.sh`.
