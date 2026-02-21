#!/usr/bin/env python3
"""
Backend API Testing for Educare - Hinge-style Matching Interface
Testing the NEW implementation with like_type, like_content, comment fields
"""

import requests
import json
import uuid
import subprocess
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from frontend .env
BACKEND_URL = os.getenv('EXPO_PUBLIC_BACKEND_URL', 'https://github-retriever-1.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

print(f"🔗 Testing Backend API at: {API_BASE}")

class EducareAPITester:
    def __init__(self):
        self.session_tokens = {}
        self.test_users = {}
        
    def create_test_user_session(self, user_name: str, email: str) -> str:
        """Create a test user session directly in the database"""
        user_id = f"test_user_{uuid.uuid4().hex[:8]}"
        session_token = f"test_session_{uuid.uuid4().hex}"
        
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
    
    def make_request(self, method: str, endpoint: str, data=None, user_name=None, expect_error=False):
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
            
            if not expect_error and response.status_code >= 400:
                print(f"❌ Request failed: {method} {endpoint}")
                print(f"   Status: {response.status_code}")
                print(f"   Response: {response.text}")
                return None
            
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
            else:
                print("❌ Prompts field not properly stored in profile")
                return False
        else:
            print("❌ Profile update with prompts failed")
            return False
        
        # Test 2: Get profile and verify prompts are returned
        print("📝 Test 2: GET /api/auth/me returns prompts field")
        response = self.make_request("GET", "/auth/me", user_name="alice_prompts")
        if response and response.status_code == 200:
            user_data = response.json()
            if "prompts" in user_data and len(user_data["prompts"]) == 2:
                print("✅ GET /api/auth/me returns prompts field correctly")
                print(f"   Prompts: {user_data['prompts']}")
            else:
                print("❌ GET /api/auth/me missing prompts field")
                return False
        else:
            print("❌ GET /api/auth/me failed")
            return False
        
        return True
    
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
            print("❌ Failed to set up bob's profile")
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
            
            if found_university and found_prompts:
                print("✅ Discover endpoint returns both university and prompts fields")
                return True
            else:
                print(f"❌ Missing fields - University: {found_university}, Prompts: {found_prompts}")
                return False
        else:
            print("❌ GET /api/matches/discover failed")
            return False
    
    async def test_hinge_style_swipe_endpoint(self):
        """Test the updated swipe endpoint with Hinge-style features"""
        print("\n🧪 Testing Hinge-style Swipe Endpoint...")
        
        # Create test users
        await self.create_test_user_session("charlie_swiper", "charlie.swiper@test.com")
        await self.create_test_user_session("diana_target", "diana.target@test.com")
        
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
        await self.make_request("PUT", "/profile", charlie_profile, "charlie_swiper")
        await self.make_request("PUT", "/profile", diana_profile, "diana_target")
        
        # Get Diana's user_id for swiping
        diana_response = await self.make_request("GET", "/auth/me", user_name="diana_target")
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
        
        response = await self.make_request("POST", "/matches/swipe", swipe_data, "charlie_swiper")
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
            else:
                print("❌ Hinge-style fields not properly stored")
                print(f"   Match data: {match_data}")
                return False
        else:
            print("❌ Hinge-style swipe failed")
            return False
        
        # Test 2: Swipe with like_type "photo"
        print("📝 Test 2: Swipe with like_type 'photo'")
        
        # Create another test user for photo like
        await self.create_test_user_session("eve_photo", "eve.photo@test.com")
        eve_profile = {
            "name": "Eve Photo",
            "university": "University of Oxford",
            "age": 22,
            "gender": "woman", 
            "interested_in": ["men"]
        }
        await self.make_request("PUT", "/profile", eve_profile, "eve_photo")
        
        eve_response = await self.make_request("GET", "/auth/me", user_name="eve_photo")
        eve_user_id = eve_response.json()["user_id"]
        
        photo_swipe_data = {
            "target_user_id": eve_user_id,
            "action": "like",
            "like_type": "photo",
            "like_content": "Profile photo #1",
            "comment": "Great smile! 😊"
        }
        
        response = await self.make_request("POST", "/matches/swipe", photo_swipe_data, "charlie_swiper")
        if response and response.status_code == 200:
            swipe_result = response.json()
            match_data = swipe_result.get("match")
            
            if (match_data and 
                match_data.get("like_type") == "photo" and
                match_data.get("comment") == "Great smile! 😊"):
                print("✅ Photo like with comment stored correctly")
            else:
                print("❌ Photo like fields not properly stored")
                return False
        else:
            print("❌ Photo like swipe failed")
            return False
        
        # Test 3: Regular profile like (backward compatibility)
        print("📝 Test 3: Regular profile like (backward compatibility)")
        
        await self.create_test_user_session("frank_regular", "frank.regular@test.com")
        frank_profile = {
            "name": "Frank Regular",
            "university": "University of Oxford",
            "age": 23,
            "gender": "man",
            "interested_in": ["women"]
        }
        await self.make_request("PUT", "/profile", frank_profile, "frank_regular")
        
        frank_response = await self.make_request("GET", "/auth/me", user_name="frank_regular")
        frank_user_id = frank_response.json()["user_id"]
        
        regular_swipe_data = {
            "target_user_id": frank_user_id,
            "action": "like"
            # No like_type, like_content, or comment - should default to "profile"
        }
        
        response = await self.make_request("POST", "/matches/swipe", regular_swipe_data, "diana_target")
        if response and response.status_code == 200:
            swipe_result = response.json()
            match_data = swipe_result.get("match")
            
            # Should default to "profile" type
            if match_data and match_data.get("like_type") == "profile":
                print("✅ Regular like defaults to 'profile' type correctly")
            else:
                print("❌ Regular like not handling defaults properly")
                return False
        else:
            print("❌ Regular like swipe failed")
            return False
        
        return True
    
    async def test_new_like_notifications(self):
        """Test new_like notification type before match"""
        print("\n🧪 Testing New Like Notifications...")
        
        # Create test users
        await self.create_test_user_session("grace_liker", "grace.liker@test.com")
        await self.create_test_user_session("henry_liked", "henry.liked@test.com")
        
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
        
        await self.make_request("PUT", "/profile", grace_profile, "grace_liker")
        await self.make_request("PUT", "/profile", henry_profile, "henry_liked")
        
        # Get Henry's user_id
        henry_response = await self.make_request("GET", "/auth/me", user_name="henry_liked")
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
        
        response = await self.make_request("POST", "/matches/swipe", swipe_data, "grace_liker")
        if not response or response.status_code != 200:
            print("❌ Failed to send like")
            return False
        
        print("✅ Like sent successfully")
        
        # Check Henry's notifications for new_like notification
        print("📝 Test 2: Check for 'new_like' notification")
        
        # Wait a moment for notification to be processed
        await asyncio.sleep(1)
        
        response = await self.make_request("GET", "/notifications", user_name="henry_liked")
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
                print(f"   Data: {new_like_notification.get('data')}")
                
                # Verify notification contains expected information
                data = new_like_notification.get("data", {})
                if (data.get("from_user_name") == "Grace Liker" and
                    data.get("like_type") == "prompt" and
                    data.get("comment") == "This is exactly what the world needs more of! 😄"):
                    print("✅ Notification contains correct like details")
                else:
                    print("❌ Notification missing expected like details")
                    return False
            else:
                print("❌ 'new_like' notification not found")
                print(f"   Available notifications: {[n.get('notification_type') for n in notifications]}")
                return False
        else:
            print("❌ Failed to get notifications")
            return False
        
        # Test 3: Photo like notification
        print("📝 Test 3: Photo like should create appropriate notification message")
        
        await self.create_test_user_session("iris_photo_liker", "iris.photo@test.com")
        iris_profile = {
            "name": "Iris Photo Liker",
            "university": "King's College London",
            "age": 19,
            "gender": "woman",
            "interested_in": ["men"]
        }
        await self.make_request("PUT", "/profile", iris_profile, "iris_photo_liker")
        
        photo_like_data = {
            "target_user_id": henry_user_id,
            "action": "like",
            "like_type": "photo",
            "like_content": "Main profile photo",
            "comment": "Love this candid shot!"
        }
        
        response = await self.make_request("POST", "/matches/swipe", photo_like_data, "iris_photo_liker")
        if response and response.status_code == 200:
            print("✅ Photo like sent successfully")
            
            # Check for photo-specific notification message
            await asyncio.sleep(1)
            response = await self.make_request("GET", "/notifications", user_name="henry_liked")
            if response and response.status_code == 200:
                notifications = response.json()
                
                # Find the most recent new_like notification
                photo_notification = None
                for notif in sorted(notifications, key=lambda x: x.get("created_at", ""), reverse=True):
                    if (notif.get("notification_type") == "new_like" and 
                        notif.get("data", {}).get("from_user_name") == "Iris Photo Liker"):
                        photo_notification = notif
                        break
                
                if photo_notification and "photo" in photo_notification.get("body", "").lower():
                    print("✅ Photo like notification has correct message format")
                    print(f"   Message: {photo_notification.get('body')}")
                else:
                    print("❌ Photo like notification message incorrect")
                    return False
        else:
            print("❌ Photo like failed")
            return False
        
        return True
    
    async def test_complete_like_with_comment_flow(self):
        """Test the complete flow: like with comment -> notification -> potential match"""
        print("\n🧪 Testing Complete Like-with-Comment Flow...")
        
        # Create test users
        await self.create_test_user_session("jack_complete", "jack.complete@test.com")
        await self.create_test_user_session("kate_complete", "kate.complete@test.com")
        
        # Set up profiles
        jack_profile = {
            "name": "Jack Complete",
            "university": "University College London",
            "age": 22,
            "gender": "man",
            "interested_in": ["women"],
            "prompts": [
                {"question": "What's your go-to karaoke song?", "answer": "Don't Stop Believin' by Journey"}
            ]
        }
        
        kate_profile = {
            "name": "Kate Complete", 
            "university": "University College London",
            "age": 21,
            "gender": "woman",
            "interested_in": ["men"],
            "prompts": [
                {"question": "What's your hidden talent?", "answer": "I can solve a Rubik's cube in under 2 minutes"}
            ]
        }
        
        await self.make_request("PUT", "/profile", jack_profile, "jack_complete")
        await self.make_request("PUT", "/profile", kate_profile, "kate_complete")
        
        # Get user IDs
        jack_response = await self.make_request("GET", "/auth/me", user_name="jack_complete")
        kate_response = await self.make_request("GET", "/auth/me", user_name="kate_complete")
        
        jack_user_id = jack_response.json()["user_id"]
        kate_user_id = kate_response.json()["user_id"]
        
        # Step 1: Jack likes Kate's prompt with comment
        print("📝 Step 1: Jack likes Kate's prompt with comment")
        jack_like_data = {
            "target_user_id": kate_user_id,
            "action": "like",
            "like_type": "prompt",
            "like_content": "I can solve a Rubik's cube in under 2 minutes",
            "comment": "That's amazing! I can barely solve one side 😅"
        }
        
        response = await self.make_request("POST", "/matches/swipe", jack_like_data, "jack_complete")
        if not response or response.status_code != 200:
            print("❌ Jack's like failed")
            return False
        
        print("✅ Jack's like sent successfully")
        
        # Step 2: Verify Kate receives new_like notification
        print("📝 Step 2: Verify Kate receives new_like notification")
        await asyncio.sleep(1)
        
        response = await self.make_request("GET", "/notifications", user_name="kate_complete")
        if response and response.status_code == 200:
            notifications = response.json()
            new_like_found = any(n.get("notification_type") == "new_like" for n in notifications)
            
            if new_like_found:
                print("✅ Kate received new_like notification")
            else:
                print("❌ Kate did not receive new_like notification")
                return False
        else:
            print("❌ Failed to get Kate's notifications")
            return False
        
        # Step 3: Kate likes Jack back (should create mutual match)
        print("📝 Step 3: Kate likes Jack back to create mutual match")
        kate_like_data = {
            "target_user_id": jack_user_id,
            "action": "like",
            "like_type": "prompt", 
            "like_content": "Don't Stop Believin' by Journey",
            "comment": "Classic choice! We should duet sometime 🎤"
        }
        
        response = await self.make_request("POST", "/matches/swipe", kate_like_data, "kate_complete")
        if response and response.status_code == 200:
            swipe_result = response.json()
            
            if swipe_result.get("is_mutual"):
                print("✅ Mutual match created successfully")
                print(f"   Matched user: {swipe_result.get('matched_user', {}).get('name')}")
            else:
                print("❌ Mutual match not detected")
                return False
        else:
            print("❌ Kate's like back failed")
            return False
        
        # Step 4: Verify both users receive new_match notifications
        print("📝 Step 4: Verify both users receive new_match notifications")
        await asyncio.sleep(1)
        
        # Check Jack's notifications
        jack_notifs = await self.make_request("GET", "/notifications", user_name="jack_complete")
        kate_notifs = await self.make_request("GET", "/notifications", user_name="kate_complete")
        
        if jack_notifs and kate_notifs:
            jack_notifications = jack_notifs.json()
            kate_notifications = kate_notifs.json()
            
            jack_match_notif = any(n.get("notification_type") == "new_match" for n in jack_notifications)
            kate_match_notif = any(n.get("notification_type") == "new_match" for n in kate_notifications)
            
            if jack_match_notif and kate_match_notif:
                print("✅ Both users received new_match notifications")
            else:
                print(f"❌ Match notifications missing - Jack: {jack_match_notif}, Kate: {kate_match_notif}")
                return False
        else:
            print("❌ Failed to get match notifications")
            return False
        
        # Step 5: Verify they appear in each other's accepted matches
        print("📝 Step 5: Verify accepted matches list")
        
        jack_matches = await self.make_request("GET", "/matches/accepted", user_name="jack_complete")
        kate_matches = await self.make_request("GET", "/matches/accepted", user_name="kate_complete")
        
        if jack_matches and kate_matches:
            jack_match_list = jack_matches.json()
            kate_match_list = kate_matches.json()
            
            jack_found_kate = any(m.get("user", {}).get("name") == "Kate Complete" for m in jack_match_list)
            kate_found_jack = any(m.get("user", {}).get("name") == "Jack Complete" for m in kate_match_list)
            
            if jack_found_kate and kate_found_jack:
                print("✅ Both users appear in each other's accepted matches")
            else:
                print(f"❌ Accepted matches incomplete - Jack sees Kate: {jack_found_kate}, Kate sees Jack: {kate_found_jack}")
                return False
        else:
            print("❌ Failed to get accepted matches")
            return False
        
        print("✅ Complete like-with-comment flow working perfectly!")
        return True

async def main():
    """Run all Hinge-style matching interface tests"""
    print("🚀 Starting Educare Backend API Tests - Hinge-style Matching Interface")
    print("=" * 80)
    
    tester = EducareAPITester()
    
    try:
        # Test results tracking
        test_results = {}
        
        # Test 1: Profile prompts field support
        test_results["profile_prompts"] = await tester.test_profile_prompts_field()
        
        # Test 2: Discover endpoint returns university and prompts
        test_results["discover_fields"] = await tester.test_discover_university_and_prompts()
        
        # Test 3: Hinge-style swipe endpoint with new fields
        test_results["hinge_swipe"] = await tester.test_hinge_style_swipe_endpoint()
        
        # Test 4: New like notifications
        test_results["new_like_notifications"] = await tester.test_new_like_notifications()
        
        # Test 5: Complete flow test
        test_results["complete_flow"] = await tester.test_complete_like_with_comment_flow()
        
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
    finally:
        await tester.close()

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)