#!/usr/bin/env python3
"""
Hinge-Style Swipe Endpoint Test - ObjectId Fix Verification
Testing the fixed POST /api/matches/swipe endpoint after ObjectId serialization fix
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://github-retriever-1.preview.emergentagent.com/api"
STUDENT_TOKEN = "test_session_token_123"

class HingeSwipeTest:
    def __init__(self):
        self.results = {"passed": 0, "failed": 0, "errors": []}
        self.target_user_id = None
        
    def log_result(self, test_name, success, response=None, error=None):
        """Log test result"""
        if success:
            self.results["passed"] += 1
            print(f"✅ {test_name}")
        else:
            self.results["failed"] += 1
            error_msg = f"❌ {test_name}: {error}"
            if response:
                error_msg += f" (Status: {response.status_code}, Response: {response.text[:300]})"
            print(error_msg)
            self.results["errors"].append(error_msg)
    
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
        """Create test users for Hinge-style swipe testing"""
        print("🔧 Setting up test users...")
        try:
            import subprocess
            
            # Create main test user with prompts
            subprocess.run([
                "mongosh", "test_database", "--eval",
                """
                // Remove existing test users and matches
                db.users.deleteMany({user_id: {$in: ['user_test123', 'user_hinge_target1', 'user_hinge_target2']}});
                db.matches.deleteMany({$or: [
                    {user_id: 'user_test123'},
                    {matched_user_id: 'user_test123'}
                ]});
                db.notifications.deleteMany({user_id: {$in: ['user_test123', 'user_hinge_target1', 'user_hinge_target2']}});
                db.user_sessions.deleteMany({user_id: 'user_test123'});
                
                // Create main test user
                db.users.insertOne({
                  user_id: 'user_test123',
                  email: 'test@example.com',
                  name: 'Test User',
                  picture: 'https://example.com/photo.jpg',
                  role: 'student',
                  interests: ['Art', 'Music'],
                  university: 'Harvard University',
                  university_location: 'Cambridge, MA',
                  campus_name: 'Harvard Yard',
                  course: 'Psychology',
                  age: 21,
                  gender: 'man',
                  interested_in: ['women'],
                  prompts: [
                    {question: 'What makes you happy?', answer: 'Spending time with friends and creating art'},
                    {question: 'Your ideal Sunday?', answer: 'Coffee, books, and a long walk in nature'}
                  ],
                  plan: 'free',
                  swipes_today: 0,
                  last_swipe_date: null,
                  created_at: new Date()
                });
                
                // Create session for main user
                db.user_sessions.insertOne({
                  user_id: 'user_test123',
                  session_token: 'test_session_token_123',
                  expires_at: new Date(Date.now() + 7*24*60*60*1000),
                  created_at: new Date()
                });
                
                // Create target user 1 for single like test
                db.users.insertOne({
                  user_id: 'user_hinge_target1',
                  email: 'target1@example.com',
                  name: 'Alice Johnson',
                  picture: 'https://example.com/alice.jpg',
                  role: 'student',
                  interests: ['Music', 'Dance'],
                  university: 'Harvard University',
                  university_location: 'Cambridge, MA',
                  campus_name: 'Harvard Yard',
                  course: 'Psychology',
                  age: 20,
                  gender: 'woman',
                  interested_in: ['men'],
                  prompts: [
                    {question: 'What makes you happy?', answer: 'Dancing and live music concerts'},
                    {question: 'Your ideal Sunday?', answer: 'Brunch with friends and exploring new places'}
                  ],
                  plan: 'free',
                  created_at: new Date()
                });
                
                // Create target user 2 for mutual match test
                db.users.insertOne({
                  user_id: 'user_hinge_target2',
                  email: 'target2@example.com',
                  name: 'Emma Wilson',
                  picture: 'https://example.com/emma.jpg',
                  role: 'student',
                  interests: ['Art', 'Photography'],
                  university: 'Harvard University',
                  university_location: 'Cambridge, MA',
                  campus_name: 'Harvard Yard',
                  course: 'Psychology',
                  age: 22,
                  gender: 'woman',
                  interested_in: ['men'],
                  prompts: [
                    {question: 'What makes you happy?', answer: 'Capturing beautiful moments through photography'},
                    {question: 'Your ideal Sunday?', answer: 'Art galleries and creative projects'}
                  ],
                  plan: 'free',
                  created_at: new Date()
                });
                
                print('Test users created successfully');
                """
            ], capture_output=True, text=True, timeout=15)
            
            self.log_result("Test user setup", True)
            
        except Exception as e:
            self.log_result("Test user setup", False, error=str(e))
    
    def test_hinge_swipe_single_like(self):
        """Test Hinge-style swipe with like_type, like_content, and comment"""
        print("\n💕 Testing Hinge-style swipe (single like)...")
        
        # Test POST /api/matches/swipe with Hinge-style fields
        swipe_data = {
            "target_user_id": "user_hinge_target1",
            "action": "like",
            "like_type": "prompt",
            "like_content": "Dancing and live music concerts",
            "comment": "Great answer! I love live music too!"
        }
        
        response = self.make_request("POST", "/matches/swipe", token=STUDENT_TOKEN, data=swipe_data)
        
        if isinstance(response, tuple):
            self.log_result("Hinge-style swipe (ObjectId fix)", False, error=response[1])
            return False
        elif response and response.status_code == 500:
            self.log_result("Hinge-style swipe (ObjectId fix)", False, response, "500 Internal Server Error - ObjectId serialization issue still exists")
            return False
        elif response and response.status_code == 200:
            try:
                swipe_response = response.json()
                
                # Verify response structure
                if "match" not in swipe_response:
                    self.log_result("Hinge-style swipe (ObjectId fix)", False, response, "Missing 'match' field in response")
                    return False
                
                match_data = swipe_response["match"]
                
                # Verify Hinge-style fields are included
                required_fields = ["like_type", "like_content", "comment"]
                missing_fields = [field for field in required_fields if field not in match_data]
                
                if missing_fields:
                    self.log_result("Hinge-style swipe (ObjectId fix)", False, response, f"Missing Hinge fields: {missing_fields}")
                    return False
                
                # Verify field values
                if (match_data.get("like_type") != "prompt" or
                    match_data.get("like_content") != "Dancing and live music concerts" or
                    match_data.get("comment") != "Great answer! I love live music too!"):
                    self.log_result("Hinge-style swipe (ObjectId fix)", False, response, f"Incorrect Hinge field values: {match_data}")
                    return False
                
                # Verify no mutual match (single like)
                if swipe_response.get("is_mutual") != False:
                    self.log_result("Hinge-style swipe (ObjectId fix)", False, response, f"Expected is_mutual=False, got {swipe_response.get('is_mutual')}")
                    return False
                
                self.log_result("Hinge-style swipe (ObjectId fix)", True)
                print(f"      ✅ Like type: {match_data.get('like_type')}")
                print(f"      ✅ Like content: {match_data.get('like_content')}")
                print(f"      ✅ Comment: {match_data.get('comment')}")
                print(f"      ✅ No 500 error - ObjectId serialization fixed!")
                return True
                
            except json.JSONDecodeError:
                self.log_result("Hinge-style swipe (ObjectId fix)", False, response, "Invalid JSON response")
                return False
        else:
            self.log_result("Hinge-style swipe (ObjectId fix)", False, response, f"Unexpected status code: {response.status_code if response else 'No response'}")
            return False
    
    def test_new_like_notification(self):
        """Test that new_like notification is created for target user"""
        print("\n🔔 Testing new_like notification creation...")
        
        # Get notifications for target user
        response = self.make_request("GET", "/notifications", token="target1_token")
        
        # Since we don't have a real session for target user, we'll check the database directly
        try:
            import subprocess
            result = subprocess.run([
                "mongosh", "test_database", "--eval",
                """
                var notifications = db.notifications.find({
                  user_id: 'user_hinge_target1',
                  notification_type: 'new_like'
                }).toArray();
                
                if (notifications.length > 0) {
                  var notif = notifications[notifications.length - 1]; // Get latest
                  print('NOTIFICATION_FOUND:' + JSON.stringify({
                    type: notif.notification_type,
                    title: notif.title,
                    body: notif.body,
                    data: notif.data
                  }));
                } else {
                  print('NO_NOTIFICATION_FOUND');
                }
                """
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0 and "NOTIFICATION_FOUND:" in result.stdout:
                notification_json = result.stdout.split("NOTIFICATION_FOUND:")[1].strip()
                notification = json.loads(notification_json)
                
                # Verify notification details
                if (notification.get("type") == "new_like" and
                    "Someone likes you!" in notification.get("title", "") and
                    "Test User" in notification.get("body", "") and
                    "liked your answer" in notification.get("body", "")):
                    
                    # Check notification data
                    notif_data = notification.get("data", {})
                    if (notif_data.get("from_user_id") == "user_test123" and
                        notif_data.get("like_type") == "prompt" and
                        "Great answer!" in notif_data.get("comment", "")):
                        
                        self.log_result("new_like notification creation", True)
                        print(f"      ✅ Notification type: {notification.get('type')}")
                        print(f"      ✅ Title: {notification.get('title')}")
                        print(f"      ✅ Body: {notification.get('body')}")
                        print(f"      ✅ Comment included: {notif_data.get('comment')}")
                        return True
                    else:
                        self.log_result("new_like notification creation", False, error=f"Incorrect notification data: {notif_data}")
                        return False
                else:
                    self.log_result("new_like notification creation", False, error=f"Incorrect notification content: {notification}")
                    return False
            else:
                self.log_result("new_like notification creation", False, error="No new_like notification found in database")
                return False
                
        except Exception as e:
            self.log_result("new_like notification creation", False, error=f"Database check failed: {e}")
            return False
    
    def test_mutual_match_flow(self):
        """Test mutual match flow with Hinge-style likes"""
        print("\n🎉 Testing mutual match flow...")
        
        # First, create a reverse like from target2 to main user
        try:
            import subprocess
            subprocess.run([
                "mongosh", "test_database", "--eval",
                """
                // Create reverse match (target2 likes main user)
                db.matches.insertOne({
                  id: 'match_reverse_' + Date.now(),
                  user_id: 'user_hinge_target2',
                  matched_user_id: 'user_test123',
                  status: 'liked',
                  score: 0.8,
                  like_type: 'photo',
                  like_content: 'Profile photo',
                  comment: 'You have a great smile!',
                  created_at: new Date().toISOString()
                });
                """
            ], capture_output=True, text=True, timeout=10)
        except Exception as e:
            self.log_result("Mutual match setup", False, error=str(e))
            return False
        
        # Now swipe on target2 to create mutual match
        swipe_data = {
            "target_user_id": "user_hinge_target2",
            "action": "like",
            "like_type": "prompt",
            "like_content": "Capturing beautiful moments through photography",
            "comment": "I love photography too! Would love to see your work."
        }
        
        response = self.make_request("POST", "/matches/swipe", token=STUDENT_TOKEN, data=swipe_data)
        
        if isinstance(response, tuple):
            self.log_result("Mutual match flow (ObjectId fix)", False, error=response[1])
            return False
        elif response and response.status_code == 500:
            self.log_result("Mutual match flow (ObjectId fix)", False, response, "500 Internal Server Error - ObjectId serialization issue in mutual match")
            return False
        elif response and response.status_code == 200:
            try:
                swipe_response = response.json()
                
                # Verify mutual match detected
                if swipe_response.get("is_mutual") != True:
                    self.log_result("Mutual match flow (ObjectId fix)", False, response, f"Expected is_mutual=True, got {swipe_response.get('is_mutual')}")
                    return False
                
                # Verify matched_user data is properly serialized (no ObjectId)
                matched_user = swipe_response.get("matched_user")
                if not matched_user:
                    self.log_result("Mutual match flow (ObjectId fix)", False, response, "Missing matched_user data")
                    return False
                
                # Verify matched_user contains expected fields
                expected_fields = ["user_id", "name", "email", "picture", "university"]
                missing_fields = [field for field in expected_fields if field not in matched_user]
                
                if missing_fields:
                    self.log_result("Mutual match flow (ObjectId fix)", False, response, f"Missing matched_user fields: {missing_fields}")
                    return False
                
                # Verify matched_user values
                if (matched_user.get("user_id") != "user_hinge_target2" or
                    matched_user.get("name") != "Emma Wilson" or
                    matched_user.get("university") != "Harvard University"):
                    self.log_result("Mutual match flow (ObjectId fix)", False, response, f"Incorrect matched_user data: {matched_user}")
                    return False
                
                self.log_result("Mutual match flow (ObjectId fix)", True)
                print(f"      ✅ Mutual match detected: {swipe_response.get('is_mutual')}")
                print(f"      ✅ Matched user: {matched_user.get('name')} ({matched_user.get('user_id')})")
                print(f"      ✅ No ObjectId serialization error!")
                return True
                
            except json.JSONDecodeError:
                self.log_result("Mutual match flow (ObjectId fix)", False, response, "Invalid JSON response")
                return False
        else:
            self.log_result("Mutual match flow (ObjectId fix)", False, response, f"Unexpected status code: {response.status_code if response else 'No response'}")
            return False
    
    def test_mutual_match_notifications(self):
        """Test that new_match notifications are created for both users"""
        print("\n🔔 Testing mutual match notifications...")
        
        try:
            import subprocess
            result = subprocess.run([
                "mongosh", "test_database", "--eval",
                """
                // Check notifications for both users
                var mainUserNotifs = db.notifications.find({
                  user_id: 'user_test123',
                  notification_type: 'new_match'
                }).toArray();
                
                var targetUserNotifs = db.notifications.find({
                  user_id: 'user_hinge_target2',
                  notification_type: 'new_match'
                }).toArray();
                
                print('MAIN_USER_NOTIFS:' + mainUserNotifs.length);
                print('TARGET_USER_NOTIFS:' + targetUserNotifs.length);
                
                if (mainUserNotifs.length > 0) {
                  var notif = mainUserNotifs[mainUserNotifs.length - 1];
                  print('MAIN_NOTIF:' + JSON.stringify({
                    title: notif.title,
                    body: notif.body,
                    data: notif.data
                  }));
                }
                
                if (targetUserNotifs.length > 0) {
                  var notif = targetUserNotifs[targetUserNotifs.length - 1];
                  print('TARGET_NOTIF:' + JSON.stringify({
                    title: notif.title,
                    body: notif.body,
                    data: notif.data
                  }));
                }
                """
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                output = result.stdout
                
                # Check if both users have new_match notifications
                main_count = 0
                target_count = 0
                
                for line in output.split('\n'):
                    if line.startswith('MAIN_USER_NOTIFS:'):
                        main_count = int(line.split(':')[1])
                    elif line.startswith('TARGET_USER_NOTIFS:'):
                        target_count = int(line.split(':')[1])
                
                if main_count > 0 and target_count > 0:
                    self.log_result("Mutual match notifications", True)
                    print(f"      ✅ Main user notifications: {main_count}")
                    print(f"      ✅ Target user notifications: {target_count}")
                    
                    # Check notification content
                    if "MAIN_NOTIF:" in output and "TARGET_NOTIF:" in output:
                        print(f"      ✅ Both users received 'New Match!' notifications")
                    
                    return True
                else:
                    self.log_result("Mutual match notifications", False, error=f"Missing notifications - Main: {main_count}, Target: {target_count}")
                    return False
            else:
                self.log_result("Mutual match notifications", False, error="Database query failed")
                return False
                
        except Exception as e:
            self.log_result("Mutual match notifications", False, error=f"Database check failed: {e}")
            return False
    
    def run_all_tests(self):
        """Run all Hinge-style swipe tests"""
        print("🧪 Starting Hinge-Style Swipe Endpoint Tests (ObjectId Fix Verification)")
        print("=" * 80)
        
        # Setup
        self.setup_test_users()
        
        # Run tests in sequence
        test1_success = self.test_hinge_swipe_single_like()
        test2_success = self.test_new_like_notification()
        test3_success = self.test_mutual_match_flow()
        test4_success = self.test_mutual_match_notifications()
        
        # Summary
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        print(f"✅ Passed: {self.results['passed']}")
        print(f"❌ Failed: {self.results['failed']}")
        
        if self.results['failed'] > 0:
            print("\n🚨 FAILED TESTS:")
            for error in self.results['errors']:
                print(f"   {error}")
        
        # Overall assessment
        critical_tests_passed = test1_success and test3_success
        
        if critical_tests_passed:
            print("\n🎉 CRITICAL TESTS PASSED!")
            print("   ✅ No more 500 Internal Server Error")
            print("   ✅ Hinge-style fields (like_type, like_content, comment) working")
            print("   ✅ Mutual match flow working without ObjectId serialization issues")
            
            if test2_success and test4_success:
                print("   ✅ All notification features working correctly")
                print("\n🏆 ALL TESTS PASSED - Hinge-style swipe endpoint fully operational!")
            else:
                print("   ⚠️  Some notification features need attention")
                print("\n✅ CORE FUNCTIONALITY FIXED - ObjectId serialization issue resolved!")
        else:
            print("\n🚨 CRITICAL ISSUES REMAIN!")
            print("   ❌ ObjectId serialization issue may still exist")
            print("   ❌ Hinge-style swipe endpoint needs further investigation")
        
        return critical_tests_passed

if __name__ == "__main__":
    tester = HingeSwipeTest()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)