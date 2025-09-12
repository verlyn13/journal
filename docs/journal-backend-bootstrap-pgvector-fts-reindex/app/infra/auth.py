from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.settings import settings

bearer_scheme = HTTPBearer(auto_error=False)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def create_access_token(sub: str, scopes: list[str] | None = None) -> str:
    now = _utcnow()
    payload: Dict[str, Any] = {
        "iss": settings.jwt_iss,
        "aud": settings.jwt_aud,
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=settings.access_token_minutes)).timestamp()),
        "sub": sub,
        "scope": " ".join(scopes or []),
        "typ": "access",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def create_refresh_token(sub: str) -> str:
    now = _utcnow()
    payload = {
        "iss": settings.jwt_iss,
        "aud": settings.jwt_aud,
        "iat": int(now.timestamp()),
        "nbf": int(now.timestamp()),
        "exp": int((now + timedelta(days=settings.refresh_token_days)).timestamp()),
        "sub": sub,
        "typ": "refresh",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def require_user(creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:
    if not creds:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing auth")
    try:
        decoded = jwt.decode(
            creds.credentials,
            settings.jwt_secret,
            algorithms=["HS256"],
            audience=settings.jwt_aud,
            options={"require": ["exp", "iat"]},
        )
        return decoded["sub"]
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
