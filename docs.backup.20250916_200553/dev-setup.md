# Development Environment Setup

This guide covers setting up your local development environment for the Journal project.

## Prerequisites

- **Python 3.13** - Required for all backend development
- **uv** - Python package manager (replaces pip, pipenv, poetry)
- **bun** - JavaScript runtime and package manager
- **Git** - Version control
- **Docker** (optional) - For containerized development

## Python Setup

### 1. Install Python 3.13

On macOS with Homebrew:
```bash
brew install python@3.13
```

On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install python3.13 python3.13-venv python3.13-dev
```

On Windows, use the official Python installer from python.org.

### 2. Install uv

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Or with pip:
```bash
pip install uv
```

### 3. Setup Backend Environment

```bash
cd apps/api
uv venv --python 3.13
uv sync --all-extras --dev
```

## Code Quality Tools

### Ruff 0.13.0

We use **Ruff 0.13.0** for both linting and formatting Python code. It replaces Black, isort, and flake8.

Configuration is in `apps/api/pyproject.toml` under `[tool.ruff]`.

#### Common Commands

```bash
# Check code (lint)
uv run ruff check .

# Auto-fix issues
uv run ruff check . --fix

# Format code
uv run ruff format .

# Check formatting without changing files
uv run ruff format --check .
```

#### IDE Integration

##### VS Code
1. Install the **Ruff** extension (charliermarsh.ruff)
2. Add to your VS Code settings.json:
```json
{
  "python.defaultInterpreterPath": "./apps/api/.venv/bin/python",
  "[python]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.codeActionsOnSave": {
      "source.fixAll.ruff": "explicit",
      "source.organizeImports.ruff": "explicit"
    }
  },
  "ruff.path": ["./apps/api/.venv/bin/ruff"]
}
```

##### PyCharm/IntelliJ
1. Install the **Ruff** plugin
2. Configure it to use the project's Ruff installation: `./apps/api/.venv/bin/ruff`

### Pre-commit Hooks

We use pre-commit to run checks before each commit:

```bash
# Install pre-commit globally
uvx pre-commit install

# Run on all files manually
pre-commit run --all-files
```

The hooks include:
- Ruff 0.13.0 for Python linting and formatting
- Biome for JavaScript/TypeScript
- Security checks (detect private keys)
- General file checks (trailing whitespace, etc.)

## Configuration Details

### Ruff Configuration

Our Ruff setup includes:
- **Preview features enabled** with explicit rule selection
- **Force exclude** for consistent behavior with pre-commit
- **Comprehensive rule set**: pyflakes, pycodestyle, isort, pyupgrade, bugbear, comprehensions, simplify, and more
- **No Black/isort conflicts** - Ruff handles both linting and formatting

Key settings:
```toml
[tool.ruff.lint]
preview = true
explicit-preview-rules = true
select = ["E4", "E7", "E9", "F", "I", "UP", "B", "C4", "SIM"]
ignore = ["E501"]  # Line length handled by formatter

[tool.ruff.format]
quote-style = "double"
line-ending = "auto"
docstring-code-format = true
```

## Testing

```bash
# Run all tests
uv run pytest

# Run specific test types
uv run pytest -m "unit"
uv run pytest -m "integration"

# With coverage
uv run pytest --cov=app --cov-report=html
```

## Common Issues

### Python Version Mismatch
If you get version errors, ensure you're using Python 3.13:
```bash
python3 --version  # Should show 3.13.x
uv run python --version  # Should also show 3.13.x
```

### Ruff Not Found
If Ruff commands fail:
```bash
# Ensure dependencies are installed
uv sync --dev

# Check Ruff version
uv run ruff --version  # Should show 0.13.0
```

### IDE Not Recognizing Configuration
1. Ensure your IDE is using the project's Python environment
2. Point the Ruff extension to the correct executable: `./apps/api/.venv/bin/ruff`
3. Restart your IDE after configuration changes

## Links

- [Python 3.13 Documentation](https://docs.python.org/3.13/)
- [uv Documentation](https://docs.astral.sh/uv/)
- [Ruff 0.13.0 Documentation](https://docs.astral.sh/ruff/)
- [Project Contributing Guide](../CONTRIBUTING.md)