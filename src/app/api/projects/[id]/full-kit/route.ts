import { NextResponse } from "next/server";
import { getFullKitStatus } from "@/lib/database";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return NextResponse.json({
    fullKit: getFullKitStatus(Number(id)),
  });
}
