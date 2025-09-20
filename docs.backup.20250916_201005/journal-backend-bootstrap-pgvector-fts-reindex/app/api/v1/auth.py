from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter

from app.infra.auth import create_access_token, create_refresh_token

router = APIRouter(prefix="/auth", tags=["auth"])


# Demo-only endpoints. Replace with real user storage/auth.
@router.post("/login")
async def login_demo(body: dict):
    user_id = str(body.get("user_id") or uuid4())
    return {
        "access_token": create_access_token(user_id),
        "refresh_token": create_refresh_token(user_id),
        "user_id": user_id,
    }
