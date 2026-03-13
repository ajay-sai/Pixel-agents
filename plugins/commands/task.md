---
description: Create and track a new agent task with real-time progress monitoring
---

# /pixel-market:task

Create a structured agent task in the Pixel Market tracker and monitor it in real time.

## How to Use

When this command is invoked with a task description, you should:

1. **Parse the task input**: Extract or prompt for:
   - `title`: A short, descriptive task title (≤60 characters)
   - `description`: A detailed description of exactly what needs to be accomplished
   - `required_skills`: List of skills from the enum (CODE_GENERATION, CODE_REVIEW, DEBUGGING, TESTING, DOCUMENTATION, RESEARCH, DATA_ANALYSIS, DEVOPS, FRONTEND, BACKEND, SECURITY, WRITING)

2. **Create the task**:
   ```
   POST http://localhost:8000/api/tasks
   Content-Type: application/json

   {
     "title": "<short title>",
     "description": "<detailed description>",
     "required_skills": ["<SKILL_1>"]
   }
   ```
   Save the returned `task_id`.

3. **Auto-hire the best agent**:
   ```
   POST http://localhost:8000/api/tasks/{task_id}/hire
   ```
   This automatically routes to the best agent and starts simulation.

4. **Monitor progress**: Poll or watch the WebSocket at `ws://localhost:8000/ws/tracker` for `task_event` messages with the matching `task_id`.

5. **Report live updates**: As events arrive, display them to the user in a readable format:
   - `started` events: Show agent beginning work
   - `reasoning` events: Display indented chain-of-thought steps
   - `checkpoint` events: Show validation milestones
   - `completed` events: Confirm task success

6. **Task completion**: When a `task_complete` WebSocket event arrives, report the final status and suggest next steps.

## Task Lifecycle

```
PENDING → IN_PROGRESS → COMPLETE
               ↓
            FAILED (on error)
```

## Example Output Format

```
📋 Task Created: task-abc12345
   Title: "Add OAuth2 to FastAPI"
   Skills: BACKEND, SECURITY
   
🤖 Hired: Security Auditor (confidence: 91%)

📡 Live Progress:
   [10:23:01] started    — Analyzing task requirements…
   [10:23:05] reasoning  →   Step 1: Identifying auth flow components
   [10:23:09] reasoning  →   Step 2: Evaluating OAuth2 vs JWT approach
   [10:23:13] working    — Generating initial implementation…
   [10:23:21] checkpoint — Running internal validation…
   [10:23:29] completed  — Task completed successfully ✓

✅ Task COMPLETE (progress: 100%)
```
