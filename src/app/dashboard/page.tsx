'use client';
import { useState, useEffect, useCallback } from 'react';
import PixelNav from '@/components/PixelNav';
import AgentWorld from '@/components/AgentWorld';
import AgorView from '@/components/AgorView';
import TaskPanel from '@/components/TaskPanel';
import TaskTracker from '@/components/TaskTracker';
import AgentControlPanel from '@/components/AgentControlPanel';
import type { Agent, Task } from '@/types';

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const refresh = useCallback(async () => {
    const [agRes, tkRes] = await Promise.all([
      fetch('/api/agents'),
      fetch('/api/tasks'),
    ]);
    setAgents(await agRes.json());
    setTasks(await tkRes.json());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  function handleTaskSubmit() {
    setTimeout(refresh, 500);
  }

  return (
    <div className="min-h-screen bg-pixel-bg">
      <PixelNav />
      <main className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-pixel-pink text-base glow-pink">LIVE DASHBOARD</h1>
          <span className="text-pixel-green text-xs animate-blink" style={{ fontSize: '8px' }}>● LIVE</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Left column */}
          <div className="xl:col-span-2 space-y-4">
            <AgentWorld agents={agents} />
            <AgorView tasks={tasks} agents={agents} />
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <TaskPanel onTaskSubmit={handleTaskSubmit} />
            <AgentControlPanel agents={agents} />
            <TaskTracker tasks={tasks} />
          </div>
        </div>
      </main>
    </div>
  );
}
