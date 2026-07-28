import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  subLabel?: string;
  showPercentage?: boolean;
  color?: string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  subLabel,
  showPercentage = true,
  color = 'var(--color-primary)',
  height = 10,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {(label || showPercentage) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && (
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}

      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'var(--color-surface-variant)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${clampedProgress}%`,
            background: color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 0 10px rgba(30, 64, 175, 0.2)',
          }}
        />
      </div>

      {subLabel && (
        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          {subLabel}
        </span>
      )}
    </div>
  );
};
