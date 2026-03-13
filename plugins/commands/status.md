---
description: Show live status of all running agents and tasks in the Pixel Market
---

# /pixel-market:status

Display a real-time dashboard of all active agents, running tasks, and recent events.

## How to Use

When this command is invoked, you should:

1. **Fetch current state** from these endpoints:

   ```
   GET http://localhost:8000/api/tasks
   GET http://localhost:8000/api/canvas
   GET http://localhost:8000/api/stats
   ```

2. **Format the status report** as follows:

   ### Marketplace Stats
   Show: total agents, total installs, active tasks, average rating.

   ### Running Agents
   For each agent instance with status WORKING or WAITING:
   - Agent name and sprite emoji
   - Current task title
   - Task progress (%)
   - Animation state
   - Whether it is a sub-agent (show parent name if so)

   ### Task Queue
   List tasks grouped by status:
   - 🟡 IN_PROGRESS: Show assigned agent, progress bar, last event
   - 🔵 PENDING: Show required skills, waiting for agent
   - ✅ COMPLETE: Show completion time
   - ❌ FAILED: Show error details

   ### Recent Events (last 10)
   Show timestamped event log with type and message.
   For `reasoning` events, indent with `→` prefix.

3. **Live monitoring**: Optionally connect to `ws://localhost:8000/ws/tracker` and stream updates until the user cancels.

## Example Output

```
╔══════════════════════════════════════╗
║      🎮 PIXEL MARKET STATUS          ║
╚══════════════════════════════════════╝

📊 STATS  Agents: 12 | Installs: 47,832 | Active: 3 | Rating: 4.7★

🤖 RUNNING AGENTS
  🧙 Frontend Wizard    → Build responsive dashboard UI    [████████░░] 45%
  🕵️ Security Auditor   → Audit authentication flow        [█████████████░] 68%
  🎮 Pixel Orchestrator → Set up CI/CD pipeline            [████░░░░░░] 22%
  ⚡  Test Engineer ↳   → Run test suite for CI/CD         [██░░░░░░░░] 10%  (sub-agent)

📋 TASKS
  🟡 Build responsive dashboard UI      agent-001  45%   last: "Running internal validation…"
  🟡 Audit authentication flow          agent-007  68%   last: "Refining output…"
  🟡 Set up CI/CD pipeline              agent-012  22%   last: "Breaking down the problem…"

📡 RECENT EVENTS
  10:25:01  checkpoint  Tests passed — step 3
  10:24:58  reasoning → Step 2: Evaluating implementation strategies
  10:24:55  working     Generating initial implementation…
```
