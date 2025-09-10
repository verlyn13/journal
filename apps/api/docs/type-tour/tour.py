#!/usr/bin/env python3
"""
Interactive Tour of Our Type Safety Journey

Run with: python -m docs.type-tour.tour

This tour showcases our type safety patterns, decisions, and the wisdom
gained from reducing 78 errors to 3.
"""

import os
import sys
from pathlib import Path
from typing import Any


def clear_screen() -> None:
    """Clear the terminal screen."""
    os.system('cls' if os.name == 'nt' else 'clear')


def wait_for_input() -> None:
    """Wait for user to press Enter."""
    input("\n📍 Press Enter to continue...")


def print_section(title: str, content: str) -> None:
    """Print a formatted section."""
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")
    print(content)


def tour_stop_1_basic_typing() -> None:
    """Stop 1: Basic type annotations."""
    clear_screen()
    print_section(
        "🎯 Stop 1: Basic Type Annotations",
        """
We started with simple type hints:

📂 See: app/infra/sa_models.py

```python
# Before: Ambiguous types
event_data: Mapped[dict]  # What's in the dict?

# After: Explicit type parameters  
event_data: Mapped[dict[str, Any]]  # JSON data structure
```

LESSON: Always specify type parameters for generics.
Even dict[str, Any] is better than bare dict.
        """
    )
    wait_for_input()


def tour_stop_2_type_guards() -> None:
    """Stop 2: Type guards for Optional narrowing."""
    clear_screen()
    print_section(
        "🛡️ Stop 2: Type Guards Pattern",
        """
Our biggest breakthrough: Type Guards

📂 See: app/types/guards.py

```python
# The Anti-Pattern: Casting
user = cast(User, maybe_user)  # Lying to mypy!

# Our Pattern: Type Guards
def exists_guard(obj: T | None) -> TypeGuard[T]:
    return obj is not None

user = await session.get(User, user_id)
if not exists_guard(user):
    raise HTTPException(404)
# mypy KNOWS user is not None here!
```

LESSON: Type guards make narrowing explicit and reusable.
They're honest with the type checker.
        """
    )
    wait_for_input()


def tour_stop_3_protocols() -> None:
    """Stop 3: Protocols for duck typing."""
    clear_screen()
    print_section(
        "🦆 Stop 3: Protocol-Based Design",
        """
Protocols enable flexible, type-safe interfaces:

📂 See: app/types/utilities.py

```python
@runtime_checkable
class Timestamped(Protocol):
    created_at: datetime
    updated_at: datetime

def update_timestamp(obj: Timestamped) -> None:
    obj.updated_at = datetime.utcnow()

# Works with ANY object that has timestamps!
update_timestamp(user)
update_timestamp(entry)
update_timestamp(session)
```

LESSON: Protocols > inheritance for shared behavior.
If it walks like a duck and quacks like a duck...
        """
    )
    wait_for_input()


def tour_stop_4_boundary_patterns() -> None:
    """Stop 4: API boundary patterns."""
    clear_screen()
    print_section(
        "🌐 Stop 4: Boundary Type Safety",
        """
External APIs need special handling:

📂 See: app/infra/cookies.py

```python
# Problem: Settings return str, FastAPI wants Literal
samesite = settings.cookie_samesite  # str
response.set_cookie(..., samesite=samesite)  # Error!

# Solution: Validation at boundaries
def validate_cookie_samesite(value: str) -> CookieSameSite:
    if value not in ("lax", "strict", "none"):
        raise ValueError(f"Invalid: {value}")
    return value  # type: ignore[return-value]

samesite = validate_cookie_samesite(settings.cookie_samesite)
```

LESSON: Validate and transform at system boundaries.
Types can't cross network calls.
        """
    )
    wait_for_input()


def tour_stop_5_the_final_three() -> None:
    """Stop 5: The Final 3 - Our Monuments."""
    clear_screen()
    print_section(
        "🏛️ Stop 5: The Final 3 - Monuments to Pragmatism",
        """
These aren't bugs. They're teachers:

1️⃣ THE DEFENSIVE GUARD (search_pgvector.py:134)
   isinstance() check on typed parameter
   
   TEACHES: Defensive programming > type purity at boundaries
   
2️⃣ THE ORM PARADOX (backfill_markdown.py:33)
   SQLAlchemy column.is_(None) on Optional[str]
   
   TEACHES: Dynamic features can be more valuable than typing

WHY WE KEEP THEM:
- They document real engineering tensions
- They show where pragmatism wins
- They teach humility about type systems

96% with understanding > 100% with hacks
        """
    )
    wait_for_input()


