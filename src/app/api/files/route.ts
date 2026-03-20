import { NextResponse } from "next/server";
import { createFileDocument, getFileDocuments } from "@/lib/database";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  return NextResponse.json({
    files: getFileDocuments(projectId ? Number(projectId) : undefined),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const fileDocument = createFileDocument({
    projectId: Number(body.projectId),
    folderName: String(body.folderName),
    fileName: String(body.fileName),
    documentType: String(body.documentType),
    revision: String(body.revision),
    owner: String(body.owner),
    status: String(body.status),
    updatedAt: String(body.updatedAt),
  });

  return NextResponse.json({ fileDocument }, { status: 201 });
}
