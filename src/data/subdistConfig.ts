import { Product, SubdistKey, Wilayah, ProductSubdistPrice } from '../types';

export interface SubdistInfo {
  key: SubdistKey;
  label: string;
  shortLabel: string;
  wilayah: Wilayah;
  system: 'Blesscom' | 'DMS';
  dmsUser: string;
  defaultSalesman: string;
  description: string;
  badgeColor: string;
}

export interface MotorisSalesman {
  name: string;
  label: string;
  wilayah: Wilayah;
  system: 'Blesscom' | 'DMS';
  dmsCode?: string;
  areaHint?: string;
}

export const CIANJUR_MOTORIS: MotorisSalesman[] = [
  { name: 'HERU', label: 'HERU (Cikalong)', wilayah: 'Cianjur', system: 'Blesscom', dmsCode: 'MMTW-SKI-CIKALONG', areaHint: 'Cikalong' },
  { name: 'HERPIN', label: 'HERPIN (Cipanas)', wilayah: 'Cianjur', system: 'Blesscom', dmsCode: 'MMTW-SKI-CIAPANAS', areaHint: 'Cipanas' },
  { name: 'RIBCA', label: 'RIBCA (Cibeber)', wilayah: 'Cianjur', system: 'DMS', dmsCode: 'MMTW-SKI-CIBEBER', areaHint: 'Cibeber' },
  { name: 'AHYAR', label: 'AHYAR (Ciranjang)', wilayah: 'Cianjur', system: 'DMS', dmsCode: 'MMTW-SKI-CIRANJANG', areaHint: 'Ciranjang' },
];

export const SUKABUMI_MOTORIS: MotorisSalesman[] = [
  { name: 'RUSDIANA', label: 'Cibadak', wilayah: 'Sukabumi', system: 'DMS', dmsCode: 'MMTW-SKI-CIBADAK', areaHint: 'Cibadak' },
  { name: 'HIKMATIAR', label: 'Nyalindung', wilayah: 'Sukabumi', system: 'Blesscom', dmsCode: 'MMTW-SKI-NYALINDUNG', areaHint: 'Nyalindung' },
  { name: 'EGA', label: 'Cikole', wilayah: 'Sukabumi', system: 'DMS', dmsCode: 'MMTW-SKI-CIKOLE', areaHint: 'Cikole' },
  { name: 'DIAN', label: 'Sukaraja', wilayah: 'Sukabumi', system: 'Blesscom', dmsCode: 'MMTW-SKI-SUKARAJA', areaHint: 'Sukaraja' },
];

