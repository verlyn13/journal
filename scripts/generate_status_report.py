#!/usr/bin/env python3
"""
Generate a consolidated documentation status report.

Runs:
- Quick health (scripts/check_docs.sh)
- Full validator (scripts/validate_documentation.py --json --quiet)
- Orphan scan (docs not referenced by docs/INDEX.md)
- Large document scan (> 50 KB)

Outputs:
- JSON: docs/_generated/reports/docs_status.json
- Markdown: docs/reports/docs-status.md
"""

from __future__ import annotations

import json
from pathlib import Path
import re
import subprocess
from typing import Any, Dict, List, Tuple


DOCS_DIR = Path("docs")
REPORT_DIR = DOCS_DIR / "_generated" / "reports"
MD_REPORT = DOCS_DIR / "reports" / "docs-status.md"


def run(cmd: List[str]) -> Tuple[int, str, str]:
    p = subprocess.run(cmd, text=True, capture_output=True)
    return p.returncode, p.stdout, p.stderr


def quick_health() -> Dict[str, Any]:
    code, out, _ = run(["bash", "scripts/check_docs.sh"])
    # Parse cursory metrics from the output
    stats: Dict[str, Any] = {}
    for line in out.splitlines():
        line = line.strip()
        if (
            line.startswith("• Total documentation files:")
            or "Total documentation files:" in line
        ):
            stats["total_docs"] = int(line.split(":")[-1].strip())
        elif "Files with frontmatter:" in line:
            part = line.split(":", 1)[1].strip()
            count = part.split("(")[0].strip()
            percent = part.split("(")[1].split("%")[0]
            stats["frontmatter_count"] = int(count)
            stats["frontmatter_percent"] = int(percent)
        elif "Documentation Health:" in line and "(" in line:
            try:
                score = int(line.split("(")[-1].split("/")[0])
                stats["score"] = score
            except Exception:
                pass
    return stats


def validator() -> Dict[str, Any]:
    code, out, err = run(
        ["python3", "scripts/validate_documentation.py", "--json", "--quiet"]
    )
    # Even if exit code is non-zero (validation failed), we still parse stdout JSON
    if out.strip():
        try:
            return json.loads(out)
        except Exception as e:
            raise RuntimeError(f"Validator output not JSON: {e}\n{out}")
    raise RuntimeError(f"Validator produced no output: {err}")


def tool_scan() -> Dict[str, Any]:
    """Run heuristic tool reference scan and return summary."""
    code, out, err = run(["python3", "scripts/scan_tool_references.py"])
    count = 0
    examples: List[str] = []
    if out:
        first = out.splitlines()[0].strip()
        try:
            # "Found N suspect tool-reference lines"
            count = int(first.split()[1])
        except Exception:
            count = 0
        for line in out.splitlines()[1:11]:
            if line.strip():
                examples.append(line.strip())
    return {"count": count, "examples": examples}


def collect_index_links() -> List[str]:
    index = DOCS_DIR / "INDEX.md"
    links: List[str] = []
    if not index.exists():
        return links
    content = index.read_text()
    # Markdown link pattern [text](path)
    for m in re.finditer(r"\[[^\]]+\]\(([^)]+)\)", content):
        target = m.group(1)
        if target.startswith(("http://", "https://", "#", "mailto:")):
            continue
        if target.endswith(".md"):
            # Normalize leading slashes
            if target.startswith("/"):
                target = target[1:]
            links.append(target)
    return links


def orphan_scan() -> Dict[str, Any]:
    # Build scope of docs
    scoped: List[Path] = []
    for p in DOCS_DIR.rglob("*.md"):
        s = str(p)
        if any(tok in s for tok in ["/archive/", "/.backups/", "/_generated/"]):
            continue
        scoped.append(p)

    referenced = set(collect_index_links())
    orphans: List[str] = []

    for p in scoped:
        rel = str(p.relative_to(DOCS_DIR))
        if rel == "INDEX.md":
            continue
        # Skip top-level navigation READMEs and reports as non-orphan by definition
        if rel.endswith("/README.md") or rel.startswith("reports/"):
            continue
        if rel not in referenced:
            orphans.append(rel)

    return {"count": len(orphans), "files": sorted(orphans)}


