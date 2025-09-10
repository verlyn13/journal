# Our Linting Philosophy

## Why We Lint

Linting isn't about rules - it's about communication. Every linting rule we enable or disable tells a story about what we value as a team.

## Our Linting Hierarchy

### Level 1: Security (Never Ignored)
- **S101**: assert used (except in tests where it's appropriate)
- **S105**: Hardcoded passwords - security vulnerability
- **S106**: Hardcoded tokens - security vulnerability  
- **S605**: Shell injection - critical security risk
- **S607**: Partial executable paths - security risk

### Level 2: Correctness
- **F821**: Undefined names - will cause runtime errors
- **E999**: Syntax errors - code won't run
- **F401**: Unused imports - cleaned up with exceptions for `__init__.py`

### Level 3: Clarity
- **C901**: Complexity < 10 - functions should be understandable
- **N805**: First arg should be self/cls - Python conventions
- **E741**: Ambiguous variable names (l, O, I) - readability

### Level 4: Consistency
- **Q000**: Quotes - we prefer double quotes for consistency
- **I001**: Import sorting - predictable organization
- **W291**: Trailing whitespace - clean diffs

### Level 5: Style (Team Preferences)
- **D212**: Docstring on first line - we prefer second line for readability
- **T201**: Print found - except in CLI tools where it's necessary
- **PLR0913**: Too many arguments - context-dependent, sometimes necessary

## Our Exceptions and Why

### TRY004, TRY300, TRY301 (Try/Except Style)
We prefer explicit error messages over generic re-raises for debuggability. This is a team choice that prioritizes clear error messages over strict style rules.

```python
# We prefer this (violates TRY300):
try:
    operation()
except SpecificError:
    logger.error("Operation failed with specific context")
    raise  # Clear what happened

# Over this:
try:
    operation()
except SpecificError:
    raise  # Less context
else:
    success_handler()  # TRY300 wants this pattern
```

### TC001, TC002, TC003 (Type Checking Imports)
We allow runtime imports of types when needed for clarity and to avoid circular imports. Modern Python typing often requires this flexibility.

### T201 (Print) in CLI Tools
CLI tools need print() for piped output. We mark these intentionally:

```python
# In CLI scripts:
print(result)  # noqa: T201 - CLI tool output, may be piped
```

### F401 (Unused Import) in `__init__.py`
We use `__init__.py` for public API exports. These 'unused' imports are intentional:

```python
# app/types/__init__.py
from app.types.guards import exists_guard  # noqa: F401 - Public API export
```

## Inline Documentation Standards

When we must violate a rule, we explain why:

```python
# Security exception with justification:
subprocess.run(cmd, shell=True)  # noqa: S605 - Required for glob expansion, input sanitized above

# Style exception for CLI tools:
print(result)  # noqa: T201 - CLI tool output, may be piped

# Broad exception for graceful shutdown:
except Exception:  # noqa: BLE001 - Catch-all required for graceful shutdown
```

## The 96% Philosophy

We maintain our codebase at 96% linting compliance. The remaining 4% are documented exceptions that represent:
- Necessary security trade-offs (with mitigation)
- CLI tool requirements
- Python typing limitations
- Team style preferences

Every exception should teach why it's necessary.

## Directory-Specific Rules

Different parts of our codebase have different requirements:

### `/app` - Production Code
- Strictest standards
- Security rules enforced
- Type safety required
- No print statements

### `/scripts` - Utility Scripts
- Print allowed for CLI output
- Subprocess allowed with care
- Type hints encouraged but not required

### `/docs` - Documentation Code
- Print allowed for demonstration
- Assert allowed for examples
- Security rules relaxed for teaching

### `/tests` - Test Code
- Assert is standard practice
- Magic values allowed for test data
- Some security rules relaxed

## Continuous Improvement

Our linting configuration evolves. When proposing changes:

1. Document the problem it solves
2. Show real code examples
3. Consider the teaching value
4. Get team consensus
5. Update this document

## The Standard

Code so clear it serves as documentation. Linting rules that guide without hampering. Exceptions that teach rather than confuse.

Every line of code, every rule, every exception should make our codebase better for the next developer who reads it.