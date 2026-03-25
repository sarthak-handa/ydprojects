"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Box, CircleDot } from "lucide-react";
import styles from "./equipment.module.css";

type RawWbsData = Record<string, unknown>;

type WbsRow = {
  id: string;
  wbs_id: string;
  task_id: string;
  name: string;
  type: string;
  duration: string;
  status: string;
  planned_start: string;
  planned_end: string;
  raw_data: RawWbsData;
};

type TreeNode = WbsRow & {
  children: TreeNode[];
  expanded?: boolean;
};

function getRawValue(
  rawData: RawWbsData,
  key: string,
  fallback: string,
) {
  const value = rawData[key];
  return value == null || value === "" ? fallback : String(value);
}

export default function EquipmentTree({ projectId }: { projectId: string }) {
  const [data, setData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/projects/${projectId}/wbs`);
        const payload = (await res.json()) as {
          rows?: WbsRow[];
        };
        setData(buildTree(payload.rows ?? []));
      } catch (error) {
        console.error("Failed to load BOM data", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [projectId]);

  function buildTree(rows: WbsRow[]) {
    const rootNodes: TreeNode[] = [];
    const map = new Map<string, TreeNode>();

    rows.forEach((row) => {
      map.set(row.wbs_id, {
        ...row,
        children: [],
        expanded: row.type === "TASK" || row.type === "Subtask",
      });
    });

    rows.forEach((row) => {
      const node = map.get(row.wbs_id);
      if (!node) {
        return;
      }

      const parentIndex = row.wbs_id.substring(0, row.wbs_id.lastIndexOf("."));
      if (parentIndex && map.has(parentIndex)) {
        map.get(parentIndex)?.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  }

  function toggleExpand(node: TreeNode) {
    node.expanded = !node.expanded;
    setData([...data]);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "CO":
        return "var(--status-green)";
      case "IP":
        return "var(--status-yellow)";
      default:
        return "var(--status-red)";
    }
  }

  function renderNode(node: TreeNode, level = 0) {
    const hasChildren = node.children.length > 0;
    const isMaterial = node.type === "date";

    return (
      <React.Fragment key={node.id}>
        <div
          className={`${styles.treeRow} ${styles[`level${level}`]} ${
            isMaterial ? styles.materialRow : ""
          }`}
        >
          <div
            className={styles.treeCellName}
            style={{ paddingLeft: `${level * 24}px` }}
          >
            {hasChildren ? (
              <button
                className={styles.expandBtn}
                onClick={() => toggleExpand(node)}
              >
                {node.expanded ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>
            ) : (
              <span className={styles.expandPlaceholder} />
            )}

            {!isMaterial && <Box size={14} className={styles.nodeIcon} />}
            {isMaterial && (
              <CircleDot size={12} className={styles.materialIcon} />
            )}

            <span className={styles.nodeWbs}>{node.wbs_id}</span>
            <span className={styles.nodeName}>{node.name}</span>
          </div>

          <div className={styles.treeCellStatus}>
            {node.status && (
              <span
                className={styles.statusBadge}
                style={{
                  backgroundColor: getStatusColor(node.status),
                  color: "white",
                }}
              >
                {node.status}
              </span>
            )}
          </div>

          <div className={styles.treeCellDuration}>{node.duration}</div>
          <div className={styles.treeCellDate}>{node.planned_start}</div>
          <div className={styles.treeCellDate}>{node.planned_end}</div>
          <div className={styles.treeCellMetric}>
            {getRawValue(node.raw_data, "Planned Cost Roll-Up", "-")}
          </div>
        </div>

        {isMaterial && (
          <div
            className={styles.bomDetailsRow}
            style={{ paddingLeft: `${level * 24 + 40}px` }}
          >
            <div className={styles.bomDetailItem}>
              <span className={styles.bomDetailLabel}>Material Rule:</span>
              <span className={styles.bomDetailValue}>
                {getRawValue(node.raw_data, "Material Rule", "N/A")}
              </span>
            </div>
            <div className={styles.bomDetailItem}>
              <span className={styles.bomDetailLabel}>Contractor:</span>
              <span className={styles.bomDetailValue}>
                {getRawValue(node.raw_data, "Contractor", "Unassigned")}
              </span>
            </div>
            <div className={styles.bomDetailItem}>
              <span className={styles.bomDetailLabel}>Cost Rule:</span>
              <span className={styles.bomDetailValue}>
                {getRawValue(node.raw_data, "Cost Rule", "N/A")}
              </span>
            </div>
            <div className={styles.bomDetailItem}>
              <span className={styles.bomDetailLabel}>Budget:</span>
              <span className={styles.bomDetailValue}>
                {getRawValue(node.raw_data, "Budgeted Cost", "0.00")}
              </span>
            </div>
          </div>
        )}

        {node.expanded && node.children.map((child) => renderNode(child, level + 1))}
      </React.Fragment>
    );
  }

  if (loading) return <div className="loading-spinner" />;

  if (data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Box size={40} className={styles.emptyIcon} />
        <p>No equipment or WBS data found.</p>
        <p className="text-muted text-sm mt-2">
          Import an Excel planning file to populate this view.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.treeContainer}>
      <div className={styles.treeHeader}>
        <div className={styles.treeCellName}>WBS Hierarchy (Equipments)</div>
        <div className={styles.treeCellStatus}>Status</div>
        <div className={styles.treeCellDuration}>Duration</div>
        <div className={styles.treeCellDate}>Start</div>
        <div className={styles.treeCellDate}>End</div>
        <div className={styles.treeCellMetric}>Cost Roll-Up</div>
      </div>
      <div className={styles.treeBody}>{data.map((node) => renderNode(node))}</div>
    </div>
  );
}
