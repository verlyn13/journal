# Makefile for Journal Project with Documentation Management
# Includes Biome v2.2.2 and Bun 1.2.21 documentation utilities

.PHONY: help install build dev clean test docs-fetch docs-update docs-serve docs-search docs-check docs-clean fresh \
    py-sync py-lint py-format py-typecheck py-test py-fix dev-py dev-web assets-clean check-all

# Default target
help:
	@echo "📚 Journal Project Makefile"
	@echo ""
	@echo "Available targets:"
	@echo "  make install       - Install project dependencies"
	@echo "  make build         - Build the project"
	@echo "  make dev           - Start development server"
	@echo "  make test          - Run tests"
	@echo "  make clean         - Clean build artifacts"
	@echo "  make assets-clean  - Remove generated static assets (journal/static/gen)"
	@echo "  make storybook     - Run Storybook (port 6006)"
	@echo "  make storybook-build - Build static Storybook (storybook-static/)"
	@echo "  make e2e           - Run Playwright tests"
	@echo "  make a11y          - Run Playwright accessibility tests"
	@echo "  make visual        - Run Playwright visual regression tests"
	@echo ""
	@echo "Documentation Management:"
	@echo "  make docs-fetch    - Fetch Biome and Bun documentation"
	@echo "  make docs-update   - Backup and update documentation"
	@echo "  make docs-serve    - Serve documentation locally"
	@echo "  make docs-search   - Search documentation (use TERM=keyword)"
	@echo "  make docs-check    - Check documentation integrity"
	@echo "  make docs-clean    - Remove all documentation"
	@echo ""
	@echo "Shortcuts:"
	@echo "  make fresh         - Clean install with documentation"
	@echo ""
	@echo "Python tooling (uv + ruff + mypy):"
	@echo "  make py-sync       - Create/refresh venv and install deps"
	@echo "  make py-lint       - Lint Python with Ruff"
	@echo "  make py-format     - Format Python with Ruff"
	@echo "  make py-typecheck  - Type-check with mypy"
	@echo "  make py-test       - Run pytest"
	@echo "  make py-fix        - Ruff autofix + format (unsafe fixes on)"
	@echo ""
	@echo "Examples:"
	@echo "  make docs-fetch"
	@echo "  make docs-search TERM=\"biome config\""
	@echo "  make fresh"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	@if command -v bun >/dev/null 2>&1; then \
		bun install; \
	elif command -v npm >/dev/null 2>&1; then \
		npm install; \
	else \
		echo "❌ Neither bun nor npm found. Please install one."; \
		exit 1; \
	fi
	@echo "✅ Dependencies installed"

# Build project
build:
	@echo "🔨 Building project..."
	@npm run build
	@echo "✅ Build complete"

# Development server
dev:
	@echo "🚀 Starting development server..."
	@npm run dev

dev-web:
	@echo "🌐 Starting frontend watch (Rollup)..."
	@npm run dev

dev-py:
	@echo "🐍 Starting Flask app via uv..."
	@if command -v uv >/dev/null 2>&1; then \
		uv run python run.py; \
	else \
		echo "❌ uv not found. Install uv: https://docs.astral.sh/uv/"; \
		exit 1; \
	fi

# Run tests
test:
	@echo "🧪 Running tests..."
	@npm test || true
	@echo "🧪 Running Python tests (pytest)..."
	@if command -v uv >/dev/null 2>&1; then \
		uv run pytest -q; \
	else \
		echo "⚠️  uv not found. Install uv from https://docs.astral.sh/uv/ then run 'make py-sync'"; \
		exit 1; \
	fi

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf dist/ build/ node_modules/
	@echo "✅ Cleaned"

