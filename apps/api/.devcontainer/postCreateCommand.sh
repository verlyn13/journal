#!/bin/bash
set -e

echo "🚀 Running post-create setup..."

# Navigate to the API directory
cd /workspace/apps/api

# Install Python dependencies
echo "📦 Installing Python dependencies..."
uv sync --all-extras --dev

# Install pre-commit hooks
echo "🪝 Installing pre-commit hooks..."
uv run pre-commit install

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
until pg_isready -h postgres -p 5432 -U journal; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

until redis-cli -h redis ping; do
  echo "Waiting for Redis..."
  sleep 2
done

# Run database migrations
echo "🗄️ Running database migrations..."
uv run alembic upgrade head

# Create initial data if needed
echo "📝 Setting up initial data..."
# uv run python scripts/create_test_data.py (if we had this script)

echo "✅ Post-create setup complete!"
echo ""
echo "🎉 Your development environment is ready!"
echo ""
echo "Available commands:"
echo "  make dev      - Start the FastAPI development server"
echo "  make test     - Run the test suite"
echo "  make lint     - Run code quality checks"
echo "  make worker   - Start the embedding worker"
echo "  make upgrade  - Run database migrations"
echo ""
echo "Access your services:"
echo "  FastAPI:     http://localhost:8000"
echo "  API Docs:    http://localhost:8000/docs"
echo "  GraphQL:     http://localhost:8000/graphql"
echo "  PostgreSQL:  postgres://journal:journal@postgres:5432/journal"
echo "  Redis:       redis://redis:6379/0"
echo "  NATS:        nats://nats:4222"