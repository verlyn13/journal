from __future__ import annotations

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError


_ph = PasswordHasher()  # Argon2id defaults


def hash_password(pw: str) -> str:
    return _ph.hash(pw)


def verify_password(hash_: str, pw: str) -> bool:
    try:
        return _ph.verify(hash_, pw)
    except VerifyMismatchError:
        return False
    except Exception:
        return False

