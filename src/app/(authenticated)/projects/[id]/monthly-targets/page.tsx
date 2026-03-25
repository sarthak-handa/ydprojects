"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Target, CheckCircle } from "lucide-react";
import { useParams } from "next/navigation";
import styles from "./targets.module.css";

export const dynamic = "force-dynamic";

type ApiComponentRow = {
  id: number;
  name: string;
  drawing_number: string;
  assembly_name: string;
  subassembly_name: string;
  category_name: string;
  quantity: number;
  total_price: number;
  vendor_name: string;
  order_status: string;
};

type ComponentRow = ApiComponentRow & {
  make_buy?: string;
  plant_allocation?: string | null;
};

export default function MonthlyTargetsPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const [components, setComponents] = useState<ComponentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState("March 2026");
  const [activeType, setActiveType] = useState("All");

  useEffect(() => {
    async function fetchBom() {
      if (!projectId) {
        setComponents([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/projects/${projectId}/bom`);
        const payload = (await res.json()) as {
          bom?: ApiComponentRow[];
        };

        setComponents(
          (payload.bom ?? []).map((component) => ({
            ...component,
            make_buy: component.vendor_name === "Unassigned" ? "Make" : "Buy",
            plant_allocation:
              component.vendor_name === "Unassigned" ? "Plant 1" : null,
          })),
        );
      } catch {
        console.error("Failed to load targets");
      } finally {
        setLoading(false);
      }
    }

    void fetchBom();
  }, [projectId]);

  const filtered = components.filter((component) => {
    if (activeType === "Make" && component.make_buy !== "Make") return false;
    if (activeType === "Buy" && component.make_buy !== "Buy") return false;
    return true;
  });

  const months = [
    "January 2026",
    "February 2026",
    "March 2026",
    "April 2026",
    "May 2026",
  ];
  const totalItems = filtered.length;
  const completedItems = filtered.filter(
    (component) =>
      component.order_status === "Arrived" ||
      component.order_status === "Dispatched",
  ).length;
  const progressPct =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Multi-Tier Monthly Targets</h1>
          <p className={styles.subtitle}>
            Component-level focus and finish target allocations for project
            managers.
          </p>
        </div>
      </div>

      <div className={styles.controlsBar}>
        <div className={styles.tabs}>
          {months.map((month) => (
            <button
              key={month}
              className={`${styles.tab} ${
                activeMonth === month ? styles.activeTab : ""
              }`}
              onClick={() => setActiveMonth(month)}
            >
              <Calendar size={14} /> {month}
            </button>
          ))}
        </div>
        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${
              activeType === "All" ? styles.activeFilter : ""
            }`}
            onClick={() => setActiveType("All")}
          >
            All
          </button>
          <button
            className={`${styles.filterBtn} ${
              activeType === "Make" ? styles.activeFilter : ""
            }`}
            onClick={() => setActiveType("Make")}
          >
            In-House (Make)
          </button>
          <button
            className={`${styles.filterBtn} ${
              activeType === "Buy" ? styles.activeFilter : ""
            }`}
            onClick={() => setActiveType("Buy")}
          >
            Procurement (Buy)
          </button>
        </div>
      </div>

      <div className={styles.kpiContainer}>
        <div className={styles.kpiBox}>
          <div className={styles.kpiIcon}>
            <Target size={24} color="var(--sidebar-accent)" />
          </div>
          <div>
            <div className={styles.kpiLabel}>Monthly Target</div>
            <div className={styles.kpiValue}>{totalItems} Components</div>
          </div>
        </div>
        <div className={styles.kpiBox}>
          <div className={styles.kpiIcon}>
            <CheckCircle size={24} color="var(--status-deep-green)" />
          </div>
          <div>
            <div className={styles.kpiLabel}>Completed (Velocity)</div>
            <div className={styles.kpiValue}>
              {completedItems} <span className={styles.kpiSub}>/ {totalItems}</span>
            </div>
          </div>
        </div>
        <div className={styles.kpiBox} style={{ flex: 2 }}>
          <div className={styles.kpiLabel} style={{ marginBottom: "8px" }}>
            Target Completion Velocity
          </div>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className={styles.pctText}>{progressPct}%</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "24px" }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Component and Drawing</th>
              <th>Subassembly Target</th>
              <th>Category</th>
              <th>Strategy</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((component) => (
              <tr key={component.id}>
                <td>
                  <div className={styles.compName}>{component.name}</div>
                  <div className={styles.drgNo}>
                    {component.drawing_number} - Qty: {component.quantity}
                  </div>
                </td>
                <td>
                  <div className={styles.assmName}>{component.assembly_name}</div>
                  <div className={styles.subassmName}>
                    {component.subassembly_name}
                  </div>
                </td>
                <td>
                  <span className={styles.categoryChip}>
                    {component.category_name}
                  </span>
                </td>
                <td>
                  {component.make_buy === "Make" ? (
                    <span className={styles.makeChip}>
                      MAKE: {component.plant_allocation}
                    </span>
                  ) : (
                    <span className={styles.buyChip}>BUY</span>
                  )}
                </td>
                <td>
                  <span className={styles.statusBadge}>
                    {component.order_status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length > 100 && (
              <tr>
                <td colSpan={5} className={styles.muted}>
                  ... and {filtered.length - 100} more components targeting{" "}
                  {activeMonth}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
