"""Live task tracking and agent state management."""

from __future__ import annotations

import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import WebSocket

from .models import (
    AgentInstance,
    AgentSkill,
    AgentStatus,
    AgentTask,
    TaskEvent,
    TaskStatus,
)

logger = logging.getLogger(__name__)

_SPRITES = ["🧙", "🕵️", "🤖", "👾", "🦾", "🧬", "🛸", "🎮", "⚡", "🔮", "🦊", "🎯"]

_SAMPLE_EVENTS: list[tuple[str, str]] = [
    ("started", "Analyzing task requirements…"),
    ("thinking", "Breaking down the problem into subtasks…"),
    ("working", "Generating initial implementation…"),
    ("checkpoint", "Running internal validation…"),
    ("working", "Refining output based on constraints…"),
    ("checkpoint", "Cross-checking against best practices…"),
    ("working", "Finalizing implementation…"),
    ("completed", "Task completed successfully ✓"),
]

# Simulation timing (seconds)
_SIM_INITIAL_DELAY = 4
_SIM_STEP_DELAY = 2


def _now() -> datetime:
    return datetime.now(tz=timezone.utc)


def _make_event(
    agent_id: str,
    task_id: str,
    event_type: str,
    message: str,
    metadata: dict[str, Any] | None = None,
) -> TaskEvent:
    return TaskEvent(
        agent_id=agent_id,
        task_id=task_id,
        event_type=event_type,
        message=message,
        timestamp=_now(),
        metadata=metadata or {},
    )


