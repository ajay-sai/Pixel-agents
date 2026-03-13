'use client';
import { useEffect, useState } from 'react';
import type { Agent } from '@/types';
import PixelSprite from './PixelSprite';

const GRID_W = 20;
const GRID_H = 12;

const ZONES = [
  { x: 1, y: 1, w: 5, h: 4, label: 'CODE ZONE', color: '#00ff4122' },
  { x: 8, y: 1, w: 5, h: 4, label: 'RESEARCH', color: '#00ffff22' },
  { x: 15, y: 1, w: 4, h: 4, label: 'DEVOPS', color: '#ff880022' },
  { x: 1, y: 7, w: 4, h: 4, label: 'DESIGN', color: '#aa44ff22' },
  { x: 7, y: 7, w: 5, h: 4, label: 'TEST ZONE', color: '#ffff0022' },
  { x: 14, y: 7, w: 5, h: 4, label: 'ANALYSIS', color: '#44aaff22' },
];

interface AgentWorldProps {
  agents: Agent[];
}

export default function AgentWorld({ agents }: AgentWorldProps) {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(
    Object.fromEntries(agents.map(a => [a.id, a.position]))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => {
        const next = { ...prev };
        agents.forEach(agent => {
          if (agent.status === 'working' || agent.status === 'hired') {
            const cur = next[agent.id] || agent.position;
            const dx = Math.floor(Math.random() * 3) - 1;
            const dy = Math.floor(Math.random() * 3) - 1;
            next[agent.id] = {
              x: Math.max(0, Math.min(GRID_W - 1, cur.x + dx)),
              y: Math.max(0, Math.min(GRID_H - 1, cur.y + dy)),
            };
          }
        });
        return next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [agents]);

  const CELL = 32;

  return (
    <div className="pixel-card overflow-auto">
      <div className="text-xs text-pixel-cyan mb-3">◉ PIXEL WORLD — LIVE</div>
      <div
        className="relative"
        style={{
          width: GRID_W * CELL,
          height: GRID_H * CELL,
          background: '#0a0a1a',
          border: '2px solid #333366',
        }}
      >
        {/* Grid lines */}
        {Array.from({ length: GRID_W }).map((_, i) => (
          <div
            key={`vl-${i}`}
            className="absolute top-0 bottom-0"
            style={{ left: i * CELL, width: 1, background: '#1a1a2e' }}
          />
        ))}
        {Array.from({ length: GRID_H }).map((_, i) => (
          <div
            key={`hl-${i}`}
            className="absolute left-0 right-0"
            style={{ top: i * CELL, height: 1, background: '#1a1a2e' }}
          />
        ))}

        {/* Zones */}
        {ZONES.map(z => (
          <div
            key={z.label}
            className="absolute flex items-end justify-start p-1"
            style={{
              left: z.x * CELL,
              top: z.y * CELL,
              width: z.w * CELL,
              height: z.h * CELL,
              background: z.color,
              border: '1px solid ' + z.color.replace('22', '66'),
            }}
          >
            <span style={{ fontSize: '6px', color: z.color.replace('22', 'cc'), fontFamily: 'monospace' }}>
              {z.label}
            </span>
          </div>
        ))}

        {/* Agents */}
        {agents.map(agent => {
          const pos = positions[agent.id] || agent.position;
          return (
            <div
              key={agent.id}
              className="absolute flex flex-col items-center"
              style={{
                left: pos.x * CELL,
                top: pos.y * CELL,
                transition: 'left 0.7s ease, top 0.7s ease',
                zIndex: 10,
              }}
              title={`${agent.name} (${agent.status})`}
            >
              <PixelSprite agent={agent} size={6} animated={agent.status === 'working'} />
              <span style={{ fontSize: '5px', color: agent.color, marginTop: 1, whiteSpace: 'nowrap' }}>
                {agent.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
