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
// Pokémon-Quality Sprite Color Palettes per agent type
// Each palette has: outline, dark, mid, light, skin, eye, accent, hair
// ─────────────────────────────────────────────────────────────────────────────
const SPRITE_PALETTES = {
  coder:      { out:'#001a08', drk:'#004411', mid:'#00cc33', lit:'#88ffaa', skn:'#c8eec8', eye:'#00ffff', acc:'#00ff41', hai:'#005522' },
  debugger:   { out:'#1a0000', drk:'#550000', mid:'#cc2222', lit:'#ff9988', skn:'#ffe0d8', eye:'#ffff44', acc:'#ff8800', hai:'#220000' },
  researcher: { out:'#001a1a', drk:'#004444', mid:'#00aaaa', lit:'#88ffff', skn:'#ccf5f5', eye:'#0088ff', acc:'#ff00cc', hai:'#003366' },
  architect:  { out:'#1a0a00', drk:'#553300', mid:'#cc6600', lit:'#ffcc88', skn:'#ffe8cc', eye:'#ffff00', acc:'#ffcc00', hai:'#441100' },
  tester:     { out:'#1a1a00', drk:'#555500', mid:'#aaaa00', lit:'#ffff88', skn:'#fffff0', eye:'#00ff88', acc:'#00ffff', hai:'#333300' },
  devops:     { out:'#0d0022', drk:'#330066', mid:'#8822cc', lit:'#cc88ff', skn:'#e8d0ff', eye:'#ffff00', acc:'#ff00ff', hai:'#220044' },
  designer:   { out:'#1a001a', drk:'#550055', mid:'#cc00cc', lit:'#ff88ff', skn:'#ffd8ff', eye:'#00ffff', acc:'#ffff00', hai:'#440033' },
  analyst:    { out:'#00111a', drk:'#002244', mid:'#2288cc', lit:'#88ccff', skn:'#d0e8ff', eye:'#ffff44', acc:'#00ffff', hai:'#001133' },
};

// Map primary skill to character type
const SKILL_TO_CHAR = {
  CODE_GENERATION:'coder',   BACKEND:'coder',   FRONTEND:'designer',
  CODE_REVIEW:'architect',   DEBUGGING:'debugger', SECURITY:'debugger',
  TESTING:'tester',          DEVOPS:'devops',   DOCUMENTATION:'researcher',
  RESEARCH:'researcher',     DATA_ANALYSIS:'analyst', WRITING:'researcher',
};

function _charType(agent) {
  const sk = (agent.skills || [])[0];
  if (sk && SKILL_TO_CHAR[sk]) return SKILL_TO_CHAR[sk];
  // fallback by name keyword
  const n = (agent.name || '').toLowerCase();
  if (n.includes('code') || n.includes('bot'))    return 'coder';
  if (n.includes('debug') || n.includes('bug'))   return 'debugger';
  if (n.includes('data') || n.includes('mind'))   return 'researcher';
  if (n.includes('forge') || n.includes('arch'))  return 'architect';
  if (n.includes('qa') || n.includes('test'))     return 'tester';
  if (n.includes('pipe') || n.includes('ops'))    return 'devops';
  if (n.includes('craft') || n.includes('design'))return 'designer';
  if (n.includes('lens') || n.includes('anal'))   return 'analyst';
  return 'coder';
}

// ─────────────────────────────────────────────────────────────────────────────
// Sprite color helpers
// ─────────────────────────────────────────────────────────────────────────────
function _hexDark(hex, f) {
  const n = parseInt(hex.replace('#',''), 16);
  const r = Math.max(0, Math.floor(((n>>16)&255)*(1-f)));
  const g = Math.max(0, Math.floor(((n>>8)&255)*(1-f)));
  const b = Math.max(0, Math.floor((n&255)*(1-f)));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}
function _hexLight(hex, f) {
  const n = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, Math.floor(((n>>16)&255)+(255-((n>>16)&255))*f));
  const g = Math.min(255, Math.floor(((n>>8)&255)+(255-((n>>8)&255))*f));
  const b = Math.min(255, Math.floor((n&255)+(255-(n&255))*f));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// Draw a logical pixel block at grid coords (each unit = s canvas pixels)
