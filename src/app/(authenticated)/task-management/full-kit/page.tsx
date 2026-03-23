"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Layers, ArrowRight } from "lucide-react";
import styles from "./fullKit.module.css";
import Link from "next/link";

type AssemblyFullKit = {
  id: number;
  project_id: number;
  project_code: string;
  name: string;
  category_name: string;
  component_count: number;
  arrived_count: number;
  full_kit_ready: boolean;
};

export default function FullKitPage() {
  const [assemblies, setAssemblies] = useState<AssemblyFullKit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch assemblies for the seed project (YD-2601) as an example
        // In a real scenario, this would have a project selector
        const res = await fetch("/api/projects/1/assemblies");
        if(res.ok) {
            const data = await res.json();
            // Map the response to our FullKit type, extracting project info from the first item if needed
            // Since the API returns assembly structure, we format it directly
            const formatted = data.map((a: any) => ({
                id: a.id,
                project_id: 1,
                project_code: "YD-2601",
                name: a.name,
                category_name: a.category_name,
                component_count: a.component_count,
                arrived_count: a.arrived_count,
                full_kit_ready: a.full_kit_ready
            }));
            setAssemblies(formatted);
        }
      } catch (err) {
        console.error("Failed to load full kit data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="loading-spinner" />;

  const ready = assemblies.filter(a => a.full_kit_ready);
  const pending = assemblies.filter(a => !a.full_kit_ready);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Full Kit Readiness</h1>
          <p className={styles.subtitle}>
            Assemblies are only cleared for the shop floor when 100% of their components have arrived.
          </p>
        </div>
        <div className={styles.statsRow}>
            <div className={styles.statChip}>
                <span className={styles.statLabel}>Total Assemblies</span>
                <span className={styles.statValue}>{assemblies.length}</span>
            </div>
            <div className={styles.statChip}>
                <span className={styles.statLabel}>Ready for Assembly</span>
                <span className={`${styles.statValue} ${styles.textGreen}`}>{ready.length}</span>
            </div>
            <div className={styles.statChip}>
                <span className={styles.statLabel}>Awaiting Parts</span>
                <span className={`${styles.statValue} ${styles.textRed}`}>{pending.length}</span>
            </div>
        </div>
      </div>

      <div className={styles.boardGrid}>
        {/* Awaiting Parts Column */}
        <div className={styles.boardCol}>
            <div className={styles.colHeader}>
                <AlertTriangle size={18} className={styles.iconRed} />
                Awaiting Components
            </div>
            <div className={styles.colBody}>
                {pending.map(a => {
                    const pct = Math.round((a.arrived_count / (a.component_count || 1)) * 100);
                    return (
                        <div key={a.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={styles.projectContext}>{a.project_code} · {a.category_name}</span>
                                <span className={styles.pctBadge}>{pct}%</span>
                            </div>
                            <div className={styles.assemblyName}>{a.name}</div>
                            
                            <div className={styles.progressWrap}>
                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: `${pct}%`, backgroundColor: 'var(--status-yellow)' }} />
                                </div>
                                <div className={styles.progressText}>
                                    {a.arrived_count} / {a.component_count} parts arrived
                                </div>
                            </div>
                            
                            <div className={styles.cardFooter}>
                                <Link href={`/projects/${a.project_id}/equipment`} className={styles.actionBtn}>
                                    View Missing BOM <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    );
                })}
                {pending.length === 0 && <div className={styles.emptyText}>All assemblies are ready!</div>}
            </div>
        </div>

        {/* Ready Column */}
        <div className={styles.boardCol}>
            <div className={styles.colHeader}>
                <CheckCircle2 size={18} className={styles.iconGreen} />
                Full Kit Complete (100%)
            </div>
            <div className={styles.colBody}>
                {ready.map(a => (
                    <div key={a.id} className={`${styles.card} ${styles.cardReady}`}>
                        <div className={styles.cardHeader}>
                            <span className={styles.projectContext}>{a.project_code} · {a.category_name}</span>
                            <span className={`${styles.pctBadge} ${styles.badgeGreen}`}>100%</span>
                        </div>
                        <div className={styles.assemblyName}>{a.name}</div>
                        
                        <div className={styles.progressWrap}>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `100%`, backgroundColor: 'var(--status-deep-green)' }} />
                            </div>
                            <div className={styles.progressText}>
                                All {a.component_count} parts arrived
                            </div>
                        </div>
                        
                        <div className={styles.cardFooter}>
                            <button className={styles.actionBtnPrimary}>
                                Release to Shop Floor <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
                {ready.length === 0 && <div className={styles.emptyText}>No assemblies ready yet.</div>}
            </div>
        </div>
      </div>
    </div>
  );
}
