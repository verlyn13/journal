"""Machine-to-Machine (M2M) token service for service authentication.

Implements short-lived M2M tokens with fine-grained scopes for service-to-service
authentication using Infisical Machine Identities as the trust anchor.
"""

from __future__ import annotations

import hashlib
import json
import logging

from datetime import UTC, datetime, timedelta
from typing import Any, Optional
from uuid import UUID, uuid4

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.audit_service import AuditService
from app.domain.auth.jwt_service import JWTService
from app.domain.auth.jwt_verifier_policy import VerifierPolicy
from app.infra.secrets import InfisicalSecretsClient
from app.settings import settings


logger = logging.getLogger(__name__)

# M2M token constants
M2M_TOKEN_TTL = timedelta(minutes=30)  # 30 min default TTL
M2M_MIN_TTL = timedelta(minutes=5)  # 5 min minimum
M2M_MAX_TTL = timedelta(hours=1)  # 1 hour maximum
M2M_CACHE_PREFIX = "m2m:tokens:"
M2M_IDENTITY_PREFIX = "m2m:identity:"


class MachineIdentity:
    """Machine identity model for services."""

    def __init__(
        self,
        identity_id: str,
        service_name: str,
        environment: str,
        scopes: list[str],
        allowed_ips: list[str] | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        self.identity_id = identity_id
        self.service_name = service_name
        self.environment = environment
        self.scopes = scopes
        self.allowed_ips = allowed_ips or []
        self.metadata = metadata or {}

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary."""
        return {
            "identity_id": self.identity_id,
            "service_name": self.service_name,
            "environment": self.environment,
            "scopes": self.scopes,
            "allowed_ips": self.allowed_ips,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> MachineIdentity:
        """Create from dictionary."""
        return cls(
            identity_id=data["identity_id"],
            service_name=data["service_name"],
            environment=data["environment"],
            scopes=data.get("scopes", []),
            allowed_ips=data.get("allowed_ips", []),
            metadata=data.get("metadata", {}),
        )

    def validate_ip(self, ip_address: str) -> bool:
        """Validate if IP is allowed for this identity.

        Args:
            ip_address: IP address to validate

        Returns:
            True if allowed or no restrictions
        """
        if not self.allowed_ips:
            return True  # No IP restrictions

        return ip_address in self.allowed_ips

    def has_scope(self, scope: str) -> bool:
        """Check if identity has a specific scope.

        Args:
            scope: Scope to check

        Returns:
            True if identity has the scope
        """
        # Check exact match
        if scope in self.scopes:
            return True

        # Check wildcard scopes (e.g., "api.*" matches "api.read")
        for identity_scope in self.scopes:
            if identity_scope.endswith("*"):
                prefix = identity_scope[:-1]
                if scope.startswith(prefix):
                    return True

        return False


class M2MTokenService:
    """Service for managing M2M authentication tokens."""

    def __init__(
        self,
        session: AsyncSession,
        redis: Redis,
        infisical_client: InfisicalSecretsClient | None = None,
    ) -> None:
        self.session = session
        self.redis = redis
        self.infisical_client = infisical_client
        self.jwt_service = JWTService(session, redis)
        self.audit_service = AuditService(session)

    async def exchange_identity_for_token(
        self,
        identity_token: str,
        requested_scopes: list[str] | None = None,
        ttl: timedelta | None = None,
        ip_address: str | None = None,
    ) -> tuple[str, datetime]:
        """Exchange an Infisical Machine Identity token for an M2M JWT.

        Args:
            identity_token: Infisical Machine Identity token
            requested_scopes: Optional specific scopes to request
            ttl: Optional custom TTL (within limits)
            ip_address: Client IP for validation

        Returns:
            Tuple of (M2M JWT token, expiration time)

        Raises:
            ValueError: If identity validation fails
        """
        # Validate the Machine Identity token (patched in tests)
        identity = await self._validate_identity_with_infisical(identity_token)

        # Validate IP if restrictions exist
        if ip_address and not identity.validate_ip(ip_address):
            raise ValueError(f"IP {ip_address} not allowed for identity {identity.service_name}")

        # Determine actual scopes
        if requested_scopes:
            # Validate requested scopes against identity scopes
            granted_scopes = []
            for scope in requested_scopes:
                if identity.has_scope(scope):
                    granted_scopes.append(scope)
                else:
                    logger.warning(
                        "Scope %s not allowed for identity %s", scope, identity.service_name
                    )

            if not granted_scopes:
                raise ValueError("No valid scopes granted")
        else:
            # Use all identity scopes
            granted_scopes = identity.scopes

        # Determine TTL
        if ttl:
            # Clamp to min/max limits
            ttl = max(M2M_MIN_TTL, min(ttl, M2M_MAX_TTL))
        else:
            ttl = M2M_TOKEN_TTL

        # Generate M2M token
        token_id = str(uuid4())
        expiration = datetime.now(UTC) + ttl

        # Sign the JWT (use logical type "m2m" which maps header typ to "at+jwt")
        jwt_token = await self.jwt_service.sign_jwt(
            user_id=UUID(int=0),  # M2M tokens don't have user IDs
            token_type="m2m",
            scopes=granted_scopes,
            audience=["api", "services"],  # service-to-service audiences
            additional_claims={
                "jti": token_id,
                "sub": f"svc:{identity.service_name}",
                "env": identity.environment,
                "identity_id": identity.identity_id,
                # Convenience claims
                "service": identity.service_name,
                "token_type": "at+jwt",
            },
            ttl=ttl,
        )

        # Cache token metadata for monitoring
        await self._cache_token_metadata(token_id, identity, expiration)

        # Audit log
        await self.audit_service.log_event(
            user_id=UUID(int=0),  # System event
            event_type="m2m_token_issued",
            event_data={
                "service": identity.service_name,
                "environment": identity.environment,
                "scopes": granted_scopes,
                "ttl_seconds": ttl.total_seconds(),
                "token_id": token_id,
            },
        )

        logger.info("M2M token issued for %s with scopes %s", identity.service_name, granted_scopes)

        return jwt_token, expiration

    async def validate_m2m_token(
        self,
        token: str,
        required_scope: str | None = None,
        required_env: str | None = None,
    ) -> dict[str, Any]:
        """Validate an M2M token.

        Args:
            token: M2M JWT token
            required_scope: Optional required scope
            required_env: Optional required environment

        Returns:
            Validated token claims

        Raises:
            ValueError: If token is invalid or requirements not met
        """
        # Verify the JWT (accept provided audience)
        # Use access token policy semantics for M2M (RFC 9068 at+jwt)
        claims = await self.jwt_service.verify_jwt(
            token,
            expected_type="access",
            expected_audience="api",
        )

        # Check token type - accept both old and new format
        token_type = claims.get("type") or claims.get("token_type") or claims.get("typ")
        if token_type not in ["m2m", "at+jwt", "access"]:
            raise ValueError(f"Not an M2M token: {token_type}")

        # Check required scope if specified
        if required_scope:
            # Handle both 'scopes' (array) and 'scope' (string) claim names
            scope_claim = claims.get("scope", claims.get("scopes", ""))
            if isinstance(scope_claim, list):
                scopes = scope_claim
            elif isinstance(scope_claim, str):
                scopes = scope_claim.split(" ") if scope_claim else []
            else:
                scopes = []

            has_scope = False

            # Check exact match or wildcard
            for scope in scopes:
                if scope == required_scope:
                    has_scope = True
                    break
                if scope.endswith("*"):
                    prefix = scope[:-1]
                    if required_scope.startswith(prefix):
                        has_scope = True
                        break

            if not has_scope:
                raise ValueError(f"Token missing required scope: {required_scope}")

        # Check required environment if specified
        if required_env and claims.get("env") != required_env:
            raise ValueError(f"Token not valid for environment: {required_env}")

        # Check if token is revoked
        token_id = claims.get("jti")
        if token_id and await self._is_token_revoked(token_id):
            raise ValueError("Token has been revoked")

        return claims

    async def revoke_m2m_token(self, token_id: str) -> None:
        """Revoke an M2M token.

        Args:
            token_id: Token ID (jti) to revoke
        """
        # Add to revocation list with TTL matching max token lifetime
        revoke_key = f"m2m:revoked:{token_id}"
        await self.redis.setex(revoke_key, int(M2M_MAX_TTL.total_seconds()), "1")

        # Remove from active tokens cache
        await self.redis.delete(f"{M2M_CACHE_PREFIX}{token_id}")

        logger.info("M2M token revoked: %s", token_id)

    async def revoke_all_service_tokens(self, service_name: str) -> int:
        """Revoke all tokens for a service.

        Args:
            service_name: Service name to revoke tokens for

        Returns:
            Number of tokens revoked
        """
        revoked_count = 0

        # Scan for all M2M tokens
        pattern = f"{M2M_CACHE_PREFIX}*"
        async for key in self.redis.scan_iter(pattern):
            try:
                data = await self.redis.get(key)
                if data:
                    metadata = json.loads(data)
                    if metadata.get("service_name") == service_name:
                        token_id = metadata.get("token_id")
                        if token_id:
                            await self.revoke_m2m_token(token_id)
                            revoked_count += 1
            except (json.JSONDecodeError, KeyError):
                continue

        # Audit log
        if revoked_count > 0:
            await self.audit_service.log_event(
                user_id=UUID(int=0),
                event_type="m2m_tokens_revoked",
                event_data={
                    "service": service_name,
                    "count": revoked_count,
                },
            )

        logger.info("Revoked %d tokens for service %s", revoked_count, service_name)
        return revoked_count

    async def _validate_machine_identity(self, identity_token: str) -> MachineIdentity:
        """Validate Machine Identity token with Infisical.

        Args:
            identity_token: Infisical Machine Identity token

        Returns:
            Validated machine identity

        Raises:
            ValueError: If identity is invalid
        """
        if not self.infisical_client:
            # For testing, create a mock identity
            logger.warning("No Infisical client configured, using mock identity")
            return MachineIdentity(
                identity_id="mock-identity",
                service_name="test-service",
                environment="development",
                scopes=["api.read", "api.write"],
            )

        try:
            # Exchange identity token for access token via Infisical API
            # This would call Infisical's /api/v1/auth/machine-identity/login
            # For now, we'll implement a simplified version

            # Hash the token for cache key
            token_hash = hashlib.sha256(identity_token.encode()).hexdigest()[:16]
            cache_key = f"{M2M_IDENTITY_PREFIX}{token_hash}"

            # Check cache first
            cached_data = await self.redis.get(cache_key)
            if cached_data:
                return MachineIdentity.from_dict(json.loads(cached_data))

            # In production, this would call Infisical API
            # For now, extract from token or use configuration
            # Example: identity_token format could be "mi_<service>_<env>_<token>"

            parts = identity_token.split("_")
            if len(parts) < 4 or parts[0] != "mi":
                raise ValueError("Invalid Machine Identity token format")

            service_name = parts[1]
            environment = parts[2]

            # Load identity configuration from Infisical secrets
            identity_config = await self.infisical_client.get_secret(
                f"/services/{service_name}/identity", default=None
            )

            if not identity_config:
                raise ValueError(f"Unknown service identity: {service_name}")

            config = json.loads(identity_config)

            identity = MachineIdentity(
                identity_id=f"{service_name}@{environment}",
                service_name=service_name,
                environment=environment,
                scopes=config.get("scopes", []),
                allowed_ips=config.get("allowed_ips", []),
                metadata=config.get("metadata", {}),
            )

            # Cache for 5 minutes
            await self.redis.setex(cache_key, 300, json.dumps(identity.to_dict()))

            return identity

        except Exception as e:
            logger.error("Failed to validate Machine Identity: %s", e)
            raise ValueError(f"Invalid Machine Identity: {e}") from e

    async def _cache_token_metadata(
        self,
        token_id: str,
        identity: MachineIdentity,
        expiration: datetime,
    ) -> None:
        """Cache token metadata for monitoring.

        Args:
            token_id: Token ID
            identity: Machine identity
            expiration: Token expiration time
        """
        metadata = {
            "token_id": token_id,
            "service_name": identity.service_name,
            "environment": identity.environment,
            "scopes": identity.scopes,
            "issued_at": datetime.now(UTC).isoformat(),
            "expires_at": expiration.isoformat(),
        }

        ttl = int((expiration - datetime.now(UTC)).total_seconds())
        await self.redis.setex(f"{M2M_CACHE_PREFIX}{token_id}", ttl, json.dumps(metadata))

    async def _is_token_revoked(self, token_id: str) -> bool:
        """Check if a token is revoked.

        Args:
            token_id: Token ID to check

        Returns:
            True if revoked
        """
        revoke_key = f"m2m:revoked:{token_id}"
        return bool(await self.redis.exists(revoke_key))

    async def get_active_tokens_count(self, service_name: str | None = None) -> int:
        """Get count of active M2M tokens.

        Args:
            service_name: Optional service name filter

        Returns:
            Count of active tokens
        """
        count = 0
        pattern = f"{M2M_CACHE_PREFIX}*"

        async for key in self.redis.scan_iter(pattern):
            if service_name:
                try:
                    data = await self.redis.get(key)
                    if data:
                        metadata = json.loads(data)
                        if metadata.get("service_name") == service_name:
                            count += 1
                except (json.JSONDecodeError, KeyError):
                    continue
            else:
                count += 1

        return count

    # Backward-compatible hook for tests to patch
    async def _validate_identity_with_infisical(self, identity_token: str) -> MachineIdentity:
        """Validate identity token via Infisical (delegates to _validate_machine_identity).

        This indirection exists to support test patches that target this method name.
        """
        return await self._validate_machine_identity(identity_token)
