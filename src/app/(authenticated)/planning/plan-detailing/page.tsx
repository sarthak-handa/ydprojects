'use client';

import React, { useState } from 'react';
import { mockProjects, mockTasks } from '@/data/mockData';
import {
  Grid3X3, AlignJustify, Table, Users, Search, Filter,
  ZoomIn, ZoomOut, RotateCcw, RotateCw, Flag, Settings,
  Maximize2, UserPlus, Columns3, MoreHorizontal, Save
} from 'lucide-react';
import styles from './planDetailing.module.css';

type TabId = 'pert' | 'timeline' | 'tabular' | 'resource';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'pert', label: 'PERT', icon: <Grid3X3 size={16} /> },
  { id: 'timeline', label: 'Timeline', icon: <AlignJustify size={16} /> },
  { id: 'tabular', label: 'Tabular', icon: <Table size={16} /> },
  { id: 'resource', label: 'Resource', icon: <Users size={16} /> },
];

export default function PlanDetailingPage() {
  const [activeTab, setActiveTab] = useState<TabId>('pert');
  const project = mockProjects[5]; // CCL 1500 MM

  return (
    <div className={styles.planDetailing}>
      {/* Tab Bar */}
      <div className={styles.tabBar}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            {tab.label}
          </div>
        ))}

        {activeTab === 'tabular' && (
          <div className={styles.searchBox}>
            <Search size={14} />
            <input className={styles.searchInput} placeholder="Search Tasks/Subtasks ..." />
          </div>
        )}

        {/* Toolbar icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: activeTab !== 'tabular' ? 'auto' : 12 }}>
          <button className={styles.iconBtn}><Filter size={14} /></button>
          <div className={styles.toolbarDivider} />
          <button className={styles.iconBtn}><ZoomIn size={14} /></button>
          <button className={styles.iconBtn}><ZoomOut size={14} /></button>
          <div className={styles.toolbarDivider} />
          <button className={styles.iconBtn}><RotateCcw size={14} /></button>
          <button className={styles.iconBtn}><RotateCw size={14} /></button>
          <div className={styles.toolbarDivider} />
          <button className={styles.iconBtn}><Flag size={14} /></button>
          <button className={styles.iconBtn}><Settings size={14} /></button>
          <button className={styles.iconBtn}><Maximize2 size={14} /></button>
          <button className={styles.iconBtn}><UserPlus size={14} /></button>
        </div>

        <div className={styles.activeTask}>
          2012-Transition
        </div>
      </div>

      {/* Content */}
      <div className={styles.contentArea}>
        {activeTab === 'pert' && <PertView />}
        {activeTab === 'timeline' && <TimelineView chains={project.chains} />}
        {activeTab === 'tabular' && <TabularView />}
        {activeTab === 'resource' && <ResourceView />}
      </div>
    </div>
  );
}

function PertView() {
  return (
    <div className={styles.pertCanvas}>
      <div className={styles.pertHeader}>Transition</div>

      {/* Main node */}
      <div className={styles.pertNode} style={{ left: 120, top: 120 }}>
        2012 - Transition
      </div>

      {/* Arrow */}
      <div
        className={styles.pertArrow}
        style={{ left: 320, top: 133, width: 120 }}
      />

      {/* Milestone */}
      <div className={styles.pertMilestone} style={{ left: 460, top: 120 }}>
        <span className={styles.pertMilestoneLabel}>PE</span>
      </div>

      {/* Additional nodes */}
      <div className={styles.pertNode} style={{ left: 80, top: 220 }}>
        2013 - Engineering Design
      </div>
      <div
        className={styles.pertArrow}
        style={{ left: 290, top: 233, width: 80 }}
      />
      <div className={styles.pertNode} style={{ left: 380, top: 220 }}>
        2014 - Procurement
      </div>
      <div
        className={styles.pertArrow}
        style={{ left: 530, top: 233, width: 80 }}
      />
      <div className={styles.pertNode} style={{ left: 620, top: 220 }}>
        2015 - Manufacturing
      </div>

      <div className={styles.pertNode} style={{ left: 200, top: 320 }}>
        2016 - Site Preparation
      </div>
      <div
        className={styles.pertArrow}
        style={{ left: 390, top: 333, width: 80 }}
      />
      <div className={styles.pertNode} style={{ left: 480, top: 320 }}>
        2017 - Installation
      </div>
      <div
        className={styles.pertArrow}
        style={{ left: 630, top: 333, width: 80 }}
      />
      <div className={styles.pertMilestone} style={{ left: 730, top: 320 }}>
        <span className={styles.pertMilestoneLabel}>PE</span>
      </div>
    </div>
  );
}

