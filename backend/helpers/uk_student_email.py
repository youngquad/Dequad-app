"""UK student email classifier for DEQUAD.

Single source of truth for who is allowed to sign up. Used by both
`/api/auth/register` (email + password flow) and `/api/auth/session`
(Google OAuth flow).

Returns one of four verdicts via `classify_email`:

  - "blocked"           — obvious staff / admin / alumni address. Hard 403.
  - "not_uk_academic"   — not a `.ac.uk` address at all. Hard 403.
  - "auto_student"      — email lives on a known student-only subdomain
                          (e.g. `name@student.leeds.ac.uk`). Accept without
                          extra attestation.
  - "needs_attestation" — bare `.ac.uk` address (e.g. `name@ucl.ac.uk`).
                          Most UK universities don't separate students vs
                          staff at the email level — these accounts are
                          accepted only when the user explicitly ticks the
                          "I confirm I'm a current student" checkbox AND
                          we flag the row for admin review.
"""
from __future__ import annotations
from typing import Literal, NamedTuple


Verdict = Literal["blocked", "not_uk_academic", "auto_student", "needs_attestation"]


class EmailClassification(NamedTuple):
    verdict: Verdict
    reason: str
    domain: str  # the part after @, lower-cased — handy for logging / DB


# Subdomain prefixes that UK universities use *exclusively* for students.
# If the address fits `<localpart>@<prefix>.<uni>.ac.uk` it's safe to
# auto-approve.
STUDENT_PREFIXES = (
    "student.",
    "students.",
    "stu.",
    "live.",         # warwick.ac.uk, kent.ac.uk
    "my.",           # westminster.ac.uk, mdx.ac.uk
    "sms.",          # ed.ac.uk
    "mail.",         # some Russell Group student systems
    "uni.",
    "studentmail.",
)

# Patterns that clearly indicate non-students. Even if the email ends in
# `.ac.uk`, anything matching these is rejected outright so that lecturers,
# admin staff, faculty members, alumni, etc. cannot sign up to a student
# product.
STAFF_BLOCK_PATTERNS = (
    "staff.",
    "admin.",
    "faculty.",
    "alumni.",
    "alum.",
    "prof.",
    "lecturer.",
    "academic.",
    "research.",
    "researchers.",
    "employee.",
    "hr.",
)
# These also appear as local-part prefixes occasionally
# (`staff-foo@uni.ac.uk` etc.). We block them too to be safe.
STAFF_LOCALPART_PATTERNS = (
    "staff",
    "admin",
    "hr",
    "faculty",
    "alumni",
    "lecturer",
    "professor",
)


def _split(email: str) -> tuple[str, str]:
    e = (email or "").strip().lower()
    if "@" not in e:
        return "", ""
    local, _, domain = e.partition("@")
    return local, domain


def classify_email(email: str) -> EmailClassification:
    local, domain = _split(email)
    if not domain or "." not in domain:
        return EmailClassification("blocked", "Invalid email address.", domain)

    if not domain.endswith(".ac.uk"):
        return EmailClassification(
            "not_uk_academic",
            "DEQUAD is only available to students at UK universities with a .ac.uk email address.",
            domain,
        )

    # Staff-style subdomain — block.
    for bad in STAFF_BLOCK_PATTERNS:
        if domain.startswith(bad) or f".{bad}" in f".{domain}":
            return EmailClassification(
                "blocked",
                "Staff, faculty, and alumni accounts cannot register. DEQUAD is for current students only.",
                domain,
            )

    # Staff-style local part — block.
    # We match on prefix and explicit "-staff" / "_staff" so that names that
    # merely contain the substring (e.g. "alistair") are not caught.
    for bad in STAFF_LOCALPART_PATTERNS:
        if (
            local == bad
            or local.startswith(f"{bad}-")
            or local.startswith(f"{bad}.")
            or local.startswith(f"{bad}_")
            or local.endswith(f"-{bad}")
            or local.endswith(f".{bad}")
            or local.endswith(f"_{bad}")
        ):
            return EmailClassification(
                "blocked",
                "Staff and admin accounts cannot register. DEQUAD is for current students only.",
                domain,
            )

    # Known student subdomain — auto-approve.
    for good in STUDENT_PREFIXES:
        if domain.startswith(good):
            return EmailClassification("auto_student", "Student subdomain matched.", domain)

    # Bare `<uni>.ac.uk` — could be student or staff. Accept only when the
    # caller has obtained an explicit student attestation from the user.
    return EmailClassification(
        "needs_attestation",
        "Most UK universities use the same domain for students and staff. Please confirm you are a current student.",
        domain,
    )
