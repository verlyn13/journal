#!/usr/bin/env python3
"""
Build a documentation graph for agentic discovery.

Parses frontmatter and links to generate:
- nodes: id, path, title, type, tags
- edges: links (outbound) and backlinks

Outputs:
- JSON: docs/_generated/graph.json
- Markdown summary: docs/_generated/graph.md
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
import json
from pathlib import Path
import re
from typing import Any, Dict, List, Set, Tuple

import yaml


DOCS = Path("docs")
OUT_JSON = DOCS / "_generated" / "graph.json"
OUT_MD = DOCS / "_generated" / "graph.md"


@dataclass
class Node:
    id: str
    path: str
    title: str
    type: str
    tags: List[str]


def parse_frontmatter(md_path: Path) -> Tuple[Dict[str, Any], str]:
    text = md_path.read_text()
    if not text.startswith("---\n"):
        return {}, text
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}, text
    fm_text = text[4:end]
    body = text[end + 5 :]
    try:
        fm = yaml.safe_load(fm_text) or {}
    except Exception:
        fm = {}
    return fm, body


def collect_nodes_and_edges() -> Tuple[Dict[str, Node], Dict[str, Set[str]]]:
    nodes: Dict[str, Node] = {}
    edges: Dict[str, Set[str]] = {}
    link_re = re.compile(r"\[[^\]]+\]\(([^)]+)\)")

    for md in DOCS.rglob("*.md"):
        s = str(md)
        if any(tok in s for tok in ("/_generated/", "/archive/", "/.backups/")):
            continue
        fm, body = parse_frontmatter(md)
        # derive id
        doc_id = str(fm.get("id") or md.stem).strip()
        title = str(fm.get("title") or md.stem).strip()
        dtype = str(fm.get("type") or "").strip()
        tags = fm.get("tags") or []
        rel_path = str(md.relative_to(DOCS))
        node = Node(id=doc_id, path=rel_path, title=title, type=dtype, tags=tags)
        nodes[rel_path] = node  # index by path for link resolution

    # Second pass: edges with path normalization
    for md in DOCS.rglob("*.md"):
        s = str(md)
        if any(tok in s for tok in ("/_generated/", "/archive/", "/.backups/")):
            continue
        rel = str(md.relative_to(DOCS))
        edges.setdefault(rel, set())
        content = md.read_text()
        for m in link_re.finditer(content):
            target = m.group(1)
            if target.startswith(("http://", "https://", "#", "mailto:")):
                continue
            if not target.endswith(".md"):
                continue
            # Resolve relative paths
            if target.startswith("/"):
                resolved = target[1:]
            else:
                resolved = str(
                    (md.parent / target).resolve().relative_to(DOCS.resolve())
                )
            edges[rel].add(resolved)

    return nodes, edges


def invert_edges(edges: Dict[str, Set[str]]) -> Dict[str, Set[str]]:
    backlinks: Dict[str, Set[str]] = {}
    for src, outs in edges.items():
        for dst in outs:
            backlinks.setdefault(dst, set()).add(src)
    return backlinks


def main() -> int:
    nodes, edges = collect_nodes_and_edges()
    backlinks = invert_edges(edges)

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.parent.mkdir(parents=True, exist_ok=True)

    data = {
        "nodes": {k: asdict(v) for k, v in nodes.items()},
        "edges": {k: sorted(list(v)) for k, v in edges.items()},
        "backlinks": {k: sorted(list(v)) for k, v in backlinks.items()},
        "stats": {
            "nodes": len(nodes),
            "edges": sum(len(v) for v in edges.values()),
            "with_backlinks": sum(1 for v in backlinks.values() if v),
        },
    }
    OUT_JSON.write_text(json.dumps(data, indent=2))

    # Markdown summary (top hubs)
    hub_candidates = sorted(
        ((k, len(v)) for k, v in backlinks.items()), key=lambda x: x[1], reverse=True
    )
    md: List[str] = []
    md.append("# Documentation Graph Summary\n")
    md.append(f"- Nodes: {len(nodes)}")
    md.append(f"- Edges: {data['stats']['edges']}")
    md.append(f"- Nodes with backlinks: {data['stats']['with_backlinks']}\n")
    md.append("## Top Backlink Hubs")
    for path, n in hub_candidates[:20]:
        md.append(f"- {n} backlinks — `{path}`")
    OUT_MD.write_text("\n".join(md))

    print(f"Wrote JSON: {OUT_JSON}")
    print(f"Wrote Markdown: {OUT_MD}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
