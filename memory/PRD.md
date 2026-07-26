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
