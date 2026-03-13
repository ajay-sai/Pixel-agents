/**
 * app.js — Main application logic: tab routing + WebSocket client
 */

const API = '';  // same-origin

let ws = null;
let wsReconnectTimer = null;
const WS_RECONNECT_DELAY = 3000;

// -----------------------------------------------------------------------
// Tab navigation
// -----------------------------------------------------------------------

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${target}`)?.classList.add('active');

      if (target === 'canvas') {
        window.pixelCanvas?.loadCanvasState();
      }
    });
  });
}

// -----------------------------------------------------------------------
// Stats bar
// -----------------------------------------------------------------------

async function loadStats() {
  try {
    const res = await fetch(`${API}/api/stats`);
    if (!res.ok) return;
    const stats = await res.json();
    document.getElementById('stat-agents').textContent   = stats.total_agents   ?? '--';
    document.getElementById('stat-installs').textContent = (stats.total_installs ?? '--').toLocaleString();
    document.getElementById('stat-tasks').textContent    = stats.active_tasks   ?? '--';
    document.getElementById('stat-rating').textContent   = stats.avg_rating     ?? '--';
  } catch (e) {
    console.warn('Stats load failed:', e);
  }
}

// -----------------------------------------------------------------------
// WebSocket
// -----------------------------------------------------------------------

function connectWebSocket() {
  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  const url = `${proto}://${location.host}/ws/tracker`;

  if (ws) {
    try { ws.close(); } catch (_) {}
  }

  ws = new WebSocket(url);
  const indicator = document.getElementById('ws-status');

  ws.onopen = () => {
    indicator.textContent = '● LIVE';
    indicator.style.color = 'var(--neon-green)';
    if (wsReconnectTimer) { clearTimeout(wsReconnectTimer); wsReconnectTimer = null; }
  };

  ws.onmessage = (ev) => {
    let msg;
    try { msg = JSON.parse(ev.data); } catch (_) { return; }
    handleWebSocketMessage(msg);
  };

  ws.onerror = () => {
    indicator.textContent = '● ERROR';
    indicator.style.color = 'var(--neon-pink)';
  };

  ws.onclose = () => {
    indicator.textContent = '● OFFLINE';
    indicator.style.color = '#ff4455';
    wsReconnectTimer = setTimeout(connectWebSocket, WS_RECONNECT_DELAY);
  };
}

function handleWebSocketMessage(msg) {
  switch (msg.type) {
    case 'init':
      window.pixelCanvas?.handleWebSocket(msg);
      break;

    case 'task_event':
    case 'task_created':
    case 'task_complete':
    case 'agent_hired':
      window.trackerUI?.handleWsEvent(msg);
      window.pixelCanvas?.handleWebSocket(msg);
      addEventToFeedGlobal(msg);
      loadStats();
      break;

    case 'agent_installed':
      loadStats();
      break;

    case 'ping':
      break;

    default:
      break;
  }
}

// -----------------------------------------------------------------------
// Global event feed (shared with tracker.js)
// -----------------------------------------------------------------------

function addEventToFeedGlobal(msg) {
  const feed = document.getElementById('event-feed');
  if (!feed) return;

  const now = new Date().toLocaleTimeString('en-US', { hour12: false });
  const item = document.createElement('div');
  item.className = 'event-feed-item';

  const typeLabel = msg.event_type || msg.type || 'event';
  const message   = msg.message || JSON.stringify(msg).slice(0, 80);

  item.innerHTML = `
    <span class="event-time">${now}</span>
    <span class="event-type">[${typeLabel.toUpperCase()}]</span>
    <span class="event-msg">${escapeHtml(message)}</span>
  `;

  // Remove placeholder if present
  const placeholder = feed.querySelector('.text-dim');
  if (placeholder) placeholder.remove();

  feed.insertBefore(item, feed.firstChild);

  // Keep feed bounded
  while (feed.children.length > 100) {
    feed.removeChild(feed.lastChild);
  }
}

// -----------------------------------------------------------------------
// Utility
// -----------------------------------------------------------------------

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.escapeHtml = escapeHtml;

