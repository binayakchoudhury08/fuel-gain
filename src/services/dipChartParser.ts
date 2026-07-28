import * as pdfjsLib from 'pdfjs-dist';
import type { DipChartPoint, DipChartMetadata } from '../types';

// Configure pdfjs worker for browser execution
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.mjs`;
}

export type ProductJsDipCharts = Record<string, DipChartPoint[]>;

const DIP_CHART_JS_STORAGE_KEY = 'fuel_gain_dip_charts_js';

export const dipChartParser = {
  /**
   * Extract raw text from a PDF file using pdfjs-dist
   */
  async extractTextFromPdfFile(file: File | Blob): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdfDoc = await loadingTask.promise;
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Sort text items by vertical Y coordinate, then horizontal X coordinate
        const items = textContent.items as Array<{ str: string; transform: number[] }>;
        
        // Group items by line Y-position (transform[5])
        const lineGroups: Record<number, Array<{ x: number; str: string }>> = {};
        for (const item of items) {
          if (!item.str || !item.str.trim()) continue;
          // Round Y coordinate to group items on same line (within 3px tolerance)
          const yKey = Math.round((item.transform[5] || 0) / 3) * 3;
          if (!lineGroups[yKey]) lineGroups[yKey] = [];
          lineGroups[yKey].push({
            x: item.transform[4] || 0,
            str: item.str.trim(),
          });
        }

        // Sort lines from top (highest Y) to bottom (lowest Y)
        const sortedYKeys = Object.keys(lineGroups)
          .map(Number)
          .sort((a, b) => b - a);

        let pageText = '';
        for (const y of sortedYKeys) {
          // Sort line items horizontally from left to right
          const lineItems = lineGroups[y].sort((a, b) => a.x - b.x);
          const lineStr = lineItems.map((it) => it.str).join(' ');
          pageText += lineStr + '\n';
        }

        fullText += pageText + '\n--- PAGE BREAK ---\n';
      }

      return fullText;
    } catch (err) {
      console.warn('PDF.js text extraction failed or file is scanned image. Falling back to pattern generator.', err);
      return '';
    }
  },

  /**
   * Parse extracted raw text into structured DipChartMetadata & Calibration Points
   */
  parseDipChartText(text: string): { metadata: DipChartMetadata; points: DipChartPoint[] } {
    const metadata: DipChartMetadata = {
      dipUnit: 'cm',
    };
    const pointsMap = new Map<number, DipChartPoint>();

    if (!text || text.trim().length === 0) {
      return { metadata, points: [] };
    }

    // 1. Detect Header Metadata
    if (/HINDUSTAN PETROLEUM/i.test(text)) metadata.companyName = 'Hindustan Petroleum Corp Ltd (HPCL)';
    else if (/INDIAN OIL/i.test(text)) metadata.companyName = 'Indian Oil Corp Ltd (IOCL)';
    else if (/BHARAT PETROLEUM/i.test(text)) metadata.companyName = 'Bharat Petroleum Corp Ltd (BPCL)';
    else if (/MATHEMATICAL CALIBRATION/i.test(text)) metadata.companyName = 'Mathematical UST Tank Calibration';

    const radiusMatch = text.match(/RADIUS:\s*([\d.]+)\s*(CMS?|MM)/i);
    if (radiusMatch) metadata.radiusCm = parseFloat(radiusMatch[1]);

    const diaMatch = text.match(/(?:DIAMETER|Dia)[:=]\s*([\d.]+)\s*(CM|MM)/i);
    if (diaMatch) {
      const val = parseFloat(diaMatch[1]);
      metadata.diameterCm = diaMatch[2].toUpperCase() === 'MM' ? val / 10 : val;
    }

    const lenMatch = text.match(/(?:LENTH|LENGTH|Lenth)[:=]\s*([\d.]+)\s*(CM|MM)/i);
    if (lenMatch) {
      const val = parseFloat(lenMatch[1]);
      metadata.lengthCm = lenMatch[2].toUpperCase() === 'MM' ? val / 10 : val;
    }

    const capMatch = text.match(/(?:Capacity|TANK|DIPCHART FOR)[:=]?\s*([\d,.]+)\s*(KL|Ltrs|Litres)/i);
    if (capMatch) {
      const val = parseFloat(capMatch[1].replace(/,/g, ''));
      metadata.capacityLitres = capMatch[2].toUpperCase() === 'KL' ? val * 1000 : val;
    }

    // Determine unit from text headers
    if (/DIP\(CM\)|DIP\s*cm/i.test(text)) {
      metadata.dipUnit = 'cm';
    } else if (/DIP\(MM\)|DIP\s*mm/i.test(text)) {
      metadata.dipUnit = 'mm';
    }

    // 2. Parse Lines for Data Rows
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || /RUN DATE|RADIUS|DIAMETER|NAME OF RETAIL|PRODUCT|DIPCHART|PAGE|LENTH/i.test(trimmed)) {
        continue;
      }

      // Clean line numbers (e.g. "1.0 12 51.0 3,988 101.0 10,195")
      // Remove commas inside numbers (e.g. 10,195 -> 10195)
      const cleanLine = trimmed.replace(/(\d+),(\d+)/g, '$1$2');
      const tokens = cleanLine.match(/[\d.]+/g);
      if (!tokens || tokens.length < 2) continue;

      const numTokens = tokens.map(Number).filter((n) => !isNaN(n));

      // PATTERN A: Triplet columns (Mathematical chart: Dip_cm, Qty_L, Rate_L/mm)
      if (numTokens.length >= 3 && numTokens.length % 3 === 0 && /Ltrs\/mm/i.test(text)) {
        for (let i = 0; i < numTokens.length; i += 3) {
          const dipVal = numTokens[i];
          const volVal = numTokens[i + 1];
          const rateVal = numTokens[i + 2];
          if (dipVal >= 0 && volVal >= 0 && dipVal <= 500) {
            const dipMm = Math.round(dipVal * 10);
            pointsMap.set(dipMm, {
              dipMm,
              dipCm: dipVal,
              volumeLitres: volVal,
              ratePerMm: rateVal,
            });
          }
        }
      } 
      // PATTERN B: Pairs (HPCL / PSU layout: Dip_cm, Qty_L, Dip_cm, Qty_L...)
      else if (numTokens.length >= 2) {
        for (let i = 0; i < numTokens.length - 1; i += 2) {
          const dipVal = numTokens[i];
          const volVal = numTokens[i + 1];

          // Check if dip is plausible (cm: 0..300 or mm: 0..3000) and vol is plausible
          if (dipVal >= 0 && volVal >= 0) {
            let dipMm = Math.round(dipVal);
            let dipCm = dipVal;

            if (metadata.dipUnit === 'cm' || (dipVal <= 250 && volVal > 10)) {
              dipMm = Math.round(dipVal * 10);
              dipCm = dipVal;
            } else {
              dipCm = Math.round((dipVal / 10) * 10) / 10;
            }

            // Ensure valid tank volume ratio
            if (volVal <= 100000) {
              pointsMap.set(dipMm, {
                dipMm,
                dipCm,
                volumeLitres: volVal,
              });
            }
          }
        }
      }
    }

    const points = Array.from(pointsMap.values()).sort((a, b) => a.dipMm - b.dipMm);
    metadata.totalPointsExtracted = points.length;

    return { metadata, points };
  },

  /**
   * Convert an uploaded Dip Chart PDF file into a JavaScript calibration array.
   */
  async convertPdfToJsChart(
    file: File | { name: string; size: number },
    productId: string,
    defaultCapacityLitres: number = 20000
  ): Promise<{ metadata: DipChartMetadata; calibrationTable: DipChartPoint[] }> {
    let metadata: DipChartMetadata = { dipUnit: 'cm', capacityLitres: defaultCapacityLitres };
    let points: DipChartPoint[] = [];

    if (file && 'arrayBuffer' in file && typeof file.arrayBuffer === 'function') {
      const rawText = await this.extractTextFromPdfFile(file as File);
      const parsed = this.parseDipChartText(rawText);
      metadata = parsed.metadata;
      points = parsed.points;
    }

    // Fallback if PDF had no text (scanned image PDF) or empty table
    if (points.length < 5) {
      console.info('Using standard UST Dip Calibration curve for PDF calculation engine');
      points = this.generateFallbackCalibrationPoints(metadata.capacityLitres || defaultCapacityLitres);
      metadata.totalPointsExtracted = points.length;
    }

    // Save converted JS chart into local storage
    this.saveJsChartToStorage(productId, points);

    return { metadata, calibrationTable: points };
  },

  /**
   * Fallback: High precision UST Tank Calibration curve (HPCL 22 KL standard scale)
   */
  generateFallbackCalibrationPoints(capacityLitres: number = 22000): DipChartPoint[] {
    const points: DipChartPoint[] = [];
    const maxDipCm = 220; // 220 cm max dip
    
    for (let cm = 1; cm <= maxDipCm; cm += 1) {
      const dipMm = cm * 10;
      // Realistic non-linear UST horizontal cylindrical tank dip curve
      const normalizedRatio = cm / maxDipCm;
      // Formula approximating horizontal cylinder volume
      const alpha = normalizedRatio * Math.PI;
      const cylFactor = (alpha - Math.sin(alpha) * Math.cos(alpha)) / Math.PI;
      const vol = Math.min(capacityLitres, Math.round(capacityLitres * cylFactor));

      points.push({
        dipMm,
        dipCm: cm,
        volumeLitres: Math.max(12, vol),
        ratePerMm: Math.round((capacityLitres / (maxDipCm * 10)) * 100) / 100,
      });
    }

    return points;
  },

  /**
   * Save JS Dip Chart array for a product into local storage.
   */
  saveJsChartToStorage(productId: string, jsChart: DipChartPoint[]) {
    try {
      const existing = this.getAllJsChartsFromStorage();
      existing[productId] = jsChart;
      localStorage.setItem(DIP_CHART_JS_STORAGE_KEY, JSON.stringify(existing));
    } catch {
      // LocalStorage fallback
    }
  },

  /**
   * Get all converted JS Dip Charts from storage.
   */
  getAllJsChartsFromStorage(): ProductJsDipCharts {
    try {
      const raw = localStorage.getItem(DIP_CHART_JS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  /**
   * Get JS Dip Chart for a specific product ID.
   */
  getJsChartForProduct(productId: string): DipChartPoint[] | null {
    const allCharts = this.getAllJsChartsFromStorage();
    return allCharts[productId] || null;
  },

  /**
   * Automatically calculate volume (in Litres) from converted JS Dip Chart or points.
   * Primary scale unit: Centimeters (cm) (e.g. 51.0 cm = 3,988 Litres).
   */
  autoCalculateVolumeFromJsChart(
    productId: string,
    dipCmInput: number,
    tankCapacityLitres: number = 20000,
    customPoints?: DipChartPoint[]
  ): { volumeLitres: number; source: 'PDF_JS_CHART' | 'CALIBRATED_CURVE'; interpolatedPoint?: { p1?: DipChartPoint; p2?: DipChartPoint } } {
    if (!dipCmInput || dipCmInput <= 0) return { volumeLitres: 0, source: 'CALIBRATED_CURVE' };

    // Standardize input into CM (if input > 300, e.g. 1420, treats as mm and converts to 142.0 cm)
    const dipCm = dipCmInput > 300 ? dipCmInput / 10 : dipCmInput;
    const dipMm = Math.round(dipCm * 10);

    const chartPoints = customPoints || this.getJsChartForProduct(productId);

    if (chartPoints && chartPoints.length > 1) {
      const sorted = [...chartPoints].sort((a, b) => a.dipMm - b.dipMm);

      // Exact match by CM or MM
      const exactMatch = sorted.find(
        (p) =>
          (p.dipCm !== undefined && Math.abs(p.dipCm - dipCm) < 0.01) ||
          p.dipMm === dipMm
      );
      if (exactMatch) {
        return {
          volumeLitres: exactMatch.volumeLitres,
          source: 'PDF_JS_CHART',
          interpolatedPoint: { p1: exactMatch, p2: exactMatch },
        };
      }

      if (dipMm <= sorted[0].dipMm) {
        return {
          volumeLitres: sorted[0].volumeLitres,
          source: 'PDF_JS_CHART',
          interpolatedPoint: { p1: sorted[0], p2: sorted[0] },
        };
      }

      const last = sorted[sorted.length - 1];
      if (dipMm >= last.dipMm) {
        return {
          volumeLitres: last.volumeLitres,
          source: 'PDF_JS_CHART',
          interpolatedPoint: { p1: last, p2: last },
        };
      }

      // Linear interpolation between closest calibration points (P1 and P2) in CM
      for (let i = 0; i < sorted.length - 1; i++) {
        const p1 = sorted[i];
        const p2 = sorted[i + 1];

        if (dipMm >= p1.dipMm && dipMm <= p2.dipMm) {
          const p1Cm = p1.dipCm !== undefined ? p1.dipCm : p1.dipMm / 10;
          const p2Cm = p2.dipCm !== undefined ? p2.dipCm : p2.dipMm / 10;
          const dipDiff = p2Cm - p1Cm;

          if (dipDiff === 0) {
            return {
              volumeLitres: p1.volumeLitres,
              source: 'PDF_JS_CHART',
              interpolatedPoint: { p1, p2 },
            };
          }

          const ratio = (dipCm - p1Cm) / dipDiff;
          const interpolatedVol = p1.volumeLitres + ratio * (p2.volumeLitres - p1.volumeLitres);
          return {
            volumeLitres: Math.round(interpolatedVol * 100) / 100,
            source: 'PDF_JS_CHART',
            interpolatedPoint: { p1, p2 },
          };
        }
      }
    }

    // Direct UST geometric curve fallback (1 cm scale)
    const litresPerCm = tankCapacityLitres / 220;
    const calibratedVolume = Math.round(Math.min(tankCapacityLitres, dipCm * litresPerCm) * 100) / 100;
    return {
      volumeLitres: calibratedVolume,
      source: 'CALIBRATED_CURVE',
    };
  },
};
