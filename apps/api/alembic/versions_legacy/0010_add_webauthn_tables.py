"""Add WebAuthn credentials and challenges tables

Revision ID: 0010_add_webauthn_tables
Revises: 0009_add_users_and_sessions
Create Date: 2025-01-10 19:35:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "0010_add_webauthn_tables"
down_revision: Union[str, None] = "0009_add_users_and_sessions"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create WebAuthn credential and challenge tables."""
    # Create webauthn_credentials table
    op.create_table(
        "webauthn_credentials",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("credential_id", sa.LargeBinary(), nullable=False),
        sa.Column("public_key", sa.LargeBinary(), nullable=False),
        sa.Column("sign_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("transports", sa.String(120), nullable=True),
        sa.Column("aaguid", sa.String(64), nullable=True),
        sa.Column("nickname", sa.String(100), nullable=True),
        sa.Column("backup_eligible", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("backup_state", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("last_used_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_webauthn_credentials_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_webauthn_credentials")),
        sa.UniqueConstraint("credential_id", name=op.f("uq_webauthn_credentials_credential_id")),
        comment="WebAuthn/Passkey credential storage following FIDO2 standards",
    )

    # Create indexes for webauthn_credentials
    op.create_index(
        op.f("ix_webauthn_credentials_user_id"),
        "webauthn_credentials",
        ["user_id"],
        unique=False,
    )

    # Create webauthn_challenges table
    op.create_table(
        "webauthn_challenges",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("session_id", sa.String(255), nullable=False),
        sa.Column("challenge", sa.LargeBinary(), nullable=False),
        sa.Column("challenge_type", sa.String(20), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_webauthn_challenges")),
        comment="Temporary storage for WebAuthn challenges with TTL",
    )

    # Create indexes for webauthn_challenges
    op.create_index(
        op.f("ix_webauthn_challenges_session_id"),
        "webauthn_challenges",
        ["session_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_webauthn_challenges_expires_at"),
        "webauthn_challenges",
        ["expires_at"],
        unique=False,
    )

    # Add comments to columns
    op.execute(
        "COMMENT ON COLUMN webauthn_credentials.credential_id IS "
        "'Raw credential ID from authenticator'"
    )
    op.execute(
        "COMMENT ON COLUMN webauthn_credentials.public_key IS 'COSE public key for verification'"
    )
    op.execute(
        "COMMENT ON COLUMN webauthn_credentials.sign_count IS "
        "'Signature counter for clone detection'"
    )
    op.execute(
        "COMMENT ON COLUMN webauthn_credentials.transports IS "
        "'CSV of transport types (usb,nfc,ble,internal)'"
    )
    op.execute("COMMENT ON COLUMN webauthn_credentials.aaguid IS 'Authenticator Attestation GUID'")
    op.execute(
        "COMMENT ON COLUMN webauthn_credentials.nickname IS "
        "'User-provided name for this credential'"
    )
    op.execute(
        "COMMENT ON COLUMN webauthn_credentials.backup_eligible IS "
        "'Whether credential can be backed up'"
    )
    op.execute(
        "COMMENT ON COLUMN webauthn_credentials.backup_state IS "
        "'Whether credential is currently backed up'"
    )

    op.execute(
        "COMMENT ON COLUMN webauthn_challenges.session_id IS 'Session or user ID for challenge'"
    )
    op.execute("COMMENT ON COLUMN webauthn_challenges.challenge IS 'Random challenge bytes'")
    op.execute(
        "COMMENT ON COLUMN webauthn_challenges.challenge_type IS 'registration or authentication'"
    )
    op.execute("COMMENT ON COLUMN webauthn_challenges.used IS 'Prevent challenge reuse'")


def downgrade() -> None:
    """Drop WebAuthn tables."""
    op.drop_index(op.f("ix_webauthn_challenges_expires_at"), table_name="webauthn_challenges")
    op.drop_index(op.f("ix_webauthn_challenges_session_id"), table_name="webauthn_challenges")
    op.drop_table("webauthn_challenges")

    op.drop_index(op.f("ix_webauthn_credentials_user_id"), table_name="webauthn_credentials")
    op.drop_table("webauthn_credentials")
