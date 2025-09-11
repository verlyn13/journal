"""Ed25519 key generation and management utilities."""

from __future__ import annotations

import base64
import secrets

from datetime import UTC, datetime
from typing import NamedTuple

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ed25519


class KeyPair(NamedTuple):
    """Ed25519 key pair with metadata."""

    private_key: ed25519.Ed25519PrivateKey
    public_key: ed25519.Ed25519PublicKey
    kid: str  # Key ID
    created_at: datetime
    algorithm: str = "EdDSA"
    curve: str = "Ed25519"


class KeyMaterial(NamedTuple):
    """Serialized key material for storage."""

    private_key_pem: str
    public_key_pem: str
    private_key_raw: bytes
    public_key_raw: bytes
    jwk_public: dict[str, str]
    kid: str
    created_at: datetime


class Ed25519KeyGenerator:
    """High-performance Ed25519 key generation for JWT signing."""

    @staticmethod
    def generate_key_pair(kid: str | None = None) -> KeyPair:
        """Generate a new Ed25519 key pair.

        Args:
            kid: Optional key ID. If None, generates timestamp-based ID.

        Returns:
            KeyPair with private key, public key, and metadata
        """
        if kid is None:
            kid = Ed25519KeyGenerator._generate_kid()

        # Generate Ed25519 key pair (fast, secure, modern)
        private_key = ed25519.Ed25519PrivateKey.generate()
        public_key = private_key.public_key()

        return KeyPair(
            private_key=private_key,
            public_key=public_key,
            kid=kid,
            created_at=datetime.now(UTC),
        )

    @staticmethod
    def serialize_key_pair(key_pair: KeyPair) -> KeyMaterial:
        """Serialize key pair to various formats for storage and distribution.

        Args:
            key_pair: The key pair to serialize

        Returns:
            KeyMaterial with all serialization formats
        """
        # PEM format for Infisical storage
        private_pem = key_pair.private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        ).decode()

        public_pem = key_pair.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        ).decode()

        # Raw bytes for JWK
        private_raw = key_pair.private_key.private_bytes_raw()
        public_raw = key_pair.public_key.public_bytes_raw()

        # JWK format for JWKS endpoint
        jwk_public = {
            "kty": "OKP",
            "crv": "Ed25519",
            "kid": key_pair.kid,
            "use": "sig",
            "alg": "EdDSA",
            "x": base64.urlsafe_b64encode(public_raw).decode().rstrip("="),
        }

        return KeyMaterial(
            private_key_pem=private_pem,
            public_key_pem=public_pem,
            private_key_raw=private_raw,
            public_key_raw=public_raw,
            jwk_public=jwk_public,
            kid=key_pair.kid,
            created_at=key_pair.created_at,
        )

    @staticmethod
    def load_private_key_from_pem(pem_data: str) -> ed25519.Ed25519PrivateKey:
        """Load private key from PEM format.

        Args:
            pem_data: PEM-encoded private key

        Returns:
            Ed25519PrivateKey instance

        Raises:
            ValueError: If PEM data is invalid
        """
        try:
            private_key = serialization.load_pem_private_key(pem_data.encode(), password=None)
            if not isinstance(private_key, ed25519.Ed25519PrivateKey):
                raise ValueError("Key is not Ed25519")
            return private_key
        except Exception as e:
            raise ValueError(f"Invalid Ed25519 private key PEM: {e}") from e

    @staticmethod
    def load_public_key_from_pem(pem_data: str) -> ed25519.Ed25519PublicKey:
        """Load public key from PEM format.

        Args:
            pem_data: PEM-encoded public key

        Returns:
            Ed25519PublicKey instance

        Raises:
            ValueError: If PEM data is invalid
        """
        try:
            public_key = serialization.load_pem_public_key(pem_data.encode())
            if not isinstance(public_key, ed25519.Ed25519PublicKey):
                raise ValueError("Key is not Ed25519")
            return public_key
        except Exception as e:
            raise ValueError(f"Invalid Ed25519 public key PEM: {e}") from e

    @staticmethod
    def load_private_key_from_raw(raw_data: bytes) -> ed25519.Ed25519PrivateKey:
        """Load private key from raw bytes.

        Args:
            raw_data: 32-byte raw private key

        Returns:
            Ed25519PrivateKey instance

        Raises:
            ValueError: If raw data is invalid
        """
        if len(raw_data) != 32:
            raise ValueError("Ed25519 private key must be 32 bytes")

        try:
            return ed25519.Ed25519PrivateKey.from_private_bytes(raw_data)
        except Exception as e:
            raise ValueError(f"Invalid Ed25519 private key bytes: {e}") from e

    @staticmethod
    def load_public_key_from_raw(raw_data: bytes) -> ed25519.Ed25519PublicKey:
        """Load public key from raw bytes.

        Args:
            raw_data: 32-byte raw public key

        Returns:
            Ed25519PublicKey instance

        Raises:
            ValueError: If raw data is invalid
        """
        if len(raw_data) != 32:
            raise ValueError("Ed25519 public key must be 32 bytes")

        try:
            return ed25519.Ed25519PublicKey.from_public_bytes(raw_data)
        except Exception as e:
            raise ValueError(f"Invalid Ed25519 public key bytes: {e}") from e

    @staticmethod
    def verify_key_pair(
        private_key: ed25519.Ed25519PrivateKey,
        public_key: ed25519.Ed25519PublicKey,
    ) -> bool:
        """Verify that a private/public key pair match.

        Args:
            private_key: Private key to test
            public_key: Public key to test

        Returns:
            True if keys are a valid pair
        """
        try:
            # Test sign/verify cycle
            test_message = b"key_pair_verification_test"
            signature = private_key.sign(test_message)
            public_key.verify(signature, test_message)
            return True
        except (ValueError, TypeError):
            # Key verification failed
            return False

    @staticmethod
    def _generate_kid() -> str:
        """Generate a unique key ID.

        Returns:
            Time-based key ID in format: YYYY-MM-DD-RANDOM
        """
        timestamp = datetime.now(UTC).strftime("%Y-%m-%d")
        random_suffix = secrets.token_hex(4)  # 8 hex chars
        return f"{timestamp}-{random_suffix}"

    @staticmethod
    def generate_secure_random(length: int = 32) -> bytes:
        """Generate cryptographically secure random bytes.

        Args:
            length: Number of bytes to generate

        Returns:
            Secure random bytes
        """
        return secrets.token_bytes(length)


