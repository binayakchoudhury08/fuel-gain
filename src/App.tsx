import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './storage/reduxStore';
import { ThemeProvider } from './context/ThemeContext';
import { RootNavigator } from './navigation/RootNavigator';
import { Capacitor } from '@capacitor/core';
import { Smartphone, Monitor, Signal, Wifi, Battery } from 'lucide-react';
import './styles/global.css';

export function App() {
  const isNative = Capacitor.isNativePlatform();
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Native Mobile App Mode (APK / Capacitor / Mobile Viewport) -> Render 100% Full Screen without any preview frame
  if (isNative || isMobileScreen) {
    return (
      <Provider store={store}>
        <ThemeProvider>
          <div style={{ width: '100%', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
            <RootNavigator />
          </div>
        </ThemeProvider>
      </Provider>
    );
  }

  // 2. Desktop Browser Preview Mode -> Optional Device Frame Toggle
  return (
    <Provider store={store}>
      <ThemeProvider>
        <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#0B0F19' }}>
          {/* Top Controller Header for Desktop Browser Testing Only */}
          <header
            style={{
              padding: '10px 20px',
              backgroundColor: '#111827',
              borderBottom: '1px solid #1F2937',
              color: '#F9FAFB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              zIndex: 100,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1E40AF 0%, #0EA5E9 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  color: '#FFFFFF',
                }}
              >
                PG
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>FuelGain Tracker - Desktop Preview</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setDeviceFrameMode(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: deviceFrameMode ? '#1E40AF' : '#1F2937',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                <Smartphone size={16} /> Phone Frame
              </button>
              <button
                onClick={() => setDeviceFrameMode(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: !deviceFrameMode ? '#1E40AF' : '#1F2937',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                <Monitor size={16} /> Full View
              </button>
            </div>
          </header>

          {/* Main App Display */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: deviceFrameMode ? '24px 12px' : '0',
              minHeight: 'calc(100vh - 50px)',
            }}
          >
            {deviceFrameMode ? (
              <div
                style={{
                  width: '100%',
                  maxWidth: '420px',
                  height: '840px',
                  backgroundColor: 'var(--color-bg)',
                  borderRadius: '40px',
                  border: '12px solid #1F2937',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    height: '32px',
                    backgroundColor: 'var(--color-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    zIndex: 50,
                  }}
                >
                  <span>9:41</span>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#000000' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Signal size={14} />
                    <Wifi size={14} />
                    <Battery size={14} />
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <RootNavigator />
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', maxWidth: '800px', minHeight: '100vh' }}>
                <RootNavigator />
              </div>
            )}
          </div>
        </div>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
