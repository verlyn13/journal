---
name: modern-setup
description: Initialize a modern Python/TypeScript project
---

Create a full-stack setup with:
1. Configure Python with uv (no pip/poetry/conda) and add dev tools (ruff, pytest, mypy)
2. Configure TypeScript with Bun 1.2.21 + Biome 2.2.2
3. Use Ruff preview rules and Biome 100-char line width
4. Setup GitHub Actions with uv sync --frozen and Biome/Ruff/Mypy/Pytest
5. Add pre-commit hooks for Ruff and uv-export
6. Provide MCP server configs for CI/CD integration
7. Generate CLAUDE.md with project-specific instructions

Exact versions to use:
- Python 3.13.7
- uv 0.8.14
- Ruff 0.12.11
- Bun 1.2.21
- Biome 2.2.2
