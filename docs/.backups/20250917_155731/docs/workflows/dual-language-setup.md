---
id: dual-language-setup
title: Python/TypeScript Dual-Language Project Setup Guide
type: api
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- python
- fastapi
- react
- typescript
- api
priority: high
status: approved
visibility: internal
schema_version: v1
---

# Python/TypeScript Dual-Language Project Setup Guide

*Authoritative configuration for Bun 1.2.21, Biome 2.2.2, uv 0.8.14, and Python 3.13.7*

## Executive Summary

This guide provides a future-facing, high-quality setup for dual-language projects combining TypeScript and Python, leveraging the latest tooling advancements as of August 2025. The configuration prioritizes speed, developer experience, and maintainability while embracing the latest patterns from each tool's development team.

## Project Structure

```
project-root/
├── .github/
│   └── workflows/
│       └── ci.yml
├── apps/
│   ├── api/           # Python backend service
│   │   ├── src/
│   │   ├── tests/
│   │   ├── pyproject.toml
│   │   └── uv.lock
│   └── web/           # TypeScript frontend/services
│       ├── src/
│       ├── tests/
│       └── package.json
├── packages/          # Shared libraries
│   ├── python-lib/
│   │   ├── src/
│   │   └── pyproject.toml
│   └── ts-lib/
│       ├── src/
│       └── package.json
├── biome.json         # Unified Biome config
├── bunfig.toml        # Bun configuration
├── .python-version    # Python version pinning
├── pyproject.toml     # Root Python config
├── package.json       # Root TypeScript config
└── README.md
```

## TypeScript/Bun Configuration

### Installing Bun 1.2.21

```bash
# Install specific version
curl -fsSL https://bun.com/install | bash -s "bun-v1.2.21"

# Verify installation
bun --version
```

### Root package.json

```json
{
  "name": "monorepo",
  "type": "module",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "bun run --filter './apps/web' dev",
    "build": "bun run --filter './apps/web' build",
    "test": "bun test",
    "lint": "biome check --write .",
    "format": "biome format --write .",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@biomejs/biome": "2.2.2",
    "typescript": "^5.6.0",
    "bun-types": "^1.2.21"
  },
  "trustedDependencies": [
    "@biomejs/biome"
  ]
}
```

### bunfig.toml

```toml
# Bun configuration for optimal performance
[install]
# Use hardlinks for faster installs
hardlinks = true

# Enable auto-install
auto = "auto"

# Package manager settings
[install.cache]
# Cache directory for packages
dir = "~/.bun/install/cache"

# Disable cache for CI
disable = false

[install.lockfile]
# Save exact versions
save = true

# Print summary after install
print = "bun"

[test]
# Test configuration
root = "./tests"
preload = ["./tests/setup.ts"]
coverage = true
coverageReporter = ["text", "json"]

[run]
# Enable Bun's built-in YAML support
yaml = true

# Silent mode for scripts
silent = false
```

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "types": ["bun-types"],

    "jsx": "react-jsx",
    "jsxImportSource": "react",

    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "allowJs": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./apps/*/src/*"],
      "@packages/*": ["./packages/*/src/*"]
    },

    "incremental": true,
    "composite": true
  },
  "include": ["apps/**/*.ts", "apps/**/*.tsx", "packages/**/*.ts"],
  "exclude": ["node_modules (managed by Bun)", "dist", "build"]
}
```

## Biome 2.2.2 Configuration

### biome.json (Root Configuration)

```json
{
  "$schema": "https://biomejs.dev/schemas/2.2.2/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  },
  "files": {
    "includes": ["**/*.{js,jsx,ts,tsx,json,jsonc,css,yaml,yml}"],
    "ignoreUnknown": true,
    "experimentalScannerIgnores": ["node_modules (managed by Bun)", ".venv", "dist", "build"]
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineEnding": "lf",
    "lineWidth": 100,
    "attributePosition": "auto",
    "bracketSpacing": true,
    "expand": "auto"
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "useExhaustiveDependencies": "warn"
      },
      "style": {
        "useImportType": "error",
        "useExportType": "error",
        "useNodejsImportProtocol": "error"
      },
      "complexity": {
        "useFlatMap": "warn",
        "noExcessiveCognitiveComplexity": {
          "level": "warn",
          "options": {
            "maxAllowedComplexity": 15
          }
        }
      },
      "performance": {
        "noAccumulatingSpread": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn"
      }
    }
  },
  "javascript": {
    "parser": {
      "unsafeParameterDecoratorsEnabled": false,
      "jsxEverywhere": false
    },
    "formatter": {
      "enabled": true,
      "quoteStyle": "single",
      "jsxQuoteStyle": "double",
      "quoteProperties": "asNeeded",
      "trailingCommas": "all",
      "semicolons": "always",
      "arrowParentheses": "always",
      "indentStyle": "space",
      "indentWidth": 2,
      "lineWidth": 100
    },
    "globals": ["Bun", "SQL"]
  },
  "organizeImports": {
    "enabled": true
  },
  "css": {
    "formatter": {
      "enabled": true,
      "indentStyle": "space",
      "indentWidth": 2
    }
  },
  "json": {
    "formatter": {
      "enabled": true,
      "indentStyle": "space",
      "indentWidth": 2
    }
  }
}
```

## Python/uv Configuration

### Installing uv 0.8.14 and Python 3.13.7

```bash
# Install uv 0.8.14
curl -LsSf https://astral.sh/uv/0.8.14/install.sh | sh

