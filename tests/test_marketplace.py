"""Tests for the agent marketplace."""

from __future__ import annotations

from datetime import datetime, timezone

import pytest

from pixel_market.marketplace import Marketplace
from pixel_market.models import AgentSkill, MarketplaceAgent


@pytest.fixture()
def market() -> Marketplace:
    """Fresh marketplace instance for each test."""
    return Marketplace()


def test_get_all_agents(market: Marketplace) -> None:
    agents = market.get_all_agents()
    assert len(agents) >= 12, f"Expected at least 12 agents, got {len(agents)}"


def test_search_agents_by_skill(market: Marketplace) -> None:
    results = market.search_agents(skills=[AgentSkill.CODE_REVIEW])
    assert results, "Expected at least one agent with CODE_REVIEW skill"
    for agent in results:
        assert AgentSkill.CODE_REVIEW in agent.skills


def test_search_agents_by_query(market: Marketplace) -> None:
    results = market.search_agents(query="security")
    assert results, "Expected at least one agent matching 'security'"
    names_and_descs = [
        (a.name + a.description + " ".join(a.tags)).lower() for a in results
    ]
    assert any("security" in text for text in names_and_descs)


def test_search_agents_by_tag(market: Marketplace) -> None:
    results = market.search_agents(tags=["docker"])
    assert results, "Expected agent(s) tagged with 'docker'"
    for agent in results:
        assert any("docker" in t.lower() for t in agent.tags)


def test_register_new_agent(market: Marketplace) -> None:
    new_agent = MarketplaceAgent(
        id="agent-test-999",
        name="Test Agent",
        description="A test agent for unit tests",
        skills=[AgentSkill.TESTING],
        personality="Calm and methodical",
        source_repo="test/repo",
        rating=3.5,
        installs=0,
        tags=["test"],
        prompt_template="You are Test Agent.",
        created_at=datetime(2024, 1, 1, tzinfo=timezone.utc),
    )
    returned = market.register_agent(new_agent)
    assert returned.id == "agent-test-999"
    assert market.get_agent_by_id("agent-test-999") is not None


def test_install_agent_increments_count(market: Marketplace) -> None:
    agent = market.get_all_agents()[0]
    original_installs = agent.installs
    updated = market.install_agent(agent.id)
    assert updated is not None
    assert updated.installs == original_installs + 1


def test_install_unknown_agent_returns_none(market: Marketplace) -> None:
    result = market.install_agent("nonexistent-agent-xyz")
    assert result is None


def test_get_stats(market: Marketplace) -> None:
    stats = market.get_stats()
    assert "total_agents" in stats
    assert "total_installs" in stats
    assert "featured_count" in stats
    assert "avg_rating" in stats
    assert stats["total_agents"] >= 12
    assert stats["avg_rating"] >= 0.0
    assert stats["avg_rating"] <= 5.0


def test_get_featured_agents(market: Marketplace) -> None:
    featured = market.get_featured_agents()
    assert featured, "Expected at least one featured agent"
    for agent in featured:
        assert agent.is_featured


def test_search_combined_filters(market: Marketplace) -> None:
    results = market.search_agents(
        query="code", skills=[AgentSkill.CODE_GENERATION]
    )
    for agent in results:
        assert AgentSkill.CODE_GENERATION in agent.skills
