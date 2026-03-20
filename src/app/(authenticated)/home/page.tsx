'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard, FolderKanban, CalendarRange, ClipboardList,
  Briefcase, RefreshCw, AlertTriangle, MessageSquare
} from 'lucide-react';
import styles from './home.module.css';

const modules = [
  { label: 'Project Control Room', icon: LayoutDashboard, href: '/dashboard/control-room' },
  { label: 'Manage Projects', icon: FolderKanban, href: '/dashboard/project' },
  { label: 'Project Planning', icon: CalendarRange, href: '/planning/plan-detailing' },
  { label: 'Task Management', icon: ClipboardList, href: '/task-management/task' },
  { label: 'Full-Kit Management', icon: Briefcase, href: '/task-management/full-kit' },
  { label: 'Progress Update', icon: RefreshCw, href: '/task-management/update' },
  { label: 'Issue Management', icon: AlertTriangle, href: '/issue-management' },
  { label: 'Action Item & Meeting Management', icon: MessageSquare, href: '/admin/manage-division' },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <div className={styles.homePage}>
      <div className={styles.homeGrid}>
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.label}
              className={styles.moduleCard}
              onClick={() => router.push(mod.href)}
            >
              <div className={styles.moduleIcon}>
                <Icon />
              </div>
              <div className={styles.moduleLabel}>{mod.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
