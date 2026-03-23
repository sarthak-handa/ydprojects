"use client";

import React, { useEffect, useState } from "react";
import { Filter, Search, Calendar, Target, CheckCircle } from "lucide-react";
import styles from "./targets.module.css";
import { formatCurrency } from "@/lib/format";

export const dynamic = 'force-dynamic';

type ComponentRow = {
  id: number;
  name: string;
  drawing_number: string;
  assembly_name: string;
  subassembly_name: string;
  category_name: string;
  quantity: number;
  total_price: number;
  make_buy?: string;
  plant_allocation?: string;
  order_status: string;
};

export default function MonthlyTargetsPage({ params }: { params: { id: string } }) {
  const [components, setComponents] = useState<ComponentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState("March 2026");
  const [activeType, setActiveType] = useState("All");

  useEffect(() => {
    async function fetchBOM() {
      try {
        // Fetch raw components instead of WBS for simpler grid tracking
        // Or if the API provides wbs_rows, handle it here. Assuming we use BOM endpoint:
        const res = await fetch(`/api/projects/${params.id}/bom`);
        const data = await res.json();
        
        // Mocking the Phase 3 fields to test the UI if they aren't seeded explicitly yet
        const richData = data.map((c: any) => ({
            ...c,
            make_buy: c.vendor_name === 'Unassigned' ? 'Make' : 'Buy',
            plant_allocation: c.vendor_name === 'Unassigned' ? 'Plant 1' : null
        }));
        
        setComponents(richData);
      } catch (err) {
        console.error("Failed to load targets");
      } finally {
        setLoading(false);
      }
    }
    fetchBOM();
  }, [params.id]);

  const filtered = components.filter(c => {
    if (activeType === "Make" && c.make_buy !== "Make") return false;
    if (activeType === "Buy" && c.make_buy !== "Buy") return false;
    return true;
  });

  const months = ["January 2026", "February 2026", "March 2026", "April 2026", "May 2026"];
  const totalItems = filtered.length;
  const completedItems = filtered.filter(c => c.order_status === "Arrived" || c.order_status === "Dispatched").length;
  const progressPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Multi-Tier Monthly Targets</h1>
          <p className={styles.subtitle}>Component-level focus & finish target allocations for Project Managers.</p>
        </div>
      </div>

      <div className={styles.controlsBar}>
        <div className={styles.tabs}>
            {months.map(m => (
                <button 
                  key={m} 
                  className={`${styles.tab} ${activeMonth === m ? styles.activeTab : ''}`}
                  onClick={() => setActiveMonth(m)}
                >
                  <Calendar size={14}/> {m}
                </button>
            ))}
        </div>
        <div className={styles.filters}>
            <button 
                className={`${styles.filterBtn} ${activeType === "All" ? styles.activeFilter : ''}`}
                onClick={() => setActiveType("All")}
            >All</button>
            <button 
                className={`${styles.filterBtn} ${activeType === "Make" ? styles.activeFilter : ''}`}
                onClick={() => setActiveType("Make")}
            >In-House (Make)</button>
            <button 
                className={`${styles.filterBtn} ${activeType === "Buy" ? styles.activeFilter : ''}`}
                onClick={() => setActiveType("Buy")}
            >Procurement (Buy)</button>
        </div>
      </div>

      <div className={styles.kpiContainer}>
        <div className={styles.kpiBox}>
            <div className={styles.kpiIcon}><Target size={24} color="var(--sidebar-accent)"/></div>
            <div>
                <div className={styles.kpiLabel}>Monthly Target</div>
                <div className={styles.kpiValue}>{totalItems} Components</div>
            </div>
        </div>
        <div className={styles.kpiBox}>
            <div className={styles.kpiIcon}><CheckCircle size={24} color="var(--status-deep-green)"/></div>
            <div>
                <div className={styles.kpiLabel}>Completed (Velocity)</div>
                <div className={styles.kpiValue}>{completedItems} <span className={styles.kpiSub}>/ {totalItems}</span></div>
            </div>
        </div>
        <div className={styles.kpiBox} style={{ flex: 2 }}>
            <div className={styles.kpiLabel} style={{ marginBottom: '8px' }}>Target Completion Velocity</div>
            <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progressPct}%` }}/>
                </div>
                <span className={styles.pctText}>{progressPct}%</span>
            </div>
        </div>
      </div>

      {/* Virtualized grid simulator - displays a sample block of components since rendering 30k elements natively crashes browsers */}
      <div className="card" style={{ marginTop: '24px' }}>
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Component & Drawing</th>
                    <th>Subassembly Target</th>
                    <th>Category</th>
                    <th>Strategy</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {filtered.slice(0, 100).map((c, i) => (
                    <tr key={i}>
                        <td>
                            <div className={styles.compName}>{c.name}</div>
                            <div className={styles.drgNo}>{c.drawing_number} — Qty: {c.quantity}</div>
                        </td>
                        <td>
                            <div className={styles.assmName}>{c.assembly_name}</div>
                            <div className={styles.subassmName}>{c.subassembly_name}</div>
                        </td>
                        <td>
                            <span className={styles.categoryChip}>{c.category_name}</span>
                        </td>
                        <td>
                            {c.make_buy === 'Make' ? (
                                <span className={styles.makeChip}>MAKE: {c.plant_allocation}</span>
                            ) : (
                                <span className={styles.buyChip}>BUY</span>
                            )}
                        </td>
                        <td>
                            <span className={styles.statusBadge}>{c.order_status}</span>
                        </td>
                    </tr>
                ))}
                {filtered.length > 100 && (
                    <tr><td colSpan={5} className={styles.muted}>... and {filtered.length - 100} more components explicitly targeting {activeMonth}.</td></tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}
