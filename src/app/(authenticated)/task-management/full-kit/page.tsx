import styles from "@/components/project-management/projectManagement.module.css";
import { getFullKitStatus, getProjects } from "@/lib/database";

export default function FullKitPage() {
  const projects = getProjects() as Array<Record<string, unknown>>;
  const project = projects[0];
  const assemblies = project ? (getFullKitStatus(Number(project.id)) as Array<Record<string, unknown>>) : [];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <div className={styles.heroTitle}>Full Kit Status</div>
          <div className={styles.heroMeta}>
            <span>
              {project
                ? `${String(project.code)} · ${String(project.name)}`
                : "No project available"}
            </span>
            <span>Assembly is ready only when every component is present.</span>
          </div>
        </div>
      </section>

      <section className={styles.stack}>
        {assemblies.map((assembly) => (
          <div key={String(assembly.id)} className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <div className={styles.panelTitle}>{String(assembly.assembly_name)}</div>
                <div className={styles.panelSubtext}>{String(assembly.category_name)}</div>
              </div>
              <div>
                <strong>
                  {Number(assembly.arrived_components ?? 0)}/
                  {Number(assembly.total_components ?? 0)} components arrived
                </strong>
              </div>
            </div>
            <div style={{ height: 12, background: "#ececec", borderRadius: 999, overflow: "hidden" }}>
              <div
                style={{
                  width: `${Number(assembly.readiness_percent)}%`,
                  height: "100%",
                  background:
                    Number(assembly.readiness_percent) === 100 ? "#2f7d32" : "#b22234",
                }}
              />
            </div>
            <div style={{ marginTop: 10 }} className={styles.panelSubtext}>
              {assembly.full_kit_ready
                ? "Full Kit Ready"
                : `Missing: ${(assembly.missing_components as string[]).join(", ")}`}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
