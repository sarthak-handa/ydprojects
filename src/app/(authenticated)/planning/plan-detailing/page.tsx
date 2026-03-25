"use client";

import React, { useState } from "react";
import {
  GitBranch, List,
  Search, Download, Plus
} from "lucide-react";
import styles from "./plan-detailing.module.css";
import PertBoard from "@/components/Planning/PertBoard";
import AssemblySubtaskPanel from "@/components/Planning/AssemblySubtaskPanel";
import { MOCK_ASSEMBLIES, PertAssembly } from "@/data/mockData";

export default function PlanDetailingPage() {
  const [activeTab, setActiveTab] = useState<"pert" | "tabular">("pert");
  const [assemblies, setAssemblies] = useState<PertAssembly[]>(() =>
    [...MOCK_ASSEMBLIES].sort((a, b) => a.category - b.category)
  );
  const [selectedAssembly, setSelectedAssembly] = useState<PertAssembly | null>(null);

  const handleAssemblyClick = (asm: PertAssembly) => setSelectedAssembly(asm);

  const handleSubtaskSave = (updated: PertAssembly) => {
    setAssemblies(prev => prev.map(a => a.id === updated.id ? updated : a));
    setSelectedAssembly(null);
  };

  const CATEGORY_COLORS: Record<number, string> = {
    1: "#e31837", 2: "#7c3aed", 3: "#0891b2", 4: "#d97706", 5: "#059669",
  };

  return (
    <div className={styles.page}>
      {/* Top Action Bar */}
      <div className={styles.topBar}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "pert" ? styles.active : ""}`}
            onClick={() => setActiveTab("pert")}
          >
            <GitBranch size={16} /> PERT
          </button>
          <button
            className={`${styles.tab} ${activeTab === "tabular" ? styles.active : ""}`}
            onClick={() => setActiveTab("tabular")}
          >
            <List size={16} /> Tabular
          </button>
        </div>

        <div className={styles.actions}>
          <button className={styles.toolBtn}><Search size={18} /></button>
          <button className={styles.toolBtn}><Download size={18} /></button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>

        {/* ── PERT VIEW ───────────────────────────────────────────────────── */}
        {activeTab === "pert" && (
          <PertBoard onAssemblyClick={handleAssemblyClick} />
        )}

        {/* ── TABULAR VIEW ────────────────────────────────────────────────── */}
        {activeTab === "tabular" && (
          <div className={styles.gridContainer}>
            <table className={styles.gridTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Assembly Name</th>
                  <th>Cat.</th>
                  <th style={{ color: "#dc2626" }}>Engineering</th>
                  <th style={{ color: "#f97316" }}>Order / Mfg</th>
                  <th style={{ color: "#16a34a" }}>Assembly</th>
                  <th style={{ color: "#2563eb" }}>Dispatch</th>
                  <th style={{ color: "#854d0e" }}>Total (d)</th>
                  <th>Components</th>
                </tr>
              </thead>
              <tbody>
                {assemblies.map((asm, idx) => {
                  const total = asm.engineering + asm.orderingManufacturing + asm.assembly + asm.dispatch;
                  return (
                    <tr key={asm.id} onClick={() => handleAssemblyClick(asm)}>
                      <td className={styles.idCell}>{idx + 1}</td>
                      <td className={styles.nameCell}>
                        <div className={styles.nameWrapper}>
                          <span
                            className={styles.catDot}
                            style={{ background: CATEGORY_COLORS[asm.category] }}
                          />
                          {asm.name}
                        </div>
                      </td>
                      <td>
                        <span
                          className={styles.catBadge}
                          style={{
                            background: CATEGORY_COLORS[asm.category] + "20",
                            color: CATEGORY_COLORS[asm.category],
                          }}
                        >
                          Cat {asm.category}
                        </span>
                      </td>
                      <td className={styles.phaseCell} style={{ color: "#dc2626" }}>
                        {asm.engineering > 0 ? `${asm.engineering}d` : "–"}
                      </td>
                      <td className={styles.phaseCell} style={{ color: "#f97316" }}>
                        {asm.orderingManufacturing > 0 ? `${asm.orderingManufacturing}d` : "–"}
                      </td>
                      <td className={styles.phaseCell} style={{ color: "#16a34a" }}>
                        {asm.assembly > 0 ? `${asm.assembly}d` : "–"}
                      </td>
                      <td className={styles.phaseCell} style={{ color: "#2563eb" }}>
                        {asm.dispatch > 0 ? `${asm.dispatch}d` : "–"}
                      </td>
                      <td>
                        <span className={styles.totalBadge}>{total}d</span>
                      </td>
                      <td>
                        <span className={styles.compCount}>{asm.subtasks.length} items</span>
                        <span className={styles.clickHint}> → click to edit</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <button className={styles.fab} onClick={() => {/* add assembly */}}>
              <Plus size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Subtask panel */}
      {selectedAssembly && (
        <AssemblySubtaskPanel
          assembly={selectedAssembly}
          onClose={() => setSelectedAssembly(null)}
          onSave={handleSubtaskSave}
        />
      )}
    </div>
  );
}
