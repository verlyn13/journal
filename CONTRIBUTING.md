# Contributing to Journal

Thank you for your interest in contributing to the Journal project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Contributing to Journal](#contributing-to-journal)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Getting Started](#getting-started)
  - [Development Workflow](#development-workflow)
  - [Pull Request Process](#pull-request-process)
  - [Coding Standards](#coding-standards)
    - [Python](#python)
    - [JavaScript](#javascript)
  - [Documentation Guidelines](#documentation-guidelines)
  - [Testing](#testing)
    - [Local Workflow Testing with `act`](#local-workflow-testing-with-act)

## Code of Conduct

We expect all contributors to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally: `git clone https://github.com/YOUR-USERNAME/journal.git`
3. **Add the upstream repository**: `git remote add upstream https://github.com/verlyn13/journal.git`
4. **Create a feature branch**: `git checkout -b feature/your-feature-name`

## Development Workflow

1. **Set up your development environment**:
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Install Node.js dependencies
   npm install
   ```

2. **Run the development server**:
   ```bash
   # Run Flask development server
   python run.py
   
   # In a separate terminal, run frontend build watcher
   npm run dev
   ```

3. **Make your changes**:
   - Write your code
   - Write or update tests
   - Write or update documentation

4. **Commit your changes**:
   - Follow [Conventional Commits](https://www.conventionalcommits.org/) format
   - Example: `feat(editor): add markdown preview toggle button`

5. **Keep your branch updated**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

## Pull Request Process

1. **Open a pull request** from your feature branch to the main repository
2. **Fill out the PR template** with all required information
3. **Pass all CI checks**:
   - Python tests must pass
   - Frontend build must succeed 
   - Documentation checks must pass
4. **Address review feedback** by making additional commits or amending existing ones
5. Once approved, your PR will be merged by a maintainer

## Coding Standards

### Python
- Follow PEP 8 style guide
- Write docstrings for all functions, classes, and modules
- Keep functions small and focused on a single responsibility
- Add type hints where appropriate

### JavaScript
- Follow the project's ESLint configuration
- Use ES6+ features appropriately
- Document functions using JSDoc comments

## Documentation Guidelines

- All new features should be documented
- Documentation lives in the `docs/` directory
- Follow the markdown formatting guidelines
- Include frontmatter in all markdown files with required fields
- Run markdown linting locally before submitting: `npm run lint:md`
- Check for broken links: `npm run lint:links`

## Testing

- Policy: Write tests for all new features and bug fixes; keep them deterministic. Prefer unit/component tests; add integration only when needed.
- API (FastAPI, uv):
  - Services: `cd apps/api && docker compose up -d db nats`
  - Unit: `cd apps/api && uv run pytest -m unit -q`
  - Component: `cd apps/api && uv run pytest -m component -q`
  - Integration: `cd apps/api && uv run alembic -c alembic.ini upgrade head && uv run pytest -m integration -q`
- Web (Vitest): `cd apps/web && bun install && bun run test:coverage`
- E2E (Playwright): from repo root run `make e2e` (starts API, waits for health, runs tests, cleans up)
- References: see `docs/TESTING_STATUS.md` (status/plan/CI) and `apps/api/docs/testing.md` (detailed guide).

### Local Workflow Testing with `act`

Before submitting a Pull Request, especially if your changes affect GitHub Actions workflows (`.github/workflows/`), you should test the workflows locally using [`act`](https://github.com/nektos/act). This helps catch errors early and reduces CI failures.

1.  **Install `act`**: Follow the installation instructions in the [`act` documentation](https://github.com/nektos/act#installation).
2.  **Install Docker**: Ensure Docker (or a compatible engine like Podman) is installed and running.
3.  **Run Workflows Locally**:
    *   Navigate to the project root directory (`/home/verlyn13/Projects/journal`).
    *   Simulate a `push` event (runs workflows triggered by push):
        ```bash
        gh act push
        ```
    *   Simulate a `pull_request` event:
        ```bash
        gh act pull_request
        ```
    *   Run a specific workflow file:
        ```bash
        gh act -W .github/workflows/python-tests.yml
        ```
    *   Run a specific job within workflows:
        ```bash
        gh act -j build-frontend
        ```
4.  **Provide Secrets (If Needed)**: If workflows require secrets (like `GITHUB_TOKEN`), provide them securely using the `-s` flag or a `.secrets` file. Refer to the [act Reference Guide](docs/guides/act-reference.md) for details.
    ```bash
    # Example: Prompt securely for GITHUB_TOKEN
    gh act -s GITHUB_TOKEN
    ```
5.  **Review Output**: Check the `act` output for any errors or unexpected behavior in your workflows.

Consult the full [act Reference Guide](docs/guides/act-reference.md) for advanced usage, including custom runner images, event payloads, and matrix testing.


Thank you for contributing to Journal!
