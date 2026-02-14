#!/usr/bin/env python3
"""
Focused test for Admin Email Notification Endpoints
Testing the specific endpoints requested in the review.
"""

import requests
import json
import uuid
from datetime import datetime

# Configuration
BASE_URL = "https://student-connect-46.preview.emergentagent.com/api"
ADMIN_TOKEN = "admin_session_token_123"
STUDENT_TOKEN = "test_session_token_123"

def print_test_header(test_name):
    """Print formatted test header"""
    print(f"\n{'='*60}")
    print(f"🧪 TESTING: {test_name}")
    print(f"{'='*60}")

def print_result(success, message, details=None):
    """Print formatted test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status}: {message}")
    if details:
        print(f"Details: {json.dumps(details, indent=2)}")

def test_admin_email_config():
    """Test GET /api/admin/email-config endpoint"""
    print_test_header("GET /api/admin/email-config")
    
    try:
        headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
        response = requests.get(f"{BASE_URL}/admin/email-config", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify expected fields
            if (data.get("smtp_configured") == False and 
                "message" in data and 
                "not configured" in data.get("message", "").lower()):
                
                print_result(True, "Email config endpoint working correctly", {
                    "smtp_configured": data.get("smtp_configured"),
                    "message": data.get("message"),
                    "smtp_host": data.get("smtp_host", "Not shown"),
                    "smtp_from_email": data.get("smtp_from_email", "Not shown")
                })
                return True
            else:
                print_result(False, "Unexpected response structure", data)
                return False
        else:
            print_result(False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

def test_admin_test_email():
    """Test POST /api/admin/test-email endpoint"""
    print_test_header("POST /api/admin/test-email")
    
    try:
        headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
        response = requests.post(f"{BASE_URL}/admin/test-email", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify expected response for unconfigured SMTP
            if (data.get("success") == False and 
                "not configured" in data.get("message", "").lower()):
                
                print_result(True, "Test email endpoint working correctly", {
                    "success": data.get("success"),
                    "message": data.get("message"),
                    "required_env_vars_count": len(data.get("required_env_vars", []))
                })
                return True
            else:
                print_result(False, "Unexpected response structure", data)
                return False
        else:
            print_result(False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

def test_mood_with_safeguarding():
    """Test POST /api/mood with safeguarding keywords"""
    print_test_header("POST /api/mood with Safeguarding Keywords")
    
    try:
        headers = {"Authorization": f"Bearer {STUDENT_TOKEN}"}
        
        # Test with concerning content
        mood_data = {
            "mood": 2,
            "notes": "I feel like I want to end it all. Nothing seems to matter anymore."
        }
        
        response = requests.post(f"{BASE_URL}/mood", headers=headers, json=mood_data)
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify mood entry was created and safeguarding alert triggered
            if ("id" in data and 
                "safeguarding_alert" in data and 
                data["safeguarding_alert"].get("flagged") == True):
                
                alert = data["safeguarding_alert"]
                print_result(True, "Mood endpoint with safeguarding working correctly", {
                    "mood_created": True,
                    "safeguarding_triggered": True,
                    "risk_level": alert.get("risk_level"),
                    "resources_provided": len(alert.get("resources", {})),
                    "message_preview": alert.get("message", "")[:50] + "..."
                })
                return True
            else:
                print_result(False, "Expected safeguarding alert to be triggered", data)
                return False
        else:
            print_result(False, f"HTTP {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_result(False, f"Error: {str(e)}")
        return False

def check_backend_logs():
    """Check backend logs for SMTP warnings"""
    print_test_header("Backend Logs Check")
    
    try:
        import subprocess
        result = subprocess.run([
            "tail", "-n", "20", "/var/log/supervisor/backend.err.log"
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            logs = result.stdout
            
            # Look for SMTP warnings
            smtp_warnings = [line for line in logs.split('\n') if 'SMTP not configured' in line]
            safeguarding_alerts = [line for line in logs.split('\n') if 'SAFEGUARDING ALERT' in line]
            
            if smtp_warnings and safeguarding_alerts:
                print_result(True, "Backend logs show expected behavior", {
                    "safeguarding_alerts_detected": len(safeguarding_alerts),
                    "smtp_warnings_detected": len(smtp_warnings),
                    "latest_smtp_warning": smtp_warnings[-1] if smtp_warnings else None
                })
                return True
            else:
                print_result(False, "Expected SMTP warnings not found in logs", {
                    "smtp_warnings": len(smtp_warnings),
                    "safeguarding_alerts": len(safeguarding_alerts)
                })
                return False
        else:
            print_result(False, f"Could not read logs: {result.stderr}")
            return False
            
    except Exception as e:
        print_result(False, f"Error checking logs: {str(e)}")
        return False

def main():
    """Main testing function"""
    print("🚀 Testing Admin Email Notification Endpoints")
    print(f"Base URL: {BASE_URL}")
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Test results
    results = []
    
    # 1. Test email config endpoint
    results.append(("GET /api/admin/email-config", test_admin_email_config()))
    
    # 2. Test test email endpoint
    results.append(("POST /api/admin/test-email", test_admin_test_email()))
    
    # 3. Test mood with safeguarding keywords
    results.append(("POST /api/mood with safeguarding", test_mood_with_safeguarding()))
    
    # 4. Check backend logs
    results.append(("Backend logs check", check_backend_logs()))
    
    # Print summary
    print_test_header("FINAL SUMMARY")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {status} {test_name}")
    
    if passed == total:
        print("\n🎉 All admin email notification endpoints are working correctly!")
        print("📧 SMTP gracefully handles missing configuration")
        print("🛡️ Safeguarding alerts are created and email notifications are skipped as expected")
        return True
    else:
        print(f"\n⚠️  {total - passed} test(s) failed - review the results above")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)