"""Add outbox retry fields and indexes (online-safe)

Revision ID: 0008_outbox_retry_fields
Revises: 0007_add_processed_events
Create Date: 2025-09-03 00:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0008_outbox_retry_fields"
down_revision = "0007_add_processed_events"
branch_labels = None
depends_on = None


from typing import Any


def _col_exists(conn: Any, table: str, column: str) -> bool:
    res = conn.exec_driver_sql(
        "SELECT 1 FROM information_schema.columns WHERE table_name=%s AND column_name=%s",
        (table, column),
    ).first()
    return res is not None


def upgrade() -> None:
    # Fail fast if locks can't be acquired
    op.execute("SET LOCAL lock_timeout = '5s'")
    op.execute("SET LOCAL statement_timeout = '30s'")

    conn = op.get_bind()

    # Add columns in online-safe steps (nullable first)
    if not _col_exists(conn, "events", "attempts"):
        op.add_column("events", sa.Column("attempts", sa.Integer(), nullable=True))
        op.execute("UPDATE events SET attempts = 0 WHERE attempts IS NULL")
        op.alter_column("events", "attempts", server_default="0")
        op.alter_column("events", "attempts", nullable=False)

    if not _col_exists(conn, "events", "next_attempt_at"):
        op.add_column("events", sa.Column("next_attempt_at", sa.DateTime(timezone=True), nullable=True))

    if not _col_exists(conn, "events", "last_error"):
        op.add_column("events", sa.Column("last_error", sa.Text(), nullable=True))

    if not _col_exists(conn, "events", "state"):
        op.add_column("events", sa.Column("state", sa.String(), nullable=True))
        op.execute("UPDATE events SET state = 'pending' WHERE state IS NULL")
        op.alter_column("events", "state", server_default="'pending'")
        op.alter_column("events", "state", nullable=False)

    # Indexes
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_events_next_attempt ON events(next_attempt_at) WHERE state='pending'"
    )
    op.execute("CREATE INDEX IF NOT EXISTS idx_events_state ON events(state)")


def downgrade() -> None:
    # Drop indexes first
    op.execute("DROP INDEX IF EXISTS idx_events_next_attempt")
    op.execute("DROP INDEX IF EXISTS idx_events_state")
    # Drop columns (safe in dev)
    with op.batch_alter_table("events") as batch:
        try:
            batch.drop_column("state")
        except Exception:
            pass
        try:
            batch.drop_column("last_error")
        except Exception:
            pass
        try:
            batch.drop_column("next_attempt_at")
        except Exception:
            pass
        try:
            batch.drop_column("attempts")
        except Exception:
            pass

