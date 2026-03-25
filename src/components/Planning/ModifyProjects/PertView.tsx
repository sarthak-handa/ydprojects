"use client";

import React, { useState, useCallback, useRef } from "react";
import { Plus, Trash2, Copy, ArrowUp, ArrowDown } from "lucide-react";
import styles from "./PertView.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Phase {
  id: number;
  assembly_id: number;
  phase_name: string;
  phase_order: number;
  start_date: string | null;
  end_date: string | null;
  duration_days: number;
}

export interface PlanAssembly {
  id: number;
  project_id: number;
  name: string;
  category: 1 | 2 | 3 | 4 | 5;
  order_index: number;
  subtask_count: number;
  phases: Phase[];
}

interface ContextMenu {
  x: number;
  y: number;
  assemblyId: number;
}

interface EditingCell {
  assemblyId: number;
  phaseId: number;
}

interface AddModalState {
  open: boolean;
  name: string;
  category: number;
}

interface PhasePopoverState {
  assemblyId: number;
  phaseId: number;
  phaseName: string;
  x: number;
  y: number;
  start: string;
  end: string;
  duration: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PHASE_COLORS: Record<string, { color: string; bg: string }> = {
  "Engineering":               { color: "#dc2626", bg: "#fee2e2" },
  "Ordering & Manufacturing":  { color: "#f97316", bg: "#fff7ed" },
  "Assembly":                  { color: "#16a34a", bg: "#dcfce7" },
  "Dispatch":                  { color: "#2563eb", bg: "#dbeafe" },
  "Project End":               { color: "#7c3aed", bg: "#ede9fe" },
};

const CATEGORY_COLORS: Record<number, string> = {
  1: "#e31837", 2: "#7c3aed", 3: "#0891b2", 4: "#d97706", 5: "#059669",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface PertViewProps {
  projectId: number;
  assemblies: PlanAssembly[];
  onAssembliesChange: () => void;
  onAssemblyClick: (assembly: PlanAssembly) => void;
}

export default function PertView({
  projectId,
  assemblies,
  onAssembliesChange,
  onAssemblyClick,
  projectStartDate,
}: PertViewProps & { projectStartDate?: string | null }) {
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [popover, setPopover] = useState<PhasePopoverState | null>(null);
  const [modal, setModal] = useState<AddModalState>({ open: false, name: "", category: 1 });
  const [saving, setSaving] = useState(false);

  const closeCtx = () => setContextMenu(null);
  const closePopover = () => setPopover(null);

  // ── API calls ─────────────────────────────────────────────────────────────

  const apiDeleteAssembly = useCallback(async (id: number) => {
    await fetch(`/api/plan/assemblies/${id}`, { method: "DELETE" });
    onAssembliesChange();
  }, [onAssembliesChange]);

  const apiUpdateAssembly = useCallback(async (id: number, body: object) => {
    await fetch(`/api/plan/assemblies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    onAssembliesChange();
  }, [onAssembliesChange]);

  const apiUpdatePhase = useCallback(async (phaseId: number, data: { startDate?: string; endDate?: string; durationDays?: number }) => {
    await fetch(`/api/plan/phases/${phaseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    onAssembliesChange();
  }, [onAssembliesChange]);

  const apiCreateAssembly = useCallback(async (name: string, category: number) => {
    setSaving(true);
    await fetch(`/api/plan/${projectId}/assemblies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, orderIndex: assemblies.length }),
    });
    setSaving(false);
    onAssembliesChange();
  }, [projectId, assemblies.length, onAssembliesChange]);

  // ── Context menu actions ───────────────────────────────────────────────────

  const handleCopy = useCallback(async () => {
    if (!contextMenu) return;
    const asm = assemblies.find(a => a.id === contextMenu.assemblyId);
    if (!asm) return;
    setSaving(true);
    await fetch(`/api/plan/${projectId}/assemblies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: asm.name + " (Copy)", category: asm.category, orderIndex: asm.order_index + 1 }),
    });
    setSaving(false);
    onAssembliesChange();
    closeCtx();
  }, [contextMenu, assemblies, projectId, onAssembliesChange]);

  const handleInsert = useCallback(async (position: "above" | "below") => {
    if (!contextMenu) return;
    const asm = assemblies.find(a => a.id === contextMenu.assemblyId);
    if (!asm) return;
    setSaving(true);
    await fetch(`/api/plan/${projectId}/assemblies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "New Assembly",
        category: asm.category,
        orderIndex: position === "above" ? Math.max(0, asm.order_index - 1) : asm.order_index + 1,
      }),
    });
    setSaving(false);
    onAssembliesChange();
    closeCtx();
  }, [contextMenu, assemblies, projectId, onAssembliesChange]);

  const handleRemove = useCallback(async () => {
    if (!contextMenu) return;
    await apiDeleteAssembly(contextMenu.assemblyId);
    closeCtx();
  }, [contextMenu, apiDeleteAssembly]);

  // ── Phase Popover editing ──────────────────────────────────────────────────

  const openPopover = (e: React.MouseEvent, asmId: number, phase: Phase) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopover({
      assemblyId: asmId,
      phaseId: phase.id,
      phaseName: phase.phase_name,
      x: rect.left,
      y: rect.bottom + 4,
      start: phase.start_date || "",
      end: phase.end_date || "",
      duration: phase.duration_days ? String(phase.duration_days) : "",
    });
  };

  const commitPopover = async () => {
    if (!popover) return;
    const body: { startDate?: string; endDate?: string; durationDays?: number } = {};
    if (popover.start) body.startDate = popover.start;
    if (popover.end) body.endDate = popover.end;
    const d = parseInt(popover.duration, 10);
    if (!isNaN(d)) body.durationDays = d;
    
    await apiUpdatePhase(popover.phaseId, body);
    setPopover(null);
  };

  // ── Group by category & Calculate Today Line ─────────────────────────────

  // Calculate today line relative to project start date
  const todayStr = new Date().toISOString().slice(0, 10);
  let todayOffsetDays = -1;
  if (projectStartDate) {
    const ms = new Date(todayStr).getTime() - new Date(projectStartDate).getTime();
    todayOffsetDays = Math.round(ms / 86_400_000);
  }

  const sorted = [...assemblies].sort(
    (a, b) => a.category - b.category || a.order_index - b.order_index,
  );

  const categorised: { cat: number; rows: PlanAssembly[] }[] = [];
  sorted.forEach(a => {
    const last = categorised[categorised.length - 1];
    if (!last || last.cat !== a.category) {
      categorised.push({ cat: a.category, rows: [a] });
    } else {
      last.rows.push(a);
    }
  });

  // Unique phases ordered by phase_order (take from first assembly)
  const phaseColumns = assemblies[0]?.phases
    .slice()
    .sort((a, b) => a.phase_order - b.phase_order) ?? [];

  return (
    <div className={styles.wrapper} onClick={() => { closeCtx(); closePopover(); }}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <span className={styles.toolbarLeft}>
          {assemblies.length} assemblies · Click phase cell to edit duration (days) · Right-click row for options
        </span>
        <button
          className={styles.addAssemblyBtn}
          onClick={e => { e.stopPropagation(); setModal({ open: true, name: "", category: 1 }); }}
        >
          <Plus size={14} /> Add Assembly
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.stickyCol}>Assembly / Scope</th>
              {phaseColumns.map(ph => {
                const c = PHASE_COLORS[ph.phase_name] ?? { color: "#555", bg: "#f5f5f5" };
                return (
                  <th key={ph.id} style={{ background: c.bg, color: c.color }}>
                    {ph.phase_name}
                  </th>
                );
              })}
              <th style={{ background: "#1a1a2e", color: "#fff", minWidth: 100 }}>Project End</th>
              <th style={{ minWidth: 60 }} />
            </tr>
          </thead>
          <tbody>
            {categorised.map(({ cat, rows }) => (
              <React.Fragment key={`cat-${cat}`}>
                <tr className={styles.categoryRow}>
                  <td colSpan={phaseColumns.length + 3} style={{ borderLeft: `4px solid ${CATEGORY_COLORS[cat]}` }}>
                    <span className={styles.catBadge} style={{ background: CATEGORY_COLORS[cat] }}>
                      Category {cat}
                    </span>
                  </td>
                </tr>
                {rows.map(asm => {
                  const totalDays = asm.phases.reduce((s, p) => s + (p.duration_days || 0), 0);
                  return (
                    <tr
                      key={asm.id}
                      className={styles.row}
                      onContextMenu={e => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, assemblyId: asm.id }); }}
                      onClick={() => onAssemblyClick(asm)}
                    >
                      <td className={`${styles.stickyCol} ${styles.nameCell}`}>
                        <span className={styles.catDot} style={{ background: CATEGORY_COLORS[cat] }} />
                        <span className={styles.asmName}>{asm.name}</span>
                      </td>

                      {phaseColumns.map(tplPhase => {
                        const phase = asm.phases.find(p => p.phase_name === tplPhase.phase_name);
                        if (!phase) return <td key={tplPhase.id} className={styles.phaseCell} />;
                        
                        // Check overdue (today > end_date and not 100% complete — for now assuming phase bar represents planned)
                        const isOverdue = phase.end_date && todayStr > phase.end_date && phase.phase_name !== "Project End";
                        
                        const c = PHASE_COLORS[phase.phase_name] ?? { color: "#555", bg: "#f5f5f5" };
                        
                        return (
                          <td
                            key={phase.id}
                            className={styles.phaseCell}
                            onClick={e => openPopover(e, asm.id, phase)}
                          >
                            {phase.duration_days > 0 || phase.start_date ? (
                              <div
                                className={styles.phaseBar}
                                style={{ 
                                  background: c.bg, 
                                  borderLeft: `3px solid ${c.color}`, 
                                  color: c.color,
                                  outline: isOverdue ? "2px solid #ef4444" : "none",
                                  outlineOffset: "-1px"
                                }}
                                title={isOverdue ? "Overdue Phase" : ""}
                              >
                                {phase.duration_days ? `${phase.duration_days}d` : "—"}
                              </div>
                            ) : (
                              <span className={styles.phaseEmpty}>—</span>
                            )}
                          </td>
                        );
                      })}

                      <td className={styles.projectEndCell} onClick={e => e.stopPropagation()}>
                        {totalDays > 0 && (
                          <div className={styles.projectEndBar}>{totalDays}d</div>
                        )}
                      </td>
                      <td className={styles.actionCell} onClick={e => e.stopPropagation()}>
                        <button
                          className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                          title="Delete assembly"
                          onClick={() => apiDeleteAssembly(asm.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
            {assemblies.length === 0 && (
              <tr>
                <td colSpan={phaseColumns.length + 3} style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
                  No assemblies yet. Click &ldquo;Add Assembly&rdquo; to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className={styles.contextMenu}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button className={styles.menuItem} onClick={handleCopy}><Copy size={13} /> Copy Row</button>
          <button className={styles.menuItem} onClick={() => handleInsert("above")}><ArrowUp size={13} /> Insert Above</button>
          <button className={styles.menuItem} onClick={() => handleInsert("below")}><ArrowDown size={13} /> Insert Below</button>
          <div className={styles.menuDivider} />
          <button className={`${styles.menuItem} ${styles.menuDanger}`} onClick={handleRemove}><Trash2 size={13} /> Remove Row</button>
        </div>
      )}

      {/* Phase Editing Popover */}
      {popover && (
        <>
          <div className={styles.popoverOverlay} onClick={closePopover} />
          <div
            className={styles.phasePopover}
            style={{ top: popover.y, left: popover.x }}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.popoverTitle}>Edit Phase: {popover.phaseName}</div>
            
            <div className={styles.popoverRow}>
              <label className={styles.popoverLabel}>Start Date</label>
              <input
                type="date"
                className={styles.popoverInput}
                value={popover.start}
                onChange={e => setPopover({ ...popover, start: e.target.value })}
                disabled={popover.phaseName !== "Engineering"} // Lock downstream start dates
                title={popover.phaseName !== "Engineering" ? "Downstream phase starts are auto-calculated." : ""}
              />
            </div>
            
            <div className={styles.popoverRow}>
              <label className={styles.popoverLabel}>End Date</label>
              <input
                type="date"
                className={styles.popoverInput}
                value={popover.end}
                onChange={e => setPopover({ ...popover, end: e.target.value })}
              />
            </div>

            <div className={styles.popoverRow}>
              <label className={styles.popoverLabel}>Duration (Days)</label>
              <input
                type="number"
                min="0"
                className={styles.popoverInput}
                value={popover.duration}
                onChange={e => setPopover({ ...popover, duration: e.target.value })}
              />
            </div>

            <div className={styles.popoverActions}>
              <button className={`${styles.popoverBtn} ${styles.popoverBtnCancel}`} onClick={closePopover}>Cancel</button>
              <button className={`${styles.popoverBtn} ${styles.popoverBtnSave}`} onClick={commitPopover}>Save</button>
            </div>
          </div>
        </>
      )}

      {/* Add Assembly Modal */}
      {modal.open && (
        <div className={styles.modalOverlay} onClick={() => setModal(m => ({ ...m, open: false }))}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalTitle}>Add Assembly</div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Assembly Name</label>
              <input
                className={styles.formInput}
                placeholder="e.g. COIL CAR ASSY #1"
                value={modal.name}
                onChange={e => setModal(m => ({ ...m, name: e.target.value }))}
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Category</label>
              <select
                className={styles.formSelect}
                value={modal.category}
                onChange={e => setModal(m => ({ ...m, category: Number(e.target.value) }))}
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>Category {n}</option>
                ))}
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setModal(m => ({ ...m, open: false }))}>Cancel</button>
              <button
                className={styles.btnSave}
                disabled={!modal.name.trim() || saving}
                onClick={async () => {
                  if (!modal.name.trim()) return;
                  await apiCreateAssembly(modal.name.trim(), modal.category);
                  setModal({ open: false, name: "", category: 1 });
                }}
              >
                {saving ? "Saving..." : "Add Assembly"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
