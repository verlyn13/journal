"""Integrated authentication service that wires all token components together.

This service integrates EdDSA JWT signing, refresh token rotation with reuse detection,
session management, and proper security policies from the token enhancement plan.
"""

from __future__ import annotations

import hashlib
import logging

from datetime import UTC, datetime
from typing import Any
from uuid import UUID, uuid4

from fastapi import HTTPException, Request, Response, status
from redis.asyncio import Redis
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config.token_rotation_config import ACCESS_JWT_TTL, REFRESH_TOKEN_TTL
from app.domain.auth.audit_service import AuditService
from app.domain.auth.jwt_service import JWTService
from app.domain.auth.jwt_verifier_policy import VerifierPolicy
from app.domain.auth.key_manager import KeyManager
from app.domain.auth.token_rotation_service import TokenRotationService
from app.infra.cookies_v2 import clear_refresh_cookie_v2, set_refresh_cookie_v2
from app.infra.sa_models import UserSession
from app.infra.secrets import InfisicalSecretsClient
from app.infra.secrets.enhanced_key_manager import InfisicalKeyManager
from app.services.session_service import SessionService
from app.settings import settings


logger = logging.getLogger(__name__)


class IntegratedAuthService:
    """Unified authentication service with all security features integrated."""

    def __init__(
        self,
        session: AsyncSession,
        redis: Redis,
        use_infisical: bool = True,
    ) -> None:
        """Initialize integrated auth service.

        Args:
            session: Database session
            redis: Redis client
            use_infisical: Whether to use Infisical-enhanced key manager
        """
        self.session = session
        self.redis = redis

        # Initialize key manager (with or without Infisical)
        if use_infisical and not settings.testing:
            infisical_client = InfisicalSecretsClient.from_env(redis)
            self.key_manager = InfisicalKeyManager(session, redis, infisical_client)
        else:
            self.key_manager = KeyManager(session, redis)

        # Initialize services with proper dependencies
        self.jwt_service = JWTService(session, redis, self.key_manager)
        self.rotation_service = TokenRotationService(session, redis)
        self.session_service = SessionService(session, redis)
        self.audit_service = AuditService(session)

    async def login(
        self,
        user_id: UUID,
        request: Request,
        response: Response,
        use_session_cookie: bool = True,
        scopes: list[str] | None = None,
    ) -> dict[str, Any]:
        """Perform login with integrated security features.

        Args:
            user_id: User ID to authenticate
            request: FastAPI request
            response: FastAPI response
            use_session_cookie: Whether to use session cookies
            scopes: Optional scopes for the tokens

        Returns:
            Authentication response with tokens
        """
        # Create or update database session
        db_session = await self._create_db_session(user_id)

        # Create session cookie if enabled
        session_data = None
        if use_session_cookie:
            session_data = await self.session_service.create_session(user_id, request, response)

        # Generate EdDSA-signed access token
        access_token = await self.jwt_service.sign_jwt(
            user_id=user_id,
            token_type="access",  # noqa: S106 - token type identifier, not a secret
            scopes=scopes,
            ttl=ACCESS_JWT_TTL,
        )

        # Generate refresh token with rotation ID
        refresh_id = str(uuid4())
        db_session.refresh_id = refresh_id
        await self.session.commit()

        refresh_token = await self._create_refresh_token(
            user_id=user_id,
            refresh_id=refresh_id,
            session_id=session_data.session_id if session_data else None,
        )

        # Set refresh cookie if enabled
        if settings.auth_cookie_refresh:
            max_age = int(REFRESH_TOKEN_TTL.total_seconds())
            set_refresh_cookie_v2(response, refresh_token, max_age)

            # Don't return refresh token in body when using cookies
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": int(ACCESS_JWT_TTL.total_seconds()),
            }

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": int(ACCESS_JWT_TTL.total_seconds()),
        }

    async def refresh(
        self,
        refresh_token: str,
        request: Request,
        response: Response,
    ) -> dict[str, Any]:
        """Refresh tokens with rotation and reuse detection.

        Args:
            refresh_token: Refresh token to validate
            request: FastAPI request
            response: FastAPI response

        Returns:
            New token set

        Raises:
            HTTPException: On invalid token or reuse detection
        """
        # Verify refresh token with EdDSA
        try:
            policy = VerifierPolicy(
                audience=[settings.jwt_aud],
                issuer=settings.jwt_iss,
                required_claims=["sub", "rid", "typ"],
                max_age=REFRESH_TOKEN_TTL,
            )
            claims = await self.jwt_service.verify_jwt(refresh_token, policy)
        except Exception as e:
            logger.warning("Refresh token verification failed: %s", e)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            ) from e

        # Validate token type
        if claims.get("typ") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )

        user_id = UUID(claims["sub"])
        refresh_id = claims.get("rid")

        # Check for refresh token reuse
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        is_reused = await self.rotation_service.check_refresh_token_reuse(token_hash, user_id)

        if is_reused:
            # SECURITY INCIDENT: Token reuse detected!
            logger.critical(
                "Refresh token reuse detected for user %s. Revoking all sessions.", user_id
            )

            # Revoke all user sessions immediately
            await self.rotation_service.revoke_all_user_tokens(user_id)

            # Destroy all session cookies
            if settings.auth_cookie_refresh:
                await self.session_service.destroy_all_user_sessions(user_id)

            # Clear cookies in response
            clear_refresh_cookie_v2(response)

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Security violation detected. All sessions revoked.",
            )

        # Look up and validate database session
        db_session = await self._get_db_session_by_refresh_id(UUID(refresh_id))
        if not db_session or db_session.revoked_at is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or revoked session",
            )

        # Rotate refresh ID
        new_refresh_id = str(uuid4())
        db_session.refresh_id = new_refresh_id
        db_session.last_activity = datetime.now(UTC)
        await self.session.commit()

        # Generate new token pair with EdDSA
        new_access_token = await self.jwt_service.sign_jwt(
            user_id=user_id,
            token_type="access",  # noqa: S106 - token type identifier, not a secret
            scopes=claims.get("scopes"),
            ttl=ACCESS_JWT_TTL,
        )

        new_refresh_token = await self._create_refresh_token(
            user_id=user_id,
            refresh_id=new_refresh_id,
            session_id=claims.get("sid"),
        )

        # Mark tokens as rotated
        old_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        new_hash = hashlib.sha256(new_refresh_token.encode()).hexdigest()
        await self.rotation_service.mark_token_rotated(old_hash, new_hash, user_id)

        # Update session cookie if using session management
        if claims.get("sid"):
            session_data = await self.session_service.get_session(request)
            if session_data and session_data.needs_rotation():
                await self.session_service.rotate_session(session_data, response, "token_refresh")

        # Set new refresh cookie if enabled
        if settings.auth_cookie_refresh:
            max_age = int(REFRESH_TOKEN_TTL.total_seconds())
            set_refresh_cookie_v2(response, new_refresh_token, max_age)

            return {
                "access_token": new_access_token,
                "token_type": "bearer",
                "expires_in": int(ACCESS_JWT_TTL.total_seconds()),
            }

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",  # noqa: S106 - not a secret
            "expires_in": int(ACCESS_JWT_TTL.total_seconds()),
        }

    async def logout(
        self,
        user_id: UUID,
        request: Request,
        response: Response,
        revoke_all: bool = False,
    ) -> None:
        """Logout with proper cleanup.

        Args:
            user_id: User to logout
            request: FastAPI request
            response: FastAPI response
            revoke_all: Whether to revoke all sessions
        """
        # Clear cookies
        clear_refresh_cookie_v2(response)

        # Destroy session if exists
        session_data = await self.session_service.get_session(request)
        if session_data:
            await self.session_service.destroy_session(session_data.session_id, response)

        # Revoke tokens
        if revoke_all:
            await self.rotation_service.revoke_all_user_tokens(user_id)
            await self.session_service.destroy_all_user_sessions(user_id)
            await self._revoke_all_db_sessions(user_id)
        else:
            # Just revoke current session
            await self._revoke_current_db_session(user_id)

        # Audit log
        await self.audit_service.log_event(
            user_id=user_id,
            event_type="logout",
            event_data={"revoke_all": revoke_all},
        )

    async def verify_access_token(self, token: str) -> dict[str, Any]:
        """Verify an access token using EdDSA.

        Args:
            token: Access token to verify

        Returns:
            Validated claims

        Raises:
            HTTPException: If token is invalid
        """
        try:
            policy = VerifierPolicy(
                audience=[settings.jwt_aud],
                issuer=settings.jwt_iss,
                required_claims=["sub", "typ"],
                max_age=ACCESS_JWT_TTL,
            )
            claims = await self.jwt_service.verify_jwt(token, policy)

            if claims.get("typ") != "access":
                raise ValueError("Invalid token type")

            return claims

        except Exception as e:
            logger.warning("Access token verification failed: %s", e)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid access token",
                headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
            ) from e

    async def _create_refresh_token(
        self,
        user_id: UUID,
        refresh_id: str,
        session_id: str | None = None,
    ) -> str:
        """Create a refresh token with proper claims.

        Args:
            user_id: User ID
            refresh_id: Rotation ID
            session_id: Optional session ID

        Returns:
            Signed refresh token
        """
        additional_claims = {
            "rid": refresh_id,
            "typ": "refresh",
        }

        if session_id:
            additional_claims["sid"] = session_id

        return await self.jwt_service.sign_jwt(
            user_id=user_id,
            token_type="refresh",  # noqa: S106 - token type identifier, not a secret
            additional_claims=additional_claims,
            ttl=REFRESH_TOKEN_TTL,
        )

    async def _create_db_session(self, user_id: UUID) -> UserSession:
        """Create a new database session.

        Args:
            user_id: User ID

        Returns:
            Created session
        """
        db_session = UserSession(
            user_id=user_id,
            refresh_id=uuid4(),
            created_at=datetime.now(UTC),
            last_activity=datetime.now(UTC),
        )
        self.session.add(db_session)
        await self.session.commit()
        return db_session

    async def _get_db_session_by_refresh_id(self, refresh_id: UUID) -> UserSession | None:
        """Get database session by refresh ID.

        Args:
            refresh_id: Refresh ID to lookup

        Returns:
            Session if found
        """
        result = await self.session.execute(
            select(UserSession).where(
                UserSession.refresh_id == refresh_id,
                UserSession.revoked_at.is_(None),
            )
        )
        return result.scalar_one_or_none()

    async def _revoke_current_db_session(self, user_id: UUID) -> None:
        """Revoke current database session.

        Args:
            user_id: User ID
        """
        await self.session.execute(
            update(UserSession)
            .where(
                UserSession.user_id == user_id,
                UserSession.revoked_at.is_(None),
            )
            .values(revoked_at=datetime.now(UTC))
        )
        await self.session.commit()

    async def _revoke_all_db_sessions(self, user_id: UUID) -> None:
        """Revoke all database sessions for a user.

        Args:
            user_id: User ID
        """
        await self.session.execute(
            update(UserSession)
            .where(UserSession.user_id == user_id)
            .values(revoked_at=datetime.now(UTC))
        )
        await self.session.commit()
