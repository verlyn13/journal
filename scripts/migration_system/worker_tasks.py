#!/usr/bin/env python3
"""
Worker task definitions for the documentation migration system.
Defines all tasks that can be executed by the worker pool.
"""

from dataclasses import dataclass, field
from datetime import datetime
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
from typing import Any, Dict, List, Optional

import yaml


# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))


@dataclass
class TaskResult:
    """Result of a task execution."""

    success: bool
    task_id: str
    output: Any = None
    error: Optional[str] = None
    metrics: Dict[str, Any] = field(default_factory=dict)
    files_affected: List[str] = field(default_factory=list)


class WorkerTaskLibrary:
    """Library of all available worker tasks."""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.docs_dir = project_root / "docs"
        self.scripts_dir = project_root / "scripts"
        self.reports_dir = project_root / "docs" / "_generated" / "reports"

        # Ensure directories exist
        self.reports_dir.mkdir(parents=True, exist_ok=True)

    # ==================== STRUCTURE TASKS ====================

    def task_backup_docs(self, task_id: str, **kwargs) -> TaskResult:
        """Create backup of documentation directory."""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_dir = self.project_root / f"docs.backup.{timestamp}"

            shutil.copytree(self.docs_dir, backup_dir)

            file_count = sum(1 for _ in backup_dir.rglob("*.md"))

            return TaskResult(
                success=True,
                task_id=task_id,
                output={"backup_path": str(backup_dir)},
                metrics={"files_backed_up": file_count},
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    def task_analyze_structure(self, task_id: str, **kwargs) -> TaskResult:
        """Analyze current documentation structure."""
        try:
            structure = {}
            total_files = 0

            for md_file in self.docs_dir.rglob("*.md"):
                rel_path = md_file.relative_to(self.docs_dir)
                parts = rel_path.parts

                current = structure
                for part in parts[:-1]:
                    if part not in current:
                        current[part] = {}
                    current = current[part]

                if "_files" not in current:
                    current["_files"] = []
                current["_files"].append(parts[-1])
                total_files += 1

            # Save analysis
            analysis_file = self.reports_dir / "structure_analysis.json"
            with open(analysis_file, "w") as f:
                json.dump(
                    {
                        "structure": structure,
                        "total_files": total_files,
                        "timestamp": datetime.now().isoformat(),
                    },
                    f,
                    indent=2,
                )

            return TaskResult(
                success=True,
                task_id=task_id,
                output={"analysis_file": str(analysis_file)},
                metrics={"total_files": total_files, "directories": len(structure)},
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    def task_reorganize_docs(
        self, task_id: str, dry_run: bool = True, **kwargs
    ) -> TaskResult:
        """Execute documentation reorganization."""
        try:
            script_path = self.scripts_dir / "reorganize_docs.py"

            if not script_path.exists():
                return TaskResult(
                    success=False,
                    task_id=task_id,
                    error=f"Script not found: {script_path}",
                )

            cmd = ["python", str(script_path)]
            if dry_run:
                cmd.append("--dry-run")
            else:
                cmd.append("--execute")

            result = subprocess.run(
                cmd, capture_output=True, text=True, cwd=self.project_root
            )

            if result.returncode != 0:
                return TaskResult(success=False, task_id=task_id, error=result.stderr)

            # Parse output for metrics
            operations = []
            if "operations:" in result.stdout:
                for line in result.stdout.split("\n"):
                    if "->" in line:
                        operations.append(line.strip())

            return TaskResult(
                success=True,
                task_id=task_id,
                output={"operations": operations},
                metrics={"operations_count": len(operations), "dry_run": dry_run},
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    def task_generate_redirects(self, task_id: str, **kwargs) -> TaskResult:
        """Generate redirect mappings for moved files."""
        try:
            redirects = {}

            # Read move operations from reorganize output
            operations_file = self.reports_dir / "reorganize_operations.json"
            if operations_file.exists():
                with open(operations_file) as f:
                    operations = json.load(f)
                    for op in operations.get("moves", []):
                        old_path = op["from"].replace(str(self.docs_dir) + "/", "")
                        new_path = op["to"].replace(str(self.docs_dir) + "/", "")
                        redirects[old_path] = new_path

            # Save redirects
            redirects_file = self.docs_dir / "_redirects.json"
            with open(redirects_file, "w") as f:
                json.dump(redirects, f, indent=2)

            return TaskResult(
                success=True,
                task_id=task_id,
                output={"redirects_file": str(redirects_file)},
                metrics={"redirects_count": len(redirects)},
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    # ==================== METADATA TASKS ====================

    def task_scan_frontmatter(self, task_id: str, **kwargs) -> TaskResult:
        """Scan for existing frontmatter in documents."""
        try:
            has_frontmatter = []
            missing_frontmatter = []

            for md_file in self.docs_dir.rglob("*.md"):
                with open(md_file, "r", encoding="utf-8") as f:
                    first_line = f.readline().strip()
                    if first_line == "---":
                        has_frontmatter.append(str(md_file))
                    else:
                        missing_frontmatter.append(str(md_file))

            # Save results
            scan_file = self.reports_dir / "frontmatter_scan.json"
            with open(scan_file, "w") as f:
                json.dump(
                    {
                        "has_frontmatter": has_frontmatter,
                        "missing_frontmatter": missing_frontmatter,
                        "timestamp": datetime.now().isoformat(),
                    },
                    f,
                    indent=2,
                )

            return TaskResult(
                success=True,
                task_id=task_id,
                output={"scan_file": str(scan_file)},
                metrics={
                    "with_frontmatter": len(has_frontmatter),
                    "without_frontmatter": len(missing_frontmatter),
                },
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    def task_generate_frontmatter_batch(
        self, task_id: str, batch_files: List[str], **kwargs
    ) -> TaskResult:
        """Generate frontmatter for a batch of files."""
        try:
            processed = []
            errors = []

            for file_path in batch_files:
                path = Path(file_path)
                if not path.exists():
                    errors.append(f"File not found: {file_path}")
                    continue

                try:
                    # Generate metadata
                    metadata = self._generate_metadata_for_file(path)

                    # Read existing content
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read()

                    # Skip if already has frontmatter
                    if content.startswith("---"):
                        continue

                    # Add frontmatter
                    frontmatter = yaml.dump(
                        metadata, default_flow_style=False, sort_keys=False
                    )
                    new_content = f"---\n{frontmatter}---\n\n{content}"

                    # Write back
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(new_content)

                    processed.append(file_path)

                except Exception as e:
                    errors.append(f"{file_path}: {str(e)}")

            return TaskResult(
                success=len(errors) == 0,
                task_id=task_id,
                output={"processed": processed, "errors": errors},
                metrics={"processed_count": len(processed), "error_count": len(errors)},
                files_affected=processed,
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    def _generate_metadata_for_file(self, file_path: Path) -> Dict:
        """Generate metadata for a single file."""
        file_path.relative_to(self.docs_dir)

        # Read content
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract title
        title = "Untitled"
        h1_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
        if h1_match:
            title = h1_match.group(1).strip()
        else:
            title = file_path.stem.replace("-", " ").replace("_", " ").title()

        # Determine type
        doc_type = self._determine_doc_type(file_path, content)

        # Generate tags
        tags = self._generate_tags(file_path, content, doc_type)

        # Get file stats
        stat = file_path.stat()
        created = datetime.fromtimestamp(stat.st_ctime).strftime("%Y-%m-%d")
        updated = datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d")

        return {
            "id": file_path.stem.lower().replace("_", "-").replace(" ", "-"),
            "title": title,
            "type": doc_type,
            "version": "1.0.0",
            "created": created,
            "updated": updated,
            "author": "Journal Team",
            "tags": tags,
            "priority": self._determine_priority(file_path, doc_type),
            "status": "draft" if "TODO" in content or "WIP" in content else "approved",
            "visibility": "internal",
            "schema_version": "v1",
        }

    def _determine_doc_type(self, file_path: Path, content: str) -> str:
        """Determine document type."""
        path_str = str(file_path).lower()
        content_lower = content.lower()

        if "api" in path_str or "endpoint" in content_lower:
            return "api"
        elif "architecture" in path_str or "design" in path_str:
            return "architecture"
        elif "deploy" in path_str:
            return "deployment"
        elif "guide" in path_str or "tutorial" in content_lower:
            return "guide"
        elif "test" in path_str:
            return "testing"
        else:
            return "reference"

    def _generate_tags(self, file_path: Path, content: str, doc_type: str) -> List[str]:
        """Generate appropriate tags."""
        tags = [doc_type]
        content_lower = content.lower()

        # Technology tags
        if "fastapi" in content_lower:
            tags.append("fastapi")
        if "react" in content_lower:
            tags.append("react")
        if "typescript" in content_lower:
            tags.append("typescript")
        if "python" in content_lower:
            tags.append("python")
        if "docker" in content_lower:
            tags.append("docker")

        return list(set(tags))[:10]  # Limit to 10 tags

    def _determine_priority(self, file_path: Path, doc_type: str) -> str:
        """Determine document priority."""
        path_str = str(file_path).lower()

        if "deploy" in path_str or "security" in path_str:
            return "critical"
        elif doc_type in ["api", "architecture"]:
            return "high"
        else:
            return "medium"

    # ==================== VALIDATION TASKS ====================

    def task_validate_schema(
        self, task_id: str, file_path: str, **kwargs
    ) -> TaskResult:
        """Validate a document against its schema."""
        try:
            script_path = self.scripts_dir / "validate_docs.py"

            result = subprocess.run(
                ["python", str(script_path), "--file", file_path],
                capture_output=True,
                text=True,
                cwd=self.project_root,
            )

            success = result.returncode == 0

            return TaskResult(
                success=success,
                task_id=task_id,
                output={"validation_output": result.stdout},
                error=result.stderr if not success else None,
                files_affected=[file_path],
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    def task_check_freshness(self, task_id: str, **kwargs) -> TaskResult:
        """Check document freshness against SLAs."""
        try:
            stale_docs = []
            fresh_docs = []

            # Load taxonomy for SLAs
            taxonomy_file = self.docs_dir / "taxonomy.yaml"
            freshness_slas = {}

            if taxonomy_file.exists():
                with open(taxonomy_file) as f:
                    taxonomy = yaml.safe_load(f)
                    freshness_slas = taxonomy.get("freshness_slas", {})

            for md_file in self.docs_dir.rglob("*.md"):
                stat = md_file.stat()
                days_old = (datetime.now() - datetime.fromtimestamp(stat.st_mtime)).days

                # Determine document type for SLA
                doc_type = self._determine_doc_type(md_file, "")
                max_days = freshness_slas.get(doc_type, 180)

                if days_old > max_days:
                    stale_docs.append(
                        {
                            "path": str(md_file),
                            "days_old": days_old,
                            "max_days": max_days,
                        }
                    )
                else:
                    fresh_docs.append(str(md_file))

            # Save report
            freshness_file = self.reports_dir / "freshness_report.json"
            with open(freshness_file, "w") as f:
                json.dump(
                    {
                        "stale_docs": stale_docs,
                        "fresh_docs_count": len(fresh_docs),
                        "timestamp": datetime.now().isoformat(),
                    },
                    f,
                    indent=2,
                )

            return TaskResult(
                success=True,
                task_id=task_id,
                output={"report_file": str(freshness_file)},
                metrics={
                    "stale_count": len(stale_docs),
                    "fresh_count": len(fresh_docs),
                },
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    # ==================== API TASKS ====================

    def task_extract_openapi(self, task_id: str, **kwargs) -> TaskResult:
        """Extract OpenAPI specification from FastAPI app."""
        try:
            script_path = self.scripts_dir / "extract_openapi.py"
            output_file = self.docs_dir / "api" / "openapi.json"

            # Ensure output directory exists
            output_file.parent.mkdir(parents=True, exist_ok=True)

            # Create extraction script if it doesn't exist
            if not script_path.exists():
                script_content = """#!/usr/bin/env python3
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "apps" / "api"))

from app.main import app

# Extract OpenAPI spec
openapi_spec = app.openapi()

# Save to file
output_file = Path(__file__).parent.parent / "docs" / "api" / "openapi.json"
output_file.parent.mkdir(parents=True, exist_ok=True)

with open(output_file, 'w') as f:
    json.dump(openapi_spec, f, indent=2)

print(f"OpenAPI spec saved to {output_file}")
"""
                with open(script_path, "w") as f:
                    f.write(script_content)
                script_path.chmod(0o755)

            result = subprocess.run(
                ["python", str(script_path)],
                capture_output=True,
                text=True,
                cwd=self.project_root,
            )

            if result.returncode != 0:
                return TaskResult(success=False, task_id=task_id, error=result.stderr)

            # Count endpoints
            endpoint_count = 0
            if output_file.exists():
                with open(output_file) as f:
                    spec = json.load(f)
                    endpoint_count = len(spec.get("paths", {}))

            return TaskResult(
                success=True,
                task_id=task_id,
                output={"openapi_file": str(output_file)},
                metrics={"endpoint_count": endpoint_count},
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    def task_generate_api_docs(self, task_id: str, **kwargs) -> TaskResult:
        """Generate API documentation from OpenAPI spec."""
        try:
            script_path = self.scripts_dir / "generate_api_docs.py"

            if not script_path.exists():
                return TaskResult(
                    success=False,
                    task_id=task_id,
                    error=f"Script not found: {script_path}",
                )

            result = subprocess.run(
                ["python", str(script_path)],
                capture_output=True,
                text=True,
                cwd=self.project_root,
            )

            if result.returncode != 0:
                return TaskResult(success=False, task_id=task_id, error=result.stderr)

            # Count generated files
            api_docs_dir = self.docs_dir / "api" / "endpoints"
            generated_files = (
                list(api_docs_dir.glob("*.md")) if api_docs_dir.exists() else []
            )

            return TaskResult(
                success=True,
                task_id=task_id,
                output={"generated_files": [str(f) for f in generated_files]},
                metrics={"files_generated": len(generated_files)},
                files_affected=[str(f) for f in generated_files],
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    # ==================== LINK TASKS ====================

    def task_scan_links(self, task_id: str, **kwargs) -> TaskResult:
        """Scan all documents for internal and external links."""
        try:
            internal_links = []
            external_links = []
            broken_links = []

            link_pattern = re.compile(r"\[([^\]]+)\]\(([^\)]+)\)")

            for md_file in self.docs_dir.rglob("*.md"):
                with open(md_file, "r", encoding="utf-8") as f:
                    content = f.read()

                for match in link_pattern.finditer(content):
                    link_text = match.group(1)
                    link_url = match.group(2)

                    link_info = {
                        "file": str(md_file),
                        "text": link_text,
                        "url": link_url,
                    }

                    if link_url.startswith(("http://", "https://")):
                        external_links.append(link_info)
                    else:
                        internal_links.append(link_info)

                        # Check if internal link is valid
                        if not link_url.startswith("#"):
                            target_path = (md_file.parent / link_url).resolve()
                            if not target_path.exists():
                                broken_links.append(link_info)

            # Save report
            links_file = self.reports_dir / "links_report.json"
            with open(links_file, "w") as f:
                json.dump(
                    {
                        "internal_links": internal_links,
                        "external_links": external_links,
                        "broken_links": broken_links,
                        "timestamp": datetime.now().isoformat(),
                    },
                    f,
                    indent=2,
                )

            return TaskResult(
                success=True,
                task_id=task_id,
                output={"report_file": str(links_file)},
                metrics={
                    "internal_count": len(internal_links),
                    "external_count": len(external_links),
                    "broken_count": len(broken_links),
                },
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    def task_fix_internal_links(self, task_id: str, **kwargs) -> TaskResult:
        """Fix broken internal links based on redirect mappings."""
        try:
            fixed_links = []
            redirects_file = self.docs_dir / "_redirects.json"

            if not redirects_file.exists():
                return TaskResult(
                    success=True,
                    task_id=task_id,
                    output={"message": "No redirects file found"},
                    metrics={"fixed_count": 0},
                )

            with open(redirects_file) as f:
                redirects = json.load(f)

            link_pattern = re.compile(r"\[([^\]]+)\]\(([^\)]+)\)")

            for md_file in self.docs_dir.rglob("*.md"):
                content_changed = False
                with open(md_file, "r", encoding="utf-8") as f:
                    content = f.read()

                def replace_link(match):
                    nonlocal content_changed
                    link_text = match.group(1)
                    link_url = match.group(2)

                    # Check if this link needs to be updated
                    for old_path, new_path in redirects.items():
                        if link_url.endswith(old_path):
                            new_url = link_url.replace(old_path, new_path)
                            content_changed = True
                            fixed_links.append(
                                {"file": str(md_file), "old": link_url, "new": new_url}
                            )
                            return f"[{link_text}]({new_url})"

                    return match.group(0)

                new_content = link_pattern.sub(replace_link, content)

                if content_changed:
                    with open(md_file, "w", encoding="utf-8") as f:
                        f.write(new_content)

            return TaskResult(
                success=True,
                task_id=task_id,
                output={"fixed_links": fixed_links},
                metrics={"fixed_count": len(fixed_links)},
                files_affected=list(set(link["file"] for link in fixed_links)),
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    # ==================== SECURITY TASKS ====================

    def task_scan_secrets(self, task_id: str, **kwargs) -> TaskResult:
        """Scan documents for potential secrets and sensitive data."""
        try:
            script_path = self.scripts_dir / "anonymize_docs.py"

            result = subprocess.run(
                ["python", str(script_path), "--scan"],
                capture_output=True,
                text=True,
                cwd=self.project_root,
            )

            # Parse output for secrets found
            secrets_found = []
            if "potential secrets found" in result.stdout:
                # Extract secrets info from output
                for line in result.stdout.split("\n"):
                    if "File:" in line or "Pattern:" in line:
                        secrets_found.append(line.strip())

            return TaskResult(
                success=result.returncode == 0,
                task_id=task_id,
                output={"scan_output": result.stdout},
                metrics={
                    "secrets_found": len(secrets_found) // 2
                },  # Divide by 2 for file/pattern pairs
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    def task_anonymize_sensitive(self, task_id: str, **kwargs) -> TaskResult:
        """Anonymize sensitive data in documents."""
        try:
            script_path = self.scripts_dir / "anonymize_docs.py"

            result = subprocess.run(
                ["python", str(script_path), "--execute"],
                capture_output=True,
                text=True,
                cwd=self.project_root,
            )

            # Parse output for anonymized files
            anonymized_files = []
            if "Anonymized" in result.stdout:
                for line in result.stdout.split("\n"):
                    if ".md" in line and "Anonymized" in line:
                        # Extract file path from output
                        parts = line.split()
                        for part in parts:
                            if ".md" in part:
                                anonymized_files.append(part)
                                break

            return TaskResult(
                success=result.returncode == 0,
                task_id=task_id,
                output={"anonymized_files": anonymized_files},
                metrics={"files_anonymized": len(anonymized_files)},
                files_affected=anonymized_files,
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    # ==================== QUALITY TASKS ====================

    def task_analyze_quality(self, task_id: str, **kwargs) -> TaskResult:
        """Analyze overall documentation quality."""
        try:
            quality_metrics = {
                "total_files": 0,
                "avg_word_count": 0,
                "missing_sections": [],
                "code_blocks_without_language": [],
                "images_without_alt": [],
                "long_documents": [],
            }

            total_words = 0

            for md_file in self.docs_dir.rglob("*.md"):
                quality_metrics["total_files"] += 1

                with open(md_file, "r", encoding="utf-8") as f:
                    content = f.read()

                # Word count
                word_count = len(content.split())
                total_words += word_count

                if word_count > 5000:
                    quality_metrics["long_documents"].append(str(md_file))

                # Check for code blocks without language
                code_blocks = re.findall(r"```\n", content)
                if code_blocks:
                    quality_metrics["code_blocks_without_language"].append(str(md_file))

                # Check for images without alt text
                images = re.findall(r"!\[\]\(", content)
                if images:
                    quality_metrics["images_without_alt"].append(str(md_file))

                # Check for missing sections (simplified)
                if "## Overview" not in content and quality_metrics["total_files"] < 50:
                    quality_metrics["missing_sections"].append(
                        {"file": str(md_file), "missing": "Overview section"}
                    )

            if quality_metrics["total_files"] > 0:
                quality_metrics["avg_word_count"] = (
                    total_words // quality_metrics["total_files"]
                )

            # Save report
            quality_file = self.reports_dir / "quality_report.json"
            with open(quality_file, "w") as f:
                json.dump(quality_metrics, f, indent=2)

            return TaskResult(
                success=True,
                task_id=task_id,
                output={"report_file": str(quality_file)},
                metrics=quality_metrics,
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    def task_enhance_content(
        self, task_id: str, file_paths: List[str], **kwargs
    ) -> TaskResult:
        """Enhance content quality for specified files."""
        try:
            enhanced = []

            for file_path in file_paths:
                path = Path(file_path)
                if not path.exists():
                    continue

                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()

                original_content = content

                # Add language specifiers to code blocks
                content = re.sub(
                    r"```\n(.*?)\n```",
                    lambda m: f"```python\n{m.group(1)}\n```"
                    if "def " in m.group(1) or "import " in m.group(1)
                    else m.group(0),
                    content,
                    flags=re.DOTALL,
                )

                # Add alt text to images (placeholder)
                content = re.sub(
                    r"!\[\]\(([^)]+)\)",
                    lambda m: f"![{Path(m.group(1)).stem.replace('-', ' ').title()}]({m.group(1)})",
                    content,
                )

                if content != original_content:
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(content)
                    enhanced.append(file_path)

            return TaskResult(
                success=True,
                task_id=task_id,
                output={"enhanced_files": enhanced},
                metrics={"enhanced_count": len(enhanced)},
                files_affected=enhanced,
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    # ==================== REPORTING TASKS ====================

    def task_generate_index(self, task_id: str, **kwargs) -> TaskResult:
        """Generate documentation index."""
        try:
            script_path = self.scripts_dir / "generate_doc_index.py"

            if not script_path.exists():
                return TaskResult(
                    success=False,
                    task_id=task_id,
                    error=f"Script not found: {script_path}",
                )

            result = subprocess.run(
                ["python", str(script_path)],
                capture_output=True,
                text=True,
                cwd=self.project_root,
            )

            if result.returncode != 0:
                return TaskResult(success=False, task_id=task_id, error=result.stderr)

            # Check if index was created
            index_file = self.docs_dir / "_generated" / "index.json"
            doc_count = 0

            if index_file.exists():
                with open(index_file) as f:
                    index = json.load(f)
                    doc_count = len(index.get("documents", []))

            return TaskResult(
                success=True,
                task_id=task_id,
                output={"index_file": str(index_file)},
                metrics={"documents_indexed": doc_count},
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    def task_generate_dashboard(self, task_id: str, **kwargs) -> TaskResult:
        """Generate documentation dashboard."""
        try:
            dashboard_file = self.docs_dir / "_generated" / "dashboard.html"
            dashboard_file.parent.mkdir(parents=True, exist_ok=True)

            # Collect metrics from various reports
            metrics = {
                "total_documents": 0,
                "with_frontmatter": 0,
                "validation_passed": 0,
                "broken_links": 0,
                "api_endpoints": 0,
                "last_updated": datetime.now().isoformat(),
            }

            # Read various reports to populate metrics
            frontmatter_scan = self.reports_dir / "frontmatter_scan.json"
            if frontmatter_scan.exists():
                with open(frontmatter_scan) as f:
                    data = json.load(f)
                    metrics["with_frontmatter"] = len(data.get("has_frontmatter", []))
                    metrics["total_documents"] = metrics["with_frontmatter"] + len(
                        data.get("missing_frontmatter", [])
                    )

            links_report = self.reports_dir / "links_report.json"
            if links_report.exists():
                with open(links_report) as f:
                    data = json.load(f)
                    metrics["broken_links"] = len(data.get("broken_links", []))

            # Generate simple HTML dashboard
            html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>Documentation Migration Dashboard</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 40px; }}
        h1 {{ color: #333; }}
        .metrics {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }}
        .metric {{ background: #f0f0f0; padding: 20px; border-radius: 8px; }}
        .metric h3 {{ margin-top: 0; color: #666; }}
        .metric .value {{ font-size: 2em; color: #333; }}
        .timestamp {{ color: #999; margin-top: 20px; }}
    </style>
</head>
<body>
    <h1>Documentation Migration Dashboard</h1>
    <div class="metrics">
        <div class="metric">
            <h3>Total Documents</h3>
            <div class="value">{metrics["total_documents"]}</div>
        </div>
        <div class="metric">
            <h3>With Frontmatter</h3>
            <div class="value">{metrics["with_frontmatter"]}</div>
        </div>
        <div class="metric">
            <h3>Broken Links</h3>
            <div class="value">{metrics["broken_links"]}</div>
        </div>
        <div class="metric">
            <h3>API Endpoints</h3>
            <div class="value">{metrics["api_endpoints"]}</div>
        </div>
        <div class="metric">
            <h3>Validation Passed</h3>
            <div class="value">{metrics["validation_passed"]}</div>
        </div>
        <div class="metric">
            <h3>Coverage</h3>
            <div class="value">{round(metrics["with_frontmatter"] / max(metrics["total_documents"], 1) * 100)}%</div>
        </div>
    </div>
    <div class="timestamp">Last updated: {metrics["last_updated"]}</div>
</body>
</html>"""

            with open(dashboard_file, "w") as f:
                f.write(html_content)

            return TaskResult(
                success=True,
                task_id=task_id,
                output={"dashboard_file": str(dashboard_file)},
                metrics=metrics,
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))

    def task_generate_final_report(self, task_id: str, **kwargs) -> TaskResult:
        """Generate comprehensive final report."""
        try:
            script_path = self.scripts_dir / "generate_doc_report.py"

            if not script_path.exists():
                return TaskResult(
                    success=False,
                    task_id=task_id,
                    error=f"Script not found: {script_path}",
                )

            result = subprocess.run(
                ["python", str(script_path)],
                capture_output=True,
                text=True,
                cwd=self.project_root,
            )

            if result.returncode != 0:
                return TaskResult(success=False, task_id=task_id, error=result.stderr)

            # Check report files
            html_report = self.docs_dir / "_generated" / "doc_report.html"
            json_report = self.docs_dir / "_generated" / "doc_report.json"

            reports_exist = html_report.exists() and json_report.exists()

            return TaskResult(
                success=reports_exist,
                task_id=task_id,
                output={
                    "html_report": str(html_report) if html_report.exists() else None,
                    "json_report": str(json_report) if json_report.exists() else None,
                },
                metrics={"reports_generated": 2 if reports_exist else 0},
            )
        except Exception as e:
            return TaskResult(success=False, task_id=task_id, error=str(e))


# Task registry mapping task types to methods
TASK_REGISTRY = {
    # Structure tasks
    "backup_docs": "task_backup_docs",
    "analyze_structure": "task_analyze_structure",
    "reorganize_docs": "task_reorganize_docs",
    "generate_redirects": "task_generate_redirects",
    # Metadata tasks
    "scan_frontmatter": "task_scan_frontmatter",
    "generate_frontmatter_batch": "task_generate_frontmatter_batch",
    # Validation tasks
    "validate_schema": "task_validate_schema",
    "check_freshness": "task_check_freshness",
    # API tasks
    "extract_openapi": "task_extract_openapi",
    "generate_api_docs": "task_generate_api_docs",
    # Link tasks
    "scan_links": "task_scan_links",
    "fix_internal_links": "task_fix_internal_links",
    # Security tasks
    "scan_secrets": "task_scan_secrets",
    "anonymize_sensitive": "task_anonymize_sensitive",
    # Quality tasks
    "analyze_quality": "task_analyze_quality",
    "enhance_content": "task_enhance_content",
    # Reporting tasks
    "generate_index": "task_generate_index",
    "generate_dashboard": "task_generate_dashboard",
    "generate_final_report": "task_generate_final_report",
}


def execute_task(task: Dict, project_root: Path) -> TaskResult:
    """Execute a single task. Called by worker processes."""
    library = WorkerTaskLibrary(project_root)

    task_type = task.get("type")
    task_id = task.get("id")

    if task_type not in TASK_REGISTRY:
        return TaskResult(
            success=False, task_id=task_id, error=f"Unknown task type: {task_type}"
        )

    method_name = TASK_REGISTRY[task_type]
    method = getattr(library, method_name)

    # Execute the task with provided parameters
    return method(task_id=task_id, **task.get("params", {}))


if __name__ == "__main__":
    # Test execution
    from pathlib import Path

    project_root = Path(__file__).parent.parent.parent
    library = WorkerTaskLibrary(project_root)

    # Test backup task
    result = library.task_backup_docs("test_backup")
    print(f"Backup result: {result}")

    # Test structure analysis
    result = library.task_analyze_structure("test_analysis")
    print(f"Analysis result: {result}")
