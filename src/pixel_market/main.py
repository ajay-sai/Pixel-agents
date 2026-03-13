"""FastAPI application entry point for Pixel Market."""

from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .marketplace import Marketplace, marketplace
from .models import AgentSkill, AgentTask, MarketplaceAgent, RouterRequest
from .router import AgentRouter, router as agent_router
from .skills_library import SkillsLibrary, skills_library
from .tracker import AgentTracker, tracker

logger = logging.getLogger(__name__)

_STATIC_DIR = Path(__file__).parent.parent.parent / "static"


# ---------------------------------------------------------------------------
# Lifespan: start background simulations for pre-populated tasks
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore[type-arg]
    # Kick off simulations for pre-populated in-progress tasks
    for task_id, task in tracker.tasks.items():
        from .models import TaskStatus

        if task.status == TaskStatus.IN_PROGRESS:
            tracker.start_simulation(task_id)
    yield


app = FastAPI(
    title="Pixel Market",
    description="Pixel-style AI Agent Marketplace with live task tracking",
    version="0.1.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# Static files
# ---------------------------------------------------------------------------

if _STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(_STATIC_DIR)), name="static")


@app.get("/", include_in_schema=False)
async def root() -> FileResponse:
    return FileResponse(str(_STATIC_DIR / "index.html"))


# ---------------------------------------------------------------------------
# Agent endpoints
# ---------------------------------------------------------------------------


@app.get("/api/agents", response_model=list[MarketplaceAgent])
async def list_agents(
    q: str | None = Query(default=None, description="Full-text search"),
    skills: list[AgentSkill] | None = Query(default=None),
    tags: list[str] | None = Query(default=None),
    featured: bool | None = Query(default=None),
) -> list[MarketplaceAgent]:
    results = marketplace.search_agents(query=q, skills=skills, tags=tags)
    if featured is True:
        results = [a for a in results if a.is_featured]
    elif featured is False:
        results = [a for a in results if not a.is_featured]
    return results


@app.get("/api/agents/{agent_id}", response_model=MarketplaceAgent)
async def get_agent(agent_id: str) -> MarketplaceAgent:
    agent = marketplace.get_agent_by_id(agent_id)
    if agent is None:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
    return agent


@app.post("/api/agents", response_model=MarketplaceAgent, status_code=201)
async def register_agent(agent: MarketplaceAgent) -> MarketplaceAgent:
    if marketplace.get_agent_by_id(agent.id):
        raise HTTPException(status_code=409, detail=f"Agent '{agent.id}' already exists")
    return marketplace.register_agent(agent)


@app.post("/api/agents/{agent_id}/install", response_model=MarketplaceAgent)
async def install_agent(agent_id: str) -> MarketplaceAgent:
    updated = marketplace.install_agent(agent_id)
    if updated is None:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
    await tracker.broadcast(
        {"type": "agent_installed", "agent_id": agent_id, "installs": updated.installs}
    )
    return updated


# ---------------------------------------------------------------------------
# Task endpoints
# ---------------------------------------------------------------------------


@app.get("/api/tasks", response_model=list[AgentTask])
async def list_tasks() -> list[AgentTask]:
    return list(tracker.tasks.values())


@app.post("/api/tasks", response_model=AgentTask, status_code=201)
async def create_task(body: dict[str, Any]) -> AgentTask:
    title = body.get("title", "Untitled Task")
    description = body.get("description", "")
    raw_skills = body.get("required_skills", [])
    try:
        skills = [AgentSkill(s) for s in raw_skills]
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    task = tracker.create_task(title=title, description=description, required_skills=skills)
    await tracker.broadcast({"type": "task_created", "task": task.model_dump()})
    return task


@app.get("/api/tasks/{task_id}", response_model=AgentTask)
async def get_task(task_id: str) -> AgentTask:
    task = tracker.tasks.get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")
    return task


