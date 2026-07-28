import React from 'react';
import { LayoutDashboard, FileSpreadsheet, BarChart3, User } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

export type NavTab = 'dashboard' | 'entry' | 'reports' | 'profile';

interface BottomNavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onSelectTab }) => {
  const isNative = Capacitor.isNativePlatform();
  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'entry', label: 'Entry', icon: <FileSpreadsheet size={20} /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
  ];

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingTop: '8px',
        paddingBottom: isNative ? '22px' : '10px',
        paddingLeft: '14px',
        paddingRight: '14px',
        backgroundColor: 'var(--color-surface)',
        borderTop: '1px solid var(--color-card-border)',
        position: 'sticky',
        bottom: 0,
        zIndex: 40,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 14px',
              borderRadius: '12px',
              color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 12px',
                borderRadius: '16px',
                backgroundColor: isActive ? 'var(--color-surface-variant)' : 'transparent',
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.25s ease',
              }}
            >
              {tab.icon}
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: isActive ? 700 : 500,
                transition: 'color 0.2s ease',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
