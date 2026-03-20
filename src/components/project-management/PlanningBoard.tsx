"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";
import styles from "./projectManagement.module.css";

interface PlanningBoardProps {
  projectId: number;
}

const phaseColumns = [
  "Engineering",
  "Ordering & Manufacturing",
  "Assembly",
  "Dispatch",
  "Project End",
];

export default function PlanningBoard({ projectId }: PlanningBoardProps) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);

  async function refresh() {
    const response = await fetch(`/api/projects/${projectId}/assemblies`, {
      cache: "no-store",
    });
    const payload = await response.json();
    const assemblies = payload.assemblies as Array<Record<string, unknown>>;
    const categories = ["Category 1", "Category 2", "Category 3", "Category 4", "Category 5"];
    startTransition(() => {
      setRows(
        categories.map((category) => ({
          category,
          phases: phaseColumns.map((phase) => ({
            phase,
            assemblies: assemblies.filter(
              (assembly) =>
                assembly.category_name === category &&
                assembly.planned_phase === phase,
            ),
          })),
        })),
      );
    });
  }

  const load = useEffectEvent(() => {
    void refresh();
  });

  useEffect(() => {
    void load();
  }, [projectId]);

  async function moveAssembly(assemblyId: number, phase: string) {
    await fetch(`/api/projects/${projectId}/assemblies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "move-phase",
        assemblyId,
        plannedPhase: phase,
      }),
    });
    await refresh();
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <div className={styles.panelTitle}>PERT Planning Matrix</div>
          <div className={styles.panelSubtext}>
            Drag assemblies between phases. Cells show assigned assemblies and completion state.
          </div>
        </div>
      </div>
      <div className={styles.matrix}>
        <div className={styles.cellHead}>Category / Phase</div>
        {phaseColumns.map((phase) => (
          <div key={phase} className={styles.cellHead}>
            {phase}
          </div>
        ))}
        {rows.map((row) => (
          <div key={String(row.category)} style={{ display: "contents" }}>
            <div key={`${String(row.category)}-head`} className={styles.cellHead}>
              {String(row.category)}
            </div>
            {(row.phases as Array<Record<string, unknown>>).map((phase) => (
              <div
                key={`${String(row.category)}-${String(phase.phase)}`}
                className={styles.cell}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  const assemblyId = event.dataTransfer.getData("text/plain");
                  if (assemblyId) {
                    void moveAssembly(Number(assemblyId), String(phase.phase));
                  }
                }}
              >
                <div className={styles.panelSubtext}>{String(phase.phase)}</div>
                {(phase.assemblies as Array<Record<string, unknown>>).map((assembly) => (
                  <div
                    key={String(assembly.id)}
                    className={styles.pill}
                    draggable
                    onDragStart={(event) =>
                      event.dataTransfer.setData("text/plain", String(assembly.id))
                    }
                    title={`${assembly.completion_percent}% complete`}
                  >
                    {String(assembly.name)} · {Number(assembly.completion_percent ?? 0)}%
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