function _px(ctx, x, y, w, h, color, s) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x*s), Math.round(y*s), Math.round(w*s), Math.round(h*s));
}

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
// POKÉMON-QUALITY PIXEL CHARACTER RENDERER
// Coordinate origin: character anchor (approx. waist). Logical pixel grid.
// Each logical unit = `scale` canvas pixels.
// Sprite bounds: ~12 wide × 24 tall.  Head top: y=-14  Feet bottom: y=+10
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared body base ────────────────────────────────────────────────────────
function _drawCharBase(ctx, s, p, animState, frame) {
  const working = animState === 'working';
  const bob     = animState === 'idle'     ? Math.sin(frame*0.07)*0.8 : 0;
  const bodyY   = -8 + bob;

  // TORSO outline + fill
  _px(ctx, -4, bodyY,      8, 8, p.out, s);
  _px(ctx, -3, bodyY+1,    6, 6, p.mid, s);
  _px(ctx, -3, bodyY+1,    3, 2, p.lit, s);   // highlight TL
  _px(ctx, -3, bodyY+5,    6, 2, p.drk, s);   // shadow bottom

  // BELT line
  _px(ctx, -3, bodyY+7, 6, 1, p.out, s);
  _px(ctx, -2, bodyY+7, 4, 1, p.acc, s);

  // LEGS
  const legWalk = working ? Math.sin(frame*0.25)*1.5 : 0;
  // left leg
  _px(ctx, -4, 1+bob,    3, 6, p.out, s);
  _px(ctx, -3, 1+bob,    2, 5, p.drk, s);
  _px(ctx, -3, 1+bob,    1, 2, p.mid, s);
  // right leg
  _px(ctx,  1, 1+bob,    3, 6, p.out, s);
  _px(ctx,  2, 1+bob,    2, 5, p.drk, s);
  _px(ctx,  2, 1+bob,    1, 2, p.mid, s);
  // leg walk anim
  if (working) {
    _px(ctx, -3, 1+legWalk,  2, 5, p.drk, s);
    _px(ctx,  2, 1-legWalk,  2, 5, p.drk, s);
  }
  // FEET
  _px(ctx, -4, 7+bob, 4, 3, p.out, s);
  _px(ctx,  0, 7+bob, 4, 3, p.out, s);
  _px(ctx, -3, 7+bob, 3, 2, p.mid, s);
  _px(ctx,  1, 7+bob, 3, 2, p.mid, s);

  // ARMS
  const armL = working ? Math.sin(frame*0.3)*2  :  1;
  const armR = working ? -Math.sin(frame*0.3)*2 :  1;
  // left arm
  _px(ctx, -6, bodyY+armL,   2, 5, p.out, s);
  _px(ctx, -5, bodyY+armL+0.5, 1, 3, p.mid, s);
  // right arm
  _px(ctx,  4, bodyY+armR,   2, 5, p.out, s);
  _px(ctx,  4, bodyY+armR+0.5, 1, 3, p.mid, s);
  // hands
  _px(ctx, -5.5, bodyY+armL+4, 2, 2, p.skn, s);
  _px(ctx,  3.5, bodyY+armR+4, 2, 2, p.skn, s);
}

