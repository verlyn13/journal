See /home/verlyn13/Projects/verlyn13/journal/docs/journal-backend-bootstrap-pgvector-fts-reindex

## What I added

- **pgvector integration**

  - Switched Docker to `pgvector/pgvector:pg16`.

  - Alembic migration `0001_initial.py` that:

  - `CREATE EXTENSION vector`

  - Creates `entries` (with a generated `fts` column + GIN index)

  - Creates `event_store`

  - Creates `entry_embeddings (embedding vector(1536))` + IVFFlat index
- **Embedding provider abstraction**

  - `app/infra/embeddings.py` with `get_embedding(text)`:

  - `JOURNAL_EMBED_PROVIDER=fake` (default, deterministic, no network)

  - `JOURNAL_EMBED_PROVIDER=openai` (uses `OPENAI_API_KEY`, model via `JOURNAL_EMBED_MODEL`)
- **Hybrid + semantic search**

  - `app/infra/search_pgvector.py`: SQL for hybrid scoring and vector-only.

  - `app/api/v1/search.py`:

  - `GET  /api/v1/search?q=...&k=&alpha=` (hybrid: vector + FTS on title)

  - `POST /api/v1/search/semantic` with `{ "q": "...", "k": 10 }`

  - `POST /api/v1/entries/{entry_id}/embed` to upsert an embedding for an Entry.
- **GraphQL**

  - Extended `app/graphql/schema.py` with `searchEntries(q, k, alpha)` returning `SearchHit` (score, vecSim, ftsRank, entry).
  - Mounted at `/graphql`.

## Quickstart (from clean checkout)

```bash
# bring up infra (pgvector-enabled PG, Redis, NATS)
docker compose up -d db redis nats

# install deps (uv recommended)
uv venv
uv pip install -e .

# create schema
alembic upgrade head

# run server
fastapi dev app/main.py
```

### Try it

```bash
# 1) get a demo JWT
curl -s -X POST http://127.0.0.1:8000/api/v1/auth/login | jq

# 2) create an entry (use the 'access_token' from step 1)
TOKEN=... # paste
curl -s -X POST http://127.0.0.1:8000/api/v1/entries \
      -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
      -d '{"title":"Morning thoughts","content":{"text":"Coffee, code, and calculus."}}' | jq

# 3) embed the entry
ENTRY_ID=... # paste returned id
curl -s -X POST http://127.0.0.1:8000/api/v1/entries/$ENTRY_ID/embed | jq

# 4) hybrid search
curl -s "http://127.0.0.1:8000/api/v1/search?q=calculus&k=5&alpha=0.6" | jq

# 5) semantic search
curl -s -X POST http://127.0.0.1:8000/api/v1/search/semantic -H "Content-Type: application/json" \
      -d '{"q":"espresso and math", "k": 5}' | jq
```

### Notes & next steps

- Current FTS indexes **title only** for simplicity. If you want fuller JSON search, we can:

  - add a generated column `fts` using `jsonb_to_tsvector('english', content, '["string"]')` or
  - maintain a `content_text` column via triggers for robust indexing.
- We left the embedding dim at **1536**; set `JOURNAL_EMBED_DIM` to match your chosen model.
- GraphQL currently exposes search only; we can add mutations and subscriptions for live collab next.

Want me to upgrade FTS to index the JSON content blocks and add a proper “reindex all embeddings” job (Temporal or NATS consumers)?
