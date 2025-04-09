from flask import Blueprint

# Create the authentication blueprint
auth = Blueprint("auth", __name__)

# Import routes at the end to avoid circular dependencies
# Routes will use the 'auth' blueprint instance defined above
# from . import routes, forms  # Commented out as currently unused (F401)
