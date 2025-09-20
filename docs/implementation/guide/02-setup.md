---
id: implementation-guide-setup
title: "Implementation Guide \u2014 Environment & Setup"
type: guide
created: '2025-09-17'
updated: '2025-09-17'
author: documentation-system
tags: []
last_verified: '2025-09-17'
---

# Environment & Setup

This section centralizes environment setup and dependency management.

## Environment

- Python: 3.13 managed with `uv`
- JS/TS: Bun 1.2.x (Node v22 fallback)
- Shell: fish/zsh/bash supported

## Dependency Management

- Python: `uv sync --all-extras --dev` (see apps/api/)
- JS/TS: `bun install`, `bun run dev`, `bun test`

## Local Run

- API: `cd apps/api && make dev`
- Web: `bun run dev` (see apps/web)

## Useful References

- Development framework: `docs/development/DEVELOPMENT_FRAMEWORK.md`
- Running the app: `docs/development/RUNNING_THE_APP.md`
- CI/CD guide: `docs/ci-cd/CI_CD_GUIDE.md`
- Commands quick reference: `docs/guides/commands-quick-reference.md`

## Phase-derived Setup Summary

The following is a distilled, technology-agnostic summary derived from the consolidated guide’s early phases. Use it as a checklist.

1) Project Structure
- Create application package and subpackages (API, auth, models, web UI)
- Ensure package markers (`__init__.py`) exist where applicable
- Add top-level runner and configuration files

2) Application Bootstrap
- Use an application factory to configure extensions and blueprints/modules
- Load configuration via `.env` and a config module
- Initialize ORM, migrations, and auth/session management

3) Configuration
- Secret/key management sourced from environment
- Database URL and options (PostgreSQL)
- CSRF/session/cookie policies per environment

4) Database & Migrations
- Initialize migration tooling
- Create initial models (e.g., User) and run a baseline migration
- Apply schema upgrades

5) Authentication (if applicable)
- Provide login/registration flows
- Implement session handling (cookie/CSRF) or token flows per policy

6) Templates/Frontend (if applicable)
- Basic layout + message flashes
- Auth pages and a minimal index/home

7) Tests
- Unit tests for models and validation
- Integration tests for auth and key endpoints

Commands and details for each area are linked in the references above. Validate changes with `python3 scripts/validate_documentation.py --strict` and refresh navigation with `python3 scripts/generate_doc_index.py`.

## Application Factory

- Implement `create_app` in your app package (e.g., `journal/__init__.py`).
- Initialize extensions inside the factory (SQLAlchemy, Migrate, LoginManager).
- Register blueprints/modules after the app is created.

Checklist:
- App factory returns a configured Flask app
- Configuration loaded from `config.py` + environment
- Blueprints registered (auth/main/API) after definitions exist

Example (Python):

```python
# journal/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager

db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()


def create_app(config_object: str | None = None) -> Flask:
    app = Flask(__name__)
    if config_object:
        app.config.from_object(config_object)
    else:
        # Example: load defaults, then env overrides
        app.config.from_pyfile("config.py", silent=True)

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    # Late imports to avoid circulars
    from .auth import auth_bp
    from .main import main_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)

    @app.context_processor
    def inject_now():
        import datetime as _dt
        return {"now": _dt.datetime.utcnow()}

    # Example: custom filter
    @app.template_filter("markdown")
    def markdown_filter(text: str) -> str:
        # stub; use a real markdown renderer in app code
        return text

    return app
```

## Database Setup

- Initialize migration tooling: `flask db init`
- Create initial migration: `flask db migrate -m "baseline"`
- Apply migration: `flask db upgrade`

Notes:
- Ensure models are importable when running `migrate` (avoid circular imports)
- Use PostgreSQL URLs for production/dev; keep secrets in env

## Configuration Example

Use environment variables for secrets and service URLs. A minimal `config.py` could look like:

```python
# config.py (illustrative)
import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "change-me")
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql://user:password@localhost:5432/journal",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(Config):
    DEBUG = True


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "TEST_DB_URL",
        "postgresql://user:password@localhost:5433/journal_test",
    )


class ProductionConfig(Config):
    DEBUG = False
```

In the factory: `create_app("config.DevelopmentConfig")` (or use an env var to pick a config).

### .env (illustrative)

```env
# Core
FLASK_ENV=development
SECRET_KEY=change-me

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/journal
TEST_DB_URL=postgresql://user:password@localhost:5433/journal_test
```

Note: avoid committing real secrets. Use placeholders and env schemas.

## Authentication Basics

- Login/registration flows using Flask-Login + Flask-WTF
- Session cookies/CSRF per environment policy
- For token flows, add a separate bearer-based pipeline

Minimal `User` model (illustrative):

```python
# journal/models/user.py
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from . import db  # from app package


class User(UserMixin, db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    def set_password(self, raw: str) -> None:
        self.password_hash = generate_password_hash(raw)

    def check_password(self, raw: str) -> bool:
        return check_password_hash(self.password_hash, raw)
```

## Templates (If applicable)

- Base layout with flash messages and navigation
- Auth views: login/register pages
- Index/home placeholder for quick smoke testing

## Gotchas (from consolidated guide)

- Blueprint import order can break migrations: define and import blueprints before registering in `create_app`, but register them only after the app is created
- Template context processors should live in the app factory for global availability (e.g., `inject_now`)
- Register Jinja filters (e.g., `markdown`) inside `create_app`

## Example Commands

```bash
# API deps (Python)
cd apps/api
uv sync --all-extras --dev

# DB migrations
uv run flask db init
uv run flask db migrate -m "baseline"
uv run flask db upgrade

# Run dev API
make dev

# Web dev
cd ../../apps/web
bun install
bun run dev
```

## Minimal Auth Scaffolding (Illustrative)

Blueprint skeleton:

```python
# journal/auth/__init__.py
from flask import Blueprint

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

from . import routes  # noqa: E402  # late import
```

Forms and routes:

```python
# journal/auth/forms.py
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired, Email, EqualTo, Length


class LoginForm(FlaskForm):
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired()])
    remember = BooleanField("Remember me")
    submit = SubmitField("Sign in")


class RegistrationForm(FlaskForm):
    email = StringField("Email", validators=[DataRequired(), Email()])
    password = PasswordField("Password", validators=[DataRequired(), Length(min=8)])
    confirm = PasswordField("Confirm", validators=[DataRequired(), EqualTo("password")])
    submit = SubmitField("Create account")
```

```python
# journal/auth/routes.py
from flask import render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required
from . import auth_bp
from .forms import LoginForm, RegistrationForm


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        # Lookup user & verify password (pseudo-code)
        # user = User.query.filter_by(email=form.email.data).first()
        # if user and user.check_password(form.password.data):
        #     login_user(user, remember=form.remember.data)
        #     return redirect(url_for("main.index"))
        flash("Demo login handler — implement lookup & verify", "info")
        return redirect(url_for("main.index"))
    return render_template("auth/login.html", form=form)


@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("main.index"))
```

Templates (Jinja2):

```html
<!-- templates/base.html -->
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>{% block title %}App{% endblock %}</title></head>
  <body>
    {% with messages = get_flashed_messages(with_categories=true) %}
      {% if messages %}
        <ul class="flashes">
          {% for category, message in messages %}<li class="{{ category }}">{{ message }}</li>{% endfor %}
        </ul>
      {% endif %}
    {% endwith %}
    {% block content %}{% endblock %}
  </body>
  <!-- {{ now }} available via context processor -->
  <!-- example filter: {{ some_text|markdown }} -->
</html>
```
