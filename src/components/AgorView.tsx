'use client';
import type { Task } from '@/types';

const STATUS_COLORS = {
  'pending': '#ffff00',
  'in-progress': '#00ffff',
  'done': '#00ff41',
  'failed': '#ff4444',
};

interface AgorViewProps {
  tasks: Task[];
  agents: { id: string; name: string; type: string }[];
}

function SubTaskNode({ sub, agentName }: { sub: Task['subtasks'][0]; agentName?: string }) {
  const color = STATUS_COLORS[sub.status];
  return (
    <div className="flex items-center gap-2 ml-6 my-1">
      <div className="w-px h-4 bg-pixel-border" />
      <div
        className="text-xs px-2 py-1 border"
        style={{ borderColor: color + '88', color, fontSize: '8px' }}
      >
        ↳ {sub.title} {agentName ? `[${agentName}]` : ''} — {sub.status}
      </div>
    </div>
  );
}

export default function AgorView({ tasks, agents }: AgorViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="pixel-card">
        <div className="text-xs text-pixel-cyan mb-3">◉ AGOR TASK TREE</div>
        <div className="text-xs text-gray-500 text-center py-8">No active tasks</div>
      </div>
    );
  }

  return (
    <div className="pixel-card">
      <div className="text-xs text-pixel-cyan mb-4">◉ AGOR TASK TREE</div>
      <div className="space-y-4">
        {tasks.map(task => {
          const color = STATUS_COLORS[task.status];
          return (
            <div key={task.id}>
              <div
                className="text-xs px-3 py-2 border-2 flex justify-between items-center"
                style={{ borderColor: color, color }}
              >
                <span>▶ {task.title}</span>
                <span style={{ fontSize: '8px' }}>{task.progress}% — {task.status}</span>
              </div>
              <div className="mt-1">
                {task.subtasks.map(sub => {
                  const agent = agents.find(a => a.id === sub.agentId);
                  return <SubTaskNode key={sub.id} sub={sub} agentName={agent?.name} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
