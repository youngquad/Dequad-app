"""Password hashing helpers with lazy migration from legacy SHA-256 hashes.

Background:
    Old accounts store `password_hash` (and `admin_password`) as an unsalted
    single-round `hashlib.sha256(password).hexdigest()` — 64 lowercase hex chars.
    New accounts store bcrypt hashes (`$2b$...`, 60 chars). This module owns
    the detection + verification + rehash-on-login logic so route code doesn't
    have to duplicate it.

Public API:
    hash_password(pw) -> str                 # New accounts + reset flows
    verify_and_maybe_rehash(pw, stored)      # Returns (ok, new_hash_or_None)
    is_legacy_sha256(stored)                 # Optional introspection helper
"""
from __future__ import annotations

import hashlib
import re

import bcrypt

# bcrypt cost factor 12 = ~250ms per hash on 2026 commodity server hardware.
# Higher than the passlib default of 12 offers diminishing returns given our
# rate-limited login endpoints. Increment when hardware doubles.
_BCRYPT_ROUNDS = 12

# Unsalted SHA-256 hex is always exactly 64 lowercase hex chars.
_LEGACY_SHA256_RE = re.compile(r"^[0-9a-f]{64}$")


def hash_password(password: str) -> str:
    """Return a bcrypt hash for a new/rotated password."""
    if not isinstance(password, str) or not password:
        raise ValueError("password must be a non-empty string")
    salted = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=_BCRYPT_ROUNDS))
    return salted.decode("utf-8")


def is_legacy_sha256(stored_hash: str) -> bool:
    """True if the stored hash matches the legacy unsalted SHA-256 pattern."""
    return bool(stored_hash) and bool(_LEGACY_SHA256_RE.match(stored_hash))


def _verify_legacy_sha256(password: str, stored_hash: str) -> bool:
    return hashlib.sha256(password.encode("utf-8")).hexdigest() == stored_hash


def _verify_bcrypt(password: str, stored_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), stored_hash.encode("utf-8"))
    except (ValueError, TypeError):
        # Malformed hash — treat as auth failure, don't crash the login path.
        return False


def verify_and_maybe_rehash(password: str, stored_hash: str) -> tuple[bool, str | None]:
    """Verify a password against a stored hash and lazy-migrate if legacy.

    Returns:
        (ok, new_hash)
          - ok=False, new_hash=None: password doesn't match.
          - ok=True,  new_hash=None: matched an already-bcrypt hash — no
            migration needed, do NOT rewrite the DB.
          - ok=True,  new_hash=<bcrypt>: matched a legacy SHA-256 hash;
            callers MUST persist ``new_hash`` back to the user document so the
            next login uses the strong hash.
    """
    if not stored_hash:
        return False, None

    if is_legacy_sha256(stored_hash):
        if _verify_legacy_sha256(password, stored_hash):
            return True, hash_password(password)
        return False, None

    # Assume anything else is bcrypt (or a future scheme). checkpw returns
    # False for unknown formats via the try/except in _verify_bcrypt.
    return _verify_bcrypt(password, stored_hash), None
