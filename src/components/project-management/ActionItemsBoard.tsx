"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";
import styles from "./projectManagement.module.css";

export default function ActionItemsBoard() {
  const [projects, setProjects] = useState<Array<Record<string, unknown>>>([]);
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [form, setForm] = useState({
    projectId: "",
    title: "",
    owner: "",
    source: "",
    dueDate: "",
    status: "Open",
    notes: "",
  });

  async function refresh() {
    const [itemsResponse, projectsResponse] = await Promise.all([
      fetch("/api/action-items", { cache: "no-store" }),
      fetch("/api/projects", { cache: "no-store" }),
    ]);
    const itemsPayload = await itemsResponse.json();
    const projectsPayload = await projectsResponse.json();
    startTransition(() => {
      setRows(itemsPayload.actionItems);
      setProjects(projectsPayload.projects);
    });
  }

  const load = useEffectEvent(() => {
    void refresh();
  });

  useEffect(() => {
    void load();
  }, []);

  async function createItem() {
    await fetch("/api/action-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({
      projectId: "",
      title: "",
      owner: "",
      source: "",
      dueDate: "",
      status: "Open",
      notes: "",
    });
    await refresh();
  }

  return (
    <div className={styles.stack}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>Create Action Item</div>
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
          <input className={styles.field} placeholder="Owner" value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} />
          <input className={styles.field} placeholder="Source" value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))} />
          <input className={styles.field} type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
          <select className={styles.select} value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
            {["Open", "In Progress", "Closed"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <textarea className={styles.textarea} placeholder="Notes" value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} />
        <div style={{ marginTop: 12 }}>
          <button className="btn btn-primary" type="button" onClick={() => void createItem()}>
            Save Action Item
          </button>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <div className={styles.panelTitle}>Action Items</div>
            <div className={styles.panelSubtext}>
              Meeting follow-ups and issue-driven actions, aligned with the reference app.
            </div>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Project</th>
                <th>Title</th>
                <th>Owner</th>
                <th>Source</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)}>
                  <td>{String(row.project_code)}</td>
                  <td>{String(row.title)}</td>
                  <td>{String(row.owner)}</td>
                  <td>{String(row.source)}</td>
                  <td>{String(row.due_date)}</td>
                  <td>{String(row.status)}</td>
                  <td>{String(row.notes ?? "")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
