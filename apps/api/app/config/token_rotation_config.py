"""Token rotation configuration per enhancement plan.

Defines rotation cadences, overlap windows, and TTLs for all token types
according to the security requirements.
"""

from __future__ import annotations

from datetime import timedelta
from typing import Final


# ============================================================================
# Token TTL Configuration
# ============================================================================

# Access JWT
ACCESS_JWT_TTL: Final[timedelta] = timedelta(minutes=10)  # 10 min TTL
ACCESS_JWT_REFRESH_AT: Final[timedelta] = timedelta(minutes=7)  # Refresh at 7-8 min

# Refresh Token
REFRESH_TOKEN_TTL: Final[timedelta] = timedelta(days=14)  # 14 days sliding window
REFRESH_TOKEN_SINGLE_USE: Final[bool] = True  # One-time use only
REFRESH_TOKEN_REUSE_DETECTION_TTL: Final[timedelta] = timedelta(
    hours=24
)  # Detection window

# Session Cookie
SESSION_IDLE_TIMEOUT: Final[timedelta] = timedelta(minutes=30)  # 30 min idle
SESSION_HARD_LIMIT: Final[timedelta] = timedelta(hours=12)  # 12 hour absolute max
SESSION_ROTATION_INTERVAL: Final[timedelta] = timedelta(
    minutes=15
)  # Rotate every 15 min

# M2M Token
M2M_TOKEN_DEFAULT_TTL: Final[timedelta] = timedelta(minutes=30)  # 30 min default
M2M_TOKEN_MIN_TTL: Final[timedelta] = timedelta(minutes=5)  # 5 min minimum
M2M_TOKEN_MAX_TTL: Final[timedelta] = timedelta(hours=1)  # 1 hour maximum

# Service Token (CI/Bootstrap)
SERVICE_TOKEN_TTL: Final[timedelta] = timedelta(days=30)  # 30 days max
SERVICE_TOKEN_OVERLAP: Final[timedelta] = timedelta(
    hours=24
)  # 24h overlap during rotation

# ============================================================================
# Key Rotation Configuration
# ============================================================================

# JWT Signing Keys (EdDSA/Ed25519)
JWT_KEY_ROTATION_INTERVAL: Final[timedelta] = timedelta(days=60)  # Rotate every 60 days
JWT_KEY_OVERLAP_WINDOW: Final[timedelta] = timedelta(
    minutes=20
)  # 20 min overlap minimum
JWT_KEY_WARNING_THRESHOLD: Final[timedelta] = timedelta(days=50)  # Warn at 50 days
JWT_KEY_CRITICAL_THRESHOLD: Final[timedelta] = timedelta(days=55)  # Critical at 55 days

# AES-GCM Encryption Keys
AES_KEY_ROTATION_INTERVAL: Final[timedelta] = timedelta(days=90)  # Rotate every 90 days
AES_KEY_READ_OVERLAP: Final[timedelta] = timedelta(
    hours=48
)  # 48h dual-key read support
AES_KEY_WARNING_THRESHOLD: Final[timedelta] = timedelta(days=80)  # Warn at 80 days
AES_KEY_CRITICAL_THRESHOLD: Final[timedelta] = timedelta(days=85)  # Critical at 85 days

# ============================================================================
# Infisical Secret Paths
# ============================================================================


class InfisicalPaths:
    """Centralized Infisical secret paths per specification."""

    # JWT Keys
    JWT_CURRENT_PRIVATE_KEY: Final[str] = "/auth/jwt/current_private_key"
    JWT_NEXT_PRIVATE_KEY: Final[str] = "/auth/jwt/next_private_key"
    JWT_PUBLIC_JWKS: Final[str] = "/auth/jwt/public_jwks"

    # AES Keys
    AES_ENC_KEYS: Final[str] = "/auth/aes/enc_keys"
    AES_ACTIVE_KID: Final[str] = "/auth/aes/active_kid"

    # OAuth Providers
    OAUTH_GOOGLE_CLIENT_ID: Final[str] = "/auth/oauth/google/client_id"
    OAUTH_GOOGLE_CLIENT_SECRET: Final[str] = "/auth/oauth/google/client_secret"  # noqa: S105 - secret name path, not a secret value
    OAUTH_GITHUB_CLIENT_ID: Final[str] = "/auth/oauth/github/client_id"
    OAUTH_GITHUB_CLIENT_SECRET: Final[str] = "/auth/oauth/github/client_secret"  # noqa: S105 - secret name path, not a secret value

    # Email Authentication
    EMAIL_SMTP_HOST: Final[str] = "/auth/email/smtp_host"
    EMAIL_SMTP_PORT: Final[str] = "/auth/email/smtp_port"
    EMAIL_SMTP_USER: Final[str] = "/auth/email/smtp_user"
    EMAIL_SMTP_PASSWORD: Final[str] = "/auth/email/smtp_password"  # noqa: S105 - secret name path, not a secret value
    EMAIL_FROM_ADDRESS: Final[str] = "/auth/email/from_address"

    # Service Identities
    @staticmethod
    def service_identity(service_name: str) -> str:
        """Get path for service identity configuration."""
        return f"/services/{service_name}/identity"


