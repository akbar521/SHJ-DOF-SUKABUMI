import jsPDF from 'jspdf';
import { Product } from '../types';
import { formatRupiah, formatDecimal, formatPercentage, calculateSHJ } from './mathUtils';

export interface OrderReportData {
  salesmanName: string;
  storeName: string;
  reportDate: string;
  wilayah?: string;
  subdistName?: string;
  notes?: string;
  items: {
    product: Product;
    qty: number;
    subdistLabel?: string;
  }[];
}

export function generatePdfReport(data: OrderReportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const activeItems = data.items.filter(i => i.qty > 0);

  // Colors
  const primaryColor = [21, 128, 61]; // Kalbe Green (Emerald 700)
  const accentColor = [5, 150, 105]; // Kalbe Emerald 600
  const tableHeaderBg = [241, 245, 249]; // Slate 100
  const textColor = [30, 41, 59]; // Slate 800
  const mutedText = [100, 116, 139]; // Slate 500

  // 1. Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 24, 'F');

  // Kalbe badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 5, 20, 14, 1.5, 1.5, 'F');
  doc.setTextColor(21, 128, 61);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('KALBE', 24, 13.5, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('LAPORAN HARIAN', 39, 11.5);

  const wilayahLabel = data.wilayah ? data.wilayah.toUpperCase() : 'SUKABUMI';
  const subdistLabel = data.subdistName ? ` | SUBDIST: ${data.subdistName.toUpperCase()}` : '';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`MOTORIS MMTW ${wilayahLabel}${subdistLabel} | DoF & Struktur Harga Jual (SHJ)`, 39, 17.5);

  // 2. Info / Metadata Section
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(8.5);

  let currentY = 30;
  
  // Calculate wrapped notes lines to prevent any truncation
  const availableNoteWidth = 156; // 190 - 34
  doc.setFont('helvetica', 'normal');
  const noteLines = doc.splitTextToSize(data.notes || '-', availableNoteWidth);
  const noteBlockHeight = Math.max(1, noteLines.length) * 4.2;
  const metaBoxHeight = 22 + noteBlockHeight;

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, 182, metaBoxHeight, 2, 2, 'FD');

  // Row 1: Toko / Format & Tanggal
  doc.setFont('helvetica', 'bold');
  doc.text('Laporan / Toko:', 18, currentY + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(data.storeName || 'Umum / Toko Mitra', 45, currentY + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal:', 125, currentY + 6.5);
  doc.setFont('helvetica', 'normal');
  doc.text(data.reportDate, 142, currentY + 6.5);

  // Row 2: Salesman & Wilayah/Subdist
  doc.setFont('helvetica', 'bold');
  doc.text('Salesman:', 18, currentY + 12.5);
  doc.setFont('helvetica', 'normal');
  doc.text(data.salesmanName || 'Salesman Lapangan', 45, currentY + 12.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Subdist Pengambilan:', 110, currentY + 12.5);
  doc.setFont('helvetica', 'normal');
  doc.text(data.subdistName ? `${data.subdistName} (${wilayahLabel})` : wilayahLabel, 142, currentY + 12.5);

  // Row 3: Catatan (Word-wrapped to prevent cut-off)
  doc.setFont('helvetica', 'bold');
  doc.text('Catatan:', 18, currentY + 18.5);
  doc.setFont('helvetica', 'normal');
  doc.text(noteLines, 34, currentY + 18.5);

  currentY += metaBoxHeight + 5;

  // 3. Table Header
  doc.setFillColor(tableHeaderBg[0], tableHeaderBg[1], tableHeaderBg[2]);
  doc.rect(14, currentY, 182, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(14, currentY, 196, currentY);
  doc.line(14, currentY + 8, 196, currentY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

  doc.text('No', 16, currentY + 5.5);
  doc.text('Kode', 24, currentY + 5.5);
  doc.text('Nama Produk', 46, currentY + 5.5);
  doc.text('Qty', 98, currentY + 5.5, { align: 'right' });
  doc.text('Grosir (Rp)', 122, currentY + 5.5, { align: 'right' });
  doc.text('Retail+ (Rp)', 146, currentY + 5.5, { align: 'right' });
  doc.text('SHJ (Selisih)', 170, currentY + 5.5, { align: 'right' });
  doc.text('DoF Fee', 194, currentY + 5.5, { align: 'right' });

  currentY += 8;

  let totalQty = 0;
  let totalGrosir = 0;
  let totalRetail = 0;
  let totalShj = 0;
  let totalDofFee = 0;

  if (activeItems.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.text('Belum ada item dengan kuantiti (Qty > 0). Silakan isi Qty pada formulir.', 105, currentY + 10, { align: 'center' });
    currentY += 20;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);

    activeItems.forEach((item, index) => {
      const p = item.product;
      const shj = calculateSHJ(p.harga_grosir, p.harga_retail, p.persentase_dof);
      const subGrosir = p.harga_grosir * item.qty;
      const subRetail = p.harga_retail * item.qty;
      const subShj = shj.shj * item.qty;
      const subDofFee = shj.dofFee * item.qty;

      totalQty += item.qty;
      totalGrosir += subGrosir;
      totalRetail += subRetail;
      totalShj += subShj;
      totalDofFee += subDofFee;

      // Row background alternating
      if (index % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, currentY, 182, 7.5, 'F');
      }

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`${index + 1}`, 16, currentY + 5);
      doc.text(p.kode_produk, 24, currentY + 5);

      // Truncate long name if needed, append loading subdist tag if provided
      const labelTag = item.subdistLabel ? ` [${item.subdistLabel}]` : '';
      const maxLen = item.subdistLabel ? 22 : 28;
      const baseName = p.nama_produk.length > maxLen ? p.nama_produk.substring(0, maxLen - 2) + '..' : p.nama_produk;
      const displayName = baseName + labelTag;
      doc.text(displayName, 46, currentY + 5);

      doc.setFont('helvetica', 'bold');
      doc.text(`${item.qty}`, 98, currentY + 5, { align: 'right' });
      doc.setFont('helvetica', 'normal');

      doc.text(formatDecimal(subGrosir), 122, currentY + 5, { align: 'right' });
      doc.text(formatDecimal(subRetail), 146, currentY + 5, { align: 'right' });
      doc.text(formatDecimal(subShj), 170, currentY + 5, { align: 'right' });
      doc.text(formatDecimal(subDofFee), 194, currentY + 5, { align: 'right' });

      doc.setDrawColor(241, 245, 249);
      doc.line(14, currentY + 7.5, 196, currentY + 7.5);

      currentY += 7.5;
    });
  }

  // 4. Grand Total Summary Block
  currentY += 4;
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.rect(14, currentY, 182, 24, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('RINGKASAN TOTAL KALKULASI:', 18, currentY + 6);

  doc.setFontSize(8);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);

  doc.text(`Total Unit / Qty:`, 18, currentY + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${totalQty} Unit`, 55, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Harga Grosir:`, 18, currentY + 19);
  doc.setFont('helvetica', 'bold');
  doc.text(formatRupiah(totalGrosir, true), 55, currentY + 19);

  doc.setFont('helvetica', 'normal');
  doc.text(`Total SHJ (Selisih):`, 105, currentY + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(formatRupiah(totalShj, true), 145, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Harga Retail+:`, 105, currentY + 19);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(formatRupiah(totalRetail, true), 145, currentY + 19);

  // 5. Signature Section (Dibuat Oleh & Penerima / Toko)
  currentY += 32;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const sigCol1 = 55;
  const sigCol2 = 155;

  doc.text('Dibuat Oleh,', sigCol1, currentY, { align: 'center' });
  doc.text('Penerima / Toko,', sigCol2, currentY, { align: 'center' });

  currentY += 18;
  doc.setFont('helvetica', 'bold');
  doc.text(`( ${data.salesmanName || 'Salesman'} )`, sigCol1, currentY, { align: 'center' });
  doc.text(`( ${data.storeName || 'Toko / Outlet'} )`, sigCol2, currentY, { align: 'center' });

  // 6. Footer Note
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  doc.text('* Dokumen Laporan Harian dicetak otomatis dari Kalbe Motoris MMTW Sukabumi (Kalkulator DOF & SHJ).', 14, 285);

  const cleanStoreName = (data.storeName || 'Laporan').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Laporan_Harian_Kalbe_MMTW_Sukabumi_${cleanStoreName}_${data.reportDate.replace(/\//g, '-')}.pdf`;
  doc.save(filename);
}

export function generateDofPdf(order: any) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`DELIVERY ORDER FORM (DOF) - ${order.no_dof}`, 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Toko: ${order.nama_toko} | Kategori: ${order.kategori_harga} | Status: ${order.status}`, 14, 18);

  doc.setTextColor(30, 41, 59);
  let currentY = 35;

  doc.text(`Tanggal Order: ${new Date(order.tanggal_order).toLocaleString('id-ID')}`, 14, currentY);
  doc.text(`Salesman: ${order.nama_salesman || '-'}`, 120, currentY);
  currentY += 8;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('No', 16, currentY + 5.5);
  doc.text('Kode SKU', 24, currentY + 5.5);
  doc.text('Nama Produk', 55, currentY + 5.5);
  doc.text('Qty', 120, currentY + 5.5, { align: 'right' });
  doc.text('Harga (Rp)', 155, currentY + 5.5, { align: 'right' });
  doc.text('Subtotal (Rp)', 192, currentY + 5.5, { align: 'right' });

  currentY += 8;
  doc.setFont('helvetica', 'normal');

  (order.details || []).forEach((d: any, idx: number) => {
    doc.text(`${idx + 1}`, 16, currentY + 5);
    doc.text(d.kode_produk, 24, currentY + 5);
    doc.text((d.nama_produk || '').substring(0, 32), 55, currentY + 5);
    doc.text(`${d.qty}`, 120, currentY + 5, { align: 'right' });
    doc.text(formatDecimal(d.harga_satuan), 155, currentY + 5, { align: 'right' });
    doc.text(formatDecimal(d.subtotal), 192, currentY + 5, { align: 'right' });
    currentY += 7;
  });

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`Grand Total: ${formatRupiah(order.grand_total, true)}`, 192, currentY, { align: 'right' });
  if (order.total_dof_fee > 0) {
    currentY += 6;
    doc.text(`Total DoF Fee: ${formatRupiah(order.total_dof_fee, true)}`, 192, currentY, { align: 'right' });
  }

  doc.save(`${order.no_dof}.pdf`);
}

export function generateTextSummary(order: any): string {
  let text = `📦 *DELIVERY ORDER FORM (DOF)*\n`;
  text += `*No:* ${order.no_dof}\n`;
  text += `*Toko:* ${order.nama_toko}\n`;
  text += `*Harga:* ${order.kategori_harga}\n`;
  text += `*Status:* ${order.status}\n\n`;
  text += `*Items:*\n`;
  (order.details || []).forEach((d: any, i: number) => {
    text += `${i + 1}. ${d.nama_produk || d.kode_produk} - ${d.qty}x @ ${formatRupiah(d.harga_satuan, true)} = ${formatRupiah(d.subtotal, true)}\n`;
  });
  text += `\n*Grand Total:* ${formatRupiah(order.grand_total, true)}\n`;
  if (order.total_dof_fee > 0) {
    text += `*Total DoF Fee:* ${formatRupiah(order.total_dof_fee, true)}\n`;
  }
  return text;
}

