---
id: philosophy-type-safety-manifesto
title: Our Type Safety Manifesto
description: Documentation for Journal application
type: api
created: '2025-09-17'
updated: '2025-09-17'
author: Journal Team
tags:
- /
- home
- verlyn13
- projects
- journal
priority: 2
status: current
visibility: public
schema_version: v1
version: 1.0.0
---

# Our Type Safety Manifesto

## We Believe

- **Type safety is a design tool**, not just error prevention
- **96% type safety with understanding** > 100% with hacks
- **Every type annotation should teach something** about intent
- **Errors at boundaries are teachers**, not failures
- **Pragmatism over purity** when they conflict

## We Accept

- **Some patterns resist typing** - and that's a feature, not a bug
- **Runtime validation complements static typing** - belt and suspenders
- **Perfect is the enemy of excellent** - ship robust code, not perfect types
- **Library boundaries are messy** - ORMs, async contexts, and external APIs will challenge types
- **Types are documentation** - they communicate intent to humans first, compilers second

## We Reject

- **`type: ignore` without investigation** - understand before suppressing
- **`Any` without justification** - be explicit about flexibility
- **Casting to avoid understanding** - `cast()` is a lie to the compiler
- **Type gymnastics over clarity** - if the type is more complex than the code, simplify
- **Blindly chasing 0 errors** - some errors are worth keeping

## Our Edge Cases (The Final 3)

### Error 1: The Defensive Boundary Guard
**Location**: `search_pgvector.py:134` - isinstance check on typed parameter  
**We Choose**: Keep with documentation  
**Because**: External API boundaries need defensive programming  
**This Teaches**: Type purity yields to operational resilience at system boundaries

### Errors 2-3: The ORM Descriptor Paradox  
**Location**: `backfill_markdown.py:33` - SQLAlchemy column `.is_(None)`  
**We Choose**: Document as known limitation  
**Because**: SQLAlchemy's descriptor magic enables powerful patterns that static typing cannot model  
**This Teaches**: Dynamic language features can be more valuable than type safety

## Our Principles

### 1. Graduated Type Strictness
```python
# Strict at the core
app/domain/  # 100% typed, no compromises

# Pragmatic at boundaries  
app/infra/   # 95% typed, some edge cases
app/api/     # 95% typed, external contracts

# Flexible at edges
scripts/     # 90% typed, operational tools
tests/       # 80% typed, test clarity > types
```

### 2. Type Errors as Documentation
Every suppressed error must teach:
```python
# BAD: Lazy ignore
result = something()  # type: ignore

# GOOD: Educational ignore
# SQLAlchemy descriptor: class attribute is InstrumentedAttribute,
# instance attribute is Optional[str]. Correct ORM pattern.
Entry.markdown_content.is_(None)  # type: ignore[union-attr]
```

### 3. Types as Communication
Types should make code self-documenting:
```python
# Unclear types
def process(data: dict) -> dict:
    ...

# Clear intent
JSONDict = dict[str, Any]
def process(data: JSONDict) -> JSONDict:
    ...
```

### 4. Boundary Validation Pattern
Where types can't guarantee safety, validate:
```python
def api_endpoint(data: JSONDict) -> JSONDict:
    # Types check structure
    # Runtime validates values
    validated = SecuritySchema.parse(data)
    return process(validated)
```

## Our Toolchain Philosophy

### Tools Serve Us, Not Vice Versa
- **mypy** for type checking - configured strictly but pragmatically
- **Type stubs** only when they add value - not for every library
- **Runtime validation** at boundaries - Pydantic where it matters
- **Documentation** over complex types - explain the why

### Our mypy Configuration Embodies Our Values
```ini
[mypy]
strict = true                    # Start strict
warn_return_any = true          # Catch Any contamination
warn_unused_ignores = true      # Keep ignores current

# But pragmatic at boundaries
[mypy-sqlalchemy.*]
ignore_missing_imports = true   # Accept library limitations

[mypy-tests.*]
check_untyped_defs = false     # Test clarity > type purity
```

## Our Metrics of Success

### What We Measure
- **Type coverage** (target: >95%) - breadth of typing
- **Error count** (target: <5) - but understand each one
- **Type complexity** (monitor) - are types harder than code?
- **Onboarding time** (minimize) - can juniors understand?

### What We Don't Measure
- **Zero errors** - some errors are features
- **100% coverage** - diminishing returns
- **Type annotation count** - quality over quantity

## Our Contract with Future Maintainers

We promise:
1. **Every type teaches** - about intent, constraints, or patterns
2. **Every ignore explains** - why this exception exists
3. **Every pattern documents** - in the cookbook for reuse
4. **Every boundary validates** - where types cannot

We ask:
1. **Understand before changing** - especially the final 3
2. **Document new patterns** - add to the cookbook
3. **Maintain the bar** - 96% with wisdom
4. **Question but respect** - the decisions made

## The Evolution Clause

This manifesto is not dogma. It evolves as:
- Python's type system advances
- Libraries improve their typing
- We learn new patterns
- The team grows

Review quarterly. Update thoughtfully. Keep the bar high.

## Signed

The Journal API Team, 2024

*"Type safety is a powerful servant but a terrible master. We choose to master it."*