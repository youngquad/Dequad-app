# Iter18 follow-ups: verification-delivery rate limit (auth bucket) + sender-name 'DEQUAD' on reset emails
import os
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
import requests
from dotenv import load_dotenv

load_dotenv("/app/frontend/.env")
load_dotenv("/app/backend/.env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
RESEND_KEY = os.environ.get("RESEND_API_KEY")


# Health still OK
def test_health():
    r = requests.get(f"{API}/health", timeout=30)
    assert r.status_code == 200


# verification-delivery is rate-limited at the auth bucket (120/min)
def test_verification_delivery_rate_limited():
    email = f"qa.rl.{uuid.uuid4().hex[:6]}@nowhere.ac.uk"
    s = requests.Session()

    def hit(_):
        r = s.get(f"{API}/auth/verification-delivery", params={"email": email}, timeout=30)
        return r.status_code, r.headers.get("X-RateLimit-Remaining"), r.headers.get("Retry-After")

    with ThreadPoolExecutor(max_workers=16) as ex:
        res = list(ex.map(hit, range(130)))
    codes = [c for c, _, _ in res]
    rem = [x for _, x, _ in res if x is not None]
    print("200s:", codes.count(200), "429s:", codes.count(429), "min remaining:", min(map(int, rem)) if rem else None)
    print("sample 429 retry-after:", [ra for c, _, ra in res if c == 429][:3])
    assert codes.count(429) >= 1
    assert codes.count(200) <= 120


# Forgot-password email sent with from 'DEQUAD <...>' (verified via Resend list API)
def test_forgot_password_sender_name():
    t0 = time.time()
    r = requests.post(f"{API}/auth/forgot-password", json={"email": "ui.tester@student.beds.ac.uk"}, timeout=30)
    assert r.status_code == 200
    assert "reset link" in r.json()["message"]
    assert RESEND_KEY, "RESEND_API_KEY missing"
    found = None
    for _ in range(6):
        time.sleep(3)
        lr = requests.get("https://api.resend.com/emails", params={"limit": 10},
                          headers={"Authorization": f"Bearer {RESEND_KEY}"}, timeout=30)
        assert lr.status_code == 200, lr.status_code
        for e in lr.json().get("data", []):
            if "ui.tester@student.beds.ac.uk" in (e.get("to") or []):
                found = e
                break
        if found:
            break
    assert found, "reset email not found on Resend"
    print("from:", found.get("from"), "| subject:", found.get("subject"), "| created:", found.get("created_at"),
          "| last_event:", found.get("last_event"), "| elapsed", round(time.time() - t0))
    assert found["from"].startswith("DEQUAD <")
    assert "Safeguarding" not in found["from"]
