"""Enable pgvector extension and create base tables

Revision ID: 0001
Revises: 
Create Date: 2025-09-01 12:00:00.000000

"""
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable pgvector extension
    print("[migration 0001] Creating pgvector extension")
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # Create entries table
    print("[migration 0001] Creating entries table")
    op.create_table('entries',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('author_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('word_count', sa.Integer(), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_entries_author_id'), 'entries', ['author_id'], unique=False)
    op.create_index(op.f('ix_entries_created_at'), 'entries', ['created_at'], unique=False)
    op.create_index(op.f('ix_entries_is_deleted'), 'entries', ['is_deleted'], unique=False)

    # Create events table for event store
    op.create_table('events',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('aggregate_id', sa.UUID(), nullable=False),
        sa.Column('aggregate_type', sa.String(), nullable=False),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('event_data', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('occurred_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_events_aggregate_id'), 'events', ['aggregate_id'], unique=False)
    op.create_index(op.f('ix_events_event_type'), 'events', ['event_type'], unique=False)
    op.create_index(op.f('ix_events_occurred_at'), 'events', ['occurred_at'], unique=False)
    op.create_index(op.f('ix_events_published_at'), 'events', ['published_at'], unique=False)

    # Create entry_embeddings table with pgvector
    op.create_table('entry_embeddings',
        sa.Column('entry_id', sa.UUID(), nullable=False),
        sa.Column('embedding', postgresql.ARRAY(sa.Float()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['entry_id'], ['entries.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('entry_id')
    )


def downgrade() -> None:
    op.drop_table('entry_embeddings')
    op.drop_table('events')
    op.drop_table('entries')
    op.execute("DROP EXTENSION IF EXISTS vector")
