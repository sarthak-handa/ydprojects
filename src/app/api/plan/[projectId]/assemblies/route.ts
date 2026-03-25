import { NextRequest, NextResponse } from 'next/server';
import {
  getPlanAssemblies,
  createPlanAssembly,
} from '@/lib/database';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const assemblies = getPlanAssemblies(Number(projectId));
    return NextResponse.json(assemblies);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const { projectId } = await params;
    const body = await req.json();
    const { name, category, orderIndex } = body as {
      name: string;
      category: number;
      orderIndex?: number;
    };
    if (!name || !category) {
      return NextResponse.json({ error: 'name and category are required' }, { status: 400 });
    }
    const assembly = createPlanAssembly(Number(projectId), { name, category, orderIndex });
    return NextResponse.json(assembly, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
