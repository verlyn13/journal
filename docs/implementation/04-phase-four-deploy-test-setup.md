---
title: "Implementation Plan: Phase 4 - Deployment & Testing Setup"
description: "Phase 4 implementation plan for the Flask Journal MVP, covering basic deployment setup using Gunicorn and systemd, and initial testing setup with Pytest."
category: "Implementation Plan"
related_topics:
      - "Implementation Plan: Phase 3 - UI Refinements" # Link to ./03-phase-three-ui-refinements.md
      - "Flask Journal MVP Scope Definition" # Link to ../initial-planning/mvp-high-level-implementation-guide.md
      - "Deployment Script Guide" # Link to ../initial-planning/deployment-script-guide.md
      - "Testing Guide" # Link to ../initial-planning/testing.md
version: "1.0"
tags:
      - "implementation"
      - "phase 4"
      - "deployment"
      - "systemd"
      - "gunicorn"
      - "testing"
      - "pytest"
      - "mvp"
---

# Implementation Plan: Phase 4 - Deployment & Testing Setup

## Goal

The primary goal of Phase 4 is to establish the basic infrastructure for deploying the application as a service using Gunicorn and systemd, and to set up the testing framework (Pytest) with initial configurations and fixtures.

## Prerequisites

-   Completion of Phase 3 ([UI Refinements](./03-phase-three-ui-refinements.md)).
-   Familiarity with the overall project goals and architecture outlined in:
-   [Flask Journal MVP Scope Definition](../initial-planning/mvp-high-level-implementation-guide.md)
-   [Deployment Script Guide](../initial-planning/deployment-script-guide.md)
-   [Testing Guide](../initial-planning/testing.md)
-   Gunicorn should be installed (added in Phase 1 planning, verify).
-   Access to the target deployment environment (Linux system with systemd, e.g., the Fedora laptop mentioned in planning).

## Implementation Steps

**Part 1: Basic Deployment Setup (Gunicorn & systemd)**

1.  **Verify Gunicorn Installation:**
-   Ensure `gunicorn` is listed in `requirements.txt`.
-   If not, add it and run `pip install -r requirements.txt`.
2.  **Test Gunicorn Manually:**
-   From the project root (`/home/verlyn13/Projects/journal`), activate the virtual environment (`source .venv/bin/activate`).
-   Run Gunicorn, binding it to the application entry point (`run:app` since we use `run.py` which calls `create_app`):
        ```bash
        gunicorn --workers=2 --bind=127.0.0.1:8000 run:app
        ```
        *(Note: Adjust workers/binding as needed. `run:app` assumes `run.py` creates an `app` instance globally or can be imported)*
-   Verify the application is accessible at `http://127.0.0.1:8000` and basic functionality works. Stop Gunicorn (Ctrl+C).
3.  **Create systemd Service File (`deployment/journal.service`):**
-   Create the `deployment` directory if it doesn't exist.
-   Create the file `deployment/journal.service` with the following content (adjust paths and user/group):
        ```ini
        [Unit]
        Description=Gunicorn instance to serve Flask Journal
        After=network.target

        [Service]
        User=verlyn13 # CHANGE THIS to the actual user running the app
        Group=verlyn13 # CHANGE THIS to the actual group
        WorkingDirectory=/home/verlyn13/Projects/journal # Absolute path to project root
        Environment="PATH=/home/verlyn13/Projects/journal/.venv/bin" # Add venv bin to PATH
        Environment="FLASK_APP=run.py"
        # Add other environment variables if needed (e.g., FLASK_ENV=production, SECRET_KEY from file/env)
        # EnvironmentFile=/home/verlyn13/Projects/journal/.env # Optional: Load from .env

        ExecStart=/home/verlyn13/Projects/journal/.venv/bin/gunicorn --workers 3 --bind unix:/tmp/journal.sock -m 007 run:app
        # Alternative: Bind to TCP port: ExecStart=/home/verlyn13/Projects/journal/.venv/bin/gunicorn --workers 3 --bind 0.0.0.0:8000 run:app

        Restart=always
        RestartSec=5s

        StandardOutput=journal # Log stdout to journald
        StandardError=journal  # Log stderr to journald
        SyslogIdentifier=flask-journal

        [Install]
        WantedBy=multi-user.target
        ```
