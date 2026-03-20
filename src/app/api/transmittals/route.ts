import { NextResponse } from "next/server";
import { createTransmittal, getTransmittals } from "@/lib/database";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  return NextResponse.json({
    transmittals: getTransmittals(projectId ? Number(projectId) : undefined),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const transmittal = createTransmittal({
    projectId: Number(body.projectId),
    transmittalNo: String(body.transmittalNo),
    recipient: String(body.recipient),
    documentCount: Number(body.documentCount),
    sentDate: String(body.sentDate),
    status: String(body.status),
    remarks: body.remarks ? String(body.remarks) : undefined,
  });

  return NextResponse.json({ transmittal }, { status: 201 });
}
