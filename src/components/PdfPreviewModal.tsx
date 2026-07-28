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
    setNotice('PDF Report downloaded! Check your Downloads folder.');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleShare = async () => {
    const success = await sharePdfReport(entry, profile);
    if (success) {
      setNotice('PDF Report shared / copied to clipboard!');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handlePrint = () => {
    try {
      const card = document.getElementById('pdf-audit-report-card');
      if (!card) {
        window.print();
        return;
      }
      const printWin = window.open('', '_blank', 'width=850,height=950');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Fuel Gain Audit Report - ${entry.date}</title>
              <style>
                body { font-family: Inter, system-ui, sans-serif; margin: 0; padding: 20px; background: #FFFFFF; color: #1E293B; }
                * { box-sizing: border-box; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
                th, td { padding: 8px 10px; border-bottom: 1px solid #E2E8F0; text-align: left; }
                th { background-color: #1E293B; color: #FFFFFF; }
              </style>
            </head>
            <body>
              ${card.outerHTML}
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
      } else {
        window.print();
      }
    } catch {
      window.print();
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

        {/* Modal PDF Live Printable Document Preview */}
        <div style={{ flex: 1, backgroundColor: '#323639', padding: '16px', overflowY: 'auto' }}>
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              #pdf-audit-report-card, #pdf-audit-report-card * { visibility: visible !important; }
              #pdf-audit-report-card {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 24px !important;
                box-shadow: none !important;
                border-radius: 0 !important;
              }
            }
          `}</style>
          <div
            id="pdf-audit-report-card"
            style={{
              maxWidth: '720px',
              margin: '0 auto',
              backgroundColor: '#FFFFFF',
              color: '#1E293B',
              borderRadius: '12px',
              padding: '28px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {/* Top Accent Strip */}
            <div style={{ height: '6px', backgroundColor: '#1E40AF', borderRadius: '4px 4px 0 0', marginTop: '-28px', marginLeft: '-28px', marginRight: '-28px', marginBottom: '20px' }} />

            {/* Document Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1E40AF', margin: 0, letterSpacing: '0.5px' }}>
                  FUEL GAIN TRACKER
                </h1>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '4px 0 0 0', fontWeight: 600 }}>
                  Automated Dip to Volume & Meter Gain/Shortage Audit System
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748B' }}>
                <div style={{ fontWeight: 700, color: '#1E293B' }}>AUDIT DOC ID</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1E40AF' }}>AUD-{(entry.id || 'DEFAULT').substring(0, 10).toUpperCase()}</div>
                <div style={{ marginTop: '4px' }}>Date: <strong>{entry.date}</strong></div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div style={{ backgroundColor: '#F1F5F9', padding: '10px 16px', borderRadius: '8px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0, textAlign: 'center', textTransform: 'uppercase' }}>
                DAILY FUEL TANK AUDIT REPORT — {entry.productName}
              </h2>
            </div>

            {/* Station Details & Parameters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '20px', fontSize: '0.83rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  STATION DETAILS
                </span>
                <div><strong>Station Name:</strong> {profile?.pumpName || 'Shree Ganesh Filling Station'}</div>
                <div><strong>OMC Company:</strong> {profile?.pumpCompany || 'HPCL'}</div>
                <div><strong>Location:</strong> {profile?.pumpAddress || 'NH-48, Sector 14, Gurugram'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#1E40AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  AUDIT PARAMETERS
                </span>
                <div><strong>Station Manager:</strong> {profile?.fullName || 'Rajesh Sharma'}</div>
                <div><strong>Audit Date:</strong> {entry.date}</div>
                <div><strong>Fuel Product:</strong> {entry.productName}</div>
              </div>
            </div>

            {/* Metrics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#EEF2FF', padding: '12px', borderRadius: '10px', border: '1px solid #C7D2FE' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4338CA', display: 'block', textTransform: 'uppercase' }}>Total Meter Sale</span>
                <strong style={{ fontSize: '1.2rem', color: '#1E40AF' }}>{(entry.totalMeterSale || entry.meterSale || 0).toFixed(1)} L</strong>
              </div>

              <div style={{ backgroundColor: '#F0F9FF', padding: '12px', borderRadius: '10px', border: '1px solid #BAE6FD' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0369A1', display: 'block', textTransform: 'uppercase' }}>Total Dip Sale</span>
                <strong style={{ fontSize: '1.2rem', color: '#0EA5E9' }}>{(entry.dipSale || 0).toFixed(1)} L</strong>
              </div>

              <div style={{
                backgroundColor: entry.difference > 0 ? '#ECFDF5' : entry.difference < 0 ? '#FEF2F2' : '#F1F5F9',
                padding: '12px',
                borderRadius: '10px',
                border: entry.difference > 0 ? '1px solid #A7F3D0' : entry.difference < 0 ? '1px solid #FECACA' : '1px solid #E2E8F0'
              }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: entry.difference > 0 ? '#047857' : entry.difference < 0 ? '#B91C1C' : '#475569', display: 'block', textTransform: 'uppercase' }}>
                  Variance ({entry.status})
                </span>
                <strong style={{ fontSize: '1.2rem', color: entry.difference > 0 ? '#10B981' : entry.difference < 0 ? '#EF4444' : '#1E40AF' }}>
                  {entry.difference > 0 ? `+${entry.difference.toFixed(1)}` : (entry.difference || 0).toFixed(1)} L
                </strong>
              </div>
            </div>

            {/* Table 1: Nozzle Meter Breakdown */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1E40AF', marginBottom: '8px' }}>
                1. NOZZLE METER READINGS BREAKDOWN
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1E293B', color: '#FFFFFF' }}>
                    <th style={{ padding: '8px 10px', borderRadius: '4px 0 0 4px' }}>Nozzle Name</th>
                    <th style={{ padding: '8px 10px' }}>Opening (L)</th>
                    <th style={{ padding: '8px 10px' }}>Closing (L)</th>
                    <th style={{ padding: '8px 10px', borderRadius: '0 4px 4px 0', textAlign: 'right' }}>Sale (L)</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.nozzleReadings && entry.nozzleReadings.length > 0 ? (
                    entry.nozzleReadings.map((n, idx) => (
                      <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 600 }}>{n.nozzleName}</td>
                        <td style={{ padding: '8px 10px' }}>{(n.openingReading || 0).toFixed(2)}</td>
                        <td style={{ padding: '8px 10px' }}>{(n.closingReading || 0).toFixed(2)}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right', color: '#1E40AF' }}>{(n.sale || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '10px', textAlign: 'center', color: '#64748B' }}>
                        No nozzle breakdown recorded for this entry.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: '#F1F5F9', fontWeight: 800 }}>
                    <td colSpan={3} style={{ padding: '10px' }}>TOTAL METER SALE</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#1E40AF' }}>{(entry.totalMeterSale || entry.meterSale || 0).toFixed(2)} L</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Table 2: Stock Receipt & Tank Dip Conversion */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1E40AF', marginBottom: '8px' }}>
                2. STOCK RECEIPT & TANK DIP CONVERSION AUDIT
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1E293B', color: '#FFFFFF' }}>
                    <th style={{ padding: '8px 10px', borderRadius: '4px 0 0 4px' }}>Parameter Item</th>
                    <th style={{ padding: '8px 10px' }}>Dip Reading</th>
                    <th style={{ padding: '8px 10px', borderRadius: '0 4px 4px 0', textAlign: 'right' }}>Calculated Stock</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>Opening Tank Stock</td>
                    <td style={{ padding: '8px 10px' }}>{entry.openingDip || 0} cm</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>{(entry.openingStock || 0).toLocaleString()} L</td>
                  </tr>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>Closing Tank Stock</td>
                    <td style={{ padding: '8px 10px' }}>{entry.closingDip || 0} cm</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>{(entry.closingStock || 0).toLocaleString()} L</td>
                  </tr>
                  <tr style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 600 }}>Tanker Stock Receipt Inflow</td>
                    <td style={{ padding: '8px 10px' }}>{entry.wasReceiptReceived ? 'Received' : 'No Inflow'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700 }}>{(entry.receiptQuantity || 0).toLocaleString()} L</td>
                  </tr>
                  <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #E2E8F0', fontWeight: 800 }}>
                    <td style={{ padding: '8px 10px' }}>Calculated Dip Sale</td>
                    <td style={{ padding: '8px 10px' }}>Formula Calculated</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', color: '#0EA5E9' }}>{(entry.dipSale || 0).toLocaleString()} L</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Signature Lines */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #CBD5E1', fontSize: '0.78rem', color: '#64748B' }}>
              <div>
                <div style={{ width: '160px', borderBottom: '1px solid #94A3B8', marginBottom: '6px' }} />
                Station Manager Signature
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ width: '160px', borderBottom: '1px solid #94A3B8', marginBottom: '6px', marginLeft: 'auto' }} />
                Authorized Auditor Signature
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
