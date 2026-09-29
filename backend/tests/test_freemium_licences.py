"""Freemium / University Licence backend tests (iteration 16).

Covers:
  * /api/subscription/status entitlements shape (free / premium / partner)
  * /api/mood + /api/feedback returning 403 PREMIUM_REQUIRED for free students
  * Super-admin /api/admin/university-licences CRUD + auth gating
  * Suffix domain matching (student.beds.ac.uk -> beds.ac.uk)
  * University admin /api/university-admin/licence read-only endpoint
  * Discovery filters apply once entitled

Cleanup: any licence created here is deleted at the end.
"""
from __future__ import annotations

import os
import time
from datetime import datetime, timezone, timedelta

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"

STUDENT_EMAIL = "ui.tester@student.beds.ac.uk"
STUDENT_PASSWORD = "UiTester123!"
ADMIN_EMAIL = "quadri.yusuf@dequad.com"
ADMIN_PASSWORD = "Oluwatobi11@"
ADMIN_CODE = "DEQUAD_ADMIN_2024"
UNI_ADMIN_EMAIL = "admin@manchesteruni.edu"
UNI_ADMIN_PASSWORD = "UniAdmin123!"


# ---------------------------- session helpers ----------------------------

def _student_session() -> requests.Session:
    s = requests.Session()
    r = s.post(f"{API}/auth/email-login", json={"email": STUDENT_EMAIL, "password": STUDENT_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"student login failed: {r.status_code} {r.text}"
    tok = r.json().get("session_token")
    if tok:
        s.headers.update({"Authorization": f"Bearer {tok}"})
    return s


def _admin_session() -> requests.Session:
    s = requests.Session()
    r = s.post(f"{API}/auth/admin-login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD, "admin_code": ADMIN_CODE}, timeout=20)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    tok = r.json().get("session_token") or r.json().get("token")
    if tok:
        s.headers.update({"Authorization": f"Bearer {tok}"})
    return s


def _uni_admin_session() -> requests.Session:
    s = requests.Session()
    r = s.post(f"{API}/university-admin/login", json={"email": UNI_ADMIN_EMAIL, "password": UNI_ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"university admin login failed: {r.status_code} {r.text}"
    tok = r.json().get("session_token") or r.json().get("token")
    if tok:
        s.headers.update({"Authorization": f"Bearer {tok}"})
    return s


@pytest.fixture(scope="module")
def student():
    return _student_session()


@pytest.fixture(scope="module")
def admin():
    return _admin_session()


@pytest.fixture(scope="module")
def uni_admin():
    return _uni_admin_session()


@pytest.fixture(autouse=True, scope="module")
def _cleanup_leftover_licences(admin):
    """Ensure no partner licence covering beds.ac.uk / manchester.ac.uk exists at start."""
    r = admin.get(f"{API}/admin/university-licences", timeout=15)
    if r.status_code == 200:
        for lic in r.json().get("licences", []):
            doms = [d.lower() for d in lic.get("domains", [])]
            name = (lic.get("name") or "").lower()
            if any(d in ("beds.ac.uk", "manchester.ac.uk", "testuni.ac.uk", "students.testuni.ac.uk") for d in doms) \
                    or "test uni" in name or "bedfordshire" in name or "manchester" in name:
                admin.delete(f"{API}/admin/university-licences/{lic['id']}", timeout=10)
    yield
    # Post-run: same wipe so DB stays clean
    r = admin.get(f"{API}/admin/university-licences", timeout=15)
    if r.status_code == 200:
        for lic in r.json().get("licences", []):
            doms = [d.lower() for d in lic.get("domains", [])]
            name = (lic.get("name") or "").lower()
            if any(d in ("beds.ac.uk", "manchester.ac.uk", "testuni.ac.uk", "students.testuni.ac.uk") for d in doms) \
                    or "test uni" in name or "bedfordshire" in name or "manchester" in name:
                admin.delete(f"{API}/admin/university-licences/{lic['id']}", timeout=10)


# ---------------------------- 1. Free-user gating ----------------------------

class TestFreeStudentGating:
    def test_status_is_free(self, student):
        r = student.get(f"{API}/subscription/status", timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["plan"] == "free"
        assert d["has_full_access"] is False
        assert d["access_source"] == "free"
        assert set(d["locked_features"]) == {"mood", "feedback", "filters"}
        assert d["is_premium"] is False

    def test_mood_get_403(self, student):
        r = student.get(f"{API}/mood", timeout=15)
        assert r.status_code == 403, r.text
        detail = r.json().get("detail")
        # Detail can be a dict {code, message}
        code = detail.get("code") if isinstance(detail, dict) else None
        assert code == "PREMIUM_REQUIRED", f"expected PREMIUM_REQUIRED, got {detail}"

    def test_mood_post_403(self, student):
        r = student.post(f"{API}/mood", json={"mood": "happy", "note": "x"}, timeout=15)
        assert r.status_code == 403
        detail = r.json().get("detail")
        code = detail.get("code") if isinstance(detail, dict) else None
        assert code == "PREMIUM_REQUIRED"

    def test_feedback_get_403(self, student):
        r = student.get(f"{API}/feedback", timeout=15)
        assert r.status_code == 403
        detail = r.json().get("detail")
        code = detail.get("code") if isinstance(detail, dict) else None
        assert code == "PREMIUM_REQUIRED"


# ---------------------------- 2. Admin licence CRUD ----------------------------

class TestAdminLicenceCRUD:
    def test_non_admin_forbidden_list(self, student):
        r = student.get(f"{API}/admin/university-licences", timeout=15)
        assert r.status_code in (401, 403), r.status_code

    def test_non_admin_forbidden_create(self, student):
        r = student.post(f"{API}/admin/university-licences", json={"name": "X", "domains": ["x.ac.uk"], "active": True}, timeout=15)
        assert r.status_code in (401, 403)

    def test_full_crud_bedfordshire(self, admin):
        # CREATE
        payload = {"name": "University of Bedfordshire", "domains": ["beds.ac.uk"], "active": True}
        r = admin.post(f"{API}/admin/university-licences", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        lic = r.json()
        assert lic["name"] == "University of Bedfordshire"
        assert lic["domains"] == ["beds.ac.uk"]
        assert lic["is_active_now"] is True
        assert lic["students_covered"] >= 1  # ui.tester exists
        lic_id = lic["id"]

        # LIST
        r = admin.get(f"{API}/admin/university-licences", timeout=15)
        assert r.status_code == 200
        ids = [l["id"] for l in r.json()["licences"]]
        assert lic_id in ids

        # PAUSE
        r = admin.put(f"{API}/admin/university-licences/{lic_id}", json={"active": False}, timeout=15)
        assert r.status_code == 200
        assert r.json()["is_active_now"] is False

        # RE-ACTIVATE with past end date -> not active
        past = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        r = admin.put(f"{API}/admin/university-licences/{lic_id}", json={"active": True, "ends_at": past}, timeout=15)
        assert r.status_code == 200
        assert r.json()["is_active_now"] is False, "past ends_at should mark inactive"

        # DELETE
        r = admin.delete(f"{API}/admin/university-licences/{lic_id}", timeout=15)
        assert r.status_code == 200
        assert r.json().get("deleted") is True

        # 404 after delete
        r = admin.delete(f"{API}/admin/university-licences/{lic_id}", timeout=10)
        assert r.status_code == 404


# ---------------------------- 3. Entitlement flip via licence ----------------------------

class TestEntitlementFlip:
    def test_licence_grants_full_access_and_reverts(self, admin, student):
        # Create ACTIVE beds licence
        r = admin.post(f"{API}/admin/university-licences",
                       json={"name": "University of Bedfordshire", "domains": ["beds.ac.uk"], "active": True},
                       timeout=15)
        assert r.status_code == 200, r.text
        lic_id = r.json()["id"]
        try:
            # Suffix domain matching -> student.beds.ac.uk matches beds.ac.uk
            s = student.get(f"{API}/subscription/status", timeout=15).json()
            assert s["has_full_access"] is True
            assert s["access_source"] == "university"
            assert s["licence_university"] == "University of Bedfordshire"
            assert s["is_premium"] is True
            assert s.get("remaining_likes_this_week") is None

            # Mood now accessible
            r_mood = student.get(f"{API}/mood", timeout=15)
            assert r_mood.status_code == 200, r_mood.text

            # Feedback now accessible
            r_fb = student.get(f"{API}/feedback", timeout=15)
            assert r_fb.status_code == 200, r_fb.text

            # Discovery filter applies (endpoint returns a flat list — verify
            # by checking that every returned profile is female. filters_applied
            # is only tracked internally; older clients receive a flat list.)
            r_disc = student.get(f"{API}/matches/discover", params={"gender": "female"}, timeout=20)
            assert r_disc.status_code == 200, r_disc.text
            body = r_disc.json()
            assert isinstance(body, list), f"expected list, got {type(body).__name__}"
            # If any results, they must all be female (filter honoured)
            genders = {(u.get("gender") or "").lower() for u in body}
            assert genders <= {"female", ""}, f"filter not applied — got genders: {genders}"

            # Pause -> reverts to free
            r = admin.put(f"{API}/admin/university-licences/{lic_id}", json={"active": False}, timeout=15)
            assert r.status_code == 200
            s2 = student.get(f"{API}/subscription/status", timeout=15).json()
            assert s2["has_full_access"] is False
            assert s2["access_source"] == "free"
            r_mood2 = student.get(f"{API}/mood", timeout=15)
            assert r_mood2.status_code == 403
        finally:
            admin.delete(f"{API}/admin/university-licences/{lic_id}", timeout=10)

        # After delete -> still free
        s3 = student.get(f"{API}/subscription/status", timeout=15).json()
        assert s3["has_full_access"] is False


# ---------------------------- 4. University-admin licence view ----------------------------

class TestUniversityAdminView:
    def test_no_licence_default(self, uni_admin):
        r = uni_admin.get(f"{API}/university-admin/licence", timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["licensed"] is False
        assert d.get("licence") is None

    def test_licence_visible_after_admin_creates(self, admin, uni_admin):
        r = admin.post(f"{API}/admin/university-licences",
                       json={"name": "University of Manchester", "domains": ["manchester.ac.uk"], "active": True},
                       timeout=15)
        assert r.status_code == 200, r.text
        lic_id = r.json()["id"]
        try:
            r = uni_admin.get(f"{API}/university-admin/licence", timeout=15)
            assert r.status_code == 200
            d = r.json()
            assert d["licensed"] is True
            assert d["licence"]["name"] == "University of Manchester"
        finally:
            admin.delete(f"{API}/admin/university-licences/{lic_id}", timeout=10)
