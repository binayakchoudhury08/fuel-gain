import React, { useState } from 'react';
import { X, ShieldCheck, Clock, Search, Trash2 } from 'lucide-react';
import { auditLogger, type AuditLogItem } from '../services/auditLogger';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AuditLogItem[]>(() => auditLogger.getLogs());
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const handleClear = () => {
    if (confirm('Clear activity audit log history?')) {
      auditLogger.clearLogs();
      setLogs([]);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return log.action.toLowerCase().includes(q) || log.details.toLowerCase().includes(q);
  });

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
          maxWidth: '680px',
          maxHeight: '85vh',
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
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                System Activity Audit Log
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Security event history and audit trail
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-error)',
                cursor: 'pointer',
                padding: '6px',
              }}
              title="Clear Logs"
            >
              <Trash2 size={18} />
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

        {/* Search Bar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '10px', backgroundColor: 'var(--color-surface-variant)' }}>
            <Search size={16} color="var(--color-text-muted)" />
            <input
              type="text"
              placeholder="Search audit actions or details..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem', color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>

        {/* Log List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--color-surface-variant)',
                  border: '1px solid var(--color-card-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      [{log.action}]
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-primary)', margin: 0 }}>
                    {log.details}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '24px', fontSize: '0.85rem' }}>
              No audit logs found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
