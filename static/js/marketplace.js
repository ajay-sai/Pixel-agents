/**
 * marketplace.js — Agent cards, search, install, hire
 */

const MARKETPLACE_API = '/api/agents';

let _allAgents = [];
let _featuredOnly = false;

// -----------------------------------------------------------------------
// Fetch & render
// -----------------------------------------------------------------------

async function loadAgents(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.q)        params.set('q', filters.q);
    if (filters.skills)   filters.skills.forEach(s => params.append('skills', s));
    if (filters.tags)     filters.tags.forEach(t => params.append('tags', t));
    if (filters.featured) params.set('featured', 'true');

    const url = `${MARKETPLACE_API}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    _allAgents = await res.json();
    renderAgentGrid(_allAgents);
  } catch (e) {
    console.error('loadAgents error:', e);
    document.getElementById('agent-grid').innerHTML =
      `<div class="text-xs" style="color:var(--status-error);padding:16px;">Failed to load agents: ${window.escapeHtml(e.message)}</div>`;
  }
}

function renderAgentGrid(agents) {
  const grid = document.getElementById('agent-grid');
  if (!grid) return;

  if (!agents.length) {
    grid.innerHTML = '<div class="text-dim text-sm" style="padding:24px;">No agents match your filters.</div>';
    return;
  }

  grid.innerHTML = agents.map(renderAgentCard).join('');

  // Bind install / hire buttons
  grid.querySelectorAll('[data-install]').forEach(btn => {
    btn.addEventListener('click', () => installAgent(btn.dataset.install));
  });
  grid.querySelectorAll('[data-hire]').forEach(btn => {
    btn.addEventListener('click', () => openHireDialog(btn.dataset.hire));
  });
}

function renderAgentCard(agent) {
  const stars = renderStars(agent.rating);
  const skills = agent.skills
    .map(s => `<span class="pixel-badge badge-${s}">${s.replace(/_/g,' ')}</span>`)
    .join(' ');
  const tags = agent.tags.slice(0, 4)
    .map(t => `<span style="color:var(--text-dim);font-size:0.55rem;">#${window.escapeHtml(t)}</span>`)
    .join(' ');

  return `
    <div class="pixel-card ${agent.is_featured ? 'featured' : ''}" style="overflow:visible;">
      <div class="flex gap-12 items-start">
        <div class="pixel-avatar" title="${window.escapeHtml(agent.personality)}">
          ${agent.character_sprite || agentSprite(agent.id)}
        </div>
        <div class="flex-col gap-4 flex-1" style="min-width:0;">
          <div class="truncate" style="font-size:0.7rem;color:var(--neon-green);">${window.escapeHtml(agent.name)}</div>
          <div class="text-xs text-dim">${window.escapeHtml(agent.source_repo)}</div>
          <div class="flex gap-4 items-center mt-4">
            <span class="star-rating">${stars}</span>
            <span class="text-xs text-dim">(${agent.rating})</span>
            <span class="text-xs text-dim" style="margin-left:8px;">⬇ ${agent.installs.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <p style="font-size:0.58rem;color:var(--text-secondary);margin:10px 0 8px;line-height:1.6;">
        ${window.escapeHtml(agent.description).slice(0, 120)}${agent.description.length > 120 ? '…' : ''}
      </p>

      <div class="flex flex-wrap gap-4 mb-8">${skills}</div>
      <div class="flex flex-wrap gap-4 mb-12">${tags}</div>

      <div class="flex gap-8">
        <button class="pixel-btn pixel-btn--ghost flex-1" data-install="${agent.id}"
          style="font-size:0.55rem;padding:6px 8px;">
          ⬇ INSTALL
        </button>
        <button class="pixel-btn pixel-btn--blue flex-1" data-hire="${agent.id}"
          style="font-size:0.55rem;padding:6px 8px;color:#000;">
          ▶ HIRE
        </button>
      </div>
    </div>
  `;
}

// -----------------------------------------------------------------------
// Sprite helper
// -----------------------------------------------------------------------

const _sprites = ['🧙','🕵️','🤖','👾','🦾','🧬','🛸','🎮','⚡','🔮','🦊','🎯'];

function agentSprite(agentId) {
  const num = parseInt(agentId.replace(/\D/g,''), 10) || 0;
  return _sprites[num % _sprites.length];
}

// -----------------------------------------------------------------------
// Stars
// -----------------------------------------------------------------------

function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// -----------------------------------------------------------------------
// Install
// -----------------------------------------------------------------------

async function installAgent(agentId) {
  try {
    const res = await fetch(`/api/agents/${agentId}/install`, { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const updated = await res.json();

    // Update card in place
    const btn = document.querySelector(`[data-install="${agentId}"]`);
    if (btn) {
      btn.textContent = '✓ INSTALLED';
      btn.disabled = true;
      btn.style.opacity = '0.6';
    }

    // Update installs count in the card
    _allAgents = _allAgents.map(a => a.id === agentId ? updated : a);
  } catch (e) {
    console.error('installAgent error:', e);
  }
}

// -----------------------------------------------------------------------
// Hire (quick hire for existing task or create new)
// -----------------------------------------------------------------------

async function openHireDialog(agentId) {
  const agent = _allAgents.find(a => a.id === agentId);
  if (!agent) return;

  const taskTitle = prompt(`Create a task to hire ${agent.name}:\nEnter task title:`);
  if (!taskTitle) return;

  try {
    // Create task
    const taskRes = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: taskTitle,
        description: `Task assigned to ${agent.name}`,
        required_skills: agent.skills.slice(0, 2),
      }),
    });
    if (!taskRes.ok) throw new Error(await taskRes.text());
    const task = await taskRes.json();

    // Force-hire this specific agent via tracker
    const hireRes = await fetch(`/api/tasks/${task.id}/hire`, { method: 'POST' });
    if (!hireRes.ok) throw new Error(await hireRes.text());

    // Switch to tracker
    document.querySelector('[data-tab="tracker"]')?.click();
    window.trackerUI?.loadTasks();
  } catch (e) {
    alert(`Hire failed: ${e.message}`);
  }
}

// -----------------------------------------------------------------------
// Filter
// -----------------------------------------------------------------------

function filterAgents(query, skills) {
  let filtered = [..._allAgents];
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  if (skills && skills.length) {
    const skillSet = new Set(skills);
    filtered = filtered.filter(a => a.skills.some(s => skillSet.has(s)));
  }
  return filtered;
}

// -----------------------------------------------------------------------
// Event handlers
// -----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const searchInput   = document.getElementById('search-input');
  const skillFilter   = document.getElementById('skill-filter');
  const featuredBtn   = document.getElementById('show-featured-btn');

  loadAgents();

  let searchTimer = null;

  function applyFilters() {
    const q = searchInput?.value.trim() || '';
    const skills = skillFilter
      ? Array.from(skillFilter.selectedOptions)
          .map(o => o.value)
          .filter(Boolean)
      : [];
    loadAgents({ q: q || undefined, skills: skills.length ? skills : undefined, featured: _featuredOnly || undefined });
  }

  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applyFilters, 300);
  });

  skillFilter?.addEventListener('change', applyFilters);

  featuredBtn?.addEventListener('click', () => {
    _featuredOnly = !_featuredOnly;
    featuredBtn.style.color = _featuredOnly ? 'var(--neon-yellow)' : '';
    featuredBtn.style.borderColor = _featuredOnly ? 'var(--neon-yellow)' : '';
    applyFilters();
  });
});

// Expose for app.js
window.marketplaceUI = { loadAgents, renderAgentCard };
