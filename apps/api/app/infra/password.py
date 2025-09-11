"""Password hashing and verification using Argon2."""

from passlib.context import CryptContext


# Create password context with Argon2 as the default scheme
pwd_context = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    # Argon2 specific settings for good security
    argon2__rounds=3,
    argon2__memory_cost=65536,  # 64 MB
    argon2__parallelism=4,
)


def hash_password(password: str) -> str:
    """Hash a password using Argon2.

    Args:
        password: Plain text password to hash

    Returns:
        Hashed password string
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash.

    Args:
        plain_password: Plain text password to verify
        hashed_password: Previously hashed password

    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def needs_rehash(hashed_password: str) -> bool:
    """Check if a password hash needs to be rehashed.

    This is useful when upgrading hashing parameters.

    Args:
        hashed_password: Previously hashed password

    Returns:
        True if the hash should be regenerated with current settings
    """
    return pwd_context.needs_update(hashed_password)
