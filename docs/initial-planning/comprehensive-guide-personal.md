---
title: "Comprehensive Guide: Personal Flask Blog/Journal System"
description: "A complete architecture and implementation plan for a personal Flask-based blog/journal system, covering structure, data models, auth, frontend, backend, deployment, security, and testing for a Fedora/systemd environment."
category: "System Design" # Changed from "Project Planning" to better reflect the content
related_topics:
  - "Flask Journal MVP Scope Definition"
  - "API Contract Guide"
  - "Testing Strategy Guide" # Renamed for consistency
  - "Deployment Script Improvements Guide" # Renamed for consistency
  - "Error Handling Guide"
  - "State Management Guide"
  - "Implementing the Agentic Workflow with Roo Code" # Added reference
version: "1.0"
tags:
  # Core Technologies
  - "flask"
  - "sqlalchemy"
  - "sqlite"
  - "redis"
  - "htmx"
  - "alpinejs"
  - "jinja2"
  - "werkzeug"
  # Flask Extensions
  - "flask-login"
  - "flask-wtf"
  - "flask-session"
  - "flask-migrate"
  - "flask-assets"
  - "flask-compress"
  - "flask-talisman"
  # Deployment & Ops
  - "systemd"
  - "gunicorn"
  - "deployment"
  - "logging"
  - "backup"
  - "system administration"
  - "fedora"
  # Architecture & Design
  - "architecture"
  - "system design"
  - "project structure"
  - "mvp"
  - "service layer"
  - "data model"
  - "frontend architecture"
  - "backend architecture"
  - "api design"
  - "lean and mean"
  - "personal project"
  # Features & Concepts
  - "authentication"
  - "authorization"
  - "sessions"
  - "password management"
  - "crud"
  - "forms"
  - "markdown"
  - "mathjax"
  - "latex"
  - "state management"
  - "data synchronization"
  - "conflict resolution"
  - "error handling"
  - "progressive enhancement"
  # Security
  - "security"
  - "argon2"
  - "csrf"
  - "csp"
  - "xss protection"
  - "input validation"
  - "file permissions"
  # Performance
  - "performance optimization"
  - "caching"
  - "database optimization"
  - "frontend optimization"
  # Testing
  - "testing"
  - "pytest"
  - "unit testing"
  - "integration testing"
  - "ui testing"
  - "test strategy"
---

# Comprehensive Guide: Personal Flask Blog/Journal System

This guide presents a complete architecture and implementation plan for a personal Flask-based blog/journal system designed to run on a Fedora laptop as a systemd service. Following the "lean and mean" philosophy, this system provides a robust yet minimalist solution with carefully selected technologies.

## Table of Contents

