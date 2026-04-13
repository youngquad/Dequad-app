#!/usr/bin/env python3
import requests

BASE_URL = "https://admin-dashboard-1112.preview.emergentagent.com/api"

def test_api():
    print("Testing API responses...")
    
    # Test GET /matches/discover
    try:
        response = requests.get(f"{BASE_URL}/matches/discover", timeout=10)
        print(f"GET /matches/discover:")
        print(f"  Status Code: {response.status_code}")
        print(f"  Response: {response.text}")
        print(f"  Headers: {dict(response.headers)}")
    except Exception as e:
        print(f"Error: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test POST /matches/swipe
    try:
        response = requests.post(
            f"{BASE_URL}/matches/swipe", 
            json={"target_user_id": "test", "action": "like"},
            timeout=10
        )
        print(f"POST /matches/swipe:")
        print(f"  Status Code: {response.status_code}")
        print(f"  Response: {response.text}")
        print(f"  Headers: {dict(response.headers)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()