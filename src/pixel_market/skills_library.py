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
