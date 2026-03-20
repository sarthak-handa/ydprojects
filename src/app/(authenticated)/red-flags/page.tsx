import RedFlagsBoard from "@/components/project-management/RedFlagsBoard";
import styles from "@/components/project-management/projectManagement.module.css";

export default function RedFlagsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <div className={styles.heroTitle}>Red Flags</div>
          <div className={styles.heroMeta}>
            <span>Critical management alerts across projects and assemblies.</span>
          </div>
        </div>
      </section>
      <RedFlagsBoard />
    </div>
  );
}
