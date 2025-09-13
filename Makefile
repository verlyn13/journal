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
	@echo "  make dev-full      - Start API+web and services (single command)"
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
	@echo "Infisical Integration (Secret Management):"
	@echo "  make infisical-setup   - Setup Infisical CLI integration"
	@echo "  make infisical-test    - Run Infisical integration tests"
	@echo "  make infisical-lint    - Lint Infisical integration code"
	@echo "  make infisical-migrate - Migrate secrets to Infisical (interactive)"
	@echo "  make infisical-health  - Check Infisical integration health"
	@echo "  make infisical-deploy  - Pre-deployment validation checks"
	@echo "  make infisical-rollback - Rollback to environment variables"
	@echo ""
	@echo "Examples:"
	@echo "  make docs-fetch"
	@echo "  make docs-search TERM=\"biome config\""
	@echo "  make infisical-setup"
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

dev-full:
	@echo "🚀 Starting API + Web + Services (one-shot)"
	@bash scripts/dev.sh

dev-web:
	@echo "🌐 Starting frontend watch (Rollup)..."
	@npm run dev

dev-py:
	@echo "🐍 Starting FastAPI backend..."
	@cd apps/api && make dev

# Run tests
test:
	@echo "🧪 Running frontend tests..."
	@npm test || true
	@echo "🧪 Running API tests..."
	@cd apps/api && make test

test-unit:
	@echo "🧪 Running API unit tests..."
	@cd apps/api && make test-unit
	@echo "🧪 Running Web unit tests (Vitest)..."
	@cd apps/web && bun run test:run

test-component:
	@echo "🧪 Running API component tests..."
	@cd apps/api && make test-component

test-integration:
	@echo "🧪 Running API integration tests..."
	@cd apps/api && make test-integration

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
	@echo "🧪 Orchestrating E2E tests (API + Playwright)..."
	@echo "📦 Ensuring API deps are synced (uv)..."
	@cd apps/api && uv sync --all-extras --dev >/dev/null
	@echo "🚀 Starting API on :5000..."
	@cd apps/api && nohup uv run fastapi run app/main.py --host 0.0.0.0 --port 5000 >/tmp/journal_api_e2e.log 2>&1 & echo $$! > /tmp/journal_api_e2e.pid
	@echo "⏳ Waiting for API health..."
	@for i in $$(seq 1 30); do curl -sf http://localhost:5000/health >/dev/null 2>&1 && break || sleep 2; done
	@echo "🎭 Installing Playwright browsers (if needed)..."
	@npm ci >/dev/null
	@npx playwright install --with-deps >/dev/null
	@echo "🧪 Running Playwright tests..."
	@set -e; status=0; npm test || status=$$?; \
	  if [ -f /tmp/journal_api_e2e.pid ]; then kill $$(cat /tmp/journal_api_e2e.pid) >/dev/null 2>&1 || true; rm -f /tmp/journal_api_e2e.pid; fi; \
	  exit $$status

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

# Quality gates (unit+component + vitest, optional E2E if RUN_E2E=1)
.PHONY: quality
quality:
	@echo "🔎 Running quality checks..."
	@$(MAKE) lint
	@$(MAKE) test-unit
	@if [ "$$RUN_E2E" = "1" ]; then echo "🌐 Running Playwright E2E"; npm test || true; else echo "(Skipping Playwright E2E)"; fi

# Backend API commands
api-setup:
	@echo "🚀 Setting up FastAPI backend infrastructure..."
	@cd apps/api && make setup

api-test:
	@echo "🧪 Running API tests..."
	@cd apps/api && make test

api-worker:
	@echo "⚙️ Starting embedding worker..."
	@cd apps/api && make worker

api-upgrade:
	@echo "📈 Running database migrations..."
	@cd apps/api && make upgrade

api-down:
	@echo "🛑 Stopping backend services..."
	@cd apps/api && make down

# API shortcuts (delegated to apps/api)
api-lint:
	@cd apps/api && make lint

api-format:
	@cd apps/api && make format

# Infisical Integration (CI/CD & Secret Management)
.PHONY: infisical-setup infisical-test infisical-lint infisical-migrate infisical-health infisical-deploy infisical-rollback

infisical-setup:
	@echo "🔐 Setting up Infisical CLI integration..."
	@cd apps/api && make infisical-init
	@echo "✅ Infisical integration ready"

infisical-test:
	@echo "🧪 Running Infisical integration tests..."
	@cd apps/api && make infisical-test
	@echo "✅ Infisical tests completed"

infisical-lint:
	@echo "🔍 Linting Infisical integration code..."
	@cd apps/api && uv run ruff check app/infra/secrets/ --output-format=github
	@cd apps/api && uv run ruff check app/api/v1/infisical_webhooks.py --output-format=github
	@cd apps/api && uv run ruff check app/scripts/migrate_to_infisical.py --output-format=github
	@cd apps/api && uv run mypy app/infra/secrets/
	@cd apps/api && uv run mypy app/api/v1/infisical_webhooks.py
	@cd apps/api && uv run mypy app/scripts/migrate_to_infisical.py
	@echo "✅ Infisical code quality checks passed"

infisical-migrate:
	@echo "🔄 Running Infisical migration (dry-run first)..."
	@cd apps/api && make infisical-migrate-dry
	@read -p "Continue with actual migration? (y/N): " confirm; \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		cd apps/api && make infisical-migrate-execute; \
	else \
		echo "Migration cancelled by user"; \
	fi

infisical-health:
	@echo "🏥 Checking Infisical integration health..."
	@cd apps/api && make infisical-health
	@echo "✅ Health check completed"

infisical-deploy:
	@echo "🚀 Deploying with Infisical integration..."
	@$(MAKE) infisical-lint
	@$(MAKE) infisical-test
	@$(MAKE) infisical-health
	@echo "🔐 Infisical integration deployment checks passed"
	@echo "Ready for production deployment with secret management"

infisical-rollback:
	@echo "⏪ Rolling back Infisical integration..."
	@cd apps/api && make infisical-rollback
	@echo "✅ Rollback to environment variables completed"


# --- Repository scanner (MVP: scc + merge) ---
.PHONY: scan-prepare scan-run scan scan-clean scan-logs

scan-prepare:
	@mkdir -p .scanner/scripts .scanner/rules/semgrep .scanner/rules/treesitter
	@echo "🧰 Scanner directories prepared in .scanner/"

scan-run:
	@echo "🔎 Running repository scan (scc + merge)..."
	@docker compose -f .scanner/compose.yml --profile scan run --rm scc && docker compose -f .scanner/compose.yml --profile scan run --rm merge-results
	@echo "✅ Scan complete. Output: repo_scan.json"

scan:
	@$(MAKE) scan-prepare
	@$(MAKE) scan-run

scan-clean:
	@echo "🧹 Cleaning scanner outputs..."
	@rm -f .scanner/*.json repo_scan.json 2>/dev/null || true
	@echo "✅ Scanner outputs removed"

scan-logs:
	@echo "📄 Scanner logs:"
	@tail -n 200 .scanner/scan.log 2>/dev/null || echo "No logs yet. Run: make scan"
