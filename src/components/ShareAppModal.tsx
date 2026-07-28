import React, { useState } from 'react';
import {
  Share2,
  Download,
  Copy,
  CheckCircle2,
  X,
  QrCode,
  Smartphone,
  MessageCircle,
  Mail,
} from 'lucide-react';
import { MD3Button } from './MD3Button';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'link' | 'apk'>('qr');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const apkDownloadUrl = `${currentUrl}/downloads/fuel-gain-tracker.apk`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    currentUrl
  )}&color=0ea5e9&bgcolor=ffffff`;

  const shareText = `⛽ *Fuel Gain Tracker Mobile App*\n\nTrack daily petrol pump dip readings, nozzle sales, and dip loss/gain calculations.\n\n📱 *Open Web App*: ${currentUrl}\n📦 *Download Android APK*: ${apkDownloadUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Fuel Gain Tracker',
          text: 'Daily Petrol Pump Dip Reading & Gain/Loss Audit App',
          url: currentUrl,
        });
      } catch {
        // Fallback to copy link
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Fuel Gain Tracker App Access');
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
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
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '24px',
          padding: '24px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--color-card-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: 'var(--color-primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
              }}
            >
              <Share2 size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Share Mobile App & APK
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                Share with pump staff, managers, or partners
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--color-surface-variant)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--color-surface-variant)',
            borderRadius: '12px',
            padding: '4px',
            gap: '4px',
          }}
        >
          <button
            onClick={() => setActiveTab('qr')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'qr' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'qr' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'qr' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: activeTab === 'qr' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <QrCode size={16} /> QR Code Scan
          </button>
          <button
            onClick={() => setActiveTab('link')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'link' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'link' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'link' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: activeTab === 'link' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Smartphone size={16} /> Web App
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'apk' ? 'var(--color-surface)' : 'transparent',
              color: activeTab === 'apk' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === 'apk' ? 700 : 500,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: activeTab === 'apk' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            <Download size={16} /> Android APK
          </button>
        </div>

        {/* Tab 1: QR Code Scanner */}
        {activeTab === 'qr' && (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '12px',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--color-card-border)',
              }}
            >
              <img
                src={qrCodeImageUrl}
                alt="Scan to open Fuel Gain App"
                style={{ width: '180px', height: '180px', borderRadius: '8px' }}
              />
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', maxWidth: '320px' }}>
              Scan this QR code with any mobile camera (Android or iPhone) to open and install the app instantly.
            </p>
          </div>
        )}

        {/* Tab 2 & 3: Link & APK Details */}
        {activeTab === 'link' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Web App URL:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                readOnly
                value={currentUrl}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-card-border)',
                  backgroundColor: 'var(--color-surface-variant)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.85rem',
                }}
              />
              <MD3Button variant="primary" size="sm" onClick={handleCopyLink} leftIcon={copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}>
                {copied ? 'Copied' : 'Copy'}
              </MD3Button>
            </div>
          </div>
        )}

        {activeTab === 'apk' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'var(--color-primary-container)', border: '1px solid var(--color-primary)' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Smartphone size={16} /> Fuel Gain Android App (.APK)
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                Package: <strong>com.fuelgain.tracker</strong> (v1.0.0)<br />
                Direct installation file for Android phones and tablets.
              </p>
            </div>

            <a
              href="/downloads/fuel-gain-tracker.apk"
              download="FuelGainTracker.apk"
              style={{ textDecoration: 'none' }}
            >
              <MD3Button variant="primary" fullWidth size="md" leftIcon={<Download size={18} />}>
                Download Android APK (Direct File)
              </MD3Button>
            </a>
          </div>
        )}

        {/* Quick Social Share Buttons */}
        <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            QUICK SHARE TO:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button
              onClick={handleWhatsAppShare}
              style={{
                padding: '10px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <MessageCircle size={16} /> WhatsApp
            </button>

            <button
              onClick={handleNativeShare}
              style={{
                padding: '10px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'var(--color-primary)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Share2 size={16} /> Mobile Share
            </button>

            <button
              onClick={handleEmailShare}
              style={{
                padding: '10px',
                borderRadius: '12px',
                border: '1px solid var(--color-card-border)',
                backgroundColor: 'var(--color-surface-variant)',
                color: 'var(--color-text-primary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Mail size={16} /> Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
