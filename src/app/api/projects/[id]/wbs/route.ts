import { NextResponse } from "next/server";
import { database } from "@/lib/database";

export const runtime = "nodejs";

type StoredWbsRow = Record<string, unknown> & {
  raw_data: string;
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
    const rows = database()
      .prepare("SELECT * FROM wbs_rows WHERE project_id = ? ORDER BY id ASC")
      .all(String(id)) as StoredWbsRow[];

    return NextResponse.json({
      rows: rows.map((row) => ({
        ...row,
        raw_data: JSON.parse(row.raw_data) as Record<string, unknown>,
      })),
    });
  } catch (error) {
    console.error("Error fetching WBS data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch WBS data",
        details: errorMessage(error),
      },
      { status: 500 },
    );
  }
}
