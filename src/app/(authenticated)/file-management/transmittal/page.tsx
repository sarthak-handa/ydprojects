import FileManagementBoard from "@/components/project-management/FileManagementBoard";
import styles from "@/components/project-management/projectManagement.module.css";

export default function TransmittalPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <div className={styles.heroTitle}>File Management · Transmittal</div>
          <div className={styles.heroMeta}>
            <span>Outgoing document transmittal register and creation flow.</span>
          </div>
        </div>
      </section>
      <FileManagementBoard mode="transmittal" />
    </div>
  );
}