class KeyValidation:
    """Key validation utilities."""

    @staticmethod
    def is_key_expired(created_at: datetime, max_age_days: int = 60) -> bool:
        """Check if a key is expired based on creation time.

        Args:
            created_at: When the key was created
            max_age_days: Maximum age in days

        Returns:
            True if key is expired
        """
        age = datetime.now(UTC) - created_at
        return age.days >= max_age_days

    @staticmethod
    def validate_kid_format(kid: str) -> bool:
        """Validate key ID format.

        Args:
            kid: Key ID to validate

        Returns:
            True if format is valid
        """
        # Expected format: YYYY-MM-DD-XXXXXXXX
        parts = kid.split("-")
        if len(parts) != 4:
            return False

        # Validate date part
        try:
            # Just validate the date format components
            year = int(parts[0])
            month = int(parts[1])
            day = int(parts[2])
            # Basic range checks
            if not (2020 <= year <= 2100 and 1 <= month <= 12 and 1 <= day <= 31):
                return False
        except (ValueError, TypeError):
            return False

        # Validate random suffix (8 hex chars)
        return len(parts[3]) == 8 and all(c in "0123456789abcdef" for c in parts[3])

    @staticmethod
    def validate_jwk_public(jwk: dict[str, str]) -> bool:
        """Validate JWK public key format.

        Args:
            jwk: JWK dictionary to validate

        Returns:
            True if JWK is valid Ed25519 public key
        """
        required_fields = {"kty", "crv", "kid", "use", "alg", "x"}

        # Check all required fields and values
        field_checks = [
            all(field in jwk for field in required_fields),
            jwk.get("kty") == "OKP",
            jwk.get("crv") == "Ed25519",
            jwk.get("use") == "sig",
            jwk.get("alg") == "EdDSA",
        ]

        if not all(field_checks):
            return False

        # Validate base64url-encoded public key
        try:
            x_value = jwk.get("x", "")
            # Add padding if needed for base64url decoding
            missing_padding = len(x_value) % 4
            padded_x = x_value + "=" * (4 - missing_padding) if missing_padding else x_value
            decoded = base64.urlsafe_b64decode(padded_x)
            return len(decoded) == 32  # Ed25519 public key is 32 bytes
        except (ValueError, TypeError, base64.binascii.Error):
            # Invalid base64 or wrong key size
            return False
