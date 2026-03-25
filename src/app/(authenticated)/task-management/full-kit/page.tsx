"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import styles from "./fullKit.module.css";

type ProjectSummary = {
  id: number | string;
  code: string;
};

type FullKitApiRow = {
  id: number;
  assembly_name: string;
  category_name: string;
  total_components: number;
  arrived_components: number;
  full_kit_ready: boolean;
};

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
        const projectsResponse = await fetch("/api/projects", {
          cache: "no-store",
        });

        if (!projectsResponse.ok) {
          throw new Error("Failed to load projects");
        }

        const projectsPayload = (await projectsResponse.json()) as {
          projects?: ProjectSummary[];
        };
        const primaryProject = projectsPayload.projects?.[0];

        if (!primaryProject) {
          setAssemblies([]);
          return;
        }

        const projectId = Number(primaryProject.id);
        const projectCode = String(primaryProject.code);
        const fullKitResponse = await fetch(`/api/projects/${projectId}/full-kit`, {
          cache: "no-store",
        });

        if (!fullKitResponse.ok) {
          throw new Error("Failed to load full-kit data");
        }

        const fullKitPayload = (await fullKitResponse.json()) as {
          fullKit?: FullKitApiRow[];
        };

        setAssemblies(
          (fullKitPayload.fullKit ?? []).map((row) => ({
            id: row.id,
            project_id: projectId,
            project_code: projectCode,
            name: row.assembly_name,
            category_name: row.category_name,
            component_count: row.total_components,
            arrived_count: row.arrived_components,
            full_kit_ready: row.full_kit_ready,
          })),
        );
      } catch {
        console.error("Failed to load full kit data");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  if (loading) return <div className="loading-spinner" />;

  const ready = assemblies.filter((assembly) => assembly.full_kit_ready);
  const pending = assemblies.filter((assembly) => !assembly.full_kit_ready);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Full Kit Readiness</h1>
          <p className={styles.subtitle}>
            Assemblies are only cleared for the shop floor when 100% of their
            components have arrived.
          </p>
        </div>
        <div className={styles.statsRow}>
          <div className={styles.statChip}>
            <span className={styles.statLabel}>Total Assemblies</span>
            <span className={styles.statValue}>{assemblies.length}</span>
          </div>
          <div className={styles.statChip}>
            <span className={styles.statLabel}>Ready for Assembly</span>
            <span className={`${styles.statValue} ${styles.textGreen}`}>
              {ready.length}
            </span>
          </div>
          <div className={styles.statChip}>
            <span className={styles.statLabel}>Awaiting Parts</span>
            <span className={`${styles.statValue} ${styles.textRed}`}>
              {pending.length}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.boardGrid}>
        <div className={styles.boardCol}>
          <div className={styles.colHeader}>
            <AlertTriangle size={18} className={styles.iconRed} />
            Awaiting Components
          </div>
          <div className={styles.colBody}>
            {pending.map((assembly) => {
              const pct = Math.round(
                (assembly.arrived_count / (assembly.component_count || 1)) * 100,
              );

              return (
                <div key={assembly.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.projectContext}>
                      {assembly.project_code} - {assembly.category_name}
                    </span>
                    <span className={styles.pctBadge}>{pct}%</span>
                  </div>
                  <div className={styles.assemblyName}>{assembly.name}</div>

                  <div className={styles.progressWrap}>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${pct}%`,
                          backgroundColor: "var(--status-yellow)",
                        }}
                      />
                    </div>
                    <div className={styles.progressText}>
                      {assembly.arrived_count} / {assembly.component_count} parts
                      arrived
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <Link
                      href={`/projects/${assembly.project_id}/equipment`}
                      className={styles.actionBtn}
                    >
                      View Missing BOM <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
            {pending.length === 0 && (
              <div className={styles.emptyText}>All assemblies are ready!</div>
            )}
          </div>
        </div>

        <div className={styles.boardCol}>
          <div className={styles.colHeader}>
            <CheckCircle2 size={18} className={styles.iconGreen} />
            Full Kit Complete (100%)
          </div>
          <div className={styles.colBody}>
            {ready.map((assembly) => (
              <div
                key={assembly.id}
                className={`${styles.card} ${styles.cardReady}`}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.projectContext}>
                    {assembly.project_code} - {assembly.category_name}
                  </span>
                  <span className={`${styles.pctBadge} ${styles.badgeGreen}`}>
                    100%
                  </span>
                </div>
                <div className={styles.assemblyName}>{assembly.name}</div>

                <div className={styles.progressWrap}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: "100%",
                        backgroundColor: "var(--status-deep-green)",
                      }}
                    />
                  </div>
                  <div className={styles.progressText}>
                    All {assembly.component_count} parts arrived
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <button className={styles.actionBtnPrimary}>
                    Release to Shop Floor <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
            {ready.length === 0 && (
              <div className={styles.emptyText}>No assemblies ready yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
