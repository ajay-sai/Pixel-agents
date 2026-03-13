"""Tests for the AgentRouter."""

from __future__ import annotations

import pytest

from pixel_market.marketplace import Marketplace
from pixel_market.models import AgentSkill, RouterRequest
from pixel_market.router import AgentRouter


@pytest.fixture()
def market() -> Marketplace:
    return Marketplace()


@pytest.fixture()
def router() -> AgentRouter:
    return AgentRouter()


def test_route_by_skill_match(router: AgentRouter, market: Marketplace) -> None:
    req = RouterRequest(
        task_description="Review the codebase for security issues",
        required_skills=[AgentSkill.SECURITY, AgentSkill.CODE_REVIEW],
    )
    result = router.route_task(req, market)
    assert result is not None
    # The selected agent should have at least one of the required skills
    agent_skills = set(result.selected_agent.skills)
    assert agent_skills & {AgentSkill.SECURITY, AgentSkill.CODE_REVIEW}


def test_route_returns_alternatives(router: AgentRouter, market: Marketplace) -> None:
    req = RouterRequest(
        task_description="Build a REST API",
        required_skills=[AgentSkill.BACKEND],
    )
    result = router.route_task(req, market)
    assert result is not None
    assert isinstance(result.alternatives, list)
    assert len(result.alternatives) >= 1


def test_route_confidence_score(router: AgentRouter, market: Marketplace) -> None:
    req = RouterRequest(
        task_description="Write unit tests",
        required_skills=[AgentSkill.TESTING],
    )
    result = router.route_task(req, market)
    assert result is not None
    assert 0.0 <= result.confidence <= 1.0


def test_route_with_preferred_tags(router: AgentRouter, market: Marketplace) -> None:
    req_with_tags = RouterRequest(
        task_description="Secure the API",
        required_skills=[AgentSkill.SECURITY],
        preferred_tags=["owasp", "audit"],
    )
    req_without_tags = RouterRequest(
        task_description="Secure the API",
        required_skills=[AgentSkill.SECURITY],
    )
    result_with = router.route_task(req_with_tags, market)
    result_without = router.route_task(req_without_tags, market)

    assert result_with is not None
    assert result_without is not None
    # Both should return a valid result; tag match may affect selection or confidence
    assert result_with.selected_agent is not None


def test_route_reasoning_non_empty(router: AgentRouter, market: Marketplace) -> None:
    req = RouterRequest(
        task_description="Analyse research data",
        required_skills=[AgentSkill.RESEARCH, AgentSkill.DATA_ANALYSIS],
    )
    result = router.route_task(req, market)
    assert result is not None
    assert len(result.reasoning) > 10


def test_route_selects_best_skill_match(
    router: AgentRouter, market: Marketplace
) -> None:
    """Agent with full skill overlap should outrank one with partial overlap."""
    req = RouterRequest(
        task_description="Write documentation",
        required_skills=[AgentSkill.DOCUMENTATION, AgentSkill.WRITING],
    )
    result = router.route_task(req, market)
    assert result is not None
    selected_skills = set(result.selected_agent.skills)
    # Documentation Writer has both DOCUMENTATION and WRITING — verify full overlap
    assert AgentSkill.DOCUMENTATION in selected_skills and AgentSkill.WRITING in selected_skills
