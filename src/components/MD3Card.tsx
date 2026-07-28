import React from 'react';

interface MD3CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'glass';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const MD3Card: React.FC<MD3CardProps> = ({
  children,
  variant = 'elevated',
  className = '',
  style = {},
  onClick,
}) => {
  const baseStyle: React.CSSProperties = {
    borderRadius: 'var(--radius-md)',
    padding: '20px',
    backgroundColor: 'var(--color-surface)',
    transition: 'all var(--transition-normal)',
    cursor: onClick ? 'pointer' : 'default',
  };

  let variantStyle: React.CSSProperties = {};

  if (variant === 'elevated') {
    variantStyle = {
      boxShadow: 'var(--shadow-md)',
      border: '1px solid var(--color-card-border)',
    };
  } else if (variant === 'outlined') {
    variantStyle = {
      boxShadow: 'none',
      border: '1.5px solid var(--color-card-border)',
    };
  } else if (variant === 'glass') {
    variantStyle = {
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: 'var(--shadow-sm)',
    };
  }

  return (
    <div
      className={className}
      style={{ ...baseStyle, ...variantStyle, ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
