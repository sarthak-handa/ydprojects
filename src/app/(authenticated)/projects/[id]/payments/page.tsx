import Link from "next/link";
import PaymentsBoard from "@/components/project-management/PaymentsBoard";
import ProjectDataActions from "@/components/project-management/ProjectDataActions";
import styles from "@/components/project-management/projectManagement.module.css";
import { getProjectById } from "@/lib/database";

export default async function PaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectById(Number(id)) as Record<string, unknown> | undefined;

  if (!project) {
    return <div className={styles.page}>Project not found.</div>;
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <div className={styles.heroTitle}>{String(project.code)} Payments</div>
          <div className={styles.heroMeta}>
            <span>{String(project.name)}</span>
            <span>Vendor payments per project and PO</span>
          </div>
        </div>
        <div className={styles.actions}>
          <ProjectDataActions projectId={Number(project.id)} />
          <Link className="btn btn-outline" href={`/projects/${project.id}/bom`}>
            BOM
          </Link>
        </div>
      </section>
      <PaymentsBoard projectId={Number(project.id)} />
    </div>
  );
}
