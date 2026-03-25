import { NextResponse } from "next/server";
import {
  createProject,
  getProjects,
  getReferenceData,
} from "@/lib/database";

export const runtime = "nodejs";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function GET() {
  try {
    return NextResponse.json({
      projects: getProjects(),
      reference: getReferenceData(),
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
        details: errorMessage(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dueDate = String(
      body.due_date ??
        body.dueDate ??
        new Date().toISOString().slice(0, 10),
    );
    const projectedEndDate = String(
      body.projected_end_date ?? body.projectedEndDate ?? dueDate,
    );
    const name = String(body.name ?? "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 },
      );
    }

    const project = createProject({
      code: String(body.code ?? body.project_id ?? `P-${Date.now()}`),
      name,
      manager: String(body.manager ?? "Unassigned"),
      division: String(body.division ?? "DEFAULT"),
      client_name: String(
        body.client_name ?? body.clientName ?? "Unknown Client",
      ),
      due_date: dueDate,
      projected_end_date: projectedEndDate,
      notes: body.notes ? String(body.notes) : undefined,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      {
        error: "Failed to create project",
        details: errorMessage(error),
      },
      { status: 500 },
    );
  }
}
