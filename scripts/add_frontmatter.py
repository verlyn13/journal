#!/usr/bin/env python3
"""
Add frontmatter to all documentation files that don't have it.
Intelligently generates metadata based on file content and location.
"""

import re
import sys
from pathlib import Path
from typing import Dict, Optional, List
from datetime import datetime
import yaml

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))


class FrontmatterGenerator:
    """Generates and adds frontmatter to documentation files."""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.docs_dir = project_root / "docs"

        # Load taxonomy
        self.taxonomy = self._load_taxonomy()

        # Statistics
        self.stats = {
            "total_files": 0,
            "files_with_frontmatter": 0,
            "files_without_frontmatter": 0,
            "files_processed": 0,
            "files_skipped": 0,
            "errors": []
        }

    def _load_taxonomy(self) -> Dict:
        """Load taxonomy configuration."""
        taxonomy_file = self.docs_dir / "taxonomy.yaml"
        if taxonomy_file.exists():
            with open(taxonomy_file, 'r') as f:
                return yaml.safe_load(f)
        return {}

    def process_all(self, auto: bool = False, batch_size: int = 10):
        """Process all documentation files."""
        md_files = list(self.docs_dir.rglob("*.md"))
        self.stats["total_files"] = len(md_files)

        files_to_process = []

        for md_file in md_files:
            # Skip generated files
            if "_generated" in str(md_file):
                self.stats["files_skipped"] += 1
                continue

            if self._has_frontmatter(md_file):
                self.stats["files_with_frontmatter"] += 1
            else:
                self.stats["files_without_frontmatter"] += 1
                files_to_process.append(md_file)

        print(f"Found {len(files_to_process)} files without frontmatter")

        if not auto and files_to_process:
            response = input(f"Add frontmatter to {len(files_to_process)} files? (y/n): ")
            if response.lower() != 'y':
                print("Aborted.")
                return

        # Process in batches
        for i in range(0, len(files_to_process), batch_size):
            batch = files_to_process[i:i + batch_size]
            print(f"\nProcessing batch {i//batch_size + 1} ({len(batch)} files)...")

            for file_path in batch:
                try:
                    self._add_frontmatter(file_path)
                    self.stats["files_processed"] += 1
                    print(f"  ✅ {file_path.relative_to(self.docs_dir)}")
                except Exception as e:
                    self.stats["errors"].append(f"{file_path}: {e}")
                    print(f"  ❌ {file_path.relative_to(self.docs_dir)}: {e}")

        self._print_summary()

    def _has_frontmatter(self, file_path: Path) -> bool:
        """Check if file has frontmatter."""
        with open(file_path, 'r', encoding='utf-8') as f:
            first_line = f.readline().strip()
            return first_line == '---'

    def _add_frontmatter(self, file_path: Path):
        """Add frontmatter to a single file."""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Generate frontmatter
        metadata = self._generate_metadata(file_path, content)

        # Create YAML frontmatter
        frontmatter = yaml.dump(metadata, default_flow_style=False, sort_keys=False)

        # Add frontmatter to content
        new_content = f"---\n{frontmatter}---\n\n{content}"

        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

    def _generate_metadata(self, file_path: Path, content: str) -> Dict:
        """Generate metadata for a document."""
        relative_path = file_path.relative_to(self.docs_dir)

        # Get file stats
        stat = file_path.stat()
        created = datetime.fromtimestamp(stat.st_ctime).strftime('%Y-%m-%d')
        updated = datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d')

        # Generate document ID
        doc_id = file_path.stem.lower().replace('_', '-').replace(' ', '-')

        # Determine document type
        doc_type = self._determine_type(file_path, content)

        # Extract title
        title = self._extract_title(file_path, content)

        # Generate tags
        tags = self._generate_tags(file_path, content, doc_type)

        # Determine priority
        priority = self._determine_priority(file_path, doc_type)

        # Determine status
        status = self._determine_status(file_path, content, updated)

        # Build metadata
        metadata = {
            "id": doc_id,
            "title": title,
            "type": doc_type,
            "version": "1.0.0",
            "created": created,
            "updated": updated,
            "author": self._determine_author(content),
            "tags": tags,
            "priority": priority,
            "status": status,
            "visibility": "internal",
            "schema_version": "v1"
        }

        # Add description if available
        description = self._extract_description(content)
        if description:
            metadata["description"] = description

        return metadata

    def _determine_type(self, file_path: Path, content: str) -> str:
        """Determine document type from path and content."""
        path_str = str(file_path).lower()
        content_lower = content.lower()

        # Check path-based patterns
        if 'api' in path_str or 'endpoint' in content_lower:
            return 'api'
        elif 'architecture' in path_str or 'design' in path_str:
            return 'architecture'
        elif 'deploy' in path_str or 'ci' in path_str:
            return 'deployment'
        elif 'guide' in path_str or 'tutorial' in content_lower or 'how to' in content_lower:
            return 'guide'
        elif 'test' in path_str or 'testing' in content_lower:
            return 'testing'
        elif 'adr' in path_str or 'decision' in path_str:
            return 'decision'
        elif 'status' in path_str:
            return 'status'
        elif 'security' in path_str or 'auth' in path_str:
            return 'security'
        else:
            return 'reference'

    def _extract_title(self, file_path: Path, content: str) -> str:
        """Extract or generate document title."""
        # Try to find H1 heading
        h1_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        if h1_match:
            return h1_match.group(1).strip()

        # Try to find H2 heading
        h2_match = re.search(r'^##\s+(.+)$', content, re.MULTILINE)
        if h2_match:
            return h2_match.group(1).strip()

        # Generate from filename
        title = file_path.stem.replace('-', ' ').replace('_', ' ')
        return title.title()

    def _extract_description(self, content: str) -> Optional[str]:
        """Extract description from content."""
        # Remove headings
        clean_content = re.sub(r'^#{1,6}\s+.*$', '', content, flags=re.MULTILINE)

        # Get first paragraph
        paragraphs = clean_content.strip().split('\n\n')
        for para in paragraphs:
            if len(para) > 50 and not para.startswith('```'):
                return para[:200].strip()

        return None

    def _generate_tags(self, file_path: Path, content: str, doc_type: str) -> List[str]:
        """Generate appropriate tags for the document."""
        tags = []

        # Add type tag
        tags.append(doc_type)

        path_str = str(file_path).lower()
        content_lower = content.lower()

        # Technology tags
        if 'fastapi' in content_lower:
            tags.append('fastapi')
        if 'react' in content_lower:
            tags.append('react')
        if 'typescript' in content_lower or '.ts' in content_lower or '.tsx' in content_lower:
            tags.append('typescript')
        if 'python' in content_lower or '.py' in content_lower:
            tags.append('python')
        if 'docker' in content_lower:
            tags.append('docker')
        if 'github' in content_lower or 'ci/cd' in content_lower:
            tags.append('ci-cd')

        # Feature tags
        if 'auth' in path_str or 'authentication' in content_lower:
            tags.append('authentication')
        if 'database' in content_lower or 'postgres' in content_lower:
            tags.append('database')
        if 'test' in path_str or 'testing' in content_lower:
            tags.append('testing')
        if 'deploy' in path_str:
            tags.append('deployment')

        # Process tags
        if 'getting' in path_str and 'started' in path_str:
            tags.append('getting-started')
        if 'troubleshoot' in content_lower:
            tags.append('troubleshooting')

        # Filter to allowed tags from taxonomy
        if self.taxonomy and 'tags' in self.taxonomy:
            allowed_tags = set(self.taxonomy['tags'])
            tags = [tag for tag in tags if tag in allowed_tags]

        # Remove duplicates and limit
        tags = list(set(tags))[:10]

        return tags

    def _determine_priority(self, file_path: Path, doc_type: str) -> str:
        """Determine document priority."""
        path_str = str(file_path).lower()

        # Critical priority
        if 'deploy' in path_str or 'security' in path_str or 'auth' in path_str:
            return 'critical'
        elif doc_type == 'api':
            return 'high'
        elif doc_type == 'architecture' or doc_type == 'decision':
            return 'high'
        elif doc_type == 'guide' or doc_type == 'testing':
            return 'medium'
        else:
            return 'medium'

    def _determine_status(self, file_path: Path, content: str, updated: str) -> str:
        """Determine document status."""
        # Check freshness
        days_old = (datetime.now() - datetime.strptime(updated, '%Y-%m-%d')).days

        if days_old > 180:
            return 'deprecated'
        elif days_old > 90:
            return 'review'
        elif 'TODO' in content or 'FIXME' in content or 'WIP' in content:
            return 'draft'
        else:
            return 'approved'

    def _determine_author(self, content: str) -> str:
        """Try to determine author from content."""
        # Look for author patterns
        author_match = re.search(r'(?:Author|By|Created by):?\s*([^\n]+)', content, re.IGNORECASE)
        if author_match:
            return author_match.group(1).strip()

        return "Journal Team"

    def _print_summary(self):
        """Print processing summary."""
        print("\n" + "="*60)
        print("Frontmatter Generation Summary")
        print("="*60)
        print(f"Total files: {self.stats['total_files']}")
        print(f"Files with frontmatter: {self.stats['files_with_frontmatter']}")
        print(f"Files without frontmatter: {self.stats['files_without_frontmatter']}")
        print(f"Files processed: {self.stats['files_processed']}")
        print(f"Files skipped: {self.stats['files_skipped']}")

        if self.stats['errors']:
            print(f"\n❌ Errors ({len(self.stats['errors'])}):")
            for error in self.stats['errors'][:5]:
                print(f"  - {error}")


def main():
    """Main function."""
    import argparse

    parser = argparse.ArgumentParser(description='Add frontmatter to documentation files')
    parser.add_argument(
        '--auto',
        action='store_true',
        help='Automatically add frontmatter without prompting'
    )
    parser.add_argument(
        '--batch-size',
        type=int,
        default=10,
        help='Number of files to process in each batch'
    )
    parser.add_argument(
        '--project-root',
        type=Path,
        default=Path(__file__).parent.parent,
        help='Project root directory'
    )

    args = parser.parse_args()

    generator = FrontmatterGenerator(args.project_root)
    generator.process_all(auto=args.auto, batch_size=args.batch_size)


if __name__ == "__main__":
    main()