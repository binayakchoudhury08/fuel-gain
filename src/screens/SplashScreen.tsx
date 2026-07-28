import React, { useEffect, useState } from 'react';
import { Flame, ShieldCheck } from 'lucide-react';
import { ProgressBar } from '../components/ProgressBar';

interface SplashScreenProps {
  onComplete: () => void;
}

const LOADING_STEPS = [
  'Preparing Application...',
  'Loading Database...',
  'Loading Resources...',
  'Loading User Session...',
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400);
          return 100;
        }

        const next = prev + 2;
        if (next < 25) setStepIndex(0);
        else if (next < 50) setStepIndex(1);
        else if (next < 75) setStepIndex(2);
        else setStepIndex(3);

        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '100vh',
        padding: '40px 24px',
        background: 'linear-gradient(180deg, #0F172A 0%, #1E3A8A 50%, #0F172A 100%)',
        color: '#FFFFFF',
      }}
    >
      {/* Top Security Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#93C5FD', opacity: 0.85 }}>
        <ShieldCheck size={16} /> Enterprise Security • Firebase Protected
      </div>

      {/* Center Branding & Animated Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div
          className="animate-pulse-glow"
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #1E40AF 0%, #0EA5E9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 32px rgba(14, 165, 233, 0.4)',
          }}
        >
          <Flame size={54} color="#FFFFFF" />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px' }}>
            PumpGain <span style={{ color: '#38BDF8' }}>Tracker</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 500 }}>
            Fuel Gain & Tank Inventory Management
          </p>
        </div>
      </div>

      {/* Bottom Loading Progress Bar & Percentage */}
      <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <ProgressBar
          progress={progress}
          showPercentage={true}
          subLabel={LOADING_STEPS[stepIndex]}
          color="linear-gradient(90deg, #38BDF8 0%, #10B981 100%)"
          height={10}
        />
      </div>
    </div>
  );
};
