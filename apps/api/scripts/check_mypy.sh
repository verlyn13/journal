#!/bin/bash
# Quick mypy check script for development

cd "$(dirname "$0")/.."

echo "Running mypy type checks..."
uv run mypy app

echo ""
echo "Summary:"
uv run mypy app 2>&1 | grep "^Found" || echo "mypy completed"