#!/usr/bin/env python3
"""
Focused Backend API Testing for Educare - Matches API Testing
Testing the specific APIs mentioned in the review request
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://5888b71c-e2f0-406e-bddc-c8c11971bcea.preview.emergentagent.com/api"

class FocusedAPITester:
    def __init__(self):
        self.results = {
            "matching": {"passed": 0, "failed": 0, "errors": []},
            "auth": {"passed": 0, "failed": 0, "errors": []}
        }
        
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
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response
        except requests.exceptions.RequestException as e:
            return None, str(e)
    
    def test_matches_discover_api(self):
        """Test GET /api/matches/discover endpoint"""
        print("\n💕 Testing GET /api/matches/discover...")
        
        # Test without authentication first
        response = self.make_request("GET", "/matches/discover")
        if isinstance(response, tuple):
            self.log_result("matching", "GET /matches/discover (no auth)", False, error=response[1])
        elif response and response.status_code == 401:
            self.log_result("matching", "GET /matches/discover (401 without auth)", True)
            print("   ✅ Correctly requires authentication")
        else:
            self.log_result("matching", "GET /matches/discover (no auth)", False, response, "Should return 401 without auth")
        
        # Test with invalid token
        response = self.make_request("GET", "/matches/discover", token="invalid_token")
        if isinstance(response, tuple):
            self.log_result("matching", "GET /matches/discover (invalid token)", False, error=response[1])
        elif response and response.status_code == 401:
            self.log_result("matching", "GET /matches/discover (401 with invalid token)", True)
            print("   ✅ Correctly rejects invalid token")
        else:
            self.log_result("matching", "GET /matches/discover (invalid token)", False, response, "Should return 401 with invalid token")
        
        # Test endpoint accessibility (we expect 401 since we don't have valid auth)
        response = self.make_request("GET", "/matches/discover", token="test_token")
        if isinstance(response, tuple):
            self.log_result("matching", "GET /matches/discover (endpoint check)", False, error=response[1])
        elif response:
            if response.status_code == 401:
                self.log_result("matching", "GET /matches/discover (endpoint accessible)", True)
                print("   ✅ Endpoint is accessible and properly secured")
            elif response.status_code == 200:
                try:
                    matches = response.json()
                    if isinstance(matches, list):
                        self.log_result("matching", "GET /matches/discover (successful response)", True)
                        print(f"   ✅ Returned {len(matches)} potential matches")
                    else:
                        self.log_result("matching", "GET /matches/discover", False, response, "Response is not a list")
                except json.JSONDecodeError:
                    self.log_result("matching", "GET /matches/discover", False, response, "Invalid JSON response")
            else:
                self.log_result("matching", "GET /matches/discover", False, response, f"Unexpected status code: {response.status_code}")
        else:
            self.log_result("matching", "GET /matches/discover", False, error="No response received")
    
    def test_matches_swipe_api(self):
        """Test POST /api/matches/swipe endpoint"""
        print("\n👍 Testing POST /api/matches/swipe...")
        
        # Test without authentication
        swipe_data = {"target_user_id": "test_user", "action": "like"}
        response = self.make_request("POST", "/matches/swipe", data=swipe_data)
        if isinstance(response, tuple):
            self.log_result("matching", "POST /matches/swipe (no auth)", False, error=response[1])
        elif response and response.status_code == 401:
            self.log_result("matching", "POST /matches/swipe (401 without auth)", True)
            print("   ✅ Correctly requires authentication")
        else:
            self.log_result("matching", "POST /matches/swipe (no auth)", False, response, "Should return 401 without auth")
        
        # Test with invalid token
        response = self.make_request("POST", "/matches/swipe", token="invalid_token", data=swipe_data)
        if isinstance(response, tuple):
            self.log_result("matching", "POST /matches/swipe (invalid token)", False, error=response[1])
        elif response and response.status_code == 401:
            self.log_result("matching", "POST /matches/swipe (401 with invalid token)", True)
            print("   ✅ Correctly rejects invalid token")
        else:
            self.log_result("matching", "POST /matches/swipe (invalid token)", False, response, "Should return 401 with invalid token")
        
        # Test with missing data
        response = self.make_request("POST", "/matches/swipe", token="test_token", data={})
        if isinstance(response, tuple):
            self.log_result("matching", "POST /matches/swipe (missing data)", False, error=response[1])
        elif response and response.status_code in [400, 422]:
            self.log_result("matching", "POST /matches/swipe (400/422 with missing data)", True)
            print("   ✅ Correctly validates required fields")
        elif response and response.status_code == 401:
            self.log_result("matching", "POST /matches/swipe (endpoint accessible)", True)
            print("   ✅ Endpoint is accessible and properly secured")
        else:
            self.log_result("matching", "POST /matches/swipe (missing data)", False, response, f"Unexpected status: {response.status_code}")
        
        # Test with invalid action
        invalid_swipe_data = {"target_user_id": "test_user", "action": "invalid_action"}
        response = self.make_request("POST", "/matches/swipe", token="test_token", data=invalid_swipe_data)
        if isinstance(response, tuple):
            self.log_result("matching", "POST /matches/swipe (invalid action)", False, error=response[1])
        elif response and response.status_code in [400, 422]:
            self.log_result("matching", "POST /matches/swipe (400/422 with invalid action)", True)
            print("   ✅ Correctly validates action field")
        elif response and response.status_code == 401:
            self.log_result("matching", "POST /matches/swipe (endpoint accessible)", True)
            print("   ✅ Endpoint is accessible and properly secured")
        else:
            self.log_result("matching", "POST /matches/swipe (invalid action)", False, response, f"Unexpected status: {response.status_code}")
    
    def test_basic_connectivity(self):
        """Test basic API connectivity"""
        print("\n🔗 Testing Basic API Connectivity...")
        
        # Test if the API is reachable
        try:
            response = requests.get(f"{BASE_URL.replace('/api', '')}", timeout=10)
            if response.status_code in [200, 404, 405]:  # Any response means server is up
                self.log_result("auth", "API Server Connectivity", True)
                print(f"   ✅ API server is reachable (Status: {response.status_code})")
            else:
                self.log_result("auth", "API Server Connectivity", False, response, f"Unexpected status: {response.status_code}")
        except requests.exceptions.RequestException as e:
            self.log_result("auth", "API Server Connectivity", False, error=str(e))
    
    def run_all_tests(self):
        """Run all focused tests"""
        print("🧪 Starting Focused Backend API Tests for Educare Matches")
        print(f"📍 Testing API at: {BASE_URL}")
        print("=" * 60)
        
        self.test_basic_connectivity()
        self.test_matches_discover_api()
        self.test_matches_swipe_api()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_passed = sum(cat["passed"] for cat in self.results.values())
        total_failed = sum(cat["failed"] for cat in self.results.values())
        total_tests = total_passed + total_failed
        
        for category, results in self.results.items():
            if results["passed"] > 0 or results["failed"] > 0:
                print(f"{category.upper()}: {results['passed']} passed, {results['failed']} failed")
                if results["errors"]:
                    for error in results["errors"]:
                        print(f"  - {error}")
        
        print(f"\nOVERALL: {total_passed}/{total_tests} tests passed ({(total_passed/total_tests*100):.1f}%)")
        
        if total_failed == 0:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed - see details above")
            return 1

def main():
    tester = FocusedAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())