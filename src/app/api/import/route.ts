import { NextRequest, NextResponse } from 'next/server';
import { database } from '@/lib/database';
import * as xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const db = database();
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: 'No project ID provided' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Read the workbook
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    
    // Usually the first sheet contains the WBS data
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    
    // Parse to JSON matching headers
    // Note: Streamliner Excel files have specific headers (Task ID, Name, Type, Index, etc)
    const data: any[] = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    // Begin a database transaction to ensure atomicity
    const insertTransaction = db.transaction((rows: any[], pid: string) => {
      // First, clear existing WBS rows for this project if overwriting
      db.prepare('DELETE FROM wbs_rows WHERE project_id = ?').run(pid);

      const insertStmt = db.prepare(`
        INSERT INTO wbs_rows (
          id, project_id, wbs_id, task_id, name, type, duration, status,
          predecessor, successor, ready, planned_start, planned_end,
          act_start, act_end, sugg_start, sugg_end, manager, department, raw_data
        ) VALUES (
          @id, @project_id, @wbs_id, @task_id, @name, @type, @duration, @status,
          @predecessor, @successor, @ready, @planned_start, @planned_end,
          @act_start, @act_end, @sugg_start, @sugg_end, @manager, @department, @raw_data
        )
      `);

      for (const row of rows) {
        // 'ID' in the Excel file is the hierarchical index like 1, 1.1, 1.1.1. 
        // We map it to 'wbs_id'
        const wbsIdStr = String(row['ID'] || '');
        
        // Skip rows that don't look like WBS items
        if (!wbsIdStr) continue;

        const rowData = {
          id: uuidv4(),
          project_id: pid,
          wbs_id: wbsIdStr,
          task_id: String(row['Task ID'] || ''),
          name: String(row['Name'] || ''),
          type: String(row['Type'] || ''),
          duration: String(row['Duration'] || ''),
          status: String(row['Status'] || ''),
          predecessor: String(row['Predecessor'] || ''),
          successor: String(row['Successor'] || ''),
          ready: String(row['Ready'] || ''),
          planned_start: String(row['Planned Start'] || ''),
          planned_end: String(row['Planned End'] || ''),
          act_start: String(row['Act Start'] || ''),
          act_end: String(row['Act End'] || ''),
          sugg_start: String(row['Sugg.Start'] || ''),
          sugg_end: String(row['Sugg.End'] || ''),
          manager: String(row['Manager'] || ''),
          department: String(row['Department'] || ''),
          // Store all original data as stringified JSON to prevent data loss
          raw_data: JSON.stringify(row)
        };

        insertStmt.run(rowData);
      }
    });

    // Execute the transaction
    insertTransaction(data, projectId);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully imported ${data.length} rows to project ${projectId}` 
    });

  } catch (error: any) {
    console.error('Import Error:', error);
    return NextResponse.json({ error: 'Failed to import Excel file', details: error.message }, { status: 500 });
  }
}
