import FileManagementBoard from "@/components/project-management/FileManagementBoard";
import styles from "@/components/project-management/projectManagement.module.css";

export default function FolderViewPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <div className={styles.heroTitle}>File Management · Folder View</div>
          <div className={styles.heroMeta}>
            <span>Folder-based document grouping similar to the reference app.</span>
          </div>
        </div>
      </section>
      <FileManagementBoard mode="folder-view" />
    </div>
  );
}
