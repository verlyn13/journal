"""Add markdown dual storage columns

Revision ID: 0003
Revises: 0002
Create Date: 2025-09-02 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('entries', sa.Column('markdown_content', sa.Text(), nullable=True))
    op.add_column('entries', sa.Column('content_version', sa.Integer(), server_default=sa.text('1'), nullable=False))
    op.create_index('idx_entries_content_version', 'entries', ['content_version'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_entries_content_version', table_name='entries')
    op.drop_column('entries', 'content_version')
    op.drop_column('entries', 'markdown_content')

