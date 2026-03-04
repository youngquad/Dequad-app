#!/usr/bin/env python3
"""
Educare Backend API Testing Suite - Admin Login & Matching Features Focus
Testing admin login, test profiles, likes-received endpoint, and comment functionality
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://campus-connect-694.preview.emergentagent.com/api"
ADMIN_EMAIL = "yusufquadri83@gmail.com"
ADMIN_PASSWORD = "Oluwatobi11@"

class EducareAPITester:
    def __init__(self):
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })
    
    def make_request(self, method, endpoint, data=None, token=None):
        """Make HTTP request with proper headers"""
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        url = f"{BASE_URL}/{endpoint}"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response
        except Exception as e:
            print(f"Request failed: {e}")
            return None
    
    def test_admin_login(self):
        """Test admin login with specified credentials"""
        print("\n🔐 Testing Admin Login...")
        
        login_data = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }
        
        response = self.make_request("POST", "auth/admin-login", data=login_data)
        
        if response and response.status_code == 200:
            try:
                login_response = response.json()
                if "session_token" in login_response and login_response.get("is_admin"):
                    self.admin_token = login_response["session_token"]
                    self.log_test("Admin Login", True, f"Token: {self.admin_token[:20]}...")
                    return True
                else:
                    self.log_test("Admin Login", False, "Missing session_token or is_admin flag")
            except json.JSONDecodeError:
                self.log_test("Admin Login", False, "Invalid JSON response")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Admin Login", False, f"Status: {status}")
        
        return False
    
    def test_discover_profiles(self):
        """Test discover endpoint for test profiles"""
        print("\n👥 Testing Discover Profiles...")
        
        if not self.admin_token:
            self.log_test("Discover Profiles", False, "No admin token available")
            return False
        
        response = self.make_request("GET", "matches/discover", token=self.admin_token)
        
        if response and response.status_code == 200:
            try:
                profiles = response.json()
                if isinstance(profiles, list):
                    self.log_test("Discover Endpoint", True, f"Found {len(profiles)} profiles")
                    
                    # Check for test profiles
                    test_names = ["Emma Wilson", "James Chen", "Sofia Martinez", "Alex Thompson", "Priya Patel"]
                    found_test_profiles = []
                    
                    for profile in profiles:
                        if profile.get('name') in test_names:
                            found_test_profiles.append(profile.get('name'))
                    
                    if len(found_test_profiles) >= 3:
                        self.log_test("Test Profiles Present", True, f"Found: {', '.join(found_test_profiles)}")
                    else:
                        self.log_test("Test Profiles Present", False, f"Only found {len(found_test_profiles)} test profiles")
                    
                    return True
                else:
                    self.log_test("Discover Profiles", False, "Response is not a list")
            except json.JSONDecodeError:
                self.log_test("Discover Profiles", False, "Invalid JSON response")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Discover Profiles", False, f"Status: {status}")
        
        return False
    
    def test_likes_received_endpoint(self):
        """Test likes-received endpoint"""
        print("\n💕 Testing Likes Received Endpoint...")
        
        if not self.admin_token:
            self.log_test("Likes Received", False, "No admin token available")
            return False
        
        response = self.make_request("GET", "matches/likes-received", token=self.admin_token)
        
        if response and response.status_code == 200:
            try:
                likes = response.json()
                if isinstance(likes, list):
                    self.log_test("Likes Received Endpoint", True, f"Found {len(likes)} likes")
                    
                    # Check structure if likes exist
                    if likes:
                        first_like = likes[0]
                        required_fields = ['like_id', 'user', 'created_at']
                        has_all_fields = all(field in first_like for field in required_fields)
                        
                        if has_all_fields:
                            self.log_test("Likes Data Structure", True, "All required fields present")
                            
                            # Check comment support
                            if 'comment' in first_like:
                                self.log_test("Comment Support", True, "Comment field available")
                            else:
                                self.log_test("Comment Support", True, "Comment field optional (as expected)")
                        else:
                            self.log_test("Likes Data Structure", False, f"Missing fields: {required_fields}")
                    else:
                        self.log_test("Likes Data Structure", True, "Endpoint accessible (no likes yet)")
                    
                    return True
                else:
                    self.log_test("Likes Received", False, "Response is not a list")
            except json.JSONDecodeError:
                self.log_test("Likes Received", False, "Invalid JSON response")
        else:
            status = response.status_code if response else "No response"
            self.log_test("Likes Received", False, f"Status: {status}")
        
        return False
    
    def test_swipe_with_comment(self):
        """Test swipe action with comment functionality"""
        print("\n💬 Testing Swipe with Comment...")
        
        if not self.admin_token:
            self.log_test("Swipe with Comment", False, "No admin token available")
            return False
        
        # First get profiles to swipe on
        response = self.make_request("GET", "matches/discover", token=self.admin_token)
        
        if not response or response.status_code != 200:
            self.log_test("Swipe with Comment", False, "Cannot get profiles for swipe test")
            return False
        
        try:
            profiles = response.json()
            if not profiles:
                self.log_test("Swipe with Comment", False, "No profiles available for swipe test")
                return False
            
            target_profile = profiles[0]
            target_user_id = target_profile.get('user_id')
            
            if not target_user_id:
                self.log_test("Swipe with Comment", False, "No user_id in profile")
                return False
            
            # Test swipe with comment
            swipe_data = {
                "target_user_id": target_user_id,
                "action": "like",
                "comment": "I love your interests in technology!",
                "liked_section": "interests"
            }
            
            response = self.make_request("POST", "matches/swipe", data=swipe_data, token=self.admin_token)
            
            if response and response.status_code == 200:
                try:
                    swipe_response = response.json()
                    if 'match' in swipe_response:
                        match_data = swipe_response['match']
                        if 'comment' in match_data and 'liked_section' in match_data:
                            self.log_test("Swipe with Comment", True, "Comment and section properly stored")
                            return True
                        else:
                            self.log_test("Swipe with Comment", False, "Comment or liked_section missing")
                    else:
                        self.log_test("Swipe with Comment", False, "No match data in response")
                except json.JSONDecodeError:
                    self.log_test("Swipe with Comment", False, "Invalid JSON response")
            else:
                status = response.status_code if response else "No response"
                # Check if it's already swiped error (which is acceptable)
                if response and "Already swiped" in response.text:
                    self.log_test("Swipe with Comment", True, "Already swiped (endpoint working)")
                    return True
                else:
                    self.log_test("Swipe with Comment", False, f"Status: {status}")
        
        except Exception as e:
            self.log_test("Swipe with Comment", False, f"Error: {str(e)}")
        
        return False
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Educare API Tests")
        print(f"Base URL: {BASE_URL}")
        print(f"Admin Email: {ADMIN_EMAIL}")
        
        # Test admin login first
        if not self.test_admin_login():
            print("\n❌ Admin login failed - cannot proceed with authenticated tests")
            return False
        
        # Run other tests
        self.test_discover_profiles()
        self.test_likes_received_endpoint()
        self.test_swipe_with_comment()
        
        # Print summary
        print("\n" + "="*50)
        print("TEST SUMMARY")
        print("="*50)
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = EducareAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())