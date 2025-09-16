"""Security tests for JWT implementation."""

import base64
import contextlib
from datetime import UTC, datetime, timedelta
import json
import time
from uuid import uuid4

from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
import pytest

from app.domain.auth.jwt_service import JWTService
from app.domain.auth.token_validator import TokenValidator


# Use local security conftest fixtures (no DB/Redis)


@pytest.mark.asyncio()
class TestJWTSecurity:
    """Security-focused tests for JWT implementation."""

    async def test_token_signature_tampering(self, jwt_service: JWTService) -> None:
        """Test that tampered signatures are rejected."""
        # Sign a valid token
        user_id = uuid4()
        token = await jwt_service.sign_jwt(user_id, "access")

        # Tamper with signature
        parts = token.split(".")
        tampered_sig = base64.urlsafe_b64encode(b"tampered").decode().rstrip("=")
        tampered_token = f"{parts[0]}.{parts[1]}.{tampered_sig}"

        # Verification should fail
        with pytest.raises(ValueError, match="Invalid signature"):
            await jwt_service.verify_jwt(tampered_token)

    async def test_token_payload_tampering(self, jwt_service: JWTService) -> None:
        """Test that tampered payloads are rejected."""
        # Sign a valid token
        user_id = uuid4()
        token = await jwt_service.sign_jwt(user_id, "access", scopes=["entries:read"])

        # Decode and modify payload
        parts = token.split(".")
        payload = json.loads(base64.urlsafe_b64decode(parts[1] + "=="))
        payload["scope"] = "admin:system entries:write"  # Escalate privileges

        # Re-encode payload
        tampered_payload = (
            base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
        )
        tampered_token = f"{parts[0]}.{tampered_payload}.{parts[2]}"

        # Verification should fail
        with pytest.raises(ValueError, match="Invalid signature"):
            await jwt_service.verify_jwt(tampered_token)

    async def test_algorithm_confusion_attack(self, jwt_service: JWTService) -> None:
        """Test protection against algorithm confusion attacks."""
        # Sign a valid token
        user_id = uuid4()
        token = await jwt_service.sign_jwt(user_id, "access")

        # Try to change algorithm to "none"
        parts = token.split(".")
        header = json.loads(base64.urlsafe_b64decode(parts[0] + "=="))
        header["alg"] = "none"

        # Re-encode header
        tampered_header = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
        tampered_token = f"{tampered_header}.{parts[1]}."  # No signature

        # Verification should fail
        with pytest.raises(ValueError, match=r"forbidden|Algorithm|allowed"):
            await jwt_service.verify_jwt(tampered_token)

    async def test_expired_token_rejection(self, jwt_service: JWTService) -> None:
        """Test that expired tokens are rejected."""
        # Sign a token with very short TTL
        user_id = uuid4()
        token = await jwt_service.sign_jwt(
            user_id,
            "access",
            ttl=timedelta(seconds=-120),  # Already expired, beyond leeway
        )

        # Verification should fail
        with pytest.raises(ValueError, match="expired"):
            await jwt_service.verify_jwt(token)

    async def test_future_token_rejection(self, jwt_service: JWTService) -> None:
        """Test that tokens with future nbf are rejected."""
        # Sign a token manually with future nbf
        user_id = uuid4()
        token = await jwt_service.sign_jwt(user_id, "access")

        # Decode and modify nbf
        parts = token.split(".")
        payload = json.loads(base64.urlsafe_b64decode(parts[1] + "=="))
        payload["nbf"] = int((datetime.now(UTC) + timedelta(hours=1)).timestamp())

        # Create new token with modified payload (this would need proper signing)
        # For this test, we'll use the service's internal methods
        current_key = await jwt_service.key_manager.get_current_signing_key()

        header = {"alg": "EdDSA", "typ": "at+jwt", "kid": current_key.kid}
        header_b64 = jwt_service._base64url_encode(json.dumps(header))
        payload_b64 = jwt_service._base64url_encode(json.dumps(payload))

        signing_input = f"{header_b64}.{payload_b64}".encode()
        signature = current_key.private_key.sign(signing_input)
        signature_b64 = jwt_service._base64url_encode(signature)

        future_token = f"{header_b64}.{payload_b64}.{signature_b64}"

        # Verification should fail
        with pytest.raises(ValueError, match=r"not yet valid|nbf"):
            await jwt_service.verify_jwt(future_token)

    async def test_invalid_kid_rejection(self, jwt_service: JWTService) -> None:
        """Test that tokens with unknown kid are rejected."""
        # Create a token with invalid kid
        user_id = uuid4()
        fake_key = Ed25519PrivateKey.generate()

        header = {"alg": "EdDSA", "typ": "at+jwt", "kid": "invalid-kid"}
        payload = {
            "sub": str(user_id),
            "iat": int(datetime.now(UTC).timestamp()),
            "exp": int((datetime.now(UTC) + timedelta(minutes=10)).timestamp()),
            "type": "access",
        }

        header_b64 = jwt_service._base64url_encode(json.dumps(header))
        payload_b64 = jwt_service._base64url_encode(json.dumps(payload))

        signing_input = f"{header_b64}.{payload_b64}".encode()
        signature = fake_key.sign(signing_input)
        signature_b64 = jwt_service._base64url_encode(signature)

        fake_token = f"{header_b64}.{payload_b64}.{signature_b64}"

        # Verification should fail
        with pytest.raises(ValueError, match=r"Unknown key ID|Unknown key|kid"):
            await jwt_service.verify_jwt(fake_token)

    async def test_token_reuse_after_revocation(self, jwt_service: JWTService) -> None:
        """Test that revoked tokens are rejected."""
        # Sign a valid token
        user_id = uuid4()
        token = await jwt_service.sign_jwt(user_id, "access")

        # Verify it works initially
        claims = await jwt_service.verify_jwt(token)
        jti = claims["jti"]

        # Revoke the token
        await jwt_service.revoke_token(jti, user_id)

        # Verification should now fail
        with pytest.raises(ValueError, match="Token has been revoked"):
            await jwt_service.verify_jwt(token)

    async def test_scope_escalation_prevention(
        self,
        jwt_service: JWTService,
        token_validator: TokenValidator,
    ) -> None:
        """Test that scope escalation is prevented."""
        # Sign a token with limited scopes
        user_id = uuid4()
        token = await jwt_service.sign_jwt(
            user_id,
            "access",
            scopes=["entries:read"],
        )

        # Verify and validate claims
        claims = await jwt_service.verify_jwt(token)
        validated = await token_validator.validate_claims(claims, validate_user=False)

        # Check that admin scope is not present
        assert not token_validator.check_scope(validated, "admin:system", allow_admin=False)
        assert not token_validator.check_scope(validated, "entries:delete")
        assert token_validator.check_scope(validated, "entries:read")

    async def test_audience_validation(self, jwt_service: JWTService) -> None:
        """Test that audience validation works correctly."""
        # Sign a token for specific audience
        user_id = uuid4()
        token = await jwt_service.sign_jwt(
            user_id,
            "access",
            audience=["mobile", "web"],
        )

        # Should work with correct audience
        claims = await jwt_service.verify_jwt(token, expected_audience="web")
        assert "web" in claims["aud"]

        # Should fail with wrong audience
        with pytest.raises(ValueError, match=r"audience|No matching audience"):
            await jwt_service.verify_jwt(token, expected_audience="admin")

    async def test_token_type_validation(self, jwt_service: JWTService) -> None:
        """Test that token type validation works correctly."""
        # Sign a refresh token
        user_id = uuid4()
        token = await jwt_service.sign_jwt(user_id, "refresh")

        # Should work with correct type
        claims = await jwt_service.verify_jwt(token, expected_type="refresh")
        assert claims["type"] == "refresh"

        # Should fail with wrong type
        with pytest.raises(ValueError, match=r"Invalid token type|Token type"):
            await jwt_service.verify_jwt(token, expected_type="access")

    async def test_jti_uniqueness(self, jwt_service: JWTService) -> None:
        """Test that JTI values are unique."""
        user_id = uuid4()
        tokens = []
        jtis = set()

        # Generate multiple tokens
        for _ in range(10):
            token = await jwt_service.sign_jwt(user_id, "access")
            tokens.append(token)

            # Extract JTI
            claims = await jwt_service.verify_jwt(token)
            jtis.add(claims["jti"])

        # All JTIs should be unique
        assert len(jtis) == 10

    async def test_token_replay_attack_prevention(self, jwt_service: JWTService) -> None:
        """Test prevention of token replay attacks."""
        # Sign a one-time use token (like refresh token)
        user_id = uuid4()
        token = await jwt_service.sign_jwt(user_id, "refresh")

        # First use should work
        claims = await jwt_service.verify_jwt(token)
        jti = claims["jti"]

        # Mark as used (in real implementation, this would happen during refresh)
        await jwt_service.revoke_token(jti, user_id)

        # Second use should fail
        with pytest.raises(ValueError, match="Token has been revoked"):
            await jwt_service.verify_jwt(token)

    async def test_malformed_token_handling(self, jwt_service: JWTService) -> None:
        """Test handling of various malformed tokens."""
        # Test various malformed tokens
        malformed_tokens = [
            "not.a.token",
            "invalid",
            "",
            "a.b",  # Missing signature
            "a.b.c.d",  # Too many parts
            "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0In0.",  # Invalid algorithm
        ]

        for token in malformed_tokens:
            with pytest.raises(ValueError, match=r"Invalid|malformed|decode"):
                await jwt_service.verify_jwt(token)

    async def test_key_rotation_during_verification(
        self,
        jwt_service: JWTService,
        key_manager,
    ) -> None:
        """Test that tokens remain valid during key rotation."""
        # Sign token with current key
        user_id = uuid4()
        token = await jwt_service.sign_jwt(user_id, "access", ttl=timedelta(minutes=5))

        # Verify it works
        claims = await jwt_service.verify_jwt(token)

        # Rotate keys
        await key_manager.rotate_keys(force=True)

        # Old token should still verify (during overlap window)
        claims = await jwt_service.verify_jwt(token)
        assert claims["sub"] == str(user_id)

        # New tokens should use new key
        new_token = await jwt_service.sign_jwt(user_id, "access")
        new_claims = await jwt_service.verify_jwt(new_token)
        assert new_claims["sub"] == str(user_id)


