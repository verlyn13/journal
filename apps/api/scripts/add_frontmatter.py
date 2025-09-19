#!/usr/bin/env python3
"""
Add frontmatter to documentation files that don't have it.
"""

import sys
import re
import yaml
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

def extract_title(content: str, file_path: Path) -> str:
    """Extract title from markdown content or filename."""
    # Try to find first H1 heading
    lines = content.split('\n')
    for line in lines[:10]:  # Check first 10 lines
        if line.startswith('# '):
            return line[2:].strip()

    # Fallback to filename
    name = file_path.stem.replace('-', ' ').replace('_', ' ')
    # Convert to title case
    return ' '.join(word.capitalize() for word in name.split())

def extract_description(content: str) -> str:
    """Extract description from first paragraph after title."""
    lines = content.split('\n')
    found_title = False
    description_lines = []

    for line in lines:
        if line.startswith('# '):
            found_title = True
            continue

        if found_title:
            # Skip empty lines after title
            if not line.strip() and not description_lines:
                continue

            # Stop at next heading or after getting enough content
            if line.startswith('#') or len(description_lines) >= 3:
                break

            if line.strip():
                description_lines.append(line.strip())

    description = ' '.join(description_lines)
    # Truncate if too long
    if len(description) > 200:
        description = description[:197] + '...'

    return description or "Documentation for Journal application"

def categorize_file(file_path: Path) -> Dict[str, any]:
    """Categorize file based on path and content."""
    path_str = str(file_path)

    # Determine type
    doc_type = "guide"
    if 'api' in path_str.lower():
        doc_type = "api"
    elif 'adr' in path_str.lower():
        doc_type = "decision"
    elif 'guide' in path_str.lower():
        doc_type = "guide"
    elif 'reference' in path_str.lower() or 'ref' in path_str.lower():
        doc_type = "reference"
    elif 'tutorial' in path_str.lower():
        doc_type = "tutorial"
    elif 'template' in path_str.lower():
        doc_type = "template"
    elif 'proposal' in path_str.lower() or 'rfc' in path_str.lower():
        doc_type = "proposal"
    elif 'status' in path_str.lower() or 'report' in path_str.lower():
        doc_type = "report"
    elif 'implementation' in path_str.lower() or 'phase' in path_str.lower():
        doc_type = "implementation"

    # Determine priority
    priority = 2  # Default medium
    if any(x in path_str.lower() for x in ['readme', 'index', 'overview', 'getting-started', 'installation']):
        priority = 1
    elif any(x in path_str.lower() for x in ['archive', 'deprecated', 'old', 'legacy']):
        priority = 3

    # Determine status
    status = "current"
    if 'deprecated' in path_str.lower() or 'archive' in path_str.lower():
        status = "deprecated"
    elif 'draft' in path_str.lower() or 'wip' in path_str.lower():
        status = "draft"

    # Extract tags from path
    tags = []
    parts = file_path.parts
    for part in parts:
        if part not in ['docs', '.', '..'] and not part.endswith('.md'):
            # Clean up the part
            tag = part.replace('-', '_').replace(' ', '_').lower()
            if tag and tag not in tags:
                tags.append(tag)

    # Add type as tag
    if doc_type not in tags:
        tags.append(doc_type)

    # Determine visibility
    visibility = "public"
    if any(x in path_str.lower() for x in ['internal', 'private', 'draft']):
        visibility = "internal"

    # Determine schema version
    schema_version = "v1"

    return {
        'type': doc_type,
        'priority': priority,
        'status': status,
        'tags': tags[:5],  # Limit to 5 tags
        'visibility': visibility,
        'schema_version': schema_version
    }

def generate_frontmatter(file_path: Path, content: str) -> str:
    """Generate frontmatter for a file."""
    # Extract metadata
    title = extract_title(content, file_path)
    description = extract_description(content)
    categories = categorize_file(file_path)

    # Generate unique ID from file path
    doc_id = file_path.stem.lower().replace(' ', '-').replace('_', '-')
    if file_path.parent.name != 'docs':
        doc_id = f"{file_path.parent.name}-{doc_id}"

    # Build frontmatter
    frontmatter = {
        'id': doc_id,
        'title': title,
        'description': description,
        'type': categories['type'],
        'created': datetime.now().strftime('%Y-%m-%d'),
        'updated': datetime.now().strftime('%Y-%m-%d'),
        'author': 'Journal Team',
        'tags': categories['tags'],
        'priority': categories['priority'],
        'status': categories['status'],
        'visibility': categories['visibility'],
        'schema_version': categories['schema_version']
    }

    # Add version for certain types
    if categories['type'] in ['api', 'implementation']:
        frontmatter['version'] = '1.0.0'

    return yaml.dump(frontmatter, default_flow_style=False, sort_keys=False)

def has_frontmatter(content: str) -> bool:
    """Check if content already has frontmatter."""
    lines = content.split('\n')
    if lines and lines[0].strip() == '---':
        # Look for closing ---
        for i, line in enumerate(lines[1:], 1):
            if line.strip() == '---':
                return True
            if i > 30:  # Don't look too far
                break
    return False

def add_frontmatter_to_file(file_path: Path) -> bool:
    """Add frontmatter to a single file."""
    try:
        # Read file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if already has frontmatter
        if has_frontmatter(content):
            print(f"  Skip (has frontmatter): {file_path}")
            return False

        # Generate frontmatter
        frontmatter = generate_frontmatter(file_path, content)

        # Add frontmatter
        new_content = f"---\n{frontmatter}---\n\n{content}"

        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"  ✓ Added frontmatter: {file_path}")
        return True

    except Exception as e:
        print(f"  ✗ Error processing {file_path}: {e}")
        return False

def main():
    """Main function."""
    # Get docs directory
    project_root = Path(__file__).parent.parent
    docs_dir = project_root / "docs"

    if not docs_dir.exists():
        print(f"Error: Docs directory not found: {docs_dir}")
        sys.exit(1)

    # Find all markdown files
    md_files = list(docs_dir.rglob("*.md"))
    print(f"Found {len(md_files)} markdown files")

    # Process each file
    added = 0
    skipped = 0
    errors = 0

    for md_file in md_files:
        # Skip generated files
        if '_generated' in str(md_file):
            continue

        result = add_frontmatter_to_file(md_file)
        if result:
            added += 1
        elif result is False:
            skipped += 1
        else:
            errors += 1

    # Summary
    print("\n" + "="*50)
    print("Frontmatter Addition Summary")
    print("="*50)
    print(f"Total files:     {len(md_files)}")
    print(f"Added:          {added}")
    print(f"Skipped:        {skipped}")
    print(f"Errors:         {errors}")

    sys.exit(0 if errors == 0 else 1)

if __name__ == "__main__":
    main()
