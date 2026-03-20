import { NextResponse } from "next/server";
import { createRedFlag, getRedFlags } from "@/lib/database";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  return NextResponse.json({
    redFlags: getRedFlags(projectId ? Number(projectId) : undefined),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const redFlag = createRedFlag({
    projectId: Number(body.projectId),
    assemblyId: body.assemblyId ? Number(body.assemblyId) : null,
    title: String(body.title),
    description: String(body.description),
    priority: body.priority,
    raisedBy: String(body.raisedBy),
    assignedTo: String(body.assignedTo),
    dueDate: String(body.dueDate),
    status: body.status,
  });

  return NextResponse.json({ redFlag }, { status: 201 });
}