// -----------------------------------------------------------------------
// Skills list (shared across modules)
// -----------------------------------------------------------------------

const ALL_SKILLS = [
  'CODE_GENERATION','CODE_REVIEW','DEBUGGING','TESTING',
  'DOCUMENTATION','RESEARCH','DATA_ANALYSIS','DEVOPS',
  'FRONTEND','BACKEND','SECURITY','WRITING'
];

window.ALL_SKILLS = ALL_SKILLS;

function buildSkillCheckboxes(containerId, namePrefix) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  ALL_SKILLS.forEach(skill => {
    const label = document.createElement('label');
    label.className = 'pixel-checkbox';
    label.innerHTML = `
      <input type="checkbox" name="${namePrefix}" value="${skill}" />
      <span class="pixel-badge badge-${skill}" style="cursor:pointer;">${skill.replace(/_/g,' ')}</span>
    `;
    container.appendChild(label);
  });
}

window.buildSkillCheckboxes = buildSkillCheckboxes;

function getCheckedSkills(containerId) {
  return Array.from(
    document.querySelectorAll(`#${containerId} input[type=checkbox]:checked`)
  ).map(cb => cb.value);
}

window.getCheckedSkills = getCheckedSkills;

// -----------------------------------------------------------------------
// Startup
// -----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadStats();
  connectWebSocket();

  // Build skill checkboxes for both Auto-Hire and New Task modal
  buildSkillCheckboxes('skill-checkboxes', 'route-skill');
  buildSkillCheckboxes('modal-skill-checkboxes', 'modal-skill');

  // New task modal
  const modal     = document.getElementById('new-task-modal');
  const openBtn   = document.getElementById('new-task-btn');
  const cancelBtn = document.getElementById('cancel-task-btn');
  const createBtn = document.getElementById('create-task-btn');

  openBtn?.addEventListener('click',   () => { modal.style.display = 'flex'; });
  cancelBtn?.addEventListener('click', () => { modal.style.display = 'none'; });

  createBtn?.addEventListener('click', async () => {
    const title = document.getElementById('new-task-title').value.trim();
    const desc  = document.getElementById('new-task-desc').value.trim();
    const skills = getCheckedSkills('modal-skill-checkboxes');

    if (!title) { alert('Please enter a task title.'); return; }

    try {
      const res = await fetch(`${API}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc, required_skills: skills }),
      });

      if (!res.ok) throw new Error(await res.text());
      const task = await res.json();

      // Auto-hire best agent
      await fetch(`${API}/api/tasks/${task.id}/hire`, { method: 'POST' });

      modal.style.display = 'none';
      document.getElementById('new-task-title').value = '';
      document.getElementById('new-task-desc').value  = '';

      // Switch to tracker tab
      document.querySelector('[data-tab="tracker"]')?.click();
      window.trackerUI?.loadTasks();
    } catch (e) {
      alert(`Failed to create task: ${e.message}`);
    }
  });

  // Refresh stats periodically
  setInterval(loadStats, 10000);
});

// -----------------------------------------------------------------------
// Auto-Hire tab logic
// -----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const findBtn = document.getElementById('find-agent-btn');
  const resultsDiv = document.getElementById('route-results');

  findBtn?.addEventListener('click', async () => {
    const description = document.getElementById('route-description')?.value.trim();
    const skills      = getCheckedSkills('skill-checkboxes');
    const tagsRaw     = document.getElementById('route-tags')?.value.trim();
    const tags        = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : undefined;

    if (!description) { alert('Please describe your task.'); return; }

    findBtn.textContent = '⏳ MATCHING…';
    findBtn.disabled = true;

    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_description: description, required_skills: skills, preferred_tags: tags }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      renderRouteResults(data, description, skills);
    } catch (e) {
      resultsDiv.innerHTML = `<div style="color:var(--status-error);font-size:0.65rem;padding:16px;">${escapeHtml(e.message)}</div>`;
    } finally {
      findBtn.textContent = '🤖 FIND BEST AGENT';
      findBtn.disabled = false;
    }
  });
});

// Stores pending hire context keyed by a token to avoid putting user data in HTML attributes
const _hireContext = new Map();
let _hireContextSeq = 0;

function renderRouteResults(data, description, skills) {
  const resultsDiv = document.getElementById('route-results');
  const agent = data.selected_agent;
  const confidencePct = Math.round((data.confidence || 0) * 100);

  const skillBadges = (agent.skills || [])
    .map(s => `<span class="pixel-badge badge-${s}" style="font-size:0.45rem;">${s.replace(/_/g,' ')}</span>`)
    .join(' ');

  const alternatives = (data.alternatives || []).map(a => `
    <div class="flex items-center gap-8" style="padding:6px 0;border-bottom:1px solid var(--border-dim);">
      <span style="font-size:1.2rem;">${agentEmojiById(a.id)}</span>
      <div class="flex-col gap-4 flex-1">
        <span style="font-size:0.6rem;color:var(--text-primary);">${escapeHtml(a.name)}</span>
        <span class="text-xs text-dim">${escapeHtml(a.source_repo)}</span>
      </div>
      <span style="font-size:0.6rem;color:var(--neon-yellow);">★ ${a.rating}</span>
    </div>
  `).join('');

  // Store hire context in a Map instead of HTML attributes to avoid XSS
  const token = String(++_hireContextSeq);
  _hireContext.set(token, { agentId: agent.id, description, skills });

  resultsDiv.innerHTML = `
    <div class="route-result mb-12">
      <div class="flex gap-12 items-start mb-12">
        <div class="pixel-avatar" style="font-size:1.5rem;">${agentEmojiById(agent.id)}</div>
        <div class="flex-col gap-4 flex-1">
          <div style="font-size:0.7rem;color:var(--neon-green);">${escapeHtml(agent.name)}</div>
          <div class="text-xs text-dim">${escapeHtml(agent.source_repo)}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.9rem;color:var(--neon-yellow);">${confidencePct}%</div>
          <div class="text-xs text-dim">MATCH</div>
        </div>
      </div>

      <div class="confidence-bar">
        <div class="confidence-fill" style="width:${confidencePct}%;"></div>
      </div>

      <div class="flex flex-wrap gap-4 mt-8 mb-12">${skillBadges}</div>

      <p style="font-size:0.58rem;color:var(--text-secondary);line-height:1.7;margin-bottom:12px;">
        ${escapeHtml(data.reasoning)}
      </p>

      <button class="pixel-btn pixel-btn--green w-full"
        id="hire-btn-${escapeHtml(token)}">
        ✓ HIRE &amp; CREATE TASK
      </button>
    </div>

    ${alternatives ? `
      <div class="pixel-card">
        <div class="text-sm text-dim mb-8">ALTERNATIVES</div>
        ${alternatives}
      </div>
    ` : ''}
  `;

  document.getElementById(`hire-btn-${token}`)?.addEventListener('click', function () {
    hireAndCreateTask(token, this);
  });
}

async function hireAndCreateTask(token, btn) {
  const ctx = _hireContext.get(token);
  if (!ctx) return;
  const { description, skills } = ctx;

  btn.textContent = '⏳ CREATING…';
  btn.disabled = true;

  try {
    const taskRes = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: description.slice(0, 60), description, required_skills: skills }),
    });
    if (!taskRes.ok) throw new Error(await taskRes.text());
    const task = await taskRes.json();

    await fetch(`/api/tasks/${task.id}/hire`, { method: 'POST' });

    btn.textContent = '✓ HIRED! See Live Tracker';
    _hireContext.delete(token);
    document.querySelector('[data-tab="tracker"]')?.click();
    window.trackerUI?.loadTasks();
  } catch (e) {
    alert(`Hire failed: ${e.message}`);
    btn.textContent = '✓ HIRE & CREATE TASK';
    btn.disabled = false;
  }
}

window.hireAndCreateTask = hireAndCreateTask;

function agentEmojiById(id) {
  const sprites = ['🧙','🕵️','🤖','👾','🦾','🧬','🛸','🎮','⚡','🔮','🦊','🎯'];
  const num = parseInt((id || '').replace(/\D/g,''), 10) || 0;
  return sprites[num % sprites.length];
}
