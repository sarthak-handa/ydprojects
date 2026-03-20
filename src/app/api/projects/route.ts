import { NextResponse } from "next/server";
import { createProject, getProjects, getReferenceData } from "@/lib/database";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    projects: getProjects(),
    reference: getReferenceData(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const project = createProject({
    code: String(body.code),
    name: String(body.name),
    manager: String(body.manager),
    division: body.division ? String(body.division) : "DEFAULT",
    client_name: body.clientName ? String(body.clientName) : "Unknown Client",
    due_date: String(body.dueDate),
    projected_end_date: String(body.projectedEndDate),
    notes: body.notes ? String(body.notes) : undefined,
  });

  return NextResponse.json({ project }, { status: 201 });
}
