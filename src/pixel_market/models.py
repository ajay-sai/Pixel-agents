"""Pydantic v2 models for Pixel Market."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator


class AgentSkill(str, Enum):
    CODE_GENERATION = "CODE_GENERATION"
    CODE_REVIEW = "CODE_REVIEW"
    DEBUGGING = "DEBUGGING"
    TESTING = "TESTING"
    DOCUMENTATION = "DOCUMENTATION"
    RESEARCH = "RESEARCH"
    DATA_ANALYSIS = "DATA_ANALYSIS"
    DEVOPS = "DEVOPS"
    FRONTEND = "FRONTEND"
    BACKEND = "BACKEND"
    SECURITY = "SECURITY"
    WRITING = "WRITING"


class AgentStatus(str, Enum):
    IDLE = "IDLE"
    WORKING = "WORKING"
    WAITING = "WAITING"
    COMPLETE = "COMPLETE"
    ERROR = "ERROR"


class TaskStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETE = "COMPLETE"
    FAILED = "FAILED"


class AgentSkillDefinition(BaseModel):
    id: str
    name: str
    description: str
    category: str


class MarketplaceAgent(BaseModel):
    id: str
    name: str
    description: str
    skills: list[AgentSkill]
    personality: str
    source_repo: str
    rating: float = Field(ge=0.0, le=5.0)
    installs: int = Field(ge=0)
    tags: list[str]
    prompt_template: str
    created_at: datetime
    is_featured: bool = False

    @field_validator("rating")
    @classmethod
    def round_rating(cls, v: float) -> float:
        return round(v, 1)


class TaskEvent(BaseModel):
    agent_id: str
    task_id: str
    event_type: str
    message: str
    timestamp: datetime
    metadata: dict[str, Any] = Field(default_factory=dict)


class AgentTask(BaseModel):
    id: str
    title: str
    description: str
    required_skills: list[AgentSkill]
    assigned_agent_id: str | None = None
    status: TaskStatus = TaskStatus.PENDING
    events: list[TaskEvent] = Field(default_factory=list)
    created_at: datetime
    started_at: datetime | None = None
    completed_at: datetime | None = None
    pixel_position: dict[str, int] = Field(default_factory=lambda: {"x": 0, "y": 0})
    progress: int = Field(ge=0, le=100, default=0)


class AgentInstance(BaseModel):
    id: str
    agent_id: str
    name: str
    status: AgentStatus = AgentStatus.IDLE
    current_task_id: str | None = None
    character_sprite: str
    pixel_position: dict[str, int] = Field(default_factory=lambda: {"x": 0, "y": 0})
    animation_state: str = "idle"
    skills: list[AgentSkill]
    parent_instance_id: str | None = None  # for sub-agents
    is_subagent: bool = False
    depth: int = 0  # nesting level


class RouterRequest(BaseModel):
    task_description: str
    required_skills: list[AgentSkill]
    preferred_tags: list[str] | None = None


class RouterResponse(BaseModel):
    selected_agent: MarketplaceAgent
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str
    alternatives: list[MarketplaceAgent]


class SkillDefinition(BaseModel):
    id: str
    name: str
    description: str
    category: str
    auto_invoke_pattern: str | None = None
    compatible_agents: list[str]
    prompt_template: str
    source_repo: str
    installs: int
    tags: list[str]
    created_at: datetime
