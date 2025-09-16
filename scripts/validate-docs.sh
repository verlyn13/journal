#!/usr/bin/env bash
# Validate documentation for Python 3.13 and Ruff 0.13.0 alignment
set -euo pipefail

fail=0
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "Validating documentation alignment..."

# Check for stale references in docs (excluding historical ADRs and certain files)
echo "Checking for stale references..."
if rg -n --no-ignore-vcs -g '!**/site-packages/**' -g '!**/vendor/**' -g '!**/node_modules/**' -g '!*.lock' \
  -g '!docs/adr/*' -g '!docs/RUFF_*.md' -g '!docs/initial-planning/*' -g '!docs/guides/docstring-tools-report.md' \
  -g '!docs/guides/ci-cd-workflow.md' -g '!docs/dual-language-setup.md' -g '!docs/USER_MANAGEMENT_ORCHESTRATEV5.md' \
  -g '!docs/debugging/*' -g '!docs/status/*' -g '!docs/theme.md' -g '!docs/guides/python-docstring-standards.md' \
  -e 'Python 3\.1[12]\b' -e 'ruff 0\.12\.' \
  docs/ README.md CONTRIBUTING.md 2>/dev/null; then
  echo -e "${RED}❌ Docs contain stale references${NC}"
  fail=1
else
  echo -e "${GREEN}✅ No stale references in current docs${NC}"
fi

# Required Python 3.13 mentions
echo "Checking for Python 3.13 mentions..."
if ! rg -q 'Python 3\.13' README.md 2>/dev/null; then
  echo -e "${RED}❌ README.md missing Python 3.13 mention${NC}"
  fail=1
else
  echo -e "${GREEN}✅ README.md mentions Python 3.13${NC}"
fi

if [ -f "CONTRIBUTING.md" ]; then
  if ! rg -q '3\.13' CONTRIBUTING.md 2>/dev/null; then
    echo -e "${RED}❌ CONTRIBUTING.md missing Python 3.13 mention${NC}"
    fail=1
  else
    echo -e "${GREEN}✅ CONTRIBUTING.md mentions Python 3.13${NC}"
  fi
fi

if [ -f "docs/dev-setup.md" ]; then
  if ! rg -q 'Python 3\.13' docs/dev-setup.md 2>/dev/null; then
    echo -e "${RED}❌ docs/dev-setup.md missing Python 3.13 mention${NC}"
    fail=1
  else
    echo -e "${GREEN}✅ docs/dev-setup.md mentions Python 3.13${NC}"
  fi
fi

# Required Ruff 0.13.0 mentions
echo "Checking for Ruff 0.13.0 mentions..."
if ! rg -q 'Ruff 0.13.0' README.md 2>/dev/null && ! rg -q 'ruff.*0.13.0' README.md 2>/dev/null; then
  echo -e "${RED}❌ README.md missing Ruff 0.13.0 mention${NC}"
  fail=1
else
  echo -e "${GREEN}✅ README.md mentions Ruff 0.13.0${NC}"
fi

if [ -f "CONTRIBUTING.md" ]; then
  if ! rg -q 'Ruff 0.13.0' CONTRIBUTING.md 2>/dev/null && ! rg -q 'ruff.*0.13.0' CONTRIBUTING.md 2>/dev/null; then
    echo -e "${RED}❌ CONTRIBUTING.md missing Ruff 0.13.0 mention${NC}"
    fail=1
  else
    echo -e "${GREEN}✅ CONTRIBUTING.md mentions Ruff 0.13.0${NC}"
  fi
fi

if [ -f "docs/dev-setup.md" ]; then
  if ! rg -q 'Ruff 0.13.0' docs/dev-setup.md 2>/dev/null && ! rg -q 'ruff.*0.13.0' docs/dev-setup.md 2>/dev/null; then
    echo -e "${RED}❌ docs/dev-setup.md missing Ruff 0.13.0 mention${NC}"
    fail=1
  else
    echo -e "${GREEN}✅ docs/dev-setup.md mentions Ruff 0.13.0${NC}"
  fi
fi

# Summary
if [ $fail -eq 0 ]; then
  echo -e "${GREEN}✅ All documentation checks passed${NC}"
else
  echo -e "${RED}❌ Documentation validation failed${NC}"
  exit 1
fi