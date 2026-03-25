"use client";

import React, { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import styles from "./resourceMap.module.css";

export const dynamic = 'force-dynamic';

type PlantLoad = {
  plantName: string;
  totalComponents: number;
  inProgress: number;
  openCapacity: number;
  criticalChainBlocks: number;
};

export default function ResourceDeploymentMap() {
  const [loading, setLoading] = useState(true);
  const [plantData, setPlantData] = useState<PlantLoad[]>([]);

  useEffect(() => {
    // Generate simulated dynamic data representing the SQL allocation load across plants
    setTimeout(() => {
        setPlantData([
            { plantName: "Plant 1", totalComponents: 8400, inProgress: 6000, openCapacity: 2400, criticalChainBlocks: 3 },
            { plantName: "Plant 2", totalComponents: 5200, inProgress: 5100, openCapacity: 100, criticalChainBlocks: 8 },
            { plantName: "Plant 3", totalComponents: 9100, inProgress: 4000, openCapacity: 5100, criticalChainBlocks: 0 },
            { plantName: "Plant 4", totalComponents: 3400, inProgress: 3400, openCapacity: 0, criticalChainBlocks: 14 } // Overloaded
        ]);
        setLoading(false);
    }, 600);
  }, []);

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
            <h1 className={styles.title}>Resource Deployment Map</h1>
            <p className={styles.subtitle}>Visually balance the manufacturing & assembly loads across the 4 primary execution facilities.</p>
        </div>
        <div className={styles.timelineControls}>
            <button className={styles.ctrlBtn}>Week View</button>
            <button className={`${styles.ctrlBtn} ${styles.activeBtn}`}>Month View</button>
            <button className={styles.ctrlBtn}>Quarter View</button>
        </div>
      </div>

      <div className={styles.plantsGrid}>
        {plantData.map(p => {
            const usagePct = Math.round((p.inProgress / p.totalComponents) * 100);
            const isOverloaded = usagePct >= 95;
            
            return (
              <div key={p.plantName} className={`${styles.plantCard} ${isOverloaded ? styles.overloadCard : ''}`}>
                 <div className={styles.cardHeader}>
                     <div className={styles.plantTitle}>
                        <Building2 size={18} color={isOverloaded ? 'var(--status-dark-red)' : 'var(--text-secondary)'}/>
                        {p.plantName}
                     </div>
                     <span className={`${styles.statusBadge} ${isOverloaded ? styles.badgeRed : styles.badgeGreen}`}>
                        {usagePct}% Load
                     </span>
                 </div>
                 
                 <div className={styles.cardBody}>
                    <div className={styles.dataRow}>
                        <span className={styles.dataLabel}>WIP Components:</span>
                        <span className={styles.dataValue}>{p.inProgress.toLocaleString()}</span>
                    </div>
                    <div className={styles.dataRow}>
                        <span className={styles.dataLabel}>Open Slot Capacity:</span>
                        <span className={styles.dataValue}>{p.openCapacity.toLocaleString()}</span>
                    </div>
                 </div>

                 <div className={styles.progressTrack}>
                     <div 
                        className={styles.progressFill} 
                        style={{ 
                            width: `${usagePct}%`, 
                            backgroundColor: isOverloaded ? 'var(--status-red)' : 'var(--status-blue)' 
                        }} 
                     />
                 </div>

                 {p.criticalChainBlocks > 0 && (
                     <div className={styles.criticalWarning}>
                        <strong>⚠️ {p.criticalChainBlocks} Blockers</strong> impacting CCPM timelines
                     </div>
                 )}
              </div>
            );
        })}
      </div>

      <div className="card" style={{ marginTop: '32px' }}>
          <div className={styles.ganttHeader}>
             <h3>Live Component Flow Timeline</h3>
             <span className={styles.filterChip}>Filtered by: All Plants</span>
          </div>
          <div className={styles.ganttPlaceholder}>
             {/* A placeholder for a complex D3/Canvas Gantt chart */}
             <div className={styles.ganttLines}>
                <div className={styles.ganttRow}>
                    <div className={styles.ganttLabel}>Plant 1 - Main Floor</div>
                    <div className={styles.ganttTrack}>
                        <div className={styles.ganttBar} style={{ left: '10%', width: '40%', background: 'var(--status-blue)' }}>ASM-UC-101 (40d)</div>
                        <div className={styles.ganttBar} style={{ left: '55%', width: '25%', background: 'var(--status-yellow)' }}>ASM-RC-302 (25d)</div>
                    </div>
                </div>
                <div className={styles.ganttRow}>
                    <div className={styles.ganttLabel}>Plant 2 - Hydraulics</div>
                    <div className={styles.ganttTrack}>
                        <div className={styles.ganttBar} style={{ left: '5%', width: '90%', background: 'var(--status-red)' }}>CRITICAL PATH: ASM-LV-210 (90d)</div>
                    </div>
                </div>
                <div className={styles.ganttRow}>
                    <div className={styles.ganttLabel}>Plant 3 - Light Fab</div>
                    <div className={styles.ganttTrack}>
                        <div className={styles.ganttBar} style={{ left: '30%', width: '15%', background: 'var(--status-green)' }}>Base Frames (15d)</div>
                        <div className={styles.ganttBar} style={{ left: '60%', width: '30%', background: 'var(--status-blue)' }}>Guards (30d)</div>
                    </div>
                </div>
                <div className={styles.ganttRow}>
                    <div className={styles.ganttLabel}>Plant 4 - Testing</div>
                    <div className={styles.ganttTrack}>
                        <div className={styles.ganttBar} style={{ left: '80%', width: '20%', background: 'var(--status-yellow)' }}>Final FAT (20d)</div>
                    </div>
                </div>
             </div>
             
             <div className={styles.ganttAxis}>
                <span>March 1</span>
                <span>March 15</span>
                <span>April 1</span>
                <span>April 15</span>
                <span>May 1</span>
             </div>
          </div>
      </div>
    </div>
  );
}
