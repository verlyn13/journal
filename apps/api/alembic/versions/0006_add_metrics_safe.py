"""Online-safe add version and metrics columns

Revision ID: 0006_add_metrics_safe
Revises: 0005_add_content_metrics
Create Date: 2025-01-03

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0006_add_metrics_safe"
down_revision: Union[str, None] = "0005_add_content_metrics"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add version and metrics columns in an online-safe manner."""
    # Fail fast instead of hanging on lock acquisition
    op.execute("SET LOCAL lock_timeout = '5s'")
    op.execute("SET LOCAL statement_timeout = '30s'")
    
    # 1) Add nullable columns first (short lock)
    _add_col_if_missing("entries", sa.Column("version", sa.Integer(), nullable=True))
    _add_col_if_missing("entries", sa.Column("word_count", sa.Integer(), nullable=True))
    _add_col_if_missing("entries", sa.Column("char_count", sa.Integer(), nullable=True))
    
    # 2) Backfill (tiny table => single UPDATE ok)
    op.execute("UPDATE entries SET version = 1 WHERE version IS NULL")
    op.execute("UPDATE entries SET word_count = 0 WHERE word_count IS NULL")
    op.execute("UPDATE entries SET char_count = 0 WHERE char_count IS NULL")
    
    # 3) Add defaults + NOT NULL (each acquires brief locks)
    op.alter_column("entries", "version", 
                    server_default="1", 
                    existing_type=sa.Integer())
    op.alter_column("entries", "version", 
                    nullable=False, 
                    existing_type=sa.Integer())
    
    op.alter_column("entries", "word_count", 
                    server_default="0", 
                    existing_type=sa.Integer())
    op.alter_column("entries", "word_count", 
                    nullable=False, 
                    existing_type=sa.Integer())
    
    op.alter_column("entries", "char_count", 
                    server_default="0", 
                    existing_type=sa.Integer())
    op.alter_column("entries", "char_count", 
                    nullable=False, 
                    existing_type=sa.Integer())


def downgrade() -> None:
    """Remove version and metrics columns."""
    op.drop_column("entries", "char_count")
    op.drop_column("entries", "word_count")
    op.drop_column("entries", "version")


def _add_col_if_missing(table: str, column: sa.Column) -> None:
    """Add column only if it doesn't already exist."""
    conn = op.get_bind()
    name = column.name
    
    # Check if column exists
    result = conn.exec_driver_sql(
        "SELECT 1 FROM information_schema.columns WHERE table_name=%s AND column_name=%s",
        (table, name)
    ).first()
    
    if result is None:
        op.add_column(table, column)
        print(f"[migration] Added column {table}.{name}")
    else:
        print(f"[migration] Column {table}.{name} already exists, skipping")