---
name: task-tracking
description: Track agent task progress in real-time via WebSocket
auto_invoke: false
---

# Task Tracking Skill

Monitor and display real-time progress for one or all agent tasks via the Pixel Market WebSocket.

## Usage

Invoke this skill with an optional task ID:
- `task-tracking` — track all active tasks
- `task-tracking <task_id>` — track a specific task

## Implementation

### Connect to WebSocket
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/tracker');

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  handleTrackerEvent(msg);
};
```

### Event Handling

```
msg.type === 'init'          → Initial state: all agents and tasks
msg.type === 'task_event'    → Progress update for a task
msg.type === 'task_complete' → Task finished
msg.type === 'agent_hired'   → New agent assigned to task
msg.type === 'agent_update'  → Agent animation state changed
msg.type === 'ping'          → Keep-alive (ignore)
```

### Display Format

For each `task_event`, format based on `event_type`:

| Type | Display |
|------|---------|
| `started` | `🚀 [HH:MM:SS] Starting: <message>` |
| `reasoning` | `💭 [HH:MM:SS]   → <message>` (indented) |
| `thinking` | `🤔 [HH:MM:SS] <message>` |
| `working` | `⚙️  [HH:MM:SS] <message>` |
| `checkpoint` | `✓  [HH:MM:SS] <message>` |
| `completed` | `✅ [HH:MM:SS] <message>` |
| `error` | `❌ [HH:MM:SS] ERROR: <message>` |

### Progress Bar
```
[████████████░░░░░░░░] 60%
```
Use `█` for filled, `░` for empty. Width = 20 chars. Fill = round(progress/5).

### Completion Detection

When `task_complete` is received:
1. Display final progress bar at 100%
2. Show total elapsed time
3. List all agent contributions (from event log)
4. Suggest next action: "Run /pixel-market:hire for your next task"

### Polling Fallback

If WebSocket is unavailable, fall back to polling:
```
GET http://localhost:8000/api/tasks/{task_id}
```
Poll every 3 seconds until `status === "COMPLETE"` or `"FAILED"`.

## Reasoning Chain Display

When `event_type === "reasoning"`, display the full chain-of-thought trace with proper indentation:

```
💭 Reasoning Chain:
   Step 1: Analyzing requirements → identifying 3 core components
   Step 2: Evaluating implementation strategies → selected approach A
   Step 3: Checking for edge cases → found 2 potential issues
   Step 4: Validating output against success criteria → all checks pass
```

Provide a "View Full Trace" option that expands to show all reasoning steps from the task's event log filtered by `event_type === "reasoning"`.
