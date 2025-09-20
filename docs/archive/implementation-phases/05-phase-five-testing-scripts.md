---
id: 05-phase-five-testing-scripts
title: 'Implementation Plan: Phase 5 - Initial Testing & Basic Scripts'
type: testing
version: 1.0.0
created: '2025-09-09'
updated: '2025-09-09'
author: Journal Team
tags:
- testing
priority: medium
status: approved
visibility: internal
schema_version: v1
---

***

title: "Implementation Plan: Phase 5 - Initial Testing & Basic Scripts"
description: "Phase 5 implementation plan for the Flask Journal MVP, covering writing initial unit and integration tests, and creating basic deployment and backup scripts."
category: "Implementation Plan"
related\_topics:
\- "Implementation Plan: Phase 4 - Deployment & Testing Setup" # Link to ./04-phase-four-deploy-test-setup.md
\- "Flask Journal MVP Scope Definition" # Link to ../initial-planning/mvp-high-level-implementation-guide.md
\- "Testing Guide" # Link to ../initial-planning/testing.md
\- "Deployment Script Guide" # Link to ../initial-planning/deployment-script-guide.md
version: "1.0"
tags:
\- "implementation"
\- "phase 5"
\- "testing"
\- "uv run pytest"
\- "unit testing"
\- "integration testing"
\- "deployment"
\- "backup"
\- "scripts"
\- "mvp"
--------

# Implementation Plan: Phase 5 - Initial Testing & Basic Scripts

## Goal

The primary goal of Phase 5 is to build confidence in the application's core functionality by writing initial unit and integration tests using the Pytest framework set up in Phase 4, and to create basic helper scripts for deployment and database backup.

## Prerequisites

- Completion of Phase 4 (Deployment & Testing Setup).
- Familiarity with the overall project goals and architecture outlined in:
- [Flask Journal MVP Scope Definition](../initial-planning/mvp-high-level-implementation-guide.md)
- [Testing Guide](../initial-planning/testing.md)
- [Deployment Script Guide](../initial-planning/deployment-script-guide.md)
- Pytest and Pytest-Cov installed and configured.

## Implementation Steps

**Part 1: Initial Test Implementation**

1. **Unit Tests - Models (`tests/unit/test_models.py`):**

- Create directory `tests/unit/`.
- Create `tests/unit/test_models.py`.
- Write tests for `User` model:
- Test password setting (`set_password`) and checking (`check_password`) with correct and incorrect passwords.
- Test basic instance creation.
- Write tests for `Entry` model:
- Test basic instance creation and default timestamp.
- Test relationship loading (requires creating a user and entry within a test context/session).
- *Utilize the `db_session` fixture from `conftest.py` if database interaction is needed for relationship tests.*

2. **Unit Tests - Forms (`tests/unit/test_forms.py`):**

- Create `tests/unit/test_forms.py`.
- Write tests for `RegistrationForm`:
- Test validation success with valid data.
- Test validation failures (missing fields, invalid email, mismatched passwords).
- Write tests for `LoginForm`:
- Test validation success with valid data.
- Test validation failures (missing fields).
- Write tests for `EntryForm`:
- Test validation success with valid data.
- Test validation failures (missing fields, length constraints if applicable).
- *These tests typically don't need app context or DB access.*

3. **Integration Tests - Auth (`tests/integration/test_auth.py`):**

- Create directory `tests/integration/`.
- Create `tests/integration/test_auth.py`.
- Write tests using the `test_client` fixture:
- Test accessing `/auth/register` (GET).
- Test successful registration (POST to `/auth/register`, check for redirect, check user exists in DB). *Consider adding a fixture to create a user directly for login tests.*
- Test registration failure (e.g., duplicate username/email).
- Test accessing `/auth/login` (GET).
- Test successful login (POST to `/auth/login` with valid credentials created via fixture/previous test, check for redirect, check `current_user` context if possible or session state).
- Test login failure (POST with invalid credentials).
- Test logout (access `/auth/logout` when logged in, check for redirect, check subsequent requests are anonymous).

