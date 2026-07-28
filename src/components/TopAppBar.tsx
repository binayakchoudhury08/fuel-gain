import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Bell, Settings, Flame, Search, Wifi, WifiOff, RefreshCw, Share2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import type { RootState } from '../storage/reduxStore';
import { NotificationCenterModal } from './NotificationCenterModal';
import { GlobalSearchModal } from './GlobalSearchModal';
import { AuditLogModal } from './AuditLogModal';
import { ShareAppModal } from './ShareAppModal';
import { offlineSyncService } from '../services/offlineSyncService';
import { notificationService } from '../services/notificationService';

interface TopAppBarProps {
  onNavigateSettings: () => void;
  onNavigateProfile: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ onNavigateSettings, onNavigateProfile }) => {
  const profile = useSelector((state: RootState) => state.user.profile);
  const syncState = useSelector((state: RootState) => state.sync);
  const isNative = Capacitor.isNativePlatform();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const unreadCount = notificationService.getUnreadCount();

  const handleManualSync = () => {
    offlineSyncService.performManualSync();
  };

  return (
    <>
      <header
        className="top-app-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: isNative ? '42px' : '14px',
          paddingBottom: '12px',
          paddingLeft: '18px',
          paddingRight: '18px',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-card-border)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--color-primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 10px rgba(30, 64, 175, 0.3)',
            }}
          >
            <Flame size={22} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
              FuelGain
            </h1>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-secondary)', letterSpacing: '0.5px' }}>
              PRO TRACKER
            </span>
          </div>
        </div>

        {/* Sync Status Badge & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {/* Sync Status Badge */}
          <div
            onClick={handleManualSync}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: '4px 8px',
              borderRadius: '16px',
              backgroundColor:
                syncState.status === 'synced'
                  ? 'rgba(16, 185, 129, 0.12)'
                  : syncState.status === 'syncing'
                  ? 'rgba(14, 165, 233, 0.15)'
                  : 'var(--color-surface-variant)',
              color:
                syncState.status === 'synced'
                  ? 'var(--color-success)'
                  : syncState.status === 'syncing'
                  ? 'var(--color-secondary)'
                  : 'var(--color-text-muted)',
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            title="Click to sync local queue to Supabase Cloud Database"
          >
            {syncState.status === 'syncing' ? (
              <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} />
            ) : syncState.isOnline ? (
              <Wifi size={11} />
            ) : (
              <WifiOff size={11} />
            )}
            <span>
              {syncState.status === 'syncing'
                ? 'Syncing'
                : syncState.isOnline
                ? 'Synced'
                : `Off (${syncState.pendingQueueCount})`}
            </span>
          </div>

          {/* Settings Button */}
          <button
            onClick={onNavigateSettings}
            style={{
              background: 'var(--color-surface-variant)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              flexShrink: 0,
            }}
            title="Settings"
          >
            <Settings size={16} />
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => setIsNotifOpen(true)}
            style={{
              position: 'relative',
              background: 'var(--color-surface-variant)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              flexShrink: 0,
            }}
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: 'var(--color-error)',
                  color: '#FFFFFF',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            style={{
              background: 'var(--color-surface-variant)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-primary)',
              flexShrink: 0,
            }}
            title="Global Search"
          >
            <Search size={16} />
          </button>

          {/* Share App Button */}
          <button
            onClick={() => setIsShareOpen(true)}
            style={{
              background: 'var(--color-primary-container)',
              border: '1px solid var(--color-primary)',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-primary)',
              flexShrink: 0,
            }}
            title="Share App APK"
          >
            <Share2 size={16} />
          </button>

          {/* Profile Avatar */}
          <div
            onClick={onNavigateProfile}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              overflow: 'hidden',
              cursor: 'pointer',
              border: '2px solid var(--color-primary)',
            }}
            title="Profile"
          >
            <img
              src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
              alt="Profile Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </header>

      {/* Modals */}
      <NotificationCenterModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AuditLogModal isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />
      <ShareAppModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </>
  );
};
