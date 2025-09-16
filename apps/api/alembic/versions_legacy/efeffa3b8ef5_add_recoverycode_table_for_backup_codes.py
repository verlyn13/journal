"""Add RecoveryCode table for backup codes

Revision ID: efeffa3b8ef5
Revises: d0d871f401f2
Create Date: 2025-09-10 21:42:15.123456

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'efeffa3b8ef5'
down_revision = 'd0d871f401f2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create recovery_codes table
    op.create_table('recovery_codes',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('code_hash', sa.String(length=128), nullable=False),
        sa.Column('used', sa.Boolean(), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recovery_codes_user_id'), 'recovery_codes', ['user_id'], unique=False)


def downgrade() -> None:
    # Drop recovery_codes table
    op.drop_index(op.f('ix_recovery_codes_user_id'), table_name='recovery_codes')
    op.drop_table('recovery_codes')