function TimelineView({ chains }: { chains: typeof mockProjects[0]['chains'] }) {
  const allTasks = mockTasks;

  return (
    <div className={styles.timelineView}>
      {allTasks.map((task, idx) => (
        <div key={task.id} className={styles.timelineRow}>
          <div className={styles.timelineLabel}>
            <button className={styles.expandBtn}>+</button>
            <span style={{ color: task.status === 'STUCK' ? 'var(--status-red)' : 'inherit' }}>
              {task.name}
            </span>
          </div>
          <div className={styles.timelineBarArea}>
            <div
              className={styles.timelineBar}
              style={{
                left: `${idx * 6 + 5}%`,
                width: `${Math.max(task.progress * 0.6, 8)}%`,
                background: task.status === 'CO' ? 'var(--status-green)' :
                  task.status === 'STUCK' ? 'var(--status-red)' :
                  task.status === 'IP' ? 'var(--accent-teal)' : '#ccc',
              }}
            />
            {task.progress < 100 && task.status !== 'NS' && (
              <div
                className={styles.timelineBar}
                style={{
                  left: `${idx * 6 + 5 + task.progress * 0.6}%`,
                  width: `${(100 - task.progress) * 0.3}%`,
                  background: task.status === 'STUCK'
                    ? 'repeating-linear-gradient(45deg, #e53935, #e53935 3px, #ef9a9a 3px, #ef9a9a 6px)'
                    : 'repeating-linear-gradient(45deg, #4caf50, #4caf50 3px, #a5d6a7 3px, #a5d6a7 6px)',
                }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TabularView() {
  return (
    <div className={styles.tabularView}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Task ID</th>
            <th>Task Name</th>
            <th>Category</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Planned Start</th>
            <th>Planned End</th>
            <th>Progress</th>
            <th>Manager</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {mockTasks.map((task, idx) => (
            <tr key={task.id}>
              <td>{idx + 1}</td>
              <td style={{ fontWeight: 600 }}>{task.id}</td>
              <td>{task.name}</td>
              <td>{task.category}</td>
              <td>{task.duration}</td>
              <td>
                <span className={`${styles.statusBadge} ${styles[task.status.toLowerCase()]}`}>
                  {task.status}
                </span>
              </td>
              <td>{task.plannedStart}</td>
              <td>{task.plannedEnd}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 60, height: 6, background: '#e0e0e0', borderRadius: 3, overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${task.progress}%`, height: '100%',
                      background: task.progress === 100 ? 'var(--status-green)' : 'var(--accent-teal)',
                      borderRadius: 3,
                    }} />
                  </div>
                  <span style={{ fontSize: 11 }}>{task.progress}%</span>
                </div>
              </td>
              <td>{task.manager}</td>
              <td>{task.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResourceView() {
  return (
    <div className={styles.resourceView}>
      <div style={{ textAlign: 'center' }}>
        <Users size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
        <div style={{ fontSize: 16, fontWeight: 500 }}>Resource Allocation View</div>
        <div style={{ fontSize: 13, marginTop: 8 }}>Select a project to view resource allocation and capacity</div>
      </div>
    </div>
  );
}
