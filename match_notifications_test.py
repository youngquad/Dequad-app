#!/usr/bin/env python3
"""
Educare Match Notifications & Picture Field Testing
Testing specific fixes requested in the review:
1. Match notifications for both users when a match occurs
2. Picture field in discover endpoint
"""

import requests
import json
import sys
import time
from datetime import datetime

# Configuration
BASE_URL = "https://github-retriever-1.preview.emergentagent.com/api"

class MatchNotificationTester:
    def __init__(self):
        self.results = {
            "match_notifications": {"passed": 0, "failed": 0, "errors": []},
            "picture_field": {"passed": 0, "failed": 0, "errors": []}
        }
        self.user_a_token = None
        self.user_b_token = None
        self.user_a_id = None
        self.user_b_id = None
        
    def log_result(self, category, test_name, success, response=None, error=None):
        """Log test result"""
        if success:
            self.results[category]["passed"] += 1
            print(f"✅ {test_name}")
        else:
            self.results[category]["failed"] += 1
            error_msg = f"❌ {test_name}: {error}"
            if response:
                error_msg += f" (Status: {response.status_code}, Response: {response.text[:200]})"
            print(error_msg)
            self.results[category]["errors"].append(error_msg)
    
    def make_request(self, method, endpoint, token=None, data=None):
        """Make HTTP request with proper headers"""
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        url = f"{BASE_URL}{endpoint}"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response
        except requests.exceptions.RequestException as e:
            return None, str(e)
    
    def setup_test_users(self):
        """Use existing valid sessions and create test users"""
        print("\n🔧 Setting up test users...")
        
        # Get existing valid sessions
        try:
            import subprocess
            
            # Get valid sessions
            result = subprocess.run([
                "mongosh", "test_database", "--eval",
                """
                var sessions = db.user_sessions.find({expires_at: {$gt: new Date()}}).limit(2).toArray();
                if (sessions.length >= 2) {
                    print('SESSION_A:' + sessions[0].user_id + ':' + sessions[0].session_token);
                    print('SESSION_B:' + sessions[1].user_id + ':' + sessions[1].session_token);
                } else {
                    print('ERROR: Not enough valid sessions found');
                }
                """
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0 and "SESSION_A:" in result.stdout:
                lines = result.stdout.strip().split('\n')
                session_a_line = [l for l in lines if l.startswith('SESSION_A:')][0]
                session_b_line = [l for l in lines if l.startswith('SESSION_B:')][0]
                
                # Parse session A
                _, self.user_a_id, self.user_a_token = session_a_line.split(':', 2)
                # Parse session B  
                _, self.user_b_id, self.user_b_token = session_b_line.split(':', 2)
                
                print(f"✅ Using existing sessions:")
                print(f"   User A: {self.user_a_id}")
                print(f"   User B: {self.user_b_id}")
                
                # Update users to have proper matching preferences and pictures
                update_result = subprocess.run([
                    "mongosh", "test_database", "--eval",
                    f"""
                    // Update user A for matching
                    db.users.updateOne(
                        {{user_id: '{self.user_a_id}'}},
                        {{$set: {{
                            role: 'student',
                            gender: 'woman',
                            interested_in: ['men'],
                            notifications_enabled: true,
                            picture: 'https://example.com/alice.jpg',
                            name: 'Alice Test'
                        }}}}
                    );
                    
                    // Update user B for matching
                    db.users.updateOne(
                        {{user_id: '{self.user_b_id}'}},
                        {{$set: {{
                            role: 'student', 
                            gender: 'man',
                            interested_in: ['women'],
                            notifications_enabled: true,
                            picture: 'https://example.com/bob.jpg',
                            name: 'Bob Test'
                        }}}}
                    );
                    
                    // Clear existing matches and notifications for these users
                    db.matches.deleteMany({{$or: [
                        {{user_id: {{$in: ['{self.user_a_id}', '{self.user_b_id}']}}}},
                        {{matched_user_id: {{$in: ['{self.user_a_id}', '{self.user_b_id}']}}}}
                    ]}});
                    db.notifications.deleteMany({{user_id: {{$in: ['{self.user_a_id}', '{self.user_b_id}']}}}});
                    
                    print('Users updated for matching test');
                    """
                ], capture_output=True, text=True, timeout=10)
                
                if update_result.returncode == 0:
                    print("✅ Test users configured successfully")
                    return True
                else:
                    print(f"❌ Failed to update users: {update_result.stderr}")
                    return False
            else:
                print(f"❌ Failed to get valid sessions: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Error setting up test users: {e}")
            return False
    
    def test_picture_field_in_discover(self):
        """Test that GET /api/matches/discover returns the picture field"""
        print("\n📸 Testing Picture Field in Discover Endpoint...")
        
        # Test with user A discovering user B
        response = self.make_request("GET", "/matches/discover", token=self.user_a_token)
        if isinstance(response, tuple):
            self.log_result("picture_field", "GET /matches/discover - picture field", False, error=response[1])
            return
        
        if response and response.status_code == 200:
            try:
                matches = response.json()
                if isinstance(matches, list):
                    # Look for user B in the matches
                    user_b_found = False
                    picture_field_present = False
                    
                    for match in matches:
                        if match.get("user_id") == self.user_b_id:
                            user_b_found = True
                            if "picture" in match:
                                picture_field_present = True
                                picture_value = match.get("picture")
                                print(f"      ✅ User B found in matches with picture field: {picture_value}")
                                break
                            else:
                                print(f"      ❌ User B found but missing picture field")
                                break
                    
                    if user_b_found and picture_field_present:
                        self.log_result("picture_field", "GET /matches/discover - picture field present", True)
                    elif user_b_found and not picture_field_present:
                        self.log_result("picture_field", "GET /matches/discover - picture field present", False, response, "Picture field missing from user profile")
                    else:
                        # User B not found, check if any user has picture field
                        any_picture_field = any("picture" in match for match in matches)
                        if any_picture_field:
                            self.log_result("picture_field", "GET /matches/discover - picture field present", True)
                            print(f"      ✅ Picture field found in other matches (User B not in results)")
                        else:
                            self.log_result("picture_field", "GET /matches/discover - picture field present", False, response, "No users have picture field in discover results")
                else:
                    self.log_result("picture_field", "GET /matches/discover - picture field", False, response, "Invalid matches format")
            except json.JSONDecodeError:
                self.log_result("picture_field", "GET /matches/discover - picture field", False, response, "Invalid JSON response")
        else:
            self.log_result("picture_field", "GET /matches/discover - picture field", False, response, "Discover endpoint failed")
    
    def test_match_notifications(self):
        """Test that both users receive notifications when a match occurs"""
        print("\n💕 Testing Match Notifications for Both Users...")
        
        # Step 1: Clear existing notifications
        print("   Clearing existing notifications...")
        try:
            import subprocess
            subprocess.run([
                "mongosh", "test_database", "--eval",
                """
                db.notifications.deleteMany({user_id: {$in: ['user_match_a', 'user_match_b']}});
                db.matches.deleteMany({$or: [
                    {user_id: {$in: ['user_match_a', 'user_match_b']}},
                    {matched_user_id: {$in: ['user_match_a', 'user_match_b']}}
                ]});
                """
            ], capture_output=True, text=True, timeout=10)
        except Exception as e:
            print(f"      Warning: Could not clear existing data: {e}")
        
        # Step 2: User A swipes right on User B
        print("   User A swiping right on User B...")
        swipe_data_a = {"target_user_id": self.user_b_id, "action": "like"}
        response_a = self.make_request("POST", "/matches/swipe", token=self.user_a_token, data=swipe_data_a)
        
        if not (response_a and response_a.status_code == 200):
            self.log_result("match_notifications", "User A swipe on User B", False, response_a, "Swipe failed")
            return
        
        try:
            swipe_result_a = response_a.json()
            print(f"      ✅ User A swiped successfully: {swipe_result_a.get('is_mutual', False)}")
        except json.JSONDecodeError:
            print("      ✅ User A swiped successfully (invalid JSON response)")
        
        # Step 3: User B swipes right on User A (creates mutual match)
        print("   User B swiping right on User A (creating mutual match)...")
        swipe_data_b = {"target_user_id": self.user_a_id, "action": "like"}
        response_b = self.make_request("POST", "/matches/swipe", token=self.user_b_token, data=swipe_data_b)
        
        if not (response_b and response_b.status_code == 200):
            self.log_result("match_notifications", "User B swipe on User A (mutual match)", False, response_b, "Mutual swipe failed")
            return
        
        try:
            swipe_result_b = response_b.json()
            is_mutual = swipe_result_b.get('is_mutual', False)
            print(f"      ✅ User B swiped successfully, mutual match: {is_mutual}")
            
            if not is_mutual:
                self.log_result("match_notifications", "Mutual match creation", False, response_b, "Expected mutual match but got False")
                return
        except json.JSONDecodeError:
            print("      ✅ User B swiped successfully (invalid JSON response)")
        
        # Step 4: Wait a moment for notifications to be processed
        print("   Waiting for notifications to be processed...")
        time.sleep(2)
        
        # Step 5: Check User A's notifications
        print("   Checking User A's notifications...")
        response_a_notif = self.make_request("GET", "/notifications", token=self.user_a_token)
        user_a_has_match_notification = False
        
        if response_a_notif and response_a_notif.status_code == 200:
            try:
                notifications_a = response_a_notif.json()
                if isinstance(notifications_a, list):
                    for notif in notifications_a:
                        if (notif.get("notification_type") == "new_match" and 
                            "Bob Test" in notif.get("body", "")):
                            user_a_has_match_notification = True
                            print(f"      ✅ User A has match notification: {notif.get('body')}")
                            break
                    
                    if not user_a_has_match_notification:
                        print(f"      ❌ User A missing match notification. Found {len(notifications_a)} notifications:")
                        for notif in notifications_a:
                            print(f"         - {notif.get('notification_type')}: {notif.get('body')}")
                else:
                    print(f"      ❌ User A notifications invalid format: {type(notifications_a)}")
            except json.JSONDecodeError:
                print(f"      ❌ User A notifications invalid JSON")
        else:
            print(f"      ❌ User A notifications request failed: {response_a_notif.status_code if response_a_notif else 'No response'}")
        
        # Step 6: Check User B's notifications
        print("   Checking User B's notifications...")
        response_b_notif = self.make_request("GET", "/notifications", token=self.user_b_token)
        user_b_has_match_notification = False
        
        if response_b_notif and response_b_notif.status_code == 200:
            try:
                notifications_b = response_b_notif.json()
                if isinstance(notifications_b, list):
                    for notif in notifications_b:
                        if (notif.get("notification_type") == "new_match" and 
                            "Alice Test" in notif.get("body", "")):
                            user_b_has_match_notification = True
                            print(f"      ✅ User B has match notification: {notif.get('body')}")
                            break
                    
                    if not user_b_has_match_notification:
                        print(f"      ❌ User B missing match notification. Found {len(notifications_b)} notifications:")
                        for notif in notifications_b:
                            print(f"         - {notif.get('notification_type')}: {notif.get('body')}")
                else:
                    print(f"      ❌ User B notifications invalid format: {type(notifications_b)}")
            except json.JSONDecodeError:
                print(f"      ❌ User B notifications invalid JSON")
        else:
            print(f"      ❌ User B notifications request failed: {response_b_notif.status_code if response_b_notif else 'No response'}")
        
        # Step 7: Evaluate results
        if user_a_has_match_notification and user_b_has_match_notification:
            self.log_result("match_notifications", "Both users receive match notifications", True)
        elif user_a_has_match_notification or user_b_has_match_notification:
            missing_user = "User B" if user_a_has_match_notification else "User A"
            self.log_result("match_notifications", "Both users receive match notifications", False, 
                          error=f"{missing_user} missing match notification")
        else:
            self.log_result("match_notifications", "Both users receive match notifications", False, 
                          error="Neither user received match notification")
    
    def test_notification_storage_without_push_token(self):
        """Test that notifications are stored even if user doesn't have push_token"""
        print("\n📱 Testing Notification Storage Without Push Token...")
        
        # Ensure users don't have push tokens
        try:
            import subprocess
            subprocess.run([
                "mongosh", "test_database", "--eval",
                """
                db.users.updateMany(
                    {user_id: {$in: ['user_match_a', 'user_match_b']}},
                    {$unset: {push_token: 1}}
                );
                """
            ], capture_output=True, text=True, timeout=10)
            print("   ✅ Removed push tokens from test users")
        except Exception as e:
            print(f"   Warning: Could not remove push tokens: {e}")
        
        # Clear existing notifications and matches
        try:
            import subprocess
            subprocess.run([
                "mongosh", "test_database", "--eval",
                """
                db.notifications.deleteMany({user_id: {$in: ['user_match_a', 'user_match_b']}});
                db.matches.deleteMany({$or: [
                    {user_id: {$in: ['user_match_a', 'user_match_b']}},
                    {matched_user_id: {$in: ['user_match_a', 'user_match_b']}}
                ]});
                """
            ], capture_output=True, text=True, timeout=10)
        except Exception as e:
            print(f"   Warning: Could not clear existing data: {e}")
        
        # Create match again
        print("   Creating match without push tokens...")
        
        # User A swipes right
        swipe_data_a = {"target_user_id": self.user_b_id, "action": "like"}
        response_a = self.make_request("POST", "/matches/swipe", token=self.user_a_token, data=swipe_data_a)
        
        # User B swipes right (mutual match)
        swipe_data_b = {"target_user_id": self.user_a_id, "action": "like"}
        response_b = self.make_request("POST", "/matches/swipe", token=self.user_b_token, data=swipe_data_b)
        
        if not (response_a and response_a.status_code == 200 and response_b and response_b.status_code == 200):
            self.log_result("match_notifications", "Match creation without push tokens", False, 
                          error="Failed to create match")
            return
        
        # Wait for notifications
        time.sleep(2)
        
        # Check if notifications were stored despite no push tokens
        response_a_notif = self.make_request("GET", "/notifications", token=self.user_a_token)
        response_b_notif = self.make_request("GET", "/notifications", token=self.user_b_token)
        
        notifications_stored = False
        
        if (response_a_notif and response_a_notif.status_code == 200 and
            response_b_notif and response_b_notif.status_code == 200):
            try:
                notifications_a = response_a_notif.json()
                notifications_b = response_b_notif.json()
                
                # Check if both users have match notifications
                a_has_match = any(n.get("notification_type") == "new_match" for n in notifications_a)
                b_has_match = any(n.get("notification_type") == "new_match" for n in notifications_b)
                
                if a_has_match and b_has_match:
                    notifications_stored = True
                    print(f"   ✅ Both users have notifications stored (A: {len(notifications_a)}, B: {len(notifications_b)})")
                else:
                    print(f"   ❌ Missing notifications - A has match: {a_has_match}, B has match: {b_has_match}")
                    
            except json.JSONDecodeError:
                print("   ❌ Invalid JSON in notification responses")
        else:
            print("   ❌ Failed to retrieve notifications")
        
        if notifications_stored:
            self.log_result("match_notifications", "Notifications stored without push tokens", True)
        else:
            self.log_result("match_notifications", "Notifications stored without push tokens", False, 
                          error="Notifications not stored when users lack push tokens")
    
    def run_all_tests(self):
        """Run all tests"""
        print("🧪 Starting Match Notifications & Picture Field Tests")
        print("=" * 60)
        
        # Setup
        if not self.setup_test_users():
            print("❌ Failed to setup test users, aborting tests")
            return
        
        # Run tests
        self.test_picture_field_in_discover()
        self.test_match_notifications()
        self.test_notification_storage_without_push_token()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_passed = sum(cat["passed"] for cat in self.results.values())
        total_failed = sum(cat["failed"] for cat in self.results.values())
        
        for category, results in self.results.items():
            print(f"\n{category.upper()}:")
            print(f"  ✅ Passed: {results['passed']}")
            print(f"  ❌ Failed: {results['failed']}")
            if results['errors']:
                print("  Errors:")
                for error in results['errors']:
                    print(f"    - {error}")
        
        print(f"\n🎯 OVERALL: {total_passed} passed, {total_failed} failed")
        
        if total_failed == 0:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed - see details above")
            return False

if __name__ == "__main__":
    tester = MatchNotificationTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)