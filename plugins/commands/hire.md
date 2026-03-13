---
description: Auto-hire the best agent for a task from the Pixel Market marketplace
---

# /pixel-market:hire

Analyze the current task context and automatically hire the best-matched agent from the Pixel Market.

## How to Use

When this command is invoked, you should:

1. **Analyze the task context**: Read the current task description, any open files, recent conversation, and infer the primary skill required (CODE_GENERATION, CODE_REVIEW, DEBUGGING, TESTING, DOCUMENTATION, RESEARCH, DATA_ANALYSIS, DEVOPS, FRONTEND, BACKEND, SECURITY, or WRITING).

2. **Build a routing request**: Construct a JSON body with:
   - `task_description`: A concise, accurate description of what needs to be done
   - `required_skills`: An array of skill names from the AgentSkill enum that match the task
   - `preferred_tags`: Optional tags that narrow the agent selection (e.g., ["react", "typescript"])

3. **Call the routing API**:
   ```
   POST http://localhost:8000/api/route
   Content-Type: application/json

   {
     "task_description": "<description>",
     "required_skills": ["<SKILL_1>", "<SKILL_2>"],
     "preferred_tags": ["<tag1>"]
   }
   ```

4. **Review the result**: The API returns:
   - `selected_agent`: The best-matched agent with name, description, rating, and skills
   - `confidence`: 0.0–1.0 score indicating match quality
   - `reasoning`: Human-readable explanation of why this agent was selected
   - `alternatives`: Up to 3 alternative agents if the primary doesn't fit

5. **Create a task and hire**:
   - POST to `/api/tasks` to create a task record
   - POST to `/api/tasks/{task_id}/hire` to assign the selected agent
   - The agent will begin simulation immediately

6. **Report to user**: Summarize which agent was hired, their confidence score, and how to monitor progress using `/pixel-market:status`.

## Example Interaction

User: "I need to add OAuth2 authentication to my FastAPI app"

You should:
- Detect skills: BACKEND, SECURITY
- Tags: ["fastapi", "oauth2", "python"]
- Call `/api/route` with these parameters
- Likely result: Security Auditor or API Architect with high confidence
- Create task + hire
- Report: "Hired Security Auditor (confidence: 87%) for OAuth2 implementation. Track at /pixel-market:status"
