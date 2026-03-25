"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ChevronRight, Plus, Trash2, ClipboardList, AlertTriangle } from "lucide-react";
import { PlanAssembly } from "./PertView";
import DprPanel from "./DprPanel";
import styles from "./TabularView.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Subtask {
  id: number;
  assembly_id: number;
  phase_id: number | null;
  name: string;
  start_date: string | null;
  end_date: string | null;
  completion_percent: number;
  dpr_count: number;
  // joined from plan_phases
  phase_name: string | null;
  phase_start: string | null;
  phase_end: string | null;
  phase_duration: number | null;
}

type EditCell = { subtaskId: number; field: "name" | "start_date" | "end_date" | "completion_percent" | "phase_id" };

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<number, string> = {
  1: "#e31837", 2: "#7c3aed", 3: "#0891b2", 4: "#d97706", 5: "#059669",
};

const PHASE_COLORS: Record<string, { color: string; bg: string }> = {
  "Engineering":               { color: "#dc2626", bg: "#fee2e2" },
  "Ordering & Manufacturing":  { color: "#f97316", bg: "#fff7ed" },
  "Assembly":                  { color: "#16a34a", bg: "#dcfce7" },
  "Dispatch":                  { color: "#2563eb", bg: "#dbeafe" },
  "Project End":               { color: "#7c3aed", bg: "#ede9fe" },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface TabularViewProps {
  assemblies: PlanAssembly[];
  onAssembliesChange: () => void;
}

export default function TabularView({ assemblies, onAssembliesChange }: TabularViewProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [subtasks, setSubtasks] = useState<Record<number, Subtask[]>>({});
  const [editCell, setEditCell] = useState<EditCell | null>(null);
  const [editValue, setEditValue] = useState("");
  const [dprSubtask, setDprSubtask] = useState<Subtask | null>(null);

  const loadSubtasks = useCallback(async (assemblyId: number) => {
    const res = await fetch(`/api/plan/assemblies/${assemblyId}/subtasks`);
    const data = await res.json() as Subtask[];
    setSubtasks(prev => ({ ...prev, [assemblyId]: data }));
  }, []);

  const toggleExpand = useCallback((assemblyId: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(assemblyId)) {
        next.delete(assemblyId);
      } else {
        next.add(assemblyId);
        loadSubtasks(assemblyId);
      }
      return next;
    });
  }, [loadSubtasks]);

  const addSubtask = useCallback(async (assemblyId: number) => {
    await fetch(`/api/plan/assemblies/${assemblyId}/subtasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "New Subtask" }),
    });
    loadSubtasks(assemblyId);
    onAssembliesChange();
  }, [loadSubtasks, onAssembliesChange]);

  const deleteSubtask = useCallback(async (subtaskId: number, assemblyId: number) => {
    await fetch(`/api/plan/subtasks/${subtaskId}`, { method: "DELETE" });
    loadSubtasks(assemblyId);
    onAssembliesChange();
  }, [loadSubtasks, onAssembliesChange]);

  const startEdit = (subtaskId: number, field: EditCell["field"], value: string | number | null) => {
    setEditCell({ subtaskId, field });
    setEditValue(String(value ?? ""));
  };

  const commitEdit = useCallback(async (assemblyId: number) => {
    if (!editCell) return;
    const fieldMap: Record<EditCell["field"], string> = {
      name: "name",
      start_date: "startDate",
      end_date: "endDate",
      completion_percent: "completionPercent",
      phase_id: "phaseId",
    };
    const body: Record<string, string | number | null> = {};
    const key = fieldMap[editCell.field];
    if (editCell.field === "completion_percent") {
      body[key] = Math.min(100, Math.max(0, Number(editValue)));
    } else if (editCell.field === "phase_id") {
      body[key] = editValue ? Number(editValue) : null;
    } else {
      body[key] = editValue || null;
    }
    await fetch(`/api/plan/subtasks/${editCell.subtaskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setEditCell(null);
    loadSubtasks(assemblyId);
  }, [editCell, editValue, loadSubtasks]);

  const handleKeyDown = (e: React.KeyboardEvent, assemblyId: number) => {
    if (e.key === "Enter") commitEdit(assemblyId);
    if (e.key === "Escape") setEditCell(null);
  };

  // ── Timeline validation ─────────────────────────────────────────────────────

  function subtaskOutsidePhase(st: Subtask): boolean {
    if (!st.start_date && !st.end_date) return false;
    if (!st.phase_start && !st.phase_end) return false;
    const stStart = st.start_date ? new Date(st.start_date).getTime() : null;
    const stEnd   = st.end_date   ? new Date(st.end_date).getTime()   : null;
    const phStart = st.phase_start ? new Date(st.phase_start).getTime() : null;
    const phEnd   = st.phase_end   ? new Date(st.phase_end).getTime()   : null;
    if (phStart && stStart && stStart < phStart) return true;
    if (phEnd   && stEnd   && stEnd   > phEnd)   return true;
    return false;
  }

  return (
    <div className={styles.wrapper}>
      {assemblies.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>
          No assemblies yet. Add assemblies in the PERT View.
        </div>
      )}
      {assemblies.map(asm => {
        const isOpen = expanded.has(asm.id);
        const rows = subtasks[asm.id] ?? [];
        const catColor = CATEGORY_COLORS[asm.category];
        return (
          <div key={asm.id} className={styles.asmCard}>
            {/* Assembly Header */}
            <div className={styles.asmHeader} onClick={() => toggleExpand(asm.id)}>
              <div className={styles.asmHeaderLeft}>
                <ChevronRight size={16} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`} />
                <span className={styles.catDot} style={{ background: catColor }} />
                <span className={styles.asmName}>{asm.name}</span>
                <span className={styles.catBadge} style={{ background: catColor + "22", color: catColor }}>Cat {asm.category}</span>
                <span className={styles.subtaskCount}>{asm.subtask_count} subtask{asm.subtask_count !== 1 ? "s" : ""}</span>
              </div>
            </div>

            {/* Subtask Table */}
            {isOpen && (
              <div className={styles.asmBody}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Subtask Name</th>
                      <th>Phase</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>% Done</th>
                      <th>⚠️</th>
                      <th>DPR</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr><td colSpan={9} className={styles.emptyRow}>No subtasks. Click &ldquo;Add Subtask&rdquo; below.</td></tr>
                    )}
                    {rows.map((st, idx) => {
                      const warn = subtaskOutsidePhase(st);
                      return (
                        <tr key={st.id} style={{ background: warn ? "#fffbeb" : undefined }}>
                          <td style={{ color: "var(--text-secondary)", width: 30 }}>{idx + 1}</td>

                          {/* Name */}
                          <td style={{ minWidth: 200 }} onClick={() => startEdit(st.id, "name", st.name)}>
                            {editCell?.subtaskId === st.id && editCell.field === "name" ? (
                              <input autoFocus className={styles.editInput} value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => commitEdit(asm.id)} onKeyDown={e => handleKeyDown(e, asm.id)} />
                            ) : <span className={styles.cellText}>{st.name || <em style={{color:"#aaa"}}>click to edit</em>}</span>}
                          </td>

                          {/* Phase assignment */}
                          <td style={{ minWidth: 150 }} onClick={() => startEdit(st.id, "phase_id", st.phase_id)}>
                            {editCell?.subtaskId === st.id && editCell.field === "phase_id" ? (
                              <select autoFocus className={styles.editInput}
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => commitEdit(asm.id)} onKeyDown={e => handleKeyDown(e, asm.id)}>
                                <option value="">— unassigned —</option>
                                {asm.phases.map(p => (
                                  <option key={p.id} value={p.id}>{p.phase_name}</option>
                                ))}
                              </select>
                            ) : st.phase_name ? (
                              <span style={{
                                display: "inline-block", padding: "2px 8px", borderRadius: 10,
                                fontSize: 11, fontWeight: 600,
                                ...(PHASE_COLORS[st.phase_name] ?? { color: "#555", background: "#f5f5f5" }),
                              }}>{st.phase_name}</span>
                            ) : (
                              <span style={{ color: "#ccc", fontSize: 12 }}>— click to assign —</span>
                            )}
                          </td>

                          {/* Start Date */}
                          <td style={{ minWidth: 120 }} onClick={() => startEdit(st.id, "start_date", st.start_date)}>
                            {editCell?.subtaskId === st.id && editCell.field === "start_date" ? (
                              <input autoFocus type="date" className={styles.editInput} value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => commitEdit(asm.id)} onKeyDown={e => handleKeyDown(e, asm.id)} />
                            ) : <span className={styles.cellText} style={{ color: st.start_date ? "inherit" : "#ccc" }}>{st.start_date || "—"}</span>}
                          </td>

                          {/* End Date */}
                          <td style={{ minWidth: 120 }} onClick={() => startEdit(st.id, "end_date", st.end_date)}>
                            {editCell?.subtaskId === st.id && editCell.field === "end_date" ? (
                              <input autoFocus type="date" className={styles.editInput} value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => commitEdit(asm.id)} onKeyDown={e => handleKeyDown(e, asm.id)} />
                            ) : <span className={styles.cellText} style={{ color: st.end_date ? "inherit" : "#ccc" }}>{st.end_date || "—"}</span>}
                          </td>

                          {/* Completion % */}
                          <td style={{ minWidth: 80 }} onClick={() => startEdit(st.id, "completion_percent", st.completion_percent)}>
                            {editCell?.subtaskId === st.id && editCell.field === "completion_percent" ? (
                              <input autoFocus type="number" min={0} max={100} className={styles.editInput} value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={() => commitEdit(asm.id)} onKeyDown={e => handleKeyDown(e, asm.id)}
                                style={{ width: 60 }} />
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                                  <div style={{ width: `${st.completion_percent}%`, height: "100%", background: "#16a34a", borderRadius: 3 }} />
                                </div>
                                <span style={{ fontSize: 11, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{st.completion_percent}%</span>
                              </div>
                            )}
                          </td>

                          {/* Timeline warning */}
                          <td style={{ width: 36, textAlign: "center" }}>
                            {warn && (
                              <span title={`Subtask dates fall outside ${st.phase_name} phase (${st.phase_start} → ${st.phase_end})`}>
                                <AlertTriangle size={14} color="#f97316" />
                              </span>
                            )}
                          </td>

                          {/* DPR */}
                          <td>
                            <button className={styles.dprBtn} onClick={e => { e.stopPropagation(); setDprSubtask(st); }}>
                              <ClipboardList size={11} /> DPR {st.dpr_count > 0 ? `(${st.dpr_count})` : ""}
                            </button>
                          </td>

                          {/* Delete */}
                          <td>
                            <button className={styles.deleteBtn} onClick={e => { e.stopPropagation(); deleteSubtask(st.id, asm.id); }}>
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <button className={styles.addRowBtn} onClick={() => addSubtask(asm.id)}>
                  <Plus size={13} /> Add Subtask
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* DPR Panel */}
      {dprSubtask && (
        <DprPanel
          subtask={dprSubtask}
          onClose={() => {
            const asmId = dprSubtask.assembly_id;
            setDprSubtask(null);
            loadSubtasks(asmId);
            onAssembliesChange();
          }}
        />
      )}
    </div>
  );
}
