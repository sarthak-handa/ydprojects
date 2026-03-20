import { NextResponse } from "next/server";
import { getProjectBom, upsertBomComponent } from "@/lib/database";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return NextResponse.json({
    bom: getProjectBom(Number(id)),
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json();
  const component = upsertBomComponent(Number(id), {
    id: body.id ? Number(body.id) : undefined,
    assemblyId: Number(body.assemblyId),
    subassemblyId: Number(body.subassemblyId),
    name: String(body.name),
    drawingNumber: String(body.drawingNumber),
    quantity: Number(body.quantity),
    material: String(body.material),
    weight: Number(body.weight),
    vendorName: String(body.vendorName),
    poNumber: String(body.poNumber),
    unitPrice: Number(body.unitPrice),
    orderStatus: body.orderStatus,
    orderDate: body.orderDate ?? null,
    expectedArrival: body.expectedArrival ?? null,
    arrivalDate: body.arrivalDate ?? null,
    dispatchDate: body.dispatchDate ?? null,
  });

  return NextResponse.json({ component }, { status: 201 });
}
