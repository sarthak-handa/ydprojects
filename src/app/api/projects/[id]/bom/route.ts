import { NextResponse } from 'next/server';
import { database } from '@/lib/database';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const db = database();
  try {
    const { id } = await context.params;
    // Get all WBS rows for the project, ordered by the original Excel row index if possible 
    // or by wbs_id to maintain hierarchy
    const rows = db.prepare('SELECT * FROM wbs_rows WHERE project_id = ? ORDER BY id ASC').all(id);
    
    // Parse the raw_data JSON for each row so the frontend can use the properties directly
    const parsedRows = rows.map((row: any) => ({
      ...row,
      raw_data: JSON.parse(row.raw_data)
    }));

    return NextResponse.json(parsedRows);
  } catch (error: any) {
    console.error('Error fetching BOM data:', error);
    return NextResponse.json({ error: 'Failed to fetch BOM data', details: error.message }, { status: 500 });
  }
}
