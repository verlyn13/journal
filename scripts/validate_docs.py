#!/usr/bin/env python3
"""
Documentation validation script for Journal application.
Validates markdown documents against JSON schemas and policy rules.
"""

import json
import re
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import yaml
import jsonschema
from jsonschema import validate, ValidationError

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))


@dataclass
class ValidationResult:
    """Result of document validation."""

    file_path: Path
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    metrics: Dict[str, Any]


class DocumentValidator:
    """Validates documentation against schemas and policies."""

    def __init__(self, schema_dir: Path, docs_dir: Path):
        self.schema_dir = schema_dir
        self.docs_dir = docs_dir
        self.schemas = self._load_schemas()

    def _load_schemas(self) -> Dict[str, Any]:
        """Load all JSON schemas."""
        schemas = {}
        for schema_file in self.schema_dir.glob("*.schema.json"):
            with open(schema_file, 'r') as f:
                schema = json.load(f)
                schemas[schema_file.stem] = schema
        return schemas

    def parse_markdown(self, file_path: Path) -> Dict[str, Any]:
        """Parse markdown file and extract structured content."""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract frontmatter
        frontmatter = {}
        if content.startswith('---'):
            parts = content.split('---', 2)
            if len(parts) >= 3:
                try:
                    frontmatter = yaml.safe_load(parts[1])
                except yaml.YAMLError as e:
                    frontmatter = {"_error": str(e)}
                content = parts[2]

        # Parse sections
        sections = self._parse_sections(content)

        # Extract relationships from content
        relationships = self._extract_relationships(content)

        # Build document structure
        doc = {
            "metadata": self._build_metadata(file_path, frontmatter),
            "content": {
                "summary": self._extract_summary(content),
                "sections": sections
            },
            "relationships": relationships
        }

        return doc

    def _build_metadata(self, file_path: Path, frontmatter: Dict) -> Dict[str, Any]:
        """Build metadata from file and frontmatter."""
        # Determine document type from path
        doc_type = self._determine_type(file_path)

        # Get file stats
        stat = file_path.stat()
        created = datetime.fromtimestamp(stat.st_ctime).strftime('%Y-%m-%d')
        updated = datetime.fromtimestamp(stat.st_mtime).strftime('%Y-%m-%d')

        metadata = {
            "id": file_path.stem,
            "title": frontmatter.get("title", file_path.stem.replace('-', ' ').title()),
            "type": frontmatter.get("type", doc_type),
            "version": frontmatter.get("version", "1.0.0"),
            "created": frontmatter.get("created", created),
            "updated": frontmatter.get("updated", updated),
            "author": frontmatter.get("author", "Journal Team"),
            "tags": frontmatter.get("tags", []),
            "priority": frontmatter.get("priority", "medium"),
            "status": frontmatter.get("status", "draft")
        }

        return metadata

    def _determine_type(self, file_path: Path) -> str:
        """Determine document type from file path."""
        path_str = str(file_path)

        if 'api' in path_str or 'endpoints' in path_str:
            return 'api'
        elif 'guide' in path_str or 'tutorial' in path_str:
            return 'guide'
        elif 'architecture' in path_str or 'design' in path_str:
            return 'architecture'
        elif 'deploy' in path_str:
            return 'deployment'
        elif 'test' in path_str:
            return 'testing'
        elif 'adr' in path_str or 'decision' in path_str:
            return 'decision'
        else:
            return 'reference'

    def _parse_sections(self, content: str) -> List[Dict[str, Any]]:
        """Parse markdown content into sections."""
        sections = []

        # Split by headers
        header_pattern = r'^(#{1,6})\s+(.+)$'
        lines = content.split('\n')

        current_section = None
        section_content = []

        for line in lines:
            match = re.match(header_pattern, line)
            if match:
                # Save previous section
                if current_section:
                    current_section['content'] = '\n'.join(section_content).strip()
                    current_section['token_count'] = self._estimate_tokens(current_section['content'])
                    sections.append(current_section)

                # Start new section
                level = len(match.group(1))
                heading = match.group(2)
                current_section = {
                    'id': re.sub(r'[^a-z0-9-]', '', heading.lower().replace(' ', '-')),
                    'heading': heading,
                    'level': level,
                    'content': '',
                    'semantic_chunk_id': f"chunk_{len(sections)}",
                    'code_blocks': []
                }
                section_content = []
            else:
                section_content.append(line)

        # Save last section
        if current_section:
            current_section['content'] = '\n'.join(section_content).strip()
            current_section['token_count'] = self._estimate_tokens(current_section['content'])
            sections.append(current_section)

        return sections

    def _extract_summary(self, content: str) -> str:
        """Extract document summary from content."""
        # Look for explicit summary section
        summary_match = re.search(r'##?\s+(?:Executive\s+)?Summary\s*\n(.*?)(?:\n#|\Z)',
                                  content, re.IGNORECASE | re.DOTALL)
        if summary_match:
            summary = summary_match.group(1).strip()
            # Limit to first paragraph
            summary = summary.split('\n\n')[0]
            return summary[:500]

        # Otherwise, use first paragraph
        paragraphs = content.strip().split('\n\n')
        for para in paragraphs:
            if not para.startswith('#') and len(para) > 50:
                return para[:500]

        return "No summary available"

    def _extract_relationships(self, content: str) -> Dict[str, List[str]]:
        """Extract document relationships from content."""
        relationships = {
            'related': [],
            'prerequisites': [],
            'references': []
        }

        # Extract markdown links
        link_pattern = r'\[([^\]]+)\]\(([^\)]+)\)'
        for match in re.finditer(link_pattern, content):
            link_text = match.group(1)
            link_url = match.group(2)

            if link_url.endswith('.md'):
                # Internal document reference
                doc_id = Path(link_url).stem
                if 'prerequisite' in link_text.lower():
                    relationships['prerequisites'].append(doc_id)
                else:
                    relationships['related'].append(doc_id)
            elif link_url.startswith('http'):
                # External reference
                relationships['references'].append({
                    'type': 'external',
                    'id': link_url,
                    'url': link_url,
                    'title': link_text
                })

        return relationships

    def _estimate_tokens(self, text: str) -> int:
        """Estimate token count for text."""
        # Rough estimation: ~4 characters per token
        return len(text) // 4

    def validate_document(self, file_path: Path) -> ValidationResult:
        """Validate a single document."""
        errors = []
        warnings = []
        metrics = {}

        try:
            # Parse document
            doc = self.parse_markdown(file_path)

            # Determine schema to use
            doc_type = doc['metadata']['type']
            schema_name = f"{doc_type}-document"
            if schema_name not in self.schemas:
                schema_name = "base-document"

            # Validate against schema
            try:
                validate(instance=doc, schema=self.schemas[schema_name])
            except ValidationError as e:
                errors.append(f"Schema validation: {e.message}")

            # Apply policy checks
            policy_errors, policy_warnings = self._check_policies(doc, file_path)
            errors.extend(policy_errors)
            warnings.extend(policy_warnings)

            # Calculate metrics
            metrics = self._calculate_metrics(doc, file_path)

        except Exception as e:
            errors.append(f"Parse error: {str(e)}")

        return ValidationResult(
            file_path=file_path,
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            metrics=metrics
        )

    def _check_policies(self, doc: Dict, file_path: Path) -> Tuple[List[str], List[str]]:
        """Check document against policy rules."""
        errors = []
        warnings = []

        # Check heading hierarchy
        sections = doc['content']['sections']
        prev_level = 0
        for section in sections:
            level = section['level']
            if level > prev_level + 1:
                warnings.append(f"Heading hierarchy skip: {section['heading']}")
            prev_level = level

        # Check token counts
        for section in sections:
            token_count = section.get('token_count', 0)
            if token_count < 150:
                warnings.append(f"Section too short ({token_count} tokens): {section['heading']}")
            elif token_count > 1000:
                warnings.append(f"Section too long ({token_count} tokens): {section['heading']}")

        # Check freshness
        updated = datetime.strptime(doc['metadata']['updated'], '%Y-%m-%d')
        days_old = (datetime.now() - updated).days
        if days_old > 90:
            warnings.append(f"Document is {days_old} days old")
        elif days_old > 180:
            errors.append(f"Document is severely outdated ({days_old} days)")

        # Check for required sections based on type
        doc_type = doc['metadata']['type']
        headings = {s['heading'].lower() for s in sections}

        if doc_type == 'api':
            required = {'authentication', 'endpoints', 'errors'}
            missing = required - headings
            if missing:
                errors.append(f"Missing required sections for API doc: {missing}")

        return errors, warnings

    def _calculate_metrics(self, doc: Dict, file_path: Path) -> Dict[str, Any]:
        """Calculate document quality metrics."""
        content = doc['content']
        sections = content['sections']

        # Calculate completeness
        has_summary = len(content.get('summary', '')) > 50
        has_sections = len(sections) > 0
        has_metadata = all(doc['metadata'].get(k) for k in ['title', 'type', 'version'])
        completeness = sum([has_summary, has_sections, has_metadata]) / 3 * 100

        # Calculate structure score
        proper_hierarchy = all(
            sections[i]['level'] <= sections[i-1]['level'] + 1
            for i in range(1, len(sections))
        ) if len(sections) > 1 else True
        structure_score = 100 if proper_hierarchy else 50

        # Calculate freshness
        updated = datetime.strptime(doc['metadata']['updated'], '%Y-%m-%d')
        days_old = (datetime.now() - updated).days
        freshness = max(0, 100 - days_old)

        return {
            'completeness': completeness,
            'structure_score': structure_score,
            'freshness': freshness,
            'section_count': len(sections),
            'total_tokens': sum(s.get('token_count', 0) for s in sections),
            'relationship_count': sum(
                len(v) if isinstance(v, list) else 0
                for v in doc.get('relationships', {}).values()
            )
        }

    def validate_all(self) -> List[ValidationResult]:
        """Validate all documentation files."""
        results = []

        for md_file in self.docs_dir.rglob("*.md"):
            # Skip non-documentation files
            if any(skip in str(md_file) for skip in ['node_modules', '.git', 'dist']):
                continue

            result = self.validate_document(md_file)
            results.append(result)

        return results


