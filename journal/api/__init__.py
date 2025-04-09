# This file makes the 'api' directory a Python package.
from flask import Blueprint

# Define the blueprint for API routes
api_bp = Blueprint("api", __name__)

# Import routes after blueprint definition to avoid circular imports
from . import routes
