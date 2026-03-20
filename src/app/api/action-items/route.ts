import { NextResponse } from "next/server";
import { createActionItem, getActionItems } from "@/lib/database";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  return NextResponse.json({
    actionItems: getActionItems(projectId ? Number(projectId) : undefined),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const actionItem = createActionItem({
    projectId: Number(body.projectId),
    title: String(body.title),
    owner: String(body.owner),
    source: String(body.source),
    dueDate: String(body.dueDate),
    status: String(body.status),
    notes: body.notes ? String(body.notes) : undefined,
  });

  return NextResponse.json({ actionItem }, { status: 201 });
}
