'use client';

import React, { useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, LayoutDashboard, Menu, Grid3X3, User, TrendingUp, BarChart3,
  Landmark, Users, HardHat, CircleDot, Gauge, ListChecks, FileEdit,
  FileText, GitBranch, CheckSquare, ClipboardCheck, Briefcase, CheckCircle,
  AlertTriangle, AlertCircle, FolderOpen, File as FileIcon, UserCog, Building,
  UserPlus, Settings, ChevronDown, ChevronLeft, ChevronRight,
  Mail, HelpCircle, Link as LinkIcon, ArrowDownLeft, ArrowUpRight, LineChart
} from 'lucide-react';
import { navigationItems, NavItem } from '@/data/navigation';
import styles from './Sidebar.module.css';

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  Home, LayoutDashboard, Menu, Grid3x3: Grid3X3, User, TrendingUp, BarChart3,
  Landmark, Users, HardHat, CircleDot, Gauge, ListChecks, FileEdit,
  FileText, GitBranch, CheckSquare, ClipboardCheck, Briefcase, CheckCircle,
  AlertTriangle, AlertCircle, FolderOpen, File: FileIcon, UserCog, Building,
  UserPlus, Settings, ArrowDownLeft, ArrowUpRight, LineChart,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard']);

  const toggleExpand = useCallback((id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }, []);

  const getIcon = (iconName: string, size: number = 18) => {
    const IconComp = iconMap[iconName];
    return IconComp ? <IconComp size={size} /> : <Menu size={size} />;
  };

  const isActive = (item: NavItem): boolean => {
    if (item.href && pathname === item.href) return true;
    if (item.children) return item.children.some(c => isActive(c));
    return false;
  };

  const handleNavClick = (item: NavItem) => {
    if (item.children) {
      toggleExpand(item.id);
    } else if (item.href) {
      router.push(item.href);
    }
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item);

    if (level > 0) {
      return (
        <React.Fragment key={item.id}>
          <div
            className={`${styles.subNavItem} ${active && !hasChildren ? styles.active : ''}`}
            onClick={() => handleNavClick(item)}
          >
            <span className={styles.subNavIcon}>{getIcon(item.icon, 15)}</span>
            {!collapsed && <span>{item.label}</span>}
            {hasChildren && !collapsed && (
              <ChevronDown size={12} className={`${styles.navItemChevron} ${isExpanded ? styles.open : ''}`} />
            )}
          </div>
          {hasChildren && isExpanded && !collapsed && (
            <div className={`${styles.subNav} ${styles.expanded}`}>
              {item.children!.map(child => renderNavItem(child, level + 1))}
            </div>
          )}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={item.id}>
        <div
          className={`${styles.navItem} ${active && !hasChildren ? styles.active : ''}`}
          onClick={() => handleNavClick(item)}
        >
          <span className={styles.navItemIcon}>{getIcon(item.icon)}</span>
          {!collapsed && (
            <>
              <span className={styles.navItemLabel}>{item.label}</span>
              {hasChildren && (
                <ChevronDown size={14} className={`${styles.navItemChevron} ${isExpanded ? styles.open : ''}`} />
              )}
            </>
          )}
        </div>
        {hasChildren && isExpanded && !collapsed && (
          <div className={`${styles.subNav} ${styles.expanded}`}>
            {item.children!.map(child => renderNavItem(child, 1))}
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarHeader}>
        {!collapsed && (
          <div className={styles.logo}>
            <span className={styles.logoTop}>POWERED BY</span>
            <span className={styles.logoText}>REALIZATION<span className={styles.flag}>🇮🇳</span></span>
          </div>
        )}
        <button className={styles.collapseBtn} onClick={onToggle}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className={styles.navContainer}>
        {navigationItems.map(item => renderNavItem(item))}
      </nav>

      <div className={styles.sidebarFooter}>
        {!collapsed && <span className={styles.versionText}>Version: 3.9.4</span>}
        <div className={styles.footerIcons}>
          <div className={styles.footerIcon}><Mail size={14} /></div>
          <div className={styles.footerIcon}><HelpCircle size={14} /></div>
          <div className={styles.footerIcon}><LinkIcon size={14} /></div>
        </div>
      </div>
    </aside>
  );
}
