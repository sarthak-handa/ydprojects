'use client';

import React from 'react';
import { performanceData } from '@/data/mockData';
import { Filter } from 'lucide-react';
import styles from '../dashboard.module.css';

export default function PerformancePage() {
  const { timeline, sCurve } = performanceData;

  const circumference = 2 * Math.PI * 68;
  const offset = circumference - (sCurve.achieved / sCurve.target) * circumference;

  return (
    <div className={styles.dashboard}>
      <div className={styles.filterRow}>
        <span className="chip">Division (1) ×</span>
        <span className="chip">Project ({72}) ×</span>
        <button className={styles.card} style={{ padding: '6px 10px', cursor: 'pointer' }}>
          <Filter size={14} />
        </button>
      </div>

      {/* Row 1: Timeline + Timeline Trend */}
      <div className={styles.gridRow}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>TIMELINE</div>
          <div className={styles.kpiRow}>
            <div>
              <div className={styles.barChart}>
                <div className={`${styles.bar} ${styles.red}`} style={{ height: `${(timeline.red / 72) * 120}px` }}>
                  {timeline.red}
                </div>
                <div className={`${styles.bar} ${styles.yellow}`} style={{ height: `${Math.max((timeline.yellow / 72) * 120, 20)}px` }}>
                  {timeline.yellow}
                </div>
                <div className={`${styles.bar} ${styles.green}`} style={{ height: `${Math.max((timeline.green / 72) * 120, 20)}px` }}>
                  {timeline.green}
                </div>
              </div>
              <div className={styles.barLabels}>
                <div className={`${styles.barLabel} ${styles.red}`}>{timeline.red}</div>
                <div className={`${styles.barLabel} ${styles.yellow}`}>{timeline.yellow}</div>
                <div className={`${styles.barLabel} ${styles.green}`}>{timeline.green}</div>
              </div>
            </div>

            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>PROJECTS</div>
              <div className={styles.kpiValue}>{timeline.totalProjects}</div>
            </div>

            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>AVERAGE DELAY</div>
              <div className={`${styles.kpiValue} ${styles.red}`}>{timeline.averageDelay}D</div>
            </div>

            <div className={styles.kpiBlock}>
              <div className={styles.impactText}>{timeline.financialImpact}</div>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.trendCard}`}>
          <div className={styles.cardTitle}>TIMELINE TREND</div>
          <div className={styles.trendBg} />
          <div className={styles.kpiBlock}>
            <div className={styles.kpiTitle}>AVG PROJECT DELAY</div>
            <div className={styles.trendValue}>
              {timeline.trendPercent}%<span className={styles.trendArrow}>↗</span>
            </div>
            <div className={styles.trendLabel}>IN LAST 3 MONTHS</div>
          </div>
        </div>
      </div>

      {/* Row 2: S-Curve + placeholder */}
      <div className={styles.gridRow}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>OVERALL REPORT (S CURVE)<sub>({sCurve.fiscalYear})</sub></div>
          <div className={styles.gaugeContainer}>
            <div className={styles.gauge}>
              <svg className={styles.gaugeCircle} viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="68" fill="none" stroke="#e0e0e0" strokeWidth="8" />
                <circle
                  cx="80" cy="80" r="68"
                  fill="none"
                  stroke="#0db4b9"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  transform="rotate(-90 80 80)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className={styles.gaugeValue}>{Math.round(sCurve.achieved)}%</div>
            </div>
            <div className={styles.gaugeStats}>
              <div className={styles.gaugeStat}>
                <span className={styles.gaugeStatLabel}>ACHIEVED</span>
                <span className={styles.gaugeStatValue}>{sCurve.achieved}</span>
              </div>
              <div className={styles.gaugeStat}>
                <span className={styles.gaugeStatLabel}>TARGET</span>
                <span className={styles.gaugeStatValue}>{sCurve.target}</span>
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div className={styles.gaugeStatLabel}>PROJECTED</div>
              <div className={styles.projectedValue}>
                {sCurve.projected}%<span style={{ fontSize: '16px' }}>↘</span>
              </div>
              <div className={styles.projectedSub}>THAN TARGET ⓘ</div>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.trendCard}`}>
          <div className={styles.cardTitle}>EARNED VALUE TREND</div>
          <div className={styles.trendBg} />
          <div className={styles.kpiBlock}>
            <div className={styles.kpiTitle}>EARNED VALUE</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--status-green)' }}>
              ₹ 436.67 Cr
            </div>
            <div className={styles.trendLabel}>TOTAL EARNED</div>
          </div>
        </div>
      </div>

      {/* Row 3: Task Throughput + Full Kit */}
      <div className={styles.gridRowEqual}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>TASK THROUGHPUT</div>
          <div className={styles.kpiRow}>
            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>ACHIEVED</div>
              <div className={styles.kpiValue}>{performanceData.taskThroughput.achieved}</div>
            </div>
            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>TARGET</div>
              <div className={styles.kpiValue}>{performanceData.taskThroughput.target}</div>
            </div>
            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>PROJECTED</div>
              <div className={`${styles.kpiValue} ${styles.red}`}>{performanceData.taskThroughput.projected}</div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>FULL KIT</div>
          <div className={styles.kpiRow}>
            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>ON-TIME %</div>
              <div className={`${styles.kpiValue} ${styles.green}`}>{performanceData.fullKit.onTime}%</div>
            </div>
            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>AVG READINESS</div>
              <div className={styles.kpiValue}>{performanceData.fullKit.avgReadiness}%</div>
            </div>
            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>AVG DELAY</div>
              <div className={`${styles.kpiValue} ${styles.red}`}>{performanceData.fullKit.avgDelay}d</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Overall Health */}
      <div className={styles.gridRowEqual}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>OVERALL HEALTH</div>
          <div className={styles.kpiRow}>
            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>HEALTH SCORE</div>
              <div className={`${styles.kpiValue} ${styles.red}`}>{performanceData.overallHealth.score}%</div>
              <div className={styles.kpiSubtext}>Based on timeline, throughput & quality metrics</div>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.trendCard}`}>
          <div className={styles.cardTitle}>OVERALL HEALTH TREND</div>
          <div className={styles.trendBg} />
          <div className={styles.kpiBlock}>
            <div className={styles.kpiTitle}>HEALTH SCORE CHANGE</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--status-green)' }}>
              {performanceData.overallHealth.trend}%<span style={{ fontSize: '16px' }}>↘</span>
            </div>
            <div className={styles.trendLabel}>IN LAST 3 MONTHS</div>
          </div>
        </div>
      </div>
    </div>
  );
}
