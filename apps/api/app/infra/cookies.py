from __future__ import annotations

from secrets import token_urlsafe

from fastapi import HTTPException, Request, Response, status

from app.settings import settings


def set_refresh_cookie(resp: Response, value: str, max_age: int) -> None:
    resp.set_cookie(
        key=settings.refresh_cookie_name,
        value=value,
        httponly=True,
        secure=settings.cookie_secure_default,
        samesite=settings.cookie_samesite.capitalize(),
        path=settings.cookie_path,
        max_age=max_age,
    )


def clear_refresh_cookie(resp: Response) -> None:
    resp.delete_cookie(
        key=settings.refresh_cookie_name,
        path=settings.cookie_path,
        samesite=settings.cookie_samesite.capitalize(),
    )


def ensure_csrf_cookie(resp: Response, req: Request) -> str:
    name = settings.csrf_cookie_name
    val = req.cookies.get(name) or token_urlsafe(24)
    resp.set_cookie(
        key=name,
        value=val,
        httponly=False,
        secure=settings.cookie_secure_default,
        samesite=settings.cookie_samesite.capitalize(),
        path="/",
        max_age=60 * 60 * 24 * 180,
    )
    return val


def require_csrf(req: Request) -> None:
    name = settings.csrf_cookie_name
    cookie = req.cookies.get(name)
    header = req.headers.get("x-csrf-token")
    if not cookie or not header or cookie != header:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF validation failed")
