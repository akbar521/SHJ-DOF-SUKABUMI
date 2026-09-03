import { Product, SubdistKey, Wilayah, ProductSubdistPrice } from '../types';

export interface SubdistInfo {
  key: SubdistKey;
  label: string;
  shortLabel: string;
  wilayah: Wilayah;
  dmsUser: string;
  defaultSalesman: string;
  description: string;
  badgeColor: string;
}

export interface MotorisSalesman {
  name: string;
  label: string;
  wilayah: Wilayah;
  dmsCode?: string;
  areaHint?: string;
}

export const CIANJUR_MOTORIS: MotorisSalesman[] = [
  { name: 'HERU', label: 'HERU (Cikalong)', wilayah: 'Cianjur', dmsCode: 'MMTW-SKI-CIKALONG', areaHint: 'Cikalong' },
  { name: 'HERPIN', label: 'HERPIN (Cipanas)', wilayah: 'Cianjur', dmsCode: 'MMTW-SKI-CIAPANAS', areaHint: 'Cipanas' },
  { name: 'RIBCA', label: 'RIBCA (Cibeber)', wilayah: 'Cianjur', dmsCode: 'MMTW-SKI-CIBEBER', areaHint: 'Cibeber' },
  { name: 'AHYAR', label: 'AHYAR (Ciranjang)', wilayah: 'Cianjur', dmsCode: 'MMTW-SKI-CIRANJANG', areaHint: 'Ciranjang' },
];

export const SUKABUMI_MOTORIS: MotorisSalesman[] = [
  { name: 'RUSDIANA', label: 'Sukabumi (Panjunan)', wilayah: 'Sukabumi', dmsCode: 'MMTW-SKI-PANJUNAN', areaHint: 'Panjunan' },
  { name: 'RUSDIANA', label: 'Cibadak', wilayah: 'Sukabumi', dmsCode: 'MMTW-SKI-CIBADAK', areaHint: 'Cibadak' },
  { name: 'AJENG RIVALDI', label: 'Nyalindung', wilayah: 'Sukabumi', dmsCode: 'MMTW-SKI-NYALINDUNG', areaHint: 'Nyalindung' },
  { name: 'EGA', label: 'Cikole', wilayah: 'Sukabumi', dmsCode: 'MMTW-SKI-CIKOLE', areaHint: 'Cikole' },
  { name: 'FACHRI', label: 'Sukaraja', wilayah: 'Sukabumi', dmsCode: 'MMTW-SKI-SUKARAJA', areaHint: 'Sukaraja' },
];

