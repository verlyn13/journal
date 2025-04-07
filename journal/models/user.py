from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from .. import db  # Import db instance from the main package (__init__.py)

class User(UserMixin, db.Model):
    """User model for authentication."""
    __tablename__ = 'users'  # Optional: Define table name explicitly

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True, nullable=False)
    email = db.Column(db.String(120), index=True, unique=True, nullable=False)
    password_hash = db.Column(db.String(256)) # Increased length for potentially longer hashes (e.g., Argon2)
    entries = db.relationship('Entry', backref='author', lazy='dynamic', cascade="all, delete-orphan") # Added relationship to Entry

    def set_password(self, password):
        """Hashes the password and stores it."""
        # Using generate_password_hash which defaults to a strong method (scrypt in recent Werkzeug)
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Checks if the provided password matches the stored hash."""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        """String representation of the User object."""
        return f'<User {self.username}>'

# Note: The @login_manager.user_loader callback is defined in journal/__init__.py
# to avoid circular import issues, as this file imports 'db' from there.