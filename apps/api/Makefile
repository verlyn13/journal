dev:
	uv run fastapi dev app/main.py

run:
	uv run fastapi run app/main.py --host 0.0.0.0 --port 8000

test:
	uv run pytest -q

test-unit:
	uv run pytest -q -m "unit"

test-component:
	uv run pytest -q -m "component"

test-integration:
	# Ensure services are up: docker compose up -d db nats
	TEST_DB_URL=${TEST_DB_URL:-postgresql+asyncpg://journal:journal@localhost:5433/journal_test} \
	uv run pytest -q -m "integration"

test-all:
	uv run pytest -q -m "unit or component or integration"

# Database migrations
db-revision:
	uv run alembic revision --autogenerate -m "$(m)"

db-upgrade:
	uv run alembic -c alembic.ini upgrade head

db-downgrade:
	uv run alembic -c alembic.ini downgrade -1

# Worker processes
worker:
	uv run python -m app.workers.embedding_consumer

# Code quality - Python linting
lint:
	@echo "Running Python linters with autofix..."
	uv run ruff check . --fix
	uv run ruff format .

lint-check:
	@echo "Checking Python lint issues (no fix)..."
	uv run ruff check .
	uv run ruff format --check .

lint-fix:
	@echo "Applying all Python autofixes..."
	uv run ruff check . --fix --unsafe-fixes
	uv run ruff format .

# Type checking
types:
	@echo "Running mypy type checker..."
	uv run mypy app

types-strict:
	@echo "Running mypy with strict mode..."
	uv run mypy app --strict

# Development setup
setup:
	docker compose up -d
	sleep 5
	make db-upgrade

# Clean shutdown
down:
	docker compose down

# Full reset
reset:
	docker compose down -v
	docker compose up -d
	sleep 5
	make db-upgrade

# Install dependencies
install:
	uv sync --all-extras --dev

# Infisical integration targets
infisical-auth:
	@echo "🔑 Authenticating with Infisical..."
	@infisical login --domain=https://secrets.jefahnierocks.com

infisical-init:
	@echo "🚀 Initializing Infisical project..."
	@infisical init --project-id=d01f583a-d833-4375-b359-c702a726ac4d

infisical-secrets-list:
	@echo "📋 Listing Infisical secrets..."
	@infisical secrets list --project-id=d01f583a-d833-4375-b359-c702a726ac4d --format=table

infisical-secrets-get:
	@echo "🔍 Getting secret: $(SECRET_NAME)"
	@if [ -z "$(SECRET_NAME)" ]; then echo "❌ Usage: make infisical-secrets-get SECRET_NAME=your_secret"; exit 1; fi
	@infisical secrets get $(SECRET_NAME) --project-id=d01f583a-d833-4375-b359-c702a726ac4d

infisical-secrets-set:
	@echo "💾 Setting secret: $(SECRET_NAME)"
	@if [ -z "$(SECRET_NAME)" ] || [ -z "$(SECRET_VALUE)" ]; then \
		echo "❌ Usage: make infisical-secrets-set SECRET_NAME=your_secret SECRET_VALUE=your_value"; \
		exit 1; \
	fi
	@infisical secrets set $(SECRET_NAME) $(SECRET_VALUE) --project-id=d01f583a-d833-4375-b359-c702a726ac4d

infisical-health:
	@echo "🩺 Checking Infisical connection health..."
	@curl -s http://localhost:8000/api/v1/infisical/health | python -m json.tool

infisical-rotate-jwt:
	@echo "🔄 Triggering JWT key rotation..."
	@curl -X POST http://localhost:8000/api/v1/infisical/rotate \
		-H "Content-Type: application/json" \
		-d '{"rotation_type": "jwt", "force": false, "reason": "Manual rotation via Makefile"}' | \
		python -m json.tool

infisical-rotate-aes:
	@echo "🔄 Triggering AES key rotation..."
	@curl -X POST http://localhost:8000/api/v1/infisical/rotate \
		-H "Content-Type: application/json" \
		-d '{"rotation_type": "aes", "force": false, "reason": "Manual rotation via Makefile"}' | \
		python -m json.tool

infisical-rotate-all:
	@echo "🔄 Triggering full key rotation..."
	@curl -X POST http://localhost:8000/api/v1/infisical/rotate \
		-H "Content-Type: application/json" \
		-d '{"rotation_type": "both", "force": false, "reason": "Manual full rotation via Makefile"}' | \
		python -m json.tool

infisical-cache-clear:
	@echo "🧹 Clearing Infisical cache..."
	@curl -X POST http://localhost:8000/api/v1/infisical/cache/invalidate | python -m json.tool

infisical-migrate:
	@echo "📦 Migrating keys to Infisical..."
	@uv run python -c "
	import asyncio
	from app.infra.db import get_db_session
	from app.infra.sessions import get_redis
	from app.infra.secrets import InfisicalSecretsClient
	from app.infra.secrets.enhanced_key_manager import InfisicalKeyManager
	
	async def migrate():
		redis = await get_redis()
		infisical_client = InfisicalSecretsClient.from_env(redis)
		async with get_db_session() as session:
			key_manager = InfisicalKeyManager(session, redis, infisical_client)
			result = await key_manager.migrate_keys_to_infisical()
			print(f'Migration result: {result}')
			await redis.close()
	
	asyncio.run(migrate())
	"

# Infisical development workflow
infisical-dev-setup: infisical-auth infisical-init
	@echo "✅ Infisical development setup complete"

infisical-dev-check: infisical-health infisical-secrets-list
	@echo "✅ Infisical development check complete"

# Environment setup for Infisical
infisical-env-template:
	@echo "📝 Creating Infisical environment template..."
	@printf '# Infisical Configuration\n' > .env.infisical.template
	@printf 'JOURNAL_INFISICAL_ENABLED=true\n' >> .env.infisical.template
	@printf 'JOURNAL_INFISICAL_PROJECT_ID=d01f583a-d833-4375-b359-c702a726ac4d\n' >> .env.infisical.template
	@printf 'JOURNAL_INFISICAL_SERVER_URL=https://secrets.jefahnierocks.com\n' >> .env.infisical.template
	@printf 'JOURNAL_INFISICAL_CACHE_TTL=300\n' >> .env.infisical.template
	@printf 'JOURNAL_INFISICAL_WEBHOOK_SECRET=your_webhook_secret_here\n' >> .env.infisical.template
	@printf 'JOURNAL_INFISICAL_TIMEOUT=30.0\n' >> .env.infisical.template
	@printf 'JOURNAL_INFISICAL_MAX_RETRIES=3\n' >> .env.infisical.template
	@printf 'JOURNAL_INFISICAL_RETRY_DELAY=1.0\n' >> .env.infisical.template
	@printf '\n' >> .env.infisical.template
	@printf '# Infisical CLI Environment Variables\n' >> .env.infisical.template
	@printf 'INFISICAL_API_URL=https://secrets.jefahnierocks.com\n' >> .env.infisical.template
	@printf 'INFISICAL_PROJECT_ID=d01f583a-d833-4375-b359-c702a726ac4d\n' >> .env.infisical.template
	@printf '# INFISICAL_TOKEN=your_machine_identity_token_here\n' >> .env.infisical.template
	@echo "✅ Template created: .env.infisical.template"
	@echo "📋 Copy to .env and update values as needed"

# Testing with Infisical
test-infisical:
	@echo "🧪 Running Infisical integration tests..."
	@JOURNAL_INFISICAL_ENABLED=true uv run pytest -q tests/ -k "infisical" -v

# Full Infisical workflow test
infisical-workflow-test:
	@echo "🔄 Testing complete Infisical workflow..."
	@$(MAKE) infisical-health
	@$(MAKE) infisical-rotate-jwt
	@sleep 2
	@$(MAKE) infisical-rotate-aes
	@sleep 2
	@$(MAKE) infisical-cache-clear
	@$(MAKE) infisical-health
	@echo "✅ Infisical workflow test complete"
