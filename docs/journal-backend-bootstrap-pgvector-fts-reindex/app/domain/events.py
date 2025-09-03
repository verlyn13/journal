from dataclasses import dataclass
from uuid import UUID

@dataclass(frozen=True, slots=True)
class EntryCreated:
    entry_id: UUID
    author_id: UUID
    title: str
