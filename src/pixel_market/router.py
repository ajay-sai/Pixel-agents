"""Auto-hire agent router: matches tasks to agents by skill and metadata."""

from __future__ import annotations

import math

from .marketplace import Marketplace
from .models import AgentSkill, MarketplaceAgent, RouterRequest, RouterResponse


def _skill_score(agent_skills: list[AgentSkill], required: list[AgentSkill]) -> float:
    """Jaccard-style overlap, 0.0–1.0."""
    if not required:
        return 1.0
    req_set = set(required)
    agent_set = set(agent_skills)
    overlap = len(req_set & agent_set)
    return overlap / len(req_set)


def _rating_score(rating: float) -> float:
    """Normalise 0–5 rating to 0–1."""
    return rating / 5.0


def _install_score(installs: int, max_installs: int) -> float:
    """Log-normalised install count to avoid domination by viral agents."""
    if max_installs == 0:
        return 0.0
    return math.log1p(installs) / math.log1p(max_installs)


def _tag_score(agent_tags: list[str], preferred: list[str] | None) -> float:
    if not preferred:
        return 0.0
    pref_set = {t.lower() for t in preferred}
    agent_set = {t.lower() for t in agent_tags}
    overlap = len(pref_set & agent_set)
    return overlap / len(pref_set)


def _build_reasoning(
    agent: MarketplaceAgent,
    required_skills: list[AgentSkill],
    confidence: float,
    skill_overlap: float,
) -> str:
    matched = set(required_skills) & set(agent.skills)
    missing = set(required_skills) - set(agent.skills)
    parts: list[str] = [
        f"Selected **{agent.name}** with {confidence:.0%} confidence.",
        f"Skill match: {skill_overlap:.0%} ({', '.join(s.value for s in matched) or 'none'}).",
    ]
    if missing:
        parts.append(
            f"Missing skills: {', '.join(s.value for s in missing)} "
            f"(agent may still partially fulfil these)."
        )
    parts.append(
        f"Rating {agent.rating}/5 · {agent.installs:,} installs · "
        f"source: {agent.source_repo}."
    )
    return " ".join(parts)


class AgentRouter:
    """Scores and ranks marketplace agents for a given routing request."""

    # Weight constants (must sum to 1.0)
    W_SKILL = 0.60
    W_RATING = 0.20
    W_INSTALLS = 0.10
    W_TAGS = 0.10

    def route_task(
        self,
        request: RouterRequest,
        marketplace: Marketplace,
    ) -> RouterResponse | None:
        agents = marketplace.get_all_agents()
        if not agents:
            return None

        max_installs = max(a.installs for a in agents)

        scored: list[tuple[float, float, MarketplaceAgent]] = []
        for agent in agents:
            s_skill = _skill_score(agent.skills, request.required_skills)
            s_rating = _rating_score(agent.rating)
            s_install = _install_score(agent.installs, max_installs)
            s_tag = _tag_score(agent.tags, request.preferred_tags)

            total = (
                self.W_SKILL * s_skill
                + self.W_RATING * s_rating
                + self.W_INSTALLS * s_install
                + self.W_TAGS * s_tag
            )
            scored.append((total, s_skill, agent))

        scored.sort(key=lambda x: x[0], reverse=True)
        best_score, best_skill_overlap, best_agent = scored[0]

        confidence = min(1.0, best_score)
        reasoning = _build_reasoning(
            best_agent, request.required_skills, confidence, best_skill_overlap
        )
        alternatives = [a for _, _, a in scored[1:4]]

        return RouterResponse(
            selected_agent=best_agent,
            confidence=round(confidence, 3),
            reasoning=reasoning,
            alternatives=alternatives,
        )


# Module-level singleton
router = AgentRouter()