-   *Note:* Using a Unix socket (`/tmp/journal.sock`) is common when proxying with Nginx/Apache, but binding to `0.0.0.0:8000` might be simpler for direct access MVP. Choose one `ExecStart`. Ensure the socket directory (`/tmp`) is writable or change the socket path.
4.  **Copy and Enable Service (on target machine):**
-   Copy the file: `sudo cp deployment/journal.service /etc/systemd/system/journal.service`
-   Reload systemd: `sudo systemctl daemon-reload`
-   Enable the service (to start on boot): `sudo systemctl enable journal.service`
-   Start the service: `sudo systemctl start journal.service`
5.  **Check Service Status and Logs:**
-   Check status: `sudo systemctl status journal.service` (Look for `active (running)`)
-   View logs: `journalctl -u journal.service -f`
-   Troubleshoot any errors found in the status or logs (permissions, paths, Gunicorn errors).
6.  **Configure Production Settings (Optional but Recommended):**
-   Create a `ProductionConfig` in `config.py` if not already done.
-   Set `FLASK_ENV=production` in the systemd service file or `.env`.
-   Ensure `SECRET_KEY` is securely loaded (e.g., from environment or `.env` specified in `EnvironmentFile`).

**Part 2: Basic Testing Setup (Pytest)**

7.  **Install Testing Dependencies:**
-   Add `pytest` and `pytest-cov` (for coverage) to `requirements.txt`.
-   Run `pip install pytest pytest-cov`.
8.  **Create Test Directory Structure:**
-   Create `tests/` directory at the project root if it doesn't exist.
-   Create `tests/__init__.py` (can be empty).
9.  **Configure Pytest (`pytest.ini`):**
-   Create `pytest.ini` at the project root:
        ```ini
        [pytest]
        minversion = 6.0
        testpaths = tests
        python_files = test_*.py
        addopts = -ra -q --cov=journal --cov-report=term-missing
        ```
        *(Adjust `--cov=journal` if your main package name is different)*
10. **Create Basic Test Fixtures (`tests/conftest.py`):**
-   Create `tests/conftest.py`.
-   Add fixtures for creating a test app instance and a test client:
        ```python
        import pytest
        from journal import create_app, db

        @pytest.fixture(scope='module')
        def test_app():
            """Create and configure a new app instance for each test module."""
            # Setup: Create app with testing config
            # Ensure you have a TestingConfig in config.py or adjust config name
            app = create_app('config.TestingConfig') # Assuming TestingConfig exists
            app.config.update({
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:", # Use in-memory DB
                "WTF_CSRF_ENABLED": False, # Disable CSRF for easier form testing
                "LOGIN_DISABLED": False # Ensure login is not globally disabled
            })

            with app.app_context():
                db.create_all() # Create tables for in-memory db

            yield app # Testing happens here

            # Teardown: Drop all tables
            with app.app_context():
                db.session.remove()
                db.drop_all()

        @pytest.fixture(scope='module')
        def test_client(test_app):
            """A test client for the app."""
            return test_app.test_client()

        # Add fixtures for db session, authenticated client etc. later as needed
        ```
-   *Note:* This assumes a `TestingConfig` exists in `config.py`. Create one if necessary, setting `TESTING = True`, using an in-memory SQLite DB, and disabling CSRF.
11. **Create Placeholder Test File (`tests/test_basic.py`):**
-   Create `tests/test_basic.py` to verify setup:
        ```python
        def test_app_exists(test_app):
            """Check if the test app fixture works."""
            assert test_app is not None

        def test_request_example(test_client):
            """Check if the test client works and can access a public page (e.g., login)."""
            response = test_client.get('/auth/login') # Adjust URL if needed
            assert response.status_code == 200
        ```
12. **Run Pytest:**
-   From the project root, run `pytest`.
-   Verify the placeholder tests pass and coverage report is generated.

## Testing Considerations (Phase 4)

-   Manually verify the systemd service starts, stops, restarts, and runs correctly after boot.
-   Check journald logs for errors.
-   Verify the basic Pytest setup runs without errors and detects the placeholder tests.

## Next Steps (Phase 5 Preview)

-   Writing actual unit and integration tests for models, services, and routes based on the setup in this phase.
-   Creating basic deployment and backup scripts.