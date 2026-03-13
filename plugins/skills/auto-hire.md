---
name: auto-hire
description: Automatically select and hire the best-matched agent for any task
auto_invoke: true
trigger_pattern: "^(build|create|implement|fix|add|refactor|deploy|test|review|audit|document|analyse|research)"
---

# Auto-Hire Skill

This skill is **automatically invoked** when a user request begins with an action verb indicating a development task. It analyses the task context and selects the optimal agent without user intervention.

## Auto-Invocation Trigger

This skill activates when the user message matches: `(build|create|implement|fix|add|refactor|deploy|test|review|audit|document|analyse|research)`

## Execution Steps

### 1. Context Analysis
Read the following context signals:
- User message keywords
- Currently open files (file extensions reveal the domain)
- Recent conversation (mentions of frameworks, languages, requirements)
- Any error messages or code snippets present

### 2. Skill Inference
Map context signals to AgentSkill values:

| Signal | Skill(s) |
|--------|----------|
| `.tsx`, `.jsx`, `react`, `vue`, `css`, `ui`, `component` | FRONTEND |
| `.py`, `fastapi`, `django`, `flask`, `api`, `endpoint` | BACKEND |
| `docker`, `k8s`, `ci/cd`, `pipeline`, `deploy`, `github actions` | DEVOPS |
| `bug`, `error`, `crash`, `fails`, `broken`, `exception` | DEBUGGING |
| `test`, `coverage`, `jest`, `pytest`, `spec` | TESTING |
| `security`, `auth`, `oauth`, `jwt`, `vulnerability`, `cve` | SECURITY |
| `docs`, `readme`, `comment`, `jsdoc`, `docstring` | DOCUMENTATION |
| `data`, `analysis`, `chart`, `pandas`, `statistics` | DATA_ANALYSIS |
| `research`, `survey`, `compare`, `evaluate` | RESEARCH |
| `feature`, `function`, `class`, `module`, `implement` | CODE_GENERATION |
| `review`, `pr`, `merge`, `quality` | CODE_REVIEW |
| `write`, `copy`, `content`, `blog` | WRITING |

### 3. Tag Extraction
Extract specific technology tags from the context:
- Framework names: react, vue, fastapi, django, express, nextjs
- Languages: python, typescript, javascript, go, rust
- Infrastructure: docker, kubernetes, terraform, aws, gcp
- Tools: pytest, jest, webpack, vite, postgresql

### 4. Agent Selection
```
POST http://localhost:8000/api/route
{
  "task_description": "<inferred description>",
  "required_skills": ["<SKILL_1>", "<SKILL_2>"],
  "preferred_tags": ["<tag1>", "<tag2>"]
}
```

### 5. Task Creation and Hire
```
POST http://localhost:8000/api/tasks
→ returns task_id

POST http://localhost:8000/api/tasks/{task_id}/hire
→ starts agent simulation
```

### 6. Minimal User Report
Output a compact status line:
```
🤖 Auto-hired [Agent Name] (confidence: XX%) for [task summary]
   Track: /pixel-market:status
```

Do NOT interrupt the user's workflow — the hire happens in the background.

## Fallback Behaviour

If confidence < 0.5, ask the user to clarify the required skills before hiring.
If the API is unreachable, note it and continue assisting without hiring.
