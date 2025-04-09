---
title: "Flask Journal MVP Scope Definition"
description: "Defines the core features included in the Minimum Viable Product (MVP) for the Flask Journal system, along with explicitly excluded features."
category: "Project Planning"
related_topics:
  - "Comprehensive Guide: Personal Flask Blog/Journal System"
  - "Agentic Orchestration Plan for Flask Journal MVP"
version: "1.0"
tags:
  - "mvp"
  - "scope"
  - "requirements"
  - "planning"
  - "flask"
  - "journal"
  - "crud"
  - "authentication"
  - "deployment"
  - "exclusions"
---


**MVP Definition:**

The core goal of the MVP is to have a functional, secure, single-user journal system running as a service, allowing the user to:

1.  Register (once) and log in securely.
2.  Create new journal entries (title, Markdown content).
3.  View a list of their entries.
4.  View a single entry's rendered content.
5.  Edit existing entries.
6.  Delete entries.
7.  Run the application reliably via systemd.
8.  Have basic data persistence (SQLite).
9.  Have a minimal, clean UI.

**MVP Exclusions (Deferred Features):**

*   Tags and tag-based filtering.
*   Public entries (`is_public` flag functionality).
*   Advanced Search (beyond basic title/content filtering if implemented simply).
*   Drafts (both client-side `localStorage` and server-side `EntryDraft` model/API).
*   Conflict Resolution (`EntryVersion` model and UI).
*   User Preferences (theme switching, editor mode saving, etc.).
*   LaTeX/MathJax rendering.
*   Separate API authentication (JWT) - rely solely on Flask-Login sessions.
*   Advanced caching (Redis cache service beyond sessions).
*   Complex deployment/rollback scripts (focus on basic deployment).
*   Encrypted backups (focus on basic DB backup).
*   Rate limiting.
*   UI Testing (focus on unit/integration for MVP).
*   File uploads.
*   Full HTMX/Alpine.js interactivity (use basic server-rendered pages with forms).

---

## Flask Journal MVP Scope Definition

### Stage 1: Project Foundation & Initial Setup

*   **Goal:** Create the basic project structure, initialize Flask, set up virtual environment, install core dependencies, and configure basic settings.
*   **Detailed Steps:**
    1.  **Create Project Directory:** `mkdir journal-app && cd journal-app`
    2.  **Initialize Git:** `git init`
    3.  **Create `.gitignore`:** Add common Python/Flask exclusions (`venv/`, `instance/`, `__pycache__/`, `*.pyc`, `.env`, `*.sqlite`, `*.db`, `htmlcov/`, `coverage.xml`).
    4.  **Create Virtual Environment:** `python -m venv venv`
    5.  **Activate Virtual Environment:** `source venv/bin/activate` (Linux/macOS) or `venv\Scripts\activate` (Windows).
    6.  **Install Core Dependencies:**
        *   `pip install Flask Flask-SQLAlchemy Flask-Migrate Flask-Login Flask-WTF Flask-Session redis python-dotenv Werkzeug gunicorn`
        *   *Note:* `Werkzeug` for password hashing (Argon2 support), `redis` for Flask-Session backend, `gunicorn` for deployment.
        *   Create initial `requirements.txt`: `pip freeze > requirements.txt`.
    7.  **Create Basic Application Structure:**
        *   `mkdir app app/routes app/models app/services app/templates app/static app/forms instance deployment scripts tests`
        *   Create `app/__init__.py`, `app/routes/__init__.py`, `app/models/__init__.py`, `app/services/__init__.py`, `app/forms/__init__.py`.
    8.  **Implement Basic Flask App Factory (`app/__init__.py`):**
        *   Import Flask, SQLAlchemy, LoginManager, CSRFProtect, Session.
        *   Initialize extensions (`db = SQLAlchemy()`, `login_manager = LoginManager()`, etc.).
        *   Define `create_app(config_name)` function.
        *   Load configuration (from `config.py` and `instance/config.py`).
        *   Initialize extensions with the app (`db.init_app(app)`, etc.).
        *   Configure `login_manager` (`login_view`, `user_loader` - initially stubbed).
        *   Return the `app` instance.
    9.  **Create Configuration Files (`config.py`, `instance/config.py`):**
        *   Define `Config`, `DevelopmentConfig`, `TestingConfig`, `ProductionConfig` classes in `config.py`.
        *   Include `SECRET_KEY`, `SQLALCHEMY_DATABASE_URI` (pointing to `instance/journal.db`), `SESSION_TYPE='redis'`, `SESSION_REDIS`, `WTF_CSRF_ENABLED=True`.
        *   Generate a strong `SECRET_KEY` (e.g., `python -c 'import secrets; print(secrets.token_hex())'`) and place it in `instance/config.py` or `.env`.
    10. **Create WSGI Entry Point (`wsgi.py`):**
        *   Import `create_app` from `app`.
        *   Create the application instance: `app = create_app()`.
    11. **Create `.env` File:** Add `FLASK_APP=wsgi.py`, `FLASK_ENV=development`, potentially `SECRET_KEY` (if not using `instance/config.py` for it).
    12. **Initial Commit:** `git add . && git commit -m "Initial project setup and Flask foundation"`

