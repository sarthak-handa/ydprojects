import { NextResponse } from 'next/server';
import { database } from '@/lib/database';
import * as xlsx from 'xlsx';

type ProjectNameRow = {
  name: string;
};

type StoredWbsRow = Record<string, unknown> & {
  raw_data: string;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const db = database();
  try {
    const { id } = await context.params;
    const projectId = id;
    
    // Verify project exists
    const project = db.prepare('SELECT name FROM projects WHERE id = ?').get(projectId) as ProjectNameRow | undefined;
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get all WBS rows
    const rows = db.prepare('SELECT * FROM wbs_rows WHERE project_id = ? ORDER BY id ASC').all(projectId) as StoredWbsRow[];
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 404 });
    }

    // Extract the raw_data which retains the original 82 columns
    const excelData = rows.map((row) => JSON.parse(row.raw_data) as Record<string, unknown>);

    // Create a new workbook
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(excelData);
    
    // Add the worksheet to the workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Planning');

    // Write workbook to buffer
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return the file as an attachment
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${project.name.replace(/[^a-zA-Z0-9 -]/g, '')}_Export.xlsx"`);
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    return new NextResponse(buffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Failed to export Excel file', details: errorMessage(error) }, { status: 500 });
  }
}
