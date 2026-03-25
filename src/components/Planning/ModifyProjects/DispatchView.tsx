"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import styles from "./DispatchView.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PhaseDispatchRow {
  month: string;
  project_id: number;
  project_code: string;
  project_name: string;
  assembly_id: number;
  assembly_name: string;
  category: number;
  dispatch_start: string | null;
  dispatch_end: string;
  duration_days: number;
  subtask_count: number;
  avg_completion: number | null;
}

interface DprDispatchRow {
  month: string;
  project_id: number;
  project_code: string;
  project_name: string;
  assembly_id: number;
  assembly_name: string;
  category: number;
  component_name: string;
  total_quantity: number;
  status: string;
}

interface DispatchData {
  phase_based: PhaseDispatchRow[];
  dpr_based: DprDispatchRow[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { background: string; color: string }> = {
  Pending:       { background: "#f3f4f6", color: "#6b7280" },
  "In Progress": { background: "#dbeafe", color: "#1d4ed8" },
  Completed:     { background: "#dcfce7", color: "#15803d" },
  Dispatched:    { background: "#fef3c7", color: "#92400e" },
};

function formatMonth(ym: string) {
  if (!ym) return "Unknown";
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

// ─── Component ────────────────────────────────────────────────────────────────

type Mode = "phase" | "dpr";

export default function DispatchView() {
  const [data, setData] = useState<DispatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("phase");
  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    fetch("/api/plan/dispatch")
      .then(r => r.json())
      .then((d: DispatchData) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className={styles.wrapper}><div className={styles.empty}>Loading dispatch schedule…</div></div>;
  if (!data)   return <div className={styles.wrapper}><div className={styles.empty}>Failed to load dispatch data.</div></div>;

  const phaseRows  = data.phase_based;
  const dprRows    = data.dpr_based;
  const thisMonthPhase = phaseRows.filter(r => r.month === currentMonth);
  const hasBothEmpty   = phaseRows.length === 0 && dprRows.length === 0;

  // ── Phase-based view ───────────────────────────────────────────────────────

  const byMonthPhase = new Map<string, PhaseDispatchRow[]>();
  phaseRows.forEach(r => {
    if (!byMonthPhase.has(r.month)) byMonthPhase.set(r.month, []);
    byMonthPhase.get(r.month)!.push(r);
  });

  // ── DPR-based view ─────────────────────────────────────────────────────────

  const byMonthDpr = new Map<string, DprDispatchRow[]>();
  dprRows.forEach(r => {
    if (!byMonthDpr.has(r.month)) byMonthDpr.set(r.month, []);
    byMonthDpr.get(r.month)!.push(r);
  });

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <div className={styles.title}>Dispatch Schedule</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>
            Phase-based = planned dispatch dates · DPR-based = logged execution entries
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {thisMonthPhase.length > 0 && (
            <div className={styles.thisMonthBadge}>
              🚚 {thisMonthPhase.length} assemblies due this month
            </div>
          )}
          {/* Mode toggle */}
          <div style={{ display: "flex", border: "1px solid var(--border-light)", borderRadius: 6, overflow: "hidden", fontSize: 12 }}>
            <button
              onClick={() => setMode("phase")}
              style={{ padding: "6px 14px", background: mode === "phase" ? "var(--sidebar-accent)" : "#fff",
                       color: mode === "phase" ? "#fff" : "var(--text-primary)", border: "none", cursor: "pointer",
                       fontFamily: "var(--font-primary)", fontWeight: 600 }}
            >
              📅 Phase-based
            </button>
            <button
              onClick={() => setMode("dpr")}
              style={{ padding: "6px 14px", background: mode === "dpr" ? "var(--sidebar-accent)" : "#fff",
                       color: mode === "dpr" ? "#fff" : "var(--text-primary)", border: "none", cursor: "pointer",
                       fontFamily: "var(--font-primary)", fontWeight: 600 }}
            >
              📋 DPR-based
            </button>
          </div>
        </div>
      </div>

      {/* Explanation banner */}
      <div style={{ background: mode === "phase" ? "#eff6ff" : "#fefce8", border: `1px solid ${mode === "phase" ? "#bfdbfe" : "#fde68a"}`,
                    borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "var(--text-primary)" }}>
        {mode === "phase" ? (
          <>
            <strong>📅 Phase-based dispatch</strong> — Shows assemblies whose <em>Dispatch phase end_date</em> is set.
            This is the <strong>AUTHORITATIVE planning view</strong> — what should go out, and when.
            Set dispatch dates in PERT View (click the Dispatch phase cell and enter start/end dates).
          </>
        ) : (
          <>
            <strong>📋 DPR-based dispatch</strong> — Shows DPR entries logged in the execution layer.
            Use this to track <strong>what has actually been recorded</strong> as progressing toward dispatch.
            If this differs from Phase-based view, there is a planning ↔ execution gap.
          </>
        )}
      </div>

      {/* Empty states */}
      {hasBothEmpty && (
        <div className={styles.empty}>
          No dispatch data yet.<br />
          <strong>To populate Phase-based:</strong> In PERT View, click a Dispatch phase cell and enter an end date.<br />
          <strong>To populate DPR-based:</strong> Add DPR entries with dates inside the Tabular View.
        </div>
      )}

      {/* Phase-based table */}
      {mode === "phase" && !hasBothEmpty && (
        <>
          {phaseRows.length === 0 ? (
            <div className={styles.empty}>
              No Dispatch phase end dates set yet.<br />
              Go to PERT View → click a Dispatch cell → enter duration to auto-calculate, or set start/end dates.
            </div>
          ) : (
            [...byMonthPhase.keys()].sort().map(month => {
              const rows = byMonthPhase.get(month)!;
              const isCurrent = month === currentMonth;
              return (
                <div key={month} className={styles.monthBlock}>
                  <div className={styles.monthHeader}>
                    <div className={styles.monthTitle}>{formatMonth(month)}</div>
                    {isCurrent && <span className={styles.monthCurrentTag}>THIS MONTH</span>}
                  </div>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Assembly</th>
                        <th>Cat</th>
                        <th>Dispatch Window</th>
                        <th>Duration</th>
                        <th>Avg. Completion</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(row => {
                        const completion = Math.round(row.avg_completion ?? 0);
                        const isReady    = completion >= 100;
                        const isLate     = !isReady && row.month < currentMonth;
                        return (
                          <tr key={row.assembly_id}>
                            <td>
                              <div className={styles.projectCode}>{row.project_code}</div>
                              <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{row.project_name}</div>
                            </td>
                            <td>{row.assembly_name}</td>
                            <td>{row.category}</td>
                            <td>
                              <span style={{ fontSize: 12 }}>
                                {row.dispatch_start || "—"} → {row.dispatch_end}
                              </span>
                            </td>
                            <td>
                              {row.duration_days > 0 && <span className={styles.qtyBadge}>{row.duration_days}d</span>}
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 60, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                                  <div style={{ width: `${completion}%`, height: "100%",
                                    background: isReady ? "#16a34a" : "#f97316", borderRadius: 3 }} />
                                </div>
                                <span style={{ fontSize: 11 }}>{row.subtask_count > 0 ? `${completion}%` : "—"}</span>
                              </div>
                            </td>
                            <td>
                              {isReady ? (
                                <span className={styles.statusBadge} style={{ background: "#dcfce7", color: "#15803d" }}>✅ Ready</span>
                              ) : isLate ? (
                                <span className={styles.statusBadge} style={{ background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", gap: 4 }}>
                                  <AlertTriangle size={11} /> Late
                                </span>
                              ) : (
                                <span className={styles.statusBadge} style={{ background: "#dbeafe", color: "#1d4ed8" }}>In Progress</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })
          )}
        </>
      )}

      {/* DPR-based table */}
      {mode === "dpr" && !hasBothEmpty && (
        <>
          {dprRows.length === 0 ? (
            <div className={styles.empty}>No DPR entries logged yet. Add DPR entries in the Tabular View.</div>
          ) : (
            [...byMonthDpr.keys()].sort().map(month => {
              const rows = byMonthDpr.get(month)!;
              const isCurrent = month === currentMonth;
              return (
                <div key={month} className={styles.monthBlock}>
                  <div className={styles.monthHeader}>
                    <div className={styles.monthTitle}>{formatMonth(month)}</div>
                    {isCurrent && <span className={styles.monthCurrentTag}>THIS MONTH</span>}
                  </div>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Project</th><th>Assembly</th><th>Cat</th><th>Component</th><th>Qty</th><th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={`${row.assembly_id}-${row.component_name}-${i}`}>
                          <td>
                            <div className={styles.projectCode}>{row.project_code}</div>
                            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{row.project_name}</div>
                          </td>
                          <td>{row.assembly_name}</td>
                          <td>{row.category}</td>
                          <td>{row.component_name}</td>
                          <td><span className={styles.qtyBadge}>{row.total_quantity}</span></td>
                          <td>
                            <span className={styles.statusBadge}
                              style={STATUS_STYLES[row.status] ?? { background: "#f3f4f6", color: "#555" }}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
}
