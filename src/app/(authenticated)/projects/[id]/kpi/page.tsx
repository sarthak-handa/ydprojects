"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, AlertCircle, Clock, CheckCircle2, Zap } from "lucide-react";
import styles from "./kpi.module.css";

export const dynamic = 'force-dynamic';

export default function VelocityKPIPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);

  // Simulated live KPIs for Focus-&-Finish
  const [kpis] = useState({
      velocityScore: 1.12,
      plannedCompletion: 65, // %
      actualCompletion: 72,  // %
      criticalChainBuffer: 18, // days remaining
      feverChartZone: 'Green', // Green, Yellow, Red
      topBottlenecks: [
          { name: "Hydraulic Power Pack", delay: 4, type: "Procurement" },
          { name: "Main Drive Shaft", delay: 2, type: "Manufacturing" }
      ]
  });

  useEffect(() => {
    // Simulate API fetch delay
    setTimeout(() => setLoading(false), 500);
  }, [params.id]);

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
            <h1 className={styles.title}>Focus-&-Finish Velocity</h1>
            <p className={styles.subtitle}>Real-time CCPM control indicators tracking execution speed vs baseline planning.</p>
        </div>
      </div>

      <div className={styles.mainGrid}>
         <div className={styles.scoreCard}>
            <div className={styles.cardIcon}><Zap size={32} color="var(--status-yellow)"/></div>
            <div className={styles.cardContent}>
                <div className={styles.cardLabel}>Current Execution Velocity</div>
                <div className={styles.mainScore}>{kpis.velocityScore}x</div>
                <div className={styles.scoreContext}>
                    <TrendingUp size={14} className={styles.iconGreen}/> 12% faster than planned throughput
                </div>
            </div>
         </div>

         <div className={styles.scoreCard}>
            <div className={styles.cardIcon}><Clock size={32} color="var(--status-blue)"/></div>
            <div className={styles.cardContent}>
                <div className={styles.cardLabel}>Critical Chain Buffer</div>
                <div className={styles.mainScore}>{kpis.criticalChainBuffer} Days</div>
                <div className={styles.scoreContext}>
                    <CheckCircle2 size={14} className={styles.iconGreen}/> Buffer is intact. Zone: {kpis.feverChartZone}
                </div>
            </div>
         </div>
      </div>

      <div className={styles.chartsGrid}>
          {/* Fever Chart Proxy */}
          <div className="card">
              <h3 className={styles.chartTitle}>CCPM Fever Chart (Buffer Penetration)</h3>
              <div className={styles.feverArea}>
                  <div className={styles.feverGreen} style={{ height: '33%', bottom: 0 }}>Green Zone</div>
                  <div className={styles.feverYellow} style={{ height: '33%', bottom: '33%' }}>Yellow Zone</div>
                  <div className={styles.feverRed} style={{ height: '34%', top: 0 }}>Red Zone</div>
                  
                  {/* Point showing we are deep in green zone */}
                  <div className={styles.feverPoint} style={{ bottom: '25%', left: '72%' }}>
                      <div className={styles.pointDot}/>
                      <div className={styles.pointLabel}>Current (72% Comp, 15% Buffer)</div>
                  </div>
              </div>
          </div>

          <div className="card">
              <h3 className={styles.chartTitle}>Top Velocity Bottlenecks</h3>
              <p className={styles.cardSubtitle}>Components slowing down Focus-&-Finish momentum</p>
              
              <ul className={styles.bottleneckList}>
                  {kpis.topBottlenecks.map((b, i) => (
                      <li key={i} className={styles.bItem}>
                          <div className={styles.bInfo}>
                              <AlertCircle size={16} className={styles.iconRed}/>
                              <span className={styles.bName}>{b.name}</span>
                              <span className={styles.bType}>{b.type}</span>
                          </div>
                          <div className={styles.bDelay}>-{b.delay} Days</div>
                      </li>
                  ))}
              </ul>
          </div>
      </div>
    </div>
  );
}
