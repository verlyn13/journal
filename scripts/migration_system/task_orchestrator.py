#!/usr/bin/env python3
"""
Modern Parallel Documentation Migration System - Orchestrator
Manages task distribution, worker coordination, and state persistence.
"""

import asyncio
import sqlite3
import json
import multiprocessing as mp
from multiprocessing import Process, Queue, Manager
from queue import Empty
from pathlib import Path
from typing import Dict, List, Set, Optional, Any
from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
import signal
import sys
import logging

# Add rich for beautiful progress monitoring
try:
    from rich.console import Console
    from rich.table import Table
    from rich.progress import (
        Progress,
        SpinnerColumn,
        TextColumn,
        BarColumn,
        TimeElapsedColumn,
    )
    from rich.live import Live
    from rich.layout import Layout
    from rich.panel import Panel

    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False
    print("Rich not available. Install with: pip install rich")

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class TaskStatus(Enum):
    """Task execution status."""

    PENDING = "pending"
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"
    CANCELLED = "cancelled"


class TaskPriority(Enum):
    """Task priority levels."""

    CRITICAL = 0  # Highest priority
    HIGH = 1
    MEDIUM = 2
    LOW = 3
    BACKGROUND = 4  # Lowest priority


@dataclass
class Task:
    """Represents a migration task."""

    id: str
    type: str  # Task type (e.g., "backup_docs", "analyze_structure")
    priority: int = 50  # Higher priority = executed first
    dependencies: List[str] = field(default_factory=list)
    params: Dict[str, Any] = field(default_factory=dict)
    timeout: int = 300
    retry_count: int = 0
    max_retries: int = 3
    status: TaskStatus = TaskStatus.PENDING
    worker_id: Optional[int] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error: Optional[str] = None
    result: Optional[Dict] = None

    def to_dict(self) -> Dict:
        """Convert task to dictionary."""
        data = asdict(self)
        # Priority is already an int, no need for .value
        data["status"] = self.status.value
        data["started_at"] = self.started_at.isoformat() if self.started_at else None
        data["completed_at"] = (
            self.completed_at.isoformat() if self.completed_at else None
        )
        return data

    @classmethod
    def from_dict(cls, data: Dict) -> "Task":
        """Create task from dictionary."""
        # Priority is already an int, no need for TaskPriority enum
        data["status"] = TaskStatus(data["status"])
        data["started_at"] = (
            datetime.fromisoformat(data["started_at"])
            if data.get("started_at")
            else None
        )
        data["completed_at"] = (
            datetime.fromisoformat(data["completed_at"])
            if data.get("completed_at")
            else None
        )
        return cls(**data)


class StateStore:
    """SQLite-based state persistence for resumability."""

    def __init__(self, db_path: Path):
        self.db_path = db_path
        self.conn = sqlite3.connect(str(db_path), check_same_thread=False)
        self._init_db()

    def _init_db(self):
        """Initialize database schema."""
        cursor = self.conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS state (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS worker_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                worker_id INTEGER,
                task_id TEXT,
                level TEXT,
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        self.conn.commit()

    def save_task(self, task: Task):
        """Save task to database."""
        cursor = self.conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO tasks (id, data, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        """,
            (task.id, json.dumps(task.to_dict())),
        )
        self.conn.commit()

    def load_task(self, task_id: str) -> Optional[Task]:
        """Load task from database."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT data FROM tasks WHERE id = ?", (task_id,))
        row = cursor.fetchone()
        if row:
            return Task.from_dict(json.loads(row[0]))
        return None

    def load_all_tasks(self) -> List[Task]:
        """Load all tasks from database."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT data FROM tasks")
        tasks = []
        for row in cursor.fetchall():
            tasks.append(Task.from_dict(json.loads(row[0])))
        return tasks

    def save_state(self, key: str, value: Any):
        """Save state value."""
        cursor = self.conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO state (key, value, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        """,
            (key, json.dumps(value)),
        )
        self.conn.commit()

    def load_state(self, key: str) -> Optional[Any]:
        """Load state value."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT value FROM state WHERE key = ?", (key,))
        row = cursor.fetchone()
        if row:
            return json.loads(row[0])
        return None

    def update_statistics(self, stats: Dict[str, Any]):
        """Update statistics in state."""
        self.save_state("statistics", stats)

    def get_statistics(self) -> Optional[Dict[str, Any]]:
        """Get statistics from state."""
        return self.load_state("statistics")

    def get_incomplete_tasks(self) -> List[Task]:
        """Get all incomplete tasks."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT data FROM tasks")
        rows = cursor.fetchall()

        # Filter by status in the loaded data
        tasks = []
        for row in rows:
            task = Task.from_dict(json.loads(row[0]))
            if task.status in [
                TaskStatus.PENDING,
                TaskStatus.FAILED,
                TaskStatus.RUNNING,
            ]:
                tasks.append(task)
        return tasks

    def log_worker(self, worker_id: int, task_id: str, level: str, message: str):
        """Log worker activity."""
        cursor = self.conn.cursor()
        cursor.execute(
            """
            INSERT INTO worker_logs (worker_id, task_id, level, message)
            VALUES (?, ?, ?, ?)
        """,
            (worker_id, task_id, level, message),
        )
        self.conn.commit()

    def close(self):
        """Close database connection."""
        self.conn.close()


