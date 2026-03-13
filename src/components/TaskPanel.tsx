'use client';
import { useState } from 'react';
import type { Agent } from '@/types';

interface TaskPanelProps {
  onTaskSubmit: () => void;
}

export default function TaskPanel({ onTaskSubmit }: TaskPanelProps) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoHired, setAutoHired] = useState<Agent[]>([]);
  const [error, setError] = useState('');

  async function handleAutoHire() {
    if (!description.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auto-hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      setAutoHired(data.agents || []);
    } catch (err) {
      console.error('Auto-hire error:', err);
      setError('Auto-hire failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!description.trim() || autoHired.length === 0) return;
    setLoading(true);
    try {
      // Hire agents
      await Promise.all(
        autoHired.map(a =>
          fetch('/api/agents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId: a.id }),
          })
        )
      );
      // Create task
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, agentIds: autoHired.map(a => a.id) }),
      });
      onTaskSubmit();
      setDescription('');
      setAutoHired([]);
    } catch (err) {
      console.error('Task submission error:', err);
      setError('Task creation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pixel-card">
      <div className="text-xs text-pixel-pink mb-4 glow-pink">◉ SUBMIT TASK</div>
      <textarea
        className="w-full bg-pixel-bg border-2 border-pixel-border text-pixel-green font-pixel text-xs p-3 resize-none focus:outline-none focus:border-pixel-green"
        style={{ fontSize: '10px', minHeight: 80 }}
        placeholder="Describe your task... e.g. 'Build and test a REST API, fix bugs, deploy to docker'"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      {error && <div className="text-pixel-red text-xs mt-2" style={{ fontSize: '8px' }}>{error}</div>}

      <div className="flex gap-2 mt-3">
        <button className="pixel-btn pixel-btn-cyan flex-1" onClick={handleAutoHire} disabled={loading || !description.trim()}>
          {loading ? '...' : 'AUTO-HIRE'}
        </button>
        <button
          className="pixel-btn pixel-btn-pink flex-1"
          onClick={handleSubmit}
          disabled={loading || autoHired.length === 0}
        >
          LAUNCH
        </button>
      </div>

      {autoHired.length > 0 && (
        <div className="mt-4">
          <div className="text-xs text-pixel-yellow mb-2" style={{ fontSize: '8px' }}>AUTO-HIRED AGENTS:</div>
          <div className="flex flex-wrap gap-2">
            {autoHired.map(a => (
              <span
                key={a.id}
                className="text-xs px-2 py-1 border animate-pulse"
                style={{ borderColor: a.color, color: a.color, fontSize: '8px' }}
              >
                {a.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
