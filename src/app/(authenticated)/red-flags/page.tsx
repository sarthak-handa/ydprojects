"use client";

import React, { useEffect, useState } from "react";
import { AlertOctagon, Flag, CheckCircle, Clock } from "lucide-react";
import styles from "./redFlags.module.css";
import { formatDate } from "@/lib/format";

type RedFlagRow = {
  id: string;
  project_code: string;
  project_name: string;
  assembly_name: string;
  title: string;
  description: string;
  priority: string;
  raised_by: string;
  assigned_to: string;
  due_date: string;
  status: string;
};

export default function RedFlagsPage() {
  const [flags, setFlags] = useState<RedFlagRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlags() {
      try {
        const res = await fetch("/api/red-flags");
        if (res.ok) {
          const data = await res.json();
          setFlags(data.redFlags ?? []);
        }
      } catch {
        console.error("Failed to load red flags");
      } finally {
        setLoading(false);
      }
    }
    fetchFlags();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "var(--status-dark-red)";
      case "High": return "var(--status-red)";
      case "Medium": return "var(--status-yellow)";
      default: return "var(--text-muted)";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open": return <AlertOctagon size={16} className={styles.iconRed} />;
      case "In Progress": return <Clock size={16} className={styles.iconYellow} />;
      case "Resolved": return <CheckCircle size={16} className={styles.iconGreen} />;
      default: return <Flag size={16} />;
    }
  };

  const activeFlags = flags.filter(f => f.status !== 'Resolved');
  const resolvedFlags = flags.filter(f => f.status === 'Resolved');

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
            <h1 className={styles.title}>Red Flags</h1>
            <p className={styles.subtitle}>Critical issues and management requirements blocking execution.</p>
        </div>
        <button className="btn btn-primary">Raise New Flag</button>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.statBox}>
            <div className={styles.statLabel}>Total Active</div>
            <div className={styles.statValue}>{activeFlags.length}</div>
        </div>
        <div className={styles.statBox}>
            <div className={styles.statLabel}>Critical Priority</div>
            <div className={`${styles.statValue} ${styles.textRed}`}>
                {activeFlags.filter(f => f.priority === 'Critical').length}
            </div>
        </div>
        <div className={styles.statBox}>
            <div className={styles.statLabel}>Resolved</div>
            <div className={`${styles.statValue} ${styles.textGreen}`}>
                {resolvedFlags.length}
            </div>
        </div>
      </div>

      <div className="card">
        <div className={styles.tableHeader}>Active Flags</div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Flag Details</th>
              <th>Project & Assembly</th>
              <th>Responsibility</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {activeFlags.map(f => (
                <tr key={f.id} className={styles.activeRow}>
                  <td>
                    <div className={styles.statusCell}>
                        {getStatusIcon(f.status)}
                        <span>{f.status}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.flagHeader}>
                        <span className={styles.priorityBadge} style={{ backgroundColor: getPriorityColor(f.priority) }}>
                            {f.priority}
                        </span>
                        <span className={styles.flagTitle}>{f.title}</span>
                    </div>
                    <div className={styles.flagDesc}>{f.description}</div>
                  </td>
                  <td>
                    <div className={styles.projectCode}>{f.project_code}</div>
                    <div className={styles.projectContext}>{f.assembly_name || "General Project Issue"}</div>
                  </td>
                  <td>
                    <div className={styles.person}><strong>To:</strong> {f.assigned_to}</div>
                    <div className={styles.personSub}><strong>By:</strong> {f.raised_by}</div>
                  </td>
                  <td>
                    <div className={styles.dueDate}>{formatDate(f.due_date)}</div>
                  </td>
                </tr>
            ))}
            {activeFlags.length === 0 && (
                <tr><td colSpan={5} className={styles.emptyState}>No active red flags. All clear!</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {resolvedFlags.length > 0 && (
          <div className="card" style={{ marginTop: '24px', opacity: 0.8 }}>
            <div className={styles.tableHeader}>Recently Resolved</div>
            {/* Same table structure can go here or simplified */}
             <table className={styles.table}>
                <tbody>
                  {resolvedFlags.slice(0, 5).map(f => (
                      <tr key={f.id}>
                          <td>{getStatusIcon(f.status)}</td>
                          <td style={{width: '50%'}}><strong>{f.title}</strong> - {f.project_code}</td>
                          <td>Resolved by: {f.assigned_to}</td>
                      </tr>
                  ))}
                </tbody>
             </table>
          </div>
      )}

    </div>
  );
}
