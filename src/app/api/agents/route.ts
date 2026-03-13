import { NextRequest, NextResponse } from 'next/server';
import { getStore, updateStore } from '@/lib/store';

export async function GET() {
  const store = getStore();
  return NextResponse.json(store.agents);
}

export async function POST(req: NextRequest) {
  const { agentId } = await req.json();
  let hired: import('@/types').Agent | undefined = undefined;
  updateStore(store => {
    const agent = store.agents.find(a => a.id === agentId);
    if (agent && agent.status === 'available') {
      agent.status = 'hired';
      hired = agent;
    }
  });
  if (!hired) return NextResponse.json({ error: 'Agent not available' }, { status: 400 });
  return NextResponse.json(hired);
}
