"""
Backend API Tests for DEQUAD - Post-Refactor Regression Tests
Tests all critical endpoints after backend was refactored from monolithic server.py to modular APIRouter files.

Modules tested:
- Core routes (/, /health, /download/presentation)
- Auth routes (admin-login)
- Admin routes (stats, users, safeguarding-alerts, universities)
- University Admin routes (login, stats, students)
- Subscription routes (status)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials from test_credentials.md
SUPER_ADMIN_EMAIL = "yusufquadri83@gmail.com"
SUPER_ADMIN_PASSWORD = "Oluwatobi11@"
ADMIN_CODE = "DEQUAD_ADMIN_2024"

UNI_ADMIN_EMAIL = "admin@manchesteruni.edu"
UNI_ADMIN_PASSWORD = "UniAdmin123!"


class TestCoreRoutes:
    """Core API endpoints - /, /health, /download/presentation"""
    
    def test_root_endpoint(self):
        """GET /api/ returns DEQUAD API status"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "DEQUAD API"
        assert data["status"] == "running"
        print("✓ Root endpoint returns correct status")
    
    def test_health_endpoint(self):
        """GET /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        print("✓ Health endpoint returns healthy status")
    
    def test_download_presentation(self):
        """GET /api/download/presentation returns PPTX file (HTTP 200, size > 100KB)"""
        response = requests.get(f"{BASE_URL}/api/download/presentation", stream=True)
        assert response.status_code == 200
        
        # Check content type
        content_type = response.headers.get('content-type', '')
        assert 'application/vnd.openxmlformats-officedocument.presentationml.presentation' in content_type or 'application/octet-stream' in content_type
        
        # Check file size > 100KB
        content_length = int(response.headers.get('content-length', 0))
        assert content_length > 100000, f"File size {content_length} should be > 100KB"
        print(f"✓ Presentation download works (size: {content_length} bytes)")


class TestAdminAuth:
    """Admin authentication endpoints"""
    
    def test_admin_login_success(self):
        """POST /api/auth/admin-login with valid credentials returns session token"""
        response = requests.post(f"{BASE_URL}/api/auth/admin-login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        
        assert "session_token" in data
        assert data["is_admin"] == True
        assert "user" in data
        assert data["user"]["email"] == SUPER_ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        print("✓ Admin login successful")
        return data["session_token"]
    
    def test_admin_login_invalid_credentials(self):
        """POST /api/auth/admin-login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/admin-login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Admin login correctly rejects invalid credentials")


