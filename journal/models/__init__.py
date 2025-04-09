from .user import User  # noqa: F401
from .entry import Entry  # noqa: F401
from .tag import Tag  # noqa: F401


# This makes db.Model discoverable for Flask-Migrate
# Ensure all models are imported here
