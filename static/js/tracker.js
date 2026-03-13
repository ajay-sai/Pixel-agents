/**
 * tracker.js — Live task cards + WebSocket event handling
 */

// -----------------------------------------------------------------------
// Load & render tasks
// -----------------------------------------------------------------------

async function loadTasks() {
  try {
    const res = await fetch('/api/tasks');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const tasks = await res.json();
    renderTaskList(tasks);
  } catch (e) {
    console.error('loadTasks error:', e);
    document.getElementById('task-list').innerHTML =
      `<div class="text-xs" style="color:var(--status-error);padding:16px;">Failed to load tasks: ${window.escapeHtml(e.message)}</div>`;
  }
}

function renderTaskList(tasks) {
  const list = document.getElementById('task-list');
  if (!list) return;

  if (!tasks.length) {
    list.innerHTML = '<div class="text-dim text-sm" style="padding:24px;">No tasks yet. Create one above!</div>';
    return;
  }

  // Sort: IN_PROGRESS first, then PENDING, then COMPLETE/FAILED
  const ORDER = { 'IN_PROGRESS': 0, 'PENDING': 1, 'COMPLETE': 2, 'FAILED': 3 };
  const sorted = [...tasks].sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9));

  list.innerHTML = sorted.map(renderTaskCard).join('');
}

function renderTaskCard(task) {
  const recentEvents = (task.events || [])
    .slice(-5)
    .reverse()
    .map(ev => `
      <div style="font-size:0.5rem;color:var(--text-dim);padding:2px 0;border-bottom:1px solid #0d1a26;">
        <span style="color:var(--neon-yellow);">[${window.escapeHtml(ev.event_type)}]</span>
        ${window.escapeHtml(ev.message)}
      </div>
    `).join('');

  const skills = (task.required_skills || [])
    .map(s => `<span class="pixel-badge badge-${s}" style="font-size:0.45rem;">${s.replace(/_/g,' ')}</span>`)
    .join(' ');

  const agentLabel = task.assigned_agent_id
    ? `<span class="text-xs" style="color:var(--neon-blue);">Agent: ${window.escapeHtml(task.assigned_agent_id)}</span>`
    : `<span class="text-xs text-dim">Unassigned</span>`;

  const progressPct = task.progress || 0;
  const progressClass = task.status === 'FAILED' ? 'pixel-progress--error'
                      : progressPct < 50 ? 'pixel-progress--warning'
                      : '';

  const isComplete = task.status === 'COMPLETE' || task.status === 'FAILED';

  return `
    <div class="pixel-card mb-12" id="task-card-${task.id}" style="border-color:${statusBorderColor(task.status)};">
      <div class="flex justify-between items-start gap-8 mb-8">
        <div class="flex-col gap-4 flex-1" style="min-width:0;">
          <div class="truncate" style="font-size:0.65rem;color:var(--text-primary);">${window.escapeHtml(task.title)}</div>
          ${agentLabel}
        </div>
        <span class="task-status-badge status-${task.status}">${task.status.replace('_',' ')}</span>
      </div>

      <div class="flex flex-wrap gap-4 mb-8">${skills}</div>

      <div class="pixel-progress ${progressClass} mb-4">
        <div class="pixel-progress__fill" id="progress-${task.id}" style="width:${progressPct}%;"></div>
      </div>
      <div class="flex justify-between text-xs text-dim mb-8">
        <span>Progress</span>
        <span id="progress-pct-${task.id}">${progressPct}%</span>
      </div>

      ${recentEvents ? `
        <div style="background:#060e18;border:1px solid #0d1a26;border-radius:2px;padding:6px;max-height:90px;overflow-y:auto;">
          ${recentEvents}
        </div>
      ` : ''}

      ${!isComplete ? `
        <div class="flex gap-8 mt-8">
          <button class="pixel-btn pixel-btn--ghost text-xs" style="padding:4px 8px;font-size:0.5rem;"
            onclick="completeTask('${task.id}')">✓ MARK COMPLETE</button>
        </div>
      ` : ''}
    </div>
  `;
}

function statusBorderColor(status) {
  switch (status) {
    case 'IN_PROGRESS': return 'var(--neon-green)';
    case 'PENDING':     return '#ffaa00';
    case 'COMPLETE':    return 'var(--neon-blue)';
    case 'FAILED':      return '#ff4455';
    default:            return 'var(--border-dim)';
  }
}

// -----------------------------------------------------------------------
// Complete task
// -----------------------------------------------------------------------

async function completeTask(taskId) {
  try {
    const res = await fetch(`/api/tasks/${taskId}/complete`, { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
    const task = await res.json();
    updateTaskCard(task);
  } catch (e) {
    alert(`Could not complete task: ${e.message}`);
  }
}

window.completeTask = completeTask;

// -----------------------------------------------------------------------
// Live update helpers
// -----------------------------------------------------------------------

function updateTaskCard(task) {
  const card = document.getElementById(`task-card-${task.id}`);
  if (card) {
    card.outerHTML = renderTaskCard(task);
  } else {
    // Task not in DOM yet — reload
    loadTasks();
  }
}

function updateTaskProgress(taskId, progress, eventType, message) {
  const fill = document.getElementById(`progress-${taskId}`);
  const pct  = document.getElementById(`progress-pct-${taskId}`);
  if (fill) fill.style.width = `${progress}%`;
  if (pct)  pct.textContent  = `${progress}%`;

  // Append to event log inside the card
  const card = document.getElementById(`task-card-${taskId}`);
  if (card) {
    let logDiv = card.querySelector('[data-event-log]');
    if (!logDiv) {
      logDiv = document.createElement('div');
      logDiv.setAttribute('data-event-log', '1');
      logDiv.style.cssText = 'background:#060e18;border:1px solid #0d1a26;border-radius:2px;padding:6px;max-height:90px;overflow-y:auto;margin-top:4px;';
      card.appendChild(logDiv);
    }
    const item = document.createElement('div');
    item.style.cssText = 'font-size:0.5rem;color:var(--text-dim);padding:2px 0;border-bottom:1px solid #0d1a26;';
    item.innerHTML = `<span style="color:var(--neon-yellow);">[${window.escapeHtml(eventType)}]</span> ${window.escapeHtml(message)}`;
    logDiv.insertBefore(item, logDiv.firstChild);
    while (logDiv.children.length > 6) logDiv.removeChild(logDiv.lastChild);
  }
}

// -----------------------------------------------------------------------
// WebSocket event handler (called from app.js)
// -----------------------------------------------------------------------

function handleWsEvent(msg) {
  switch (msg.type) {
    case 'task_event':
      updateTaskProgress(msg.task_id, msg.progress || 0, msg.event_type || 'event', msg.message || '');
      break;

    case 'task_complete':
      // Reload the card to get full updated state
      fetch(`/api/tasks/${msg.task_id}`)
        .then(r => r.json())
        .then(task => updateTaskCard(task))
        .catch(() => {});
      break;

    case 'task_created':
    case 'agent_hired':
      loadTasks();
      break;
  }
}

// -----------------------------------------------------------------------
// Boot
// -----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // Load tasks when tracker tab is shown
  const trackerTab = document.querySelector('[data-tab="tracker"]');
  trackerTab?.addEventListener('click', loadTasks);

  // Also load on startup so data is ready
  loadTasks();
});

// Expose
window.trackerUI = { loadTasks, renderTaskCard, handleWsEvent };
