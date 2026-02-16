#!/usr/bin/env python3
"""
Backend API Testing Script for Educare AI Learning System
Tests the new AI Learning System endpoints as requested.
"""

import asyncio
import httpx
import json
import os
from datetime import datetime, timezone
from typing import Dict, Any

# Get backend URL from environment
BACKEND_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', 'https://github-retriever-1.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class TestResults:
    def __init__(self):
        self.results = []
        self.passed = 0
        self.failed = 0
    
    def add_result(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        self.results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        if success:
            self.passed += 1
        else:
            self.failed += 1
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

async def create_admin_session() -> str:
    """Create an admin session for testing"""
    print("🔐 Creating admin session...")
    
    async with httpx.AsyncClient() as client:
        # Try to login with admin credentials
        login_data = {
            "email": "yusufquadri83@gmail.com",
            "password": "admin123",
            "admin_code": "EDUCARE_ADMIN_2024"  # Use admin code to ensure admin access
        }
        
        try:
            response = await client.post(f"{API_BASE}/auth/admin-login", json=login_data)
            if response.status_code == 200:
                data = response.json()
                session_token = data.get("session_token")
                print(f"✅ Admin session created: {session_token[:20]}...")
                return session_token
            else:
                print(f"❌ Admin login failed: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"❌ Admin login error: {e}")
            return None

async def create_test_safeguarding_alert(session_token: str) -> str:
    """Create a test safeguarding alert to test feedback endpoint"""
    print("📝 Creating test safeguarding alert...")
    
    async with httpx.AsyncClient() as client:
        headers = {"Authorization": f"Bearer {session_token}"}
        
        # First create a mood entry with concerning content to trigger an alert
        mood_data = {
            "mood": 2,
            "notes": "I want to end it all, feeling hopeless"
        }
        
        try:
            response = await client.post(f"{API_BASE}/mood", json=mood_data, headers=headers)
            if response.status_code == 200:
                print("✅ Test mood entry created (should trigger safeguarding alert)")
                
                # Get the latest safeguarding alert
                alerts_response = await client.get(f"{API_BASE}/admin/safeguarding-alerts", headers=headers)
                if alerts_response.status_code == 200:
                    alerts_data = alerts_response.json()
                    alerts = alerts_data.get("alerts", [])
                    if alerts:
                        alert_id = alerts[0].get("alert_id")
                        print(f"✅ Found test alert: {alert_id}")
                        return alert_id
                    else:
                        print("⚠️ No alerts found")
                        return None
                else:
                    print(f"❌ Failed to get alerts: {alerts_response.status_code}")
                    return None
            else:
                print(f"❌ Failed to create mood entry: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ Error creating test alert: {e}")
            return None

async def test_ai_learning_endpoints():
    """Test all AI Learning System endpoints"""
    results = TestResults()
    
    print("🚀 Starting AI Learning System Endpoint Tests")
    print("=" * 60)
    
    # Create admin session
    session_token = await create_admin_session()
    if not session_token:
        results.add_result("Admin Session Creation", False, "Could not create admin session")
        return results
    
    results.add_result("Admin Session Creation", True, f"Session token: {session_token[:20]}...")
    
    headers = {"Authorization": f"Bearer {session_token}"}
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        
        # Test 1: GET /api/admin/ai-learning/stats
        print("📊 Testing AI Learning Stats endpoint...")
        try:
            response = await client.get(f"{API_BASE}/admin/ai-learning/stats", headers=headers)
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["keywords", "alerts", "insights", "keyword_coverage", "learning_active"]
                missing_fields = [field for field in expected_fields if field not in data]
                
                if not missing_fields:
                    results.add_result(
                        "GET /api/admin/ai-learning/stats", 
                        True, 
                        f"Returned all expected fields: {list(data.keys())}", 
                        data
                    )
                else:
                    results.add_result(
                        "GET /api/admin/ai-learning/stats", 
                        False, 
                        f"Missing fields: {missing_fields}", 
                        data
                    )
            else:
                results.add_result(
                    "GET /api/admin/ai-learning/stats", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
        except Exception as e:
            results.add_result("GET /api/admin/ai-learning/stats", False, f"Exception: {e}")
        
        # Test 2: GET /api/admin/ai-learning/keywords
        print("🔑 Testing AI Learning Keywords endpoint...")
        try:
            response = await client.get(f"{API_BASE}/admin/ai-learning/keywords", headers=headers)
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["keywords", "stats"]
                missing_fields = [field for field in expected_fields if field not in data]
                
                if not missing_fields:
                    stats = data.get("stats", {})
                    stats_fields = ["pending", "approved", "rejected", "total"]
                    missing_stats = [field for field in stats_fields if field not in stats]
                    
                    if not missing_stats:
                        results.add_result(
                            "GET /api/admin/ai-learning/keywords", 
                            True, 
                            f"Keywords: {len(data.get('keywords', []))}, Stats: {stats}", 
                            data
                        )
                    else:
                        results.add_result(
                            "GET /api/admin/ai-learning/keywords", 
                            False, 
                            f"Missing stats fields: {missing_stats}", 
                            data
                        )
                else:
                    results.add_result(
                        "GET /api/admin/ai-learning/keywords", 
                        False, 
                        f"Missing fields: {missing_fields}", 
                        data
                    )
            else:
                results.add_result(
                    "GET /api/admin/ai-learning/keywords", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
        except Exception as e:
            results.add_result("GET /api/admin/ai-learning/keywords", False, f"Exception: {e}")
        
        # Test 3: GET /api/admin/ai-learning/insights
        print("💡 Testing AI Learning Insights endpoint...")
        try:
            response = await client.get(f"{API_BASE}/admin/ai-learning/insights", headers=headers)
            if response.status_code == 200:
                data = response.json()
                expected_fields = ["insights", "unreviewed_count"]
                missing_fields = [field for field in expected_fields if field not in data]
                
                if not missing_fields:
                    results.add_result(
                        "GET /api/admin/ai-learning/insights", 
                        True, 
                        f"Insights: {len(data.get('insights', []))}, Unreviewed: {data.get('unreviewed_count', 0)}", 
                        data
                    )
                else:
                    results.add_result(
                        "GET /api/admin/ai-learning/insights", 
                        False, 
                        f"Missing fields: {missing_fields}", 
                        data
                    )
            else:
                results.add_result(
                    "GET /api/admin/ai-learning/insights", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
        except Exception as e:
            results.add_result("GET /api/admin/ai-learning/insights", False, f"Exception: {e}")
        
        # Test 4: POST /api/admin/ai-learning/trigger-analysis
        print("🔍 Testing AI Learning Trigger Analysis endpoint...")
        try:
            response = await client.post(f"{API_BASE}/admin/ai-learning/trigger-analysis", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "message" in data:
                    results.add_result(
                        "POST /api/admin/ai-learning/trigger-analysis", 
                        True, 
                        f"Analysis triggered: {data.get('message')}", 
                        data
                    )
                else:
                    results.add_result(
                        "POST /api/admin/ai-learning/trigger-analysis", 
                        False, 
                        "Response missing success or message fields", 
                        data
                    )
            else:
                results.add_result(
                    "POST /api/admin/ai-learning/trigger-analysis", 
                    False, 
                    f"HTTP {response.status_code}: {response.text}"
                )
        except Exception as e:
            results.add_result("POST /api/admin/ai-learning/trigger-analysis", False, f"Exception: {e}")
        
        # Test 5: Create a test safeguarding alert and test feedback endpoint
        print("🛡️ Testing Safeguarding Alert Feedback endpoint...")
        alert_id = await create_test_safeguarding_alert(session_token)
        
        if alert_id:
            try:
                # Test with true positive feedback
                feedback_data = {
                    "was_true_positive": True,
                    "notes": "This was indeed a concerning message that required intervention"
                }
                
                response = await client.post(
                    f"{API_BASE}/admin/safeguarding-alerts/{alert_id}/feedback", 
                    json=feedback_data, 
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and "message" in data:
                        results.add_result(
                            "POST /api/admin/safeguarding-alerts/{alert_id}/feedback", 
                            True, 
                            f"Feedback recorded: {data.get('message')}", 
                            data
                        )
                    else:
                        results.add_result(
                            "POST /api/admin/safeguarding-alerts/{alert_id}/feedback", 
                            False, 
                            "Response missing success or message fields", 
                            data
                        )
                else:
                    results.add_result(
                        "POST /api/admin/safeguarding-alerts/{alert_id}/feedback", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}"
                    )
            except Exception as e:
                results.add_result("POST /api/admin/safeguarding-alerts/{alert_id}/feedback", False, f"Exception: {e}")
        else:
            results.add_result(
                "POST /api/admin/safeguarding-alerts/{alert_id}/feedback", 
                False, 
                "Could not create test safeguarding alert"
            )
        
        # Test 6: Test with false positive feedback (if we have another alert)
        if alert_id:
            try:
                feedback_data = {
                    "was_true_positive": False,
                    "notes": "This was a false positive - testing feedback system"
                }
                
                response = await client.post(
                    f"{API_BASE}/admin/safeguarding-alerts/{alert_id}/feedback", 
                    json=feedback_data, 
                    headers=headers
                )
                
                if response.status_code == 200:
                    data = response.json()
                    results.add_result(
                        "POST /api/admin/safeguarding-alerts/{alert_id}/feedback (false positive)", 
                        True, 
                        f"False positive feedback recorded: {data.get('message')}", 
                        data
                    )
                else:
                    results.add_result(
                        "POST /api/admin/safeguarding-alerts/{alert_id}/feedback (false positive)", 
                        False, 
                        f"HTTP {response.status_code}: {response.text}"
                    )
            except Exception as e:
                results.add_result("POST /api/admin/safeguarding-alerts/{alert_id}/feedback (false positive)", False, f"Exception: {e}")
        
        # Test 7: Verify authentication is required (test without token)
        print("🔒 Testing authentication requirements...")
        try:
            response = await client.get(f"{API_BASE}/admin/ai-learning/stats")
            if response.status_code == 401:
                results.add_result(
                    "Authentication Required Test", 
                    True, 
                    "Correctly returns 401 without authentication"
                )
            else:
                results.add_result(
                    "Authentication Required Test", 
                    False, 
                    f"Expected 401, got {response.status_code}"
                )
        except Exception as e:
            results.add_result("Authentication Required Test", False, f"Exception: {e}")
    
    return results

async def main():
    """Main test function"""
    print("🧪 Educare AI Learning System API Tests")
    print("=" * 60)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    print()
    
    # Run tests
    results = await test_ai_learning_endpoints()
    
    # Print summary
    print("=" * 60)
    print("📋 TEST SUMMARY")
    print("=" * 60)
    print(f"Total Tests: {results.passed + results.failed}")
    print(f"✅ Passed: {results.passed}")
    print(f"❌ Failed: {results.failed}")
    print(f"Success Rate: {(results.passed / (results.passed + results.failed) * 100):.1f}%")
    print()
    
    if results.failed > 0:
        print("❌ FAILED TESTS:")
        for result in results.results:
            if not result["success"]:
                print(f"  - {result['test']}: {result['details']}")
        print()
    
    # Save detailed results
    with open("/app/ai_learning_test_results.json", "w") as f:
        json.dump({
            "summary": {
                "total": results.passed + results.failed,
                "passed": results.passed,
                "failed": results.failed,
                "success_rate": results.passed / (results.passed + results.failed) * 100 if (results.passed + results.failed) > 0 else 0
            },
            "results": results.results,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }, f, indent=2)
    
    print("💾 Detailed results saved to: /app/ai_learning_test_results.json")
    
    return results.failed == 0

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)