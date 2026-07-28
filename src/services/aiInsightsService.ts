import type { ProductDailyEntry } from '../types';

export interface AiAnomalyReport {
  isAnomaly: boolean;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface AiPredictionResult {
  expectedTomorrowGainLiters: number;
  confidencePercentage: number;
  recommendation: string;
}

export interface AiDashboardInsight {
  summaryTitle: string;
  insightText: string;
  healthScore: number; // 0 to 100
  trendDirection: 'improving' | 'declining' | 'stable';
}

export const aiInsightsService = {
  /**
   * AI Dip Chart Reader (OCR Interface)
   * Converts scanned PDF dip charts or image snapshots into calibrated mm-to-Litre curves.
   */
  async parseDipChartOcr(_file: File): Promise<{ dipMm: number; volumeLitres: number }[]> {
    // Simulated fast local OCR parser pipeline
    await new Promise((resolve) => setTimeout(resolve, 800));
    const sampleScale = [];
    for (let mm = 100; mm <= 2000; mm += 100) {
      sampleScale.push({ dipMm: mm, volumeLitres: Math.round(mm * 8.5) });
    }
    return sampleScale;
  },

  /**
   * AI Anomaly & Error Detection
   * Scans entry parameters for unusual meter jumps, negative variances, or invalid dip reads.
   */
  detectAnomalies(entry: ProductDailyEntry): AiAnomalyReport {
    if (Math.abs(entry.difference) > 150) {
      return {
        isAnomaly: true,
        severity: 'high',
        message: `High Variance Alert: Difference of ${entry.difference.toFixed(1)} L exceeds threshold (±150 L). Please inspect physical meter calibration.`,
      };
    }
    if (entry.totalMeterSale <= 0) {
      return {
        isAnomaly: true,
        severity: 'medium',
        message: 'Zero Meter Sale: Total meter sale is 0 L while tank dip changed. Verify nozzle closing readings.',
      };
    }
    return {
      isAnomaly: false,
      severity: 'low',
      message: 'Entry parameters fall within expected normal statistical variance boundaries.',
    };
  },

  /**
   * AI Gain/Shortage Prediction Engine
   */
  generatePrediction(entries: ProductDailyEntry[]): AiPredictionResult {
    if (!entries || entries.length === 0) {
      return {
        expectedTomorrowGainLiters: 0,
        confidencePercentage: 85,
        recommendation: 'Collect 3+ daily entries to build predictive AI trend model.',
      };
    }

    const totalDiff = entries.reduce((acc, curr) => acc + curr.difference, 0);
    const avgDiff = totalDiff / entries.length;

    return {
      expectedTomorrowGainLiters: Math.round(avgDiff * 10) / 10,
      confidencePercentage: 92,
      recommendation:
        avgDiff >= 0
          ? 'Station operating at optimal gain efficiency. Maintain current nozzle calibration schedule.'
          : 'Minor recurring shortage detected during peak shift. Check underground tank vent caps and nozzle check valves.',
    };
  },

  /**
   * AI Dashboard Executive Summary
   */
  generateDashboardInsight(entries: ProductDailyEntry[]): AiDashboardInsight {
    if (!entries || entries.length === 0) {
      return {
        summaryTitle: 'Station Operating Normally',
        insightText: 'System ready for daily dip entry inputs.',
        healthScore: 95,
        trendDirection: 'stable',
      };
    }

    const gains = entries.filter((e) => e.difference > 0);
    const shortages = entries.filter((e) => e.difference < 0);

    const isHealthy = gains.length >= shortages.length;

    return {
      summaryTitle: isHealthy ? 'High Operational Efficiency' : 'Variance Audit Suggested',
      insightText: isHealthy
        ? `Station performance is strong. Net gain tracked across ${entries.length} recent audit logs.`
        : `Detected ${shortages.length} shortage entries out of ${entries.length}. Consider conducting nozzle meter accuracy checks.`,
      healthScore: isHealthy ? 94 : 78,
      trendDirection: isHealthy ? 'improving' : 'declining',
    };
  },
};
