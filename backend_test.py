#!/usr/bin/env python3
"""
Educare Backend API Testing Suite
Tests all backend APIs according to test_result.md requirements
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://mood-tracker-289.preview.emergentagent.com/api"
STUDENT_TOKEN = "test_session_token_123"
ADMIN_TOKEN = "admin_session_token_123"

class APITester:
    def __init__(self):
        self.results = {
            "auth": {"passed": 0, "failed": 0, "errors": []},
            "mood": {"passed": 0, "failed": 0, "errors": []},
            "feedback": {"passed": 0, "failed": 0, "errors": []},
            "profile": {"passed": 0, "failed": 0, "errors": []},
            "matching": {"passed": 0, "failed": 0, "errors": []},
            "chat": {"passed": 0, "failed": 0, "errors": []},
            "admin": {"passed": 0, "failed": 0, "errors": []}
        }
        self.match_id = None
        
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
    
    def test_auth_apis(self):
        """Test Authentication APIs"""
        print("\n🔐 Testing Authentication APIs...")
        
        # Test GET /api/auth/me
        response = self.make_request("GET", "/auth/me", token=STUDENT_TOKEN)
        if isinstance(response, tuple):
            self.log_result("auth", "GET /auth/me", False, error=response[1])
        elif response and response.status_code == 200:
            try:
                user_data = response.json()
                if user_data.get("user_id") == "user_test123":
                    self.log_result("auth", "GET /auth/me", True)
                else:
                    self.log_result("auth", "GET /auth/me", False, response, "Invalid user data returned")
            except json.JSONDecodeError:
                self.log_result("auth", "GET /auth/me", False, response, "Invalid JSON response")
        else:
            self.log_result("auth", "GET /auth/me", False, response, "Authentication failed")
        
        # Test POST /api/auth/logout (test with a separate token to avoid invalidating main session)
        # Create a temporary session for logout test
        self.create_temp_session()
        response = self.make_request("POST", "/auth/logout", token="temp_session_token_456")
        if isinstance(response, tuple):
            self.log_result("auth", "POST /auth/logout", False, error=response[1])
        elif response and response.status_code == 200:
            self.log_result("auth", "POST /auth/logout", True)
        else:
            self.log_result("auth", "POST /auth/logout", False, response, "Logout failed")
    
    def test_mood_apis(self):
        """Test Mood Tracking APIs"""
        print("\n😊 Testing Mood APIs...")
        
        # Test POST /api/mood
        mood_data = {"mood": 7, "notes": "Feeling good today"}
        response = self.make_request("POST", "/mood", token=STUDENT_TOKEN, data=mood_data)
        if isinstance(response, tuple):
            self.log_result("mood", "POST /mood", False, error=response[1])
        elif response and response.status_code == 200:
            try:
                mood_response = response.json()
                if mood_response.get("mood") == 7:
                    self.log_result("mood", "POST /mood", True)
                else:
                    self.log_result("mood", "POST /mood", False, response, "Invalid mood data returned")
            except json.JSONDecodeError:
                self.log_result("mood", "POST /mood", False, response, "Invalid JSON response")
        else:
            self.log_result("mood", "POST /mood", False, response, "Mood creation failed")
        
        # Test GET /api/mood
        response = self.make_request("GET", "/mood", token=STUDENT_TOKEN)
        if isinstance(response, tuple):
            self.log_result("mood", "GET /mood", False, error=response[1])
        elif response and response.status_code == 200:
            try:
                mood_history = response.json()
                if isinstance(mood_history, list):
                    self.log_result("mood", "GET /mood", True)
                else:
                    self.log_result("mood", "GET /mood", False, response, "Invalid mood history format")
            except json.JSONDecodeError:
                self.log_result("mood", "GET /mood", False, response, "Invalid JSON response")
        else:
            self.log_result("mood", "GET /mood", False, response, "Mood history retrieval failed")
    
    def test_feedback_apis(self):
        """Test Feedback & AI APIs"""
        print("\n🤖 Testing Feedback & AI APIs...")
        
        # Test POST /api/feedback
        feedback_data = {
            "mood": 5,
            "feedback": "The lecture was okay but I felt a bit stressed",
            "lecture_topic": "Psychology 101"
        }
        response = self.make_request("POST", "/feedback", token=STUDENT_TOKEN, data=feedback_data)
        if isinstance(response, tuple):
            self.log_result("feedback", "POST /feedback", False, error=response[1])
        elif response and response.status_code == 200:
            try:
                feedback_response = response.json()
                if (feedback_response.get("mood") == 5 and 
                    "risk_score" in feedback_response and 
                    "ai_analysis" in feedback_response):
                    self.log_result("feedback", "POST /feedback (AI Integration)", True)
                else:
                    self.log_result("feedback", "POST /feedback", False, response, "Missing AI analysis fields")
            except json.JSONDecodeError:
                self.log_result("feedback", "POST /feedback", False, response, "Invalid JSON response")
        else:
            self.log_result("feedback", "POST /feedback", False, response, "Feedback submission failed")
        
        # Test GET /api/feedback
        response = self.make_request("GET", "/feedback", token=STUDENT_TOKEN)
        if isinstance(response, tuple):
            self.log_result("feedback", "GET /feedback", False, error=response[1])
        elif response and response.status_code == 200:
            try:
                feedback_history = response.json()
                if isinstance(feedback_history, list):
                    self.log_result("feedback", "GET /feedback", True)
                else:
                    self.log_result("feedback", "GET /feedback", False, response, "Invalid feedback history format")
            except json.JSONDecodeError:
                self.log_result("feedback", "GET /feedback", False, response, "Invalid JSON response")
        else:
            self.log_result("feedback", "GET /feedback", False, response, "Feedback history retrieval failed")
    
    def test_profile_api(self):
        """Test Profile API"""
        print("\n👤 Testing Profile API...")
        
        # Test PUT /api/profile
        profile_data = {"interests": ["Art", "Music"], "university": "Harvard"}
        response = self.make_request("PUT", "/profile", token=STUDENT_TOKEN, data=profile_data)
        if isinstance(response, tuple):
            self.log_result("profile", "PUT /profile", False, error=response[1])
        elif response and response.status_code == 200:
            try:
                profile_response = response.json()
                if (profile_response.get("university") == "Harvard" and 
                    "Art" in profile_response.get("interests", [])):
                    self.log_result("profile", "PUT /profile", True)
                else:
                    self.log_result("profile", "PUT /profile", False, response, "Profile update not reflected")
            except json.JSONDecodeError:
                self.log_result("profile", "PUT /profile", False, response, "Invalid JSON response")
        else:
            self.log_result("profile", "PUT /profile", False, response, "Profile update failed")
    
    def test_matching_apis(self):
        """Test Student Matching APIs"""
        print("\n💕 Testing Matching APIs...")
        
        # First create another test user for matching
        self.create_match_target_user()
        
        # Test GET /api/matches/discover
        response = self.make_request("GET", "/matches/discover", token=STUDENT_TOKEN)
        if isinstance(response, tuple):
            self.log_result("matching", "GET /matches/discover", False, error=response[1])
        elif response and response.status_code == 200:
            try:
                matches = response.json()
                if isinstance(matches, list):
                    self.log_result("matching", "GET /matches/discover", True)
                    # Store a user ID for swipe testing if available
                    if matches:
                        self.target_user_id = matches[0].get("user_id")
                    else:
                        # Use the target user we created
                        self.target_user_id = "user_target123"
                else:
                    self.log_result("matching", "GET /matches/discover", False, response, "Invalid matches format")
            except json.JSONDecodeError:
                self.log_result("matching", "GET /matches/discover", False, response, "Invalid JSON response")
        else:
            self.log_result("matching", "GET /matches/discover", False, response, "Match discovery failed")
        
        # Test POST /api/matches/swipe (use target user we created)
        if not hasattr(self, 'target_user_id'):
            self.target_user_id = "user_target123"
            
        swipe_data = {"target_user_id": self.target_user_id, "action": "like"}
        response = self.make_request("POST", "/matches/swipe", token=STUDENT_TOKEN, data=swipe_data)
        if isinstance(response, tuple):
            self.log_result("matching", "POST /matches/swipe", False, error=response[1])
        elif response and response.status_code == 200:
            try:
                swipe_response = response.json()
                if "match" in swipe_response:
                    self.log_result("matching", "POST /matches/swipe", True)
                    # Store match_id for chat testing
                    if swipe_response.get("is_mutual"):
                        self.match_id = swipe_response["match"]["id"]
                else:
                    self.log_result("matching", "POST /matches/swipe", False, response, "Invalid swipe response")
            except json.JSONDecodeError:
                self.log_result("matching", "POST /matches/swipe", False, response, "Invalid JSON response")
        else:
            self.log_result("matching", "POST /matches/swipe", False, response, "Swipe action failed")
        
        # Test GET /api/matches/accepted
        response = self.make_request("GET", "/matches/accepted", token=STUDENT_TOKEN)
        if isinstance(response, tuple):
            self.log_result("matching", "GET /matches/accepted", False, error=response[1])
        elif response and response.status_code == 200:
            try:
                accepted_matches = response.json()
                if isinstance(accepted_matches, list):
                    self.log_result("matching", "GET /matches/accepted", True)
                else:
                    self.log_result("matching", "GET /matches/accepted", False, response, "Invalid accepted matches format")
            except json.JSONDecodeError:
                self.log_result("matching", "GET /matches/accepted", False, response, "Invalid JSON response")
        else:
            self.log_result("matching", "GET /matches/accepted", False, response, "Accepted matches retrieval failed")
    
    def create_temp_session(self):
        """Create a temporary session for logout testing"""
        try:
            import subprocess
            subprocess.run([
                "mongosh", "test_database", "--eval",
                """
                db.user_sessions.insertOne({
                  user_id: 'user_test123',
                  session_token: 'temp_session_token_456',
                  expires_at: new Date(Date.now() + 7*24*60*60*1000),
                  created_at: new Date()
                });
                """
            ], capture_output=True, text=True, timeout=10)
        except Exception as e:
            print(f"Warning: Could not create temp session: {e}")
    
    def recreate_main_session(self):
        """Recreate the main session after logout test"""
        try:
            import subprocess
            subprocess.run([
                "mongosh", "test_database", "--eval",
                """
                db.user_sessions.insertOne({
                  user_id: 'user_test123',
                  session_token: 'test_session_token_123',
                  expires_at: new Date(Date.now() + 7*24*60*60*1000),
                  created_at: new Date()
                });
                """
            ], capture_output=True, text=True, timeout=10)
        except Exception as e:
            print(f"Warning: Could not recreate main session: {e}")
    
    def create_match_target_user(self):
        """Create a target user for matching tests"""
        try:
            import subprocess
            subprocess.run([
                "mongosh", "test_database", "--eval",
                """
                var targetId = 'user_target123';
                db.users.insertOne({
                  user_id: targetId,
                  email: 'target@example.com',
                  name: 'Target User',
                  picture: null,
                  role: 'student',
                  interests: ['Art', 'Music'],
                  university: 'Harvard',
                  age: 22,
                  study_style: 'visual',
                  bio: 'Target bio',
                  created_at: new Date()
                });
                """
            ], capture_output=True, text=True, timeout=10)
        except Exception as e:
            print(f"Warning: Could not create target user for matching tests: {e}")
    
    def test_chat_apis(self):
        """Test Chat APIs"""
        print("\n💬 Testing Chat APIs...")
        
        # Create a mutual match first for chat testing
        self.create_mutual_match()
        
        # Test POST /api/chat/send (if we have a match_id)
        if self.match_id:
            message_data = {"match_id": self.match_id, "text": "Hello, this is a test message!"}
            response = self.make_request("POST", "/chat/send", token=STUDENT_TOKEN, data=message_data)
            if isinstance(response, tuple):
                self.log_result("chat", "POST /chat/send", False, error=response[1])
            elif response and response.status_code == 200:
                try:
                    message_response = response.json()
                    if message_response.get("match_id") == self.match_id:
                        self.log_result("chat", "POST /chat/send", True)
                    else:
                        self.log_result("chat", "POST /chat/send", False, response, "Invalid message response")
                except json.JSONDecodeError:
                    self.log_result("chat", "POST /chat/send", False, response, "Invalid JSON response")
            else:
                self.log_result("chat", "POST /chat/send", False, response, "Message sending failed")
            
            # Test GET /api/chat/{match_id}
            response = self.make_request("GET", f"/chat/{self.match_id}", token=STUDENT_TOKEN)
            if isinstance(response, tuple):
                self.log_result("chat", "GET /chat/{match_id}", False, error=response[1])
            elif response and response.status_code == 200:
                try:
                    messages = response.json()
                    if isinstance(messages, list):
                        self.log_result("chat", "GET /chat/{match_id}", True)
                    else:
                        self.log_result("chat", "GET /chat/{match_id}", False, response, "Invalid messages format")
                except json.JSONDecodeError:
                    self.log_result("chat", "GET /chat/{match_id}", False, response, "Invalid JSON response")
            else:
                self.log_result("chat", "GET /chat/{match_id}", False, response, "Message retrieval failed")
        else:
            self.log_result("chat", "POST /chat/send", False, error="No match_id available for chat test")
            self.log_result("chat", "GET /chat/{match_id}", False, error="No match_id available for chat test")
    
    def create_mutual_match(self):
        """Create a mutual match for chat testing"""
        try:
            import subprocess
            result = subprocess.run([
                "mongosh", "test_database", "--eval",
                """
                var matchId = 'match_' + new ObjectId().toString().slice(-12);
                db.matches.insertOne({
                  id: matchId,
                  user_id: 'user_test123',
                  matched_user_id: 'user_target123',
                  status: 'accepted',
                  score: 0.8,
                  created_at: new Date()
                });
                print('Match ID: ' + matchId);
                """
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0 and "Match ID:" in result.stdout:
                self.match_id = result.stdout.split("Match ID: ")[1].strip()
        except Exception as e:
            print(f"Warning: Could not create mutual match for chat tests: {e}")
    
    def test_admin_apis(self):
        """Test Admin APIs"""
        print("\n👑 Testing Admin APIs...")
        
        # Test GET /api/admin/stats
        response = self.make_request("GET", "/admin/stats", token=ADMIN_TOKEN)
        if isinstance(response, tuple):
            self.log_result("admin", "GET /admin/stats", False, error=response[1])
        elif response and response.status_code == 200:
            try:
                stats = response.json()
                if ("total_users" in stats and "total_students" in stats and 
                    "average_risk_score" in stats):
                    self.log_result("admin", "GET /admin/stats", True)
                else:
                    self.log_result("admin", "GET /admin/stats", False, response, "Missing required stats fields")
            except json.JSONDecodeError:
                self.log_result("admin", "GET /admin/stats", False, response, "Invalid JSON response")
        else:
            self.log_result("admin", "GET /admin/stats", False, response, "Admin stats retrieval failed")
        
        # Test GET /api/admin/reports
        response = self.make_request("GET", "/admin/reports", token=ADMIN_TOKEN)
        if isinstance(response, tuple):
            self.log_result("admin", "GET /admin/reports", False, error=response[1])
        elif response and response.status_code == 200:
            try:
                reports = response.json()
                if isinstance(reports, list):
                    self.log_result("admin", "GET /admin/reports", True)
                else:
                    self.log_result("admin", "GET /admin/reports", False, response, "Invalid reports format")
            except json.JSONDecodeError:
                self.log_result("admin", "GET /admin/reports", False, response, "Invalid JSON response")
        else:
            self.log_result("admin", "GET /admin/reports", False, response, "Admin reports retrieval failed")
        
        # Test GET /api/admin/users
        response = self.make_request("GET", "/admin/users", token=ADMIN_TOKEN)
        if isinstance(response, tuple):
            self.log_result("admin", "GET /admin/users", False, error=response[1])
        elif response and response.status_code == 200:
            try:
                users = response.json()
                if isinstance(users, list) and len(users) > 0:
                    self.log_result("admin", "GET /admin/users", True)
                else:
                    self.log_result("admin", "GET /admin/users", False, response, "No users returned or invalid format")
            except json.JSONDecodeError:
                self.log_result("admin", "GET /admin/users", False, response, "Invalid JSON response")
        else:
            self.log_result("admin", "GET /admin/users", False, response, "Admin users retrieval failed")
    
    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting Educare Backend API Tests")
        print(f"📍 Base URL: {BASE_URL}")
        print(f"⏰ Test Time: {datetime.now().isoformat()}")
        
        # Run all test suites
        self.test_auth_apis()
        # Recreate session after auth tests (logout invalidates it)
        print("🔄 Recreating session after auth tests...")
        self.recreate_main_session()
        import time
        time.sleep(1)  # Small delay to ensure session is created
        self.test_mood_apis()
        self.test_feedback_apis()
        self.test_profile_api()
        self.test_matching_apis()
        self.test_chat_apis()
        self.test_admin_apis()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test results summary"""
        print("\n" + "="*60)
        print("📊 TEST RESULTS SUMMARY")
        print("="*60)
        
        total_passed = 0
        total_failed = 0
        critical_failures = []
        
        for category, results in self.results.items():
            passed = results["passed"]
            failed = results["failed"]
            total_passed += passed
            total_failed += failed
            
            status = "✅ PASS" if failed == 0 else "❌ FAIL"
            print(f"{category.upper():12} | {status} | {passed} passed, {failed} failed")
            
            if failed > 0:
                critical_failures.extend(results["errors"])
        
        print("-" * 60)
        print(f"TOTAL        | {total_passed} passed, {total_failed} failed")
        
        if critical_failures:
            print("\n🚨 CRITICAL FAILURES:")
            for error in critical_failures:
                print(f"  • {error}")
        
        print("\n" + "="*60)
        
        return total_failed == 0

if __name__ == "__main__":
    tester = APITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)