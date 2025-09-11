"""WebAuthn/Passkeys API endpoints.

This module provides REST endpoints for WebAuthn registration and authentication
following FIDO2 best practices with conditional UI support.
"""

from __future__ import annotations

import uuid

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import Response as FastAPIResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.auth import create_access_token, create_refresh_token, get_current_user
from app.infra.auth_counters import login_success
from app.infra.cookies import set_refresh_cookie
from app.infra.db import get_session
from app.infra.ratelimit import allow
from app.infra.sa_models import User
from app.infra.sessions import create_session as create_user_session
from app.services.webauthn import WebAuthnService
from app.settings import settings


router = APIRouter(prefix="/webauthn", tags=["webauthn"])


class RegistrationOptionsRequest(BaseModel):
    """Request for registration options."""

    nickname: str | None = Field(
        None, max_length=100, description="User-friendly name for credential"
    )


class RegistrationOptionsResponse(BaseModel):
    """WebAuthn registration options."""

    options: dict[str, Any]
    session_id: str


class RegistrationVerifyRequest(BaseModel):
    """WebAuthn registration verification."""

    session_id: str
    credential: str  # JSON string from navigator.credentials.create()
    nickname: str | None = None


class AuthenticationOptionsRequest(BaseModel):
    """Request for authentication options."""

    email: str | None = Field(None, description="Email for user-specific authentication")
    conditional_ui: bool = Field(False, description="Enable conditional UI (autofill)")


class AuthenticationOptionsResponse(BaseModel):
    """WebAuthn authentication options."""

    options: dict[str, Any]
    session_id: str


class AuthenticationVerifyRequest(BaseModel):
    """WebAuthn authentication verification."""

    session_id: str
    credential: str  # JSON string from navigator.credentials.get()


class CredentialInfo(BaseModel):
    """Public credential information."""

    id: str
    nickname: str | None
    created_at: str
    last_used_at: str | None
    backup_eligible: bool
    backup_state: bool
    transports: list[str]


@router.post("/register/options", response_model=RegistrationOptionsResponse)
async def registration_options(
    request: RegistrationOptionsRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> RegistrationOptionsResponse:
    """Generate WebAuthn registration options for adding a new credential.

    Requires authenticated user. Returns options for navigator.credentials.create().
    """
    if not settings.user_mgmt_enabled:
        raise HTTPException(status_code=404, detail="Not found")

    # Generate unique session ID for this registration
    session_id = str(uuid.uuid4())

    # Create WebAuthn service and generate options
    service = WebAuthnService(session)
    options = await service.create_registration_options(
        user=user,
        session_id=session_id,
    )

    return RegistrationOptionsResponse(options=options, session_id=session_id)


@router.post("/register/verify", status_code=status.HTTP_201_CREATED)
async def registration_verify(
    request: RegistrationVerifyRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    """Verify WebAuthn registration and store credential.

    Requires authenticated user. Verifies the credential from navigator.credentials.create().
    """
    if not settings.user_mgmt_enabled:
        raise HTTPException(status_code=404, detail="Not found")

    # Rate limit registration attempts
    if not allow(f"webauthn:register:{user.id}", max_attempts=5, window_seconds=300):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many registration attempts",
        )

    try:
        service = WebAuthnService(session)
        credential = await service.verify_registration(
            user=user,
            session_id=request.session_id,
            credential_json=request.credential,
            nickname=request.nickname,
        )
        await session.commit()

        return {"status": "success", "credential_id": str(credential.id)}

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e


@router.post("/authenticate/options", response_model=AuthenticationOptionsResponse)
async def authentication_options(
    request: AuthenticationOptionsRequest,
    req: Request,
    session: AsyncSession = Depends(get_session),
) -> AuthenticationOptionsResponse:
    """Generate WebAuthn authentication options.

    Can be called without authentication for conditional UI support.
    Returns options for navigator.credentials.get().
    """
    if not settings.user_mgmt_enabled:
        raise HTTPException(status_code=404, detail="Not found")

    # Generate unique session ID for this authentication
    session_id = str(uuid.uuid4())

    # Find user ID if email provided
    user_id = None
    if request.email:
        # This is for explicit authentication with email
        result = await session.scalar(select(User.id).where(User.email == request.email.lower()))
        if result:
            user_id = result

    # Create WebAuthn service and generate options
    service = WebAuthnService(session)
    options = await service.create_authentication_options(
        session_id=session_id,
        user_id=user_id,
        conditional_ui=request.conditional_ui,
    )

    return AuthenticationOptionsResponse(options=options, session_id=session_id)


@router.post("/authenticate/verify")
async def authentication_verify(
    request: AuthenticationVerifyRequest,
    response: Response,
    req: Request,
    session: AsyncSession = Depends(get_session),
) -> dict[str, Any]:
    """Verify WebAuthn authentication and create session.

    Verifies the credential from navigator.credentials.get() and returns tokens.
    """
    if not settings.user_mgmt_enabled:
        raise HTTPException(status_code=404, detail="Not found")

    # Rate limit authentication attempts
    if not allow(f"webauthn:auth:{request.session_id}", max_attempts=5, window_seconds=60):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication attempts",
        )

    try:
        service = WebAuthnService(session)
        user, credential = await service.verify_authentication(
            session_id=request.session_id,
            credential_json=request.credential,
        )

        # Create user session
        user_session = await create_user_session(
            session,
            user.id,
            req.headers.get("User-Agent"),
            req.client.host if req.client else None,
        )
        await session.commit()

        # Create tokens
        access_token = create_access_token(str(user.id))
        refresh_token = create_refresh_token(str(user.id), refresh_id=str(user_session.refresh_id))

        # Set refresh token in secure cookie (30 days)
        set_refresh_cookie(response, refresh_token, max_age=30 * 24 * 60 * 60)

        # Track successful login
        login_success("webauthn")

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": str(user.id),
                "email": user.email,
                "username": user.username,
            },
            "credential_used": str(credential.id),
        }

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        ) from e


@router.get("/credentials", response_model=list[CredentialInfo])
async def list_credentials(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[CredentialInfo]:
    """List user's WebAuthn credentials.

    Returns public information about registered credentials.
    """
    if not settings.user_mgmt_enabled:
        raise HTTPException(status_code=404, detail="Not found")

    service = WebAuthnService(session)
    credentials = await service.list_user_credentials(user.id)

    return [
        CredentialInfo(
            id=cred["id"],
            nickname=cred["nickname"],
            created_at=cred["created_at"],
            last_used_at=cred["last_used_at"],
            backup_eligible=cred["backup_eligible"],
            backup_state=cred["backup_state"],
            transports=cred["transports"],
        )
        for cred in credentials
    ]


@router.delete("/credentials/{credential_id}")
async def delete_credential(
    credential_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> FastAPIResponse:
    """Delete a WebAuthn credential.

    User must have at least one other authentication method remaining.
    """
    if not settings.user_mgmt_enabled:
        raise HTTPException(status_code=404, detail="Not found")

    try:
        cred_uuid = uuid.UUID(credential_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid credential ID",
        ) from e

    # Check user has other auth methods
    service = WebAuthnService(session)
    credentials = await service.list_user_credentials(user.id)

    if len(credentials) <= 1 and not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove last authentication method",
        )

    # Delete the credential
    success = await service.delete_credential(user.id, cred_uuid)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credential not found",
        )

    await session.commit()

    return FastAPIResponse(status_code=status.HTTP_204_NO_CONTENT)
