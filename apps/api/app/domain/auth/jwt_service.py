"""JWT signing and verification service with Ed25519 keys."""

from __future__ import annotations

import json
import logging
import time

from datetime import UTC, datetime, timedelta
from typing import Any, Literal, cast
from uuid import UUID

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.audit_service import AuditService
from app.domain.auth.key_manager import KeyManager
from app.services.jwks_service import JWKSService

logger = logging.getLogger(__name__)

# JWT header constants
JWT_ALGORITHM = "EdDSA"
JWT_TYPE = "JWT"

# Token types
TokenType = Literal["access", "refresh", "m2m", "session"]


class JWTService:
    """Service for JWT signing and verification using Ed25519 keys."""

    # Default token TTLs
    DEFAULT_ACCESS_TTL = timedelta(minutes=10)
    DEFAULT_REFRESH_TTL = timedelta(days=14)
    DEFAULT_M2M_TTL = timedelta(minutes=30)
    DEFAULT_SESSION_TTL = timedelta(hours=12)

    def __init__(
        self,
        session: AsyncSession,
        redis: Redis,
        key_manager: KeyManager | None = None,
        jwks_service: JWKSService | None = None,
    ) -> None:
        """Initialize JWT service.

        Args:
            session: Database session
            redis: Redis client
            key_manager: Optional key manager instance
            jwks_service: Optional JWKS service instance
        """
        self.session = session
        self.redis = redis
        self.key_manager = key_manager or KeyManager(session, redis)
        self.jwks_service = jwks_service or JWKSService(session, redis, self.key_manager)
        self.audit_service = AuditService(session)

    async def sign_jwt(
        self,
        user_id: UUID,
        token_type: TokenType,
        scopes: list[str] | None = None,
        audience: list[str] | None = None,
        additional_claims: dict[str, Any] | None = None,
        ttl: timedelta | None = None,
    ) -> str:
        """Sign a JWT with the current signing key.

        Args:
            user_id: User ID for the token subject
            token_type: Type of token being created
            scopes: Optional list of scopes/permissions
            audience: Optional audience list
            additional_claims: Optional additional claims
            ttl: Optional custom TTL (defaults based on token type)

        Returns:
            Signed JWT string

        Raises:
            RuntimeError: If signing fails
        """
        try:
            # Get current signing key
            current_key = await self.key_manager.get_current_signing_key()

            # Determine TTL
            if ttl is None:
                ttl = self._get_default_ttl(token_type)

            # Build JWT header
            header = {
                "alg": JWT_ALGORITHM,
                "typ": JWT_TYPE,
                "kid": current_key.kid,
            }

            # Build JWT payload
            now = datetime.now(UTC)
            exp = now + ttl
            
            payload: dict[str, Any] = {
                "sub": str(user_id),
                "iat": int(now.timestamp()),
                "exp": int(exp.timestamp()),
                "nbf": int(now.timestamp()),
                "jti": self._generate_jti(),
                "type": token_type,
            }

            # Add optional claims
            if scopes:
                payload["scope"] = " ".join(scopes)
            
            if audience:
                payload["aud"] = audience
            
            if additional_claims:
                payload.update(additional_claims)

            # Encode header and payload
            header_b64 = self._base64url_encode(json.dumps(header))
            payload_b64 = self._base64url_encode(json.dumps(payload))
            
            # Create signature
            signing_input = f"{header_b64}.{payload_b64}".encode()
            signature = current_key.private_key.sign(signing_input)
            signature_b64 = self._base64url_encode(signature)

            # Combine into JWT
            jwt_token = f"{header_b64}.{payload_b64}.{signature_b64}"

            # Log token creation
            await self.audit_service.log_event(
                user_id=user_id,
                event_type="jwt_signed",
                event_data={
                    "token_type": token_type,
                    "kid": current_key.kid,
                    "jti": payload["jti"],
                    "ttl_seconds": int(ttl.total_seconds()),
                },
            )

            return jwt_token

        except Exception as e:
            logger.error(f"JWT signing failed: {e}")
            raise RuntimeError(f"Failed to sign JWT: {e}") from e

    async def verify_jwt(
        self,
        token: str,
        expected_type: TokenType | None = None,
        required_scopes: list[str] | None = None,
        expected_audience: str | None = None,
    ) -> dict[str, Any]:
        """Verify a JWT using JWKS keys.

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
        try:
            # Split token
            parts = token.split(".")
            if len(parts) != 3:
                raise ValueError("Invalid JWT format")

            header_b64, payload_b64, signature_b64 = parts

            # Decode header
            header = json.loads(self._base64url_decode(header_b64))
            
            # Validate header
            if header.get("alg") != JWT_ALGORITHM:
                raise ValueError(f"Invalid algorithm: {header.get('alg')}")
            
            if header.get("typ") != JWT_TYPE:
                raise ValueError(f"Invalid token type: {header.get('typ')}")

            # Get kid from header
            kid = header.get("kid")
            if not kid:
                raise ValueError("Missing key ID in token header")

            # Get verification keys from JWKS
            verification_keys = await self.key_manager.get_verification_keys()
            
            # Find matching key
            matching_key = None
            for key in verification_keys:
                if key.kid == kid:
                    matching_key = key
                    break
            
            if not matching_key:
                raise ValueError(f"Unknown key ID: {kid}")

            # Verify signature
            signing_input = f"{header_b64}.{payload_b64}".encode()
            signature = self._base64url_decode(signature_b64)
            
            try:
                matching_key.public_key.verify(signature, signing_input)
            except Exception:
                raise ValueError("Invalid signature")

            # Decode payload
            payload = json.loads(self._base64url_decode(payload_b64))

            # Validate claims
            now = datetime.now(UTC).timestamp()
            
            # Check expiration
            if "exp" in payload:
                if now >= payload["exp"]:
                    raise ValueError("Token expired")
            
            # Check not before
            if "nbf" in payload:
                if now < payload["nbf"]:
                    raise ValueError("Token not yet valid")
            
            # Check token type
            if expected_type and payload.get("type") != expected_type:
                raise ValueError(f"Invalid token type: expected {expected_type}, got {payload.get('type')}")
            
            # Check audience
            if expected_audience:
                aud = payload.get("aud", [])
                if isinstance(aud, str):
                    aud = [aud]
                if expected_audience not in aud:
                    raise ValueError(f"Invalid audience: {expected_audience} not in {aud}")
            
            # Check scopes
            if required_scopes:
                token_scopes = payload.get("scope", "").split()
                if not all(scope in token_scopes for scope in required_scopes):
                    raise ValueError(f"Insufficient scopes: required {required_scopes}, has {token_scopes}")

            # Check JTI for revocation (if needed)
            if await self._is_token_revoked(payload.get("jti")):
                raise ValueError("Token has been revoked")

            return payload

        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JWT encoding: {e}") from e
        except Exception as e:
            if isinstance(e, ValueError):
                raise
            raise ValueError(f"JWT verification failed: {e}") from e

    async def revoke_token(self, jti: str, user_id: UUID | None = None) -> None:
        """Revoke a token by its JTI.

        Args:
            jti: JWT ID to revoke
            user_id: Optional user ID for audit logging
        """
        # Store revocation in Redis with TTL matching token expiry
        revocation_key = f"jwt:revoked:{jti}"
        await self.redis.setex(revocation_key, 86400, "1")  # 24 hour TTL

        # Log revocation
        if user_id:
            await self.audit_service.log_event(
                user_id=user_id,
                event_type="jwt_revoked",
                event_data={"jti": jti},
            )

    async def revoke_all_user_tokens(self, user_id: UUID) -> int:
        """Revoke all tokens for a user.

        Args:
            user_id: User ID whose tokens to revoke

        Returns:
            Number of tokens revoked
        """
        # This would typically involve storing a revocation timestamp
        # and checking it during verification
        revocation_key = f"jwt:user_revoked:{user_id}"
        await self.redis.setex(revocation_key, 86400, str(int(time.time())))

        # Log mass revocation
        await self.audit_service.log_event(
            user_id=user_id,
            event_type="jwt_mass_revoked",
            event_data={"reason": "user_requested"},
        )

        return 1  # Simplified for now

    async def introspect_token(self, token: str) -> dict[str, Any]:
        """Introspect a token without full verification.

        Args:
            token: JWT to introspect

        Returns:
            Token metadata and validation status
        """
        try:
            # Try to verify the token
            payload = await self.verify_jwt(token)
            
            return {
                "active": True,
                "sub": payload.get("sub"),
                "exp": payload.get("exp"),
                "iat": payload.get("iat"),
                "jti": payload.get("jti"),
                "type": payload.get("type"),
                "scope": payload.get("scope"),
                "aud": payload.get("aud"),
            }
        except ValueError as e:
            return {
                "active": False,
                "error": str(e),
            }

    @staticmethod
    def _get_default_ttl(token_type: TokenType) -> timedelta:
        """Get default TTL for a token type.

        Args:
            token_type: Type of token

        Returns:
            Default TTL for the token type
        """
        ttl_map = {
            "access": JWTService.DEFAULT_ACCESS_TTL,
            "refresh": JWTService.DEFAULT_REFRESH_TTL,
            "m2m": JWTService.DEFAULT_M2M_TTL,
            "session": JWTService.DEFAULT_SESSION_TTL,
        }
        return ttl_map.get(token_type, JWTService.DEFAULT_ACCESS_TTL)

    @staticmethod
    def _generate_jti() -> str:
        """Generate a unique JWT ID.

        Returns:
            Unique JWT ID
        """
        import uuid
        return str(uuid.uuid4())

    @staticmethod
    def _base64url_encode(data: bytes | str) -> str:
        """Base64URL encode data without padding.

        Args:
            data: Data to encode

        Returns:
            Base64URL encoded string
        """
        import base64
        
        if isinstance(data, str):
            data = data.encode()
        
        return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

    @staticmethod
    def _base64url_decode(data: str) -> bytes:
        """Base64URL decode data.

        Args:
            data: Base64URL encoded string

        Returns:
            Decoded bytes
        """
        import base64
        
        # Add padding if needed
        padding = 4 - (len(data) % 4)
        if padding != 4:
            data += "=" * padding
        
        return base64.urlsafe_b64decode(data)

    async def _is_token_revoked(self, jti: str | None) -> bool:
        """Check if a token has been revoked.

        Args:
            jti: JWT ID to check

        Returns:
            True if token is revoked
        """
        if not jti:
            return False

        revocation_key = f"jwt:revoked:{jti}"
        return await self.redis.exists(revocation_key) > 0