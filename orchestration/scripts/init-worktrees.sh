#!/bin/bash
set -euo pipefail

echo "🚀 Initializing Journal App Worktree Infrastructure"

# Validate we're in the repository root
if [ ! -d ".git" ] || [ ! -d "apps/web" ] || [ ! -d "apps/api" ]; then
  echo "❌ Error: Must run from journal-app repository root"
  exit 1
fi

# Clean existing worktrees if any
echo "🧹 Cleaning existing worktrees..."
git worktree prune
rm -rf worktrees/

# Create worktrees directory
mkdir -p worktrees

# Function to create and setup a worktree
create_worktree() {
  local name=$1
  local branch=$2
  local base=${3:-main}

  echo "📁 Creating worktree: $name (branch: $branch)"

  # Create branch if doesn't exist
  if ! git rev-parse --verify "$branch" >/dev/null 2>&1; then
    git checkout -b "$branch" "origin/$base" 2>/dev/null || \
    git checkout -b "$branch" "$base"
  fi

  # Create worktree
  git worktree add "worktrees/wt-$name" "$branch"

  # Setup worktree environment
  (
    cd "worktrees/wt-$name"

    # Install frontend dependencies with Bun
    echo "  📦 Installing frontend dependencies..."
    cd apps/web
    bun install --frozen-lockfile || bun install

    # Install backend dependencies with UV
    echo "  📦 Installing backend dependencies..."
    cd ../api
    uv sync

    # Create worktree context
    cd ../..
    cat > .worktree-context.json << EOF
{
  "name": "$name",
  "branch": "$branch",
  "base": "$base",
  "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "frontend_port": $((5173 + $(echo $name | cksum | cut -d' ' -f1) % 100)),
  "backend_port": $((5000 + $(echo $name | cksum | cut -d' ' -f1) % 100))
}
EOF
  )

  echo "  ✅ Worktree $name ready"
}

# Create main reference worktree (read-only)
create_worktree "main" "main" "main"

# Create development branch if doesn't exist
if ! git rev-parse --verify develop >/dev/null 2>&1; then
  git checkout -b develop main
  git push -u origin develop || echo "Note: Could not push develop branch (may already exist on remote)"
fi
create_worktree "develop" "develop" "main"

# Phase 1: Foundation worktrees
create_worktree "design-tokens" "refactor/design-tokens" "main"
create_worktree "motion-system" "refactor/motion-system" "main"  
create_worktree "component-arch" "refactor/component-architecture" "main"
create_worktree "accessibility" "refactor/accessibility-base" "main"

# Phase 2: Feature worktrees
create_worktree "materiality" "feat/m1-materiality" "main"
create_worktree "choreography" "feat/m2-choreography" "main"
create_worktree "auth-passkeys" "feat/m4-auth-passkeys" "main"
create_worktree "export-system" "feat/m5-export-share" "main"

# Integration worktree
create_worktree "integration" "integration/combined" "main"

echo "✨ Worktree infrastructure ready!"
git worktree list