def tour_stop_6_lessons_learned() -> None:
    """Stop 6: Lessons and wisdom."""
    clear_screen()
    print_section(
        "💡 Stop 6: Hard-Won Wisdom",
        """
What this journey taught us:

1. TYPE GRADUALLY
   Core → Boundaries → Scripts → Tests
   Strict where it matters, pragmatic at edges

2. DOCUMENT EVERYTHING
   Every type: ignore needs a comment
   Every pattern needs documentation
   Every decision needs rationale

3. PATTERNS > PERFECTION
   Build reusable patterns (guards, protocols)
   One good pattern eliminates many errors

4. BOUNDARIES ARE MESSY
   External APIs resist typing
   ORMs use descriptor magic
   That's okay - validate at runtime

5. ERRORS CAN BE FEATURES
   Some errors document important tensions
   Understanding > eliminating

REMEMBER: Types serve us, not vice versa.
        """
    )
    wait_for_input()


def tour_stop_7_resources() -> None:
    """Stop 7: Resources for going deeper."""
    clear_screen()
    print_section(
        "📚 Stop 7: Your Learning Path",
        """
Continue your type safety journey:

DOCUMENTATION:
📄 docs/typing-patterns.md - Our cookbook
📄 docs/adr/001-type-architecture.md - Our decisions
📄 docs/philosophy/type-safety-manifesto.md - Our beliefs

CODE TO STUDY:
📂 app/types/ - Our type utilities
📂 app/infra/auth.py - JWT type safety
📂 app/api/v1/stats.py - SQLAlchemy patterns

EXERCISES:
1. Add type guards to a new feature
2. Create a Protocol for a new pattern
3. Document why a type: ignore exists

EXTERNAL RESOURCES:
🔗 PEP 484 - Type Hints
🔗 PEP 544 - Protocols  
🔗 PEP 647 - TypeGuard
🔗 mypy documentation

Remember: Every type annotation is a chance to teach.
        """
    )
    wait_for_input()


def main() -> None:
    """Run the interactive tour."""
    clear_screen()
    print("""
    ╔══════════════════════════════════════════════════════════╗
    ║                                                          ║
    ║           🚀 TYPE SAFETY JOURNEY TOUR 🚀                ║
    ║                                                          ║
    ║              From 78 Errors to Wisdom                   ║
    ║                                                          ║
    ╚══════════════════════════════════════════════════════════╝
    
    Welcome to our interactive tour of type safety patterns!
    
    You'll visit 7 stops on our journey from chaos to clarity.
    Each stop teaches a key lesson we learned along the way.
    
    Ready to begin?
    """)
    
    wait_for_input()
    
    stops = [
        tour_stop_1_basic_typing,
        tour_stop_2_type_guards,
        tour_stop_3_protocols,
        tour_stop_4_boundary_patterns,
        tour_stop_5_the_final_three,
        tour_stop_6_lessons_learned,
        tour_stop_7_resources,
    ]
    
    for i, stop in enumerate(stops, 1):
        stop()
        if i < len(stops):
            print(f"\n    [{i}/{len(stops)}] Moving to next stop...")
    
    clear_screen()
    print("""
    ╔══════════════════════════════════════════════════════════╗
    ║                                                          ║
    ║                    🎉 TOUR COMPLETE! 🎉                 ║
    ║                                                          ║
    ║   You've seen our journey from 78 errors to wisdom.     ║
    ║                                                          ║
    ║   Remember: Type safety is a tool, not a religion.      ║
    ║             96% with understanding > 100% with hacks.   ║
    ║                                                          ║
    ║            Now go forth and type wisely! 🚀             ║
    ║                                                          ║
    ╚══════════════════════════════════════════════════════════╝
    """)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Tour interrupted. Come back anytime!")
        sys.exit(0)