// ── HEAD base (shared) ─────────────────────────────────────────────────────
function _drawCharHead(ctx, s, p, animState, frame) {
  const bob = animState === 'idle' ? Math.sin(frame*0.07)*0.8 : 0;
  const headY = -14 + bob;
  // Head outline + fill
  _px(ctx, -3, headY,   6, 7, p.out, s);
  _px(ctx, -2, headY+1, 4, 5, p.skn, s);
  _px(ctx, -2, headY+1, 2, 2, _hexLight(p.skn, 0.4), s); // forehead highlight
  // NECK
  _px(ctx, -1, headY+6, 2, 2, p.out, s);
  _px(ctx, -1, headY+7, 2, 1, p.skn, s);
  // EYES (2 dots)
  _px(ctx, -2, headY+3, 1, 1, p.out, s);
  _px(ctx,  1, headY+3, 1, 1, p.out, s);
  _px(ctx, -1.5, headY+3, 1, 1, p.eye, s);
  _px(ctx,  1.5, headY+3, 1, 1, p.eye, s);
  // NOSE
  _px(ctx, -0.5, headY+4, 1, 1, _hexDark(p.skn, 0.15), s);
  // MOUTH
  _px(ctx, -1, headY+5, 3, 1, p.out, s);
}

// ── Agent-specific overlays ────────────────────────────────────────────────
function _overlay_coder(ctx, s, p, bob) {
  // Robot antenna
  _px(ctx, -0.5, -18+bob, 1, 2, p.acc, s);
  _px(ctx, -1,   -19+bob, 2, 1, p.out, s);
  _px(ctx, -0.5, -20+bob, 1, 1, p.eye, s);
  // Visor bar replaces normal face
  const headY = -14+bob;
  _px(ctx, -2, headY+3, 4, 2, p.out, s);  // visor bg
  _px(ctx, -1, headY+3, 3, 1, p.eye, s);  // visor glow
  _px(ctx, -1, headY+4, 3, 1, _hexDark(p.eye, 0.3), s);
  // Corner pixels (highlight on visor)
  _px(ctx, -2, headY+3, 1, 1, _hexLight(p.eye, 0.5), s);
  // Circuit board on chest
  _px(ctx, -2, -6, 1, 1, p.acc, s); _px(ctx, 1, -6, 1, 1, p.acc, s);
  _px(ctx, -3, -4, 2, 1, p.acc, s); _px(ctx, 1, -4, 2, 1, p.acc, s);
  _px(ctx, 0, -5, 1, 2, _hexLight(p.acc, 0.3), s);
}

function _overlay_debugger(ctx, s, p, bob) {
  // Detective deerstalker hat
  _px(ctx, -3, -18+bob, 6, 1, p.out, s);
  _px(ctx, -2, -21+bob, 4, 3, p.out, s);
  _px(ctx, -1, -20+bob, 3, 2, p.mid, s);
  _px(ctx, -1, -20+bob, 2, 1, p.lit, s);
  _px(ctx, -4, -17+bob, 8, 1, p.out, s);
  _px(ctx, -3, -17+bob, 6, 1, p.drk, s);
  // Determined eyebrow
  const headY = -14+bob;
  _px(ctx, -2, headY+2, 2, 1, p.out, s);
  _px(ctx,  1, headY+2, 2, 1, p.out, s);
  // Magnifier on chest
  _px(ctx, 1, -5, 3, 3, p.out, s);
  _px(ctx, 1, -5, 2, 2, _hexLight(p.acc, 0.3), s);
  _px(ctx, 2, -4, 1, 1, _hexLight('#ffffff', 0.6), s);
  // Coat collar
  _px(ctx, -3, -8, 1, 2, p.lit, s); _px(ctx, 2, -8, 1, 2, p.lit, s);
}

function _overlay_researcher(ctx, s, p, bob) {
  // Tall wizard hat
  _px(ctx, -3, -22+bob, 6, 1, p.out, s);  // brim
  _px(ctx, -1, -27+bob, 2, 5, p.out, s);  // cone
  _px(ctx, -0.5, -26+bob, 1, 4, p.mid, s);
  _px(ctx, -1, -27+bob, 2, 1, p.acc, s);  // tip glow
  // Glasses
  const headY = -14+bob;
  _px(ctx, -3, headY+3, 2, 2, p.out, s);
  _px(ctx,  1, headY+3, 2, 2, p.out, s);
  _px(ctx, -2, headY+3, 1, 1, _hexLight(p.eye, 0.4), s);
  _px(ctx,  1, headY+3, 1, 1, _hexLight(p.eye, 0.4), s);
  _px(ctx, -1, headY+4, 2, 1, p.out, s);  // glasses bridge
  // Star on robe
  _px(ctx, -1, -5, 3, 1, p.acc, s);
  _px(ctx,  0, -6, 1, 3, p.acc, s);
  // Book in left hand
  _px(ctx, -7, -5, 3, 4, p.out, s);
  _px(ctx, -6, -4, 2, 3, p.acc, s);
  _px(ctx, -6, -4, 1, 1, p.lit, s);
}

