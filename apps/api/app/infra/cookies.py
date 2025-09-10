from __future__ import annotations

# Standard Library Imports
from secrets import token_urlsafe

# Third-Party Imports
from fastapi import HTTPException, Request, Response, status

# Local Imports
from app.settings import settings
from app.types.utilities import validate_cookie_samesite


def set_refresh_cookie(response: Response, token: str, max_age: int) -> None:
    """Set the refresh token cookie with secure attributes.

    Uses names and defaults from settings. Cookie is HttpOnly and scoped to the
    auth route path to minimize exposure. Caller controls `max_age`.
    """
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=token,
        max_age=max_age,
        httponly=True,
        secure=settings.cookie_secure_default,
        samesite=validate_cookie_samesite(settings.cookie_samesite),
        path=settings.cookie_path,
    )


def clear_refresh_cookie(response: Response) -> None:
    """Clear the refresh token cookie.

    Uses delete_cookie to ensure removal with matching path and attributes.
    """
    response.delete_cookie(
        key=settings.refresh_cookie_name,
        path=settings.cookie_path,
        samesite=validate_cookie_samesite(settings.cookie_samesite),
    )


def ensure_csrf_cookie(response: Response, request: Request) -> None:
    """Ensure a CSRF cookie is present; set one if missing.

    - Cookie is NOT HttpOnly so client JS can read it and echo in header.
    - Path and security attributes mirror refresh cookie scope.
    """
    if request.cookies.get(settings.csrf_cookie_name):
        return
    csrf = token_urlsafe(32)
    response.set_cookie(
        key=settings.csrf_cookie_name,
        value=csrf,
        max_age=7 * 24 * 60 * 60,  # 7 days
        httponly=False,
        secure=settings.cookie_secure_default,
        samesite=validate_cookie_samesite(settings.cookie_samesite),
        path=settings.cookie_path,
    )


def require_csrf(request: Request) -> None:
    """Validate CSRF by matching header to cookie value.

    Expects header `x-csrf-token` to equal the CSRF cookie. Raises 403 if missing
    or mismatched. This check is only used when cookie-based refresh is enabled.
    """
    token_cookie = request.cookies.get(settings.csrf_cookie_name)
    token_header = request.headers.get("x-csrf-token")
    if not token_cookie or not token_header or token_header != token_cookie:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="CSRF token missing or invalid"
        )
