'use client';
import type { Agent } from '@/types';
import PixelSprite from './PixelSprite';

interface AgentCardProps {
  agent: Agent;
  onHire?: (agent: Agent) => void;
  hired?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  available: '#00ff41',
  hired: '#ffff00',
  working: '#ff00ff',
  idle: '#aaaaaa',
};

export default function AgentCard({ agent, onHire, hired }: AgentCardProps) {
  const canHire = agent.status === 'available' && !hired;
  return (
    <div className="pixel-card flex flex-col gap-3" style={{ borderColor: agent.color + '55' }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs mb-2" style={{ color: agent.color }}>{agent.name}</div>
          <div className="text-xs text-gray-400">{agent.type}</div>
        </div>
        <PixelSprite agent={agent} size={56} animated={agent.status === 'working'} />
      </div>

      <p className="text-xs text-gray-400 leading-relaxed" style={{ fontSize: '8px' }}>{agent.description}</p>

      <div className="flex flex-wrap gap-1">
        {agent.skills.slice(0, 3).map(skill => (
          <span
            key={skill}
            className="text-xs px-1 py-0.5 border"
            style={{ fontSize: '8px', borderColor: agent.color + '88', color: agent.color + 'cc' }}
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span style={{ color: STATUS_COLORS[agent.status], fontSize: '8px' }}>
          ● {agent.status.toUpperCase()}
        </span>
        <span style={{ color: '#ffff00', fontSize: '8px' }}>LVL {agent.level}</span>
        <span style={{ color: '#00ffff', fontSize: '8px' }}>{agent.cost}¢</span>
      </div>

      <button
        className={`pixel-btn w-full text-center ${canHire ? '' : 'opacity-40 cursor-not-allowed'}`}
        style={canHire ? { borderColor: agent.color, color: agent.color } : {}}
        onClick={() => canHire && onHire?.(agent)}
        disabled={!canHire}
      >
        {hired ? 'HIRED ✓' : agent.status === 'available' ? 'HIRE' : 'BUSY'}
      </button>
    </div>
  );
}