- [Comprehensive Guide: Personal Flask Blog/Journal System](#comprehensive-guide-personal-flask-blogjournal-system)
  - [Table of Contents](#table-of-contents)
  - [System Overview](#system-overview)
  - [Architecture](#architecture)
    - [Project Structure](#project-structure)
    - [Frontend Architecture](#frontend-architecture)
      - [1. User Interface Layer](#1-user-interface-layer)
      - [2. Interaction Layer](#2-interaction-layer)
      - [3. State Management](#3-state-management)
    - [Backend Architecture](#backend-architecture)
      - [1. Data Access Layer](#1-data-access-layer)
      - [2. Service Layer](#2-service-layer)
      - [3. API Layer](#3-api-layer)
      - [4. Presentation Layer](#4-presentation-layer)
  - [Data Models](#data-models)
    - [User \& Authentication Models](#user--authentication-models)
    - [Content Models](#content-models)
    - [Relationship Models](#relationship-models)
  - [Authentication System](#authentication-system)
    - [User Registration \& Login](#user-registration--login)
    - [Password Management](#password-management)
    - [Session Handling](#session-handling)
    - [Authorization](#authorization)
  - [Data Flow \& Routing](#data-flow--routing)
    - [Input Processing](#input-processing)
    - [Form Handling](#form-handling)
    - [API Endpoints](#api-endpoints)
    - [Error Handling](#error-handling)
  - [Frontend Implementation](#frontend-implementation)
    - [HTMX + Alpine.js Integration](#htmx--alpinejs-integration)
    - [LaTeX Rendering with MathJax](#latex-rendering-with-mathjax)
    - [Template Structure](#template-structure)
    - [Static Files Organization](#static-files-organization)
    - [UI Components](#ui-components)
  - [Backend Implementation](#backend-implementation)
    - [Service Layer](#service-layer)
    - [Database Integration](#database-integration)
    - [Business Logic](#business-logic)
    - [LaTeX Rendering with MathJax](#latex-rendering-with-mathjax-1)
    - [Template Structure](#template-structure-1)
    - [Static Files Organization](#static-files-organization-1)
    - [UI Components](#ui-components-1)
  - [Backend Implementation](#backend-implementation-1)
    - [Service Layer](#service-layer-1)
    - [Database Integration](#database-integration-1)
    - [Business Logic](#business-logic-1)
    - [Error Handling](#error-handling-1)
  - [State Management](#state-management)
    - [Client-Side State](#client-side-state)
    - [Server-Side State](#server-side-state)
    - [Data Synchronization](#data-synchronization)
  - [System Administration](#system-administration)
    - [Deployment Process](#deployment-process)
    - [Systemd Service Configuration](#systemd-service-configuration)
    - [Logging Setup](#logging-setup)
    - [Backup Strategy](#backup-strategy)
  - [Security Considerations](#security-considerations)
    - [Authentication Security](#authentication-security)
    - [Data Protection](#data-protection)
    - [Input Validation](#input-validation)
    - [File Permission Handling](#file-permission-handling)
  - [Performance Optimizations](#performance-optimizations)
    - [Caching Strategy](#caching-strategy)
    - [Database Optimization](#database-optimization)
    - [Frontend Optimization](#frontend-optimization)
  - [Testing Strategy](#testing-strategy)
    - [Unit Testing](#unit-testing)
    - [Integration Testing](#integration-testing)
    - [UI Testing](#ui-testing)
    - [Integration Testing](#integration-testing-1)
    - [UI Testing](#ui-testing-1)

## System Overview

The personal blog/journal system is designed with the following characteristics:

- **Private**: Primarily for personal use with secure authentication
- **Cozy Interface**: Minimal but warm UI for comfortable writing and reading
- **Always Available**: Runs as a systemd service on a Fedora laptop
- **LaTeX Support**: MathJax integration for mathematical notation
- **Well-Structured**: Clean separation of concerns for maintainability
- **Lean & Mean**: Minimal dependencies with carefully chosen libraries
- **GitHub Backup**: Content backed up to GitHub for version control

The application leverages:
- **Flask**: For the web framework
- **SQLite**: For lightweight database storage
- **HTMX + Alpine.js**: For frontend interactivity without a heavy framework
- **Redis**: For session storage and caching
- **MathJax**: For LaTeX rendering
- **systemd**: For service management

## Architecture

### Project Structure

```
project/
├── app/
│   ├── __init__.py         # Application factory
│   ├── models/             # Database models
│   │   ├── __init__.py
│   │   ├── user.py         # User-related models
│   │   └── content.py      # Content-related models
│   ├── routes/             # Route blueprints
│   │   ├── __init__.py
│   │   ├── auth.py         # Authentication routes
│   │   ├── entries.py      # Blog entry routes
│   │   └── api.py          # API routes
│   ├── services/           # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py # Authentication logic
│   │   ├── entry_service.py # Entry management logic
│   │   └── draft_service.py # Draft management logic
│   ├── templates/          # Jinja2 templates
│   │   ├── base.html       # Base template
│   │   ├── components/     # Reusable UI components
│   │   ├── auth/           # Auth-related templates
│   │   └── entries/        # Entry-related templates
│   ├── static/             # Static assets
│   │   ├── css/            # Stylesheets
│   │   ├── js/             # JavaScript files
│   │   └── img/            # Images
│   ├── utils/              # Utility functions
│   │   ├── __init__.py
│   │   ├── markdown.py     # Markdown processing
│   │   └── errors.py       # Error handling utilities
│   └── errors/             # Error handling
│       ├── __init__.py
│       ├── exceptions.py   # Custom exceptions
│       └── handlers.py     # Error handlers
├── config.py               # Configuration classes
├── migrations/             # Database migrations
├── tests/                  # Test suite
├── scripts/                # Deployment and utility scripts
├── instance/               # Instance-specific config
│   └── config.py           # Overrides main config
├── deployment/             # Deployment files
│   └── journal.service     # Systemd service file
├── .env                    # Environment variables
├── wsgi.py                 # WSGI entry point
└── requirements.txt        # Dependencies
```

### Frontend Architecture

The frontend is organized into three main layers:

#### 1. User Interface Layer
- **Responsibility**: Present journal entries and provide navigation
- **Technologies**: HTML, CSS, Jinja2 templates
- **Components**:
  - Entry list view (homepage)
  - Single entry view
  - Editor interface
  - Search results interface
  - Navigation components
  - Responsive layouts

#### 2. Interaction Layer
- **Responsibility**: Handle user input and client-side logic
- **Technologies**: HTMX, Alpine.js
- **Components**:
  - Form handling with client-side validation
  - Markdown editor with preview
  - Auto-save functionality
  - Search interface
  - Tag management
  - LaTeX rendering with MathJax

#### 3. State Management
- **Responsibility**: Maintain UI state and handle transitions
- **Technologies**: Alpine.js, localStorage
- **Components**:
  - Editor state (edit/preview/split modes)
  - Theme preferences
  - Draft auto-saving
  - Form validation states
  - Modal and dropdown states

### Backend Architecture

The backend is structured into four main layers:

#### 1. Data Access Layer
- **Responsibility**: Define, store, and retrieve application data
- **Technologies**: SQLAlchemy, SQLite
- **Components**:
  - ORM models (User, Entry, Tag)
  - Query operations
  - Migration management with Alembic
  - Transaction handling

#### 2. Service Layer
- **Responsibility**: Implement business logic
- **Technologies**: Python classes
- **Components**:
  - Authentication services
  - Entry management services
  - Markdown processing
  - Draft handling
  - Search functionality

#### 3. API Layer
- **Responsibility**: Expose endpoints for UI operations
- **Technologies**: Flask routes, Blueprint
- **Components**:
  - RESTful routes for CRUD operations
  - Response formatting
  - Error handling
  - Input validation

#### 4. Presentation Layer
- **Responsibility**: Render templates and handle user interaction
- **Technologies**: Flask, Jinja2
- **Components**:
  - Route handlers
  - Template rendering
  - Session management
  - Form processing

## Data Models

### User & Authentication Models

```python
# app/models/user.py
from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.ext.hybrid import hybrid_property
from app import db

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    entries = db.relationship('Entry', backref='author', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password, method='argon2')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def has_permission(self, permission_name):
        # For personal use, always return True
        # Can be extended later for multi-user scenarios
        return True


class UserPreferences(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    theme = db.Column(db.String(20), default='system')
    editor_mode = db.Column(db.String(20), default='split')
    entries_per_page = db.Column(db.Integer, default=10)
    markdown_guide_dismissed = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('preferences', uselist=False))
```

### Content Models

```python
# app/models/content.py
from datetime import datetime
import math
from sqlalchemy.ext.hybrid import hybrid_property
from app import db

# Many-to-many relationship table between entries and tags
entry_tags = db.Table('entry_tags',
    db.Column('entry_id', db.Integer, db.ForeignKey('entry.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tag.id'), primary_key=True)
)

class Entry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_public = db.Column(db.Boolean, default=False)
    version = db.Column(db.Integer, default=1)
    tags = db.relationship('Tag', secondary=entry_tags, lazy='subquery',
                          backref=db.backref('entries', lazy=True))
    versions = db.relationship('EntryVersion', backref='entry', lazy=True,
                              cascade='all, delete-orphan')

    @hybrid_property
    def reading_time(self):
        words_per_minute = 200
        word_count = len(self.content.split())
        return max(1, math.ceil(word_count / words_per_minute))

    __table_args__ = (
        db.Index('idx_entry_user_created', user_id, created_at.desc()),
        db.Index('idx_entry_title', title),
    )


class EntryVersion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    entry_id = db.Column(db.Integer, db.ForeignKey('entry.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    version = db.Column(db.Integer, nullable=False)
    is_conflict = db.Column(db.Boolean, default=False)


class EntryDraft(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    entry_id = db.Column(db.Integer, db.ForeignKey('entry.id'), nullable=True)
    title = db.Column(db.String(200), nullable=True)
    content = db.Column(db.Text, nullable=True)
    last_saved = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref='drafts')
    entry = db.relationship('Entry', backref='draft', uselist=False)


class Tag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.Index('idx_tag_name', name),
    )
```

### Relationship Models
(Implicitly defined via `db.relationship` and the `entry_tags` association table above).

## Authentication System

### User Registration & Login

```python
# app/services/auth_service.py
from datetime import datetime
from app.models.user import User
# Assuming custom exceptions and result object exist
# from app.errors.exceptions import AuthenticationError, ValidationError
# from app.errors.result import OperationResult
from app import db

class AuthService:
    def register_user(self, username, email, password):
        """
        Register a new user.

        Args:
            username: Username for the new user
            email: Email address for the new user
            password: Password for the new user

        Returns:
            OperationResult: Success or failure with details
        """
        # Placeholder for OperationResult if not defined
        class OperationResult:
            def __init__(self, success, message=None, data=None, error_code=None, status_code=200):
                self.success = success
                self.message = message
                self.data = data
                self.error_code = error_code
                self.status_code = status_code
            @staticmethod
            def success_result(message=None, data=None): return OperationResult(True, message, data)
            @staticmethod
            def failure_result(message, error_code=None, status_code=400): return OperationResult(False, message, error_code=error_code, status_code=status_code)

        # Check if username already exists
        if User.query.filter_by(username=username).first():
            return OperationResult.failure_result(
                message="Username already exists",
                error_code="REGISTRATION_ERROR",
                status_code=400
            )

        # Check if email already exists
        if User.query.filter_by(email=email).first():
            return OperationResult.failure_result(
                message="Email already exists",
                error_code="REGISTRATION_ERROR",
                status_code=400
            )

        # Create new user
        try:
            user = User(username=username, email=email)
            user.set_password(password)

            # Create user preferences with defaults
            from app.models.user import UserPreferences
            preferences = UserPreferences(user=user)

            db.session.add(user)
            db.session.add(preferences)
            db.session.commit()

            return OperationResult.success_result(
                message="User registered successfully",
                data={"user_id": user.id}
            )
        except Exception as e:
            db.session.rollback()
            return OperationResult.failure_result(
                message=f"Registration failed: {str(e)}",
                error_code="REGISTRATION_ERROR",
                status_code=500
            )

    def authenticate_user(self, username_or_email, password):
        """
        Authenticate a user.

        Args:
            username_or_email: Username or email of the user
            password: Password to check

        Returns:
            OperationResult: Success or failure with details
        """
        # Placeholder for OperationResult if not defined
        class OperationResult:
            def __init__(self, success, message=None, data=None, error_code=None, status_code=200):
                self.success = success
                self.message = message
                self.data = data
                self.error_code = error_code
                self.status_code = status_code
            @staticmethod
            def success_result(message=None, data=None): return OperationResult(True, message, data)
            @staticmethod
            def failure_result(message, error_code=None, status_code=400): return OperationResult(False, message, error_code=error_code, status_code=status_code)

        # Find user by username or email
        user = User.query.filter(
            (User.username == username_or_email) |
            (User.email == username_or_email)
        ).first()

        if not user:
            return OperationResult.failure_result(
                message="Invalid username or email",
                error_code="AUTHENTICATION_ERROR",
                status_code=401
            )

        # Check password
        if not user.check_password(password):
            return OperationResult.failure_result(
                message="Invalid password",
                error_code="AUTHENTICATION_ERROR",
                status_code=401
            )

        # Update last login timestamp
        user.last_login = datetime.utcnow()
        db.session.commit()

        return OperationResult.success_result(
            message="Authentication successful",
            data={"user": user}
        )
```

Implementing secure routes for authentication:

```python
# app/routes/auth.py
from flask import Blueprint, render_template, redirect, url_for, request, flash, session
from flask_login import login_user, logout_user, login_required, current_user
from app.services.auth_service import AuthService
# Assuming forms exist
# from app.forms.auth_forms import LoginForm, RegistrationForm

auth_bp = Blueprint('auth', __name__)
auth_service = AuthService()

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('entries.list')) # Assuming 'entries.list' exists

    # form = RegistrationForm() # Instantiate form
    # if form.validate_on_submit():
    #     result = auth_service.register_user(
    #         username=form.username.data,
    #         email=form.email.data,
    #         password=form.password.data
    #     )
    #
    #     if result.success:
    #         flash('Registration successful. Please log in.', 'success')
    #         return redirect(url_for('auth.login'))
    #     else:
    #         flash(result.message, 'error')
    #
    # return render_template('auth/register.html', form=form)
    return "Register Page Placeholder" # Placeholder

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('entries.list')) # Assuming 'entries.list' exists

    # form = LoginForm() # Instantiate form
    # if form.validate_on_submit():
    #     result = auth_service.authenticate_user(
    #         username_or_email=form.username.data,
    #         password=form.password.data
    #     )
    #
    #     if result.success:
    #         user = result.data['user']
    #         login_user(user, remember=form.remember_me.data)
    #
    #         # Store last login time in session
    #         session['last_login'] = user.last_login.isoformat() if user.last_login else None
    #
    #         # Redirect to next page or default
    #         next_page = request.args.get('next')
    #         if not next_page or not next_page.startswith('/'):
    #             next_page = url_for('entries.list')
    #         return redirect(next_page)
    #     else:
    #         flash(result.message, 'error')
    #
    # return render_template('auth/login.html', form=form)
    return "Login Page Placeholder" # Placeholder

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('auth.login'))
```

### Password Management
-   **Hashing:** Use `werkzeug.security.generate_password_hash` with a strong method like `argon2` (as shown in `User.set_password`).
-   **Verification:** Use `werkzeug.security.check_password_hash` (as shown in `User.check_password`).
-   **Reset:** Implement a secure password reset flow (e.g., email with time-limited, single-use tokens) - *Potentially beyond MVP, confirm scope.*

```python
# app/routes/auth.py (continued) - Conceptual Password Reset
# from flask import render_template, request, flash, redirect, url_for
# from app.services.auth_service import AuthService # Assume reset methods exist
# from app.forms.auth_forms import PasswordResetRequestForm, PasswordResetForm

# @auth_bp.route('/reset_password_request', methods=['GET', 'POST'])
# def reset_password_request():
#     if current_user.is_authenticated:
#         return redirect(url_for('entries.list'))
#     form = PasswordResetRequestForm()
#     if form.validate_on_submit():
#         result = auth_service.send_password_reset_email(form.email.data)
#         if result.success:
#             flash('Check your email for password reset instructions.', 'info')
#             return redirect(url_for('auth.login'))
#         else:
#             flash(result.message, 'error') # E.g., Email not found
#     return render_template('auth/reset_password_request.html', form=form)

# @auth_bp.route('/reset_password/<token>', methods=['GET', 'POST'])
# def reset_password(token):
#     if current_user.is_authenticated:
#         return redirect(url_for('entries.list'))
#     user_result = auth_service.verify_reset_token(token)
#     if not user_result.success:
#         flash(user_result.message, 'error') # E.g., Invalid or expired token
#         return redirect(url_for('auth.login'))
#
#     user = user_result.data['user']
#     form = PasswordResetForm()
#     if form.validate_on_submit():
#         result = auth_service.reset_user_password(user, form.password.data)
#         if result.success:
#             flash('Your password has been reset.', 'success')
#             return redirect(url_for('auth.login'))
#         else:
#             flash(result.message, 'error') # Should ideally not happen here
#     return render_template('auth/reset_password.html', form=form, token=token)
```

### Session Handling
-   Use `Flask-Login` for managing user sessions.
-   Configure `SECRET_KEY` properly.
-   Use Redis for server-side session storage via `Flask-Session` for better scalability and persistence than default client-side cookies.

```python
# config.py
import os
import redis

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-very-secret-key'
    # ... other config ...
    SESSION_TYPE = 'redis'
    SESSION_PERMANENT = False
    SESSION_USE_SIGNER = True # Encrypt session cookie
    SESSION_KEY_PREFIX = 'journal:session:'
    SESSION_REDIS = redis.from_url(os.environ.get('REDIS_URL') or 'redis://localhost:6379/1') # Use DB 1 for sessions
    # Consider setting cookie security flags
    # SESSION_COOKIE_SECURE = True # Only send cookie over HTTPS
    # SESSION_COOKIE_HTTPONLY = True # Prevent JS access to cookie
    # SESSION_COOKIE_SAMESITE = 'Lax' # CSRF protection

# Define configurations for different environments (Development, Production)
class DevelopmentConfig(Config):
    DEBUG = True
    # ... dev specific settings ...

class ProductionConfig(Config):
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    # ... prod specific settings ...

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
```

```python
# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_session import Session # Import Flask-Session
from config import config

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
login_manager.login_view = 'auth.login' # Route name for login page
sess = Session() # Initialize Flask-Session

def create_app(config_name='default'):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config[config_name])
    # Load instance config if it exists
    app.config.from_pyfile('config.py', silent=True)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    sess.init_app(app) # Initialize Flask-Session with app

    # Register blueprints
    from .routes.auth import auth_bp
    app.register_blueprint(auth_bp)
    # ... other blueprints ...

    return app

@login_manager.user_loader
def load_user(user_id):
    from .models.user import User
    return User.query.get(int(user_id))
```

### Authorization
-   Use `flask_login.login_required` decorator for routes requiring login.
-   Implement ownership checks in service layer or via decorators for actions modifying specific resources (e.g., editing/deleting entries).

```python
# app/auth/decorators.py (Conceptual - Ownership)
# from functools import wraps
# from flask import g, abort
# from flask_login import current_user
# from app.models import Entry # Example model

# def require_entry_ownership(f):
#     @wraps(f)
#     def decorated_function(*args, **kwargs):
#         entry_id = kwargs.get('entry_id') # Assuming entry_id is in route params
#         if entry_id is None:
#             abort(500, "Entry ID missing in route parameters.")
#
#         entry = Entry.query.get_or_404(entry_id)
#
#         if not current_user.is_authenticated or entry.user_id != current_user.id:
#             abort(403) # Forbidden
#
#         g.entry = entry # Optionally store loaded entry in g
#         return f(*args, **kwargs)
#     return decorated_function

# Usage in routes:
# @entries_bp.route('/<int:entry_id>/edit', methods=['GET', 'POST'])
# @login_required
# @require_entry_ownership
# def edit_entry(entry_id):
#     entry = g.entry # Access entry loaded by decorator
#     # ... form handling ...
```

## Data Flow & Routing

### Input Processing
-   Use Flask's `request` object (`request.args`, `request.form`, `request.get_json()`).
-   Perform validation early.

### Form Handling
-   Use `Flask-WTF` for form creation and validation.
-   Handle CSRF protection (enabled by default with Flask-WTF).

```python
# app/forms/entry_forms.py (Example)
# from flask_wtf import FlaskForm
# from wtforms import StringField, TextAreaField, BooleanField, SubmitField
# from wtforms.validators import DataRequired, Length

# class EntryForm(FlaskForm):
#     title = StringField('Title', validators=[DataRequired(), Length(min=1, max=200)])
#     content = TextAreaField('Content', validators=[DataRequired()])
#     is_public = BooleanField('Make Public')
#     submit = SubmitField('Save Entry')
#     save_draft = SubmitField('Save Draft')
```

### API Endpoints
-   Defined using Flask Blueprints (e.g., `api_bp`).
-   Follow RESTful principles outlined in [API Contract Guide](./api-contract-guide.md).
-   Use JSON for request/response bodies.

```python
# app/routes/api.py (Structure Example)
# from flask import Blueprint, request, jsonify
# from app.services.entry_service import EntryService
# from app.auth.decorators import api_auth_required, current_user
# from app.utils.api_helpers import api_success, api_error
# from app.schemas import EntrySchema # Assuming Marshmallow schemas

# api_bp = Blueprint('api', __name__, url_prefix='/api/v1')
# entry_service = EntryService()
# entry_schema = EntrySchema()
# entries_schema = EntrySchema(many=True)

# @api_bp.route('/entries', methods=['GET'])
# @api_auth_required
# def get_entries_api():
#     # ... handle query params (pagination, sort, filter) ...
#     # result = entry_service.get_entries(...)
#     # if result.success:
#     #     return api_success(data=entries_schema.dump(result.data.items), meta=...)
#     # else: return api_error(...)
#     pass

# @api_bp.route('/entries', methods=['POST'])
# @api_auth_required
# def create_entry_api():
#     # ... validate request.get_json() using schema ...
#     # result = entry_service.create_entry(...)
#     # if result.success: return api_success(data=entry_schema.dump(result.data), status_code=201)
#     # else: return api_error(...)
#     pass

# ... other CRUD endpoints ...
```

### Error Handling
-   Define custom exception classes (e.g., `ValidationError`, `AuthorizationError`, `ResourceNotFoundError`).
-   Use Flask's `@app.errorhandler()` or `@blueprint.errorhandler()` decorators to register handlers.
-   Handlers should return consistent JSON error responses using the `api_error` helper.
-   Log errors appropriately.

```python
# app/errors/exceptions.py
# class AppBaseException(Exception):
#     """Base exception class for the application."""
#     status_code = 500
#     error_code = "INTERNAL_ERROR"
#     message = "An unexpected error occurred."
#
#     def __init__(self, message=None, status_code=None, error_code=None, details=None):
#         super().__init__(message or self.message)
#         if status_code is not None:
#             self.status_code = status_code
#         if error_code is not None:
#             self.error_code = error_code
#         self.details = details

# class ValidationError(AppBaseException):
#     status_code = 422
#     error_code = "VALIDATION_ERROR"
#     message = "Input validation failed."

# class AuthenticationError(AppBaseException):
#     status_code = 401
#     error_code = "AUTHENTICATION_ERROR"
#     message = "Authentication failed."

# class AuthorizationError(AppBaseException):
#     status_code = 403
#     error_code = "FORBIDDEN"
#     message = "Permission denied."

# class ResourceNotFoundError(AppBaseException):
#     status_code = 404
#     error_code = "NOT_FOUND"
#     message = "The requested resource was not found."

# app/errors/result.py (Optional: Standard way to return from services)
# class OperationResult:
#     def __init__(self, success, message=None, data=None, error_code=None, status_code=None, error_details=None):
#         self.success = success
#         self.message = message
#         self.data = data
#         self.error_code = error_code
#         self.status_code = status_code or (200 if success else 400)
#         self.error_details = error_details # For validation details
#
#     @staticmethod
#     def success_result(message=None, data=None, status_code=200):
#         return OperationResult(True, message, data, status_code=status_code)
#
#     @staticmethod
#     def failure_result(message, error_code=None, status_code=400, details=None):
#         return OperationResult(False, message, error_code=error_code, status_code=status_code, error_details=details)

# app/errors/handlers.py
# from flask import current_app
# from app.utils.api_helpers import api_error
# from .exceptions import AppBaseException, ValidationError # Import custom exceptions

# def register_error_handlers(app_or_bp):
#     @app_or_bp.errorhandler(ValidationError)
#     def handle_validation_error(error):
#         current_app.logger.info(f"Validation Error: {error.details}")
#         return api_error(
#             message=error.message,
#             code=error.error_code,
#             details=error.details,
#             status_code=error.status_code
#         )
#
#     @app_or_bp.errorhandler(AppBaseException)
#     def handle_app_exception(error):
#         log_level = 'warning' if error.status_code < 500 else 'error'
#         getattr(current_app.logger, log_level)(f"{error.error_code}: {error}", exc_info=error.status_code >= 500)
#         return api_error(
#             message=str(error),
#             code=error.error_code,
#             details=error.details,
#             status_code=error.status_code
#         )
#
#     @app_or_bp.errorhandler(404) # Handle Flask's default 404
#     def handle_not_found(error):
#         return api_error(message="Resource not found", code="NOT_FOUND", status_code=404)
#
#     @app_or_bp.errorhandler(Exception) # Catch-all for unexpected errors
#     def handle_generic_exception(error):
#         current_app.logger.error(f"Unhandled Exception: {error}", exc_info=True)
#         return api_error(
#             message="An internal server error occurred.",
#             code="INTERNAL_SERVER_ERROR",
#             status_code=500
#         )

# Register handlers in app factory:
# from .errors.handlers import register_error_handlers
# def create_app(...):
#    ...
#    register_error_handlers(app) # Register for app-wide errors
#    register_error_handlers(api_bp) # Register specifically for API blueprint if needed
#    ...
```

## Frontend Implementation

### HTMX + Alpine.js Integration
-   **HTMX:** Use for partial page updates triggered by user actions (form submissions, button clicks). Server returns HTML fragments.
    -   `hx-post`, `hx-get`, `hx-swap`, `hx-target`, `hx-trigger`.
-   **Alpine.js:** Use for client-side interactivity, UI state management (dropdowns, modals, editor state), and reacting to HTMX events.
    -   `x-data`, `x-show`, `x-on`, `x-bind`, `$store`, `$dispatch`.

```html
<!-- Example: HTMX form submission with Alpine state -->
<div x-data="{ isSubmitting: false, errorMessage: '' }">
    <form hx-post="/api/v1/entries" hx-target="#entry-list" hx-swap="beforeend"
          @htmx:before-request="isSubmitting = true; errorMessage = ''"
          @htmx:after-request="isSubmitting = false; if($event.detail.failed) errorMessage = 'Submission failed';"
          @htmx:response-error="errorMessage = 'Server error: ' + $event.detail.xhr.status">

        <input type="text" name="title" required>
        <textarea name="content" required></textarea>

        <button type="submit" :disabled="isSubmitting">
            <span x-show="!isSubmitting">Save Entry</span>
            <span x-show="isSubmitting">Saving...</span>
        </button>
        <div x-show="errorMessage" x-text="errorMessage" style="color: red;"></div>
    </form>
</div>

<div id="entry-list">
    <!-- List of entries, updated by HTMX -->
</div>
```

### LaTeX Rendering with MathJax
-   Include MathJax configuration and library in `base.html`.
-   Ensure Markdown processing on the backend preserves LaTeX syntax (e.g., `$..$`, `$$..$$`).
-   Trigger MathJax rendering after HTMX swaps content into the DOM.

```python
# app/services/markdown_service.py (Conceptual)
# import markdown
# from markupsafe import Markup

# class MarkdownService:
#     def __init__(self):
#         self.md = markdown.Markdown(extensions=[
#             'fenced_code',
#             'codehilite', # Requires Pygments
#             'tables',
#             'footnotes',
#             'admonition',
#             'toc',
#             # Add extensions that preserve LaTeX or handle it specifically if needed
#         ])

#     def render(self, text):
#         """Renders Markdown text to HTML, preserving LaTeX."""
#         # Basic rendering; ensure LaTeX delimiters are not processed as Markdown
#         html = self.md.convert(text)
#         return Markup(html) # Mark as safe for Jinja2

# Usage in routes/templates:
# rendered_content = markdown_service.render(entry.content)
# return render_template('...', content=rendered_content)
```

```html
<!-- templates/base.html -->
<head>
    <!-- ... other head elements ... -->
    <script>
        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']]
            },
            svg: {
                fontCache: 'global'
            },
            options: {
                skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
            }
        };
    </script>
    <script type="text/javascript" id="MathJax-script" async
            src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js">
    </script>
</head>
<body>
    <!-- ... body content ... -->
    <script>
        // Trigger MathJax typesetting after HTMX swaps
        document.body.addEventListener('htmx:afterSwap', function(event) {
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([event.detail.target]);
            }
        });
        // Initial typesetting on page load
        if (window.MathJax && window.MathJax.typesetPromise) {
             window.MathJax.typesetPromise();
        }
    </script>
</body>
```

### Template Structure
-   Use Jinja2 inheritance (`base.html`, `{% extends %}`, `{% block %}`).
-   Organize templates by feature (`auth/`, `entries/`).
-   Create reusable partials/components (`components/`).

### Static Files Organization
-   Standard Flask `static/` folder structure (`css/`, `js/`, `img/`).
-   Consider using `Flask-Assets` for bundling and minification (potentially post-MVP).

### UI Components
-   Define reusable HTML/Jinja2 partials in `templates/components/`.
-   Use Alpine.js for component-specific logic within these partials.

```html
<!-- templates/components/modal.html -->
<div x-data="{ isOpen: false }" @open-modal.window="if ($event.detail.id === 'myModal') isOpen = true" @keydown.escape.window="isOpen = false">
    <button @click="isOpen = true">Open Modal</button>

    <!-- Overlay -->
    <div x-show="isOpen" style="position: fixed; inset: 0; background-color: rgba(0,0,0,0.5);" @click="isOpen = false"></div>

    <!-- Modal Content -->
    <div x-show="isOpen" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 5px;">
        <h2>Modal Title</h2>
        <p>This is the modal content.</p>
        <button @click="isOpen = false">Close</button>
    </div>
</div>

<!-- Triggering the modal elsewhere -->
<button @click="$dispatch('open-modal', { id: 'myModal' })">Trigger My Modal</button>
```

## Backend Implementation

### Service Layer
-   Encapsulate business logic in service classes (`AuthService`, `EntryService`, `DraftService`).
-   Services interact with data models and perform operations.
-   Return consistent result objects (e.g., `OperationResult`) indicating success/failure and data/errors.

```python
# app/services/entry_service.py (Conceptual Structure)
# from app.models import Entry, Tag, EntryDraft, EntryVersion
# from app import db
# from app.errors.result import OperationResult
# from app.errors.exceptions import ResourceNotFoundError, AuthorizationError
# from .markdown_service import MarkdownService # Assuming exists
# from sqlalchemy.exc import IntegrityError
# from datetime import datetime

# class EntryService:
#     def __init__(self):
#         self.markdown_service = MarkdownService()

#     def get_entry(self, entry_id, user_id):
#         entry = Entry.query.get(entry_id)
#         if not entry:
#             raise ResourceNotFoundError("Entry not found")
#         if entry.user_id != user_id:
#             raise AuthorizationError("Permission denied")
#         # Return ServiceResult or the entry itself
#         return OperationResult.success_result(data=entry)

#     def get_entries_paginated(self, user_id, page=1, per_page=10, sort_by='created_at', sort_order='desc', ...):
#         query = Entry.query.filter_by(user_id=user_id)
#         # ... apply sorting, filtering, searching ...
#         pagination = query.paginate(page=page, per_page=per_page, error_out=False)
#         return OperationResult.success_result(data=pagination)

#     def create_entry(self, user_id, data):
#         try:
#             # Validate data (or assume validated by route/schema)
#             title = data.get('title')
#             content = data.get('content')
#             is_public = data.get('is_public', False)
#             tag_names = data.get('tags', []) # Expect list of tag names

#             if not title or not content:
#                 return OperationResult.failure_result("Title and content are required.", error_code="VALIDATION_ERROR")

#             entry = Entry(
#                 title=title,
#                 content=content,
#                 user_id=user_id,
#                 is_public=is_public
#             )

#             # Handle tags
#             tags = self._get_or_create_tags(tag_names)
#             entry.tags.extend(tags)

#             db.session.add(entry)
#             db.session.flush() # Get entry ID for versioning

#             # Create initial version
#             version = EntryVersion(entry_id=entry.id, title=entry.title, content=entry.content, version=1)
#             db.session.add(version)

#             db.session.commit()
#             return OperationResult.success_result(data=entry, status_code=201)
#         except IntegrityError as e:
#             db.session.rollback()
#             # Check for specific constraint violations if needed
#             return OperationResult.failure_result(f"Database error: {e}", error_code="DB_ERROR", status_code=500)
#         except Exception as e:
#             db.session.rollback()
#             return OperationResult.failure_result(f"Failed to create entry: {e}", error_code="CREATION_FAILED", status_code=500)

#     def update_entry(self, entry_id, user_id, data, partial=False):
#         entry_result = self.get_entry(entry_id, user_id) # Handles not found/auth
#         if not entry_result.success:
#             return entry_result # Return error result

#         entry = entry_result.data
#         updated = False

#         # Validate data (or assume validated)
#         # Use Marshmallow schema context for partial updates if applicable

#         if 'title' in data and data['title'] != entry.title:
#             entry.title = data['title']
#             updated = True
#         if 'content' in data and data['content'] != entry.content:
#             entry.content = data['content']
#             updated = True
#         if 'is_public' in data and data['is_public'] != entry.is_public:
#             entry.is_public = data['is_public']
#             updated = True
#         if 'tags' in data:
#             # Handle tag updates (clear existing, add new)
#             tag_names = data['tags']
#             new_tags = self._get_or_create_tags(tag_names)
#             if set(entry.tags) != set(new_tags):
#                 entry.tags = new_tags
#                 updated = True

#         if not updated:
#             return OperationResult.success_result(data=entry, message="No changes detected.")

#         try:
#             entry.updated_at = datetime.utcnow()
#             entry.version += 1

#             # Create new version
#             version = EntryVersion(entry_id=entry.id, title=entry.title, content=entry.content, version=entry.version)
#             db.session.add(version)

#             db.session.commit()
#             return OperationResult.success_result(data=entry)
#         except Exception as e:
#             db.session.rollback()
#             return OperationResult.failure_result(f"Failed to update entry: {e}", error_code="UPDATE_FAILED", status_code=500)


#     def delete_entry(self, entry_id, user_id):
#         entry_result = self.get_entry(entry_id, user_id) # Handles not found/auth
#         if not entry_result.success:
#             return entry_result

#         entry = entry_result.data
#         try:
#             # Cascading delete should handle versions and tag associations
#             db.session.delete(entry)
#             db.session.commit()
#             return OperationResult.success_result(status_code=204) # No content
#         except Exception as e:
#             db.session.rollback()
#             return OperationResult.failure_result(f"Failed to delete entry: {e}", error_code="DELETE_FAILED", status_code=500)

#     def _get_or_create_tags(self, tag_names):
#         """Helper to get existing tags or create new ones."""
#         tags = []
#         if not tag_names:
#             return tags
#         for name in tag_names:
#             if not name: continue
#             tag = Tag.query.filter_by(name=name).first()
#             if not tag:
#                 tag = Tag(name=name)
#                 db.session.add(tag)
#                 # Flush to ensure tag gets an ID if needed immediately,
#                 # or commit later if part of a larger transaction
#                 # db.session.flush()
#             tags.append(tag)
#         # Commit might happen outside if called within a larger transaction
#         # db.session.commit()
#         return tags

```

### Database Integration
-   Use `Flask-SQLAlchemy` for ORM and session management.
-   Use `Flask-Migrate` (Alembic) for database schema migrations.
-   Define models in `app/models/`.
-   Use transactions appropriately (often handled by Flask-SQLAlchemy session scope, but consider explicit blocks for complex operations).

```python
# app/utils/transaction.py (Example explicit transaction)
# from app import db
# from contextlib import contextmanager
# from flask import current_app

# @contextmanager
# def transaction():
#     """Provide a transactional scope around a series of operations."""
#     try:
#         yield db.session
#         db.session.commit()
#     except Exception as e:
#         db.session.rollback()
#         current_app.logger.error(f"Transaction failed: {e}", exc_info=True)
#         raise # Re-raise the exception after logging

# Usage:
# with transaction() as session:
#     # Perform multiple db operations using 'session'
#     obj1 = Model1(...)
#     session.add(obj1)
#     obj2 = Model2.query.get(1)
#     obj2.value = 'new'
```

```python
# migrations/env.py (created by Flask-Migrate)
# Ensure models are imported so Alembic detects them
# from app.models import User, Entry, Tag # etc.
# target_metadata = db.metadata
```

### Business Logic
-   Resides primarily within the Service Layer.
-   Handles validation (beyond basic form validation), calculations, state transitions, and coordination between models.

```python
# app/services/draft_service.py (Conceptual)
# from app.models import EntryDraft, Entry
# from app import db
# from app.errors.result import OperationResult
# from datetime import datetime

# class DraftService:
#     def save_draft(self, user_id, entry_id=None, title=None, content=None):
#         """Saves or updates a draft for a user."""
#         try:
#             draft = EntryDraft.query.filter_by(user_id=user_id, entry_id=entry_id).first()
#             if not draft:
#                 # Create new draft if one doesn't exist for this entry/user
#                 # Handle case where entry_id is None (new entry draft)
#                 draft = EntryDraft(user_id=user_id, entry_id=entry_id)
#                 db.session.add(draft)
#
#             if title is not None:
#                 draft.title = title
#             if content is not None:
#                 draft.content = content
#             draft.last_saved = datetime.utcnow()
#
#             db.session.commit()
#             return OperationResult.success_result(data={'last_saved': draft.last_saved.isoformat()})
#         except Exception as e:
#             db.session.rollback()
#             return OperationResult.failure_result(f"Failed to save draft: {e}", error_code="DRAFT_SAVE_ERROR")
#
#     def get_draft(self, user_id, entry_id=None):
#         """Retrieves a draft for a user."""
#         draft = EntryDraft.query.filter_by(user_id=user_id, entry_id=entry_id).first()
#         if not draft:
#             # Optionally check if the entry exists and return empty if no draft
#             # Or raise ResourceNotFoundError
#             return OperationResult.success_result(data=None) # No draft found
#         return OperationResult.success_result(data=draft)
#
#     def delete_draft(self, user_id, entry_id=None):
#         """Deletes a draft for a user."""
    <!-- HTMX error handling -->
    <script>
        document.addEventListener('htmx:responseError', function(event) {
            // Check if the error has already been handled by HX-Retarget
            if (!event.detail.xhr.getAllResponseHeaders().includes('HX-Retarget')) {
                // If not, show a generic error message
                const errorContainer = document.getElementById('error-container');
                errorContainer.innerHTML = `
                    <div class="error-notification" role="alert">
                        <div class="error-header">
                            <span class="error-status">${event.detail.xhr.status}</span>
                            <button class="close-error" onclick="this.parentElement.parentElement.remove()">&times;</button>
                        </div>
                        <div class="error-body">
                            <p class="error-message">An error occurred</p>
                        </div>
                    </div>
                `;
            }
        });
    </script>
    
    {% block scripts %}{% endblock %}
</body>
</html>
```

### LaTeX Rendering with MathJax

Configure the Markdown service to properly handle LaTeX:

```python
# app/services/markdown_service.py
import markdown
import bleach
from markupsafe import Markup
from bleach.sanitizer import Cleaner
from flask import current_app

class MarkdownService:
    """Service for rendering Markdown content with LaTeX support."""
    
    def __init__(self):
        """Initialize the service with default configuration."""
        # Configure markdown extensions
        self.md = markdown.Markdown(
            extensions=[
                'markdown.extensions.fenced_code',
                'markdown.extensions.tables',
                'markdown.extensions.footnotes',
                'markdown.extensions.toc',
                'markdown.extensions.nl2br',
                'markdown.extensions.codehilite',
            ]
        )
        
        # Configure allowed HTML tags, attributes, and styles
        self.allowed_tags = [
            'p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'a', 'img', 
            'blockquote', 'code', 'pre', 'hr', 'br', 'strong', 
            'em', 'i', 'b', 'table', 'thead', 'tbody', 'tr', 'th', 
            'td', 'caption', 'sup', 'sub', 'strike'
        ]
        
        self.allowed_attrs = {
            '*': ['class', 'id', 'title'],
            'a': ['href', 'rel', 'target'],
            'img': ['src', 'alt', 'width', 'height'],
            'code': ['class'],
            'pre': ['class']
        }
        
        self.allowed_styles = []
        
        self.allowed_protocols = ['http', 'https', 'mailto']
    
    def render(self, text):
        """
        Convert markdown to HTML with LaTeX handling.
        
        Args:
            text: Markdown text to convert
            
        Returns:
            Safe HTML with LaTeX expressions preserved
        """
        if not text:
            return ""
        
        # Convert markdown to HTML
        html = self.md.convert(text)
        
        # Create a custom cleaner for HTML sanitization
        cleaner = Cleaner(
            tags=self.allowed_tags,
            attributes=self.allowed_attrs,
            styles=self.allowed_styles,
            protocols=self.allowed_protocols,
            strip=True
        )
        
        # Sanitize HTML but preserve MathJax expressions
        # This is a simplified approach - a more robust solution would
        # require a custom processor to handle LaTeX expressions properly
        sanitized = cleaner.clean(html)
        
        # Return as safe markup
        return Markup(sanitized)
```

Create a Jinja2 template filter for Markdown rendering:

```python
# app/__init__.py (extended)
def create_app(config_name='default'):
    # ... previous code ...
    
    # Register template filters
    from app.services.markdown_service import MarkdownService
    markdown_service = MarkdownService()
    
    @app.template_filter('markdown')
    def markdown_filter(text):
        return markdown_service.render(text)
    
    # ... rest of the function ...
```

### Template Structure

Organize templates in a modular structure:

```
app/templates/
├── base.html                 # Base template with common elements
├── components/               # Reusable UI components
│   ├── entry_card.html       # Card for displaying entry in list
│   ├── flash_messages.html   # Flash message display
│   ├── form_field.html       # Reusable form field
│   ├── pagination.html       # Pagination controls
│   └── tag_cloud.html        # Tag display
├── errors/                   # Error pages
│   ├── 403.html
│   ├── 404.html
│   └── 500.html
├── auth/                     # Authentication templates
│   ├── login.html
│   ├── register.html
│   ├── profile.html
│   ├── change_password.html
│   └── reset_password.html
└── entries/                  # Entry management templates
    ├── list.html             # Entry listing
    ├── view.html             # Single entry view
    ├── create.html           # Entry creation form
    ├── edit.html             # Entry editing form
    └── search.html           # Search page
```

### Static Files Organization

Organize static files logically:

```
app/static/
├── css/
│   ├── main.css              # Main stylesheet
│   ├── normalize.css         # CSS reset
│   └── themes/               # Theme stylesheets
│       ├── dark.css
│       └── light.css
├── js/
│   ├── alpine.min.js         # Alpine.js library
│   ├── app.js                # Main application JavaScript
│   ├── editor.js             # Markdown editor functionality
│   ├── htmx.min.js           # HTMX library
│   └── theme.js              # Theme switching logic
└── img/
    ├── favicon.ico           # Favicon
    └── icons/                # UI icons
        ├── edit.svg
        ├── delete.svg
        └── search.svg
```

### UI Components

Create reusable components for the UI:

```html
<!-- app/templates/components/entry_card.html -->
<div class="entry-card">
    <div class="entry-header">
        <h2 class="entry-title">
            <a href="{{ url_for('entries.view', entry_id=entry.id) }}">
                {{ entry.title }}
            </a>
        </h2>
        <div class="entry-meta">
            <span class="entry-date">
                {{ entry.created_at.strftime('%b %d, %Y') }}
            </span>
            <span class="entry-reading-time">
                {{ entry.reading_time }} min read
            </span>
        </div>
    </div>
    
    <div class="entry-preview">
        {{ entry.content|markdown|truncate(150) }}
    </div>
    
    {% if entry.tags %}
    <div class="entry-tags">
        {% for tag in entry.tags %}
        <a href="{{ url_for('entries.by_tag', tag_name=tag.name) }}" class="tag">
            {{ tag.name }}
        </a>
        {% endfor %}
    </div>
    {% endif %}
    
    <div class="entry-actions">
        <a href="{{ url_for('entries.edit', entry_id=entry.id) }}" class="btn btn-sm">
            Edit
        </a>
        <button hx-delete="{{ url_for('api.entries.delete', entry_id=entry.id) }}"
                hx-target="#entry-{{ entry.id }}"
                hx-swap="outerHTML"
                hx-confirm="Are you sure you want to delete this entry?"
                class="btn btn-sm btn-danger">
            Delete
        </button>
    </div>
</div>
```

Create a reusable form field component:

```html
<!-- app/templates/components/form_field.html -->
{% macro render_field(field, label_class='', field_class='') %}
<div class="form-group {% if field.errors %}has-error{% endif %}">
    {{ field.label(class=label_class) }}
    
    {{ field(class=field_class, **kwargs)|safe }}
    
    {% if field.errors %}
    <div class="error-messages">
        {% for error in field.errors %}
        <div class="error-message">{{ error }}</div>
        {% endfor %}
    </div>
    {% endif %}
    
    {% if field.description %}
    <div class="field-description">{{ field.description }}</div>
    {% endif %}
</div>
{% endmacro %}
```

Create a Markdown editor with Alpine.js:

```html
<!-- app/templates/entries/editor.html -->
<div x-data="{
    mode: localStorage.getItem('editor_mode') || 'split',
    isDirty: false,
    content: '',
    originalContent: '',
    title: '',
    originalTitle: '',
    preview: '',
    isPreviewLoading: false,
    
    init() {
        this.content = this.$refs.contentInput.value;
        this.originalContent = this.content;
        this.title = this.$refs.titleInput.value;
        this.originalTitle = this.title;
        this.updateDirtyState();
        
        if (this.mode === 'preview' || this.mode === 'split') {
            this.updatePreview();
        }
        
        // Warn on page leave if dirty
        window.addEventListener('beforeunload', (e) => {
            if (this.isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    },
    
    updateDirtyState() {
        this.isDirty = this.content !== this.originalContent || 
                      this.title !== this.originalTitle;
    },
    
    updatePreview() {
        this.isPreviewLoading = true;
        
        fetch('/api/v1/markdown', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name=csrf-token]').content
            },
            body: JSON.stringify({ text: this.content })
        })
        .then(response => response.json())
        .then(data => {
            this.preview = data.data.html;
            this.isPreviewLoading = false;
            
            // Trigger MathJax rendering if available
            if (window.MathJax) {
                window.MathJax.typeset();
            }
        })
        .catch(error => {
            console.error('Error updating preview:', error);
            this.isPreviewLoading = false;
        });
    },
    
    setMode(newMode) {
        this.mode = newMode;
        localStorage.setItem('editor_mode', newMode);
        
        if (newMode === 'preview' || newMode === 'split') {
            this.updatePreview();
        }
    },
    
    saveEntry() {
        const form = document.getElementById('entry-form');
        form.submit();
    }
}" class="editor-container">
    
    <!-- Editor Toolbar -->
    <div class="editor-toolbar">
        <div class="mode-switcher">
            <button @click="setMode('edit')" 
                    :class="{ active: mode === 'edit' }"
                    type="button">
                Edit
            </button>
            <button @click="setMode('preview')" 
                    :class="{ active: mode === 'preview' }"
                    type="button">
                Preview
            </button>
            <button @click="setMode('split')" 
                    :class="{ active: mode === 'split' }"
                    type="button">
                Split
            </button>
        </div>
        <span x-show="isDirty" class="dirty-indicator">●</span>
    </div>
    
    <!-- Editor Form -->
    <form id="entry-form" action="{{ action_url }}" method="POST">
        <input type="hidden" name="csrf_token" value="{{ csrf_token() }}">
        
        <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" name="title" 
                   x-ref="titleInput" 
                   x-model="title" 
                   @input="updateDirtyState()"
                   required>
        </div>
        
        <div class="editor-content">
            <!-- Edit Pane -->
            <div class="edit-pane" x-show="mode === 'edit' || mode === 'split'"
                 :class="{ 'full-width': mode === 'edit', 'half-width': mode === 'split' }">
                <textarea id="content" name="content" 
                          x-ref="contentInput" 
                          x-model="content" 
                          @input="updateDirtyState(); if(mode === 'split') updatePreview();"
                          required></textarea>
            </div>
            
            <!-- Preview Pane -->
            <div class="preview-pane" x-show="mode === 'preview' || mode === 'split'"
                 :class="{ 'full-width': mode === 'preview', 'half-width': mode === 'split' }">
                <div x-show="isPreviewLoading" class="preview-loading">Loading preview...</div>
                <div x-show="!isPreviewLoading" class="preview-content mathjax" x-html="preview"></div>
            </div>
        </div>
        
        <div class="form-group">
            <label for="tags">Tags (comma separated)</label>
            <input type="text" id="tags" name="tags" value="{{ form.tags.data or '' }}">
        </div>
        
        <div class="form-group">
            <label class="checkbox-label">
                <input type="checkbox" id="is_public" name="is_public" value="true"
                      {% if form.is_public.data %}checked{% endif %}>
                Make this entry public
            </label>
        </div>
        
        <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save</button>
            <button type="button" class="btn" onclick="history.back()">Cancel</button>
        </div>
    </form>
</div>
```

## Backend Implementation

### Service Layer

Implement the entry service with core business logic:

```python
# app/services/entry_service.py
from datetime import datetime
from sqlalchemy import desc, asc
from app.models.content import Entry, Tag, EntryVersion
from app.errors.exceptions import ResourceNotFoundError, AuthorizationError
from app.errors.result import OperationResult
from app import db
from app.utils.transaction import transaction

class EntryService:
    """Service for managing journal entries."""
    
    def create_entry(self, user_id, entry_data):
        """
        Create a new entry.
        
        Args:
            user_id: ID of the user creating the entry
            entry_data: Dict containing entry data (title, content, tags, is_public)
            
        Returns:
            OperationResult with entry ID on success
        """
        try:
            with transaction():
                # Create new entry
                entry = Entry(
                    title=entry_data.get('title'),
                    content=entry_data.get('content'),
                    user_id=user_id,
                    is_public=entry_data.get('is_public', False)
                )
                
                # Process tags
                tags = entry_data.get('tags', [])
                if tags:
                    for tag_name in tags:
                        # Find existing tag or create new one
                        tag = Tag.query.filter_by(name=tag_name).first()
                        if not tag:
                            tag = Tag(name=tag_name)
                            db.session.add(tag)
                        
                        entry.tags.append(tag)
                
                db.session.add(entry)
            
            return OperationResult.success_result(
                message="Entry created successfully",
                data={"entry_id": entry.id}
            )
        except Exception as e:
            return OperationResult.from_exception(e)
    
    def get_entry(self, entry_id, user_id):
        """
        Get a specific entry by ID.
        
        Args:
            entry_id: ID of the entry to retrieve
            user_id: ID of the user making the request
            
        Returns:
            OperationResult with entry data on success
        """
        try:
            entry = Entry.query.get(entry_id)
            
            if not entry:
                raise ResourceNotFoundError(
                    message="Entry not found",
                    code="ENTRY_NOT_FOUND"
                )
            
            # Check if user has permission to view this entry
            if entry.user_id != user_id and not entry.is_public:
                raise AuthorizationError(
                    message="Not authorized to view this entry",
                    code="AUTHORIZATION_ERROR"
                )
            
            # Convert entry to dict
            entry_data = {
                'id': entry.id,
                'title': entry.title,
                'content': entry.content,
                'created_at': entry.created_at.isoformat(),
                'updated_at': entry.updated_at.isoformat(),
                'user_id': entry.user_id,
                'is_public': entry.is_public,
                'reading_time': entry.reading_time,
                'tags': [{'id': tag.id, 'name': tag.name} for tag in entry.tags]
            }
            
            return OperationResult.success_result(
                data=entry_data
            )
        except Exception as e:
            return OperationResult.from_exception(e)
    
    def update_entry(self, entry_id, user_id, entry_data):
        """
        Update an existing entry.
        
        Args:
            entry_id: ID of the entry to update
            user_id: ID of the user making the request
            entry_data: Dict containing updated entry data
            
        Returns:
            OperationResult with entry ID on success
        """
        try:
            with transaction():
                entry = Entry.query.get(entry_id)
                
                if not entry:
                    raise ResourceNotFoundError(
                        message="Entry not found",
                        code="ENTRY_NOT_FOUND"
                    )
                
                # Check if user has permission to update this entry
                if entry.user_id != user_id:
                    raise AuthorizationError(
                        message="Not authorized to update this entry",
                        code="AUTHORIZATION_ERROR"
                    )
                
                # Save previous version
                version = EntryVersion(
                    entry_id=entry.id,
                    title=entry.title,
                    content=entry.content,
                    created_at=entry.updated_at,
                    version=entry.version,
                    is_conflict=False
                )
                db.session.add(version)
                
                # Update entry fields
                if 'title' in entry_data:
                    entry.title = entry_data['title']
                
                if 'content' in entry_data:
                    entry.content = entry_data['content']
                
                if 'is_public' in entry_data:
                    entry.is_public = entry_data['is_public']
                
                # Update tags if provided
                if 'tags' in entry_data:
                    # Clear existing tags
                    entry.tags = []
                    
                    # Add new tags
                    for tag_name in entry_data['tags']:
                        tag = Tag.query.filter_by(name=tag_name).first()
                        if not tag:
                            tag = Tag(name=tag_name)
                            db.session.add(tag)
                        
                        entry.tags.append(tag)
                
                # Increment version
                entry.version += 1
            
            return OperationResult.success_result(
                message="Entry updated successfully",
                data={"entry_id": entry.id}
            )
        except Exception as e:
            return OperationResult.from_exception(e)
    
    def delete_entry(self, entry_id, user_id):
        """
        Delete an entry.
        
        Args:
            entry_id: ID of the entry to delete
            user_id: ID of the user making the request
            
        Returns:
            OperationResult with success or failure
        """
        try:
            with transaction():
                entry = Entry.query.get(entry_id)
                
                if not entry:
                    raise ResourceNotFoundError(
                        message="Entry not found",
                        code="ENTRY_NOT_FOUND"
                    )
                
                # Check if user has permission to delete this entry
                if entry.user_id != user_id:
                    raise AuthorizationError(
                        message="Not authorized to delete this entry",
                        code="AUTHORIZATION_ERROR"
                    )
                
                # Delete the entry
                db.session.delete(entry)
            
            return OperationResult.success_result(
                message="Entry deleted successfully"
            )
        except Exception as e:
            return OperationResult.from_exception(e)
    
    def get_entries(self, user_id, page=1, per_page=10, sort_by='created_at', 
                   sort_order='desc', tag=None):
        """
        Get a paginated list of entries.
        
        Args:
            user_id: ID of the user making the request
            page: Page number (default: 1)
            per_page: Entries per page (default: 10)
            sort_by: Field to sort by (default: created_at)
            sort_order: Sort direction (asc or desc, default: desc)
            tag: Optional tag name to filter by
            
        Returns:
            OperationResult with entries and pagination info
        """
        try:
            # Start with query for user's entries
            query = Entry.query.filter_by(user_id=user_id)
            
            # Apply tag filter if provided
            if tag:
                query = query.join(Entry.tags).filter(Tag.name == tag)
            
            # Apply sorting
            if hasattr(Entry, sort_by):
                sort_col = getattr(Entry, sort_by)
                if sort_order.lower() == 'asc':
                    query = query.order_by(asc(sort_col))
                else:
                    query = query.order_by(desc(sort_col))
            else:
                # Default sort by created_at
                query = query.order_by(desc(Entry.created_at))
            
            # Execute paginated query
            entries_page = query.paginate(page=page, per_page=per_page)
            
            # Convert entries to dict
            entries = []
            for entry in entries_page.items:
                entries.append({
                    'id': entry.id,
                    'title': entry.title,
                    'content': entry.content,
                    'created_at': entry.created_at.isoformat(),
                    'updated_at': entry.updated_at.isoformat(),
                    'is_public': entry.is_public,
                    'reading_time': entry.reading_time,
                    'tags': [{'id': tag.id, 'name': tag.name} for tag in entry.tags]
                })
            
            # Construct pagination info
            pagination = {
                'page': entries_page.page,
                'per_page': entries_page.per_page,
                'pages': entries_page.pages,
                'total': entries_page.total,
                'has_prev': entries_page.has_prev,
                'has_next': entries_page.has_next,
                'prev_num': entries_page.prev_num if entries_page.has_prev else None,
                'next_num': entries_page.next_num if entries_page.has_next else None
            }
            
            return OperationResult.success_result(
                data={
                    'entries': entries,
                    'pagination': pagination
                }
            )
        except Exception as e:
            return OperationResult.from_exception(e)
    
    def search_entries(self, user_id, query, page=1, per_page=10):
        """
        Search entries by title and content.
        
        Args:
            user_id: ID of the user making the request
            query: Search query string
            page: Page number (default: 1)
            per_page: Entries per page (default: 10)
            
        Returns:
            OperationResult with entries and pagination info
        """
        try:
            # Perform search
            search_query = Entry.query.filter_by(user_id=user_id).filter(
                (Entry.title.ilike(f'%{query}%')) | 
                (Entry.content.ilike(f'%{query}%'))
            ).order_by(desc(Entry.created_at))
            
            # Execute paginated query
            entries_page = search_query.paginate(page=page, per_page=per_page)
            
            # Convert entries to dict
            entries = []
            for entry in entries_page.items:
                entries.append({
                    'id': entry.id,
                    'title': entry.title,
                    'content': entry.content,
                    'created_at': entry.created_at.isoformat(),
                    'updated_at': entry.updated_at.isoformat(),
                    'is_public': entry.is_public,
                    'reading_time': entry.reading_time,
                    'tags': [{'id': tag.id, 'name': tag.name} for tag in entry.tags]
                })
            
            # Construct pagination info
            pagination = {
                'page': entries_page.page,
                'per_page': entries_page.per_page,
                'pages': entries_page.pages,
                'total': entries_page.total,
                'has_prev': entries_page.has_prev,
                'has_next': entries_page.has_next,
                'prev_num': entries_page.prev_num if entries_page.has_prev else None,
                'next_num': entries_page.next_num if entries_page.has_next else None
            }
            
            return OperationResult.success_result(
                data={
                    'entries': entries,
                    'pagination': pagination
                }
            )
        except Exception as e:
            return OperationResult.from_exception(e)
```

### Database Integration

Create a transaction context manager for database operations:

```python
# app/utils/transaction.py
from contextlib import contextmanager
from flask import current_app
from sqlalchemy.exc import SQLAlchemyError
from app import db
from app.errors.exceptions import ExternalServiceError

@contextmanager
def transaction():
    """
    Context manager for database transactions.
    Automatically commits or rolls back on success/error.
    """
    try:
        yield
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        
        # Log the error but re-raise for proper error handling up the stack
        current_app.logger.error(f"Transaction error: {str(e)}", exc_info=True)
        
        # If it's a SQLAlchemy error, wrap it in our ExternalServiceError
        if isinstance(e, SQLAlchemyError):
            raise ExternalServiceError(
                message="Database operation failed",
                code="DATABASE_ERROR",
                details={"original_error": str(e)}
            ) from e
        
        # Otherwise, re-raise the original exception
        raise
```

Configure database migrations with Flask-Migrate:

```python
# migrations/env.py (created by Flask-Migrate)
from alembic import context
from flask import current_app

# Import models to ensure they're picked up by Alembic
from app.models.user import User, UserPreferences
from app.models.content import Entry, Tag, EntryVersion, EntryDraft

config = context.config
config.set_main_option('sqlalchemy.url', current_app.config.get('SQLALCHEMY_DATABASE_URI'))
target_metadata = current_app.extensions['migrate'].db.metadata

def run_migrations_online():
    """Run migrations in 'online' mode."""
    with current_app.app_context():
        context.configure(
            url=config.get_main_option('sqlalchemy.url'),
            target_metadata=target_metadata,
            literal_binds=True,
            compare_type=True
        )
        
        with context.begin_transaction():
            context.run_migrations()

run_migrations_online()
```

### Business Logic

Implement a draft service for auto-save functionality:

```python
# app/services/draft_service.py
from datetime import datetime, timedelta
from app.models.content import EntryDraft
from app.errors.result import OperationResult
from app import db
from app.utils.transaction import transaction

class DraftService:
    """Service for managing draft entries."""
    
    def save_draft(self, user_id, data):
        """
        Save entry draft to database.
        
        Args:
            user_id: ID of the user saving the draft
            data: Dict containing draft data (entry_id, title, content)
            
        Returns:
            OperationResult with draft data on success
        """
        try:
            with transaction():
                entry_id = data.get('entry_id')
                
                # Look for existing draft
                if entry_id:
                    draft = EntryDraft.query.filter_by(
                        user_id=user_id, 
                        entry_id=entry_id
                    ).first()
                else:
                    draft = EntryDraft.query.filter_by(
                        user_id=user_id, 
                        entry_id=None
                    ).first()
                
                # Create new draft if none exists
                if not draft:
                    draft = EntryDraft(
                        user_id=user_id,
                        entry_id=entry_id,
                        title=data.get('title', ''),
                        content=data.get('content', '')
                    )
                    db.session.add(draft)
                else:
                    # Update existing draft
                    draft.title = data.get('title', '')
                    draft.content = data.get('content', '')
                    draft.last_saved = datetime.utcnow()
            
            return OperationResult.success_result(
                message="Draft saved successfully",
                data={
                    'id': draft.id,
                    'entry_id': draft.entry_id,
                    'title': draft.title,
                    'content': draft.content,
                    'last_saved': draft.last_saved.isoformat()
                }
            )
        except Exception as e:
            return OperationResult.from_exception(e)
    
    def get_draft(self, user_id, entry_id=None):
        """
        Get draft for editing an entry, or a new entry draft.
        
        Args:
            user_id: ID of the user
            entry_id: ID of the entry (None for new entry draft)
            
        Returns:
            OperationResult with draft data on success
        """
        try:
            if entry_id:
                draft = EntryDraft.query.filter_by(
                    user_id=user_id, 
                    entry_id=entry_id
                ).first()
            else:
                draft = EntryDraft.query.filter_by(
                    user_id=user_id, 
                    entry_id=None
                ).first()
            
            if not draft:
                return OperationResult.failure_result(
                    message="No draft found",
                    error_code="NOT_FOUND",
                    status_code=404
                )
            
            return OperationResult.success_result(
                data={
                    'id': draft.id,
                    'entry_id': draft.entry_id,
                    'title': draft.title,
                    'content': draft.content,
                    'last_saved': draft.last_saved.isoformat()
                }
            )
        except Exception as e:
            return OperationResult.from_exception(e)
    
    def delete_draft(self, user_id, entry_id=None):
        """
        Delete a draft after it's been published or discarded.
        
        Args:
            user_id: ID of the user
            entry_id: ID of the entry (None for new entry draft)
            
        Returns:
            OperationResult with success or failure
        """
        try:
            with transaction():
                if entry_id:
                    draft = EntryDraft.query.filter_by(
                        user_id=user_id, 
                        entry_id=entry_id
                    ).first()
                else:
                    draft = EntryDraft.query.filter_by(
                        user_id=user_id, 
                        entry_id=None
                    ).first()
                
                if not draft:
                    return OperationResult.failure_result(
                        message="No draft found",
                        error_code="NOT_FOUND",
                        status_code=404
                    )
                
                db.session.delete(draft)
            
            return OperationResult.success_result(
                message="Draft deleted successfully"
            )
        except Exception as e:
            return OperationResult.from_exception(e)
    
    def cleanup_old_drafts(self, days=30):
        """
        Clean up drafts older than specified days.
        
        Args:
            days: Number of days to keep drafts
            
        Returns:
            Number of drafts deleted
        """
        try:
            with transaction():
                cutoff_date = datetime.utcnow() - timedelta(days=days)
                old_drafts = EntryDraft.query.filter(
                    EntryDraft.last_saved < cutoff_date
                ).all()
                
                count = len(old_drafts)
                
                for draft in old_drafts:
                    db.session.delete(draft)
            
            return count
        except Exception:
            return 0
```

### Error Handling

Implement an enhanced logging setup:

```python
# app/utils/logging.py
import logging
import json
from datetime import datetime
from flask import request, has_request_context, g

class StructuredLogFormatter(logging.Formatter):
    """
    Formatter that outputs JSON-formatted logs with standard fields.
    """
    def format(self, record):
        log_record = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Add request context if available
        if has_request_context():
            log_record.update({
                'request_id': getattr(g, 'request_id', None),
                'method': request.method,
                'path': request.path,
                'remote_addr': request.remote_addr,
                'user_agent': request.user_agent.string if request.user_agent else None,
                'user_id': getattr(g, 'user_id', None)
            })
        
        # Add exception info if available
        if record.exc_info:
            exc_type, exc_value, exc_tb = record.exc_info
            log_record['exception'] = {
                'type': exc_type.__name__,
                'message': str(exc_value)
            }
        
        # Add custom attributes
        if hasattr(record, 'props'):
            log_record.update(record.props)
        
        return json.dumps(log_record)

def configure_logging(app):
    """
    Configure application logging to output to stdout/stderr.
    
    Args:
        app: Flask application instance
    """
    # Set log level from config
    log_level = getattr(logging, app.config.get('LOG_LEVEL', 'INFO'))
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Create and configure handler for stdout
    handler = logging.StreamHandler()
    handler.setFormatter(StructuredLogFormatter())
    root_logger.addHandler(handler)
    
    # Configure Flask app logger
    app.logger.setLevel(log_level)
    
    # Log application startup
    app.logger.info("Application started", extra={
        'props': {
            'environment': app.config.get('ENV'),
            'debug': app.debug
        }
    })
```

Add request context middleware:

```python
# app/middleware/request_context.py
import time
import uuid
from flask import g, request, current_app
from flask_login import current_user

def request_context_middleware(app):
    """
    Middleware to add context information to each request.
    This enriches logs with valuable debugging information.
    
    Args:
        app: Flask application instance
    """
    @app.before_request
    def before_request():
        # Generate unique request ID
        g.request_id = str(uuid.uuid4())
        
        # Track start time for performance logging
        g.start_time = time.time()
        
        # Add user ID if authenticated
        if current_user.is_authenticated:
            g.user_id = current_user.id
        
        # Log incoming request
        current_app.logger.info(
            f"Request started: {request.method} {request.path}",
            extra={
                'props': {
                    'request_id': g.request_id,
                    'method': request.method,
                    'path': request.path,
                    'remote_addr': request.remote_addr,
                    'user_agent': request.user_agent.string if request.user_agent else None
                }
            }
        )
    
    @app.after_request
    def after_request(response):
        # Calculate request duration
        if hasattr(g, 'start_time'):
            duration_ms = (time.time() - g.start_time) * 1000
            
            # Add response metrics to log
            current_app.logger.info(
                f"Request completed: {request.method} {request.path} {response.status_code}",
                extra={
                    'props': {
                        'request_id': getattr(g, 'request_id', None),
                        'method': request.method,
                        'path': request.path,
                        'status_code': response.status_code,
                        'duration_ms': round(duration_ms, 2),
                        'response_size': len(response.data) if response.data else 0
                    }
                }
            )
        
        return response
    
    @app.teardown_request
    def teardown_request(exception=None):
        if exception:
            # Log request exception
            current_app.logger.error(
                f"Request failed: {request.method} {request.path}",
                extra={
                    'props': {
                        'request_id': getattr(g, 'request_id', None),
                        'method': request.method,
                        'path': request.path,
                        'exception': str(exception)
                    }
                },
                exc_info=exception
            )
```

## State Management

### Client-Side State

Use Alpine.js for client-side state management:

```javascript
// app/static/js/app.js
document.addEventListener('DOMContentLoaded', function() {
    // Document is ready
    console.log('Application initialized');
    
    // Initialize HTMX events
    document.body.addEventListener('htmx:configRequest', function(event) {
        // Add CSRF token to all HTMX requests
        event.detail.headers['X-CSRFToken'] = 
            document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    });
    
    // Global error handling
    document.body.addEventListener('htmx:responseError', function(event) {
        console.error('HTMX error:', event.detail);
    });
    
    // Initialize Alpine events
    document.addEventListener('alpine:initialized', function() {
        console.log('Alpine.js initialized');
    });
});
```

Use localStorage for theme persistence:

```javascript
// app/static/js/theme.js
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('darkMode');
    
    // Apply theme based on preference or system setting
    if (savedTheme === 'true' || 
        (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.add('light-theme');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        // Only update if user hasn't set a preference
        if (localStorage.getItem('darkMode') === null) {
            if (event.matches) {
                document.body.classList.add('dark-theme');
                document.body.classList.remove('light-theme');
            } else {
                document.body.classList.add('light-theme');
                document.body.classList.remove('dark-theme');
            }
        }
    });
});
```

Implement editor auto-save:

```javascript
// app/static/js/editor.js
document.addEventListener('DOMContentLoaded', function() {
    const editor = {
        init() {
            // Elements
            this.form = document.getElementById('entry-form');
            this.titleInput = document.getElementById('title');
            this.contentInput = document.getElementById('content');
            this.entryId = document.getElementById('entry-id')?.value;
            this.saveStatus = document.getElementById('save-status');
            
            // Only initialize if we're on an edit page
            if (!this.form || !this.contentInput) return;
            
            // Initialize localStorage key
            this.storageKey = this.entryId 
                ? `draft_entry_${this.entryId}` 
                : 'draft_new_entry';
            
            // Restore draft if available
            this.checkForDraft();
            
            // Set up auto-save
            this.setupAutoSave();
            
            // Set up form submission (clears draft)
            this.setupFormSubmission();
        },
        
        checkForDraft() {
            const saved = localStorage.getItem(this.storageKey);
            if (!saved) return;
            
            try {
                const draft = JSON.parse(saved);
                const serverTimestamp = this.form.dataset.lastSaved;
                
                // If draft is newer than server version, offer to restore
                if (!serverTimestamp || new Date(draft.timestamp) > new Date(serverTimestamp)) {
                    this.showDraftRecoveryDialog(draft);
                } else {
                    // Draft is older, discard it
                    localStorage.removeItem(this.storageKey);
                }
            } catch (e) {
                console.error('Error parsing draft:', e);
                localStorage.removeItem(this.storageKey);
            }
        },
        
        showDraftRecoveryDialog(draft) {
            if (confirm('We found a saved draft. Would you like to restore it?')) {
                this.titleInput.value = draft.title;
                this.contentInput.value = draft.content;
                
                // Trigger any Alpine.js data binding
                this.titleInput.dispatchEvent(new Event('input'));
                this.contentInput.dispatchEvent(new Event('input'));
            } else {
                localStorage.removeItem(this.storageKey);
            }
        },
        
        setupAutoSave() {
            let saveTimeout;
            const saveToLocal = () => {
                const draft = {
                    title: this.titleInput.value,
                    content: this.contentInput.value,
                    timestamp: new Date().toISOString()
                };
                
                localStorage.setItem(this.storageKey, JSON.stringify(draft));
                
                if (this.saveStatus) {
                    this.saveStatus.textContent = 'Saved locally';
                    setTimeout(() => {
                        this.saveStatus.textContent = '';
                    }, 2000);
                }
                
                // Also save to server
                this.saveToServer(draft);
            };
            
            // Auto-save on input with debounce
            const autoSave = () => {
                if (this.saveStatus) {
                    this.saveStatus.textContent = 'Saving...';
                }
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(saveToLocal, 2000);
            };
            
            this.titleInput.addEventListener('input', autoSave);
            this.contentInput.addEventListener('input', autoSave);
        },
        
        saveToServer(draft) {
            // Prepare data
            const data = {
                title: draft.title,
                content: draft.content
            };
            
            if (this.entryId) {
                data.entry_id = this.entryId;
            }
            
            // Send to server
            fetch('/api/v1/drafts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Server error');
                }
                return response.json();
            })
            .then(result => {
                if (result.success) {
                    if (this.saveStatus) {
                        this.saveStatus.textContent = 'Saved to server';
                        setTimeout(() => {
                            this.saveStatus.textContent = '';
                        }, 2000);
                    }
                }
            })
            .catch(error => {
                console.error('Error saving draft to server:', error);
                if (this.saveStatus) {
                    this.saveStatus.textContent = 'Error saving to server';
                }
            });
        },
        
        setupFormSubmission() {
            this.form.addEventListener('submit', () => {
                // Clear draft on successful form submission
                localStorage.removeItem(this.storageKey);
            });
        }
    };
    
    editor.init();
});
```

### Server-Side State

Store user preferences in the database:

```python
# app/services/preferences_service.py
from flask import session
from app.models.user import UserPreferences
from app.errors.result import OperationResult
from app import db
from app.utils.transaction import transaction

class PreferencesService:
    """Service for managing user preferences."""
    
    def get_user_preferences(self, user_id):
        """
        Get user preferences from database, or create default if not exists.
        Also caches in session for quick access.
        
        Args:
            user_id: ID of the user
            
        Returns:
            OperationResult with preferences data
        """
        try:
            # Check session cache first
            if 'user_preferences' in session:
                return OperationResult.success_result(
                    data=session['user_preferences']
                )
            
            # Get from database
            prefs = UserPreferences.query.filter_by(user_id=user_id).first()
            
            # Create default preferences if not exists
            if not prefs:
                with transaction():
                    prefs = UserPreferences(user_id=user_id)
                    db.session.add(prefs)
            
            # Convert to dict for session storage
            prefs_dict = {
                'theme': prefs.theme,
                'editor_mode': prefs.editor_mode,
                'entries_per_page': prefs.entries_per_page,
                'markdown_guide_dismissed': prefs.markdown_guide_dismissed
            }
            
            # Cache in session
            session['user_preferences'] = prefs_dict
            
            return OperationResult.success_result(
                data=prefs_dict
            )
        except Exception as e:
            return OperationResult.from_exception(e)
    
    def update_preferences(self, user_id, preferences_data):
        """
        Update user preferences in both database and session.
        
        Args:
            user_id: ID of the user
            preferences_data: Dict containing preference settings to update
            
        Returns:
            OperationResult with updated preferences
        """
        try:
            with transaction():
                # Get preferences from database
                prefs = UserPreferences.query.filter_by(user_id=user_id).first()
                
                if not prefs:
                    prefs = UserPreferences(user_id=user_id)
                    db.session.add(prefs)
                
                # Update allowed fields
                allowed_fields = ['theme', 'editor_mode', 'entries_per_page', 'markdown_guide_dismissed']
                for field in allowed_fields:
                    if field in preferences_data:
                        setattr(prefs, field, preferences_data[field])
            
            # Convert to dict for session storage
            prefs_dict = {
                'theme': prefs.theme,
                'editor_mode': prefs.editor_mode,
                'entries_per_page': prefs.entries_per_page,
                'markdown_guide_dismissed': prefs.markdown_guide_dismissed
            }
            
            # Update session cache
            session['user_preferences'] = prefs_dict
            
            return OperationResult.success_result(
                message="Preferences updated successfully",
                data=prefs_dict
            )
        except Exception as e:
            return OperationResult.from_exception(e)
```

Use Redis for caching:

```python
# app/services/cache_service.py
from datetime import datetime, timedelta
import json
from flask import current_app
import redis

class CacheService:
    """Service for caching data in Redis."""
    
    def __init__(self):
        """Initialize the cache service."""
        self.redis = current_app.redis
        self.prefix = 'cache:'
    
    def get(self, key):
        """
        Get a value from the cache.
        
        Args:
            key: Cache key
        
        Returns:
            Cached value or None if not found or expired
        """
        full_key = f"{self.prefix}{key}"
        
        # Get from Redis
        data = self.redis.get(full_key)
        if not data:
            return None
        
        # Parse the JSON data
        try:
            cached = json.loads(data)
            
            # Check expiry
            if 'expires' in cached and cached['expires'] < datetime.utcnow().timestamp():
                # Expired
                self.redis.delete(full_key)
                return None
            
            return cached['value']
        except Exception:
            # Invalid data
            return None
    
    def set(self, key, value, timeout=300):
        """
        Set a value in the cache.
        
        Args:
            key: Cache key
            value: Value to cache
            timeout: Cache timeout in seconds (default: 5 minutes)
        """
        full_key = f"{self.prefix}{key}"
        
        # Create cache data
        data = {
            'value': value,
            'expires': (datetime.utcnow() + timedelta(seconds=timeout)).timestamp()
        }
        
        # Store in Redis
        self.redis.set(full_key, json.dumps(data))
    
    def delete(self, key):
        """
        Delete a value from the cache.
        
        Args:
            key: Cache key
        """
        full_key = f"{self.prefix}{key}"
        self.redis.delete(full_key)
    
    def clear_pattern(self, pattern):
        """
        Clear all keys matching a pattern.
        
        Args:
            pattern: Key pattern to match
        """
        pattern = f"{self.prefix}{pattern}*"
        keys = self.redis.keys(pattern)
        
        if keys:
            self.redis.delete(*keys)
```

### Data Synchronization

Implement conflict resolution for entry updates:

```python
# app/services/entry_service.py (update_entry method updated)
def update_entry(self, entry_id, user_id, entry_data, check_version=True):
    """
    Update an existing entry with conflict detection.
    
    Args:
        entry_id: ID of the entry to update
        user_id: ID of the user making the request
        entry_data: Dict containing updated entry data
        check_version: Whether to check for version conflicts
        
    Returns:
        OperationResult with entry ID on success or conflict info on failure
    """
    try:
        with transaction():
            entry = Entry.query.get(entry_id)
            
            if not entry:
                raise ResourceNotFoundError(
                    message="Entry not found",
                    code="ENTRY_NOT_FOUND"
                )
            
            # Check if user has permission to update this entry
            if entry.user_id != user_id:
                raise AuthorizationError(
                    message="Not authorized to update this entry",
                    code="AUTHORIZATION_ERROR"
                )
            
            # Check for version conflicts
            client_version = entry_data.get('version')
            if check_version and client_version and entry.version > client_version:
                # Conflict detected - create a conflict version
                conflict = EntryVersion(
                    entry_id=entry.id,
                    title=entry_data.get('title'),
                    content=entry_data.get('content'),
                    created_at=datetime.utcnow(),
                    version=entry.version,
                    is_conflict=True
                )
                db.session.add(conflict)
                db.session.commit()
                
                return OperationResult.failure_result(
                    message="Conflict detected",
                    error_code="CONFLICT",
                    status_code=409,
                    data={
                        'conflict_id': conflict.id,
                        'server_version': entry.version,
                        'server_updated_at': entry.updated_at.isoformat()
                    }
                )
            
            # Save previous version
            version = EntryVersion(
                entry_id=entry.id,
                title=entry.title,
                content=entry.content,
                created_at=entry.updated_at,
                version=entry.version,
                is_conflict=False
            )
            db.session.add(version)
            
            # Update entry fields
            if 'title' in entry_data:
                entry.title = entry_data['title']
            
            if 'content' in entry_data:
                entry.content = entry_data['content']
            
            if 'is_public' in entry_data:
                entry.is_public = entry_data['is_public']
            
            # Update tags if provided
            if 'tags' in entry_data:
                # Clear existing tags
                entry.tags = []
                
                # Add new tags
                for tag_name in entry_data['tags']:
                    tag = Tag.query.filter_by(name=tag_name).first()
                    if not tag:
                        tag = Tag(name=tag_name)
                        db.session.add(tag)
                    
                    entry.tags.append(tag)
            
            # Increment version
            entry.version += 1
        
        return OperationResult.success_result(
            message="Entry updated successfully",
            data={
                "entry_id": entry.id,
                "version": entry.version,
                "updated_at": entry.updated_at.isoformat()
            }
        )
    except Exception as e:
        return OperationResult.from_exception(e)
```

Implement a route for resolving conflicts:

```python
# app/routes/entries.py
@entries_bp.route('/<int:entry_id>/conflict', methods=['GET', 'POST'])
@login_required
def resolve_conflict(entry_id):
    """Handle conflict resolution for an entry."""
    # Get entry
    entry = Entry.query.get_or_404(entry_id)
    
    # Check authorization
    if entry.user_id != current_user.id:
        abort(403)
    
    # Get the latest conflict version
    conflict_version = EntryVersion.query.filter_by(
        entry_id=entry.id,
        is_conflict=True
    ).order_by(EntryVersion.created_at.desc()).first()
    
    if not conflict_version:
        flash('No conflict found', 'error')
        return redirect(url_for('entries.edit', entry_id=entry.id))
    
    # Handle form submission
    if request.method == 'POST':
        # Get the resolved content
        resolved_content = request.form.get('content')
        
        # Update the entry
        result = entry_service.update_entry(
            entry_id=entry.id,
            user_id=current_user.id,
            entry_data={
                'content': resolved_content
            },
            check_version=False  # Skip version check for conflict resolution
        )
        
        if result.success:
            # Mark conflict as resolved
            conflict_version.is_conflict = False
            db.session.commit()
            
            flash('Conflict resolved successfully', 'success')
            return redirect(url_for('entries.view', entry_id=entry.id))
        else:
            flash(result.message, 'error')
    
    # Render conflict resolution form
    return render_template(
        'entries/conflict.html',
        entry=entry,
        conflict_version=conflict_version
    )
```

Create a conflict resolution UI with Alpine.js:

```html
<!-- app/templates/entries/conflict.html -->
{% extends 'base.html' %}

{% block title %}Resolve Conflict - {{ entry.title }}{% endblock %}

{% block content %}
<div x-data="{
    serverContent: {{ entry.content|tojson }},
    localContent: {{ conflict_version.content|tojson }},
    mergedContent: '',
    mode: 'compare',
    
    init() {
        this.mergedContent = this.localContent;
    }
}" class="conflict-resolution">
    <div class="conflict-header">
        <h2>Resolve Content Conflict</h2>
        <p>There was a conflict between your changes and the server version.</p>
        
        <div class="conflict-actions">
            <button @click="mode = 'compare'" 
                    :class="{ active: mode === 'compare' }"
                    type="button">
                Compare
            </button>
            <button @click="mode = 'merge'" 
                    :class="{ active: mode === 'merge' }"
                    type="button">
                Merge
            </button>
            <button @click="mode = 'use-local'; mergedContent = localContent" 
                    :class="{ active: mode === 'use-local' }"
                    type="button">
                Use My Version
            </button>
            <button @click="mode = 'use-server'; mergedContent = serverContent" 
                    :class="{ active: mode === 'use-server' }"
                    type="button">
                Use Server Version
            </button>
        </div>
    </div>
    
    <div class="conflict-content">
        <!-- Compare Mode -->
        <div x-show="mode === 'compare'" class="conflict-compare">
            <div class="server-version">
                <h3>Server Version</h3>
                <div class="content">{{ entry.content|markdown }}</div>
                <div class="meta">
                    Last updated: {{ entry.updated_at|format_datetime }}
                </div>
            </div>
            
            <div class="local-version">
                <h3>Your Version</h3>
                <div class="content">{{ conflict_version.content|markdown }}</div>
                <div class="meta">
                    Local changes from: {{ conflict_version.created_at|format_datetime }}
                </div>
            </div>
        </div>
        
        <!-- Merge Mode -->
        <div x-show="mode === 'merge'" class="conflict-merge">
            <textarea x-model="mergedContent" class="merge-editor"></textarea>
        </div>
        
        <!-- Use Server Version -->
        <div x-show="mode === 'use-server'" class="conflict-server">
            <div class="content">{{ entry.content|markdown }}</div>
        </div>
        
        <!-- Use Local Version -->
        <div x-show="mode === 'use-local'" class="conflict-local">
            <div class="content">{{ conflict_version.content|markdown }}</div>
        </div>
    </div>
    
    <div class="conflict-footer">
        <form action="{{ url_for('entries.resolve_conflict', entry_id=entry.id) }}" method="POST">
            <input type="hidden" name="csrf_token" value="{{ csrf_token() }}">
            <input type="hidden" name="content" x-bind:value="mergedContent">
            <button type="submit" class="btn btn-primary">Save Resolution</button>
            <a href="{{ url_for('entries.view', entry_id=entry.id) }}" class="btn btn-secondary">
                Cancel
            </a>
        </form>
    </div>
</div>
{% endblock %}
```

Implement optimistic UI updates with HTMX:

```html
<!-- app/templates/entries/list.html -->
<div class="entries-container">
    <div class="entries-list">
        {% for entry in entries %}
        <div class="entry-card" id="entry-{{ entry.id }}">
            <div class="entry-header">
                <h2 class="entry-title">
                    <a href="{{ url_for('entries.view', entry_id=entry.id) }}">{{ entry.title }}</a>
                </h2>
                <div class="entry-meta">
                    <span class="entry-date">{{ entry.created_at|format_datetime }}</span>
                    <span class="entry-reading-time">{{ entry.reading_time }} min read</span>
                </div>
            </div>
            
            <div class="entry-preview">
                {{ entry.content|markdown|truncate(150) }}
            </div>
            
            {% if entry.tags %}
            <div class="entry-tags">
                {% for tag in entry.tags %}
                <a href="{{ url_for('entries.by_tag', tag_name=tag.name) }}" class="tag">
                    {{ tag.name }}
                </a>
                {% endfor %}
            </div>
            {% endif %}
            
            <div class="entry-actions">
                <a href="{{ url_for('entries.edit', entry_id=entry.id) }}" class="btn btn-sm">
                    Edit
                </a>
                <button hx-delete="{{ url_for('api.entries.delete', entry_id=entry.id) }}"
                        hx-target="#entry-{{ entry.id }}"
                        hx-swap="outerHTML"
                        hx-confirm="Are you sure you want to delete this entry?"
                        class="btn btn-sm btn-danger">
                    Delete
                </button>
            </div>
        </div>
        {% endfor %}
    </div>
    
    <div class="pagination" hx-boost="true">
        {% if pagination.has_prev %}
        <a href="{{ url_for('entries.list', page=pagination.prev_num) }}"
           hx-get="{{ url_for('entries.list', page=pagination.prev_num, partial=1) }}"
           hx-target=".entries-container"
           hx-swap="innerHTML"
           hx-push-url="true">
            Previous
        </a>
        {% endif %}
        
        <span class="current-page">
            Page {{ pagination.page }} of {{ pagination.pages }}
        </span>
        
        {% if pagination.has_next %}
        <a href="{{ url_for('entries.list', page=pagination.next_num) }}"
           hx-get="{{ url_for('entries.list', page=pagination.next_num, partial=1) }}"
           hx-target=".entries-container"
           hx-swap="innerHTML"
           hx-push-url="true">
            Next
        </a>
        {% endif %}
    </div>
</div>
```

## System Administration

### Deployment Process

Create a robust deployment script:

```bash
#!/bin/bash
# deploy.sh - Improved deployment script

# Set strict error handling
set -e  # Exit immediately if a command exits with a non-zero status
set -u  # Treat unset variables as an error
set -o pipefail  # Prevent errors in a pipeline from being masked

# Configuration
APP_DIR="/path/to/journal"
VENV_DIR="$APP_DIR/venv"
BACKUP_DIR="$APP_DIR/backups"
LOG_DIR="$APP_DIR/logs"
DEPLOYMENT_LOG="$LOG_DIR/deployments.log"
SERVICE_NAME="journal"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    local level=$1
    local message=$2
    echo "$(date +"%Y-%m-%d %H:%M:%S") [$level] $message" | tee -a "$DEPLOYMENT_LOG"
}

# Function to handle errors
handle_error() {
    local error_code=$?
    local line_number=$1
    log "ERROR" "Failed at line $line_number with error code $error_code"
    exit $error_code
}

# Set up error trap
trap 'handle_error $LINENO' ERR

# Begin deployment
log "INFO" "Starting deployment (ID: $TIMESTAMP)"

# Step 1: Create backup before deployment
log "INFO" "Creating pre-deployment backup"
mkdir -p "$BACKUP_DIR"

# Backup database
DB_BACKUP="$BACKUP_DIR/db_pre_deploy_$TIMESTAMP.sqlite"
if [ -f "$APP_DIR/instance/journal.db" ]; then
    sqlite3 "$APP_DIR/instance/journal.db" ".backup '$DB_BACKUP'"
    log "INFO" "Database backed up to $DB_BACKUP"
else
    log "WARN" "Database file not found, skipping backup"
fi

# Backup configuration
CONFIG_BACKUP="$BACKUP_DIR/config_pre_deploy_$TIMESTAMP.py"
if [ -f "$APP_DIR/instance/config.py" ]; then
    cp "$APP_DIR/instance/config.py" "$CONFIG_BACKUP"
    log "INFO" "Configuration backed up to $CONFIG_BACKUP"
else
    log "WARN" "Configuration file not found, skipping backup"
fi

# Step 2: Update code from repository
log "INFO" "Pulling latest code from repository"
cd "$APP_DIR"

# Pull updates
git pull origin main || { 
    log "ERROR" "Failed to pull updates from repository" 
    exit 1
}

# Step 3: Update dependencies
log "INFO" "Updating dependencies"
source "$VENV_DIR/bin/activate" || { 
    log "ERROR" "Failed to activate virtual environment" 
    exit 1
}

pip install --upgrade pip
pip install -r requirements.txt || {
    log "ERROR" "Failed to install dependencies"
    exit 1
}

# Step 4: Database migrations
log "INFO" "Running database migrations"
export FLASK_APP=wsgi.py
flask db upgrade || {
    log "ERROR" "Database migration failed"
    log "INFO" "Attempting to restore database from backup"
    
    if [ -f "$DB_BACKUP" ]; then
        cp "$APP_DIR/instance/journal.db" "$APP_DIR/instance/journal.db.failed"
        sqlite3 "$APP_DIR/instance/journal.db" ".restore '$DB_BACKUP'"
        log "INFO" "Database restored from backup"
    else
        log "ERROR" "No database backup found for restoration"
    fi
    
    exit 1
}

# Step 5: Restart service
log "INFO" "Restarting service"
sudo systemctl restart "$SERVICE_NAME" || {
    log "ERROR" "Failed to restart service"
    exit 1
}

# Step 6: Verify service is running
log "INFO" "Verifying service status"
sleep 5  # Wait a moment for the service to start
if ! sudo systemctl is-active --quiet "$SERVICE_NAME"; then
    log "ERROR" "Service failed to start"
    exit 1
fi

# Clean up old backups
log "INFO" "Cleaning up old backups"
find "$BACKUP_DIR" -name "db_pre_deploy_*.sqlite" -type f -mtime +30 -delete

# Deployment successful
log "INFO" "Deployment completed successfully"
exit 0
```

### Systemd Service Configuration

Create a systemd service file:

```ini
# /etc/systemd/system/journal.service
[Unit]
Description=Personal Journal Flask Application
After=network.target
Wants=network-online.target

[Service]
Type=simple
User=your_username
Group=your_username
WorkingDirectory=/path/to/journal
Environment="FLASK_APP=wsgi.py"
Environment="FLASK_ENV=production"
Environment="PYTHONUNBUFFERED=1"

# Load environment variables from file
EnvironmentFile=/path/to/journal/instance/.env

# Resource constraints
MemoryLimit=512M
CPUQuota=50%
TasksMax=100
LimitNOFILE=4096

# Restart settings
Restart=on-failure
RestartSec=5s
StartLimitInterval=60s
StartLimitBurst=3

# Security settings
ProtectSystem=full
ProtectHome=true
PrivateTmp=true
NoNewPrivileges=true
ReadWritePaths=/path/to/journal/instance /path/to/journal/logs
ReadOnlyPaths=/path/to/journal/app /path/to/journal/static

# Startup command
ExecStart=/path/to/journal/venv/bin/gunicorn --workers 2 --bind 127.0.0.1:8000 wsgi:app

# Standard output settings
StandardOutput=journal
StandardError=journal
SyslogIdentifier=journal

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable journal
sudo systemctl start journal
```

### Logging Setup

Configure structured logging to stdout for systemd:

```python
# app/utils/logging.py (updated for systemd/journald integration)
import logging
import json
import sys
from datetime import datetime
from flask import request, has_request_context, g

class JournaldFormatter(logging.Formatter):
    """Formatter for systemd's journald."""
    # Map Python log levels to syslog priority levels
    PRIORITY_MAP = {
        logging.DEBUG: 7,      # Debug
        logging.INFO: 6,       # Informational
        logging.WARNING: 4,    # Warning
        logging.ERROR: 3,      # Error
        logging.CRITICAL: 2    # Critical
    }
    
    def format(self, record):
        log_record = {
            'MESSAGE': super().format(record),
            'PRIORITY': self.PRIORITY_MAP.get(record.levelno, 6),
            'SYSLOG_IDENTIFIER': 'journal',
            'CODE_FILE': record.pathname,
            'CODE_LINE': record.lineno,
            'CODE_FUNC': record.funcName
        }
        
        # Add request context if available
        if has_request_context():
            log_record.update({
                'REQUEST_ID': getattr(g, 'request_id', None),
                'REQUEST_METHOD': request.method,
                'REQUEST_PATH': request.path,
                'REMOTE_ADDR': request.remote_addr
            })
        
        # Add user context if available
        if has_request_context() and hasattr(g, 'user_id'):
            log_record['USER_ID'] = g.user_id
        
        # Add custom fields
        if hasattr(record, 'props'):
            for key, value in record.props.items():
                # Add JOURNAL_ prefix for custom fields
                log_record[f'JOURNAL_{key.upper()}'] = str(value)
        
        return json.dumps(log_record)

def configure_journald_logging(app):
    """Configure logging for systemd's journald."""
    # Set log level from config
    log_level = getattr(logging, app.config.get('LOG_LEVEL', 'INFO'))
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Create and configure stderr handler for systemd
    handler = logging.StreamHandler(sys.stderr)
    handler.setFormatter(JournaldFormatter())
    root_logger.addHandler(handler)
    
    # Configure Flask app logger
    app.logger.setLevel(log_level)
    
    # Log application startup
    app.logger.info("Application started", extra={
        'props': {
            'environment': app.config.get('ENV'),
            'debug': app.debug
        }
    })
```

View logs with journalctl:

```bash
# View all logs for the service
journalctl -u journal

# View recent logs
journalctl -u journal -n 50

# Follow logs in real-time
journalctl -u journal -f

# View logs at error level or higher
journalctl -u journal -p err
```

### Backup Strategy

Create a secure backup script:

```bash
#!/bin/bash
# backup.sh - Secure backup script

# Configuration
APP_DIR="/path/to/journal"
BACKUP_DIR="$APP_DIR/backups"
LOG_DIR="$APP_DIR/logs"
BACKUP_LOG="$LOG_DIR/backups.log"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
GIT_REPO="$APP_DIR"

# Create directories if they don't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    local level=$1
    local message=$2
    echo "$(date +"%Y-%m-%d %H:%M:%S") [$level] $message" | tee -a "$BACKUP_LOG"
}

log "INFO" "Starting backup"

# Backup database
DB_PATH="$APP_DIR/instance/journal.db"
if [ -f "$DB_PATH" ]; then
    # Create a temporary directory
    TEMP_DIR=$(mktemp -d)
    log "INFO" "Created temporary directory: $TEMP_DIR"
    
    # Copy database to temp dir
    sqlite3 "$DB_PATH" ".backup '$TEMP_DIR/journal.db'"
    log "INFO" "Database backed up"
    
    # Backup configuration files
    CONFIG_DIR="$APP_DIR/instance"
    if [ -d "$CONFIG_DIR" ]; then
        cp -r "$CONFIG_DIR" "$TEMP_DIR/instance"
        log "INFO" "Configuration backed up"
    else
        log "WARN" "Configuration directory not found at $CONFIG_DIR"
    fi
    
    # Create archive
    tar -czf "$BACKUP_FILE" -C "$TEMP_DIR" .
    log "INFO" "Created archive: $BACKUP_FILE"
    
    # Set secure permissions on backup file
    chmod 600 "$BACKUP_FILE"
    
    # Clean up temporary directory
    rm -rf "$TEMP_DIR"
    
    # Commit to Git for additional backup
    cd "$GIT_REPO"
    git add "$DB_PATH"
    git commit -m "Backup: $TIMESTAMP" || log "WARN" "No changes to commit to Git"
    git push origin main || log "WARN" "Failed to push to Git"
    
    # Clean up old backups - keep only last 30 days
    find "$BACKUP_DIR" -name "backup_*.tar.gz" -type f -mtime +30 -delete
    
    log "INFO" "Backup completed successfully"
else
    log "ERROR" "Database file not found at $DB_PATH"
    exit 1
fi
```

Set up a cron job for regular backups:

```
# Run backup daily at 2 AM
0 2 * * * /path/to/journal/scripts/backup.sh
```

## Security Considerations

### Authentication Security

Enhance security with password hashing using Argon2:

```python
# app/models/user.py (password methods)
def set_password(self, password):
    """Set hashed password using Argon2."""
    self.password_hash = generate_password_hash(password, method='argon2')
    
def check_password(self, password):
    """Check if provided password matches the hash."""
    return check_password_hash(self.password_hash, password)
```

Configure secure cookie settings:

```python
# config.py
class ProductionConfig(Config):
    # ... other settings ...
    
    # Secure cookie settings
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SAMESITE = 'Lax'
```

Implement rate limiting for login attempts:

```python
# app/routes/auth.py (login route with rate limiting)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@auth_bp.route('/login', methods=['GET', 'POST'])
@limiter.limit("10 per minute")
def login():
    # ... login code ...
```

### Data Protection

Sanitize HTML content to prevent XSS:

```python
# app/services/markdown_service.py (sanitize method)
def sanitize_html(self, html):
    """
    Sanitize HTML content to prevent XSS.
    
    Args:
        html: HTML content to sanitize
        
    Returns:
        Sanitized HTML
    """
    cleaner = Cleaner(
        tags=self.allowed_tags,
        attributes=self.allowed_attrs,
        styles=self.allowed_styles,
        protocols=self.allowed_protocols,
        strip=True
    )
    
    return cleaner.clean(html)
```

Set proper Content Security Policy:

```python
# app/__init__.py (CSP setup)
from flask_talisman import Talisman

talisman = Talisman()

def create_app(config_name='default'):
    # ... other setup ...
    
    # Configure CSP
    csp = {
        'default-src': "'self'",
        'script-src': [
            "'self'",
            'https://cdn.jsdelivr.net',  # For MathJax
            "'unsafe-inline'"  # For Alpine.js
        ],
        'style-src': [
            "'self'",
            "'unsafe-inline'"
        ],
        'img-src': [
            "'self'",
            'data:'
        ],
        'font-src': [
            "'self'"
        ]
    }
    
    # Initialize Talisman for security headers
    talisman.init_app(app, content_security_policy=csp)
    
    # ... rest of the function ...
```

### Input Validation

Implement robust form validation:

```python
# app/forms/entry_forms.py
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, BooleanField, SubmitField, Field
from wtforms.validators import DataRequired, Length, Optional, ValidationError
from wtforms.widgets import TextInput

class EntryForm(FlaskForm):
    """Form for creating and editing entries."""
    title = StringField('Title', validators=[
        DataRequired(message="Title is required."),
        Length(max=200, message="Title must be 200 characters or less.")
    ])
    
    content = TextAreaField('Content', validators=[
        DataRequired(message="Content is required.")
    ])
    
    tags = TagListField('Tags (comma separated)', validators=[
        Optional()
    ])
    
    is_public = BooleanField('Make Public')
    
    submit = SubmitField('Save Entry')
    
    def validate_tags(self, field):
        """Validate tags field."""
        if len(field.data) > 10:
            raise ValidationError('You can have at most 10 tags per entry.')
        
        for tag in field.data:
            if len(tag) > 50:
                raise ValidationError('Each tag must be 50 characters or less.')
```

### File Permission Handling

Set secure file permissions:

```bash
#!/bin/bash
# secure_permissions.sh - Set secure file permissions

# Configuration
APP_DIR="/path/to/journal"
CONFIG_DIR="$APP_DIR/instance"
LOG_DIR="$APP_DIR/logs"
USER=$(whoami)
GROUP=$(id -gn)
SERVICE_USER="www-data"  # Web server user

# Set ownership
sudo chown -R $USER:$GROUP "$APP_DIR"
echo "Set ownership of $APP_DIR to $USER:$GROUP"

# Set permissions on sensitive directories
sudo chmod 750 "$CONFIG_DIR"
echo "Set permissions on $CONFIG_DIR to 750 (drwxr-x---)"

# Set permissions on sensitive files
if [ -f "$CONFIG_DIR/config.py" ]; then
    sudo chmod 640 "$CONFIG_DIR/config.py"
    echo "Set permissions on config.py to 640 (-rw-r-----)"
fi

if [ -f "$CONFIG_DIR/.env" ]; then
    sudo chmod 640 "$CONFIG_DIR/.env"
    echo "Set permissions on .env to 640 (-rw-r-----)"
fi

# Set permissions on database file
if [ -f "$CONFIG_DIR/journal.db" ]; then
    sudo chmod 640 "$CONFIG_DIR/journal.db"
    echo "Set permissions on journal.db to 640 (-rw-r-----)"
fi

# Set permissions on log directory
sudo chown -R $USER:$SERVICE_USER "$LOG_DIR"
sudo chmod -R 770 "$LOG_DIR"
echo "Set permissions on $LOG_DIR to 770 (drwxrwx---)"

echo "Secure permissions have been set."
```

## Performance Optimizations

### Caching Strategy

Implement caching for expensive operations:

```python
# app/services/entry_service.py (with caching)
from app.services.cache_service import CacheService

class EntryService:
    def __init__(self):
        """Initialize the service."""
        self.cache = CacheService()
    
    def get_entry(self, entry_id, user_id):
        """Get a specific entry with caching."""
        # Check cache first
        cache_key = f"entry:{entry_id}:{user_id}"
        cached_entry = self.cache.get(cache_key)
        
        if cached_entry:
            return OperationResult.success_result(data=cached_entry)
        
        # Not in cache, get from database
        try:
            # ... existing database query ...
            
            # Cache the result
            self.cache.set(cache_key, entry_data, timeout=600)  # 10 minutes
            
            return OperationResult.success_result(data=entry_data)
        except Exception as e:
            return OperationResult.from_exception(e)
    
    def update_entry(self, entry_id, user_id, entry_data):
        """Update an entry and invalidate cache."""
        # ... existing update code ...
        
        # Invalidate cache
        self.cache.delete(f"entry:{entry_id}:{user_id}")
        self.cache.clear_pattern(f"entries:{user_id}")
        
        return OperationResult.success_result(
            message="Entry updated successfully",
            data={"entry_id": entry.id}
        )
```

### Database Optimization

Add indexes for common queries:

```python
# app/models/content.py (Entry model with indexes)
class Entry(db.Model):
    # ... existing columns ...
    
    # Define indexes
    __table_args__ = (
        db.Index('idx_entry_user_created', user_id, created_at.desc()),
        db.Index('idx_entry_title', title),
        db.Index('idx_entry_public', is_public)
    )
```

Use eager loading for relationships:

```python
# app/services/entry_service.py (with eager loading)
def get_entries(self, user_id, page=1, per_page=10, sort_by='created_at', 
               sort_order='desc', tag=None):
    """Get entries with eager loading for tags."""
    try:
        # Start query with eager loading for tags
        query = Entry.query.options(
            joinedload(Entry.tags)
        ).filter_by(user_id=user_id)
        
        # ... rest of the method ...
```

### Frontend Optimization

Bundle and minify static assets:

```python
# app/__init__.py (asset bundling)
from flask_assets import Environment, Bundle

assets = Environment()

def create_app(config_name='default'):
    # ... other setup ...
    
    # Initialize Flask-Assets
    assets.init_app(app)
    
    # Define asset bundles
    css = Bundle(
        'css/normalize.css',
        'css/main.css',
        filters='cssmin',
        output='gen/packed.css'
    )
    
    js = Bundle(
        'js/app.js',
        'js/editor.js',
        'js/theme.js',
        filters='jsmin',
        output='gen/packed.js'
    )
    
    # Register bundles
    assets.register('css_all', css)
    assets.register('js_all', js)
    
    # ... rest of the function ...
```

Enable compression for responses:

```python
# app/__init__.py (compression)
from flask_compress import Compress

compress = Compress()

def create_app(config_name='default'):
    # ... other setup ...
    
    # Initialize Flask-Compress
    compress.init_app(app)
    
    # ... rest of the function ...
```

## Testing Strategy

### Unit Testing

Create pytest configuration:

```python
# tests/conftest.py
import pytest
from app import create_app
from app.models import db as _db

@pytest.fixture(scope='session')
def app():
    """Create a Flask app for testing."""
    app = create_app('testing')
    
    # Create application context
    with app.app_context():
        yield app

@pytest.fixture(scope='session')
def db(app):
    """Set up the database and clean up after tests."""
    _db.create_all()
    yield _db
    _db.drop_all()

@pytest.fixture(scope='function')
def session(db):
    """Create a new database session for each test."""
    connection = db.engine.connect()
    transaction = connection.begin()
    
    session = db.create_scoped_session(
        options={"bind": connection, "binds": {}}
    )
    
    db.session = session
    
    yield session
    
    transaction.rollback()
    connection.close()
    session.remove()

@pytest.fixture(scope='function')
def client(app):
    """Create a test client."""
    return app.test_client()

@pytest.fixture(scope='function')
def authenticated_client(app, session):
    """Create an authenticated test client."""
    # Create a test user
    from app.models.user import User
    user = User(username="testuser", email="test@example.com")
    user.set_password("password123")
    session.add(user)
    session.commit()
    
    # Create a client and log in
    client = app.test_client()
    client.post('/auth/login', data={
        'username': 'testuser',
        'password': 'password123'
    }, follow_redirects=True)
    
    return client
```

Write tests for models:

```python
# tests/unit/test_models/test_entry.py
import pytest
from datetime import datetime
from app.models.content import Entry, Tag

class TestEntryModel:
    def test_creation(self, session):
        """Test entry creation."""
        entry = Entry(
            title="Test Entry",
            content="This is a test entry.",
            user_id=1
        )
        session.add(entry)
        session.commit()
        
        saved_entry = Entry.query.filter_by(title="Test Entry").first()
        assert saved_entry is not None
        assert saved_entry.content == "This is a test entry."
        assert saved_entry.user_id == 1
    
    def test_reading_time(self, session):
        """Test reading time calculation."""
        # Create an entry with 200 words (1 minute reading time)
        content = " ".join(["word"] * 200)
        entry = Entry(
            title="Reading Time Test",
            content=content,
            user_id=1
        )
        session.add(entry)
        session.commit()
        
        assert entry.reading_time == 1
        
        # Update with 500 words (2.5 minutes, should round up to 3)
        entry.content = " ".join(["word"] * 500)
        session.commit()
        
        assert entry.reading_time == 3
    
    def test_tags_relationship(self, session):
        """Test relationship between entries and tags."""
        # Create entry and tags
        entry = Entry(
            title="Tagging Test",
            content="Testing tag relationships",
            user_id=1
        )
        
        tag1 = Tag(name="test")
        tag2 = Tag(name="example")
        
        # Add tags to entry
        entry.tags.append(tag1)
        entry.tags.append(tag2)
        
        session.add_all([entry, tag1, tag2])
        session.commit()
        
        # Verify relationships
        saved_entry = Entry.query.filter_by(title="Tagging Test").first()
        assert len(saved_entry.tags) == 2
        
        tag_names = [tag.name for tag in saved_entry.tags]
        assert "test" in tag_names
        assert "example" in tag_names
```

Write tests for services:

```python
# tests/unit/test_services/test_entry_service.py
import pytest
from app.services.entry_service import EntryService
from app.models.content import Entry, Tag

class TestEntryService:
    @pytest.fixture
    def entry_service(self):
        """Create an instance of EntryService for testing."""
        return EntryService()
    
    def test_create_entry(self, entry_service, session):
        """Test entry creation service."""
        # Prepare test data
        entry_data = {
            'title': 'Service Test Entry',
            'content': 'Testing the entry service.',
            'tags': ['service', 'test'],
            'is_public': True
        }
        
        # Call service method
        result = entry_service.create_entry(user_id=1, entry_data=entry_data)
        
        # Check result
        assert result.success is True
        assert 'entry_id' in result.data
        
        # Verify entry was created correctly
        entry = Entry.query.get(result.data['entry_id'])
        assert entry is not None
        assert entry.title == 'Service Test Entry'
        assert entry.content == 'Testing the entry service.'
        assert entry.user_id == 1
        assert entry.is_public is True
        
        # Verify tags were created
        assert len(entry.tags) == 2
        tag_names = [tag.name for tag in entry.tags]
        assert 'service' in tag_names
        assert 'test' in tag_names
    
    def test_get_entry(self, entry_service, session):
        """Test getting an entry by ID."""
        # Create test entry
        entry = Entry(
            title="Entry to Get",
            content="This is the entry content.",
            user_id=1
        )
        session.add(entry)
        session.commit()
        
        # Call service method
        result = entry_service.get_entry(entry_id=entry.id, user_id=1)
        
        # Check result
        assert result.success is True
        assert result.data['id'] == entry.id
        assert result.data['title'] == "Entry to Get"
        assert result.data['content'] == "This is the entry content."
        assert result.data['user_id'] == 1
    
    def test_update_entry(self, entry_service, session):
        """Test updating an entry."""
        # Create test entry
        entry = Entry(
            title="Entry to Update",
            content="Original content.",
            user_id=1
        )
        session.add(entry)
        session.commit()
        
        # Prepare update data
        update_data = {
            'title': 'Updated Title',
            'content': 'Updated content.'
        }
        
        # Call service method
        result = entry_service.update_entry(
            entry_id=entry.id,
            user_id=1,
            entry_data=update_data
        )
        
        # Check result
        assert result.success is True
        
        # Verify entry was updated
        updated_entry = Entry.query.get(entry.id)
        assert updated_entry.title == 'Updated Title'
        assert updated_entry.content == 'Updated content.'
```

### Integration Testing

Test route handlers:

```python
# tests/integration/test_routes/test_entry_routes.py
import pytest
from flask import url_for

class TestEntryRoutes:
    def test_entry_list(self, authenticated_client):
        """Test the entry list page."""
        response = authenticated_client.get('/entries/')
        
        assert response.status_code == 200
        assert b'Entries' in response.data
    
    def test_create_entry(self, authenticated_client):
        """Test creating a new entry."""
        response = authenticated_client.post('/entries/create', data={
            'title': 'Integration Test Entry',
            'content': 'This entry was created in an integration test.',
            'tags': 'integration,test',
            'is_public': True
        }, follow_redirects=True)
        
        assert response.status_code == 200
        assert b'Integration Test Entry' in response.data
        assert b'This entry was created in an integration test.' in response.data
    
    def test_view_entry(self, authenticated_client, session):
        """Test viewing an entry."""
        # Create a test entry
        from app.models.content import Entry
        entry = Entry(
            title="Entry to View",
            content="This is the content to view.",
            user_id=1
        )
        session.add(entry)
        session.commit()
        
        # Request the entry page
        response = authenticated_client.get(f'/entries/{entry.id}')
        
        assert response.status_code == 200
        assert b'Entry to View' in response.data
        assert b'This is the content to view.' in response.data
```

Test API endpoints:

```python
# tests/integration/test_api/test_entry_api.py
import pytest
import json
from flask import url_for

class TestEntryAPI:
    def test_get_entries(self, authenticated_client):
        """Test getting entries via API."""
        response = authenticated_client.get('/api/v1/entries')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'success' in data
        assert data['success'] is True
        assert 'data' in data
    
    def test_create_entry_api(self, authenticated_client):
        """Test creating an entry via API."""
        entry_data = {
            'title': 'API Test Entry',
            'content': 'This entry was created via the API.',
            'tags': ['api', 'test'],
            'is_public': False
        }
        
        response = authenticated_client.post(
            '/api/v1/entries',
            data=json.dumps(entry_data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'data' in data
        assert 'entry_id' in data['data']
```

### UI Testing

Test template rendering:

```python
# tests/ui/test_templates.py
import pytest
from flask import render_template_string, render_template, current_app

class TestTemplates:
    def test_entry_card(self, app):
        """Test rendering the entry card template."""
        with app.test_request_context():
            # Create a mock entry
            entry = {
                'id': 1,
                'title': 'Test Entry',
                'content': 'Test content',
                'created_at': '2023-01-01T12:00:00',
                'tags': [{'id': 1, 'name': 'test'}, {'id': 2, 'name': 'template'}]
            }
            
            # Render the template
            rendered = render_template(
                'components/entry_card.html',
                entry=entry
            )
            
            # Check the content
            assert 'Test Entry' in rendered
            assert 'Test content' in rendered
            assert 'test' in rendered
            assert 'template' in rendered
    
    def test_markdown_rendering(self, app):
        """Test Markdown rendering in templates."""
        with app.test_request_context():
            # Define a template with markdown filter
            template = """
            {{ content|markdown }}
            """
            
            # Define Markdown content
            content = """
            # Heading
            
            This is **bold** and *italic* text.
            
            ```python
            def hello():
                print("Hello, world!")
            ```
            """
            
            # Render the template
            rendered = render_template_string(
                template,
                content=content
            )
            
            # Check the rendered HTML
            assert '<h1>Heading</h1>' in rendered
            assert '<strong>bold</strong>' in rendered
            assert '<em>italic</em>' in rendered
            assert '<code' in rendered
```

This completes the comprehensive guide for your Flask blog/journal system. The architecture follows a "lean and mean" philosophy while providing all the necessary components for a robust, secure, and maintainable application.

The system includes:
- A solid application structure with clear separation of concerns
- Comprehensive data models with proper relationships
- Secure authentication and authorization
- Efficient data flow with proper error handling
- A responsive UI using HTMX and Alpine.js
- LaTeX rendering with MathJax
- Robust state management for both client and server
- Deployment and administration tools
- Security best practices
- Performance optimizations
- A comprehensive testing strategy

This guide serves as both a blueprint and a reference for building your personal journal application.
        session.add(entry)
        session.commit()
        
        saved_entry = Entry.query.filter_by(title="Test Entry").first()
        assert saved_entry is not None
        assert saved_entry.content == "This is a test entry."
        assert saved_entry.user_id == 1
    
    def test_reading_time(self, session):
        """Test reading time calculation."""
        # Create an entry with 200 words (1 minute reading time)
        content = " ".join(["word"] * 200)
        entry = Entry(
            title="Reading Time Test",
            content=content,
            user_id=1
        )
        session.add(entry)
        session.commit()
        
        assert entry.reading_time == 1
        
        # Update with 500 words (2.5 minutes, should round up to 3)
        entry.content = " ".join(["word"] * 500)
        session.commit()
        
        assert entry.reading_time == 3
    
    def test_tags_relationship(self, session):
        """Test relationship between entries and tags."""
        # Create entry and tags
        entry = Entry(
            title="Tagging Test",
            content="Testing tag relationships",
            user_id=1
        )
        
        tag1 = Tag(name="test")
        tag2 = Tag(name="example")
        
        # Add tags to entry
        entry.tags.append(tag1)
        entry.tags.append(tag2)
        
        session.add_all([entry, tag1, tag2])
        session.commit()
        
        # Verify relationships
        saved_entry = Entry.query.filter_by(title="Tagging Test").first()
        assert len(saved_entry.tags) == 2
        
        tag_names = [tag.name for tag in saved_entry.tags]
        assert "test" in tag_names
        assert "example" in tag_names
```

Write tests for services:

```python
# tests/unit/test_services/test_entry_service.py
import pytest
from app.services.entry_service import EntryService
from app.models.content import Entry, Tag

class TestEntryService:
    @pytest.fixture
    def entry_service(self):
        """Create an instance of EntryService for testing."""
        return EntryService()
    
    def test_create_entry(self, entry_service, session):
        """Test entry creation service."""
        # Prepare test data
        entry_data = {
            'title': 'Service Test Entry',
            'content': 'Testing the entry service.',
            'tags': ['service', 'test'],
            'is_public': True
        }
        
        # Call service method
        result = entry_service.create_entry(user_id=1, entry_data=entry_data)
        
        # Check result
        assert result.success is True
        assert 'entry_id' in result.data
        
        # Verify entry was created correctly
        entry = Entry.query.get(result.data['entry_id'])
        assert entry is not None
        assert entry.title == 'Service Test Entry'
        assert entry.content == 'Testing the entry service.'
        assert entry.user_id == 1
        assert entry.is_public is True
        
        # Verify tags were created
        assert len(entry.tags) == 2
        tag_names = [tag.name for tag in entry.tags]
        assert 'service' in tag_names
        assert 'test' in tag_names
    
    def test_get_entry(self, entry_service, session):
        """Test getting an entry by ID."""
        # Create test entry
        entry = Entry(
            title="Entry to Get",
            content="This is the entry content.",
            user_id=1
        )
        session.add(entry)
        session.commit()
        
        # Call service method
        result = entry_service.get_entry(entry_id=entry.id, user_id=1)
        
        # Check result
        assert result.success is True
        assert result.data['id'] == entry.id
        assert result.data['title'] == "Entry to Get"
        assert result.data['content'] == "This is the entry content."
        assert result.data['user_id'] == 1
    
    def test_update_entry(self, entry_service, session):
        """Test updating an entry."""
        # Create test entry
        entry = Entry(
            title="Entry to Update",
            content="Original content.",
            user_id=1
        )
        session.add(entry)
        session.commit()
        
        # Prepare update data
        update_data = {
            'title': 'Updated Title',
            'content': 'Updated content.'
        }
        
        # Call service method
        result = entry_service.update_entry(
            entry_id=entry.id,
            user_id=1,
            entry_data=update_data
        )
        
        # Check result
        assert result.success is True
        
        # Verify entry was updated
        updated_entry = Entry.query.get(entry.id)
        assert updated_entry.title == 'Updated Title'
        assert updated_entry.content == 'Updated content.'
```

### Integration Testing

Test route handlers:

```python
# tests/integration/test_routes/test_entry_routes.py
import pytest
from flask import url_for

class TestEntryRoutes:
    def test_entry_list(self, authenticated_client):
        """Test the entry list page."""
        response = authenticated_client.get('/entries/')
        
        assert response.status_code == 200
        assert b'Entries' in response.data
    
    def test_create_entry(self, authenticated_client):
        """Test creating a new entry."""
        response = authenticated_client.post('/entries/create', data={
            'title': 'Integration Test Entry',
            'content': 'This entry was created in an integration test.',
            'tags': 'integration,test',
            'is_public': True
        }, follow_redirects=True)
        
        assert response.status_code == 200
        assert b'Integration Test Entry' in response.data
        assert b'This entry was created in an integration test.' in response.data
    
    def test_view_entry(self, authenticated_client, session):
        """Test viewing an entry."""
        # Create a test entry
        from app.models.content import Entry
        entry = Entry(
            title="Entry to View",
            content="This is the content to view.",
            user_id=1
        )
        session.add(entry)
        session.commit()
        
        # Request the entry page
        response = authenticated_client.get(f'/entries/{entry.id}')
        
        assert response.status_code == 200
        assert b'Entry to View' in response.data
        assert b'This is the content to view.' in response.data
```

Test API endpoints:

```python
# tests/integration/test_api/test_entry_api.py
import pytest
import json
from flask import url_for

class TestEntryAPI:
    def test_get_entries(self, authenticated_client):
        """Test getting entries via API."""
        response = authenticated_client.get('/api/v1/entries')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'success' in data
        assert data['success'] is True
        assert 'data' in data
    
    def test_create_entry_api(self, authenticated_client):
        """Test creating an entry via API."""
        entry_data = {
            'title': 'API Test Entry',
            'content': 'This entry was created via the API.',
            'tags': ['api', 'test'],
            'is_public': False
        }
        
        response = authenticated_client.post(
            '/api/v1/entries',
            data=json.dumps(entry_data),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'data' in data
        assert 'entry_id' in data['data']
```

### UI Testing

Test template rendering:

```python
# tests/ui/test_templates.py
import pytest
from flask import render_template_string, render_template, current_app

class TestTemplates:
    def test_entry_card(self, app):
        """Test rendering the entry card template."""
        with app.test_request_context():
            # Create a mock entry
            entry = {
                'id': 1,
                'title': 'Test Entry',
                'content': 'Test content',
                'created_at': '2023-01-01T12:00:00',
                'tags': [{'id': 1, 'name': 'test'}, {'id': 2, 'name': 'template'}]
            }
            
            # Render the template
            rendered = render_template(
                'components/entry_card.html',
                entry=entry
            )
            
            # Check the content
            assert 'Test Entry' in rendered
            assert 'Test content' in rendered
            assert 'test' in rendered
            assert 'template' in rendered
    
    def test_markdown_rendering(self, app):
        """Test Markdown rendering in templates."""
        with app.test_request_context():
            # Define a template with markdown filter
            template = """
            {{ content|markdown }}
            """
            
            # Define Markdown content
            content = """
            # Heading
            
            This is **bold** and *italic* text.
            
            ```python
            def hello():
                print("Hello, world!")
            ```
            """
            
            # Render the template
            rendered = render_template_string(
                template,
                content=content
            )
            
            # Check the rendered HTML
            assert '<h1>Heading</h1>' in rendered
            assert '<strong>bold</strong>' in rendered
            assert '<em>italic</em>' in rendered
            assert '<code' in rendered
```

This completes the comprehensive guide for your Flask blog/journal system. The architecture follows a "lean and mean" philosophy while providing all the necessary components for a robust, secure, and maintainable application.

The system includes:
- A solid application structure with clear separation of concerns
- Comprehensive data models with proper relationships
- Secure authentication and authorization
- Efficient data flow with proper error handling
- A responsive UI using HTMX and Alpine.js
- LaTeX rendering with MathJax
- Robust state management for both client and server
- Deployment and administration tools
- Security best practices
- Performance optimizations
- A comprehensive testing strategy

This guide serves as both a blueprint and a reference for building your personal journal application.
