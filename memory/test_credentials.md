# Test Credentials

## Admin (Platform owner)
- Email: quadri.yusuf@dequad.com
- Password: Oluwatobi11@ (dev fallback) — override via `SEED_ADMIN_PASSWORD` env var in production
- Login URL: `/admin/login` (NOT `/login`)
- Legacy email `yusufquadri83@gmail.com` was renamed to the above on 2026-02 (migration in `seed.py` runs on every boot, idempotent).

## University Admin
- Email: admin@manchesteruni.edu
- Password: UniAdmin123!

## DEQUAD Staff Demo Accounts (2026-06) — student-app login only
For UKES / investor demos. Login via the regular student email/password flow at `/(auth)/login`.
Public registration of `@dequad.com` is blocked by the `.ac.uk` policy — these accounts exist only because they are seeded by `seed.py`. Override the shared password via `SEED_STAFF_PASSWORD` env var if needed.

| Email | Name | Role in product |
|---|---|---|
| yusuff@dequad.com | Yusuff Adeagbo | student (CTO demo) |
| gerald@dequad.com | Dr Gerald Marfo | student (CMO demo) |
| dapo@dequad.com | Adedapo Ajuwon | student (SWE demo) |
| chinyere@dequad.com | Chinyere Jennifer | student (Advisor demo) |

Shared password: `DequadStaff2026!`

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
