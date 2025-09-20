"""Add full-text search and vector indexes

Revision ID: 0002
Revises: 0001
Create Date: 2025-09-01 12:01:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Convert embedding column to proper pgvector type
    op.execute("ALTER TABLE entry_embeddings ALTER COLUMN embedding TYPE vector(1536)")

    # Add FTS generated column to entries
    op.add_column(
        "entries",
        sa.Column(
            "search_vector",
            postgresql.TSVECTOR(),
            sa.Computed(
                "to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))",
                persisted=True,
            ),
            nullable=True,
        ),
    )

    # Create GIN index for full-text search
    op.create_index(
        "ix_entries_search_vector", "entries", ["search_vector"], postgresql_using="gin"
    )

    # Create IVFFlat index for vector similarity search
    # Note: IVFFlat requires data to be present for training, so we'll create it as a regular index first
    op.create_index(
        "ix_entry_embeddings_embedding",
        "entry_embeddings",
        ["embedding"],
        postgresql_using="ivfflat",
        postgresql_with={"lists": 100},
        postgresql_ops={"embedding": "vector_cosine_ops"},
    )

    # Add index for common query patterns
    op.create_index(
        "ix_entries_author_created", "entries", ["author_id", "created_at"], unique=False
    )
    op.create_index(
        "ix_entries_not_deleted_created",
        "entries",
        ["created_at"],
        postgresql_where=sa.text("is_deleted = false"),
    )


def downgrade() -> None:
    op.drop_index("ix_entries_not_deleted_created", table_name="entries")
    op.drop_index("ix_entries_author_created", table_name="entries")
    op.drop_index("ix_entry_embeddings_embedding", table_name="entry_embeddings")
    op.drop_index("ix_entries_search_vector", table_name="entries")
    op.drop_column("entries", "search_vector")
    op.execute("ALTER TABLE entry_embeddings ALTER COLUMN embedding TYPE float[]")
