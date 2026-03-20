'use client';

import React, { useState } from 'react';
import { mockProjects } from '@/data/mockData';
import { Filter, Grid3X3, ArrowRightLeft, Maximize2, Download, ChevronDown, MapPin, List, Check } from 'lucide-react';
import styles from './controlRoom.module.css';

const years = [2024, 2025, 2026, 2027];

export default function ControlRoomPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('project');

  const tabs = [
    { id: 'project', label: 'PROJECT', icon: '☰' },
    { id: 'department', label: 'DEPARTMENT', icon: '👥' },
    { id: 'workarea', label: 'WORKAREA', icon: '🏗️' },
  ];

  const getBarWidth = (progress: number) => Math.max(progress * 3, 30);
  const getBarLeft = (index: number) => 40 + index * 20;

  return (
    <div className={styles.controlRoom}>
      <div className={styles.toolbar}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label} <ChevronDown size={12} />
          </button>
        ))}

        <div className={styles.filterBar} style={{ border: 'none', padding: 0, marginLeft: 'auto' }}>
          <span className="chip">Division (1) ×</span>
          <span className="chip">State (1) ×</span>
          <span className="chip">Project ({mockProjects.length}) ×</span>
        </div>

        <div className={styles.toolbarRight}>
          <button className={styles.iconBtn}><Filter size={16} /></button>
          <button className={styles.iconBtn}><Grid3X3 size={16} /></button>
          <button className={styles.iconBtn}><ArrowRightLeft size={16} /></button>
          <button className={styles.iconBtn}><Maximize2 size={16} /></button>
          <button className={styles.iconBtn}><List size={16} /></button>
          <button className={styles.iconBtn}><Download size={16} /></button>
          <button className={styles.iconBtn}><Check size={16} /></button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.projectList}>
          <div className={styles.divisionHeader}>
            <span>Division : DEFAULT</span>
            <span>0%</span>
          </div>

          {mockProjects.map((project, idx) => (
            <div
              key={project.id}
              className={`${styles.projectCard} ${selectedProject === project.id ? styles.selected : ''}`}
              onClick={() => setSelectedProject(project.id)}
            >
              <div className={`${styles.projectIndex} ${styles[project.status]}`}>
                {String(idx + 1).padStart(2, '0')}
              </div>
              <div className={styles.projectInfo}>
                <div className={styles.projectName}>
                  {project.id} - {project.name}
                </div>
                <div className={styles.projectPM}>PM : {project.manager}</div>
              </div>
              <div className={styles.statusPin}>
                <MapPin size={16} />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.timelineArea}>
          <div className={styles.timelineHeader}>
            {years.map(year => (
              <div key={year} className={styles.yearBlock}>{year}</div>
            ))}
          </div>

          <div style={{ position: 'relative', minHeight: mockProjects.length * 50 }}>
            {/* Today line */}
            <div className={styles.todayLine} style={{ left: `${300 * 2 + 60}px` }}>
              <div className={styles.todayLabel}>
                <span className="today-marker">Today</span>
              </div>
            </div>

            {mockProjects.map((project, idx) => (
              <div key={project.id} className={styles.ganttRow}>
                {project.progress > 0 && (
                  <>
                    <span className={styles.progressLabel} style={{ left: `${getBarLeft(idx) - 44}px` }}>
                      {project.progress}%
                    </span>
                    <div
                      className={`${styles.ganttBar} ${styles.ganttBarProgress}`}
                      style={{
                        left: `${getBarLeft(idx)}px`,
                        width: `${getBarWidth(project.progress)}px`,
                      }}
                    />
                    {project.status === 'red' && (
                      <div
                        className={`${styles.ganttBar} ${styles.ganttBarRed}`}
                        style={{
                          left: `${getBarLeft(idx) + getBarWidth(project.progress) + 4}px`,
                          width: `${Math.max(80, (100 - project.progress) * 2.5)}px`,
                        }}
                      />
                    )}
                    {project.status === 'green' && project.progress < 100 && (
                      <div
                        className={`${styles.ganttBar} ${styles.ganttBarGreen}`}
                        style={{
                          left: `${getBarLeft(idx) + getBarWidth(project.progress) + 4}px`,
                          width: `${Math.max(60, (100 - project.progress) * 2)}px`,
                        }}
                      />
                    )}
                    <div
                      className={`${styles.milestone} ${project.status}`}
                      style={{
                        left: `${getBarLeft(idx) + getBarWidth(project.progress) + Math.max(80, (100 - project.progress) * 2.5) + 20}px`,
                      }}
                    />
                  </>
                )}
                {project.progress === 0 && (
                  <div
                    className={styles.ganttBar}
                    style={{
                      left: `${300 * 2 + 100}px`,
                      width: '200px',
                      background: '#e0e0e0',
                      border: '1px solid #ccc',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
