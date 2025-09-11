"""WebAuthn credential models with SQLAlchemy 2.0 typing.

These models handle WebAuthn/Passkey credentials following FIDO2 standards
with proper security patterns and no browser fingerprinting.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, LargeBinary, String, func, select
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infra.base import Base


if TYPE_CHECKING:
    from app.infra.sa_models import User


class WebAuthnCredential(Base):
    """WebAuthn/Passkey credential storage following FIDO2 standards."""

    __tablename__ = "webauthn_credentials"

    # Primary key
    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)

    # User association
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )

    # FIDO2 credential data
    credential_id: Mapped[bytes] = mapped_column(
        LargeBinary, unique=True, nullable=False, comment="Raw credential ID from authenticator"
    )
    public_key: Mapped[bytes] = mapped_column(
        LargeBinary, nullable=False, comment="COSE public key for verification"
    )

    # Security counters
    sign_count: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False, comment="Signature counter for clone detection"
    )

    # Authenticator metadata
    transports: Mapped[str | None] = mapped_column(
        String(120), nullable=True, comment="CSV of transport types (usb,nfc,ble,internal)"
    )
    aaguid: Mapped[str | None] = mapped_column(
        String(64), nullable=True, comment="Authenticator Attestation GUID"
    )

    # User-friendly identification
    nickname: Mapped[str | None] = mapped_column(
        String(100), nullable=True, comment="User-provided name for this credential"
    )

    # Backup eligibility and state (for passkeys)
    backup_eligible: Mapped[bool] = mapped_column(
        default=False, comment="Whether credential can be backed up"
    )
    backup_state: Mapped[bool] = mapped_column(
        default=False, comment="Whether credential is currently backed up"
    )

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped[User] = relationship(back_populates="webauthn_credentials")

    @classmethod
    async def find_by_credential_id(
        cls, session: AsyncSession, credential_id: bytes
    ) -> WebAuthnCredential | None:
        """Find credential by its raw ID."""
        return await session.scalar(select(cls).where(cls.credential_id == credential_id))  # type: ignore[no-any-return]

    @classmethod
    async def find_user_credentials(
        cls, session: AsyncSession, user_id: UUID
    ) -> list[WebAuthnCredential]:
        """Get all credentials for a user."""
        result = await session.scalars(
            select(cls).where(cls.user_id == user_id).order_by(cls.created_at.desc())
        )
        return list(result)

    async def update_usage(self, session: AsyncSession, sign_count: int) -> None:
        """Update credential after successful authentication."""
        self.sign_count = sign_count
        self.last_used_at = datetime.now(UTC)
        session.add(self)
        await session.flush()


class WebAuthnChallenge(Base):
    """Temporary storage for WebAuthn challenges with TTL."""

    __tablename__ = "webauthn_challenges"

    id: Mapped[UUID] = mapped_column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)

    # Session/user binding
    session_id: Mapped[str] = mapped_column(
        String(255), index=True, nullable=False, comment="Session or user ID for challenge"
    )

    # Challenge data
    challenge: Mapped[bytes] = mapped_column(
        LargeBinary, nullable=False, comment="Random challenge bytes"
    )
    challenge_type: Mapped[str] = mapped_column(
        String(20), nullable=False, comment="registration or authentication"
    )

    # Expiry
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )

    # Anti-replay
    used: Mapped[bool] = mapped_column(default=False, comment="Prevent challenge reuse")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    @classmethod
    async def cleanup_expired(cls, session: AsyncSession) -> int:
        """Remove expired challenges."""
        result = await session.execute(select(cls).where(cls.expires_at < datetime.now(UTC)))
        expired = result.scalars().all()
        for challenge in expired:
            await session.delete(challenge)
        await session.flush()
        return len(expired)
