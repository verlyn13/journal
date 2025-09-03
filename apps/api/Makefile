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

# Code quality
lint:
	uv run ruff check app/ --fix
	uv run ruff format app/

lint-check:
	uv run ruff check app/
	uv run ruff format --check app/

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
	pip install -e .
