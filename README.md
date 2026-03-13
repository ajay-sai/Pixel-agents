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

## Features

- 🏪 **Agent Marketplace** — Browse, search, and install AI agents by skill
- 📡 **Live Task Tracker** — Real-time WebSocket updates on running agent tasks
- 🖼️ **Pixel Canvas View** — AGOR-style 2D canvas showing agent positions and zones
- 🤖 **Auto-Hire Router** — Automatically matches tasks to the best available agent

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
