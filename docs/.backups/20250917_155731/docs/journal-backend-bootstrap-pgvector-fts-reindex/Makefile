SHELL := /bin/bash

up:
	docker compose up -d

down:
	docker compose down -v

dev:
	fastapi dev app/main.py

migrate:
	alembic revision --autogenerate -m "auto"

upgrade:
	alembic upgrade head

lint:
	ruff check .

fmt:
	ruff format .

test:
	pytest -q

worker:
	uv run python -m app.workers.embedding_consumer
