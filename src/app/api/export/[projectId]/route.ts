import { NextResponse } from "next/server";
import { createProjectWorkbook } from "@/lib/excel";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await context.params;
  const workbook = createProjectWorkbook(Number(projectId));

  return new NextResponse(workbook, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="project-${projectId}.xlsx"`,
    },
  });
}
