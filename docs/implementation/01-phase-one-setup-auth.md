---
title: "Implementation Plan: Phase 1 - Project Setup & Core Authentication"
description: "Phase 1 implementation plan for the Flask Journal MVP, covering initial project structure, Flask app setup, database configuration (SQLite), User model creation, and basic user registration/login functionality."
category: "Implementation Plan"
related_topics:
      - "Flask Journal MVP Scope Definition" # Link to ../initial-planning/mvp-high-level-implementation-guide.md
      - "Comprehensive Guide: Personal Flask Blog/Journal System" # Link to ../initial-planning/comprehensive-guide-personal.md
      - "Agentic Orchestration Plan for Flask Journal MVP" # Link to ../initial-planning/agentic-workflow.md
version: "1.0"
tags:
      - "implementation"
      - "phase 1"
      - "project setup"
      - "flask"
      - "sqlalchemy"
      - "sqlite"
      - "flask-login"
      - "flask-wtf"
      - "authentication"
      - "user model"
      - "mvp"
---

# Implementation Plan: Phase 1 - Project Setup & Core Authentication

## Goal

The primary goal of Phase 1 is to establish the foundational structure of the Flask Journal application and implement the core user authentication system. By the end of this phase, a user should be able to register an account and log in securely.

## Prerequisites

This plan assumes familiarity with the overall project goals and architecture outlined in:

-   [Flask Journal MVP Scope Definition](../initial-planning/mvp-high-level-implementation-guide.md)
-   [Comprehensive Guide: Personal Flask Blog/Journal System](../initial-planning/comprehensive-guide-personal.md)
-   [Agentic Orchestration Plan for Flask Journal MVP](../initial-planning/agentic-workflow.md)

## Implementation Steps

**1. Project Structure Setup:**

-   Create the main application directory (e.g., `journal/`).
-   Establish subdirectories: `journal/static/`, `journal/templates/`, `journal/models/`, `journal/auth/`, `journal/main/` (for core non-auth routes later).
-   Create `__init__.py` files in `journal/`, `journal/models/`, `journal/auth/`, `journal/main/` to mark them as Python packages.
-   Create `run.py` (or `wsgi.py`) at the root level for running the application.
-   Create `config.py` at the root level for application configuration.
-   Initialize `requirements.txt` with initial dependencies (Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-Login, Flask-WTF, python-dotenv, Werkzeug for password hashing).

**2. Basic Flask App Initialization (`journal/__init__.py`):**

-   Implement the `create_app` application factory pattern.
-   Load configuration from `config.py` and environment variables (`.env` file).
-   Initialize Flask extensions: SQLAlchemy, Migrate, LoginManager.
-   Register blueprints for authentication (`auth`) and main routes (`main` - initially empty or with a simple index).

**3. Configuration (`config.py`):**

-   Define base configuration class (`Config`).
-   Set `SECRET_KEY` (load from environment).
-   Configure `SQLALCHEMY_DATABASE_URI` for SQLite (e.g., `sqlite:///journal.db`).
-   Set `SQLALCHEMY_TRACK_MODIFICATIONS` to `False`.
-   Add other necessary configurations (e.g., WTForms CSRF protection).

**4. Database Setup:**

-   Initialize Flask-Migrate: `flask db init`.
-   Define the `User` model in `journal/models/user.py` (referencing fields from the Comprehensive Guide: `id`, `username`, `email`, `password_hash`). Include methods for password hashing (`set_password`, `check_password`) using `werkzeug.security`. Ensure it inherits from `UserMixin` for Flask-Login.
-   Create the initial database migration: `flask db migrate -m "Initial migration; Add User model"`.
-   Apply the migration: `flask db upgrade`.

**5. Authentication Setup (`journal/auth/`):**

-   **Forms (`journal/auth/forms.py`):** Create `LoginForm` and `RegistrationForm` using Flask-WTF, including fields like username, email (for registration), password, confirm password, remember me, and submit button. Add basic validation (DataRequired, Email, EqualTo, Length).
-   **Views/Routes (`journal/auth/routes.py`):**
-   Implement routes for `/register` (GET/POST) and `/login` (GET/POST).
-   Implement `/logout` route.
-   Use Flask-Login functions (`login_user`, `logout_user`, `login_required`, `current_user`).
-   Handle form submissions: validate forms, create new users (hashing passwords), log users in, handle errors (e.g., invalid credentials, username/email already exists), use flash messages for feedback.
-   Configure `LoginManager`'s `user_loader` callback in `journal/models/user.py` or `journal/auth/routes.py`. Set the `login_view` in `journal/__init__.py`.
-   **Blueprint (`journal/auth/__init__.py`):** Create the `auth` blueprint and import routes.

**6. Basic Templates (`journal/templates/`):**

-   Create `base.html` with basic HTML structure, including blocks for title, content, and scripts. Include basic CSS linking (even if empty initially). Add logic to display flashed messages. Add basic navigation (Login/Register/Logout links based on `current_user.is_authenticated`).
-   Create `auth/login.html` and `auth/register.html`, extending `base.html` and rendering the respective forms using WTForms macros or manual rendering.
-   Create `index.html` (for the `main` blueprint) extending `base.html`, displaying a simple welcome message.

## Testing Considerations (Phase 1)

-   Unit tests for User model methods (password hashing/checking).
-   Unit tests for form validation logic.
-   Integration tests for registration, login, and logout routes (using Flask test client).
-   Ensure CSRF protection is active and tested.

## Next Steps (Phase 2 Preview)

-   Implementing the `Entry` model.
-   Creating basic CRUD operations for journal entries (Create, Read - List/Detail).
-   Setting up main application routes and views.