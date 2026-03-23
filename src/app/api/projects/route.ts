import { NextResponse } from 'next/server';
import { database } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const db = database();
  try {
    const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const db = database();
  try {
    const body = await request.json();
    const id = uuidv4();
    
    // For manual creation
    const stmt = db.prepare(`
      INSERT INTO projects (id, project_id, name, division, manager, plan_status, state, start_date, due_date, projected_date, planned_end)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      body.project_id || `P-${Date.now()}`,
      body.name,
      body.division || 'DEFAULT',
      body.manager || '',
      body.plan_status || 'Checked In',
      body.state || 'In Process',
      body.start_date || '',
      body.due_date || '',
      body.projected_date || '',
      body.planned_end || ''
    );
    
    return NextResponse.json({ id, ...body }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project', details: error.message }, { status: 500 });
  }
}
