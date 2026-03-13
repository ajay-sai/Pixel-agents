import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { autoHire } from '@/lib/auto-hire';

export async function POST(req: NextRequest) {
  const { description } = await req.json();
  const store = getStore();
  const result = autoHire(description, store.agents);
  return NextResponse.json(result);
}
