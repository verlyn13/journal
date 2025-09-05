from __future__ import annotations

from typing import Annotated

# Third-party imports
import jwt

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

# Local imports
from app.infra.auth import create_access_token, create_refresh_token, get_current_user
from app.settings import settings


router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/login")
async def login(body: LoginRequest) -> dict[str, str]:
    """Password login (demo only accepts demo/demo123).

    Returns:
        Dictionary with access_token, refresh_token, and token_type.

    Raises:
        HTTPException: If invalid credentials.
    """
    if body.username == "demo" and body.password == "demo123":  # noqa: S105
        user_id = "123e4567-e89b-12d3-a456-426614174000"
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    return {
        "access_token": create_access_token(user_id),
        "refresh_token": create_refresh_token(user_id),
        "token_type": "bearer",
    }


@router.post("/demo")
async def demo_login() -> dict[str, str]:
    """Return tokens for a fixed demo user (no credentials)."""
    user_id = "123e4567-e89b-12d3-a456-426614174000"
    return {
        "access_token": create_access_token(user_id),
        "refresh_token": create_refresh_token(user_id),
        "token_type": "bearer",
    }


@router.post("/refresh")
async def refresh(body: RefreshRequest) -> dict[str, str]:
    """Exchange a valid refresh token for a new access token.

    Returns:
        Dictionary with new access_token and token_type.

    Raises:
        HTTPException: If refresh token is invalid or expired.
    """
    try:
        decoded = jwt.decode(
            body.refresh_token,
            settings.jwt_secret,
            algorithms=["HS256"],
            audience=settings.jwt_aud,
            options={"require": ["exp", "iat"]},
        )
        if decoded.get("typ") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        sub = decoded.get("sub")
        if not sub:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail="Invalid token") from e
    return {
        "access_token": create_access_token(sub),
        "refresh_token": body.refresh_token,
        "token_type": "bearer",
    }


@router.get("/me")
async def get_me(user_id: Annotated[str, Depends(get_current_user)]) -> dict[str, str]:
    """Get current user information.

    Returns:
        User information including id, username, and email.
    """
    demo_uuid = "123e4567-e89b-12d3-a456-426614174000"
    return {
        "id": user_id,
        "username": "demo" if user_id == demo_uuid else f"user_{user_id[:8]}",
        "email": "demo@example.com" if user_id == demo_uuid else f"user_{user_id[:8]}@example.com",
    }


@router.post("/logout")
async def logout(user_id: Annotated[str, Depends(get_current_user)]) -> dict[str, str]:  # noqa: ARG001
    """Log out the current user.

    Returns:
        Success message.

    Note:
        In production, this would invalidate the token in Redis/cache.
    """
    # In a real app, you might invalidate the token in Redis
    return {"message": "Logged out successfully"}