4. **Integration Tests - Basic CRUD (`tests/integration/test_crud.py`):**

- Create `tests/integration/test_crud.py`.
- *Requires an authenticated client fixture.* Add a fixture in `conftest.py` that creates a user, logs them in, and yields the client.
- Write tests using the authenticated client:
- Test accessing `/index` (GET, should succeed).
- Test accessing `/new_entry` (GET).
- Test successful entry creation (POST to `/new_entry`, check redirect, check entry exists in DB for the user).
- Test viewing an owned entry (`/entry/<id>`, GET).
- Test editing an owned entry (GET `/edit_entry/<id>`, POST with changes, check redirect, check DB).
- Test deleting an owned entry (POST to `/delete_entry/<id>`, check redirect, check entry removed from DB).
- Test accessing non-owned entry/edit/delete results in 403.
- Test accessing non-existent entry results in 404.

5. **Run Pytest:**

- Run `uv run pytest` frequently while writing tests.
- Monitor test coverage using the `--cov` report. Aim to cover core logic paths.

**Part 2: Basic Helper Scripts**

6. **Create Deployment Script (`scripts/deploy.sh`):**

- Create the `scripts/` directory if it doesn't exist.
- Create `scripts/deploy.sh`.
- Add basic commands (adapt paths as needed):
  \`\`\`bash
  \#!/bin/bash
  set -e # Exit immediately if a command exits with a non-zero status.

  ````
  echo "Starting deployment..."

  # Navigate to project directory (adjust path if script is run from elsewhere)
  # cd /home/verlyn13/Projects/journal || exit

  echo "Pulling latest changes..."
  git pull origin main # Or your default branch

  echo "Activating virtual environment..."
  source .venv/bin/activate

  echo "Installing/updating dependencies..."
  uv pip install -r requirements.txt

  echo "Applying database migrations..."
  flask db upgrade

  echo "Restarting application service..."
  sudo systemctl restart journal.service # Assumes service name is 'journal'

  echo "Deployment finished."
  ```
  ````
- Make the script executable: `chmod +x scripts/deploy.sh`.

7. **Create Backup Script (`scripts/backup.sh`):**

- Create `scripts/backup.sh`.
- Add basic PostgreSQL backup command (adapt paths):
  \`\`\`bash
  \#!/bin/bash
  set -e

  ````
  BACKUP_DIR="/home/verlyn13/journal_backups" # CHANGE THIS path
  DB_PATH="/home/verlyn13/Projects/journal/journal" # CHANGE THIS path
  TIMESTAMP=$(date +%Y%m%d%H%M%S)
  BACKUP_FILENAME="journal_backup_${TIMESTAMP}"

  echo "Starting backup..."

  # Create backup directory if it doesn't exist
  mkdir -p "${BACKUP_DIR}"

  echo "Backing up database to ${BACKUP_DIR}/${BACKUP_FILENAME}..."
  PostgreSQL "${DB_PATH}" ".backup '${BACKUP_DIR}/${BACKUP_FILENAME}'"

  echo "Backup finished."

  # Optional: Add cleanup for old backups (e.g., keep last 7)
  # find "${BACKUP_DIR}" -name 'journal_backup_*' -mtime +7 -exec rm {} \;
  # echo "Old backups cleaned up."
  ```
  ````
- Make the script executable: `chmod +x scripts/backup.sh`.
- *Note:* User needs to create the `BACKUP_DIR` manually or ensure the script has permissions.

## Testing Considerations (Phase 5)

- Run `pytest --cov` to ensure tests pass and check coverage improvements.
- Manually review the created `deploy.sh` and `backup.sh` scripts for correctness (paths, commands). *Actual execution of these scripts is often done manually or via CI/CD, not typically automated within this phase.*

## Next Steps (Phase 6 / Final MVP)

- Final code review and cleanup.
- Documentation refinement (README updates).
- Final manual testing of the deployed application.
- Declare MVP complete.
