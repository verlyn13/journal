#!/bin/bash
# Verify Python 3.13 and Ruff 0.13.0 consistency across the project

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Python & Ruff Consistency Verification"
echo "========================================="
echo

ERRORS=0

# Check Python version in pyproject.toml files
echo "Checking pyproject.toml files..."
for file in $(find . -name "pyproject.toml" -not -path "*/node_modules/*" -not -path "*/.venv/*"); do
    if grep -q 'requires-python' "$file"; then
        version=$(grep 'requires-python' "$file" | grep -o '[0-9]\.[0-9]*')
        if [ "$version" != "3.13" ]; then
            echo -e "${RED}✗${NC} $file: Python version is $version, expected 3.13"
            ((ERRORS++))
        else
            echo -e "${GREEN}✓${NC} $file: Python 3.13"
        fi
    fi
done
echo

# Check Python version in Dockerfiles
echo "Checking Dockerfiles..."
for file in $(find . -name "Dockerfile*" -not -path "*/node_modules/*"); do
    if grep -q 'FROM.*python' "$file"; then
        if ! grep -q 'python:3.13' "$file"; then
            echo -e "${RED}✗${NC} $file: Not using Python 3.13"
            ((ERRORS++))
        else
            echo -e "${GREEN}✓${NC} $file: Python 3.13"
        fi
    fi
done
echo

# Check Python version in GitHub workflows
echo "Checking GitHub workflows..."
for file in .github/workflows/*.yml; do
    if [ -f "$file" ]; then
        name=$(basename "$file")
        if grep -q 'python' "$file"; then
            # Check for any non-3.13 versions
            if grep -E 'python.*3\.(11|12)' "$file" > /dev/null; then
                echo -e "${RED}✗${NC} $name: Contains old Python version"
                ((ERRORS++))
            elif grep -E 'python.*3\.13|PYTHON_VERSION.*3\.13' "$file" > /dev/null; then
                echo -e "${GREEN}✓${NC} $name: Python 3.13"
            fi
        fi
    fi
done
echo

# Check Ruff configuration
echo "Checking Ruff configuration..."
if [ -f "apps/api/pyproject.toml" ]; then
    cd apps/api

    # Check Ruff version in dependencies
    if grep -q 'ruff>=0.13.0' pyproject.toml; then
        echo -e "${GREEN}✓${NC} Ruff 0.13.0 in dependencies"
    else
        echo -e "${RED}✗${NC} Ruff version incorrect in dependencies"
        ((ERRORS++))
    fi

    # Check installed Ruff version
    RUFF_VERSION=$(uv run ruff --version 2>/dev/null | grep -o '[0-9]\.[0-9]*\.[0-9]*')
    if [ "$RUFF_VERSION" = "0.13.0" ]; then
        echo -e "${GREEN}✓${NC} Ruff 0.13.0 installed"
    else
        echo -e "${YELLOW}⚠${NC} Ruff $RUFF_VERSION installed (expected 0.13.0)"
    fi

    # Check preview settings
    if uv run ruff check . --show-settings 2>&1 | grep -q "linter.preview = enabled"; then
        echo -e "${GREEN}✓${NC} Preview mode enabled"
    else
        echo -e "${RED}✗${NC} Preview mode not enabled"
        ((ERRORS++))
    fi

    if uv run ruff check . --show-settings 2>&1 | grep -q "linter.explicit_preview_rules = true"; then
        echo -e "${GREEN}✓${NC} Explicit preview rules enabled"
    else
        echo -e "${RED}✗${NC} Explicit preview rules not enabled"
        ((ERRORS++))
    fi

    cd ../..
fi
echo

# Check Ruff GitHub Action version
echo "Checking Ruff GitHub Action..."
if grep -q 'astral-sh/ruff-action@v3' .github/workflows/lint.yml; then
    echo -e "${GREEN}✓${NC} Using official Ruff Action v3"
    if grep -q 'version: "0.13.0"' .github/workflows/lint.yml; then
        echo -e "${GREEN}✓${NC} Ruff Action pinned to 0.13.0"
    else
        echo -e "${RED}✗${NC} Ruff Action not pinned to 0.13.0"
        ((ERRORS++))
    fi
else
    echo -e "${RED}✗${NC} Not using official Ruff Action"
    ((ERRORS++))
fi
echo

# Summary
echo "========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    echo "Python 3.13 and Ruff 0.13.0 are consistently configured."
else
    echo -e "${RED}Found $ERRORS inconsistencies!${NC}"
    echo "Please review and fix the issues above."
    exit 1
fi
echo "========================================="