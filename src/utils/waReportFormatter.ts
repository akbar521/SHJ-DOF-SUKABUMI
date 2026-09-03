import { Product } from '../types';
import { formatRupiah, calculateSHJ } from './mathUtils';

export interface DailyActivityReportParams {
  salesmanName: string;
  userDms: string;
  reportDate: string; // "YYYY-MM-DD" or formatted "Selasa, 01 September 2026"
  wilayah?: string;   // "Cianjur" or "Sukabumi"
  subdistName?: string; // "PANJUNAN CIANJUR", "SIRAWING", etc.
  
  // 1. Kinerja Kunjungan
  realCall: number;
  ec: number;
  noo: number;

  // Items for Product Focus and NBC
  items: {
    product: Product;
    qty: number;
    subdistLabel?: string;
  }[];

  // 5. Evaluasi Alasan Not EC
  stockCukup?: number;
  pemilikTidakAda?: number;
  belumPernahJual?: number;
  pernahJualSM?: number;
  alasanLain?: number;
  totalBranding?: number;

  // Include DoF in Daily Activity text
  includeDofSummary?: boolean;
}

export function formatIndonesianFullDate(dateStr?: string | Date): string {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  let d: Date;
  if (!dateStr) {
    d = new Date();
  } else if (typeof dateStr === 'string') {
    if (dateStr.includes(',')) return dateStr;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      d = new Date(dateStr);
    }
  } else {
    d = dateStr;
  }

  if (isNaN(d.getTime())) {
    d = new Date();
  }

  const dayName = days[d.getDay()];
  const dateNum = String(d.getDate()).padStart(2, '0');
  const monthName = months[d.getMonth()];
  const year = d.getFullYear();

  return `${dayName}, ${dateNum} ${monthName} ${year}`;
}

export const NBC_PRODUCT_SHORT_NAMES: Record<string, string> = {
  'PEGAB': 'Go Anggur',
  'PEMAB': 'Joss Mangga',
  'PEBJE': 'Active 12s',
  'LEXUA': 'Ultimate',
  'LKXKD': 'Komix Kid Tube',
  'LKXOB': 'Komix Ori Tube',
  'LKXLA': 'Komix Lemon Tube',
  'LKXOD': 'Komix Ori Sachet',
  'LKXJA-LKXNA-LKXPA': 'Komix Rasa',
  'KMXAD': 'Komix Adult Box',
  'KMXKD': 'Komix Kids Pack',
  'LBJAB': 'Bejo Anak',
  'FTGKAP': 'Fatigon Kaplet',
  'LBMAV': 'Bejo Jahe Merah',
  'ENTROT': 'Entrostop Tab',
  'PBSJC': 'Slasi',
  'FTGSPR': 'Fatigon Spirit',
  'ENTROH': 'Entrostop Herbal Anak',
  'LPRGR': 'Promag Herbal',
  'LMHGA': 'Mixagrip Herbal'
};

/**
 * Generate standard REPORT DAILY ACTIVITY text exactly as formatted by user
 */
