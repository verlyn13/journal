#!/usr/bin/env python3
"""
Manual migration runner that executes key tasks sequentially.
"""

import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scripts.migration_system.worker_tasks import WorkerTaskLibrary


def main():
    """Run key migration tasks manually."""
    project_root = Path(__file__).parent.parent.parent
    library = WorkerTaskLibrary(project_root)

    print("=" * 60)
    print("Manual Documentation Migration")
    print("=" * 60)

    # Execute key tasks in order
    tasks = [
        ("backup_docs", "Creating backup"),
        ("scan_frontmatter", "Scanning frontmatter"),
        ("analyze_structure", "Analyzing structure"),
        ("analyze_quality", "Analyzing quality"),
        ("scan_secrets", "Scanning for secrets"),
        ("generate_frontmatter_batch", "Adding frontmatter to all files"),
        ("extract_openapi", "Extracting OpenAPI spec"),
        ("generate_api_docs", "Generating API docs"),
        ("generate_index", "Generating documentation index"),
        ("generate_dashboard", "Generating dashboard"),
        ("generate_final_report", "Generating final report"),
    ]

    completed = 0
    failed = 0

    for task_type, description in tasks:
        print(f"\n{description}...")
        start_time = time.time()

        try:
            if task_type == "generate_frontmatter_batch":
                # Get files without frontmatter first
                scan_result = library.task_scan_frontmatter("scan_for_batch")
                if scan_result.success:
                    # Load scan results to get files to process
                    reports_dir = project_root / "docs" / "_generated" / "reports"
                    scan_file = reports_dir / "frontmatter_scan.json"

                    if scan_file.exists():
                        import json

                        with open(scan_file) as f:
                            scan_data = json.load(f)
                            files_to_process = scan_data.get("missing_frontmatter", [])

                        # Process in smaller batches to avoid issues
                        batch_size = 50
                        for i in range(0, len(files_to_process), batch_size):
                            batch_files = files_to_process[i : i + batch_size]
                            batch_id = f"batch_{i // batch_size}"

                            result = library.task_generate_frontmatter_batch(
                                batch_id, batch_files=batch_files
                            )

                            if not result.success:
                                print(
                                    f"   Batch {i // batch_size} failed: {result.error}"
                                )
                                break
                            else:
                                print(
                                    f"   Batch {i // batch_size}: {len(result.files_affected)} files processed"
                                )

                        result = scan_result  # Use scan result as overall result
                    else:
                        result = scan_result
                else:
                    result = scan_result
            else:
                # Execute the task with appropriate parameters
                if task_type == "backup_docs":
                    result = library.task_backup_docs("manual_backup")
                elif task_type == "scan_frontmatter":
                    result = library.task_scan_frontmatter("manual_scan")
                elif task_type == "analyze_structure":
                    result = library.task_analyze_structure("manual_analysis")
                elif task_type == "analyze_quality":
                    result = library.task_analyze_quality("manual_quality")
                elif task_type == "scan_secrets":
                    result = library.task_scan_secrets("manual_secrets")
                elif task_type == "extract_openapi":
                    result = library.task_extract_openapi("manual_openapi")
                elif task_type == "generate_api_docs":
                    result = library.task_generate_api_docs("manual_api_docs")
                elif task_type == "generate_index":
                    result = library.task_generate_index("manual_index")
                elif task_type == "generate_dashboard":
                    result = library.task_generate_dashboard("manual_dashboard")
                elif task_type == "generate_final_report":
                    result = library.task_generate_final_report("manual_report")
                else:
                    print(f"   Unknown task type: {task_type}")
                    continue

            elapsed = time.time() - start_time

            if result.success:
                print(f"   ✅ SUCCESS ({elapsed:.1f}s)")
                if result.metrics:
                    for key, value in result.metrics.items():
                        print(f"      {key}: {value}")
                completed += 1
            else:
                print(f"   ❌ FAILED ({elapsed:.1f}s): {result.error}")
                failed += 1

        except Exception as e:
            elapsed = time.time() - start_time
            print(f"   ❌ EXCEPTION ({elapsed:.1f}s): {e}")
            failed += 1

    print("\n" + "=" * 60)
    print("Migration Summary")
    print("=" * 60)
    print(f"Completed: {completed}")
    print(f"Failed: {failed}")
    print(f"Total: {len(tasks)}")

    if failed == 0:
        print("\n✅ Migration completed successfully!")

        # Show key outputs
        reports_dir = project_root / "docs" / "_generated"
        print("\nKey outputs:")
        if (reports_dir / "dashboard.html").exists():
            print(f"  📊 Dashboard: {reports_dir / 'dashboard.html'}")
        if (reports_dir / "doc_report.html").exists():
            print(f"  📝 Report: {reports_dir / 'doc_report.html'}")
        if (reports_dir / "index.json").exists():
            print(f"  🔍 Index: {reports_dir / 'index.json'}")

        # Check documentation state
        docs_dir = project_root / "docs"
        md_files = list(docs_dir.rglob("*.md"))
        with_frontmatter = 0
        for md_file in md_files:
            try:
                with open(md_file, "r", encoding="utf-8") as f:
                    if f.readline().strip() == "---":
                        with_frontmatter += 1
            except:
                pass

        print("\nDocumentation state:")
        print(f"  Total files: {len(md_files)}")
        print(f"  With frontmatter: {with_frontmatter}")
        print(f"  Coverage: {with_frontmatter / len(md_files) * 100:.1f}%")

    else:
        print(f"\n⚠️  {failed} tasks failed. Check output above for details.")

    return failed == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