def large_docs(threshold: int = 50_000) -> Dict[str, Any]:
    large: List[Tuple[int, str]] = []
    for p in DOCS_DIR.rglob("*.md"):
        s = str(p)
        if any(tok in s for tok in ["/archive/", "/.backups/", "/_generated/"]):
            continue
        try:
            size = p.stat().st_size
            if size > threshold:
                large.append((size, str(p.relative_to(DOCS_DIR))))
        except Exception:
            pass
    large.sort(reverse=True)
    return {"count": len(large), "threshold": threshold, "files": large[:50]}


def write_reports(payload: Dict[str, Any]) -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    MD_REPORT.parent.mkdir(parents=True, exist_ok=True)

    # JSON
    (REPORT_DIR / "docs_status.json").write_text(json.dumps(payload, indent=2))

    # Markdown summary
    md: List[str] = []
    md.append("---")
    md.append("id: docs-status-report")
    md.append("title: Documentation Status Report")
    md.append("type: report")
    md.append(f"created: {payload['generated_at']}")
    md.append(f"updated: {payload['generated_at']}")
    md.append("author: documentation-system")
    md.append("tags: [documentation, status]")
    md.append("---\n")
    md.append("# Documentation Status Report")
    md.append("")
    qh = payload.get("quick_health", {})
    md.append("## Summary")
    md.append("")
    md.append(f"- Health (quick): {qh.get('score', 'N/A')}/100")
    md.append(
        f"- Frontmatter: {qh.get('frontmatter_count', 'N/A')} ({qh.get('frontmatter_percent', 'N/A')}%)"
    )
    v = payload.get("validator", {})
    vs = v.get("stats", {})
    md.append(f"- Validator total files: {vs.get('total_files', 'N/A')}")
    md.append(f"- Broken links: {vs.get('broken_links', 'N/A')}")
    md.append(f"- Tool issues: {vs.get('incorrect_tools', 'N/A')}")
    md.append(f"- Quality issues: {vs.get('quality_issues', 'N/A')}")
    md.append(f"- Outdated content: {vs.get('outdated_content', 'N/A')}")
    md.append(
        f"- Heuristic tool scan (context mentions): {payload['tool_scan']['count']}"
    )
    md.append("")
    md.append("## Orphans")
    md.append("")
    md.append(f"- Count: {payload['orphans']['count']}")
    if payload["orphans"]["count"]:
        md.append("- Examples:")
        for f in payload["orphans"]["files"][:15]:
            md.append(f"  - `{f}`")
    md.append("")
    md.append("## Large Documents")
    md.append("")
    md.append(
        f"- Count: {payload['large_docs']['count']} (> {payload['large_docs']['threshold']} bytes)"
    )
    if payload["large_docs"]["count"]:
        md.append("- Top examples:")
        for size, f in payload["large_docs"]["files"][:10]:
            md.append(f"  - {size} bytes — `{f}`")

    md.append("")
    md.append("## Tool Reference Scan (Heuristic)")
    md.append("")
    md.append("- Offending lines (sample):")
    for ex in payload["tool_scan"]["examples"]:
        md.append(f"  - {ex}")

    MD_REPORT.write_text("\n".join(md))


def main() -> int:
    from datetime import datetime

    payload: Dict[str, Any] = {
        "generated_at": datetime.now().isoformat(),
        "quick_health": quick_health(),
        "validator": validator(),
        "orphans": orphan_scan(),
        "large_docs": large_docs(),
        "tool_scan": tool_scan(),
    }

    write_reports(payload)
    print(f"Wrote JSON: {REPORT_DIR / 'docs_status.json'}")
    print(f"Wrote Markdown: {MD_REPORT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
