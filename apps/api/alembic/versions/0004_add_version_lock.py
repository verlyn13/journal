"""Add version column for optimistic locking

Revision ID: 0004_add_version_lock
Revises: 0003
Create Date: 2025-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0004_add_version_lock"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade():
    """Add version column with default value of 1 for optimistic locking."""
    op.add_column("entries", sa.Column("version", sa.Integer(), nullable=False, server_default="1"))
    # Remove server default after adding column
    op.alter_column("entries", "version", server_default=None)


def downgrade():
    """Remove version column."""
    op.drop_column("entries", "version")