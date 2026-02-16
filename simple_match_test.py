#!/usr/bin/env python3
"""
Simple focused test for the specific review request items
"""

import requests
import json
import sys
import time

# Configuration
BASE_URL = "https://github-retriever-1.preview.emergentagent.com/api"

def make_request(method, endpoint, token=None, data=None):
    """Make HTTP request with proper headers"""
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=30)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        return response
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return None

def test_picture_field():
    """Test that discover endpoint includes picture field"""
    print("🧪 Testing Picture Field in Discover Endpoint")
    print("=" * 50)
    
    # Use existing valid session
    token = "00af097StFShlz6lrx-CEg2l1ITj5_9TCJiSCjZ4oF0"
    
    # First, let's create a fresh user that can be discovered
    try:
        import subprocess
        result = subprocess.run([
            "mongosh", "test_database", "--eval",
            """
            // Create a discoverable user
            db.users.insertOne({
              user_id: 'discoverable_user_123',
              email: 'discoverable@test.com',
              name: 'Discoverable User',
              picture: 'https://example.com/discoverable.jpg',
              role: 'student',
              interests: ['Art', 'Music'],
              university: 'Harvard',
              gender: 'man',
              interested_in: ['women', 'men', 'everyone'],
              notifications_enabled: true,
              created_at: new Date()
            });
            print('Discoverable user created');
            """
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ Created discoverable user")
        else:
            print(f"⚠️  Could not create discoverable user: {result.stderr}")
    except Exception as e:
        print(f"⚠️  Error creating discoverable user: {e}")
    
    # Test discover endpoint
    response = make_request("GET", "/matches/discover", token=token)
    
    if response and response.status_code == 200:
        try:
            matches = response.json()
            print(f"📊 Found {len(matches)} potential matches")
            
            if len(matches) > 0:
                # Check if any match has picture field
                has_picture_field = False
                for i, match in enumerate(matches[:3]):  # Check first 3
                    user_id = match.get("user_id", "unknown")
                    picture = match.get("picture")
                    
                    print(f"   Match {i+1}: {user_id}")
                    if "picture" in match:
                        has_picture_field = True
                        print(f"      ✅ Has picture field: {picture}")
                    else:
                        print(f"      ❌ Missing picture field")
                    
                    # Show other fields for context
                    name = match.get("name", "No name")
                    match_score = match.get("match_score", "No score")
                    print(f"      Name: {name}, Score: {match_score}")
                
                if has_picture_field:
                    print("\n✅ PASS: Picture field is present in discover endpoint")
                    return True
                else:
                    print("\n❌ FAIL: Picture field is missing from all matches")
                    return False
            else:
                print("⚠️  No matches found - cannot test picture field")
                print("   This could be because:")
                print("   - All compatible users have already been swiped on")
                print("   - No users match the current user's preferences")
                print("   - Current user has incompatible preferences")
                return False
                
        except json.JSONDecodeError:
            print("❌ FAIL: Invalid JSON response from discover endpoint")
            return False
    else:
        print(f"❌ FAIL: Discover endpoint failed with status {response.status_code if response else 'No response'}")
        return False

def test_match_notifications():
    """Test that both users get notifications when a match occurs"""
    print("\n🧪 Testing Match Notifications")
    print("=" * 50)
    
    # Get two existing valid sessions
    try:
        import subprocess
        result = subprocess.run([
            "mongosh", "test_database", "--eval",
            """
            var sessions = db.user_sessions.find({expires_at: {$gt: new Date()}}).limit(2).toArray();
            if (sessions.length >= 2) {
                print('USER_A:' + sessions[0].user_id + ':' + sessions[0].session_token);
                print('USER_B:' + sessions[1].user_id + ':' + sessions[1].session_token);
            } else {
                print('ERROR: Not enough valid sessions');
            }
            """
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0 and "USER_A:" in result.stdout:
            lines = result.stdout.strip().split('\n')
            user_a_line = [l for l in lines if l.startswith('USER_A:')][0]
            user_b_line = [l for l in lines if l.startswith('USER_B:')][0]
            
            _, user_a_id, token_a = user_a_line.split(':', 2)
            _, user_b_id, token_b = user_b_line.split(':', 2)
            
            print(f"📋 Using existing users:")
            print(f"   User A: {user_a_id}")
            print(f"   User B: {user_b_id}")
        else:
            print("❌ Could not get valid user sessions")
            return False
    except Exception as e:
        print(f"❌ Error getting user sessions: {e}")
        return False
    
    # Clear existing matches and notifications
    try:
        subprocess.run([
            "mongosh", "test_database", "--eval",
            f"""
            db.matches.deleteMany({{$or: [
                {{user_id: {{$in: ['{user_a_id}', '{user_b_id}']}}}},
                {{matched_user_id: {{$in: ['{user_a_id}', '{user_b_id}']}}}}
            ]}});
            db.notifications.deleteMany({{user_id: {{$in: ['{user_a_id}', '{user_b_id}']}}}});
            
            // Update users to be compatible for matching
            db.users.updateOne(
                {{user_id: '{user_a_id}'}},
                {{$set: {{
                    role: 'student',
                    gender: 'woman',
                    interested_in: ['men'],
                    notifications_enabled: true
                }}}}
            );
            
            db.users.updateOne(
                {{user_id: '{user_b_id}'}},
                {{$set: {{
                    role: 'student',
                    gender: 'man', 
                    interested_in: ['women'],
                    notifications_enabled: true
                }}}}
            );
            """
        ], capture_output=True, text=True, timeout=10)
        print("✅ Cleared existing data and updated user preferences")
    except Exception as e:
        print(f"⚠️  Could not clear existing data: {e}")
    
    # Step 1: User A swipes right on User B
    print(f"📱 User A ({user_a_id}) swiping right on User B ({user_b_id})...")
    swipe_data = {"target_user_id": user_b_id, "action": "like"}
    response_a = make_request("POST", "/matches/swipe", token=token_a, data=swipe_data)
    
    if not (response_a and response_a.status_code == 200):
        print(f"❌ User A swipe failed: {response_a.status_code if response_a else 'No response'}")
        if response_a:
            try:
                error_data = response_a.json()
                print(f"   Error: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"   Response: {response_a.text[:200]}")
        return False
    
    print("✅ User A swipe successful")
    
    # Step 2: User B swipes right on User A (creates mutual match)
    print(f"📱 User B ({user_b_id}) swiping right on User A ({user_a_id})...")
    swipe_data = {"target_user_id": user_a_id, "action": "like"}
    response_b = make_request("POST", "/matches/swipe", token=token_b, data=swipe_data)
    
    if not (response_b and response_b.status_code == 200):
        print(f"❌ User B swipe failed: {response_b.status_code if response_b else 'No response'}")
        if response_b:
            try:
                error_data = response_b.json()
                print(f"   Error: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"   Response: {response_b.text[:200]}")
        return False
    
    try:
        swipe_result = response_b.json()
        is_mutual = swipe_result.get('is_mutual', False)
        print(f"✅ User B swipe successful - Mutual match: {is_mutual}")
    except:
        print("✅ User B swipe successful")
    
    # Step 3: Wait for notifications
    print("⏳ Waiting for notifications to be processed...")
    time.sleep(3)
    
    # Step 4: Check notifications for both users
    print("📬 Checking notifications...")
    
    # Check User A notifications
    response_a_notif = make_request("GET", "/notifications", token=token_a)
    user_a_has_notification = False
    
    if response_a_notif and response_a_notif.status_code == 200:
        try:
            notifications_a = response_a_notif.json()
            print(f"   User A has {len(notifications_a)} notifications")
            
            for notif in notifications_a:
                notif_type = notif.get('notification_type', 'unknown')
                body = notif.get('body', '')
                print(f"      - {notif_type}: {body}")
                
                if notif_type == "new_match" and "match" in body.lower():
                    user_a_has_notification = True
        except:
            print("   ❌ Could not parse User A notifications")
    else:
        print(f"   ❌ Could not get User A notifications: {response_a_notif.status_code if response_a_notif else 'No response'}")
    
    # Check User B notifications
    response_b_notif = make_request("GET", "/notifications", token=token_b)
    user_b_has_notification = False
    
    if response_b_notif and response_b_notif.status_code == 200:
        try:
            notifications_b = response_b_notif.json()
            print(f"   User B has {len(notifications_b)} notifications")
            
            for notif in notifications_b:
                notif_type = notif.get('notification_type', 'unknown')
                body = notif.get('body', '')
                print(f"      - {notif_type}: {body}")
                
                if notif_type == "new_match" and "match" in body.lower():
                    user_b_has_notification = True
        except:
            print("   ❌ Could not parse User B notifications")
    else:
        print(f"   ❌ Could not get User B notifications: {response_b_notif.status_code if response_b_notif else 'No response'}")
    
    # Evaluate results
    if user_a_has_notification and user_b_has_notification:
        print("\n✅ PASS: Both users received match notifications")
        return True
    elif user_a_has_notification or user_b_has_notification:
        working_user = "User A" if user_a_has_notification else "User B"
        missing_user = "User B" if user_a_has_notification else "User A"
        print(f"\n⚠️  PARTIAL: {working_user} got notification, {missing_user} did not")
        return False
    else:
        print("\n❌ FAIL: Neither user received match notifications")
        return False

def main():
    """Run all tests"""
    print("🧪 Educare Match Notifications & Picture Field Tests")
    print("=" * 60)
    
    results = []
    
    # Test 1: Picture field in discover endpoint
    results.append(test_picture_field())
    
    # Test 2: Match notifications for both users
    results.append(test_match_notifications())
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 FINAL RESULTS")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n🎉 All tests passed!")
        return True
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)