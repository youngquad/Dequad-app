#!/usr/bin/env python3

import requests
import json
import sys

# Configuration
BASE_URL = "https://github-projects.preview.emergentagent.com/api"
ADMIN_TOKEN = "admin_session_token_123"

def test_admin_safeguarding_endpoints():
    """Test Admin Safeguarding Endpoints with Admin Token"""
    print("👑 Testing Admin Safeguarding Endpoints...")
    print(f"Base URL: {BASE_URL}")
    print(f"Admin Token: {ADMIN_TOKEN}")
    print("=" * 60)
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {ADMIN_TOKEN}"
    }
    
    results = []
    
    # Test 1: GET /api/admin/safeguarding-alerts
    print("1. Testing admin safeguarding alerts endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/admin/safeguarding-alerts", headers=headers, timeout=30)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
            
            if ("alerts" in data and "unacknowledged_count" in data and
                "high_risk_count" in data and "total_count" in data):
                alerts = data["alerts"]
                if isinstance(alerts, list):
                    print("   ✅ PASS: Admin safeguarding alerts working")
                    print(f"   ✅ Retrieved {len(alerts)} alerts")
                    print(f"   ✅ Unacknowledged: {data.get('unacknowledged_count')}")
                    print(f"   ✅ High risk: {data.get('high_risk_count')}")
                    results.append(("Admin Safeguarding Alerts", True, f"Retrieved {len(alerts)} alerts"))
                else:
                    print("   ❌ FAIL: Alerts field is not a list")
                    results.append(("Admin Safeguarding Alerts", False, "Invalid alerts format"))
            else:
                print("   ❌ FAIL: Missing required fields")
                results.append(("Admin Safeguarding Alerts", False, "Missing required fields"))
        else:
            print(f"   ❌ FAIL: HTTP {response.status_code}: {response.text}")
            results.append(("Admin Safeguarding Alerts", False, f"HTTP {response.status_code}"))
    except Exception as e:
        print(f"   ❌ ERROR: {e}")
        results.append(("Admin Safeguarding Alerts", False, f"Exception: {e}"))
    
    print()
    
    # Test 2: GET /api/admin/ai-risk-analysis/{user_id}
    print("2. Testing admin AI risk analysis endpoint...")
    
    try:
        # Use the test user ID
        user_id = "user_test123"
        response = requests.get(f"{BASE_URL}/admin/ai-risk-analysis/{user_id}", headers=headers, timeout=30)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response keys: {list(data.keys())}")
            
            if ("user" in data and "ai_analysis" in data and "data_summary" in data):
                ai_analysis = data["ai_analysis"]
                required_fields = ["overall_risk_score", "risk_level", "key_concerns", "recommendation", "summary"]
                
                if all(field in ai_analysis for field in required_fields):
                    print("   ✅ PASS: AI risk analysis working")
                    print(f"   ✅ Risk level: {ai_analysis.get('risk_level')}")
                    print(f"   ✅ Risk score: {ai_analysis.get('overall_risk_score')}")
                    print(f"   ✅ User: {data['user'].get('name')}")
                    results.append(("Admin AI Risk Analysis", True, f"Risk: {ai_analysis.get('risk_level')}"))
                else:
                    missing_fields = [f for f in required_fields if f not in ai_analysis]
                    print(f"   ❌ FAIL: Missing AI analysis fields: {missing_fields}")
                    results.append(("Admin AI Risk Analysis", False, f"Missing fields: {missing_fields}"))
            else:
                print("   ❌ FAIL: Missing required top-level fields")
                results.append(("Admin AI Risk Analysis", False, "Missing top-level fields"))
        elif response.status_code == 404:
            print("   ❌ FAIL: User not found")
            results.append(("Admin AI Risk Analysis", False, "User not found"))
        else:
            print(f"   ❌ FAIL: HTTP {response.status_code}: {response.text}")
            results.append(("Admin AI Risk Analysis", False, f"HTTP {response.status_code}"))
    except Exception as e:
        print(f"   ❌ ERROR: {e}")
        results.append(("Admin AI Risk Analysis", False, f"Exception: {e}"))
    
    # Summary
    print()
    print("=" * 60)
    print("📊 ADMIN SAFEGUARDING TEST SUMMARY")
    print("=" * 60)
    
    total_tests = len(results)
    passed_tests = sum(1 for _, success, _ in results if success)
    failed_tests = total_tests - passed_tests
    
    for test_name, success, details in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {details}")
    
    print("-" * 60)
    print(f"Total: {total_tests} tests")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
    
    return failed_tests == 0

if __name__ == "__main__":
    success = test_admin_safeguarding_endpoints()
    sys.exit(0 if success else 1)