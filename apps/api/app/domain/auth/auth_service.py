"""Enhanced authentication service with EdDSA JWT support."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
import logging
from typing import Any
from uuid import UUID

from fastapi.security import HTTPAuthorizationCredentials
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.jwt_service import JWTService, TokenType
from app.domain.auth.key_manager import KeyManager
from app.domain.auth.simple_key_manager import SimpleKeyManager
from app.domain.auth.token_validator import TokenValidator
from app.infra.auth import create_access_token, create_refresh_token, require_user
from app.infra.secrets.enhanced_infisical_client import EnhancedInfisicalClient
from app.services.jwks_service import JWKSService
from app.settings import settings


logger = logging.getLogger(__name__)
# Token type constants to satisfy security linters
ACCESS_TOK: TokenType = "access"
REFRESH_TOK: TokenType = "refresh"
SESSION_TOK: TokenType = "session"
M2M_TOK: TokenType = "m2m"


class AuthService:
    """Enhanced authentication service with modern JWT support.

    Provides both legacy HMAC token support and new EdDSA token generation
    for seamless migration.
    """

    def __init__(
        self,
        session: AsyncSession,
        redis: Redis,
        infisical_client: EnhancedInfisicalClient | None = None,
    ) -> None:
        """Initialize authentication service.

        Args:
            session: Database session
            redis: Redis client
            infisical_client: Optional Infisical client for production
        """
        self.session = session
        self.redis = redis
        self.infisical_client = infisical_client

        # Initialize key manager based on environment
        if infisical_client and settings.env == "production":
            # Use full key manager with Infisical in production
            self.key_manager = KeyManager(session, redis, infisical_client)
        else:
            # Use simple key manager for development
            self.key_manager = SimpleKeyManager(session, redis)

        # Initialize services
        self.jwt_service = JWTService(session, redis, self.key_manager)
        self.jwks_service = JWKSService(session, redis, self.key_manager)
        self.token_validator = TokenValidator(session, redis)

    async def initialize(self) -> None:
        """Initialize the authentication system.

        Sets up key management and ensures required keys exist.
        """
        try:
            await self.key_manager.initialize_key_system()
            logger.info("Authentication system initialized successfully")
        except Exception:
            logger.exception("Failed to initialize authentication system")
            raise

    async def create_access_token(
        self,
        user_id: UUID,
        scopes: list[str] | None = None,
        additional_claims: dict[str, Any] | None = None,
        ttl: timedelta | None = None,
    ) -> str:
        """Create a new access token using EdDSA signing.

        Args:
            user_id: User ID for the token subject
            scopes: Optional list of scopes/permissions
            additional_claims: Optional additional claims
            ttl: Optional custom TTL

        Returns:
            Signed JWT access token
        """
        return await self.jwt_service.sign_jwt(
            user_id=user_id,
            token_type=ACCESS_TOK,
            scopes=scopes,
            additional_claims=additional_claims,
            ttl=ttl,
        )

    async def create_refresh_token(
        self,
        user_id: UUID,
        refresh_id: str | None = None,
        ttl: timedelta | None = None,
    ) -> str:
        """Create a new refresh token using EdDSA signing.

        Args:
            user_id: User ID for the token subject
            refresh_id: Optional refresh ID for session tracking
            ttl: Optional custom TTL

        Returns:
            Signed JWT refresh token
        """
        additional_claims = {}
        if refresh_id:
            additional_claims["rid"] = refresh_id

        return await self.jwt_service.sign_jwt(
            user_id=user_id,
            token_type=REFRESH_TOK,
            additional_claims=additional_claims,
            ttl=ttl,
        )

    async def create_verify_token(
        self,
        user_id: UUID,
        ttl: timedelta | None = None,
    ) -> str:
        """Create a new email verification token.

        Args:
            user_id: User ID for the token subject
            ttl: Optional custom TTL (default: 30 minutes)

        Returns:
            Signed JWT verification token
        """
        verify_ttl = ttl or timedelta(minutes=30)

        return await self.jwt_service.sign_jwt(
            user_id=user_id,
            token_type=SESSION_TOK,  # Use session type for verification
            additional_claims={"typ": "verify"},  # Add legacy typ claim
            ttl=verify_ttl,
        )

    async def create_service_token(
        self,
        service_id: UUID,
        service_name: str,
        scopes: list[str],
        ttl: timedelta | None = None,
    ) -> str:
        """Create a machine-to-machine service token.

        Args:
            service_id: Service identifier
            service_name: Human-readable service name
            scopes: Service permissions
            ttl: Optional custom TTL

        Returns:
            Signed JWT service token
        """
        return await self.jwt_service.sign_jwt(
            user_id=service_id,
            token_type=M2M_TOK,
            scopes=scopes,
            audience=["services"],
            additional_claims={"service_name": service_name},
            ttl=ttl,
        )

    async def verify_token(
        self,
        token: str,
        expected_type: TokenType | None = None,
        required_scopes: list[str] | None = None,
        expected_audience: str | None = None,
    ) -> dict[str, Any]:
        """Verify a JWT token using EdDSA verification.

        Args:
            token: JWT string to verify
            expected_type: Expected token type
            required_scopes: Required scopes for authorization
            expected_audience: Expected audience value

        Returns:
            Decoded and validated JWT payload

        Raises:
            ValueError: If token is invalid or verification fails
        """
        return await self.jwt_service.verify_jwt(
            token,
            expected_type=expected_type,
            required_scopes=required_scopes,
            expected_audience=expected_audience,
        )

    async def introspect_token(self, token: str) -> dict[str, Any]:
        """Introspect a token without full verification.

        Args:
            token: JWT to introspect

        Returns:
            Token metadata and validation status
        """
        return await self.jwt_service.introspect_token(token)

    async def revoke_token(self, jti: str, user_id: UUID | None = None) -> None:
        """Revoke a token by its JTI.

        Args:
            jti: JWT ID to revoke
            user_id: Optional user ID for audit logging
        """
        await self.jwt_service.revoke_token(jti, user_id)

    async def revoke_all_user_tokens(self, user_id: UUID) -> int:
        """Revoke all tokens for a user.

        Args:
            user_id: User ID whose tokens to revoke

        Returns:
            Number of tokens revoked
        """
        return await self.jwt_service.revoke_all_user_tokens(user_id)

    async def get_jwks(self) -> dict[str, Any]:
        """Get JSON Web Key Set for token verification.

        Returns:
            JWKS with current verification keys
        """
        return await self.jwks_service.get_jwks()

    async def check_key_rotation(self) -> tuple[bool, str]:
        """Check if key rotation is needed.

        Returns:
            Tuple of (needs_rotation, reason)
        """
        return await self.key_manager.check_rotation_needed()

    async def rotate_keys(self, force: bool = False) -> dict[str, Any]:
        """Perform key rotation.

        Args:
            force: Force rotation even if not needed

        Returns:
            Rotation result summary
        """
        return await self.key_manager.rotate_keys(force)

    async def get_system_health(self) -> dict[str, Any]:
        """Get authentication system health status.

        Returns:
            Health check results
        """
        try:
            # Check key integrity
            key_health = await self.key_manager.verify_key_integrity()

            # Check JWKS availability
            jwks = await self.get_jwks()
            jwks_healthy = len(jwks.get("keys", [])) > 0

            # Check token creation
            test_user_id = UUID("00000000-0000-0000-0000-000000000000")
            try:
                test_token = await self.create_access_token(
                    test_user_id, scopes=["test"], ttl=timedelta(seconds=1)
                )
                # Try to verify the test token
                await self.verify_token(test_token, expected_type="access")
                token_system_healthy = True
            except Exception as e:
                token_system_healthy = False
                logger.warning("Token system health check failed: %s", e)

            return {
                "healthy": all([
                    key_health.get("current_key_valid", False),
                    jwks_healthy,
                    token_system_healthy,
                ]),
                "key_system": key_health,
                "jwks_keys_count": len(jwks.get("keys", [])),
                "token_system_healthy": token_system_healthy,
                "manager_type": self.key_manager.__class__.__name__,
                "timestamp": datetime.now(UTC).isoformat(),
            }
        except Exception as e:
            logger.exception("Health check failed")
            return {
                "healthy": False,
                "error": str(e),
                "timestamp": datetime.now(UTC).isoformat(),
            }

    # Legacy compatibility methods
    @staticmethod
    async def create_legacy_access_token(
        user_id: str,
        scopes: list[str] | None = None,
    ) -> str:
        """Create legacy HMAC access token for backward compatibility.

        Args:
            user_id: User ID as string
            scopes: Optional scopes

        Returns:
            HMAC-signed JWT token (legacy format)
        """
        return create_access_token(user_id, scopes)

    @staticmethod
    async def create_legacy_refresh_token(
        user_id: str,
        refresh_id: str | None = None,
    ) -> str:
        """Create legacy HMAC refresh token for backward compatibility.

        Args:
            user_id: User ID as string
            refresh_id: Optional refresh ID

        Returns:
            HMAC-signed JWT token (legacy format)
        """
        return create_refresh_token(user_id, refresh_id)

    @staticmethod
    async def verify_legacy_token(token: str) -> str:
        """Verify legacy HMAC token for backward compatibility.

        Args:
            token: Legacy JWT token

        Returns:
            User ID from token

        Raises:
            HTTPException: If token is invalid
        """
        # Create mock credentials object
        creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        return require_user(creds)
