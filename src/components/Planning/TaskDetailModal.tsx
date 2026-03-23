"use client";

import React, { useState } from "react";
import { 
  X, Clock, Users, Tag, CreditCard, Box, 
  MapPin, CheckCircle, Calculator, Trash2, 
  List, Save, Activity, Layers
} from "lucide-react";
import styles from "./TaskDetailModal.module.css";

interface TaskDetailModalProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTask: any) => void;
}

const CATEGORIES = [
  { id: "duration", label: "Duration", icon: <Clock size={16} /> },
  { id: "contractor", label: "Contractor", icon: <Users size={16} /> },
  { id: "score", label: "Score", icon: <Activity size={16} /> },
  { id: "manager", label: "Manager", icon: <Users size={16} /> },
  { id: "resource", label: "Resource", icon: <Layers size={16} /> },
  { id: "material", label: "Material", icon: <Box size={16} /> },
  { id: "mat-rule", label: "Mat. Rule", icon: <Tag size={16} /> },
  { id: "cost", label: "Cost", icon: <CreditCard size={16} /> },
  { id: "cost-rule", label: "Cost Rule", icon: <Tag size={16} /> },
  { id: "revenue", label: "Revenue", icon: <CreditCard size={16} /> },
  { id: "department", label: "Department", icon: <MapPin size={16} /> },
  { id: "work-area", label: "Work Area", icon: <MapPin size={16} /> },
];

export default function TaskDetailModal({ task, isOpen, onClose, onSave }: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState("duration");
  const [formData, setFormData] = useState(task || {});

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <div className={styles.iconBox}>
              <CheckCircle size={20} className={styles.checkIcon} />
            </div>
            <div>
              <h2 className={styles.taskName}>{formData.name || "Unnamed Task"}</h2>
              <p className={styles.taskH_index}>
                of {formData.category_name || "Category"} &bull; ID: {formData.wbs_id}
              </p>
            </div>
          </div>
          
          <div className={styles.headerActions}>
            <button className={styles.toolBtn} title="Stopwatch"><Clock size={18} /></button>
            <button className={styles.toolBtn} title="Calculator"><Calculator size={18} /></button>
            <button className={styles.toolBtn} title="Save" onClick={() => onSave(formData)}><Save size={18} /></button>
            <button className={styles.toolBtn} title="Delete"><Trash2 size={18} /></button>
            <button className={styles.toolBtn} title="List"><List size={18} /></button>
            <div className={styles.divider} />
            <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        {/* Content Area */}
        <div className={styles.content}>
          {/* Internal Sidebar */}
          <div className={styles.modalSidebar}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`${styles.sidebarItem} ${activeTab === cat.id ? styles.active : ""}`}
                onClick={() => setActiveTab(cat.id)}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Form Area */}
          <div className={styles.formArea}>
            {activeTab === "duration" && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Duration Configuration</h3>
                <div className={styles.fieldGroup}>
                  <label>Original Duration (Days)</label>
                  <input 
                    type="text" 
                    value={formData.duration || ""} 
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label>Suggested Remaining Duration</label>
                  <input 
                    type="text" 
                    placeholder="Auto-calculated"
                    disabled
                  />
                </div>
                <div className={styles.infoBox}>
                  <p>Duration rollups are calculated based on nested child nodes for Assembly level tasks.</p>
                </div>
              </div>
            )}
            
            {activeTab === "contractor" && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Contractor & Vendor Assignee</h3>
                <div className={styles.fieldGroup}>
                  <label>Vendor Name</label>
                  <input 
                    type="text" 
                    value={formData.contractor || ""} 
                    onChange={(e) => handleInputChange("contractor", e.target.value)}
                    placeholder="e.g. Atlas Drives"
                  />
                </div>
              </div>
            )}

            {activeTab === "department" && (
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Department Details</h3>
                <div className={styles.fieldGroup}>
                  <label>Department</label>
                  <select 
                    value={formData.department || ""} 
                    onChange={(e) => handleInputChange("department", e.target.value)}
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Procurement">Procurement</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Quality">Quality</option>
                  </select>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== "duration" && activeTab !== "contractor" && activeTab !== "department" && (
              <div className={styles.emptyState}>
                <p>Configuring {activeTab} metadata...</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.configBtn}>Activity Config.</button>
          <div className={styles.footerRight}>
            <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button className={styles.submitBtn} onClick={() => onSave(formData)}>
              <CheckCircle size={16} /> Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
