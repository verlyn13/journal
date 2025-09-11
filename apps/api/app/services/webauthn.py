"""WebAuthn/Passkeys service with FIDO2 and conditional UI support.

This service implements secure passwordless authentication following FIDO2 standards
with support for conditional UI (autofill), proper origin validation, and no fingerprinting.
"""

from __future__ import annotations

import json

from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING, Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from webauthn import (
    generate_authentication_options,
    generate_registration_options,
    options_to_json,
    verify_authentication_response,
    verify_registration_response,
)
from webauthn.helpers import (
    parse_authentication_credential_json,
    parse_registration_credential_json,
)
from webauthn.helpers.cose import COSEAlgorithmIdentifier
from webauthn.helpers.structs import (
    AuthenticatorSelectionCriteria,
    AuthenticatorTransport,
    PublicKeyCredentialDescriptor,
    PublicKeyCredentialType,
    ResidentKeyRequirement,
    UserVerificationRequirement,
)

from app.infra.webauthn_models import WebAuthnChallenge, WebAuthnCredential
from app.settings import settings


if TYPE_CHECKING:
    from app.infra.sa_models import User


class WebAuthnService:
    """Service for WebAuthn/Passkeys operations."""

    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.rp_id = settings.webauthn_rp_id  # e.g., "example.com"
        self.rp_name = settings.webauthn_rp_name  # e.g., "Journal App"
        self.origin = settings.webauthn_origin  # e.g., "https://example.com"

    async def create_registration_options(
        self,
        user: User,
        session_id: str,
    ) -> dict[str, Any]:
        """Create registration options for a new credential.

        Args:
            user: User registering the credential
            session_id: Session ID for challenge storage

        Returns:
            Registration options for the client
        """
        # Get existing credentials to exclude
        existing_credentials = await WebAuthnCredential.find_user_credentials(self.session, user.id)

        exclude_credentials = [
            PublicKeyCredentialDescriptor(
                id=cred.credential_id,
                type=PublicKeyCredentialType.PUBLIC_KEY,
                transports=self._parse_transports(cred.transports),
            )
            for cred in existing_credentials
        ]

        # Generate registration options
        options = generate_registration_options(
            rp_id=self.rp_id,
            rp_name=self.rp_name,
            user_id=str(user.id).encode(),
            user_name=user.email,
            user_display_name=user.username or user.email,
            # Prefer platform authenticators for passkeys
            authenticator_selection=AuthenticatorSelectionCriteria(
                authenticator_attachment=None,  # Allow both platform and cross-platform
                resident_key=ResidentKeyRequirement.PREFERRED,
                user_verification=UserVerificationRequirement.PREFERRED,
            ),
            exclude_credentials=exclude_credentials,
            # Modern algorithms: ES256 (ECDSA), RS256 (RSA), EdDSA
            supported_pub_key_algs=[
                COSEAlgorithmIdentifier.ECDSA_SHA_256,
                COSEAlgorithmIdentifier.RSASSA_PKCS1_v1_5_SHA_256,
                COSEAlgorithmIdentifier.EDDSA,
            ],
            timeout=60000,  # 60 seconds
        )

        # Store challenge for verification
        await self._store_challenge(
            session_id=session_id,
            challenge=options.challenge,
            challenge_type="registration",
        )

        result: dict[str, Any] = json.loads(options_to_json(options))
        return result

    async def verify_registration(
        self,
        user: User,
        session_id: str,
        credential_json: str,
        nickname: str | None = None,
    ) -> WebAuthnCredential:
        """Verify and store a registration response.

        Args:
            user: User registering the credential
            session_id: Session ID for challenge retrieval
            credential_json: JSON registration response from client
            nickname: Optional user-friendly name for the credential

        Returns:
            Created WebAuthnCredential

        Raises:
            ValueError: If verification fails
        """
        # Retrieve and validate challenge
        challenge = await self._get_valid_challenge(session_id, "registration")
        if not challenge:
            raise ValueError("Invalid or expired challenge")

        # Parse credential from JSON
        credential = parse_registration_credential_json(credential_json)

        # Verify the registration (raises exception if invalid)
        try:
            verification = verify_registration_response(
                credential=credential,
                expected_challenge=challenge.challenge,
                expected_origin=self.origin,
                expected_rp_id=self.rp_id,
            )
        except Exception as e:
            raise ValueError(f"Registration verification failed: {e}") from e

        # Mark challenge as used
        challenge.used = True
        self.session.add(challenge)

        # Store the credential
        webauthn_credential = WebAuthnCredential(
            user_id=user.id,
            credential_id=verification.credential_id,
            public_key=verification.credential_public_key,
            sign_count=verification.sign_count,
            transports=self._format_transports(
                credential.response.transports if hasattr(credential.response, "transports") else None
            ),
            aaguid=verification.aaguid,
            nickname=nickname,
            backup_eligible=verification.credential_device_type in {"single_device", "multi_device"},
            backup_state=verification.credential_backed_up,
        )

        self.session.add(webauthn_credential)
        await self.session.flush()

        return webauthn_credential

    async def create_authentication_options(
        self,
        session_id: str,
        user_id: UUID | None = None,
        conditional_ui: bool = False,
    ) -> dict[str, Any]:
        """Create authentication options.

        Args:
            session_id: Session ID for challenge storage
            user_id: Optional user ID for specific user authentication
            conditional_ui: Whether to support conditional UI (autofill)

        Returns:
            Authentication options for the client
        """
        allow_credentials: list[PublicKeyCredentialDescriptor] = []

        # For specific user authentication, provide their credentials
        if user_id and not conditional_ui:
            credentials = await WebAuthnCredential.find_user_credentials(self.session, user_id)
            allow_credentials = [
                PublicKeyCredentialDescriptor(
                    id=cred.credential_id,
                    type=PublicKeyCredentialType.PUBLIC_KEY,
                    transports=self._parse_transports(cred.transports),
                )
                for cred in credentials
            ]

        # Generate authentication options
        options = generate_authentication_options(
            rp_id=self.rp_id,
            allow_credentials=allow_credentials or None,
            user_verification=UserVerificationRequirement.PREFERRED,
            timeout=60000,  # 60 seconds
        )

        # Store challenge for verification
        await self._store_challenge(
            session_id=session_id,
            challenge=options.challenge,
            challenge_type="authentication",
        )

        response: dict[str, Any] = json.loads(options_to_json(options))

        # Add conditional UI hint for autofill
        if conditional_ui:
            response["mediation"] = "conditional"

        return response

    async def verify_authentication(
        self,
        session_id: str,
        credential_json: str,
    ) -> tuple[User, WebAuthnCredential]:
        """Verify an authentication response.

        Args:
            session_id: Session ID for challenge retrieval
            credential_json: JSON authentication response from client

        Returns:
            Tuple of (authenticated User, used WebAuthnCredential)

        Raises:
            ValueError: If verification fails
        """
        # Retrieve and validate challenge
        challenge = await self._get_valid_challenge(session_id, "authentication")
        if not challenge:
            raise ValueError("Invalid or expired challenge")

        # Parse credential from JSON
        credential = parse_authentication_credential_json(credential_json)

        # Find the credential in database
        webauthn_credential = await WebAuthnCredential.find_by_credential_id(
            self.session, credential.raw_id
        )
        if not webauthn_credential:
            raise ValueError("Credential not found")

        # Verify the authentication (raises exception if invalid)
        try:
            verification = verify_authentication_response(
                credential=credential,
                expected_challenge=challenge.challenge,
                expected_origin=self.origin,
                expected_rp_id=self.rp_id,
                credential_public_key=webauthn_credential.public_key,
                credential_current_sign_count=webauthn_credential.sign_count,
            )
        except Exception as e:
            raise ValueError(f"Authentication verification failed: {e}") from e

        # Mark challenge as used
        challenge.used = True
        self.session.add(challenge)

        # Update credential usage
        await webauthn_credential.update_usage(self.session, verification.new_sign_count)

        # Get the user
        user = webauthn_credential.user

        return user, webauthn_credential

    async def list_user_credentials(self, user_id: UUID) -> list[dict[str, Any]]:
        """List user's WebAuthn credentials.

        Args:
            user_id: User's ID

        Returns:
            List of credential information (safe for client display)
        """
        credentials = await WebAuthnCredential.find_user_credentials(self.session, user_id)

        return [
            {
                "id": str(cred.id),
                "nickname": cred.nickname,
                "created_at": cred.created_at.isoformat(),
                "last_used_at": cred.last_used_at.isoformat() if cred.last_used_at else None,
                "backup_eligible": cred.backup_eligible,
                "backup_state": cred.backup_state,
                "transports": cred.transports.split(",") if cred.transports else [],
            }
            for cred in credentials
        ]

    async def delete_credential(self, user_id: UUID, credential_id: UUID) -> bool:
        """Delete a user's WebAuthn credential.

        Args:
            user_id: User's ID (for ownership check)
            credential_id: Credential ID to delete

        Returns:
            True if deleted, False if not found or unauthorized
        """
        result = await self.session.execute(
            select(WebAuthnCredential)
            .where(WebAuthnCredential.id == credential_id)
            .where(WebAuthnCredential.user_id == user_id)
        )
        credential = result.scalar_one_or_none()

        if not credential:
            return False

        await self.session.delete(credential)
        await self.session.flush()

        return True

    async def _store_challenge(
        self,
        session_id: str,
        challenge: bytes,
        challenge_type: str,
    ) -> WebAuthnChallenge:
        """Store a challenge for later verification."""
        # Clean up any existing challenges for this session
        result = await self.session.execute(
            select(WebAuthnChallenge).where(WebAuthnChallenge.session_id == session_id)
        )
        existing = result.scalars().all()
        for old_challenge in existing:
            await self.session.delete(old_challenge)

        # Create new challenge with 5-minute TTL
        new_challenge = WebAuthnChallenge(
            session_id=session_id,
            challenge=challenge,
            challenge_type=challenge_type,
            expires_at=datetime.now(UTC) + timedelta(minutes=5),
        )

        self.session.add(new_challenge)
        await self.session.flush()

        return new_challenge

    async def _get_valid_challenge(
        self,
        session_id: str,
        challenge_type: str,
    ) -> WebAuthnChallenge | None:
        """Retrieve a valid, unused challenge."""
        result = await self.session.execute(
            select(WebAuthnChallenge)
            .where(WebAuthnChallenge.session_id == session_id)
            .where(WebAuthnChallenge.challenge_type == challenge_type)
            .where(WebAuthnChallenge.used == False)  # noqa: E712
            .where(WebAuthnChallenge.expires_at > datetime.now(UTC))
        )

        return result.scalar_one_or_none()

    @staticmethod
    def _parse_transports(transports_str: str | None) -> list[AuthenticatorTransport]:
        """Parse transport string to list of transports."""
        if not transports_str:
            return []

        transport_map = {
            "usb": AuthenticatorTransport.USB,
            "nfc": AuthenticatorTransport.NFC,
            "ble": AuthenticatorTransport.BLE,
            "internal": AuthenticatorTransport.INTERNAL,
            "hybrid": AuthenticatorTransport.HYBRID,
        }

        return [
            transport_map[transport]
            for transport in transports_str.split(",")
            if transport in transport_map
        ]

    @staticmethod
    def _format_transports(transports: list[AuthenticatorTransport] | None) -> str | None:
        """Format transports list to CSV string."""
        if not transports:
            return None

        # Convert AuthenticatorTransport enums to strings
        transport_strings = []
        for t in transports:
            if isinstance(t, AuthenticatorTransport):
                transport_strings.append(t.value)
            elif isinstance(t, str):
                transport_strings.append(t)

        return ",".join(transport_strings) if transport_strings else None

    async def cleanup_expired_challenges(self) -> int:
        """Remove expired challenges (maintenance task)."""
        return await WebAuthnChallenge.cleanup_expired(self.session)
