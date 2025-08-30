from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from journal import db  # Import db instance from the main package (__init__.py)


class User(UserMixin, db.Model):
    """User model for authentication and authorization.

    This class represents a user in the system and stores authentication
    information such as username, email, and password hash, as well as
    relationships to user content like journal entries.

    Attributes:
        id (int): Primary key for the user record.
        username (str): Unique username for the user.
        email (str): User's email address.
        password_hash (str): Hashed password for security.
        entries (relationship): Relationship to user's journal entries.
    """

    __tablename__ = 'users'  # Optional: Define table name explicitly

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True, nullable=False)
    email = db.Column(db.String(120), index=True, unique=True, nullable=False)
    password_hash = db.Column(
        db.String(256)
    )  # Increased length for potentially longer hashes (e.g., Argon2)
    entries = db.relationship(
        'Entry', backref='author', lazy='dynamic', cascade='all, delete-orphan'
    )  # Added relationship to Entry

    def set_password(self, password):
        """Hash and store a user's password.

        Securely hashes the provided password using Werkzeug's
        generate_password_hash function and stores it in the model.

        Args:
            password (str): The plaintext password to hash and store.
        """
        # Using generate_password_hash which defaults to a strong method (scrypt in recent Werkzeug)
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verify a password against the stored hash.

        Args:
            password (str): The password to verify.

        Returns:
            bool: True if the password matches, False otherwise.
        """
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        """Return string representation of the User object.

        Returns:
            str: String representation of the user in the format '<User username>'.
        """
        return f'<User {self.username}>'


# Note: The @login_manager.user_loader callback is defined in journal/__init__.py
# to avoid circular import issues, as this file imports 'db' from there.
