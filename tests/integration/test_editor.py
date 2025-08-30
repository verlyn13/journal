import pytest
from flask import url_for

# Sample Markdown with MathJax
SAMPLE_MARKDOWN = """
# Test Header

This is a paragraph with some **bold** text and *italic* text.

An equation: $E = mc^2$

Another equation:
$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

A list:
- Item 1
- Item 2
"""

# Note: MathJax processing happens client-side, not server-side
# So we check for the raw LaTeX/math notation in the HTML
EXPECTED_HTML_SUBSTRING_MATH = '$E = mc^2$'  # Check if math notation is preserved
EXPECTED_HTML_SUBSTRING_MARKDOWN = '<h1>Test Header</h1>'  # Check basic Markdown


def test_markdown_preview_api(auth_client, test_app):  # Added test_app fixture
    """Test the /api/v1/markdown endpoint for rendering Markdown and MathJax."""
    client, _ = auth_client  # Unpack client, auth_client fixture handles login
    with test_app.app_context():  # Added app context
        response = client.post(
            url_for('api.preview_markdown'),  # Corrected endpoint name
            json={'text': SAMPLE_MARKDOWN},
            headers={'Content-Type': 'application/json', 'Accept': 'application/json'},
        )
    assert response.status_code == 200
    assert response.content_type == 'application/json'

    data = response.get_json()
    assert 'html' in data
    assert isinstance(data['html'], str)
    # Check for expected substrings indicating Markdown processing
    assert EXPECTED_HTML_SUBSTRING_MARKDOWN in data['html']
    # Math notation should be preserved for client-side MathJax processing
    assert EXPECTED_HTML_SUBSTRING_MATH in data['html']


def test_markdown_preview_api_empty(auth_client, test_app):  # Added test_app fixture
    """Test the preview API with empty input."""
    client, _ = auth_client  # Unpack client, auth_client fixture handles login
    with test_app.app_context():  # Added app context
        response = client.post(
            url_for('api.preview_markdown'),  # Corrected endpoint name
            json={'text': ''},
            headers={'Content-Type': 'application/json', 'Accept': 'application/json'},
        )
    assert response.status_code == 200
    data = response.get_json()
    assert 'html' in data
    assert data['html'] == ''  # Expect empty string for empty input


def test_markdown_preview_api_no_text(auth_client, test_app):  # Added test_app fixture
    """Test the preview API with missing 'text' field."""
    client, _ = auth_client  # Unpack client, auth_client fixture handles login
    with test_app.app_context():  # Added app context
        response = client.post(
            url_for('api.preview_markdown'),  # Corrected endpoint name
            json={'other_field': 'value'},
            headers={'Content-Type': 'application/json', 'Accept': 'application/json'},
        )
    # API returns empty string for missing text field instead of 400
    assert response.status_code == 200
    data = response.get_json()
    assert 'html' in data
    assert data['html'] == ''


def test_markdown_preview_api_unauthenticated(test_client, test_app):  # Added test_app fixture
    """Test the preview API without authentication."""
    # API endpoint requires authentication, should redirect to login
    with test_app.app_context():  # Added app context for url_for
        response = test_client.post(
            url_for('api.preview_markdown'),  # Corrected endpoint name
            json={'text': 'test'},
            headers={'Content-Type': 'application/json', 'Accept': 'application/json'},
        )
        # API requires auth, should return 302 (redirect to login) or 401
        assert response.status_code in {302, 401}


def test_editor_present_on_create_page(auth_client, test_app):  # Added test_app fixture
    """Test if the create entry page loads successfully."""
    client, _ = auth_client  # Unpack client
    with test_app.app_context():  # Added app context
        response = client.get(url_for('main.new_entry'))  # Correct route name
    assert response.status_code == 200
    html_content = response.get_data(as_text=True)
    # Check for basic form elements that should be present
    assert '<form' in html_content
    assert 'name="title"' in html_content  # Title field
    assert 'name="body"' in html_content  # Body field


def test_editor_present_on_edit_page(auth_client, entry, test_app):  # Added test_app fixture
    """Test if the edit entry page loads successfully."""
    client, user_id = auth_client  # Unpack client and user_id
    # Ensure the entry belongs to the logged-in user for this test
    if entry.user_id != user_id:
        pytest.skip('Entry fixture does not belong to the authenticated user.')

    response = client.get(url_for('main.edit_entry', entry_id=entry.id))
    assert response.status_code == 200
    html_content = response.get_data(as_text=True)
    # Check for basic form elements and the entry's content
    assert '<form' in html_content
    assert 'Test Entry' in html_content  # Entry title should be present
    assert 'name="title"' in html_content  # Title field
    assert 'name="body"' in html_content  # Body field
