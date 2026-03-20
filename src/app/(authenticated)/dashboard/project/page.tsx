'use client';

import React, { useState } from 'react';
import { mockProjects } from '@/data/mockData';
import { Filter, Eye, ArrowRightLeft, Download, ChevronDown, Info } from 'lucide-react';

export default function ProjectDashboardPage() {
  const project = mockProjects[5]; // CCL 1500 MM
  const [viewMode, setViewMode] = useState('workstream');

  const viewTabs = [
    { id: 'workstream', label: 'Workstream View', icon: '📊' },
    { id: 'velocity', label: 'Velocity', icon: '⚡' },
    { id: 'resource', label: 'Resource', icon: '👥' },
    { id: 'mis', label: 'MIS', icon: '🏴' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top tabs */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '8px 16px', background: 'white', borderBottom: '1px solid var(--border-light)'
      }}>
        {viewTabs.map(tab => (
          <button key={tab.id} onClick={() => setViewMode(tab.id)} style={{
            padding: '6px 16px', border: 'none', borderRadius: 4,
            background: viewMode === tab.id ? 'var(--accent-purple)' : 'transparent',
            color: viewMode === tab.id ? 'white' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font-primary)', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
          <span>8 more...</span>
        </div>
      </div>

      {/* Context bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 24,
        padding: '10px 20px', background: 'white', borderBottom: '1px solid var(--border-light)',
        fontSize: 13
      }}>
        <span><strong>Division :</strong> {project.division}</span>
        <span><strong>Project :</strong> {project.id} - {project.name}</span>
        <span><strong>Manager :</strong> {project.manager}</span>
        <span><strong>Projected End :</strong> {project.projectedEnd}</span>
        <span><strong>Due Date :</strong> {project.dueDate}</span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button style={{
            padding: '4px 12px', background: '#e8e8f0', border: 'none',
            borderRadius: 4, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-primary)',
          }}>Project End <ChevronDown size={10} /></button>
          <button style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}><Filter size={14} /></button>
          <button style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}><Eye size={14} /></button>
          <button style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}><ArrowRightLeft size={14} /></button>
          <button style={{ padding: '4px 8px', border: 'none', background: 'none', cursor: 'pointer' }}><Download size={14} /></button>
        </div>
      </div>

      {/* Gantt area */}
      <div style={{ flex: 1, overflow: 'auto', background: '#fafbfc', position: 'relative' }}>
        {/* Year header */}
        <div style={{
          display: 'flex', position: 'sticky', top: 0, zIndex: 10,
          background: '#f5f6f8', borderBottom: '1px solid #e0e0e0'
        }}>
          {[2025, 2026, 2027].map(year => (
            <div key={year} style={{
              flex: '0 0 400px', padding: '8px 0', textAlign: 'center',
              fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)',
              borderRight: '1px solid #e8e8e8'
            }}>{year}</div>
          ))}
        </div>

        {/* Today marker */}
        <div style={{
          position: 'absolute', left: 200, top: 0, bottom: 0,
          width: 2, background: 'var(--accent-teal)', zIndex: 5, opacity: 0.6
        }}>
          <div style={{ position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)' }}>
            <span className="today-marker">Today</span>
          </div>
        </div>

        {/* Chain rows */}
        {project.chains.map((chain, cidx) => (
          <div key={chain.id}>
            {/* Chain header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <Info size={14} color="var(--accent-purple)" />
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 12, fontWeight: 500
                }}>
                  <span style={{
                    background: 'rgba(229,57,53,0.1)', color: 'var(--status-red)',
                    padding: '1px 6px', borderRadius: 3, fontSize: 11, fontWeight: 700
                  }}>{chain.progress}%</span>
                  <span style={{ color: chain.status === 'red' ? 'var(--status-red)' : 'inherit' }}>
                    {chain.name}
                  </span>
                </div>
              </div>

              {/* Gantt bars */}
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 4,
                marginLeft: 40, position: 'relative', height: 24
              }}>
                <div style={{
                  height: 20, borderRadius: 4, display: 'flex', alignItems: 'center',
                  padding: '0 8px', fontSize: 11, color: 'white', fontWeight: 500,
                  background: chain.status === 'red' ? '#333' : '#333',
                  width: `${chain.progress * 2.5}px`, minWidth: 60,
                }}>
                  {chain.name.substring(0, 20)}...
                </div>
                <div style={{
                  height: 20, borderRadius: 4, minWidth: 100,
                  background: chain.status === 'red'
                    ? 'repeating-linear-gradient(45deg, #e53935, #e53935 3px, #ef9a9a 3px, #ef9a9a 6px)'
                    : 'repeating-linear-gradient(45deg, #4caf50, #4caf50 3px, #a5d6a7 3px, #a5d6a7 6px)',
                  width: `${(100 - chain.progress) * 1.5}px`,
                }} />
                <div style={{
                  width: 14, height: 14, background: chain.status === 'red' ? 'var(--status-red)' : 'var(--status-green)',
                  transform: 'rotate(45deg)', marginLeft: 4,
                }} />
              </div>
            </div>

            {/* Task rows */}
            {chain.tasks.map(task => (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', padding: '8px 16px 8px 48px',
                borderBottom: '1px solid #f5f5f5', fontSize: 12
              }}>
                <span style={{ width: 200, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {task.name}
                </span>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, marginLeft: 40, height: 16 }}>
                  <div style={{
                    height: 14, borderRadius: 3,
                    background: task.status === 'CO' ? 'var(--status-green)' :
                      task.status === 'STUCK' ? 'var(--status-red)' : 'var(--accent-teal)',
                    width: `${task.progress * 1.5}px`, minWidth: task.progress > 0 ? 20 : 0,
                  }} />
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Additional chains from other projects */}
        {mockProjects.slice(0, 3).flatMap(p => p.chains).map((chain, i) => (
          <div key={`extra-${i}`} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <Info size={14} color="var(--text-secondary)" />
            <span style={{ fontSize: 12, fontWeight: 500, width: 250 }}>{chain.name}</span>
            <div style={{ flex: 1, display: 'flex', gap: 4, alignItems: 'center', marginLeft: 40 }}>
              <div style={{
                height: 18, borderRadius: 3, background: '#333',
                width: `${chain.progress * 2}px`, minWidth: 30,
              }} />
              <div style={{
                height: 18, borderRadius: 3,
                background: 'repeating-linear-gradient(45deg, #4caf50, #4caf50 3px, #a5d6a7 3px, #a5d6a7 6px)',
                width: `${(100 - chain.progress) * 1.2}px`, minWidth: 20,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
