"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";
import styles from "./projectManagement.module.css";

export default function RedFlagsBoard() {
  const [projects, setProjects] = useState<Array<Record<string, unknown>>>([]);
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [form, setForm] = useState({
    projectId: "",
    title: "",
    description: "",
    priority: "High",
    raisedBy: "",
    assignedTo: "",
    dueDate: "",
    status: "Open",
  });

  async function refresh() {
    const [flagsResponse, projectsResponse] = await Promise.all([
      fetch("/api/red-flags", { cache: "no-store" }),
      fetch("/api/projects", { cache: "no-store" }),
    ]);
    const flagsPayload = await flagsResponse.json();
    const projectsPayload = await projectsResponse.json();
    startTransition(() => {
      setRows(flagsPayload.redFlags);
      setProjects(projectsPayload.projects);
    });
  }

  const load = useEffectEvent(() => {
    void refresh();
  });

  useEffect(() => {
    void load();
  }, []);

  async function createRedFlag() {
    await fetch("/api/red-flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({
      projectId: "",
      title: "",
      description: "",
      priority: "High",
      raisedBy: "",
      assignedTo: "",
      dueDate: "",
      status: "Open",
    });
    await refresh();
  }

  return (
    <div className={styles.stack}>
      <div className={styles.grid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Active Red Flags</div>
          <div className={styles.metricValue}>
            {rows.filter((row) => row.status !== "Resolved").length}
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Critical</div>
          <div className={styles.metricValue}>
            {rows.filter((row) => row.priority === "Critical").length}
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Open</div>
          <div className={styles.metricValue}>
            {rows.filter((row) => row.status === "Open").length}
          </div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>Raise Red Flag</div>
        </div>
        <div className={styles.formGrid}>
          <select className={styles.select} value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}>
            <option value="">Project</option>
            {projects.map((project) => (
              <option key={String(project.id)} value={String(project.id)}>
                {String(project.code)} · {String(project.name)}
              </option>
            ))}
          </select>
          <input className={styles.field} placeholder="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <select className={styles.select} value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}>
            {["Critical", "High", "Medium"].map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <input className={styles.field} placeholder="Raised By" value={form.raisedBy} onChange={(event) => setForm((current) => ({ ...current, raisedBy: event.target.value }))} />
          <input className={styles.field} placeholder="Assigned To" value={form.assignedTo} onChange={(event) => setForm((current) => ({ ...current, assignedTo: event.target.value }))} />
          <input className={styles.field} type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
          <select className={styles.select} value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
            {["Open", "In Progress", "Resolved"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <textarea className={styles.textarea} placeholder="Describe the management alert" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
        <div style={{ marginTop: 12 }}>
          <button className="btn btn-primary" type="button" onClick={() => void createRedFlag()}>
            Save Red Flag
          </button>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <div className={styles.panelTitle}>Management Alerts</div>
            <div className={styles.panelSubtext}>
              Prioritized across all projects and assemblies.
            </div>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Priority</th>
                <th>Title</th>
                <th>Project</th>
                <th>Assembly</th>
                <th>Raised By</th>
                <th>Assigned To</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)}>
                  <td>{String(row.priority)}</td>
                  <td>
                    <strong>{String(row.title)}</strong>
                    <div className={styles.panelSubtext}>{String(row.description)}</div>
                  </td>
                  <td>{String(row.project_code)}</td>
                  <td>{row.assembly_name ? String(row.assembly_name) : "Project level"}</td>
                  <td>{String(row.raised_by)}</td>
                  <td>{String(row.assigned_to)}</td>
                  <td>{String(row.due_date)}</td>
                  <td>{String(row.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
