#!/usr/bin/env python3
"""
Documentation index generator for Journal application.
Creates comprehensive index.json and INDEX.md for search and navigation.
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional
from datetime import datetime
import yaml
import hashlib

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))


class DocumentationIndexGenerator:
    """Generates documentation index for search and navigation."""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.docs_dir = project_root / "docs"
        self.index_data = {
            "generated_at": datetime.now().isoformat(),
            "version": "1.0.0",
            "documents": {},
            "categories": {},
            "tags": {},
            "search_index": [],
            "navigation": {},
            "statistics": {}
        }

    def generate_index(self) -> Dict[str, Any]:
        """Generate comprehensive documentation index."""
        print("Generating documentation index...")

        # Load relationships
        relationships = self._load_relationships()

        # Load taxonomy
        taxonomy = self._load_taxonomy()

        # Scan all documentation files
        for md_file in self.docs_dir.rglob("*.md"):
            p = str(md_file)
            # Skip generated/backups/duplicate archives
            if any(tok in p for tok in ["/_generated/", "/.backups/", "/archive/duplicates/"]):
                continue

            doc_data = self._process_document(md_file, relationships, taxonomy)
            if doc_data:
                doc_id = doc_data["id"]
                self.index_data["documents"][doc_id] = doc_data

                # Add to categories
                doc_type = doc_data["metadata"].get("type", "unknown")
                if doc_type not in self.index_data["categories"]:
                    self.index_data["categories"][doc_type] = []
                self.index_data["categories"][doc_type].append(doc_id)

                # Add to tags index
                for tag in doc_data["metadata"].get("tags", []):
                    if tag not in self.index_data["tags"]:
                        self.index_data["tags"][tag] = []
                    self.index_data["tags"][tag].append(doc_id)

                # Add to search index
                self._add_to_search_index(doc_data)

        # Build navigation structure
        self._build_navigation(relationships)

        # Calculate statistics
        self._calculate_statistics()

        return self.index_data

    def _load_relationships(self) -> Dict:
        """Load document relationships."""
        relationships_file = self.docs_dir / "relationships.json"
        if relationships_file.exists():
            with open(relationships_file, 'r') as f:
                return json.load(f)
        return {"documents": {}}

    def _load_taxonomy(self) -> Dict:
        """Load taxonomy configuration."""
        taxonomy_file = self.docs_dir / "taxonomy.yaml"
        if taxonomy_file.exists():
            with open(taxonomy_file, 'r') as f:
                return yaml.safe_load(f)
        return {}

    def _process_document(self, file_path: Path, relationships: Dict, taxonomy: Dict) -> Optional[Dict]:
        """Process a single document file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Parse frontmatter
            metadata = self._parse_frontmatter(content)

            # Generate document ID
            doc_id = metadata.get("id") or file_path.stem

            # Get file info
            stat = file_path.stat()
            relative_path = file_path.relative_to(self.docs_dir)

            # Extract text for search
            text_content = self._extract_text(content)

            # Calculate content hash
            content_hash = hashlib.md5(content.encode()).hexdigest()

            # Get relationships for this document
            doc_relationships = relationships.get("documents", {}).get(doc_id, {})

            # Normalize date fields from metadata
            def _norm_date_val(val):
                if isinstance(val, datetime):
                    return val.strftime("%Y-%m-%d")
                if isinstance(val, str):
                    # Accept ISO, use date part
                    return val.split('T', 1)[0]
                return datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d")

            created_val = _norm_date_val(metadata.get("created", datetime.fromtimestamp(stat.st_ctime).strftime("%Y-%m-%d")))
            updated_val = _norm_date_val(metadata.get("updated", datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d")))

            # Build document data
            doc_data = {
                "id": doc_id,
                "path": str(relative_path),
                "metadata": {
                    "title": metadata.get("title", file_path.stem.replace("-", " ").title()),
                    "type": metadata.get("type", self._determine_type(file_path)),
                    "version": metadata.get("version", "1.0.0"),
                    "created": created_val,
                    "updated": updated_val,
                    "author": metadata.get("author", "Unknown"),
                    "tags": metadata.get("tags", []),
                    "priority": metadata.get("priority", "medium"),
                    "status": metadata.get("status", "draft"),
                    "visibility": metadata.get("visibility", "internal"),
                    "schema_version": metadata.get("schema_version", "v1")
                },
                "relationships": {
                    "parent": doc_relationships.get("parent"),
                    "children": doc_relationships.get("children", []),
                    "prerequisites": doc_relationships.get("prerequisites", []),
                    "related": doc_relationships.get("related", []),
                    "supersedes": doc_relationships.get("supersedes", []),
                    "superseded_by": doc_relationships.get("superseded_by"),
                    "implements": doc_relationships.get("implements", [])
                },
                "content": {
                    "summary": self._extract_summary(text_content),
                    "word_count": len(text_content.split()),
                    "headings": self._extract_headings(content),
                    "links": self._extract_links(content),
                    "code_blocks": self._count_code_blocks(content),
                    "images": self._extract_images(content)
                },
                "file": {
                    "size": stat.st_size,
                    "hash": content_hash,
                    "last_modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
                }
            }

            return doc_data

        except Exception as e:
            print(f"  Warning: Error processing {file_path}: {e}")
            return None

    def _parse_frontmatter(self, content: str) -> Dict:
        """Parse YAML frontmatter from content."""
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                try:
                    return yaml.safe_load(parts[1]) or {}
                except yaml.YAMLError:
                    pass
        return {}

    def _determine_type(self, file_path: Path) -> str:
        """Determine document type from path."""
        path_str = str(file_path).lower()

        if 'api' in path_str:
            return 'api'
        elif 'architecture' in path_str:
            return 'architecture'
        elif 'deployment' in path_str or 'deploy' in path_str:
            return 'deployment'
        elif 'guide' in path_str or 'tutorial' in path_str:
            return 'guide'
        elif 'test' in path_str:
            return 'testing'
        elif 'decision' in path_str or 'adr' in path_str:
            return 'decision'
        elif 'reference' in path_str:
            return 'reference'
        else:
            return 'unknown'

    def _extract_text(self, content: str) -> str:
        """Extract plain text from markdown content."""
        # Remove frontmatter
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                content = parts[2]

        # Remove code blocks
        import re
        content = re.sub(r'```[\s\S]*?```', '', content)
        content = re.sub(r'`[^`]+`', '', content)

        # Remove markdown formatting
        content = re.sub(r'#{1,6}\s+', '', content)  # Headers
        content = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', content)  # Links
        content = re.sub(r'[*_]{1,2}([^*_]+)[*_]{1,2}', r'\1', content)  # Bold/italic

        return content.strip()

    def _extract_summary(self, text: str) -> str:
        """Extract document summary."""
        sentences = text.split('. ')
        summary = '. '.join(sentences[:3]) + '.' if sentences else text[:500]
        return summary[:500]

    def _extract_headings(self, content: str) -> List[Dict]:
        """Extract headings from markdown."""
        import re
        headings = []
        pattern = r'^(#{1,6})\s+(.+)$'

        for match in re.finditer(pattern, content, re.MULTILINE):
            level = len(match.group(1))
            text = match.group(2)
            headings.append({
                "level": level,
                "text": text,
                "id": re.sub(r'[^a-z0-9-]', '', text.lower().replace(' ', '-'))
            })

        return headings

    def _extract_links(self, content: str) -> List[Dict]:
        """Extract links from markdown."""
        import re
        links = []
        pattern = r'\[([^\]]+)\]\(([^\)]+)\)'

        for match in re.finditer(pattern, content):
            text = match.group(1)
            url = match.group(2)
            links.append({
                "text": text,
                "url": url,
                "type": "external" if url.startswith('http') else "internal"
            })

        return links

    def _count_code_blocks(self, content: str) -> int:
        """Count code blocks in markdown."""
        import re
        return len(re.findall(r'```', content)) // 2

    def _extract_images(self, content: str) -> List[Dict]:
        """Extract images from markdown."""
        import re
        images = []
        pattern = r'!\[([^\]]*)\]\(([^\)]+)\)'

        for match in re.finditer(pattern, content):
            alt_text = match.group(1)
            url = match.group(2)
            images.append({
                "alt": alt_text,
                "url": url,
                "has_alt": bool(alt_text)
            })

        return images

    def _add_to_search_index(self, doc_data: Dict):
        """Add document to search index."""
        # Create search entry
        search_entry = {
            "id": doc_data["id"],
            "title": doc_data["metadata"]["title"],
            "type": doc_data["metadata"]["type"],
            "path": doc_data["path"],
            "summary": doc_data["content"]["summary"],
            "tags": doc_data["metadata"]["tags"],
            "updated": doc_data["metadata"]["updated"]
        }

        # Add to search index
        self.index_data["search_index"].append(search_entry)

    def _build_navigation(self, relationships: Dict):
        """Build navigation structure."""
        nav = relationships.get("navigation", {})

        self.index_data["navigation"] = {
            "primary": nav.get("primary", ["getting-started", "architecture-overview"]),
            "secondary": nav.get("secondary", []),
            "categories": list(self.index_data["categories"].keys()),
            "tree": self._build_tree_structure()
        }

    def _build_tree_structure(self) -> Dict:
        """Build tree structure from parent-child relationships."""
        tree = {}
        docs = self.index_data["documents"]

        # Find root documents (no parent)
        for doc_id, doc_data in docs.items():
            if not doc_data["relationships"].get("parent"):
                tree[doc_id] = self._build_subtree(doc_id, docs)

        return tree

    def _build_subtree(self, doc_id: str, docs: Dict) -> Dict:
        """Build subtree for a document."""
        doc = docs.get(doc_id, {})
        children = doc.get("relationships", {}).get("children", [])

        subtree = {
            "title": doc.get("metadata", {}).get("title", doc_id),
            "path": doc.get("path", ""),
            "children": {}
        }

        for child_id in children:
            if child_id in docs:
                subtree["children"][child_id] = self._build_subtree(child_id, docs)

        return subtree

    def _calculate_statistics(self):
        """Calculate index statistics."""
        docs = self.index_data["documents"]

        # Type distribution
        type_counts = {}
        for doc in docs.values():
            doc_type = doc["metadata"]["type"]
            type_counts[doc_type] = type_counts.get(doc_type, 0) + 1

        # Status distribution
        status_counts = {}
        for doc in docs.values():
            status = doc["metadata"]["status"]
            status_counts[status] = status_counts.get(status, 0) + 1

        # Calculate freshness
        current_date = datetime.now()
        stale_count = 0
        for doc in docs.values():
            raw_updated = doc["metadata"].get("updated")
            updated_dt = None
            if isinstance(raw_updated, datetime):
                updated_dt = raw_updated
            elif isinstance(raw_updated, str):
                try:
                    # Accept ISO or YYYY-MM-DD
                    if 'T' in raw_updated:
                        updated_dt = datetime.fromisoformat(raw_updated)
                    else:
                        updated_dt = datetime.strptime(raw_updated, "%Y-%m-%d")
                except Exception:
                    updated_dt = None
            if updated_dt is None:
                updated_dt = current_date
            days_old = (current_date - updated_dt).days
            if days_old > 90:
                stale_count += 1

        self.index_data["statistics"] = {
            "total_documents": len(docs),
            "by_type": type_counts,
            "by_status": status_counts,
            "total_tags": len(self.index_data["tags"]),
            "stale_documents": stale_count,
            "total_word_count": sum(d["content"]["word_count"] for d in docs.values()),
            "total_links": sum(len(d["content"]["links"]) for d in docs.values()),
            "total_images": sum(len(d["content"]["images"]) for d in docs.values())
        }

    def save_index(self):
        """Save index to files."""
        # Save JSON index
        index_file = self.docs_dir / "_generated" / "index.json"
        index_file.parent.mkdir(parents=True, exist_ok=True)
        with open(index_file, 'w') as f:
            json.dump(self.index_data, f, indent=2)
        print(f"  Saved index to: {index_file.relative_to(self.project_root)}")

        # Generate and save markdown index
        self._save_markdown_index()

    def _save_markdown_index(self):
        """Generate and save markdown index."""
        # Frontmatter for validator compatibility
        frontmatter = [
            "---",
            "id: index",
            "title: Documentation Index",
            "type: report",
            f"created: {self.index_data['generated_at']}",
            f"updated: {self.index_data['generated_at']}",
            "author: documentation-system",
            "tags: [documentation, index]",
            "---\n",
        ]

        content = "\n".join(frontmatter) + f"""# Documentation Index

Generated: {self.index_data['generated_at']}

## Statistics

- **Total Documents**: {self.index_data['statistics']['total_documents']}
- **Total Words**: {self.index_data['statistics']['total_word_count']:,}
- **Stale Documents**: {self.index_data['statistics']['stale_documents']}

## Structure Overview

- `architecture/` — system design and technical architecture
- `api/` — API references and schemas
- `guides/` — how-to guides and tutorials
- `implementation/` — consolidated implementation guide and sections
- `initial-planning/` — planning and design guides
- `status/` — project changelog and status entries
- `development/` — local dev and framework docs
- `ci-cd/` — CI/CD documentation and checklists
- `templates/` — documentation templates
- `reports/` — generated or curated status/analysis reports

## Documents by Type

"""
        # Group by type
        for doc_type, count in sorted(self.index_data['statistics']['by_type'].items()):
            content += f"\n### {doc_type.title()} ({count})\n\n"

            docs_of_type = [
                (doc_id, self.index_data['documents'][doc_id])
                for doc_id in self.index_data['categories'].get(doc_type, [])
            ]

            for doc_id, doc in sorted(docs_of_type, key=lambda x: x[1]['metadata']['title']):
                title = doc['metadata']['title']
                path = doc['path']
                status = doc['metadata']['status']
                updated = doc['metadata']['updated']
                content += f"- [{title}]({path}) - {status} (updated: {updated})\n"

        content += """
## Navigation Tree

```
"""
        # Add tree structure
        for root_id, subtree in self.index_data['navigation']['tree'].items():
            content += self._format_tree(root_id, subtree, 0)

        content += """```

## Tags

"""
        # List tags with counts
        for tag, doc_ids in sorted(self.index_data['tags'].items()):
            content += f"- **{tag}** ({len(doc_ids)} documents)\n"

        # Save markdown index
        index_md = self.docs_dir / "INDEX.md"
        with open(index_md, 'w') as f:
            f.write(content)
        print(f"  Saved markdown index to: {index_md.relative_to(self.project_root)}")

    def _format_tree(self, node_id: str, node_data: Dict, level: int) -> str:
        """Format tree structure as text."""
        indent = "  " * level
        result = f"{indent}├── {node_data['title']}\n"

        for child_id, child_data in node_data.get('children', {}).items():
            result += self._format_tree(child_id, child_data, level + 1)

        return result


def main():
    """Main function."""
    project_root = Path(__file__).parent.parent
    generator = DocumentationIndexGenerator(project_root)

    # Generate index
    index_data = generator.generate_index()

    # Save index files
    generator.save_index()

    # Print summary
    stats = index_data['statistics']
    print(f"\n📚 Documentation Index Generated:")
    print(f"  Total documents: {stats['total_documents']}")
    print(f"  Document types: {len(stats['by_type'])}")
    print(f"  Total tags: {stats['total_tags']}")
    print(f"  Stale documents: {stats['stale_documents']}")

    print(f"\n✅ Index generation complete!")


if __name__ == "__main__":
    main()
