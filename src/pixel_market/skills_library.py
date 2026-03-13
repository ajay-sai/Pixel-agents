"""Skills registry for Pixel Market — inspired by Jeffallan/claude-skills."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from .models import SkillDefinition

_EPOCH = datetime(2024, 1, 1, tzinfo=timezone.utc)


def _now() -> datetime:
    return datetime.now(tz=timezone.utc)


_SKILLS: list[SkillDefinition] = [
    SkillDefinition(
        id="skill-frontend-design",
        name="Frontend Design Skill",
        description=(
            "Comprehensive frontend design and implementation skill. Auto-invoked for any task "
            "involving UI components, styling, or visual layouts. Provides structured guidance on "
            "component architecture, responsive design patterns, accessibility best practices, "
            "and pixel-perfect implementation using modern CSS and JavaScript frameworks."
        ),
        category="frontend",
        auto_invoke_pattern=r"(frontend|ui|css|react|vue|component|layout|design|responsive)",
        compatible_agents=["agent-001", "agent-011"],
        prompt_template=(
            "You are an expert frontend engineer. When working on UI tasks:\n"
            "1. First audit the existing component structure and identify reuse opportunities.\n"
            "2. Propose a component hierarchy before writing any code.\n"
            "3. Use semantic HTML5 elements and ARIA roles for accessibility.\n"
            "4. Apply responsive-first CSS with mobile breakpoints at 768px and 1024px.\n"
            "5. Validate all colour contrast ratios meet WCAG AA (4.5:1 minimum).\n"
            "6. Write CSS custom properties for all theme values.\n"
            "7. Deliver a working implementation with inline comments on complex interactions.\n"
            "Always provide a before/after diff of changed files."
        ),
        source_repo="Jeffallan/claude-skills",
        installs=1840,
        tags=["frontend", "ui", "css", "react", "vue", "accessibility"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-code-review",
        name="Code Review Skill",
        description=(
            "Multi-agent parallel code review skill that coordinates simultaneous review passes "
            "across correctness, security, performance, and style dimensions. Produces a structured "
            "review report with severity ratings, actionable suggestions, and diff annotations. "
            "Inspired by the PR review plugin pattern."
        ),
        category="review",
        auto_invoke_pattern=r"(review|pr|pull.?request|code.?quality|lint)",
        compatible_agents=["agent-002", "agent-007", "agent-011"],
        prompt_template=(
            "You are conducting a thorough multi-dimensional code review. Execute these passes in order:\n"
            "\n"
            "PASS 1 — Correctness: Identify logic errors, off-by-one bugs, null dereferences, "
            "incorrect algorithm implementations.\n"
            "PASS 2 — Security: Check for injection vulnerabilities, insecure deserialization, "
            "hardcoded secrets, insufficient input validation (OWASP Top 10).\n"
            "PASS 3 — Performance: Flag O(n²) algorithms, unnecessary re-renders, missing "
            "database indexes, synchronous I/O in hot paths.\n"
            "PASS 4 — Style: Enforce naming conventions, remove dead code, improve readability.\n"
            "\n"
            "Format output as:\n"
            "## Review Summary\n"
            "- CRITICAL: <count> | HIGH: <count> | MEDIUM: <count> | LOW: <count>\n"
            "## Findings\n"
            "For each finding: [SEVERITY] file:line — description + suggested fix.\n"
            "## Approved? YES / REQUEST_CHANGES"
        ),
        source_repo="Jeffallan/claude-skills",
        installs=2340,
        tags=["review", "quality", "pr", "multi-agent"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-security-audit",
        name="Security Audit Skill",
        description=(
            "Comprehensive security audit skill combining OWASP Top 10 checks, threat modelling, "
            "dependency vulnerability scanning, and secrets detection. Produces a prioritised "
            "remediation roadmap with CVE references and CVSS scores where applicable."
        ),
        category="security",
        auto_invoke_pattern=r"(security|audit|vulnerability|owasp|pentest|cve|threat)",
        compatible_agents=["agent-007", "agent-002"],
        prompt_template=(
            "You are a senior application security engineer. Conduct a structured security audit:\n"
            "\n"
            "PHASE 1 — THREAT MODEL\n"
            "- Identify assets, entry points, trust boundaries, and threat actors.\n"
            "- Produce a STRIDE threat table (Spoofing / Tampering / Repudiation / "
            "Information Disclosure / Denial of Service / Elevation of Privilege).\n"
            "\n"
            "PHASE 2 — OWASP TOP 10 CHECK\n"
            "- A01 Broken Access Control, A02 Cryptographic Failures, A03 Injection, "
            "A04 Insecure Design, A05 Security Misconfiguration, A06 Vulnerable Components, "
            "A07 Auth Failures, A08 Data Integrity Failures, A09 Logging Failures, "
            "A10 SSRF.\n"
            "Mark each: PASS / FAIL / NEEDS_REVIEW with evidence.\n"
            "\n"
            "PHASE 3 — DEPENDENCY SCAN\n"
            "List all third-party dependencies with version and known CVEs.\n"
            "\n"
            "PHASE 4 — REMEDIATION ROADMAP\n"
            "Prioritise findings by CVSS score. Provide concrete fix instructions."
        ),
        source_repo="Jeffallan/claude-skills",
        installs=1120,
        tags=["security", "owasp", "audit", "vulnerabilities", "cvss"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-debug-detective",
        name="Debug Detective Skill",
        description=(
            "Systematic root cause analysis skill that uses the 5-Whys technique combined with "
            "hypothesis-driven debugging. Traces execution paths, isolates variables, reproduces "
            "bugs deterministically, and delivers a verified fix with regression test."
        ),
        category="debugging",
        auto_invoke_pattern=r"(debug|bug|error|exception|crash|fix|broken|fails?)",
        compatible_agents=["agent-003", "agent-011"],
        prompt_template=(
            "You are Debug Detective. Approach every bug systematically:\n"
            "\n"
            "STEP 1 — REPRODUCE\n"
            "Write a minimal failing test case that reliably reproduces the bug.\n"
            "\n"
            "STEP 2 — HYPOTHESISE\n"
            "List 3-5 root cause hypotheses ranked by likelihood. For each, describe "
            "the evidence that would confirm or deny it.\n"
            "\n"
            "STEP 3 — INVESTIGATE\n"
            "Apply the 5-Whys technique starting from the symptom. Trace through "
            "call stacks, data flows, and state transitions.\n"
            "\n"
            "STEP 4 — FIX\n"
            "Implement the minimal correct fix. Explain why this fix addresses the root "
            "cause without introducing regressions.\n"
            "\n"
            "STEP 5 — VERIFY\n"
            "Run the failing test from Step 1. It should now pass. "
            "Add an assertion to prevent regression."
        ),
        source_repo="Jeffallan/claude-skills",
        installs=1560,
        tags=["debugging", "root-cause", "5-whys", "testing"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-documentation-writer",
        name="Documentation Writer Skill",
        description=(
            "Automated documentation generation skill that produces README files, API reference "
            "docs, architecture decision records (ADRs), and inline code comments. Follows "
            "Google developer documentation style guide and generates Mermaid diagrams for "
            "architecture flows."
        ),
        category="documentation",
        auto_invoke_pattern=r"(doc|readme|comment|jsdoc|docstring|changelog|wiki)",
        compatible_agents=["agent-004", "agent-010"],
        prompt_template=(
            "You are a technical writer. Generate complete, accurate documentation:\n"
            "\n"
            "README.md structure:\n"
            "- Hero section: project name, one-line description, badges\n"
            "- Quick Start: install + run in ≤5 commands\n"
            "- Features: bulleted list with short descriptions\n"
            "- API Reference: auto-generated from code signatures\n"
            "- Architecture: Mermaid diagram of component relationships\n"
            "- Contributing: fork → branch → PR workflow\n"
            "- License\n"
            "\n"
            "Inline comments: add JSDoc/docstring for every public function. Include "
            "@param, @returns, @throws, and a brief example.\n"
            "\n"
            "ADR template for each significant decision:\n"
            "# ADR-NNN: Title\n"
            "Status: Proposed|Accepted|Deprecated\n"
            "Context: why the decision was needed\n"
            "Decision: what was decided\n"
            "Consequences: trade-offs"
        ),
        source_repo="Jeffallan/claude-skills",
        installs=980,
        tags=["documentation", "readme", "jsdoc", "adr", "mermaid"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-test-coverage",
        name="Test Coverage Skill",
        description=(
            "Automated test suite generation skill that achieves ≥90% line coverage. Generates "
            "unit tests, integration tests, and property-based tests. Supports pytest, Jest, "
            "Vitest, and Go testing. Identifies untested branches and produces focused test cases "
            "for edge conditions and error paths."
        ),
        category="testing",
        auto_invoke_pattern=r"(test|coverage|unit.?test|integration|tdd|spec)",
        compatible_agents=["agent-009", "agent-011"],
        prompt_template=(
            "You are a test engineering expert. Generate a comprehensive test suite:\n"
            "\n"
            "COVERAGE TARGETS: 90% lines, 85% branches, 100% critical paths\n"
            "\n"
            "For each module under test:\n"
            "1. UNIT TESTS: Test each function in isolation with mocked dependencies.\n"
            "   - Happy path with representative inputs\n"
            "   - Boundary values (0, -1, MAX, empty, null)\n"
            "   - Error paths (exceptions, invalid input)\n"
            "2. INTEGRATION TESTS: Test component interactions with real dependencies.\n"
            "3. PROPERTY-BASED TESTS: Use hypothesis/fast-check for invariant checking.\n"
            "\n"
            "Test naming: test_<function>_<scenario>_<expected_outcome>\n"
            "Each test must be independent (no shared mutable state).\n"
            "Use fixtures for complex setup. Parametrize repetitive cases.\n"
            "Report: coverage percentage achieved + uncovered lines."
        ),
        source_repo="Jeffallan/claude-skills",
        installs=1430,
        tags=["testing", "coverage", "pytest", "jest", "tdd", "property-based"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-devops-pipeline",
        name="DevOps Pipeline Skill",
        description=(
            "CI/CD pipeline configuration skill that generates GitHub Actions workflows, "
            "Dockerfile multi-stage builds, Kubernetes manifests, and Terraform modules. "
            "Implements security scanning, dependency caching, parallel job execution, "
            "and zero-downtime deployment strategies."
        ),
        category="devops",
        auto_invoke_pattern=r"(ci.?cd|pipeline|docker|kubernetes|terraform|deploy|github.?actions)",
        compatible_agents=["agent-006", "agent-012"],
        prompt_template=(
            "You are a DevOps architect. Design and implement a production-grade CI/CD pipeline:\n"
            "\n"
            "GITHUB ACTIONS WORKFLOW:\n"
            "- Trigger: push to main + PRs + manual dispatch\n"
            "- Jobs (parallel where possible): lint → test → build → security-scan → deploy\n"
            "- Cache: pip/npm/go dependencies between runs\n"
            "- Secrets: use GitHub Secrets, never hardcode\n"
            "\n"
            "DOCKERFILE (multi-stage):\n"
            "- Stage 1 (builder): install deps + compile\n"
            "- Stage 2 (runtime): copy artifacts, non-root user, minimal base image\n"
            "- Scan with trivy for HIGH/CRITICAL CVEs\n"
            "\n"
            "DEPLOYMENT STRATEGY:\n"
            "- Blue/green or canary rollout\n"
            "- Health check endpoint required\n"
            "- Automatic rollback on failure\n"
            "- Notify Slack on deploy success/failure"
        ),
        source_repo="Jeffallan/claude-skills",
        installs=870,
        tags=["devops", "ci-cd", "docker", "kubernetes", "github-actions"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-data-analysis",
        name="Data Analysis Skill",
        description=(
            "Statistical analysis pipeline skill that performs exploratory data analysis, "
            "feature engineering, hypothesis testing, and visualisation. Produces interactive "
            "charts, statistical summaries, correlation matrices, and actionable insights "
            "with confidence intervals."
        ),
        category="data",
        auto_invoke_pattern=r"(data|analysis|statistics|pandas|numpy|chart|visuali[sz])",
        compatible_agents=["agent-005", "agent-010"],
        prompt_template=(
            "You are a data scientist. Execute a rigorous data analysis pipeline:\n"
            "\n"
            "PHASE 1 — EDA (Exploratory Data Analysis)\n"
            "- Shape, dtypes, missing value counts, duplicate rows\n"
            "- Univariate distributions (histograms, box plots)\n"
            "- Bivariate correlations (Pearson/Spearman, scatter matrix)\n"
            "- Outlier detection (IQR method + Z-score)\n"
            "\n"
            "PHASE 2 — HYPOTHESIS TESTING\n"
            "- State null and alternative hypotheses clearly\n"
            "- Select appropriate test (t-test, ANOVA, chi-square, Mann-Whitney)\n"
            "- Report p-value, effect size (Cohen's d), confidence interval\n"
            "- State conclusion in plain English\n"
            "\n"
            "PHASE 3 — INSIGHTS\n"
            "- Top 3 actionable findings ranked by business impact\n"
            "- Each finding: observation → evidence → recommendation"
        ),
        source_repo="Jeffallan/claude-skills",
        installs=760,
        tags=["data", "statistics", "pandas", "visualization", "hypothesis-testing"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-research-synthesis",
        name="Research Synthesis Skill",
        description=(
            "Multi-source research aggregation skill that queries multiple knowledge sources, "
            "synthesises findings, resolves contradictions, and produces a structured research "
            "report with citations. Suitable for technology evaluation, competitive analysis, "
            "and academic literature review."
        ),
        category="research",
        auto_invoke_pattern=r"(research|survey|literature|compare|evaluate|analyse|synthesise)",
        compatible_agents=["agent-010", "agent-005"],
        prompt_template=(
            "You are a research analyst. Conduct a comprehensive research synthesis:\n"
            "\n"
            "PHASE 1 — SCOPE DEFINITION\n"
            "- Define research question(s) precisely\n"
            "- Identify inclusion/exclusion criteria for sources\n"
            "- List key search terms and knowledge domains\n"
            "\n"
            "PHASE 2 — EVIDENCE GATHERING\n"
            "- For each source: extract key claims, methodology, evidence quality (1-5)\n"
            "- Note any contradictions between sources\n"
            "\n"
            "PHASE 3 — SYNTHESIS\n"
            "- Identify areas of consensus across sources\n"
            "- Resolve contradictions by examining methodology quality\n"
            "- Identify gaps in current knowledge\n"
            "\n"
            "PHASE 4 — REPORT\n"
            "- Executive Summary (≤200 words)\n"
            "- Key Findings with evidence grades (Strong/Moderate/Weak)\n"
            "- Recommendations with confidence levels\n"
            "- Bibliography with citation format"
        ),
        source_repo="Jeffallan/claude-skills",
        installs=640,
        tags=["research", "synthesis", "citations", "analysis", "report"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-reasoning-chains",
        name="Reasoning Chains Skill",
        description=(
            "AReaL-style chain-of-thought reasoning skill that enforces structured multi-step "
            "reasoning traces before producing answers. Implements process reward modelling, "
            "self-critique loops, and uncertainty quantification. Based on the inclusionAI/AReaL "
            "reinforcement learning from AI feedback framework."
        ),
        category="reasoning",
        auto_invoke_pattern=r"(reason|think|chain.?of.?thought|step.?by.?step|analyse|plan)",
        compatible_agents=["agent-010", "agent-003", "agent-012"],
        prompt_template=(
            "You are applying AReaL-style chain-of-thought reasoning. For every non-trivial task:\n"
            "\n"
            "<reasoning>\n"
            "Step 1: UNDERSTAND — Restate the problem in your own words. Identify what is known "
            "and what needs to be determined.\n"
            "Step 2: DECOMPOSE — Break the problem into 3-7 independent sub-problems. List them "
            "in dependency order.\n"
            "Step 3: STRATEGISE — For each sub-problem, identify 2-3 solution approaches. "
            "Select the best with justification.\n"
            "Step 4: EXECUTE — Work through each sub-problem step-by-step, showing intermediate "
            "results.\n"
            "Step 5: VERIFY — Check each result against known constraints. Apply a 'sanity check' "
            "from a different angle.\n"
            "Step 6: SELF-CRITIQUE — What could be wrong? What assumptions were made? "
            "What edge cases were missed?\n"
            "Step 7: CONFIDENCE — Rate confidence 0-100% with reasoning.\n"
            "</reasoning>\n"
            "\n"
            "Then produce the final answer, clearly marked as such."
        ),
        source_repo="inclusionAI/AReaL",
        installs=1250,
        tags=["reasoning", "chain-of-thought", "areal", "self-critique", "structured"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-subagent-spawner",
        name="Sub-agent Spawner Skill",
        description=(
            "Parallel sub-agent coordination skill from VoltAgent/awesome-claude-code-subagents. "
            "Analyses complex tasks, decomposes them into parallel workstreams, spawns specialised "
            "sub-agents for each stream, monitors progress, aggregates results, and resolves "
            "conflicts between sub-agent outputs."
        ),
        category="orchestration",
        auto_invoke_pattern=r"(parallel|spawn|orchestrat|multi.?agent|coordinate|subagent)",
        compatible_agents=["agent-012", "agent-011"],
        prompt_template=(
            "You are the Sub-agent Spawner. Coordinate parallel agents for complex tasks:\n"
            "\n"
            "PHASE 1 — TASK DECOMPOSITION\n"
            "- Identify components that can be executed in parallel (no dependencies)\n"
            "- For each component, specify: required skill, estimated effort, success criteria\n"
            "\n"
            "PHASE 2 — AGENT ASSIGNMENT\n"
            "For each parallel workstream, call spawn_subagent with:\n"
            "  - agent_type: the specialisation needed\n"
            "  - task_description: clear, self-contained instructions\n"
            "  - context: shared data the sub-agent needs\n"
            "  - success_criteria: how to evaluate the output\n"
            "\n"
            "PHASE 3 — MONITORING\n"
            "Poll sub-agent status every N seconds. Detect stalled agents and re-assign.\n"
            "\n"
            "PHASE 4 — AGGREGATION\n"
            "- Collect all sub-agent outputs\n"
            "- Resolve conflicts: prefer higher-confidence outputs\n"
            "- Merge into a coherent final deliverable\n"
            "- Report: which agents contributed what, total wall-clock time saved"
        ),
        source_repo="VoltAgent/awesome-claude-code-subagents",
        installs=1890,
        tags=["subagents", "parallel", "orchestration", "voltagent", "coordination"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-pr-review",
        name="PR Review Skill",
        description=(
            "Multi-agent pull request review skill that assigns specialised reviewers per file "
            "type, runs automated checks, produces line-level comments, and generates a "
            "structured PR review report. Supports conventional commits validation, "
            "changelog generation, and merge readiness assessment."
        ),
        category="review",
        auto_invoke_pattern=r"(pr.review|pull.request|merge|diff|changelog|commit.?msg)",
        compatible_agents=["agent-002", "agent-007", "agent-009"],
        prompt_template=(
            "You are conducting a multi-agent PR review. Execute in sequence:\n"
            "\n"
            "1. COMMIT MESSAGE REVIEW\n"
            "   Validate against Conventional Commits spec: type(scope): description.\n"
            "   Flag: non-descriptive messages, missing type, breaking changes without !.\n"
            "\n"
            "2. DIFF ANALYSIS\n"
            "   For each changed file, assign a reviewer persona:\n"
            "   - .py/.js/.ts → Code Quality reviewer (logic, style, complexity)\n"
            "   - *test* / *spec* → Test reviewer (coverage, assertions, isolation)\n"
            "   - Dockerfile / .yml → DevOps reviewer (security, efficiency)\n"
            "   - *.md → Docs reviewer (clarity, accuracy)\n"
            "\n"
            "3. AUTOMATED CHECKS\n"
            "   - No print/console.log left in production code\n"
            "   - No TODO comments in changed lines\n"
            "   - No secrets or API keys\n"
            "   - Tests added for new functions (enforce coverage)\n"
            "\n"
            "4. REVIEW DECISION\n"
            "   APPROVE / REQUEST_CHANGES / COMMENT with summary and line annotations."
        ),
        source_repo="Jeffallan/claude-skills",
        installs=2100,
        tags=["pr", "review", "conventional-commits", "multi-agent", "diff"],
        created_at=_EPOCH,
    ),
    # ── Superpowers skills (obra/superpowers) ─────────────────────────────────
    SkillDefinition(
        id="skill-superpowers-brainstorming",
        name="Brainstorming (Superpowers)",
        description=(
            "Socratic design refinement skill from obra/superpowers. Activates before any "
            "creative or implementation work. Explores user intent through targeted questions, "
            "proposes 2-3 approaches with trade-offs, presents the design in sections for "
            "validation, writes a spec document, runs a spec-review loop, then transitions "
            "to writing-plans. Hard-gates implementation until the human approves the design."
        ),
        category="collaboration",
        auto_invoke_pattern=r"(brainstorm|design|spec|plan|before.?cod|feature|build|create|implement)",
        compatible_agents=["agent-001", "agent-002", "agent-005", "agent-007"],
        prompt_template=(
            "You are using the superpowers:brainstorming skill.\n\n"
            "HARD GATE: Do NOT write any code or invoke any implementation skill until you have:\n"
            "1. Explored the project context (files, docs, recent commits)\n"
            "2. Asked clarifying questions ONE AT A TIME to understand purpose/constraints/success criteria\n"
            "3. Proposed 2-3 approaches with trade-offs and your recommendation\n"
            "4. Presented the design in sections and received user approval for each section\n"
            "5. Written the design doc to docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md\n"
            "6. Run a spec-document-reviewer subagent loop (max 5 iterations) until approved\n"
            "7. Asked the user to review the written spec before proceeding\n\n"
            "Only after ALL of the above: invoke the writing-plans skill."
        ),
        source_repo="obra/superpowers",
        installs=9820,
        tags=["brainstorming", "design", "spec", "socratic", "superpowers", "pre-code"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-superpowers-tdd",
        name="Test-Driven Development (Superpowers)",
        description=(
            "Strict RED-GREEN-REFACTOR TDD skill from obra/superpowers. Enforces the iron law: "
            "NO production code without a failing test first. If you wrote code before the test, "
            "delete it and start over. Watch every test fail before writing code, watch it pass "
            "after. Tests after implementation prove nothing — tests must fail first."
        ),
        category="testing",
        auto_invoke_pattern=r"(tdd|test.driven|implement|feature|bugfix|refactor)",
        compatible_agents=["agent-003", "agent-006", "agent-009", "agent-010"],
        prompt_template=(
            "You are using the superpowers:test-driven-development skill.\n\n"
            "IRON LAW: NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.\n\n"
            "The RED-GREEN-REFACTOR cycle:\n"
            "RED:      Write one minimal failing test that describes the desired behavior.\n"
            "          Run it. Verify it FAILS with the expected failure message.\n"
            "          If it passes immediately, your test is wrong — fix it.\n"
            "GREEN:    Write the SIMPLEST possible code to make ONLY this test pass.\n"
            "          No extra features, no refactoring, no YAGNI violations.\n"
            "          Run tests. Confirm ALL pass.\n"
            "REFACTOR: Clean up duplication, naming, structure. Stay green throughout.\n\n"
            "If you catch yourself writing code before the test: DELETE the code. Start over.\n"
            "Commit after each green cycle with a message like 'feat: add X (TDD)'."
        ),
        source_repo="obra/superpowers",
        installs=14330,
        tags=["tdd", "testing", "red-green-refactor", "superpowers", "quality"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-superpowers-debugging",
        name="Systematic Debugging (Superpowers)",
        description=(
            "Four-phase root-cause debugging methodology from obra/superpowers. Forbids random "
            "fixes before root cause is found. Phase 1: gather evidence (read errors carefully, "
            "reproduce consistently, check recent changes, add diagnostic instrumentation). "
            "Phase 2: pattern analysis (find working examples, compare differences). Phase 3: "
            "single hypothesis + minimal test. Phase 4: fix root cause, create failing test, "
            "verify fix. After 3+ failed fixes: question the architecture."
        ),
        category="debugging",
        auto_invoke_pattern=r"(debug|bug|error|fail|broken|crash|unexpected|investigate)",
        compatible_agents=["agent-003", "agent-002", "agent-007"],
        prompt_template=(
            "You are using the superpowers:systematic-debugging skill.\n\n"
            "IRON LAW: NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.\n\n"
            "PHASE 1 — Root Cause Investigation:\n"
            "  a) Read all error messages completely (stack traces, line numbers, codes)\n"
            "  b) Reproduce the issue consistently — if you can't, gather more data\n"
            "  c) Check recent changes (git diff, recent commits, new dependencies)\n"
            "  d) In multi-component systems: add diagnostic logging at each boundary\n"
            "     Run once to gather evidence, then analyze WHERE it breaks\n"
            "  e) Trace data flow backward from symptom to source\n\n"
            "PHASE 2 — Pattern Analysis:\n"
            "  Find similar working code, compare against broken code, list ALL differences\n\n"
            "PHASE 3 — Hypothesis Testing:\n"
            "  State one specific hypothesis. Make the SMALLEST possible change to test it.\n"
            "  One variable at a time. If wrong, form a NEW hypothesis — don't stack fixes.\n\n"
            "PHASE 4 — Implementation:\n"
            "  Create a failing test case. Apply the single root-cause fix. Verify.\n"
            "  If 3+ fixes have failed: STOP and question the architecture.\n\n"
            "RED FLAGS (STOP if you think these): 'quick fix for now', 'just try X',\n"
            "'I'll investigate later', 'add multiple changes and see'."
        ),
        source_repo="obra/superpowers",
        installs=11240,
        tags=["debugging", "root-cause", "systematic", "superpowers", "four-phase"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-superpowers-writing-plans",
        name="Writing Plans (Superpowers)",
        description=(
            "Comprehensive implementation plan writing skill from obra/superpowers. Produces "
            "bite-sized task plans (2-5 min each) with exact file paths, complete code, and "
            "verification steps. Each task follows TDD: write failing test, run it, implement "
            "minimal code, run tests, commit. Plans saved to "
            "docs/superpowers/plans/YYYY-MM-DD-<feature>.md. Runs a plan-document-reviewer "
            "subagent loop after each chunk. Hands off to subagent-driven-development."
        ),
        category="collaboration",
        auto_invoke_pattern=r"(plan|task.?list|implementation.?plan|sprint|roadmap)",
        compatible_agents=["agent-001", "agent-004", "agent-007", "agent-008"],
        prompt_template=(
            "You are using the superpowers:writing-plans skill.\n\n"
            "Announce: 'I'm using the writing-plans skill to create the implementation plan.'\n\n"
            "EVERY plan MUST start with this header:\n"
            "  # [Feature Name] Implementation Plan\n"
            "  > **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development\n"
            "  **Goal:** [One sentence]\n"
            "  **Architecture:** [2-3 sentences]\n"
            "  **Tech Stack:** [Key technologies]\n\n"
            "TASK STRUCTURE (each task = 2-5 minutes):\n"
            "  - [ ] Write the failing test (with exact code)\n"
            "  - [ ] Run test to verify it FAILS\n"
            "  - [ ] Write minimal implementation (with exact code)\n"
            "  - [ ] Run tests to verify they PASS\n"
            "  - [ ] Commit (with exact git command)\n\n"
            "File mapping: list every file to create or modify with exact paths before tasks.\n"
            "After each chunk: dispatch plan-document-reviewer subagent until approved.\n"
            "Save plan to: docs/superpowers/plans/YYYY-MM-DD-<feature-name>.md\n"
            "Final: hand off to superpowers:subagent-driven-development."
        ),
        source_repo="obra/superpowers",
        installs=8760,
        tags=["planning", "tasks", "implementation", "superpowers", "bite-sized"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-superpowers-subagent-dev",
        name="Subagent-Driven Development (Superpowers)",
        description=(
            "Execute implementation plans by dispatching a fresh subagent per task with "
            "two-stage review (spec compliance, then code quality) from obra/superpowers. "
            "Fresh subagent per task means no context pollution. Each subagent implements, "
            "tests, commits, and self-reviews. Spec-reviewer and code-quality-reviewer "
            "subagents gate progression. Uses cheapest capable model per task type."
        ),
        category="collaboration",
        auto_invoke_pattern=r"(execute.?plan|subagent|parallel.?agent|dispatch|implement.?plan)",
        compatible_agents=["agent-001", "agent-002", "agent-007", "agent-009"],
        prompt_template=(
            "You are using the superpowers:subagent-driven-development skill.\n\n"
            "PROCESS per task:\n"
            "1. Read plan; extract ALL tasks with full text; create TodoWrite\n"
            "2. For each task:\n"
            "   a) Dispatch implementer subagent with full task text + context (NOT session history)\n"
            "   b) Handle status: DONE→review, DONE_WITH_CONCERNS→read then review,\n"
            "      NEEDS_CONTEXT→provide and re-dispatch, BLOCKED→assess and escalate\n"
            "   c) Dispatch spec-compliance-reviewer subagent\n"
            "   d) If issues: implementer fixes → re-review\n"
            "   e) Dispatch code-quality-reviewer subagent\n"
            "   f) If issues: implementer fixes → re-review\n"
            "   g) Mark task complete in TodoWrite\n"
            "3. After all tasks: dispatch final code reviewer for entire implementation\n"
            "4. Invoke superpowers:finishing-a-development-branch\n\n"
            "MODEL SELECTION: cheap model for mechanical tasks (1-2 files, clear spec),\n"
            "standard for integration, most capable for architecture/review."
        ),
        source_repo="obra/superpowers",
        installs=7530,
        tags=["subagents", "parallel", "review", "superpowers", "two-stage-review"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-superpowers-code-review",
        name="Requesting Code Review (Superpowers)",
        description=(
            "Pre-review checklist skill from obra/superpowers. Dispatches a code-reviewer "
            "subagent with precisely crafted context (never session history) to catch issues "
            "before they cascade. Mandatory after each task in subagent-driven development, "
            "after completing major features, and before merging. Issues classified as "
            "Critical (fix immediately), Important (fix before proceeding), or Minor (note)."
        ),
        category="review",
        auto_invoke_pattern=r"(code.?review|pr.?review|before.?merge|request.?review)",
        compatible_agents=["agent-002", "agent-007", "agent-011"],
        prompt_template=(
            "You are using the superpowers:requesting-code-review skill.\n\n"
            "HOW TO REQUEST REVIEW:\n"
            "1. Get git SHAs:\n"
            "   BASE_SHA=$(git rev-parse HEAD~1)  # or origin/main\n"
            "   HEAD_SHA=$(git rev-parse HEAD)\n"
            "2. Dispatch code-reviewer subagent with:\n"
            "   - WHAT_WAS_IMPLEMENTED: what you just built\n"
            "   - PLAN_OR_REQUIREMENTS: what it should do\n"
            "   - BASE_SHA / HEAD_SHA\n"
            "   - DESCRIPTION: brief 1-2 sentence summary\n"
            "3. Act on feedback:\n"
            "   Critical issues: fix immediately before ANY other work\n"
            "   Important issues: fix before proceeding to next task\n"
            "   Minor issues: note for later\n\n"
            "NEVER: skip review because 'it's simple', ignore Critical issues,\n"
            "proceed with unfixed Important issues."
        ),
        source_repo="obra/superpowers",
        installs=6890,
        tags=["review", "pre-merge", "code-quality", "superpowers", "subagent"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-superpowers-finish-branch",
        name="Finishing a Development Branch (Superpowers)",
        description=(
            "Branch completion workflow from obra/superpowers. Verifies tests pass, determines "
            "base branch, then presents exactly 4 options: merge locally, push & create PR, "
            "keep as-is, or discard. Handles worktree cleanup for the chosen path. Requires "
            "typed 'discard' confirmation before deleting work. Called after all plan tasks "
            "complete in subagent-driven-development."
        ),
        category="collaboration",
        auto_invoke_pattern=r"(finish.?branch|merge|create.?pr|complete.?feature|done.?implement)",
        compatible_agents=["agent-001", "agent-007", "agent-008"],
        prompt_template=(
            "You are using the superpowers:finishing-a-development-branch skill.\n\n"
            "Announce: 'I'm using the finishing-a-development-branch skill to complete this work.'\n\n"
            "STEP 1 — Verify tests pass:\n"
            "  Run project test suite. If ANY fail: show failures, STOP, do not proceed.\n\n"
            "STEP 2 — Determine base branch:\n"
            "  git merge-base HEAD main 2>/dev/null || git merge-base HEAD master\n\n"
            "STEP 3 — Present EXACTLY these 4 options (no additions, no explanations):\n"
            "  1. Merge back to <base-branch> locally\n"
            "  2. Push and create a Pull Request\n"
            "  3. Keep the branch as-is (I'll handle it later)\n"
            "  4. Discard this work\n\n"
            "STEP 4 — Execute the chosen option (see skill docs for full flow).\n"
            "STEP 5 — Clean up worktree for Options 1 and 4 only.\n\n"
            "NEVER merge with failing tests. NEVER delete without typed 'discard' confirmation."
        ),
        source_repo="obra/superpowers",
        installs=5420,
        tags=["branch", "merge", "pr", "cleanup", "superpowers", "workflow"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-superpowers-parallel-agents",
        name="Dispatching Parallel Agents (Superpowers)",
        description=(
            "Concurrent subagent dispatch skill from obra/superpowers. When facing 2+ "
            "independent problems (different test files, subsystems, bugs), dispatches one "
            "focused agent per problem domain concurrently rather than sequentially. Each "
            "agent gets self-contained context with specific scope, clear goal, constraints, "
            "and expected output. Dramatically reduces time for independent investigations."
        ),
        category="collaboration",
        auto_invoke_pattern=r"(parallel|concurrent|multiple.?bug|independent.?task|batch)",
        compatible_agents=["agent-007", "agent-009", "agent-002", "agent-003"],
        prompt_template=(
            "You are using the superpowers:dispatching-parallel-agents skill.\n\n"
            "WHEN TO USE: 2+ independent failures or tasks where fixing one doesn't affect others.\n\n"
            "PROCESS:\n"
            "1. Group failures/tasks by independent domain (tool A, subsystem B, file C)\n"
            "2. For each domain, craft a focused agent prompt with:\n"
            "   - Specific scope (ONE file or subsystem)\n"
            "   - Clear goal (make these 3 tests pass)\n"
            "   - Constraints (do NOT modify other code)\n"
            "   - Expected output (summary of root cause + changes)\n"
            "3. Dispatch ALL agents in parallel (using Task tool or equivalent)\n"
            "4. When agents return: review each summary, verify no conflicts, run full suite\n\n"
            "GOOD PROMPT: 'Fix the 3 failing tests in src/auth/auth.test.ts. Root cause is\n"
            "timing issue in token refresh. Do NOT change src/api/. Return: what you found + fixed.'\n\n"
            "DO NOT USE when: failures are related, need full system context, agents would\n"
            "interfere (editing same files), or you don't know yet what's broken."
        ),
        source_repo="obra/superpowers",
        installs=4870,
        tags=["parallel", "concurrent", "subagents", "superpowers", "speed"],
        created_at=_EPOCH,
    ),
    SkillDefinition(
        id="skill-superpowers-git-worktrees",
        name="Using Git Worktrees (Superpowers)",
        description=(
            "Git worktree isolation skill from obra/superpowers. Creates an isolated workspace "
            "on a new branch for each feature or fix, runs project setup in the worktree, and "
            "verifies a clean test baseline before any implementation starts. Enables true "
            "parallel development branches without disturbing your main working tree. Activated "
            "after brainstorming design approval."
        ),
        category="collaboration",
        auto_invoke_pattern=r"(worktree|git.?worktree|isolated.?branch|parallel.?branch)",
        compatible_agents=["agent-008", "agent-007", "agent-001"],
        prompt_template=(
            "You are using the superpowers:using-git-worktrees skill.\n\n"
            "WORKFLOW:\n"
            "1. Create worktree on new branch:\n"
            "   git worktree add ../worktrees/<feature-name> -b feature/<feature-name>\n\n"
            "2. Change into the worktree directory:\n"
            "   cd ../worktrees/<feature-name>\n\n"
            "3. Run project setup (install deps, build, etc.):\n"
            "   npm install (or equivalent for your stack)\n\n"
            "4. Verify clean test baseline:\n"
            "   npm test (or equivalent)\n"
            "   ALL tests must pass before any implementation work begins.\n"
            "   If tests fail on baseline: stop and fix before proceeding.\n\n"
            "5. Save worktree path for cleanup:\n"
            "   Store path so finishing-a-development-branch can clean up later.\n\n"
            "CLEANUP (after branch complete):\n"
            "   git worktree remove ../worktrees/<feature-name>\n"
            "   (called automatically by finishing-a-development-branch for Options 1 & 4)"
        ),
        source_repo="obra/superpowers",
        installs=3990,
        tags=["git", "worktree", "isolation", "superpowers", "parallel-dev"],
        created_at=_EPOCH,
    ),
]

_SKILLS_BY_ID: dict[str, SkillDefinition] = {s.id: s for s in _SKILLS}


class SkillsLibrary:
    """In-memory skills registry."""

    def get_all_skills(self) -> list[SkillDefinition]:
        return list(_SKILLS)

    def get_skill_by_id(self, skill_id: str) -> SkillDefinition | None:
        return _SKILLS_BY_ID.get(skill_id)

    def search_skills(
        self,
        query: str | None = None,
        category: str | None = None,
    ) -> list[SkillDefinition]:
        results = list(_SKILLS)
        if category:
            results = [s for s in results if s.category.lower() == category.lower()]
        if query:
            q = query.lower()
            results = [
                s for s in results
                if q in s.name.lower()
                or q in s.description.lower()
                or any(q in t.lower() for t in s.tags)
            ]
        return results

    def download_skill(self, skill_id: str) -> str | None:
        """Return skill as a markdown string suitable for saving as a .md file."""
        skill = _SKILLS_BY_ID.get(skill_id)
        if skill is None:
            return None
        tags_str = ", ".join(f"`{t}`" for t in skill.tags)
        agents_str = ", ".join(f"`{a}`" for a in skill.compatible_agents)
        pattern_str = f"`{skill.auto_invoke_pattern}`" if skill.auto_invoke_pattern else "_none_"
        return (
            f"---\n"
            f"id: {skill.id}\n"
            f"name: {skill.name}\n"
            f"category: {skill.category}\n"
            f"source_repo: {skill.source_repo}\n"
            f"installs: {skill.installs}\n"
            f"auto_invoke_pattern: {skill.auto_invoke_pattern or ''}\n"
            f"compatible_agents: [{', '.join(skill.compatible_agents)}]\n"
            f"tags: [{', '.join(skill.tags)}]\n"
            f"---\n\n"
            f"# {skill.name}\n\n"
            f"{skill.description}\n\n"
            f"## Metadata\n\n"
            f"| Field | Value |\n"
            f"|-------|-------|\n"
            f"| Category | `{skill.category}` |\n"
            f"| Source | [{skill.source_repo}](https://github.com/{skill.source_repo}) |\n"
            f"| Installs | {skill.installs:,} |\n"
            f"| Auto-invoke | {pattern_str} |\n"
            f"| Compatible agents | {agents_str} |\n"
            f"| Tags | {tags_str} |\n\n"
            f"## Prompt Template\n\n"
            f"```\n{skill.prompt_template}\n```\n"
        )

    def get_stats(self) -> dict[str, Any]:
        return {
            "total_skills": len(_SKILLS),
            "total_installs": sum(s.installs for s in _SKILLS),
            "categories": list({s.category for s in _SKILLS}),
            "avg_installs": round(sum(s.installs for s in _SKILLS) / len(_SKILLS), 1),
        }


# Module-level singleton
skills_library = SkillsLibrary()
