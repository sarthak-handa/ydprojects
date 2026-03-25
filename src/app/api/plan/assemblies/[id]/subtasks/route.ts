import { NextRequest, NextResponse } from 'next/server';
import { getPlanSubtasks, createPlanSubtask } from '@/lib/database';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const subtasks = getPlanSubtasks(Number(id));
    return NextResponse.json(subtasks);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    const subtask = createPlanSubtask(Number(id), {
      name: body.name,
      phaseId: body.phaseId ?? null,
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
    });
    return NextResponse.json(subtask, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
