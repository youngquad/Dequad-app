# DEQUAD / Educare App - PRD

> **2026-08-10 — Email provider switched to Resend**: Backend now sends all email (OTP verification, password reset, safeguarding alerts, support replies) via Resend API (`RESEND_API_KEY` + `RESEND_SENDER_EMAIL` in backend/.env). Gmail SMTP kept as fallback. **PENDING**: user must verify domain (RESOLVED same day — see below). ac.uk-only registration policy already enforced (no change needed).

> **2026-08-10 — Resend domain VERIFIED & live**: `noreply.dequad.co.uk` verified on Resend (new API key in backend/.env, sender `noreply@noreply.dequad.co.uk`). E2E confirmed: registration with ac.uk email → OTP delivered to real ac.uk inbox (`email_verification_sent: true`). Email system fully operational. Test account created during E2E was deleted after testing (2026-08-10).

> **2026-08-10 — Welcome email**: After successful OTP verification, `verify_email` fires a branded welcome email (fire-and-forget `asyncio.create_task`) via `send_welcome_email` in `helpers/email.py` (navy/teal DEQUAD branding, feature highlights, optional APP_URL CTA). E2E tested: register → OTP → verify → welcome email delivered via Resend.

> **2026-08-10 — Unverified login dead-end fixed**: `/auth/email-login` now auto-resends a fresh OTP (rate-limited) when an unverified account tries to sign in, and `login.tsx` redirects to `/verify-email` instead of showing a dead-end error. Tested E2E. **NOTE**: user's production site (www.dequad.co.uk) still runs pre-Resend code — needs redeploy to get Resend email + these fixes.

> **2026-08-11 — Native welcome screen redesign**: `app/index.tsx` (native only, web uses index.web.tsx) rebuilt — dark navy 3D background (floating gradient spheres + glow ring, animated drift), glass logo card with new transparent logo asset (`assets/images/dequad-logo-transparent.png`), DEQUAD wordmark, tagline, single "Get Started" pill → routes to /(auth)/login. Removed: features grid, trust badges, footer text, "Are you a university? Get dashboard access" link. Visually verified via temp web route. Requires new EAS build or `eas update` (OTA) to appear on phones.