function _overlay_architect(ctx, s, p, bob) {
  // Hard hat
  _px(ctx, -4, -17+bob, 8, 1, p.out, s);
  _px(ctx, -3, -20+bob, 6, 3, p.out, s);
  _px(ctx, -2, -19+bob, 4, 2, p.mid, s);
  _px(ctx, -2, -19+bob, 2, 1, p.lit, s);
  // Visor flap
  _px(ctx, -4, -17+bob, 8, 2, p.drk, s);
  _px(ctx, -3, -17+bob, 6, 1, _hexLight(p.mid, 0.3), s);
  // Blueprint on chest
  _px(ctx, -2, -7, 4, 5, p.out, s);
  _px(ctx, -1, -6, 3, 4, p.acc, s);
  _px(ctx, -1, -5, 3, 1, p.lit, s); // line
  _px(ctx, -1, -3, 3, 1, p.lit, s); // line
  _px(ctx,  0, -6, 1, 4, p.lit, s); // vertical line
  // Strong brow
  const headY = -14+bob;
  _px(ctx, -2, headY+2, 2, 1, p.hai, s);
  _px(ctx,  1, headY+2, 2, 1, p.hai, s);
}

function _overlay_tester(ctx, s, p, bob) {
  // Lab goggles on forehead
  const headY = -14+bob;
  _px(ctx, -3, headY+1, 3, 2, p.out, s);
  _px(ctx,  0, headY+1, 3, 2, p.out, s);
  _px(ctx, -2, headY+1, 2, 1, p.eye, s);
  _px(ctx,  1, headY+1, 2, 1, p.eye, s);
  _px(ctx, -1, headY+2, 2, 1, p.out, s); // goggles bridge
  // Clipboard in right hand
  _px(ctx, 4, -6, 4, 5, p.out, s);
  _px(ctx, 5, -5, 3, 4, p.lit, s);
  _px(ctx, 5, -4, 3, 1, p.out, s); // check row
  _px(ctx, 5, -2, 3, 1, p.out, s); // check row
  _px(ctx, 6, -4, 1, 3, p.acc, s); // check mark
  // Lab coat collar
  _px(ctx, -3, -7, 6, 1, _hexLight(p.lit, 0.5), s);
}

function _overlay_devops(ctx, s, p, bob) {
  // Engineer cap
  _px(ctx, -3, -17+bob, 6, 1, p.out, s);
  _px(ctx, -4, -17+bob, 8, 1, p.drk, s);
  _px(ctx, -2, -20+bob, 4, 3, p.out, s);
  _px(ctx, -1, -19+bob, 3, 2, p.mid, s);
  _px(ctx, -1, -19+bob, 2, 1, p.lit, s);
  _px(ctx,  0, -20+bob, 1, 1, p.acc, s); // logo on cap
  // Gear icon on chest
  _px(ctx, -1, -6, 3, 3, p.out, s);
  _px(ctx,  0, -6, 1, 1, p.acc, s);
  _px(ctx, -1, -5, 1, 1, p.acc, s);
  _px(ctx,  1, -5, 1, 1, p.acc, s);
  _px(ctx,  0, -4, 1, 1, p.acc, s);
  _px(ctx,  0, -5, 1, 1, p.lit, s); // center
  // Wrench in right hand
  _px(ctx, 4, -5, 2, 6, p.out, s);
  _px(ctx, 4, -5, 2, 2, p.acc, s); // wrench head
  _px(ctx, 4, -5, 1, 1, p.lit, s);
  _px(ctx, 4, -4, 1, 5, p.mid, s); // handle
}

