"""Authentication test helpers for generating tokens with specific scopes."""

from __future__ import annotations

from datetime import timedelta
from typing import Optional
from uuid import UUID, uuid4

from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.jwt_service import JWTService
from app.domain.auth.key_manager import KeyManager


async def create_test_token_with_scopes(
    session: AsyncSession,
    redis: Redis,
    user_id: UUID | None = None,
    scopes: list[str] | None = None,
    token_type: str = "access",
    ttl: timedelta | None = None,
) -> str:
    """Create a test JWT token with specific scopes.
    
    Args:
        session: Database session
        redis: Redis client
        user_id: User ID for token (generates random if not provided)
        scopes: List of scopes to include in token
        token_type: Type of token to create
        ttl: Token time-to-live
        
    Returns:
        Signed JWT token string
    """
    if user_id is None:
        user_id = uuid4()
    
    if ttl is None:
        ttl = timedelta(minutes=10)
    
    # Initialize services
    key_manager = KeyManager(session, redis)
    jwt_service = JWTService(session, redis, key_manager)
    
    # Create token with scopes
    token = await jwt_service.sign_jwt(
        user_id=user_id,
        token_type=token_type,
        scopes=scopes or [],
        ttl=ttl,
    )
    
    return token


async def create_admin_token(
    session: AsyncSession,
    redis: Redis,
    user_id: UUID | None = None,
) -> str:
    """Create an admin token with all admin scopes.
    
    Args:
        session: Database session
        redis: Redis client
        user_id: User ID for token
        
    Returns:
        Admin JWT token
    """
    return await create_test_token_with_scopes(
        session=session,
        redis=redis,
        user_id=user_id,
        scopes=["admin.read", "admin.write", "admin.monitor"],
    )


async def create_monitoring_token(
    session: AsyncSession,
    redis: Redis,
    user_id: UUID | None = None,
) -> str:
    """Create a monitoring token with monitor scope.
    
    Args:
        session: Database session
        redis: Redis client
        user_id: User ID for token
        
    Returns:
        Monitoring JWT token
    """
    return await create_test_token_with_scopes(
        session=session,
        redis=redis,
        user_id=user_id,
        scopes=["admin.monitor"],
    )


async def create_readonly_token(
    session: AsyncSession,
    redis: Redis,
    user_id: UUID | None = None,
) -> str:
    """Create a read-only token.
    
    Args:
        session: Database session
        redis: Redis client
        user_id: User ID for token
        
    Returns:
        Read-only JWT token
    """
    return await create_test_token_with_scopes(
        session=session,
        redis=redis,
        user_id=user_id,
        scopes=["api.read"],
    )