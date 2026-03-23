import { NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const db = database();
  try {
    const { id } = await context.params;
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Also fetch the summary stats (count of assemblies, etc)
    const stats = db.prepare(`
      SELECT 
        COUNT(CASE WHEN type = 'Subtask' THEN 1 END) as assemblies_count,
        COUNT(CASE WHEN type = 'step' THEN 1 END) as subassemblies_count,
        COUNT(CASE WHEN type = 'date' THEN 1 END) as components_count
      FROM wbs_rows 
      WHERE project_id = ?
    `).get(id);

    return NextResponse.json({ ...project, stats });
  } catch (error: any) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Failed to fetch project', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const db = database();
  try {
    const { id } = await context.params;
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project', details: error.message }, { status: 500 });
  }
}
