import { NextResponse } from "next/server";
import {
  createAssemblyItem,
  getProjectAssemblies,
  moveAssemblyPhase,
} from "@/lib/database";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return NextResponse.json({
    assemblies: getProjectAssemblies(Number(id)),
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const body = await request.json();
  if (body.action === "move-phase") {
    moveAssemblyPhase(Number(body.assemblyId), body.plannedPhase);
    return NextResponse.json({ ok: true });
  }

  const created = createAssemblyItem(Number(id), {
    type: body.type,
    categoryName: body.categoryName,
    assemblyId: body.assemblyId ? Number(body.assemblyId) : undefined,
    subassemblyId: body.subassemblyId ? Number(body.subassemblyId) : undefined,
    name: String(body.name),
    drawingNumber: body.drawingNumber,
    plannedPhase: body.plannedPhase,
    quantity: body.quantity ? Number(body.quantity) : undefined,
    material: body.material,
    weight: body.weight ? Number(body.weight) : undefined,
    vendorName: body.vendorName,
    poNumber: body.poNumber,
    unitPrice: body.unitPrice ? Number(body.unitPrice) : undefined,
    orderStatus: body.orderStatus,
    orderDate: body.orderDate ?? null,
    expectedArrival: body.expectedArrival ?? null,
    arrivalDate: body.arrivalDate ?? null,
    dispatchDate: body.dispatchDate ?? null,
  });

  return NextResponse.json({ created }, { status: 201 });
}
