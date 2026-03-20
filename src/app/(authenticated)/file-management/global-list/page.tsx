import FileManagementBoard from "@/components/project-management/FileManagementBoard";
import styles from "@/components/project-management/projectManagement.module.css";

export default function GlobalListPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <div className={styles.heroTitle}>File Management · Global List</div>
          <div className={styles.heroMeta}>
            <span>Central document register across all projects.</span>
          </div>
        </div>
      </section>
      <FileManagementBoard mode="global-list" />
    </div>
  );
}
