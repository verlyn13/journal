from flask import Blueprint
from datetime import datetime

# Create the main application blueprint
main = Blueprint("main", __name__)

# Context processor moved to journal/__init__.py for global access

# Import routes at the end to avoid circular dependencies
# Routes will use the 'main' blueprint instance defined above
from . import routes  # Add other imports like models if needed later
