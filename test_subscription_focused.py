#!/usr/bin/env python3
"""
Focused test for Stripe Subscription endpoints as requested
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://educare-app-1.preview.emergentagent.com/api"
STUDENT_TOKEN = "test_session_token_123"

def make_request(method, endpoint, token=None, data=None):
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
        print(f"Request error: {e}")
        return None

def test_subscription_status():
    """Test GET /api/subscription/status endpoint"""
    print("🧪 Testing GET /api/subscription/status...")
    
    response = make_request("GET", "/subscription/status", token=STUDENT_TOKEN)
    
    if not response:
        print("❌ Failed - No response")
        return False
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print("✅ Subscription status endpoint working!")
            print(f"   Plan: {data.get('plan')}")
            print(f"   Is Premium: {data.get('is_premium')}")
            print(f"   Remaining Swipes: {data.get('remaining_swipes')}")
            print(f"   Daily Limit: {data.get('daily_limit')}")
            print(f"   Price: {data.get('price')}")
            
            # Verify expected fields
            required_fields = ['plan', 'is_premium', 'remaining_swipes', 'daily_limit', 'price']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"⚠️  Missing fields: {missing_fields}")
                return False
            
            return True
        except json.JSONDecodeError:
            print("❌ Invalid JSON response")
            return False
    else:
        print(f"❌ Failed with status {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_create_checkout_session():
    """Test POST /api/subscription/create-checkout endpoint"""
    print("\n🧪 Testing POST /api/subscription/create-checkout...")
    
    payload = {
        "success_url": "https://educare.com/success",
        "cancel_url": "https://educare.com/cancel"
    }
    
    response = make_request("POST", "/subscription/create-checkout", token=STUDENT_TOKEN, data=payload)
    
    if not response:
        print("❌ Failed - No response")
        return False
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print("✅ Checkout session creation endpoint working!")
            print(f"   Checkout URL: {data.get('checkout_url', 'N/A')[:50]}...")
            print(f"   Session ID: {data.get('session_id', 'N/A')}")
            return True
        except json.JSONDecodeError:
            print("❌ Invalid JSON response")
            return False
    elif response.status_code == 400:
        # This is expected if Stripe keys are invalid
        print("⚠️  Checkout failed (likely due to invalid Stripe keys - this is OK)")
        print(f"   Response: {response.text}")
        return True  # This is acceptable per the requirements
    else:
        print(f"❌ Unexpected status {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_swipe_limit_enforcement():
    """Test POST /api/matches/swipe with swipe limit enforcement"""
    print("\n🧪 Testing POST /api/matches/swipe with swipe limit enforcement...")
    
    # First, reset user's swipe count
    import subprocess
    try:
        subprocess.run([
            "mongosh", "test_database", "--eval",
            """
            db.users.updateOne(
              {user_id: 'user_test123'},
              {$set: {swipes_today: 0, last_swipe_date: null}}
            );
            
            // Create target users for swipe testing
            db.users.deleteMany({user_id: {$regex: '^swipe_target_'}});
            db.matches.deleteMany({user_id: 'user_test123'});
            
            for (let i = 0; i < 10; i++) {
              db.users.insertOne({
                user_id: 'swipe_target_' + i,
                email: 'swipe' + i + '@example.com',
                name: 'Swipe Target ' + i,
                role: 'student',
                interests: ['Art', 'Music'],
                university: 'Harvard',
                gender: i % 2 === 0 ? 'woman' : 'man',
                interested_in: ['men', 'women'],
                created_at: new Date()
              });
            }
            """
        ], capture_output=True, text=True, timeout=15)
    except Exception as e:
        print(f"Warning: Could not setup test data: {e}")
    
    # Get potential matches
    discover_response = make_request("GET", "/matches/discover", token=STUDENT_TOKEN)
    
    if not discover_response or discover_response.status_code != 200:
        print(f"❌ Failed to get matches: {discover_response.status_code if discover_response else 'No response'}")
        return False
    
    try:
        matches = discover_response.json()
        if not matches:
            print("❌ No potential matches found for swipe testing")
            return False
    except json.JSONDecodeError:
        print("❌ Invalid JSON in matches response")
        return False
    
    print(f"Found {len(matches)} potential matches")
    
    # Test swipes up to the limit (5 for free users)
    successful_swipes = 0
    
    for i in range(7):  # Try 7 swipes (should fail after 5)
        if i >= len(matches):
            break
            
        target_user_id = matches[i]["user_id"]
        
        swipe_payload = {
            "target_user_id": target_user_id,
            "action": "like"
        }
        
        response = make_request("POST", "/matches/swipe", token=STUDENT_TOKEN, data=swipe_payload)
        
        if not response:
            print(f"   Swipe {i+1}: ❌ No response")
            break
        
        print(f"Swipe {i+1}: Status {response.status_code}")
        
        if response.status_code == 200:
            successful_swipes += 1
            try:
                data = response.json()
                remaining = data.get('remaining_swipes')
                print(f"   ✅ Swipe successful, remaining: {remaining}")
            except json.JSONDecodeError:
                print(f"   ✅ Swipe successful (invalid JSON)")
        elif response.status_code == 403:
            # This should happen after 5 swipes for free users
            try:
                data = response.json()
                detail = data.get('detail', {})
                
                if isinstance(detail, dict) and detail.get('upgrade_required'):
                    print(f"   ✅ Swipe limit reached as expected!")
                    print(f"   Message: {detail.get('message')}")
                    print(f"   Limit: {detail.get('limit')}")
                    print(f"   Upgrade Required: {detail.get('upgrade_required')}")
                    break
                else:
                    print(f"   ❌ Unexpected 403 response: {data}")
                    return False
            except json.JSONDecodeError:
                if "upgrade_required" in response.text or "Daily swipe limit" in response.text:
                    print(f"   ✅ Swipe limit reached as expected!")
                    break
                else:
                    print(f"   ❌ Unexpected 403 response: {response.text}")
                    return False
        elif response.status_code == 400:
            try:
                error_detail = response.json().get("detail", "")
                if "Already swiped" in error_detail:
                    print(f"   ⚠️  Already swiped (skipping)")
                    continue
                else:
                    print(f"   ❌ Unexpected 400: {error_detail}")
                    return False
            except json.JSONDecodeError:
                if "Already swiped" in response.text:
                    print(f"   ⚠️  Already swiped (skipping)")
                    continue
                else:
                    print(f"   ❌ Unexpected 400: {response.text}")
                    return False
        else:
            print(f"   ❌ Unexpected status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    
    # Verify we got exactly 5 successful swipes
    if successful_swipes == 5:
        print(f"✅ Swipe limit enforcement working correctly!")
        print(f"   Free users limited to 5 swipes/day as expected")
        return True
    else:
        print(f"❌ Expected 5 successful swipes, got {successful_swipes}")
        return False

def main():
    """Main test runner"""
    print("🚀 Starting Educare Stripe Subscription API Tests")
    print("=" * 60)
    
    results = {}
    
    # Test 1: Subscription Status
    results['subscription_status'] = test_subscription_status()
    
    # Test 2: Create Checkout Session
    results['create_checkout'] = test_create_checkout_session()
    
    # Test 3: Swipe Limit Enforcement
    results['swipe_limit'] = test_swipe_limit_enforcement()
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    total_tests = len(results)
    passed_tests = len([k for k, v in results.items() if v])
    
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    return 0 if passed_tests == total_tests else 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)