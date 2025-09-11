"""User management service."""

import logging

from typing import Optional
from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.infra.models import User
from app.infra.password import hash_password, verify_password


logger = logging.getLogger(__name__)


class UserService:
    """Service for user management operations."""

    def __init__(self, session: Session):
        self.session = session

    async def create_user(
        self,
        email: str,
        password: str,
        username: str | None = None,
        is_verified: bool = False,
    ) -> User | None:
        """Create a new user with hashed password.

        Args:
            email: User's email address
            password: Plain text password
            username: Optional username
            is_verified: Whether email is pre-verified (for testing)

        Returns:
            Created User or None if email/username already exists
        """
        try:
            user = User(
                email=email.lower(),
                username=username,
                password_hash=hash_password(password),
                is_active=True,
                is_verified=is_verified,
                roles=["user"],
            )

            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)

            logger.info(f"Created user {user.id} with email {email}")
            return user

        except IntegrityError as e:
            self.session.rollback()
            logger.warning(f"Failed to create user with email {email}: {e}")
            return None

    async def get_user_by_email(self, email: str) -> User | None:
        """Get user by email address.

        Args:
            email: Email address to search for

        Returns:
            User if found, None otherwise
        """
        statement = select(User).where(User.email == email.lower())
        result = self.session.exec(statement)
        return result.first()

    async def get_user_by_id(self, user_id: UUID) -> User | None:
        """Get user by ID.

        Args:
            user_id: User's UUID

        Returns:
            User if found, None otherwise
        """
        return self.session.get(User, user_id)

    async def verify_user_password(self, email: str, password: str) -> User | None:
        """Verify user credentials.

        Args:
            email: User's email
            password: Plain text password to verify

        Returns:
            User if credentials are valid, None otherwise
        """
        user = await self.get_user_by_email(email)

        if not user:
            logger.debug(f"User not found: {email}")
            return None

        if not user.is_active:
            logger.debug(f"User inactive: {email}")
            return None

        if not user.password_hash:
            logger.debug(f"User has no password set: {email}")
            return None

        if not verify_password(password, user.password_hash):
            logger.debug(f"Invalid password for user: {email}")
            return None

        return user

    async def mark_user_verified(self, user_id: UUID) -> bool:
        """Mark a user's email as verified.

        Args:
            user_id: User's UUID

        Returns:
            True if successful, False otherwise
        """
        user = await self.get_user_by_id(user_id)
        if not user:
            return False

        user.is_verified = True
        self.session.add(user)
        self.session.commit()

        logger.info(f"Marked user {user_id} as verified")
        return True

    async def update_password(self, user_id: UUID, new_password: str) -> bool:
        """Update user's password.

        Args:
            user_id: User's UUID
            new_password: New plain text password

        Returns:
            True if successful, False otherwise
        """
        user = await self.get_user_by_id(user_id)
        if not user:
            return False

        user.password_hash = hash_password(new_password)
        self.session.add(user)
        self.session.commit()

        logger.info(f"Updated password for user {user_id}")
        return True
