import * as XLSX from "xlsx";
import {
  getPayments,
  getProjectBom,
  getProjectById,
  getPlanningMatrix,
} from "@/lib/database";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PROJECT_PHASES,
  RED_FLAG_PRIORITIES,
  RED_FLAG_STATUSES,
  type OrderStatus,
  type PaymentStatus,
  type ProjectPhase,
  type RedFlagPriority,
  type RedFlagStatus,
} from "@/lib/project-data";

function asPhase(value: string): ProjectPhase {
  return (PROJECT_PHASES as readonly string[]).includes(value)
    ? (value as ProjectPhase)
    : "Engineering";
}

function asOrderStatus(value: string): OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value)
    ? (value as OrderStatus)
    : "Pending";
}

function asPaymentStatus(value: string): PaymentStatus {
  return (PAYMENT_STATUSES as readonly string[]).includes(value)
    ? (value as PaymentStatus)
    : "Due";
}

function asPriority(value: string): RedFlagPriority {
  return (RED_FLAG_PRIORITIES as readonly string[]).includes(value)
    ? (value as RedFlagPriority)
    : "Medium";
}

function asRedFlagStatus(value: string): RedFlagStatus {
  return (RED_FLAG_STATUSES as readonly string[]).includes(value)
    ? (value as RedFlagStatus)
    : "Open";
}

function toSheetRows(projectId: number) {
  const project = getProjectById(projectId) as Record<string, unknown> | undefined;
  if (!project) {
    throw new Error("Project not found");
  }

  const bom = getProjectBom(projectId) as Array<Record<string, unknown>>;
  const payments = getPayments(projectId) as {
    rows: Array<Record<string, unknown>>;
  };
  const planning = getPlanningMatrix(projectId);

  return {
    summary: [
      {
        ProjectCode: project.code,
        ProjectName: project.name,
        Manager: project.manager,
        Division: project.division,
        DueDate: project.due_date,
        ProjectedEndDate: project.projected_end_date,
        BOMValue: project.bom_value,
        Components: project.component_count,
        ActiveRedFlags: project.active_red_flags,
      },
    ],
    bom: bom.map((row) => ({
      Category: row.category_name,
      Assembly: row.assembly_name,
      Subassembly: row.subassembly_name,
      Component: row.name,
      DrawingNumber: row.drawing_number,
      Quantity: row.quantity,
      Material: row.material,
      Weight: row.weight,
      VendorName: row.vendor_name,
      PONumber: row.po_number,
      UnitPrice: row.unit_price,
      TotalPrice: row.total_price,
      OrderStatus: row.order_status,
      OrderDate: row.order_date,
      ExpectedArrival: row.expected_arrival,
      ArrivalDate: row.arrival_date,
      DispatchDate: row.dispatch_date,
    })),
    payments: payments.rows.map((row) => ({
      VendorName: row.vendor_name,
      PONumber: row.po_number,
      InvoiceNumber: row.invoice_number,
      Amount: row.amount,
      PaidAmount: row.paid_amount,
      Status: row.status,
      DueDate: row.due_date,
      ApprovalState: row.approval_state,
    })),
    planning: planning.flatMap((category) =>
      category.phases.map((phase) => ({
        Category: category.category,
        Phase: phase.phase,
        Assemblies: phase.assemblies.map((assembly) => assembly.name).join(", "),
        Completion: phase.assemblies.length
          ? Math.round(
              phase.assemblies.reduce(
                (total, assembly) => total + assembly.completion_percent,
                0,
              ) / phase.assemblies.length,
            )
          : 0,
      })),
    ),
  };
}

export function createProjectWorkbook(projectId: number) {
  const rows = toSheetRows(projectId);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows.summary), "Summary");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows.bom), "BOM");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows.payments), "Payments");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows.planning), "Planning");
  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
}

export function parseProjectWorkbook(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const summary = XLSX.utils.sheet_to_json<Record<string, string | number>>(workbook.Sheets.Summary);
  const bom = XLSX.utils.sheet_to_json<Record<string, string | number>>(workbook.Sheets.BOM);
  const payments = XLSX.utils.sheet_to_json<Record<string, string | number>>(workbook.Sheets.Payments);
  const redFlags = workbook.Sheets["Red Flags"]
    ? XLSX.utils.sheet_to_json<Record<string, string | number>>(workbook.Sheets["Red Flags"])
    : [];

  const projectRow = summary[0];
  if (!projectRow) {
    throw new Error("Summary sheet is required");
  }

  return {
    project: {
      code: String(projectRow.ProjectCode ?? ""),
      name: String(projectRow.ProjectName ?? ""),
      manager: String(projectRow.Manager ?? ""),
      division: String(projectRow.Division ?? "DEFAULT"),
      clientName: String(projectRow.ClientName ?? "Imported Client"),
      dueDate: String(projectRow.DueDate ?? ""),
      projectedEndDate: String(projectRow.ProjectedEndDate ?? ""),
      notes: "Imported from workbook",
    },
    bom: bom.map((row) => ({
      category: String(row.Category ?? "Category 1"),
      assembly: String(row.Assembly ?? "Imported Assembly"),
      subassembly: String(row.Subassembly ?? "Imported Subassembly"),
      component: String(row.Component ?? "Imported Component"),
      drawingNumber: String(row.DrawingNumber ?? ""),
      quantity: Number(row.Quantity ?? 0),
      material: String(row.Material ?? "NA"),
      weight: Number(row.Weight ?? 0),
      vendorName: String(row.VendorName ?? "Unassigned"),
      poNumber: String(row.PONumber ?? "TBD"),
      unitPrice: Number(row.UnitPrice ?? 0),
      orderStatus: asOrderStatus(String(row.OrderStatus ?? "Pending")),
      phase: asPhase(String(row.Phase ?? "Engineering")),
      orderDate: row.OrderDate ? String(row.OrderDate) : null,
      expectedArrival: row.ExpectedArrival ? String(row.ExpectedArrival) : null,
      arrivalDate: row.ArrivalDate ? String(row.ArrivalDate) : null,
      dispatchDate: row.DispatchDate ? String(row.DispatchDate) : null,
    })),
    payments: payments.map((row) => ({
      vendorName: String(row.VendorName ?? ""),
      poNumber: String(row.PONumber ?? ""),
      invoiceNumber: String(row.InvoiceNumber ?? ""),
      amount: Number(row.Amount ?? 0),
      paidAmount: Number(row.PaidAmount ?? 0),
      status: asPaymentStatus(String(row.Status ?? "Due")),
      dueDate: String(row.DueDate ?? ""),
      approvalState: String(row.ApprovalState ?? "Pending PM"),
    })),
    redFlags: redFlags.map((row) => ({
      title: String(row.Title ?? ""),
      description: String(row.Description ?? ""),
      priority: asPriority(String(row.Priority ?? "Medium")),
      raisedBy: String(row.RaisedBy ?? "Imported"),
      assignedTo: String(row.AssignedTo ?? "TBD"),
      dueDate: String(row.DueDate ?? ""),
      status: asRedFlagStatus(String(row.Status ?? "Open")),
    })),
  };
}
