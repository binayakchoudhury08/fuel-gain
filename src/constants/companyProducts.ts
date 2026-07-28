import type { PetrolCompany, FuelProduct, PetrolCompanyCode } from '../types';

export const PETROL_COMPANIES: PetrolCompany[] = [
  { id: 'hpcl-1', name: 'Hindustan Petroleum (HPCL)', code: 'HPCL' },
  { id: 'iocl-2', name: 'Indian Oil (IOCL)', code: 'IOCL' },
  { id: 'bpcl-3', name: 'Bharat Petroleum (BPCL)', code: 'BPCL' },
  { id: 'shell-4', name: 'Shell', code: 'Shell' },
  { id: 'jio-bp-5', name: 'Jio-bp', code: 'Jio-bp' },
  { id: 'nayara-6', name: 'Nayara Energy', code: 'Nayara' },
  { id: 'others-7', name: 'Others / Independent', code: 'Others' }
];

export const COMPANY_PRODUCTS_MAP: Record<PetrolCompanyCode, FuelProduct[]> = {
  HPCL: [
    { id: 'hp-ms', name: 'MS (Motor Spirit / Petrol)', code: 'MS', description: 'Standard Petrol 91 Octane' },
    { id: 'hp-hsd', name: 'HSD (High Speed Diesel)', code: 'HSD', description: 'Standard Diesel' },
    { id: 'hp-p95', name: 'Power95', code: 'Power95', description: 'HPCL Premium 95 Octane' },
    { id: 'hp-p100', name: 'Power100', code: 'Power100', description: 'HPCL High Performance 100 Octane' }
  ],
  IOCL: [
    { id: 'ioc-ms', name: 'MS (Motor Spirit / Petrol)', code: 'MS', description: 'Standard Petrol' },
    { id: 'ioc-hsd', name: 'HSD (High Speed Diesel)', code: 'HSD', description: 'Standard Diesel' },
    { id: 'ioc-xp95', name: 'XP95', code: 'XP95', description: 'IOCL Premium 95 Octane' },
    { id: 'ioc-xp100', name: 'XP100', code: 'XP100', description: 'IOCL Ultra Premium 100 Octane' }
  ],
  BPCL: [
    { id: 'bpc-ms', name: 'MS (Motor Spirit / Petrol)', code: 'MS', description: 'Standard Petrol' },
    { id: 'bpc-hsd', name: 'HSD (High Speed Diesel)', code: 'HSD', description: 'Standard Diesel' },
    { id: 'bpc-speed', name: 'Speed', code: 'Speed', description: 'BPCL Premium Multi-Benefit Petrol' },
    { id: 'bpc-speed97', name: 'Speed97', code: 'Speed97', description: 'BPCL Premium 97 Octane' },
    { id: 'bpc-speed100', name: 'Speed100', code: 'Speed100', description: 'BPCL Ultra 100 Octane' }
  ],
  Shell: [
    { id: 'sh-u95', name: 'Shell Unleaded 95', code: 'Shell Unleaded 95', description: 'Shell Standard 95 Octane' },
    { id: 'sh-vp97', name: 'Shell V-Power 97', code: 'Shell V-Power 97', description: 'Shell Performance Petrol' },
    { id: 'sh-diesel', name: 'Shell Diesel', code: 'Shell Diesel', description: 'Shell Formula Clean Diesel' }
  ],
  'Jio-bp': [
    { id: 'jio-petrol', name: 'Petrol', code: 'Petrol', description: 'Jio-bp Standard Petrol' },
    { id: 'jio-diesel', name: 'Diesel', code: 'Diesel', description: 'Jio-bp High Performance Diesel' },
    { id: 'jio-active', name: 'ACTIVE Premium Petrol', code: 'ACTIVE Premium Petrol', description: 'With Active Technology' }
  ],
  Nayara: [
    { id: 'nay-ms', name: 'MS (Motor Spirit / Petrol)', code: 'MS', description: 'Nayara Standard Petrol' },
    { id: 'nay-hsd', name: 'HSD (High Speed Diesel)', code: 'HSD', description: 'Nayara High Speed Diesel' }
  ],
  Others: [
    { id: 'oth-ms', name: 'MS (Motor Spirit / Petrol)', code: 'MS', description: 'Generic Petrol' },
    { id: 'oth-hsd', name: 'HSD (High Speed Diesel)', code: 'HSD', description: 'Generic Diesel' }
  ]
};
