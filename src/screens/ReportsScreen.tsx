import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FileText,
  Download,
  Eye,
  Share2,
  Trash2,
  Filter,
  TrendingUp,
  TrendingDown,
  Search,
} from 'lucide-react';
import { MD3Card } from '../components/MD3Card';
import { MD3Button } from '../components/MD3Button';
import { PdfPreviewModal } from '../components/PdfPreviewModal';
import type { RootState } from '../storage/reduxStore';
import { deleteProductEntry } from '../storage/slices/entrySlice';
import {
  downloadPdfReport,
  sharePdfReport,
  getEstimatedPdfSizeKb,
} from '../helpers/pdfReportGenerator';
import type { ProductDailyEntry } from '../types';

type ReportFilterMode =
  | 'all'
  | 'daily'
  | 'date-range'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'product'
  | 'gain'
  | 'shortage';

export const ReportsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.user.profile);
  const entriesMap = useSelector((state: RootState) => state.entries.entries);

  const currentEmail = (profile?.email || 'default').trim().toLowerCase();
  const allEntriesList: ProductDailyEntry[] = (Object.values(entriesMap) as ProductDailyEntry[])
    .filter((e) => !e.userEmail || e.userEmail === currentEmail)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter State
  const [filterMode, setFilterMode] = useState<ReportFilterMode>('all');
  const [selectedSingleDate, setSelectedSingleDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for View PDF
  const [selectedPreviewEntry, setSelectedPreviewEntry] = useState<ProductDailyEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filter Entries Logic
  const filteredEntries = allEntriesList.filter((entry) => {
    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = entry.productName.toLowerCase().includes(q);
      const matchDate = entry.date.includes(q);
      const matchStatus = entry.status.toLowerCase().includes(q);
      if (!matchName && !matchDate && !matchStatus) return false;
    }

    // 2. Report Type Filter Modes
    switch (filterMode) {
      case 'daily':
        return entry.date === selectedSingleDate;

      case 'date-range': {
        if (startDate && new Date(entry.date) < new Date(startDate)) return false;
        if (endDate && new Date(entry.date) > new Date(endDate)) return false;
        return true;
      }

      case 'weekly': {
        const entryTime = new Date(entry.date).getTime();
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return entryTime >= sevenDaysAgo;
      }

      case 'monthly': {
        const entryTime = new Date(entry.date).getTime();
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return entryTime >= thirtyDaysAgo;
      }

      case 'yearly': {
        const entryYear = new Date(entry.date).getFullYear();
        const currentYear = new Date().getFullYear();
        return entryYear === currentYear;
      }

      case 'product': {
        if (selectedProductFilter !== 'all' && entry.productId !== selectedProductFilter) {
          return false;
        }
        return true;
      }

      case 'gain':
        return entry.difference > 0;

      case 'shortage':
        return entry.difference < 0;

      case 'all':
      default:
        return true;
    }
  });

  // Calculate Summary KPI Stats for Filtered Reports
  const totalReportsCount = filteredEntries.length;
  const totalGainLitres = filteredEntries
    .filter((e) => e.difference > 0)
    .reduce((sum, e) => sum + e.difference, 0);
  const totalShortageLitres = filteredEntries
    .filter((e) => e.difference < 0)
    .reduce((sum, e) => sum + Math.abs(e.difference), 0);
  const netVarianceLitres = totalGainLitres - totalShortageLitres;

  // Actions
  const handleViewPdf = (entry: ProductDailyEntry) => {
    setSelectedPreviewEntry(entry);
    setIsModalOpen(true);
  };

  const handleDownloadPdf = (entry: ProductDailyEntry) => {
    downloadPdfReport(entry, profile);
    setToastMsg(`Downloaded PDF report for ${entry.productName} (${entry.date})`);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleSharePdf = async (entry: ProductDailyEntry) => {
    const ok = await sharePdfReport(entry, profile);
    if (ok) {
      setToastMsg('Report details copied to clipboard / shared!');
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  const handleDeletePdf = (entry: ProductDailyEntry) => {
    if (confirm(`Are you sure you want to delete report for ${entry.productName} on ${entry.date}?`)) {
      dispatch(deleteProductEntry({ date: entry.date, productId: entry.productId }));
      setToastMsg(`Deleted report for ${entry.productName}`);
      setTimeout(() => setToastMsg(null), 2500);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '10px', borderRadius: '14px', background: 'var(--color-primary-gradient)', color: '#FFFFFF' }}>
            <FileText size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Reports & Audit Center
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
              Generate, view, download & share PDF tank variance reports
            </p>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div
          className="animate-fade-in"
          style={{
            padding: '10px 16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--color-success)',
            fontWeight: 700,
            fontSize: '0.88rem',
          }}
        >
          ✨ {toastMsg}
        </div>
      )}

      {/* KPI Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        <MD3Card variant="elevated" style={{ padding: '12px 14px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Total Reports
          </span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {totalReportsCount}
          </h3>
        </MD3Card>

        <MD3Card variant="elevated" style={{ padding: '12px 14px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Total Gain
          </span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-success)' }}>
            +{totalGainLitres.toFixed(1)} L
          </h3>
        </MD3Card>

        <MD3Card variant="elevated" style={{ padding: '12px 14px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Total Shortage
          </span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-error)' }}>
            -{totalShortageLitres.toFixed(1)} L
          </h3>
        </MD3Card>

        <MD3Card variant="elevated" style={{ padding: '12px 14px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Net Variance
          </span>
          <h3
            style={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: netVarianceLitres >= 0 ? 'var(--color-success)' : 'var(--color-error)',
            }}
          >
            {netVarianceLitres >= 0 ? `+${netVarianceLitres.toFixed(1)}` : netVarianceLitres.toFixed(1)} L
          </h3>
        </MD3Card>
      </div>

      {/* FILTER CONTROLS BAR */}
      <MD3Card variant="elevated" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Filter size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Report Filters
          </h3>
        </div>

        {/* Filter Mode Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
          {[
            { id: 'all', label: 'All Reports' },
            { id: 'daily', label: 'Daily Report' },
            { id: 'date-range', label: 'Date-wise Range' },
            { id: 'weekly', label: 'Weekly Report' },
            { id: 'monthly', label: 'Monthly Report' },
            { id: 'yearly', label: 'Yearly Report' },
            { id: 'product', label: 'Product-wise' },
            { id: 'gain', label: 'Gain Report' },
            { id: 'shortage', label: 'Shortage Report' },
          ].map((tab) => {
            const isActive = filterMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id as ReportFilterMode)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: isActive ? 'none' : '1px solid var(--color-card-border)',
                  backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Dynamic Inputs based on selected filter mode */}
        {filterMode === 'daily' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Select Date:
            </label>
            <input
              type="date"
              value={selectedSingleDate}
              onChange={(e) => setSelectedSingleDate(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1.5px solid var(--color-card-border)',
                backgroundColor: 'var(--color-surface-variant)',
                color: 'var(--color-text-primary)',
                fontWeight: 600,
              }}
            />
          </div>
        )}

        {filterMode === 'date-range' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block' }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--color-card-border)',
                  backgroundColor: 'var(--color-surface-variant)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block' }}>
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid var(--color-card-border)',
                  backgroundColor: 'var(--color-surface-variant)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                }}
              />
            </div>
          </div>
        )}

        {filterMode === 'product' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Select Product:
            </label>
            <select
              value={selectedProductFilter}
              onChange={(e) => setSelectedProductFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1.5px solid var(--color-card-border)',
                backgroundColor: 'var(--color-surface-variant)',
                color: 'var(--color-text-primary)',
                fontWeight: 600,
              }}
            >
              <option value="all">All Products</option>
              <option value="hp-ms">MS (Motor Spirit)</option>
              <option value="hp-hsd">HSD (High Speed Diesel)</option>
              <option value="hp-p95">Power95</option>
              <option value="hp-p100">Power100</option>
            </select>
          </div>
        )}
      </MD3Card>

      {/* Search Input Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 14px',
          borderRadius: '14px',
          backgroundColor: 'var(--color-surface)',
          border: '1.5px solid var(--color-card-border)',
        }}
      >
        <Search size={18} color="var(--color-text-muted)" />
        <input
          type="text"
          placeholder="Search by product name, date, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            width: '100%',
            color: 'var(--color-text-primary)',
            fontSize: '0.9rem',
          }}
        />
      </div>

      {/* REPORT LIST CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredEntries.length > 0 ? (
          filteredEntries.map((entry) => {
            const isGain = entry.difference > 0;
            const isShortage = entry.difference < 0;
            const estimatedKb = getEstimatedPdfSizeKb(entry);

            return (
              <MD3Card key={entry.id} variant="elevated" style={{ padding: '18px' }}>
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'var(--color-primary-container)', color: 'var(--color-primary)' }}>
                      <FileText size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                        {entry.productName} Fuel Audit Report
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                          Date: {entry.date}
                        </span>
                        •
                        <span>PDF Size: {estimatedKb} KB</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      backgroundColor: isGain
                        ? 'rgba(16, 185, 129, 0.12)'
                        : isShortage
                        ? 'var(--color-errorContainer)'
                        : 'var(--color-primary-container)',
                      color: isGain
                        ? 'var(--color-success)'
                        : isShortage
                        ? 'var(--color-error)'
                        : 'var(--color-primary)',
                    }}
                  >
                    {isGain ? <TrendingUp size={14} /> : isShortage ? <TrendingDown size={14} /> : null}
                    {entry.status.toUpperCase()} ({isGain ? `+${entry.difference.toFixed(1)}` : entry.difference.toFixed(1)} L)
                  </span>
                </div>

                {/* Metrics Breakdown Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--color-surface-variant)',
                    marginBottom: '14px',
                    fontSize: '0.78rem',
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>Meter Sale</span>
                    <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.88rem' }}>{entry.totalMeterSale.toFixed(1)} L</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>Dip Sale</span>
                    <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.88rem' }}>{entry.dipSale.toFixed(1)} L</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>Receipt Qty</span>
                    <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.88rem' }}>{entry.receiptQuantity.toFixed(0)} L</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--color-text-muted)', display: 'block', fontSize: '0.72rem' }}>Gain / Loss</span>
                    <strong style={{ color: isGain ? 'var(--color-success)' : isShortage ? 'var(--color-error)' : 'var(--color-text-primary)', fontSize: '0.88rem' }}>
                      {isGain ? `+${entry.difference.toFixed(1)}` : entry.difference.toFixed(1)} L
                    </strong>
                  </div>
                </div>

                {/* Card Action Buttons (View PDF, Download PDF, Share PDF, Delete PDF) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MD3Button variant="primary" size="sm" onClick={() => handleViewPdf(entry)} leftIcon={<Eye size={16} />}>
                      View PDF
                    </MD3Button>
                    <MD3Button variant="outline" size="sm" onClick={() => handleDownloadPdf(entry)} leftIcon={<Download size={16} />}>
                      Download PDF
                    </MD3Button>
                    <MD3Button variant="ghost" size="sm" onClick={() => handleSharePdf(entry)} leftIcon={<Share2 size={16} />}>
                      Share PDF
                    </MD3Button>
                  </div>

                  <MD3Button variant="ghost" size="sm" onClick={() => handleDeletePdf(entry)} style={{ color: 'var(--color-error)' }} leftIcon={<Trash2 size={16} />}>
                    Delete
                  </MD3Button>
                </div>
              </MD3Card>
            );
          })
        ) : (
          <MD3Card variant="elevated" style={{ padding: '32px', textAlign: 'center' }}>
            <FileText size={40} color="var(--color-text-muted)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              No Reports Found
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              No entries match the selected filter parameters. Create daily entries in the Entry tab to generate reports.
            </p>
          </MD3Card>
        )}
      </div>

      {/* PDF PREVIEW MODAL */}
      <PdfPreviewModal
        entry={selectedPreviewEntry}
        profile={profile}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
