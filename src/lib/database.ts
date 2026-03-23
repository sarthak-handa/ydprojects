import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PROJECT_CATEGORIES,
  PROJECT_PHASES,
  RED_FLAG_PRIORITIES,
  RED_FLAG_STATUSES,
  type OrderStatus,
  type PaymentStatus,
  type ProjectPhase,
  type RedFlagPriority,
  type RedFlagStatus,
} from "@/lib/project-data";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_PATH = path.join(DATA_DIR, "streamliner_v3.sqlite");

type IdRow = { id: number };

let dbInstance: Database.Database | null = null;

function tableHasColumn(db: Database.Database, tableName: string, columnName: string) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{
    name: string;
  }>;
  return columns.some((column) => column.name === columnName);
}

function runMigrations(db: Database.Database) {
  if (!tableHasColumn(db, "transmittals", "remarks")) {
    db.exec("ALTER TABLE transmittals ADD COLUMN remarks TEXT");
  }
}

function ensureDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      manager TEXT NOT NULL,
      division TEXT NOT NULL,
      client_name TEXT NOT NULL,
      due_date TEXT NOT NULL,
      projected_end_date TEXT NOT NULL,
      notes TEXT,
      /* Phase 3.1: Check-out logic */
      checkout_by TEXT,
      checkout_at DATETIME,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS assemblies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      drawing_number TEXT NOT NULL,
      planned_phase TEXT NOT NULL,
      completion_percent REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS subassemblies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assembly_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (assembly_id) REFERENCES assemblies(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS components (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      assembly_id INTEGER NOT NULL,
      subassembly_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      drawing_number TEXT NOT NULL,
      quantity REAL NOT NULL,
      material TEXT NOT NULL,
      weight REAL NOT NULL,
      vendor_name TEXT NOT NULL,
      po_number TEXT NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL,
      order_status TEXT NOT NULL,
      order_date TEXT,
      expected_arrival TEXT,
      arrival_date TEXT,
      dispatch_date TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (assembly_id) REFERENCES assemblies(id) ON DELETE CASCADE,
      FOREIGN KEY (subassembly_id) REFERENCES subassemblies(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      vendor_name TEXT NOT NULL,
      po_number TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      amount REAL NOT NULL,
      paid_amount REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      due_date TEXT NOT NULL,
      approval_state TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS red_flags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      assembly_id INTEGER,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL,
      raised_by TEXT NOT NULL,
      assigned_to TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (assembly_id) REFERENCES assemblies(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS action_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      owner TEXT NOT NULL,
      source TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS file_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      folder_name TEXT NOT NULL,
      file_name TEXT NOT NULL,
      document_type TEXT NOT NULL,
      revision TEXT NOT NULL,
      owner TEXT NOT NULL,
      status TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS transmittals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      transmittal_no TEXT NOT NULL,
      recipient TEXT NOT NULL,
      document_count INTEGER NOT NULL,
      sent_date TEXT NOT NULL,
      status TEXT NOT NULL,
      remarks TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS wbs_rows (
      id TEXT PRIMARY KEY, /* UUID */
      project_id TEXT NOT NULL, /* FK to projects.id currently integers but stored as text */
      wbs_id TEXT NOT NULL,
      task_id TEXT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      duration TEXT,
      status TEXT,
      predecessor TEXT,
      successor TEXT,
      ready TEXT,
      planned_start TEXT,
      planned_end TEXT,
      act_start TEXT,
      act_end TEXT,
      sugg_start TEXT,
      sugg_end TEXT,
      manager TEXT,
      department TEXT,
      raw_data TEXT NOT NULL, /* Full 82-column original data JSON */
      
      /* Phase 3.1: High-Fidelity Fields */
      contractor TEXT,
      score REAL,
      resource TEXT,
      material_rule TEXT,
      cost_rule TEXT,
      revenue_rule TEXT,
      volume REAL,
      work_area TEXT,
      ready_for_po TEXT, /* Phase columns */
      ready_for_assembly TEXT,
      
      make_buy TEXT DEFAULT 'Buy',
      plant_allocation TEXT,
      target_month TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS yard_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      po_number TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      expected_arrival_date TEXT NOT NULL,
      slot_time TEXT,
      status TEXT DEFAULT 'Scheduled',
      dock_number TEXT,
      vehicle_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  runMigrations(db);
  seedDatabase(db);
  dbInstance = db;
  return db;
}

function seedDatabase(db: Database.Database) {
  const existing = db.prepare("SELECT COUNT(*) as count FROM projects").get() as {
    count: number;
  };

  if (existing.count > 0) {
    return;
  }

  const insertProject = db.prepare(`
    INSERT INTO projects (code, name, manager, division, client_name, due_date, projected_end_date, notes)
    VALUES (@code, @name, @manager, @division, @client_name, @due_date, @projected_end_date, @notes)
  `);
  const insertCategory = db.prepare("INSERT INTO categories (project_id, name, sort_order) VALUES (?, ?, ?)");
  const insertAssembly = db.prepare(`
    INSERT INTO assemblies (project_id, category_id, name, drawing_number, planned_phase, completion_percent)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertSubassembly = db.prepare("INSERT INTO subassemblies (assembly_id, name) VALUES (?, ?)");
  const insertComponent = db.prepare(`
    INSERT INTO components (
      project_id, assembly_id, subassembly_id, name, drawing_number, quantity, material,
      weight, vendor_name, po_number, unit_price, total_price, order_status, order_date,
      expected_arrival, arrival_date, dispatch_date
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertPayment = db.prepare(`
    INSERT INTO payments (
      project_id, vendor_name, po_number, invoice_number, amount, paid_amount, status, due_date, approval_state
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertFlag = db.prepare(`
    INSERT INTO red_flags (
      project_id, assembly_id, title, description, priority, raised_by, assigned_to, due_date, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertActionItem = db.prepare(`
    INSERT INTO action_items (project_id, title, owner, source, due_date, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertFile = db.prepare(`
    INSERT INTO file_documents (project_id, folder_name, file_name, document_type, revision, owner, status, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertTransmittal = db.prepare(`
    INSERT INTO transmittals (project_id, transmittal_no, recipient, document_count, sent_date, status, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertWBS = db.prepare(`
    INSERT INTO wbs_rows (
      id, project_id, wbs_id, task_id, name, type, duration, status, 
      planned_start, planned_end, manager, raw_data, 
      make_buy, plant_allocation, ready_for_po, ready_for_assembly
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seed = db.transaction(() => {
    const projectA = insertProject.run({
      code: "YD-2601",
      name: "Yogiji Cut-To-Length Line",
      manager: "Aditya Saini",
      division: "DEFAULT",
      client_name: "JSW Steel",
      due_date: "2026-08-30",
      projected_end_date: "2026-09-12",
      notes: "Seeded project for BOM, orders, payments, and planning flows.",
    }).lastInsertRowid as number;

    const projectB = insertProject.run({
      code: "YD-2602",
      name: "High Speed Recoiler Upgrade",
      manager: "Om Dev",
      division: "AUTOMATION",
      client_name: "Tata Steel",
      due_date: "2026-10-15",
      projected_end_date: "2026-10-28",
      notes: "Secondary seeded project for cross-project dashboards.",
    }).lastInsertRowid as number;

    const categoryIds = new Map<string, number>();
    PROJECT_CATEGORIES.forEach((category, index) => {
      categoryIds.set(category, insertCategory.run(projectA, category, index + 1).lastInsertRowid as number);
      insertCategory.run(projectB, category, index + 1);
    });

    const assemblyA1 = insertAssembly.run(projectA, categoryIds.get("Category 1"), "Uncoiler Assembly", "ASM-UC-101", "Engineering", 75).lastInsertRowid as number;
    const assemblyA2 = insertAssembly.run(projectA, categoryIds.get("Category 2"), "Leveller Stand", "ASM-LV-210", "Ordering & Manufacturing", 58).lastInsertRowid as number;
    const assemblyA3 = insertAssembly.run(projectA, categoryIds.get("Category 4"), "Recoiler Assembly", "ASM-RC-302", "Assembly", 91).lastInsertRowid as number;
    const subA11 = insertSubassembly.run(assemblyA1, "Drive Train").lastInsertRowid as number;
    const subA12 = insertSubassembly.run(assemblyA1, "Base Frame").lastInsertRowid as number;
    const subA21 = insertSubassembly.run(assemblyA2, "Hydraulic Set").lastInsertRowid as number;
    const subA31 = insertSubassembly.run(assemblyA3, "Coil Car Interface").lastInsertRowid as number;

    [
      [projectA, assemblyA1, subA11, "Gear Box", "DRG-UC-001", 1, "EN24", 168, "Atlas Drives", "PO-UC-001", 225000, 225000, "Arrived", "2026-02-10", "2026-03-05", "2026-03-02", null],
      [projectA, assemblyA1, subA11, "Drive Shaft", "DRG-UC-002", 2, "EN8", 42, "Atlas Drives", "PO-UC-001", 32000, 64000, "Arrived", "2026-02-10", "2026-03-05", "2026-03-03", null],
      [projectA, assemblyA1, subA12, "Base Plate", "DRG-UC-010", 4, "IS2062", 210, "Mahalaxmi Steel", "PO-UC-007", 18000, 72000, "Ordered", "2026-03-01", "2026-03-24", null, null],
      [projectA, assemblyA2, subA21, "Hydraulic Power Pack", "DRG-LV-021", 1, "OEM", 130, "Flotek Systems", "PO-LV-003", 185000, 185000, "In Transit", "2026-03-04", "2026-03-18", null, null],
      [projectA, assemblyA2, subA21, "Pressure Hose Set", "DRG-LV-022", 6, "Rubber", 12, "Flotek Systems", "PO-LV-003", 4500, 27000, "Ordered", "2026-03-04", "2026-03-22", null, null],
      [projectA, assemblyA3, subA31, "Bearing Cartridge", "DRG-RC-012", 2, "Alloy Steel", 26, "SKF India", "PO-RC-009", 36500, 73000, "Dispatched", "2026-01-22", "2026-02-08", "2026-02-05", "2026-03-16"],
      [projectA, assemblyA3, subA31, "Safety Guard", "DRG-RC-018", 2, "SS304", 18, "Prime Fab", "PO-RC-014", 12500, 25000, "Pending", null, null, null, null],
    ].forEach((component) => insertComponent.run(...component));

    insertPayment.run(projectA, "Atlas Drives", "PO-UC-001", "INV-AD-44", 289000, 289000, "Paid", "2026-03-08", "Approved");
    insertPayment.run(projectA, "Flotek Systems", "PO-LV-003", "INV-FL-19", 212000, 100000, "Partial", "2026-03-28", "Awaiting CFO");
    insertPayment.run(projectA, "Prime Fab", "PO-RC-014", "INV-PF-07", 25000, 0, "Due", "2026-04-02", "Pending PM");
    insertFlag.run(projectA, assemblyA2, "Hydraulic pack delay", "Vendor pushed delivery by four days; impacts leveller trial fitment.", "High", "Procurement", "Om Dev", "2026-03-23", "Open");
    insertFlag.run(projectA, assemblyA3, "Safety guard pending release", "Drawing approval is pending from engineering; dispatch cannot close.", "Critical", "Engineering", "Aditya Saini", "2026-03-21", "In Progress");
    insertActionItem.run(projectA, "Close leveller vendor slippage", "Om Dev", "Review Meeting", "2026-03-24", "Open", "Escalate delivery and update readiness.");
    insertActionItem.run(projectA, "Approve recoiler safety guard drawing", "Aditya Saini", "Engineering Review", "2026-03-21", "In Progress", "Needed before final dispatch.");
    insertFile.run(projectA, "Engineering", "GA-Uncoiler.pdf", "Drawing", "R3", "Aditya Saini", "Released", "2026-03-18");
    insertFile.run(projectA, "Procurement", "PO-UC-001.xlsx", "Purchase Order", "R1", "Procurement", "Shared", "2026-03-15");
    insertFile.run(projectA, "Quality", "Inspection-Report-LV.docx", "Report", "R0", "QA Team", "Draft", "2026-03-19");
    insertTransmittal.run(projectA, "TR-2601-01", "JSW Steel", 4, "2026-03-18", "Sent", "GA drawings and BOM summary shared.");

    /* Phase 3.1: Seed Hierarchical WBS Rows for PERT Board */
    const wbsData = [
      ["wbs-1", projectA, "1", "CAT-1", "Category 1 - Engineering", "Category", "60d", "In Progress", "2026-01-01", "2026-03-01", "Aditya Saini", "{}", "Make", "Plant 1", "10d", "50d"],
      ["wbs-2", projectA, "1.1", "ASM-101", "Uncoiler Shell Fabrication", "Assembly", "25d", "In Progress", "2026-01-10", "2026-02-05", "Aditya Saini", "{}", "Make", "Plant 1", "5d", "20d"],
      ["wbs-3", projectA, "1.1.1", "COMP-101", "Main Mandrel Shaft", "Component", "12d", "Completed", "2026-01-12", "2026-01-24", "Om Dev", "{}", "Buy", "Plant 1", "2d", "10d"],
      ["wbs-4", projectA, "1.1.2", "COMP-102", "Bearing Housing", "Component", "15d", "Ordered", "2026-01-15", "2026-01-30", "Om Dev", "{}", "Buy", "Plant 1", "3d", "12d"],
      ["wbs-5", projectA, "1.2", "ASM-102", "Drive Train Assembly", "Assembly", "30d", "Pending", "2026-02-10", "2026-03-12", "Aditya Saini", "{}", "Buy", "Plant 2", "10d", "20d"],
    ];
    wbsData.forEach(row => insertWBS.run(...row));

    const categoryB = db.prepare("SELECT id, name FROM categories WHERE project_id = ?").all(projectB) as Array<{ id: number; name: string }>;
    const catMapB = new Map(categoryB.map((row) => [row.name, row.id]));
    const assemblyB1 = insertAssembly.run(projectB, catMapB.get("Category 1"), "Main Recoiler", "ASM-B-100", "Engineering", 42).lastInsertRowid as number;
    const subB1 = insertSubassembly.run(assemblyB1, "Roll Housing").lastInsertRowid as number;
    insertComponent.run(projectB, assemblyB1, subB1, "Roll Housing Plate", "DRG-B-101", 2, "IS2062", 88, "Prime Fab", "PO-B-001", 21000, 42000, "Ordered", "2026-03-06", "2026-03-25", null, null);
    insertPayment.run(projectB, "Prime Fab", "PO-B-001", "INV-B-01", 42000, 0, "Due", "2026-03-31", "Pending PM");
    insertActionItem.run(projectB, "Issue vendor PO release", "Om Dev", "Kickoff", "2026-03-28", "Open", "Needed to hold engineering dates.");
    insertFile.run(projectB, "Engineering", "Recoiler-Layout.pdf", "Drawing", "R1", "Om Dev", "Released", "2026-03-17");
    insertTransmittal.run(projectB, "TR-2602-01", "Tata Steel", 2, "2026-03-20", "Pending Ack", "Initial layout package.");
  });

  seed();
}

export function database() {
  return ensureDatabase();
}

function projectSummarySql() {
  return `
    SELECT
      p.*,
      COUNT(DISTINCT a.id) AS assembly_count,
      COUNT(DISTINCT s.id) AS subassembly_count,
      COUNT(DISTINCT c.id) AS component_count,
      COALESCE(SUM(c.total_price), 0) AS bom_value,
      COALESCE(SUM(CASE WHEN c.order_status IN ('Arrived', 'Dispatched') THEN 1 ELSE 0 END), 0) AS arrived_components,
      COALESCE(SUM(CASE WHEN rf.status != 'Resolved' THEN 1 ELSE 0 END), 0) AS active_red_flags
    FROM projects p
    LEFT JOIN assemblies a ON a.project_id = p.id
    LEFT JOIN subassemblies s ON s.assembly_id = a.id
    LEFT JOIN components c ON c.assembly_id = a.id
    LEFT JOIN red_flags rf ON rf.project_id = p.id
    GROUP BY p.id
  `;
}

export function getProjects() {
  return database().prepare(projectSummarySql()).all();
}

export function getProjectById(projectId: number) {
  return database()
    .prepare(`${projectSummarySql()} HAVING p.id = ?`)
    .get(projectId);
}

export function createProject(input: {
  code: string;
  name: string;
  manager: string;
  division?: string;
  client_name?: string;
  due_date: string;
  projected_end_date: string;
  notes?: string;
}) {
  const db = database();
  const tx = db.transaction(() => {
    const result = db
      .prepare(`
        INSERT INTO projects (code, name, manager, division, client_name, due_date, projected_end_date, notes)
        VALUES (@code, @name, @manager, @division, @client_name, @due_date, @projected_end_date, @notes)
      `)
      .run({
        division: input.division ?? "DEFAULT",
        client_name: input.client_name ?? "Unknown Client",
        notes: input.notes ?? null,
        ...input,
      });

    PROJECT_CATEGORIES.forEach((category, index) => {
      db.prepare("INSERT INTO categories (project_id, name, sort_order) VALUES (?, ?, ?)")
        .run(result.lastInsertRowid, category, index + 1);
    });

    return result.lastInsertRowid as number;
  });

  const id = tx();
  return getProjectById(id);
}

export function getProjectAssemblies(projectId: number) {
  const db = database();
  const assemblies = db
    .prepare(`
      SELECT
        a.id,
        a.name,
        a.drawing_number,
        a.planned_phase,
        a.completion_percent,
        cat.name AS category_name,
        COUNT(DISTINCT c.id) AS component_count,
        COALESCE(SUM(c.total_price), 0) AS total_cost,
        COALESCE(SUM(CASE WHEN c.order_status IN ('Arrived', 'Dispatched') THEN 1 ELSE 0 END), 0) AS arrived_count
      FROM assemblies a
      INNER JOIN categories cat ON cat.id = a.category_id
      LEFT JOIN components c ON c.assembly_id = a.id
      WHERE a.project_id = ?
      GROUP BY a.id
      ORDER BY cat.sort_order, a.name
    `)
    .all(projectId) as Array<Record<string, unknown>>;

  return assemblies.map((assembly) => {
    const subassemblies = db
      .prepare(`
        SELECT id, name
        FROM subassemblies
        WHERE assembly_id = ?
        ORDER BY name
      `)
      .all(assembly.id as number) as Array<{ id: number; name: string }>;

    const subassemblyData = subassemblies.map((subassembly) => ({
      ...subassembly,
      components: db
        .prepare(`
          SELECT *
          FROM components
          WHERE subassembly_id = ?
          ORDER BY drawing_number
        `)
        .all((subassembly as IdRow).id),
    }));

    return {
      ...assembly,
      full_kit_ready:
        Number(assembly.component_count) > 0 &&
        Number(assembly.arrived_count) === Number(assembly.component_count),
      subassemblies: subassemblyData,
    };
  });
}

export function createAssemblyItem(
  projectId: number,
  input: {
    type: "assembly" | "subassembly" | "component";
    categoryName?: string;
    assemblyId?: number;
    subassemblyId?: number;
    name: string;
    drawingNumber?: string;
    plannedPhase?: ProjectPhase;
    quantity?: number;
    material?: string;
    weight?: number;
    vendorName?: string;
    poNumber?: string;
    unitPrice?: number;
    orderStatus?: OrderStatus;
    orderDate?: string | null;
    expectedArrival?: string | null;
    arrivalDate?: string | null;
    dispatchDate?: string | null;
  },
) {
  const db = database();

  if (input.type === "assembly") {
    const category = db
      .prepare("SELECT id FROM categories WHERE project_id = ? AND name = ?")
      .get(projectId, input.categoryName ?? PROJECT_CATEGORIES[0]) as
      | IdRow
      | undefined;

    if (!category) {
      throw new Error("Category not found");
    }

    const result = db
      .prepare(`
        INSERT INTO assemblies (project_id, category_id, name, drawing_number, planned_phase, completion_percent)
        VALUES (?, ?, ?, ?, ?, 0)
      `)
      .run(
        projectId,
        category.id,
        input.name,
        input.drawingNumber ?? `ASM-${Date.now()}`,
        input.plannedPhase ?? PROJECT_PHASES[0],
      );

    return { id: result.lastInsertRowid };
  }

  if (input.type === "subassembly") {
    const result = db
      .prepare("INSERT INTO subassemblies (assembly_id, name) VALUES (?, ?)")
      .run(input.assemblyId, input.name);

    return { id: result.lastInsertRowid };
  }

  const resolvedAssemblyId =
    input.assemblyId ??
    (
      db
        .prepare("SELECT assembly_id as id FROM subassemblies WHERE id = ?")
        .get(input.subassemblyId) as IdRow | undefined
    )?.id;

  if (!resolvedAssemblyId || !input.subassemblyId) {
    throw new Error("Component creation requires assembly and subassembly");
  }

  const quantity = input.quantity ?? 1;
  const unitPrice = input.unitPrice ?? 0;
  const result = db
    .prepare(`
      INSERT INTO components (
        project_id, assembly_id, subassembly_id, name, drawing_number, quantity, material, weight,
        vendor_name, po_number, unit_price, total_price, order_status, order_date, expected_arrival,
        arrival_date, dispatch_date
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      projectId,
      resolvedAssemblyId,
      input.subassemblyId,
      input.name,
      input.drawingNumber ?? `CMP-${Date.now()}`,
      quantity,
      input.material ?? "NA",
      input.weight ?? 0,
      input.vendorName ?? "Unassigned",
      input.poNumber ?? "TBD",
      unitPrice,
      quantity * unitPrice,
      input.orderStatus ?? "Pending",
      input.orderDate ?? null,
      input.expectedArrival ?? null,
      input.arrivalDate ?? null,
      input.dispatchDate ?? null,
    );

  return { id: result.lastInsertRowid };
}

export function getProjectBom(projectId: number) {
  return database()
    .prepare(`
      SELECT
        c.*,
        a.name AS assembly_name,
        s.name AS subassembly_name,
        cat.name AS category_name
      FROM components c
      INNER JOIN assemblies a ON a.id = c.assembly_id
      INNER JOIN subassemblies s ON s.id = c.subassembly_id
      INNER JOIN categories cat ON cat.id = a.category_id
      WHERE c.project_id = ?
      ORDER BY cat.sort_order, a.name, s.name, c.drawing_number
    `)
    .all(projectId);
}

export function upsertBomComponent(
  projectId: number,
  input: {
    id?: number;
    assemblyId: number;
    subassemblyId: number;
    name: string;
    drawingNumber: string;
    quantity: number;
    material: string;
    weight: number;
    vendorName: string;
    poNumber: string;
    unitPrice: number;
    orderStatus: OrderStatus;
    orderDate?: string | null;
    expectedArrival?: string | null;
    arrivalDate?: string | null;
    dispatchDate?: string | null;
  },
) {
  const db = database();
  const totalPrice = input.quantity * input.unitPrice;

  if (input.id) {
    db.prepare(`
      UPDATE components
      SET
        assembly_id = @assemblyId,
        subassembly_id = @subassemblyId,
        name = @name,
        drawing_number = @drawingNumber,
        quantity = @quantity,
        material = @material,
        weight = @weight,
        vendor_name = @vendorName,
        po_number = @poNumber,
        unit_price = @unitPrice,
        total_price = @totalPrice,
        order_status = @orderStatus,
        order_date = @orderDate,
        expected_arrival = @expectedArrival,
        arrival_date = @arrivalDate,
        dispatch_date = @dispatchDate
      WHERE id = @id AND project_id = @projectId
    `).run({ ...input, totalPrice, projectId });

    return db.prepare("SELECT * FROM components WHERE id = ?").get(input.id);
  }

  const result = db.prepare(`
    INSERT INTO components (
      project_id, assembly_id, subassembly_id, name, drawing_number, quantity, material, weight,
      vendor_name, po_number, unit_price, total_price, order_status, order_date, expected_arrival,
      arrival_date, dispatch_date
    )
    VALUES (@projectId, @assemblyId, @subassemblyId, @name, @drawingNumber, @quantity, @material, @weight,
      @vendorName, @poNumber, @unitPrice, @totalPrice, @orderStatus, @orderDate, @expectedArrival,
      @arrivalDate, @dispatchDate)
  `).run({ ...input, projectId, totalPrice });

  return db.prepare("SELECT * FROM components WHERE id = ?").get(result.lastInsertRowid);
}

export function getOrders(projectId?: number) {
  const filters = projectId ? "WHERE c.project_id = ?" : "";
  return database().prepare(`
    SELECT
      c.id,
      c.project_id,
      p.code AS project_code,
      p.name AS project_name,
      a.name AS assembly_name,
      s.name AS subassembly_name,
      c.name AS component_name,
      c.po_number,
      c.vendor_name,
      c.order_status,
      c.quantity,
      c.total_price,
      c.order_date,
      c.expected_arrival,
      c.arrival_date,
      c.dispatch_date
    FROM components c
    INNER JOIN projects p ON p.id = c.project_id
    INNER JOIN assemblies a ON a.id = c.assembly_id
    INNER JOIN subassemblies s ON s.id = c.subassembly_id
    ${filters}
    ORDER BY
      CASE c.order_status
        WHEN 'Pending' THEN 1
        WHEN 'Ordered' THEN 2
        WHEN 'In Transit' THEN 3
        WHEN 'Arrived' THEN 4
        ELSE 5
      END,
      c.expected_arrival
  `).all(...(projectId ? [projectId] : []));
}

export function createPayment(input: {
  projectId: number;
  vendorName: string;
  poNumber: string;
  invoiceNumber: string;
  amount: number;
  paidAmount?: number;
  status: PaymentStatus;
  dueDate: string;
  approvalState: string;
}) {
  const db = database();
  const result = db.prepare(`
    INSERT INTO payments (
      project_id, vendor_name, po_number, invoice_number, amount, paid_amount, status, due_date, approval_state
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.projectId,
    input.vendorName,
    input.poNumber,
    input.invoiceNumber,
    input.amount,
    input.paidAmount ?? 0,
    input.status,
    input.dueDate,
    input.approvalState,
  );

  return db.prepare("SELECT * FROM payments WHERE id = ?").get(result.lastInsertRowid);
}

export function getPayments(projectId?: number) {
  const filter = projectId ? "WHERE pay.project_id = ?" : "";
  const rows = database().prepare(`
    SELECT
      pay.*,
      p.code AS project_code,
      p.name AS project_name
    FROM payments pay
    INNER JOIN projects p ON p.id = pay.project_id
    ${filter}
    ORDER BY pay.due_date, pay.vendor_name
  `).all(...(projectId ? [projectId] : []));

  const summary = database().prepare(`
    SELECT
      COALESCE(SUM(amount), 0) AS total_payable,
      COALESCE(SUM(paid_amount), 0) AS total_paid,
      COALESCE(SUM(amount - paid_amount), 0) AS outstanding
    FROM payments
    ${projectId ? "WHERE project_id = ?" : ""}
  `).get(...(projectId ? [projectId] : []));

  return { rows, summary };
}

export function createRedFlag(input: {
  projectId: number;
  assemblyId?: number | null;
  title: string;
  description: string;
  priority: RedFlagPriority;
  raisedBy: string;
  assignedTo: string;
  dueDate: string;
  status: RedFlagStatus;
}) {
  const db = database();
  const result = db.prepare(`
    INSERT INTO red_flags (
      project_id, assembly_id, title, description, priority, raised_by, assigned_to, due_date, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.projectId,
    input.assemblyId ?? null,
    input.title,
    input.description,
    input.priority,
    input.raisedBy,
    input.assignedTo,
    input.dueDate,
    input.status,
  );

  return db.prepare("SELECT * FROM red_flags WHERE id = ?").get(result.lastInsertRowid);
}

export function getRedFlags(projectId?: number) {
  return database().prepare(`
    SELECT
      rf.*,
      p.code AS project_code,
      p.name AS project_name,
      a.name AS assembly_name
    FROM red_flags rf
    INNER JOIN projects p ON p.id = rf.project_id
    LEFT JOIN assemblies a ON a.id = rf.assembly_id
    ${projectId ? "WHERE rf.project_id = ?" : ""}
    ORDER BY
      CASE rf.priority
        WHEN 'Critical' THEN 1
        WHEN 'High' THEN 2
        ELSE 3
      END,
      rf.due_date
  `).all(...(projectId ? [projectId] : []));
}

export function createActionItem(input: {
  projectId: number;
  title: string;
  owner: string;
  source: string;
  dueDate: string;
  status: string;
  notes?: string;
}) {
  const db = database();
  const result = db.prepare(`
    INSERT INTO action_items (project_id, title, owner, source, due_date, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.projectId,
    input.title,
    input.owner,
    input.source,
    input.dueDate,
    input.status,
    input.notes ?? null,
  );

  return db.prepare("SELECT * FROM action_items WHERE id = ?").get(result.lastInsertRowid);
}

export function getActionItems(projectId?: number) {
  return database().prepare(`
    SELECT
      ai.*,
      p.code AS project_code,
      p.name AS project_name
    FROM action_items ai
    INNER JOIN projects p ON p.id = ai.project_id
    ${projectId ? "WHERE ai.project_id = ?" : ""}
    ORDER BY ai.due_date, ai.status
  `).all(...(projectId ? [projectId] : []));
}

export function createFileDocument(input: {
  projectId: number;
  folderName: string;
  fileName: string;
  documentType: string;
  revision: string;
  owner: string;
  status: string;
  updatedAt: string;
}) {
  const db = database();
  const result = db.prepare(`
    INSERT INTO file_documents (project_id, folder_name, file_name, document_type, revision, owner, status, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.projectId,
    input.folderName,
    input.fileName,
    input.documentType,
    input.revision,
    input.owner,
    input.status,
    input.updatedAt,
  );

  return db.prepare("SELECT * FROM file_documents WHERE id = ?").get(result.lastInsertRowid);
}

export function getFileDocuments(projectId?: number) {
  return database().prepare(`
    SELECT
      fd.*,
      p.code AS project_code,
      p.name AS project_name
    FROM file_documents fd
    INNER JOIN projects p ON p.id = fd.project_id
    ${projectId ? "WHERE fd.project_id = ?" : ""}
    ORDER BY fd.folder_name, fd.updated_at DESC
  `).all(...(projectId ? [projectId] : []));
}

export function createTransmittal(input: {
  projectId: number;
  transmittalNo: string;
  recipient: string;
  documentCount: number;
  sentDate: string;
  status: string;
  remarks?: string;
}) {
  const db = database();
  const result = db.prepare(`
    INSERT INTO transmittals (project_id, transmittal_no, recipient, document_count, sent_date, status, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.projectId,
    input.transmittalNo,
    input.recipient,
    input.documentCount,
    input.sentDate,
    input.status,
    input.remarks ?? null,
  );

  return db.prepare("SELECT * FROM transmittals WHERE id = ?").get(result.lastInsertRowid);
}

export function getTransmittals(projectId?: number) {
  return database().prepare(`
    SELECT
      t.*,
      p.code AS project_code,
      p.name AS project_name
    FROM transmittals t
    INNER JOIN projects p ON p.id = t.project_id
    ${projectId ? "WHERE t.project_id = ?" : ""}
    ORDER BY t.sent_date DESC
  `).all(...(projectId ? [projectId] : []));
}

export function getFullKitStatus(projectId: number) {
  return database().prepare(`
    SELECT
      a.id,
      a.name AS assembly_name,
      cat.name AS category_name,
      COUNT(c.id) AS total_components,
      SUM(CASE WHEN c.order_status IN ('Arrived', 'Dispatched') THEN 1 ELSE 0 END) AS arrived_components,
      GROUP_CONCAT(CASE WHEN c.order_status NOT IN ('Arrived', 'Dispatched') THEN c.name || ' (' || c.order_status || ')' END, ' | ') AS missing_components
    FROM assemblies a
    INNER JOIN categories cat ON cat.id = a.category_id
    LEFT JOIN components c ON c.assembly_id = a.id
    WHERE a.project_id = ?
    GROUP BY a.id
    ORDER BY cat.sort_order, a.name
  `).all(projectId).map((row) => {
    const record = row as Record<string, unknown>;
    const total = Number(record.total_components ?? 0);
    const arrived = Number(record.arrived_components ?? 0);
    return {
      ...record,
      readiness_percent: total === 0 ? 0 : Math.round((arrived / total) * 100),
      full_kit_ready: total > 0 && total === arrived,
      missing_components:
        (record.missing_components as string | null)
          ?.split(" | ")
          .filter(Boolean) ?? [],
    };
  });
}

export function getPlanningMatrix(projectId: number) {
  const assemblies = database().prepare(`
    SELECT
      a.id,
      a.name,
      a.planned_phase,
      a.completion_percent,
      cat.name AS category_name
    FROM assemblies a
    INNER JOIN categories cat ON cat.id = a.category_id
    WHERE a.project_id = ?
    ORDER BY cat.sort_order, a.name
  `).all(projectId) as Array<{
    id: number;
    name: string;
    planned_phase: ProjectPhase;
    completion_percent: number;
    category_name: string;
  }>;

  return PROJECT_CATEGORIES.map((category) => ({
    category,
    phases: PROJECT_PHASES.map((phase) => ({
      phase,
      assemblies: assemblies.filter(
        (assembly) =>
          assembly.category_name === category && assembly.planned_phase === phase,
      ),
    })),
  }));
}

export function moveAssemblyPhase(assemblyId: number, plannedPhase: ProjectPhase) {
  database().prepare("UPDATE assemblies SET planned_phase = ? WHERE id = ?").run(plannedPhase, assemblyId);
}

export function importWorkbookData(payload: {
  project: {
    code: string;
    name: string;
    manager: string;
    division?: string;
    clientName?: string;
    dueDate: string;
    projectedEndDate: string;
    notes?: string;
  };
  bom?: Array<{
    assembly: string;
    category: string;
    phase: ProjectPhase;
    subassembly: string;
    component: string;
    drawingNumber: string;
    quantity: number;
    material: string;
    weight: number;
    vendorName: string;
    poNumber: string;
    unitPrice: number;
    orderStatus: OrderStatus;
    orderDate?: string | null;
    expectedArrival?: string | null;
    arrivalDate?: string | null;
    dispatchDate?: string | null;
  }>;
  payments?: Array<{
    vendorName: string;
    poNumber: string;
    invoiceNumber: string;
    amount: number;
    paidAmount: number;
    status: PaymentStatus;
    dueDate: string;
    approvalState: string;
  }>;
  redFlags?: Array<{
    title: string;
    description: string;
    priority: RedFlagPriority;
    raisedBy: string;
    assignedTo: string;
    dueDate: string;
    status: RedFlagStatus;
  }>;
}) {
  const db = database();
  const existing = db.prepare("SELECT id FROM projects WHERE code = ?").get(payload.project.code) as IdRow | undefined;
  const projectId =
    existing?.id ??
    Number(
      (
        createProject({
          code: payload.project.code,
          name: payload.project.name,
          manager: payload.project.manager,
          division: payload.project.division,
          client_name: payload.project.clientName,
          due_date: payload.project.dueDate,
          projected_end_date: payload.project.projectedEndDate,
          notes: payload.project.notes,
        }) as Record<string, unknown>
      ).id,
    );

  const tx = db.transaction(() => {
    (payload.bom ?? []).forEach((row) => {
      let category = db.prepare("SELECT id FROM categories WHERE project_id = ? AND name = ?").get(projectId, row.category) as IdRow | undefined;
      if (!category) {
        const index = PROJECT_CATEGORIES.indexOf(row.category as (typeof PROJECT_CATEGORIES)[number]);
        category = {
          id: db.prepare("INSERT INTO categories (project_id, name, sort_order) VALUES (?, ?, ?)")
            .run(projectId, row.category, index >= 0 ? index + 1 : 99).lastInsertRowid as number,
        };
      }

      let assembly = db.prepare("SELECT id FROM assemblies WHERE project_id = ? AND name = ?").get(projectId, row.assembly) as IdRow | undefined;
      if (!assembly) {
        assembly = {
          id: db.prepare(`
            INSERT INTO assemblies (project_id, category_id, name, drawing_number, planned_phase, completion_percent)
            VALUES (?, ?, ?, ?, ?, 0)
          `).run(projectId, category.id, row.assembly, `AUTO-${Date.now()}`, row.phase).lastInsertRowid as number,
        };
      }

      let subassembly = db.prepare("SELECT id FROM subassemblies WHERE assembly_id = ? AND name = ?").get(assembly.id, row.subassembly) as IdRow | undefined;
      if (!subassembly) {
        subassembly = {
          id: db.prepare("INSERT INTO subassemblies (assembly_id, name) VALUES (?, ?)")
            .run(assembly.id, row.subassembly).lastInsertRowid as number,
        };
      }

      upsertBomComponent(projectId, {
        assemblyId: assembly.id,
        subassemblyId: subassembly.id,
        name: row.component,
        drawingNumber: row.drawingNumber,
        quantity: row.quantity,
        material: row.material,
        weight: row.weight,
        vendorName: row.vendorName,
        poNumber: row.poNumber,
        unitPrice: row.unitPrice,
        orderStatus: row.orderStatus,
        orderDate: row.orderDate,
        expectedArrival: row.expectedArrival,
        arrivalDate: row.arrivalDate,
        dispatchDate: row.dispatchDate,
      });
    });

    (payload.payments ?? []).forEach((payment) => {
      createPayment({
        projectId,
        vendorName: payment.vendorName,
        poNumber: payment.poNumber,
        invoiceNumber: payment.invoiceNumber,
        amount: payment.amount,
        paidAmount: payment.paidAmount,
        status: payment.status,
        dueDate: payment.dueDate,
        approvalState: payment.approvalState,
      });
    });

    (payload.redFlags ?? []).forEach((flag) => {
      createRedFlag({
        projectId,
        title: flag.title,
        description: flag.description,
        priority: flag.priority,
        raisedBy: flag.raisedBy,
        assignedTo: flag.assignedTo,
        dueDate: flag.dueDate,
        status: flag.status,
      });
    });
  });

  tx();
  return getProjectById(projectId);
}

export function getReferenceData() {
  return {
    categories: [...PROJECT_CATEGORIES],
    phases: [...PROJECT_PHASES],
    orderStatuses: [...ORDER_STATUSES],
    paymentStatuses: [...PAYMENT_STATUSES],
    redFlagPriorities: [...RED_FLAG_PRIORITIES],
    redFlagStatuses: [...RED_FLAG_STATUSES],
  };
}
