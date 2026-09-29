"""University licence registry (super-admin CRUD) + read-only status for university admins."""
from datetime import datetime, timezone
from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from database import db
from models import User
from helpers.auth import require_admin, require_university_admin
from helpers.entitlements import (
    email_domain, domain_matches, licence_is_active, find_licence_for_university,
)

router = APIRouter()


class LicenceCreate(BaseModel):
    name: str
    domains: List[str]
    starts_at: Optional[str] = None
    ends_at: Optional[str] = None
    active: bool = True
    notes: Optional[str] = None


class LicenceUpdate(BaseModel):
    name: Optional[str] = None
    domains: Optional[List[str]] = None
    starts_at: Optional[str] = None
    ends_at: Optional[str] = None
    active: Optional[bool] = None
    notes: Optional[str] = None


def _clean_domains(domains: List[str]) -> List[str]:
    out = []
    for d in domains:
        d = d.strip().lower().lstrip("@")
        if d and "." in d and d not in out:
            out.append(d)
    if not out:
        raise HTTPException(status_code=400, detail="At least one valid email domain is required (e.g. beds.ac.uk)")
    return out


async def _with_stats(lic: dict) -> dict:
    # Count students whose email domain falls under this licence.
    students = await db.users.find({"role": "student"}, {"_id": 0, "email": 1}).to_list(20000)
    covered = sum(1 for s in students if any(domain_matches(email_domain(s.get("email")), d) for d in lic.get("domains", [])))
    return {**lic, "students_covered": covered, "is_active_now": licence_is_active(lic)}


@router.get("/admin/university-licences")
async def list_licences(admin: User = Depends(require_admin)):
    licences = await db.university_licences.find({}, {"_id": 0}).sort("name", 1).to_list(500)
    return {"licences": [await _with_stats(l) for l in licences]}


@router.post("/admin/university-licences")
async def create_licence(data: LicenceCreate, admin: User = Depends(require_admin)):
    now = datetime.now(timezone.utc).isoformat()
    lic = {
        "id": str(uuid.uuid4()),
        "name": data.name.strip(),
        "domains": _clean_domains(data.domains),
        "starts_at": data.starts_at,
        "ends_at": data.ends_at,
        "active": data.active,
        "notes": data.notes,
        "created_at": now,
        "updated_at": now,
        "created_by": admin.user_id,
    }
    if not lic["name"]:
        raise HTTPException(status_code=400, detail="University name is required")
    await db.university_licences.insert_one(dict(lic))
    return await _with_stats(lic)


@router.put("/admin/university-licences/{licence_id}")
async def update_licence(licence_id: str, data: LicenceUpdate, admin: User = Depends(require_admin)):
    updates = {k: v for k, v in data.dict().items() if v is not None}
    if "domains" in updates:
        updates["domains"] = _clean_domains(updates["domains"])
    if "name" in updates:
        updates["name"] = updates["name"].strip()
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.university_licences.update_one({"id": licence_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Licence not found")
    lic = await db.university_licences.find_one({"id": licence_id}, {"_id": 0})
    return await _with_stats(lic)


@router.delete("/admin/university-licences/{licence_id}")
async def delete_licence(licence_id: str, admin: User = Depends(require_admin)):
    result = await db.university_licences.delete_one({"id": licence_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Licence not found")
    return {"deleted": True}


@router.get("/university-admin/licence")
async def university_admin_licence(current_user: User = Depends(require_university_admin)):
    lic = await find_licence_for_university(current_user.university_admin_for)
    if not lic:
        return {"licensed": False, "university": current_user.university_admin_for, "licence": None}
    return {
        "licensed": licence_is_active(lic),
        "university": current_user.university_admin_for,
        "licence": await _with_stats(lic),
    }
