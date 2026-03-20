import RedFlagsBoard from "@/components/project-management/RedFlagsBoard";
import styles from "@/components/project-management/projectManagement.module.css";

export default function IssueManagementPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <div className={styles.heroTitle}>Issues</div>
          <div className={styles.heroMeta}>
            <span>Open issue tracking modeled on the reference app&apos;s Issue Mgmt module.</span>
          </div>
        </div>
      </section>
      <RedFlagsBoard />
    </div>
  );
}
