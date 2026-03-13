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


def test_spawn_subagent(t: AgentTracker) -> None:
    """spawn_subagent creates a child instance linked to the parent."""
    task_parent = t.create_task("Parent task", "Orchestrate subtasks", [AgentSkill.CODE_GENERATION])
    parent_inst = t.hire_agent("agent-012", task_parent.id)
    assert parent_inst is not None

    task_child = t.create_task("Child task", "Run tests", [AgentSkill.TESTING])
    sub = t.spawn_subagent(parent_inst.id, "agent-009", task_child.id)

    assert sub is not None
    assert sub.is_subagent is True
    assert sub.parent_instance_id == parent_inst.id
    assert sub.depth == parent_inst.depth + 1
    assert sub.current_task_id == task_child.id
    assert t.tasks[task_child.id].status == TaskStatus.IN_PROGRESS


def test_spawn_subagent_unknown_parent(t: AgentTracker) -> None:
    task = t.create_task("Orphan task", "No parent", [AgentSkill.TESTING])
    result = t.spawn_subagent("inst-nonexistent", "agent-009", task.id)
    assert result is None


def test_spawn_subagent_unknown_task(t: AgentTracker) -> None:
    task = t.create_task("Parent task", "Orchestrate", [AgentSkill.CODE_GENERATION])
    parent = t.hire_agent("agent-012", task.id)
    assert parent is not None
    result = t.spawn_subagent(parent.id, "agent-009", "task-nonexistent")
    assert result is None


def test_prepopulate_includes_subagents() -> None:
    """Default prepopulated tracker should have at least 1 sub-agent."""
    populated = AgentTracker(prepopulate=True)
    subagents = [i for i in populated.agent_instances.values() if i.is_subagent]
    assert len(subagents) >= 1, "Expected at least 1 pre-populated sub-agent"
    sub = subagents[0]
    assert sub.parent_instance_id is not None
    assert sub.depth == 1
    assert sub.parent_instance_id in populated.agent_instances


def test_agent_instance_has_subagent_fields(t: AgentTracker) -> None:
    """AgentInstance model should carry parent/subagent metadata."""
    task = t.create_task("Test fields", "Verify model", [AgentSkill.TESTING])
    inst = t.hire_agent("agent-001", task.id)
    assert inst is not None
    assert inst.parent_instance_id is None
    assert inst.is_subagent is False
    assert inst.depth == 0
