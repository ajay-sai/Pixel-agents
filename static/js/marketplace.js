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
  // Initialize Pokémon-quality canvas avatars
  if (typeof initAgentAvatars === 'function') initAgentAvatars();
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
          <canvas class="agent-avatar-canvas"
            id="avatar-${window.escapeHtml(agent.id)}"
            width="48" height="48"
            data-agent-id="${window.escapeHtml(agent.id)}"
            data-agent-skill="${window.escapeHtml((agent.skills||[])[0]||'')}"
            style="image-rendering:pixelated;"></canvas>
        </div>
        <div class="flex-col gap-4 flex-1" style="min-width:0;">
          <div class="truncate" style="font-size:0.7rem;color:var(--neon-green);">${window.escapeHtml(agent.name)}</div>
          <div class="text-xs text-dim">${window.escapeHtml(agent.source_repo)}</div>
          <div class="flex gap-4 items-center mt-4">
            <span class="star-rating">${stars}</span>
            <span class="text-xs text-dim">(${agent.rating})</span>
            <span class="text-xs text-dim" data-installs="${agent.id}" style="margin-left:8px;">⬇ ${agent.installs.toLocaleString()}</span>
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
// Canvas-based Pokémon-quality agent avatar renderer
// (mirrors the SPRITE_PALETTES / drawPixelChar logic from pixel-canvas.js,
//  adapted for standalone use on the 48×48 marketplace avatar canvases)
// -----------------------------------------------------------------------

const _SKILL_TO_CHAR = {
  CODE_GENERATION:'coder', BACKEND:'coder',   FRONTEND:'designer',
  CODE_REVIEW:'architect', DEBUGGING:'debugger', SECURITY:'debugger',
  TESTING:'tester',        DEVOPS:'devops',   DOCUMENTATION:'researcher',
  RESEARCH:'researcher',   DATA_ANALYSIS:'analyst', WRITING:'researcher',
};

const _AVATAR_PAL = {
  coder:      { out:'#001a08', drk:'#004411', mid:'#00cc33', lit:'#88ffaa', skn:'#c8eec8', eye:'#00ffff', acc:'#00ff41' },
  debugger:   { out:'#1a0000', drk:'#550000', mid:'#cc2222', lit:'#ff9988', skn:'#ffe0d8', eye:'#ffff44', acc:'#ff8800' },
  researcher: { out:'#001a1a', drk:'#004444', mid:'#00aaaa', lit:'#88ffff', skn:'#ccf5f5', eye:'#0088ff', acc:'#ff00cc' },
  architect:  { out:'#1a0a00', drk:'#553300', mid:'#cc6600', lit:'#ffcc88', skn:'#ffe8cc', eye:'#ffff00', acc:'#ffcc00' },
  tester:     { out:'#1a1a00', drk:'#555500', mid:'#aaaa00', lit:'#ffff88', skn:'#fffff0', eye:'#00ff88', acc:'#00ffff' },
  devops:     { out:'#0d0022', drk:'#330066', mid:'#8822cc', lit:'#cc88ff', skn:'#e8d0ff', eye:'#ffff00', acc:'#ff00ff' },
  designer:   { out:'#1a001a', drk:'#550055', mid:'#cc00cc', lit:'#ff88ff', skn:'#ffd8ff', eye:'#00ffff', acc:'#ffff00' },
  analyst:    { out:'#00111a', drk:'#002244', mid:'#2288cc', lit:'#88ccff', skn:'#d0e8ff', eye:'#ffff44', acc:'#00ffff' },
};

// Animation frame counter for avatar canvases
let _avatarFrame = 0;
const _avatarCanvases = new Map(); // id → { ctx, type, frame }

function _apxr(ctx, x, y, w, h, color, s) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x*s), Math.round(y*s), Math.round(w*s), Math.round(h*s));
}