# Install Python 3.13.7
uv python install 3.13.7

# Pin Python version for the project
uv python pin 3.13.7
```

### Root pyproject.toml

````toml
[project]
name = "monorepo"
version = "0.1.0"
description = "Python/TypeScript monorepo"
readme = "README.md"
requires-python = ">=3.13.7"
dependencies = []

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.uv]
managed = true
dev-dependencies = [
    "uv run pytest>=8.3.5",
    "uv run pytest-asyncio>=0.25.0",
    "uv run pytest-cov>=6.0.0",
    "mypy>=1.15.0",
    "ruff==0.12.11",  # Pin exact version for consistency
]

[tool.uv.workspace]
members = ["apps/api", "packages/python-lib"]

[tool.uv.sources]
# Define internal package sources
python-lib = { workspace = true }

[dependency-groups]
dev = [
    "uv run pytest>=8.3.5",
    "uv run pytest-asyncio>=0.25.0",
    "mypy>=1.15.0",
    "ruff==0.12.11",
]
test = [
    "uv run pytest>=8.3.5",
    "uv run pytest-cov>=6.0.0",
    "uv run pytest-mock>=3.15.0",
]
lint = [
    "ruff==0.12.11",
    "mypy>=1.15.0",
]

# Ruff Configuration (Replaces Ruff, Ruff, and Ruff)
[tool.ruff]
# Same line length as Biome for consistency
line-length = 100
indent-width = 4

# Target Python 3.13
target-version = "py313"

# Enable preview features for cutting-edge checks
preview = true

# Exclude common directories
exclude = [
    ".venv",
    "venv",
    ".git",
    ".mypy_cache",
    ".pytest_cache",
    ".ruff_cache",
    "__pycache__",
    "dist",
    "build",
    "*.egg-info",
]

# Respect gitignore
respect-gitignore = true

# Force exclusion even if explicitly passed
force-exclude = true

[tool.ruff.lint]
# Enable comprehensive rule sets
select = [
    "E",      # pycodestyle errors
    "W",      # pycodestyle warnings
    "F",      # pyflakes
    "I",      # Ruff
    "N",      # pep8-naming
    "D",      # pydocstyle
    "UP",     # pyupgrade
    "B",      # Ruff-bugbear
    "C4",     # Ruff-comprehensions
    "DTZ",    # Ruff-datetimez
    "T10",    # Ruff-debugger
    "ISC",    # Ruff-implicit-str-concat
    "ICN",    # Ruff-import-conventions
    "PIE",    # Ruff-pie
    "T20",    # Ruff-print
    "PYI",    # Ruff-pyi
    "PT",     # Ruff-uv run pytest-style
    "Q",      # Ruff-quotes
    "RSE",    # Ruff-raise
    "RET",    # Ruff-return
    "SLF",    # Ruff-self
    "SIM",    # Ruff-simplify
    "TID",    # Ruff-tidy-imports
    "ARG",    # Ruff-unused-arguments
    "ERA",    # eradicate
    "PGH",    # pygrep-hooks
    "PL",     # Ruff
    "TRY",    # tryceratops
    "FLY",    # flynt
    "PERF",   # Perflint
    "FURB",   # refurb
    "LOG",    # Ruff-logging
    "RUF",    # Ruff-specific rules
]

# Ignore specific rules
ignore = [
    "D100",    # Missing docstring in public module
    "D104",    # Missing docstring in public package
    "D107",    # Missing docstring in __init__
    "D203",    # 1 blank line required before class docstring
    "D213",    # Multi-line docstring summary should start at the second line
    "E501",    # Line too long (handled by formatter)
    "PGH003",  # Use specific rule codes when ignoring type issues
]

# Allow autofix for all enabled rules
fixable = ["ALL"]
unfixable = []

# Allow unused variables when underscore-prefixed
dummy-variable-rgx = "^(_+|(_+[a-zA-Z0-9_]*[a-zA-Z0-9]+?))$"

[tool.ruff.lint.pycodestyle]
max-doc-length = 100

[tool.ruff.lint.pydocstyle]
convention = "google"

[tool.ruff.lint.Ruff]
known-first-party = ["api", "python_lib"]
section-order = ["future", "standard-library", "third-party", "first-party", "local-folder"]
combine-as-imports = true
split-on-trailing-comma = true

[tool.ruff.lint.Ruff-quotes]
docstring-quotes = "double"
inline-quotes = "single"

[tool.ruff.lint.Ruff-import-conventions]
[tool.ruff.lint.Ruff-import-conventions.extend-aliases]
# Custom import conventions
"typing" = "t"
"numpy" = "np"
"pandas" = "pd"

[tool.ruff.lint.Ruff-uv run pytest-style]
fixture-parentheses = true
mark-parentheses = true

[tool.ruff.lint.Ruff]
max-args = 5
max-branches = 12
max-returns = 6
max-statements = 50

[tool.ruff.lint.per-file-ignores]
# Ignore certain rules for specific files
"tests/**/*.py" = [
    "S101",    # Use of assert detected
    "ARG",     # Unused function args -> fixtures nevertheless are functionally relevant
    "FBT",     # Don't care about booleans as positional arguments in tests
    "PLR2004", # Magic value used in comparison
    "S311",    # Standard pseudo-random generators are not suitable for cryptographic purposes
]
"__init__.py" = ["F401"]  # Unused imports in __init__ files are ok

[tool.ruff.format]
# Use single quotes for strings (matching Biome JS config)
quote-style = "single"

# Use spaces for indentation
indent-style = "space"

# Like Ruff, respect magic trailing commas
skip-magic-trailing-comma = false

# Format docstrings
docstring-code-format = true
docstring-code-line-length = "dynamic"

[tool.mypy]
python_version = "3.13"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
disallow_any_generics = true
check_untyped_defs = true
no_implicit_optional = true
warn_redundant_casts = true
warn_unused_ignores = true
warn_unreachable = true
strict_equality = true

### Python Service Configuration (apps/api/pyproject.toml)

```toml
[project]
name = "api"
version = "0.1.0"
description = "Python API service"
requires-python = ">=3.13.7"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.34.0",
    "pydantic>=2.10.0",
    "httpx>=0.28.0",
    "sqlalchemy>=2.0.35",
    "alembic>=1.14.0",
    "python-lib",  # Internal package
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.uv.sources]
python-lib = { workspace = true }

