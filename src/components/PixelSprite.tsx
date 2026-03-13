'use client';
import { useEffect, useRef } from 'react';
import type { Agent } from '@/types';

interface PixelSpriteProps {
  agent: Agent;
  size?: number;
  animated?: boolean;
}

// ─── Colour palettes per agent type ────────────────────────────────────────
const PALETTES: Record<string, { out:string; drk:string; mid:string; lit:string; skn:string; eye:string; acc:string }> = {
  Coder:      { out:'#001a08', drk:'#004411', mid:'#00cc33', lit:'#88ffaa', skn:'#c8eec8', eye:'#00ffff', acc:'#00ff41' },
  Debugger:   { out:'#1a0000', drk:'#550000', mid:'#cc2222', lit:'#ff9988', skn:'#ffe0d8', eye:'#ffff44', acc:'#ff8800' },
  Researcher: { out:'#001a1a', drk:'#004444', mid:'#00aaaa', lit:'#88ffff', skn:'#ccf5f5', eye:'#0088ff', acc:'#ff00cc' },
  Architect:  { out:'#1a0a00', drk:'#553300', mid:'#cc6600', lit:'#ffcc88', skn:'#ffe8cc', eye:'#ffff00', acc:'#ffcc00' },
  Tester:     { out:'#1a1a00', drk:'#555500', mid:'#aaaa00', lit:'#ffff88', skn:'#fffff0', eye:'#00ff88', acc:'#00ffff' },
  DevOps:     { out:'#0d0022', drk:'#330066', mid:'#8822cc', lit:'#cc88ff', skn:'#e8d0ff', eye:'#ffff00', acc:'#ff00ff' },
  Designer:   { out:'#1a001a', drk:'#550055', mid:'#cc00cc', lit:'#ff88ff', skn:'#ffd8ff', eye:'#00ffff', acc:'#ffff00' },
  Analyst:    { out:'#00111a', drk:'#002244', mid:'#2288cc', lit:'#88ccff', skn:'#d0e8ff', eye:'#ffff44', acc:'#00ffff' },
};

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, s: number) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x * s), Math.round(y * s), Math.round(w * s), Math.round(h * s));
}