function _overlay_designer(ctx, s, p, bob) {
  // Artistic beret
  _px(ctx, -3, -17+bob, 6, 2, p.out, s);
  _px(ctx, -4, -19+bob, 8, 2, p.out, s);
  _px(ctx, -3, -18+bob, 6, 2, p.mid, s);
  _px(ctx, -3, -18+bob, 3, 1, p.lit, s);
  _px(ctx,  2, -20+bob, 1, 2, p.acc, s); // beret pom
  // Color palette on chest
  _px(ctx, -2, -7, 5, 4, p.out, s);
  _px(ctx, -2, -6, 2, 2, '#ff4444', s);
  _px(ctx,  0, -6, 2, 2, '#ffaa00', s);
  _px(ctx, -2, -4, 2, 1, '#00ff88', s);
  _px(ctx,  0, -4, 2, 1, '#00aaff', s);
  // Paintbrush in right hand
  _px(ctx, 4, -7, 2, 7, p.out, s);
  _px(ctx, 4, -7, 2, 2, p.acc, s); // brush head
  _px(ctx, 4, -6, 1, 1, p.lit, s);
  _px(ctx, 4, -5, 1, 5, p.mid, s); // handle
  // Expressive eyebrow raised
  const headY = -14+bob;
  _px(ctx, -2, headY+2, 4, 1, p.hai, s);
}