[dependency-groups]
dev = [
    "uv run pytest>=8.3.5",
    "uv run pytest-asyncio>=0.25.0",
    "httpx>=0.28.0",
]

# Service-specific Ruff overrides (inherits from root)
[tool.ruff.lint.extend-per-file-ignores]
"*/migrations/*.py" = ["E501", "D"]  # Alembic migrations
"*/conftest.py" = ["F401", "F403"]   # pytest fixtures
````

## Ruff Integration: The Astral Synergy

Ruff and uv are both created by Astral, providing unparalleled integration for Python development. Ruff aims to be orders of magnitude faster than alternative tools while integrating more functionality behind a single, common interface. Ruff can replace Ruff (plus dozens of plugins), Ruff, Ruff, pydocstyle, pyupgrade, autoflake, and more, all while executing tens or hundreds of times faster than any individual tool.

### Installing Ruff with uv

The recommended way to install Ruff is with uv:

```bash
# Install Ruff globally as a tool
uv tool install ruff@0.12.11

# Or add Ruff to your project
uv add --dev ruff==0.12.11

# Run Ruff via uvx (without installation)
uvx ruff check
uvx ruff format

# After adding to project, run via uv
uv run ruff check
uv run ruff format
```

### Pre-commit Configuration

Create `.pre-commit-config.yaml` for automated checks:

```yaml
repos:
  # Ruff hooks
      - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.12.11
    hooks:
      # Run the linter with autofix
            - id: ruff-check
        args: [--fix]
      # Run the formatter
            - id: ruff-format

  # uv hooks for dependency management
      - repo: https://github.com/astral-sh/uv-pre-commit
    rev: 0.8.14
    hooks:
      # Keep lock file up to date
            - id: uv-lock
      # Export requirements if needed
            - id: uv-export
        args: ["--no-hashes", "--output-file=requirements.txt"]

  # Biome for TypeScript/JavaScript
      - repo: local
    hooks:
            - id: biome
        name: Biome check
        entry: bun run biome check --write
        language: system
        files: \.(js|jsx|ts|tsx|json|jsonc|css|yaml|yml)$
        pass_filenames: false
```

### Hierarchical Configuration for Monorepos

Ruff is monorepo-friendly, with hierarchical and cascading configuration. You can have a root configuration and override it in subdirectories:

**Root ruff.toml**:

```toml
# Global configuration
line-length = 100
target-version = "py313"

[lint]
select = ["E", "F", "UP", "B", "SIM", "I"]
```

**apps/api/.ruff.toml** (service-specific overrides):

```toml
# Inherit from parent
extend = "../../ruff.toml"

[lint]
# Add API-specific rules
extend-select = ["ASYNC", "FA"]  # async and future annotations

[lint.per-file-ignores]
"*/endpoints/*.py" = ["B008"]  # FastAPI dependency injection
```

## Integration Patterns

### 1. Shared Type Definitions

Create a shared schema that both TypeScript and Python can use:

**packages/shared-types/schemas/user.json**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "email": { "type": "string", "format": "email" },
    "name": { "type": "string" },
    "createdAt": { "type": "string", "format": "date-time" }
  },
  "required": ["id", "email", "name", "createdAt"]
}
```

Generate TypeScript types using Bun:

```typescript
// packages/ts-lib/src/generate-types.ts
import { SQL } from "bun";

const generateTypes = async () => {
  const schemas = await Bun.file("../shared-types/schemas").json();
  // Type generation logic
};
```

Generate Python types using uv:

```python
# packages/python-lib/src/generate_types.py
from pathlib import Path
import json
from typing import TypedDict

def generate_types():
    schemas_path = Path("../shared-types/schemas")
    # Type generation logic
```

### 2. Cross-Language Communication

**Using Bun's native capabilities:**

```typescript
// apps/web/src/api/client.ts
export class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.API_URL || 'http://localhost:5000';
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }
}
```

### 3. Unified Testing Strategy

**TypeScript Testing with Bun:**

```typescript
// apps/web/tests/api.test.ts
import { expect, test, describe, beforeAll } from "bun:test";
import { APIClient } from "../src/api/client";

