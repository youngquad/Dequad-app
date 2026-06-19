# Test Credentials

## Admin (Platform owner)
- Email: quadri.yusuf@dequad.com
- Password: Oluwatobi11@ (dev fallback) — override via `SEED_ADMIN_PASSWORD` env var in production
- Login URL: `/admin/login` (NOT `/login`)
- Legacy email `yusufquadri83@gmail.com` was renamed to the above on 2026-02 (migration in `seed.py` runs on every boot, idempotent).

## University Admin
- Email: admin@manchesteruni.edu
- Password: UniAdmin123!

## DEQUAD Demo Accounts (2026-06, revised) — student-app login only
For UKES / investor demos. Login via the regular student email/password flow at `/(auth)/login`.
Public registration of `@dequad.com` is blocked by the `.ac.uk` policy — these accounts exist only because they are seeded by `seed.py`. Email format: `firstname.lastname@dequad.com` (case-insensitive at login).

| Email | Name | Password | Notes |
|---|---|---|---|
| Yusuff.Adeagbo@dequad.com | Yusuff Adeagbo | `YusuffAdeagbo11@` | Real mailbox — CTO |
| Gerald.Marfo@dequad.com | Dr Gerald Marfo | `DequadStaff2026!` | Demo only — CMO |
| Chinyere.Jennifer@dequad.com | Chinyere Jennifer | `DequadStaff2026!` | Demo only — Advisor |
| yusufquadri83@gmail.com | Yusuf Quadri | `Oluwatobi11@` | Founder's personal student-side account (separate from admin login) |

**Blocked / removed from DB:**
- `Adedapo.Ajuwon@dequad.com` (intentionally blocked from student login)
- Legacy first-name-only emails: `yusuff@`, `gerald@`, `dapo@`, `chinyere@dequad.com` (deleted on seed)

Override the shared demo password via `SEED_STAFF_PASSWORD` env var.

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
