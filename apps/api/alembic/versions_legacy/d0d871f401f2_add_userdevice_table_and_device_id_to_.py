"""Add UserDevice table and device_id to user_sessions

Revision ID: d0d871f401f2
Revises: 0010_add_webauthn_tables
Create Date: 2025-09-10 21:38:32.065307

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "d0d871f401f2"
down_revision = "0010_add_webauthn_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create user_devices table
    op.create_table(
        "user_devices",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("device_name", sa.String(length=100), nullable=False),
        sa.Column("browser", sa.String(length=100), nullable=True),
        sa.Column("os", sa.String(length=100), nullable=True),
        sa.Column("location_region", sa.String(length=100), nullable=True),
        sa.Column("trusted", sa.Boolean(), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_user_devices_user_id"), "user_devices", ["user_id"], unique=False)

    # Add device_id column to user_sessions
    op.add_column(
        "user_sessions", sa.Column("device_id", postgresql.UUID(as_uuid=True), nullable=True)
    )
    op.create_foreign_key(
        "fk_user_sessions_device_id",
        "user_sessions",
        "user_devices",
        ["device_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index(
        op.f("ix_user_sessions_device_id"), "user_sessions", ["device_id"], unique=False
    )


def downgrade() -> None:
    # Remove device_id from user_sessions
    op.drop_index(op.f("ix_user_sessions_device_id"), table_name="user_sessions")
    op.drop_constraint("fk_user_sessions_device_id", "user_sessions", type_="foreignkey")
    op.drop_column("user_sessions", "device_id")

    # Drop user_devices table
    op.drop_index(op.f("ix_user_devices_user_id"), table_name="user_devices")
    op.drop_table("user_devices")
