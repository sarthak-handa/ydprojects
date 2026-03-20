import Link from "next/link";
import BomTable from "@/components/project-management/BomTable";
import ProjectDataActions from "@/components/project-management/ProjectDataActions";
import styles from "@/components/project-management/projectManagement.module.css";
import { getProjectById } from "@/lib/database";

export default async function BomPage({
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
          <div className={styles.heroTitle}>{String(project.code)} BOM</div>
          <div className={styles.heroMeta}>
            <span>{String(project.name)}</span>
            <span>{Number(project.component_count ?? 0)} components</span>
            <span>{Number(project.assembly_count ?? 0)} assemblies</span>
          </div>
        </div>
        <div className={styles.actions}>
          <ProjectDataActions projectId={Number(project.id)} />
          <Link className="btn btn-outline" href={`/projects/${project.id}/equipment`}>
            Equipment Tree
          </Link>
        </div>
      </section>
      <BomTable projectId={Number(project.id)} />
    </div>
  );
}