function _drawAvatarSprite(ctx, type, frame) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);
  // Dark bg with gradient
  const grad = ctx.createRadialGradient(W/2, H/2, 2, W/2, H/2, W*0.7);
  grad.addColorStop(0, '#1a2a3a');
  grad.addColorStop(1, '#0a0d14');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const s = 1.6; // scale: logical px → canvas px
  const p = _AVATAR_PAL[type] || _AVATAR_PAL.coder;
  // translate to center-bottom of avatar area
  ctx.save();
  ctx.translate(W/2, H * 0.78);

  const bob = Math.sin(frame * 0.07) * 0.8;

  // TORSO
  _apxr(ctx, -4, -8+bob, 8, 8, p.out, s);
  _apxr(ctx, -3, -7+bob, 6, 6, p.mid, s);
  _apxr(ctx, -3, -7+bob, 3, 2, p.lit, s);
  _apxr(ctx, -3, -3+bob, 6, 2, p.drk, s);
  _apxr(ctx, -2, 0+bob,  4, 1, p.acc, s);  // belt

  // LEGS
  _apxr(ctx, -4, 1+bob, 3, 5, p.out, s);
  _apxr(ctx,  1, 1+bob, 3, 5, p.out, s);
  _apxr(ctx, -3, 1+bob, 2, 4, p.drk, s);
  _apxr(ctx,  2, 1+bob, 2, 4, p.drk, s);
  // feet
  _apxr(ctx, -4, 6+bob, 4, 2, p.out, s);
  _apxr(ctx,  0, 6+bob, 4, 2, p.out, s);
  _apxr(ctx, -3, 6+bob, 3, 1, p.mid, s);
  _apxr(ctx,  1, 6+bob, 3, 1, p.mid, s);

  // ARMS (idle dangle)
  _apxr(ctx, -6, -7+bob, 2, 5, p.out, s);
  _apxr(ctx, -5, -6+bob, 1, 4, p.mid, s);
  _apxr(ctx,  4, -7+bob, 2, 5, p.out, s);
  _apxr(ctx,  4, -6+bob, 1, 4, p.mid, s);

  // HEAD
  _apxr(ctx, -3, -14+bob, 6, 7, p.out, s);
  _apxr(ctx, -2, -13+bob, 4, 5, p.skn, s);
  _apxr(ctx, -2, -13+bob, 2, 2, p.lit.replace ? p.lit : p.skn, s);
  // Eyes
  _apxr(ctx, -1.5, -11+bob, 1, 1, p.eye, s);
  _apxr(ctx,  0.5, -11+bob, 1, 1, p.eye, s);
  // Mouth
  _apxr(ctx, -1, -10+bob, 3, 1, p.out, s);

  // TYPE-SPECIFIC HAT / ACCESSORY
  const a = p.acc;
  if (type === 'coder') {
    _apxr(ctx, -0.5,-17+bob,1,2, a, s);
    _apxr(ctx,  -1, -18+bob,2,1, p.eye, s);
    _apxr(ctx, -3, -12+bob, 6, 2, p.eye, s); // visor
    _apxr(ctx, -3, -12+bob, 6, 1, p.out, s);
    _apxr(ctx, -2, -5+bob, 1, 1, a, s); _apxr(ctx, 1, -5+bob, 1, 1, a, s);
  } else if (type === 'debugger') {
    _apxr(ctx, -4,-17+bob,8,1, p.out, s);
    _apxr(ctx, -2,-20+bob,4,3, p.out, s);
    _apxr(ctx, -1,-19+bob,3,2, p.mid, s);
    _apxr(ctx, -2,-15+bob,2,1, p.out, s); _apxr(ctx,1,-15+bob,2,1,p.out,s);
    _apxr(ctx,  1, -6+bob, 3, 3, p.out, s); // magnifier
    _apxr(ctx,  1, -6+bob, 2, 2, 'rgba(100,200,255,0.4)', s);
  } else if (type === 'researcher') {
    _apxr(ctx, -3,-18+bob,6,1, p.out, s);
    _apxr(ctx, -1,-22+bob,2,4, p.out, s);
    _apxr(ctx, -.5,-21+bob,1,3, p.mid, s);
    _apxr(ctx, -0.5,-22+bob,1,1, p.acc, s);
    _apxr(ctx, -3,-12+bob,2,2, p.out, s); _apxr(ctx,1,-12+bob,2,2,p.out,s);
    _apxr(ctx, -2,-12+bob,1,1, 'rgba(180,220,255,0.5)', s);
    _apxr(ctx,  1,-12+bob,1,1,'rgba(180,220,255,0.5)',s);
    _apxr(ctx,  0, -5+bob, 1, 3, p.acc, s); _apxr(ctx,-1,-4+bob,3,1,p.acc,s);
  } else if (type === 'architect') {
    _apxr(ctx, -4,-18+bob,8,1, p.out, s);
    _apxr(ctx, -3,-21+bob,6,3, p.out, s);
    _apxr(ctx, -2,-20+bob,4,2, p.mid, s);
    _apxr(ctx, -2,-20+bob,2,1, p.lit, s);
    _apxr(ctx, -2,-7+bob,4,5, p.out, s);
    _apxr(ctx, -1,-6+bob,3,4, p.acc, s);
    _apxr(ctx,  0,-4+bob,1,3, p.out, s);
  } else if (type === 'tester') {
    _apxr(ctx, -3,-15+bob,3,2, p.out, s); _apxr(ctx,0,-15+bob,3,2,p.out,s);
    _apxr(ctx, -2,-15+bob,2,1, p.eye, s); _apxr(ctx,1,-15+bob,2,1,p.eye,s);
    _apxr(ctx,  4, -6+bob, 4, 5, p.out, s);
    _apxr(ctx,  5, -5+bob, 3, 4, 'rgba(220,240,255,0.7)', s);
    _apxr(ctx,  6, -3+bob, 1, 3, p.acc, s);
  } else if (type === 'devops') {
    _apxr(ctx, -4,-18+bob,8,1, p.out, s);
    _apxr(ctx, -2,-21+bob,4,3, p.out, s);
    _apxr(ctx, -1,-20+bob,3,2, p.mid, s);
    _apxr(ctx,  0,-21+bob,1,1, p.acc, s);
    _apxr(ctx, -1,-6+bob,3,3, p.out, s);
    _apxr(ctx,  0,-5+bob,1,1, p.lit, s);
    _apxr(ctx, -1,-5+bob,1,1,p.acc,s); _apxr(ctx,1,-5+bob,1,1,p.acc,s);
    _apxr(ctx,  0,-4+bob,1,1,p.acc,s);
  } else if (type === 'designer') {
    _apxr(ctx, -4,-18+bob,8,2, p.out, s);
    _apxr(ctx, -3,-19+bob,6,2, p.mid, s);
    _apxr(ctx, -3,-19+bob,3,1, p.lit, s);
    _apxr(ctx,  2,-20+bob,1,2, p.acc, s);
    _apxr(ctx, -2,-7+bob,5,4, p.out, s);
    _apxr(ctx, -2,-6+bob,2,2, '#ff4444', s);
    _apxr(ctx,  0,-6+bob,2,2, '#ffaa00', s);
    _apxr(ctx, -2,-4+bob,2,1, '#00ff88', s);
    _apxr(ctx,  0,-4+bob,2,1, '#00aaff', s);
    _apxr(ctx,  4,-7+bob,2,7, p.out, s);
    _apxr(ctx,  4,-7+bob,2,2, p.acc, s);
    _apxr(ctx,  4,-5+bob,1,5, p.mid, s);
  } else if (type === 'analyst') {
    _apxr(ctx, -3,-15+bob,3,3, p.out, s); _apxr(ctx,0,-15+bob,3,3,p.out,s);
    _apxr(ctx, -2,-14+bob,1,1,'rgba(150,200,255,0.5)',s);
    _apxr(ctx,  1,-14+bob,1,1,'rgba(150,200,255,0.5)',s);
    _apxr(ctx, -1,-14+bob,2,1,p.out,s);
    _apxr(ctx, -2,-7+bob,5,5, p.out, s);
    _apxr(ctx, -1,-6+bob,4,4, '#0a1520', s);
    _apxr(ctx, -1,-3+bob,1,3, p.acc, s);
    _apxr(ctx,  0,-4+bob,1,4, p.mid, s);
    _apxr(ctx,  1,-2+bob,1,2, p.eye, s);
    _apxr(ctx,  2,-5+bob,1,5, p.lit, s);
  }

  ctx.restore();
}

