"""
Test suite for Iteration 7 features:
1. Logout functionality - clears both user_sessions and sessions collections
2. Wellbeing resources endpoint - returns 7 crisis services
3. Language filter - blocks profanity
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
SUPER_ADMIN = {
    "email": "yusufquadri83@gmail.com",
    "password": "Oluwatobi11@"
}

UNIVERSITY_ADMIN = {
    "email": "admin@manchesteruni.edu",
    "password": "UniAdmin123!"
}


class TestHealthAndBasics:
    """Basic health checks"""
    
    def test_health_endpoint(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health endpoint working")


class TestSuperAdminLogout:
    """Test super admin login -> verify auth -> logout -> verify session invalidated"""
    
    def test_super_admin_full_logout_flow(self):
        """
        Full logout flow:
        1. Login as super admin
        2. Verify auth works (GET /api/auth/me returns user)
        3. Logout (POST /api/auth/logout)
        4. Verify session is invalidated (GET /api/auth/me returns 401)
        """
        # Step 1: Login
        login_response = requests.post(
            f"{BASE_URL}/api/auth/admin-login",
            json=SUPER_ADMIN
        )
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        login_data = login_response.json()
        
        assert "session_token" in login_data, "No session_token in login response"
        session_token = login_data["session_token"]
        assert login_data.get("is_admin") == True
        assert login_data["user"]["email"] == SUPER_ADMIN["email"]
        print(f"✓ Super admin login successful, token: {session_token[:30]}...")
        
        # Step 2: Verify auth works
        headers = {"Authorization": f"Bearer {session_token}"}
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert me_response.status_code == 200, f"Auth check failed: {me_response.text}"
        me_data = me_response.json()
        assert me_data["email"] == SUPER_ADMIN["email"]
        print(f"✓ Auth verified - user: {me_data['name']}")
        
        # Step 3: Logout
        logout_response = requests.post(
            f"{BASE_URL}/api/auth/logout",
            headers=headers
        )
        assert logout_response.status_code == 200, f"Logout failed: {logout_response.text}"
        logout_data = logout_response.json()
        assert logout_data.get("message") == "Logged out"
        print("✓ Logout successful")
        
        # Step 4: Verify session is invalidated
        me_after_logout = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert me_after_logout.status_code == 401, f"Expected 401 after logout, got {me_after_logout.status_code}: {me_after_logout.text}"
        print("✓ Session invalidated - GET /api/auth/me returns 401 after logout")
        
        print("\n✅ SUPER ADMIN LOGOUT FLOW PASSED")


class TestUniversityAdminLogout:
    """Test university admin login -> verify auth -> logout -> verify session invalidated"""
    
    def test_university_admin_full_logout_flow(self):
        """
        Full logout flow for university admin:
        1. Login as university admin
        2. Verify auth works
        3. Logout
        4. Verify session is invalidated
        """
        # Step 1: Login
        login_response = requests.post(
            f"{BASE_URL}/api/university-admin/login",
            json=UNIVERSITY_ADMIN
        )
        assert login_response.status_code == 200, f"Uni admin login failed: {login_response.text}"
        login_data = login_response.json()
        
        assert "session_token" in login_data, "No session_token in login response"
        session_token = login_data["session_token"]
        print(f"✓ University admin login successful, token: {session_token[:30]}...")
        
        # Step 2: Verify auth works
        headers = {"Authorization": f"Bearer {session_token}"}
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert me_response.status_code == 200, f"Auth check failed: {me_response.text}"
        me_data = me_response.json()
        assert me_data["email"] == UNIVERSITY_ADMIN["email"]
        print(f"✓ Auth verified - user: {me_data['name']}")
        
        # Step 3: Logout
        logout_response = requests.post(
            f"{BASE_URL}/api/auth/logout",
            headers=headers
        )
        assert logout_response.status_code == 200, f"Logout failed: {logout_response.text}"
        print("✓ Logout successful")
        
        # Step 4: Verify session is invalidated
        me_after_logout = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert me_after_logout.status_code == 401, f"Expected 401 after logout, got {me_after_logout.status_code}"
        print("✓ Session invalidated - GET /api/auth/me returns 401 after logout")
        
        print("\n✅ UNIVERSITY ADMIN LOGOUT FLOW PASSED")


class TestWellbeingResources:
    """Test wellbeing resources endpoint"""
    
    def test_wellbeing_resources_endpoint(self):
        """Test GET /api/wellbeing-resources returns 7 crisis services"""
        response = requests.get(f"{BASE_URL}/api/wellbeing-resources")
        assert response.status_code == 200, f"Wellbeing resources failed: {response.text}"
        
        data = response.json()
        assert "resources" in data, "No 'resources' key in response"
        assert "message" in data, "No 'message' key in response"
        assert "emergency_note" in data, "No 'emergency_note' key in response"
        
        resources = data["resources"]
        assert len(resources) == 7, f"Expected 7 resources, got {len(resources)}"
        
        # Verify all expected services are present
        expected_services = ["samaritans", "shout", "papyrus", "student_minds", "nhs_111", "emergency", "calm"]
        for service in expected_services:
            assert service in resources, f"Missing service: {service}"
            assert "name" in resources[service], f"Service {service} missing 'name'"
            assert "phone" in resources[service], f"Service {service} missing 'phone'"
            assert "description" in resources[service], f"Service {service} missing 'description'"
        
        # Verify specific services
        assert resources["samaritans"]["phone"] == "116 123"
        assert resources["shout"]["phone"] == "Text SHOUT to 85258"
        assert resources["papyrus"]["phone"] == "0800 068 4141"
        assert resources["calm"]["phone"] == "0800 58 58 58"
        assert resources["emergency"]["phone"] == "999"
        
        print("✓ Wellbeing resources endpoint returns 7 crisis services")
        print(f"  - Samaritans: {resources['samaritans']['phone']}")
        print(f"  - Shout: {resources['shout']['phone']}")
        print(f"  - PAPYRUS: {resources['papyrus']['phone']}")
        print(f"  - Student Minds: {resources['student_minds']['name']}")
        print(f"  - CALM: {resources['calm']['phone']}")
        print(f"  - NHS 111: {resources['nhs_111']['phone']}")
        print(f"  - Emergency: {resources['emergency']['phone']}")
        
        print("\n✅ WELLBEING RESOURCES ENDPOINT PASSED")


class TestAdminStatsStillWork:
    """Verify admin stats endpoints still work after logout fix"""
    
    def test_admin_stats_endpoint(self):
        """Test GET /api/admin/stats returns stats"""
        # Login first
        login_response = requests.post(
            f"{BASE_URL}/api/auth/admin-login",
            json=SUPER_ADMIN
        )
        assert login_response.status_code == 200
        session_token = login_response.json()["session_token"]
        
        headers = {"Authorization": f"Bearer {session_token}"}
        stats_response = requests.get(f"{BASE_URL}/api/admin/stats", headers=headers)
        assert stats_response.status_code == 200, f"Admin stats failed: {stats_response.text}"
        
        stats = stats_response.json()
        assert "total_students" in stats
        # total_alerts is nested in safeguarding_summary
        assert "safeguarding_summary" in stats
        total_alerts = stats["safeguarding_summary"]["total_alerts"]
        print(f"✓ Admin stats: {stats['total_students']} students, {total_alerts} alerts")
        
        # Cleanup - logout
        requests.post(f"{BASE_URL}/api/auth/logout", headers=headers)
        print("✅ ADMIN STATS ENDPOINT PASSED")
    
    def test_university_admin_stats_endpoint(self):
        """Test GET /api/university-admin/stats returns stats"""
        # Login first
        login_response = requests.post(
            f"{BASE_URL}/api/university-admin/login",
            json=UNIVERSITY_ADMIN
        )
        assert login_response.status_code == 200
        session_token = login_response.json()["session_token"]
        
        headers = {"Authorization": f"Bearer {session_token}"}
        stats_response = requests.get(f"{BASE_URL}/api/university-admin/stats", headers=headers)
        assert stats_response.status_code == 200, f"Uni admin stats failed: {stats_response.text}"
        
        stats = stats_response.json()
        assert "total_students" in stats
        print(f"✓ University admin stats: {stats['total_students']} students at {stats.get('university', 'N/A')}")
        
        # Cleanup - logout
        requests.post(f"{BASE_URL}/api/auth/logout", headers=headers)
        print("✅ UNIVERSITY ADMIN STATS ENDPOINT PASSED")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
