import { NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/database';

export async function GET() {
  try {
    const projects = getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const project = createProject({
      code: body.code || `P-${Date.now()}`,
      name: body.name,
      manager: body.manager || '',
      division: body.division,
      client_name: body.client_name,
      due_date: body.due_date || '',
      projected_end_date: body.projected_end_date || '',
      notes: body.notes,
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating project:', message);
    return NextResponse.json({ error: 'Failed to create project', details: message }, { status: 500 });
  }
}
