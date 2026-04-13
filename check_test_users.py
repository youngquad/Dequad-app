#!/usr/bin/env python3
"""
Create Test Users for Educare App
"""

import requests
import json
import sys
import uuid

# Configuration
BASE_URL = "https://admin-dashboard-1112.preview.emergentagent.com/api"
ADMIN_EMAIL = "yusufquadri83@gmail.com"
ADMIN_PASSWORD = "Oluwatobi11@"

# Test user data
TEST_USERS = [
    {
        "name": "Emma Wilson",
        "email": "emma.wilson@university.ac.uk",
        "age": 20,
        "university": "University of Cambridge",
        "course": "Computer Science",
        "interests": ["Technology", "Reading", "Photography"],
        "bio": "Computer Science student passionate about AI and machine learning.",
        "gender": "woman",
        "interested_in": ["men", "women"]
    },
    {
        "name": "James Chen",
        "email": "james.chen@university.ac.uk", 
        "age": 22,
        "university": "Imperial College London",
        "course": "Engineering",
        "interests": ["Sports", "Technology", "Music"],
        "bio": "Engineering student who loves building things and playing guitar.",
        "gender": "man",
        "interested_in": ["women"]
    },
    {
        "name": "Sofia Martinez",
        "email": "sofia.martinez@university.ac.uk",
        "age": 21,
        "university": "University College London",
        "course": "Psychology",
        "interests": ["Psychology", "Art", "Travel"],
        "bio": "Psychology student interested in human behavior and mental health.",
        "gender": "woman", 
        "interested_in": ["everyone"]
    },
    {
        "name": "Alex Thompson",
        "email": "alex.thompson@university.ac.uk",
        "age": 23,
        "university": "King's College London",
        "course": "Business",
        "interests": ["Business", "Fitness", "Cooking"],
        "bio": "Business student with entrepreneurial spirit and love for healthy living.",
        "gender": "non-binary",
        "interested_in": ["everyone"]
    },
    {
        "name": "Priya Patel",
        "email": "priya.patel@university.ac.uk",
        "age": 19,
        "university": "London School of Economics",
        "course": "Economics",
        "interests": ["Economics", "Dance", "Volunteering"],
        "bio": "Economics student passionate about social impact and cultural dance.",
        "gender": "woman",
        "interested_in": ["men", "non-binary"]
    }
]

def get_admin_token():
    """Get admin authentication token"""
    login_data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    response = requests.post(f"{BASE_URL}/auth/admin-login", json=login_data)
    
    if response.status_code == 200:
        login_response = response.json()
        return login_response.get("session_token")
    else:
        print(f"❌ Admin login failed: {response.status_code}")
        return None

def create_test_user_via_session(user_data):
    """Create a test user by simulating OAuth session"""
    # Create a fake session for the user
    session_data = {
        "session_id": f"test_session_{uuid.uuid4().hex[:12]}"
    }
    
    # This would normally come from OAuth, but we'll simulate it
    # Since we can't directly create users without OAuth, we'll need to use admin privileges
    return None

def check_if_users_exist(token):
    """Check if test users already exist"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try to get discover profiles to see what users exist
    response = requests.get(f"{BASE_URL}/matches/discover", headers=headers)
    
    if response.status_code == 200:
        profiles = response.json()
        test_names = [user["name"] for user in TEST_USERS]
        existing_names = [p.get("name") for p in profiles]
        
        found_users = [name for name in test_names if name in existing_names]
        missing_users = [name for name in test_names if name not in existing_names]
        
        print(f"✅ Found existing test users: {found_users}")
        print(f"❌ Missing test users: {missing_users}")
        
        return found_users, missing_users
    else:
        print(f"❌ Cannot check existing users: {response.status_code}")
        return [], TEST_USERS

def main():
    print("👥 Test User Creation Check")
    print("="*50)
    
    # Get admin token
    token = get_admin_token()
    if not token:
        return 1
    
    print("✅ Admin login successful")
    
    # Check existing users
    found, missing = check_if_users_exist(token)
    
    print(f"\n📊 Status:")
    print(f"   Found: {len(found)}/5 test users")
    print(f"   Missing: {len(missing)}/5 test users")
    
    if len(missing) > 0:
        print(f"\n❌ Missing test users need to be created by main agent:")
        for user in missing:
            print(f"   - {user}")
        
        print(f"\n💡 The main agent needs to create these test users with photos.")
        print(f"   Test users should be created as 'student' role, not 'admin'.")
        return 1
    else:
        print(f"\n✅ All test users exist!")
        return 0

if __name__ == "__main__":
    sys.exit(main())