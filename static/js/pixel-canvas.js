/**
 * pixel-canvas.js — HTML5 Canvas renderer for AGOR-style agent canvas view
 */

class PixelCanvas {
  constructor(canvasEl, detailPanelEl) {
    this.canvas  = canvasEl;
    this.ctx     = canvasEl.getContext('2d');
    this.detail  = detailPanelEl;

    // Logical dimensions (canvas is 800x500)
    this.W = canvasEl.width;
    this.H = canvasEl.height;

    this.agents   = new Map();   // id -> agentState
    this.tasks    = new Map();   // id -> taskState
    this.zones    = [];
    this.selected = null;
    this._animFrame = null;
    this._running   = false;

    // Zone definitions (fallback; overridden by API)
    this.zones = [
      { id: 'marketplace', label: 'Marketplace Zone', x: 0,   y: 0, w: 266, h: 500, color: 'rgba(0,187,255,0.04)'  },
      { id: 'active',      label: 'Active Tasks Zone', x: 267, y: 0, w: 266, h: 500, color: 'rgba(0,255,136,0.04)' },
      { id: 'completed',   label: 'Completed Zone',    x: 534, y: 0, w: 266, h: 500, color: 'rgba(255,255,0,0.03)' },
    ];

    this._bindEvents();
  }

  // -----------------------------------------------------------------------
  // Data loading
  // -----------------------------------------------------------------------

  async loadCanvasState() {
    try {
      const res = await fetch('/api/canvas');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this._applyCanvasData(data);
    } catch (e) {
      console.warn('Canvas load failed:', e);
    }
  }

  _applyCanvasData(data) {
    if (data.zones) {
      this.zones = data.zones.map((z, i) => ({
        ...z,
        color: ['rgba(0,187,255,0.04)', 'rgba(0,255,136,0.04)', 'rgba(255,255,0,0.03)'][i % 3],
      }));
    }

    // Upsert agents
    (data.agents || []).forEach(a => {
      const existing = this.agents.get(a.id);
      const target   = a.pixel_position || { x: 100, y: 250 };
      this.agents.set(a.id, {
        ...a,
        // Smooth interpolation: keep current render pos if exists
        rx: existing?.rx ?? target.x,
        ry: existing?.ry ?? target.y,
        tx: target.x,
        ty: target.y,
      });
    });

    // Upsert tasks
    (data.tasks || []).forEach(t => this.tasks.set(t.id, t));

    if (!this._running) this._startLoop();
  }

  // -----------------------------------------------------------------------
  // Rendering loop
  // -----------------------------------------------------------------------

  _startLoop() {
    this._running = true;
    const loop = () => {
      this.animateAgents();
      this.draw();
      this._animFrame = requestAnimationFrame(loop);
    };
    this._animFrame = requestAnimationFrame(loop);
  }

  stopLoop() {
    this._running = false;
    if (this._animFrame) cancelAnimationFrame(this._animFrame);
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    // Background
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, this.W, this.H);

    // Scanline overlay
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    for (let y = 0; y < this.H; y += 4) {
      ctx.fillRect(0, y, this.W, 1);
    }

