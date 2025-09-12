"""Recovery service for generating and managing backup codes."""

from __future__ import annotations

import hashlib
import secrets

from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.sa_models import RecoveryCode


class RecoveryService:
    """Service for generating and managing recovery codes."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def generate_recovery_kit(self, user_id: UUID) -> dict[str, Any]:
        """Generate recovery codes and backup info.

        Args:
            user_id: User ID to generate codes for

        Returns:
            Recovery kit with codes and instructions
        """
        # Clear existing codes
        await self._clear_existing_codes(user_id)

        # Generate new codes
        codes = RecoveryService.generate_recovery_codes(10)

        # Store hashed codes
        for code in codes:
            hashed = RecoveryService.hash_recovery_code(code, user_id)
            recovery_code = RecoveryCode(
                user_id=user_id, code_hash=hashed, used=False, created_at=datetime.now(UTC)
            )
            self.session.add(recovery_code)

        await self.session.flush()

        return {
            "codes": codes,
            "generated_at": datetime.now(UTC),
            "instructions": RecoveryService.get_recovery_instructions(),
            "warning": "Store these codes in a safe place. They will not be shown again.",
        }

    @staticmethod
    def generate_recovery_codes(count: int = 10) -> list[str]:
        """Generate high-entropy recovery codes.

        Args:
            count: Number of codes to generate

        Returns:
            List of formatted recovery codes (XXXX-XXXX)
        """
        codes = []
        for _ in range(count):
            # 8 chars, formatted as XXXX-XXXX
            code = secrets.token_urlsafe(6).upper()[:8]
            codes.append(f"{code[:4]}-{code[4:8]}")
        return codes

    @staticmethod
    def hash_recovery_code(code: str, user_id: UUID) -> str:
        """Hash with user-specific salt.

        Args:
            code: Plain text recovery code
            user_id: User ID for salt generation

        Returns:
            Hexadecimal hash of the code
        """
        salt = hashlib.sha256(user_id.bytes).digest()
        return hashlib.pbkdf2_hmac("sha256", code.encode(), salt, 100_000).hex()

    async def verify_recovery_code(self, user_id: UUID, code: str) -> bool:
        """Verify a recovery code and mark it as used.

        Args:
            user_id: User ID
            code: Recovery code to verify

        Returns:
            True if code is valid and unused, False otherwise
        """
        code_hash = RecoveryService.hash_recovery_code(code, user_id)

        # Find the code
        recovery_code = await self.session.scalar(
            select(RecoveryCode)
            .where(RecoveryCode.user_id == user_id)
            .where(RecoveryCode.code_hash == code_hash)
            .where(RecoveryCode.used == False)  # noqa: E712
        )

        if not recovery_code:
            return False

        # Mark as used
        recovery_code.used = True
        recovery_code.used_at = datetime.now(UTC)
        await self.session.flush()

        return True

    async def get_recovery_status(self, user_id: UUID) -> dict[str, Any]:
        """Get recovery code status for a user.

        Args:
            user_id: User ID

        Returns:
            Recovery status information
        """
        result = await self.session.scalars(
            select(RecoveryCode).where(RecoveryCode.user_id == user_id)
        )
        codes = list(result)

        total = len(codes)
        used = len([c for c in codes if c.used])
        remaining = total - used

        latest_generation = None
        if codes:
            latest_generation = max(c.created_at for c in codes)

        return {
            "total_codes": total,
            "used_codes": used,
            "remaining_codes": remaining,
            "has_codes": total > 0,
            "latest_generation": latest_generation.isoformat() if latest_generation else None,
        }

    async def revoke_recovery_codes(self, user_id: UUID) -> int:
        """Revoke all recovery codes for a user.

        Args:
            user_id: User ID

        Returns:
            Number of codes revoked
        """
        return await self._clear_existing_codes(user_id)

    async def _clear_existing_codes(self, user_id: UUID) -> int:
        """Clear all existing recovery codes for a user.

        Args:
            user_id: User ID

        Returns:
            Number of codes deleted
        """
        result = await self.session.scalars(
            select(RecoveryCode).where(RecoveryCode.user_id == user_id)
        )
        codes = list(result)

        for code in codes:
            await self.session.delete(code)

        await self.session.flush()
        return len(codes)

    @staticmethod
    def get_recovery_instructions() -> dict[str, Any]:
        """Get recovery instructions for users.

        Returns:
            Instructions for using recovery codes
        """
        return {
            "title": "Recovery Code Instructions",
            "steps": [
                "Store these codes in a secure location (password manager, safe, etc.)",
                "Each code can only be used once",
                "Use these codes if you lose access to your passkeys or other authentication methods",
                "You can generate new codes at any time, which will invalidate the old ones",
                "Keep these codes confidential - anyone with access can use them to access your account",
            ],
            "usage": {
                "when_to_use": "When you cannot access your account through normal means",
                "how_to_use": "Enter the recovery code when prompted during login",
                "after_use": "The code will be marked as used and cannot be used again",
            },
            "security_tips": [
                "Do not store codes in plain text on your computer",
                "Do not share codes with anyone",
                "Generate new codes if you suspect they may be compromised",
                "Consider printing codes and storing them physically",
            ],
        }
