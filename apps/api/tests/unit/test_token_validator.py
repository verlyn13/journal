"""Unit tests for token validator."""

from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest

from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.token_validator import TokenValidator
from app.infra.sa_models import User

# Import fixtures for pytest to discover them
from tests.fixtures.jwt_fixtures import jwt_service, key_manager, redis, token_validator


@pytest.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user."""
    user = User(
        id=uuid4(),
        email="test@example.com",
        username="testuser",
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    return user


@pytest.mark.asyncio()
class TestTokenValidator:
    """Test token validator functionality."""

    async def test_validate_claims_basic(
        self,
        token_validator: TokenValidator,
        test_user: User,
    ) -> None:
        """Test basic claims validation."""
        claims = {
            "sub": str(test_user.id),
            "type": "access",
            "exp": int((datetime.now(UTC) + timedelta(hours=1)).timestamp()),
            "iat": int(datetime.now(UTC).timestamp()),
            "jti": str(uuid4()),
            "scope": "entries:read entries:write",
            "aud": ["api", "web"],
        }

        validated = await token_validator.validate_claims(claims)

        assert validated["user_id"] == test_user.id
        assert validated["type"] == "access"
        assert validated["scopes"] == ["entries:read", "entries:write"]
        assert validated["user"]["email"] == test_user.email

    async def test_validate_claims_missing_required(
        self,
        token_validator: TokenValidator,
    ) -> None:
        """Test validation with missing required claims."""
        claims = {
            "sub": str(uuid4()),
            "type": "access",
            # Missing exp
        }

        with pytest.raises(ValueError, match="Missing required claims"):
            await token_validator.validate_claims(
                claims,
                required_claims=["sub", "type", "exp"],
            )

    async def test_validate_claims_invalid_user(
        self,
        token_validator: TokenValidator,
    ) -> None:
        """Test validation with non-existent user."""
        claims = {
            "sub": str(uuid4()),  # Non-existent user
            "type": "access",
            "exp": int((datetime.now(UTC) + timedelta(hours=1)).timestamp()),
        }

        with pytest.raises(ValueError, match="User not found"):
            await token_validator.validate_claims(claims, validate_user=True)

    async def test_validate_claims_inactive_user(
        self,
        token_validator: TokenValidator,
        db_session: AsyncSession,
    ) -> None:
        """Test validation with inactive user."""
        # Create inactive user
        user = User(
            id=uuid4(),
            email="inactive@example.com",
            username="inactive",
            is_active=False,
        )
        db_session.add(user)
        await db_session.commit()

        claims = {
            "sub": str(user.id),
            "type": "access",
            "exp": int((datetime.now(UTC) + timedelta(hours=1)).timestamp()),
        }

        with pytest.raises(ValueError, match="User account is not active"):
            await token_validator.validate_claims(claims, validate_user=True)

    async def test_check_scope(self, token_validator: TokenValidator) -> None:
        """Test scope checking."""
        claims = {
            "scopes": ["entries:read", "entries:write", "profile:read"],
        }

        # Check exact scope
        assert token_validator.check_scope(claims, "entries:read")
        assert token_validator.check_scope(claims, "entries:write")
        assert not token_validator.check_scope(claims, "entries:delete")

        # Check admin override
        admin_claims = {
            "scopes": ["admin:system"],
        }
        assert token_validator.check_scope(admin_claims, "entries:read", allow_admin=True)
        assert not token_validator.check_scope(admin_claims, "entries:read", allow_admin=False)

    async def test_check_wildcard_scopes(self, token_validator: TokenValidator) -> None:
        """Test wildcard scope checking."""
        claims = {
            "scopes": ["entries:*", "profile:read"],
        }

        # Wildcard should match all actions
        assert token_validator.check_scope(claims, "entries:read")
        assert token_validator.check_scope(claims, "entries:write")
        assert token_validator.check_scope(claims, "entries:delete")

        # But not other resources
        assert not token_validator.check_scope(claims, "admin:system")
        assert token_validator.check_scope(claims, "profile:read")
        assert not token_validator.check_scope(claims, "profile:write")

    async def test_check_all_scopes(self, token_validator: TokenValidator) -> None:
        """Test checking all required scopes."""
        claims = {
            "scopes": ["entries:read", "profile:read"],
        }

        # All present
        assert token_validator.check_all_scopes(
            claims,
            ["entries:read", "profile:read"],
        )

        # Missing one
        assert not token_validator.check_all_scopes(
            claims,
            ["entries:read", "entries:write"],
        )

    async def test_check_any_scope(self, token_validator: TokenValidator) -> None:
        """Test checking any required scope."""
        claims = {
            "scopes": ["entries:read"],
        }

        # Has one of them
        assert token_validator.check_any_scope(
            claims,
            ["entries:read", "entries:write"],
        )

        # Has none
        assert not token_validator.check_any_scope(
            claims,
            ["admin:system", "entries:delete"],
        )

    async def test_get_user_permissions(self, token_validator: TokenValidator) -> None:
        """Test getting user permissions from claims."""
        claims = {
            "scopes": ["entries:read", "entries:write", "service:export"],
        }

        permissions = token_validator.get_user_permissions(claims)

        assert permissions["can_read"] is True
        assert permissions["can_write"] is True
        assert permissions["can_delete"] is False
        assert permissions["can_export"] is True
        assert permissions["can_search"] is False
        assert permissions["is_admin"] is False

    async def test_validate_audience(self, token_validator: TokenValidator) -> None:
        """Test audience validation."""
        claims = {
            "aud": ["api", "web"],
        }

        assert token_validator.validate_audience(claims, "api")
        assert token_validator.validate_audience(claims, "web")
        assert not token_validator.validate_audience(claims, "mobile")

        # Single audience as string
        claims_single = {
            "aud": "api",
        }
        assert token_validator.validate_audience(claims_single, "api")
        assert not token_validator.validate_audience(claims_single, "web")

    async def test_validate_token_type(self, token_validator: TokenValidator) -> None:
        """Test token type validation."""
        claims = {
            "type": "access",
        }

        assert token_validator.validate_token_type(claims, "access")
        assert not token_validator.validate_token_type(claims, "refresh")

    async def test_is_token_expired(self, token_validator: TokenValidator) -> None:
        """Test token expiration checking."""
        # Expired token
        expired_claims = {
            "exp": int((datetime.now(UTC) - timedelta(hours=1)).timestamp()),
        }
        assert token_validator.is_token_expired(expired_claims)

        # Valid token
        valid_claims = {
            "exp": int((datetime.now(UTC) + timedelta(hours=1)).timestamp()),
        }
        assert not token_validator.is_token_expired(valid_claims)

        # No expiration
        no_exp_claims = {}
        assert token_validator.is_token_expired(no_exp_claims)

    async def test_get_token_age(self, token_validator: TokenValidator) -> None:
        """Test getting token age."""
        issued_at = datetime.now(UTC) - timedelta(minutes=30)
        claims = {
            "iat": int(issued_at.timestamp()),
        }

        age = token_validator.get_token_age(claims)
        assert 1790 < age < 1810  # Around 30 minutes

    async def test_get_token_remaining_ttl(self, token_validator: TokenValidator) -> None:
        """Test getting remaining TTL."""
        # Token with 1 hour left
        claims = {
            "exp": int((datetime.now(UTC) + timedelta(hours=1)).timestamp()),
        }

        ttl = token_validator.get_token_remaining_ttl(claims)
        assert 3590 < ttl < 3610  # Around 1 hour

        # Expired token
        expired_claims = {
            "exp": int((datetime.now(UTC) - timedelta(hours=1)).timestamp()),
        }

        ttl = token_validator.get_token_remaining_ttl(expired_claims)
        assert ttl == 0

    async def test_validate_service_token(self, token_validator: TokenValidator) -> None:
        """Test service token validation."""
        service_id = "embedding-worker"

        # Valid service token
        claims = {
            "sub": service_id,
            "type": "m2m",
            "aud": ["services", "api"],
            "scopes": ["service:embedding"],
        }

        validated = await token_validator.validate_service_token(claims, service_id)
        assert validated["service"]["id"] == service_id
        assert validated["service"]["type"] == "m2m"

        # Wrong type
        user_claims = {
            "sub": service_id,
            "type": "access",
            "aud": ["services"],
        }

        with pytest.raises(ValueError, match="Not a service token"):
            await token_validator.validate_service_token(user_claims, service_id)

        # Wrong service
        wrong_service = {
            "sub": "other-service",
            "type": "m2m",
            "aud": ["services"],
        }

        with pytest.raises(ValueError, match="Invalid service"):
            await token_validator.validate_service_token(wrong_service, service_id)

    async def test_cache_validation_result(
        self,
        token_validator: TokenValidator,
    ) -> None:
        """Test caching validation results."""
        jti = str(uuid4())
        validation_result = {
            "sub": str(uuid4()),
            "type": "access",
            "scopes": ["entries:read"],
            "validated_at": int(datetime.now(UTC).timestamp()),
        }

        # Cache result
        await token_validator.cache_validation_result(jti, validation_result, ttl=60)

        # Retrieve from cache
        cached = await token_validator.get_cached_validation(jti)
        assert cached is not None
        assert cached["sub"] == validation_result["sub"]
        assert cached["scopes"] == validation_result["scopes"]

    async def test_scope_normalization(self, token_validator: TokenValidator) -> None:
        """Test scope normalization and validation."""
        # Valid scopes
        scopes = ["entries:read", "admin:system", "service:export"]
        normalized = token_validator._validate_scopes(scopes)
        assert normalized == scopes

        # Invalid scopes are filtered
        mixed_scopes = ["entries:read", "invalid", "no-colon", "admin:system"]
        normalized = token_validator._validate_scopes(mixed_scopes)
        assert normalized == ["entries:read", "admin:system"]
