import textwrap
from pathlib import Path

import pytest

from scripts.add_frontmatter import (
    extract_title,
    extract_description,
    categorize_file,
    has_frontmatter,
)


def test_extract_title_from_h1(tmp_path: Path) -> None:
    content = "# Hello World\nMore text"
    title = extract_title(content, tmp_path / "hello.md")
    assert title == "Hello World"


def test_extract_title_from_filename(tmp_path: Path) -> None:
    content = "No headings here"
    title = extract_title(content, tmp_path / "my-file_name.md")
    assert title == "My File Name"


def test_extract_description_after_title() -> None:
    content = textwrap.dedent(
        """
        # Title

        This is the first paragraph after the title.
        It should be used as the description.

        ## Next section
        More content
        """
    ).strip()
    desc = extract_description(content)
    assert desc.startswith("This is the first paragraph")


@pytest.mark.parametrize(
    "path,doc_type",
    [
        (Path("docs/api/guide.md"), "api"),
        (Path("docs/adr/record.md"), "decision"),
        (Path("docs/guides/howto.md"), "guide"),
        (Path("docs/reference/index.md"), "reference"),
        (Path("docs/tutorial/intro.md"), "tutorial"),
        (Path("docs/implementation/plan.md"), "implementation"),
    ],
)
def test_categorize_file_type(path: Path, doc_type: str) -> None:
    meta = categorize_file(path)
    assert meta["type"] == doc_type


def test_has_frontmatter_true() -> None:
    content = textwrap.dedent(
        """
        ---
        id: sample
        title: Sample
        ---

        # Content
        """
    ).strip()
    assert has_frontmatter(content) is True


def test_has_frontmatter_false() -> None:
    assert has_frontmatter("# No FM") is False
