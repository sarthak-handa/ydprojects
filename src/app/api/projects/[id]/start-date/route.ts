import { NextRequest, NextResponse } from "next/server";
import { updateProjectStartDate } from "@/lib/database";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { startDate } = await req.json();

    const result = updateProjectStartDate(Number(id), startDate);
    
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
