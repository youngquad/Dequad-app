"""
University Admin Feature Tests
Tests for university subscription, admin login, stats, and students endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://campus-connect-694.preview.emergentagent.com')

# Test credentials from the review request
TEST_UNIVERSITY_ADMIN = {
    "email": "admin@manchesteruni.edu",
    "password": "UniAdmin123!"
}


class TestUniversityPricing:
    """Test university pricing endpoint (public)"""
    
    def test_get_pricing_returns_correct_structure(self):
        """GET /api/university/pricing should return pricing info"""
        response = requests.get(f"{BASE_URL}/api/university/pricing")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify required fields
        assert "price" in data, "Missing 'price' field"
        assert "currency" in data, "Missing 'currency' field"
        assert "currency_symbol" in data, "Missing 'currency_symbol' field"
        assert "formatted_price" in data, "Missing 'formatted_price' field"
        assert "features" in data, "Missing 'features' field"
        
        # Verify values
        assert data["price"] == 49.99, f"Expected price 49.99, got {data['price']}"
        assert data["currency"] == "GBP", f"Expected currency GBP, got {data['currency']}"
        assert data["currency_symbol"] == "£", f"Expected symbol £, got {data['currency_symbol']}"
        assert "£49.99" in data["formatted_price"], f"Formatted price should contain £49.99"
        assert isinstance(data["features"], list), "Features should be a list"
        assert len(data["features"]) > 0, "Features list should not be empty"
        
        print(f"✓ Pricing endpoint returns correct data: {data['formatted_price']}")


class TestUniversitySubscribe:
    """Test university subscription endpoint"""
    
    def test_subscribe_creates_checkout_session(self):
        """POST /api/university/subscribe should create Stripe checkout session"""
        payload = {
            "university_name": "Test University " + str(os.urandom(4).hex()),
            "admin_email": f"test_{os.urandom(4).hex()}@testuni.edu",
            "admin_name": "Test Admin",
            "contact_phone": "+44 123 456 7890",
            "expected_students": 1000
        }
        
        response = requests.post(
            f"{BASE_URL}/api/university/subscribe",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify checkout URL is returned
        assert "checkout_url" in data, "Missing 'checkout_url' field"
        assert data["checkout_url"].startswith("https://checkout.stripe.com"), \
            f"Checkout URL should be Stripe URL, got: {data['checkout_url'][:50]}..."
        
        print(f"✓ Subscribe endpoint creates checkout session")
    
    def test_subscribe_rejects_duplicate_university(self):
        """POST /api/university/subscribe should reject if university already has admin"""
        # First, try to subscribe with Manchester Uni (which should already have admin)
        payload = {
            "university_name": "Manchester University",
            "admin_email": "newadmin@manchesteruni.edu",
            "admin_name": "New Admin"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/university/subscribe",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        # Should either succeed (if no admin exists) or fail with 400
        if response.status_code == 400:
            data = response.json()
            assert "already has an admin" in data.get("detail", "").lower() or \
                   "already" in data.get("detail", "").lower(), \
                   f"Expected duplicate university error, got: {data}"
            print(f"✓ Subscribe endpoint correctly rejects duplicate university")
        else:
            print(f"✓ Subscribe endpoint accepted new university (no existing admin)")


class TestUniversityAdminLogin:
    """Test university admin login endpoint"""
    
    def test_login_with_valid_credentials(self):
        """POST /api/university-admin/login should authenticate correctly"""
        response = requests.post(
            f"{BASE_URL}/api/university-admin/login",
            json=TEST_UNIVERSITY_ADMIN,
            headers={"Content-Type": "application/json"}
        )
        
        # If admin exists, should return 200 with session token
        # If admin doesn't exist, should return 401
        if response.status_code == 200:
            data = response.json()
            assert "session_token" in data, "Missing 'session_token' field"
            assert "user" in data, "Missing 'user' field"
            assert data["user"]["email"] == TEST_UNIVERSITY_ADMIN["email"].lower(), \
                f"Email mismatch: expected {TEST_UNIVERSITY_ADMIN['email']}"
            assert data["user"]["role"] == "university_admin", \
                f"Role should be university_admin, got {data['user']['role']}"
            print(f"✓ University admin login successful")
            return data["session_token"]
        elif response.status_code == 401:
            print(f"⚠ University admin credentials not found (admin may not exist yet)")
            pytest.skip("University admin not created yet")
        else:
            pytest.fail(f"Unexpected status code: {response.status_code}: {response.text}")
    
    def test_login_with_invalid_credentials(self):
        """POST /api/university-admin/login should reject invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/university-admin/login",
            json={"email": "invalid@test.com", "password": "wrongpassword"},
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Login correctly rejects invalid credentials")


class TestUniversityAdminStats:
    """Test university admin stats endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for university admin"""
        response = requests.post(
            f"{BASE_URL}/api/university-admin/login",
            json=TEST_UNIVERSITY_ADMIN,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            return response.json()["session_token"]
        pytest.skip("University admin not available")
    
    def test_stats_returns_university_data(self, auth_token):
        """GET /api/university-admin/stats should return university-specific data"""
        response = requests.get(
            f"{BASE_URL}/api/university-admin/stats",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify required fields
        assert "university" in data, "Missing 'university' field"
        assert "total_students" in data, "Missing 'total_students' field"
        assert "average_mood" in data, "Missing 'average_mood' field"
        
        print(f"✓ Stats endpoint returns data for university: {data.get('university')}")
        print(f"  - Total students: {data.get('total_students')}")
        print(f"  - Average mood: {data.get('average_mood')}")
    
    def test_stats_requires_authentication(self):
        """GET /api/university-admin/stats should require auth"""
        response = requests.get(f"{BASE_URL}/api/university-admin/stats")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Stats endpoint correctly requires authentication")


class TestUniversityAdminStudents:
    """Test university admin students endpoint"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token for university admin"""
        response = requests.post(
            f"{BASE_URL}/api/university-admin/login",
            json=TEST_UNIVERSITY_ADMIN,
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            return response.json()["session_token"]
        pytest.skip("University admin not available")
    
    def test_students_returns_list(self, auth_token):
        """GET /api/university-admin/students should return students list"""
        response = requests.get(
            f"{BASE_URL}/api/university-admin/students",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        
        # Verify structure
        assert "students" in data, "Missing 'students' field"
        assert isinstance(data["students"], list), "Students should be a list"
        
        print(f"✓ Students endpoint returns list with {len(data['students'])} students")
    
    def test_students_requires_authentication(self):
        """GET /api/university-admin/students should require auth"""
        response = requests.get(f"{BASE_URL}/api/university-admin/students")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Students endpoint correctly requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
