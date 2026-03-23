"use client";

import React, { useState, useEffect } from "react";
import { 
  GitBranch, List, Calendar, Users, 
  Search, Filter, ChevronRight, ChevronDown,
  Lock, Unlock, Download, Upload, Plus
} from "lucide-react";
import styles from "./plan-detailing.module.css";
import TaskDetailModal from "@/components/Planning/TaskDetailModal";

interface WBSNode {
  id: string;
  wbs_id: string;
  name: string;
  type: string;
  duration: string;
  status: string;
  planned_start: string;
  ready_for_po?: string;
  ready_for_assembly?: string;
  isExpanded?: boolean;
}

export default function PlanDetailingPage() {
  const [activeTab, setActiveTab] = useState("tabular");
  const [isLocked, setIsLocked] = useState(false);
  const [wbsNodes, setWbsNodes] = useState<WBSNode[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // In a real app, this would fetch from /api/planning/wbs
    // For now we'll simulate the seeded data
    setWbsNodes([
      { id: "wbs-1", wbs_id: "1", name: "Category 1 - Engineering", type: "Category", duration: "60d", status: "In Progress", planned_start: "2026-01-01", ready_for_po: "10d", ready_for_assembly: "50d", isExpanded: true },
      { id: "wbs-2", wbs_id: "1.1", name: "Uncoiler Shell Fabrication", type: "Assembly", duration: "25d", status: "In Progress", planned_start: "2026-01-10", ready_for_po: "5d", ready_for_assembly: "20d", isExpanded: true },
      { id: "wbs-3", wbs_id: "1.1.1", name: "Main Mandrel Shaft", type: "Component", duration: "12d", status: "Completed", planned_start: "2026-01-12", ready_for_po: "2d", ready_for_assembly: "10d" },
      { id: "wbs-4", wbs_id: "1.1.2", name: "Bearing Housing", type: "Component", duration: "15d", status: "Ordered", planned_start: "2026-01-15", ready_for_po: "3d", ready_for_assembly: "12d" },
      { id: "wbs-5", wbs_id: "1.2", name: "Drive Train Assembly", type: "Assembly", duration: "30d", status: "Pending", planned_start: "2026-02-10", ready_for_po: "10d", ready_for_assembly: "20d" },
    ]);
  }, []);

  const toggleNode = (id: string) => {
    setWbsNodes(nodes => nodes.map(node => 
      node.id === id ? { ...node, isExpanded: !node.isExpanded } : node
    ));
  };

  const openTaskDetail = (task: any) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.page}>
      {/* Top Action Bar */}
      <div className={styles.topBar}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === "pert" ? styles.active : ""}`}
            onClick={() => setActiveTab("pert")}
          >
            <GitBranch size={16} /> PERT
          </button>
          <button 
            className={`${styles.tab} ${activeTab === "tabular" ? styles.active : ""}`}
            onClick={() => setActiveTab("tabular")}
          >
            <List size={16} /> Tabular
          </button>
          <button 
            className={`${styles.tab} ${activeTab === "timeline" ? styles.active : ""}`}
            onClick={() => setActiveTab("timeline")}
          >
            <Calendar size={16} /> Timeline
          </button>
          <button 
            className={`${styles.tab} ${activeTab === "resource" ? styles.active : ""}`}
            onClick={() => setActiveTab("resource")}
          >
            <Users size={16} /> Resource
          </button>
        </div>

        <div className={styles.actions}>
          <button className={styles.toolBtn}><Search size={18} /></button>
          <button className={styles.toolBtn}><Filter size={18} /></button>
          <button className={styles.toolBtn}><Download size={18} /></button>
          <button className={styles.toolBtn}><Upload size={18} /></button>
          <div className={styles.divider} />
          <button 
            className={`${styles.checkoutBtn} ${isLocked ? styles.locked : ""}`}
            onClick={() => setIsLocked(!isLocked)}
          >
            {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
            {isLocked ? "Check-In" : "Check-Out"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {activeTab === "tabular" && (
          <div className={styles.gridContainer}>
            <table className={styles.gridTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Activity Name</th>
                  <th>Duration</th>
                  <th>READY FOR PO</th>
                  <th>READY FOR ASSEMBLY</th>
                  <th>Status</th>
                  <th>Manager</th>
                </tr>
              </thead>
              <tbody>
                {wbsNodes.map(node => {
                  // Basic rendering logic to show indentation
                  const depth = node.wbs_id.split('.').length - 1;
                  const isParent = wbsNodes.some(n => n.wbs_id.startsWith(node.wbs_id + '.') && n.wbs_id !== node.wbs_id);
                  
                  // Simplified visibility logic
                  if (depth > 0) {
                    const parentId = node.wbs_id.split('.').slice(0, -1).join('.');
                    const parent = wbsNodes.find(n => n.wbs_id === parentId);
                    if (parent && !parent.isExpanded) return null;
                  }

                  return (
                    <tr key={node.id} onClick={() => openTaskDetail(node)}>
                      <td className={styles.idCell}>{node.wbs_id}</td>
                      <td className={styles.nameCell}>
                        <div style={{ paddingLeft: `${depth * 20}px` }} className={styles.nameWrapper}>
                          {isParent && (
                            <button 
                              className={styles.toggleBtn}
                              onClick={(e) => { e.stopPropagation(); toggleNode(node.id); }}
                            >
                              {node.isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                          )}
                          {!isParent && <div className={styles.dot} />}
                          <span className={node.type === "Category" ? styles.categoryName : ""}>
                            {node.name}
                          </span>
                        </div>
                      </td>
                      <td>{node.duration}</td>
                      <td className={styles.phaseCell}>{node.ready_for_po}</td>
                      <td className={styles.phaseCell}>{node.ready_for_assembly}</td>
                      <td>
                        <span className={`${styles.badge} ${styles[node.status.toLowerCase().replace(" ", "")]}`}>
                          {node.status}
                        </span>
                      </td>
                      <td>{depth === 0 ? "Aditya Saini" : depth === 1 ? "Aditya Saini" : "Om Dev"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <button className={styles.fab}>
              <Plus size={24} />
            </button>
          </div>
        )}

        {activeTab === "pert" && (
          <div className={styles.pertContainer}>
            <div className={styles.pertPlaceholder}>
              <GitBranch size={48} />
              <h3>PERT Flowchart View</h3>
              <p>Visualizing dependencies and Critical Chain constraints for project YD-2601.</p>
              <div className={styles.nodePreview}>
                <div className={styles.node}>K.O.M (1d)</div>
                <div className={styles.arrow} />
                <div className={styles.node}>Engineering (60d)</div>
                <div className={styles.arrow} />
                <div className={styles.node}>Assembly (90d)</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <TaskDetailModal 
        isOpen={isModalOpen}
        task={selectedTask}
        onClose={() => setIsModalOpen(false)}
        onSave={(updated) => {
          console.log("Saving task:", updated);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
