#!/usr/bin/env python3
"""
Debug Admin Profile and User Database
"""

import requests
import json
import sys

# Configuration
BASE_URL = "https://5888b71c-e2f0-406e-bddc-c8c11971bcea.preview.emergentagent.com/api"
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

def check_admin_profile(token):
    """Check admin user profile"""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    
    if response.status_code == 200:
        profile = response.json()
        print("👤 Admin Profile:")
        print(f"   Name: {profile.get('name', 'Unknown')}")
        print(f"   Email: {profile.get('email', 'Unknown')}")
        print(f"   Role: {profile.get('role', 'Unknown')}")
        print(f"   Interested in: {profile.get('interested_in', [])}")
        print(f"   Gender: {profile.get('gender', 'Not set')}")
        print(f"   University: {profile.get('university', 'Not set')}")
        
        return profile
    else:
        print(f"❌ Cannot get admin profile: {response.status_code}")
        return None

def update_admin_preferences(token):
    """Update admin preferences to see all profiles"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Set admin to be interested in everyone
    update_data = {
        "interested_in": ["everyone"],
        "gender": "non-binary"  # Set a gender too
    }
    
    response = requests.put(f"{BASE_URL}/profile", json=update_data, headers=headers)
    
    if response.status_code == 200:
        print("✅ Updated admin preferences to see all profiles")
        return True
    else:
        print(f"❌ Failed to update admin preferences: {response.status_code}")
        return False

def test_discover_after_update(token):
    """Test discover endpoint after updating preferences"""
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(f"{BASE_URL}/matches/discover", headers=headers)
    
    if response.status_code == 200:
        profiles = response.json()
        print(f"\n🔍 After preference update: {len(profiles)} profiles found")
        
        test_names = ["Emma Wilson", "James Chen", "Sofia Martinez", "Alex Thompson", "Priya Patel"]
        
        for profile in profiles:
            name = profile.get('name', 'Unknown')
            user_id = profile.get('user_id', 'Unknown')
            photos = profile.get('photos', [])
            role = profile.get('role', 'Unknown')
            
            is_test_profile = name in test_names
            marker = "🎯" if is_test_profile else "👤"
            photo_marker = "📸" if len(photos) > 0 else "❌"
            
            print(f"{marker} {name} (Role: {role}) {photo_marker} Photos: {len(photos)}")
        
        return profiles
    else:
        print(f"❌ Discover still failing: {response.status_code}")
        return []

def main():
    print("🔧 Debug Admin Profile and Preferences")
    print("="*50)
    
    # Get admin token
    token = get_admin_token()
    if not token:
        return 1
    
    print("✅ Admin login successful")
    
    # Check current admin profile
    profile = check_admin_profile(token)
    if not profile:
        return 1
    
    # Update admin preferences to see all profiles
    if update_admin_preferences(token):
        # Test discover again
        profiles = test_discover_after_update(token)
        
        # Check for test profiles
        test_names = ["Emma Wilson", "James Chen", "Sofia Martinez", "Alex Thompson", "Priya Patel"]
        found_test_profiles = [p for p in profiles if p.get('name') in test_names]
        
        print(f"\n📋 Found {len(found_test_profiles)} test profiles after preference update")
        
        if len(found_test_profiles) > 0:
            print("✅ Test profiles are present in database")
            return 0
        else:
            print("❌ Test profiles still not found - they may not exist in database")
            return 1
    else:
        return 1

if __name__ == "__main__":
    sys.exit(main())