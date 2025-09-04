# FastAPI Dependency Injection Analysis

## Overview
This document collects and summarizes all current FastAPI dependency injection usages across the codebase that need to be migrated to use the `Annotated[...]` wrapper pattern.

## FastAPI Version

description = "Modern FastAPI backend with pgvector, FTS, and event sourcing"
    "Framework :: FastAPI",
    "fastapi[standard]>=0.115.0",
    "strawberry-graphql[fastapi]>=0.235.0",
    "opentelemetry-instrumentation-fastapi>=0.47b0",

FastAPI version: >=0.115.0 (supports Annotated pattern)

## Endpoints Using Depends Without Annotated

### Format: `file:line | parameter_signature | type`

### admin.py
```
app/api/v1/admin.py:18
async def admin_ping(user_id: str = Depends(require_user)) -> dict[str, str]:
```

### admin.py
```
app/api/v1/admin.py:29
    user_id: str = Depends(require_user),
```

### admin.py
```
app/api/v1/admin.py:30
    db: AsyncSession = Depends(get_session)
```

### auth.py
```
app/api/v1/auth.py:94
async def get_me(user_id: str = Depends(get_current_user)) -> dict[str, str]:
```

### auth.py
```
app/api/v1/auth.py:109
async def logout(user_id: str = Depends(get_current_user)) -> dict[str, str]:
```

### entries.py
```
app/api/v1/entries.py:134
    user_id: str = Depends(require_user),
```

### entries.py
```
app/api/v1/entries.py:135
    s: AsyncSession = Depends(get_session)
```

### entries.py
```
app/api/v1/entries.py:156
    user_id: str = Depends(require_user),
```

### entries.py
```
app/api/v1/entries.py:157
    s: AsyncSession = Depends(get_session)
```

### entries.py
```
app/api/v1/entries.py:202
    user_id: str = Depends(require_user),
```

### entries.py
```
app/api/v1/entries.py:203
    s: AsyncSession = Depends(get_session)
```

### entries.py
```
app/api/v1/entries.py:232
    user_id: str = Depends(require_user),
```

### entries.py
```
app/api/v1/entries.py:233
    s: AsyncSession = Depends(get_session)
```

### entries.py
```
app/api/v1/entries.py:297
    user_id: str = Depends(require_user),
```

### entries.py
```
app/api/v1/entries.py:298
    s: AsyncSession = Depends(get_session)
```

### search.py
```
app/api/v1/search.py:19
async def search_hybrid(q: str, k: int = 10, alpha: float = 0.6, s: AsyncSession = Depends(get_session)) -> list[dict[str, Any]]:
```

### search.py
```
app/api/v1/search.py:40
async def search_semantic(body: dict, s: AsyncSession = Depends(get_session)) -> list[dict[str, Any]]:
```

### search.py
```
app/api/v1/search.py:61
async def embed_entry(entry_id: str, s: AsyncSession = Depends(get_session)) -> dict[str, str]:
```

### stats.py
```
app/api/v1/stats.py:34
    user_id: str = Depends(require_user),
```

### stats.py
```
app/api/v1/stats.py:35
    s: AsyncSession = Depends(get_session),
```


## Endpoints Using Query Without Annotated

### entries.py:131
```python
    skip: int = Query(0, ge=0, description="Number of entries to skip"),
```

### entries.py:132
```python
    limit: int = Query(20, ge=1, le=100, description="Maximum entries to return"),
```

### entries.py:133
```python
    offset: int | None = Query(None, ge=0, description="Legacy offset parameter"),
```

### entries.py:296
```python
    expected_version: int = Query(..., description="Expected version for optimistic locking"),
```


## Custom Dependency Functions

### Authentication Dependencies

17:def _utcnow() -> datetime:
21:def create_access_token(sub: str, scopes: list[str] | None = None) -> str:
36:def create_refresh_token(sub: str) -> str:
50:def require_user(creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> str:

### Database Dependencies

```python
# app/infra/db.py

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    sm = sessionmaker_for(build_engine())
    async with sm() as s:
```


## Test Import Analysis

### Checking if tests import these dependencies directly:

tests/api/test_admin.py
tests/conftest.py
tests/integration/test_embedding_worker_consolidated.py
tests/integration/test_embedding_worker_full.py
tests/unit/test_auth_claims.py


### Test Override Pattern
```python

    app.dependency_overrides[get_session] = override_get_session
    try:
        transport = ASGITransport(app=app)
--
        app.dependency_overrides.pop(get_session, None)
```


## Summary Statistics

### Total Occurrences Needing Migration:

- Depends() usage: app/api/v1/admin.py:3
app/api/v1/auth.py:2
app/api/v1/entries.py:10
app/api/v1/search.py:3
app/api/v1/stats.py:2
- Query() usage: app/api/v1/admin.py:0
app/api/v1/auth.py:0
app/api/v1/entries.py:4
app/api/v1/search.py:0
app/api/v1/stats.py:0
- Path() usage: app/api/v1/admin.py:0
app/api/v1/auth.py:0
app/api/v1/entries.py:0
app/api/v1/search.py:0
app/api/v1/stats.py:0
- Header() usage: app/api/v1/admin.py:0
app/api/v1/auth.py:0
app/api/v1/entries.py:0
app/api/v1/search.py:0
app/api/v1/stats.py:0
- Body() usage: app/api/v1/admin.py:0
app/api/v1/auth.py:0
app/api/v1/entries.py:0
app/api/v1/search.py:0
app/api/v1/stats.py:0


### Files Requiring Updates:
- `app/api/v1/admin.py` - 3 Depends
- `app/api/v1/auth.py` - 2 Depends
- `app/api/v1/entries.py` - 10 Depends, 4 Query
- `app/api/v1/search.py` - 3 Depends
- `app/api/v1/stats.py` - 2 Depends
- `app/infra/auth.py` - 1 Depends (in require_user function)

## Migration Pattern

### Before:
```python
from fastapi import Depends, Query

async def endpoint(
    user_id: str = Depends(require_user),
    db: AsyncSession = Depends(get_session),
    limit: int = Query(10, ge=1)
):
    ...
```

### After:
```python
from typing import Annotated
from fastapi import Depends, Query

async def endpoint(
    user_id: Annotated[str, Depends(require_user)],
    db: Annotated[AsyncSession, Depends(get_session)],
    limit: Annotated[int, Query(10, ge=1)]
):
    ...
```

## Impact Assessment

1. **Test Compatibility**: Tests use `app.dependency_overrides` which will continue to work with Annotated pattern
2. **Breaking Changes**: None - Annotated is backwards compatible
3. **Benefits**: 
   - Clearer type hints
   - Better IDE support
   - Follows FastAPI best practices for v0.95+
   - Satisfies FAST002 Ruff rule

## Recommended Approach

1. Update all imports to include `Annotated` from `typing`
2. Migrate all Depends, Query, Path, Header, Body usages to Annotated pattern
3. Run tests to ensure no breaking changes
4. Update any custom dependency functions if needed

