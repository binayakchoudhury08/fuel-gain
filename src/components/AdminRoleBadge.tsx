import React from 'react';
import { ShieldCheck, UserCheck, User } from 'lucide-react';
import type { UserRole } from '../services/rbacService';

interface AdminRoleBadgeProps {
  role?: UserRole;
}

export const AdminRoleBadge: React.FC<AdminRoleBadgeProps> = ({ role = 'Owner' }) => {
  let icon = <ShieldCheck size={14} />;
  let label = 'Station Owner';
  let bg = 'rgba(30, 64, 175, 0.15)';
  let fg = 'var(--color-primary)';

  if (role === 'Manager') {
    icon = <UserCheck size={14} />;
    label = 'Station Manager';
    bg = 'rgba(14, 165, 233, 0.15)';
    fg = 'var(--color-secondary)';
  } else if (role === 'Staff') {
    icon = <User size={14} />;
    label = 'Station Staff';
    bg = 'var(--color-surface-variant)';
    fg = 'var(--color-text-secondary)';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 10px',
        borderRadius: '16px',
        backgroundColor: bg,
        color: fg,
        fontSize: '0.75rem',
        fontWeight: 700,
      }}
    >
      {icon} {label}
    </span>
  );
};
