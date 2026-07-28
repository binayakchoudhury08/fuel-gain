import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  Download,
  PlusCircle,
  BarChart3,
  Clock,
  Zap,
  CheckCircle2,
  FileText,
  Fuel,
  Sun,
  Moon,
  Sunset,
} from 'lucide-react';
import { MD3Card } from '../components/MD3Card';
import { MD3Button } from '../components/MD3Button';
import { AiInsightsCard } from '../components/AiInsightsCard';
import { AdminRoleBadge } from '../components/AdminRoleBadge';
import type { RootState } from '../storage/reduxStore';
import type { ProductDailyEntry, FuelProduct, PetrolCompanyCode } from '../types';
import { COMPANY_PRODUCTS_MAP } from '../constants/companyProducts';

interface DashboardScreenProps {
  onNavigateTab: (tab: 'entry' | 'reports' | 'profile') => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigateTab }) => {
  const profile = useSelector((state: RootState) => state.user.profile);
  const entriesMap = useSelector((state: RootState) => state.entries.entries);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Live Digital Clock Timer
  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const currentHour = currentTime.getHours();
  const greeting =
    currentHour < 12
      ? { title: 'Good Morning', icon: <Sun size={16} color="#FBBF24" /> }
      : currentHour < 17
      ? { title: 'Good Afternoon', icon: <Sunset size={16} color="#F97316" /> }
      : { title: 'Good Evening', icon: <Moon size={16} color="#818CF8" /> };

  const currentEmail = (profile?.email || 'default').trim().toLowerCase();
  
  // Deduplicate entries by unique date_productId key
  const uniqueDashboardEntries = new Map<string, ProductDailyEntry>();
  (Object.values(entriesMap) as ProductDailyEntry[]).forEach((e) => {
    if (e && (!e.userEmail || e.userEmail === currentEmail)) {
      uniqueDashboardEntries.set(`${e.date}_${e.productId}`, e);
    }
  });

  const entriesList: ProductDailyEntry[] = Array.from(uniqueDashboardEntries.values());
  const totalEntries = entriesList.length;

  const totalGainLiters = entriesList
    .filter((e) => e.difference > 0)
    .reduce((sum, e) => sum + e.difference, 0);

  const totalShortageLiters = entriesList
    .filter((e) => e.difference < 0)
    .reduce((sum, e) => sum + Math.abs(e.difference), 0);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // Get user's configured products
  const companyProducts = (profile?.pumpCompany && COMPANY_PRODUCTS_MAP[profile.pumpCompany as PetrolCompanyCode]) || COMPANY_PRODUCTS_MAP.HPCL;
  const activeProducts = profile?.selectedProductIds
    ? companyProducts.filter((p: FuelProduct) => profile.selectedProductIds?.includes(p.id))
    : companyProducts;

  return (
    <div style={{ maxWidth: '768px', margin: '0 auto', padding: '16px 16px 90px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Welcome Banner */}
      <MD3Card
        variant="elevated"
        style={{
          background: 'linear-gradient(135deg, #1E40AF 0%, #1E3A8A 50%, #0F172A 100%)',
          color: '#FFFFFF',
          padding: '24px',
          borderRadius: '24px',
          boxShadow: '0 12px 32px rgba(30, 64, 175, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {greeting.icon} {greeting.title},
                </span>
                <AdminRoleBadge role="Owner" />
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.4px' }}>
                {profile?.fullName || 'Station Manager'}
              </h2>
              <p style={{ fontSize: '0.88rem', opacity: 0.9, marginTop: '4px' }}>
                {profile?.pumpName || 'Shree Ganesh HPCL Filling Station'} ({profile?.pumpCompany || 'HPCL'})
              </p>
            </div>

            {/* Digital Clock Badge */}
            <div style={{ textAlign: 'right', background: 'rgba(255, 255, 255, 0.12)', padding: '10px 16px', borderRadius: '16px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <Clock size={13} /> {formattedDate}
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.5px', marginTop: '2px' }}>
                {formattedTime}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <MD3Button
              variant="secondary"
              size="md"
              onClick={() => onNavigateTab('entry')}
              leftIcon={<PlusCircle size={18} />}
            >
              New Daily Dip Entry
            </MD3Button>
            <MD3Button
              variant="outline"
              size="md"
              onClick={() => onNavigateTab('reports')}
              style={{ color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.4)' }}
              leftIcon={<Download size={18} />}
            >
              Audit Reports PDF
            </MD3Button>
          </div>
        </div>
      </MD3Card>

      {/* AI Insights Engine */}
      <AiInsightsCard entries={entriesList} />

      {/* Real-time KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <MD3Card variant="elevated" style={{ padding: '18px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Variance Gain
            </span>
            <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)', letterSpacing: '-0.3px' }}>
            +{totalGainLiters.toFixed(1)} L
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block', fontWeight: 500 }}>
            Cumulative meter profit
          </span>
        </MD3Card>

        <MD3Card variant="elevated" style={{ padding: '18px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Shortage Loss
            </span>
            <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'var(--color-errorContainer)', color: 'var(--color-error)' }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-error)', letterSpacing: '-0.3px' }}>
            -{totalShortageLiters.toFixed(1)} L
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block', fontWeight: 500 }}>
            Cumulative shortage variance
          </span>
        </MD3Card>

        <MD3Card variant="elevated" style={{ padding: '18px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Audit Logs
            </span>
            <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'var(--color-primary-container)', color: 'var(--color-primary)' }}>
              <FileSpreadsheet size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {totalEntries}
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block', fontWeight: 500 }}>
            Recorded tank logs
          </span>
        </MD3Card>

        <MD3Card variant="elevated" style={{ padding: '18px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Reports Available
            </span>
            <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'rgba(14, 165, 233, 0.15)', color: 'var(--color-secondary)' }}>
              <BarChart3 size={20} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            {totalEntries} PDF
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block', fontWeight: 500 }}>
            Audit document downloads
          </span>
        </MD3Card>
      </div>

      {/* Configured Products & Dip PDF Status Card */}
      <MD3Card variant="elevated" style={{ padding: '20px', borderRadius: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Fuel size={20} color="var(--color-primary)" /> Configured Tanks & PDF Calibration
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activeProducts.length > 0 ? (
            activeProducts.map((prod: FuelProduct) => {
              const uploadedPdf = profile?.dipChartsUploaded?.[prod.id];
              const nozzles = profile?.nozzleCounts?.[prod.id] || 4;
              return (
                <div
                  key={prod.id}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '14px',
                    backgroundColor: 'var(--color-surface-variant)',
                    border: '1px solid var(--color-card-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                      {prod.name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {nozzles} Dispensing Nozzles Configured
                    </span>
                  </div>

                  {uploadedPdf ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--color-success)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}
                    >
                      <CheckCircle2 size={14} /> PDF Calibrated
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      <FileText size={14} /> Standard Curve
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              No products selected. Please configure products in Settings.
            </p>
          )}
        </div>
      </MD3Card>

      {/* Quick Action Navigation Card */}
      <MD3Card variant="elevated" style={{ padding: '20px', borderRadius: '20px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={20} color="var(--color-primary)" /> Quick Station Actions
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <MD3Button variant="primary" onClick={() => onNavigateTab('entry')} leftIcon={<PlusCircle size={18} />}>
            Enter Daily Readings
          </MD3Button>
          <MD3Button variant="outline" onClick={() => onNavigateTab('reports')} leftIcon={<BarChart3 size={18} />}>
            Audit Reports Center
          </MD3Button>
        </div>
      </MD3Card>
    </div>
  );
};