function _overlay_analyst(ctx, s, p, bob) {
  // Rectangular glasses (analytical)
  const headY = -14+bob;
  _px(ctx, -3, headY+2, 3, 3, p.out, s);
  _px(ctx,  0, headY+2, 3, 3, p.out, s);
  _px(ctx, -2, headY+3, 1, 1, _hexLight(p.eye, 0.5), s);
  _px(ctx,  1, headY+3, 1, 1, _hexLight(p.eye, 0.5), s);
  _px(ctx, -1, headY+3, 2, 1, p.out, s); // bridge
  // Hair slicked back
  _px(ctx, -2, headY, 4, 2, p.hai, s);
  // Chart on chest
  _px(ctx, -2, -7, 5, 5, p.out, s);
  _px(ctx, -1, -6, 4, 4, '#0a1520', s);
  _px(ctx, -1, -3, 1, 3, p.acc, s);  // bar 1
  _px(ctx,  0, -4, 1, 4, p.mid, s);  // bar 2
  _px(ctx,  1, -2, 1, 2, p.eye, s);  // bar 3
  _px(ctx,  2, -5, 1, 5, p.lit, s);  // bar 4
  // Briefcase in left hand
  _px(ctx, -8, -5, 4, 4, p.out, s);
  _px(ctx, -7, -4, 3, 3, p.drk, s);
  _px(ctx, -7, -5, 3, 1, p.mid, s);
  _px(ctx, -6, -5, 1, 1, p.lit, s); // clasp
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry: draw a Pokémon-quality pixel character
// agentType: string key ('coder','debugger','researcher','architect',
//            'tester','devops','designer','analyst')
// ─────────────────────────────────────────────────────────────────────────────
function drawPixelChar(ctx, cx, cy, agentType, statusColor, animState, frame, scale, isSubagent) {
  const s = scale;
  // Animation offsets
  let ox = 0, oy = 0, opacity = 1;
  if (animState === 'idle')     { oy = Math.sin(frame*0.07)*s; }
  if (animState === 'complete') { oy = -Math.abs(Math.sin(frame*0.18))*5*s; }
  if (animState === 'error')    { ox = Math.sin(frame*0.35)*2*s; }
  if (animState === 'waiting')  { opacity = 0.55+0.45*Math.sin(frame*0.09); }

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(cx + ox, cy + oy);

  const type = agentType || 'coder';
  const p    = SPRITE_PALETTES[type] || SPRITE_PALETTES.coder;
  const bob  = animState === 'idle' ? Math.sin(frame*0.07)*0.8 : 0;

  // 1. Draw base body (torso, legs, feet, arms)
  _drawCharBase(ctx, s, p, animState, frame);

  // 2. Draw head (face, eyes, mouth)
  _drawCharHead(ctx, s, p, animState, frame);

  // 3. Apply agent-type-specific overlay (hat, accessories, chest decoration)
  const overlayFn = {
    coder:      _overlay_coder,
    debugger:   _overlay_debugger,
    researcher: _overlay_researcher,
    architect:  _overlay_architect,
    tester:     _overlay_tester,
    devops:     _overlay_devops,
    designer:   _overlay_designer,
    analyst:    _overlay_analyst,
  }[type];
  if (overlayFn) overlayFn(ctx, s, p, bob);

  // 4. Status effects
  if (animState === 'waiting') {
    // Speech bubble
    _px(ctx, -4, -23, 8, 5, p.out, s);
    _px(ctx, -3, -22, 6, 3, '#ffffcc', s);
    _px(ctx, -1, -18, 2, 2, p.out, s);
    _px(ctx,  0, -19, 1, 1, '#ffffcc', s);
    ctx.fillStyle = '#333';
    ctx.font = `${Math.round(3*s)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('?', 0, Math.round(-19*s));
  }
  if (animState === 'complete') {
    // Star burst
    ctx.fillStyle = p.acc;
    ctx.font = `${Math.round(4*s)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('★', Math.round(5*s), Math.round(-18*s));
  }
  if (animState === 'error') {
    // Red flash dots
    _px(ctx, -5, -16, 2, 2, '#ff4455', s);
    _px(ctx,  3, -16, 2, 2, '#ff4455', s);
  }

  // 5. Sub-agent indicator
  if (isSubagent) {
    ctx.strokeStyle = 'rgba(255,255,0,0.7)';
    ctx.lineWidth = Math.max(1, 0.5*s);
    ctx.setLineDash([Math.round(2*s), Math.round(2*s)]);
    ctx.strokeRect(Math.round(-6*s), Math.round(-20*s), Math.round(12*s), Math.round(30*s));
    ctx.setLineDash([]);
  }

  ctx.restore();
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: draw crown for parent agents with sub-agents
// ─────────────────────────────────────────────────────────────────────────────
function drawCrown(ctx, cx, cy, scale) {
  const s = scale;
  ctx.fillStyle = '#ffcc00';
  ctx.save();
  ctx.translate(cx, cy);
  // crown base
  ctx.fillRect(-3 * s, -14 * s, 6 * s, 2 * s);
  // crown prongs
  ctx.fillRect(-3 * s, -16 * s, 1 * s, 2 * s);
  ctx.fillRect(-1 * s, -15 * s, 2 * s, 1 * s);
  ctx.fillRect(2 * s,  -16 * s, 1 * s, 2 * s);
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
      drawPixelChar(ctx, 0, 0, _charType(a), sc, animState, this.frame, scale, isSubagent);
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
          <span style="font-size:1.8rem;">${_escHtml(a.character_sprite) || '🤖'}</span>
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
  // Cycle through agent types for mini sprites (varied for visual interest)
  const types = ['coder','debugger','researcher','architect','tester','devops','designer','analyst'];
  const miniType = types[Math.floor(_miniFrame / 1800) % types.length];
  drawPixelChar(ctx, 0, 0, miniType, sc, animState, frame, 1.5, false);
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

// ─────────────────────────────────────────────────────────────────────────────
// BOOT — initialise PixelCanvas and wire up refresh button
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const canvasEl = document.getElementById('pixel-canvas');
  const detailEl = document.getElementById('canvas-detail-panel');
  if (!canvasEl) return;

  const pc = new PixelCanvas(canvasEl, detailEl);
  window.pixelCanvas = pc;

  // Auto-load when the canvas tab becomes active
  document.querySelector('[data-tab="canvas"]')?.addEventListener('click', () => {
    pc.loadCanvasState();
  });

  // Refresh button
  document.getElementById('refresh-canvas-btn')?.addEventListener('click', () => {
    pc.loadCanvasState();
  });
});
