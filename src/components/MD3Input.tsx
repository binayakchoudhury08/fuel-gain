import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface MD3InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const MD3Input: React.FC<MD3InputProps> = ({
  label,
  error,
  leftIcon,
  isPassword = false,
  className = '',
  type = 'text',
  id,
  value,
  onChange,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `md3-input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginBottom: '14px' }}>
      <label
        htmlFor={inputId}
        style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: error ? 'var(--color-error)' : 'var(--color-text-secondary)',
          transition: 'color 0.2s ease',
        }}
      >
        {label}
      </label>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {leftIcon && (
          <div
            style={{
              position: 'absolute',
              left: '14px',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          type={inputType}
          value={value}
          onChange={onChange}
          style={{
            width: '100%',
            padding: leftIcon
              ? isPassword
                ? '12px 44px 12px 42px'
                : '12px 14px 12px 42px'
              : isPassword
              ? '12px 44px 12px 14px'
              : '12px 14px',
            fontSize: '0.95rem',
            borderRadius: '12px',
            border: error
              ? '1.5px solid var(--color-error)'
              : '1.5px solid var(--color-card-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            boxShadow: 'var(--shadow-sm)',
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--color-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.15)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--color-card-border)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }
          }}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '6px',
            }}
            title={showPassword ? 'Hide Password' : 'Show Password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '0.78rem', color: 'var(--color-error)', fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
  );
};
