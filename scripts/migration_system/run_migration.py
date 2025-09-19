#!/usr/bin/env python3
"""
Main runner for the parallel documentation migration system.
Orchestrates the complete migration process using the task orchestrator.
"""

import sys
import json
import time
import argparse
from pathlib import Path
from typing import Dict, List

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scripts.migration_system.task_orchestrator import (
    TaskOrchestrator,
    Task as TaskDefinition,
)


class MigrationRunner:
    """Runs the complete documentation migration."""

    def __init__(self, project_root: Path, num_workers: int = None):
        self.project_root = project_root
        self.orchestrator = TaskOrchestrator(project_root, num_workers)
        self.start_time = None

    def define_migration_tasks(self) -> List[TaskDefinition]:
        """Define all migration tasks with dependencies."""
        tasks = []

        # ==================== PHASE 0: PREPARATION ====================
        tasks.append(
            TaskDefinition(
                id="backup_docs",
                type="backup_docs",
                priority=100,
                retry_count=1,
                timeout=300,
                params={},
            )
        )

        # ==================== PHASE 1: DISCOVERY (Parallel) ====================

        # Structure Architect tasks
        tasks.append(
            TaskDefinition(
                id="analyze_structure",
                type="analyze_structure",
                priority=90,
                dependencies=["backup_docs"],
                params={},
            )
        )

        tasks.append(
            TaskDefinition(
                id="reorganize_dry_run",
                type="reorganize_docs",
                priority=85,
                dependencies=["analyze_structure"],
                params={"dry_run": True},
            )
        )

        # Metadata Engineer tasks
        tasks.append(
            TaskDefinition(
                id="scan_frontmatter",
                type="scan_frontmatter",
                priority=90,
                dependencies=["backup_docs"],
                params={},
            )
        )

        # API Specialist tasks
        tasks.append(
            TaskDefinition(
                id="extract_openapi",
                type="extract_openapi",
                priority=90,
                dependencies=["backup_docs"],
                params={},
            )
        )

        # Link Manager tasks
        tasks.append(
            TaskDefinition(
                id="scan_links_initial",
                type="scan_links",
                priority=90,
                dependencies=["backup_docs"],
                params={},
            )
        )

        # Security Auditor tasks
        tasks.append(
            TaskDefinition(
                id="scan_secrets",
                type="scan_secrets",
                priority=95,  # Higher priority for security
                dependencies=["backup_docs"],
                params={},
            )
        )

        # Quality Enhancer tasks
        tasks.append(
            TaskDefinition(
                id="analyze_quality",
                type="analyze_quality",
                priority=85,
                dependencies=["backup_docs"],
                params={},
            )
        )

        # ==================== PHASE 2: EXECUTION (Conditional Parallel) ====================

        # Structure reorganization (if approved)
        tasks.append(
            TaskDefinition(
                id="reorganize_execute",
                type="reorganize_docs",
                priority=80,
                dependencies=["reorganize_dry_run", "scan_frontmatter"],
                params={"dry_run": False},
            )
        )

        tasks.append(
            TaskDefinition(
                id="generate_redirects",
                type="generate_redirects",
                priority=75,
                dependencies=["reorganize_execute"],
                params={},
            )
        )

        # Frontmatter generation (batched)
        # This will be dynamically split into batches after scan_frontmatter completes
        tasks.append(
            TaskDefinition(
                id="generate_frontmatter_all",
                type="generate_frontmatter_batch",
                priority=75,
                dependencies=["scan_frontmatter", "reorganize_execute"],
                params={"batch_files": []},  # Will be populated dynamically
            )
        )

        # API documentation generation
        tasks.append(
            TaskDefinition(
                id="generate_api_docs",
                type="generate_api_docs",
                priority=70,
                dependencies=["extract_openapi", "reorganize_execute"],
                params={},
            )
        )

        # Security remediation
        tasks.append(
            TaskDefinition(
                id="anonymize_sensitive",
                type="anonymize_sensitive",
                priority=85,  # High priority for security fixes
                dependencies=["scan_secrets"],
                params={},
            )
        )

        # ==================== PHASE 3: VALIDATION & ENHANCEMENT ====================

        # Link fixing (after reorganization)
        tasks.append(
            TaskDefinition(
                id="fix_internal_links",
                type="fix_internal_links",
                priority=65,
                dependencies=["generate_redirects"],
                params={},
            )
        )

        # Quality enhancement
        tasks.append(
            TaskDefinition(
                id="enhance_priority_docs",
                type="enhance_content",
                priority=60,
                dependencies=["generate_frontmatter_all"],
                params={"file_paths": []},  # Will be populated based on priority
            )
        )

        # Document freshness check
        tasks.append(
            TaskDefinition(
                id="check_freshness",
                type="check_freshness",
                priority=55,
                dependencies=["generate_frontmatter_all"],
                params={},
            )
        )

        # ==================== PHASE 4: REPORTING ====================

        # Generate index
        tasks.append(
            TaskDefinition(
                id="generate_index",
                type="generate_index",
                priority=40,
                dependencies=["generate_frontmatter_all", "generate_api_docs"],
                params={},
            )
        )

        # Generate dashboard
        tasks.append(
            TaskDefinition(
                id="generate_dashboard",
                type="generate_dashboard",
                priority=30,
                dependencies=[
                    "generate_index",
                    "fix_internal_links",
                    "check_freshness",
                ],
                params={},
            )
        )

        # Generate final report
        tasks.append(
            TaskDefinition(
                id="generate_final_report",
                type="generate_final_report",
                priority=20,
                dependencies=["generate_dashboard"],
                params={},
            )
        )

        return tasks

    def prepare_batch_tasks(self, tasks: List[TaskDefinition]) -> List[TaskDefinition]:
        """Prepare batch tasks based on discovery results."""
        updated_tasks = []

        for task in tasks:
            if task.id == "generate_frontmatter_all":
                # Split into batches based on scan results
                scan_file = (
                    self.project_root
                    / "docs"
                    / "_generated"
                    / "reports"
                    / "frontmatter_scan.json"
                )
                if scan_file.exists():
                    with open(scan_file) as f:
                        scan_data = json.load(f)
                        files_to_process = scan_data.get("missing_frontmatter", [])

                    # Create batch tasks (25 files per batch)
                    batch_size = 25
                    for i in range(0, len(files_to_process), batch_size):
                        batch_files = files_to_process[i : i + batch_size]
                        batch_task = TaskDefinition(
                            id=f"generate_frontmatter_batch_{i // batch_size}",
                            type="generate_frontmatter_batch",
                            priority=75,
                            dependencies=["scan_frontmatter", "reorganize_execute"],
                            params={"batch_files": batch_files},
                        )
                        updated_tasks.append(batch_task)
                else:
                    # Keep original task if scan results not available
                    updated_tasks.append(task)

            elif task.id == "enhance_priority_docs":
                # Identify priority documents for enhancement
                quality_file = (
                    self.project_root
                    / "docs"
                    / "_generated"
                    / "reports"
                    / "quality_report.json"
                )
                if quality_file.exists():
                    with open(quality_file) as f:
                        quality_data = json.load(f)
                        # Enhance files with missing elements
                        files_to_enhance = (
                            quality_data.get("code_blocks_without_language", [])[:10]
                            + quality_data.get("images_without_alt", [])[:10]
                        )
                        task.params["file_paths"] = list(set(files_to_enhance))

                updated_tasks.append(task)
            else:
                updated_tasks.append(task)

        return updated_tasks

    def run_migration(self, dry_run: bool = False, resume: bool = False) -> bool:
        """Run the complete migration."""
        import time

        self.start_time = time.time()

        print("\n" + "=" * 60)
        print("Documentation Migration System")
        print("=" * 60)
        print(f"Project: {self.project_root}")
        print(f"Workers: {self.orchestrator.num_workers}")
        print(f"Mode: {'DRY RUN' if dry_run else 'EXECUTE'}")
        print(f"Resume: {resume}")
        print("=" * 60 + "\n")

        # Define initial tasks
        tasks = self.define_migration_tasks()

        if dry_run:
            print("DRY RUN MODE - No changes will be made\n")
            print(f"Total tasks defined: {len(tasks)}")
            print("\nTask execution plan:")
            for task in sorted(tasks, key=lambda t: (-t.priority, t.id)):
                deps = (
                    f" (depends on: {', '.join(task.dependencies)})"
                    if task.dependencies
                    else ""
                )
                print(f"  [{task.priority:3d}] {task.id:30s} {task.type:20s}{deps}")
            return True

        try:
            # Load tasks into orchestrator
            self.orchestrator.load_tasks(tasks)

            # Resume from state if requested
            if resume:
                if not self.orchestrator.resume_from_state():
                    print("No previous state to resume from, starting fresh...")

            # Start workers and scheduling
            self.orchestrator.start_workers()

            # Let initial tasks complete first
            initial_task_count = len(tasks)
            print(f"\nStarting with {initial_task_count} initial tasks...")

            self.orchestrator.schedule_tasks()

            # Wait for initial discovery tasks to complete
            print("Waiting for discovery phase to complete...")
            discovery_timeout = 300  # 5 minutes
            start_wait = time.time()

            while time.time() - start_wait < discovery_timeout:
                stats = self.orchestrator.get_statistics()
                if stats["completed"] + stats["failed"] >= 6:  # Discovery tasks done
                    break
                time.sleep(2)

            # After initial discovery phase, prepare batch tasks
            if not resume:
                print("\nPreparing batch tasks based on discovery...")
                updated_tasks = self.prepare_batch_tasks(tasks)

                # Find tasks that need to be added
                existing_ids = {t.id for t in tasks}
                new_tasks = [t for t in updated_tasks if t.id not in existing_ids]

                if new_tasks:
                    print(f"Adding {len(new_tasks)} batch tasks...")
                    for task in new_tasks:
                        self.orchestrator.submit_task(task)

            # Wait for completion
            print("Waiting for all tasks to complete...")
            while not self.orchestrator.all_tasks_done():
                stats = self.orchestrator.get_statistics()
                print(
                    f"Progress: {stats['completed']}/{stats['total']} completed, {stats['failed']} failed"
                )
                time.sleep(5)

            # Get final statistics
            stats = self.orchestrator.get_statistics()

            # Print summary
            self.print_summary(stats)

            return stats["failed"] == 0

        except KeyboardInterrupt:
            print("\n\nMigration interrupted by user.")
            self.orchestrator.shutdown()
            return False
        except Exception as e:
            print(f"\n\nMigration failed with error: {e}")
            self.orchestrator.shutdown()
            return False

    def print_summary(self, stats: Dict):
        """Print migration summary."""
        elapsed = time.time() - self.start_time
        minutes = int(elapsed // 60)
        seconds = int(elapsed % 60)

        print("\n" + "=" * 60)
        print("Migration Summary")
        print("=" * 60)
        print(f"Total tasks: {stats['total']}")
        print(f"Completed:   {stats['completed']} ✅")
        print(f"Failed:      {stats['failed']} ❌")
        print(f"Pending:     {stats['pending']} ⏳")
        print(f"Time taken:  {minutes}m {seconds}s")
        print("=" * 60)

        if stats["failed"] > 0:
            print("\n⚠️  Some tasks failed. Check logs for details.")
            print("You can resume the migration with: --resume")
        else:
            print("\n✅ Migration completed successfully!")

        # Print key outputs
        print("\nKey outputs:")
        reports_dir = self.project_root / "docs" / "_generated"
        if (reports_dir / "dashboard.html").exists():
            print(f"  📊 Dashboard: {reports_dir / 'dashboard.html'}")
        if (reports_dir / "doc_report.html").exists():
            print(f"  📝 Report: {reports_dir / 'doc_report.html'}")
        if (reports_dir / "index.json").exists():
            print(f"  🔍 Index: {reports_dir / 'index.json'}")

    def validate_environment(self) -> bool:
        """Validate the environment before running migration."""
        print("Validating environment...")

        checks = []

        # Check project structure
        if not self.project_root.exists():
            checks.append(
                ("Project root exists", False, f"Path not found: {self.project_root}")
            )
        else:
            checks.append(("Project root exists", True, str(self.project_root)))

        # Check docs directory
        docs_dir = self.project_root / "docs"
        if not docs_dir.exists():
            checks.append(
                ("Docs directory exists", False, f"Path not found: {docs_dir}")
            )
        else:
            md_count = len(list(docs_dir.rglob("*.md")))
            checks.append(("Docs directory exists", True, f"{md_count} markdown files"))

        # Check scripts directory
        scripts_dir = self.project_root / "scripts"
        if not scripts_dir.exists():
            checks.append(
                ("Scripts directory exists", False, f"Path not found: {scripts_dir}")
            )
        else:
            checks.append(("Scripts directory exists", True, str(scripts_dir)))

        # Check for required scripts
        required_scripts = [
            "validate_docs.py",
            "generate_doc_report.py",
            "generate_doc_index.py",
            "reorganize_docs.py",
            "add_frontmatter.py",
            "anonymize_docs.py",
        ]

        for script in required_scripts:
            script_path = scripts_dir / script
            if script_path.exists():
                checks.append((f"Script: {script}", True, "✓"))
            else:
                checks.append((f"Script: {script}", False, "Missing"))

        # Print validation results
        print("\nEnvironment Validation Results:")
        print("-" * 50)
        all_passed = True
        for check_name, passed, details in checks:
            status = "✅" if passed else "❌"
            print(f"{status} {check_name:30s} {details}")
            if not passed:
                all_passed = False

        print("-" * 50)

        if not all_passed:
            print("\n⚠️  Environment validation failed. Please fix the issues above.")
            return False

        print("\n✅ Environment validation passed.")
        return True


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Run the parallel documentation migration"
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=None,
        help="Number of worker processes (default: CPU count)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show execution plan without making changes",
    )
    parser.add_argument(
        "--resume", action="store_true", help="Resume from previous state"
    )
    parser.add_argument(
        "--skip-validation", action="store_true", help="Skip environment validation"
    )
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path(__file__).parent.parent.parent,
        help="Project root directory",
    )

    args = parser.parse_args()

    # Create runner
    runner = MigrationRunner(args.project_root, args.workers)

    # Validate environment
    if not args.skip_validation:
        if not runner.validate_environment():
            sys.exit(1)

    # Run migration
    success = runner.run_migration(dry_run=args.dry_run, resume=args.resume)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