function drawSprite(ctx: CanvasRenderingContext2D, type: string, frame: number, W: number, H: number) {
  ctx.clearRect(0, 0, W, H);
  const grad = ctx.createRadialGradient(W / 2, H / 2, 1, W / 2, H / 2, W * 0.7);
  grad.addColorStop(0, '#1a2a3a');
  grad.addColorStop(1, '#080c14');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const p = PALETTES[type] ?? PALETTES.Coder;
  const s = W / 20;
  const bob = Math.sin(frame * 0.07) * 0.8;

  ctx.save();
  ctx.translate(W / 2, H * 0.8);

  // Torso
  px(ctx, -4, -8 + bob, 8, 8, p.out, s);
  px(ctx, -3, -7 + bob, 6, 6, p.mid, s);
  px(ctx, -3, -7 + bob, 3, 2, p.lit, s);
  px(ctx, -3, -3 + bob, 6, 2, p.drk, s);
  px(ctx, -2,  0 + bob, 4, 1, p.acc, s); // belt

  // Legs
  px(ctx, -4, 1 + bob, 3, 5, p.out, s);
  px(ctx,  1, 1 + bob, 3, 5, p.out, s);
  px(ctx, -3, 1 + bob, 2, 4, p.drk, s);
  px(ctx,  2, 1 + bob, 2, 4, p.drk, s);
  // Feet
  px(ctx, -4, 6 + bob, 4, 2, p.out, s);
  px(ctx,  0, 6 + bob, 4, 2, p.out, s);
  px(ctx, -3, 6 + bob, 3, 1, p.mid, s);
  px(ctx,  1, 6 + bob, 3, 1, p.mid, s);

  // Arms
  const armSwing = Math.sin(frame * 0.3) * 1.5;
  px(ctx, -6, -7 + bob + armSwing, 2, 5, p.out, s);
  px(ctx, -5, -6 + bob + armSwing, 1, 4, p.mid, s);
  px(ctx,  4, -7 + bob - armSwing, 2, 5, p.out, s);
  px(ctx,  4, -6 + bob - armSwing, 1, 4, p.mid, s);

  // Head
  px(ctx, -3, -14 + bob, 6, 7, p.out, s);
  px(ctx, -2, -13 + bob, 4, 5, p.skn, s);
  px(ctx, -2, -13 + bob, 2, 2, p.lit, s);
  // Eyes
  px(ctx, -1.5, -11 + bob, 1, 1, p.eye, s);
  px(ctx,  0.5, -11 + bob, 1, 1, p.eye, s);
  // Mouth
  px(ctx, -1, -10 + bob, 3, 1, p.out, s);

  // ── Type-specific details ───────────────────────────────────────────
  if (type === 'Coder') {
    // Antenna
    px(ctx, -0.5, -17 + bob, 1, 2, p.acc, s);
    px(ctx, -0.5, -18 + bob, 1, 1, p.eye, s);
    // Visor
    px(ctx, -3, -12 + bob, 6, 2, p.eye, s);
    px(ctx, -3, -12 + bob, 6, 1, p.out, s);
    // Circuits on chest
    px(ctx, -2, -5 + bob, 1, 1, p.acc, s);
    px(ctx,  1, -5 + bob, 1, 1, p.acc, s);
    px(ctx, -3, -3 + bob, 2, 1, p.acc, s);
    px(ctx,  1, -3 + bob, 2, 1, p.acc, s);
  } else if (type === 'Debugger') {
    // Deerstalker hat
    px(ctx, -4, -18 + bob, 8, 1, p.out, s);
    px(ctx, -2, -21 + bob, 4, 3, p.out, s);
    px(ctx, -1, -20 + bob, 3, 2, p.mid, s);
    px(ctx, -4, -17 + bob, 8, 1, p.drk, s);
    // Eyebrows
    px(ctx, -2, -12 + bob, 2, 1, p.out, s);
    px(ctx,  1, -12 + bob, 2, 1, p.out, s);
    // Magnifier
    px(ctx,  1, -5 + bob, 3, 3, p.out, s);
    px(ctx,  1, -5 + bob, 2, 2, 'rgba(100,200,255,0.5)', s);
  } else if (type === 'Researcher') {
    // Wizard hat
    px(ctx, -3, -18 + bob, 6, 1, p.out, s);
    px(ctx, -1, -22 + bob, 2, 4, p.out, s);
    px(ctx, -0.5, -21 + bob, 1, 3, p.mid, s);
    px(ctx, -0.5, -22 + bob, 1, 1, p.acc, s);
    // Round glasses
    px(ctx, -3, -12 + bob, 2, 2, p.out, s);
    px(ctx,  1, -12 + bob, 2, 2, p.out, s);
    px(ctx, -2, -12 + bob, 1, 1, 'rgba(180,220,255,0.5)', s);
    px(ctx,  1, -12 + bob, 1, 1, 'rgba(180,220,255,0.5)', s);
    // Star on robe
    px(ctx, -1, -5 + bob, 3, 1, p.acc, s);
    px(ctx,  0, -6 + bob, 1, 3, p.acc, s);
  } else if (type === 'Architect') {
    // Hard hat
    px(ctx, -4, -18 + bob, 8, 1, p.out, s);
    px(ctx, -3, -21 + bob, 6, 3, p.out, s);
    px(ctx, -2, -20 + bob, 4, 2, p.mid, s);
    px(ctx, -4, -17 + bob, 8, 2, p.drk, s);
    // Blueprint
    px(ctx, -2, -7 + bob, 4, 5, p.out, s);
    px(ctx, -1, -6 + bob, 3, 4, p.acc, s);
    px(ctx, -1, -4 + bob, 3, 1, p.lit, s);
    px(ctx,  0, -6 + bob, 1, 4, p.lit, s);
  } else if (type === 'Tester') {
    // Lab goggles on forehead
    px(ctx, -3, -15 + bob, 3, 2, p.out, s);
    px(ctx,  0, -15 + bob, 3, 2, p.out, s);
    px(ctx, -2, -15 + bob, 2, 1, p.eye, s);
    px(ctx,  1, -15 + bob, 2, 1, p.eye, s);
    // Clipboard
    px(ctx,  4, -6 + bob, 4, 5, p.out, s);
    px(ctx,  5, -5 + bob, 3, 4, 'rgba(220,240,255,0.7)', s);
    px(ctx,  6, -3 + bob, 1, 3, p.acc, s);
  } else if (type === 'DevOps') {
    // Engineer cap
    px(ctx, -4, -18 + bob, 8, 1, p.out, s);
    px(ctx, -2, -21 + bob, 4, 3, p.out, s);
    px(ctx, -1, -20 + bob, 3, 2, p.mid, s);
    px(ctx,  0, -21 + bob, 1, 1, p.acc, s);
    // Gear icon
    px(ctx, -1, -6 + bob, 3, 3, p.out, s);
    px(ctx,  0, -5 + bob, 1, 1, p.lit, s);
    px(ctx, -1, -5 + bob, 1, 1, p.acc, s);
    px(ctx,  1, -5 + bob, 1, 1, p.acc, s);
    px(ctx,  0, -4 + bob, 1, 1, p.acc, s);
  } else if (type === 'Designer') {
    // Beret
    px(ctx, -4, -18 + bob, 8, 2, p.out, s);
    px(ctx, -3, -19 + bob, 6, 2, p.mid, s);
    px(ctx, -3, -19 + bob, 3, 1, p.lit, s);
    px(ctx,  2, -20 + bob, 1, 2, p.acc, s);
    // Color palette
    px(ctx, -2, -7 + bob, 5, 4, p.out, s);
    px(ctx, -2, -6 + bob, 2, 2, '#ff4444', s);
    px(ctx,  0, -6 + bob, 2, 2, '#ffaa00', s);
    px(ctx, -2, -4 + bob, 2, 1, '#00ff88', s);
    px(ctx,  0, -4 + bob, 2, 1, '#00aaff', s);
    // Paintbrush
    px(ctx,  4, -7 + bob, 2, 2, p.acc, s);
    px(ctx,  4, -5 + bob, 1, 5, p.mid, s);
  } else if (type === 'Analyst') {
    // Rectangular glasses
    px(ctx, -3, -13 + bob, 3, 2, p.out, s);
    px(ctx,  0, -13 + bob, 3, 2, p.out, s);
    px(ctx, -2, -12 + bob, 1, 1, 'rgba(150,200,255,0.5)', s);
    px(ctx,  1, -12 + bob, 1, 1, 'rgba(150,200,255,0.5)', s);
    px(ctx, -1, -12 + bob, 2, 1, p.out, s);
    // Bar chart
    px(ctx, -2, -7 + bob, 5, 5, p.out, s);
    px(ctx, -1, -6 + bob, 4, 4, '#0a1520', s);
    px(ctx, -1, -3 + bob, 1, 3, p.acc, s);
    px(ctx,  0, -4 + bob, 1, 4, p.mid, s);
    px(ctx,  1, -2 + bob, 1, 2, p.eye, s);
    px(ctx,  2, -5 + bob, 1, 5, p.lit, s);
  }

  ctx.restore();
}

export default function PixelSprite({ agent, size = 64, animated = false }: PixelSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef(0);
  const rafRef    = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (animated) {
      const tick = () => {
        frameRef.current++;
        drawSprite(ctx, agent.type, frameRef.current, size, size);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      drawSprite(ctx, agent.type, 0, size, size);
    }

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [agent.type, size, animated]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      title={agent.name}
      style={{ imageRendering: 'pixelated', display: 'inline-block' }}
    />
  );
}
