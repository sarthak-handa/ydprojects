'use client';

import React, { useState } from 'react';
import { mockTasks } from '@/data/mockData';
import { Filter, ChevronDown } from 'lucide-react';
import styles from './task.module.css';

export default function TaskPage() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTasks = statusFilter === 'all' ? mockTasks :
    mockTasks.filter(t => t.status === statusFilter);

  return (
    <div className={styles.taskPage}>
      <div className={styles.filterBar}>
        <span className="chip">Horizon (1) ×</span>
        <span className="chip">Project (1) ×</span>
        <span className="chip">Manager (1) ×</span>
        <span className="chip">Status (1) ×</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className={styles.iconBtn}><Filter size={14} /></button>
        </div>
      </div>

      <div className={styles.taskGrid}>
        {filteredTasks.map(task => (
          <div key={task.id} className={`${styles.taskCard} ${task.status === 'STUCK' ? styles.stuck : ''}`}>
            <div className={styles.taskHeader}>
              <span className={`${styles.statusIndicator} ${styles[task.status.toLowerCase()]}`} />
              <span className={styles.taskId}>{task.id}</span>
              {task.status === 'STUCK' && (
                <span className={styles.stuckBadge}>STUCK</span>
              )}
            </div>
            <div className={styles.taskName}>{task.name}</div>
            <div className={styles.taskMeta}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Manager</span>
                <span className={styles.metaValue}>{task.manager}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Duration</span>
                <span className={styles.metaValue}>{task.duration}</span>
              </div>
            </div>
            <div className={styles.taskProgress}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${task.progress}%`,
                    background: task.status === 'CO' ? 'var(--status-green)' :
                      task.status === 'STUCK' ? 'var(--status-red)' : 'var(--accent-teal)',
                  }}
                />
              </div>
              <span className={styles.progressText}>{task.progress}%</span>
            </div>
            {/* Mini timeline */}
            <div className={styles.miniTimeline}>
              <div className={styles.timelineStrip}>
                <div
                  className={styles.timelineProgress}
                  style={{
                    width: `${task.progress}%`,
                    background: task.status === 'STUCK' ? 'var(--status-red)' : '#333',
                  }}
                />
                {task.progress < 100 && task.status !== 'NS' && (
                  <div
                    className={styles.timelineRemaining}
                    style={{
                      left: `${task.progress}%`,
                      width: `${100 - task.progress}%`,
                      background: task.status === 'STUCK'
                        ? 'repeating-linear-gradient(45deg, #e53935, #e53935 2px, #ef9a9a 2px, #ef9a9a 4px)'
                        : 'repeating-linear-gradient(45deg, #4caf50, #4caf50 2px, #a5d6a7 2px, #a5d6a7 4px)',
                    }}
                  />
                )}
              </div>
              <div className={styles.timelineDates}>
                <span>{task.plannedStart}</span>
                <span>{task.plannedEnd}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
