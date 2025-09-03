#!/bin/bash
set -e

echo "🔄 Running post-start setup..."

# Navigate to the API directory
cd /workspace/apps/api

# Ensure services are healthy
echo "🏥 Checking service health..."

# Wait for PostgreSQL
until pg_isready -h postgres -p 5432 -U journal -q; do
  sleep 1
done

# Wait for Redis
until redis-cli -h redis ping > /dev/null 2>&1; do
  sleep 1
done

# Check if migrations are up to date
echo "🔍 Checking database migrations..."
if ! uv run alembic current | grep -q "head"; then
  echo "⚠️  Database migrations are not up to date. Running migrations..."
  uv run alembic upgrade head
else
  echo "✅ Database migrations are up to date."
fi

# Set up git hooks if not already set up
if [ ! -f .git/hooks/pre-commit ]; then
  echo "🪝 Setting up git hooks..."
  uv run pre-commit install
fi

echo "✅ Post-start setup complete!"