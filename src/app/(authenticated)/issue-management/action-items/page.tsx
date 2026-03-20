import ActionItemsBoard from "@/components/project-management/ActionItemsBoard";
import styles from "@/components/project-management/projectManagement.module.css";

export default function ActionItemsPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <div className={styles.heroTitle}>Action Items</div>
          <div className={styles.heroMeta}>
            <span>Meeting and follow-up actions aligned to projects and owners.</span>
          </div>
        </div>
      </section>
      <ActionItemsBoard />
    </div>
  );
}
