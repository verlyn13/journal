from __future__ import annotations

# Standard library imports
from uuid import UUID
from typing import Optional, Literal, Any, Dict

# Third-party imports
from fastapi import APIRouter, Depends, HTTPException, Request, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

# Local imports
from app.infra.auth import require_user
from app.infra.db import get_session
from app.infra.models import Entry
from app.infra.repository import EntryRepository, NotFound, Conflict
from app.infra.conversion import markdown_to_html
from app.infra.metrics import extract_text_for_metrics, count_words_chars
from app.infra.auto_embed import ensure_embedding_for_entry
from app.services.entry_service import create_entry, list_entries, get_entry_by_id


router = APIRouter(prefix="/entries", tags=["entries"])


# ==============================
# Request Models
# ==============================

class EntryCreate(BaseModel):
    title: str = Field(min_length=1)
    content: Optional[str] = None
    markdown_content: Optional[str] = None
    content_version: int = 1


class EntryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    markdown_content: Optional[str] = None
    content_version: Optional[int] = None
    expected_version: int = Field(..., description="Expected version for optimistic locking")


class ContentBlock(BaseModel):
    html: Optional[str] = None
    markdown: Optional[str] = None
    format_preference: Literal["html", "markdown"] = "html"
    version: int = 2


class EntryResponse(BaseModel):
    id: UUID
    title: str
    content_block: ContentBlock
    metrics: Dict[str, int]
    # Legacy fields for backward compatibility
    content: Optional[str] = Field(None, description="LEGACY - use content_block")
    markdown_content: Optional[str] = None
    word_count: Optional[int] = None
    char_count: Optional[int] = None
    version: int
    author_id: UUID
    created_at: Any
    updated_at: Any
    is_deleted: bool
    content_version: int
    editor_mode: Literal["html", "markdown"] = "html"


def _prefer_markdown(request: Request) -> bool:
    fmt = (
        request.headers.get('X-Editor-Mode')
        or request.headers.get('X-Content-Format')
        or request.headers.get('X-Client-Editor')
    )
    return (fmt or '').lower() == 'markdown'


def _entry_response(row: Entry, prefer_md: bool = False) -> dict:
    """Create stable entry response with backward compatibility."""
    editor_mode: Literal['html','markdown'] = 'markdown' if prefer_md else 'html'
    
    # Create structured content block
    content_block = ContentBlock(
        html=row.content,
        markdown=row.markdown_content,
        format_preference="markdown" if prefer_md and row.markdown_content else "html",
        version=row.content_version
    )
    
    # Legacy content field for backward compatibility
    legacy_content = row.markdown_content if prefer_md and row.markdown_content else row.content
    
    # Create response using Pydantic model
    response = EntryResponse(
        id=row.id,
        title=row.title,
        content_block=content_block,
        metrics={
            "word_count": row.word_count or 0,
            "char_count": row.char_count or 0
        },
        # Legacy fields
        content=legacy_content,
        markdown_content=row.markdown_content,
        word_count=row.word_count,
        char_count=row.char_count,
        version=row.version,
        author_id=row.author_id,
        created_at=row.created_at,
        updated_at=row.updated_at,
        is_deleted=row.is_deleted,
        content_version=row.content_version,
        editor_mode=editor_mode
    )
    
    return response.model_dump()


@router.get("")
async def get_entries(
    request: Request,
    # Support both skip and offset for pagination
    skip: int = Query(0, ge=0, description="Number of entries to skip"),
    limit: int = Query(20, ge=1, le=100, description="Maximum entries to return"),
    offset: Optional[int] = Query(None, ge=0, description="Legacy offset parameter"),
    user_id: str = Depends(require_user),
    s: AsyncSession = Depends(get_session)
):
    """List entries with pagination support.
    
    Supports both 'skip' (preferred) and 'offset' (legacy) parameters.
    """
    # Use offset if provided (legacy support), otherwise use skip
    start = offset if offset is not None else skip
    
    rows = await list_entries(s, limit=limit, offset=start)
    prefer_md = _prefer_markdown(request)
    return [_entry_response(r, prefer_md) for r in rows]


