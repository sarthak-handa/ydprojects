import { NextRequest, NextResponse } from 'next/server';
import { getPlanDpr, createPlanDpr } from '@/lib/database';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const entries = getPlanDpr(Number(id));
    return NextResponse.json(entries);
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
    if (!body.componentName || !body.date) {
      return NextResponse.json({ error: 'componentName and date are required' }, { status: 400 });
    }
    const entry = createPlanDpr(Number(id), {
      componentName: body.componentName,
      quantity: Number(body.quantity) || 1,
      date: body.date,
      status: body.status || 'Pending',
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
