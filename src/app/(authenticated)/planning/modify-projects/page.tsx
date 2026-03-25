"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, User, CalendarDays, Building2 } from "lucide-react";
import styles from "@/components/Planning/ModifyProjects/layout.module.css";

interface Project {
  id: number;
  code: string;
  name: string;
  manager: string;
  division: string;
  client_name: string;
  due_date: string;
  projected_end_date: string;
}

export default function ModifyProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then((data: { projects?: Project[] }) => {
        setProjects(data.projects ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase()) ||
    p.manager.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span style={{ fontSize: 20 }}>✏️</span>
          <div>
            <div className={styles.projectName}>Modify Projects</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
              Select a project to edit its PERT plan, subtasks, and DPR
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.listWrapper}>
        <div className={styles.listHeader}>
          <div className={styles.listTitle}>
            All Projects {!loading && `(${projects.length})`}
          </div>
          <div className={styles.searchBox}>
            <Search size={14} color="var(--text-secondary)" />
            <input
              className={styles.searchInput}
              placeholder="Search by name, code, or manager…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading && (
          <div className={styles.loading}>
            <span className={styles.spinner} /> Loading projects…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📁</div>
            <div className={styles.emptyText}>No projects found</div>
            <div className={styles.emptySubtext}>
              {search ? "Try a different search term" : "No projects in the database yet"}
            </div>
          </div>
        )}

        <div className={styles.projectGrid}>
          {filtered.map(p => (
            <div
              key={p.id}
              className={styles.projectCard}
              onClick={() => router.push(`/planning/modify-projects/${p.id}`)}
            >
              <div className={styles.cardCode}>{p.code}</div>
              <div className={styles.cardName}>{p.name}</div>
              <div className={styles.cardMeta}>
                <div className={styles.cardMetaItem}>
                  <User size={12} />
                  {p.manager}
                </div>
                <div className={styles.cardMetaItem}>
                  <Building2 size={12} />
                  {p.client_name}
                </div>
                <div className={styles.cardMetaItem}>
                  <CalendarDays size={12} />
                  Due: {p.due_date}
                </div>
              </div>
              <div className={styles.cardArrow}>
                <span className={styles.cardArrowLabel}>Open Project →</span>
                <ArrowRight size={14} color="var(--sidebar-accent)" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
