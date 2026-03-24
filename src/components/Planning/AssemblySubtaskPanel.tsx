"use client";

import React, { useState } from "react";
import { PertAssembly, Subtask } from "@/data/mockData";
import { X, Plus, Trash2 } from "lucide-react";
import styles from "./AssemblySubtaskPanel.module.css";

interface Props {
  assembly: PertAssembly;
  onClose: () => void;
  onSave: (updated: PertAssembly) => void;
}

type SubtaskField = keyof Omit<Subtask, "id">;

const COLUMNS: { key: SubtaskField; label: string; width: string }[] = [
  { key: "drawingNo",  label: "Drawing No.",     width: "130px" },
  { key: "name",       label: "Component Name",  width: "220px" },
  { key: "qty",        label: "Qty",             width: "60px"  },
  { key: "material",   label: "Material",        width: "160px" },
  { key: "weight",     label: "Weight",          width: "90px"  },
  { key: "status",     label: "Status",          width: "110px" },
];

const STATUS_OPTIONS: Subtask["status"][] = [
  "Pending", "In Progress", "Completed", "Ordered",
];

const STATUS_COLORS: Record<Subtask["status"], { bg: string; color: string }> = {
  "Pending":     { bg: "#f3f4f6", color: "#6b7280" },
  "In Progress": { bg: "#dbeafe", color: "#1d4ed8" },
  "Completed":   { bg: "#dcfce7", color: "#15803d" },
  "Ordered":     { bg: "#fff7ed", color: "#c2410c" },
};

let subCounter = 1000;
function genSubId() { return `sub${++subCounter}`; }

export default function AssemblySubtaskPanel({ assembly, onClose, onSave }: Props) {
  const [subtasks, setSubtasks] = useState<Subtask[]>(() => [...assembly.subtasks]);
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: SubtaskField } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // ── Editing ────────────────────────────────────────────────────────────────

  const startEdit = (rowId: string, field: SubtaskField, current: string | number) => {
    setEditingCell({ rowId, field });
    setEditValue(String(current));
  };

  const commitEdit = () => {
    if (!editingCell) return;
    setSubtasks(prev =>
      prev.map(s => {
        if (s.id !== editingCell.rowId) return s;
        const raw = editValue;
        if (editingCell.field === "qty") return { ...s, qty: parseInt(raw, 10) || 0 };
        if (editingCell.field === "status") return { ...s, status: raw as Subtask["status"] };
        return { ...s, [editingCell.field]: raw };
      })
    );
    setEditingCell(null);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); commitEdit(); }
    if (e.key === "Escape") setEditingCell(null);
  };

  // ── Row ops ────────────────────────────────────────────────────────────────

  const addRow = () => {
    const blank: Subtask = {
      id: genSubId(), drawingNo: "", name: "", qty: 1,
      material: "", weight: "", status: "Pending",
    };
    setSubtasks(prev => [...prev, blank]);
  };

  const removeRow = (id: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  const handleSave = () => {
    onSave({ ...assembly, subtasks });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.subtitle}>Assembly Components</div>
            <div className={styles.title}>{assembly.name}</div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.saveBtn} onClick={handleSave}>
              Save
            </button>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Phase summary pills */}
        <div className={styles.phasePills}>
          <span className={styles.pill} style={{ background: "#fee2e2", color: "#dc2626" }}>
            Engg: {assembly.engineering}d
          </span>
          <span className={styles.pill} style={{ background: "#fff7ed", color: "#f97316" }}>
            Order/Mfg: {assembly.orderingManufacturing}d
          </span>
          <span className={styles.pill} style={{ background: "#dcfce7", color: "#16a34a" }}>
            Assembly: {assembly.assembly}d
          </span>
          <span className={styles.pill} style={{ background: "#dbeafe", color: "#2563eb" }}>
            Dispatch: {assembly.dispatch}d
          </span>
        </div>

        {/* Excel table */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.srCol}>#</th>
                {COLUMNS.map(c => (
                  <th key={c.key} style={{ minWidth: c.width }}>{c.label}</th>
                ))}
                <th className={styles.actionCol} />
              </tr>
            </thead>
            <tbody>
              {subtasks.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length + 2} className={styles.emptyRow}>
                    No components yet. Click "+ Add Row" to start.
                  </td>
                </tr>
              )}
              {subtasks.map((s, idx) => (
                <tr
                  key={s.id}
                  className={styles.dataRow}
                  onDoubleClick={() => {}} // handled per cell
                >
                  <td className={styles.srCell}>{idx + 1}</td>

                  {COLUMNS.map(col => {
                    const isEditing =
                      editingCell?.rowId === s.id && editingCell?.field === col.key;
                    const cellVal = s[col.key];

                    return (
                      <td
                        key={col.key}
                        className={styles.cell}
                        onClick={() => startEdit(s.id, col.key, cellVal)}
                      >
                        {isEditing ? (
                          col.key === "status" ? (
                            <select
                              className={styles.selectInput}
                              value={editValue}
                              autoFocus
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={handleKey}
                            >
                              {STATUS_OPTIONS.map(o => (
                                <option key={o} value={o}>{o}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              className={styles.textInput}
                              autoFocus
                              value={editValue}
                              type={col.key === "qty" ? "number" : "text"}
                              onChange={e => setEditValue(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={handleKey}
                            />
                          )
                        ) : col.key === "status" ? (
                          <span
                            className={styles.statusBadge}
                            style={STATUS_COLORS[s.status as Subtask["status"]]}
                          >
                            {s.status}
                          </span>
                        ) : (
                          <span className={styles.cellText}>
                            {String(cellVal || "")}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  <td className={styles.actionCol}>
                    <button
                      className={styles.deleteRowBtn}
                      onClick={e => { e.stopPropagation(); removeRow(s.id); }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.addRowBtn} onClick={addRow}>
            <Plus size={14} /> Add Row
          </button>
          <span className={styles.hint}>Click a cell to edit · Tab / Enter to confirm</span>
        </div>
      </div>
    </div>
  );
}