class DependencyResolver:
    """Resolves task dependencies and determines execution order."""

    def __init__(self, tasks: List[Task] = None):
        self.tasks = {}
        if tasks:
            self.tasks = {task.id: task for task in tasks}
        self.graph = self._build_graph()
        self.completed = set()
        self.in_progress = set()

    def _build_graph(self) -> Dict[str, Set[str]]:
        """Build dependency graph."""
        graph = {}
        for task_id, task in self.tasks.items():
            graph[task_id] = set(task.dependencies) if task.dependencies else set()
        return graph

    def add_task(self, task: Task):
        """Add a task to the resolver."""
        self.tasks[task.id] = task
        self.graph[task.id] = set(task.dependencies) if task.dependencies else set()

    def get_ready_tasks(self) -> List[Task]:
        """Get tasks that are ready to run (dependencies satisfied)."""
        ready = []
        for task_id, deps in self.graph.items():
            if task_id not in self.completed and task_id not in self.in_progress:
                if set(deps).issubset(self.completed):
                    ready.append(self.tasks[task_id])
        return ready

    def mark_completed(self, task_id: str):
        """Mark task as completed."""
        self.completed.add(task_id)
        self.in_progress.discard(task_id)

    def mark_in_progress(self, task_id: str):
        """Mark task as in progress."""
        self.in_progress.add(task_id)

    def mark_failed(self, task_id: str):
        """Mark task as failed and block dependents."""
        self.in_progress.discard(task_id)
        # Don't add to completed, so dependents remain blocked

    def get_blocked_tasks(self) -> List[Task]:
        """Get tasks that are blocked by dependencies."""
        blocked = []
        for task_id, deps in self.graph.items():
            if task_id not in self.completed and task_id not in self.in_progress:
                if not set(deps).issubset(self.completed):
                    blocked.append(self.tasks[task_id])
        return blocked

    def all_resolved(self) -> bool:
        """Check if all tasks have been resolved (completed)."""
        return len(self.completed) == len(self.graph)

    def detect_cycles(self) -> List[List[str]]:
        """Detect circular dependencies."""
        visited = set()
        rec_stack = set()
        cycles = []

        def dfs(node, path):
            visited.add(node)
            rec_stack.add(node)
            path.append(node)

            for dep in self.graph.get(node, set()):
                if dep not in visited:
                    if dfs(dep, path.copy()):
                        return True
                elif dep in rec_stack:
                    cycle_start = path.index(dep)
                    cycles.append(path[cycle_start:] + [dep])
                    return True

            rec_stack.remove(node)
            return False

        for node in self.graph:
            if node not in visited:
                dfs(node, [])

        return cycles


