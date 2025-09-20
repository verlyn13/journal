"""Tests for recovery service."""

from __future__ import annotations

from uuid import uuid4

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.auth.recovery_service import RecoveryService
from app.infra.sa_models import RecoveryCode, User


class TestRecoveryService:
    """Test suite for RecoveryService."""

    @pytest.fixture()
    def recovery_service(self, db_session: AsyncSession) -> RecoveryService:
        """Create RecoveryService instance."""
        return RecoveryService(db_session)

    @pytest.fixture()
    async def test_user(self, db_session: AsyncSession) -> User:
        """Create test user."""
        user = User(
            id=uuid4(),
            email="test@example.com",
            username="testuser",
            is_active=True,
            is_verified=True,
        )
        db_session.add(user)
        await db_session.flush()
        return user

    @pytest.mark.asyncio()
    async def test_generate_recovery_kit(
        self,
        recovery_service: RecoveryService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test generating recovery kit."""
        kit = await recovery_service.generate_recovery_kit(test_user.id)

        assert "codes" in kit
        assert "generated_at" in kit
        assert "instructions" in kit
        assert "warning" in kit

        # Should have 10 codes by default
        assert len(kit["codes"]) == 10

        # All codes should be formatted as XXXX-XXXX
        for code in kit["codes"]:
            assert len(code) == 9  # 4 + 1 + 4
            assert code[4] == "-"

        # Codes should be stored in database
        result = await db_session.scalars(
            select(RecoveryCode).where(RecoveryCode.user_id == test_user.id)
        )
        stored_codes = list(result)
        assert len(stored_codes) == 10

    def test_generate_recovery_codes(self, recovery_service: RecoveryService) -> None:
        """Test recovery code generation."""
        codes = recovery_service.generate_recovery_codes(5)

        assert len(codes) == 5

        for code in codes:
            assert len(code) == 9  # XXXX-XXXX
            assert code[4] == "-"
            # Check that it contains valid URL-safe characters (base64url)
            clean_code = code.replace("-", "")
            assert all(c.isalnum() or c in "_-" for c in clean_code)

    def test_hash_recovery_code(self, recovery_service: RecoveryService) -> None:
        """Test recovery code hashing."""
        user_id = uuid4()
        code = "TEST-1234"

        hash1 = recovery_service.hash_recovery_code(code, user_id)
        hash2 = recovery_service.hash_recovery_code(code, user_id)

        # Same input should produce same hash
        assert hash1 == hash2

        # Different user should produce different hash
        different_user_id = uuid4()
        hash3 = recovery_service.hash_recovery_code(code, different_user_id)
        assert hash1 != hash3

        # Different code should produce different hash
        different_code = "TEST-5678"
        hash4 = recovery_service.hash_recovery_code(different_code, user_id)
        assert hash1 != hash4

    @pytest.mark.asyncio()
    async def test_verify_recovery_code_success(
        self,
        recovery_service: RecoveryService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test successful recovery code verification."""
        # Generate recovery kit
        kit = await recovery_service.generate_recovery_kit(test_user.id)
        code = kit["codes"][0]

        # Verify the code
        is_valid = await recovery_service.verify_recovery_code(test_user.id, code)
        assert is_valid is True

        # Code should now be marked as used
        result = await db_session.scalars(
            select(RecoveryCode)
            .where(RecoveryCode.user_id == test_user.id)
            .where(RecoveryCode.used == True)  # noqa: E712
        )
        used_codes = list(result)
        assert len(used_codes) == 1
        assert used_codes[0].used_at is not None

    @pytest.mark.asyncio()
    async def test_verify_recovery_code_invalid(
        self,
        recovery_service: RecoveryService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test invalid recovery code verification."""
        # Generate recovery kit
        await recovery_service.generate_recovery_kit(test_user.id)

        # Try to verify invalid code
        is_valid = await recovery_service.verify_recovery_code(
            test_user.id, "FAKE-CODE"
        )
        assert is_valid is False

    @pytest.mark.asyncio()
    async def test_verify_recovery_code_already_used(
        self,
        recovery_service: RecoveryService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test verification of already used recovery code."""
        # Generate recovery kit
        kit = await recovery_service.generate_recovery_kit(test_user.id)
        code = kit["codes"][0]

        # Use the code once
        is_valid1 = await recovery_service.verify_recovery_code(test_user.id, code)
        assert is_valid1 is True

        # Try to use it again
        is_valid2 = await recovery_service.verify_recovery_code(test_user.id, code)
        assert is_valid2 is False

    @pytest.mark.asyncio()
    async def test_get_recovery_status_with_codes(
        self,
        recovery_service: RecoveryService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test getting recovery status when user has codes."""
        # Generate recovery kit
        kit = await recovery_service.generate_recovery_kit(test_user.id)

        # Use one code
        await recovery_service.verify_recovery_code(test_user.id, kit["codes"][0])

        status = await recovery_service.get_recovery_status(test_user.id)

        assert status["total_codes"] == 10
        assert status["used_codes"] == 1
        assert status["remaining_codes"] == 9
        assert status["has_codes"] is True
        assert status["latest_generation"] is not None

    @pytest.mark.asyncio()
    async def test_get_recovery_status_no_codes(
        self,
        recovery_service: RecoveryService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test getting recovery status when user has no codes."""
        status = await recovery_service.get_recovery_status(test_user.id)

        assert status["total_codes"] == 0
        assert status["used_codes"] == 0
        assert status["remaining_codes"] == 0
        assert status["has_codes"] is False
        assert status["latest_generation"] is None

    @pytest.mark.asyncio()
    async def test_revoke_recovery_codes(
        self,
        recovery_service: RecoveryService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test revoking recovery codes."""
        # Generate recovery kit
        await recovery_service.generate_recovery_kit(test_user.id)

        # Verify codes exist
        status_before = await recovery_service.get_recovery_status(test_user.id)
        assert status_before["total_codes"] == 10

        # Revoke codes
        revoked_count = await recovery_service.revoke_recovery_codes(test_user.id)
        assert revoked_count == 10

        # Verify codes are gone
        status_after = await recovery_service.get_recovery_status(test_user.id)
        assert status_after["total_codes"] == 0

    @pytest.mark.asyncio()
    async def test_generate_new_kit_clears_old_codes(
        self,
        recovery_service: RecoveryService,
        test_user: User,
        db_session: AsyncSession,
    ) -> None:
        """Test that generating a new kit clears old codes."""
        # Generate first kit
        kit1 = await recovery_service.generate_recovery_kit(test_user.id)
        old_code = kit1["codes"][0]

        # Generate second kit
        kit2 = await recovery_service.generate_recovery_kit(test_user.id)

        # Old code should no longer work
        is_valid = await recovery_service.verify_recovery_code(test_user.id, old_code)
        assert is_valid is False

        # New codes should work
        new_code = kit2["codes"][0]
        is_valid_new = await recovery_service.verify_recovery_code(
            test_user.id, new_code
        )
        assert is_valid_new is True

        # Should still have 10 codes total, with 1 used from the new kit
        status = await recovery_service.get_recovery_status(test_user.id)
        assert status["total_codes"] == 10  # New kit has 10 codes
        assert status["used_codes"] == 1  # 1 code was used from the new kit
        assert status["remaining_codes"] == 9  # 9 unused codes remaining

    def test_get_recovery_instructions(self, recovery_service: RecoveryService) -> None:
        """Test recovery instructions."""
        instructions = recovery_service.get_recovery_instructions()

        assert "title" in instructions
        assert "steps" in instructions
        assert "usage" in instructions
        assert "security_tips" in instructions

        assert isinstance(instructions["steps"], list)
        assert len(instructions["steps"]) > 0

        assert "when_to_use" in instructions["usage"]
        assert "how_to_use" in instructions["usage"]
        assert "after_use" in instructions["usage"]

        assert isinstance(instructions["security_tips"], list)
        assert len(instructions["security_tips"]) > 0
