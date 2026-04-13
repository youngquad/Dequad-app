#!/usr/bin/env python3
"""
Detailed Profile Testing - Check for test profiles and their photos
"""

import requests
import json
import sys

# Configuration
BASE_URL = "https://admin-dashboard-1112.preview.emergentagent.com/api"
ADMIN_EMAIL = "yusufquadri83@gmail.com"
ADMIN_PASSWORD = "Oluwatobi11@"

def get_admin_token():
    """Get admin authentication token"""
    login_data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    response = requests.post(f"{BASE_URL}/auth/admin-login", json=login_data)
    
    if response.status_code == 200:
        login_response = response.json()
        return login_response.get("session_token")
    else:
        print(f"❌ Admin login failed: {response.status_code}")
        return None

def check_all_users(token):
    """Check all users in the system"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try to get admin stats which should show user count
    response = requests.get(f"{BASE_URL}/admin/stats", headers=headers)
    
    if response.status_code == 200:
        stats = response.json()
        print(f"📊 Total users in system: {stats.get('total_users', 'Unknown')}")
        print(f"📊 Total students: {stats.get('total_students', 'Unknown')}")
        return True
    else:
        print(f"❌ Cannot get admin stats: {response.status_code}")
        return False

def check_discover_profiles(token):
    """Check what profiles are available in discover"""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/matches/discover", headers=headers)
    
    if response.status_code == 200:
        profiles = response.json()
        print(f"\n🔍 Discover endpoint returned {len(profiles)} profiles")
        
        test_names = ["Emma Wilson", "James Chen", "Sofia Martinez", "Alex Thompson", "Priya Patel"]
        
        for profile in profiles:
            name = profile.get('name', 'Unknown')
            user_id = profile.get('user_id', 'Unknown')
            photos = profile.get('photos', [])
            has_photos = len(photos) > 0
            
            is_test_profile = name in test_names
            marker = "🎯" if is_test_profile else "👤"
            photo_marker = "📸" if has_photos else "❌"
            
            print(f"{marker} {name} (ID: {user_id}) {photo_marker} Photos: {len(photos)}")
            
            if is_test_profile and has_photos:
                print(f"   ✅ Test profile {name} has {len(photos)} photos")
            elif is_test_profile and not has_photos:
                print(f"   ❌ Test profile {name} missing photos")
        
        # Count test profiles found
        found_test_profiles = [p for p in profiles if p.get('name') in test_names]
        print(f"\n📋 Found {len(found_test_profiles)} out of 5 expected test profiles")
        
        return profiles
    else:
        print(f"❌ Discover endpoint failed: {response.status_code}")
        if response.text:
            print(f"Response: {response.text}")
        return []

def main():
    print("🔍 Detailed Profile Testing")
    print("="*50)
    
    # Get admin token
    token = get_admin_token()
    if not token:
        return 1
    
    print("✅ Admin login successful")
    
    # Check system stats
    check_all_users(token)
    
    # Check discover profiles
    profiles = check_discover_profiles(token)
    
    # Summary
    test_names = ["Emma Wilson", "James Chen", "Sofia Martinez", "Alex Thompson", "Priya Patel"]
    found_test_profiles = [p for p in profiles if p.get('name') in test_names]
    profiles_with_photos = [p for p in found_test_profiles if len(p.get('photos', [])) > 0]
    
    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    print(f"Expected test profiles: 5")
    print(f"Found test profiles: {len(found_test_profiles)}")
    print(f"Test profiles with photos: {len(profiles_with_photos)}")
    
    if len(found_test_profiles) == 5 and len(profiles_with_photos) == 5:
        print("🎉 All test profiles present with photos!")
        return 0
    else:
        print("⚠️ Missing test profiles or photos")
        return 1

if __name__ == "__main__":
    sys.exit(main())