class TestUniversityAdminAuth:
    """University admin authentication endpoints"""
    
    def test_university_admin_login_success(self):
        """POST /api/university-admin/login with valid credentials returns session token"""
        response = requests.post(f"{BASE_URL}/api/university-admin/login", json={
            "email": UNI_ADMIN_EMAIL,
            "password": UNI_ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        
        assert "session_token" in data
        assert "user" in data
        assert data["user"]["email"] == UNI_ADMIN_EMAIL
        assert data["user"]["role"] == "university_admin"
        assert data["user"]["university_admin_for"] == "University of Manchester"
        print("✓ University admin login successful")
        return data["session_token"]
    
    def test_university_admin_login_invalid_credentials(self):
        """POST /api/university-admin/login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/university-admin/login", json={
            "email": UNI_ADMIN_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ University admin login correctly rejects invalid credentials")


class TestAdminEndpoints:
    """Admin-only endpoints requiring authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get admin token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/admin-login", json={
            "email": SUPER_ADMIN_EMAIL,
            "password": SUPER_ADMIN_PASSWORD
        })
        if response.status_code == 200:
            self.admin_token = response.json()["session_token"]
        else:
            pytest.skip("Admin authentication failed")
    
    def test_admin_stats(self):
        """GET /api/admin/stats returns stats including total_students, university_breakdown, safeguarding_summary"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        assert "total_students" in data
        assert "university_breakdown" in data
        assert "safeguarding_summary" in data
        assert isinstance(data["total_students"], int)
        assert isinstance(data["university_breakdown"], list)
        assert "total_alerts" in data["safeguarding_summary"]
        print(f"✓ Admin stats returned (total_students: {data['total_students']})")
    
    def test_admin_stats_requires_auth(self):
        """GET /api/admin/stats without token returns 401/403"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code in [401, 403]
        print("✓ Admin stats correctly requires authentication")
    
    def test_admin_users(self):
        """GET /api/admin/users returns user list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0
        # Verify user structure
        user = data[0]
        assert "user_id" in user
        assert "email" in user
        print(f"✓ Admin users returned ({len(data)} users)")
    
    def test_admin_safeguarding_alerts(self):
        """GET /api/admin/safeguarding-alerts returns alerts"""
        response = requests.get(
            f"{BASE_URL}/api/admin/safeguarding-alerts",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "alerts" in data
        assert "unacknowledged_count" in data
        assert "high_risk_count" in data
        assert "total_count" in data
        assert isinstance(data["alerts"], list)
        print(f"✓ Safeguarding alerts returned (total: {data['total_count']})")
    
    def test_admin_universities(self):
        """GET /api/admin/universities returns universities list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/universities",
            headers={"Authorization": f"Bearer {self.admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "universities" in data
        assert "total_universities" in data
        assert isinstance(data["universities"], list)
        if len(data["universities"]) > 0:
            uni = data["universities"][0]
            assert "name" in uni
            assert "student_count" in uni
        print(f"✓ Universities list returned ({data['total_universities']} universities)")


class TestUniversityAdminEndpoints:
    """University admin endpoints requiring authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get university admin token before each test"""
        response = requests.post(f"{BASE_URL}/api/university-admin/login", json={
            "email": UNI_ADMIN_EMAIL,
            "password": UNI_ADMIN_PASSWORD
        })
        if response.status_code == 200:
            self.uni_admin_token = response.json()["session_token"]
        else:
            pytest.skip("University admin authentication failed")
    
    def test_university_admin_stats(self):
        """GET /api/university-admin/stats returns university-scoped stats"""
        response = requests.get(
            f"{BASE_URL}/api/university-admin/stats",
            headers={"Authorization": f"Bearer {self.uni_admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "university" in data
        assert data["university"] == "University of Manchester"
        assert "total_students" in data
        assert "total_mood_entries" in data
        assert "safeguarding_alerts" in data
        print(f"✓ University admin stats returned (students: {data['total_students']})")
    
    def test_university_admin_stats_requires_auth(self):
        """GET /api/university-admin/stats without token returns 401/403"""
        response = requests.get(f"{BASE_URL}/api/university-admin/stats")
        assert response.status_code in [401, 403]
        print("✓ University admin stats correctly requires authentication")
    
    def test_university_admin_students(self):
        """GET /api/university-admin/students returns student list"""
        response = requests.get(
            f"{BASE_URL}/api/university-admin/students",
            headers={"Authorization": f"Bearer {self.uni_admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "students" in data
        assert "total" in data
        assert isinstance(data["students"], list)
        # Verify students are from correct university
        for student in data["students"]:
            assert student["university"] == "University of Manchester"
        print(f"✓ University admin students returned ({data['total']} students)")
    
    def test_university_admin_students_requires_auth(self):
        """GET /api/university-admin/students without token returns 401/403"""
        response = requests.get(f"{BASE_URL}/api/university-admin/students")
        assert response.status_code in [401, 403]
        print("✓ University admin students correctly requires authentication")


class TestSubscriptionEndpoints:
    """Subscription-related endpoints"""
    
    def test_subscription_status_requires_auth(self):
        """GET /api/subscription/status requires authentication"""
        response = requests.get(f"{BASE_URL}/api/subscription/status")
        assert response.status_code in [401, 403]
        data = response.json()
        assert "detail" in data
        print("✓ Subscription status correctly requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