def print_results(results: List[ValidationResult]):
    """Print validation results."""
    total = len(results)
    valid = sum(1 for r in results if r.is_valid)

    print(f"\n{'='*60}")
    print(f"Documentation Validation Report")
    print(f"{'='*60}")
    print(f"Total documents: {total}")
    print(f"Valid documents: {valid}")
    print(f"Invalid documents: {total - valid}")
    print(f"Success rate: {valid/total*100:.1f}%")

    if any(not r.is_valid for r in results):
        print(f"\n{'='*60}")
        print("Validation Errors:")
        print(f"{'='*60}")

        for result in results:
            if not result.is_valid:
                print(f"\n{result.file_path.relative_to(Path.cwd())}:")
                for error in result.errors:
                    print(f"  ❌ {error}")
                for warning in result.warnings:
                    print(f"  ⚠️  {warning}")

    # Print metrics summary
    print(f"\n{'='*60}")
    print("Quality Metrics Summary:")
    print(f"{'='*60}")

    avg_completeness = sum(r.metrics.get('completeness', 0) for r in results) / total
    avg_structure = sum(r.metrics.get('structure_score', 0) for r in results) / total
    avg_freshness = sum(r.metrics.get('freshness', 0) for r in results) / total

    print(f"Average completeness: {avg_completeness:.1f}%")
    print(f"Average structure score: {avg_structure:.1f}%")
    print(f"Average freshness: {avg_freshness:.1f}%")


def main():
    """Main validation function."""
    project_root = Path(__file__).parent.parent
    schema_dir = project_root / "docs" / "schemas"
    docs_dir = project_root / "docs"

    if not schema_dir.exists():
        print(f"Error: Schema directory not found: {schema_dir}")
        sys.exit(1)

    validator = DocumentValidator(schema_dir, docs_dir)
    results = validator.validate_all()

    print_results(results)

    # Exit with error code if validation failed
    if any(not r.is_valid for r in results):
        sys.exit(1)


if __name__ == "__main__":
    main()