import Link from "next/link";
import EquipmentHierarchy from "@/components/project-management/EquipmentHierarchy";
import ProjectDataActions from "@/components/project-management/ProjectDataActions";
import styles from "@/components/project-management/projectManagement.module.css";
import { getProjectById } from "@/lib/database";

export default async function EquipmentPage({
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
          <div className={styles.heroTitle}>{String(project.code)} Equipment List</div>
          <div className={styles.heroMeta}>
            <span>{String(project.name)}</span>
            <span>Manager: {String(project.manager)}</span>
            <span>Client: {String(project.client_name)}</span>
          </div>
        </div>
        <div className={styles.actions}>
          <ProjectDataActions projectId={Number(project.id)} />
          <Link className="btn btn-outline" href={`/projects/${project.id}/bom`}>
            Open BOM
          </Link>
          <Link className="btn btn-outline" href={`/projects/${project.id}/payments`}>
            Payments
          </Link>
        </div>
      </section>
      <EquipmentHierarchy projectId={Number(project.id)} />
    </div>
  );
}
