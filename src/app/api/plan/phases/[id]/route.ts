import { NextRequest, NextResponse } from 'next/server';
import { updatePlanPhase } from '@/lib/database';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = updatePlanPhase(Number(id), {
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
      durationDays: body.durationDays,
    });
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
