'use client';
import { useState, useEffect } from 'react';
import PixelNav from '@/components/PixelNav';
import AgentCard from '@/components/AgentCard';
import type { Agent } from '@/types';

export default function MarketplacePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [hiredIds, setHiredIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const TYPES = ['ALL', 'Coder', 'Debugger', 'Researcher', 'Architect', 'Tester', 'DevOps', 'Designer', 'Analyst'];

  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then(data => { setAgents(data); setLoading(false); });
  }, []);

  async function handleHire(agent: Agent) {
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId: agent.id }),
    });
    if (res.ok) {
      setHiredIds(prev => new Set(Array.from(prev).concat(agent.id)));
      setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, status: 'hired' } : a));
    }
  }

  const filtered = filter === 'ALL' ? agents : agents.filter(a => a.type === filter);

  return (
    <div className="min-h-screen bg-pixel-bg">
      <PixelNav />
      <main className="p-6">
        <h1 className="text-pixel-green text-lg mb-2 glow-green">AGENT MARKETPLACE</h1>
        <p className="text-gray-400 text-xs mb-6" style={{ fontSize: '9px' }}>
          Browse and hire specialized AI agents
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {TYPES.map(t => (
            <button
              key={t}
              className={`pixel-btn ${filter === t ? 'border-pixel-green text-pixel-green' : 'border-pixel-border text-gray-400'}`}
              style={{ fontSize: '8px', padding: '4px 10px' }}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-pixel-green text-xs animate-blink">LOADING...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onHire={handleHire}
                hired={hiredIds.has(agent.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
