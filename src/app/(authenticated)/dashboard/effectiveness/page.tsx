'use client';

import React from 'react';
import { effectivenessData } from '@/data/mockData';
import { Filter } from 'lucide-react';
import styles from '../dashboard.module.css';

export default function EffectivenessPage() {
  const { stuckTasks, tasks, issues, actionItems } = effectivenessData;

  return (
    <div className={styles.dashboard}>
      <div className={styles.filterRow}>
        <span className="chip">Division (1) ×</span>
        <span className="chip">Project ({72}) ×</span>
        <button className={styles.card} style={{ padding: '6px 10px', cursor: 'pointer' }}>
          <Filter size={14} />
        </button>
      </div>

      {/* Row 1: Stuck Tasks + Stuck Task Trend */}
      <div className={styles.gridRow}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>STUCK TASKS</div>
          <div className={styles.stuckRow}>
            <div className={styles.stuckStats}>
              <div className={styles.kpiTitle}>STUCK / IP TASKS</div>
              <div className={`${styles.stuckStatLine} ${styles.red}`}>
                <span className="label">RED :</span>
                <span className="values">{stuckTasks.red} / {stuckTasks.redTotal}</span>
              </div>
              <div className={`${styles.stuckStatLine} ${styles.yellow}`}>
                <span className="label">YELLOW :</span>
                <span className="values">{stuckTasks.yellow} / {stuckTasks.yellowTotal}</span>
              </div>
              <div className={`${styles.stuckStatLine} ${styles.green}`}>
                <span className="label">GREEN :</span>
                <span className="values">{stuckTasks.green} / {stuckTasks.greenTotal}</span>
              </div>
            </div>

            <div className={styles.miniBarChart}>
              <div>
                <div className={styles.miniBar} style={{ height: '90px', background: 'rgba(229,57,53,0.7)', width: '24px' }} />
                <div className={styles.miniBarLabel}>97%</div>
              </div>
              <div>
                <div className={styles.miniBar} style={{ height: '4px', background: 'rgba(229,57,53,0.3)', width: '24px' }} />
              </div>
              <div>
                <div className={styles.miniBar} style={{ height: '2px', background: 'var(--status-yellow)', width: '12px' }} />
                <div className={styles.miniBarLabel}>0%</div>
              </div>
              <div>
                <div className={styles.miniBar} style={{ height: '60px', background: 'var(--status-green)', width: '12px' }} />
                <div className={styles.miniBarLabel}>75%</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginLeft: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                  <span style={{ width: 8, height: 8, background: '#333', display: 'inline-block' }} /> IP
                  <span style={{ width: 8, height: 8, background: '#ccc', display: 'inline-block', marginLeft: 8 }} /> STUCK
                </div>
              </div>
            </div>

            <div className={styles.stuckBigValue}>
              <div className={styles.kpiTitle}>STUCK TASKS</div>
              <div className={styles.stuckCount} style={{ color: 'var(--status-red)' }}>
                {stuckTasks.stuckCount}<span style={{ fontSize: 18, color: 'var(--text-secondary)' }}>({stuckTasks.stuckPercent}%)</span>
              </div>
              <div className={styles.stuckSub}>OUT OF {stuckTasks.ipTasks} IP TASKS</div>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.trendCard}`}>
          <div className={styles.cardTitle}>STUCK TASK TREND</div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80%', background: 'linear-gradient(180deg, transparent, rgba(229,57,53,0.15))' }} />
          <div className={styles.kpiBlock} style={{ position: 'relative', zIndex: 1 }}>
            <div className={styles.kpiTitle}>STUCK TASKS</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--status-green)' }}>
              {stuckTasks.trendPercent}%<span style={{ fontSize: 18 }}>↘</span>
            </div>
            <div className={styles.trendLabel}>IN LAST 3 MONTHS</div>
          </div>
        </div>
      </div>

      {/* Row 2: Tasks + Tasks Trend */}
      <div className={styles.gridRow}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>TASKS</div>
          <div className={styles.pieContainer}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className={styles.pieLegend}>
                <div className={styles.legendItem}>
                  <div className={styles.legendDot} style={{ background: 'var(--status-yellow)' }} />
                  <span>LEGEND</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendDot} style={{ background: 'var(--accent-teal)' }} />
                  <span>LEGEND</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--status-yellow)' }}>{tasks.ipCount}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#1a0a3e' }}>{tasks.closedCount}</span>
                </div>
              </div>
            </div>
            <div className={styles.pieMock} />
            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>AVERAGE CYCLE TIME</div>
              <div className={`${styles.kpiValue} ${styles.red}`}>{tasks.avgCycleTime}D</div>
              <div className={styles.kpiSubtext}>HIGHER THAN PLANNED</div>
              <div className={styles.kpiSubtext}>IN LAST 3 MONTHS</div>
            </div>
            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>TOTAL CLOSURES</div>
              <div className={`${styles.kpiValue} ${styles.green}`}>{tasks.totalClosures}</div>
              <div className={styles.kpiSubtext}>IN LAST 3 MONTHS</div>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.trendCard}`}>
          <div className={styles.cardTitle}>TASKS TREND</div>
          <div className={styles.trendBg} />
          <div className={styles.kpiBlock} style={{ position: 'relative', zIndex: 1 }}>
            <div className={styles.kpiTitle}>AVERAGE CYCLE TIME</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--status-green)' }}>
              {tasks.cycleTrend}%<span style={{ fontSize: 18 }}>↘</span>
            </div>
            <div className={styles.trendLabel}>IN LAST 3 MONTHS</div>
          </div>
        </div>
      </div>

      {/* Row 3: Issues + Issues Resolution Trend */}
      <div className={styles.gridRow}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>ISSUES</div>
          <div className={styles.kpiRow}>
            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>OPEN</div>
              <div className={`${styles.kpiValue} ${styles.red}`}>{issues.openCount}</div>
            </div>
            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>CLOSED</div>
              <div className={`${styles.kpiValue} ${styles.green}`}>{issues.closedCount}</div>
            </div>
            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>AVG CLOSURE TIME</div>
              <div className={styles.kpiValue}>{issues.avgClosureTime}d</div>
            </div>
            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>TOTAL CLOSURES</div>
              <div className={`${styles.kpiValue} ${styles.green}`}>{issues.totalClosures}</div>
              <div className={styles.kpiSubtext}>IN LAST 3 MONTHS</div>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.trendCard}`}>
          <div className={styles.cardTitle}>ISSUES RESOLUTION TREND</div>
          <div className={styles.trendBg} />
          <div className={styles.kpiBlock} style={{ position: 'relative', zIndex: 1 }}>
            <div className={styles.kpiTitle}>RESOLUTION RATE</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--status-green)' }}>
              {issues.trendPercent}%<span style={{ fontSize: 18 }}>↘</span>
            </div>
            <div className={styles.trendLabel}>IN LAST 3 MONTHS</div>
          </div>
        </div>
      </div>

      {/* Row 4: Action Items */}
      <div className={styles.gridRowEqual}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>ACTION ITEMS</div>
          <div className={styles.kpiRow}>
            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>OPEN</div>
              <div className={`${styles.kpiValue} ${styles.red}`}>{actionItems.openCount}</div>
            </div>
            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>CLOSED</div>
              <div className={`${styles.kpiValue} ${styles.green}`}>{actionItems.closedCount}</div>
            </div>
            <div className={styles.kpiBlock}>
              <div className={styles.kpiTitle}>AVG CLOSURE TIME</div>
              <div className={styles.kpiValue}>{actionItems.avgClosureTime}d</div>
            </div>
          </div>
        </div>

        <div className={`${styles.card} ${styles.trendCard}`}>
          <div className={styles.cardTitle}>ACTION ITEMS TREND</div>
          <div className={styles.trendBg} />
          <div className={styles.kpiBlock} style={{ position: 'relative', zIndex: 1 }}>
            <div className={styles.kpiTitle}>CLOSURE TREND</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--status-green)' }}>
              12%<span style={{ fontSize: 16 }}>↗</span>
            </div>
            <div className={styles.trendLabel}>IN LAST 3 MONTHS</div>
          </div>
        </div>
      </div>
    </div>
  );
}