    this.drawZones();
    this.drawTasks();
    this.drawAgents();
  }

  drawZones() {
    const ctx = this.ctx;
    const ZONE_COLORS = [
      'rgba(0,187,255,0.04)',
      'rgba(0,255,136,0.04)',
      'rgba(255,255,0,0.03)',
    ];
    const BORDER_COLORS = ['#00bbff', '#00ff88', '#ffff00'];

    this.zones.forEach((z, i) => {
      const bc = ZONE_COLORS[i % 3];
      const fc = BORDER_COLORS[i % 3];

      ctx.fillStyle = bc;
      ctx.fillRect(z.x, z.y, z.w, z.h);

      ctx.strokeStyle = fc;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(z.x + 0.5, z.y + 0.5, z.w - 1, z.h - 1);
      ctx.setLineDash([]);

      // Zone label
      ctx.fillStyle = fc;
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.globalAlpha = 0.6;
      ctx.fillText(z.label.toUpperCase(), z.x + 8, z.y + 18);
      ctx.globalAlpha = 1.0;
    });
  }

  drawTasks() {
    const ctx = this.ctx;
    this.tasks.forEach(task => {
      if (!task.pixel_position) return;
      const { x, y } = task.pixel_position;

      // Task node (small diamond)
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = taskColor(task.status);
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.moveTo(0, -6); ctx.lineTo(6, 0); ctx.lineTo(0, 6); ctx.lineTo(-6, 0);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = taskColor(task.status);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Task label
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '6px monospace';
      const label = (task.title || 'Task').slice(0, 20);
      ctx.fillText(label, x - 20, y + 16);
    });
  }

  drawAgents() {
    this.agents.forEach(agent => {
      this.drawAgent(agent);
    });
  }

  drawAgent(agent) {
    const ctx = this.ctx;
    const x   = Math.round(agent.rx);
    const y   = Math.round(agent.ry);
    const isSelected = this.selected === agent.id;

    const color  = agentColor(agent.status);
    const sprite = agent.character_sprite || '🤖';
    const size   = 22;

    ctx.save();
    ctx.translate(x, y);

    // Selection halo
    if (isSelected) {
      ctx.shadowColor  = color;
      ctx.shadowBlur   = 16;
      ctx.strokeStyle  = color;
      ctx.lineWidth    = 2;
      ctx.strokeRect(-size / 2 - 3, -size / 2 - 3, size + 6, size + 6);
      ctx.shadowBlur   = 0;
    }

    // Agent body square
    ctx.fillStyle = agentBg(agent.status);
    ctx.fillRect(-size / 2, -size / 2, size, size);

    ctx.strokeStyle = color;
    ctx.lineWidth   = isSelected ? 2 : 1;
    ctx.strokeRect(-size / 2, -size / 2, size, size);

    // Sprite emoji
    ctx.font      = '14px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sprite, 0, 1);

    // Status dot (top-right)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(size / 2 - 2, -size / 2 + 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Name label
    ctx.fillStyle    = 'rgba(255,255,255,0.85)';
    ctx.font         = '6px "Press Start 2P", monospace';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    const shortName  = (agent.name || agent.agent_id || '').slice(0, 14);
    ctx.fillText(shortName, 0, size / 2 + 4);

    ctx.restore();
  }

  // -----------------------------------------------------------------------
  // Smooth movement interpolation
  // -----------------------------------------------------------------------

  animateAgents() {
    const LERP = 0.06;
    this.agents.forEach((agent, id) => {
      const dx = agent.tx - agent.rx;
      const dy = agent.ty - agent.ry;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        agent.rx += dx * LERP;
        agent.ry += dy * LERP;
        this.agents.set(id, agent);
      }
    });
  }

  // -----------------------------------------------------------------------
  // WebSocket handler
  // -----------------------------------------------------------------------

  handleWebSocket(msg) {
    switch (msg.type) {
      case 'init':
        if (msg.canvas) this._applyCanvasData(msg.canvas);
        break;

      case 'task_event':
      case 'task_complete': {
        const task = this.tasks.get(msg.task_id);
        if (task) {
          task.progress = msg.progress ?? task.progress;
          if (msg.type === 'task_complete') task.status = 'COMPLETE';
          this.tasks.set(msg.task_id, task);
        }
        break;
      }

      case 'agent_hired': {
        // Refresh canvas data to pick up new agent positions
        this.loadCanvasState();
        break;
      }

      case 'task_created':
        this.loadCanvasState();
        break;
    }
  }

  // -----------------------------------------------------------------------
  // Click handling
  // -----------------------------------------------------------------------

  _bindEvents() {
    this.canvas.addEventListener('click', (ev) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.W / rect.width;
      const scaleY = this.H / rect.height;
      const cx = (ev.clientX - rect.left) * scaleX;
      const cy = (ev.clientY - rect.top)  * scaleY;
      this.handleClick(cx, cy);
    });
  }

  handleClick(cx, cy) {
    let hit = null;
    const HIT = 16;
    this.agents.forEach((agent, id) => {
      if (
        cx >= agent.rx - HIT && cx <= agent.rx + HIT &&
        cy >= agent.ry - HIT && cy <= agent.ry + HIT
      ) {
        hit = id;
      }
    });

    this.selected = hit;
    if (hit) {
      this.showAgentDetails(this.agents.get(hit));
    } else {
      this._clearDetails();
    }
  }

  showAgentDetails(agent) {
    if (!this.detail || !agent) return;
    const skills = (agent.skills || [])
      .map(s => `<span class="pixel-badge badge-${s}" style="font-size:0.45rem;">${s.replace(/_/g,' ')}</span>`)
      .join(' ');

    const color = agentColor(agent.status);

    this.detail.innerHTML = `
      <div style="text-align:center;margin-bottom:12px;font-size:2rem;">${agent.character_sprite || '🤖'}</div>
      <div style="font-size:0.65rem;color:var(--neon-green);margin-bottom:4px;">${escHtml(agent.name || agent.agent_id)}</div>
      <div class="flex items-center gap-4 mb-8">
        <span class="status-dot status-${agent.status}"></span>
        <span class="text-xs" style="color:${color};">${agent.status}</span>
      </div>
      ${agent.current_task_id ? `<div class="text-xs text-dim mb-8">Task: ${escHtml(agent.current_task_id)}</div>` : ''}
      <div class="flex flex-wrap gap-4 mb-12">${skills}</div>
      <div class="text-xs text-dim">
        Pos: (${Math.round(agent.rx)}, ${Math.round(agent.ry)})
      </div>
    `;
  }

  _clearDetails() {
    if (!this.detail) return;
    this.detail.innerHTML = `<div class="text-dim text-xs" style="text-align:center;padding:20px;">Click an agent on the canvas to view details</div>`;
  }
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function agentColor(status) {
  switch (status) {
    case 'WORKING':  return '#00ff88';
    case 'WAITING':  return '#ffff00';
    case 'COMPLETE': return '#00bbff';
    case 'ERROR':    return '#ff4455';
    default:         return '#8899aa';
  }
}

