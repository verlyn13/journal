import os

from dotenv import load_dotenv

# Load environment variables early, especially FLASK_APP if not set externally
load_dotenv()

from journal import create_app

# Create the Flask app instance using the factory
# Load configuration based on FLASK_CONFIG environment variable or default
# Ensure config.py exists and defines the 'Config' class
config_name = os.getenv('FLASK_CONFIG') or 'config.Config'
app = create_app(config_name)

if __name__ == '__main__':
    # Run the development server
    # Debug mode should ideally be controlled by configuration (e.g., app.config['DEBUG'])
    # For simplicity now, let's rely on FLASK_DEBUG env var or default to False
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(debug=debug_mode)