export const SUBDIST_LIST: SubdistInfo[] = [
  // CIANJUR (4 Pangkalan)
  {
    key: 'CIKALONG',
    label: 'CIKALONG',
    shortLabel: 'Cikalong',
    wilayah: 'Cianjur',
    system: 'Blesscom',
    dmsUser: 'MMTW-SKI-CIKALONG',
    defaultSalesman: 'HERU',
    description: 'Pangkalan Cikalong Cianjur (Blesscom)',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    key: 'CIPANAS',
    label: 'CIPANAS',
    shortLabel: 'Cipanas',
    wilayah: 'Cianjur',
    system: 'Blesscom',
    dmsUser: 'MMTW-SKI-CIAPANAS',
    defaultSalesman: 'HERPIN',
    description: 'Pangkalan Cipanas Cianjur (Blesscom)',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300'
  },
  {
    key: 'CIBEBER',
    label: 'CIBEBER',
    shortLabel: 'Cibeber',
    wilayah: 'Cianjur',
    system: 'DMS',
    dmsUser: 'MMTW-SKI-CIBEBER',
    defaultSalesman: 'RIBCA',
    description: 'Pangkalan Cibeber Cianjur (DMS)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    key: 'CIRANJANG',
    label: 'CIRANJANG',
    shortLabel: 'Ciranjang',
    wilayah: 'Cianjur',
    system: 'DMS',
    dmsUser: 'MMTW-SKI-CIRANJANG',
    defaultSalesman: 'AHYAR',
    description: 'Pangkalan Ciranjang Cianjur (DMS)',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  // SUKABUMI (4 Pangkalan)
  {
    key: 'CIBADAK',
    label: 'CIBADAK',
    shortLabel: 'Cibadak',
    wilayah: 'Sukabumi',
    system: 'DMS',
    dmsUser: 'MMTW-SKI-CIBADAK',
    defaultSalesman: 'RUSDIANA',
    description: 'Pangkalan Cibadak Sukabumi (DMS - Rusdi)',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300'
  },
  {
    key: 'NYALINDUNG',
    label: 'NYALINDUNG',
    shortLabel: 'Nyalindung',
    wilayah: 'Sukabumi',
    system: 'Blesscom',
    dmsUser: 'MMTW-SKI-NYALINDUNG',
    defaultSalesman: 'HIKMATIAR',
    description: 'Pangkalan Nyalindung Sukabumi (Blesscom - Hikmat)',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  {
    key: 'CIKOLE',
    label: 'CIKOLE',
    shortLabel: 'CIKOLE',
    wilayah: 'Sukabumi',
    system: 'DMS',
    dmsUser: 'MMTW-SKI-CIKOLE',
    defaultSalesman: 'EGA',
    description: 'Pangkalan Cikole Sukabumi (DMS - Ega)',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    key: 'SUKARAJA',
    label: 'SUKARAJA',
    shortLabel: 'Sukaraja',
    wilayah: 'Sukabumi',
    system: 'Blesscom',
    dmsUser: 'MMTW-SKI-SUKARAJA',
    defaultSalesman: 'DIAN',
    description: 'Pangkalan Sukaraja Sukabumi (Blesscom - Dian)',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300'
  }
];

// Baseline prices for Subdist
export const DEFAULT_SUBDIST_PRICES: Record<SubdistKey, Record<string, ProductSubdistPrice>> = {
  // CIANJUR - BLESSCOM (Heru - Cikalong, Herpin - Cipanas)
  CIKALONG: {
    ENTROT: { harga_grosir: 15000, harga_retail: 8800 },
    PEMAB: { harga_grosir: 5141.52, harga_retail: 6559 },
    LETSB: { harga_grosir: 16500, harga_retail: 16700 },
    ENTROH: { harga_grosir: 16500, harga_retail: 16700 },
    CKPXE: { harga_grosir: 9000, harga_retail: 10800 },
    KLPSL: { harga_grosir: 9000, harga_retail: 10800 },
    TFTSG: { harga_grosir: 22000, harga_retail: 10950 },
    FTGSPR: { harga_grosir: 22000, harga_retail: 10950 },
    TFTGF: { harga_grosir: 18000, harga_retail: 7820 },
    FTGKAP: { harga_grosir: 18000, harga_retail: 7820 },
  },
  CIPANAS: {
    ENTROT: { harga_grosir: 15000, harga_retail: 8800 },
    PEMAB: { harga_grosir: 5141.52, harga_retail: 6559 },
    LETSB: { harga_grosir: 16500, harga_retail: 16700 },
    ENTROH: { harga_grosir: 16500, harga_retail: 16700 },
    CKPXE: { harga_grosir: 9000, harga_retail: 10800 },
    KLPSL: { harga_grosir: 9000, harga_retail: 10800 },
    TFTSG: { harga_grosir: 22000, harga_retail: 10950 },
    FTGSPR: { harga_grosir: 22000, harga_retail: 10950 },
    TFTGF: { harga_grosir: 18000, harga_retail: 7820 },
    FTGKAP: { harga_grosir: 18000, harga_retail: 7820 },
  },

  // CIANJUR - DMS (Ribca - Cibeber, Ahyar - Ciranjang)
  // Revisi ENTROT menjadi 17.600
  CIBEBER: {
    ENTROT: { harga_grosir: 15000, harga_retail: 17600 },
    PEMAB: { harga_grosir: 5141.52, harga_retail: 6559 },
    LETSB: { harga_grosir: 16500, harga_retail: 16600 },
    ENTROH: { harga_grosir: 16500, harga_retail: 16600 },
    CKPXE: { harga_grosir: 9000, harga_retail: 10800 },
    KLPSL: { harga_grosir: 9000, harga_retail: 10800 },
    TFTSG: { harga_grosir: 22000, harga_retail: 109500 },
    FTGSPR: { harga_grosir: 22000, harga_retail: 109500 },
    TFTGF: { harga_grosir: 18000, harga_retail: 7820 },
    FTGKAP: { harga_grosir: 18000, harga_retail: 7820 },
  },
  CIRANJANG: {
    ENTROT: { harga_grosir: 15000, harga_retail: 17600 },
    PEMAB: { harga_grosir: 5141.52, harga_retail: 6559 },
    LETSB: { harga_grosir: 16500, harga_retail: 16600 },
    ENTROH: { harga_grosir: 16500, harga_retail: 16600 },
    CKPXE: { harga_grosir: 9000, harga_retail: 10800 },
    KLPSL: { harga_grosir: 9000, harga_retail: 10800 },
    TFTSG: { harga_grosir: 22000, harga_retail: 109500 },
    FTGSPR: { harga_grosir: 22000, harga_retail: 109500 },
    TFTGF: { harga_grosir: 18000, harga_retail: 7820 },
    FTGKAP: { harga_grosir: 18000, harga_retail: 7820 },
  },

  // SUKABUMI - DMS (Rusdi / Rusdiana - Cibadak, Ega - Cikole)
  CIBADAK: {
    ENTROT: { harga_grosir: 15000, harga_retail: 17600 },
    PEMAB: { harga_grosir: 5141.52, harga_retail: 6559 },
    LETSB: { harga_grosir: 16500, harga_retail: 16600 },
    ENTROH: { harga_grosir: 16500, harga_retail: 16600 },
    CKPXE: { harga_grosir: 9000, harga_retail: 10800 },
    KLPSL: { harga_grosir: 9000, harga_retail: 10800 },
    TFTSG: { harga_grosir: 22000, harga_retail: 109500 },
    FTGSPR: { harga_grosir: 22000, harga_retail: 109500 },
    TFTGF: { harga_grosir: 18000, harga_retail: 7820 },
    FTGKAP: { harga_grosir: 18000, harga_retail: 7820 },
  },
  CIKOLE: {
    ENTROT: { harga_grosir: 15000, harga_retail: 17600 },
    PEMAB: { harga_grosir: 5141.52, harga_retail: 6559 },
    LETSB: { harga_grosir: 16500, harga_retail: 16600 },
    ENTROH: { harga_grosir: 16500, harga_retail: 16600 },
    CKPXE: { harga_grosir: 9000, harga_retail: 10800 },
    KLPSL: { harga_grosir: 9000, harga_retail: 10800 },
    TFTSG: { harga_grosir: 22000, harga_retail: 109500 },
    FTGSPR: { harga_grosir: 22000, harga_retail: 109500 },
    TFTGF: { harga_grosir: 18000, harga_retail: 7820 },
    FTGKAP: { harga_grosir: 18000, harga_retail: 7820 },
  },

  // SUKABUMI - BLESSCOM (Dian - Sukaraja, Hikmat / Hikmatiar - Nyalindung)
  SUKARAJA: {
    ENTROT: { harga_grosir: 15000, harga_retail: 8800 },
    PEMAB: { harga_grosir: 5141.52, harga_retail: 6559 },
    LETSB: { harga_grosir: 16500, harga_retail: 16700 },
    ENTROH: { harga_grosir: 16500, harga_retail: 16700 },
    CKPXE: { harga_grosir: 9000, harga_retail: 10800 },
    KLPSL: { harga_grosir: 9000, harga_retail: 10800 },
    TFTSG: { harga_grosir: 22000, harga_retail: 10950 },
    FTGSPR: { harga_grosir: 22000, harga_retail: 10950 },
    TFTGF: { harga_grosir: 18000, harga_retail: 7820 },
    FTGKAP: { harga_grosir: 18000, harga_retail: 7820 },
  },
  NYALINDUNG: {
    ENTROT: { harga_grosir: 15000, harga_retail: 8800 },
    PEMAB: { harga_grosir: 5141.52, harga_retail: 6559 },
    LETSB: { harga_grosir: 16500, harga_retail: 16700 },
    ENTROH: { harga_grosir: 16500, harga_retail: 16700 },
    CKPXE: { harga_grosir: 9000, harga_retail: 10800 },
    KLPSL: { harga_grosir: 9000, harga_retail: 10800 },
    TFTSG: { harga_grosir: 22000, harga_retail: 10950 },
    FTGSPR: { harga_grosir: 22000, harga_retail: 10950 },
    TFTGF: { harga_grosir: 18000, harga_retail: 7820 },
    FTGKAP: { harga_grosir: 18000, harga_retail: 7820 },
  }
};

// Aliases for interchangeable SKU codes
const SKU_ALIASES: Record<string, string[]> = {
  LETSB: ['LETSB', 'ENTROH'],
  ENTROH: ['LETSB', 'ENTROH'],
  CKPXE: ['CKPXE', 'KLPSL'],
  KLPSL: ['CKPXE', 'KLPSL'],
  TFTSG: ['TFTSG', 'FTGSPR'],
  FTGSPR: ['TFTSG', 'FTGSPR'],
  TFTGF: ['TFTGF', 'FTGKAP'],
  FTGKAP: ['TFTGF', 'FTGKAP'],
  ENTROT: ['ENTROT']
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
  const codesToCheck = SKU_ALIASES[product.kode_produk] || [product.kode_produk];

  // 1. Custom user override
  for (const c of codesToCheck) {
    if (customOverrides?.[subdistKey]?.[c]) {
      const override = customOverrides[subdistKey][c];
      return {
        harga_grosir: override.harga_grosir,
        harga_retail: override.harga_retail,
        persentase_dof: override.persentase_dof !== undefined ? override.persentase_dof : product.persentase_dof
      };
    }
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
  for (const c of codesToCheck) {
    if (DEFAULT_SUBDIST_PRICES[subdistKey]?.[c]) {
      const def = DEFAULT_SUBDIST_PRICES[subdistKey][c];
      return {
        harga_grosir: def.harga_grosir,
        harga_retail: def.harga_retail,
        persentase_dof: def.persentase_dof !== undefined ? def.persentase_dof : product.persentase_dof
      };
    }
  }

  // 4. Default product fields
  return {
    harga_grosir: product.harga_grosir,
    harga_retail: product.harga_retail,
    persentase_dof: product.persentase_dof
  };
}
