import pytest

from app.infra.conversion import html_to_markdown, markdown_to_html


@pytest.mark.unit()
def test_markdown_to_html_basic():
    md = "# Title\n\nPara one\n\nPara two"
    html = markdown_to_html(md)
    assert "<h1>Title</h1>" in html
    assert "<p>Para one</p>" in html
    assert "<p>Para two</p>" in html


@pytest.mark.unit()
def test_html_to_markdown_basic():
    html = "<h2>Sub</h2><p>Paragraph</p><br/>"
    md = html_to_markdown(html)
    assert md.startswith("## Sub")
    assert "Paragraph" in md
