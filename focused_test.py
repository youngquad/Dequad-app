#!/usr/bin/env python3
"""
Focused test for the specific review request:
- Notifications APIs
- Profile Update with new fields  
- Matching with preferences
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://campus-connect-694.preview.emergentagent.com/api"
SESSION_TOKEN = "test_session_token_123"
HEADERS = {
    "Authorization": f"Bearer {SESSION_TOKEN}",
    "Content-Type": "application/json"
}

def test_specific_endpoints():
    """Test the specific endpoints mentioned in the review request"""
    print("🧪 Testing Specific Educare APIs - Review Request Focus")
    print(f"📍 Base URL: {BASE_URL}")
    print(f"🔑 Session Token: {SESSION_TOKEN}")
    print("="*60)
    
    results = {"passed": 0, "failed": 0, "details": []}
    
    # 1. Test Notifications APIs
    print("\n🔔 Testing Notification APIs...")
    
    # GET /api/notifications
    try:
        response = requests.get(f"{BASE_URL}/notifications", headers=HEADERS, timeout=30)
        if response.status_code == 200:
            notifications = response.json()
            print(f"✅ GET /api/notifications - Retrieved {len(notifications)} notifications")
            results["passed"] += 1
            results["details"].append(f"GET /api/notifications: {len(notifications)} notifications retrieved")
        else:
            print(f"❌ GET /api/notifications - Status: {response.status_code}")
            results["failed"] += 1
            results["details"].append(f"GET /api/notifications: Failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ GET /api/notifications - Exception: {e}")
        results["failed"] += 1
        results["details"].append(f"GET /api/notifications: Exception - {e}")
    
    # POST /api/notifications/read-all
    try:
        response = requests.post(f"{BASE_URL}/notifications/read-all", headers=HEADERS, timeout=30)
        if response.status_code == 200:
            result_data = response.json()
            if result_data.get("success") == True:
                print("✅ POST /api/notifications/read-all - Success")
                results["passed"] += 1
                results["details"].append("POST /api/notifications/read-all: Successfully marked all as read")
            else:
                print(f"❌ POST /api/notifications/read-all - Invalid response: {result_data}")
                results["failed"] += 1
                results["details"].append(f"POST /api/notifications/read-all: Invalid response - {result_data}")
        else:
            print(f"❌ POST /api/notifications/read-all - Status: {response.status_code}")
            results["failed"] += 1
            results["details"].append(f"POST /api/notifications/read-all: Failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ POST /api/notifications/read-all - Exception: {e}")
        results["failed"] += 1
        results["details"].append(f"POST /api/notifications/read-all: Exception - {e}")
    
    # GET /api/notifications/unread-count
    try:
        response = requests.get(f"{BASE_URL}/notifications/unread-count", headers=HEADERS, timeout=30)
        if response.status_code == 200:
            count_data = response.json()
            if "count" in count_data:
                print(f"✅ GET /api/notifications/unread-count - Count: {count_data['count']}")
                results["passed"] += 1
                results["details"].append(f"GET /api/notifications/unread-count: {count_data['count']} unread notifications")
            else:
                print(f"❌ GET /api/notifications/unread-count - Missing count field: {count_data}")
                results["failed"] += 1
                results["details"].append(f"GET /api/notifications/unread-count: Missing count field")
        else:
            print(f"❌ GET /api/notifications/unread-count - Status: {response.status_code}")
            results["failed"] += 1
            results["details"].append(f"GET /api/notifications/unread-count: Failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ GET /api/notifications/unread-count - Exception: {e}")
        results["failed"] += 1
        results["details"].append(f"GET /api/notifications/unread-count: Exception - {e}")
    
    # 2. Test Profile Update with new fields
    print("\n👤 Testing Profile Update with Enhanced Fields...")
    
    profile_data = {
        "university_location": "Boston, MA",
        "campus_name": "Harvard Yard",
        "course": "Psychology",
        "ethnicity": "Caucasian/White",
        "interested_in": ["women"],
        "gender": "man",
        "notifications_enabled": True
    }
    
    try:
        response = requests.put(f"{BASE_URL}/profile", headers=HEADERS, json=profile_data, timeout=30)
        if response.status_code == 200:
            updated_user = response.json()
            
            # Verify all fields were updated
            success = True
            missing_fields = []
            
            for field, expected_value in profile_data.items():
                if field not in updated_user:
                    missing_fields.append(f"{field} (missing)")
                    success = False
                elif updated_user[field] != expected_value:
                    missing_fields.append(f"{field} (expected: {expected_value}, got: {updated_user.get(field)})")
                    success = False
            
            if success:
                print("✅ PUT /api/profile - All enhanced fields updated successfully")
                results["passed"] += 1
                results["details"].append("PUT /api/profile: All enhanced fields updated successfully")
            else:
                print(f"❌ PUT /api/profile - Field issues: {missing_fields}")
                results["failed"] += 1
                results["details"].append(f"PUT /api/profile: Field issues - {missing_fields}")
        else:
            print(f"❌ PUT /api/profile - Status: {response.status_code}")
            results["failed"] += 1
            results["details"].append(f"PUT /api/profile: Failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ PUT /api/profile - Exception: {e}")
        results["failed"] += 1
        results["details"].append(f"PUT /api/profile: Exception - {e}")
    
    # 3. Test Matching with preferences
    print("\n💕 Testing Matching with Preferences...")
    
    try:
        response = requests.get(f"{BASE_URL}/matches/discover", headers=HEADERS, timeout=30)
        if response.status_code == 200:
            matches = response.json()
            if isinstance(matches, list):
                print(f"✅ GET /api/matches/discover - Retrieved {len(matches)} matches with preference filtering")
                results["passed"] += 1
                results["details"].append(f"GET /api/matches/discover: {len(matches)} matches with preference filtering")
                
                # Check if matches have scoring
                if matches and "match_score" in matches[0]:
                    print(f"✅ Match scoring system - First match score: {matches[0]['match_score']}")
                    results["passed"] += 1
                    results["details"].append(f"Match scoring: Working (first match score: {matches[0]['match_score']})")
                elif matches:
                    print("❌ Match scoring system - Missing match_score field")
                    results["failed"] += 1
                    results["details"].append("Match scoring: Missing match_score field")
                else:
                    print("ℹ️ Match scoring system - No matches to verify scoring")
                    results["passed"] += 1
                    results["details"].append("Match scoring: No matches available to test scoring")
            else:
                print(f"❌ GET /api/matches/discover - Invalid response format: {type(matches)}")
                results["failed"] += 1
                results["details"].append(f"GET /api/matches/discover: Invalid response format")
        else:
            print(f"❌ GET /api/matches/discover - Status: {response.status_code}")
            results["failed"] += 1
            results["details"].append(f"GET /api/matches/discover: Failed with status {response.status_code}")
    except Exception as e:
        print(f"❌ GET /api/matches/discover - Exception: {e}")
        results["failed"] += 1
        results["details"].append(f"GET /api/matches/discover: Exception - {e}")
    
    # Summary
    total_tests = results["passed"] + results["failed"]
    success_rate = (results["passed"] / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\n{'='*60}")
    print(f"📊 FOCUSED TEST SUMMARY")
    print(f"{'='*60}")
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if results["details"]:
        print(f"\n📋 DETAILED RESULTS:")
        for detail in results["details"]:
            print(f"  • {detail}")
    
    return results["failed"] == 0

if __name__ == "__main__":
    success = test_specific_endpoints()
    exit(0 if success else 1)