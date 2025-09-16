import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.integration()
@pytest.mark.asyncio()
async def test_alembic_applied_schema(db_session: AsyncSession):
    # Vector extension exists
    ext = await db_session.execute(text("SELECT extname FROM pg_extension WHERE extname='vector'"))
    assert ext.scalar() == "vector"

    # Critical indexes exist
    idx_names = {
        "ix_entries_search_vector",
        "ix_entry_embeddings_embedding",
        "idx_entries_content_version",
    }
    res = await db_session.execute(
        text(
            "SELECT indexname FROM pg_indexes WHERE tablename='entries' OR tablename='entry_embeddings'"
        )
    )
    have = {row[0] for row in res.fetchall()}
    assert idx_names.issubset(have)