export function generateDailyActivityReport(params: DailyActivityReportParams): string {
  const formattedDate = formatIndonesianFullDate(params.reportDate);
  const totalNotEc = Math.max(0, (params.realCall || 0) - (params.ec || 0));

  // Find Focus Products
  // PF A: Bejo Jahe Merah New (12 scht) [LBMAV] - Rp 33.000
  // PF B: Promag Herbal 15 ml (6 'S) [LPRGR] - Rp 16.800
  const itemPfA = params.items.find(i => i.product.kode_produk === 'LBMAV');
  const itemPfB = params.items.find(i => i.product.kode_produk === 'LPRGR');

  const qtyPfA = itemPfA?.qty || 0;
  const pricePfA = itemPfA?.product.harga_retail || 33000;
  const omsetPfA = qtyPfA * pricePfA;

  const qtyPfB = itemPfB?.qty || 0;
  const pricePfB = itemPfB?.product.harga_retail || 16800;
  const omsetPfB = qtyPfB * pricePfB;

  // Non-Focus Items (NBC)
  const nbcItems = params.items.filter(
    i => i.product.kode_produk !== 'LBMAV' && i.product.kode_produk !== 'LPRGR'
  );

  const activeNbcItems = nbcItems.filter(i => i.qty > 0);
  const nbcSummaryStrings: string[] = [];
  let totalQtyNbc = 0;
  let totalOmsetNbc = 0;

  activeNbcItems.forEach(i => {
    const shortName = NBC_PRODUCT_SHORT_NAMES[i.product.kode_produk] || i.product.nama_produk;
    const originBadge = i.subdistLabel ? ` [${i.subdistLabel}]` : '';
    nbcSummaryStrings.push(`${shortName} (${i.qty})${originBadge}`);
    totalQtyNbc += i.qty;
    totalOmsetNbc += (i.product.harga_retail * i.qty);
  });

  let totalDofFee = 0;
  let totalShj = 0;
  let totalGrosir = 0;

  let panjunanQty = 0;
  let panjunanGrosir = 0;
  let rawingQty = 0;
  let rawingGrosir = 0;

  params.items.forEach(i => {
    if (i.qty > 0) {
      const shjCalc = calculateSHJ(i.product.harga_grosir, i.product.harga_retail, i.product.persentase_dof);
      totalDofFee += (shjCalc.dofFee * i.qty);
      totalShj += (shjCalc.shj * i.qty);
      totalGrosir += (i.product.harga_grosir * i.qty);

      if (i.subdistLabel?.toLowerCase().includes('raw') || i.subdistLabel?.toLowerCase().includes('siraw')) {
        rawingQty += i.qty;
        rawingGrosir += (i.product.harga_grosir * i.qty);
      } else {
        panjunanQty += i.qty;
        panjunanGrosir += (i.product.harga_grosir * i.qty);
      }
    }
  });

  const totalSetoran = omsetPfA + omsetPfB + totalOmsetNbc;

  // Evaluasi reasons
  const stockCukup = params.stockCukup !== undefined ? params.stockCukup : 0;
  const pemilikTidakAda = params.pemilikTidakAda !== undefined ? params.pemilikTidakAda : 0;
  const belumPernahJual = params.belumPernahJual !== undefined ? params.belumPernahJual : 0;
  const pernahJualSM = params.pernahJualSM !== undefined ? params.pernahJualSM : 0;
  
  // Default calculate sisa alasan lain if not set
  const currentEvaluasiSum = stockCukup + pemilikTidakAda + belumPernahJual + pernahJualSM;
  const alasanLain = params.alasanLain !== undefined 
    ? params.alasanLain 
    : Math.max(0, totalNotEc - currentEvaluasiSum);
  const totalBranding = params.totalBranding !== undefined ? params.totalBranding : 0;

  let text = `*REPORT DAILY ACTIVITY*\n`;
  text += `Tanggal: ${formattedDate}\n`;
  text += `Salesman: *${params.salesmanName || 'RUSDIANA'}*\n`;
  if (params.wilayah) {
    text += `Wilayah: *${params.wilayah.toUpperCase()}*\n`;
  }
  if (params.subdistName) {
    text += `Subdist Pengambilan: *${params.subdistName.toUpperCase()}*\n`;
  }
  text += `User DMS: *${params.userDms || 'MMTW-SKI-CIBADAK'}*\n\n`;

  text += `1. KINERJA KUNJUNGAN\n\n`;
  text += `Real Call: ${params.realCall || 0}\n\n`;
  text += `EC (Effective Call): ${params.ec || 0}\n\n`;
  text += `NOO (New Open Outlet): ${params.noo || 0}\n\n`;

  text += `2. PENCAPAIAN PRODUK FOKUS (Harga Retail+)\n\n`;
  const pfALabel = (qtyPfA > 0 && itemPfA?.subdistLabel) ? ` [${itemPfA.subdistLabel}]` : '';
  text += `PF A (Bejo Jahe Merah New 12s) - ${formatRupiah(pricePfA, true)} | Qty: ${qtyPfA}${pfALabel} | Omset: ${formatRupiah(omsetPfA, true)}\n\n`;
  const pfBLabel = (qtyPfB > 0 && itemPfB?.subdistLabel) ? ` [${itemPfB.subdistLabel}]` : '';
  text += `PF B (Promag Herbal 15ml 6s) - ${formatRupiah(pricePfB, true)} | Qty: ${qtyPfB}${pfBLabel} | Omset: ${formatRupiah(omsetPfB, true)}\n\n`;

  text += `3. PENJUALAN NON-FOKUS (NBC)\n\n`;
  text += `Item NBC: ${nbcSummaryStrings.length > 0 ? nbcSummaryStrings.join(', ') : '-'}\n\n`;
  text += `Qty NBC: ${totalQtyNbc}\n\n`;
  text += `Omset NBC: ${formatRupiah(totalOmsetNbc, true)}\n\n`;

  text += `4. FINANSIAL\n\n`;
  text += `Total Setoran: *${formatRupiah(totalSetoran, true)}*\n\n`;

  text += `5. EVALUASI (Total Not EC: ${totalNotEc})\n\n`;
  text += `Stock Cukup: ${stockCukup}\n\n`;
  text += `Pemilik Tidak Ada: ${pemilikTidakAda}\n\n`;
  text += `Belum Pernah Jual: ${belumPernahJual}\n\n`;
  text += `Pernah Jual tapi SM (Slow Moving): ${pernahJualSM}\n\n`;
  text += `Alasan Lain: ${alasanLain}\n\n`;
  text += `Total Branding: ${totalBranding}/10`;

  return text;
}

