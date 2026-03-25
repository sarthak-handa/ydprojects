import { NextResponse } from "next/server";
import { database, getProjectById, getReferenceData } from "@/lib/database";

export const runtime = "nodejs";

type WbsStatsRow = {
  assemblies_count: number;
  subassemblies_count: number;
  components_count: number;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const project = getProjectById(Number(id));

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const wbsStats = database()
      .prepare(`
        SELECT
          COUNT(CASE WHEN type = 'Subtask' THEN 1 END) as assemblies_count,
          COUNT(CASE WHEN type = 'step' THEN 1 END) as subassemblies_count,
          COUNT(CASE WHEN type = 'date' THEN 1 END) as components_count
        FROM wbs_rows
        WHERE project_id = ?
      `)
      .get(String(id)) as WbsStatsRow;

    return NextResponse.json({
      project,
      reference: getReferenceData(),
      wbsStats,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch project",
        details: errorMessage(error),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    database().prepare("DELETE FROM projects WHERE id = ?").run(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      {
        error: "Failed to delete project",
        details: errorMessage(error),
      },
      { status: 500 },
    );
  }
}
