import React from 'react';
import { Loader2 } from 'lucide-react';

interface MD3ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const MD3Button: React.FC<MD3ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    borderRadius: '14px',
    border: 'none',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
    letterSpacing: '0.2px',
    boxShadow: 'var(--shadow-sm)',
    fontSize: size === 'sm' ? '0.85rem' : size === 'lg' ? '1.05rem' : '0.95rem',
    padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '14px 28px' : '11px 22px',
  };

  let variantStyle: React.CSSProperties = {};

  switch (variant) {
    case 'primary':
      variantStyle = {
        background: 'var(--color-primary-gradient)',
        color: '#FFFFFF',
        boxShadow: '0 4px 14px rgba(30, 64, 175, 0.25)',
      };
      break;
    case 'secondary':
      variantStyle = {
        background: 'var(--color-secondary-gradient)',
        color: '#FFFFFF',
        boxShadow: '0 4px 14px rgba(14, 165, 233, 0.25)',
      };
      break;
    case 'accent':
      variantStyle = {
        background: 'var(--color-accent-gradient)',
        color: '#FFFFFF',
        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)',
      };
      break;
    case 'outline':
      variantStyle = {
        background: 'transparent',
        border: '1.5px solid var(--color-card-border)',
        color: 'var(--color-text-primary)',
        boxShadow: 'none',
      };
      break;
    case 'ghost':
      variantStyle = {
        background: 'transparent',
        color: 'var(--color-text-secondary)',
        boxShadow: 'none',
      };
      break;
    case 'danger':
      variantStyle = {
        background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
        color: '#FFFFFF',
        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
      };
      break;
  }

  return (
    <button
      className={`btn-ripple ${className}`}
      style={{ ...baseStyle, ...variantStyle }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={size === 'sm' ? 16 : 20} />
      ) : (
        <>
          {leftIcon}
          <span>{children}</span>
          {rightIcon}
        </>
      )}
    </button>
  );
};
