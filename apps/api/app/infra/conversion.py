from __future__ import annotations

import html as html_module
import logging
import re

import bleach

from markdown_it import MarkdownIt


# Safe markdown processing with proper parser and sanitization

# Safe markdown processor with sanitization
_md_processor = MarkdownIt("commonmark").enable(["table", "strikethrough"])

# Allowed HTML tags and attributes for security
_ALLOWED_TAGS = {
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "sup",
    "sub",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "blockquote",
    "hr",
    "code",
    "pre",
    "span",
    "a",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
}

_ALLOWED_ATTRIBUTES = {
    "a": ["href", "title"],
    "img": ["src", "alt", "width", "height"],
    "code": ["class"],  # For syntax highlighting
    "span": ["class"],  # For special formatting
    "th": ["align"],
    "td": ["align"],
}


def markdown_to_html(md: str) -> str:
    """Convert markdown to sanitized HTML using proper parser.

    Args:
        md: Markdown text to convert

    Returns:
        Sanitized HTML string
    """
    if not md or not isinstance(md, str):
        return ""

    try:
        # Parse markdown to HTML
        html = _md_processor.render(md)

        # Sanitize HTML to prevent XSS
        clean_html = bleach.clean(
            html, tags=_ALLOWED_TAGS, attributes=_ALLOWED_ATTRIBUTES, strip=True
        )

        return clean_html

    except Exception as e:
        # Fallback to escaped plain text if parsing fails
        logging.getLogger(__name__).warning("Markdown parsing failed: %s", e)
        return html_module.escape(md).replace("\n", "<br/>")


def html_to_markdown(html: str) -> str:
    """Convert HTML back to markdown (basic implementation).

    Note: This is a lossy conversion and may not perfectly recreate the original markdown.

    Args:
        html: HTML text to convert

    Returns:
        Markdown string
    """
    if not html or not isinstance(html, str):
        return ""

    try:
        # Basic HTML to markdown conversion
        out = html

        # Headers with attributes
        out = re.sub(r"<h1[^>]*>", "# ", out)
        out = out.replace("</h1>", "\n\n")
        out = re.sub(r"<h2[^>]*>", "## ", out)
        out = out.replace("</h2>", "\n\n")
        out = re.sub(r"<h3[^>]*>", "### ", out)
        out = out.replace("</h3>", "\n\n")
        out = re.sub(r"<h4[^>]*>", "#### ", out)
        out = out.replace("</h4>", "\n\n")
        out = re.sub(r"<h5[^>]*>", "##### ", out)
        out = out.replace("</h5>", "\n\n")
        out = re.sub(r"<h6[^>]*>", "###### ", out)
        out = out.replace("</h6>", "\n\n")

        # Code blocks
        out = out.replace("<pre><code>", "```\n").replace("</code></pre>", "\n```")
        out = out.replace("<pre>", "```\n").replace("</pre>", "\n```")

        # Inline code
        out = out.replace("<code>", "`").replace("</code>", "`")

        # Bold and italic
        out = out.replace("<strong>", "**").replace("</strong>", "**")
        out = out.replace("<b>", "**").replace("</b>", "**")
        out = out.replace("<em>", "*").replace("</em>", "*")
        out = out.replace("<i>", "*").replace("</i>", "*")

        # Lists
        out = out.replace("<li>", "- ").replace("</li>", "\n")
        out = out.replace("<ul>", "").replace("</ul>", "\n")
        out = out.replace("<ol>", "").replace("</ol>", "\n")

        # Paragraphs and breaks
        out = out.replace("<p>", "").replace("</p>", "\n\n")
        out = out.replace("<br>", "  \n").replace("<br/>", "  \n").replace("<br />", "  \n")

        # Links (handle various attribute formats)
        link_pattern = r'<a\s+[^>]*href="([^"]+)"[^>]*>([^<]+)</a>'
        out = re.sub(link_pattern, r"[\2](\1)", out)

        # Images
        img_pattern = r'<img\s+[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*/?>'
        out = re.sub(img_pattern, r"![\2](\1)", out)
        # Handle img tags without alt
        img_pattern2 = r'<img\s+[^>]*src="([^"]+)"[^>]*/?>'
        out = re.sub(img_pattern2, r"![](\1)", out)

        # Blockquotes
        out = re.sub(r"<blockquote[^>]*>", "> ", out)
        out = out.replace("</blockquote>", "\n\n")

        # Clean up extra whitespace
        out = re.sub(r"\n{3,}", "\n\n", out)

        # Decode HTML entities back to literal characters
        out = html_module.unescape(out)

        return out.strip()

    except Exception as e:
        # Fallback - return original HTML if conversion fails
        logging.getLogger(__name__).warning("HTML to markdown conversion failed: %s", e)
        return html