describe("API Integration", () => {
  let client: APIClient;

  beforeAll(() => {
    client = new APIClient();
  });

  test("should fetch user data", async () => {
    const user = await client.request("/users/1");
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email");
  });
});
```

**Python Testing with uv:**

```python
# apps/api/tests/test_endpoints.py
import uv run pytest
from httpx import AsyncClient
from api.main import app

@uv run pytest.mark.asyncio
async def test_get_user():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/users/1")
        assert response.status_code == 200
        assert "id" in response.json()
```

## CI/CD Configuration

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  typescript:
    runs-on: ubuntu-latest
    steps:
            - uses: actions/checkout@v4

            - uses: oven-sh/setup-bun@v2
        with:
          bun-version: 1.2.21

            - name: Install dependencies
        run: bun install --frozen-lockfile

            - name: Run Biome checks
        run: bun run lint

            - name: Type check
        run: bun run typecheck

            - name: Run tests
        run: bun test --coverage

            - name: Build
        run: bun run build

  python:
    runs-on: ubuntu-latest
    steps:
            - uses: actions/checkout@v4

            - name: Install uv
        run: curl -LsSf https://astral.sh/uv/0.8.14/install.sh | sh

            - name: Set up Python
        run: |
          uv python install 3.13.7
          uv python pin 3.13.7

            - name: Install dependencies
        run: uv sync --frozen

            - name: Run Ruff linter
        run: uv run ruff check . --output-format=github

            - name: Run Ruff formatter check
        run: uv run ruff format --check .

            - name: Run mypy
        run: uv run mypy .

            - name: Run tests
        run: uv run pytest --cov --cov-report=xml

  # Ruff-specific CI job for detailed reporting
  ruff:
    runs-on: ubuntu-latest
    steps:
            - uses: actions/checkout@v4
            - uses: astral-sh/ruff-action@v3
        with:
          version: "0.12.11"
          args: "check --output-format=github"
            - uses: astral-sh/ruff-action@v3
        with:
          version: "0.12.11"
          args: "format --check"
```

### GitLab CI Configuration

```yaml
# .gitlab-ci.yml
stages:
      - lint
      - test
      - build

variables:
  BUN_VERSION: "1.2.21"
  UV_VERSION: "0.8.14"
  RUFF_VERSION: "0.12.11"
  PYTHON_VERSION: "3.13.7"

.base_ruff:
  stage: lint
  image: ghcr.io/astral-sh/ruff:${RUFF_VERSION}-alpine
  before_script:
      - cd $CI_PROJECT_DIR
      - ruff --version

ruff-check:
  extends: .base_ruff
  script:
      - ruff check --output-format=gitlab > code-quality-report.json
  artifacts:
    reports:
      codequality: $CI_PROJECT_DIR/code-quality-report.json

ruff-format:
  extends: .base_ruff
  script:
      - ruff format --check --diff

biome-check:
  stage: lint
  image: node:20-alpine
  before_script:
      - bun install -g @biomejs/biome@2.2.2
  script:
      - biome check .

python-test:
  stage: test
  image: python:${PYTHON_VERSION}-slim
  before_script:
      - curl -LsSf https://astral.sh/uv/${UV_VERSION}/install.sh | sh
      - export PATH="$HOME/.local/bin:$PATH"
      - uv sync --frozen
  script:
      - uv run pytest --cov --cov-report=term-missing

typescript-test:
  stage: test
  image: oven/bun:${BUN_VERSION}
  script:
      - bun install --frozen-lockfile
      - bun test --coverage
```

## Development Workflow

### Initial Setup

