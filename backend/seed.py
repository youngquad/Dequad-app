import uuid
import os
import secrets
import logging
from datetime import datetime, timezone, timedelta

from database import db
from helpers.passwords import hash_password, is_legacy_sha256

logger = logging.getLogger(__name__)

# Use a cryptographically-strong RNG instead of the stdlib `random` module.
# Demo data isn't security-sensitive, but this satisfies static-analysis tools
# and removes any future risk if these helpers are ever reused for credentials.
_rng = secrets.SystemRandom()


async def seed_admin_and_test_users():
    seed_demo = os.environ.get("SEED_DEMO_DATA", "false").lower() == "true"
    """Seed admin user and test profiles on startup.

    SEC-001 hardening (2026-07): admin/staff/university-admin passwords MUST
    come from environment variables. If ``SEED_ADMIN_PASSWORD`` is missing we
    log a loud warning and skip the admin bootstrap rather than fall back to a
    hard-coded literal that anyone reading the repo could use to log in.

    Existing admin accounts are NEVER auto-overwritten on subsequent boots — a
    rotated password stays rotated even if the container restarts. First-boot
    creation still happens (so a fresh deployment gets an admin), but only
    when both email + password env vars are supplied.
    """
    # Defense-in-depth: read seed credentials from env so they aren't baked
    # into source.
    admin_email = os.environ.get("SEED_ADMIN_EMAIL", "quadri.yusuf@dequad.com")
    admin_password = os.environ.get("SEED_ADMIN_PASSWORD")

    # One-time migration: rename a legacy admin (yusufquadri83@gmail.com) to the new
    # email so user_id, sessions, and any related records (matches, chats, alerts) are
    # preserved instead of creating a parallel admin account. Idempotent.
    LEGACY_ADMIN_EMAIL = "yusufquadri83@gmail.com"
    if admin_email != LEGACY_ADMIN_EMAIL:
        legacy = await db.users.find_one({"email": LEGACY_ADMIN_EMAIL, "role": "admin"})
        if legacy and not await db.users.find_one({"email": admin_email}):
            await db.users.update_one(
                {"_id": legacy["_id"]},
                {"$set": {"email": admin_email}},
            )
            logger.info(f"Admin email migrated: {LEGACY_ADMIN_EMAIL} -> {admin_email}")

    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        if not admin_password:
            # First boot with no admin in DB and no env var — refuse to invent
            # one. The operator must set SEED_ADMIN_PASSWORD then restart.
            logger.error(
                "SEED_ADMIN_PASSWORD not set and no admin account exists. "
                "Skipping admin bootstrap. Set SEED_ADMIN_PASSWORD env var and restart."
            )
        else:
            admin_password_hash = hash_password(admin_password)
            admin_user = {
                "user_id": str(uuid.uuid4()), "email": admin_email, "name": "Yusuf Quadri",
                "role": "admin", "admin_password": admin_password_hash, "password_hash": admin_password_hash,
                "created_at": datetime.now(timezone.utc), "profile_completed": True,
                "interests": [], "subscription_status": "premium", "is_premium": True
            }
            await db.users.insert_one(admin_user)
            logger.info(f"Admin user created: {admin_email}")
    else:
        # Do NOT overwrite the existing admin password. Ever. If the operator
        # sets SEED_ADMIN_PASSWORD *and* the stored hash is still the ancient
        # unsalted SHA-256 format, opportunistically upgrade to bcrypt so the
        # hash-at-rest matches the rest of the system — but only that one
        # legacy case. All other properties (role/subscription flags) are safe
        # to keep in sync on every boot.
        set_fields = {
            "role": "admin", "subscription_status": "premium", "is_premium": True,
        }
        if admin_password:
            stored = existing_admin.get("admin_password") or existing_admin.get("password_hash")
            if stored and is_legacy_sha256(stored):
                new_hash = hash_password(admin_password)
                set_fields["admin_password"] = new_hash
                set_fields["password_hash"] = new_hash
                logger.info(f"Admin {admin_email}: legacy SHA-256 upgraded to bcrypt")
        await db.users.update_one({"email": admin_email}, {"$set": set_fields})
        logger.info(f"Admin user metadata refreshed: {admin_email}")

    test_profiles = [
        {"user_id": "test-user-001", "email": "emma.wilson@test.edu", "name": "Emma Wilson", "age": 21, "gender": "female",
         "interested_in": ["male", "female", "non-binary"], "university": "University of Manchester", "campus_name": "Main Campus",
         "course": "Computer Science", "study_style": "Visual Learner",
         "bio": "Passionate about AI and machine learning! Looking for study partners who love coding as much as I do.",
         "interests": ["Programming", "AI", "Gaming", "Music", "Coffee"],
         "photos": ["https://images.unsplash.com/photo-1765648636065-fd5c0884b629?w=400&h=400&fit=crop"],
         "picture": "https://images.unsplash.com/photo-1765648636065-fd5c0884b629?w=400&h=400&fit=crop",
         "role": "student", "profile_completed": True, "created_at": datetime.now(timezone.utc), "subscription_status": "free"},
        {"user_id": "test-user-002", "email": "james.chen@test.edu", "name": "James Chen", "age": 22, "gender": "male",
         "interested_in": ["male", "female", "non-binary"], "university": "University of Birmingham", "campus_name": "Edgbaston",
         "course": "Data Science", "study_style": "Night Owl",
         "bio": "Data nerd by day, gamer by night. Always up for deep discussions about tech and philosophy.",
         "interests": ["Data Science", "Philosophy", "Gaming", "Hiking", "Photography"],
         "photos": ["https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400&h=400&fit=crop"],
         "picture": "https://images.unsplash.com/photo-1600180758890-6b94519a8ba6?w=400&h=400&fit=crop",
         "role": "student", "profile_completed": True, "created_at": datetime.now(timezone.utc), "subscription_status": "free"},
        {"user_id": "test-user-003", "email": "sofia.martinez@test.edu", "name": "Sofia Martinez", "age": 20, "gender": "female",
         "interested_in": ["male", "female", "non-binary"], "university": "University of Leeds", "campus_name": "Main Campus",
         "course": "Psychology", "study_style": "Early Bird",
         "bio": "Psychology student fascinated by human behavior. Love yoga, meditation, and meaningful conversations.",
         "interests": ["Psychology", "Yoga", "Reading", "Art", "Travel"],
         "photos": ["https://images.unsplash.com/photo-1765648636178-60e73bcc865e?w=400&h=400&fit=crop"],
         "picture": "https://images.unsplash.com/photo-1765648636178-60e73bcc865e?w=400&h=400&fit=crop",
         "role": "student", "profile_completed": True, "created_at": datetime.now(timezone.utc), "subscription_status": "free"},
        {"user_id": "test-user-004", "email": "alex.thompson@test.edu", "name": "Alex Thompson", "age": 23, "gender": "non-binary",
         "interested_in": ["male", "female", "non-binary"], "university": "University of Bristol", "campus_name": "Clifton",
         "course": "Environmental Science", "study_style": "Group Study",
         "bio": "Eco-warrior saving the planet one study session at a time! Let's discuss climate change over coffee.",
         "interests": ["Environment", "Sustainability", "Hiking", "Coffee", "Documentaries"],
         "photos": ["https://images.pexels.com/photos/5538626/pexels-photo-5538626.jpeg?w=400&h=400&fit=crop"],
         "picture": "https://images.pexels.com/photos/5538626/pexels-photo-5538626.jpeg?w=400&h=400&fit=crop",
         "role": "student", "profile_completed": True, "created_at": datetime.now(timezone.utc), "subscription_status": "free"},
        {"user_id": "test-user-005", "email": "priya.patel@test.edu", "name": "Priya Patel", "age": 21, "gender": "female",
         "interested_in": ["male", "female", "non-binary"], "university": "University of Warwick", "campus_name": "Main Campus",
         "course": "Business Analytics", "study_style": "Visual Learner",
         "bio": "Future entrepreneur building the next big thing! Love networking and brainstorming sessions.",
         "interests": ["Business", "Startups", "Finance", "Networking", "Fitness"],
         "photos": ["https://images.pexels.com/photos/7683910/pexels-photo-7683910.jpeg?w=400&h=400&fit=crop"],
         "picture": "https://images.pexels.com/photos/7683910/pexels-photo-7683910.jpeg?w=400&h=400&fit=crop",
         "role": "student", "profile_completed": True, "created_at": datetime.now(timezone.utc), "subscription_status": "premium"},
        {"user_id": "test-user-006", "email": "oliver.wright@test.edu", "name": "Oliver Wright", "age": 22, "gender": "male",
         "interested_in": ["male", "female", "non-binary"], "university": "University of Manchester", "campus_name": "Main Campus",
         "course": "Mechanical Engineering", "study_style": "Night Owl",
         "bio": "Engineering student who loves building things. From drones to furniture, I'm always tinkering.",
         "interests": ["Engineering", "3D Printing", "Drones", "Football", "Music"],
         "photos": ["https://images.unsplash.com/photo-1655977237812-ee6beb137203?w=400&h=400&fit=crop"],
         "picture": "https://images.unsplash.com/photo-1655977237812-ee6beb137203?w=400&h=400&fit=crop",
         "role": "student", "profile_completed": True, "created_at": datetime.now(timezone.utc), "subscription_status": "free"},
        {"user_id": "test-user-007", "email": "amara.okafor@test.edu", "name": "Amara Okafor", "age": 20, "gender": "female",
         "interested_in": ["male", "female", "non-binary"], "university": "University of Manchester", "campus_name": "Main Campus",
         "course": "Biomedical Science", "study_style": "Early Bird",
         "bio": "Future doctor in the making! I love science, cooking Nigerian food, and spontaneous road trips.",
         "interests": ["Medicine", "Cooking", "Travel", "Dance", "Volunteering"],
         "photos": ["https://images.unsplash.com/photo-1611877247362-93a1536ad38e?w=400&h=400&fit=crop"],
         "picture": "https://images.unsplash.com/photo-1611877247362-93a1536ad38e?w=400&h=400&fit=crop",
         "role": "student", "profile_completed": True, "created_at": datetime.now(timezone.utc), "subscription_status": "premium"},
        {"user_id": "test-user-008", "email": "lucas.fernandez@test.edu", "name": "Lucas Fernandez", "age": 23, "gender": "male",
         "interested_in": ["male", "female", "non-binary"], "university": "University of Leeds", "campus_name": "Main Campus",
         "course": "Architecture", "study_style": "Visual Learner",
         "bio": "Architecture student with a passion for sustainable design. Sketch pads and coffee are my daily essentials.",
         "interests": ["Architecture", "Sketching", "Photography", "Sustainability", "Coffee"],
         "photos": ["https://images.pexels.com/photos/31367494/pexels-photo-31367494.jpeg?w=400&h=400&fit=crop"],
         "picture": "https://images.pexels.com/photos/31367494/pexels-photo-31367494.jpeg?w=400&h=400&fit=crop",
         "role": "student", "profile_completed": True, "created_at": datetime.now(timezone.utc), "subscription_status": "free"},
        {"user_id": "test-user-009", "email": "zara.ahmed@test.edu", "name": "Zara Ahmed", "age": 21, "gender": "female",
         "interested_in": ["male", "female", "non-binary"], "university": "University of Birmingham", "campus_name": "Edgbaston",
         "course": "Law", "study_style": "Group Study",
         "bio": "Aspiring barrister who debates for fun. I enjoy mock trials, poetry slams, and weekend hikes.",
         "interests": ["Law", "Debate", "Poetry", "Hiking", "Theatre"],
         "photos": ["https://images.unsplash.com/photo-1565564277651-c2e8f8155017?w=400&h=400&fit=crop"],
         "picture": "https://images.unsplash.com/photo-1565564277651-c2e8f8155017?w=400&h=400&fit=crop",
         "role": "student", "profile_completed": True, "created_at": datetime.now(timezone.utc), "subscription_status": "free"},
        {"user_id": "test-user-010", "email": "ethan.kim@test.edu", "name": "Ethan Kim", "age": 22, "gender": "male",
         "interested_in": ["male", "female", "non-binary"], "university": "University of Warwick", "campus_name": "Main Campus",
         "course": "Mathematics", "study_style": "Solo Study",
         "bio": "Maths geek who finds beauty in equations. Also a competitive chess player and amateur pianist.",
         "interests": ["Mathematics", "Chess", "Piano", "Coding", "Running"],
         "photos": ["https://images.unsplash.com/photo-1639654655546-68bc1f21e9e3?w=400&h=400&fit=crop"],
         "picture": "https://images.unsplash.com/photo-1639654655546-68bc1f21e9e3?w=400&h=400&fit=crop",
         "role": "student", "profile_completed": True, "created_at": datetime.now(timezone.utc), "subscription_status": "premium"},
        {"user_id": "test-user-011", "email": "chloe.williams@test.edu", "name": "Chloe Williams", "age": 20, "gender": "female",
         "interested_in": ["male", "female", "non-binary"], "university": "University of Bristol", "campus_name": "Clifton",
         "course": "English Literature", "study_style": "Early Bird",
         "bio": "Bookworm and aspiring writer. You'll find me in the library or at an open mic night.",
         "interests": ["Literature", "Writing", "Open Mic", "Yoga", "Vintage Fashion"],
         "photos": ["https://images.unsplash.com/photo-1597223557154-721c1cecc4b0?w=400&h=400&fit=crop"],
         "picture": "https://images.unsplash.com/photo-1597223557154-721c1cecc4b0?w=400&h=400&fit=crop",
         "role": "student", "profile_completed": True, "created_at": datetime.now(timezone.utc), "subscription_status": "free"},
        {"user_id": "test-user-012", "email": "daniel.johnson@test.edu", "name": "Daniel Johnson", "age": 24, "gender": "male",
         "interested_in": ["male", "female", "non-binary"], "university": "University of Manchester", "campus_name": "Main Campus",
         "course": "Music Production", "study_style": "Night Owl",
         "bio": "Producer, DJ, and part-time philosophy student. Making beats by night, questioning existence by day.",
         "interests": ["Music Production", "DJing", "Philosophy", "Skateboarding", "Film"],
         "photos": ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"],
         "picture": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
         "role": "student", "profile_completed": True, "created_at": datetime.now(timezone.utc), "subscription_status": "free"},
    ]

    for profile in (test_profiles if seed_demo else []):
        # All seeded profiles bypass email verification — they're synthetic.
        profile["email_verified"] = True
        # PROD hardening (2026-08): seeded demo profiles are hidden from real
        # users' discover deck / likes-received feed. They still exist for
        # investor/UKES walkthrough demos but are invisible to public traffic.
        profile["hidden_from_discovery"] = True
        profile["is_demo_account"] = True
        existing = await db.users.find_one({"user_id": profile["user_id"]})
        if not existing:
            await db.users.insert_one(profile)
            logger.info(f"Test profile created: {profile['name']}")
        else:
            await db.users.update_one({"user_id": profile["user_id"]}, {"$set": {
                "photos": profile["photos"], "picture": profile["picture"],
                "role": "student", "interested_in": profile["interested_in"], "gender": profile["gender"],
                "email_verified": True,
                "hidden_from_discovery": True,
                "is_demo_account": True,
            }})
            logger.info(f"Test profile updated: {profile['name']}")

    # Seed university admin (credentials also env-overridable). Do NOT
    # overwrite an existing admin password on every boot — only bootstrap a
    # fresh account if one doesn't already exist AND the env var is set.
    uni_admin_email = os.environ.get("SEED_UNI_ADMIN_EMAIL", "admin@manchesteruni.edu")
    uni_admin_password = os.environ.get("SEED_UNI_ADMIN_PASSWORD")

    existing_uni_admin = await db.users.find_one({"email": uni_admin_email})
    if not existing_uni_admin:
        if not uni_admin_password:
            logger.warning(
                "SEED_UNI_ADMIN_PASSWORD not set — skipping university-admin bootstrap. "
                "Set the env var to create the initial account."
            )
        else:
            uni_admin_password_hash = hash_password(uni_admin_password)
            uni_admin = {
                "user_id": f"uni-admin-{str(uuid.uuid4())[:8]}", "email": uni_admin_email, "name": "Manchester Admin",
                "role": "university_admin", "university_admin_for": "University of Manchester",
                "university": "University of Manchester", "admin_password": uni_admin_password_hash,
                "created_at": datetime.now(timezone.utc), "profile_completed": True,
                "subscription_type": "university", "subscription_status": "active"
            }
            await db.users.insert_one(uni_admin)
            logger.info(f"University admin created: {uni_admin_email}")
    else:
        # Refresh non-secret metadata only. Password stays untouched unless we
        # detect a legacy SHA-256 hash and the operator supplied the env var
        # (opportunistic upgrade path — same as the main admin seed above).
        set_fields = {
            "role": "university_admin",
            "university_admin_for": "University of Manchester",
            "subscription_status": "active",
        }
        stored = existing_uni_admin.get("admin_password")
        if uni_admin_password and stored and is_legacy_sha256(stored):
            set_fields["admin_password"] = hash_password(uni_admin_password)
            logger.info(f"Uni admin {uni_admin_email}: legacy SHA-256 upgraded to bcrypt")
        await db.users.update_one({"email": uni_admin_email}, {"$set": set_fields})
        logger.info(f"University admin metadata refreshed: {uni_admin_email}")

    # Seed DEQUAD staff demo accounts (login-only — registration is blocked
    # by the .ac.uk UK student-email policy). These are used during UKES /
    # investor demos so the wider team can sign in to the student app and
    # walk a reviewer through the user experience without creating fresh
    # accounts on demand. Idempotent.
    #
    # SEC-001 hardening (2026-07): passwords are read from env vars per-account.
    # No hard-coded literals in source. Each demo account has its own env var:
    #   SEED_STAFF_PASSWORD_YUSUFF_ADEAGBO
    #   SEED_STAFF_PASSWORD_GERALD_MARFO
    #   SEED_STAFF_PASSWORD_CHINYERE_JENNIFER
    #   SEED_STAFF_PASSWORD_YUSUF_QUADRI
    # If the env var is missing for a given demo account we (a) don't insert a
    # new record and (b) leave any existing record's password untouched.
    #
    # Email format: firstname.lastname@dequad.com.
    staff_accounts = [
        {
            "email": "Yusuff.Adeagbo@dequad.com", "name": "Yusuff Adeagbo",
            "password_env": "SEED_STAFF_PASSWORD_YUSUFF_ADEAGBO",
            "age": 27, "gender": "male", "course": "MSc IT with Project Management",
            "bio": "CTO @ DEQUAD. Builder, infra and ML enthusiast.",
            "interests": ["Engineering", "ML", "Football", "Tech", "Music"],
            "picture": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        },
        {
            "email": "Gerald.Marfo@dequad.com", "name": "Dr Gerald Marfo",
            "password_env": "SEED_STAFF_PASSWORD_GERALD_MARFO",
            "age": 34, "gender": "male", "course": "PhD Digital Marketing",
            "bio": "CMO @ DEQUAD. Digital marketing scholar, marathon runner. Demo account.",
            "interests": ["Marketing", "Running", "Reading", "Podcasts", "Travel"],
            "picture": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
        },
        {
            "email": "Chinyere.Jennifer@dequad.com", "name": "Chinyere Jennifer",
            "password_env": "SEED_STAFF_PASSWORD_CHINYERE_JENNIFER",
            "age": 31, "gender": "female", "course": "Project Management (MIGSO-PCUBED)",
            "bio": "Senior PM Consultant. Advisor @ DEQUAD. LLM background. Demo account.",
            "interests": ["Project Management", "Books", "Yoga", "Cooking", "Mentoring"],
            "picture": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
        },
        # Founder personal student-side account — separate from the admin
        # account `quadri.yusuf@dequad.com`. Yusuf uses this to log in as a
        # student and walk reviewers through the full student journey.
        {
            "email": "yusufquadri83@gmail.com", "name": "Yusuf Quadri",
            "password_env": "SEED_STAFF_PASSWORD_YUSUF_QUADRI",
            "age": 26, "gender": "male", "course": "Business Administration",
            "bio": "Founder @ DEQUAD. Former University of Bedfordshire SU President.",
            "interests": ["Student Welfare", "Tech", "Football", "Travel", "Mentoring"],
            "picture": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
        },
    ]
    # NOTE: legacy/blocked staff emails (yusuff@, gerald@, dapo@, chinyere@,
    # adedapo.ajuwon@dequad.com) are no longer deleted automatically here —
    # that was a destructive delete_many running on every boot. They're now
    # blocked at login time via BLOCKED_LEGACY_EMAILS in routes/auth.py. Any
    # leftover rows can be cleaned up manually with
    # `python3 -m scripts.purge_blocked_legacy_accounts` if needed.

    for staff in (staff_accounts if seed_demo else []):
        staff_email_lower = staff["email"].lower()
        existing_staff = await db.users.find_one({"email": staff_email_lower})
        password_from_env = os.environ.get(staff["password_env"])

        # Non-secret profile fields kept in sync on every boot.
        staff_metadata = {
            "email": staff_email_lower,
            "display_email": staff["email"],
            "name": staff["name"],
            "role": "student",
            "age": staff["age"], "gender": staff["gender"],
            "interested_in": ["male", "female", "non-binary"],
            "university": "DEQUAD Team", "campus_name": "London",
            "course": staff["course"],
            "bio": staff["bio"],
            "interests": staff["interests"],
            "picture": staff["picture"],
            "photos": [staff["picture"]],
            "profile_completed": True,
            "subscription_status": "premium", "is_premium": True,
            "student_verification": "auto",
            "auth_method": "email",
            "is_demo_account": True,
            "hidden_from_discovery": True,
            "email_verified": True,
        }

        if not existing_staff:
            if not password_from_env:
                logger.warning(
                    f"Staff demo bootstrap skipped for {staff['email']}: "
                    f"{staff['password_env']} env var not set."
                )
                continue
            staff_metadata["user_id"] = f"staff-{uuid.uuid4().hex[:8]}"
            staff_metadata["created_at"] = datetime.now(timezone.utc)
            staff_metadata["password_hash"] = hash_password(password_from_env)
            await db.users.insert_one(staff_metadata)
            logger.info(f"Staff demo account created: {staff['email']}")
        else:
            # Refresh non-secret metadata. Only touch password_hash if we can
            # opportunistically upgrade a legacy SHA-256 hash to bcrypt (needs
            # the env var so we can verify + rehash the same plaintext).
            stored = existing_staff.get("password_hash")
            if password_from_env and stored and is_legacy_sha256(stored):
                staff_metadata["password_hash"] = hash_password(password_from_env)
                logger.info(f"Staff {staff['email']}: legacy SHA-256 upgraded to bcrypt")
            await db.users.update_one(
                {"email": staff_email_lower},
                {"$set": staff_metadata},
            )
            logger.info(f"Staff demo account metadata refreshed: {staff['email']}")

    logger.info("Seed data initialization complete")

    # One-time migration (2026-08): backfill the `hidden_from_discovery` and
    # `is_demo_account` flags on any pre-existing seeded/demo profile that was
    # written before the flag existed. This guarantees NO real user can see
    # demo profiles in their discover deck once the app is opened to the
    # public. Idempotent — safe to re-run on every boot.
    demo_email_domains_or_ids = {
        # Any @test.edu profile (the twelve original test students)
        "email_suffix": "@test.edu",
        # Any @dequad.com staff/demo profile
        "email_dequad_suffix": "@dequad.com",
        # Founder's personal student-side account
        "founder_personal_email": "yusufquadri83@gmail.com",
    }
    hide_result = await db.users.update_many(
        {
            "$or": [
                {"email": {"$regex": r"@test\.edu$", "$options": "i"}},
                {"email": {"$regex": r"@dequad\.com$", "$options": "i"}, "role": "student"},
                {"email": "yusufquadri83@gmail.com"},
                {"user_id": {"$regex": r"^test-user-"}},
                {"user_id": {"$regex": r"^staff-"}},
            ],
            "$and": [
                {"$or": [
                    {"hidden_from_discovery": {"$exists": False}},
                    {"hidden_from_discovery": False},
                ]},
            ],
        },
        {"$set": {"hidden_from_discovery": True, "is_demo_account": True}},
    )
    if hide_result.modified_count:
        logger.info(
            f"Backfilled hidden_from_discovery on {hide_result.modified_count} demo/founder profiles"
        )
    _ = demo_email_domains_or_ids  # documentation-only

    # Seed demo mood entries
    mood_count = await db.mood_entries.count_documents({})
    if seed_demo and mood_count < 20:
        mood_notes = [
            "Feeling great after a productive study session!",
            "A bit stressed about upcoming exams but managing.",
            "Had an amazing group project meeting today.",
            "Feeling a bit low, missing home.",
            "Coffee and good music = great morning!",
            "Struggling with coursework deadlines.",
            "Met some awesome people at the society event!",
            "Good day overall, went for a nice walk.",
            "Anxious about tomorrow's presentation.",
            "Feeling motivated after a gym session!",
            "Had a lovely catch-up with friends.",
            "Need more sleep, late nights catching up."
        ]
        test_user_ids = [f"test-user-{str(i).zfill(3)}" for i in range(1, 13)]
        for _ in range(40):
            user_id = _rng.choice(test_user_ids)
            user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "name": 1, "university": 1})
            if user:
                mood_entry = {
                    "user_id": user_id, "score": _rng.randint(3, 10),
                    "note": _rng.choice(mood_notes), "university": user.get("university", ""),
                    "created_at": datetime.now(timezone.utc) - timedelta(days=_rng.randint(0, 14), hours=_rng.randint(0, 12))
                }
                await db.mood_entries.insert_one(mood_entry)
        logger.info("Demo mood entries seeded")

    # Seed demo matches and chat messages
    demo_chat_exists = await db.chat_messages.find_one({"sender_id": "test-user-001"})
    if seed_demo and not demo_chat_exists:
        demo_pairs = [
            ("test-user-001", "test-user-002"),
            ("test-user-001", "test-user-006"),
            ("test-user-003", "test-user-004"),
            ("test-user-005", "test-user-010"),
            ("test-user-007", "test-user-012"),
        ]

        for user_a, user_b in demo_pairs:
            # Check if accepted match already exists
            existing_match = await db.matches.find_one({
                "user_id": user_a, "matched_user_id": user_b, "status": "accepted"
            }, {"_id": 0})

            if existing_match:
                match_id = existing_match["id"]
            else:
                match_id = str(uuid.uuid4())
                now_m = datetime.now(timezone.utc)
                for direction in [(user_a, user_b), (user_b, user_a)]:
                    await db.matches.insert_one({
                        "id": match_id, "user_id": direction[0], "matched_user_id": direction[1],
                        "status": "accepted", "score": round(_rng.uniform(0.5, 0.95), 2),
                        "comment": None, "liked_section": None,
                        "created_at": now_m - timedelta(days=_rng.randint(1, 7))
                    })

            # Add demo chat messages
            demo_conversations = [
                [
                    (user_a, "Hey! We matched! What are you studying?"),
                    (user_b, "Hi! Great to connect. I'm really enjoying my course so far."),
                    (user_a, "That's brilliant! We should study together sometime."),
                    (user_b, "Absolutely! Library or coffee shop?"),
                    (user_a, "Coffee shop sounds great! Know any good ones near campus?"),
                    (user_b, "There's a lovely one on Oxford Road. How about tomorrow at 2?"),
                ],
                [
                    (user_a, "Hey! I noticed we share a lot of the same interests!"),
                    (user_b, "Yes! That's what caught my eye too. What's your favourite?"),
                    (user_a, "I'd say hiking. Nothing beats fresh air after a study session."),
                    (user_b, "Same! Have you tried the Peak District trails?"),
                    (user_a, "Not yet but it's on my list! We should plan a trip."),
                ],
                [
                    (user_a, "Hi there! How's your week going?"),
                    (user_b, "Pretty hectic with assignments! But managing. You?"),
                    (user_a, "Same here. Want to grab coffee and destress?"),
                    (user_b, "That sounds perfect! When are you free?"),
                ],
                [
                    (user_a, "Hey! Love your bio. The tinkering part resonated with me!"),
                    (user_b, "Thanks! What do you like to build?"),
                    (user_a, "Mostly software projects, but I've been getting into 3D printing lately."),
                    (user_b, "That's awesome! I have a printer we could use for projects."),
                    (user_a, "No way! Let's collaborate on something."),
                    (user_b, "Definitely! I have a few ideas. Let's meet up this week?"),
                ],
                [
                    (user_a, "Hi! Another music lover! What do you listen to?"),
                    (user_b, "A bit of everything really. Lately lots of jazz and neo-soul."),
                    (user_a, "Great taste! Have you been to any live gigs recently?"),
                    (user_b, "Yes! There's a jazz night at the student union every Thursday."),
                    (user_a, "I'll definitely check that out. Want to go together next week?"),
                ],
            ]

            convo_idx = demo_pairs.index((user_a, user_b)) % len(demo_conversations)
            conversation = demo_conversations[convo_idx]
            now_c = datetime.now(timezone.utc)
            for i, (sender, text) in enumerate(conversation):
                await db.chat_messages.insert_one({
                    "id": str(uuid.uuid4()), "match_id": match_id,
                    "sender_id": sender, "text": text,
                    "created_at": now_c - timedelta(hours=len(conversation) - i, minutes=_rng.randint(0, 30))
                })

        logger.info("Demo matches and chat messages seeded")
