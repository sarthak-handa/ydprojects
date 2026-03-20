'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Eye, Bell, ChevronDown, LogOut, Settings } from 'lucide-react';
import styles from './TopBar.module.css';

export default function TopBar() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className={styles.topbar}>
      <div className={styles.leftSection}>
        <div className={styles.divisionSelector}>
          Division: {user?.division || 'DEFAULT'}
          <ChevronDown size={12} />
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.topbarIcon}>
          <User size={16} />
        </div>
        <div className={styles.topbarIcon}>
          <Eye size={16} />
        </div>
        <div className={styles.topbarIcon}>
          <Bell size={16} />
        </div>
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div
            className={styles.userAvatar}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {initials}
          </div>
          {showDropdown && (
            <div className={styles.userDropdown}>
              <div className={styles.userDropdownHeader}>
                <div className={styles.userName}>{user?.name}</div>
                <div className={styles.userEmail}>{user?.email}</div>
              </div>
              <div className={styles.userDropdownItem}>
                <User size={14} /> Profile Details
              </div>
              <div className={styles.userDropdownItem}>
                <Settings size={14} /> Settings
              </div>
              <div
                className={`${styles.userDropdownItem} ${styles.danger}`}
                onClick={logout}
              >
                <LogOut size={14} /> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
