#!/usr/bin/env python3
"""
Documentation Migration Orchestrator
Coordinates parallel execution of documentation migration tasks across multiple agents.
"""

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
import json
from pathlib import Path
import shutil
import sys
from threading import Lock
from typing import Any, Dict, List, Optional


# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))


class AgentStatus(Enum):
    IDLE = "idle"
    ACTIVE = "active"
    COMPLETE = "complete"
    ERROR = "error"


class PhaseStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETE = "complete"
    FAILED = "failed"


@dataclass
class AgentTask:
    """Represents a task for an agent."""

    id: str
    name: str
    command: Optional[str] = None
    script: Optional[str] = None
    dependencies: List[str] = field(default_factory=list)
    timeout: int = 300
    retry: int = 1
    critical: bool = False
    parallel: bool = False


@dataclass
class Agent:
    """Represents a worker agent."""

    id: str
    name: str
    status: AgentStatus = AgentStatus.IDLE
    progress: float = 0.0
    current_task: Optional[str] = None
    errors: List[str] = field(default_factory=list)
    completed_tasks: List[str] = field(default_factory=list)


class DocumentationOrchestrator:
    """Orchestrates parallel documentation migration."""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.docs_dir = project_root / "docs"
        self.scripts_dir = project_root / "scripts"

        # State management
        self.agents: Dict[str, Agent] = {}
        self.phase_status: Dict[str, PhaseStatus] = {
            "preparation": PhaseStatus.PENDING,
            "discovery": PhaseStatus.PENDING,
            "execution": PhaseStatus.PENDING,
            "validation": PhaseStatus.PENDING,
        }
        self.shared_state: Dict[str, Any] = {}
        self.state_lock = Lock()

        # Initialize agents
        self._initialize_agents()

        # Task definitions
        self.agent_tasks = self._define_tasks()

    def _initialize_agents(self):
        """Initialize worker agents."""
        agents_config = [
            ("agent_1", "Structure Architect"),
            ("agent_2", "Metadata Engineer"),
            ("agent_3", "Content Validator"),
            ("agent_4", "API Specialist"),
            ("agent_5", "Link Manager"),
            ("agent_6", "Security Auditor"),
            ("agent_7", "Quality Enhancer"),
            ("agent_8", "Report Generator"),
        ]

        for agent_id, name in agents_config:
            self.agents[agent_id] = Agent(id=agent_id, name=name)

    def _define_tasks(self) -> Dict[str, List[AgentTask]]:
        """Define tasks for each agent."""
        return {
            "agent_1": [
                AgentTask(
                    id="scan_structure",
                    name="Scan current structure",
                    command="python scripts/reorganize_docs.py --dry-run",
                    timeout=60,
                ),
                AgentTask(
                    id="reorganize",
                    name="Execute reorganization",
                    command="python scripts/reorganize_docs.py --execute",
                    timeout=300,
                    critical=True,
                ),
                AgentTask(
                    id="generate_redirects",
                    name="Generate redirect mappings",
                    script="self._generate_redirects()",
                    timeout=60,
                ),
            ],
            "agent_2": [
                AgentTask(
                    id="analyze_frontmatter",
                    name="Analyze existing frontmatter",
                    script="self._analyze_frontmatter()",
                    timeout=60,
                ),
                AgentTask(
                    id="generate_frontmatter",
                    name="Generate frontmatter for all files",
                    script="self._generate_all_frontmatter()",
                    timeout=600,
                    critical=True,
                    parallel=True,
                ),
            ],
            "agent_3": [
                AgentTask(
                    id="load_schemas",
                    name="Load validation schemas",
                    script="self._load_validation_schemas()",
                    timeout=30,
                ),
                AgentTask(
                    id="validate_all",
                    name="Validate all documents",
                    command="python scripts/validate_docs.py",
                    timeout=300,
                    dependencies=["agent_2.generate_frontmatter"],
                ),
            ],
            "agent_4": [
                AgentTask(
                    id="extract_openapi",
                    name="Extract OpenAPI spec",
                    script="self._extract_openapi()",
                    timeout=60,
                ),
                AgentTask(
                    id="generate_api_docs",
                    name="Generate API documentation",
                    command="python scripts/generate_api_docs.py",
                    timeout=180,
                    critical=True,
                    dependencies=["agent_1.reorganize"],
                ),
            ],
            "agent_5": [
                AgentTask(
                    id="scan_links",
                    name="Scan all document links",
                    script="self._scan_all_links()",
                    timeout=120,
                ),
                AgentTask(
                    id="fix_links",
                    name="Fix broken internal links",
                    script="self._fix_broken_links()",
                    timeout=300,
                    dependencies=["agent_1.reorganize"],
                ),
            ],
            "agent_6": [
                AgentTask(
                    id="scan_secrets",
                    name="Scan for secrets",
                    command="python scripts/anonymize_docs.py --scan",
                    timeout=120,
                    critical=True,
                ),
                AgentTask(
                    id="anonymize",
                    name="Anonymize sensitive data",
                    command="python scripts/anonymize_docs.py --execute",
                    timeout=180,
                ),
            ],
            "agent_7": [
                AgentTask(
                    id="analyze_quality",
                    name="Analyze content quality",
                    script="self._analyze_content_quality()",
                    timeout=120,
                ),
                AgentTask(
                    id="enhance_content",
                    name="Enhance content quality",
                    script="self._enhance_priority_docs()",
                    timeout=600,
                    dependencies=["agent_2.generate_frontmatter"],
                    parallel=True,
                ),
            ],
            "agent_8": [
                AgentTask(
                    id="generate_index",
                    name="Generate documentation index",
                    command="python scripts/generate_doc_index.py",
                    timeout=120,
                    dependencies=["agent_1.reorganize", "agent_2.generate_frontmatter"],
                ),
                AgentTask(
                    id="generate_report",
                    name="Generate final report",
                    command="python scripts/generate_doc_report.py",
                    timeout=120,
                    dependencies=["agent_3.validate_all"],
                ),
            ],
        }

    async def orchestrate(self):
        """Main orchestration logic."""
        print("🚀 Starting Documentation Migration Orchestration")
        print(f"   Project: {self.project_root}")
        print(f"   Agents: {len(self.agents)}")
        print("=" * 60)

        try:
            # Phase 0: Preparation
            await self._phase_preparation()

            # Phase 1: Parallel Discovery
            await self._phase_discovery()

            # Phase 2: Parallel Execution
            await self._phase_execution()

            # Phase 3: Validation
            await self._phase_validation()

            # Generate final report
            await self._generate_final_report()

            print("\n✅ Orchestration Complete!")

        except Exception as e:
            print(f"\n❌ Orchestration Failed: {e}")
            await self._rollback()
            raise

    async def _phase_preparation(self):
        """Phase 0: Sequential preparation."""
        print("\n📋 Phase 0: Preparation")
        self.phase_status["preparation"] = PhaseStatus.IN_PROGRESS

        # Backup documentation
        backup_dir = (
            self.docs_dir.parent
            / f"docs.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        )
        print(f"   Creating backup: {backup_dir}")
        shutil.copytree(self.docs_dir, backup_dir)

        # Initialize shared state
        self.shared_state = {
            "backup_dir": str(backup_dir),
            "start_time": datetime.now().isoformat(),
            "total_files": len(list(self.docs_dir.rglob("*.md"))),
            "conflicts": [],
            "completed_tasks": [],
        }

        self.phase_status["preparation"] = PhaseStatus.COMPLETE
        print("   ✅ Preparation complete")

    async def _phase_discovery(self):
        """Phase 1: Parallel discovery tasks."""
        print("\n🔍 Phase 1: Discovery (Parallel)")
        self.phase_status["discovery"] = PhaseStatus.IN_PROGRESS

        # Run discovery tasks in parallel
        discovery_tasks = [
            ("agent_1", ["scan_structure"]),
            ("agent_2", ["analyze_frontmatter"]),
            ("agent_3", ["load_schemas"]),
            ("agent_4", ["extract_openapi"]),
            ("agent_5", ["scan_links"]),
            ("agent_6", ["scan_secrets"]),
            ("agent_7", ["analyze_quality"]),
        ]

        await self._run_parallel_tasks(discovery_tasks)

        self.phase_status["discovery"] = PhaseStatus.COMPLETE
        print("   ✅ Discovery complete")

    async def _phase_execution(self):
        """Phase 2: Main execution phase."""
        print("\n⚙️ Phase 2: Execution (Parallel Groups)")
        self.phase_status["execution"] = PhaseStatus.IN_PROGRESS

        # Group A: Structure & Metadata (Independent)
        print("   Group A: Structure & Metadata")
        group_a_tasks = [
            ("agent_1", ["reorganize", "generate_redirects"]),
            ("agent_2", ["generate_frontmatter"]),
        ]
        await self._run_parallel_tasks(group_a_tasks)

        # Checkpoint 1
        print("   📍 Checkpoint 1: Structure complete")

        # Group B: Content & Security (Independent)
        print("   Group B: Content & Security")
        group_b_tasks = [
            ("agent_4", ["generate_api_docs"]),
            ("agent_6", ["anonymize"]),
            ("agent_7", ["enhance_content"]),
        ]
        await self._run_parallel_tasks(group_b_tasks)

        # Group C: Validation & Links (Depends on A)
        print("   Group C: Validation & Links")
        group_c_tasks = [
            ("agent_3", ["validate_all"]),
            ("agent_5", ["fix_links"]),
        ]
        await self._run_parallel_tasks(group_c_tasks)

        self.phase_status["execution"] = PhaseStatus.COMPLETE
        print("   ✅ Execution complete")

    async def _phase_validation(self):
        """Phase 3: Final validation."""
        print("\n✔️ Phase 3: Validation")
        self.phase_status["validation"] = PhaseStatus.IN_PROGRESS

        # Generate final outputs
        validation_tasks = [
            ("agent_8", ["generate_index", "generate_report"]),
        ]
        await self._run_parallel_tasks(validation_tasks)

        # Run final validation checks
        await self._run_final_validation()

        self.phase_status["validation"] = PhaseStatus.COMPLETE
        print("   ✅ Validation complete")

    async def _run_parallel_tasks(self, task_groups: List[tuple]):
        """Run tasks in parallel."""
        tasks = []
        for agent_id, task_ids in task_groups:
            agent = self.agents[agent_id]
            for task_id in task_ids:
                task = self._get_task(agent_id, task_id)
                if task:
                    tasks.append(self._execute_agent_task(agent, task))

        # Run all tasks in parallel
        await asyncio.gather(*tasks, return_exceptions=True)

    async def _execute_agent_task(self, agent: Agent, task: AgentTask):
        """Execute a single agent task."""
        agent.status = AgentStatus.ACTIVE
        agent.current_task = task.name

        print(f"   🤖 {agent.name}: {task.name}")

        try:
            if task.command:
                # Execute command
                result = await self._run_command(task.command, task.timeout)
            elif task.script:
                # Execute script function
                result = await self._run_script(task.script)
            else:
                result = {"status": "success"}

            agent.completed_tasks.append(task.id)
            agent.progress = (
                len(agent.completed_tasks) / len(self.agent_tasks[agent.id]) * 100
            )

            with self.state_lock:
                self.shared_state["completed_tasks"].append(f"{agent.id}.{task.id}")

            return result

        except Exception as e:
            agent.errors.append(f"{task.name}: {str(e)}")
            agent.status = AgentStatus.ERROR
            if task.critical:
                raise Exception(f"Critical task failed: {task.name} - {e}")
            return {"status": "error", "error": str(e)}

        finally:
            agent.current_task = None
            if not agent.errors:
                agent.status = (
                    AgentStatus.COMPLETE if agent.progress >= 100 else AgentStatus.IDLE
                )

    async def _run_command(self, command: str, timeout: int) -> Dict:
        """Run a shell command asynchronously."""
        try:
            proc = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=self.project_root,
            )

            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=timeout)

            return {
                "status": "success" if proc.returncode == 0 else "error",
                "stdout": stdout.decode() if stdout else "",
                "stderr": stderr.decode() if stderr else "",
                "returncode": proc.returncode,
            }
        except asyncio.TimeoutError:
            return {"status": "error", "error": f"Command timed out after {timeout}s"}

    async def _run_script(self, script: str) -> Dict:
        """Execute a script function."""
        # This would execute the actual script logic
        # For now, returning success
        return {"status": "success"}

    def _get_task(self, agent_id: str, task_id: str) -> Optional[AgentTask]:
        """Get a task by agent and task ID."""
        for task in self.agent_tasks.get(agent_id, []):
            if task.id == task_id:
                return task
        return None

    async def _run_final_validation(self):
        """Run final validation checks."""
        print("   Running final validation...")

        # Check Definition of Done criteria
        checks = [
            ("Schema compliance", "python scripts/validate_docs.py"),
            ("API coverage", "python scripts/check_doc_coverage.py"),
            ("Security scan", "python scripts/anonymize_docs.py --scan"),
        ]

        for check_name, command in checks:
            result = await self._run_command(command, timeout=60)
            status = "✅" if result["status"] == "success" else "❌"
            print(f"     {status} {check_name}")

    async def _generate_final_report(self):
        """Generate final orchestration report."""
        print("\n📊 Final Report")
        print("=" * 60)

        # Calculate metrics
        total_time = (
            datetime.now() - datetime.fromisoformat(self.shared_state["start_time"])
        ).total_seconds() / 60

        print(f"   Total Time: {total_time:.1f} minutes")
        print(f"   Files Processed: {self.shared_state['total_files']}")
        print(f"   Tasks Completed: {len(self.shared_state['completed_tasks'])}")

        print("\n   Agent Status:")
        for agent in self.agents.values():
            status_icon = "✅" if agent.status == AgentStatus.COMPLETE else "❌"
            print(f"     {status_icon} {agent.name}: {agent.progress:.0f}% complete")
            if agent.errors:
                for error in agent.errors:
                    print(f"        ⚠️ {error}")

        print("\n   Phase Status:")
        for phase, status in self.phase_status.items():
            status_icon = "✅" if status == PhaseStatus.COMPLETE else "❌"
            print(f"     {status_icon} {phase.title()}: {status.value}")

    async def _rollback(self):
        """Rollback on failure."""
        print("\n⚠️ Rolling back changes...")
        if "backup_dir" in self.shared_state:
            # Restore from backup
            backup_dir = Path(self.shared_state["backup_dir"])
            if backup_dir.exists():
                shutil.rmtree(self.docs_dir)
                shutil.copytree(backup_dir, self.docs_dir)
                print("   ✅ Restored from backup")

    def get_status(self) -> Dict:
        """Get current orchestration status."""
        return {
            "phases": {k: v.value for k, v in self.phase_status.items()},
            "agents": {
                agent_id: {
                    "name": agent.name,
                    "status": agent.status.value,
                    "progress": agent.progress,
                    "current_task": agent.current_task,
                    "errors": agent.errors,
                }
                for agent_id, agent in self.agents.items()
            },
            "shared_state": self.shared_state,
        }


async def main():
    """Main entry point."""
    project_root = Path(__file__).parent.parent
    orchestrator = DocumentationOrchestrator(project_root)

    try:
        await orchestrator.orchestrate()

        # Save final status
        status_file = project_root / "docs" / "_generated" / "orchestration_status.json"
        status_file.parent.mkdir(parents=True, exist_ok=True)
        with open(status_file, "w") as f:
            json.dump(orchestrator.get_status(), f, indent=2, default=str)

        print(f"\n📁 Status saved to: {status_file}")

    except KeyboardInterrupt:
        print("\n⚠️ Orchestration interrupted by user")
        await orchestrator._rollback()
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Orchestration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