---

### Stage 2: Core Models & Database Setup

*   **Goal:** Define the essential database models (`User`, `Entry`) and set up database migrations.
*   **Detailed Steps:**
    1.  **Define User Model (`app/models/user.py`):**
        *   Import `db`, `UserMixin`, `generate_password_hash`, `check_password_hash`, `datetime`.
        *   Create `User` class inheriting `UserMixin`, `db.Model`.
        *   Define columns: `id`, `username` (unique), `email` (unique), `password_hash`, `created_at`.
        *   Implement `set_password(password)` using `generate_password_hash` (use `method='argon2'`).
        *   Implement `check_password(password)` using `check_password_hash`.
        *   Define `__repr__`.
    2.  **Define Entry Model (`app/models/content.py`):**
        *   Import `db`, `datetime`.
        *   Create `Entry` class inheriting `db.Model`.
        *   Define columns: `id`, `title`, `content` (Text), `created_at`, `updated_at`, `user_id` (ForeignKey to `user.id`).
        *   Define `__repr__`.
        *   Add `db.relationship` backref in `User` model for `entries`.
    3.  **Import Models:** Ensure models are imported in `app/models/__init__.py` or directly where `db` is used for migrations.
    4.  **Initialize Flask-Migrate:**
        *   `export FLASK_APP=wsgi.py` (or set environment variable).
        *   `flask db init` - Creates the `migrations/` directory.
    5.  **Create Initial Migration:**
        *   Ensure the database file path (`instance/journal.db`) directory exists (`mkdir instance` if needed).
        *   `flask db migrate -m "Initial migration; create user and entry tables"` - Generates the first migration script.
    6.  **Apply Initial Migration:**
        *   `flask db upgrade` - Creates the `instance/journal.db` file and the tables.
    7.  **Verify Database:** Use a tool like DB Browser for SQLite to inspect `instance/journal.db` and confirm tables exist.
    8.  **Commit Changes:** `git add . && git commit -m "Implement core User and Entry models; set up migrations"`
    9.  **Architectural Note (Timestamps):** Due to limitations and potential inconsistencies with timezone handling in SQLite (especially during testing), all timestamp columns (`created_at`, `updated_at`, `timestamp`) in the MVP will store **naive UTC** values (using `datetime.utcnow` as the default). Tests should verify these timestamps using a time delta comparison rather than exact matching to account for minor timing variations.

---

### Stage 3: Authentication System (Web MVP)

