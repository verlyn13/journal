#!/usr/bin/env python3
"""
Documentation coverage checker for Journal application.
Analyzes documentation completeness and identifies gaps.
"""

import json
import sys
from pathlib import Path
from typing import Any, Dict
from collections import defaultdict
from datetime import datetime
import yaml

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))


class DocumentationCoverageChecker:
    """Checks documentation coverage across the codebase."""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.docs_dir = project_root / "docs"
        self.apps_dir = project_root / "apps"
        self.coverage_data = {
            "summary": {},
            "by_type": defaultdict(list),
            "missing": defaultdict(list),
            "incomplete": defaultdict(list),
            "outdated": defaultdict(list),
        }

    def check_coverage(self) -> Dict[str, Any]:
        """Perform comprehensive coverage check."""
        # Check documentation types
        self._check_doc_types()

        # Check API documentation coverage
        self._check_api_coverage()

        # Check component documentation
        self._check_component_coverage()

        # Check frontmatter completeness
        self._check_frontmatter_completeness()

        # Check required sections by type
        self._check_required_sections()

        # Check freshness
        self._check_freshness()

        # Calculate summary metrics
        self._calculate_summary()

        return self.coverage_data

    def _check_doc_types(self):
        """Check coverage by documentation type."""
        expected_types = {
            "api": ["auth", "entries", "admin", "stats", "webauthn"],
            "architecture": ["overview", "security", "database", "components"],
            "deployment": ["vercel", "supabase", "ci-cd", "monitoring"],
            "guides": ["getting-started", "development", "troubleshooting"],
            "testing": ["unit", "integration", "e2e", "coverage"],
            "reference": ["configuration", "cli", "errors"],
        }

        for doc_type, expected_topics in expected_types.items():
            found_topics = set()
            doc_type_path = self.docs_dir / doc_type

            if doc_type_path.exists():
                for md_file in doc_type_path.rglob("*.md"):
                    topic = md_file.stem.lower()
                    found_topics.add(topic)
                    self.coverage_data["by_type"][doc_type].append(
                        {
                            "file": str(md_file.relative_to(self.project_root)),
                            "topic": topic,
                        }
                    )

            missing = set(expected_topics) - found_topics
            if missing:
                self.coverage_data["missing"][doc_type] = list(missing)

    def _check_api_coverage(self):
        """Check API endpoint documentation coverage."""
        api_dir = self.apps_dir / "api" / "app" / "api" / "v1"
        documented_endpoints = set()
        undocumented_endpoints = []

        # Find all API route files
        if api_dir.exists():
            for py_file in api_dir.glob("*.py"):
                if py_file.stem == "__init__":
                    continue

                # Check if corresponding docs exist
                doc_file = self.docs_dir / "api" / "v1" / f"{py_file.stem}.md"
                if doc_file.exists():
                    documented_endpoints.add(py_file.stem)
                else:
                    undocumented_endpoints.append(py_file.stem)

        self.coverage_data["api_coverage"] = {
            "documented": list(documented_endpoints),
            "undocumented": undocumented_endpoints,
            "percentage": len(documented_endpoints)
            / (len(documented_endpoints) + len(undocumented_endpoints))
            * 100
            if documented_endpoints or undocumented_endpoints
            else 0,
        }

    def _check_component_coverage(self):
        """Check React component documentation coverage."""
        web_dir = self.apps_dir / "web" / "src" / "components"
        documented_components = set()
        undocumented_components = []

        if web_dir.exists():
            for tsx_file in web_dir.rglob("*.tsx"):
                # Skip test files and index files
                if "test" in tsx_file.stem or tsx_file.stem == "index":
                    continue

                component_name = tsx_file.stem
                # Check for component documentation
                doc_patterns = [
                    self.docs_dir / "guides" / "components" / f"{component_name}.md",
                    self.docs_dir / "reference" / "components" / f"{component_name}.md",
                ]

                if any(p.exists() for p in doc_patterns):
                    documented_components.add(component_name)
                else:
                    undocumented_components.append(component_name)

        self.coverage_data["component_coverage"] = {
            "documented": list(documented_components),
            "undocumented": undocumented_components,
            "percentage": len(documented_components)
            / (len(documented_components) + len(undocumented_components))
            * 100
            if documented_components or undocumented_components
            else 0,
        }

    def _check_frontmatter_completeness(self):
        """Check completeness of frontmatter in documentation files."""
        required_fields = {"title", "type", "version", "created", "updated", "author"}
        optional_fields = {"tags", "priority", "status", "reviewers"}

        for md_file in self.docs_dir.rglob("*.md"):
            # Skip generated files
            if "_generated" in str(md_file):
                continue

            with open(md_file, "r", encoding="utf-8") as f:
                content = f.read()

            frontmatter = {}
            if content.startswith("---"):
                parts = content.split("---", 2)
                if len(parts) >= 3:
                    try:
                        frontmatter = yaml.safe_load(parts[1]) or {}
                    except yaml.YAMLError:
                        frontmatter = {}

            missing_required = required_fields - set(frontmatter.keys())
            missing_optional = optional_fields - set(frontmatter.keys())

            if missing_required:
                self.coverage_data["incomplete"]["frontmatter"].append(
                    {
                        "file": str(md_file.relative_to(self.project_root)),
                        "missing_required": list(missing_required),
                        "missing_optional": list(missing_optional),
                    }
                )

    def _check_required_sections(self):
        """Check for required sections based on document type."""
        type_requirements = {
            "api": ["Authentication", "Endpoints", "Errors", "Rate Limiting"],
            "architecture": ["Overview", "Components", "Data Flow", "Security"],
            "deployment": ["Prerequisites", "Setup", "Configuration", "Verification"],
            "guide": ["Introduction", "Prerequisites", "Steps", "Troubleshooting"],
            "testing": ["Strategy", "Setup", "Execution", "Coverage"],
        }

        for md_file in self.docs_dir.rglob("*.md"):
            if "_generated" in str(md_file):
                continue

            # Determine document type from path or frontmatter
            doc_type = self._get_doc_type(md_file)
            if doc_type not in type_requirements:
                continue

            with open(md_file, "r", encoding="utf-8") as f:
                content = f.read().lower()

            required_sections = type_requirements[doc_type]
            missing_sections = []

            for section in required_sections:
                # Check if section heading exists
                if (
                    f"# {section.lower()}" not in content
                    and f"## {section.lower()}" not in content
                ):
                    missing_sections.append(section)

            if missing_sections:
                self.coverage_data["incomplete"]["sections"].append(
                    {
                        "file": str(md_file.relative_to(self.project_root)),
                        "type": doc_type,
                        "missing_sections": missing_sections,
                    }
                )

    def _check_freshness(self):
        """Check documentation freshness based on last update date."""
        freshness_thresholds = {
            "api": 30,  # API docs should be updated within 30 days
            "deployment": 30,
            "security": 30,
            "architecture": 60,
            "guide": 90,
            "reference": 90,
            "testing": 90,
        }

        current_date = datetime.now()

        for md_file in self.docs_dir.rglob("*.md"):
            if "_generated" in str(md_file):
                continue

            # Get file modification time
            stat = md_file.stat()
            last_modified = datetime.fromtimestamp(stat.st_mtime)
            days_old = (current_date - last_modified).days

            # Check frontmatter for updated date
            with open(md_file, "r", encoding="utf-8") as f:
                content = f.read()

            if content.startswith("---"):
                parts = content.split("---", 2)
                if len(parts) >= 3:
                    try:
                        frontmatter = yaml.safe_load(parts[1]) or {}
                        if "updated" in frontmatter:
                            updated_date = datetime.strptime(
                                frontmatter["updated"], "%Y-%m-%d"
                            )
                            days_old = (current_date - updated_date).days
                    except (yaml.YAMLError, ValueError):
                        pass

            # Determine threshold based on document type
            doc_type = self._get_doc_type(md_file)
            threshold = freshness_thresholds.get(doc_type, 90)

            if days_old > threshold:
                self.coverage_data["outdated"][doc_type].append(
                    {
                        "file": str(md_file.relative_to(self.project_root)),
                        "days_old": days_old,
                        "threshold": threshold,
                    }
                )

    def _get_doc_type(self, file_path: Path) -> str:
        """Determine document type from file path."""
        path_str = str(file_path).lower()

        if "api" in path_str:
            return "api"
        elif "security" in path_str or "auth" in path_str:
            return "security"
        elif "deploy" in path_str:
            return "deployment"
        elif "architecture" in path_str or "design" in path_str:
            return "architecture"
        elif "guide" in path_str or "tutorial" in path_str:
            return "guide"
        elif "test" in path_str:
            return "testing"
        else:
            return "reference"

    def _calculate_summary(self):
        """Calculate summary metrics."""
        total_docs = sum(
            len(files)
            for files in self.docs_dir.rglob("*.md")
            if "_generated" not in str(files)
        )

        incomplete_count = sum(
            len(items) for items in self.coverage_data["incomplete"].values()
        )
        outdated_count = sum(
            len(items) for items in self.coverage_data["outdated"].values()
        )
        missing_count = sum(
            len(items) for items in self.coverage_data["missing"].values()
        )

        self.coverage_data["summary"] = {
            "total_documents": total_docs,
            "incomplete_documents": incomplete_count,
            "outdated_documents": outdated_count,
            "missing_topics": missing_count,
            "api_coverage": self.coverage_data.get("api_coverage", {}).get(
                "percentage", 0
            ),
            "component_coverage": self.coverage_data.get("component_coverage", {}).get(
                "percentage", 0
            ),
            "overall_health": max(
                0, 100 - (incomplete_count + outdated_count + missing_count) * 2
            ),
        }


