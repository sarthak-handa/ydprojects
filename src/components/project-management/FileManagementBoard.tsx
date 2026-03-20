"use client";

import { startTransition, useEffect, useEffectEvent, useMemo, useState } from "react";
import styles from "./projectManagement.module.css";

type Mode = "global-list" | "folder-view" | "transmittal";

interface FileManagementBoardProps {
  mode: Mode;
}

export default function FileManagementBoard({ mode }: FileManagementBoardProps) {
  const [projects, setProjects] = useState<Array<Record<string, unknown>>>([]);
  const [files, setFiles] = useState<Array<Record<string, unknown>>>([]);
  const [transmittals, setTransmittals] = useState<Array<Record<string, unknown>>>([]);
  const [fileForm, setFileForm] = useState({
    projectId: "",
    folderName: "",
    fileName: "",
    documentType: "",
    revision: "R0",
    owner: "",
    status: "Draft",
    updatedAt: "",
  });
  const [transmittalForm, setTransmittalForm] = useState({
    projectId: "",
    transmittalNo: "",
    recipient: "",
    documentCount: "1",
    sentDate: "",
    status: "Draft",
    remarks: "",
  });

  async function refresh() {
    const [projectsResponse, filesResponse, transmittalsResponse] = await Promise.all([
      fetch("/api/projects", { cache: "no-store" }),
      fetch("/api/files", { cache: "no-store" }),
      fetch("/api/transmittals", { cache: "no-store" }),
    ]);
    const projectsPayload = await projectsResponse.json();
    const filesPayload = await filesResponse.json();
    const transmittalsPayload = await transmittalsResponse.json();
    startTransition(() => {
      setProjects(projectsPayload.projects);
      setFiles(filesPayload.files);
      setTransmittals(transmittalsPayload.transmittals);
    });
  }

  const load = useEffectEvent(() => {
    void refresh();
  });

  useEffect(() => {
    void load();
  }, []);

  const folderGroups = useMemo(() => {
    return files.reduce<Record<string, Array<Record<string, unknown>>>>((acc, file) => {
      const key = String(file.folder_name);
      acc[key] = [...(acc[key] ?? []), file];
      return acc;
    }, {});
  }, [files]);

  async function saveFile() {
    await fetch("/api/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fileForm),
    });
    setFileForm({
      projectId: "",
      folderName: "",
      fileName: "",
      documentType: "",
      revision: "R0",
      owner: "",
      status: "Draft",
      updatedAt: "",
    });
    await refresh();
  }

  async function saveTransmittal() {
    await fetch("/api/transmittals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...transmittalForm,
        documentCount: Number(transmittalForm.documentCount),
      }),
    });
    setTransmittalForm({
      projectId: "",
      transmittalNo: "",
      recipient: "",
      documentCount: "1",
      sentDate: "",
      status: "Draft",
      remarks: "",
    });
    await refresh();
  }

  if (mode === "folder-view") {
    return (
      <div className={styles.stack}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Folder View</div>
          </div>
          <div className={styles.grid}>
            {Object.entries(folderGroups).map(([folder, folderFiles]) => (
              <div key={folder} className={styles.subCard}>
                <strong>{folder}</strong>
                <div className={styles.panelSubtext}>{folderFiles.length} documents</div>
                {folderFiles.map((file) => (
                  <div key={String(file.id)} className={styles.pill}>
                    {String(file.file_name)} · {String(file.revision)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "transmittal") {
    return (
      <div className={styles.stack}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Create Transmittal</div>
          </div>
          <div className={styles.formGrid}>
            <select className={styles.select} value={transmittalForm.projectId} onChange={(event) => setTransmittalForm((current) => ({ ...current, projectId: event.target.value }))}>
              <option value="">Project</option>
              {projects.map((project) => (
                <option key={String(project.id)} value={String(project.id)}>
                  {String(project.code)} · {String(project.name)}
                </option>
              ))}
            </select>
            <input className={styles.field} placeholder="Transmittal No" value={transmittalForm.transmittalNo} onChange={(event) => setTransmittalForm((current) => ({ ...current, transmittalNo: event.target.value }))} />
            <input className={styles.field} placeholder="Recipient" value={transmittalForm.recipient} onChange={(event) => setTransmittalForm((current) => ({ ...current, recipient: event.target.value }))} />
            <input className={styles.field} placeholder="Document Count" value={transmittalForm.documentCount} onChange={(event) => setTransmittalForm((current) => ({ ...current, documentCount: event.target.value }))} />
            <input className={styles.field} type="date" value={transmittalForm.sentDate} onChange={(event) => setTransmittalForm((current) => ({ ...current, sentDate: event.target.value }))} />
            <input className={styles.field} placeholder="Status" value={transmittalForm.status} onChange={(event) => setTransmittalForm((current) => ({ ...current, status: event.target.value }))} />
          </div>
          <textarea className={styles.textarea} placeholder="Remarks" value={transmittalForm.remarks} onChange={(event) => setTransmittalForm((current) => ({ ...current, remarks: event.target.value }))} />
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" type="button" onClick={() => void saveTransmittal()}>
              Save Transmittal
            </button>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Transmittal Register</div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Transmittal No</th>
                  <th>Recipient</th>
                  <th>Docs</th>
                  <th>Sent Date</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {transmittals.map((row) => (
                  <tr key={String(row.id)}>
                    <td>{String(row.project_code)}</td>
                    <td>{String(row.transmittal_no)}</td>
                    <td>{String(row.recipient)}</td>
                    <td>{Number(row.document_count ?? 0)}</td>
                    <td>{String(row.sent_date)}</td>
                    <td>{String(row.status)}</td>
                    <td>{String(row.remarks ?? "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>Add Document</div>
        </div>
        <div className={styles.formGrid}>
          <select className={styles.select} value={fileForm.projectId} onChange={(event) => setFileForm((current) => ({ ...current, projectId: event.target.value }))}>
            <option value="">Project</option>
            {projects.map((project) => (
              <option key={String(project.id)} value={String(project.id)}>
                {String(project.code)} · {String(project.name)}
              </option>
            ))}
          </select>
          <input className={styles.field} placeholder="Folder" value={fileForm.folderName} onChange={(event) => setFileForm((current) => ({ ...current, folderName: event.target.value }))} />
          <input className={styles.field} placeholder="File Name" value={fileForm.fileName} onChange={(event) => setFileForm((current) => ({ ...current, fileName: event.target.value }))} />
          <input className={styles.field} placeholder="Document Type" value={fileForm.documentType} onChange={(event) => setFileForm((current) => ({ ...current, documentType: event.target.value }))} />
          <input className={styles.field} placeholder="Revision" value={fileForm.revision} onChange={(event) => setFileForm((current) => ({ ...current, revision: event.target.value }))} />
          <input className={styles.field} placeholder="Owner" value={fileForm.owner} onChange={(event) => setFileForm((current) => ({ ...current, owner: event.target.value }))} />
          <input className={styles.field} placeholder="Status" value={fileForm.status} onChange={(event) => setFileForm((current) => ({ ...current, status: event.target.value }))} />
          <input className={styles.field} type="date" value={fileForm.updatedAt} onChange={(event) => setFileForm((current) => ({ ...current, updatedAt: event.target.value }))} />
          <button className="btn btn-primary" type="button" onClick={() => void saveFile()}>
            Save Document
          </button>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>Global List</div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Project</th>
                <th>Folder</th>
                <th>File</th>
                <th>Type</th>
                <th>Revision</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {files.map((row) => (
                <tr key={String(row.id)}>
                  <td>{String(row.project_code)}</td>
                  <td>{String(row.folder_name)}</td>
                  <td>{String(row.file_name)}</td>
                  <td>{String(row.document_type)}</td>
                  <td>{String(row.revision)}</td>
                  <td>{String(row.owner)}</td>
                  <td>{String(row.status)}</td>
                  <td>{String(row.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