@app.post("/api/tasks/{task_id}/hire", response_model=dict[str, Any])
async def hire_best_agent(task_id: str) -> dict[str, Any]:
    task = tracker.tasks.get(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")

    req = RouterRequest(
        task_description=task.description,
        required_skills=task.required_skills,
    )
    result = agent_router.route_task(req, marketplace)
    if result is None:
        raise HTTPException(status_code=503, detail="No agents available")

    instance = tracker.hire_agent(result.selected_agent.id, task_id)
    tracker.start_simulation(task_id)
    await tracker.broadcast(
        {
            "type": "agent_hired",
            "task_id": task_id,
            "agent_id": result.selected_agent.id,
            "agent_name": result.selected_agent.name,
            "confidence": result.confidence,
        }
    )
    return {
        "task_id": task_id,
        "agent": result.selected_agent,
        "confidence": result.confidence,
        "reasoning": result.reasoning,
        "instance": instance,
    }


@app.post("/api/tasks/{task_id}/complete", response_model=AgentTask)
async def complete_task(task_id: str) -> AgentTask:
    task = tracker.complete_task(task_id)
    if task is None:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")
    await tracker.broadcast(
        {"type": "task_complete", "task_id": task_id, "progress": 100}
    )
    return task


# ---------------------------------------------------------------------------
# Canvas / Router / Stats endpoints
# ---------------------------------------------------------------------------


@app.get("/api/canvas")
async def get_canvas() -> dict[str, Any]:
    return tracker.get_canvas_state()


@app.post("/api/route")
async def route_task(request: RouterRequest) -> dict[str, Any]:
    result = agent_router.route_task(request, marketplace)
    if result is None:
        raise HTTPException(status_code=503, detail="No agents available")
    return result.model_dump()


@app.get("/api/stats")
async def get_stats() -> dict[str, Any]:
    mstats = marketplace.get_stats()
    mstats["active_tasks"] = sum(
        1 for t in tracker.tasks.values() if t.status.value == "IN_PROGRESS"
    )
    mstats["total_tasks"] = len(tracker.tasks)
    mstats["running_agents"] = len(tracker.agent_instances)
    return mstats


# ---------------------------------------------------------------------------
# Skills endpoints
# ---------------------------------------------------------------------------


@app.get("/api/skills")
async def list_skills(
    q: str | None = Query(default=None, description="Full-text search"),
    category: str | None = Query(default=None, description="Filter by category"),
) -> list[dict[str, Any]]:
    results = skills_library.search_skills(query=q, category=category)
    return [s.model_dump() for s in results]


@app.get("/api/skills/{skill_id}")
async def get_skill(skill_id: str) -> dict[str, Any]:
    skill = skills_library.get_skill_by_id(skill_id)
    if skill is None:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_id}' not found")
    return skill.model_dump()


@app.post("/api/skills/{skill_id}/download")
async def download_skill(skill_id: str) -> dict[str, Any]:
    content = skills_library.download_skill(skill_id)
    if content is None:
        raise HTTPException(status_code=404, detail=f"Skill '{skill_id}' not found")
    skill = skills_library.get_skill_by_id(skill_id)
    return {
        "skill_id": skill_id,
        "filename": f"{skill_id}.md",
        "content": content,
        "name": skill.name if skill else skill_id,
    }


# ---------------------------------------------------------------------------
# WebSocket
# ---------------------------------------------------------------------------


@app.websocket("/ws/tracker")
async def ws_tracker(websocket: WebSocket) -> None:
    await websocket.accept()
    tracker.subscribe(websocket)
    # Send current state on connect
    try:
        await websocket.send_text(
            __import__("json").dumps(
                {"type": "init", "canvas": tracker.get_canvas_state()}, default=str
            )
        )
        while True:
            # Keep connection alive; client doesn't need to send anything
            await asyncio.sleep(30)
            await websocket.send_text('{"type":"ping"}')
    except WebSocketDisconnect:
        pass
    except Exception as exc:
        logger.debug("WebSocket closed: %s", exc)
    finally:
        tracker.unsubscribe(websocket)


# ---------------------------------------------------------------------------
# Dev runner
# ---------------------------------------------------------------------------


def run() -> None:  # pragma: no cover
    import uvicorn

    uvicorn.run("pixel_market.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":  # pragma: no cover
    run()
