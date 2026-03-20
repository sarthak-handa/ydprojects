import { NextResponse } from "next/server";
import { importWorkbookData } from "@/lib/database";
import { parseProjectWorkbook } from "@/lib/excel";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const payload = parseProjectWorkbook(buffer);
  const project = importWorkbookData(payload);

  return NextResponse.json({ project });
}
