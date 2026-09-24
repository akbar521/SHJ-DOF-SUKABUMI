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
  { name: 'RUSDIANA', label: 'Cibadak', wilayah: 'Sukabumi', dmsCode: 'MMTW-SKI-CIBADAK', areaHint: 'Cibadak' },
  { name: 'HIKMATIAR', label: 'Nyalindung', wilayah: 'Sukabumi', dmsCode: 'MMTW-SKI-NYALINDUNG', areaHint: 'Nyalindung' },
  { name: 'EGA', label: 'Cikole', wilayah: 'Sukabumi', dmsCode: 'MMTW-SKI-CIKOLE', areaHint: 'Cikole' },
  { name: 'FACHRI', label: 'Sukaraja', wilayah: 'Sukabumi', dmsCode: 'MMTW-SKI-SUKARAJA', areaHint: 'Sukaraja' },
];

export const SUBDIST_LIST: SubdistInfo[] = [
  // CIANJUR (4 Pangkalan)
  {
    key: 'CIKALONG',
    label: 'CIKALONG',
    shortLabel: 'Cikalong',
    wilayah: 'Cianjur',
    dmsUser: 'MMTW-SKI-CIKALONG',
    defaultSalesman: 'HERU',
    description: 'Pangkalan Cikalong Cianjur',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    key: 'CIPANAS',
    label: 'CIPANAS',
    shortLabel: 'Cipanas',
    wilayah: 'Cianjur',
    dmsUser: 'MMTW-SKI-CIAPANAS',
    defaultSalesman: 'HERPIN',
    description: 'Pangkalan Cipanas Cianjur',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300'
  },
  {
    key: 'CIBEBER',
    label: 'CIBEBER',
    shortLabel: 'Cibeber',
    wilayah: 'Cianjur',
    dmsUser: 'MMTW-SKI-CIBEBER',
    defaultSalesman: 'RIBCA',
    description: 'Pangkalan Cibeber Cianjur',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    key: 'CIRANJANG',
    label: 'CIRANJANG',
    shortLabel: 'Ciranjang',
    wilayah: 'Cianjur',
    dmsUser: 'MMTW-SKI-CIRANJANG',
    defaultSalesman: 'AHYAR',
    description: 'Pangkalan Ciranjang Cianjur',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  // SUKABUMI (4 Pangkalan)
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
    defaultSalesman: 'HIKMATIAR',
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

// Baseline prices for Subdist
export const DEFAULT_SUBDIST_PRICES: Record<SubdistKey, Record<string, ProductSubdistPrice>> = {
  CIKALONG: {},
  CIPANAS: {},
  CIBEBER: {},
  CIRANJANG: {},
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
