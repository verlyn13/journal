"""Tests for v2 auth endpoints with EdDSA signing and enhanced security features."""

from __future__ import annotations

import hashlib
import json

from datetime import UTC, datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import UUID, uuid4

import pytest

from fastapi import status
from httpx import AsyncClient
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.token_rotation_config import ACCESS_JWT_TTL, REFRESH_TOKEN_TTL
from app.domain.auth.jwt_service import JWTService
from app.domain.auth.jwt_verifier_policy import VerifierPolicy
from app.domain.auth.key_manager import KeyManager
from app.domain.auth.token_rotation_service import TokenRotationService
from app.infra.sa_models import User, UserSession
from app.services.integrated_auth_service import IntegratedAuthService
from app.services.m2m_token_service import M2MTokenService, MachineIdentity
from app.settings import settings


@pytest.mark.asyncio
class TestV2AuthEndpoints:
    """Test suite for v2 auth endpoints."""

    async def test_login_success(
        self,
        async_client: AsyncClient,
        db_session: AsyncSession,
        test_user: User,
    ) -> None:
        """Test successful login with EdDSA signing."""
        response = await async_client.post(
            "/api/v2/auth/login",
            json={
                "username": test_user.email,
                "password": "testpassword123",
                "use_session_cookie": True,
            },
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Check response structure
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] == int(ACCESS_JWT_TTL.total_seconds())

        # Refresh token should be in cookie, not response body
        assert "refresh_token" not in data

        # Verify cookie was set
        cookies = response.cookies
        assert settings.refresh_cookie_name in cookies

        # Verify database session was created
        result = await db_session.execute(
            select(UserSession).where(
                UserSession.user_id == test_user.id,
                UserSession.revoked_at.is_(None),
            )
        )
        session = result.scalar_one_or_none()
        assert session is not None
        assert session.refresh_id is not None

    async def test_login_without_session_cookie(
        self,
        async_client: AsyncClient,
        test_user: User,
    ) -> None:
        """Test login without session cookies returns refresh token in body."""
        response = await async_client.post(
            "/api/v2/auth/login",
            json={
                "username": test_user.email,
                "password": "testpassword123",
                "use_session_cookie": False,
            },
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Both tokens should be in response body
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

        # No refresh cookie should be set
        assert settings.refresh_cookie_name not in response.cookies

    async def test_login_invalid_credentials(
        self,
        async_client: AsyncClient,
        test_user: User,
    ) -> None:
        """Test login with invalid credentials."""
        response = await async_client.post(
            "/api/v2/auth/login",
            json={
                "username": test_user.email,
                "password": "wrongpassword",
            },
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Invalid credentials" in response.json()["detail"]

    async def test_refresh_token_rotation(
        self,
        async_client: AsyncClient,
        db_session: AsyncSession,
        test_user: User,
        redis_client: Redis,
    ) -> None:
        """Test refresh token rotation with new token generation."""
        # Login first
        login_response = await async_client.post(
            "/api/v2/auth/login",
            json={
                "username": test_user.email,
                "password": "testpassword123",
                "use_session_cookie": False,
            },
        )

        assert login_response.status_code == status.HTTP_200_OK
        tokens = login_response.json()
        old_refresh = tokens["refresh_token"]
        old_access = tokens["access_token"]

        # Use refresh token
        refresh_response = await async_client.post(
            "/api/v2/auth/refresh",
            json={"refresh_token": old_refresh},
        )

        assert refresh_response.status_code == status.HTTP_200_OK
        new_tokens = refresh_response.json()

        # Verify new tokens were issued
        assert new_tokens["access_token"] != old_access
        assert new_tokens["refresh_token"] != old_refresh

        # Verify old refresh token is marked as rotated in Redis
        rotation_service = TokenRotationService(db_session, redis_client)
        old_hash = hashlib.sha256(old_refresh.encode()).hexdigest()
        is_rotated = await rotation_service.check_refresh_token_reuse(old_hash, test_user.id)
        assert is_rotated is False  # Should not trigger reuse on first check

    async def test_refresh_token_reuse_detection(
        self,
        async_client: AsyncClient,
        db_session: AsyncSession,
        test_user: User,
        redis_client: Redis,
    ) -> None:
        """Test that reusing a refresh token triggers security response."""
        # Login first
        login_response = await async_client.post(
            "/api/v2/auth/login",
            json={
                "username": test_user.email,
                "password": "testpassword123",
                "use_session_cookie": False,
            },
        )

        tokens = login_response.json()
        refresh_token = tokens["refresh_token"]

        # Use refresh token once (valid)
        first_refresh = await async_client.post(
            "/api/v2/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert first_refresh.status_code == status.HTTP_200_OK

        # Try to reuse the same refresh token (security violation)
        second_refresh = await async_client.post(
            "/api/v2/auth/refresh",
            json={"refresh_token": refresh_token},
        )

        assert second_refresh.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Security violation" in second_refresh.json()["detail"]

        # Verify all sessions were revoked
        result = await db_session.execute(
            select(UserSession).where(
                UserSession.user_id == test_user.id,
                UserSession.revoked_at.is_(None),
            )
        )
        active_sessions = result.scalars().all()
        assert len(active_sessions) == 0

    async def test_logout(
        self,
        async_client: AsyncClient,
        db_session: AsyncSession,
        test_user: User,
    ) -> None:
        """Test logout endpoint revokes sessions."""
        # Login first
        login_response = await async_client.post(
            "/api/v2/auth/login",
            json={
                "username": test_user.email,
                "password": "testpassword123",
            },
        )

        tokens = login_response.json()
        access_token = tokens["access_token"]

        # Logout
        logout_response = await async_client.post(
            "/api/v2/auth/logout",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert logout_response.status_code == status.HTTP_200_OK

        # Verify session was revoked
        result = await db_session.execute(
            select(UserSession).where(
                UserSession.user_id == test_user.id,
                UserSession.revoked_at.is_(None),
            )
        )
        active_sessions = result.scalars().all()
        assert len(active_sessions) == 0

    async def test_logout_all_sessions(
        self,
        async_client: AsyncClient,
        db_session: AsyncSession,
        test_user: User,
    ) -> None:
        """Test logout with revoke_all flag."""
        # Create multiple sessions
        for _ in range(3):
            await async_client.post(
                "/api/v2/auth/login",
                json={
                    "username": test_user.email,
                    "password": "testpassword123",
                },
            )

        # Get one access token for logout
        login_response = await async_client.post(
            "/api/v2/auth/login",
            json={
                "username": test_user.email,
                "password": "testpassword123",
            },
        )
        access_token = login_response.json()["access_token"]

        # Verify multiple sessions exist
        result = await db_session.execute(
            select(UserSession).where(
                UserSession.user_id == test_user.id,
                UserSession.revoked_at.is_(None),
            )
        )
        active_sessions = result.scalars().all()
        assert len(active_sessions) >= 3

        # Logout all sessions
        logout_response = await async_client.post(
            "/api/v2/auth/logout",
            headers={"Authorization": f"Bearer {access_token}"},
            json={"revoke_all": True},
        )

        assert logout_response.status_code == status.HTTP_200_OK

        # Verify all sessions were revoked
        result = await db_session.execute(
            select(UserSession).where(
                UserSession.user_id == test_user.id,
                UserSession.revoked_at.is_(None),
            )
        )
        active_sessions = result.scalars().all()
        assert len(active_sessions) == 0

    async def test_csrf_token_generation(
        self,
        async_client: AsyncClient,
    ) -> None:
        """Test CSRF token endpoint."""
        response = await async_client.get("/api/v2/auth/csrf")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "csrf_token" in data

        # Verify cookie was set
        cookies = response.cookies
        assert settings.csrf_cookie_name in cookies
        assert cookies[settings.csrf_cookie_name] == data["csrf_token"]

    async def test_verify_endpoint(
        self,
        async_client: AsyncClient,
        test_user: User,
    ) -> None:
        """Test token verification endpoint."""
        # Login first
        login_response = await async_client.post(
            "/api/v2/auth/login",
            json={
                "username": test_user.email,
                "password": "testpassword123",
            },
        )

        access_token = login_response.json()["access_token"]

        # Verify token
        verify_response = await async_client.post(
            "/api/v2/auth/verify",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        assert verify_response.status_code == status.HTTP_200_OK
        data = verify_response.json()
        assert data["valid"] is True
        assert data["user_id"] == str(test_user.id)
        assert "claims" in data


@pytest.mark.asyncio
class TestM2MAuthentication:
    """Test suite for M2M token endpoints."""

    async def test_m2m_token_exchange(
        self,
        async_client: AsyncClient,
        db_session: AsyncSession,
        redis_client: Redis,
    ) -> None:
        """Test exchanging machine identity for M2M token."""
        # Mock Infisical validation
        with patch(
            "app.services.m2m_token_service.M2MTokenService._validate_identity_with_infisical"
        ) as mock_validate:
            mock_identity = MachineIdentity(
                identity_id="mi_test_prod",
                service_name="test-service",
                environment="production",
                scopes=["api.read", "api.write"],
                allowed_ips=["127.0.0.1"],
            )
            mock_validate.return_value = mock_identity

            response = await async_client.post(
                "/api/v2/auth/m2m/token",
                json={
                    "identity_token": "mi_test_prod_xxxxx",
                    "requested_scopes": ["api.read"],
                },
                headers={"X-Forwarded-For": "127.0.0.1"},
            )

            assert response.status_code == status.HTTP_200_OK
            data = response.json()

            assert "access_token" in data
            assert "token_type" in data
            assert data["token_type"] == "Bearer"
            assert "expires_in" in data

            # Verify token claims
            jwt_service = JWTService(db_session, redis_client)
            policy = VerifierPolicy(
                audience=["api", "services"],
                issuer=settings.jwt_iss,
            )
            claims = await jwt_service.verify_jwt(data["access_token"], policy)

            assert claims["token_type"] == "at+jwt"
            assert claims["scope"] == "api.read"
            assert claims["env"] == "production"
            assert claims["service"] == "test-service"

    async def test_m2m_token_invalid_ip(
        self,
        async_client: AsyncClient,
    ) -> None:
        """Test M2M token request from unauthorized IP."""
        with patch(
            "app.services.m2m_token_service.M2MTokenService._validate_identity_with_infisical"
        ) as mock_validate:
            mock_identity = MachineIdentity(
                identity_id="mi_test_prod",
                service_name="test-service",
                environment="production",
                scopes=["api.read"],
                allowed_ips=["10.0.0.1"],  # Different IP
            )
            mock_validate.return_value = mock_identity

            response = await async_client.post(
                "/api/v2/auth/m2m/token",
                json={
                    "identity_token": "mi_test_prod_xxxxx",
                    "requested_scopes": ["api.read"],
                },
                headers={"X-Forwarded-For": "127.0.0.1"},  # Unauthorized IP
            )

            assert response.status_code == status.HTTP_403_FORBIDDEN
            assert "not allowed" in response.json()["detail"]

    async def test_m2m_token_invalid_scope(
        self,
        async_client: AsyncClient,
    ) -> None:
        """Test M2M token request with unauthorized scope."""
        with patch(
            "app.services.m2m_token_service.M2MTokenService._validate_identity_with_infisical"
        ) as mock_validate:
            mock_identity = MachineIdentity(
                identity_id="mi_test_prod",
                service_name="test-service",
                environment="production",
                scopes=["api.read"],  # Only read
                allowed_ips=["127.0.0.1"],
            )
            mock_validate.return_value = mock_identity

            response = await async_client.post(
                "/api/v2/auth/m2m/token",
                json={
                    "identity_token": "mi_test_prod_xxxxx",
                    "requested_scopes": ["api.write"],  # Requesting write
                },
                headers={"X-Forwarded-For": "127.0.0.1"},
            )

            assert response.status_code == status.HTTP_403_FORBIDDEN
            assert "No valid scopes granted" in response.json()["detail"]


@pytest.mark.asyncio
class TestEdDSASigningAndVerification:
    """Test EdDSA JWT signing and verification."""

    async def test_eddsa_token_signature(
        self,
        db_session: AsyncSession,
        redis_client: Redis,
    ) -> None:
        """Test that tokens are signed with EdDSA."""
        key_manager = KeyManager(db_session, redis_client)
        jwt_service = JWTService(db_session, redis_client, key_manager)

        user_id = uuid4()
        token = await jwt_service.sign_jwt(
            user_id=user_id,
            token_type="access",
            scopes=["api.read"],
            ttl=timedelta(minutes=10),
        )

        # Parse token header
        header_b64 = token.split(".")[0]
        # Add padding if needed
        padding = 4 - (len(header_b64) % 4)
        if padding != 4:
            header_b64 += "=" * padding

        header = json.loads(__import__("base64").urlsafe_b64decode(header_b64))

        assert header["alg"] == "EdDSA"
        assert header["typ"] == "at+jwt"
        assert "kid" in header

    async def test_jwks_endpoint_returns_keys(
        self,
        async_client: AsyncClient,
    ) -> None:
        """Test JWKS endpoint returns current and next keys."""
        response = await async_client.get("/.well-known/jwks.json")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert "keys" in data
        assert len(data["keys"]) >= 1  # At least current key

        for key in data["keys"]:
            assert key["kty"] == "OKP"
            assert key["crv"] == "Ed25519"
            assert key["use"] == "sig"
            assert "kid" in key
            assert "x" in key  # Public key

    async def test_token_validation_with_jwks(
        self,
        db_session: AsyncSession,
        redis_client: Redis,
    ) -> None:
        """Test token can be validated using JWKS keys."""
        # Create and sign a token
        key_manager = KeyManager(db_session, redis_client)
        jwt_service = JWTService(db_session, redis_client, key_manager)

        user_id = uuid4()
        token = await jwt_service.sign_jwt(
            user_id=user_id,
            token_type="access",
            ttl=timedelta(minutes=10),
        )

        # Verify using same service (simulating JWKS validation)
        policy = VerifierPolicy(
            audience=[settings.jwt_aud],
            issuer=settings.jwt_iss,
            required_claims=["sub", "typ"],
        )

        claims = await jwt_service.verify_jwt(token, policy)
        assert claims["sub"] == str(user_id)
        # Check logical token type in payload
        assert claims.get("type") == "access"
        # Header typ should be RFC 9068 compliant
        assert claims.get("typ") == "at+jwt"


@pytest.mark.asyncio
class TestSecurityPolicies:
    """Test security policy enforcement."""

    async def test_token_expiration_enforcement(
        self,
        db_session: AsyncSession,
        redis_client: Redis,
    ) -> None:
        """Test that expired tokens are rejected."""
        key_manager = KeyManager(db_session, redis_client)
        jwt_service = JWTService(db_session, redis_client, key_manager)

        # Create token with very short TTL
        user_id = uuid4()
        token = await jwt_service.sign_jwt(
            user_id=user_id,
            token_type="access",
            ttl=timedelta(seconds=-1),  # Already expired
        )

        policy = VerifierPolicy(
            audience=[settings.jwt_aud],
            issuer=settings.jwt_iss,
        )

        with pytest.raises(Exception) as exc_info:
            await jwt_service.verify_jwt(token, policy)

        assert "expired" in str(exc_info.value).lower()

    async def test_audience_validation(
        self,
        db_session: AsyncSession,
        redis_client: Redis,
    ) -> None:
        """Test audience claim validation."""
        key_manager = KeyManager(db_session, redis_client)
        jwt_service = JWTService(db_session, redis_client, key_manager)

        user_id = uuid4()
        token = await jwt_service.sign_jwt(
            user_id=user_id,
            token_type="access",
            audience=["other-api"],  # Different audience
            ttl=timedelta(minutes=10),
        )

        policy = VerifierPolicy(
            audience=[settings.jwt_aud],  # Expected audience
            issuer=settings.jwt_iss,
        )

        with pytest.raises(Exception) as exc_info:
            await jwt_service.verify_jwt(token, policy)

        assert "audience" in str(exc_info.value).lower()

    async def test_issuer_validation(
        self,
        db_session: AsyncSession,
        redis_client: Redis,
    ) -> None:
        """Test issuer claim validation."""
        # This would require mocking the issuer in token creation
        # For now, we test that issuer is checked
        policy = VerifierPolicy(
            audience=[settings.jwt_aud],
            issuer="wrong-issuer",
        )

        key_manager = KeyManager(db_session, redis_client)
        jwt_service = JWTService(db_session, redis_client, key_manager)

        user_id = uuid4()
        token = await jwt_service.sign_jwt(
            user_id=user_id,
            token_type="access",
            ttl=timedelta(minutes=10),
        )

        with pytest.raises(Exception) as exc_info:
            await jwt_service.verify_jwt(token, policy)

        assert "issuer" in str(exc_info.value).lower()
