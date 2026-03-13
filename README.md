# 🎮 Pixel Market

**A Pixel-style Marketplace for AI Agents** — like OpenRouter, but for agents. With live pixel-art characters that animate while they work.

Pixel Market merges concepts from six open-source projects into a unified platform:

| Source Repo | Concept Borrowed |
|---|---|
| [pablodelucca/pixel-agents](https://github.com/pablodelucca/pixel-agents) | Pixel-art office with animated AI agent characters |
| [preset-io/agor](https://github.com/preset-io/agor) | Spatial 2D canvas with office zones and worktree orchestration |
| [Jeffallan/claude-skills](https://github.com/Jeffallan/claude-skills) | 12-skill library with auto-invoke patterns |
| [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | Specialized AI agent personalities and workflows |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | Sub-agent spawning and parallel task coordination |
| [inclusionAI/AReaL](https://github.com/inclusionAI/AReaL) | Chain-of-thought reasoning traces on task events |

---

## Screenshots

### 🏪 Marketplace — Browse & hire from 12 specialized agents
![Marketplace](https://github.com/user-attachments/assets/8007ec89-fd34-4335-a716-a368553332e5)

### 📡 Live Tracker — Animated pixel-art sprites track agents while they work
![Live Tracker](https://github.com/user-attachments/assets/2f2bbec4-d99c-44b4-8268-5e281e2a0e3a)

### 🖼️ Canvas View — AGOR-style office layout with animated characters, sub-agents & zones
![Canvas View](https://github.com/user-attachments/assets/6303923b-8d09-40a3-bd57-562f7e7b5c1b)

### 🎯 Skills Library — 12 downloadable skills from all 6 source repos
![Skills Library](https://github.com/user-attachments/assets/1d117c98-a337-4529-8a15-a60045098801)

---

## Features

| Feature | Details |
|---|---|
| **Animated Pixel Characters** | Agents rendered as multi-frame pixel-art figures (programmatic `fillRect` sprites) with 5 animation states: idle bob, working arms, waiting blink, complete bounce, error shake |
| **Live Tracker Tab** | Task cards each have a 48×48 animated mini-sprite showing the assigned agent's status in real time |
| **Canvas View (AGOR-style)** | 5-zone office floor plan: Lobby, Development Floor, Review Station, Deployment Bay, Research Lab — each with pixel-art furniture (desks, server racks, round tables, lab tables) |
| **Sub-agent Visualization** | Parent agents have a ♛ crown; child sub-agents are connected by dotted lines; spawned via `POST /api/subagents` |
| **Skills Library Tab** | 12 downloadable skills (`.md` files) with auto-invoke patterns, compatible-agent lists, and "Attach to Task" action |
| **AReaL Reasoning Traces** | Task events include `→ Step N: …` reasoning steps and an expandable "View Reasoning Chain" per task card |
| **Claude Code Plugin** | Full plugin at `plugins/` with 3 commands (`/hire`, `/task`, `/status`), 2 agents, 2 skills, and a `SessionStart` hook |
| **Auto-Hire Router** | Describe a task + select skills → scores all agents (60% skill match + 20% rating + 10% installs + 10% tags) and returns best match with confidence + reasoning |
| **FastAPI Backend** | 14 REST endpoints + `/ws/tracker` WebSocket; background task simulations drive realistic progress events |
| **Next.js Live Dashboard** | Animated 20×12 pixel world where hired agents move and work in real time with per-agent pause/resume/cancel controls |
| **Auto-Hire API** | `POST /api/auto-hire` keyword-matches a task description to the optimal agent set with confidence score |
| **42 Python Tests** | pytest tests for marketplace, router, tracker, and skills modules |

---

## Architecture

This repository ships **two complementary implementations** of the Pixel Agents platform:

### 🐍 Python / FastAPI backend (`src/pixel_market/` + `static/`)

```
src/pixel_market/
├── main.py            # FastAPI app: REST + WebSocket + lifespan simulations
├── models.py          # Pydantic v2 models (agent, task, skill, sub-agent fields)
├── marketplace.py     # 12 pre-loaded agents from all 6 source repos
├── router.py          # Weighted skill-match router (OpenRouter-style)
├── tracker.py         # AgentTracker: live state, sub-agent spawning, WS pub/sub
└── skills_library.py  # 12 skills with prompt templates, auto-invoke patterns

static/
├── index.html         # 5-tab SPA: Marketplace · Tracker · Canvas · Auto-Hire · Skills
├── css/pixel.css      # Press Start 2P font, neon palette, pixel-border effects
└── js/
    ├── app.js         # Tab routing, WebSocket client with reconnect
    ├── marketplace.js # Agent grid, search, filter, install, hire
    ├── tracker.js     # Task cards + mini animated sprite canvases
    ├── pixel-canvas.js # Full pixel-art canvas: sprites, zones, furniture, sub-agent links
    └── skills.js      # Skills grid, search, download, attach
```

**Tech stack:** Python 3.11 · FastAPI · Pydantic v2 · Uvicorn · WebSockets · HTML5 Canvas · Vanilla JS

### ⚡ Next.js 15 / TypeScript frontend (`src/app/`)

```
src/
├── app/
│   ├── marketplace/page.tsx   # Browse & hire agents
│   ├── dashboard/page.tsx     # Animated 20×12 pixel world + AGOR task tree
│   ├── api/agents/route.ts    # Agent listing API
│   ├── api/auto-hire/route.ts # Keyword-match auto-hire endpoint
│   └── api/tasks/route.ts     # Task CRUD API
├── components/
│   ├── AgentWorld.tsx         # Live pixel world simulation
│   ├── AgorView.tsx           # AGOR-style hierarchical task tree
│   ├── AgentCard.tsx          # Marketplace card with hire action
│   ├── AgentControlPanel.tsx  # Per-agent pause/resume/cancel controls
│   ├── PixelSprite.tsx        # CSS pixel-art sprite renderer
│   ├── TaskPanel.tsx          # Task submission panel
│   └── TaskTracker.tsx        # Real-time task progress tracker
├── lib/
│   ├── store.ts               # In-memory singleton state store
│   ├── auto-hire.ts           # Keyword-to-agent matching logic
│   └── tasks.ts               # Task management utilities
└── types/index.ts             # Shared TypeScript types

CLAUDE.md                      # Auto-hire API contract for Claude Code
```

**Tech stack:** Next.js 15 · TypeScript · Tailwind CSS · React 19

### 🔌 Claude Code Plugin (`plugins/`)

```
plugins/
├── .claude-plugin/plugin.json
├── commands/          # /pixel-market:hire  /pixel-market:task  /pixel-market:status
├── agents/            # orchestrator  task-decomposer
├── skills/            # auto-hire  task-tracking
└── hooks/             # session-start.json
```

---

## Quick Start

### Python / FastAPI (full backend + pixel canvas frontend)

```bash
pip install -e ".[dev]"
uvicorn pixel_market.main:app --reload --host 0.0.0.0 --port 8000
# Open http://localhost:8000
```

### Next.js (React frontend with live dashboard)

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Running Tests

```bash
# Python tests (42 tests)
pytest

# Next.js build check
npm run build
```

## Claude Code Plugin

Install Pixel Market as a Claude Code plugin to use `/pixel-market:hire`, `/pixel-market:task`, and `/pixel-market:status` slash commands directly from your Claude Code session:

```bash
# Copy the plugin to your Claude Code plugins directory
cp -r plugins/ ~/.claude/plugins/pixel-market/
```

See [`plugins/README.md`](plugins/README.md) for full usage details.
