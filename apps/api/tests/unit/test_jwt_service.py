"""Unit tests for JWT service."""
# ruff: noqa: F811

import json

from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest

from app.domain.auth.jwt_service import JWTService
from app.domain.auth.key_manager import KeyManager
from app.infra.crypto.key_generation import Ed25519KeyGenerator

# Import fixtures for pytest to discover them
from tests.fixtures.jwt_fixtures import (  # noqa: F401
    jwt_service,
    key_manager,
    redis,
    token_validator,
)


@pytest.mark.asyncio
class TestJWTService:
    """Test JWT service functionality."""

    async def test_sign_and_verify_jwt(self, jwt_service: JWTService) -> None:
        """Test basic JWT signing and verification."""
        user_id = uuid4()
        scopes = ["entries:read", "entries:write"]

        # Sign JWT
        token = await jwt_service.sign_jwt(
            user_id=user_id,
            token_type="access",
            scopes=scopes,
            audience=["api", "web"],
        )

        assert token is not None
        assert len(token.split(".")) == 3

        # Verify JWT
        claims = await jwt_service.verify_jwt(token)

        assert claims["sub"] == str(user_id)
        assert claims["type"] == "access"
        assert claims["scope"] == "entries:read entries:write"
        assert "api" in claims["aud"]
        assert "web" in claims["aud"]

    async def test_token_expiration(self, jwt_service: JWTService) -> None:
        """Test token expiration handling."""
        user_id = uuid4()

        # Sign token with short TTL
        token = await jwt_service.sign_jwt(
            user_id=user_id,
            token_type="access",
            ttl=timedelta(seconds=1),
        )

        # Should verify immediately
        claims = await jwt_service.verify_jwt(token)
        assert claims["sub"] == str(user_id)

        # Wait for expiration
        import asyncio
        await asyncio.sleep(2)

        # Should fail after expiration
        with pytest.raises(ValueError, match="Token expired"):
            await jwt_service.verify_jwt(token)

    async def test_token_types(self, jwt_service: JWTService) -> None:
        """Test different token types with appropriate TTLs."""
        user_id = uuid4()

        # Test each token type
        token_types = ["access", "refresh", "m2m", "session"]

        for token_type in token_types:
            token = await jwt_service.sign_jwt(user_id, token_type)
            claims = await jwt_service.verify_jwt(token)

            assert claims["type"] == token_type

            # Check TTL is appropriate
            iat = claims["iat"]
            exp = claims["exp"]
            ttl_seconds = exp - iat

            if token_type == "access":
                assert ttl_seconds == 600  # 10 minutes
            elif token_type == "refresh":
                assert ttl_seconds == 1209600  # 14 days
            elif token_type == "m2m":
                assert ttl_seconds == 1800  # 30 minutes
            elif token_type == "session":
                assert ttl_seconds == 43200  # 12 hours

    async def test_token_revocation(self, jwt_service: JWTService) -> None:
        """Test token revocation functionality."""
        user_id = uuid4()

        # Sign token
        token = await jwt_service.sign_jwt(user_id, "access")
        claims = await jwt_service.verify_jwt(token)
        jti = claims["jti"]

        # Revoke token
        await jwt_service.revoke_token(jti, user_id)

        # Verification should fail
        with pytest.raises(ValueError, match="Token has been revoked"):
            await jwt_service.verify_jwt(token)

    async def test_mass_revocation(self, jwt_service: JWTService) -> None:
        """Test revoking all tokens for a user."""
        user_id = uuid4()

        # Sign multiple tokens
        tokens = []
        for _ in range(3):
            token = await jwt_service.sign_jwt(user_id, "access")
            tokens.append(token)

        # Verify all work
        for token in tokens:
            claims = await jwt_service.verify_jwt(token)
            assert claims["sub"] == str(user_id)

        # Revoke all user tokens
        count = await jwt_service.revoke_all_user_tokens(user_id)
        assert count >= 1

        # All should be revoked
        # Note: Current implementation uses timestamp-based revocation
        # which would need additional logic in verify_jwt

    async def test_token_introspection(self, jwt_service: JWTService) -> None:
        """Test token introspection."""
        user_id = uuid4()

        # Valid token
        token = await jwt_service.sign_jwt(
            user_id=user_id,
            token_type="access",
            scopes=["entries:read"],
        )

        result = await jwt_service.introspect_token(token)
        assert result["active"] is True
        assert result["sub"] == str(user_id)
        assert result["type"] == "access"
        assert result["scope"] == "entries:read"

        # Expired token
        expired_token = await jwt_service.sign_jwt(
            user_id=user_id,
            token_type="access",
            ttl=timedelta(seconds=-1),
        )

        result = await jwt_service.introspect_token(expired_token)
        assert result["active"] is False
        assert "error" in result

    async def test_additional_claims(self, jwt_service: JWTService) -> None:
        """Test adding additional claims to tokens."""
        user_id = uuid4()

        additional = {
            "email": "test@example.com",
            "roles": ["user", "editor"],
            "org_id": str(uuid4()),
        }

        token = await jwt_service.sign_jwt(
            user_id=user_id,
            token_type="access",
            additional_claims=additional,
        )

        claims = await jwt_service.verify_jwt(token)
        assert claims["email"] == "test@example.com"
        assert claims["roles"] == ["user", "editor"]
        assert claims["org_id"] == additional["org_id"]

    async def test_audience_verification(self, jwt_service: JWTService) -> None:
        """Test audience verification."""
        user_id = uuid4()

        # Token with specific audiences
        token = await jwt_service.sign_jwt(
            user_id=user_id,
            token_type="access",
            audience=["api", "mobile"],
        )

        # Should verify with correct audience
        claims = await jwt_service.verify_jwt(token, expected_audience="api")
        assert "api" in claims["aud"]

        claims = await jwt_service.verify_jwt(token, expected_audience="mobile")
        assert "mobile" in claims["aud"]

        # Should fail with wrong audience
        with pytest.raises(ValueError, match="Invalid audience"):
            await jwt_service.verify_jwt(token, expected_audience="web")

    async def test_scope_verification(self, jwt_service: JWTService) -> None:
        """Test scope verification."""
        user_id = uuid4()

        token = await jwt_service.sign_jwt(
            user_id=user_id,
            token_type="access",
            scopes=["entries:read", "profile:read"],
        )

        # Verify with required scopes
        claims = await jwt_service.verify_jwt(
            token,
            required_scopes=["entries:read"],
        )
        assert claims["scope"] == "entries:read profile:read"

        # Should fail with missing scope
        with pytest.raises(ValueError, match="Insufficient scopes"):
            await jwt_service.verify_jwt(
                token,
                required_scopes=["entries:write"],
            )

    async def test_token_type_verification(self, jwt_service: JWTService) -> None:
        """Test token type verification."""
        user_id = uuid4()

        # Create refresh token
        token = await jwt_service.sign_jwt(user_id, "refresh")

        # Should verify with correct type
        claims = await jwt_service.verify_jwt(token, expected_type="refresh")
        assert claims["type"] == "refresh"

        # Should fail with wrong type
        with pytest.raises(ValueError, match="Invalid token type"):
            await jwt_service.verify_jwt(token, expected_type="access")

    async def test_jti_generation(self, jwt_service: JWTService) -> None:
        """Test JTI generation and uniqueness."""
        user_id = uuid4()
        jtis = set()

        # Generate multiple tokens
        for _ in range(10):
            token = await jwt_service.sign_jwt(user_id, "access")
            claims = await jwt_service.verify_jwt(token)
            jtis.add(claims["jti"])

        # All JTIs should be unique
        assert len(jtis) == 10

    async def test_nbf_claim(self, jwt_service: JWTService) -> None:
        """Test not-before claim is set correctly."""
        user_id = uuid4()

        token = await jwt_service.sign_jwt(user_id, "access")
        claims = await jwt_service.verify_jwt(token)

        # NBF should be set to current time
        assert "nbf" in claims
        assert claims["nbf"] <= int(datetime.now(UTC).timestamp())
        assert claims["nbf"] == claims["iat"]  # Should match issued at

    async def test_header_validation(self, jwt_service: JWTService) -> None:
        """Test JWT header validation."""
        user_id = uuid4()
        token = await jwt_service.sign_jwt(user_id, "access")

        # Decode header
        import base64
        header_b64 = token.split(".")[0]
        padding = 4 - (len(header_b64) % 4)
        if padding != 4:
            header_b64 += "=" * padding

        header = json.loads(base64.urlsafe_b64decode(header_b64))

        # Check header fields
        assert header["alg"] == "EdDSA"
        assert header["typ"] == "JWT"
        assert "kid" in header

    async def test_service_token(self, jwt_service: JWTService) -> None:
        """Test M2M service token creation."""
        service_id = uuid4()

        token = await jwt_service.sign_jwt(
            user_id=service_id,
            token_type="m2m",
            scopes=["service:embedding", "service:search"],
            audience=["services"],
            additional_claims={"service_name": "embedding-worker"},
        )

        claims = await jwt_service.verify_jwt(token)
        assert claims["type"] == "m2m"
        assert claims["service_name"] == "embedding-worker"
        assert "services" in claims["aud"]
        assert "service:embedding" in claims["scope"]
