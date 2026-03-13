"""Tests for the SkillsLibrary."""

from __future__ import annotations

import pytest

from pixel_market.skills_library import SkillsLibrary


@pytest.fixture()
def lib() -> SkillsLibrary:
    return SkillsLibrary()


def test_get_all_skills(lib: SkillsLibrary) -> None:
    skills = lib.get_all_skills()
    assert len(skills) >= 12, f"Expected at least 12 skills, got {len(skills)}"


def test_get_skill_by_id(lib: SkillsLibrary) -> None:
    skill = lib.get_skill_by_id("skill-code-review")
    assert skill is not None
    assert skill.id == "skill-code-review"
    assert skill.name == "Code Review Skill"


def test_get_skill_by_id_unknown(lib: SkillsLibrary) -> None:
    result = lib.get_skill_by_id("nonexistent-skill-xyz")
    assert result is None


def test_search_skills_by_category(lib: SkillsLibrary) -> None:
    results = lib.search_skills(category="security")
    assert results, "Expected at least one security skill"
    for skill in results:
        assert skill.category.lower() == "security"


def test_search_skills_by_query(lib: SkillsLibrary) -> None:
    results = lib.search_skills(query="review")
    assert results, "Expected at least one skill matching 'review'"
    for skill in results:
        found = (
            "review" in skill.name.lower()
            or "review" in skill.description.lower()
            or any("review" in t.lower() for t in skill.tags)
        )
        assert found, f"Skill '{skill.name}' does not match 'review'"


def test_search_skills_combined(lib: SkillsLibrary) -> None:
    results = lib.search_skills(query="parallel", category="orchestration")
    assert results, "Expected at least one orchestration skill with 'parallel'"
    for skill in results:
        assert skill.category.lower() == "orchestration"


def test_search_skills_no_match(lib: SkillsLibrary) -> None:
    results = lib.search_skills(query="zzznomatchquery999")
    assert results == []


def test_download_skill_returns_markdown(lib: SkillsLibrary) -> None:
    content = lib.download_skill("skill-frontend-design")
    assert content is not None
    assert content.startswith("---")
    assert "# Frontend Design Skill" in content
    assert "## Prompt Template" in content
    assert "```" in content


def test_download_skill_unknown(lib: SkillsLibrary) -> None:
    result = lib.download_skill("skill-nonexistent-xyz")
    assert result is None


def test_download_skill_contains_metadata(lib: SkillsLibrary) -> None:
    content = lib.download_skill("skill-security-audit")
    assert content is not None
    assert "OWASP" in content
    assert "source_repo:" in content
    assert "installs:" in content


def test_get_stats(lib: SkillsLibrary) -> None:
    stats = lib.get_stats()
    assert "total_skills" in stats
    assert "total_installs" in stats
    assert "categories" in stats
    assert "avg_installs" in stats
    assert stats["total_skills"] >= 12
    assert stats["total_installs"] > 0
    assert isinstance(stats["categories"], list)
    assert len(stats["categories"]) >= 5


def test_all_skills_have_prompt_templates(lib: SkillsLibrary) -> None:
    for skill in lib.get_all_skills():
        assert len(skill.prompt_template) >= 50, (
            f"Skill '{skill.id}' prompt_template too short: {len(skill.prompt_template)} chars"
        )


def test_all_skills_have_compatible_agents(lib: SkillsLibrary) -> None:
    for skill in lib.get_all_skills():
        assert skill.compatible_agents, f"Skill '{skill.id}' has no compatible agents"


def test_skills_source_repos_present(lib: SkillsLibrary) -> None:
    repos = {s.source_repo for s in lib.get_all_skills()}
    assert "Jeffallan/claude-skills" in repos
    assert "inclusionAI/AReaL" in repos
    assert "VoltAgent/awesome-claude-code-subagents" in repos