class TaskOrchestrator:
    """Main orchestrator for parallel task execution."""

    def __init__(self, project_root: Path, num_workers: int = None):
        self.project_root = project_root
        self.num_workers = num_workers or mp.cpu_count()

        # Initialize components
        self.state_store = StateStore(project_root / ".migration_state.db")
        self.manager = Manager()
        self.task_queue = self.manager.Queue()
        self.result_queue = self.manager.Queue()
        self.control_queue = self.manager.Queue()

        # Shared state
        self.shared_state = self.manager.dict()
        self.shared_state["status"] = "initializing"
        self.shared_state["start_time"] = datetime.now().isoformat()
        self.shared_state["tasks_total"] = 0
        self.shared_state["tasks_completed"] = 0
        self.shared_state["tasks_failed"] = 0

        # Task management
        self.tasks: Dict[str, Task] = {}
        self.dependency_resolver: Optional[DependencyResolver] = None
        self.workers: List[Process] = []

        # Console for rich output
        if RICH_AVAILABLE:
            self.console = Console()

        # Signal handling for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals."""
        logger.info(f"Received signal {signum}, initiating graceful shutdown...")
        self.shutdown()
        sys.exit(0)

    def load_tasks(self, task_definitions: List[Task]):
        """Load and validate tasks."""
        self.tasks = {task.id: task for task in task_definitions}
        self.dependency_resolver = DependencyResolver(task_definitions)

        # Check for circular dependencies
        cycles = self.dependency_resolver.detect_cycles()
        if cycles:
            raise ValueError(f"Circular dependencies detected: {cycles}")

        # Update shared state
        self.shared_state["tasks_total"] = len(self.tasks)

        # Save tasks to state store
        for task in task_definitions:
            self.state_store.save_task(task)

    def submit_task(self, task: Task):
        """Submit a single task."""
        self.tasks[task.id] = task
        self.dependency_resolver.add_task(task)
        self.state_store.save_task(task)

        # Check if it can run immediately
        if not task.dependencies:
            self.task_queue.put((task.priority, task.to_dict()))

    def resume_from_state(self) -> bool:
        """Resume from previous state if available."""
        saved_tasks = self.state_store.load_all_tasks()
        if saved_tasks:
            logger.info(f"Resuming from previous state with {len(saved_tasks)} tasks")
            self.tasks = {task.id: task for task in saved_tasks}
            self.dependency_resolver = DependencyResolver(saved_tasks)

            # Update completed tasks in resolver
            for task in saved_tasks:
                if task.status == TaskStatus.COMPLETED:
                    self.dependency_resolver.mark_completed(task.id)
                elif task.status == TaskStatus.RUNNING:
                    # Reset running tasks to pending for retry
                    task.status = TaskStatus.PENDING
                    self.state_store.save_task(task)

            return True
        return False

    def start_workers(self):
        """Start worker processes."""
        logger.info(f"Starting {self.num_workers} workers")

        for i in range(self.num_workers):
            worker = Process(
                target=worker_process,
                args=(
                    i,
                    self.task_queue,
                    self.result_queue,
                    self.control_queue,
                    self.shared_state,
                    self.project_root,
                ),
            )
            worker.start()
            self.workers.append(worker)

        self.shared_state["status"] = "running"
        self.shared_state["num_workers"] = self.num_workers

    def schedule_tasks(self):
        """Schedule ready tasks to queue."""
        ready_tasks = self.dependency_resolver.get_ready_tasks()

        # Sort by priority
        ready_tasks.sort(key=lambda t: (-t.priority, t.id))  # Higher priority first

        for task in ready_tasks:
            if task.status == TaskStatus.PENDING:
                task.status = TaskStatus.QUEUED
                self.task_queue.put((task.priority, task.to_dict()))
                self.dependency_resolver.mark_in_progress(task.id)
                self.state_store.save_task(task)
                logger.info(f"Scheduled task: {task.id}")

    async def run(self):
        """Main orchestration loop."""
        logger.info("Starting orchestration")

        try:
            # Start workers
            self.start_workers()

            # Start monitoring
            if RICH_AVAILABLE:
                asyncio.create_task(self.monitor_progress())

            # Main scheduling loop
            while True:
                # Schedule ready tasks
                self.schedule_tasks()

                # Process results
                self.process_results()

                # Check completion
                if self.is_complete():
                    break

                # Small delay to prevent CPU spinning
                await asyncio.sleep(0.1)

            logger.info("All tasks completed")

        finally:
            self.shutdown()

    def process_results(self):
        """Process results from workers."""
        while not self.result_queue.empty():
            try:
                result = self.result_queue.get_nowait()
                task_id = result["task_id"]
                task = self.tasks[task_id]

                if result["status"] == "completed":
                    task.status = TaskStatus.COMPLETED
                    task.completed_at = datetime.now()
                    task.result = result.get("result")
                    self.dependency_resolver.mark_completed(task_id)
                    self.shared_state["tasks_completed"] += 1
                    logger.info(f"Task completed: {task_id}")

                elif result["status"] == "failed":
                    task.status = TaskStatus.FAILED
                    task.error = result.get("error")
                    task.retry_count += 1

                    if task.retry_count < task.max_retries:
                        # Retry task
                        task.status = TaskStatus.PENDING
                        logger.warning(
                            f"Task failed, retrying ({task.retry_count}/{task.max_retries}): {task_id}"
                        )
                    else:
                        self.dependency_resolver.mark_failed(task_id)
                        self.shared_state["tasks_failed"] += 1
                        logger.error(f"Task failed permanently: {task_id}")

                self.state_store.save_task(task)

            except Empty:
                break

    def is_complete(self) -> bool:
        """Check if all tasks are complete."""
        pending = sum(
            1
            for t in self.tasks.values()
            if t.status in [TaskStatus.PENDING, TaskStatus.QUEUED, TaskStatus.RUNNING]
        )
        return pending == 0

    async def monitor_progress(self):
        """Monitor and display progress."""
        if not RICH_AVAILABLE:
            return

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(),
            TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
            TimeElapsedColumn(),
            console=self.console,
        ) as progress:
            overall_task = progress.add_task(
                "[cyan]Overall Progress", total=self.shared_state["tasks_total"]
            )

            while not self.is_complete():
                completed = self.shared_state.get("tasks_completed", 0)
                failed = self.shared_state.get("tasks_failed", 0)

                progress.update(overall_task, completed=completed + failed)

                # Create status table
                table = Table(title="Task Status")
                table.add_column("Category", style="cyan")
                table.add_column("Status", style="magenta")
                table.add_column("Count", justify="right", style="green")

                status_counts = {}
                for task in self.tasks.values():
                    status_counts[task.status.value] = (
                        status_counts.get(task.status.value, 0) + 1
                    )

                for status, count in status_counts.items():
                    table.add_row("Tasks", status, str(count))

                # Clear and print table
                self.console.clear()
                self.console.print(table)

                await asyncio.sleep(1)

    def shutdown(self):
        """Graceful shutdown."""
        logger.info("Shutting down orchestrator")

        # Signal workers to stop
        for _ in self.workers:
            self.control_queue.put("STOP")

        # Wait for workers to finish
        for worker in self.workers:
            worker.join(timeout=5)
            if worker.is_alive():
                worker.terminate()

        # Save final state
        self.state_store.save_state(
            "final_state",
            {
                "completed": self.shared_state.get("tasks_completed", 0),
                "failed": self.shared_state.get("tasks_failed", 0),
                "end_time": datetime.now().isoformat(),
            },
        )

        # Close state store
        self.state_store.close()

        self.shared_state["status"] = "stopped"
        logger.info("Orchestrator shutdown complete")

    def all_tasks_done(self) -> bool:
        """Check if all tasks are complete."""
        for task in self.tasks.values():
            if task.status not in [
                TaskStatus.COMPLETED,
                TaskStatus.FAILED,
                TaskStatus.CANCELLED,
            ]:
                return False
        return True

    def get_statistics(self) -> Dict[str, int]:
        """Get current task statistics."""
        stats = {
            "total": len(self.tasks),
            "completed": 0,
            "failed": 0,
            "pending": 0,
            "running": 0,
            "blocked": 0,
        }

        for task in self.tasks.values():
            if task.status == TaskStatus.COMPLETED:
                stats["completed"] += 1
            elif task.status == TaskStatus.FAILED:
                stats["failed"] += 1
            elif task.status == TaskStatus.PENDING:
                stats["pending"] += 1
            elif task.status == TaskStatus.RUNNING:
                stats["running"] += 1
            elif task.status == TaskStatus.BLOCKED:
                stats["blocked"] += 1

        return stats


