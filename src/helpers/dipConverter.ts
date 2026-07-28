/**
 * Tank Dip Level (mm / cm) to Volume (Litres) Automatic Converter
 * Supports uploaded Dip Chart PDF calibration points with exact linear interpolation.
 */

import type { DipChartPoint } from '../types';

export function convertDipToVolume(
  dipCmInput: number,
  tankCapacityLitres: number = 20000,
  customCalibrationPoints?: DipChartPoint[],
  litresPerCm: number = 100.0
): number {
  if (!dipCmInput || dipCmInput <= 0) return 0;

  const dipCm = dipCmInput > 300 ? dipCmInput / 10 : dipCmInput;
  const dipMm = Math.round(dipCm * 10);

  // 1. Interpolate from parsed PDF Dip Chart calibration points in CM
  if (customCalibrationPoints && customCalibrationPoints.length > 1) {
    const points = [...customCalibrationPoints].sort((a, b) => a.dipMm - b.dipMm);

    if (dipMm <= points[0].dipMm) {
      return points[0].volumeLitres;
    }

    const last = points[points.length - 1];
    if (dipMm >= last.dipMm) {
      return last.volumeLitres;
    }

    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      if (dipMm >= p1.dipMm && dipMm <= p2.dipMm) {
        const p1Cm = p1.dipCm !== undefined ? p1.dipCm : p1.dipMm / 10;
        const p2Cm = p2.dipCm !== undefined ? p2.dipCm : p2.dipMm / 10;
        const dipDiff = p2Cm - p1Cm;

        if (dipDiff === 0) return p1.volumeLitres;

        // Linear interpolation formula: V = V1 + (dip - D1) * (V2 - V1) / (D2 - D1)
        const ratio = (dipCm - p1Cm) / dipDiff;
        const calculatedVolume = p1.volumeLitres + ratio * (p2.volumeLitres - p1.volumeLitres);
        return Math.round(calculatedVolume * 100) / 100;
      }
    }
  }

  // 2. Fallback UST formula: Math.min(tankCapacityLitres, dipCm * litresPerCm)
  const calculatedVolume = Math.min(tankCapacityLitres, dipCm * litresPerCm);
  return Math.round(calculatedVolume * 100) / 100;
}

export function generateDefaultCalibrationCurve(
  tankCapacityLitres: number = 20000,
  litresPerMm: number = 12.0
): DipChartPoint[] {
  const points: DipChartPoint[] = [];
  const maxDip = 2200; // mm
  const step = 10; // 10mm step

  for (let dip = 0; dip <= maxDip; dip += step) {
    const vol = Math.min(tankCapacityLitres, dip * litresPerMm);
    points.push({
      dipMm: dip,
      dipCm: dip / 10,
      volumeLitres: Math.round(vol * 100) / 100,
      ratePerMm: litresPerMm,
    });
  }

  return points;
}

export function formatVolume(volumeLitres: number): string {
  return `${volumeLitres.toLocaleString('en-IN', { maximumFractionDigits: 2 })} L`;
}
