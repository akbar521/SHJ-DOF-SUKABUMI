/**
 * Decimal & Mathematical Utilities
 * Strictly handles floating-point arithmetic to prevent rounding errors
 * before final display formatting.
 */

// Precise floating-point multiplier to avoid 0.1 + 0.2 = 0.30000000000000004
export function preciseMultiply(a: number, b: number): number {
  const factor = 10000;
  return Math.round(a * b * factor) / factor;
}

export function preciseAdd(a: number, b: number): number {
  return Math.round((a + b) * 100) / 100;
}

/**
 * Calculates DoF Fee based on product's harga_grosir and its specific persentase_dof
 * Strict rule: DoF fee = persentase_dof * harga_grosir
 */
export function calculateDofFee(hargaGrosir: number, persentaseDof: number): number {
  return Math.round(hargaGrosir * persentaseDof * 100) / 100;
}

/**
 * Calculate SHJ (Struktur / Selisih Harga Jual = Harga Retail+ - Harga Grosir) and DoF Fee
 */
export function calculateSHJ(hargaGrosir: number, hargaRetail: number, persentaseDof: number) {
  // SHJ = Harga Retail+ dikurangi Harga Grosir
  const shj = Math.round((hargaRetail - hargaGrosir) * 100) / 100;
  const dofFee = calculateDofFee(hargaGrosir, persentaseDof);
  const totalHppDof = Math.round((hargaGrosir + dofFee) * 100) / 100;
  const marginRp = Math.round((hargaRetail - totalHppDof) * 100) / 100;
  const marginPersen = totalHppDof > 0 ? Math.round((marginRp / totalHppDof) * 10000) / 100 : 0;

  return {
    shj, // Harga Retail+ - Harga Grosir
    dofFee, // DoF Fee (Grosir * %DoF)
    totalHppDof, // Grosir + DoF Fee
    marginRp, // Retail+ - (Grosir + DoF Fee)
    marginPersen
  };
}

/**
 * Format standard Indonesian Rupiah
 */
export function formatRupiah(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  
  if (showDecimals && !Number.isInteger(amount)) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(amount));
}

/**
 * Format raw number with precision for decimals (e.g. 5.141,52)
 */
export function formatDecimal(val: number, decimals: number = 2): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(val);
}

/**
 * Format percentage (e.g., 0.20 -> 20%)
 */
export function formatPercentage(rate: number): string {
  return `${(rate * 100).toFixed(0)}%`;
}
