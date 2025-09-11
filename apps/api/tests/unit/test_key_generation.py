"""Tests for Ed25519 key generation and management utilities."""

from __future__ import annotations

import base64
import json

from datetime import UTC, datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ed25519

from app.infra.crypto.key_generation import Ed25519KeyGenerator, KeyMaterial, KeyPair, KeyValidation


class TestEd25519KeyGenerator:
    """Test Ed25519 key generation functionality."""

    def test_generate_key_pair_default(self):
        """Test generating key pair with default parameters."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()

        assert isinstance(key_pair.private_key, ed25519.Ed25519PrivateKey)
        assert isinstance(key_pair.public_key, ed25519.Ed25519PublicKey)
        assert key_pair.kid is not None
        assert len(key_pair.kid.split("-")) == 4  # YYYY-MM-DD-XXXXXXXX
        assert key_pair.algorithm == "EdDSA"
        assert key_pair.curve == "Ed25519"
        assert isinstance(key_pair.created_at, datetime)

    def test_generate_key_pair_custom_kid(self):
        """Test generating key pair with custom key ID."""
        custom_kid = "test-key-2025-01-01"
        key_pair = Ed25519KeyGenerator.generate_key_pair(kid=custom_kid)

        assert key_pair.kid == custom_kid
        assert isinstance(key_pair.private_key, ed25519.Ed25519PrivateKey)

    def test_serialize_key_pair(self):
        """Test key pair serialization to various formats."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()
        key_material = Ed25519KeyGenerator.serialize_key_pair(key_pair)

        # Check all required fields
        assert isinstance(key_material, KeyMaterial)
        assert key_material.kid == key_pair.kid
        assert key_material.created_at == key_pair.created_at

        # PEM format validation
        assert key_material.private_key_pem.startswith("-----BEGIN PRIVATE KEY-----")
        assert key_material.public_key_pem.startswith("-----BEGIN PUBLIC KEY-----")

        # Raw bytes validation
        assert len(key_material.private_key_raw) == 32
        assert len(key_material.public_key_raw) == 32

        # JWK validation
        jwk = key_material.jwk_public
        assert jwk["kty"] == "OKP"
        assert jwk["crv"] == "Ed25519"
        assert jwk["kid"] == key_pair.kid
        assert jwk["use"] == "sig"
        assert jwk["alg"] == "EdDSA"
        assert "x" in jwk

    def test_load_private_key_from_pem(self):
        """Test loading private key from PEM format."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()
        key_material = Ed25519KeyGenerator.serialize_key_pair(key_pair)

        loaded_key = Ed25519KeyGenerator.load_private_key_from_pem(key_material.private_key_pem)

        assert isinstance(loaded_key, ed25519.Ed25519PrivateKey)
        # Verify it's the same key by comparing signatures
        test_data = b"test_message"
        original_sig = key_pair.private_key.sign(test_data)
        loaded_sig = loaded_key.sign(test_data)

        # Both signatures should verify with the same public key
        key_pair.public_key.verify(original_sig, test_data)
        key_pair.public_key.verify(loaded_sig, test_data)

    def test_load_private_key_invalid_pem(self):
        """Test loading invalid PEM raises ValueError."""
        with pytest.raises(ValueError, match="Invalid Ed25519 private key PEM"):
            Ed25519KeyGenerator.load_private_key_from_pem("invalid_pem_data")

    def test_load_public_key_from_pem(self):
        """Test loading public key from PEM format."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()
        key_material = Ed25519KeyGenerator.serialize_key_pair(key_pair)

        loaded_key = Ed25519KeyGenerator.load_public_key_from_pem(key_material.public_key_pem)

        assert isinstance(loaded_key, ed25519.Ed25519PublicKey)
        # Verify it's the same key by using it to verify a signature
        test_data = b"test_message"
        signature = key_pair.private_key.sign(test_data)
        loaded_key.verify(signature, test_data)  # Should not raise

    def test_load_public_key_invalid_pem(self):
        """Test loading invalid public key PEM raises ValueError."""
        with pytest.raises(ValueError, match="Invalid Ed25519 public key PEM"):
            Ed25519KeyGenerator.load_public_key_from_pem("invalid_pem_data")

    def test_load_private_key_from_raw(self):
        """Test loading private key from raw bytes."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()
        key_material = Ed25519KeyGenerator.serialize_key_pair(key_pair)

        loaded_key = Ed25519KeyGenerator.load_private_key_from_raw(key_material.private_key_raw)

        assert isinstance(loaded_key, ed25519.Ed25519PrivateKey)

    def test_load_private_key_invalid_raw_length(self):
        """Test loading raw private key with invalid length."""
        with pytest.raises(ValueError, match="Ed25519 private key must be 32 bytes"):
            Ed25519KeyGenerator.load_private_key_from_raw(b"invalid_length")

    def test_load_public_key_from_raw(self):
        """Test loading public key from raw bytes."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()
        key_material = Ed25519KeyGenerator.serialize_key_pair(key_pair)

        loaded_key = Ed25519KeyGenerator.load_public_key_from_raw(key_material.public_key_raw)

        assert isinstance(loaded_key, ed25519.Ed25519PublicKey)

    def test_load_public_key_invalid_raw_length(self):
        """Test loading raw public key with invalid length."""
        with pytest.raises(ValueError, match="Ed25519 public key must be 32 bytes"):
            Ed25519KeyGenerator.load_public_key_from_raw(b"invalid_length")

    def test_verify_key_pair_valid(self):
        """Test verification of valid key pair."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()

        result = Ed25519KeyGenerator.verify_key_pair(key_pair.private_key, key_pair.public_key)

        assert result is True

    def test_verify_key_pair_invalid(self):
        """Test verification of mismatched key pair."""
        key_pair1 = Ed25519KeyGenerator.generate_key_pair()
        key_pair2 = Ed25519KeyGenerator.generate_key_pair()

        result = Ed25519KeyGenerator.verify_key_pair(key_pair1.private_key, key_pair2.public_key)

        assert result is False

    def test_generate_kid_format(self):
        """Test KID generation follows expected format."""
        kid = Ed25519KeyGenerator._generate_kid()

        parts = kid.split("-")
        assert len(parts) == 4

        # Date part should be valid
        date_part = f"{parts[0]}-{parts[1]}-{parts[2]}"
        datetime.strptime(date_part, "%Y-%m-%d")  # Should not raise

        # Random suffix should be 8 hex characters
        assert len(parts[3]) == 8
        assert all(c in "0123456789abcdef" for c in parts[3])

    def test_generate_secure_random(self):
        """Test secure random generation."""
        random_bytes = Ed25519KeyGenerator.generate_secure_random(32)

        assert len(random_bytes) == 32
        assert isinstance(random_bytes, bytes)

        # Generate multiple times to ensure randomness
        random_bytes2 = Ed25519KeyGenerator.generate_secure_random(32)
        assert random_bytes != random_bytes2

    def test_key_generation_performance(self):
        """Test key generation meets performance requirements (<10ms)."""
        import time

        start_time = time.time()
        Ed25519KeyGenerator.generate_key_pair()
        end_time = time.time()

        generation_time = (end_time - start_time) * 1000  # Convert to ms
        assert generation_time < 10, (
            f"Key generation took {generation_time:.2f}ms, exceeds 10ms limit"
        )

    def test_serialization_roundtrip(self):
        """Test complete serialization and deserialization roundtrip."""
        original_key_pair = Ed25519KeyGenerator.generate_key_pair()
        key_material = Ed25519KeyGenerator.serialize_key_pair(original_key_pair)

        # Recreate key pair from serialized data
        loaded_private = Ed25519KeyGenerator.load_private_key_from_pem(key_material.private_key_pem)
        loaded_public = Ed25519KeyGenerator.load_public_key_from_pem(key_material.public_key_pem)

        # Verify keys work the same
        test_message = b"roundtrip_test_message"
        original_signature = original_key_pair.private_key.sign(test_message)
        loaded_signature = loaded_private.sign(test_message)

        # Both signatures should verify with both public keys
        original_key_pair.public_key.verify(original_signature, test_message)
        original_key_pair.public_key.verify(loaded_signature, test_message)
        loaded_public.verify(original_signature, test_message)
        loaded_public.verify(loaded_signature, test_message)


class TestKeyValidation:
    """Test key validation utilities."""

    def test_is_key_expired_not_expired(self):
        """Test key expiration check for non-expired key."""
        recent_time = datetime.now(UTC) - timedelta(days=30)

        assert not KeyValidation.is_key_expired(recent_time, max_age_days=60)

    def test_is_key_expired_expired(self):
        """Test key expiration check for expired key."""
        old_time = datetime.now(UTC) - timedelta(days=90)

        assert KeyValidation.is_key_expired(old_time, max_age_days=60)

    def test_validate_kid_format_valid(self):
        """Test KID format validation for valid format."""
        valid_kid = "2025-01-15-abcdef12"

        assert KeyValidation.validate_kid_format(valid_kid)

    def test_validate_kid_format_invalid_parts(self):
        """Test KID format validation for wrong number of parts."""
        invalid_kid = "2025-01-15"

        assert not KeyValidation.validate_kid_format(invalid_kid)

    def test_validate_kid_format_invalid_date(self):
        """Test KID format validation for invalid date."""
        invalid_kid = "2025-13-32-abcdef12"  # Invalid month and day

        assert not KeyValidation.validate_kid_format(invalid_kid)

    def test_validate_kid_format_invalid_suffix(self):
        """Test KID format validation for invalid random suffix."""
        invalid_kid = "2025-01-15-xyz"  # Wrong length

        assert not KeyValidation.validate_kid_format(invalid_kid)

    def test_validate_jwk_public_valid(self):
        """Test JWK public key validation for valid key."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()
        key_material = Ed25519KeyGenerator.serialize_key_pair(key_pair)

        assert KeyValidation.validate_jwk_public(key_material.jwk_public)

    def test_validate_jwk_public_missing_fields(self):
        """Test JWK validation for missing required fields."""
        incomplete_jwk = {
            "kty": "OKP",
            "crv": "Ed25519",
            # Missing kid, use, alg, x
        }

        assert not KeyValidation.validate_jwk_public(incomplete_jwk)

    def test_validate_jwk_public_wrong_kty(self):
        """Test JWK validation for wrong key type."""
        invalid_jwk = {
            "kty": "RSA",  # Should be OKP
            "crv": "Ed25519",
            "kid": "test",
            "use": "sig",
            "alg": "EdDSA",
            "x": "valid_base64url_key",
        }

        assert not KeyValidation.validate_jwk_public(invalid_jwk)

    def test_validate_jwk_public_invalid_x_value(self):
        """Test JWK validation for invalid public key value."""
        invalid_jwk = {
            "kty": "OKP",
            "crv": "Ed25519",
            "kid": "test",
            "use": "sig",
            "alg": "EdDSA",
            "x": "invalid_base64!",
        }

        assert not KeyValidation.validate_jwk_public(invalid_jwk)

    def test_jwk_x_value_length(self):
        """Test JWK validation for correct x value length."""
        # Generate valid key and check x value length
        key_pair = Ed25519KeyGenerator.generate_key_pair()
        key_material = Ed25519KeyGenerator.serialize_key_pair(key_pair)

        x_value = key_material.jwk_public["x"]
        # Add padding if needed for base64url decoding
        missing_padding = len(x_value) % 4
        if missing_padding:
            padded_x = x_value + "=" * (4 - missing_padding)
        else:
            padded_x = x_value
        decoded = base64.urlsafe_b64decode(padded_x)

        assert len(decoded) == 32  # Ed25519 public key should be 32 bytes


