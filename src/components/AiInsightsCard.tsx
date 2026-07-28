import React from 'react';
import { Sparkles, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';
import { MD3Card } from './MD3Card';
import { aiInsightsService } from '../services/aiInsightsService';
import type { ProductDailyEntry } from '../types';

interface AiInsightsCardProps {
  entries: ProductDailyEntry[];
}

export const AiInsightsCard: React.FC<AiInsightsCardProps> = ({ entries }) => {
  const dashboardInsight = aiInsightsService.generateDashboardInsight(entries);
  const prediction = aiInsightsService.generatePrediction(entries);

  // Check for recent anomalies
  const recentEntry = entries[0];
  const anomaly = recentEntry ? aiInsightsService.detectAnomalies(recentEntry) : null;

  return (
    <MD3Card
      variant="elevated"
      style={{
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.06) 0%, rgba(14, 165, 233, 0.08) 100%)',
        border: '1.5px solid rgba(30, 64, 175, 0.2)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: 'var(--color-primary-container)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 800 }}>
            <Sparkles size={14} /> AI Fuel Insights
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Health Index:</span>
          <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary)', fontWeight: 800 }}>
            {dashboardInsight.healthScore}/100
          </strong>
        </div>
      </div>

      {/* Main Insight Text */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
        {dashboardInsight.summaryTitle}
      </h3>
      <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginBottom: '14px' }}>
        {dashboardInsight.insightText}
      </p>

      {/* Prediction & Anomaly Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
            <TrendingUp size={14} color="var(--color-primary)" /> Forecasted Variance
          </div>
          <strong style={{ fontSize: '0.95rem', color: prediction.expectedTomorrowGainLiters >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
            {prediction.expectedTomorrowGainLiters >= 0 ? `+${prediction.expectedTomorrowGainLiters}` : prediction.expectedTomorrowGainLiters} L / day
          </strong>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
            Confidence: {prediction.confidencePercentage}%
          </span>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
            {anomaly?.isAnomaly ? <AlertTriangle size={14} color="var(--color-error)" /> : <ShieldCheck size={14} color="var(--color-success)" />} Anomaly Status
          </div>
          <strong style={{ fontSize: '0.88rem', color: anomaly?.isAnomaly ? 'var(--color-error)' : 'var(--color-success)' }}>
            {anomaly?.isAnomaly ? 'Anomaly Detected' : 'Normal Variance'}
          </strong>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
            {anomaly?.isAnomaly ? 'Threshold exceeded' : '0 Anomalies flagged'}
          </span>
        </div>
      </div>
    </MD3Card>
  );
};
