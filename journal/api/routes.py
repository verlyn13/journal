from flask import request, jsonify, current_app
from flask_login import login_required
import markdown # Using the markdown library already imported in main __init__

from . import api_bp # Import the blueprint from __init__.py

# Configure Markdown extensions (can be customized)
# Example: Enable tables and fenced code blocks
md_extensions = [
    'markdown.extensions.tables',
    'markdown.extensions.fenced_code',
    'markdown.extensions.extra' # Includes tables, fenced_code, footnotes, etc.
]

@api_bp.route('/v1/markdown/preview', methods=['POST'])
@login_required # Ensure only logged-in users can access
def preview_markdown():
    """
    API endpoint to preview Markdown text rendered as HTML.
    
    This endpoint renders the provided Markdown content as HTML using the configured
    Markdown extensions. It requires authentication via Flask-Login.
    
    Request:
        - Method: POST
        - Content-Type: application/json
        - Body: {"text": "markdown content to render"}
    
    Response:
        - Success: 200 OK with {"html": "rendered html content"}
        - Error: 400 Bad Request if not JSON, 500 Internal Server Error on rendering failure
    
    Security:
        - Requires authentication (login_required)
        - Uses session-based CSRF protection
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    markdown_text = data.get('text', '')

    if markdown_text is None: # Handle explicit null value
        markdown_text = ''

    try:
        # Render Markdown to HTML using the configured extensions
        html_content = markdown.markdown(markdown_text, extensions=md_extensions)
        return jsonify({"html": html_content})
    except Exception as e:
        current_app.logger.error(f"Markdown rendering failed: {e}", exc_info=True)
        return jsonify({"error": "Failed to render Markdown"}), 500

# Note: CSRF protection is typically handled globally by Flask-WTF for POST requests.
# If WTForms isn't used for this API endpoint (which is common for JSON APIs),
# you might need manual CSRF protection depending on your setup and security requirements.
# For this MVP phase with login_required, we assume standard session cookie auth provides
# sufficient protection against unsolicited requests.