"""Cookie utilities for v2 auth endpoints with proper path scoping."""

from __future__ import annotations

from secrets import token_urlsafe

from fastapi import HTTPException, Request, Response, status

from app.settings import settings
from app.types.utilities import validate_cookie_samesite


def set_refresh_cookie_v2(response: Response, token: str, max_age: int) -> None:
    """Set the refresh token cookie for v2 endpoints with correct path.

    Uses /api/v2/auth path to ensure cookie is sent to v2 endpoints.
    """
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=token,
        max_age=max_age,
        httponly=True,
        secure=settings.cookie_secure_default,
        samesite=validate_cookie_samesite(settings.cookie_samesite),
        path="/api/v2/auth",  # Scoped to v2 auth endpoints
    )


def clear_refresh_cookie_v2(response: Response) -> None:
    """Clear the refresh token cookie for v2 endpoints.

    Clears both v1 and v2 paths to ensure complete cleanup.
    """
    # Clear v2 path cookie
    response.delete_cookie(
        key=settings.refresh_cookie_name,
        path="/api/v2/auth",
        samesite=validate_cookie_samesite(settings.cookie_samesite),
    )

    # Also clear v1 path cookie in case of migration
    response.delete_cookie(
        key=settings.refresh_cookie_name,
        path=settings.cookie_path,
        samesite=validate_cookie_samesite(settings.cookie_samesite),
    )


def ensure_csrf_cookie_v2(response: Response, request: Request) -> str:
    """Ensure a CSRF cookie is present for v2 endpoints.

    Cookie is scoped to /api/v2/auth path.
    """
    existing = request.cookies.get(settings.csrf_cookie_name)
    if existing:
        return existing

    csrf = token_urlsafe(32)
    response.set_cookie(
        key=settings.csrf_cookie_name,
        value=csrf,
        max_age=7 * 24 * 60 * 60,  # 7 days
        httponly=False,  # Must be readable by JavaScript
        secure=settings.cookie_secure_default,
        samesite=validate_cookie_samesite(settings.cookie_samesite),
        path="/api/v2/auth",  # Scoped to v2 auth endpoints
    )
    return csrf


def require_csrf_v2(request: Request) -> None:
    """Validate CSRF for v2 endpoints by matching header to cookie value.

    Expects header `x-csrf-token` to equal the CSRF cookie.
    """
    token_cookie = request.cookies.get(settings.csrf_cookie_name)
    token_header = request.headers.get("x-csrf-token")

    if not token_cookie or not token_header or token_header != token_cookie:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token missing or invalid",
        )
