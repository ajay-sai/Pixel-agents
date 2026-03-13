# Claude Code Integration - Pixel Agents

## Overview
Pixel Agents is an AI agent marketplace where you can hire specialized agents to complete development tasks.

## Auto-Hire Instructions

When you receive a task, automatically:
1. Analyze the task description for relevant keywords
2. POST to `/api/auto-hire` with `{ "description": "<task>" }`
3. The system returns the optimal set of agents to hire
4. Hire agents via POST `/api/agents` with `{ "agentId": "<id>" }`
5. Create a task via POST `/api/tasks` with `{ "description", "agentIds" }`
6. Monitor progress via GET `/api/tasks`

## Available Agents

| Agent | Type | Skills | Cost |
|-------|------|--------|------|
| CodeBot | Coder | coding, refactoring, TypeScript, Python | 8¢ |
| BugHunter | Debugger | debugging, testing, tracing, profiling | 7¢ |
| DataMind | Researcher | search, summarization, analysis, web | 6¢ |
| SysForge | Architect | architecture, planning, design-patterns | 10¢ |
| QADroid | Tester | testing, automation, coverage, e2e | 5¢ |
| PipeBot | DevOps | docker, kubernetes, CI/CD, terraform | 9¢ |
| PixelCraft | Designer | design, accessibility, CSS, Figma | 7¢ |
| DataLens | Analyst | analysis, reporting, SQL, visualization | 6¢ |

## Auto-Hire Keyword Mapping

- `code, implement, build, develop` → CodeBot (Coder)
- `bug, fix, error, crash` → BugHunter (Debugger)
- `research, find, search` → DataMind (Researcher)
- `architect, design, system, plan` → SysForge (Architect)
- `test, qa, coverage, verify` → QADroid (Tester)
- `deploy, ci, docker, kubernetes` → PipeBot (DevOps)
- `ui, ux, interface, style` → PixelCraft (Designer)
- `analyze, data, report, metrics` → DataLens (Analyst)

## API Reference

### GET /api/agents
Returns all agents with current status.

### POST /api/agents
Body: `{ "agentId": string }`
Hires an agent (status: available → hired).

### GET /api/tasks
Returns all tasks with subtasks and progress.

### POST /api/tasks
Body: `{ "title"?: string, "description": string, "agentIds": string[] }`
Creates a new task and sets agents to working status.

### POST /api/auto-hire
Body: `{ "description": string }`
Returns: `{ "agents": Agent[], "reasoning": Record<string, string> }`
Analyzes description and returns optimal agents to hire.

## Development

```bash
npm run dev    # Start dev server on :3000
npm run build  # Production build
npm run lint   # Run ESLint
```

## Architecture

- **Next.js 14** with App Router
- **TypeScript** with strict mode
- **Tailwind CSS** with pixel art theme
- **In-memory store** (lib/store.ts) for agent/task state
- **Press Start 2P** font for pixel aesthetic
- Real-time updates via polling (3s interval)