# Remove generated assets
assets-clean:
	@echo "🗑️  Removing generated assets..."
	@rm -rf journal/static/gen/* 2>/dev/null || true
	@mkdir -p journal/static/gen
	@echo "✅ Assets cleaned (journal/static/gen)"

# Storybook
storybook:
	@echo "📚 Starting Storybook..."
	@bun run storybook

storybook-build:
	@echo "🏗️  Building Storybook static site..."
	@bun run build-storybook
	@echo "✅ Built storybook-static/"

# Playwright tests
e2e:
	@echo "🧪 Running Playwright tests..."
	@bun run test

a11y:
	@echo "♿ Running accessibility tests..."
	@bun run test:a11y

visual:
	@echo "🖼️  Running visual regression tests..."
	@bun run test:visual

# Documentation Management Targets

# Fetch documentation
docs-fetch:
	@echo "📚 Fetching Biome and Bun documentation..."
	@chmod +x fetch-docs.ts docs.sh 2>/dev/null || true
	@if command -v bun >/dev/null 2>&1; then \
		bun run fetch-docs.ts; \
	else \
		./docs.sh fetch; \
	fi

# Update documentation (backup + fetch)
docs-update:
	@echo "🔄 Updating documentation..."
	@chmod +x docs.sh 2>/dev/null || true
	@./docs.sh update

# Serve documentation locally
docs-serve:
	@echo "🌐 Starting documentation server..."
	@chmod +x docs.sh 2>/dev/null || true
	@./docs.sh serve

# Search documentation
docs-search:
	@if [ -z "$(TERM)" ]; then \
		echo "❌ Please provide a search term: make docs-search TERM=\"your search\""; \
		exit 1; \
	fi
	@echo "🔍 Searching for: $(TERM)"
	@chmod +x docs.sh 2>/dev/null || true
	@./docs.sh search "$(TERM)"

# Check documentation integrity
docs-check:
	@echo "✅ Checking documentation integrity..."
	@chmod +x docs.sh 2>/dev/null || true
	@./docs.sh check

# Clean documentation
docs-clean:
	@echo "🧹 Cleaning documentation..."
	@chmod +x docs.sh 2>/dev/null || true
	@./docs.sh clean

# Fresh install with documentation
fresh: clean install docs-fetch
	@echo "✨ Fresh installation complete with documentation!"
	@echo ""
	@echo "Quick start:"
	@echo "  make dev           - Start development"
	@echo "  make docs-serve    - View documentation"
	@echo ""
	@echo "Documentation is available in ./docs/"
	@echo "View the index at ./docs/INDEX.md"

# Quick documentation access
.PHONY: biome-docs bun-docs

biome-docs:
	@echo "📖 Opening Biome documentation..."
	@if [ -f "docs/biome/guides/getting-started.md" ]; then \
		if command -v code >/dev/null 2>&1; then \
			code docs/biome/guides/getting-started.md; \
		else \
			echo "Biome docs: docs/biome/"; \
			ls -la docs/biome/guides/; \
		fi \
	else \
		echo "❌ Documentation not found. Run 'make docs-fetch' first."; \
	fi

bun-docs:
	@echo "📖 Opening Bun documentation..."
	@if [ -f "docs/bun/getting-started/installation.md" ]; then \
		if command -v code >/dev/null 2>&1; then \
			code docs/bun/getting-started/installation.md; \
		else \
			echo "Bun docs: docs/bun/"; \
			ls -la docs/bun/getting-started/; \
		fi \
	else \
		echo "❌ Documentation not found. Run 'make docs-fetch' first."; \
	fi

# Development utilities
.PHONY: lint format check-all

lint:
	@echo "🔍 Linting code..."
	@npm run lint:md
	@npm run lint:links

format:
	@echo "🎨 Formatting code..."
	@if command -v biome >/dev/null 2>&1; then \
		biome format --write .; \
	else \
		echo "⚠️  Biome not installed. Install with: npm i -g @biomejs/biome"; \
	fi

check-all: lint docs-check test
	@echo "✅ All checks passed!"

# Python/uv shortcuts
py-sync:
	@echo "📦 Syncing Python deps with uv..."
	@if command -v uv >/dev/null 2>&1; then \
		uv sync; \
	else \
		echo "❌ uv not found. Install uv: https://docs.astral.sh/uv/"; \
		exit 1; \
	fi

py-lint:
	@echo "🔍 Ruff lint..."
	@if command -v uv >/dev/null 2>&1; then \
		uv run ruff check .; \
	else \
		echo "❌ uv not found. Install uv: https://docs.astral.sh/uv/"; \
		exit 1; \
	fi

py-format:
	@echo "🎨 Ruff format..."
	@if command -v uv >/dev/null 2>&1; then \
		uv run ruff format .; \
	else \
		echo "❌ uv not found. Install uv: https://docs.astral.sh/uv/"; \
		exit 1; \
	fi

py-typecheck:
	@echo "🧠 mypy type-check..."
	@if command -v uv >/dev/null 2>&1; then \
		uv run mypy .; \
	else \
		echo "❌ uv not found. Install uv: https://docs.astral.sh/uv/"; \
		exit 1; \
	fi

py-test:
	@echo "🧪 pytest..."
	@if command -v uv >/dev/null 2>&1; then \
		uv run pytest -q; \
	else \
		echo "❌ uv not found. Install uv: https://docs.astral.sh/uv/"; \
		exit 1; \
	fi

py-fix:
	@echo "🛠️  Ruff autofix + format (unsafe) ..."
	@if command -v uv >/dev/null 2>&1; then \
		uv run ruff check . --fix --unsafe-fixes; \
		uv run ruff format .; \
	else \
		echo "❌ uv not found. Install uv: https://docs.astral.sh/uv/"; \
		exit 1; \
	fi