```bash
# Clone repository
git clone <repository>
cd <project>

# Install Bun (if not installed)
curl -fsSL https://bun.com/install | bash -s "bun-v1.2.21"

# Install uv (if not installed)
curl -LsSf https://astral.sh/uv/0.8.14/install.sh | sh

# Install Ruff standalone (optional, for system-wide use)
curl -LsSf https://astral.sh/ruff/0.12.11/install.sh | sh

# Install Python 3.13.7
uv python install 3.13.7
uv python pin 3.13.7

# Install all dependencies
bun install
uv sync

# Install pre-commit hooks
uv run pre-commit install
```

### Daily Development

```bash
# Start development servers
bun run dev          # TypeScript/Frontend
uv run dev           # Python/Backend

# Run tests
bun test            # TypeScript tests
uv run pytest       # Python tests

# Linting and Formatting
# TypeScript/JavaScript (via Biome)
bun run biome check --write .

# Python (via Ruff - replaces Ruff, Ruff, Ruff, and more)
uv run ruff check . --fix    # Lint with autofix
uv run ruff format .          # Format code
uv run ruff check . --watch   # Watch mode for continuous linting

# Type checking
bun run typecheck    # TypeScript
uv run mypy .        # Python

# Build for production
bun run build       # TypeScript build
uv build            # Python build
```

### Ruff Commands Cheat Sheet

```bash
# Basic usage
ruff check .                  # Check all Python files
ruff format .                  # Format all Python files
ruff check --fix .            # Fix auto-fixable issues
ruff check --unsafe-fixes .   # Include unsafe fixes

# Advanced options
ruff check --select E,F       # Check specific rule sets
ruff check --ignore E501      # Ignore specific rules
ruff check --statistics       # Show rule statistics
ruff check --show-fixes       # Show applied fixes
ruff check --diff             # Show diff of fixes without applying

# Output formats
ruff check --output-format=github    # GitHub Actions annotations
ruff check --output-format=gitlab    # GitLab CI format
ruff check --output-format=json      # JSON format for tooling

# Watch mode (great for development)
ruff check . --watch          # Re-run on file changes

# Configuration
ruff check --config=custom.toml      # Use custom config
ruff check --isolated                 # Ignore all configuration
```

## Performance Optimizations

### Bun Optimizations

1. **Native YAML Support**: Leverage Bun 1.2.21's built-in YAML parser

```typescript
import config from "./config.yaml";
// No additional parsing needed
```

2. **Bun.SQL for Database Access**:

```typescript
import { SQL } from "bun";

const db = new SQL({
  adapter: "postgres",
  hostname: "localhost",
  database: "myapp"
});

const users = await db`SELECT * FROM users WHERE active = ${true}`;
```

3. **Built-in Testing**: Use Bun's native test runner for 40x faster test execution

### uv Optimizations

1. **Workspace Dependencies**: Share common dependencies across Python packages
2. **Locked Dependencies**: Use `uv.lock` for reproducible builds
3. **Parallel Installation**: uv installs packages in parallel for 10x faster setup
4. **Tool Integration**: Install and run tools like Ruff directly through uv

### Ruff Optimizations

Ruff is 150-200x faster than traditional Python linters. It can lint and format large codebases (250k+ lines) in under 0.2 seconds.

1. **Single Tool Replacement**: Ruff replaces multiple tools (Ruff, Ruff, Ruff, pydocstyle, pyupgrade, autoflake, and more)

```bash
# Before: Multiple tools, multiple passes, slower
Ruff . && Ruff . && Ruff . && pydocstyle .

# After: Single tool, single pass, 150x faster
ruff check . --fix && ruff format .
```

2. **Watch Mode for Development**: Use Ruff's watch mode for instant feedback

```bash
# Terminal 1: Watch for linting issues
uv run ruff check . --watch

# Terminal 2: Continue development with real-time feedback
```

3. **Incremental Checking**: Ruff caches results and only checks changed files

```bash
# First run: checks all files
ruff check .  # 0.2s for 250k lines

# Subsequent runs: only changed files
ruff check .  # <0.01s for unchanged codebase
```

4. **Parallel Processing**: Ruff uses Rust's parallelism to check multiple files simultaneously

