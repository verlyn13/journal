#!/usr/bin/env python3
"""
Simple test of the parallel documentation migration system.
Tests just the basic functionality.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scripts.migration_system.worker_tasks import WorkerTaskLibrary


def main():
    """Simple test."""
    project_root = Path(__file__).parent.parent.parent
    library = WorkerTaskLibrary(project_root)

    print("Testing basic worker task...")

    # Test backup task
    result = library.task_backup_docs("test_backup")

    if result.success:
        print(f"✅ SUCCESS: Backup created at {result.output.get('backup_path')}")
        print(f"   Metrics: {result.metrics}")
    else:
        print(f"❌ FAILED: {result.error}")

    # Test analysis task
    print("\nTesting analysis task...")
    result = library.task_analyze_structure("test_analysis")

    if result.success:
        print("✅ SUCCESS: Analysis completed")
        print(f"   Total files: {result.metrics.get('total_files')}")
        print(f"   Directories: {result.metrics.get('directories')}")
    else:
        print(f"❌ FAILED: {result.error}")

    print("\n✅ Basic tests completed successfully!")


if __name__ == "__main__":
    main()
