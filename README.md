# 🎮 Pixel Market

**A Pixel-style Marketplace for AI Agents** — like OpenRouter, but for agents.

Pixel Market merges concepts from six open-source projects into a unified platform:

| Source Repo | Concept Borrowed |
|---|---|
| [pablodelucca/pixel-agents](https://github.com/pablodelucca/pixel-agents) | Pixel-art office with AI agent characters doing live tasks |
| [preset-io/agor](https://github.com/preset-io/agor) | Spatial 2D canvas for orchestrating multiple AI coding assistants |
| [Jeffallan/claude-skills](https://github.com/Jeffallan/claude-skills) | Skills/workflows for Claude Code agents |
| [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | Specialized AI agent personalities |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | Curated collection of Claude subagents |
| [inclusionAI/AReaL](https://github.com/inclusionAI/AReaL) | AI research reasoning framework |

---

## 📊 Project Status

### ✅ What's Live

| Feature | Details |
|---|---|
| **FastAPI backend** | REST + WebSocket API (`/api/agents`, `/api/tasks`, `/api/route`, `/api/canvas`, `/ws/tracker`) |
| **Agent Registry** | 12 pre-loaded agents spanning Frontend, Backend, Security, DevOps, Data, Research, and Orchestration skills |
| **Marketplace tab** | Browse all 12 agents; filter by skill, tags, or "featured"; one-click install count |
| **Live Tracker tab** | Real-time task cards with progress bars; live event feed driven by WebSocket |
| **Canvas View tab** | AGOR-style 2D pixel canvas showing agent positions, task zones, and active assignments |
| **Auto-Hire tab** | Describe a task + select required skills → router picks the best-fit agent automatically |
| **WebSocket live updates** | Agents broadcast `task_created`, `agent_hired`, `task_event`, and `task_complete` events |
| **Task simulation** | New tasks are driven through a realistic 8-step progress simulation in the background |
| **Pydantic v2 models** | Fully typed `MarketplaceAgent`, `AgentTask`, `AgentInstance`, `RouterRequest/Response` |
| **Pixel UI** | Press Start 2P retro font, pixel-art CSS sprites (emoji), dark neon theme |
| **Test suite** | pytest tests for marketplace, router, and tracker modules |

### 🚧 Roadmap

| Feature | Status |
|---|---|
| Animated pixel-art character sprites (canvas + tracker) | Planned |
| Claude Code plugin structure (commands, skills, hooks) | Planned |
| Skills Library tab (from Jeffallan/claude-skills) | Planned |
| Sub-agent spawning visualization (parent → child links) | Planned |
| Claude Code session monitoring (WebSocket process watcher) | Planned |
| AGOR-style office layout (desks, zones, worktrees on canvas) | Planned |
| AReaL-inspired reasoning traces on task events | Planned |

---

## Architecture

```
pixel_market/
├── main.py          # FastAPI app, REST endpoints, WebSocket handler
├── models.py        # Pydantic v2 data models
├── marketplace.py   # In-memory agent registry + search/install logic
├── router.py        # Auto-hire skill-matching router
└── tracker.py       # Live task tracking, agent instances, WS pub/sub

static/
├── index.html       # Single-page app (4 tabs)
├── css/pixel.css    # Retro pixel-art theme
└── js/
    ├── app.js       # Tab navigation, stats, modals
    ├── marketplace.js  # Agent grid, search, filter, install
    ├── tracker.js      # Task cards, event feed, WS client
    └── pixel-canvas.js # AGOR-style 2D canvas renderer
```

**Tech stack:** Python 3.11 · FastAPI · Pydantic v2 · Uvicorn · WebSockets · Vanilla JS

---

## Quick Start

```bash
pip install -e ".[dev]"
uvicorn pixel_market.main:app --reload --host 0.0.0.0 --port 8000
# Open http://localhost:8000
```

## Running Tests

```bash
pytest
```