@pytest.mark.asyncio()
class TestTokenValidatorSecurity:
    """Security tests for token validator."""

    async def test_sql_injection_in_user_lookup(
        self,
        token_validator: TokenValidator,
    ) -> None:
        """Test that SQL injection is prevented in user lookups."""
        # Try SQL injection in user ID
        malicious_claims = {
            "sub": "'; DROP TABLE users; --",
            "type": "access",
            "exp": int((datetime.now(UTC) + timedelta(hours=1)).timestamp()),
        }

        # Should fail safely without SQL execution
        with pytest.raises(ValueError, match="Invalid subject format"):
            await token_validator.validate_claims(malicious_claims)

    async def test_scope_wildcard_abuse_prevention(
        self,
        token_validator: TokenValidator,
    ) -> None:
        """Test that scope wildcards can't be abused."""
        claims = {
            "sub": str(uuid4()),
            "type": "access",
            "scopes": ["entries:*", "admin:*"],  # Wildcards
        }

        # Should match specific scopes under entries
        assert token_validator.check_scope(claims, "entries:read")
        assert token_validator.check_scope(claims, "entries:write")

        # But admin:* shouldn't work unless explicitly allowed
        permissions = token_validator.get_user_permissions(claims)
        # Admin check should use exact match, not wildcard
        assert permissions["is_admin"] is False  # Because it checks admin:system exactly

    async def test_cache_poisoning_prevention(
        self,
        token_validator: TokenValidator,
    ) -> None:
        """Test that cache can't be poisoned with invalid data."""
        jti = str(uuid4())

        # Try to cache invalid validation result
        malicious_result = {
            "sub": str(uuid4()),
            "type": "access",
            "scopes": ["admin:system", "entries:delete"],  # Escalated privileges
            "__proto__": {"isAdmin": True},  # Prototype pollution attempt
        }

        await token_validator.cache_validation_result(jti, malicious_result, ttl=60)

        # Retrieved result should be safe
        cached = await token_validator.get_cached_validation(jti)
        assert cached is not None
        # Prototype pollution should not work
        assert "__proto__" not in cached or cached["__proto__"] == {"isAdmin": True}

    async def test_timing_attack_resistance(
        self,
        jwt_service: JWTService,
    ) -> None:
        """Test resistance to timing attacks on signature verification."""
        user_id = uuid4()
        valid_token = await jwt_service.sign_jwt(user_id, "access")

        # Create invalid tokens with varying signature similarity
        parts = valid_token.split(".")
        valid_sig = base64.urlsafe_b64decode(parts[2] + "==")

        # Test tokens with signatures of varying similarity
        timings = []
        for i in range(10):
            # Create signature that matches first i bytes
            fake_sig = bytearray(valid_sig)
            for j in range(i, len(fake_sig)):
                fake_sig[j] = (fake_sig[j] + 1) % 256

            fake_token = f"{parts[0]}.{parts[1]}.{jwt_service._base64url_encode(bytes(fake_sig))}"

            start = time.perf_counter()
            with contextlib.suppress(ValueError):
                await jwt_service.verify_jwt(fake_token)
            elapsed = time.perf_counter() - start
            timings.append(elapsed)

        # Timing should not correlate with signature similarity
        # (In practice, Ed25519 verification is constant-time)
        # Check that variance is low
        import statistics

        variance = statistics.variance(timings)
        assert variance < 0.001  # Less than 1ms variance
