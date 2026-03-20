import PlanningBoard from "@/components/project-management/PlanningBoard";
import styles from "@/components/project-management/projectManagement.module.css";
import { getProjects } from "@/lib/database";

export default function PlanDetailingPage() {
  const project = (getProjects() as Array<Record<string, unknown>>)[0];

  if (!project) {
    return <div className={styles.page}>Project data is unavailable.</div>;
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <div className={styles.heroTitle}>PERT Planning</div>
          <div className={styles.heroMeta}>
            <span>
              {String(project.code)} · {String(project.name)}
            </span>
            <span>
              Categories 1-5 across Engineering, Ordering & Manufacturing, Assembly,
              Dispatch, and Project End.
            </span>
          </div>
        </div>
      </section>
      <PlanningBoard projectId={Number(project.id)} />
    </div>
  );
}
