import React, { useState, useEffect } from 'react';
import { X, Download, Share2, Printer, FileText, ExternalLink } from 'lucide-react';
import { MD3Button } from './MD3Button';
import type { ProductDailyEntry, UserProfile } from '../types';
import { downloadPdfReport, getPdfBlobUrl, getPdfDataUrl, sharePdfReport } from '../helpers/pdfReportGenerator';

interface PdfPreviewModalProps {
  entry: ProductDailyEntry | null;
  profile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  entry,
  profile,
  isOpen,
  onClose,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && entry) {
      const url = getPdfBlobUrl(entry, profile);
      setBlobUrl(url);
      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    }
  }, [isOpen, entry, profile]);

  if (!isOpen || !entry) return null;

  const pdfDataUrl = getPdfDataUrl(entry, profile);

  const handleDownload = () => {
    downloadPdfReport(entry, profile);
    setNotice('PDF Report downloaded successfully!');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleShare = async () => {
    const success = await sharePdfReport(entry, profile);
    if (success) {
      setNotice('PDF Report shared / copied to clipboard!');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handlePrint = () => {
    if (blobUrl) {
      const win = window.open(blobUrl, '_blank');
      win?.print();
    } else {
      downloadPdfReport(entry, profile);
    }
  };

  const handleOpenExternal = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    } else {
      window.open(pdfDataUrl, '_blank');
    }
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
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '880px',
          height: '92vh',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-card-border)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '14px 18px',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-card-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'var(--color-primary-container)', color: 'var(--color-primary)' }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                PDF Daily Audit Report
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {entry.productName} • {entry.date} • {entry.status}
              </p>
            </div>
          </div>

          {/* Controls Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <MD3Button variant="outline" size="sm" onClick={handleOpenExternal} leftIcon={<ExternalLink size={15} />}>
              Open
            </MD3Button>
            <MD3Button variant="outline" size="sm" onClick={handleShare} leftIcon={<Share2 size={15} />}>
              Share
            </MD3Button>
            <MD3Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer size={15} />}>
              Print
            </MD3Button>
            <MD3Button variant="primary" size="sm" onClick={handleDownload} leftIcon={<Download size={15} />}>
              Download PDF
            </MD3Button>
            <button
              onClick={onClose}
              style={{
                background: 'var(--color-surface-variant)',
                border: 'none',
                padding: '8px',
                borderRadius: '10px',
                cursor: 'pointer',
                color: 'var(--color-text-primary)',
                marginLeft: '4px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Action Notice Alert */}
        {notice && (
          <div style={{ padding: '8px 16px', backgroundColor: 'var(--color-primary-container)', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center' }}>
            {notice}
          </div>
        )}

        {/* Modal PDF Viewer / Live Document Preview */}
        <div style={{ flex: 1, backgroundColor: '#323639', position: 'relative', overflowY: 'auto' }}>
          {blobUrl ? (
            <iframe
              src={blobUrl}
              title="PDF Audit Report Preview"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <div style={{ padding: '24px', maxWidth: '700px', margin: '0 auto', backgroundColor: '#FFFFFF', color: '#1E293B', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              <div style={{ borderBottom: '3px solid #1E40AF', paddingBottom: '12px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#1E40AF', margin: 0 }}>FUEL GAIN TRACKER AUDIT REPORT</h2>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Station: {profile?.pumpName || 'Filling Station'} • Date: {entry.date}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
                <div><strong>Product:</strong> {entry.productName}</div>
                <div><strong>Meter Sale:</strong> {entry.totalMeterSale.toFixed(1)} L</div>
                <div><strong>Dip Sale:</strong> {entry.dipSale.toFixed(1)} L</div>
                <div><strong>Variance:</strong> {entry.difference > 0 ? '+' : ''}{entry.difference.toFixed(1)} L ({entry.status})</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