function _startAvatarLoop() {
  _avatarFrame++;
  _avatarCanvases.forEach(({ ctx, type }) => {
    _drawAvatarSprite(ctx, type, _avatarFrame);
  });
  requestAnimationFrame(_startAvatarLoop);
}
requestAnimationFrame(_startAvatarLoop);

function initAgentAvatars() {
  document.querySelectorAll('canvas.agent-avatar-canvas').forEach(canvas => {
    if (_avatarCanvases.has(canvas.id)) return;
    const skill = canvas.dataset.agentSkill || '';
    const type  = _SKILL_TO_CHAR[skill] || 'coder';
    const ctx   = canvas.getContext('2d');
    _avatarCanvases.set(canvas.id, { ctx, type });
  });
}

window.initAgentAvatars = initAgentAvatars;

function agentSprite(agentId) {
  // Legacy fallback — now we use canvas avatars; keep emoji for any non-canvas contexts
  const _sprites = ['🧙','🕵️','🤖','👾','🦾','🧬','🛸','🎮','⚡','🔮','🦊','🎯'];
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

    // Update installs count in the card and in the DOM
    _allAgents = _allAgents.map(a => a.id === agentId ? updated : a);
    const installsSpan = document.querySelector(`[data-installs="${agentId}"]`);
    if (installsSpan) installsSpan.textContent = `⬇ ${updated.installs.toLocaleString()}`;
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

    // Hire this specific agent by passing agent_id in the request body
    const hireRes = await fetch(`/api/tasks/${task.id}/hire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent_id: agentId }),
    });
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
