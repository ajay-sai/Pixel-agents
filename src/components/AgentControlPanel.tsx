'use client';
import type { Agent } from '@/types';
import PixelSprite from './PixelSprite';

interface AgentControlPanelProps {
  agents: Agent[];
  onRelease?: (agentId: string) => void;
}

export default function AgentControlPanel({ agents, onRelease }: AgentControlPanelProps) {
  const active = agents.filter(a => a.status === 'hired' || a.status === 'working');

  return (
    <div className="pixel-card">
      <div className="text-xs text-pixel-green mb-4 glow-green">◉ AGENT CONTROL</div>
      {active.length === 0 ? (
        <div className="text-xs text-gray-500 text-center py-4" style={{ fontSize: '9px' }}>No active agents</div>
      ) : (
        <div className="space-y-3">
          {active.map(agent => (
            <div key={agent.id} className="border p-3 flex items-center gap-3" style={{ borderColor: agent.color + '55' }}>
              <PixelSprite agent={agent} size={6} animated={agent.status === 'working'} />
              <div className="flex-1 min-w-0">
                <div className="text-xs" style={{ color: agent.color, fontSize: '9px' }}>{agent.name}</div>
                <div className="text-xs text-gray-500" style={{ fontSize: '8px' }}>{agent.status}</div>
              </div>
              <div className="flex gap-1">
                <button className="pixel-btn pixel-btn-red" style={{ fontSize: '7px', padding: '4px 8px' }}
                  onClick={() => onRelease?.(agent.id)}>
                  STOP
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
