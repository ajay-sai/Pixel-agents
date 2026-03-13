/**
 * skills.js — Skills Library UI for Pixel Market
 */

// Local escapeHtml fallback (app.js also defines window.escapeHtml — use whichever is available)
function _skillEsc(s) {
  if (typeof window !== 'undefined' && typeof window.escapeHtml === 'function') return window._skillEsc(s);
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

let _allSkills = [];
let _activeCategory = '';
let _searchQuery = '';

// ─────────────────────────────────────────────────────────────────────────────
// Load and render skills
// ─────────────────────────────────────────────────────────────────────────────

async function loadSkills(filters = {}) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.category) params.set('category', filters.category);

  try {
    const res = await fetch(`/api/skills?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const skills = await res.json();
    _allSkills = skills;
    renderSkillGrid(skills);
  } catch (e) {
    console.error('Failed to load skills:', e);
    const grid = document.getElementById('skills-grid');
    if (grid) grid.innerHTML = '<div class="text-dim text-xs" style="padding:24px;">Failed to load skills.</div>';
  }
}

function renderSkillGrid(skills) {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;

  if (!skills.length) {
    grid.innerHTML = '<div class="text-dim text-xs" style="padding:24px;">No skills match your search.</div>';
    return;
  }

  grid.innerHTML = skills.map(renderSkillCard).join('');
}

function renderSkillCard(skill) {
  const tags = (skill.tags || []).map(t =>
    `<span class="pixel-badge skill-tag-badge">${_skillEsc(t)}</span>`
  ).join('');
  const agents = (skill.compatible_agents || []).join(', ');
  const pattern = skill.auto_invoke_pattern
    ? `<span class="skill-auto-badge">⚡ AUTO</span>`
    : '';

  return `
  <div class="skill-card pixel-card" data-skill-id="${_skillEsc(skill.id)}">
    <div class="skill-card__header">
      <div class="skill-card__title">
        <span class="skill-category-dot skill-category--${_skillEsc(skill.category)}"></span>
        ${_skillEsc(skill.name)}
      </div>
      ${pattern}
    </div>
    <div class="skill-card__desc text-xs text-dim">${_skillEsc(skill.description.slice(0, 140))}…</div>
    <div class="skill-card__meta text-xs text-dim">
      <span>📦 ${skill.installs.toLocaleString()} installs</span>
      <span class="skill-badge skill-badge--${_skillEsc(skill.category)}">${_skillEsc(skill.category)}</span>
    </div>
    <div class="skill-card__tags">${tags}</div>
    <div class="skill-card__agents text-xs text-dim" style="margin-top:6px;">
      Agents: <span style="color:#8899aa;">${_skillEsc(agents) || '—'}</span>
    </div>
    <div class="skill-card__actions">
      <button class="pixel-btn pixel-btn--ghost skill-download-btn" 
              onclick="downloadSkill('${_skillEsc(skill.id)}')"
              style="font-size:0.5rem;padding:5px 8px;">
        ⬇ Download .md
      </button>
      <button class="pixel-btn pixel-btn--ghost skill-attach-btn"
              onclick="attachSkillToTask('${_skillEsc(skill.id)}')"
              style="font-size:0.5rem;padding:5px 8px;">
        🔗 Attach to Task
      </button>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Download skill as .md file
// ─────────────────────────────────────────────────────────────────────────────

async function downloadSkill(skillId) {
  try {
    const res = await fetch(`/api/skills/${encodeURIComponent(skillId)}/download`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Trigger browser download
    const blob = new Blob([data.content], { type: 'text/markdown;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = data.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Flash feedback
    const btn = document.querySelector(`[data-skill-id="${skillId}"] .skill-download-btn`);
    if (btn) {
      btn.textContent = '✓ Downloaded';
      setTimeout(() => { btn.textContent = '⬇ Download .md'; }, 2000);
    }
  } catch (e) {
    console.error('Download failed:', e);
    alert(`Failed to download skill: ${e.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Attach skill to current task (opens new task modal pre-filled)
// ─────────────────────────────────────────────────────────────────────────────

function attachSkillToTask(skillId) {
  const skill = _allSkills.find(s => s.id === skillId);
  if (!skill) return;

  // Pre-fill the new task modal description with skill name
  const descEl = document.getElementById('new-task-desc');
  if (descEl) {
    descEl.value = `Using skill: ${skill.name}\n\n${skill.description.slice(0, 200)}`;
  }

  // Open the new task modal
  const modal = document.getElementById('new-task-modal');
  if (modal) modal.style.display = 'flex';

  // Select compatible skill checkboxes
  (skill.compatible_agents || []).forEach(agentId => {
    // Extract rough skill from agent id pattern
    const checkboxes = document.querySelectorAll('#modal-skill-checkboxes input[type=checkbox]');
    checkboxes.forEach(cb => cb.checked = false);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Client-side filtering
// ─────────────────────────────────────────────────────────────────────────────

function filterSkills(query, category) {
  _searchQuery = (query || '').toLowerCase();
  _activeCategory = category || '';
  let filtered = _allSkills;

  if (_activeCategory) {
    filtered = filtered.filter(s => s.category.toLowerCase() === _activeCategory.toLowerCase());
  }
  if (_searchQuery) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(_searchQuery) ||
      s.description.toLowerCase().includes(_searchQuery) ||
      (s.tags || []).some(t => t.toLowerCase().includes(_searchQuery))
    );
  }
  renderSkillGrid(filtered);
}

// ─────────────────────────────────────────────────────────────────────────────
// Init skills tab
// ─────────────────────────────────────────────────────────────────────────────

function initSkillsTab() {
  const searchEl = document.getElementById('skills-search');
  const catEl    = document.getElementById('skills-category-filter');

  if (searchEl) {
    searchEl.addEventListener('input', () => {
      filterSkills(searchEl.value, catEl ? catEl.value : '');
    });
  }
  if (catEl) {
    catEl.addEventListener('change', () => {
      filterSkills(searchEl ? searchEl.value : '', catEl.value);
    });
  }

  loadSkills();
}