@router.post("", status_code=201)
async def post_entry(
    body: EntryCreate, 
    request: Request, 
    user_id: str = Depends(require_user), 
    s: AsyncSession = Depends(get_session)
):
    """Create a new entry with automatic embedding generation."""
    html_content = body.content or ""
    md_content = body.markdown_content
    # Default to 2 when markdown is provided without explicit version
    version = body.content_version if body.content_version is not None else (2 if md_content is not None else 1)
    
    # Generate HTML from markdown when markdown is provided
    if md_content is not None:
        html_content = markdown_to_html(md_content)
    
    # Calculate metrics
    text_for_metrics = extract_text_for_metrics(html_content, md_content)
    word_count, char_count = count_words_chars(text_for_metrics)
    
    # Create entry with repository pattern
    repo = EntryRepository(s)
    entry_data = {
        "author_id": UUID(user_id),
        "title": body.title,
        "content": html_content,
        "markdown_content": md_content,
        "content_version": version,
        "word_count": word_count,
        "char_count": char_count
    }
    
    entry = await repo.create(entry_data)
    await s.commit()
    
    # Generate embedding after commit
    await ensure_embedding_for_entry(entry, s)
    
    return _entry_response(entry, _prefer_markdown(request))


@router.get("/{entry_id}")
async def get_entry(
    entry_id: str, 
    request: Request, 
    user_id: str = Depends(require_user), 
    s: AsyncSession = Depends(get_session)
):
    """Get a single entry by ID."""
    try:
        eid = UUID(entry_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    repo = EntryRepository(s)
    entry = await repo.get_by_id(eid)
    
    if not entry or entry.is_deleted:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    return _entry_response(entry, _prefer_markdown(request))


@router.put("/{entry_id}")
async def update_entry(
    entry_id: str,
    body: EntryUpdate,
    request: Request,
    user_id: str = Depends(require_user),
    s: AsyncSession = Depends(get_session)
):
    """Update entry with optimistic locking."""
    try:
        eid = UUID(entry_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    repo = EntryRepository(s)
    
    # Prepare update data from body (excluding control field)
    update_data = body.model_dump(exclude={"expected_version"}, exclude_unset=True)

    # If markdown is provided, it takes priority and always generates HTML
    if body.markdown_content is not None:
        update_data["content"] = markdown_to_html(body.markdown_content)
        # Default content_version to 2 for markdown when not explicitly provided
        if "content_version" not in update_data or update_data["content_version"] is None:
            update_data["content_version"] = 2
    
    # Update metrics if content changed (HTML and/or markdown)
    if "content" in update_data or "markdown_content" in update_data:
        text_for_metrics = extract_text_for_metrics(
            update_data.get("content"), 
            update_data.get("markdown_content")
        )
        word_count, char_count = count_words_chars(text_for_metrics)
        update_data["word_count"] = word_count
        update_data["char_count"] = char_count
    
    try:
        entry = await repo.update_entry(eid, update_data, body.expected_version)
        await s.commit()
        
        # Generate embedding after successful update
        if "content" in update_data or "markdown_content" in update_data:
            await ensure_embedding_for_entry(entry, s)
        
        return _entry_response(entry, _prefer_markdown(request))
        
    except NotFound:
        raise HTTPException(status_code=404, detail="Entry not found")
    except Conflict as c:
        raise HTTPException(
            status_code=409,
            detail={
                "message": str(c),
                "expected_version": c.expected,
                "actual_version": c.actual
            }
        )


@router.delete("/{entry_id}", status_code=204)
async def delete_entry(
    entry_id: str,
    expected_version: int = Query(..., description="Expected version for optimistic locking"),
    user_id: str = Depends(require_user),
    s: AsyncSession = Depends(get_session)
):
    """Soft delete entry with optimistic locking.

    Returns 204 No Content on success to match API expectations.
    """
    try:
        eid = UUID(entry_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Entry not found")

    repo = EntryRepository(s)

    try:
        await repo.soft_delete(eid, expected_version)
        await s.commit()
        # No response body for 204
        return None

    except NotFound:
        raise HTTPException(status_code=404, detail="Entry not found")
    except Conflict as c:
        raise HTTPException(
            status_code=409,
            detail={
                "message": str(c),
                "expected_version": c.expected,
                "actual_version": c.actual,
            },
        )


# Removed duplicate PUT and DELETE routes in favor of optimistic-locking variants above.
