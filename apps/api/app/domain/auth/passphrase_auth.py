"""
Passphrase Authentication System

A minimalist authentication system for controlled access during testing phase.
Uses long, secure passphrases stored as hashed values.
"""

import hashlib
import secrets
from typing import Optional
from uuid import UUID
from datetime import datetime, timezone
from pydantic import BaseModel


class PassphraseUser(BaseModel):
    """User associated with a passphrase"""
    user_id: str
    username: str
    email: str
    full_name: str
    is_admin: bool = False
    created_at: datetime = datetime.now(timezone.utc)


class PassphraseAuthService:
    """Manages passphrase-based authentication"""

    def __init__(self):
        # Hardcoded hashed passphrases for testing phase
        # These should be moved to environment variables or database in production
        self.passphrases = {
            # Admin passphrase for verlyn13
            # Passphrase: quill-aurora-ember-aurora-obsidian-cascade
            "ff1e9fd9f4a7cea7a06af67be552c1e71eebb30c5f8711aae8de33e7e4c8d2e0": PassphraseUser(
                user_id="123e4567-e89b-12d3-a456-426614174000",
                username="verlyn13",
                email="jeffreyverlynjohnson@gmail.com",
                full_name="Jeffrey Verlyn Johnson",
                is_admin=True
            ),
            # Test user passphrases can be added here
        }

    @staticmethod
    def hash_passphrase(passphrase: str) -> str:
        """
        Generate a SHA-256 hash of the passphrase.
        In production, use bcrypt or argon2 for better security.
        """
        return hashlib.sha256(passphrase.encode()).hexdigest()

    def authenticate(self, passphrase: str) -> Optional[PassphraseUser]:
        """
        Authenticate a user with a passphrase.
        Returns user info if valid, None otherwise.
        """
        hashed = self.hash_passphrase(passphrase)
        return self.passphrases.get(hashed)

    def add_passphrase(self, passphrase: str, user: PassphraseUser):
        """Add a new passphrase-user mapping"""
        hashed = self.hash_passphrase(passphrase)
        self.passphrases[hashed] = user

    def generate_secure_passphrase(self, words: int = 6) -> str:
        """
        Generate a secure random passphrase.
        This is just for generating passphrases to store in Bitwarden.
        """
        # Simple word list for demo - in production use a proper word list
        word_list = [
            "quill", "flame", "sanctuary", "journal", "wisdom", "reflect",
            "chronicle", "ember", "profound", "serene", "cascade", "aurora",
            "nebula", "cipher", "ethereal", "luminous", "obsidian", "phoenix"
        ]

        selected = [secrets.choice(word_list) for _ in range(words)]
        return "-".join(selected)


# Global instance
passphrase_auth = PassphraseAuthService()

# Generate and print a sample passphrase for setup
if __name__ == "__main__":
    service = PassphraseAuthService()

    # Generate a passphrase for the admin
    admin_passphrase = service.generate_secure_passphrase()
    print(f"Generated admin passphrase: {admin_passphrase}")
    print(f"Hash: {service.hash_passphrase(admin_passphrase)}")

    # You would store this passphrase in Bitwarden and the hash in the code
    print("\nTo set up your admin account:")
    print("1. Store the passphrase in Bitwarden")
    print("2. Replace 'admin_hash_placeholder' with the hash above")