import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FileSpreadsheet,
  Save,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Fuel,
  TrendingUp,
  TrendingDown,
  Scale,
} from 'lucide-react';
import { MD3Card } from '../components/MD3Card';
import { MD3Input } from '../components/MD3Input';
import { MD3Button } from '../components/MD3Button';
import type { RootState } from '../storage/reduxStore';
import { saveProductEntry } from '../storage/slices/entrySlice';
import { COMPANY_PRODUCTS_MAP } from '../constants/companyProducts';
import { dipChartParser } from '../services/dipChartParser';
import { supabaseSyncService } from '../services/supabaseSyncService';
import type { ProductDailyEntry, NozzleReading, FuelProduct, PetrolCompanyCode } from '../types';

export const EntryScreen: React.FC = () => {
  const dispatch = useDispatch();
  const profile = useSelector((state: RootState) => state.user.profile);
  const existingEntries = useSelector((state: RootState) => state.entries.entries);

  // Selected Date state (Default = Today YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Expanded cards state (product IDs that are expanded)
  const selectedProductIds = profile?.selectedProductIds || ['hp-ms', 'hp-hsd'];
  const companyProducts = (profile?.pumpCompany && COMPANY_PRODUCTS_MAP[profile.pumpCompany as PetrolCompanyCode]) || COMPANY_PRODUCTS_MAP.HPCL;
  const activeProducts = companyProducts.filter((p: FuelProduct) => selectedProductIds.includes(p.id));

  // Initialize expanded cards: default first product expanded
  const [expandedProductIds, setExpandedProductIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    activeProducts.forEach((p: FuelProduct, idx: number) => {
      initial[p.id] = idx === 0;
    });
    return initial;
  });

  const toggleExpand = (productId: string) => {
    setExpandedProductIds((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  return (
    <div style={{ maxWidth: '768px', margin: '0 auto', padding: '16px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Entry Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '10px', borderRadius: '14px', background: 'var(--color-primary-gradient)', color: '#FFFFFF' }}>
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Daily Stock & Sales Entry
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
              {profile?.pumpName || 'Station'} • {activeProducts.length} Configured Products
            </p>
          </div>
        </div>
      </div>

      {/* Date Picker Bar */}
      <MD3Card variant="elevated" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--color-primary)" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Entry Date:
            </span>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1.5px solid var(--color-card-border)',
              backgroundColor: 'var(--color-surface-variant)',
              color: 'var(--color-text-primary)',
              fontSize: '0.95rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer',
            }}
          />
        </div>
      </MD3Card>

      {/* Expandable Product Cards */}
      {activeProducts.length > 0 ? (
        activeProducts.map((product: FuelProduct) => (
          <ProductEntryCard
            key={`${selectedDate}_${product.id}`}
            product={product}
            date={selectedDate}
            configuredNozzleCount={profile?.nozzleCounts?.[product.id] || 4}
            existingEntry={existingEntries[`${selectedDate}_${product.id}`]}
            isExpanded={!!expandedProductIds[product.id]}
            onToggleExpand={() => toggleExpand(product.id)}
            onSave={(entry) => dispatch(saveProductEntry(entry))}
          />
        ))
      ) : (
        <MD3Card variant="elevated" style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            No products configured. Please select products in Settings / Profile setup.
          </p>
        </MD3Card>
      )}
    </div>
  );
};

/* ====================================================================
   PRODUCT ENTRY CARD COMPONENT (Handles 5-Step Entry Workflow)
   ==================================================================== */

interface ProductEntryCardProps {
  product: FuelProduct;
  date: string;
  configuredNozzleCount: number;
  existingEntry?: ProductDailyEntry;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSave: (entry: ProductDailyEntry) => void;
}

const ProductEntryCard: React.FC<ProductEntryCardProps> = ({
  product,
  date,
  configuredNozzleCount,
  existingEntry,
  isExpanded,
  onToggleExpand,
  onSave,
}) => {
  // Step 1: Stock Receipt State
  const [wasReceiptReceived, setWasReceiptReceived] = useState<boolean>(
    existingEntry?.wasReceiptReceived ?? false
  );
  const [receiptQuantityStr, setReceiptQuantityStr] = useState<string>(
    existingEntry?.receiptQuantity !== undefined ? existingEntry.receiptQuantity.toString() : ''
  );

  // Step 2: Nozzle Readings State (Clean default for new entry)
  const [nozzleReadings, setNozzleReadings] = useState<NozzleReading[]>(() => {
    if (existingEntry?.nozzleReadings && existingEntry.nozzleReadings.length > 0) {
      return existingEntry.nozzleReadings;
    }
    return Array.from({ length: configuredNozzleCount }, (_, i) => ({
      nozzleIndex: i + 1,
      nozzleName: `Nozzle ${i + 1}`,
      openingReading: 0,
      closingReading: 0,
      sale: 0,
    }));
  });

  // Step 3: Dip Readings State (Centimeters cm - Clean default for new entry)
  const [openingDipStr, setOpeningDipStr] = useState<string>(
    existingEntry?.openingDip !== undefined ? existingEntry.openingDip.toString() : ''
  );
  const [closingDipStr, setClosingDipStr] = useState<string>(
    existingEntry?.closingDip !== undefined ? existingEntry.closingDip.toString() : ''
  );

  // Synchronize state when selected date or existing saved entry changes
  useEffect(() => {
    if (existingEntry) {
      setWasReceiptReceived(existingEntry.wasReceiptReceived);
      setReceiptQuantityStr(existingEntry.receiptQuantity ? existingEntry.receiptQuantity.toString() : '');
      setNozzleReadings(existingEntry.nozzleReadings);
      setOpeningDipStr(existingEntry.openingDip !== undefined ? existingEntry.openingDip.toString() : '');
      setClosingDipStr(existingEntry.closingDip !== undefined ? existingEntry.closingDip.toString() : '');
    } else {
      setWasReceiptReceived(false);
      setReceiptQuantityStr('');
      setNozzleReadings(
        Array.from({ length: configuredNozzleCount }, (_, i) => ({
          nozzleIndex: i + 1,
          nozzleName: `Nozzle ${i + 1}`,
          openingReading: 0,
          closingReading: 0,
          sale: 0,
        }))
      );
      setOpeningDipStr('');
      setClosingDipStr('');
    }
  }, [existingEntry, date, configuredNozzleCount]);

  // UI state
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // LIVE CALCULATIONS
  const receiptQuantity = wasReceiptReceived ? Math.max(0, parseFloat(receiptQuantityStr) || 0) : 0;

  // Meter Sale Calculation (Sum of Closing - Opening for each nozzle)
  const totalMeterSale = nozzleReadings.reduce((sum, n) => {
    const sale = Math.max(0, n.closingReading - n.openingReading);
    return sum + sale;
  }, 0);

  // Dip Conversion into Stock (Litres) using Uploaded Dip Chart JS Engine
  const profile = useSelector((state: RootState) => state.user.profile);
  const uploadedPdf = profile?.dipChartsUploaded?.[product.id];
  const customCalibrationPoints = uploadedPdf?.calibrationTable;

  // Primary unit: Centimeters (cm)
  const rawOpening = parseFloat(openingDipStr) || 0;
  const rawClosing = parseFloat(closingDipStr) || 0;
  const openingDipCm = rawOpening > 300 ? rawOpening / 10 : rawOpening;
  const closingDipCm = rawClosing > 300 ? rawClosing / 10 : rawClosing;

  // Auto calculate volume strictly from uploaded PDF converted JS Chart in CM
  const openingCalc = dipChartParser.autoCalculateVolumeFromJsChart(
    product.id,
    openingDipCm,
    uploadedPdf?.metadata?.capacityLitres || 20000,
    customCalibrationPoints
  );
  const closingCalc = dipChartParser.autoCalculateVolumeFromJsChart(
    product.id,
    closingDipCm,
    uploadedPdf?.metadata?.capacityLitres || 20000,
    customCalibrationPoints
  );

  const openingStock = openingCalc.volumeLitres;
  const closingStock = closingCalc.volumeLitres;

  // Dip Sale Calculation: Opening Stock - Closing Stock + Receipt Quantity
  const dipSale = Math.max(0, openingStock - closingStock + receiptQuantity);

  // Gain / Shortage Formula: Meter Sale - Dip Sale
  const difference = totalMeterSale - dipSale;
  const status: 'Gain' | 'Shortage' | 'Balanced' =
    Math.abs(difference) < 0.1 ? 'Balanced' : difference > 0 ? 'Gain' : 'Shortage';

  // Handle Nozzle Input Changes
  const handleNozzleChange = (index: number, field: 'openingReading' | 'closingReading', valStr: string) => {
    const val = parseFloat(valStr) || 0;
    setNozzleReadings((prev) => {
      const copy = [...prev];
      const n = { ...copy[index] };
      if (field === 'openingReading') {
        n.openingReading = val;
      } else {
        n.closingReading = val;
      }
      n.sale = Math.max(0, n.closingReading - n.openingReading);
      copy[index] = n;
      return copy;
    });
  };

  // Validate & Save Entry
  const handleSave = () => {
    const newErrors: Record<string, string> = {};

    if (wasReceiptReceived && (isNaN(parseFloat(receiptQuantityStr)) || parseFloat(receiptQuantityStr) < 0)) {
      newErrors.receipt = 'Receipt Quantity cannot be negative';
    }

    nozzleReadings.forEach((n) => {
      if (n.closingReading < n.openingReading) {
        newErrors[`nozzle_${n.nozzleIndex}`] = `${n.nozzleName}: Closing reading must be ≥ Opening reading`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const entryToSave: ProductDailyEntry = {
      id: existingEntry?.id || `entry_${date}_${product.id}`,
      date,
      productId: product.id,
      productName: product.name,
      wasReceiptReceived,
      receiptQuantity,
      nozzleReadings,
      totalMeterSale,
      openingDip: openingDipCm,
      closingDip: closingDipCm,
      openingStock,
      closingStock,
      dipSale,
      meterSale: totalMeterSale,
      difference: Math.round(difference * 100) / 100,
      status,
      updatedAt: new Date().toISOString(),
    };

    onSave(entryToSave);
    
    // Sync directly to Supabase Cloud Database
    supabaseSyncService.syncDailyEntryToSupabase(entryToSave).then((res) => {
      if (res.success) {
        setSaveNotice(existingEntry ? 'Entry updated & synced to Supabase!' : 'Entry saved & synced to Supabase Cloud!');
      } else {
        setSaveNotice(existingEntry ? 'Entry updated locally!' : 'Entry saved locally!');
      }
    });

    setTimeout(() => setSaveNotice(null), 4000);
  };

  return (
    <MD3Card variant="elevated" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Card Header (Clickable to Expand/Collapse) */}
      <div
        onClick={onToggleExpand}
        style={{
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--color-surface)',
          cursor: 'pointer',
          borderBottom: isExpanded ? '1px solid var(--color-card-border)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'var(--color-primary-container)', color: 'var(--color-primary)' }}>
            <Fuel size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {product.name}
              </h3>
              {existingEntry && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(14, 165, 233, 0.15)',
                    color: 'var(--color-secondary)',
                  }}
                >
                  Edit Existing Entry
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              {nozzleReadings.length} Nozzles • {product.code}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>
              Meter Sale
            </span>
            <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>
              {totalMeterSale.toFixed(1)} L
            </strong>
          </div>
          <button style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
          </button>
        </div>
      </div>

      {/* Expanded 5-Step Workflow Body */}
      {isExpanded && (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {saveNotice && (
            <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} /> {saveNotice}
            </div>
          )}

          {/* STEP 1: STOCK RECEIPT */}
          <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--color-surface-variant)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
              Step 1: Stock Receipt
            </h4>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '8px' }}>
              Was Stock Receipt Received Today?
            </label>

            <div style={{ display: 'flex', gap: '12px', marginBottom: wasReceiptReceived ? '14px' : '0' }}>
              <button
                type="button"
                onClick={() => setWasReceiptReceived(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: !wasReceiptReceived ? '2px solid var(--color-primary)' : '1px solid var(--color-card-border)',
                  backgroundColor: !wasReceiptReceived ? 'var(--color-primary-container)' : 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                No (0 Litres)
              </button>
              <button
                type="button"
                onClick={() => setWasReceiptReceived(true)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: wasReceiptReceived ? '2px solid var(--color-primary)' : '1px solid var(--color-card-border)',
                  backgroundColor: wasReceiptReceived ? 'var(--color-primary-container)' : 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Yes (Stock Inflow)
              </button>
            </div>

            {wasReceiptReceived && (
              <div>
                <MD3Input
                  label="Receipt Quantity (Litres)"
                  type="number"
                  placeholder="e.g. 12000"
                  value={receiptQuantityStr}
                  onChange={(e) => setReceiptQuantityStr(e.target.value)}
                  error={errors.receipt}
                />
              </div>
            )}
          </div>

          {/* STEP 2: NOZZLE READINGS */}
          <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--color-surface-variant)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Step 2: Nozzle Meter Readings ({nozzleReadings.length} Configured Nozzles)
              </h4>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Total Meter Sale: {totalMeterSale.toFixed(1)} L
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {nozzleReadings.map((n, idx) => {
                const nozzleErr = errors[`nozzle_${n.nozzleIndex}`];
                return (
                  <div
                    key={n.nozzleIndex}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--color-surface)',
                      border: nozzleErr ? '1.5px solid var(--color-error)' : '1px solid var(--color-card-border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                        {n.nozzleName}
                      </strong>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-success)' }}>
                        Sale: {n.sale.toFixed(1)} L
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                          Opening Reading
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={n.openingReading}
                          onChange={(e) => handleNozzleChange(idx, 'openingReading', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-card-border)',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            backgroundColor: 'var(--color-surface-variant)',
                            color: 'var(--color-text-primary)',
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                          Closing Reading
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={n.closingReading}
                          onChange={(e) => handleNozzleChange(idx, 'closingReading', e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-card-border)',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            backgroundColor: 'var(--color-surface-variant)',
                            color: 'var(--color-text-primary)',
                          }}
                        />
                      </div>
                    </div>
                    {nozzleErr && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: '4px', display: 'block' }}>
                        {nozzleErr}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 3: DIP READINGS & AUTO VOLUME CONVERSION */}
          <div style={{ padding: '16px', borderRadius: '14px', backgroundColor: 'var(--color-surface-variant)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Step 3: Tank Dip Readings & Automatic Volume Conversion
              </h4>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  backgroundColor: uploadedPdf ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                  color: uploadedPdf ? 'var(--color-success)' : 'var(--color-warning)',
                }}
              >
                {uploadedPdf ? 'PDF Chart Active' : 'Default UST Scale'}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              Enter dip reading in centimeters (cm) (e.g. 51.0 cm, 101.5 cm). Auto-calculated using PDF calibration chart.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <MD3Input
                label="Opening Dip (cm)"
                type="number"
                step="any"
                value={openingDipStr}
                onChange={(e) => setOpeningDipStr(e.target.value)}
              />
              <MD3Input
                label="Closing Dip (cm)"
                type="number"
                step="any"
                value={closingDipStr}
                onChange={(e) => setClosingDipStr(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: 'var(--color-surface)', padding: '12px', borderRadius: '10px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>
                  Opening Stock ({openingDipCm.toFixed(1)} cm)
                </span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                  {openingStock.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Litres
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>
                  Closing Stock ({closingDipCm.toFixed(1)} cm)
                </span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--color-primary)' }}>
                  {closingStock.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Litres
                </strong>
              </div>
            </div>
          </div>

          {/* STEP 4: LIVE CALCULATIONS & GAIN/SHORTAGE BREAKDOWN */}
          <div
            style={{
              padding: '16px',
              borderRadius: '14px',
              backgroundColor:
                status === 'Gain'
                  ? 'rgba(16, 185, 129, 0.1)'
                  : status === 'Shortage'
                  ? 'var(--color-errorContainer)'
                  : 'var(--color-surface-variant)',
              border:
                status === 'Gain'
                  ? '1.5px solid var(--color-success)'
                  : status === 'Shortage'
                  ? '1.5px solid var(--color-error)'
                  : '1.5px solid var(--color-card-border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  Step 4: Live Gain / Shortage Breakdown
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Formula: Meter Sale - Dip Sale (Opening Stock - Closing Stock + Receipt)
                </span>
              </div>

              {/* Status Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  backgroundColor:
                    status === 'Gain'
                      ? 'var(--color-success)'
                      : status === 'Shortage'
                      ? 'var(--color-error)'
                      : 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                }}
              >
                {status === 'Gain' && <TrendingUp size={16} />}
                {status === 'Shortage' && <TrendingDown size={16} />}
                {status === 'Balanced' && <Scale size={16} />}
                <span>{status === 'Gain' ? 'GAIN' : status === 'Shortage' ? 'SHORTAGE' : 'BALANCED'}</span>
              </div>
            </div>

            {/* Calculations Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', textAlign: 'center', fontSize: '0.82rem' }}>
              <div style={{ backgroundColor: 'var(--color-surface)', padding: '10px 6px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Meter Sale</span>
                <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>{totalMeterSale.toFixed(1)} L</strong>
              </div>
              <div style={{ backgroundColor: 'var(--color-surface)', padding: '10px 6px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Dip Sale</span>
                <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>{dipSale.toFixed(1)} L</strong>
              </div>
              <div style={{ backgroundColor: 'var(--color-surface)', padding: '10px 6px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Receipt Qty</span>
                <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>{receiptQuantity.toFixed(0)} L</strong>
              </div>
              <div style={{ backgroundColor: 'var(--color-surface)', padding: '10px 6px', borderRadius: '8px' }}>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', display: 'block' }}>Difference</span>
                <strong style={{ color: status === 'Gain' ? 'var(--color-success)' : status === 'Shortage' ? 'var(--color-error)' : 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                  {difference > 0 ? `+${difference.toFixed(1)}` : difference.toFixed(1)} L
                </strong>
              </div>
            </div>
          </div>

          {/* STEP 5: SAVE BUTTON */}
          <div>
            <MD3Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleSave}
              leftIcon={<Save size={18} />}
            >
              {existingEntry ? `Update ${product.name} Entry` : `Save ${product.name} Entry`}
            </MD3Button>
          </div>
        </div>
      )}
    </MD3Card>
  );
};
