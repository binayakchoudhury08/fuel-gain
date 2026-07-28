import React, { useState } from 'react';
import { X, Search, Calculator } from 'lucide-react';
import type { DipChartFile } from '../types';
import { dipChartParser } from '../services/dipChartParser';

interface DipChartPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  dipChart: DipChartFile;
}

export const DipChartPreviewModal: React.FC<DipChartPreviewModalProps> = ({
  isOpen,
  onClose,
  dipChart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [testDipStr, setTestDipStr] = useState('51.0'); // 51.0 cm

  if (!isOpen) return null;

  const points = dipChart.calibrationTable || [];
  const meta = dipChart.metadata;

  // Filter points based on search term
  const filteredPoints = points.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.dipMm.toString().includes(term) ||
      (p.dipCm !== undefined && p.dipCm.toString().includes(term)) ||
      p.volumeLitres.toString().includes(term)
    );
  });

  // Calculate test dip volume (in CM)
  const testDipVal = parseFloat(testDipStr) || 0;
  const calcResult = dipChartParser.autoCalculateVolumeFromJsChart(
    dipChart.productId,
    testDipVal,
    meta?.capacityLitres || 20000,
    points
  );

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--color-card-border)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: 'var(--color-surface-variant)',
            borderBottom: '1px solid var(--color-card-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  padding: '3px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(14, 165, 233, 0.15)',
                  color: 'var(--color-primary)',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              >
                PDF JS Engine Calibrated
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {dipChart.productName} Dip Chart Reference
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              {dipChart.fileName} • Extracted {points.length} Calibration Points
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Metadata Card */}
          {meta && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
                padding: '16px',
                borderRadius: '14px',
                backgroundColor: 'var(--color-surface-variant)',
                border: '1px solid var(--color-card-border)',
              }}
            >
              {meta.companyName && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>
                    Company / Format
                  </span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                    {meta.companyName}
                  </strong>
                </div>
              )}
              {meta.capacityLitres && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>
                    Tank Capacity
                  </span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                    {meta.capacityLitres.toLocaleString()} Litres
                  </strong>
                </div>
              )}
              {meta.diameterCm && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>
                    Diameter
                  </span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                    {meta.diameterCm} CM
                  </strong>
                </div>
              )}
              {meta.lengthCm && (
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>
                    Tank Length
                  </span>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                    {meta.lengthCm} CM
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Test Dip Calculator Box */}
          <div
            style={{
              padding: '16px',
              borderRadius: '14px',
              backgroundColor: 'rgba(14, 165, 233, 0.08)',
              border: '1.5px solid var(--color-primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Calculator size={18} color="var(--color-primary)" />
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Interactive Dip Calculator & Linear Interpolation Tester
              </h4>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Enter Dip Reading (cm):
                </label>
                <input
                  type="number"
                  step="any"
                  value={testDipStr}
                  onChange={(e) => setTestDipStr(e.target.value)}
                  placeholder="e.g. 51.0 cm"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid var(--color-card-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ flex: 1.5, padding: '12px', borderRadius: '10px', backgroundColor: 'var(--color-surface)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>
                  Calculated Volume (Litres)
                </span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--color-success)', display: 'block' }}>
                  {calcResult.volumeLitres.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Litres
                </strong>
                {calcResult.interpolatedPoint?.p1 && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', display: 'block', marginTop: '2px' }}>
                    {calcResult.interpolatedPoint.p1 === calcResult.interpolatedPoint.p2
                      ? `Exact Match at ${calcResult.interpolatedPoint.p1.dipCm || calcResult.interpolatedPoint.p1.dipMm / 10} cm`
                      : `Interpolated between ${calcResult.interpolatedPoint.p1.dipCm || calcResult.interpolatedPoint.p1.dipMm / 10} cm (${calcResult.interpolatedPoint.p1.volumeLitres} L) & ${calcResult.interpolatedPoint.p2?.dipCm || (calcResult.interpolatedPoint.p2?.dipMm || 0) / 10} cm (${calcResult.interpolatedPoint.p2?.volumeLitres} L)`}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Extracted Table Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Parsed Dip Calibration Points ({filteredPoints.length} Entries)
              </h4>

              {/* Search input */}
              <div style={{ position: 'relative', width: '200px' }}>
                <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                <input
                  type="text"
                  placeholder="Search dip/litres..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 32px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-card-border)',
                    backgroundColor: 'var(--color-surface-variant)',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
            </div>

            {/* Table */}
            <div
              style={{
                maxHeight: '260px',
                overflowY: 'auto',
                border: '1px solid var(--color-card-border)',
                borderRadius: '12px',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-surface-variant)', borderBottom: '1px solid var(--color-card-border)' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Dip (CM)
                    </th>
                    <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Dip (MM)
                    </th>
                    <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Quantity (Litres)
                    </th>
                    <th style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Rate (L/mm)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPoints.length > 0 ? (
                    filteredPoints.map((pt, idx) => (
                      <tr
                        key={pt.dipMm}
                        style={{
                          borderBottom: '1px solid var(--color-card-border)',
                          backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--color-surface-variant)',
                        }}
                      >
                        <td style={{ padding: '8px 14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {(pt.dipCm !== undefined ? pt.dipCm : pt.dipMm / 10).toFixed(1)} cm
                        </td>
                        <td style={{ padding: '8px 14px', color: 'var(--color-text-secondary)' }}>
                          {pt.dipMm} mm
                        </td>
                        <td style={{ padding: '8px 14px', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {pt.volumeLitres.toLocaleString('en-IN')} L
                        </td>
                        <td style={{ padding: '8px 14px', color: 'var(--color-text-muted)' }}>
                          {pt.ratePerMm ? `${pt.ratePerMm} L/mm` : '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No calibration points match your search filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
