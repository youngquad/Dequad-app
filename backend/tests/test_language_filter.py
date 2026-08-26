"""
Test suite for language filter and chat features in DEQUAD
Tests: profanity filter, racist language filter, clean messages, demo chat data
"""
import pytest
import requests
import os
import sys

# Add backend to path for imports
sys.path.insert(0, '/app/backend')

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestLanguageFilter:
    """Test the language filter functionality via API"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Get admin token for authenticated requests
        login_response = self.session.post(f"{BASE_URL}/api/auth/admin-login", json={
            "email": "yusufquadri83@gmail.com",
            "password": "Oluwatobi11@",
            "admin_code": "DEQUAD_ADMIN_2024"
        })
        if login_response.status_code == 200:
            self.admin_token = login_response.json().get("session_token")
            self.session.headers.update({"Authorization": f"Bearer {self.admin_token}"})
        else:
            pytest.skip("Admin login failed - skipping authenticated tests")
    
    def test_health_check(self):
        """Test API health endpoint"""
        response = self.session.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ Health check passed")
    
    def test_admin_login_works(self):
        """Test admin login still works after changes"""
        response = self.session.post(f"{BASE_URL}/api/auth/admin-login", json={
            "email": "yusufquadri83@gmail.com",
            "password": "Oluwatobi11@",
            "admin_code": "DEQUAD_ADMIN_2024"
        })
        assert response.status_code == 200
        data = response.json()
        assert "session_token" in data
        assert data["user"]["email"] == "yusufquadri83@gmail.com"
        print("✓ Admin login works correctly")
    
    def test_university_admin_login_works(self):
        """Test university admin login still works after changes"""
        response = self.session.post(f"{BASE_URL}/api/university-admin/login", json={
            "email": "admin@manchesteruni.edu",
            "password": "UniAdmin123!"
        })
        assert response.status_code == 200
        data = response.json()
        assert "session_token" in data
        assert data["user"]["email"] == "admin@manchesteruni.edu"
        print("✓ University admin login works correctly")
    
    def test_admin_stats_endpoint(self):
        """Test admin stats endpoint returns data"""
        response = self.session.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_students" in data
        print(f"✓ Admin stats: {data.get('total_students')} students")


class TestChatLanguageFilter:
    """Test chat endpoint with language filter - requires student auth (Google OAuth)
    Since we can't authenticate as students, we test the filter function directly"""
    
    def test_language_filter_function_clean_message(self):
        """Test that clean messages pass through"""
        from helpers.safeguarding import check_language_filter
        result = check_language_filter("Hello, how are you doing today?")
        assert result["blocked"] == False
        assert result["reason"] is None
        print("✓ Clean message passes filter")
    
    def test_language_filter_function_profanity(self):
        """Test that profanity is blocked"""
        from helpers.safeguarding import check_language_filter
        result = check_language_filter("This is fucking bullshit")
        assert result["blocked"] == True
        assert result["reason"] == "profanity"
        assert "fucking" in result["matched"]
        assert "bullshit" in result["matched"]
        print("✓ Profanity is blocked correctly")
    
    def test_language_filter_function_racist_n_word(self):
        """Test that racist n-word is blocked"""
        from helpers.safeguarding import check_language_filter
        result = check_language_filter("nigger")
        assert result["blocked"] == True
        assert result["reason"] == "racist_language"
        assert "nigger" in result["matched"]
        print("✓ Racist n-word is blocked")
    
    def test_language_filter_function_white_power(self):
        """Test that 'white power' is blocked"""
        from helpers.safeguarding import check_language_filter
        result = check_language_filter("white power")
        assert result["blocked"] == True
        assert result["reason"] == "racist_language"
        assert "white power" in result["matched"]
        print("✓ 'White power' is blocked")
    
    def test_language_filter_function_mixed_case(self):
        """Test filter works with mixed case"""
        from helpers.safeguarding import check_language_filter
        result = check_language_filter("FUCKING hell")
        assert result["blocked"] == True
        assert result["reason"] == "profanity"
        print("✓ Mixed case profanity is blocked")
    
    def test_language_filter_function_leet_speak(self):
        """Test filter catches leet speak variations"""
        from helpers.safeguarding import check_language_filter
        result = check_language_filter("n1gger")
        assert result["blocked"] == True
        assert result["reason"] == "racist_language"
        print("✓ Leet speak racist language is blocked")
    
    def test_language_filter_function_empty_string(self):
        """Test filter handles empty string"""
        from helpers.safeguarding import check_language_filter
        result = check_language_filter("")
        assert result["blocked"] == False
        print("✓ Empty string passes filter")
    
    def test_language_filter_function_none(self):
        """Test filter handles None"""
        from helpers.safeguarding import check_language_filter
        result = check_language_filter(None)
        assert result["blocked"] == False
        print("✓ None passes filter")


class TestDemoChatData:
    """Test that demo chat data exists in database"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup async database connection"""
        import asyncio
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
    
    def teardown_method(self):
        """Cleanup event loop"""
        self.loop.close()
    
    def test_demo_chat_messages_exist(self):
        """Test that demo chat messages are seeded"""
        import asyncio
        from database import db
        
        async def check_messages():
            count = await db.chat_messages.count_documents({})
            return count
        
        count = self.loop.run_until_complete(check_messages())
        assert count >= 20, f"Expected at least 20 demo messages, got {count}"
        print(f"✓ Demo chat messages exist: {count} messages")
    
    def test_demo_matches_exist(self):
        """Test that demo matches are seeded for test-user-001"""
        # Sync pymongo: the shared motor client is bound to a loop that other
        # tests in this class close, so reuse of `db` here raises
        # "Event loop is closed".
        from pymongo import MongoClient
        from dotenv import dotenv_values
        import os as _os
        _be = dotenv_values("/app/backend/.env")
        _client = MongoClient(_os.environ.get("MONGO_URL") or _be["MONGO_URL"])
        _db = _client[_os.environ.get("DB_NAME") or _be["DB_NAME"]]
        matches = list(_db.matches.find({"user_id": "test-user-001", "status": "accepted"}).limit(10))
        assert len(matches) >= 2, f"Expected at least 2 matches for test-user-001, got {len(matches)}"
        
        matched_users = [m["matched_user_id"] for m in matches]
        assert "test-user-002" in matched_users, "test-user-001 should be matched with test-user-002"
        assert "test-user-006" in matched_users, "test-user-001 should be matched with test-user-006"
        print(f"✓ Demo matches exist: test-user-001 matched with {matched_users}")
    
    def test_chat_messages_have_correct_structure(self):
        """Test that chat messages have required fields"""
        from pymongo import MongoClient
        from dotenv import dotenv_values
        import os as _os
        _be = dotenv_values("/app/backend/.env")
        _client = MongoClient(_os.environ.get("MONGO_URL") or _be["MONGO_URL"])
        _db = _client[_os.environ.get("DB_NAME") or _be["DB_NAME"]]
        msg = _db.chat_messages.find_one({})
        assert msg is not None, "No chat messages found"
        assert "match_id" in msg, "Chat message missing match_id"
        assert "sender_id" in msg, "Chat message missing sender_id"
        assert "text" in msg, "Chat message missing text"
        assert "created_at" in msg, "Chat message missing created_at"
        print("✓ Chat messages have correct structure")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
