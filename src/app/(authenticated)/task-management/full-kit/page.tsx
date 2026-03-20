'use client';

import React from 'react';
import { fullKits } from '@/data/mockData';
import { XCircle, CheckCircle, Plus } from 'lucide-react';

export default function FullKitPage() {
  return (
    <div style={{ minHeight: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 20px', background: 'white', borderBottom: '1px solid var(--border-light)'
      }}>
        <span className="chip">Horizon (1) ×</span>
        <span className="chip">Project (1) ×</span>
        <span className="chip">Manager (1) ×</span>
        <span className="chip">Status (1) ×</span>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }}>
          <Plus size={14} /> Create Fullkit
        </button>
      </div>

      <div style={{ padding: 20 }}>
        {fullKits.map(kit => (
          <div key={kit.id} style={{
            background: 'white', borderRadius: 8, padding: 16,
            boxShadow: 'var(--shadow-card)', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 16,
            borderLeft: `4px solid ${kit.populated ? 'var(--status-green)' : 'var(--status-red)'}`,
          }}>
            <div style={{ fontSize: 28, color: '#666' }}>🏭</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                STEP TYPE {kit.stepType}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                of {kit.task}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                Fullkit Manager: <span style={{ textDecoration: 'underline' }}>{kit.manager}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              {kit.populated ? (
                <><CheckCircle size={20} color="var(--status-green)" /> Full kit populated</>
              ) : (
                <><XCircle size={20} color="#999" /> Full kit is not populated yet</>
              )}
            </div>
          </div>
        ))}
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, padding: 20 }}>
          --- End of List ---
        </div>
      </div>
    </div>
  );
}
