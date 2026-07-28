/**
 * Activity Audit Logging System
 * Logs user actions: Login, Logout, Entry Created/Updated/Deleted, Report Generated, Settings Updated.
 */

export interface AuditLogItem {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

const AUDIT_LOG_STORAGE_KEY = 'fuel_gain_audit_logs';

export const auditLogger = {
  getLogs(): AuditLogItem[] {
    try {
      const raw = localStorage.getItem(AUDIT_LOG_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  log(action: string, details: string) {
    try {
      const logs = this.getLogs();
      const newItem: AuditLogItem = {
        id: `log-${Date.now()}`,
        action,
        details,
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1',
      };
      logs.unshift(newItem);
      localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
    } catch {
      // Storage error fallback
    }
  },

  clearLogs() {
    try {
      localStorage.removeItem(AUDIT_LOG_STORAGE_KEY);
    } catch {
      // Fallback
    }
  },
};
