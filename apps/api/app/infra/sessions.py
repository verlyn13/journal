from __future__ import annotations

from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.models import UserSession
from app.settings import settings


def _utcnow() -> datetime:
    return datetime.now(UTC)


async def create_session(
    db: AsyncSession, user_id: UUID, ua: str | None, ip: str | None
) -> UserSession:
    now = _utcnow()
    sess = UserSession(
        user_id=user_id,
        refresh_id=uuid4(),
        user_agent=ua,
        ip_address=ip,
        issued_at=now,
        last_used_at=now,
        expires_at=now + timedelta(days=settings.refresh_token_days),
        revoked_at=None,
    )
    db.add(sess)
    await db.commit()
    await db.refresh(sess)
    return sess


async def get_session_by_refresh_id(db: AsyncSession, rid: UUID) -> UserSession | None:
    res = await db.execute(select(UserSession).where(UserSession.refresh_id == rid))
    return res.scalars().first()


async def touch_session(db: AsyncSession, sess: UserSession) -> None:
    sess.last_used_at = _utcnow()
    db.add(sess)
    await db.commit()


async def revoke_session(db: AsyncSession, sess: UserSession) -> None:
    if not sess.revoked_at:
        sess.revoked_at = _utcnow()
        db.add(sess)
        await db.commit()
