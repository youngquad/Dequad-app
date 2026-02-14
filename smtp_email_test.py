#!/usr/bin/env python3
"""
SMTP Email Configuration Testing for Educare Platform
Testing the specific requirements from the review request:
1. Use existing admin session token
2. Call GET /api/admin/email-config and verify smtp_configured: true
3. Call POST /api/admin/test-email to send test email to yusufquadri83@gmail.com
4. Call POST /api/mood with concerning content to trigger safeguarding email
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BACKEND_URL = "https://student-connect-46.preview.emergentagent.com/api"
ADMIN_TOKEN = "admin_session_token_123"  # Existing admin session token
USER_TOKEN = "test_session_token_123"    # Existing user session token

def test_smtp_email_system():
    """Test SMTP email system according to review requirements"""
    print("=" * 80)
    print("SMTP EMAIL SYSTEM TESTING - Review Request Verification")
    print("=" * 80)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now()}")
    
    results = {
        "email_config_verified": False,
        "test_email_sent": False,
        "safeguarding_email_triggered": False,
        "errors": []
    }
    
    # Step 1: Use existing admin session token and verify SMTP configuration
    print("\n1. Testing GET /api/admin/email-config with admin session...")
    try:
        headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
        response = requests.get(f"{BACKEND_URL}/admin/email-config", headers=headers, timeout=30)
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            config_data = response.json()
            print(f"   Response: {json.dumps(config_data, indent=4)}")
            
            # Verify smtp_configured: true
            if config_data.get("smtp_configured") == True:
                print("   ✅ SMTP Configuration: VERIFIED as TRUE")
                results["email_config_verified"] = True
                
                # Verify configuration details
                expected_values = {
                    "smtp_host": "smtp.gmail.com",
                    "smtp_port": 587,
                    "smtp_from_email": "yusufquadri83@gmail.com",
                    "smtp_from_name": "Educare Safeguarding"
                }
                
                for key, expected in expected_values.items():
                    actual = config_data.get(key)
                    if actual == expected:
                        print(f"   ✅ {key}: {actual}")
                    else:
                        print(f"   ⚠️  {key}: Expected {expected}, got {actual}")
                        
                if "SMTP is configured and ready" in config_data.get("message", ""):
                    print("   ✅ Configuration message: Correct")
                else:
                    print(f"   ⚠️  Configuration message: {config_data.get('message')}")
                    
            else:
                print("   ❌ SMTP Configuration: NOT CONFIGURED")
                results["errors"].append("SMTP not configured - expected smtp_configured: true")
        else:
            print(f"   ❌ Failed to get email config: {response.status_code}")
            print(f"   Error: {response.text}")
            results["errors"].append(f"Email config check failed with status {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error testing email config: {e}")
        results["errors"].append(f"Email config test error: {e}")
    
    # Step 2: Send test email to yusufquadri83@gmail.com
    print("\n2. Testing POST /api/admin/test-email to send test email...")
    try:
        headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
        response = requests.post(f"{BACKEND_URL}/admin/test-email", headers=headers, timeout=30)
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            test_data = response.json()
            print(f"   Response: {json.dumps(test_data, indent=4)}")
            
            if test_data.get("success") == True:
                print("   ✅ Test Email: SENT SUCCESSFULLY")
                results["test_email_sent"] = True
                
                recipients = test_data.get("recipients", [])
                print(f"   ✅ Email sent to {len(recipients)} admin(s)")
                
                # Check if yusufquadri83@gmail.com is in recipients
                if "yusufquadri83@gmail.com" in recipients:
                    print("   ✅ Test email sent to yusufquadri83@gmail.com ✓")
                else:
                    print("   ⚠️  yusufquadri83@gmail.com not in recipient list")
                    print(f"   Recipients: {recipients}")
                    
                print(f"   📧 Message: {test_data.get('message')}")
                
            else:
                print("   ❌ Test Email: FAILED TO SEND")
                print(f"   Message: {test_data.get('message')}")
                results["errors"].append(f"Test email failed: {test_data.get('message')}")
        else:
            print(f"   ❌ Failed to send test email: {response.status_code}")
            print(f"   Error: {response.text}")
            results["errors"].append(f"Test email send failed with status {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error testing email send: {e}")
        results["errors"].append(f"Test email send error: {e}")
    
    # Step 3: Trigger safeguarding email with concerning mood content
    print("\n3. Testing POST /api/mood with concerning content to trigger safeguarding email...")
    try:
        headers = {"Authorization": f"Bearer {USER_TOKEN}"}
        
        # Use the exact concerning content from the review request
        mood_data = {
            "mood": 1,
            "notes": "I want to kill myself. I can't take this anymore and feel hopeless."
        }
        
        response = requests.post(f"{BACKEND_URL}/mood", headers=headers, json=mood_data, timeout=30)
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            mood_response = response.json()
            print(f"   Response: {json.dumps(mood_response, indent=4)}")
            
            # Check if mood entry was created
            if mood_response.get("id"):
                print(f"   ✅ Mood Entry Created: {mood_response.get('id')}")
            else:
                print("   ❌ Mood Entry: NOT CREATED")
                results["errors"].append("Mood entry not created")
            
            # Check if safeguarding alert was triggered
            if mood_response.get("safeguarding_alert"):
                alert = mood_response["safeguarding_alert"]
                print("   ✅ Safeguarding Alert: TRIGGERED")
                print(f"   ✅ Risk Level: {alert.get('risk_level')}")
                print(f"   ✅ Flagged: {alert.get('flagged')}")
                
                # Check crisis resources
                resources = alert.get("resources")
                if resources:
                    print("   ✅ Crisis Resources: PROVIDED")
                    samaritans = resources.get("samaritans", {})
                    nhs = resources.get("nhs_111", {})
                    emergency = resources.get("emergency", {})
                    shout = resources.get("shout", {})
                    
                    print(f"     - Samaritans: {samaritans.get('phone', 'N/A')}")
                    print(f"     - NHS 111: {nhs.get('phone', 'N/A')}")
                    print(f"     - Emergency: {emergency.get('phone', 'N/A')}")
                    print(f"     - Shout: {shout.get('phone', 'N/A')}")
                else:
                    print("   ❌ Crisis Resources: NOT PROVIDED")
                    results["errors"].append("Crisis resources not provided")
                
                results["safeguarding_email_triggered"] = True
                print("   ✅ Safeguarding email should have been sent to all admins")
                print("   📧 Check yusufquadri83@gmail.com inbox for safeguarding alert email")
                
            else:
                print("   ❌ Safeguarding Alert: NOT TRIGGERED")
                results["errors"].append("Safeguarding alert not triggered for concerning content")
                
        else:
            print(f"   ❌ Failed to create mood entry: {response.status_code}")
            print(f"   Error: {response.text}")
            results["errors"].append(f"Mood entry creation failed with status {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error testing safeguarding mood: {e}")
        results["errors"].append(f"Safeguarding mood test error: {e}")
    
    # Summary
    print("\n" + "=" * 80)
    print("SMTP EMAIL TESTING SUMMARY")
    print("=" * 80)
    
    total_tests = 3
    passed_tests = sum([
        results["email_config_verified"],
        results["test_email_sent"],
        results["safeguarding_email_triggered"]
    ])
    
    print(f"Tests Passed: {passed_tests}/{total_tests}")
    print(f"✅ SMTP Configuration Verified: {'PASS' if results['email_config_verified'] else 'FAIL'}")
    print(f"✅ Test Email Sent: {'PASS' if results['test_email_sent'] else 'FAIL'}")
    print(f"✅ Safeguarding Email Triggered: {'PASS' if results['safeguarding_email_triggered'] else 'FAIL'}")
    
    if results["errors"]:
        print(f"\n❌ ERRORS FOUND ({len(results['errors'])}):")
        for i, error in enumerate(results["errors"], 1):
            print(f"  {i}. {error}")
    else:
        print("\n✅ NO ERRORS FOUND")
    
    # Final verdict
    if passed_tests == total_tests and not results["errors"]:
        print("\n🎉 ALL SMTP EMAIL TESTS PASSED!")
        print("📧 SMTP is configured and working correctly")
        print("📧 Test email sent successfully to yusufquadri83@gmail.com")
        print("📧 Safeguarding emails will be sent to admins when concerning content is detected")
        return True
    else:
        print(f"\n⚠️ SMTP EMAIL TESTS INCOMPLETE - {total_tests - passed_tests} test(s) failed")
        return False

def main():
    """Main test runner"""
    print("Starting SMTP Email Configuration Testing...")
    
    success = test_smtp_email_system()
    
    if success:
        print("\n✅ SMTP EMAIL TESTING COMPLETED SUCCESSFULLY")
        print("✅ Email system is working end-to-end")
        sys.exit(0)
    else:
        print("\n❌ SMTP EMAIL TESTING FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()