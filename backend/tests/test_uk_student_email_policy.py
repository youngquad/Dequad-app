"""Tests for the UK student-email policy applied to /api/auth/register.

The policy lives in /app/backend/helpers/uk_student_email.py and is wired
into routes/auth.py. We cover the four classification verdicts plus the
DB-level `student_verification` field.
"""
from __future__ import annotations
import os
import time
import uuid

import httpx
import pytest

API = (os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")) + "/api"


@pytest.fixture(scope="module")
def client():
    with httpx.Client(timeout=30.0, follow_redirects=True) as c:
        yield c


def _uniq(prefix: str) -> str:
    return f"{prefix}_{int(time.time())}_{uuid.uuid4().hex[:6]}"


class TestNonAcademicRejected:
    def test_gmail_rejected_with_403(self, client):
        r = client.post(
            f"{API}/auth/register",
            json={
                "email": f"{_uniq('test')}@gmail.com",
                "password": "Test12345!",
                "confirm_student": True,
            },
        )
        assert r.status_code == 403, r.text
        assert "UK" in r.json()["detail"]


class TestStaffPatternsBlocked:
    @pytest.mark.parametrize(
        "email",
        [
            "name@staff.kcl.ac.uk",
            "name@admin.ucl.ac.uk",
            "name@faculty.ox.ac.uk",
            "name@alumni.cam.ac.uk",
            "staff-jane@ucl.ac.uk",
            "admin.bob@kcl.ac.uk",
        ],
    )
    def test_staff_subdomain_and_localpart_blocked(self, client, email):
        # Vary the local-part to keep emails unique across the parametrised
        # cases.
        ts = int(time.time())
        local, _, domain = email.partition("@")
        addr = f"{local}_{ts}_{uuid.uuid4().hex[:4]}@{domain}"
        r = client.post(
            f"{API}/auth/register",
            json={
                "email": addr,
                "password": "Test12345!",
                "confirm_student": True,
            },
        )
        assert r.status_code == 403, f"{addr}: {r.text}"


class TestStudentSubdomainAutoApproved:
    @pytest.mark.parametrize(
        "domain",
        [
            "student.leeds.ac.uk",
            "students.bham.ac.uk",
            "live.warwick.ac.uk",
            "sms.ed.ac.uk",
            "stu.example.ac.uk",
            "my.westminster.ac.uk",
        ],
    )
    def test_student_subdomain_passes_without_attestation(self, client, domain):
        email = f"{_uniq('stu')}@{domain}"
        r = client.post(
            f"{API}/auth/register",
            json={"email": email, "password": "Test12345!"},
        )
        assert r.status_code == 200, r.text
        assert r.json()["user"].get("student_verification") == "auto"


class TestBareAcUkRequiresAttestation:
    def test_bare_ac_uk_without_attestation_returns_400(self, client):
        r = client.post(
            f"{API}/auth/register",
            json={"email": f"{_uniq('bare')}@kcl.ac.uk", "password": "Test12345!"},
        )
        assert r.status_code == 400, r.text
        assert "confirm" in r.json()["detail"].lower()

    def test_bare_ac_uk_with_attestation_passes_and_flags_self_declared(self, client):
        r = client.post(
            f"{API}/auth/register",
            json={
                "email": f"{_uniq('att')}@kcl.ac.uk",
                "password": "Test12345!",
                "confirm_student": True,
            },
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["user"]["student_verification"] == "self_declared"
