import { NextResponse } from "next/server";
import { getOrders, upsertBomComponent } from "@/lib/database";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  return NextResponse.json({
    orders: getOrders(projectId ? Number(projectId) : undefined),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const component = upsertBomComponent(Number(body.projectId), {
    id: Number(body.id),
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

  return NextResponse.json({ component });
}
