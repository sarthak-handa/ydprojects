import { NextResponse } from "next/server";
import { createPayment, getPayments } from "@/lib/database";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  return NextResponse.json(getPayments(projectId ? Number(projectId) : undefined));
}

export async function POST(request: Request) {
  const body = await request.json();
  const payment = createPayment({
    projectId: Number(body.projectId),
    vendorName: String(body.vendorName),
    poNumber: String(body.poNumber),
    invoiceNumber: String(body.invoiceNumber),
    amount: Number(body.amount),
    paidAmount: Number(body.paidAmount ?? 0),
    status: body.status,
    dueDate: String(body.dueDate),
    approvalState: String(body.approvalState ?? "Pending PM"),
  });

  return NextResponse.json({ payment }, { status: 201 });
}
