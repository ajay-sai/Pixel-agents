"""Tests for the AgentTracker."""

from __future__ import annotations

import pytest

from pixel_market.models import AgentSkill, AgentStatus, TaskStatus
from pixel_market.tracker import AgentTracker


@pytest.fixture()
def t() -> AgentTracker:
    """Fresh tracker with no pre-populated data."""
    return AgentTracker(prepopulate=False)


def test_create_task(t: AgentTracker) -> None:
    task = t.create_task(
        title="Write unit tests",
        description="Add coverage for all modules",
        required_skills=[AgentSkill.TESTING],
    )
    assert task.id.startswith("task-")
    assert task.title == "Write unit tests"
    assert task.status == TaskStatus.PENDING
    assert task.progress == 0
    assert task.assigned_agent_id is None
    assert task.id in t.tasks


def test_hire_agent(t: AgentTracker) -> None:
    task = t.create_task("Fix login bug", "JWT refresh fails", [AgentSkill.DEBUGGING])
    instance = t.hire_agent("agent-003", task.id)
    assert instance is not None
    assert instance.agent_id == "agent-003"
    assert instance.current_task_id == task.id
    assert instance.status == AgentStatus.WORKING

    updated_task = t.tasks[task.id]
    assert updated_task.assigned_agent_id == "agent-003"
    assert updated_task.status == TaskStatus.IN_PROGRESS


def test_hire_agent_unknown_task(t: AgentTracker) -> None:
    result = t.hire_agent("agent-001", "task-nonexistent")
    assert result is None


def test_add_task_event(t: AgentTracker) -> None:
    task = t.create_task("Deploy to prod", "Release v2.0", [AgentSkill.DEVOPS])
    t.hire_agent("agent-006", task.id)

    ev = t.add_task_event(task.id, "checkpoint", "Tests passed", {"step": 3})
    assert ev is not None
    assert ev.event_type == "checkpoint"
    assert ev.message == "Tests passed"
    assert ev.metadata == {"step": 3}
    assert ev in t.event_log

    task_events = t.tasks[task.id].events
    assert ev in task_events


def test_complete_task(t: AgentTracker) -> None:
    task = t.create_task("Audit deps", "Check for CVEs", [AgentSkill.SECURITY])
    t.hire_agent("agent-007", task.id)

    completed = t.complete_task(task.id)
    assert completed is not None
    assert completed.status == TaskStatus.COMPLETE
    assert completed.progress == 100
    assert completed.completed_at is not None


def test_get_canvas_state(t: AgentTracker) -> None:
    task = t.create_task("Canvas task", "Test canvas", [AgentSkill.FRONTEND])
    t.hire_agent("agent-001", task.id)

    state = t.get_canvas_state()
    assert "agents" in state
    assert "tasks" in state
    assert "zones" in state
    assert "timestamp" in state
    assert isinstance(state["agents"], list)
    assert len(state["agents"]) >= 1


def test_task_events_bounded(t: AgentTracker) -> None:
    """Event list per task should not grow unbounded."""
    task = t.create_task("Many events", "Stress test", [AgentSkill.TESTING])
    t.hire_agent("agent-009", task.id)

    for i in range(60):
        t.add_task_event(task.id, "working", f"Step {i}")

    assert len(t.tasks[task.id].events) <= 50
