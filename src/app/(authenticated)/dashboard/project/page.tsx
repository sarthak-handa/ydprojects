import Link from "next/link";
import ProjectDataActions from "@/components/project-management/ProjectDataActions";
import styles from "@/components/project-management/projectManagement.module.css";
import { getProjects } from "@/lib/database";
import { formatCurrency, formatDate } from "@/lib/format";

export default function ProjectDashboardPage() {
  const projects = getProjects() as Array<Record<string, number | string>>;
  const featured = projects[0];

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <div className={styles.heroTitle}>Project Manager View</div>
          <div className={styles.heroMeta}>
            <span>Live BOM hierarchy, order flow, payments, full-kit, and export/import.</span>
            <span>Seeded on SQLite for local persistence.</span>
          </div>
        </div>
        {featured ? (
          <div className={styles.actions}>
            <ProjectDataActions projectId={Number(featured.id)} />
            <Link className="btn btn-outline" href={`/projects/${featured.id}/equipment`}>
              Open Equipment List
            </Link>
          </div>
        ) : null}
      </section>

      <section className={styles.grid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Projects</div>
          <div className={styles.metricValue}>{projects.length}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>BOM Value</div>
          <div className={styles.metricValue}>
            {formatCurrency(
              projects.reduce(
                (total, project) => total + Number(project.bom_value ?? 0),
                0,
              ),
            )}
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Active Red Flags</div>
          <div className={styles.metricValue}>
            {projects.reduce(
              (total, project) => total + Number(project.active_red_flags ?? 0),
              0,
            )}
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Arrived Components</div>
          <div className={styles.metricValue}>
            {projects.reduce(
              (total, project) => total + Number(project.arrived_components ?? 0),
              0,
            )}
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <div className={styles.panelTitle}>Project Drill-down</div>
            <div className={styles.panelSubtext}>
              Click into assemblies, BOM, payments, or full-kit readiness from any project.
            </div>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Project</th>
                <th>Manager</th>
                <th>Due Date</th>
                <th>Assemblies</th>
                <th>Components</th>
                <th>BOM Value</th>
                <th>Red Flags</th>
                <th>Links</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={String(project.id)}>
                  <td>
                    <strong>{project.code}</strong>
                    <div>{project.name}</div>
                  </td>
                  <td>{project.manager}</td>
                  <td>{formatDate(String(project.due_date))}</td>
                  <td>{Number(project.assembly_count ?? 0)}</td>
                  <td>{Number(project.component_count ?? 0)}</td>
                  <td>{formatCurrency(Number(project.bom_value ?? 0))}</td>
                  <td>{Number(project.active_red_flags ?? 0)}</td>
                  <td>
                    <div className={styles.linkRow}>
                      <Link href={`/projects/${project.id}/equipment`}>Equipment</Link>
                      <Link href={`/projects/${project.id}/bom`}>BOM</Link>
                      <Link href={`/projects/${project.id}/payments`}>Payments</Link>
                    </div>
                    <div className={styles.linkRow}>
                      <Link href="/orders">Orders</Link>
                      <Link href="/task-management/full-kit">Full Kit</Link>
                      <Link href="/red-flags">Red Flags</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