class AgentTracker:
    """Central tracker for agent instances and tasks."""

    def __init__(self, *, prepopulate: bool = True) -> None:
        self.agent_instances: dict[str, AgentInstance] = {}
        self.tasks: dict[str, AgentTask] = {}
        self.event_log: list[TaskEvent] = []
        self.subscribers: list[WebSocket] = []
        self._simulation_tasks: dict[str, asyncio.Task[None]] = {}

        if prepopulate:
            self._prepopulate()

    # ------------------------------------------------------------------
    # Prepopulation
    # ------------------------------------------------------------------

    def _prepopulate(self) -> None:
        """Seed tracker with 3 running agents and sample tasks."""
        seeds = [
            {
                "agent_id": "agent-001",
                "name": "Frontend Wizard",
                "sprite": "🧙",
                "skills": [AgentSkill.FRONTEND, AgentSkill.CODE_GENERATION, AgentSkill.DEBUGGING],
                "task_title": "Build responsive dashboard UI",
                "task_desc": "Create a pixel-art styled dashboard with live stats widgets",
                "req_skills": [AgentSkill.FRONTEND, AgentSkill.CODE_GENERATION],
                "px": {"x": 120, "y": 180},
                "tx": {"x": 200, "y": 200},
                "progress": 45,
            },
            {
                "agent_id": "agent-007",
                "name": "Security Auditor",
                "sprite": "🕵️",
                "skills": [AgentSkill.SECURITY, AgentSkill.CODE_REVIEW],
                "task_title": "Audit authentication flow",
                "task_desc": "Full security audit of the OAuth2 + JWT implementation",
                "req_skills": [AgentSkill.SECURITY, AgentSkill.CODE_REVIEW],
                "px": {"x": 350, "y": 250},
                "tx": {"x": 420, "y": 270},
                "progress": 68,
            },
            {
                "agent_id": "agent-012",
                "name": "Pixel Canvas Orchestrator",
                "sprite": "🎮",
                "skills": [AgentSkill.CODE_GENERATION, AgentSkill.DEVOPS],
                "task_title": "Set up CI/CD pipeline",
                "task_desc": "Configure GitHub Actions workflow with test, lint, deploy stages",
                "req_skills": [AgentSkill.DEVOPS, AgentSkill.CODE_GENERATION],
                "px": {"x": 580, "y": 150},
                "tx": {"x": 600, "y": 170},
                "progress": 22,
            },
        ]

        for seed in seeds:
            task = AgentTask(
                id=f"task-{uuid.uuid4().hex[:8]}",
                title=seed["task_title"],
                description=seed["task_desc"],
                required_skills=seed["req_skills"],
                assigned_agent_id=seed["agent_id"],
                status=TaskStatus.IN_PROGRESS,
                created_at=_now(),
                started_at=_now(),
                pixel_position=seed["tx"],
                progress=seed["progress"],
            )
            instance = AgentInstance(
                id=f"inst-{uuid.uuid4().hex[:8]}",
                agent_id=seed["agent_id"],
                name=seed["name"],
                status=AgentStatus.WORKING,
                current_task_id=task.id,
                character_sprite=seed["sprite"],
                pixel_position=seed["px"],
                animation_state="working",
                skills=seed["skills"],
            )
            # Add a couple of starter events
            for etype, msg in _SAMPLE_EVENTS[:2]:
                ev = _make_event(seed["agent_id"], task.id, etype, msg)
                task.events.append(ev)
                self.event_log.append(ev)

            self.tasks[task.id] = task
            self.agent_instances[instance.id] = instance

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def create_task(
        self,
        title: str,
        description: str,
        required_skills: list[AgentSkill],
    ) -> AgentTask:
        task = AgentTask(
            id=f"task-{uuid.uuid4().hex[:8]}",
            title=title,
            description=description,
            required_skills=required_skills,
            created_at=_now(),
            pixel_position={"x": 50 + len(self.tasks) * 30 % 700, "y": 50},
        )
        self.tasks[task.id] = task
        return task

    def hire_agent(self, agent_id: str, task_id: str) -> AgentInstance | None:
        task = self.tasks.get(task_id)
        if task is None:
            return None

        # Check for existing instance for this agent
        instance = next(
            (i for i in self.agent_instances.values() if i.agent_id == agent_id), None
        )
        if instance is None:
            instance = AgentInstance(
                id=f"inst-{uuid.uuid4().hex[:8]}",
                agent_id=agent_id,
                name=agent_id,
                status=AgentStatus.WORKING,
                current_task_id=task_id,
                character_sprite=_SPRITES[len(self.agent_instances) % len(_SPRITES)],
                pixel_position={"x": 100 + len(self.agent_instances) * 40 % 600, "y": 300},
                animation_state="working",
                skills=[],
            )
            self.agent_instances[instance.id] = instance
        else:
            self.agent_instances[instance.id] = instance.model_copy(
                update={
                    "status": AgentStatus.WORKING,
                    "current_task_id": task_id,
                    "animation_state": "working",
                }
            )

        self.tasks[task_id] = task.model_copy(
            update={
                "assigned_agent_id": agent_id,
                "status": TaskStatus.IN_PROGRESS,
                "started_at": _now(),
            }
        )
        return self.agent_instances[instance.id]

    def update_agent_status(
        self,
        agent_id: str,
        status: AgentStatus,
        animation_state: str = "idle",
    ) -> None:
        instance = next(
            (i for i in self.agent_instances.values() if i.agent_id == agent_id), None
        )
        if instance:
            self.agent_instances[instance.id] = instance.model_copy(
                update={"status": status, "animation_state": animation_state}
            )

    def add_task_event(
        self,
        task_id: str,
        event_type: str,
        message: str,
        metadata: dict[str, Any] | None = None,
    ) -> TaskEvent | None:
        task = self.tasks.get(task_id)
        if task is None:
            return None
        agent_id = task.assigned_agent_id or ""
        ev = _make_event(agent_id, task_id, event_type, message, metadata)
        task.events.append(ev)
        self.event_log.append(ev)
        # keep task events bounded
        if len(task.events) > 50:
            task.events = task.events[-50:]
        return ev

    def complete_task(self, task_id: str) -> AgentTask | None:
        task = self.tasks.get(task_id)
        if task is None:
            return None
        self.tasks[task_id] = task.model_copy(
            update={
                "status": TaskStatus.COMPLETE,
                "completed_at": _now(),
                "progress": 100,
            }
        )
        if task.assigned_agent_id:
            self.update_agent_status(
                task.assigned_agent_id, AgentStatus.IDLE, "idle"
            )
        return self.tasks[task_id]

    def get_canvas_state(self) -> dict[str, Any]:
        return {
            "agents": [a.model_dump() for a in self.agent_instances.values()],
            "tasks": [t.model_dump() for t in self.tasks.values()],
            "zones": [
                {"id": "marketplace", "label": "Marketplace Zone", "x": 0, "y": 0, "w": 266, "h": 500},
                {"id": "active", "label": "Active Tasks Zone", "x": 267, "y": 0, "w": 266, "h": 500},
                {"id": "completed", "label": "Completed Zone", "x": 534, "y": 0, "w": 266, "h": 500},
            ],
            "timestamp": _now().isoformat(),
        }

    # ------------------------------------------------------------------
    # WebSocket pub/sub
    # ------------------------------------------------------------------

    def subscribe(self, websocket: WebSocket) -> None:
        self.subscribers.append(websocket)

    def unsubscribe(self, websocket: WebSocket) -> None:
        self.subscribers = [s for s in self.subscribers if s is not websocket]

    async def broadcast(self, event: dict[str, Any]) -> None:
        dead: list[WebSocket] = []
        payload = json.dumps(event, default=str)
        for ws in self.subscribers:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.unsubscribe(ws)

    # ------------------------------------------------------------------
    # Simulation
    # ------------------------------------------------------------------

    async def simulate_task_progress(self, task_id: str) -> None:
        """Drive a task through realistic progress events."""
        task = self.tasks.get(task_id)
        if task is None:
            return

        event_pairs = list(_SAMPLE_EVENTS)

        # Initial delay before emitting any simulated events.
        await asyncio.sleep(_SIM_INITIAL_DELAY)

        for idx, (etype, msg) in enumerate(event_pairs):
            # Apply a constant step delay between events after the first.
            if idx > 0:
                await asyncio.sleep(_SIM_STEP_DELAY)

            task = self.tasks.get(task_id)
            if task is None or task.status == TaskStatus.COMPLETE:
                return

            is_final = idx == len(event_pairs) - 1
            progress = min(100, int((idx + 1) / len(event_pairs) * 100))

            ev = self.add_task_event(task_id, etype, msg)
            self.tasks[task_id] = self.tasks[task_id].model_copy(
                update={"progress": progress}
            )

            await self.broadcast(
                {
                    "type": "task_event",
                    "task_id": task_id,
                    "event_type": etype,
                    "message": msg,
                    "progress": progress,
                    "timestamp": ev.timestamp.isoformat() if ev else _now().isoformat(),
                }
            )

            if is_final:
                self.complete_task(task_id)
                await self.broadcast(
                    {
                        "type": "task_complete",
                        "task_id": task_id,
                        "progress": 100,
                        "timestamp": _now().isoformat(),
                    }
                )
                return

    def start_simulation(self, task_id: str) -> None:
        """Schedule simulation as a background asyncio task."""
        if task_id not in self._simulation_tasks:
            loop = asyncio.get_event_loop()
            t = loop.create_task(self.simulate_task_progress(task_id))
            self._simulation_tasks[task_id] = t


# Module-level singleton
tracker = AgentTracker()
