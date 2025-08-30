import json
import logging
import os
import re  # Import the regex module
from datetime import UTC, datetime, timezone
from logging import StreamHandler

import markdown
from dotenv import load_dotenv
from flask import Flask, current_app, url_for
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect

# Observability (structured logging, error handlers)
from .observability import (
    _get_environment as _obs_get_environment,
    register_error_handlers,
    register_request_context,
    setup_logging,
)

# Removed Flask-Assets import as Rollup handles bundling now

"""
Flask Journal application package.

This is the main package for the Flask Journal application. It contains
the application factory and initializes all extensions, blueprints, and
global functionality like static asset management and logging.
"""


# Load environment variables from .env file
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
# Set the login view for Flask-Login (route name for the login page)
login_manager.login_view = 'auth.login'
# Set the message category for login_required messages
login_manager.login_message_category = 'info'
csrf = CSRFProtect()


def create_app(config_class_name='config.Config'):
    """Application factory function.

    Creates and configures a Flask application instance based on the
    provided configuration class.

    Args:
        config_class_name (str): Dotted path to configuration class.
            Defaults to 'config.Config'.

    Returns:
        Flask: A configured Flask application instance.
    """
    app = Flask(__name__)

    # Load configuration from config.py using the provided class name
    app.config.from_object(config_class_name)

    # Initialize Flask extensions with the app
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    csrf.init_app(app)

    # --- Logging & Observability ---
    env = _obs_get_environment(app)
    setup_logging(env)
    app.logger.info(f'Journal startup ({env})')
    register_request_context(app)
    register_error_handlers(app)
    # Optional: if enabled via env, initialize OTLP exporters for traces + logs
    try:
        from .observability import setup_otel

        setup_otel(app)
    except Exception:  # Best-effort; don't crash app on observability init
        app.logger.exception('Observability (OTEL) setup failed')

    # Optional HTTP request/response logging
    if os.getenv('LOG_HTTP', 'false').lower() in {'1', 'true', 'yes'}:
        try:
            from .observability import register_http_logging

            register_http_logging(app)
        except Exception:
            app.logger.exception('HTTP logging setup failed')
    # -------------------------------

    # Removed Flask-Assets initialization

    # Register blueprints
    # Authentication blueprint
    from .auth import auth as auth_blueprint

    app.register_blueprint(auth_blueprint, url_prefix='/auth')

    # Main application blueprint (for non-auth features)
    from .main import main as main_blueprint

    app.register_blueprint(main_blueprint)

    # API blueprint
    from .api import api_bp

    app.register_blueprint(api_bp, url_prefix='/api')

    # --- User Loader for Flask-Login ---
    # Moved here to avoid circular imports if defined within models/user.py
    # and models/user.py needs to import 'db' from here.
    from .models.user import User

    @login_manager.user_loader
    def load_user(user_id):
        # Return the user object from the user ID stored in the session
        return db.session.get(User, int(user_id))  # Use modern Session.get()

    # ------------------------------------

    # --- Global Context Processor ---
    @app.context_processor
    def inject_now():
        """Inject current UTC time into all templates.

        This context processor makes a 'now' function available in all templates
        that returns the current UTC datetime.

        Returns:
            dict: Dictionary containing the 'now' function.
        """
        return {
            'now': lambda: datetime.now(UTC)
        }  # Use recommended timezone-aware UTC time, wrapped in lambda for lazy evaluation

    # ---------------------------------

    # --- Markdown Filter ---
    @app.template_filter('markdown')
    def markdown_filter(s):
        """Convert markdown text to HTML.

        Args:
            s (str): Markdown-formatted string.

        Returns:
            str: HTML-formatted string.
        """
        return markdown.markdown(s)

    # -------------------------
    # -------------------------

    # --- Manifest Loader ---
    manifest = {}  # Cache for manifest data
    hashed_css_file = None  # Cache for the found CSS file path

    def load_manifest():
        """Load the Rollup manifest file and find hashed CSS.

        Reads the manifest.json file generated by Rollup to map original
        asset filenames to their hashed versions. Also finds the hashed
        CSS file by pattern matching in the gen directory.

        Side effects:
            Updates the 'manifest' and 'hashed_css_file' variables in
            the outer scope.

        Raises:
            FileNotFoundError: If manifest.json or gen directory doesn't exist.
            JSONDecodeError: If manifest.json cannot be parsed.
        """
        nonlocal manifest, hashed_css_file  # Declare both here
        manifest_path = os.path.join(app.static_folder, 'gen', 'manifest.json')
        css_dir = os.path.join(app.static_folder, 'gen')
        manifest = {}  # Reset on load
        hashed_css_file = None  # Reset on load

        # Load Manifest
        try:
            with open(manifest_path, encoding='utf-8') as f:
                manifest = json.load(f)
            current_app.logger.info(f'Loaded asset manifest from {manifest_path}')
        except FileNotFoundError:
            current_app.logger.exception(
                f"Asset manifest not found at {manifest_path}. Run 'npm run build'."
            )
        except json.JSONDecodeError:
            current_app.logger.exception(f'Error decoding asset manifest at {manifest_path}.')

        # Find Hashed CSS File
        # Define pattern string outside f-string to avoid SyntaxWarning
        css_pattern_str = r'^(main|styles)\.[a-zA-Z0-9]+\.css$'
        try:
            files = os.listdir(css_dir)
            # Find the file matching the pattern Rollup generates (e.g., main.[hash].css or styles.[hash].css)
            # Let's be flexible and find the first .css file with a hash-like structure
            # Use raw string for regex pattern to avoid SyntaxWarning
            css_pattern = re.compile(css_pattern_str)
            found_css = [f for f in files if css_pattern.match(f)]
            if found_css:
                hashed_css_file = os.path.join(
                    'gen', found_css[0]
                )  # Store relative path like 'gen/main.xyz.css'
                current_app.logger.info(f'Found hashed CSS file: {hashed_css_file}')
            else:
                current_app.logger.error(
                    f"Could not find hashed CSS file in {css_dir}. Looked for pattern '{css_pattern_str}'. Run 'npm run build'."
                )
        except FileNotFoundError:
            current_app.logger.exception(f'Static asset directory not found at {css_dir}.')
        except Exception:
            current_app.logger.exception('Error finding hashed CSS file')

    @app.context_processor
    def inject_manifest():
        """Inject asset URL resolver function into template context.

        Adds a get_asset_url function to the template context that
        resolves logical asset names to their hashed versions.

        Returns:
            dict: Dictionary containing the asset_url function.
        """

        def get_asset_url(logical_name):
            """Get the hashed URL for a static asset.

            Maps logical asset names like 'main.js' or 'main.css' to their
            content-hashed versions, ensuring proper cache invalidation.

            Args:
                logical_name (str): Logical name of the asset, e.g., 'main.js'

            Returns:
                str: URL to the hashed version of the asset.
            """
            if logical_name.endswith('.js'):
                # Use manifest for JS files (key should match logical name)
                hashed_path = manifest.get(logical_name)
                if hashed_path:
                    # Manifest value already includes 'gen/' prefix from Rollup config
                    return url_for('static', filename=hashed_path)
                current_app.logger.warning(
                    f"JS asset '{logical_name}' not found in manifest. Falling back."
                )
                # Fallback to non-hashed path (might be incorrect)
                return url_for('static', filename=f'gen/{logical_name}')

            if logical_name.endswith('.css'):
                # Use the pre-found hashed CSS file path
                if hashed_css_file:
                    return url_for('static', filename=hashed_css_file)
                current_app.logger.warning(
                    f"Hashed CSS file for '{logical_name}' not found. Falling back."
                )
                # Fallback to non-hashed path (might be incorrect)
                return url_for('static', filename=f'gen/{logical_name}')
            # Handle other types or return original name if needed
            current_app.logger.warning(
                f"Asset type for '{logical_name}' not handled. Falling back."
            )
            return url_for('static', filename=f'gen/{logical_name}')

        # Reload manifest/CSS in debug mode on each request for easier development
        if current_app.debug:
            load_manifest()

        return {'asset_url': get_asset_url}

    # -------------------------

    # Load the manifest when the app is created
    with app.app_context():
        load_manifest()

    return app
