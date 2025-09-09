import pytest

from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.models import Entry
from app.infra.search_pgvector import hybrid_search, semantic_search, upsert_entry_embedding


@pytest.mark.integration()
@pytest.mark.asyncio()
async def test_vector_search_ranking(db_session: AsyncSession):
    # Seed three entries
    e1 = Entry(
        title="alpha", content="alpha only", author_id="11111111-1111-1111-1111-111111111111"
    )
    e2 = Entry(title="beta", content="beta only", author_id="11111111-1111-1111-1111-111111111111")
    e3 = Entry(
        title="alpha beta", content="both words", author_id="11111111-1111-1111-1111-111111111111"
    )
    db_session.add_all([e1, e2, e3])
    await db_session.flush()

    # Upsert embeddings deterministically for each
    await upsert_entry_embedding(db_session, e1.id, f"{e1.title} {e1.content}")
    await upsert_entry_embedding(db_session, e2.id, f"{e2.title} {e2.content}")
    await upsert_entry_embedding(db_session, e3.id, f"{e3.title} {e3.content}")

    # Hybrid search for "alpha" should rank alpha-containing docs first
    rows = await hybrid_search(db_session, q="alpha", k=3, alpha=0.6)
    titles = [r["title"] for r in rows]
    assert titles[0] in {"alpha", "alpha beta"}
    assert "beta" in titles[-1]


@pytest.mark.integration()
@pytest.mark.asyncio()
async def test_search_excludes_soft_deleted(db_session: AsyncSession):
    e1 = Entry(title="keep", content="live", author_id="11111111-1111-1111-1111-111111111111")
    e2 = Entry(
        title="gone",
        content="deleted",
        is_deleted=True,
        author_id="11111111-1111-1111-1111-111111111111",
    )
    db_session.add_all([e1, e2])
    await db_session.flush()
    await upsert_entry_embedding(db_session, e1.id, f"{e1.title} {e1.content}")
    await upsert_entry_embedding(db_session, e2.id, f"{e2.title} {e2.content}")

    rows = await semantic_search(db_session, q="deleted", k=5)
    assert all(r["title"] != "gone" for r in rows)
