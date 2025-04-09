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

EXPECTED_HTML_SUBSTRING_MATHJAX = 'class="MathJax"'  # Check if MathJax processed it
EXPECTED_HTML_SUBSTRING_MARKDOWN = "<h1>Test Header</h1>"  # Check basic Markdown


def test_markdown_preview_api(auth_client, test_app):  # Added test_app fixture
    """
    Test the /api/v1/markdown endpoint for rendering Markdown and MathJax.
    """
    client, _ = auth_client  # Unpack client, auth_client fixture handles login
    with test_app.app_context(): # Added app context
        response = client.post(
            url_for("api.preview_markdown"), # Corrected endpoint name
            json={"text": SAMPLE_MARKDOWN},
            headers={"Content-Type": "application/json", "Accept": "application/json"},
        )
    assert response.status_code == 200
    assert response.content_type == "application/json"

    data = response.get_json()
    assert "html" in data
    assert isinstance(data["html"], str)
    # Check for expected substrings indicating Markdown and MathJax processing
    assert EXPECTED_HTML_SUBSTRING_MARKDOWN in data["html"]
    assert EXPECTED_HTML_SUBSTRING_MATHJAX in data["html"]
    print(f"Preview HTML: {data['html'][:200]}...")  # Print start of HTML for debugging


def test_markdown_preview_api_empty(auth_client, test_app):  # Added test_app fixture
    """Test the preview API with empty input"""
    client, _ = auth_client  # Unpack client, auth_client fixture handles login
    with test_app.app_context(): # Added app context
        response = client.post(
            url_for("api.preview_markdown"), # Corrected endpoint name
            json={"text": ""},
            headers={"Content-Type": "application/json", "Accept": "application/json"},
    )
    assert response.status_code == 200
    data = response.get_json()
    assert "html" in data
    assert data["html"] == ""  # Expect empty string for empty input


def test_markdown_preview_api_no_text(auth_client, test_app):  # Added test_app fixture
    """Test the preview API with missing 'text' field"""
    client, _ = auth_client  # Unpack client, auth_client fixture handles login
    with test_app.app_context(): # Added app context
        response = client.post(
            url_for("api.preview_markdown"), # Corrected endpoint name
            json={"other_field": "value"},
            headers={"Content-Type": "application/json", "Accept": "application/json"},
    )
    assert response.status_code == 400  # Bad Request expected


def test_markdown_preview_api_unauthenticated(
    test_client, test_app
):  # Added test_app fixture
    """Test the preview API without authentication (if required)"""
    # This test depends on whether the API requires authentication.
    # If it does, expect 401/403. If not, expect 200.
    # Assuming it requires auth based on `auth.login()` in other tests.
    with test_app.app_context():  # Added app context for url_for
        # Corrected endpoint name in previous step, ensure context is applied
        response = test_client.post(
            url_for("api.preview_markdown"), # Corrected endpoint name
            json={"text": "test"},
            headers={"Content-Type": "application/json", "Accept": "application/json"},
        )
        # Adjust assertion based on actual auth requirement (e.g., 401 Unauthorized)
        assert response.status_code in [401, 403]  # Or 200 if public


def test_editor_present_on_create_page(auth_client, test_app):  # Added test_app fixture
    """Test if the editor component is present on the create entry page."""
    client, _ = auth_client  # Unpack client
    with test_app.app_context(): # Added app context
        response = client.get(url_for("main.create_entry"))
    assert response.status_code == 200
    html_content = response.get_data(as_text=True)
    # Check for the Alpine component initialization attribute
    assert 'x-data="editorComponent(' in html_content
    assert 'x-ref="editorElement"' in html_content
    assert 'x-ref="previewContent"' in html_content  # Check for preview area ref


def test_editor_present_on_edit_page(auth_client, entry, test_app): # Added test_app fixture
    """Test if the editor component is present on the edit entry page."""
    client, user_id = auth_client  # Unpack client and user_id
    # Ensure the entry belongs to the logged-in user for this test
    if entry.user_id != user_id:
        pytest.skip("Entry fixture does not belong to the authenticated user.")

    response = client.get(url_for("main.edit_entry", entry_id=entry.id))
    assert response.status_code == 200
    html_content = response.get_data(as_text=True)
    # Check for the Alpine component initialization attribute, potentially with entryId
    assert (
        f'x-data="editorComponent({entry.id},' in html_content
        or 'x-data="editorComponent(null,' in html_content
    )  # Allow for null ID if template logic changes
    assert 'x-ref="editorElement"' in html_content
    assert 'x-ref="previewContent"' in html_content  # Check for preview area ref
