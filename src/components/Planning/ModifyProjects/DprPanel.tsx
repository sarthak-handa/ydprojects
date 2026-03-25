"use client";

import React, { useState, useCallback } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import styles from "./DprPanel.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DprEntry {
  id: number;
  subtask_id: number;
  component_name: string;
  quantity: number;
  date: string;
  status: string;
}

type DprStatus = "Pending" | "In Progress" | "Completed" | "Dispatched";
const STATUS_OPTIONS: DprStatus[] = ["Pending", "In Progress", "Completed", "Dispatched"];

const STATUS_STYLES: Record<DprStatus, { bg: string; color: string }> = {
  Pending:      { bg: "#f3f4f6", color: "#6b7280" },
  "In Progress":{ bg: "#dbeafe", color: "#1d4ed8" },
  Completed:    { bg: "#dcfce7", color: "#15803d" },
  Dispatched:   { bg: "#fef3c7", color: "#92400e" },
};

type EditCell = { entryId: number; field: "component_name" | "quantity" | "date" | "status" };

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  subtask: { id: number; name: string; assembly_id: number };
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DprPanel({ subtask, onClose }: Props) {
  const [entries, setEntries] = useState<DprEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCell, setEditCell] = useState<EditCell | null>(null);
  const [editValue, setEditValue] = useState("");

  // Load on mount
  React.useEffect(() => {
    fetch(`/api/plan/subtasks/${subtask.id}/dpr`)
      .then(r => r.json())
      .then((data: DprEntry[]) => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [subtask.id]);

  const reload = useCallback(async () => {
    const res = await fetch(`/api/plan/subtasks/${subtask.id}/dpr`);
    const data = await res.json() as DprEntry[];
    setEntries(data);
  }, [subtask.id]);

  const addEntry = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);
    await fetch(`/api/plan/subtasks/${subtask.id}/dpr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ componentName: "New Component", quantity: 1, date: today, status: "Pending" }),
    });
    reload();
  }, [subtask.id, reload]);

  const deleteEntry = useCallback(async (id: number) => {
    await fetch(`/api/plan/dpr/${id}`, { method: "DELETE" });
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const startEdit = (entryId: number, field: EditCell["field"], value: string | number) => {
    setEditCell({ entryId, field });
    setEditValue(String(value ?? ""));
  };

  const commitEdit = useCallback(async () => {
    if (!editCell) return;
    const bodyMap: Record<EditCell["field"], string> = {
      component_name: "componentName",
      quantity: "quantity",
      date: "date",
      status: "status",
    };
    const body: Record<string, string | number> = {};
    body[bodyMap[editCell.field]] = editCell.field === "quantity" ? Number(editValue) : editValue;
    await fetch(`/api/plan/dpr/${editCell.entryId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setEditCell(null);
    reload();
  }, [editCell, editValue, reload]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditCell(null);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerSub}>Daily Progress Report (DPR)</div>
            <div className={styles.headerTitle}>{subtask.name}</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        {/* Table */}
        <div className={styles.body}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>Loading…</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Component Name</th>
                  <th>Qty</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.emptyRow}>
                      No DPR entries. Click &ldquo;Add Entry&rdquo; below.
                    </td>
                  </tr>
                )}
                {entries.map((entry, idx) => (
                  <tr key={entry.id}>
                    <td style={{ color: "var(--text-secondary)", width: 30 }}>{idx + 1}</td>

                    {/* Component Name */}
                    <td style={{ minWidth: 200 }} onClick={() => startEdit(entry.id, "component_name", entry.component_name)}>
                      {editCell?.entryId === entry.id && editCell.field === "component_name" ? (
                        <input autoFocus className={styles.editInput} value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={commitEdit} onKeyDown={handleKey} />
                      ) : <span>{entry.component_name}</span>}
                    </td>

                    {/* Quantity */}
                    <td style={{ width: 70 }} onClick={() => startEdit(entry.id, "quantity", entry.quantity)}>
                      {editCell?.entryId === entry.id && editCell.field === "quantity" ? (
                        <input autoFocus type="number" className={styles.editInput} value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={commitEdit} onKeyDown={handleKey} style={{ width: 60 }} />
                      ) : <span>{entry.quantity}</span>}
                    </td>

                    {/* Date */}
                    <td style={{ minWidth: 120 }} onClick={() => startEdit(entry.id, "date", entry.date)}>
                      {editCell?.entryId === entry.id && editCell.field === "date" ? (
                        <input autoFocus type="date" className={styles.editInput} value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={commitEdit} onKeyDown={handleKey} />
                      ) : <span>{entry.date}</span>}
                    </td>

                    {/* Status */}
                    <td onClick={() => startEdit(entry.id, "status", entry.status)}>
                      {editCell?.entryId === entry.id && editCell.field === "status" ? (
                        <select autoFocus className={styles.statusSelect} value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={commitEdit} onKeyDown={handleKey}>
                          {STATUS_OPTIONS.map(s => (<option key={s} value={s}>{s}</option>))}
                        </select>
                      ) : (
                        <span className={styles.statusBadge} style={STATUS_STYLES[entry.status as DprStatus] ?? { bg: "#f3f4f6", color: "#555" }}>
                          {entry.status}
                        </span>
                      )}
                    </td>

                    {/* Delete */}
                    <td>
                      <button className={styles.deleteBtn} onClick={() => deleteEntry(entry.id)}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.addBtn} onClick={addEntry}>
            <Plus size={14} /> Add Entry
          </button>
          <span className={styles.hint}>Click any cell to edit · Enter to confirm</span>
        </div>
      </div>
    </div>
  );
}
