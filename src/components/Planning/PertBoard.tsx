"use client";

import React, { useState, useRef, useCallback } from "react";
import { MOCK_ASSEMBLIES, PertAssembly } from "@/data/mockData";
import styles from "./PertBoard.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "engineering" | "orderingManufacturing" | "assembly" | "dispatch";

interface ContextMenu {
  x: number;
  y: number;
  rowId: string;
}

interface EditingCell {
  rowId: string;
  phase: Phase;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PHASES: { key: Phase; label: string; color: string; bg: string }[] = [
  { key: "engineering",           label: "Engineering",              color: "#dc2626", bg: "#fee2e2" },
  { key: "orderingManufacturing", label: "Ordering & Manufacturing", color: "#f97316", bg: "#fff7ed" },
  { key: "assembly",              label: "Assembly",                 color: "#16a34a", bg: "#dcfce7" },
  { key: "dispatch",              label: "Dispatch",                 color: "#2563eb", bg: "#dbeafe" },
];

const CATEGORY_COLORS: Record<number, string> = {
  1: "#e31837",
  2: "#7c3aed",
  3: "#0891b2",
  4: "#d97706",
  5: "#059669",
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function getProjectEnd(a: PertAssembly) {
  return a.engineering + a.orderingManufacturing + a.assembly + a.dispatch;
}

let idCounter = 100;
function genId() { return `a${++idCounter}`; }

// ─── Component ────────────────────────────────────────────────────────────────

interface PertBoardProps {
  onAssemblyClick?: (assembly: PertAssembly) => void;
}

export default function PertBoard({ onAssemblyClick }: PertBoardProps) {
  const [assemblies, setAssemblies] = useState<PertAssembly[]>(() =>
    [...MOCK_ASSEMBLIES].sort((a, b) => a.category - b.category)
  );
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Context menu ──────────────────────────────────────────────────────────

  const openContextMenu = (e: React.MouseEvent, rowId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, rowId });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleCopy = useCallback(() => {
    if (!contextMenu) return;
    const original = assemblies.find(a => a.id === contextMenu.rowId);
    if (!original) return;
    const copy: PertAssembly = {
      ...original,
      id: genId(),
      name: original.name + " (Copy)",
      subtasks: original.subtasks.map(s => ({ ...s, id: `s${++idCounter}` })),
    };
    setAssemblies(prev => {
      const idx = prev.findIndex(a => a.id === contextMenu.rowId);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    closeContextMenu();
  }, [contextMenu, assemblies]);

  const handleInsert = useCallback((position: "above" | "below") => {
    if (!contextMenu) return;
    const ref = assemblies.find(a => a.id === contextMenu.rowId);
    if (!ref) return;
    const newRow: PertAssembly = {
      id: genId(), name: "New Assembly", category: ref.category,
      engineering: 0, orderingManufacturing: 0, assembly: 0, dispatch: 0, subtasks: [],
    };
    setAssemblies(prev => {
      const idx = prev.findIndex(a => a.id === contextMenu.rowId);
      const next = [...prev];
      next.splice(position === "above" ? idx : idx + 1, 0, newRow);
      return next;
    });
    closeContextMenu();
  }, [contextMenu, assemblies]);

  const handleRemove = useCallback(() => {
    if (!contextMenu) return;
    setAssemblies(prev => prev.filter(a => a.id !== contextMenu.rowId));
    closeContextMenu();
  }, [contextMenu]);

  // ── Inline editing ────────────────────────────────────────────────────────

  const startEdit = (rowId: string, phase: Phase, currentVal: number) => {
    setEditingCell({ rowId, phase });
    setEditValue(String(currentVal));
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const val = parseInt(editValue, 10);
    if (!isNaN(val) && val >= 0) {
      setAssemblies(prev => prev.map(a =>
        a.id === editingCell.rowId ? { ...a, [editingCell.phase]: val } : a
      ));
    }
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditingCell(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  // Group assemblies by category
  const categorised: { cat: number; rows: PertAssembly[] }[] = [];
  assemblies.forEach(a => {
    const last = categorised[categorised.length - 1];
    if (!last || last.cat !== a.category) {
      categorised.push({ cat: a.category, rows: [a] });
    } else {
      last.rows.push(a);
    }
  });

  return (
    <div className={styles.wrapper} onClick={closeContextMenu}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.stickyCol}>Phase / Scope</th>
              {PHASES.map(p => (
                <th key={p.key} style={{ background: p.bg, color: p.color }}>
                  {p.label}
                </th>
              ))}
              <th className={styles.projectEnd}>Project End</th>
            </tr>
          </thead>
          <tbody>
            {categorised.map(({ cat, rows }) => (
              <React.Fragment key={`cat-${cat}`}>
                {/* Category header row */}
                <tr className={styles.categoryRow}>
                  <td colSpan={6} style={{ borderLeft: `4px solid ${CATEGORY_COLORS[cat]}` }}>
                    <span className={styles.catBadge} style={{ background: CATEGORY_COLORS[cat] }}>
                      Category {cat}
                    </span>
                  </td>
                </tr>

                {/* Assembly rows */}
                {rows.map(asm => {
                  const projectEnd = getProjectEnd(asm);
                  return (
                    <tr
                      key={asm.id}
                      className={styles.row}
                      onContextMenu={e => openContextMenu(e, asm.id)}
                      onClick={() => onAssemblyClick?.(asm)}
                    >
                      {/* Frozen label column */}
                      <td className={`${styles.stickyCol} ${styles.nameCell}`}>
                        <span
                          className={styles.catDot}
                          style={{ background: CATEGORY_COLORS[cat] }}
                        />
                        <span className={styles.asmName}>{asm.name}</span>
                      </td>

                      {/* Phase cells */}
                      {PHASES.map(p => {
                        const val = asm[p.key] as number;
                        const isEditing =
                          editingCell?.rowId === asm.id &&
                          editingCell?.phase === p.key;

                        return (
                          <td
                            key={p.key}
                            className={styles.phaseCell}
                            onClick={e => {
                              e.stopPropagation();
                              startEdit(asm.id, p.key, val);
                            }}
                          >
                            {isEditing ? (
                              <input
                                ref={inputRef}
                                className={styles.phaseInput}
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={handleKeyDown}
                                onClick={e => e.stopPropagation()}
                              />
                            ) : (
                              val > 0 && (
                                <div
                                  className={styles.phaseBar}
                                  style={{
                                    background: p.bg,
                                    borderLeft: `3px solid ${p.color}`,
                                    color: p.color,
                                  }}
                                >
                                  {val}d
                                </div>
                              )
                            )}
                          </td>
                        );
                      })}

                      {/* Project End */}
                      <td className={styles.projectEndCell}>
                        {projectEnd > 0 && (
                          <div className={styles.projectEndBar}>
                            {projectEnd}d
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
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
          <button className={styles.menuItem} onClick={handleCopy}>
            📋 Copy Row
          </button>
          <button className={styles.menuItem} onClick={() => handleInsert("above")}>
            ⬆️ Insert Row Above
          </button>
          <button className={styles.menuItem} onClick={() => handleInsert("below")}>
            ⬇️ Insert Row Below
          </button>
          <div className={styles.menuDivider} />
          <button className={`${styles.menuItem} ${styles.menuDanger}`} onClick={handleRemove}>
            🗑️ Remove Row
          </button>
        </div>
      )}
    </div>
  );
}