5. **Smart Fix Application**: Ruff can apply multiple fixes in a single pass

```bash
# Apply all safe fixes at once
ruff check . --fix

# Preview fixes without applying
ruff check . --fix --diff
```

### Biome Optimizations

1. **File Scanner Configuration**: Use `experimentalScannerIgnores` for large codebases
2. **Incremental Checking**: Only check changed files in CI
3. **Multi-threaded Processing**: Biome uses Rust's parallelism for fast processing

## Best Practices

### 1. Version Management

- Pin exact versions for all tools (Bun, uv, Ruff, Python)
- Use lockfiles (`bun.lockb`, `uv.lock`) for reproducible builds
- Commit lockfiles to version control
- Pin Ruff version to avoid unexpected rule changes

### 2. Code Organization

- Keep Python and TypeScript code in separate directories
- Share types through JSON Schema or Protocol Buffers
- Use workspace features for internal packages
- Leverage Ruff's hierarchical configuration for monorepos

### 3. Linting and Formatting Strategy

- **TypeScript/JavaScript**: Use Biome for unified linting and formatting
- **Python**: Use Ruff for all linting and formatting needs
- **Consistency**: Align line length (100 chars) across both tools
- **Pre-commit**: Use hooks to enforce standards before commits

### 4. The Astral Ecosystem Advantage

Since both uv and Ruff are created by Astral, they work seamlessly together:

```bash
# Install Ruff via uv for perfect integration
uv tool install ruff@0.12.11

# Run Ruff through uv for environment consistency
uv run ruff check .
uv run ruff format .

# Use uvx for one-off Ruff runs
uvx ruff check --statistics
```

### 5. Testing Strategy

- Write integration tests that test both languages together
- Use property-based testing for shared data structures
- Maintain >80% code coverage for both languages
- Use Ruff's Ruff-uv run pytest-style rules for consistent test structure

### 6. Security

- Use `trustedDependencies` in Bun for postinstall scripts
- Regular dependency updates with `uv lock --upgrade`
- Enable Biome's security rules for JavaScript
- Enable Ruff's security rules (S, TRY) for Python

### 7. Performance Monitoring

- Use Bun's built-in benchmarking for TypeScript
- Profile Python code with `py-spy` or `scalene`
- Monitor build times in CI
- Use Ruff's `--statistics` flag to identify frequently violated rules

### 8. Editor Integration

Configure your editor for maximum productivity:

**VS Code settings.json**:

```json
{
  // Biome for TypeScript/JavaScript
  "editor.defaultFormatter": "biomejs.biome",
  "[javascript][typescript][javascriptreact][typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true
  },

  // Ruff for Python
  "[python]": {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.ruff": "explicit",
      "source.organizeImports.ruff": "explicit"
    }
  },

  // Ruff extension settings
  "ruff.lint.enable": true,
  "ruff.format.enable": true,
  "ruff.trace.server": "off",
  "ruff.showNotifications": "onWarning"
}
```

## Advanced Features

### Python 3.13.7 Features

1. **Free-threaded Mode** (Experimental):

```python
# Enable with PYTHON_GIL=0 environment variable
import sys
print(f"GIL enabled: {sys._is_gil_enabled()}")
```

2. **Improved Interactive Shell**: New REPL with syntax highlighting and multiline editing

3. **JIT Compiler** (Preview): Can be enabled for performance improvements

### Bun 1.2.21 Features

1. **Native YAML Support**:

```typescript
import config from "./config.yml";
// Automatically parsed
```

2. **500x Faster postMessage**:

```typescript
// In workers
self.postMessage(largeString); // Optimized for strings
```

3. **Bun.stripANSI()**: 6-57x faster than bun alternatives

### Biome 2.2.2 Features

1. **Type Inference**: New `noFloatingPromises` rule with type checking
2. **Import Organizer v2**: Advanced import sorting and grouping
3. **HTML Support** (Experimental): Format HTML files

### Ruff 0.12.11 Advanced Features

