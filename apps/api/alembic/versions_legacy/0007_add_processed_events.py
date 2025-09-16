"""Add processed_events ledger for idempotent workers

Revision ID: 0007_add_processed_events
Revises: 0006_add_metrics_safe
Create Date: 2025-09-03 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "0007_add_processed_events"
down_revision = "0006_add_metrics_safe"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "processed_events",
        sa.Column("event_id", sa.UUID(), primary_key=True, nullable=False),
        sa.Column("processed_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("outcome", sa.String(), nullable=False),
        sa.Column("attempts", sa.Integer(), server_default=sa.text("1"), nullable=False),
    )
    op.create_index("ix_processed_events_processed_at", "processed_events", ["processed_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_processed_events_processed_at", table_name="processed_events")
    op.drop_table("processed_events")

