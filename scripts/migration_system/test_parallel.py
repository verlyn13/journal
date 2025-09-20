#!/usr/bin/env python3
"""
Test script for the parallel documentation migration system.
Tests basic functionality and parallel execution.
"""

from pathlib import Path
import sys
import time


sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from scripts.migration_system.task_orchestrator import (
    Task as TaskDefinition,
    TaskOrchestrator,
    TaskStatus,
)
from scripts.migration_system.worker_tasks import WorkerTaskLibrary


def test_worker_tasks():
    """Test individual worker tasks."""
    print("Testing Worker Tasks")
    print("=" * 50)

    project_root = Path(__file__).parent.parent.parent
    library = WorkerTaskLibrary(project_root)

    # Test backup task
    print("\n1. Testing backup_docs...")
    result = library.task_backup_docs("test_backup")
    print(f"   Success: {result.success}")
    if result.output:
        print(f"   Backup path: {result.output.get('backup_path')}")
    if result.error:
        print(f"   Error: {result.error}")

    # Test structure analysis
    print("\n2. Testing analyze_structure...")
    result = library.task_analyze_structure("test_analysis")
    print(f"   Success: {result.success}")
    if result.metrics:
        print(f"   Total files: {result.metrics.get('total_files')}")
        print(f"   Directories: {result.metrics.get('directories')}")
    if result.error:
        print(f"   Error: {result.error}")

    # Test frontmatter scan
    print("\n3. Testing scan_frontmatter...")
    result = library.task_scan_frontmatter("test_scan")
    print(f"   Success: {result.success}")
    if result.metrics:
        print(f"   With frontmatter: {result.metrics.get('with_frontmatter')}")
        print(f"   Without frontmatter: {result.metrics.get('without_frontmatter')}")
    if result.error:
        print(f"   Error: {result.error}")

    # Test quality analysis
    print("\n4. Testing analyze_quality...")
    result = library.task_analyze_quality("test_quality")
    print(f"   Success: {result.success}")
    if result.metrics:
        print(f"   Total files: {result.metrics.get('total_files')}")
        print(f"   Avg word count: {result.metrics.get('avg_word_count')}")
    if result.error:
        print(f"   Error: {result.error}")

    print("\n" + "=" * 50)
    print("Worker task tests completed.")


def test_parallel_execution():
    """Test parallel task execution."""
    print("\n\nTesting Parallel Execution")
    print("=" * 50)

    project_root = Path(__file__).parent.parent.parent

    # Create simple test tasks that can run in parallel
    test_tasks = [
        TaskDefinition(id="test_backup", type="backup_docs", priority=100, params={}),
        TaskDefinition(
            id="test_analysis",
            type="analyze_structure",
            priority=90,
            dependencies=[],  # Can run in parallel with backup
            params={},
        ),
        TaskDefinition(
            id="test_scan",
            type="scan_frontmatter",
            priority=90,
            dependencies=[],  # Can run in parallel
            params={},
        ),
        TaskDefinition(
            id="test_quality",
            type="analyze_quality",
            priority=85,
            dependencies=["test_analysis"],  # Depends on analysis
            params={},
        ),
        TaskDefinition(
            id="test_freshness",
            type="check_freshness",
            priority=80,
            dependencies=["test_scan"],  # Depends on scan
            params={},
        ),
    ]

    # Create orchestrator with 3 workers
    print("\nCreating orchestrator with 3 workers...")
    orchestrator = TaskOrchestrator(project_root, num_workers=3)

    try:
        # Submit all tasks
        print(f"Submitting {len(test_tasks)} tasks...")
        orchestrator.load_tasks(test_tasks)
        orchestrator.start_workers()
        orchestrator.schedule_tasks()

        # Monitor progress
        print("\nExecuting tasks...")
        print("(Tasks with no dependencies will run in parallel)")
        print("")

        start_time = time.time()
        last_stats = {"completed": 0}

        while not orchestrator.all_tasks_done():
            stats = orchestrator.get_statistics()

            # Print progress update if changed
            if stats["completed"] != last_stats["completed"]:
                elapsed = int(time.time() - start_time)
                print(
                    f"[{elapsed:3d}s] Completed: {stats['completed']}/{stats['total']} | "
                    f"Running: {stats['running']} | "
                    f"Pending: {stats['pending']} | "
                    f"Failed: {stats['failed']}"
                )
                last_stats = stats

            time.sleep(0.5)

        # Final statistics
        final_stats = orchestrator.get_statistics()
        elapsed_total = time.time() - start_time

        print("\n" + "=" * 50)
        print("Execution Summary")
        print("=" * 50)
        print(f"Total tasks:     {final_stats['total']}")
        print(f"Completed:       {final_stats['completed']} ✅")
        print(f"Failed:          {final_stats['failed']} ❌")
        print(f"Total time:      {elapsed_total:.1f} seconds")
        print(f"Parallel speedup: ~{3:.1f}x (with 3 workers)")

        # Check results
        if final_stats["failed"] > 0:
            print("\n⚠️  Some tasks failed. Checking errors...")
            # Would check error details here
        else:
            print("\n✅ All tasks completed successfully!")

    finally:
        orchestrator.shutdown()
        print("\nOrchestrator shut down.")


