# Pixel Market — Claude Code Plugin

A Claude Code plugin that connects your coding sessions to the Pixel Market AI agent marketplace. Hire specialised agents, track their progress in real time, and orchestrate multi-agent workflows directly from Claude Code.

## Features

- **Auto-Hire**: Automatically select the best-matched agent based on your task context
- **Live Tracking**: Real-time WebSocket progress updates with chain-of-thought reasoning traces
- **Multi-Agent Orchestration**: Spawn parallel sub-agents for complex tasks
- **Skills Library**: 12+ reusable skill prompts from top AI repos
- **Pixel Canvas**: AGOR-style 2D office layout with animated pixel-art agents

## Commands

| Command | Description |
|---------|-------------|
| `/pixel-market:hire` | Auto-hire the best agent for your current task |
| `/pixel-market:task` | Create a tracked task and monitor its progress |
| `/pixel-market:status` | Show live status of all running agents |

## Agents

| Agent | Description |
|-------|-------------|
| `orchestrator` | Coordinates multiple agents across tasks |
| `task-decomposer` | Breaks complex tasks into parallel subtasks |

## Skills

| Skill | Auto-invoked | Description |
|-------|-------------|-------------|
| `auto-hire` | Yes (on action verbs) | Automatically selects and hires agents |
| `task-tracking` | No | Real-time task progress monitoring |

## Installation

1. Start the Pixel Market server:
   ```bash
   cd /path/to/pixel-agents
   pip install -e .
   pixel-market
   ```

2. Install this plugin in Claude Code:
   ```bash
   claude plugins install ./plugins
   ```

3. Verify installation:
   ```
   /pixel-market:status
   ```

## API Reference

The plugin communicates with a local FastAPI server at `http://localhost:8000`.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents` | GET | List all marketplace agents |
| `/api/tasks` | GET/POST | List or create tasks |
| `/api/tasks/{id}/hire` | POST | Auto-hire best agent for task |
| `/api/route` | POST | Route task to best agent |
| `/api/skills` | GET | List skills library |
| `/api/stats` | GET | Marketplace statistics |
| `/ws/tracker` | WS | Live task updates |

## Source Repositories

This plugin integrates patterns and concepts from:
- [pablodelucca/pixel-agents](https://github.com/pablodelucca/pixel-agents) — pixel-art office with animated characters
- [preset-io/agor](https://github.com/preset-io/agor) — spatial 2D canvas orchestration
- [Jeffallan/claude-skills](https://github.com/Jeffallan/claude-skills) — skills/workflows for Claude Code
- [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) — specialised AI agent personalities
- [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) — Claude subagent collection
- [inclusionAI/AReaL](https://github.com/inclusionAI/AReaL) — AI reasoning/research framework

## License

MIT
