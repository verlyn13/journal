"""Security infrastructure package."""

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHash, VerificationError, VerifyMismatchError

from .webhook_verification import (
    ReplayAttackError,
    SignatureVerificationError,
    WebhookRateLimiter,
    WebhookSecurityManager,
    WebhookSignatureVerifier,
    WebhookVerificationError,
)


_ph = PasswordHasher()  # Argon2id defaults


def hash_password(pw: str) -> str:
    """Hash a password using Argon2."""
    return _ph.hash(pw)


def verify_password(hash_: str, pw: str) -> bool:
    """Verify a password against its hash."""
    try:
        return _ph.verify(hash_, pw)
    except (VerifyMismatchError, VerificationError, InvalidHash):
        return False


__all__ = [
    "ReplayAttackError",
    "SignatureVerificationError",
    "WebhookRateLimiter",
    "WebhookSecurityManager",
    "WebhookSignatureVerifier",
    "WebhookVerificationError",
    "hash_password",
    "verify_password",
]
