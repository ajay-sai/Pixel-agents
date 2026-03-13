'use client';
import type { Task } from '@/types';

interface TaskTrackerProps {
  tasks: Task[];
}

const STATUS_COLORS = {
  'pending': '#ffff00',
  'in-progress': '#00ffff',
  'done': '#00ff41',
  'failed': '#ff4444',
};

export default function TaskTracker({ tasks }: TaskTrackerProps) {
  return (
    <div className="pixel-card">
      <div className="text-xs text-pixel-yellow mb-4">◉ TASK TRACKER</div>
      {tasks.length === 0 ? (
        <div className="text-xs text-gray-500 text-center py-4" style={{ fontSize: '9px' }}>No tasks yet</div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => {
            const color = STATUS_COLORS[task.status];
            return (
              <div key={task.id} className="border p-3" style={{ borderColor: color + '55' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs" style={{ color, fontSize: '9px' }}>{task.title.slice(0, 30)}</span>
                  <span style={{ color, fontSize: '8px' }}>{task.status}</span>
                </div>
                <div className="w-full bg-pixel-bg h-2 border border-pixel-border">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${task.progress}%`, background: color }}
                  />
                </div>
                <div className="text-xs mt-1" style={{ color: '#888', fontSize: '8px' }}>
                  {task.progress}% — {task.assignedAgents.length} agents
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