*   **Goal:** Implement user registration (for the first/only user) and login using Flask-Login and sessions stored in Redis.
*   **Detailed Steps:**
    1.  **Configure Flask-Login:**
        *   In `app/__init__.py`, set `login_manager.login_view = 'auth.login'`.
        *   Implement the actual `@login_manager.user_loader` function to load a user by ID from the DB.
    2.  **Implement Authentication Service (`app/services/auth_service.py`):**
        *   Create `AuthService` class.
        *   Implement `register_user(username, email, password)`: Checks for existing user, creates `User` object, hashes password using `set_password`, adds to DB session, commits. Return success/failure (simple boolean or basic dict for MVP).
        *   Implement `authenticate_user(username_or_email, password)`: Finds user, uses `check_password`, returns `User` object on success or `None` on failure.
    3.  **Create Authentication Forms (`app/forms/auth_forms.py`):**
        *   Import `FlaskForm`, relevant fields (`StringField`, `PasswordField`, `BooleanField`, `SubmitField`), and validators (`DataRequired`, `Email`, `Length`, `EqualTo`).
        *   Define `RegistrationForm` (username, email, password, confirm password, submit).
        *   Define `LoginForm` (username/email, password, remember_me, submit). Add basic validation.
    4.  **Implement Authentication Routes (`app/routes/auth.py`):**
        *   Create `auth_bp = Blueprint('auth', ...)`.
        *   Implement `/register` route (GET/POST): Instantiate `RegistrationForm`. If valid POST, call `auth_service.register_user`, flash message, redirect to login. Render template with form. *Consider restricting registration after the first user for MVP.*
        *   Implement `/login` route (GET/POST): Instantiate `LoginForm`. If valid POST, call `auth_service.authenticate_user`. If successful, use `login_user()` from Flask-Login, flash message, redirect to entry list. Render template with form.
        *   Implement `/logout` route: Use `logout_user()` from Flask-Login, flash message, redirect to login. Decorate with `@login_required`.
    5.  **Register Auth Blueprint:** In `app/__init__.py`, register `auth_bp` with a prefix (e.g., `/auth`).
    6.  **Configure Redis Session:**
        *   Ensure `SESSION_TYPE = 'redis'` and `SESSION_REDIS` are set in `config.py`.
        *   Ensure `Session(app)` is called in `create_app`.
        *   Start Redis server locally (`sudo systemctl start redis` or similar).
    7.  **Add CSRF Protection:**
        *   Ensure `CSRFProtect(app)` is called in `create_app`.
        *   Add `{{ form.csrf_token }}` within all `<form>` tags in templates.
    8.  **Test Basic Auth Flow:** Manually register a user and test login/logout. Check Redis for session keys (`redis-cli keys 'session:*'`).
    9.  **Commit Changes:** `git add . && git commit -m "Implement basic web authentication (register, login, logout) with Redis sessions"`

---

### Stage 4: Core Entry CRUD Operations (Web Forms)

*   **Goal:** Implement the ability to Create, Read (List/Single), Update, and Delete entries via standard web forms.
*   **Detailed Steps:**
    1.  **Implement Entry Service (`app/services/entry_service.py`):**
        *   Create `EntryService` class.
        *   Implement `create_entry(user_id, title, content)`: Create `Entry` object, associate with user, add/commit to DB. Return success/failure.
        *   Implement `get_entry_by_id(entry_id, user_id)`: Query `Entry`, ensure user owns it, return `Entry` or `None`.
        *   Implement `get_entries_for_user(user_id, page, per_page)`: Query `Entry` for the user, order by date descending, paginate. Return pagination object.
        *   Implement `update_entry(entry_id, user_id, title, content)`: Find entry, check ownership, update fields, commit. Return success/failure.
        *   Implement `delete_entry(entry_id, user_id)`: Find entry, check ownership, delete, commit. Return success/failure.
    2.  **Create Entry Form (`app/forms/entry_forms.py`):**
        *   Define `EntryForm` (title `StringField`, content `TextAreaField`, submit `SubmitField`). Add `DataRequired` validators.
    3.  **Implement Entry Routes (`app/routes/entries.py`):**
        *   Create `entries_bp = Blueprint('entries', ...)`. Decorate all routes with `@login_required`.
        *   Implement `/` or `/list` route (GET): Call `entry_service.get_entries_for_user`, render list template with entries and pagination.
        *   Implement `/create` route (GET/POST): Instantiate `EntryForm`. If valid POST, call `entry_service.create_entry`, flash message, redirect to list. Render create template with form.
        *   Implement `/<int:entry_id>` route (GET): Call `entry_service.get_entry_by_id`, check ownership, render view template with entry. Handle 404/403.
        *   Implement `/<int:entry_id>/edit` route (GET/POST): Get entry, check ownership. Instantiate `EntryForm`, pre-populate if GET. If valid POST, call `entry_service.update_entry`, flash message, redirect to view. Render edit template with form.
        *   Implement `/<int:entry_id>/delete` route (POST): Get entry, check ownership. Call `entry_service.delete_entry`, flash message, redirect to list. Use a simple form with a button in the template for this.
    4.  **Register Entry Blueprint:** In `app/__init__.py`, register `entries_bp` (e.g., at root `/` or `/entries`). Set the application's default route.
    5.  **Test CRUD Flow:** Manually create, view, edit, and delete entries.
    6.  **Commit Changes:** `git add . && git commit -m "Implement core Entry CRUD operations via web forms"`

