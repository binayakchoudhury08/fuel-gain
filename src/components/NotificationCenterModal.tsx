import React, { useState } from 'react';
import { X, Bell, CheckCheck, Clock } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import type { NotificationItem } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [items, setItems] = useState<NotificationItem[]>(() =>
    notificationService.getNotifications()
  );

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    notificationService.markAllAsRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '80vh',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '18px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-card-border)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-card-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'var(--color-primary-container)', color: 'var(--color-primary)' }}>
              <Bell size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Notifications Center
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Reminders, sync status, and system alerts
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleMarkAllRead}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <CheckCheck size={16} /> Mark all read
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'var(--color-surface-variant)',
                border: 'none',
                padding: '8px',
                borderRadius: '10px',
                cursor: 'pointer',
                color: 'var(--color-text-primary)',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: '14px',
                  backgroundColor: item.read ? 'var(--color-surface)' : 'var(--color-primary-container)',
                  border: item.read ? '1px solid var(--color-card-border)' : '1.5px solid var(--color-primary)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    {item.title}
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  {item.message}
                </p>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px', fontSize: '0.85rem' }}>
              No notifications.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
