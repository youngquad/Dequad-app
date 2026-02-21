#!/usr/bin/env python3
"""
Backend API Testing for Educare - Hinge-style Matching Interface
Testing the NEW implementation with like_type, like_content, comment fields
"""

import requests
import json
import uuid
import subprocess
import time
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend .env
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://github-retriever-1.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

print(f"🔗 Testing Backend API at: {API_BASE}")

class HingeMatchingTester:
    def __init__(self):
        self.session_tokens = {}
        self.test_users = {}
        
    def create_test_user_session(self, user_name: str, email: str) -> str:
        """Create a test user session directly in the database"""
        user_id = f"hinge_user_{uuid.uuid4().hex[:8]}"
        session_token = f"hinge_session_{uuid.uuid4().hex}"
        
        try:
            # Create user in database
            subprocess.run([
                "mongosh", "test_database", "--eval",
                f"""
                db.users.insertOne({{
                  user_id: '{user_id}',
                  email: '{email}',
                  name: '{user_name}',
                  picture: null,
                  role: 'student',
                  interests: [],
                  prompts: [],
                  university: null,
                  age: null,
                  gender: null,
                  interested_in: [],
                  notifications_enabled: true,
                  plan: 'free',
                  swipes_today: 0,
                  created_at: new Date()
                }});
                """
            ], capture_output=True, text=True, timeout=10)
            
            # Create session in database
            subprocess.run([
                "mongosh", "test_database", "--eval",
                f"""
                db.user_sessions.insertOne({{
                  user_id: '{user_id}',
                  session_token: '{session_token}',
                  expires_at: new Date(Date.now() + 7*24*60*60*1000),
                  created_at: new Date()
                }});
                """
            ], capture_output=True, text=True, timeout=10)
            
        except Exception as e:
            print(f"Warning: Could not create user/session in database: {e}")
        
        # Store test user info
        self.test_users[user_name] = {
            "user_id": user_id,
            "email": email,
            "name": user_name,
            "session_token": session_token
        }
        
        self.session_tokens[user_name] = session_token
        print(f"✅ Created test user session: {user_name} ({user_id})")
        return session_token
    
    def make_request(self, method: str, endpoint: str, data=None, user_name=None):
        """Make authenticated API request"""
        url = f"{API_BASE}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if user_name and user_name in self.session_tokens:
            headers["Authorization"] = f"Bearer {self.session_tokens[user_name]}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response
        except Exception as e:
            print(f"❌ Request error: {method} {endpoint} - {e}")
            return None
    
    def test_profile_prompts_field(self):
        """Test that profile endpoints support prompts field"""
        print("\n🧪 Testing Profile Prompts Field Support...")
        
        # Create test user
        self.create_test_user_session("alice_prompts", "alice.prompts@test.com")
        
        # Test 1: Update profile with prompts
        print("📝 Test 1: PUT /api/profile with prompts field")
        prompts_data = {
            "prompts": [
                {"question": "What's your ideal first date?", "answer": "Coffee and a walk in the park"},
                {"question": "What's your biggest passion?", "answer": "Environmental sustainability and hiking"}
            ],
            "university": "University of Cambridge",
            "name": "Alice Prompts"
        }
        
        response = self.make_request("PUT", "/profile", prompts_data, "alice_prompts")
        if response and response.status_code == 200:
            profile_data = response.json()
            if "prompts" in profile_data and len(profile_data["prompts"]) == 2:
                print("✅ Profile update with prompts successful")
                print(f"   Prompts stored: {len(profile_data['prompts'])} items")
                return True
            else:
                print("❌ Prompts field not properly stored in profile")
                return False
        else:
            print(f"❌ Profile update with prompts failed - Status: {response.status_code if response else 'No response'}")
            if response:
                print(f"   Response: {response.text}")
            return False
    
    def test_discover_university_and_prompts(self):
        """Test that discover endpoint returns university and prompts fields"""
        print("\n🧪 Testing Discover Endpoint Fields...")
        
        # Create test users with university and prompts
        self.create_test_user_session("bob_discover", "bob.discover@test.com")
        
        # Set up bob's profile
        bob_profile = {
            "university": "Imperial College London",
            "prompts": [
                {"question": "What makes you laugh?", "answer": "Dad jokes and memes"},
                {"question": "Your perfect Sunday?", "answer": "Brunch with friends and board games"}
            ],
            "name": "Bob Discover",
            "age": 22,
            "gender": "man",
            "interested_in": ["women"]
        }
        
        response = self.make_request("PUT", "/profile", bob_profile, "bob_discover")
        if not response or response.status_code != 200:
            print(f"❌ Failed to set up bob's profile - Status: {response.status_code if response else 'No response'}")
            return False
        
        # Test discover endpoint
        print("📝 Test: GET /api/matches/discover returns university and prompts")
        response = self.make_request("GET", "/matches/discover", user_name="alice_prompts")
        if response and response.status_code == 200:
            users = response.json()
            print(f"   Found {len(users)} potential matches")
            
            # Check if any user has university and prompts fields
            found_university = False
            found_prompts = False
            
            for user in users:
                if "university" in user and user["university"]:
                    found_university = True
                    print(f"✅ University field found: {user['university']}")
                
                if "prompts" in user and user["prompts"]:
                    found_prompts = True
                    print(f"✅ Prompts field found: {len(user['prompts'])} prompts")
                    break
            
            if found_university or found_prompts:
                print("✅ Discover endpoint returns university and/or prompts fields")
                return True
            else:
                print(f"❌ Missing fields - University: {found_university}, Prompts: {found_prompts}")
                return False
        else:
            print(f"❌ GET /api/matches/discover failed - Status: {response.status_code if response else 'No response'}")
            return False
    
    def test_hinge_style_swipe_endpoint(self):
        """Test the updated swipe endpoint with Hinge-style features"""
        print("\n🧪 Testing Hinge-style Swipe Endpoint...")
        
        # Create test users
        self.create_test_user_session("charlie_swiper", "charlie.swiper@test.com")
        self.create_test_user_session("diana_target", "diana.target@test.com")
        
        # Set up profiles
        charlie_profile = {
            "name": "Charlie Swiper",
            "university": "University of Oxford",
            "age": 21,
            "gender": "man",
            "interested_in": ["women"]
        }
        
        diana_profile = {
            "name": "Diana Target",
            "university": "University of Oxford", 
            "age": 20,
            "gender": "woman",
            "interested_in": ["men"],
            "prompts": [
                {"question": "What's your love language?", "answer": "Quality time and good conversations"},
                {"question": "Best travel story?", "answer": "Got lost in Tokyo but found the best ramen shop"}
            ]
        }
        
        # Update profiles
        self.make_request("PUT", "/profile", charlie_profile, "charlie_swiper")
        self.make_request("PUT", "/profile", diana_profile, "diana_target")
        
        # Get Diana's user_id for swiping
        diana_response = self.make_request("GET", "/auth/me", user_name="diana_target")
        if not diana_response or diana_response.status_code != 200:
            print("❌ Failed to get Diana's user data")
            return False
        
        diana_user_id = diana_response.json()["user_id"]
        
        # Test 1: Swipe with like_type "prompt" and comment
        print("📝 Test 1: POST /api/matches/swipe with Hinge-style fields")
        swipe_data = {
            "target_user_id": diana_user_id,
            "action": "like",
            "like_type": "prompt",
            "like_content": "Quality time and good conversations",
            "comment": "I totally agree! Deep conversations are the best way to connect."
        }
        
        response = self.make_request("POST", "/matches/swipe", swipe_data, "charlie_swiper")
        if response and response.status_code == 200:
            swipe_result = response.json()
            match_data = swipe_result.get("match")
            
            # Verify Hinge-style fields are stored
            if (match_data and 
                match_data.get("like_type") == "prompt" and
                match_data.get("like_content") == "Quality time and good conversations" and
                match_data.get("comment") == "I totally agree! Deep conversations are the best way to connect."):
                print("✅ Hinge-style swipe fields stored correctly")
                print(f"   Like Type: {match_data['like_type']}")
                print(f"   Like Content: {match_data['like_content']}")
                print(f"   Comment: {match_data['comment']}")
                return True
            else:
                print("❌ Hinge-style fields not properly stored")
                print(f"   Match data: {match_data}")
                return False
        else:
            print(f"❌ Hinge-style swipe failed - Status: {response.status_code if response else 'No response'}")
            if response:
                print(f"   Response: {response.text}")
            return False
    
    def test_new_like_notifications(self):
        """Test new_like notification type before match"""
        print("\n🧪 Testing New Like Notifications...")
        
        # Create test users
        self.create_test_user_session("grace_liker", "grace.liker@test.com")
        self.create_test_user_session("henry_liked", "henry.liked@test.com")
        
        # Set up profiles
        grace_profile = {
            "name": "Grace Liker",
            "university": "King's College London",
            "age": 20,
            "gender": "woman",
            "interested_in": ["men"]
        }
        
        henry_profile = {
            "name": "Henry Liked",
            "university": "King's College London",
            "age": 21,
            "gender": "man",
            "interested_in": ["women"],
            "prompts": [
                {"question": "What's your superpower?", "answer": "Making people laugh even on their worst days"}
            ]
        }
        
        self.make_request("PUT", "/profile", grace_profile, "grace_liker")
        self.make_request("PUT", "/profile", henry_profile, "henry_liked")
        
        # Get Henry's user_id
        henry_response = self.make_request("GET", "/auth/me", user_name="henry_liked")
        if not henry_response or henry_response.status_code != 200:
            print("❌ Failed to get Henry's user data")
            return False
        
        henry_user_id = henry_response.json()["user_id"]
        
        # Grace likes Henry's prompt with a comment
        print("📝 Test 1: Like with comment should create 'new_like' notification")
        swipe_data = {
            "target_user_id": henry_user_id,
            "action": "like",
            "like_type": "prompt",
            "like_content": "Making people laugh even on their worst days",
            "comment": "This is exactly what the world needs more of! 😄"
        }
        
        response = self.make_request("POST", "/matches/swipe", swipe_data, "grace_liker")
        if not response or response.status_code != 200:
            print(f"❌ Failed to send like - Status: {response.status_code if response else 'No response'}")
            return False
        
        print("✅ Like sent successfully")
        
        # Check Henry's notifications for new_like notification
        print("📝 Test 2: Check for 'new_like' notification")
        
        # Wait a moment for notification to be processed
        time.sleep(2)
        
        response = self.make_request("GET", "/notifications", user_name="henry_liked")
        if response and response.status_code == 200:
            notifications = response.json()
            print(f"   Found {len(notifications)} notifications")
            
            # Look for new_like notification
            new_like_notification = None
            for notif in notifications:
                if notif.get("notification_type") == "new_like":
                    new_like_notification = notif
                    break
            
            if new_like_notification:
                print("✅ 'new_like' notification found")
                print(f"   Title: {new_like_notification.get('title')}")
                print(f"   Body: {new_like_notification.get('body')}")
                
                # Verify notification contains expected information
                data = new_like_notification.get("data", {})
                if (data.get("from_user_name") == "Grace Liker" and
                    data.get("like_type") == "prompt" and
                    data.get("comment") == "This is exactly what the world needs more of! 😄"):
                    print("✅ Notification contains correct like details")
                    return True
                else:
                    print("❌ Notification missing expected like details")
                    print(f"   Data: {data}")
                    return False
            else:
                print("❌ 'new_like' notification not found")
                print(f"   Available notifications: {[n.get('notification_type') for n in notifications]}")
                return False
        else:
            print(f"❌ Failed to get notifications - Status: {response.status_code if response else 'No response'}")
            return False

def main():
    """Run all Hinge-style matching interface tests"""
    print("🚀 Starting Educare Backend API Tests - Hinge-style Matching Interface")
    print("=" * 80)
    
    tester = HingeMatchingTester()
    
    try:
        # Test results tracking
        test_results = {}
        
        # Test 1: Profile prompts field support
        test_results["profile_prompts"] = tester.test_profile_prompts_field()
        
        # Test 2: Discover endpoint returns university and prompts
        test_results["discover_fields"] = tester.test_discover_university_and_prompts()
        
        # Test 3: Hinge-style swipe endpoint with new fields
        test_results["hinge_swipe"] = tester.test_hinge_style_swipe_endpoint()
        
        # Test 4: New like notifications
        test_results["new_like_notifications"] = tester.test_new_like_notifications()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 80)
        
        passed = 0
        total = len(test_results)
        
        for test_name, result in test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_name.replace('_', ' ').title()}")
            if result:
                passed += 1
        
        print(f"\n🎯 Overall Result: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 ALL HINGE-STYLE MATCHING TESTS PASSED!")
            return True
        else:
            print("⚠️  Some tests failed - see details above")
            return False
            
    except Exception as e:
        print(f"❌ Test execution error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)