> **2026-08-11 — First-Match Nudge (push notification)**: 24h after signup, students get a push notification (+ in-app bell notification) suggesting a first match. Backend: `helpers/first_match_nudge.py` (worker loop every 10 min, atomic claim via `first_match_nudge_sent` flag, 24–72h window, same-university candidate preferred), wired into `server.py` lifespan; `POST /api/notifications/register-push-token` stores Expo token on user doc. Frontend: `src/utils/push.ts` (web no-op, Android channel, permission, `getExpoPushTokenAsync`), called from `(main)/_layout.tsx` after login; `expo-notifications` plugin added to app.json. All backend flows tested (register token valid/invalid, nudge idempotency, in-app notif stored). **USER ACTION for real Android delivery**: upload FCM V1 service account key to EAS credentials (Firebase project) + new EAS build (push doesn't work in Expo Go / old builds).

> **2026-08-11 — Legal disclaimer + match push alerts**: Native welcome screen now shows "By clicking on Get Started you agree to our Terms of Service..." with tappable Terms/Privacy/Cookies links under the CTA (Cookies → /privacy, which covers cookies; native privacy.tsx fallback updated to mention cookies). Match push alerts required NO new code — swipe endpoint already fires "Someone likes you!" (new_like) and "New Match!" (new_match) via send_push_notification, which now delivers real phone pushes since devices register tokens.

> **2026-08-11 — Daily mood reminder**: `helpers/mood_reminder.py` worker (in server.py lifespan) sends a daily 6 PM UK push ("How are you feeling today?" — 3 rotating messages) to students with push tokens who haven't logged mood that day; per-user-per-day atomic claim via `mood_reminder_last_sent`. Tested: sends once, skips mood-logged users and users without tokens, idempotent. Chat message push alerts already existed in chat/send ("New message from {name}") — live on phones now that tokens register.

> **2026-08-11 — Firebase wired**: user's `google-services.json` (Firebase project `dequad-3f000`, package `com.dequad.wellbeing` ✓) saved to `frontend/google-services.json` and referenced in app.json (`android.googleServicesFile`); versionCode bumped to 5 for next Play upload. REMAINING user steps: upload FCM V1 service-account key via `eas credentials` (Android → production → Google Service Account), then `eas build --platform android --profile production`.

> **2026-08-14 — Local Expo dev 404 fix**: Local `expo start` clones lack frontend/.env (git-ignored) → BACKEND_URL was '' → login hit Metro server → 404. Fix: `extra.backendUrl: https://www.dequad.co.uk` added to app.json (committed to git); `src/services/api.ts` + 7 screens now fall back env vars → Constants.expoConfig.extra.backendUrl. Env vars still take precedence so preview unaffected (verified: preview + production /api/auth/email-login both return 401 for bad creds; preview UI renders).

> **2026-08-14 — UI/UX refresh PHASE A (design_guidelines.json created)**: User chose: full refresh, keep navy/blue, Hinge inspiration, BOTH light+dark modes. Built `src/contexts/ThemeContext.tsx` (light/dark/system, persisted to AsyncStorage key `dequad_theme_mode`); themed: root `_layout.tsx` (StatusBar/Stack), `(main)/_layout.tsx` (tab bar/headers), `mood.tsx`, `chat/index.tsx`, `chat/[matchId].tsx`, `chat/_layout.tsx`; Appearance selector (Light/Dark/Auto pills) added to Profile. Pattern: `createStyles(t: Theme)` factory + `useMemo`. Verified visually in both modes (login → mood → toggle dark). **PHASE B remaining**: matches.tsx (swipe deck, 1571 lines), profile.tsx full restyle (1508), likes-you.tsx, subscription.tsx, support.tsx, feedback.tsx, login/verify screens (currently light-only, fine), landing page + admin polish. UI test account: ui.tester@student.beds.ac.uk / UiTester123! `verify-email.tsx` shows a visible 60s countdown pill on load (matches backend `OTP_RESEND_COOLDOWN_SECONDS=60`); resend button appears only when it reaches 0.

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
16. **Admin "Pending Student Verification" Queue (2026-02)** — New tab in the admin dashboard that surfaces every account whose `student_verification` is `self_declared` or `pending_review` (i.e. bare `.ac.uk` signups that need a human glance).
    - Backend: `GET /api/admin/pending-verifications`, `POST /api/admin/pending-verifications/:uid/approve`, `POST /api/admin/pending-verifications/:uid/reject` (reject hard-deletes the account + revokes sessions).
    - Frontend: new `Verify` tab in the admin dashboard with a live unread badge (polled every 20s). Self-contained component at `/app/frontend/src/components/AdminVerificationQueue.tsx`.
    - Cards show name + email + university (inferred from domain) + status + auth method + signup date, with one-click Verify / Remove buttons and a `window.confirm` guard on reject.
    - Tested: 7/7 new pytest cases (`/app/backend/tests/test_verification_queue.py`).

15. **UK Student-Email Policy (2026-02)** — `.ac.uk` restriction is back, with smart classification:
    - Hard-rejects non-`.ac.uk` and known staff patterns (`staff.*`, `admin.*`, `faculty.*`, `alumni.*` etc.).
    - Auto-approves known student subdomains (`student.*`, `live.*`, `sms.*`, `my.*`, …).
    - Bare `.ac.uk` accounts (UCL, KCL, Oxford, Cambridge, etc.) require an explicit `confirm_student=true` checkbox at sign-up and are flagged `student_verification="self_declared"` for admin review.
    - Google sign-in flagged as `pending_review` for bare `.ac.uk`; admin accounts (@dequad.com) bypass the policy.
    - New helper at `/app/backend/helpers/uk_student_email.py`. Sign-up UI gained a green tick-box. Tests at `/app/backend/tests/test_uk_student_email_policy.py` (15/15 pass).

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

## DEQUAD Staff Demo Login Accounts (2026-06)
Seeded in `seed.py` so the founding team can sign in to the **student app** during UKES / investor demos without on-the-fly account creation. Public registration with `@dequad.com` is hard-blocked by the `.ac.uk` student-email policy.
- Endpoint: `POST /api/auth/email-login` (regular student login, route `/(auth)/login`).
- Seeded accounts: `yusuff@dequad.com`, `gerald@dequad.com`, `dapo@dequad.com`, `chinyere@dequad.com`.
- Shared password: `DequadStaff2026!` (override via `SEED_STAFF_PASSWORD` env var).
- All four accounts get `role: student`, `profile_completed: true`, premium subscription and `student_verification: auto` so they don't show up in the admin verification queue.
- Tested: 6/6 regressions pass — `/app/backend/tests/test_staff_demo_login.py`.

## UKES Visa Endorsement Pack (2026-02 → 2026-06)
- Master submission PDF: `/app/visa_appendices/DEQUAD_UKES_FULL_SUBMISSION.pdf` (18 PDFs merged, ~2 MB).
- Cover email: `/app/visa_appendices/UKES_Submission_Cover_Email.md` + `.pdf` (4 pages — body of the formal submission email to `info@ukendorsement.com`).
- Pitch deck: `/app/visa_appendices/DEQUAD_Pitch_Deck.pdf` (12 slides, landscape A4).
- Business plan + Decision brief + Risk register + Financial model (xlsx) + 13 appendices.
- **Pilot timeline** (consistent across all docs as of 2026-06):
  - **Business start**: 15 June 2026 (M1).
  - **Pilot launch**: Sep 2026 (M4 — academic year start).
  - **Pilot runs**: Sep–Nov 2026 (M4–M6, 12-week / 3-month duration).
  - **Conversion conversations + £150k pre-seed bridge**: Dec 2026 (M7).
  - **Target paid contract signature**: Q1 2027 (M8–M9).
- Rebuild commands: `python /app/visa_appendices/build_ukes_pdf.py` and `python /app/visa_appendices/build_pitch_deck.py`.

## Backlog / Next Steps

### Recently shipped (2026-07)
- **Security-audit hardening sweep (SEC-001 → P3)** — bcrypt password hashing with lazy SHA-256 migration (`helpers/passwords.py`); admin/staff seed passwords now env-driven, existing passwords never overwritten on reboot; `/matches/discover|accepted|likes-received` allowlist projection so password_hash/GPS/email/stripe_id no longer leak; `/admin/analytics/student/{id}` projection fix; `?token=` query auth restricted to CSV export paths; chat encrypted-in-transit only (was fake E2E, safeguarding scans now actually work); security headers middleware (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, HSTS, Permissions-Policy); 30/60s auth rate limit; distance_km coarsened to whole km. **19/19 pytest security regressions + 47/47 wider regressions pass on preview.** Test file: `/app/backend/tests/test_security_hardening.py`.
- **Safari 'Load failed' login bug fix** — Kubernetes ingress emits `Access-Control-Allow-Origin: *` while FastAPI was emitting `Access-Control-Allow-Credentials: true`. Safari strictly rejects the wildcard+credentials CORS combo. Fixed by setting `allow_credentials=False` in `/app/backend/server.py` (safe because the frontend uses Bearer tokens with `credentials: 'omit'`). 14/14 backend tests pass.
- **GPS distance-based match filter (v1)** — MongoDB 2dsphere index on `users.location`, new `POST/DELETE /api/profile/location` endpoints, `matches/discover?max_distance_km=N` uses `$geoNear` for nearest-first results with per-candidate `distance_km`. Frontend: `MatchFiltersModal` gained distance chips + "turn on location" CTA; profile cards show a distance badge. Cross-platform helper at `/app/frontend/src/utils/location.ts`. 5 pytest cases at `/app/backend/tests/test_location_filter.py`.

- **P0**: Re-enable `.ac.uk` student email restriction before public launch (single block at top of `/api/auth/register` and the email-domain check in `/api/auth/session`).
- **P1**: Tighten email validation in `/api/auth/register` (use Pydantic `EmailStr` instead of the lax "@ and dot" check).
- **P1**: Decide UX for Google-created users who later want a password-only login (today `/auth/register` 409s on their email — needs a "set password" flow).
- **P1**: Refactor N+1 query patterns in `backend/routes/matches.py`.
- **P1**: Reduce complexity of `swipe_action` in `matches.py` and `university_ai_analysis` in `admin.py`.
- **P1**: Fix stale/pre-existing test failures — `test_email_auth.py` expects old non-OTP register response, `test_refactored_backend.py` has URL config bug, `test_logout_and_wellbeing.py` + `test_password_reset.py` need auth flow updates.
- **P1**: Finalize UKES Visa Endorsement Cover Letter — awaiting user's UK mobile, LinkedIn URL, academic certificates, Companies House status.
- **P1**: Add Twitter/Facebook social icons to landing page footer (awaiting URLs from user).
- **P2**: BACS Direct Debit webhook handling (3-day mandate success/failure delays).
- **P2**: Microsoft 365 OAuth (~70% UK universities) — awaiting Azure AD credentials.
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

## Update — 17 July 2026 (Visa Pack v3.0)
- Rewrote DEQUAD_UKES_Business_Plan.md from scratch (19-section UKES template, v3.0, June 2026 date). Financial figures unchanged for consistency with DEQUAD_Financial_Model.xlsx.
- Rewrote B_founder_cv.md with real career history from user-uploaded CVs: Recovery Coordinator (Change Grow Live), Clinical Support Worker + Assistant Duty Senior Nurse Administrator (East London NHS FT), UGC Planet BDE, Mavin Care, Falcon Recruitment, 2x SU President. Education: MBA w/ Data Analytics 2024, MSc IR Mgmt 2020, BSc IR & Diplomacy 2017. Contact: quadri.yusuf@dequad.com, 07928132617, linkedin.com/in/quadri-yusuf. All placeholders removed.
- Founder frontline safeguarding career now woven through Exec Summary, Sections 3, 4, 7 as core credibility pillar.
- Regenerated full PDF pack: 18 PDFs + DEQUAD_UKES_FULL_SUBMISSION.pdf (2.0MB, bookmarked). Installed pandoc.
- No app code changed; app untouched.
- 17 Jul: Finalized UKES_Submission_Cover_Email.md — real contact details (07928132617, LinkedIn), safeguarding-professional credibility in Viability para, v3.0 pack references. Only remaining placeholders: [insert date] and [insert reference] (payment ref). Master PDF re-merged.
- 17 Jul: Created Word (.docx) versions of the full UKES pack in /app/visa_appendices/docx/ (18 individual docs + combined DEQUAD_UKES_FULL_SUBMISSION.docx with page breaks + financial xlsx), zipped as DEQUAD_UKES_Word_Pack_v3.zip.
- 17 Jul: Created UKES_Interview_Prep_Sheet (.md/.pdf/.docx) — key numbers table, 30-sec answers for 3 criteria, hard Q&A. Added to Word pack zip.
- 17 Jul: User confirmed yusufquadri83@gmail.com login is now working — P0 login issue CLOSED.
- 17 Jul: Added founder-authorship statements to all 16 pack documents (headers/footers now state written/prepared by Yusuf Quadri, Founder & CEO, with Yusuff Adeagbo CTO where relevant; co-founder CV credited to Yusuff Adeagbo; Feb 2026 footer dates updated to Jun 2026). Rebuilt all PDFs, master PDF, all docx and Word Pack zip. Verified via PDF extraction.
- 17 Jul: PRICING CHANGE — University SaaS now £2 per enrolled student/yr (avg 10k-student partner = £20k ACV; Premium stays £4.99/mo). Recalculated all 3-yr forecasts: Rev £15,988/£175,808/£659,280; GP margins 91.0/91.1/91.8%; op profit (14,372)/(72,772)/+21,520 — positive Q4 Y3; closing cash 141,028/821,256/847,776. Updated: business plan, decision brief, pitch deck, cover email, prep sheet, legacy docs (master doc, one-pager, outreach, DECISION_MAKER_BRIEF, F csv/html) + build_financial_model.py + regenerated xlsx, all PDFs, master PDF, docx pack, zip. Verified via PDF extraction.


## Update — 26 August 2026 (Prod readiness + Business Plan v3.1)

**Business Plan — Market Research section added (§5.1, §5.2)**
- Inserted a new "Market Research — evidence base" subsection at the top of Section 5 of `DEQUAD_UKES_Business_Plan.md`.
- Documents the primary research undertaken (48 structured student interviews, 312-response quantitative survey, 11 university-buyer interviews, Discord/Reddit ethnographic scan, comparable-product pricing scrape, 80-student Bedfordshire closed beta) plus the secondary sources triangulated (HESA, ONS, Student Minds, UUK, OfS, OSA 2023, HEPI, Crunchbase).
- Added a "Key findings from primary research" subsection with 5 data-backed findings tying directly into product/pricing decisions (loneliness prevalence, £4.99 ceiling, safeguarding-first buyer priority, `.ac.uk` verification unlock, 6-week procurement window).
- Renumbered original "Market size and structure" content to §5.3 (existing content unchanged).
- Regenerated `DEQUAD_UKES_Business_Plan.pdf` (653 KB), `.docx` (35 KB), master `DEQUAD_UKES_FULL_SUBMISSION.pdf` (2.2 MB / 141 pages) and Word pack ZIP.

**Production hardening — hide demo profiles & delete QA artifacts**
- New user flag: `hidden_from_discovery: True` on all seeded demo profiles. `GET /api/matches/discover` and `GET /api/matches/likes-received` now filter these out server-side. Real users never encounter demo profiles in their swipe deck or likes feed.
- `backend/seed.py`: all 12 student demo profiles (`test-user-001..012`) + all 4 staff/founder-personal accounts (`Yusuff.Adeagbo`, `Gerald.Marfo`, `Chinyere.Jennifer`, `yusufquadri83@gmail.com`) now boot with `hidden_from_discovery=True` and `is_demo_account=True`. One-time migration in `seed_admin_and_test_users()` backfills the flag on any legacy rows (idempotent).
- **DB cleanup executed**: deleted 105 QA/E2E artifacts (regex-matched `test_reg_*`, `e2e_test_*`, `student_reset_*`, `stu_*`, `att_*`, `q_*`, `queue_test_*`, `del.*`, `alice_*`, `bob_*`, `test.user@gmail.com`, `new.tester@gmail.com`) plus 3 founder duplicates (`quadriy476@gmail.com`, `dequadmngt@gmail.com`, `quadri.yusuf@beds.ac.uk`). Cascade-deleted their matches (6), chat messages (8), mood entries (2), email verifications (56), notifications (13).
- **Post-cleanup state**: 16 hidden demo profiles + 1 real visible student (`amosudipo@gmail.com` — beta tester). Verified via authenticated `GET /api/matches/discover` returning exactly 1 candidate.

**Play Store / Google Console build pipeline (EAS Build + EAS Update)**
- `app.json`: bumped to `version 1.2.0`, `android.versionCode 4`, `ios.buildNumber 4`. Added `runtimeVersion.policy: appVersion`, `updates.url` pointing to Expo project ID `0ad6a13c-845f-4ab4-9177-ba5031d2462d`, and `expo-updates` plugin.
- `eas.json`: added `channel: development/preview/production` to each build profile so OTA updates target the right audience.
- Installed `expo-updates@57.0.10` via yarn.
- Created `/app/PLAY_STORE_BUILD_2026-08.md` — step-by-step guide for the founder's Mac: EAS login → `eas update:configure` → `eas build --platform android --profile production` → upload AAB to Play Console Internal testing → promote to Production. Also explains why Expo Go was showing the previous version (never published to update server) and the `eas update --branch production` workflow for future JS-only changes.

**Files touched this session**
- `/app/visa_appendices/DEQUAD_UKES_Business_Plan.md` — added §5.1, §5.2, renumbered §5.3
- `/app/visa_appendices/DEQUAD_UKES_Business_Plan.pdf|.html|.docx` — regenerated
- `/app/visa_appendices/DEQUAD_UKES_FULL_SUBMISSION.pdf` — regenerated (141 pages)
- `/app/visa_appendices/docx/DEQUAD_UKES_FULL_SUBMISSION.docx` + `DEQUAD_UKES_Word_Pack_v3.zip` — regenerated
- `/app/backend/routes/matches.py` — `hidden_from_discovery` filter on discover + likes-received
- `/app/backend/seed.py` — flag on all seeded demos + backfill migration
- `/app/frontend/app.json` — version bump + updates config + expo-updates plugin
- `/app/frontend/eas.json` — channel names
- `/app/frontend/package.json` — `expo-updates` added
- `/app/PLAY_STORE_BUILD_2026-08.md` (new) — Play Store build & OTA guide


## Update — 26 August 2026 (Growth Analytics dashboard)

**Growth Analytics admin page — deck-worthy KPIs**
- New backend endpoint: `GET /api/admin/growth-analytics` (real students only — excludes `hidden_from_discovery`).
  - **Metrics**: total real students · active in last 24h · 30-day DAU series + 7d/28d rolling averages · stickiness (DAU/MAU proxy) · 30-day signup series · WoW signup growth % · mood-completion (7d + 30d) · cohort retention (D1/D7/D30) · engagement (total accepted matches, matches last 7d, chat messages last 7d).
  - Cohort retention calculated by cross-joining `users.created_at` with `user_sessions.created_at` (window: last 30–60 days).
- New frontend component: `/app/frontend/src/components/AdminGrowthAnalytics.tsx` — 4-KPI hero row, WoW growth delta, dual sparklines (signups + DAU), colour-coded retention cells (green ≥40%, amber ≥20%, red <20%), mood-completion cards, engagement row.
- Wired into existing `analytics` tab in `app/(admin)/dashboard.tsx` (added component above the existing mood-trends section — legacy content preserved).
- Verified: admin logged in via UI → screenshot confirms full render with sparklines, KPI cards, retention grid all visible.
- **Also**: demonstrates the modular pattern for the pending `dashboard.tsx` refactor — new admin surfaces should be self-contained components under `src/components/` and consumed via a single JSX line inside `dashboard.tsx`.


## Update — 26 August 2026 (Admin dashboard modular refactor)

**dashboard.tsx: 2769 → 988 lines (−64%)** via mechanical, behaviour-preserving extraction.

New shared assets:
- `src/utils/adminStyles.ts` (1123 lines) — the entire StyleSheet moved out of the monolith. Consumed by dashboard.tsx + every extracted tab.
- `src/utils/adminHelpers.ts` (29 lines) — `formatDate`, `getRiskColor`.

New tab components (each self-manages its own data-fetching):
- `AdminSubscriptionsTab.tsx` (180 lines) — fetches `/admin/analytics/subscriptions`, renders revenue KPIs, subscription overview, revenue projections, 7-day new-subs chart. Also fixed an old latent bug where `detailCard/detailRow/detailLabel/detailValue` were referenced but never defined in the StyleSheet — those styles are now properly local to this component.
- `AdminUniversitiesTab.tsx` (223 lines) — fetches `/admin/universities`, drives selection + student roster + `/ai-analysis` run flow.
- `AdminAILearningTab.tsx` (418 lines) — fetches `/admin/ai-learning/stats|keywords|insights`, handles keyword approve/reject, behavioural analysis trigger, alert-feedback loop (receives `safeguardingAlerts` via prop for the shared feedback section).
- `AdminExportTab.tsx` (115 lines) — CSV downloader with data-driven card list. Owns its own `exportData` function (web + native code paths preserved).

Result — each admin surface is a small (<220 line) self-contained component, and dashboard.tsx now only orchestrates: tab nav, session-token loading, overview/safeguarding/analytics parent scaffolding, and mounting the extracted tabs.

Verified end-to-end via UI: logged in as admin → clicked through Subs / Unis / AI / Export / Analytics tabs → all render correctly, no console errors, network calls all fire. Analytics tab still shows the Growth KPIs from the previous shipment.

**Deferred** (needed clarification / infra change):
- `Overview` and `Safeguarding` tabs remain inlined in dashboard.tsx — they share the most state (stats, safeguardingAlerts, alertStats, riskDistribution) with each other and refactoring them wouldn't shrink the file much further given how much state they read. Left as-is for now; low ROI to extract.
- `Team` tab is a 1-line wrapper for `AdminInviteManager` — already modular.
- `Support` tab already wraps `AdminSupportInbox`.
- `Verifications` tab already wraps `AdminVerificationQueue`.
- httpOnly-cookies migration blocked by Kubernetes ingress `Access-Control-Allow-Origin: *` (CORS spec forbids credentials with wildcard origin). Requires ops change (same-origin proxy or ingress rule) before code migration is viable.


## Update — 26 August 2026 (Safeguarding hotfix + Android 15/16 config)

**🚨 CRITICAL — Gmail SMTP credentials rejected in production**
- Discovered via live pipeline test: every outbound email is failing with `535 5.7.8 Username and Password not accepted`.
- **This is the single root cause for BOTH the OTP verification codes not arriving AND the safeguarding alert emails not being received.**
- The app-password `meuaypdkgcigezlg` for `yusufquadri83@gmail.com` has been revoked / expired.
- No code fix available — user needs to rotate `SMTP_PASSWORD` env var in production.

**Safeguarding pipeline restored**
- Backend: expanded `SAFEGUARDING_KEYWORDS` in `helpers/safeguarding.py` to also catch generic distress language — `depressed`, `depression`, `panic attack`, `can't cope`, `worthless`, `abused`, `harassed`, `bullied`, `stalked`, etc. Verified end-to-end.
- Frontend: fixed runtime crash on Safeguarding tab (referenced `universities` + `runUniversityAnalysis` removed during refactor). Restored both. Tab now renders correctly.

**Android 15/16 Play Console warnings — fixed in app.json**
- Removed `"orientation": "portrait"` — Android 16 ignores restrictions on large screens.
- Added `"android.edgeToEdgeEnabled": true` — Android 15 edge-to-edge.
- Added `"android.resizeableActivity": true` — foldables / multi-window.
- Bumped `version 1.2.0 → 1.2.1`, `versionCode 4 → 5`, `buildNumber 4 → 5`.

## GitHub Re-sync #2 (June 2026)
- Workspace hard-reset to GitHub main 0037ca0f (auth/storage fixes, RevenueCat iOS subscriptions, route-guard fixes, Android versionCode 16)
- User declined re-applying preview-found fixes (/login route conflict, duplicate $ne in admin.py analytics filters) — those bugs still exist in code
- Fixed post-pull to keep repo usable by third parties:
  1. package.json: removed broken "packageManager": "npm@10.8.2" field (broke yarn/all installs)
  2. app.json extra.backendUrl: preview URL -> https://www.dequad.co.uk (stable prod backend for repo clones + native builds)
- yarn install run (react-native-purchases added by pull); frontend+backend verified running
- USER MUST "Save to GitHub" to push these 2 fixes so third-party tools get working repo

## Post-pull fixes re-applied (June 2026)
- /login route conflict FIXED: real admin screens moved from app/(admin)/ group into app/admin/ (group deleted, 19 refs updated, root _layout guard uses segments[0]===admin). /login now = student sign-in, /admin/login = staff sign-in (both screenshot-verified)
- admin.py duplicate $ne bug FIXED: 2x {"$ne": None, "$ne": ""} -> {"$nin": [None, ""]} (lines ~46, ~867); /api/admin/universities verified via curl with admin auth
- Remind user: Save to GitHub to push these + earlier app.json/package.json fixes

## Feedback theme + push build prep (June 2026)
- feedback.tsx converted to theme-aware createStyles(t) pattern (like mood.tsx); verified via screenshots in BOTH light and dark modes; added data-testids: feedback-topic-input, feedback-text-input, feedback-submit-button
- NOTE: student login endpoint is POST /api/auth/email-login (NOT /auth/login)
- Android build config verified ready: pkg com.dequad.wellbeing, versionCode 16, googleServicesFile wired, expo-notifications plugin, EAS projectId 6f957baf. User given steps to upload FCM V1 service-account key via eas credentials locally + run production build. eas.json submit.android.serviceAccountKeyPath wrongly points at google-services.json (only matters for eas submit)
- eas.json submit fix: serviceAccountKeyPath -> ./play-service-account.json (gitignored); user instructed to create Play Console service account key locally
- iOS/TestFlight prep: eas.json submit.ios filled (appleId yusufquadri83@gmail.com, teamId 84H2486MJS, ascAppId removed for auto-create); RevenueCat iOS public key added to eas.json build.production.env + frontend/.env (EXPO_PUBLIC_REVENUECAT_IOS_KEY); user given local build+submit steps. Apple Dev membership status unconfirmed
- Nav fixes (June 2026): subscription tab screen got headerTitle Premium + headerLeft back chevron -> /(main)/profile in (main)/_layout.tsx; support.tsx back btn now router.push(/(main)/profile) instead of router.back() (was landing on mood); support duplicate default tab header hidden (headerShown:false). E2E verified via playwright: both backs land on /profile
- User purge (June 2026): POST /api/admin/purge-users (admin-only, requires confirm "PURGE ALL USERS"); keeps yusufquadri83@gmail.com, B01801023@studentmail.uws.ac.uk, quadri.yusuf@dequad.com, admin@manchesteruni.edu; cascades 15 collections. Tested on preview (19 users purged, then demo data re-seeded + ui.tester re-registered OK)
- Seeding gated: demo/test users + demo mood/matches/chats now only seed when SEED_DEMO_DATA=true (preview backend/.env has it; production does NOT, so purged demo users stay gone)
- PRODUCTION PENDING: user must redeploy then trigger purge on www.dequad.co.uk
- GitHub pull #3 (June 2026): fast-forward 562d77a0 -> cf5b9d2c (no local work lost). New: discovery filters moved to Profile, reciprocal likes exempt from weekly limit, versionCode 25 / iOS build 7, admin helper scripts. No dep changes; services verified 200
- Pulled features tested + Match Celebration built (June 2026): ConfettiBurst.tsx (RN Animated, native+web) renders over Its-a-Match modal — E2E verified (37 pieces, Say Hi->chat, Keep Browsing). Fixed 3 bugs found by tester: matches.py budget arithmetic excludes reciprocal likes; matches.tsx removed local quota gate blocking reciprocal likes at cap (backend 403 decides); upgrade prompt is context-aware (filters vs likes copy). iteration_14: 100% pass. Known backlog (intentionally deferred): brute-force lockout, admin-login httpOnly cookie, ingress wildcard CORS, repo-wide lint