---

### Stage 5: Basic UI & Templates

*   **Goal:** Create minimal, clean HTML templates for authentication and CRUD operations. Implement basic CSS for layout and readability.
*   **Detailed Steps:**
    1.  **Create Base Template (`app/templates/base.html`):**
        *   Basic HTML structure (`<!DOCTYPE>`, `<html>`, `<head>`, `<body>`).
        *   Include placeholder blocks for `title`, `head`, `content`, `scripts`.
        *   Add basic navigation links (Entries, New Entry, Logout).
        *   Include a placeholder for flash messages.
        *   Link to `static/css/main.css`.
    2.  **Create Authentication Templates (`app/templates/auth/`):**
        *   `login.html`: Form using `LoginForm`.
        *   `register.html`: Form using `RegistrationForm`.
    3.  **Create Entry Templates (`app/templates/entries/`):**
        *   `list.html`: Loop through `entries`, display title/date, link to view/edit/delete. Include basic pagination controls.
        *   `view.html`: Display entry `title` and `content` (initially raw, add Markdown filter later). Add Edit/Delete links/buttons.
        *   `create.html`: Form using `EntryForm`.
        *   `edit.html`: Form using `EntryForm`, populated with entry data.
    4.  **Create Form Macro (`app/templates/macros/forms.html` or similar):**
        *   Define a macro `render_field(field)` to consistently render form labels, inputs, and errors.
    5.  **Implement Flash Message Display (`app/templates/components/flash_messages.html`):**
        *   Use `get_flashed_messages(with_categories=true)` and loop to display messages with appropriate CSS classes (e.g., `flash-success`, `flash-error`).
    6.  **Create Basic CSS (`app/static/css/main.css`):**
        *   Add minimal styling for basic layout (body margin, basic nav style, form spacing, simple entry list/view styling). Focus on readability, not complex design.
    7.  **Implement Markdown Rendering:**
        *   Create `MarkdownService` (`app/services/markdown_service.py`) using the `markdown` library.
        *   Add a `markdown` template filter in `app/__init__.py`.
        *   Apply the filter to entry content in `view.html`: `{{ entry.content|markdown|safe }}`. Remember the `|safe` filter.
    8.  **Review UI:** Check basic usability and appearance.
    9.  **Commit Changes:** `git add . && git commit -m "Implement basic UI templates and CSS; add Markdown rendering"`

---

### Stage 6: Service Deployment (systemd MVP)

