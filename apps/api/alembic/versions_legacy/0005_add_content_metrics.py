"""Add content metrics fields

Revision ID: 0005_add_content_metrics
Revises: 0004_add_version_lock
Create Date: 2025-01-15 10:01:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0005_add_content_metrics"
down_revision = "0004_add_version_lock"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add word_count and char_count columns."""
    # Check if columns exist first
    conn = op.get_bind()

    # Add word_count if missing
    result = conn.exec_driver_sql(
        "SELECT 1 FROM information_schema.columns WHERE table_name=%s AND column_name=%s",
        ("entries", "word_count"),
    ).first()
    if result is None:
        op.add_column(
            "entries", sa.Column("word_count", sa.Integer(), nullable=False, server_default="0")
        )
        op.alter_column("entries", "word_count", server_default=None)

    # Add char_count if missing
    result = conn.exec_driver_sql(
        "SELECT 1 FROM information_schema.columns WHERE table_name=%s AND column_name=%s",
        ("entries", "char_count"),
    ).first()
    if result is None:
        op.add_column(
            "entries", sa.Column("char_count", sa.Integer(), nullable=False, server_default="0")
        )
        op.alter_column("entries", "char_count", server_default=None)


def downgrade() -> None:
    """Remove content metrics columns."""
    op.drop_column("entries", "word_count")
    op.drop_column("entries", "char_count")
