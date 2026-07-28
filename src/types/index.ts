export type PetrolCompanyCode = 'HPCL' | 'IOCL' | 'BPCL' | 'Shell' | 'Jio-bp' | 'Nayara' | 'Others';

export interface PetrolCompany {
  id: string;
  name: string;
  code: PetrolCompanyCode;
  logoUrl?: string;
}

export interface FuelProduct {
  id: string;
  name: string;
  code: string;
  description?: string;
  companyCode?: PetrolCompanyCode;
}

export interface TankConfig {
  tankId: string;
  productId: string;
  productName: string;
  tankNumber: number;
  tankName: string;
  capacityKl: number; // Capacity in Kilolitres (KL)
  capacityLitres: number; // Capacity in Litres
  dipChart?: DipChartFile;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  isOnboarded: boolean;
  pumpName?: string;
  pumpCompany?: PetrolCompanyCode;
  pumpAddress?: string;
  selectedProductIds?: string[];
  tankConfigs?: TankConfig[];
  tanksPerProduct?: Record<string, { tankCount: number; capacityKl: number }>;
  nozzleCounts?: Record<string, number>;
  dipChartsUploaded?: Record<string, DipChartFile>;
  createdAt?: string;
}

export interface DipChartPoint {
  dipMm: number;
  dipCm?: number;
  volumeLitres: number;
  ratePerMm?: number;
}

export interface DipChartMetadata {
  diameterCm?: number;
  lengthCm?: number;
  radiusCm?: number;
  capacityLitres?: number;
  capacityKl?: number;
  companyName?: string;
  regionalOffice?: string;
  outletName?: string;
  dipUnit?: 'cm' | 'mm';
  totalPointsExtracted?: number;
}

export interface DipChartFile {
  productId: string;
  productName: string;
  tankId?: string;
  tankName?: string;
  capacityKl?: number;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  fileUrl?: string;
  metadata?: DipChartMetadata;
  calibrationTable?: DipChartPoint[];
}

export interface AppSettings {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  language: string;
  autoSync: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface KpiCardData {
  totalEntries: number;
  todayGain: string;
  todayShortage: string;
  reportsGenerated: number;
  pdfDownloads: number;
}

export interface NozzleReading {
  nozzleIndex: number;
  nozzleName: string;
  openingReading: number;
  closingReading: number;
  sale: number;
}

export interface ProductDailyEntry {
  id: string; // e.g. entry-2026-07-27-hp-ms
  date: string; // YYYY-MM-DD
  productId: string;
  productName: string;
  userEmail?: string;
  
  // Step 1: Stock Receipt
  wasReceiptReceived: boolean;
  receiptQuantity: number;
  
  // Step 2: Nozzle Readings
  nozzleReadings: NozzleReading[];
  totalMeterSale: number;
  
  // Step 3: Dip Reading
  openingDip: number; // cm
  closingDip: number; // cm
  openingStock: number; // Litres
  closingStock: number; // Litres
  
  // Step 4: Calculations
  dipSale: number; // openingStock - closingStock + receiptQuantity
  meterSale: number; // totalMeterSale
  difference: number; // meterSale - dipSale
  status: 'Gain' | 'Shortage' | 'Balanced';
  
  updatedAt: string;
}
