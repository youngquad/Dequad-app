import hashlib
import uuid
import random
import logging
from datetime import datetime, timezone, timedelta

from database import db

logger = logging.getLogger(__name__)


async def seed_admin_and_test_users():
    """Seed admin user and test profiles on startup"""
    admin_email = "yusufquadri83@gmail.com"
    admin_password = "Oluwatobi11@"
    admin_password_hash = hashlib.sha256(admin_password.encode()).hexdigest()

    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        admin_user = {
            "user_id": str(uuid.uuid4()), "email": admin_email, "name": "Yusuf Quadri",
            "role": "admin", "admin_password": admin_password_hash, "password_hash": admin_password_hash,
            "created_at": datetime.now(timezone.utc), "profile_completed": True,
            "interests": [], "subscription_status": "premium", "is_premium": True
        }
        await db.users.insert_one(admin_user)
        logger.info(f"Admin user created: {admin_email}")
    else:
        await db.users.update_one({"email": admin_email}, {"$set": {
            "admin_password": admin_password_hash, "password_hash": admin_password_hash,
            "role": "admin", "subscription_status": "premium", "is_premium": True
        }})
        logger.info(f"Admin user updated: {admin_email}")

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

    for profile in test_profiles:
        existing = await db.users.find_one({"user_id": profile["user_id"]})
        if not existing:
            await db.users.insert_one(profile)
            logger.info(f"Test profile created: {profile['name']}")
        else:
            await db.users.update_one({"user_id": profile["user_id"]}, {"$set": {
                "photos": profile["photos"], "picture": profile["picture"],
                "role": "student", "interested_in": profile["interested_in"], "gender": profile["gender"]
            }})
            logger.info(f"Test profile updated: {profile['name']}")

    # Seed university admin
    uni_admin_email = "admin@manchesteruni.edu"
    uni_admin_password = "UniAdmin123!"
    uni_admin_password_hash = hashlib.sha256(uni_admin_password.encode()).hexdigest()

    existing_uni_admin = await db.users.find_one({"email": uni_admin_email})
    if not existing_uni_admin:
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
        await db.users.update_one({"email": uni_admin_email}, {"$set": {
            "admin_password": uni_admin_password_hash, "role": "university_admin",
            "university_admin_for": "University of Manchester", "subscription_status": "active"
        }})
        logger.info(f"University admin updated: {uni_admin_email}")

    logger.info("Seed data initialization complete")

    # Seed demo mood entries
    mood_count = await db.mood_entries.count_documents({})
    if mood_count < 20:
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
            user_id = random.choice(test_user_ids)
            user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "name": 1, "university": 1})
            if user:
                mood_entry = {
                    "user_id": user_id, "score": random.randint(3, 10),
                    "note": random.choice(mood_notes), "university": user.get("university", ""),
                    "created_at": datetime.now(timezone.utc) - timedelta(days=random.randint(0, 14), hours=random.randint(0, 12))
                }
                await db.mood_entries.insert_one(mood_entry)
        logger.info("Demo mood entries seeded")
