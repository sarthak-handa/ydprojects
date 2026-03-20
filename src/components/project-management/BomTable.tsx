"use client";

import {
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";
import styles from "./projectManagement.module.css";
import { formatCurrency } from "@/lib/format";

interface BomTableProps {
  projectId: number;
}

export default function BomTable({ projectId }: BomTableProps) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("assembly_name");
  const [editRowId, setEditRowId] = useState<number | null>(null);

  async function refresh() {
    const response = await fetch(`/api/projects/${projectId}/bom`, {
      cache: "no-store",
    });
    const payload = await response.json();
    startTransition(() => {
      setRows(payload.bom);
    });
  }

  const load = useEffectEvent(() => {
    void refresh();
  });

  useEffect(() => {
    void load();
  }, [projectId]);

  const filteredRows = useMemo(() => {
    return [...rows]
      .filter((row) =>
        JSON.stringify(row).toLowerCase().includes(query.toLowerCase()),
      )
      .sort((a, b) =>
        String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? "")),
      );
  }, [query, rows, sortKey]);

  const groupedCost = filteredRows.reduce<Record<string, number>>((acc, row) => {
    const key = String(row.assembly_name);
    acc[key] = (acc[key] ?? 0) + Number(row.total_price ?? 0);
    return acc;
  }, {});

  async function saveRow(row: Record<string, unknown>) {
    await fetch(`/api/projects/${projectId}/bom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: row.id,
        assemblyId: row.assembly_id,
        subassemblyId: row.subassembly_id,
        name: row.name,
        drawingNumber: row.drawing_number,
        quantity: row.quantity,
        material: row.material,
        weight: row.weight,
        vendorName: row.vendor_name,
        poNumber: row.po_number,
        unitPrice: row.unit_price,
        orderStatus: row.order_status,
        orderDate: row.order_date,
        expectedArrival: row.expected_arrival,
        arrivalDate: row.arrival_date,
        dispatchDate: row.dispatch_date,
      }),
    });
    setEditRowId(null);
    await refresh();
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <div className={styles.panelTitle}>Bill of Materials</div>
          <div className={styles.panelSubtext}>
            Sortable BOM with assembly subtotals and inline update support.
          </div>
        </div>
        <div className={styles.linkRow}>
          <input
            className={styles.field}
            placeholder="Search BOM"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className={styles.select}
            value={sortKey}
            onChange={(event) => setSortKey(event.target.value)}
          >
            <option value="assembly_name">Assembly</option>
            <option value="vendor_name">Vendor</option>
            <option value="order_status">Status</option>
            <option value="drawing_number">Drawing</option>
          </select>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Assembly</th>
              <th>Subassembly</th>
              <th>Component</th>
              <th>Drawing</th>
              <th>Qty</th>
              <th>Vendor</th>
              <th>PO</th>
              <th>Status</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={String(row.id)}>
                <td>
                  <strong>{String(row.assembly_name)}</strong>
                  <div className={styles.panelSubtext}>
                    Subtotal {formatCurrency(groupedCost[String(row.assembly_name)] ?? 0)}
                  </div>
                </td>
                <td>{String(row.subassembly_name)}</td>
                <td>
                  {editRowId === Number(row.id) ? (
                    <input
                      className={styles.field}
                      value={String(row.name)}
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((item) =>
                            item.id === row.id
                              ? { ...item, name: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  ) : (
                    String(row.name)
                  )}
                </td>
                <td>{String(row.drawing_number)}</td>
                <td>{Number(row.quantity ?? 0)}</td>
                <td>
                  {editRowId === Number(row.id) ? (
                    <input
                      className={styles.field}
                      value={String(row.vendor_name)}
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((item) =>
                            item.id === row.id
                              ? { ...item, vendor_name: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  ) : (
                    String(row.vendor_name)
                  )}
                </td>
                <td>{String(row.po_number)}</td>
                <td>
                  {editRowId === Number(row.id) ? (
                    <select
                      className={styles.select}
                      value={String(row.order_status)}
                      onChange={(event) =>
                        setRows((current) =>
                          current.map((item) =>
                            item.id === row.id
                              ? { ...item, order_status: event.target.value }
                              : item,
                          ),
                        )
                      }
                    >
                      {["Pending", "Ordered", "In Transit", "Arrived", "Dispatched"].map(
                        (status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ),
                      )}
                    </select>
                  ) : (
                    String(row.order_status)
                  )}
                </td>
                <td>{formatCurrency(Number(row.total_price))}</td>
                <td>
                  {editRowId === Number(row.id) ? (
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => void saveRow(row)}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => setEditRowId(Number(row.id))}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
