import React from 'react';
import { X, Download, Share2, Printer, FileText } from 'lucide-react';
import { MD3Button } from './MD3Button';
import type { ProductDailyEntry, UserProfile } from '../types';
import { downloadPdfReport, getPdfDataUrl, sharePdfReport } from '../helpers/pdfReportGenerator';

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
  if (!isOpen || !entry) return null;

  const pdfDataUrl = getPdfDataUrl(entry, profile);

  const handleDownload = () => {
    downloadPdfReport(entry, profile);
  };

  const handleShare = async () => {
    const success = await sharePdfReport(entry, profile);
    if (success) {
      alert('Report summary copied to clipboard / shared successfully!');
    }
  };

  const handlePrint = () => {
    const win = window.open(pdfDataUrl, '_blank');
    win?.print();
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
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '850px',
          height: '90vh',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '18px',
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
            padding: '16px 20px',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-card-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'var(--color-primary-container)', color: 'var(--color-primary)' }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                PDF Audit Report Preview
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                {entry.productName} • {entry.date}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MD3Button variant="outline" size="sm" onClick={handleShare} leftIcon={<Share2 size={16} />}>
              Share
            </MD3Button>
            <MD3Button variant="outline" size="sm" onClick={handlePrint} leftIcon={<Printer size={16} />}>
              Print
            </MD3Button>
            <MD3Button variant="primary" size="sm" onClick={handleDownload} leftIcon={<Download size={16} />}>
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
                marginLeft: '6px',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal PDF Iframe Container */}
        <div style={{ flex: 1, backgroundColor: '#525659', position: 'relative' }}>
          <iframe
            src={pdfDataUrl}
            title="PDF Audit Report Preview"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};
