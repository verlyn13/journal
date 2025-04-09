# Contributing to Journal

Thank you for your interest in contributing to the Journal project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Contributing to Journal](#contributing-to-journal)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Getting Started](#getting-started)
  - [Development Workflow](#development-workflow)
  - [Pull Request Process](#pull-request-process)
  - [Coding Standards](#coding-standards)
    - [Python](#python)
    - [JavaScript](#javascript)
  - [Documentation Guidelines](#documentation-guidelines)
  - [Testing](#testing)

## Code of Conduct

We expect all contributors to follow our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before participating.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally: `git clone https://github.com/YOUR-USERNAME/journal.git`
3. **Add the upstream repository**: `git remote add upstream https://github.com/verlyn13/journal.git`
4. **Create a feature branch**: `git checkout -b feature/your-feature-name`

## Development Workflow

1. **Set up your development environment**:
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Install Node.js dependencies
   npm install
   ```

2. **Run the development server**:
   ```bash
   # Run Flask development server
   python run.py
   
   # In a separate terminal, run frontend build watcher
   npm run dev
   ```

3. **Make your changes**:
   - Write your code
   - Write or update tests
   - Write or update documentation

4. **Commit your changes**:
   - Follow [Conventional Commits](https://www.conventionalcommits.org/) format
   - Example: `feat(editor): add markdown preview toggle button`

5. **Keep your branch updated**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

## Pull Request Process

1. **Open a pull request** from your feature branch to the main repository
2. **Fill out the PR template** with all required information
3. **Pass all CI checks**:
   - Python tests must pass
   - Frontend build must succeed 
   - Documentation checks must pass
4. **Address review feedback** by making additional commits or amending existing ones
5. Once approved, your PR will be merged by a maintainer

## Coding Standards

### Python
- Follow PEP 8 style guide
- Write docstrings for all functions, classes, and modules
- Keep functions small and focused on a single responsibility
- Add type hints where appropriate

### JavaScript
- Follow the project's ESLint configuration
- Use ES6+ features appropriately
- Document functions using JSDoc comments

## Documentation Guidelines

- All new features should be documented
- Documentation lives in the `docs/` directory
- Follow the markdown formatting guidelines
- Include frontmatter in all markdown files with required fields
- Run markdown linting locally before submitting: `npm run lint:md`
- Check for broken links: `npm run lint:links`

## Testing

- Write tests for all new features and bug fixes
- Run tests locally before submitting: `pytest`
- Aim for high test coverage
- Include both unit and integration tests where appropriate

Thank you for contributing to Journal!