export const SUBDIST_LIST: SubdistInfo[] = [
  // CIANJUR (2 Subdist)
  {
    key: 'PANJUNAN_CIANJUR',
    label: 'PANJUNAN CIANJUR',
    shortLabel: 'Panjunan Cianjur',
    wilayah: 'Cianjur',
    dmsUser: 'MMTW-CJR-PANJUNAN',
    defaultSalesman: 'HERU',
    description: 'Subdist Panjunan area Cianjur',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    key: 'SIRAWING',
    label: 'SIRAWING',
    shortLabel: 'Sirawing',
    wilayah: 'Cianjur',
    dmsUser: 'MMTW-CJR-SIRAWING',
    defaultSalesman: 'HERU',
    description: 'Subdist Sirawing area Cianjur',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  // SUKABUMI (Pangkalan & Subdist)
  {
    key: 'PANJUNAN_SUKABUMI',
    label: 'PANJUNAN SUKABUMI',
    shortLabel: 'Panjunan Sukabumi',
    wilayah: 'Sukabumi',
    dmsUser: 'MMTW-SKI-PANJUNAN',
    defaultSalesman: 'RUSDIANA',
    description: 'Subdist Panjunan area Sukabumi',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    key: 'CIBADAK',
    label: 'CIBADAK',
    shortLabel: 'Cibadak',
    wilayah: 'Sukabumi',
    dmsUser: 'MMTW-SKI-CIBADAK',
    defaultSalesman: 'RUSDIANA',
    description: 'Pangkalan Cibadak Sukabumi',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  {
    key: 'NYALINDUNG',
    label: 'NYALINDUNG',
    shortLabel: 'Nyalindung',
    wilayah: 'Sukabumi',
    dmsUser: 'MMTW-SKI-NYALINDUNG',
    defaultSalesman: 'AJENG RIVALDI',
    description: 'Pangkalan Nyalindung Sukabumi',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  {
    key: 'CIKOLE',
    label: 'CIKOLE',
    shortLabel: 'Cikole',
    wilayah: 'Sukabumi',
    dmsUser: 'MMTW-SKI-CIKOLE',
    defaultSalesman: 'EGA',
    description: 'Pangkalan Cikole Sukabumi',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    key: 'SUKARAJA',
    label: 'SUKARAJA',
    shortLabel: 'Sukaraja',
    wilayah: 'Sukabumi',
    dmsUser: 'MMTW-SKI-SUKARAJA',
    defaultSalesman: 'FACHRI',
    description: 'Pangkalan Sukaraja Sukabumi',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300'
  }
];

// Baseline prices for Subdist Cianjur (Panjunan vs Sirawing) and Sukabumi
export const DEFAULT_SUBDIST_PRICES: Record<SubdistKey, Record<string, ProductSubdistPrice>> = {
  PANJUNAN_CIANJUR: {
    'PEGAB': { harga_grosir: 5141.52, harga_retail: 6559.00, persentase_dof: 0.20 },
    'PEMAB': { harga_grosir: 5141.52, harga_retail: 6559.00, persentase_dof: 0.20 },
    'PEBJE': { harga_grosir: 12500.00, harga_retail: 15000.00, persentase_dof: 0.20 },
    'LEXUA': { harga_grosir: 5700.00, harga_retail: 6500.00, persentase_dof: 0.20 },
    'LKXKD': { harga_grosir: 9311.80, harga_retail: 12000.00, persentase_dof: 0.20 },
    'LKXOB': { harga_grosir: 9311.80, harga_retail: 12100.00, persentase_dof: 0.20 },
    'LKXLA': { harga_grosir: 9311.80, harga_retail: 12100.00, persentase_dof: 0.20 },
    'LKXOD': { harga_grosir: 9700.30, harga_retail: 13000.00, persentase_dof: 0.20 },
    'LKXJA-LKXNA-LKXPA': { harga_grosir: 9700.30, harga_retail: 13000.00, persentase_dof: 0.20 },
    'KMXAD': { harga_grosir: 42000.00, harga_retail: 48000.00, persentase_dof: 0.20 },
    'KMXKD': { harga_grosir: 18500.00, harga_retail: 22000.00, persentase_dof: 0.20 },
    'LBJAB': { harga_grosir: 24500.00, harga_retail: 27000.00, persentase_dof: 0.20 },
    'FTGKAP': { harga_grosir: 18000.00, harga_retail: 21000.00, persentase_dof: 0.20 },
    'LBMAV': { harga_grosir: 31084.00, harga_retail: 33000.00, persentase_dof: 0.20 },
    'ENTROT': { harga_grosir: 15000.00, harga_retail: 17500.00, persentase_dof: 0.20 },
    'PBSJC': { harga_grosir: 17460.30, harga_retail: 19000.00, persentase_dof: 0.20 },
    'FTGSPR': { harga_grosir: 22000.00, harga_retail: 25000.00, persentase_dof: 0.20 },
    'ENTROH': { harga_grosir: 16500.00, harga_retail: 19000.00, persentase_dof: 0.20 },
    'LPRGR': { harga_grosir: 15810.00, harga_retail: 16800.00, persentase_dof: 0.00 },
    'LMHGA': { harga_grosir: 16188.00, harga_retail: 16700.00, persentase_dof: 0.00 }
  },
  SIRAWING: {
    'PEGAB': { harga_grosir: 5180.00, harga_retail: 6559.00, persentase_dof: 0.20 },
    'PEMAB': { harga_grosir: 5180.00, harga_retail: 6559.00, persentase_dof: 0.20 },
    'PEBJE': { harga_grosir: 12600.00, harga_retail: 15000.00, persentase_dof: 0.20 },
    'LEXUA': { harga_grosir: 5750.00, harga_retail: 6500.00, persentase_dof: 0.20 },
    'LKXKD': { harga_grosir: 9350.00, harga_retail: 12000.00, persentase_dof: 0.20 },
    'LKXOB': { harga_grosir: 9350.00, harga_retail: 12100.00, persentase_dof: 0.20 },
    'LKXLA': { harga_grosir: 9350.00, harga_retail: 12100.00, persentase_dof: 0.20 },
    'LKXOD': { harga_grosir: 9750.00, harga_retail: 13000.00, persentase_dof: 0.20 },
    'LKXJA-LKXNA-LKXPA': { harga_grosir: 9750.00, harga_retail: 13000.00, persentase_dof: 0.20 },
    'KMXAD': { harga_grosir: 42250.00, harga_retail: 48000.00, persentase_dof: 0.20 },
    'KMXKD': { harga_grosir: 18700.00, harga_retail: 22000.00, persentase_dof: 0.20 },
    'LBJAB': { harga_grosir: 24750.00, harga_retail: 27000.00, persentase_dof: 0.20 },
    'FTGKAP': { harga_grosir: 18200.00, harga_retail: 21000.00, persentase_dof: 0.20 },
    'LBMAV': { harga_grosir: 31200.00, harga_retail: 33000.00, persentase_dof: 0.20 },
    'ENTROT': { harga_grosir: 15150.00, harga_retail: 17500.00, persentase_dof: 0.20 },
    'PBSJC': { harga_grosir: 17500.00, harga_retail: 19000.00, persentase_dof: 0.20 },
    'FTGSPR': { harga_grosir: 22200.00, harga_retail: 25000.00, persentase_dof: 0.20 },
    'ENTROH': { harga_grosir: 16700.00, harga_retail: 19000.00, persentase_dof: 0.20 },
    'LPRGR': { harga_grosir: 15900.00, harga_retail: 16800.00, persentase_dof: 0.00 },
    'LMHGA': { harga_grosir: 16250.00, harga_retail: 16700.00, persentase_dof: 0.00 }
  },
  PANJUNAN_SUKABUMI: {
    'PEGAB': { harga_grosir: 5141.52, harga_retail: 6559.00, persentase_dof: 0.20 },
    'LEXUA': { harga_grosir: 5700.00, harga_retail: 6500.00, persentase_dof: 0.20 },
    'LKXOB': { harga_grosir: 9311.80, harga_retail: 12100.00, persentase_dof: 0.20 },
    'LKXOD': { harga_grosir: 9700.30, harga_retail: 13000.00, persentase_dof: 0.20 },
    'LKXJA-LKXNA-LKXPA': { harga_grosir: 9700.30, harga_retail: 13000.00, persentase_dof: 0.20 },
    'LBMAV': { harga_grosir: 31084.00, harga_retail: 33000.00, persentase_dof: 0.20 },
    'PBSJC': { harga_grosir: 17460.30, harga_retail: 19000.00, persentase_dof: 0.20 },
    'LPRGR': { harga_grosir: 15810.00, harga_retail: 16800.00, persentase_dof: 0.00 },
    'LMHGA': { harga_grosir: 16188.00, harga_retail: 16700.00, persentase_dof: 0.00 }
  },
  CIBADAK: {},
  NYALINDUNG: {},
  CIKOLE: {},
  SUKARAJA: {}
};

/**
 * Resolves effective price for a product under specific subdist.
 * Priority:
 * 1. User custom override from localStorage
 * 2. product.subdist_prices[subdistKey]
 * 3. DEFAULT_SUBDIST_PRICES[subdistKey]
 * 4. Fallback to product.harga_grosir, product.harga_retail, product.persentase_dof
 */
export function resolveSubdistPrice(
  product: Product,
  subdistKey: SubdistKey,
  customOverrides?: Record<string, Record<string, ProductSubdistPrice>>
): { harga_grosir: number; harga_retail: number; persentase_dof: number } {
  // 1. Custom user override
  if (customOverrides?.[subdistKey]?.[product.kode_produk]) {
    const override = customOverrides[subdistKey][product.kode_produk];
    return {
      harga_grosir: override.harga_grosir,
      harga_retail: override.harga_retail,
      persentase_dof: override.persentase_dof !== undefined ? override.persentase_dof : product.persentase_dof
    };
  }

  // 2. Product's own subdist_prices
  if (product.subdist_prices?.[subdistKey]) {
    const sp = product.subdist_prices[subdistKey]!;
    return {
      harga_grosir: sp.harga_grosir,
      harga_retail: sp.harga_retail,
      persentase_dof: sp.persentase_dof !== undefined ? sp.persentase_dof : product.persentase_dof
    };
  }

  // 3. System defaults
  if (DEFAULT_SUBDIST_PRICES[subdistKey]?.[product.kode_produk]) {
    const def = DEFAULT_SUBDIST_PRICES[subdistKey][product.kode_produk];
    return {
      harga_grosir: def.harga_grosir,
      harga_retail: def.harga_retail,
      persentase_dof: def.persentase_dof !== undefined ? def.persentase_dof : product.persentase_dof
    };
  }

  // 4. Default product fields
  return {
    harga_grosir: product.harga_grosir,
    harga_retail: product.harga_retail,
    persentase_dof: product.persentase_dof
  };
}