function agentBg(status) {
  switch (status) {
    case 'WORKING':  return 'rgba(0,255,136,0.12)';
    case 'WAITING':  return 'rgba(255,255,0,0.10)';
    case 'COMPLETE': return 'rgba(0,187,255,0.10)';
    case 'ERROR':    return 'rgba(255,68,85,0.12)';
    default:         return 'rgba(136,153,170,0.10)';
  }
}

function taskColor(status) {
  switch (status) {
    case 'IN_PROGRESS': return '#00ff88';
    case 'PENDING':     return '#ffaa00';
    case 'COMPLETE':    return '#00bbff';
    case 'FAILED':      return '#ff4455';
    default:            return '#8899aa';
  }
}

function escHtml(str) {
  // Delegate to global escapeHtml defined in app.js when available
  if (typeof window !== 'undefined' && window.escapeHtml) return window.escapeHtml(str);
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// -----------------------------------------------------------------------
// Boot
// -----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const canvasEl = document.getElementById('pixel-canvas');
  const detailEl = document.getElementById('canvas-detail-panel');
  if (!canvasEl) return;

  const pc = new PixelCanvas(canvasEl, detailEl);
  window.pixelCanvas = pc;

  // Load when canvas tab is opened
  document.querySelector('[data-tab="canvas"]')?.addEventListener('click', () => {
    pc.loadCanvasState();
  });

  // Refresh button
  document.getElementById('refresh-canvas-btn')?.addEventListener('click', () => {
    pc.loadCanvasState();
  });
});
