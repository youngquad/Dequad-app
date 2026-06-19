# Test Credentials

## Admin (Platform owner)
- Email: quadri.yusuf@dequad.com
- Password: Oluwatobi11@ (dev fallback) — override via `SEED_ADMIN_PASSWORD` env var in production
- Login URL: `/admin/login` (NOT `/login`)
- Legacy email `yusufquadri83@gmail.com` was renamed to the above on 2026-02 (migration in `seed.py` runs on every boot, idempotent).

## University Admin
- Email: admin@manchesteruni.edu
- Password: UniAdmin123!

## DEQUAD Staff Demo Accounts (2026-06, revised) — student-app login only
For UKES / investor demos. Login via the regular student email/password flow at `/(auth)/login`.
Public registration of `@dequad.com` is blocked by the `.ac.uk` policy — these accounts exist only because they are seeded by `seed.py`. Email format: `firstname.lastname@dequad.com` (case-insensitive at login).

| Email | Name | Password |
|---|---|---|
| Yusuff.Adeagbo@dequad.com | Yusuff Adeagbo (real mailbox — CTO) | `YusuffAdeagbo11@` |
| Gerald.Marfo@dequad.com | Dr Gerald Marfo (demo only — CMO) | `DequadStaff2026!` |
| Adedapo.Ajuwon@dequad.com | Adedapo Ajuwon (demo only — SWE) | `DequadStaff2026!` |
| Chinyere.Jennifer@dequad.com | Chinyere Jennifer (demo only — Advisor) | `DequadStaff2026!` |

Legacy first-name-only emails (`yusuff@`, `gerald@`, `dapo@`, `chinyere@dequad.com`) were deleted on this revision. Override the shared demo password via `SEED_STAFF_PASSWORD` env var.

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
