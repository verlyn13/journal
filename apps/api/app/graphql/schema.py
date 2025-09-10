import strawberry

from sqlalchemy.ext.asyncio import AsyncSession

from app.infra.db import get_session
from app.infra.search_pgvector import hybrid_search


@strawberry.type
class Entry:
    id: strawberry.ID
    author_id: strawberry.ID
    title: str
    content: str
    created_at: str
    updated_at: str
    is_deleted: bool


@strawberry.type
class SearchHit:
    entry: Entry
    score: float
    vec_sim: float | None = None
    fts_rank: float | None = None


async def _hybrid(s: AsyncSession, q: str, k: int, alpha: float) -> list[SearchHit]:
    rows = await hybrid_search(s, q=q, k=k, alpha=alpha)
    hits: list[SearchHit] = []
    for r in rows:
        e = Entry(
            id=strawberry.ID(str(r["id"])),
            author_id=strawberry.ID(str(r["author_id"])),
            title=r.get("title", ""),
            content=r.get("content") or "",
            created_at=str(r.get("created_at")),
            updated_at=str(r.get("updated_at")),
            is_deleted=bool(r.get("is_deleted", False)),
        )
        hits.append(
            SearchHit(
                entry=e,
                score=float(r.get("score") or 0.0),
                vec_sim=(r.get("vec_sim") if r.get("vec_sim") is not None else None),
                fts_rank=(r.get("fts_rank") if r.get("fts_rank") is not None else None),
            )
        )
    return hits


@strawberry.type
class Query:
    @strawberry.field
    async def search_entries(self, q: str, k: int = 10, alpha: float = 0.6) -> list[SearchHit]:  # noqa: PLR6301
        s: AsyncSession = await anext(get_session())
        try:
            return await _hybrid(s, q, k, alpha)
        finally:
            await s.close()


schema = strawberry.Schema(query=Query)
