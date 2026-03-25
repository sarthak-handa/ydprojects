"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, GitBranch, LayoutList, Truck } from "lucide-react";
import PertView, { PlanAssembly } from "@/components/Planning/ModifyProjects/PertView";
import TabularView from "@/components/Planning/ModifyProjects/TabularView";
import DispatchView from "@/components/Planning/ModifyProjects/DispatchView";
import styles from "@/components/Planning/ModifyProjects/layout.module.css";

interface Project {
  id: number;
  code: string;
  name: string;
  manager: string;
  client_name: string;
  due_date: string;
  project_start_date: string | null;
}

type TabId = "pert" | "tabular" | "dispatch";

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: "pert",     label: "PERT View",     Icon: GitBranch },
  { id: "tabular",  label: "Tabular View",  Icon: LayoutList },
  { id: "dispatch", label: "Dispatch",       Icon: Truck },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.projectId);

  const [project, setProject] = useState<Project | null>(null);
  const [assemblies, setAssemblies] = useState<PlanAssembly[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("pert");

  // Load project info
  useEffect(() => {
    fetch("/api/projects")
      .then(r => r.json())
      .then((data: Project[]) => {
        const found = data.find(p => p.id === projectId);
        setProject(found ?? null);
      })
      .catch(console.error);
  }, [projectId]);

  // Load assemblies
  const loadAssemblies = useCallback(async () => {
    try {
      const res = await fetch(`/api/plan/${projectId}/assemblies`);
      if (!res.ok) throw new Error("Failed to load assemblies");
      const data = await res.json() as PlanAssembly[];
      setAssemblies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const handleStartDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value || null;
    if (!project) return;
    
    // Optimistic update
    setProject(prev => prev ? { ...prev, project_start_date: newDate } : null);
    
    try {
      await fetch(`/api/projects/${projectId}/start-date`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: newDate }),
      });
      // A new start date reshuffles all phase dates based on durations, so we MUST reload assemblies
      await loadAssemblies();
    } catch (err) {
      console.error("Failed to update project start date", err);
    }
  };

  useEffect(() => {
    loadAssemblies();
  }, [loadAssemblies]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => router.push("/planning/modify-projects")}>
            <ChevronLeft size={14} /> Back
          </button>
          {project && (
            <>
              <span className={styles.projectBadge}>{project.code}</span>
              <div className={styles.projectName}>{project.name}</div>
            </>
          )}
          {!project && <div className={styles.projectName}>Loading…</div>}
        </div>
        <div className={styles.headerRight}>
          {project && (
            <div className={styles.startDateWrapper}>
              <label className={styles.startDateLabel}>Project Start Date:</label>
              <input 
                type="date" 
                className={styles.startDateInput}
                value={project.project_start_date || ""}
                onChange={handleStartDateChange}
              />
            </div>
          )}
          <div style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "right" }}>
            {project?.manager && `Manager: ${project.manager}`}
            {project?.client_name && ` · ${project.client_name}`}
            {project?.due_date && ` · Due: ${project.due_date}`}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`${styles.tab} ${activeTab === id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <span className={styles.spinner} />
            Loading assemblies…
          </div>
        ) : (
          <>
            {activeTab === "pert" && (
              <PertView
                projectId={projectId}
                assemblies={assemblies}
                onAssembliesChange={loadAssemblies}
                onAssemblyClick={() => setActiveTab("tabular")}
              />
            )}
            {activeTab === "tabular" && (
              <TabularView
                assemblies={assemblies}
                onAssembliesChange={loadAssemblies}
              />
            )}
            {activeTab === "dispatch" && <DispatchView />}
          </>
        )}
      </div>
    </div>
  );
}
