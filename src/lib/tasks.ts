import type { Task, SubTask } from '@/types';

let taskCounter = 0;

export function createTask(title: string, description: string, agentIds: string[]): Task {
  const id = `task-${++taskCounter}-${Date.now()}`;

  const subtasks: SubTask[] = agentIds.map((agentId, i) => ({
    id: `${id}-sub-${i}`,
    title: `Subtask ${i + 1}: ${title}`,
    status: 'pending',
    agentId,
  }));

  return {
    id,
    title,
    description,
    status: 'pending',
    assignedAgents: agentIds,
    subtasks,
    progress: 0,
    createdAt: Date.now(),
  };
}
