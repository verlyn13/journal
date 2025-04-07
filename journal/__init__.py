import os
from datetime import datetime, timezone
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from dotenv import load_dotenv
import markdown

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


def create_app(config_class_name='config.Config'):
    """
    Application factory function.
    Configures and returns the Flask application instance.
    """
    app = Flask(__name__)

    # Load configuration from config.py using the provided class name
    app.config.from_object(config_class_name)

    # Initialize Flask extensions with the app
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    # Register blueprints
    # Authentication blueprint
    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint, url_prefix='/auth')

    # Main application blueprint (for non-auth features)
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    # --- User Loader for Flask-Login ---
    # Moved here to avoid circular imports if defined within models/user.py
    # and models/user.py needs to import 'db' from here.
    from .models.user import User
    @login_manager.user_loader
    def load_user(user_id):
        # Return the user object from the user ID stored in the session
        return User.query.get(int(user_id))
    # ------------------------------------


    # --- Global Context Processor ---
    @app.context_processor
    def inject_now():
        """Inject current UTC time into all templates."""
        return {'now': lambda: datetime.now(timezone.utc)} # Use recommended timezone-aware UTC time, wrapped in lambda for lazy evaluation
    # ---------------------------------

    # --- Markdown Filter ---
    @app.template_filter('markdown')
    def markdown_filter(s):
        return markdown.markdown(s)
    # -------------------------
    return app