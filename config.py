import os

from dotenv import load_dotenv

# Load environment variables from .env file
# Useful if running flask commands directly which might not load .env automatically
load_dotenv()

# Get the absolute path of the directory where this file resides
basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    """Base configuration settings."""

    # Secret key for session management, CSRF protection, etc.
    # Loaded from environment variable for security.
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-should-really-change-this'

    # Database configuration
    # Use SQLite for simplicity in this MVP
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(
        basedir, 'journal.db'
    )
    # Disable modification tracking to save resources, as it's not needed
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Pagination settings
    ENTRIES_PER_PAGE = 10  # Number of entries to display per page
    # Add other configurations as needed, e.g., for mail, uploads, etc.
    # Example:
    # MAIL_SERVER = os.environ.get('MAIL_SERVER')
    # MAIL_PORT = int(os.environ.get('MAIL_PORT') or 25)
    # MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') is not None
    # MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    # MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    # ADMINS = ['your-email@example.com']


# You could add other classes for different environments, e.g.:
# class DevelopmentConfig(Config):
#     DEBUG = True
#
class TestingConfig(Config):
    """Configuration for running tests.

    Uses in-memory SQLite and disables CSRF for simpler form testing.
    """

    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'  # Use in-memory DB for tests
    WTF_CSRF_ENABLED = False  # Disable CSRF for easier testing


#
# class ProductionConfig(Config):
#     # Production specific settings
#     pass

# Dictionary to map config names to classes (optional, useful for FLASK_CONFIG env var)
# config = {
#     'development': DevelopmentConfig,
#     'testing': TestingConfig,
#     'production': ProductionConfig,
#     'default': DevelopmentConfig
# }
