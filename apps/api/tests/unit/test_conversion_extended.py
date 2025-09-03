"""
Extended unit tests for markdown/HTML conversion functions.
"""
import pytest
from app.infra.conversion import markdown_to_html, html_to_markdown


@pytest.mark.unit
class TestConversionExtended:
    """Extended tests for conversion functions."""

    def test_markdown_to_html_with_code_blocks(self):
        """Test markdown with code blocks."""
        markdown = """# Code Example

Here's some Python:

```python
def hello():
    print("Hello, world!")
```

And some JavaScript:

```javascript
console.log("Hello!");
```
"""
        html = markdown_to_html(markdown)
        assert "<h1>" in html
        assert "<code>" in html or "<pre>" in html
        assert "def hello" in html

    def test_markdown_to_html_with_lists(self):
        """Test markdown with lists."""
        markdown = """# Lists

Unordered:
- Item 1
- Item 2
  - Nested item

Ordered:
1. First
2. Second
3. Third
"""
        html = markdown_to_html(markdown)
        assert "<ul>" in html
        assert "<ol>" in html
        assert "<li>" in html

    def test_markdown_to_html_with_links_and_images(self):
        """Test markdown with links and images."""
        markdown = """# Links and Images

[Click here](https://example.com)

![Alt text](image.jpg)
"""
        html = markdown_to_html(markdown)
        assert '<a href="https://example.com"' in html
        assert '<img src="image.jpg"' in html or '<img alt="Alt text"' in html

    def test_markdown_to_html_with_tables(self):
        """Test markdown with tables."""
        markdown = """# Table

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
"""
        html = markdown_to_html(markdown)
        # Tables might be rendered differently
        assert "Header 1" in html
        assert "Cell 1" in html

    def test_html_to_markdown_with_nested_elements(self):
        """Test HTML with nested elements."""
        html = """
        <div>
            <h1>Title</h1>
            <div>
                <p>Paragraph with <strong>bold</strong> and <em>italic</em></p>
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                </ul>
            </div>
        </div>
        """
        markdown = html_to_markdown(html)
        assert "# Title" in markdown
        assert "**bold**" in markdown
        assert "*italic*" in markdown or "_italic_" in markdown
        assert "- Item 1" in markdown or "* Item 1" in markdown

    def test_html_to_markdown_with_code(self):
        """Test HTML with code elements."""
        html = """
        <h1>Code Example</h1>
        <pre><code>def hello():
    print("Hello")</code></pre>
        <p>Inline <code>code</code> here</p>
        """
        markdown = html_to_markdown(html)
        assert "# Code Example" in markdown
        assert "def hello():" in markdown
        assert "`code`" in markdown

    def test_html_to_markdown_with_attributes(self):
        """Test HTML with various attributes."""
        html = """
        <h1 id="title" class="header">Title</h1>
        <a href="https://example.com" title="Example">Link</a>
        <img src="image.jpg" alt="Description" width="100">
        """
        markdown = html_to_markdown(html)
        assert "# Title" in markdown
        assert "[Link](https://example.com)" in markdown
        assert "![Description](image.jpg)" in markdown

    def test_markdown_to_html_empty_input(self):
        """Test empty markdown input."""
        assert markdown_to_html("") == ""
        assert markdown_to_html(None) == ""

    def test_html_to_markdown_empty_input(self):
        """Test empty HTML input."""
        assert html_to_markdown("") == ""
        assert html_to_markdown(None) == ""

    def test_markdown_to_html_special_characters(self):
        """Test markdown with special characters."""
        markdown = "# Title & <Special> Characters\n\n`code & <tags>`"
        html = markdown_to_html(markdown)
        # Should escape HTML entities
        assert "&amp;" in html or "& " in html
        assert "&lt;" in html or "<Special>" not in html

    def test_html_to_markdown_malformed(self):
        """Test malformed HTML input."""
        html = "<h1>Unclosed tag <p>Paragraph"
        # Should handle gracefully
        markdown = html_to_markdown(html)
        assert markdown  # Should return something, not crash