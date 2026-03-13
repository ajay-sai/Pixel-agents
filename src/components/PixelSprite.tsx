'use client';
import type { Agent } from '@/types';

interface PixelSpriteProps {
  agent: Agent;
  size?: number;
  animated?: boolean;
}

const SPRITES: Record<string, string[][]> = {
  Coder: [
    ['0','1','1','0'],
    ['1','1','1','1'],
    ['0','1','0','1'],
    ['1','0','1','0'],
  ],
  Debugger: [
    ['1','0','0','1'],
    ['0','1','1','0'],
    ['1','1','1','1'],
    ['0','1','1','0'],
  ],
  Researcher: [
    ['0','1','1','0'],
    ['1','0','0','1'],
    ['1','1','1','1'],
    ['0','0','1','0'],
  ],
  Architect: [
    ['1','1','1','1'],
    ['1','0','0','1'],
    ['1','1','1','1'],
    ['1','0','0','1'],
  ],
  Tester: [
    ['0','1','1','0'],
    ['1','1','1','1'],
    ['1','0','0','1'],
    ['0','1','1','0'],
  ],
  DevOps: [
    ['1','0','1','0'],
    ['1','1','1','1'],
    ['0','1','0','1'],
    ['1','0','1','0'],
  ],
  Designer: [
    ['0','0','1','0'],
    ['0','1','1','1'],
    ['1','1','1','0'],
    ['0','1','0','0'],
  ],
  Analyst: [
    ['1','1','0','0'],
    ['0','1','1','0'],
    ['0','0','1','1'],
    ['1','1','1','1'],
  ],
};

export default function PixelSprite({ agent, size = 4, animated = false }: PixelSpriteProps) {
  const grid = SPRITES[agent.type] || SPRITES.Coder;
  return (
    <div
      className={animated ? 'animate-float' : ''}
      style={{ display: 'inline-block' }}
      title={agent.name}
    >
      {grid.map((row, y) => (
        <div key={y} style={{ display: 'flex' }}>
          {row.map((cell, x) => (
            <div
              key={x}
              style={{
                width: size,
                height: size,
                backgroundColor: cell === '1' ? agent.color : 'transparent',
                boxShadow: cell === '1' ? `0 0 2px ${agent.color}` : 'none',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
