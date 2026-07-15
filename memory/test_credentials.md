# Test Credentials

> **2026-07 SEC-001 update**: All seed passwords now come from environment
> variables. The `.env`-driven defaults below match what's currently deployed
> on preview. **In production, override via SEED_* env vars.** Existing
> passwords are NEVER overwritten on server restart — a rotated password stays
> rotated. Passwords in the DB are bcrypt (`$2b$`); legacy SHA-256 hashes
> auto-upgrade to bcrypt on next successful login.

## Admin (Platform owner)
- Email: quadri.yusuf@dequad.com
- Password: Oluwatobi11@ (env: `SEED_ADMIN_PASSWORD`)
- Admin code (for admin-login): `DEQUAD_ADMIN_2024` (env: `ADMIN_SECRET_CODE`)
- Login URL: `/admin/login` (NOT `/login`)
- Legacy email `yusufquadri83@gmail.com` was renamed to the above on 2026-02.

## University Admin
- Email: admin@manchesteruni.edu
- Password: UniAdmin123! (env: `SEED_UNI_ADMIN_PASSWORD`)

## DEQUAD Demo Accounts (2026-06, revised) — student-app login only
For UKES / investor demos. Login via the regular student email/password flow at `/(auth)/login`.
**These seeded accounts bypass OTP verification** (`email_verified=true` set in seed.py).

Public registration of `@dequad.com` is blocked by the `.ac.uk` policy.

### Email-verification (OTP) — new flow (2026-06)
- Public registration via `POST /api/auth/register` → account created with `email_verified=false`, OTP sent to .ac.uk inbox.
- Account cannot log in until OTP is entered at `/verify-email?email=...` → backend `POST /api/auth/verify-email`.
- Resend: `POST /api/auth/resend-verification` (60s cooldown).
- Code: 6-digit, 15-min TTL, max 5 attempts.
- Dev: `DEV_LOG_OTP=true` in `.env` prints OTP to backend logs (preview only; **production must override to false**).

| Email | Name | Password | Env var | Notes |
|---|---|---|---|---|
| Yusuff.Adeagbo@dequad.com | Yusuff Adeagbo | `YusuffAdeagbo11@` | `SEED_STAFF_PASSWORD_YUSUFF_ADEAGBO` | Real mailbox — CTO |
| Gerald.Marfo@dequad.com | Dr Gerald Marfo | `DequadStaff2026!` | `SEED_STAFF_PASSWORD_GERALD_MARFO` | Demo only — CMO |
| Chinyere.Jennifer@dequad.com | Chinyere Jennifer | `DequadStaff2026!` | `SEED_STAFF_PASSWORD_CHINYERE_JENNIFER` | Demo only — Advisor |
| yusufquadri83@gmail.com | Yusuf Quadri | `Oluwatobi11@` | `SEED_STAFF_PASSWORD_YUSUF_QUADRI` | Founder's personal student-side account |

**Blocked / removed from DB:**
- `Adedapo.Ajuwon@dequad.com` (intentionally blocked from student login)
- Legacy first-name-only emails: `yusuff@`, `gerald@`, `dapo@`, `chinyere@dequad.com` (deleted on seed)

Tested: 11/11 regressions pass — `/app/backend/tests/test_staff_demo_login.py`.

## Test Student Profiles (12 seeded)
Emma Wilson, James Chen, Sofia Martinez, Alex Thompson, Priya Patel,
Oliver Wright, Amara Okafor, Lucas Fernandez, Zara Ahmed, Ethan Kim,
Chloe Williams, Daniel Johnson.

Use credentials from `/app/backend/seed.py` for individual student logins.

## UK Student-Email Policy (2026-02)
- `/api/auth/register` enforces `.ac.uk` only — `@dequad.com` returns HTTP 403.
- Auto-approved subdomains: `student.*`, `students.*`, `live.*`, `my.*`, `sms.*`, `stu.*`, `mail.*`, `uni.*`, `studentmail.*`
- Hard-blocked: `staff.*`, `admin.*`, `faculty.*`, `alumni.*` (subdomain or local-part prefix)
- Bare `.ac.uk` (e.g. `name@ucl.ac.uk`) requires `confirm_student=true` in the request → stored as `student_verification="self_declared"` for admin review.
- Seeded test accounts use `@student.leeds.ac.uk` to satisfy the policy.

## Rate limits (2026-07)
- Auth endpoints (login/register/verify/resend/forgot/reset): **30 requests / 60 s** per IP (env: `RATE_LIMIT_AUTH`).
- General endpoints: **100 requests / 60 s** per IP (env: `RATE_LIMIT_GENERAL`).
- Webhooks (Stripe): exempt.