1. **Preview Rules**: Enable cutting-edge linting rules

```toml
[tool.ruff]
preview = true  # Enable preview rules

[tool.ruff.lint]
select = ["FURB", "PERF", "LOG"]  # Modern rule sets
```

2. **Automatic Import Sorting**: Ruff includes Ruff functionality

```python
# Before Ruff format
from typing import Dict
import os
from api.models import User
import sys

# After Ruff format (automatically organized)
import os
import sys
from typing import Dict

from api.models import User
```

3. **Type Annotation Improvements**: Ruff can automatically upgrade type hints

```python
# Before (Python 3.9 style)
from typing import List, Dict, Optional

def process(items: List[str]) -> Dict[str, Optional[int]]:
    pass

# After (Python 3.10+ style with UP rules)
def process(items: list[str]) -> dict[str, int | None]:
    pass
```

4. **Security Scanning**: Built-in security rules

```python
# Ruff detects and warns about:
import pickle  # S403: pickle is unsafe
exec(user_input)  # S102: exec usage
```

5. **Performance Suggestions**: Ruff identifies performance anti-patterns

```python
# Before
result = []
for item in items:
    result.append(transform(item))

# Ruff suggests (PERF401)
result = [transform(item) for item in items]
```

6. **Notebook Support**: Native Jupyter notebook linting

```bash
# Lint Jupyter notebooks directly
ruff check notebook.ipynb
ruff format notebook.ipynb
```

7. **Editor Protocol Support**: Ruff Language Server for real-time feedback

```bash
# Run Ruff as a language server
ruff server
```

## Troubleshooting

### Common Issues

1. **Bun Installation on Windows**: Use PowerShell with admin rights
2. **uv Python Version**: Ensure Python 3.13.7 is available for your platform
3. **Biome Performance**: Use `experimentalScannerIgnores` for large node\_modules

### Debug Commands

```bash
# Check versions
bun --version
uv --version
python --version
biome --version

# Check configurations
bun pm ls          # List Bun packages
uv uv pip list        # List Python packages
biome explain      # Explain Biome rules

# Clean and reinstall
rm -rf node_modules (managed by Bun) bun.lockb
rm -rf .venv uv.lock
bun install
uv sync
```

## Conclusion

This setup provides a modern, performant, and maintainable foundation for dual-language projects. The combination creates an optimal development environment for 2025 and beyond:

### The Rust-Powered Stack

All four primary tools are built with Rust, providing unprecedented speed:

- **Bun**: JavaScript runtime and bundler (Zig/C++, but Rust-like performance)
- **Biome**: TypeScript/JavaScript linter and formatter
- **uv**: Python package and project manager
- **Ruff**: Python linter and formatter

### Performance Metrics

- Ruff is 150-200x faster than Ruff, scanning 250k lines in \~0.2s instead of \~20s
- uv is 10-100x faster than uv pip with parallel package installation
- Bun executes TypeScript 40x faster than Node.js
- Biome formats and lints JavaScript 20x faster than Biome + Biome

### The Astral Advantage

Both uv and Ruff are created by Astral, ensuring:

- Seamless integration between Python tooling
- Consistent philosophy and user experience
- Monorepo-friendly design with hierarchical configuration
- Shared performance optimizations and caching strategies

### Tool Unification

Ruff replaces Ruff (plus dozens of plugins), Ruff, Ruff, pydocstyle, pyupgrade, autoflake, and more, all while executing tens or hundreds of times faster. This means:

- Fewer dependencies to manage
- Consistent code style enforcement
- Single configuration source
- Dramatically faster CI/CD pipelines

### Development Experience

The setup prioritizes developer happiness:

- Sub-second linting and formatting for both languages
- Real-time feedback with watch modes
- Consistent tooling across the entire stack
- Minimal configuration with sensible defaults

Regular updates to these tools are recommended as they are under active development with frequent improvements and bug fixes. The Astral ecosystem (uv and Ruff) and Biome are particularly active, with new features and performance improvements released regularly.