# ============================================================================
# Security Policies
# ============================================================================


class SecurityPolicies:
    """Security policy configuration."""

    # Cookie Security
    COOKIE_HTTPONLY: Final[bool] = True
    COOKIE_SECURE: Final[bool] = True  # HTTPS only
    COOKIE_SAMESITE: Final[str] = "Lax"  # Or "Strict" for auth-only pages

    # Token Security
    REQUIRE_AUDIENCE_VALIDATION: Final[bool] = True
    REQUIRE_ISSUER_VALIDATION: Final[bool] = True
    REQUIRE_PKCE_FOR_OAUTH: Final[bool] = True
    REQUIRE_NONCE_FOR_OIDC: Final[bool] = True

    # Rotation Security
    REQUIRE_CHANGE_REQUESTS_PROD: Final[bool] = True
    REQUIRE_TWO_APPROVERS: Final[bool] = True
    AUDIT_RETENTION_DAYS: Final[int] = 90

    # Rate Limiting
    MAX_REFRESH_ATTEMPTS_PER_HOUR: Final[int] = 10
    MAX_LOGIN_ATTEMPTS_PER_HOUR: Final[int] = 5
    MAX_M2M_TOKENS_PER_SERVICE: Final[int] = 3


# ============================================================================
# Monitoring Thresholds
# ============================================================================


class MonitoringThresholds:
    """Thresholds for monitoring and alerting."""

    # Performance
    MAX_TOKEN_GENERATION_TIME_MS: Final[int] = 100
    MAX_TOKEN_VALIDATION_TIME_MS: Final[int] = 50
    MAX_KEY_FETCH_TIME_MS: Final[int] = 500

    # Health
    MIN_KEYS_IN_JWKS: Final[int] = 1  # Must have at least current key
    MAX_KEYS_IN_JWKS: Final[int] = 3  # Current + next + retiring

    # Rotation
    ROTATION_CHECK_INTERVAL: Final[timedelta] = timedelta(hours=1)
    ROTATION_RETRY_DELAY: Final[timedelta] = timedelta(minutes=5)
    MAX_ROTATION_RETRIES: Final[int] = 3


# ============================================================================
# Helper Functions
# ============================================================================


def get_token_ttl(token_type: str) -> timedelta:
    """Get TTL for a token type.

    Args:
        token_type: Type of token (access, refresh, m2m, session)

    Returns:
        Token TTL
    """
    ttl_map = {
        "access": ACCESS_JWT_TTL,
        "refresh": REFRESH_TOKEN_TTL,
        "m2m": M2M_TOKEN_DEFAULT_TTL,
        "session": SESSION_IDLE_TIMEOUT,
        "service": SERVICE_TOKEN_TTL,
    }
    return ttl_map.get(token_type, ACCESS_JWT_TTL)


def should_rotate_key(key_age: timedelta, key_type: str) -> tuple[bool, str | None]:
    """Check if a key should be rotated based on age.

    Args:
        key_age: Age of the key
        key_type: Type of key (jwt, aes)

    Returns:
        Tuple of (should_rotate, reason)
    """
    if key_type == "jwt":
        if key_age >= JWT_KEY_CRITICAL_THRESHOLD:
            return True, f"JWT key age critical: {key_age.days} days"
        if key_age >= JWT_KEY_WARNING_THRESHOLD:
            return True, f"JWT key age warning: {key_age.days} days"
        if key_age >= JWT_KEY_ROTATION_INTERVAL:
            return True, f"JWT key rotation interval reached: {key_age.days} days"
    elif key_type == "aes":
        if key_age >= AES_KEY_CRITICAL_THRESHOLD:
            return True, f"AES key age critical: {key_age.days} days"
        if key_age >= AES_KEY_WARNING_THRESHOLD:
            return True, f"AES key age warning: {key_age.days} days"
        if key_age >= AES_KEY_ROTATION_INTERVAL:
            return True, f"AES key rotation interval reached: {key_age.days} days"

    return False, None


def get_rotation_schedule() -> dict[str, timedelta]:
    """Get the complete rotation schedule.

    Returns:
        Dictionary of rotation intervals by component
    """
    return {
        "jwt_keys": JWT_KEY_ROTATION_INTERVAL,
        "aes_keys": AES_KEY_ROTATION_INTERVAL,
        "service_tokens": SERVICE_TOKEN_TTL,
        "refresh_tokens": REFRESH_TOKEN_TTL,
        "sessions": SESSION_ROTATION_INTERVAL,
    }