def print_coverage_report(coverage_data: Dict[str, Any]):
    """Print coverage report to console."""
    summary = coverage_data["summary"]

    print("\n" + "=" * 60)
    print("Documentation Coverage Report")
    print("=" * 60)

    print("\n📊 Summary:")
    print(f"  Total documents: {summary['total_documents']}")
    print(f"  Incomplete documents: {summary['incomplete_documents']}")
    print(f"  Outdated documents: {summary['outdated_documents']}")
    print(f"  Missing topics: {summary['missing_topics']}")
    print(f"  Overall health: {summary['overall_health']:.1f}%")

    print(f"\n🔌 API Coverage: {summary['api_coverage']:.1f}%")
    if coverage_data.get("api_coverage", {}).get("undocumented"):
        print("  Undocumented endpoints:")
        for endpoint in coverage_data["api_coverage"]["undocumented"]:
            print(f"    - {endpoint}")

    print(f"\n🧩 Component Coverage: {summary['component_coverage']:.1f}%")
    if coverage_data.get("component_coverage", {}).get("undocumented")[
        :5
    ]:  # Show first 5
        print("  Undocumented components (first 5):")
        for component in coverage_data["component_coverage"]["undocumented"][:5]:
            print(f"    - {component}")

    if coverage_data["missing"]:
        print("\n❌ Missing Documentation Topics:")
        for doc_type, topics in coverage_data["missing"].items():
            if topics:
                print(f"  {doc_type}:")
                for topic in topics:
                    print(f"    - {topic}")

    if coverage_data["incomplete"].get("frontmatter"):
        print(
            f"\n⚠️ Documents with Incomplete Frontmatter: {len(coverage_data['incomplete']['frontmatter'])}"
        )
        for item in coverage_data["incomplete"]["frontmatter"][:3]:  # Show first 3
            print(f"  - {item['file']}")
            print(f"    Missing: {', '.join(item['missing_required'])}")

    if coverage_data["outdated"]:
        print("\n🕰️ Outdated Documents:")
        for doc_type, files in coverage_data["outdated"].items():
            if files:
                print(f"  {doc_type}:")
                for file_info in files[:2]:  # Show first 2 per type
                    print(
                        f"    - {file_info['file']} ({file_info['days_old']} days old)"
                    )

    # Save detailed report as JSON
    report_dir = Path.cwd() / "docs" / "_generated" / "reports"
    report_dir.mkdir(parents=True, exist_ok=True)

    report_file = report_dir / "coverage_report.json"
    with open(report_file, "w") as f:
        json.dump(coverage_data, f, indent=2, default=str)

    print(f"\n✅ Detailed report saved to: {report_file.relative_to(Path.cwd())}")


def main():
    """Main function."""
    project_root = Path(__file__).parent.parent
    checker = DocumentationCoverageChecker(project_root)

    print("Checking documentation coverage...")
    coverage_data = checker.check_coverage()

    print_coverage_report(coverage_data)

    # Exit with error if coverage is below threshold
    if coverage_data["summary"]["overall_health"] < 70:
        print("\n❌ Coverage below threshold (70%)")
        sys.exit(1)


if __name__ == "__main__":
    main()
