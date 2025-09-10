# Type Patterns Cookbook

A collection of common type patterns and their solutions in the Journal API.

## Pattern 1: Optional Narrowing with Type Guards

### The Challenge
Database queries return `Optional[Model]` but we need to safely access model attributes.

### The Anti-Pattern
```python
# ❌ Bad: Cast without validation
from typing import cast

user = await session.get(User, user_id)
user = cast(User, user)  # Lying to type checker!
print(user.email)  # Could crash at runtime
```

### The Solution
```python
# ✅ Good: Type guard with validation
from app.types.guards import exists_guard, get_or_404

# Option 1: Explicit guard
user = await session.get(User, user_id)
if not exists_guard(user):
    raise HTTPException(404)
print(user.email)  # Safe - mypy knows user is not None

# Option 2: Helper that guarantees non-None
user = await get_or_404(session, User, user_id)
print(user.email)  # Safe - return type is User, not Optional[User]
```

### Real Usage
- [app/api/v1/entries.py:217](../app/api/v1/entries.py#L217)
- [app/types/guards.py:89](../app/types/guards.py#L89)

## Pattern 2: Generic Type Parameters

### The Challenge
Using `dict` without type parameters leads to `Any` contamination.

### The Anti-Pattern
```python
# ❌ Bad: Untyped dict
event_data: dict = {"key": "value"}  # No type checking
value = event_data["wrong_key"]  # No error at type-check time
```

### The Solution
```python
# ✅ Good: Explicit type parameters
from typing import Any

# For JSON data (flexible structure)
event_data: dict[str, Any] = json.loads(payload)

# For known structure
config: dict[str, str | int | bool] = {
    "host": "localhost",
    "port": 5432,
    "debug": True
}

# Type alias for reuse
from app.types.utilities import JSONDict
data: JSONDict = {"flexible": "json", "nested": {"values": [1, 2, 3]}}
```

### Real Usage
- [app/infra/sa_models.py:90](../app/infra/sa_models.py#L90)
- [app/types/utilities.py:13](../app/types/utilities.py#L13)

## Pattern 3: Literal Types for API Contracts

### The Challenge
FastAPI expects `Literal` types but settings return `str`.

### The Anti-Pattern
```python
# ❌ Bad: String where Literal expected
samesite = os.getenv("COOKIE_SAMESITE", "lax")  # type: str
response.set_cookie(..., samesite=samesite)  # Error: expected Literal
```

### The Solution
```python
# ✅ Good: Validation and casting
from app.types.utilities import validate_cookie_samesite

samesite = validate_cookie_samesite(os.getenv("COOKIE_SAMESITE", "lax"))
response.set_cookie(..., samesite=samesite)  # Type-safe!
```

### Real Usage
- [app/infra/cookies.py:25](../app/infra/cookies.py#L25)
- [app/types/utilities.py:138](../app/types/utilities.py#L138)

## Pattern 4: Protocol-Based Duck Typing

### The Challenge
Multiple models share common patterns but don't inherit from same base.

### The Anti-Pattern
```python
# ❌ Bad: Duplicated code for each model
def update_user_timestamp(user: User) -> None:
    user.updated_at = datetime.utcnow()

def update_entry_timestamp(entry: Entry) -> None:
    entry.updated_at = datetime.utcnow()  # Duplicate logic!
```

### The Solution
```python
# ✅ Good: Protocol for shared behavior
from app.types.utilities import Timestamped, update_timestamp

def touch_any_model(obj: Timestamped) -> None:
    """Works with any object that has timestamps."""
    update_timestamp(obj)

# Works with User, Entry, Session, or any timestamped model
touch_any_model(user)
touch_any_model(entry)
```

### Real Usage
- [app/types/utilities.py:38](../app/types/utilities.py#L38)

## Pattern 5: Type-Safe JWT Claims

### The Challenge
JWT claims are `dict[str, Any]` but we need typed access.

### The Anti-Pattern
```python
# ❌ Bad: Accessing claims without type safety
decoded = jwt.decode(token, secret, algorithms=["HS256"])
user_id = decoded["sub"]  # type: Any
scopes = decoded.get("scopes", [])  # type: Any
```

### The Solution
```python
# ✅ Good: Typed wrapper for JWT claims
from app.types.utilities import TypedJWT

decoded = jwt.decode(token, secret, algorithms=["HS256"])
jwt_claims = TypedJWT(decoded)
user_id = jwt_claims.subject  # type: str (with validation)
scopes = jwt_claims.scopes    # type: list[str]
```

### Real Usage
- [app/infra/auth.py:82](../app/infra/auth.py#L82)
- [app/types/utilities.py:187](../app/types/utilities.py#L187)

## Pattern 6: SQLAlchemy Boolean Comparisons

### The Challenge
SQLAlchemy requires `==` for SQL generation, but linters complain.

### The Anti-Pattern
```python
# ❌ Bad: Python-style boolean check
query = select(Entry).where(not Entry.is_deleted)  # Generates wrong SQL!
```

### The Solution
```python
# ✅ Good: SQLAlchemy comparison with noqa
query = select(Entry).where(Entry.is_deleted == False)  # noqa: E712
# The noqa comment explains this is intentional for SQL generation
```

### Real Usage
- [app/services/entry_service.py:66](../app/services/entry_service.py#L66)
- [app/api/v1/stats.py:91](../app/api/v1/stats.py#L91)

## Common Gotchas

### Gotcha 1: Optional in Function Defaults
```python
# ❌ Confusing: Optional[T] vs T | None with defaults
def process(value: Optional[str] = None):  # Old style
    pass

# ✅ Clear: Explicit union type
def process(value: str | None = None):  # Python 3.10+ style
    pass
```

### Gotcha 2: Type Ignore Scope
```python
# ❌ Bad: Broad type ignore
result = unsafe_call()  # type: ignore

# ✅ Good: Specific ignore with reason
# Library X doesn't provide types - tracked in issue #123
result = unsafe_call()  # type: ignore[no-untyped-call]
```

### Gotcha 3: Protocol vs ABC
```python
# ❌ Restrictive: Requires inheritance
from abc import ABC, abstractmethod

class Timestamped(ABC):
    @abstractmethod
    def get_updated_at(self) -> datetime:
        pass

# ✅ Flexible: Structural typing
from typing import Protocol

class Timestamped(Protocol):
    updated_at: datetime  # Any class with this attribute matches
```

## Type Checking Checklist

Before committing code, ensure:

- [ ] No `type: ignore` without specific error code and comment
- [ ] All functions have return type annotations
- [ ] Dict and list types have parameters (`dict[K, V]`, `list[T]`)
- [ ] Optional narrowing uses type guards, not casts
- [ ] Protocols used for shared behavior patterns
- [ ] Literal types used where APIs require them
- [ ] No `Any` without justification in comment

## Learning Resources

- [PEP 484 - Type Hints](https://www.python.org/dev/peps/pep-0484/)
- [PEP 544 - Protocols](https://www.python.org/dev/peps/pep-0544/)
- [PEP 647 - TypeGuard](https://www.python.org/dev/peps/pep-0647/)
- [mypy Documentation](https://mypy.readthedocs.io/)
- [Python Type Checking Guide](https://realpython.com/python-type-checking/)