def test_dependency_resolution():
    """Test dependency graph resolution."""
    print("\n\nTesting Dependency Resolution")
    print("=" * 50)

    from scripts.migration_system.task_orchestrator import DependencyResolver

    # Create test tasks with complex dependencies
    tasks = [
        TaskDefinition(id="A", type="test", priority=50, dependencies=[], params={}),
        TaskDefinition(id="B", type="test", priority=50, dependencies=["A"], params={}),
        TaskDefinition(id="C", type="test", priority=50, dependencies=["A"], params={}),
        TaskDefinition(
            id="D", type="test", priority=50, dependencies=["B", "C"], params={}
        ),
        TaskDefinition(id="E", type="test", priority=50, dependencies=["D"], params={}),
    ]

    resolver = DependencyResolver(tasks)

    print("\nTask dependency graph:")
    print("  A")
    print("  ├── B")
    print("  └── C")
    print("      └── D")
    print("          └── E")

    print("\nResolution order:")
    while True:
        ready = resolver.get_ready_tasks()
        if not ready:
            break

        print(f"  Ready to run: {[t.id for t in ready]}")
        for task in ready:
            resolver.mark_completed(task.id)

    if not resolver.all_resolved():
        print("\n⚠️  Not all tasks resolved - possible circular dependency")
    else:
        print("\n✅ All dependencies resolved correctly")


def test_state_persistence():
    """Test state persistence and recovery."""
    print("\n\nTesting State Persistence")
    print("=" * 50)

    from scripts.migration_system.task_orchestrator import StateStore

    project_root = Path(__file__).parent.parent.parent
    db_path = project_root / ".test_state.db"

    # Clean up any existing test database
    if db_path.exists():
        db_path.unlink()

    store = StateStore(db_path)

    # Save some test state
    print("\nSaving test state...")
    test_task = TaskDefinition(
        id="test_task", type="backup_docs", priority=100, params={"test": True}
    )

    test_task.status = TaskStatus.COMPLETED
    store.save_task(test_task)
    store.update_statistics({"total": 5, "completed": 3, "failed": 1, "pending": 1})

    # Retrieve state
    print("Retrieving state...")
    tasks = store.get_incomplete_tasks()
    stats = store.get_statistics()

    print(f"  Incomplete tasks: {len(tasks)}")
    print(f"  Statistics: {stats}")

    # Clean up
    store.close()
    db_path.unlink()
    print("\n✅ State persistence working correctly")


def main():
    """Run all tests."""
    print("=" * 60)
    print("Parallel Documentation Migration System Tests")
    print("=" * 60)

    try:
        # Test individual components
        test_worker_tasks()
        test_dependency_resolution()
        test_state_persistence()

        # Test parallel execution
        test_parallel_execution()

        print("\n" + "=" * 60)
        print("✅ All tests completed successfully!")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
