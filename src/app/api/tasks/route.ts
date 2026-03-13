import { NextRequest, NextResponse } from 'next/server';
import { getStore, updateStore } from '@/lib/store';
import { createTask } from '@/lib/tasks';

export async function GET() {
  const store = getStore();
  return NextResponse.json(store.tasks);
}

export async function POST(req: NextRequest) {
  const { title, description, agentIds } = await req.json();
  const task = createTask(title || description.slice(0, 50), description, agentIds || []);
  updateStore(store => {
    store.tasks.push(task);
    agentIds?.forEach((id: string) => {
      const agent = store.agents.find(a => a.id === id);
      if (agent) {
        agent.status = 'working';
        agent.currentTask = task.id;
      }
    });
  });
  return NextResponse.json(task);
}
