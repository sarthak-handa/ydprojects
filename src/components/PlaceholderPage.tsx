'use client';

import React from 'react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: string;
}

export default function PlaceholderPage({ title, description, icon = '📋' }: PlaceholderPageProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100%', padding: 40,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{icon}</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{title}</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 400 }}>
          {description || 'This module is under development. Content and functionality will be available soon.'}
        </p>
      </div>
    </div>
  );
}