def worker_process(
    worker_id: int,
    task_queue: Queue,
    result_queue: Queue,
    control_queue: Queue,
    shared_state: dict,
    project_root: Path,
):
    """Worker process for executing tasks."""
    logger = logging.getLogger(f"Worker-{worker_id}")
    logger.info(f"Worker {worker_id} started")

    while True:
        # Check for control messages
        try:
            control_msg = control_queue.get_nowait()
            if control_msg == "STOP":
                logger.info(f"Worker {worker_id} received stop signal")
                break
        except Empty:
            pass

        # Get next task
        try:
            priority, task_data = task_queue.get(timeout=1)
            task = Task.from_dict(task_data)
            logger.info(f"Worker {worker_id} executing task: {task.id}")

            # Execute task
            result = execute_task(task, project_root)

            # Send result back
            result_queue.put(
                {
                    "task_id": task.id,
                    "worker_id": worker_id,
                    "status": "completed" if result["success"] else "failed",
                    "result": result.get("output"),
                    "error": result.get("error"),
                }
            )

        except Empty:
            continue
        except Exception as e:
            logger.error(f"Worker {worker_id} error: {e}")

    logger.info(f"Worker {worker_id} stopped")


def execute_task(task: Task, project_root: Path) -> Dict[str, Any]:
    """Execute a single task by calling the appropriate worker function."""
    from scripts.migration_system.worker_tasks import execute_task as worker_execute

    try:
        # Convert Task to dict for worker
        task_dict = {"id": task.id, "type": task.type, "params": task.params}

        # Execute using worker library
        result = worker_execute(task_dict, project_root)

        return {
            "success": result.success,
            "output": result.output,
            "error": result.error,
            "metrics": result.metrics,
        }

    except Exception as e:
        return {"success": False, "output": None, "error": str(e)}


if __name__ == "__main__":
    # Test the orchestrator
    import asyncio

    project_root = Path(__file__).parent.parent.parent
    orchestrator = TaskOrchestrator(project_root, num_workers=4)

    # Define sample tasks
    test_tasks = [
        Task(
            id="scan",
            name="Scan docs",
            category="discovery",
            command="find docs -name '*.md' | wc -l",
        ),
        Task(
            id="list",
            name="List structure",
            category="discovery",
            command="ls -la docs/",
            dependencies={"scan"},
        ),
    ]

    orchestrator.load_tasks(test_tasks)
    asyncio.run(orchestrator.run())
