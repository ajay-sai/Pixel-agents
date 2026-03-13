/**
 * pixel-canvas.js — AGOR-style office floor plan with animated pixel-art characters
 */

// Local escapeHtml fallback (app.js also defines window.escapeHtml — use whichever is available)
function _escHtml(s) {
  if (typeof window !== 'undefined' && typeof window.escapeHtml === 'function') return window.escapeHtml(s);
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Sub-agent scale factor: sub-agents are rendered at 60% of full scale
const FULL_SCALE = 2;
const SUBAGENT_SCALE_FACTOR = 0.6;
const SUBAGENT_SCALE = FULL_SCALE * SUBAGENT_SCALE_FACTOR; // 1.2

// ─────────────────────────────────────────────────────────────────────────────
// Colour palette
// ─────────────────────────────────────────────────────────────────────────────
const PAL = {
  idle:     '#8899aa',
  working:  '#00ff88',
  waiting:  '#ffff00',
  complete: '#00bbff',
  error:    '#ff4455',
  // zone fills
  lobby:      'rgba(100,110,130,0.18)',
  devFloor:   'rgba(0,255,136,0.07)',
  reviewStn:  'rgba(0,187,255,0.09)',
  deployBay:  'rgba(255,140,0,0.09)',
  researchLab:'rgba(160,80,255,0.10)',
  // furniture
  desk:    '#2a3a2a',
  deskTop: '#1a2a1a',
  server:  '#1a2030',
  serverDot:'#00ff88',
  table:   '#1a2030',
  tableTop:'#223344',
  labTable:'#201828',
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: draw a single pixel-art desk (20×12 px rect + keyboard dots)
// ─────────────────────────────────────────────────────────────────────────────
function drawDesk(ctx, x, y) {
  // desk surface
  ctx.fillStyle = PAL.deskTop;
  ctx.fillRect(x, y, 20, 12);
  ctx.strokeStyle = '#334433';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, 20, 12);
  // keyboard dots
  ctx.fillStyle = '#00aa44';
  for (let i = 0; i < 4; i++) ctx.fillRect(x + 3 + i * 3, y + 7, 2, 1);
  // monitor
  ctx.fillStyle = '#112211';
  ctx.fillRect(x + 5, y - 6, 10, 7);
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(x + 6, y - 5, 8, 5);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: draw a pixel-art server rack (12×20 vertical rect with blinking dots)
// ─────────────────────────────────────────────────────────────────────────────
function drawServerRack(ctx, x, y, frame) {
  ctx.fillStyle = PAL.server;
  ctx.fillRect(x, y, 12, 20);
  ctx.strokeStyle = '#223344';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, 12, 20);
  // blinking unit lights
  for (let i = 0; i < 4; i++) {
    const on = ((frame + i * 7) % 20) < 10;
    ctx.fillStyle = on ? PAL.serverDot : '#113322';
    ctx.fillRect(x + 2, y + 3 + i * 4, 3, 2);
    ctx.fillStyle = '#334400';
    ctx.fillRect(x + 7, y + 3 + i * 4, 3, 2);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: draw a round table (circle)
// ─────────────────────────────────────────────────────────────────────────────
function drawRoundTable(ctx, cx, cy, r) {
  ctx.fillStyle = PAL.tableTop;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334455';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: draw a lab table (wide rect with science dots)
// ─────────────────────────────────────────────────────────────────────────────
function drawLabTable(ctx, x, y, w) {
  ctx.fillStyle = PAL.labTable;
  ctx.fillRect(x, y, w, 10);
  ctx.strokeStyle = '#442266';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, 10);
  // equipment dots
  const colors = ['#ff00aa', '#aa00ff', '#00ffaa'];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(x + 4 + i * 10, y + 3, 4, 4);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: draw a pixel-art character sprite (12×16 logical pixels, scale=2)
// ─────────────────────────────────────────────────────────────────────────────
function drawPixelChar(ctx, cx, cy, statusColor, animState, frame, scale, isSubagent) {
  const s = scale;
  // offset for animations
  let ox = 0, oy = 0, opacity = 1;
  if (animState === 'idle') {
    oy = Math.sin(frame * 0.05) * 1;
  } else if (animState === 'complete') {
    oy = -Math.abs(Math.sin(frame * 0.15)) * 4;
  } else if (animState === 'error') {
    ox = Math.sin(frame * 0.3) * 2;
  } else if (animState === 'waiting') {
    opacity = 0.5 + 0.5 * Math.sin(frame * 0.08);
  }

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(cx + ox, cy + oy);

  const headColor = statusColor;
  const bodyColor = statusColor;

  // HEAD: 4×4 px block centered at top (each "px" = s actual pixels)
  ctx.fillStyle = headColor;
  ctx.fillRect(-2 * s, -8 * s, 4 * s, 4 * s);

  // EYES: 2 dots in head
  ctx.fillStyle = '#000011';
  ctx.fillRect(-1 * s, -7 * s, 1 * s, 1 * s);
  ctx.fillRect(1 * s,  -7 * s, 1 * s, 1 * s);

  // BODY: 4×6 block
  const bodyY = animState === 'working' ? -4 * s - 1 : -4 * s;
  ctx.fillStyle = bodyColor;
  ctx.fillRect(-2 * s, bodyY, 4 * s, 6 * s);

  // ARMS: 1×3 on each side, animate when working
  if (animState === 'working') {
    const armSwing = Math.sin(frame * 0.3) * 2 * s;
    ctx.fillStyle = headColor;
    ctx.fillRect(-3 * s, bodyY + armSwing, 1 * s, 3 * s);
    ctx.fillRect(2 * s, bodyY - armSwing, 1 * s, 3 * s);
  } else {
    ctx.fillStyle = headColor;
    ctx.fillRect(-3 * s, bodyY + 1 * s, 1 * s, 3 * s);
    ctx.fillRect(2 * s, bodyY + 1 * s, 1 * s, 3 * s);
  }

  // LEGS: 2 pairs of 2×2 blocks
  const legY = bodyY + 6 * s;
  ctx.fillStyle = bodyColor;
  ctx.fillRect(-2 * s, legY, 2 * s, 2 * s);
  ctx.fillRect(0,       legY, 2 * s, 2 * s);

  // WAITING: speech bubble above
  if (animState === 'waiting') {
    ctx.fillStyle = 'rgba(255,255,100,0.8)';
    ctx.beginPath();
    ctx.arc(0, -12 * s, 4 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = `${3 * s}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('?', 0, -10 * s);
  }

  // Sub-agent indicator: smaller frame
  if (isSubagent) {
    ctx.strokeStyle = 'rgba(255,255,0,0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-3 * s, -9 * s, 6 * s, 12 * s);
  }

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: draw crown for parent agents with sub-agents
// ─────────────────────────────────────────────────────────────────────────────
function drawCrown(ctx, cx, cy, scale) {
  const s = scale;
  ctx.fillStyle = '#ffcc00';
  // crown base
  ctx.fillRect(-3 * s, -14 * s + cy, 6 * s, 2 * s);
  // crown prongs
  ctx.fillRect(-3 * s, -16 * s + cy, 1 * s, 2 * s);
  ctx.fillRect(-1 * s, -15 * s + cy, 2 * s, 1 * s);
  ctx.fillRect(2 * s, -16 * s + cy, 1 * s, 2 * s);
  // center adjustment
  ctx.save();
  ctx.translate(cx, 0);
  ctx.fillRect(-3 * s, -14 * s + cy, 6 * s, 2 * s);
  ctx.fillRect(-3 * s, -16 * s + cy, 1 * s, 2 * s);
  ctx.fillRect(-1 * s, -15 * s + cy, 2 * s, 1 * s);
  ctx.fillRect(2 * s, -16 * s + cy, 1 * s, 2 * s);
  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// Status → colour
// ─────────────────────────────────────────────────────────────────────────────
function statusColor(status) {
  return {
    IDLE:     PAL.idle,
    WORKING:  PAL.working,
    WAITING:  PAL.waiting,
    COMPLETE: PAL.complete,
    ERROR:    PAL.error,
  }[status] || PAL.idle;
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFICE ZONE DEFINITIONS (5 zones for AGOR-style floor plan)
// ─────────────────────────────────────────────────────────────────────────────
const OFFICE_ZONES = [
  { id: 'lobby',       label: 'Lobby',           x: 0,   y: 0,   w: 150, h: 200, fill: PAL.lobby,       border: '#556677' },
  { id: 'research',    label: 'Research Lab',     x: 0,   y: 200, w: 200, h: 300, fill: PAL.researchLab, border: '#8844cc' },
  { id: 'development', label: 'Development Floor',x: 150, y: 0,   w: 330, h: 500, fill: PAL.devFloor,    border: '#00aa44' },
  { id: 'review',      label: 'Review Station',   x: 480, y: 0,   w: 320, h: 300, fill: PAL.reviewStn,   border: '#0088cc' },
  { id: 'deployment',  label: 'Deployment Bay',   x: 480, y: 300, w: 320, h: 200, fill: PAL.deployBay,   border: '#cc6600' },
];

// ─────────────────────────────────────────────────────────────────────────────
// PIXEL CANVAS CLASS
// ─────────────────────────────────────────────────────────────────────────────
class PixelCanvas {
  constructor(canvasEl, detailPanelEl) {
    this.canvas = canvasEl;
    this.ctx    = canvasEl.getContext('2d');
    this.detail = detailPanelEl;
    this.W = canvasEl.width;
    this.H = canvasEl.height;

    this.agents   = new Map();
    this.tasks    = new Map();
    this.selected = null;
    this.frame    = 0;
    this._animId  = null;
    this._running = false;

    this._bindEvents();
  }

  // ── Data loading ────────────────────────────────────────────────────────────

  async loadCanvasState() {
    try {
      const res  = await fetch('/api/canvas');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this._applyCanvasData(data);
    } catch (e) {
      console.warn('Canvas load failed:', e);
    }
  }

  _applyCanvasData(data) {
    // Build a set of parent IDs (agents that have children)
    const parentIds = new Set(
      (data.agents || [])
        .filter(a => a.parent_instance_id)
        .map(a => a.parent_instance_id)
    );

    (data.agents || []).forEach(a => {
      const existing = this.agents.get(a.id);
      const target   = a.pixel_position || { x: 100, y: 250 };
      this.agents.set(a.id, {
        ...a,
        rx: existing?.rx ?? target.x,
        ry: existing?.ry ?? target.y,
        tx: target.x,
        ty: target.y,
        hasChildren: parentIds.has(a.id),
      });
    });

    (data.tasks || []).forEach(t => {
      this.tasks.set(t.id, t);
    });
  }

  // ── Animation loop ──────────────────────────────────────────────────────────

  _startLoop() {
    if (this._running) return;
    this._running = true;
    const tick = () => {
      this.frame++;
      this._animateAgents();
      this.draw();
      this._animId = requestAnimationFrame(tick);
    };
    this._animId = requestAnimationFrame(tick);
  }

  _stopLoop() {
    this._running = false;
    if (this._animId) cancelAnimationFrame(this._animId);
    this._animId = null;
  }

  _animateAgents() {
    this.agents.forEach(a => {
      a.rx += (a.tx - a.rx) * 0.06;
      a.ry += (a.ty - a.ry) * 0.06;
    });
  }

  // ── Main draw ───────────────────────────────────────────────────────────────

  draw() {
    const { ctx, W, H } = this;

    // Background
    ctx.fillStyle = '#0a0e14';
    ctx.fillRect(0, 0, W, H);

    this._drawZones();
    this._drawFurniture();
    this._drawParentChildLinks();
    this._drawAgents();
    this._drawScanlines();
  }

  // ── Zones ───────────────────────────────────────────────────────────────────

  _drawZones() {
    const { ctx } = this;
    OFFICE_ZONES.forEach(z => {
      ctx.fillStyle = z.fill;
      ctx.fillRect(z.x, z.y, z.w, z.h);

      ctx.strokeStyle = z.border;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(z.x + 0.5, z.y + 0.5, z.w - 1, z.h - 1);
      ctx.setLineDash([]);

      // Zone label
      ctx.fillStyle = z.border;
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText(z.label.toUpperCase(), z.x + 6, z.y + 14);
    });
  }

  // ── Pixel-art furniture ─────────────────────────────────────────────────────

  _drawFurniture() {
    const { ctx } = this;

    // Development Floor — desks grid
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        drawDesk(ctx, 165 + col * 75, 60 + row * 140);
      }
    }

    // Research Lab — lab table
    drawLabTable(ctx, 15, 290, 160);
    drawLabTable(ctx, 15, 430, 160);

    // Review Station — round tables
    drawRoundTable(ctx, 570, 100, 28);
    drawRoundTable(ctx, 680, 180, 22);

    // Deployment Bay — server racks
    drawServerRack(ctx, 510, 330, this.frame);
    drawServerRack(ctx, 540, 330, this.frame);
    drawServerRack(ctx, 600, 330, this.frame);
    drawServerRack(ctx, 660, 350, this.frame);
    drawServerRack(ctx, 720, 330, this.frame);

    // Lobby — reception desk
    drawDesk(ctx, 25, 60);
    drawDesk(ctx, 25, 130);
  }

  // ── Dotted lines between parent and child agents ────────────────────────────

  _drawParentChildLinks() {
    const { ctx } = this;
    this.agents.forEach(child => {
      if (!child.parent_instance_id) return;
      const parent = this.agents.get(child.parent_instance_id);
      if (!parent) return;

      ctx.save();
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = 'rgba(255,255,0,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(parent.rx, parent.ry);
      ctx.lineTo(child.rx, child.ry);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    });
  }

  // ── Agent sprites ───────────────────────────────────────────────────────────

  _drawAgents() {
    const { ctx } = this;
    this.agents.forEach(a => {
      const x = a.rx;
      const y = a.ry;
      const sc = statusColor(a.status);
      const isSubagent = a.is_subagent || false;
      const scale = isSubagent ? SUBAGENT_SCALE : FULL_SCALE;
      const animState = a.animation_state || 'idle';

      // Draw desk under working agents
      if (a.status === 'WORKING') {
        drawDesk(ctx, x - 10, y + 6);
      }

      // Draw pixel character
      ctx.save();
      ctx.translate(x, y);
      drawPixelChar(ctx, 0, 0, sc, animState, this.frame, scale, isSubagent);
      ctx.restore();

      // Crown for parent agents (agents with children)
      if (a.hasChildren) {
        ctx.save();
        ctx.translate(x, y);
        const crownScale = scale;
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(-3 * crownScale, -14 * crownScale, 1 * crownScale, 2 * crownScale);
        ctx.fillRect(-1 * crownScale, -15 * crownScale, 2 * crownScale, 1 * crownScale);
        ctx.fillRect(2 * crownScale, -14 * crownScale, 1 * crownScale, 2 * crownScale);
        ctx.fillRect(-3 * crownScale, -13 * crownScale, 6 * crownScale, 1 * crownScale);
        ctx.restore();
      }

      // Selection halo
      if (this.selected === a.id) {
        ctx.strokeStyle = sc;
        ctx.lineWidth = 2;
        ctx.shadowColor = sc;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Name label
      ctx.fillStyle = sc;
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      const label = isSubagent ? `↳ ${a.name}` : a.name;
      ctx.fillText(label, x, y + 22);

      // Status dot
      ctx.fillStyle = sc;
      ctx.beginPath();
      ctx.arc(x + 12, y - 12, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ── CRT scanlines overlay ───────────────────────────────────────────────────

  _drawScanlines() {
    const { ctx, W, H } = this;
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    for (let y = 0; y < H; y += 4) {
      ctx.fillRect(0, y, W, 2);
    }
  }

  // ── Click detection ─────────────────────────────────────────────────────────

  _bindEvents() {
    this.canvas.addEventListener('click', e => this._handleClick(e));
  }

  _handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (this.W / rect.width);
    const my = (e.clientY - rect.top)  * (this.H / rect.height);

    let hit = null;
    this.agents.forEach(a => {
      const dx = a.rx - mx, dy = a.ry - my;
      if (Math.sqrt(dx * dx + dy * dy) < 20) hit = a.id;
    });

    this.selected = hit;
    if (hit) this._showAgentDetails(this.agents.get(hit));
    else this._clearDetails();
  }

  _showAgentDetails(a) {
    if (!this.detail) return;
    const task = a.current_task_id ? this.tasks.get(a.current_task_id) : null;
    const sc   = statusColor(a.status);
    const skills = (a.skills || []).join(', ') || '—';
    const parentInfo = a.parent_instance_id
      ? `<div class="text-xs text-dim">Sub-agent of: ${a.parent_instance_id}</div>`
      : '';
    this.detail.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:1.8rem;">${a.character_sprite || '🤖'}</span>
          <div>
            <div class="text-sm" style="color:${sc};">${_escHtml(a.name)}</div>
            <div class="text-xs text-dim">${_escHtml(a.agent_id)}</div>
          </div>
        </div>
        ${parentInfo}
        <div class="text-xs">Status: <span style="color:${sc};">${a.status}</span></div>
        <div class="text-xs text-dim">Skills: ${_escHtml(skills)}</div>
        ${task ? `
        <div style="border-top:1px solid #223;padding-top:8px;margin-top:4px;">
          <div class="text-xs text-dim">CURRENT TASK</div>
          <div class="text-xs" style="margin-top:4px;">${_escHtml(task.title)}</div>
          <div style="margin-top:6px;">
            <div style="height:4px;background:#112;border-radius:2px;overflow:hidden;">
              <div style="height:100%;width:${task.progress || 0}%;background:${sc};transition:width 0.4s;"></div>
            </div>
            <div class="text-xs text-dim" style="margin-top:3px;">${task.progress || 0}%</div>
          </div>
        </div>` : ''}
      </div>`;
  }

  _clearDetails() {
    if (this.detail)
      this.detail.innerHTML = '<div class="text-dim text-xs" style="text-align:center;padding:20px;">Click an agent on the canvas to view details</div>';
  }

  // ── WebSocket event handler ──────────────────────────────────────────────────

  handleWebSocket(msg) {
    switch (msg.type) {
      case 'init':
        if (msg.canvas) this._applyCanvasData(msg.canvas);
        if (!this._running) this._startLoop();
        break;

      case 'task_event':
      case 'task_complete': {
        const t = this.tasks.get(msg.task_id);
        if (t) {
          this.tasks.set(msg.task_id, { ...t, progress: msg.progress ?? t.progress });
        }
        break;
      }

      case 'agent_hired': {
        // Update agent animation state
        this.agents.forEach((a, id) => {
          if (a.agent_id === msg.agent_id) {
            this.agents.set(id, { ...a, status: 'WORKING', animation_state: 'working' });
          }
        });
        break;
      }

      case 'agent_update': {
        const inst = this.agents.get(msg.instance_id);
        if (inst) {
          this.agents.set(msg.instance_id, {
            ...inst,
            status: msg.status ?? inst.status,
            animation_state: msg.animation_state ?? inst.animation_state,
          });
        }
        break;
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI SPRITE — draw a tiny pixel character for task cards (48×48 canvas)
// ─────────────────────────────────────────────────────────────────────────────
function drawMiniSprite(ctx, status, frame) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);
  const sc = statusColor(status || 'IDLE');
  const animState = status === 'WORKING' ? 'working'
                  : status === 'WAITING' ? 'waiting'
                  : status === 'COMPLETE' ? 'complete'
                  : status === 'ERROR' ? 'error'
                  : 'idle';

  // dark bg
  ctx.fillStyle = 'rgba(10,14,20,0.85)';
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(W / 2, H * 0.62);
  drawPixelChar(ctx, 0, 0, sc, animState, frame, 1.5, false);
  ctx.restore();
}

// Global frame counter and animation registry for mini sprites
let _miniFrame = 0;
const _miniSprites = new Map(); // canvas.id → { ctx, status }

function _tickMiniSprites() {
  _miniFrame++;
  _miniSprites.forEach(({ ctx, status }) => {
    drawMiniSprite(ctx, status, _miniFrame);
  });
  requestAnimationFrame(_tickMiniSprites);
}
requestAnimationFrame(_tickMiniSprites);

/**
 * Register a 48×48 canvas for animated mini-sprite rendering.
 * @param {HTMLCanvasElement} canvasEl
 * @param {string} status  AgentStatus string
 */
function initMiniSprite(canvasEl, status) {
  const ctx = canvasEl.getContext('2d');
  _miniSprites.set(canvasEl.id, { ctx, status });
}

/**
 * Update the status of a registered mini-sprite.
 */
function updateMiniSprite(canvasId, status) {
  const entry = _miniSprites.get(canvasId);
  if (entry) entry.status = status;
}
