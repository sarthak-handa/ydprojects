import { NextRequest, NextResponse } from 'next/server';
import { updatePlanSubtask, deletePlanSubtask } from '@/lib/database';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = updatePlanSubtask(Number(id), {
      name: body.name,
      phaseId: body.phaseId,
      startDate: body.startDate,
      endDate: body.endDate,
      completionPercent: body.completionPercent,
    });
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    deletePlanSubtask(Number(id));
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
