from __future__ import annotations

# Third-party imports
import jwt

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
import uuid
from pydantic import BaseModel, EmailStr, Field

# Local imports
from app.infra.auth import (
    create_access_token,
    create_refresh_token,
    create_verify_token,
    get_current_user,
)
from app.infra.db import get_session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.infra.models import User
from app.infra.security import hash_password, verify_password
from app.infra.ratelimit import allow
from app.settings import settings


router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    username: str | None = None


class VerifyEmailRequest(BaseModel):
    token: str


class LoginRequest(BaseModel):
    email: str | None = None
    username: str | None = None
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/login")
async def login(body: LoginRequest, request: Request, s: AsyncSession = Depends(get_session)) -> dict[str, str]:
    """Login endpoint supports two modes: demo (flag off) and real (flag on)."""
    if not settings.user_mgmt_enabled:
        # Demo login (existing behavior)
        expected_user = settings.demo_username or "demo"
        expected_pass = settings.demo_password or ("demo" + "123")  # not a real secret
        if (body.username or body.email) == expected_user and body.password == expected_pass:
            user_id = "123e4567-e89b-12d3-a456-426614174000"
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        return {
            "access_token": create_access_token(user_id),
            "refresh_token": create_refresh_token(user_id),
            "token_type": "bearer",
        }

    # Real login (flag on)
    key = f"login:{(body.email or body.username or '').lower()}"
    if not allow(key, settings.rate_limit_max_attempts, settings.rate_limit_window_seconds):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Please try again later")

    stmt = select(User).where(User.email == (body.email or ""))
    res = await s.execute(stmt)
    user = res.scalars().first()
    ok = bool(
        user
        and user.is_active
        and user.password_hash
        and verify_password(user.password_hash, body.password)
        and (user.is_verified or not settings.auth_require_email_verify)
    )
    if not ok:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    return {
        "access_token": create_access_token(str(user.id), scopes=user.roles),
        "refresh_token": create_refresh_token(str(user.id)),  # rotation in M1.T3
        "token_type": "bearer",
    }


@router.post("/register", status_code=202)
async def register(
    body: RegisterRequest, request: Request, s: AsyncSession = Depends(get_session)
) -> dict[str, str | None]:
    if not settings.user_mgmt_enabled:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    key = f"register:{request.client.host if request.client else 'unknown'}"
    if not allow(key, settings.rate_limit_max_attempts, settings.rate_limit_window_seconds):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Please try again later")

    # Do not enumerate existing emails
    res = await s.execute(select(User).where(User.email == body.email))
    existing = res.scalars().first()
    if existing:
        return {"message": "If this address can register, a verification will be sent.", "dev_verify_token": None}

    user = User(email=body.email, username=body.username, password_hash=hash_password(body.password))
    s.add(user)
    await s.commit()
    await s.refresh(user)

    token = create_verify_token(str(user.id))
    return {
        "message": "Verification required",
        "dev_verify_token": token if settings.testing else None,
    }


@router.post("/verify-email", status_code=204, response_class=Response)
async def verify_email(body: VerifyEmailRequest, s: AsyncSession = Depends(get_session)) -> Response:
    if not settings.user_mgmt_enabled:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)

    try:
        decoded = jwt.decode(
            body.token,
            settings.jwt_secret,
            algorithms=["HS256"],
            audience=settings.jwt_aud,
            options={"require": ["exp", "iat"]},
        )
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token") from e

    if decoded.get("typ") != "verify":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token type")

    uid = decoded.get("sub")
    if not uid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")

    res = await s.execute(select(User).where(User.id == uuid.UUID(uid)))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found")

    user.is_verified = True
    await s.merge(user)
    await s.commit()
    return Response(status_code=204)


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
    """Exchange a valid refresh token for a new access token."""
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
async def get_me(user_id: str = Depends(get_current_user)) -> dict[str, str]:
    demo_uuid = "123e4567-e89b-12d3-a456-426614174000"
    return {
        "id": user_id,
        "username": "demo" if user_id == demo_uuid else f"user_{user_id[:8]}",
        "email": "demo@example.com" if user_id == demo_uuid else f"user_{user_id[:8]}@example.com",
    }


@router.post("/logout")
async def logout(user_id: str = Depends(get_current_user)) -> dict[str, str]:
    # In a real app, you might invalidate the token in Redis
    return {"message": "Logged out successfully"}