/**
 * Generate detailed DOF & SHJ Breakdown Report for WhatsApp
 */
export function generateDofShjReport(params: DailyActivityReportParams): string {
  const formattedDate = formatIndonesianFullDate(params.reportDate);
  const activeItems = params.items.filter(i => i.qty > 0);

  let totalQty = 0;
  let totalGrosir = 0;
  let totalDofFee = 0;
  let totalRetail = 0;
  let totalShj = 0;

  let panjunanQty = 0;
  let panjunanGrosir = 0;
  let rawingQty = 0;
  let rawingGrosir = 0;

  const itemLines = activeItems.map((i, idx) => {
    const shjCalc = calculateSHJ(i.product.harga_grosir, i.product.harga_retail, i.product.persentase_dof);
    const subGrosir = i.product.harga_grosir * i.qty;
    const subDofFee = shjCalc.dofFee * i.qty;
    const subRetail = i.product.harga_retail * i.qty;
    const subShj = shjCalc.shj * i.qty;

    totalQty += i.qty;
    totalGrosir += subGrosir;
    totalDofFee += subDofFee;
    totalRetail += subRetail;
    totalShj += subShj;

    if (i.subdistLabel?.toLowerCase().includes('raw') || i.subdistLabel?.toLowerCase().includes('siraw')) {
      rawingQty += i.qty;
      rawingGrosir += subGrosir;
    } else {
      panjunanQty += i.qty;
      panjunanGrosir += subGrosir;
    }

    const shortName = NBC_PRODUCT_SHORT_NAMES[i.product.kode_produk] || i.product.nama_produk;
    const dofPct = (i.product.persentase_dof * 100).toFixed(0);

    const originSuffix = i.subdistLabel ? ` [${i.subdistLabel}]` : '';

    return `${idx + 1}. ${shortName} (${i.product.kode_produk})${originSuffix}
   Qty: ${i.qty} Unit
   Grosir: ${formatRupiah(i.product.harga_grosir, true)} (Total: ${formatRupiah(subGrosir, true)})
   DOF (${dofPct}%): ${formatRupiah(shjCalc.dofFee, true)} (Total DoF Fee: ${formatRupiah(subDofFee, true)})
   Retail+: ${formatRupiah(i.product.harga_retail, true)} (Subtotal: ${formatRupiah(subRetail, true)})
   SHJ (Retail+ - Grosir): ${formatRupiah(shjCalc.shj, true)} (Total SHJ: ${formatRupiah(subShj, true)})`;
  });

  let text = `*LAPORAN STRUKTUR HARGA & DOF (DAILY RECON)*\n`;
  text += `Tanggal: ${formattedDate}\n`;
  text += `Salesman: *${params.salesmanName || 'RUSDIANA'}*\n`;
  if (params.wilayah) {
    text += `Wilayah: *${params.wilayah.toUpperCase()}*\n`;
  }
  if (params.subdistName) {
    text += `Subdist: *${params.subdistName.toUpperCase()}*\n`;
  }
  text += `User DMS: *${params.userDms || 'MMTW-SKI-CIBADAK'}*\n`;
  text += `-----------------------------------------\n\n`;

  if (itemLines.length === 0) {
    text += `Belum ada produk dengan Qty terinput.\n\n`;
  } else {
    text += `RINCIAN ITEM & DOF PER SKU:\n\n`;
    text += itemLines.join('\n\n') + `\n\n`;
  }

  text += `-----------------------------------------\n`;
  text += `RINGKASAN TOTAL FINANSIAL & DOF:\n`;
  text += `• Total Unit Terjual: ${totalQty} Unit\n`;
  text += `• Total Nilai Grosir: ${formatRupiah(totalGrosir, true)}\n`;
  text += `• Total DOF Fee: ${formatRupiah(totalDofFee, true)}\n`;
  text += `• Total SHJ (Selisih): ${formatRupiah(totalShj, true)}\n`;
  text += `• TOTAL SETORAN (Retail+): *${formatRupiah(totalRetail, true)}*\n`;

  return text;
}