class TestKeyMaterialSerialization:
    """Test KeyMaterial serialization and validation."""

    def test_key_material_creation(self):
        """Test KeyMaterial creation with all fields."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()
        key_material = Ed25519KeyGenerator.serialize_key_pair(key_pair)

        assert key_material.kid == key_pair.kid
        assert key_material.created_at == key_pair.created_at
        assert isinstance(key_material.private_key_pem, str)
        assert isinstance(key_material.public_key_pem, str)
        assert isinstance(key_material.private_key_raw, bytes)
        assert isinstance(key_material.public_key_raw, bytes)
        assert isinstance(key_material.jwk_public, dict)

    def test_jwk_public_contains_required_fields(self):
        """Test JWK public key contains all required fields."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()
        key_material = Ed25519KeyGenerator.serialize_key_pair(key_pair)

        jwk = key_material.jwk_public
        required_fields = {"kty", "crv", "kid", "use", "alg", "x"}

        assert all(field in jwk for field in required_fields)
        assert jwk["kty"] == "OKP"
        assert jwk["crv"] == "Ed25519"
        assert jwk["use"] == "sig"
        assert jwk["alg"] == "EdDSA"

    def test_pem_format_validation(self):
        """Test PEM formats are correctly structured."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()
        key_material = Ed25519KeyGenerator.serialize_key_pair(key_pair)

        # Private key PEM format
        assert key_material.private_key_pem.startswith("-----BEGIN PRIVATE KEY-----")
        assert key_material.private_key_pem.endswith("-----END PRIVATE KEY-----\n")

        # Public key PEM format
        assert key_material.public_key_pem.startswith("-----BEGIN PUBLIC KEY-----")
        assert key_material.public_key_pem.endswith("-----END PUBLIC KEY-----\n")

        # Can be loaded by cryptography library
        private_key = serialization.load_pem_private_key(
            key_material.private_key_pem.encode(), password=None
        )
        public_key = serialization.load_pem_public_key(key_material.public_key_pem.encode())

        assert isinstance(private_key, ed25519.Ed25519PrivateKey)
        assert isinstance(public_key, ed25519.Ed25519PublicKey)


class TestSecurityFeatures:
    """Test security-specific features of key generation."""

    def test_key_uniqueness(self):
        """Test that generated keys are unique."""
        keys = [Ed25519KeyGenerator.generate_key_pair() for _ in range(10)]

        # All KIDs should be unique
        kids = [key.kid for key in keys]
        assert len(set(kids)) == len(kids)

        # All private keys should be unique
        private_keys = [key.private_key.private_bytes_raw() for key in keys]
        assert len(set(private_keys)) == len(private_keys)

    def test_no_weak_keys(self):
        """Test that no weak keys are generated."""
        # Ed25519 doesn't have weak keys like RSA, but we can test basic properties
        for _ in range(100):
            key_pair = Ed25519KeyGenerator.generate_key_pair()

            # Verify key pair works
            assert Ed25519KeyGenerator.verify_key_pair(key_pair.private_key, key_pair.public_key)

            # Private key should not be all zeros
            private_bytes = key_pair.private_key.private_bytes_raw()
            assert private_bytes != b"\x00" * 32

    def test_cryptographic_constants(self):
        """Test that cryptographic constants are correct."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()
        key_material = Ed25519KeyGenerator.serialize_key_pair(key_pair)

        # Ed25519 keys should be exactly 32 bytes
        assert len(key_material.private_key_raw) == 32
        assert len(key_material.public_key_raw) == 32

        # Algorithm constants should be correct
        assert key_pair.algorithm == "EdDSA"
        assert key_pair.curve == "Ed25519"

    def test_secure_random_entropy(self):
        """Test that secure random generation has good entropy."""
        # Generate multiple random values and check they're different
        random_values = [Ed25519KeyGenerator.generate_secure_random(32) for _ in range(10)]

        # All values should be unique
        assert len(set(random_values)) == len(random_values)

        # No value should be all zeros
        assert all(value != b"\x00" * 32 for value in random_values)

    @patch("secrets.token_hex")
    def test_kid_generation_uses_secure_random(self, mock_token_hex):
        """Test that KID generation uses secure randomness."""
        mock_token_hex.return_value = "abcd1234"

        kid = Ed25519KeyGenerator._generate_kid()

        mock_token_hex.assert_called_once_with(4)
        assert kid.endswith("-abcd1234")

    def test_signature_verification_roundtrip(self):
        """Test complete signature verification workflow."""
        key_pair = Ed25519KeyGenerator.generate_key_pair()

        # Test data
        messages = [
            b"hello world",
            b"",  # Empty message
            b"a" * 1000,  # Large message
            "unicode message: 你好世界".encode(),
        ]

        for message in messages:
            signature = key_pair.private_key.sign(message)

            # Verification should succeed with correct key
            key_pair.public_key.verify(signature, message)

            # Verification should fail with wrong message
            with pytest.raises(Exception):
                key_pair.public_key.verify(signature, message + b"tampered")