*   **Goal:** Configure Gunicorn and create a basic systemd service file to run the application reliably on the Fedora laptop.
*   **Detailed Steps:**
    1.  **Test Gunicorn Manually:**
        *   Ensure Gunicorn is installed (`pip install gunicorn`).
        *   Run `gunicorn --workers=2 --bind=127.0.0.1:8000 wsgi:app` from the project root. Access `http://127.0.0.1:8000` in the browser to verify it works.
    2.  **Create Basic systemd Service File (`deployment/journal.service`):**
        *   Define `[Unit]` section (Description, After=network.target).
        *   Define `[Service]` section:
            *   `User=` and `Group=` (use your laptop username initially).
            *   `WorkingDirectory=` (absolute path to your project root).
            *   `Environment="FLASK_APP=wsgi.py"`
            *   `Environment="FLASK_ENV=production"` (Switch to production config).
            *   `EnvironmentFile=` (absolute path to `.env` file if using it for secrets).
            *   `ExecStart=` (absolute path to `gunicorn` in your venv, e.g., `/path/to/journal-app/venv/bin/gunicorn ...`).
            *   `Restart=on-failure`.
            *   `StandardOutput=journal`, `StandardError=journal`.
            *   `SyslogIdentifier=journal`.
        *   Define `[Install]` section (`WantedBy=multi-user.target`).
    3.  **Copy Service File:** `sudo cp deployment/journal.service /etc/systemd/system/journal.service`.
    4.  **Set Production Configuration:** Ensure `config.py` has a `ProductionConfig` and update `wsgi.py` or environment variables (`FLASK_ENV`) to use it. Ensure `SECRET_KEY` is strong and not hardcoded.
    5.  **Reload systemd, Enable & Start Service:**
        *   `sudo systemctl daemon-reload`
        *   `sudo systemctl enable journal`
        *   `sudo systemctl start journal`
    6.  **Check Service Status:** `sudo systemctl status journal`. Look for errors.
    7.  **Check Logs:** `journalctl -u journal -f`. Look for Gunicorn startup messages and any Flask errors.
    8.  **Configure Basic Logging:**
        *   Implement basic logging configuration in `app/__init__.py` to log to stdout/stderr (which `journald` captures). Use standard Python `logging`.
    9.  **Test Service:** Access the application via `http://127.0.0.1:8000` again. Test login, CRUD operations. Test restarting the laptop to ensure the service starts on boot.
    10. **Commit Changes:** `git add deployment/journal.service && git commit -m "Configure Gunicorn and basic systemd service for deployment"`

---

### Stage 7: Basic Testing & Refinement

*   **Goal:** Set up the testing framework and write essential unit and integration tests for core functionality. Create basic deployment and backup scripts.
*   **Detailed Steps:**
    1.  **Install Testing Dependencies:** `pip install pytest pytest-cov factory-boy` and update `requirements.txt`.
    2.  **Configure Pytest (`pytest.ini`, `tests/conftest.py`):**
        *   Set up `pytest.ini` (test paths).
        *   Create `tests/conftest.py` with `app`, `db`, `session`, `client` fixtures using the `testing` configuration.
    3.  **Write Unit Tests:**
        *   Models: Test `User` password hashing/checking. Test basic `Entry` creation attributes.
        *   Services: Test `AuthService` register/authenticate logic. Test `EntryService` basic CRUD methods (mocking DB interactions where appropriate, or using the `session` fixture for simple cases).
    4.  **Write Integration Tests:**
        *   Routes: Use the `client` fixture to test basic GET requests for login page, entry list (when logged out - should redirect). Use an authenticated client fixture (`auth_user` similar to one shown before) to test GET/POST for entry list, create, view, edit, delete routes. Verify status codes, redirects, and basic content rendering/flash messages.
    5.  **Run Tests:** `pytest`. Set up `pytest-cov` to measure coverage.
    6.  **Create Basic Deployment Script (`scripts/deploy.sh`):**
        *   Simple script: `cd /path/to/app`, `git pull`, `source venv/bin/activate`, `pip install -r requirements.txt`, `flask db upgrade`, `sudo systemctl restart journal`. Add basic logging (`echo`).
    7.  **Create Basic Backup Script (`scripts/backup.sh`):**
        *   Simple script: Use `sqlite3 instance/journal.db .backup /path/to/backups/backup-$(date +%Y%m%d%H%M%S).db`. Add cleanup for old backups.
    8.  **Refine & Document:** Add basic README.md explaining setup, running the app, testing, deploying. Clean up code based on test findings.
    9.  **Commit Changes:** `git add . && git commit -m "Set up testing framework; add basic unit/integration tests; create basic deploy/backup scripts"`

---

This detailed MVP guide provides a step-by-step process focusing on delivering the core, essential functionality reliably. Each stage builds upon the previous one, resulting in a working, deployable application. Remember to commit frequently and test manually after each significant step.
