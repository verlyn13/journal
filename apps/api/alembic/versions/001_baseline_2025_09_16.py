"""Baseline schema - Journal Application 2025-09-16

Forward-only baseline migration for Supabase compatibility.
Creates complete schema from empty database.

Revision ID: 001_baseline_2025_09_16
Revises:
Create Date: 2025-09-16 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_baseline_2025_09_16'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create complete schema from empty database - Supabase compatible."""

    # =========================================================================
    # EXTENSIONS (create first, required for data types)
    # =========================================================================

    # Enable pgvector extension for embeddings (Supabase supported)
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # Enable additional extensions for full-text search
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute("CREATE EXTENSION IF NOT EXISTS btree_gin")

    # =========================================================================
    # CORE TABLES
    # =========================================================================

    # Users table
    op.create_table('users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('is_verified', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username')
    )

    # User sessions table
    op.create_table('user_sessions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('token_hash', sa.String(length=255), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_accessed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token_hash')
    )

    # Journal entries table
    op.create_table('entries',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('markdown_content', sa.Text(), nullable=True),
        sa.Column('author_id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('word_count', sa.Integer(), nullable=True),
        sa.Column('char_count', sa.Integer(), nullable=True),
        sa.Column('version', sa.Integer(), server_default=sa.text('1'), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Add full-text search generated column
    op.execute("""
        ALTER TABLE entries
        ADD COLUMN search_vector tsvector
        GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))) STORED
    """)

    # Entry embeddings table (for semantic search)
    op.create_table('entry_embeddings',
        sa.Column('entry_id', sa.UUID(), nullable=False),
        sa.Column('embedding', postgresql.ARRAY(sa.Float()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['entry_id'], ['entries.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('entry_id')
    )

    # Convert embedding column to pgvector type
    op.execute("ALTER TABLE entry_embeddings ALTER COLUMN embedding TYPE vector(1536)")

    # Event store table for CQRS pattern
    op.create_table('events',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('aggregate_id', sa.UUID(), nullable=False),
        sa.Column('aggregate_type', sa.String(), nullable=False),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('event_data', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('occurred_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('state', sa.String(length=20), server_default=sa.text("'pending'"), nullable=False),
        sa.Column('attempts', sa.Integer(), server_default=sa.text('0'), nullable=False),
        sa.Column('next_attempt_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_error', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Processed events ledger for idempotent workers
    op.create_table('processed_events',
        sa.Column('event_id', sa.UUID(), nullable=False),
        sa.Column('worker_id', sa.String(length=100), nullable=False),
        sa.Column('processed_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('event_id', 'worker_id')
    )

    # WebAuthn credentials table
    op.create_table('webauthn_credentials',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('public_key', sa.Text(), nullable=False),
        sa.Column('sign_count', sa.Integer(), server_default=sa.text('0'), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # WebAuthn challenges table (temporary storage)
    op.create_table('webauthn_challenges',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('challenge', sa.String(length=255), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('session_id', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # User devices table
    op.create_table('user_devices',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('device_name', sa.String(length=100), nullable=False),
        sa.Column('device_type', sa.String(length=50), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('last_ip', sa.String(length=45), nullable=True),
        sa.Column('is_trusted', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_seen_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Recovery codes table for backup authentication
    op.create_table('recovery_codes',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('code_hash', sa.String(length=255), nullable=False),
        sa.Column('used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Audit log table
    op.create_table('audit_log',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('resource_type', sa.String(length=50), nullable=True),
        sa.Column('resource_id', sa.String(length=255), nullable=True),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    # Deletion requests table for GDPR compliance
    op.create_table('deletion_requests',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('requested_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=20), server_default=sa.text("'pending'"), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # =========================================================================
    # INDEXES
    # =========================================================================

    # Users indexes
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=False)
    op.create_index(op.f('ix_users_created_at'), 'users', ['created_at'], unique=False)

    # User sessions indexes
    op.create_index(op.f('ix_user_sessions_user_id'), 'user_sessions', ['user_id'], unique=False)
    op.create_index(op.f('ix_user_sessions_expires_at'), 'user_sessions', ['expires_at'], unique=False)

    # Entries indexes
    op.create_index(op.f('ix_entries_author_id'), 'entries', ['author_id'], unique=False)
    op.create_index(op.f('ix_entries_created_at'), 'entries', ['created_at'], unique=False)
    op.create_index(op.f('ix_entries_is_deleted'), 'entries', ['is_deleted'], unique=False)

    # Compound indexes for common query patterns
    op.create_index('ix_entries_author_created', 'entries', ['author_id', 'created_at'], unique=False)
    op.create_index('ix_entries_not_deleted_created', 'entries', ['created_at'],
                   postgresql_where=sa.text('is_deleted = false'))
    op.create_index('idx_entries_content_version', 'entries', ['version'], unique=False)

    # Full-text search indexes
    op.create_index('ix_entries_search_vector', 'entries', ['search_vector'], postgresql_using='gin')

    # Vector similarity indexes (IVFFlat for now, can be upgraded to HNSW later)
    op.create_index('ix_entry_embeddings_embedding', 'entry_embeddings', ['embedding'],
                   postgresql_using='ivfflat',
                   postgresql_with={'lists': 100},
                   postgresql_ops={'embedding': 'vector_cosine_ops'})

    # Events indexes
    op.create_index(op.f('ix_events_aggregate_id'), 'events', ['aggregate_id'], unique=False)
    op.create_index(op.f('ix_events_event_type'), 'events', ['event_type'], unique=False)
    op.create_index(op.f('ix_events_occurred_at'), 'events', ['occurred_at'], unique=False)
    op.create_index(op.f('ix_events_published_at'), 'events', ['published_at'], unique=False)
    op.create_index('idx_events_state', 'events', ['state'], unique=False)
    op.create_index('idx_events_next_attempt', 'events', ['next_attempt_at'],
                   postgresql_where=sa.text("state = 'pending'"))

    # WebAuthn indexes
    op.create_index(op.f('ix_webauthn_credentials_user_id'), 'webauthn_credentials', ['user_id'], unique=False)
    op.create_index(op.f('ix_webauthn_challenges_session_id'), 'webauthn_challenges', ['session_id'], unique=False)
    op.create_index(op.f('ix_webauthn_challenges_expires_at'), 'webauthn_challenges', ['expires_at'], unique=False)

    # User devices indexes
    op.create_index(op.f('ix_user_devices_user_id'), 'user_devices', ['user_id'], unique=False)

    # Recovery codes indexes
    op.create_index(op.f('ix_recovery_codes_user_id'), 'recovery_codes', ['user_id'], unique=False)

    # Audit log indexes
    op.create_index(op.f('ix_audit_log_user_id'), 'audit_log', ['user_id'], unique=False)
    op.create_index(op.f('ix_audit_log_created_at'), 'audit_log', ['created_at'], unique=False)


def downgrade() -> None:
    """No downgrades supported in forward-only baseline.

    For rollback, use database snapshots or create new forward migration.
    """
    raise NotImplementedError("Forward-only migration - no downgrade supported")