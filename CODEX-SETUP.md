# Codex Configuration for Journal Project

## Overview
This project is configured with both **Codex CLI** and **mise** task runner integration for efficient AI-assisted development.

## Quick Start

### Using Codex Directly
```bash
# Default (fast) profile for routine tasks
codex "fix the failing tests"

# Deep reasoning for complex problems
codex --profile depth "analyze the database schema"

# Permissive mode for rapid iteration
codex --profile permissive "update all dependencies"
```

### Using Mise Tasks
```bash
# Quick Codex invocations with profiles
mise run codex:fast "implement user endpoint"
mise run codex:deep "refactor authentication"
mise run codex:permissive "scaffold components"

# Development workflow
mise run dev          # Start API and web servers
mise run test         # Run all tests
mise run ci           # Simulate CI pipeline
mise run setup        # Complete project setup
```

## Configuration Files

### 1. Global Configuration
- **~/.codex/config.toml** - Global Codex settings with profiles
- **~/.codex/AGENTS.md** - Personal coding preferences
- **~/.config/mise/config.toml** - Global tool versions

### 2. Project Configuration
- **./AGENTS.md** - Project-specific context and instructions
- **./.mise.toml** - Project tasks and tool versions
- **./CODEX-SETUP.md** - This file

## Available Profiles

| Profile | Model | Use Case | Approval |
|---------|-------|----------|----------|
| **speed** | gpt-5-mini | Quick fixes, routine tasks | on-request |
| **depth** | gpt-5 | Complex analysis, architecture | on-request |
| **permissive** | gpt-5 | Rapid iteration | on-failure |
| **agent** | gpt-5-mini | CI/CD automation | on-failure |
| **budget** | gpt-5-mini | Cost-optimized tasks | on-request |

## Project Structure Context

The AGENTS.md file provides Codex with:
- Full project architecture (monorepo with apps/api and apps/web)
- Development commands and workflows
- Testing strategy and markers
- Code standards and conventions
- Security and performance requirements

## Key Mise Tasks

### Development
- `mise run dev` - Start both API and web dev servers
- `mise run api:dev` - Start FastAPI backend
- `mise run web:dev` - Start Vite frontend

### Testing
- `mise run test` - Run all tests
- `mise run api:test` - Backend unit/component tests
- `mise run web:test` - Frontend tests
- `mise run e2e:test` - End-to-end tests

### Code Quality
- `mise run lint` - Lint all code
- `mise run format` - Format all code
- `mise run typecheck` - Type check TypeScript and Python

### Database
- `mise run db:start` - Start PostgreSQL
- `mise run api:migrate` - Apply migrations
- `mise run api:migration "message"` - Create new migration

### Utilities
- `mise run setup` - Complete project setup
- `mise run clean` - Clean build artifacts
- `mise run check` - Verify tool availability
- `mise run ci` - Run full CI pipeline locally

## Important Rules

### Python Development
- **ALWAYS** use `uv` for Python operations (never pip/poetry/conda)
- Python version: 3.13.7+
- Virtual environment managed by uv

### JavaScript Development
- **ALWAYS** use `bun` for JS/TS operations (never npm/yarn)
- Node version: 22+ required
- Frontend uses Vite + React + TypeScript

### Codex Best Practices
1. Use **speed** profile for routine tasks
2. Switch to **depth** profile for:
   - Complex debugging
   - Architecture decisions
   - Performance optimization
3. Use **permissive** profile for:
   - Dependency updates
   - Scaffolding
   - Rapid prototyping

## Refreshing Configuration

To update Codex configuration based on latest system patterns:
```bash
codex "Read ~/Projects/verlyn13/system-setup/PROJECT-AGENT-BOOTSTRAP.md and update project configuration"
```

## Security Notes
- API key stored in gopass at `codex/openai/api-key`
- Never commit secrets or API keys
- Use environment variables for sensitive config
- Agent has limited access to gopass paths

## Getting Help
- Check `./AGENTS.md` for project-specific details
- Review `~/.codex/config.toml` for available profiles
- Run `mise tasks` to see all available tasks
- Use `codex --help` for CLI options

---

**Last Updated**: September 2025
**Python**: 3.13.7+
**Node**: 22+
**Codex**: GPT-5 models
**Task Runner**: mise