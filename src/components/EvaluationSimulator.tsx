import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { formatRupiah } from '../utils/mathUtils';
import {
  Award,
  Calculator,
  TrendingUp,
  Target,
  Store,
  CheckCircle2,
  AlertCircle,
  Check,
  RefreshCw,
  Share2,
  Calendar,
  Lock,
  Info,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

interface EvaluationSimulatorProps {
  products: Product[];
}

/**
 * Smart Number Input component that eliminates zero-lock frustrations.
 * - Auto-selects text on focus (click or tap) so typing immediately overwrites existing numbers
 * - Shows placeholder="0" when value is 0 (no cursor hopping needed)
 * - Allows full deletion without snapping back prematurely
 */
interface SmartNumberInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
}

export function SmartNumberInput({
  value,
  onChange,
  placeholder = '0',
  className = '',
  min = 0,
  max
}: SmartNumberInputProps) {
  const [localText, setLocalText] = useState<string>(value === 0 ? '' : String(value));

  useEffect(() => {
    setLocalText(value === 0 ? '' : String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setLocalText(raw);
    const num = raw === '' ? 0 : parseInt(raw, 10);
    const clamped = max !== undefined ? Math.min(max, num) : num;
    onChange(Math.max(min, clamped));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
  };

  const handleBlur = () => {
    if (localText === '' || localText === '0') {
      setLocalText('');
    } else {
      setLocalText(String(value));
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={localText}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
}

export function EvaluationSimulator({ products }: EvaluationSimulatorProps) {
  // Wilayah & Salesman Selection
  const [selectedWilayah, setSelectedWilayah] = useState<'Sukabumi' | 'Cianjur'>('Cianjur');
  const [selectedSalesman, setSelectedSalesman] = useState<string>('HERU');

  // Calculator Mode: 'bulanan' (Keseluruhan) or 'hk' (Sesuai HK)
  const [calcMode, setCalcMode] = useState<'bulanan' | 'hk'>('bulanan');

  // Hari Kerja (HK): 1 to 31 HK (Maksimal target dihitung basis 25 HK)
  const [hariKerja, setHariKerja] = useState<number>(27);
  const [hariKerjaText, setHariKerjaText] = useState<string>('27');

  // BASE MONTHLY TARGETS (Standar Bulanan Penuh / Read-Only)
  const BASE_TARGET_PF_A = 5000000;        // Rp 5.000.000 (Bobot 40%)
  const BASE_TARGET_PF_B = 5000000;        // Rp 5.000.000 (Bobot 25%)
  const BASE_TARGET_TOTAL_OMSET = 27000000; // Rp 27.000.000 (Bobot 25%)
  const BASE_TARGET_AA = 400;              // 400 Toko (Bobot 10%)

  // Effective HK capped at 25 HK: jika ada bulan 26 atau 27 HK, target tidak bertambah (tetap 25 HK)
  const effectiveHK = useMemo(() => {
    return Math.min(hariKerja, 25);
  }, [hariKerja]);

  // Handler for direct typing in HK input
  const handleHkChange = (newText: string) => {
    const raw = newText.replace(/[^0-9]/g, '');
    setHariKerjaText(raw);
    if (raw !== '') {
      const n = parseInt(raw, 10);
      const clamped = Math.max(1, Math.min(31, n));
      setHariKerja(clamped);
    }
  };

  // Stepper handlers for +/- 1 HK
  const handleHkStep = (delta: number) => {
    const nextVal = Math.max(1, Math.min(31, (hariKerja || 25) + delta));
    setHariKerja(nextVal);
    setHariKerjaText(String(nextVal));
  };

  // Blur handler to ensure valid HK
  const handleHkBlur = () => {
    if (hariKerjaText === '' || parseInt(hariKerjaText, 10) < 1) {
      setHariKerja(27);
      setHariKerjaText('27');
    } else {
      const n = Math.max(1, Math.min(31, parseInt(hariKerjaText, 10)));
      setHariKerja(n);
      setHariKerjaText(String(n));
    }
  };

  // Dynamic Targets based on Calculator Mode (Read-Only)
  const targetPfA = useMemo(() => {
    if (calcMode === 'bulanan') return BASE_TARGET_PF_A;
    return Math.round((effectiveHK / 25) * BASE_TARGET_PF_A);
  }, [calcMode, effectiveHK]);

  const targetPfB = useMemo(() => {
    if (calcMode === 'bulanan') return BASE_TARGET_PF_B;
    return Math.round((effectiveHK / 25) * BASE_TARGET_PF_B);
  }, [calcMode, effectiveHK]);

  const targetTotalOmset = useMemo(() => {
    if (calcMode === 'bulanan') return BASE_TARGET_TOTAL_OMSET;
    return Math.round((effectiveHK / 25) * BASE_TARGET_TOTAL_OMSET);
  }, [calcMode, effectiveHK]);

  const targetAA = useMemo(() => {
    if (calcMode === 'bulanan') return BASE_TARGET_AA;
    return Math.round((effectiveHK / 25) * BASE_TARGET_AA);
  }, [calcMode, effectiveHK]);

  // REALISASI STATE - DEFAULT 0
  const [realisasiPfA, setRealisasiPfA] = useState<number>(0);
  const [realisasiPfB, setRealisasiPfB] = useState<number>(0);
  const [realisasiTotalOmset, setRealisasiTotalOmset] = useState<number>(0);
  const [realisasiAA, setRealisasiAA] = useState<number>(0);

  // Feedback notifications
  const [copyStatus, setCopyStatus] = useState<boolean>(false);
  const [hasPulledData, setHasPulledData] = useState<boolean>(false);

  // Sync salesmen list with selected wilayah
  const salesmenOptions = useMemo(() => {
    if (selectedWilayah === 'Cianjur') {
      return [
        { name: 'HERU', pangkalan: 'Cikalong', dms: 'MMTW-CJR-CKL' },
        { name: 'HERPIN', pangkalan: 'Cipanas', dms: 'MMTW-CJR-CPN' },
        { name: 'AHYAR', pangkalan: 'Ciranjang', dms: 'MMTW-CJR-CRJ' },
        { name: 'RIBCA', pangkalan: 'Cibeber', dms: 'MMTW-CJR-CBR' },
      ];
    } else {
      return [
        { name: 'RUSDIANA', pangkalan: 'Cibadak', dms: 'MMTW-SKI-CIBADAK' },
        { name: 'HIKMATIAR', pangkalan: 'Nyalindung', dms: 'MMTW-SKI-NYALINDUNG' },
        { name: 'EGA', pangkalan: 'Cikole', dms: 'MMTW-SKI-CIKOLE' },
        { name: 'DIAN', pangkalan: 'Sukaraja', dms: 'MMTW-SKI-SUKARAJA' },
      ];
    }
  }, [selectedWilayah]);

  // Adjust default salesman when wilayah changes
  useEffect(() => {
    if (salesmenOptions.length > 0 && !salesmenOptions.some(s => s.name === selectedSalesman)) {
      setSelectedSalesman(salesmenOptions[0].name);
    }
  }, [salesmenOptions, selectedSalesman]);

  // Pull today's sales draft from localStorage
  const pullTodaySalesData = () => {
    try {
      const storedDraft = localStorage.getItem('dof_shj_calculator_draft');
      if (storedDraft) {
        const parsed = JSON.parse(storedDraft);
        if (parsed) {
          const quantities: Record<string, number> = parsed.quantities || {};
          let calcPfA = 0;
          let calcPfB = 0;
          let calcTotal = 0;

          products.forEach(p => {
            const qty = quantities[p.kode_produk] || 0;
            const sub = p.harga_retail * qty;
            calcTotal += sub;

            const isPfA = p.kode_produk === 'LBMAV' || p.nama_produk.toLowerCase().includes('bejo');
            const isPfB =
              p.kode_produk === 'LPRGR' ||
              p.kode_produk.startsWith('LKX') ||
              p.nama_produk.toLowerCase().includes('komix') ||
              p.nama_produk.toLowerCase().includes('promag');

            if (isPfA) calcPfA += sub;
            else if (isPfB) calcPfB += sub;
          });

          if (calcTotal > 0 || (parsed.ec && Number(parsed.ec) > 0)) {
            setRealisasiPfA(calcPfA);
            setRealisasiPfB(calcPfB);
            setRealisasiTotalOmset(calcTotal);
            if (parsed.ec) {
              setRealisasiAA(Number(parsed.ec) || 0);
            }
            if (parsed.selectedWilayah) {
              setSelectedWilayah(parsed.selectedWilayah);
            }
            if (parsed.salesmanName) {
              setSelectedSalesman(parsed.salesmanName);
            }
            setHasPulledData(true);
            setTimeout(() => setHasPulledData(false), 3000);
            return;
          }
        }
      }
    } catch (e) {
      console.warn('Could not read calculator draft', e);
    }

    // Default simulation sample values if draft was empty
    setRealisasiPfA(4250000);
    setRealisasiPfB(4000000);
    setRealisasiTotalOmset(23000000);
    setRealisasiAA(340);
    setHasPulledData(true);
    setTimeout(() => setHasPulledData(false), 3000);
  };

  // Calculations for each pillar based on their respective weights:
  // - Pilar 1: PF A (Bobot 40% = Maks. 40 Poin)
  // - Pilar 2: PF B (Bobot 25% = Maks. 25 Poin)
  // - Pilar 3: Total Omset (Bobot 25% = Maks. 25 Poin)
  // - Pilar 4: Total AA (Bobot 10% = Maks. 10 Poin)
  // TOTAL SKOR = Akumulasi Skor Ke-4 Pilar (Maks. 100 Poin / 100%)
  const calcResults = useMemo(() => {
    // 1. PF A: Bejo Jahe Merah (Weight: 40%)
    const pctPfA = targetPfA > 0 ? (realisasiPfA / targetPfA) * 100 : 0;
    const scorePfA = (pctPfA * 0.40);
    const gapPfA = targetPfA - realisasiPfA;

    // 2. PF B: Komix Herbal Sachet, Tube & Promag Herbal (Weight: 25%)
    const pctPfB = targetPfB > 0 ? (realisasiPfB / targetPfB) * 100 : 0;
    const scorePfB = (pctPfB * 0.25);
    const gapPfB = targetPfB - realisasiPfB;

    // 3. Total Omset Semua Produk (Weight: 25%)
    const pctTotalOmset = targetTotalOmset > 0 ? (realisasiTotalOmset / targetTotalOmset) * 100 : 0;
    const scoreTotalOmset = (pctTotalOmset * 0.25);
    const gapTotalOmset = targetTotalOmset - realisasiTotalOmset;

    // 4. Total AA (Active Account) (Weight: 10%)
    const pctAA = targetAA > 0 ? (realisasiAA / targetAA) * 100 : 0;
    const scoreAA = (pctAA * 0.10);
    const gapAA = targetAA - realisasiAA;

    // Total Evaluation Score across all weighted pillars
    const totalScore = scorePfA + scorePfB + scoreTotalOmset + scoreAA;

    // Points needed to reach AMAN threshold (60.0% of total weight)
    const pointsNeededToAman = Math.max(0, 60.0 - totalScore);

    // Evaluation Status according to rules:
    // =< 40: EVALUASI
    // 41 - 59: DISPENSASI
    // 60 - 100+: AMAN
    let evalStatus: 'EVALUASI' | 'DISPENSASI' | 'AMAN' = 'EVALUASI';
    let gradeLabel = 'EVALUASI';
    let gradeDescription = 'Skor total ≤ 40%: Kinerja di bawah batas evaluasi. Wajib audit rute dan coaching intensif.';
    let gradeColor = 'text-rose-700 bg-rose-50 border-rose-300';
    let badgeColor = 'bg-rose-600 text-white';
    let ringColor = 'border-rose-500 bg-rose-50/50';

    if (totalScore >= 60) {
      evalStatus = 'AMAN';
      gradeLabel = totalScore >= 100 ? 'AMAN (TARGET TUNTAS 100%+)' : 'AMAN (MEMENUHI SYARAT)';
      gradeDescription = 'Skor total bobot keseluruhan ≥ 60%: Kinerja motoris dinyatakan AMAN dan memenuhi kriteria evaluasi operasional Kalbe.';
      gradeColor = 'text-emerald-700 bg-emerald-50 border-emerald-300';
      badgeColor = 'bg-emerald-600 text-white';
      ringColor = 'border-emerald-500 bg-emerald-50/50';
    } else if (totalScore >= 41) {
      evalStatus = 'DISPENSASI';
      gradeLabel = 'DISPENSASI';
      gradeDescription = 'Skor total bobot keseluruhan 41 - 59%: Kinerja motoris di zona toleransi (Dispensasi). Perlu percepatan untuk menembus skor minimal 60% (AMAN).';
      gradeColor = 'text-amber-700 bg-amber-50 border-amber-300';
      badgeColor = 'bg-amber-500 text-white';
      ringColor = 'border-amber-500 bg-amber-50/50';
    }

    // Units and omset needed to contribute points to reach 60% total score based on weights:
    // Bejo Jahe Merah: Rp 33.000 / pack (12 scht). Pilar PF A has 40% weight.
    const bejoPrice = 33000;
    // Omset PF A needed purely to cover pointsNeededToAman:
    // (Omset / targetPfA) * 40 = pointsNeededToAman  ==>  Omset = (pointsNeededToAman / 40) * targetPfA
    const pfAOmsetForAman = pointsNeededToAman > 0 && targetPfA > 0
      ? Math.round((pointsNeededToAman / 40) * targetPfA)
      : 0;
    const bejoPacksForAman = pfAOmsetForAman > 0 ? Math.ceil(pfAOmsetForAman / bejoPrice) : 0;

    // Komix & Promag: Pilar PF B has 25% weight.
    // (Omset / targetPfB) * 25 = pointsNeededToAman  ==>  Omset = (pointsNeededToAman / 25) * targetPfB
    const pfBOmsetForAman = pointsNeededToAman > 0 && targetPfB > 0
      ? Math.round((pointsNeededToAman / 25) * targetPfB)
      : 0;
    const komixSachetForAman = pfBOmsetForAman > 0 ? Math.ceil(pfBOmsetForAman / 13000) : 0;
    const komixTubesForAman = pfBOmsetForAman > 0 ? Math.ceil(pfBOmsetForAman / 12100) : 0;
    const promagPacksForAman = pfBOmsetForAman > 0 ? Math.ceil(pfBOmsetForAman / 16800) : 0;

    // Total Omset: Pilar 3 has 25% weight.
    // (Omset / targetTotalOmset) * 25 = pointsNeededToAman ==> Omset = (pointsNeededToAman / 25) * targetTotalOmset
    const totalOmsetForAman = pointsNeededToAman > 0 && targetTotalOmset > 0
      ? Math.round((pointsNeededToAman / 25) * targetTotalOmset)
      : 0;

    // AA: Pilar AA has 10% weight.
    // (Toko / targetAA) * 10 = pointsNeededToAman ==> Toko = (pointsNeededToAman / 10) * targetAA
    const aaTokoForAman = pointsNeededToAman > 0 && targetAA > 0
      ? Math.ceil((pointsNeededToAman / 10) * targetAA)
      : 0;

    // Gap to 100% full targets (dalam satuan Pack):
    const bejoPacksNeeded100 = gapPfA > 0 ? Math.ceil(gapPfA / bejoPrice) : 0;

    const komixSachetNeeded100 = gapPfB > 0 ? Math.ceil(gapPfB / 13000) : 0;
    const komixTubesNeeded100 = gapPfB > 0 ? Math.ceil(gapPfB / 12100) : 0;
    const promagPacksNeeded100 = gapPfB > 0 ? Math.ceil(gapPfB / 16800) : 0;

    return {
      pctPfA,
      scorePfA,
      gapPfA,
      pfAOmsetForAman,
      bejoPacksForAman,
      bejoPacksNeeded100,

      pctPfB,
      scorePfB,
      gapPfB,
      pfBOmsetForAman,
      komixSachetForAman,
      komixTubesForAman,
      promagPacksForAman,
      komixSachetNeeded100,
      komixTubesNeeded100,
      promagPacksNeeded100,

      pctTotalOmset,
      scoreTotalOmset,
      gapTotalOmset,
      totalOmsetForAman,

      pctAA,
      scoreAA,
      gapAA,
      aaTokoForAman,

      totalScore,
      pointsNeededToAman,
      evalStatus,
      gradeLabel,
      gradeDescription,
      gradeColor,
      badgeColor,
      ringColor
    };
  }, [
    targetPfA,
    realisasiPfA,
    targetPfB,
    realisasiPfB,
    targetTotalOmset,
    realisasiTotalOmset,
    targetAA,
    realisasiAA
  ]);

  // WhatsApp Report Generator (copied to clipboard upon button click)
  const generateWaReport = () => {
    const todayStr = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const modeText =
      calcMode === 'bulanan'
        ? 'Target Bulanan Penuh (Basis 25 HK)'
        : `Target Berdasarkan ${hariKerja} HK (Maks. Efektif 25 HK${hariKerja > 25 ? ` - Keuntungan +${hariKerja - 25} HK Bonus` : ''})`;

    return `*SIMULASI & EVALUASI KINERJA MOTORIS KALBE*
Periode: ${modeText} (${todayStr})
Wilayah: ${selectedWilayah}
Salesman / Motoris: *${selectedSalesman}*
----------------------------------------
*1. REALISASI & SKOR 4 PILAR:*
• *PF A (Bejo Jahe Merah) - Bobot 40% (Maks 40.0 pts):*
  - Target: ${formatRupiah(targetPfA)} (Read-Only)
  - Realisasi: ${formatRupiah(realisasiPfA)}
  - Capaian: ${calcResults.pctPfA.toFixed(1)}% ➔ *Skor: ${calcResults.scorePfA.toFixed(2)} pts*
  ${calcResults.gapPfA > 0 ? `  - Gap ke Target 100%: ${formatRupiah(calcResults.gapPfA)} (~${calcResults.bejoPacksNeeded100} pack Bejo @ Rp 33.000)` : '  - Status: Tuntaskan 100%+'}

• *PF B (Komix Herbal & Promag) - Bobot 25% (Maks 25.0 pts):*
  - Target: ${formatRupiah(targetPfB)} (Read-Only)
  - Realisasi: ${formatRupiah(realisasiPfB)}
  - Capaian: ${calcResults.pctPfB.toFixed(1)}% ➔ *Skor: ${calcResults.scorePfB.toFixed(2)} pts*
  ${calcResults.gapPfB > 0 
    ? `  - Gap ke Target 100%: ${formatRupiah(calcResults.gapPfB)}
    * Estimasi Kurang Fisik (Pilihan per Pack):
      • Komix Herbal Sachet: ~${calcResults.komixSachetNeeded100} pack (@ Rp 13.000)
      • Komix Herbal Tube: ~${calcResults.komixTubesNeeded100} pack (@ Rp 12.100)
      • Promag Herbal: ~${calcResults.promagPacksNeeded100} pack (@ Rp 16.800)` 
    : '  - Status: Tuntaskan 100%+'}

• *Total Omset Semua Produk - Bobot 25% (Maks 25.0 pts):*
  - Target: ${formatRupiah(targetTotalOmset)} (Read-Only)
  - Realisasi: ${formatRupiah(realisasiTotalOmset)}
  - Capaian: ${calcResults.pctTotalOmset.toFixed(1)}% ➔ *Skor: ${calcResults.scoreTotalOmset.toFixed(2)} pts*
  ${calcResults.gapTotalOmset > 0 ? `  - Gap ke Target 100%: ${formatRupiah(calcResults.gapTotalOmset)}` : '  - Status: Tuntaskan 100%+'}

• *Total AA (Active Account) - Bobot 10% (Maks 10.0 pts):*
  - Target: ${targetAA} Toko (Read-Only)
  - Realisasi: ${realisasiAA} Toko
  - Capaian: ${calcResults.pctAA.toFixed(1)}% ➔ *Skor: ${calcResults.scoreAA.toFixed(2)} pts*
  ${calcResults.gapAA > 0 ? `  - Gap ke Target 100%: ${calcResults.gapAA} Toko` : '  - Status: Tuntaskan 100%+'}

----------------------------------------
*2. KESIMPULAN EVALUASI (TOTAL SKOR BOBOT KESELURUHAN):*
• *TOTAL SKOR EVALUASI: ${calcResults.totalScore.toFixed(2)}%* (dari total 100%)
• Status Hasil: *${calcResults.evalStatus}* (${calcResults.gradeLabel})
• Ambang Batas Resmi Kalbe (Skor Tertimbang Keseluruhan):
  - ≤ 40%    : EVALUASI (Merah)
  - 41 - 59% : DISPENSASI (Kuning)
  - ≥ 60%    : AMAN (Hijau)
  *(Catatan: Kriteria AMAN ≥ 60% dihitung dari TOTAL AKUMULASI ke-4 pilar berbobot, BUKAN 60% per pilar)*
${calcResults.pointsNeededToAman > 0 
  ? `• *Prioritas Utama:* Kejar +${calcResults.pointsNeededToAman.toFixed(2)} poin lagi untuk mencapai batas total AMAN (60.0%).` 
  : '• *Catatan:* Motoris sudah melampaui batas minimal AMAN 60% dari bobot keseluruhan.'}

_Generated automatically by KALBE Motoris Performance Evaluation System_`;
  };

  const handleCopyReport = async () => {
    const text = generateWaReport();
    await navigator.clipboard.writeText(text);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-5 sm:p-7 shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="bg-amber-500/20 text-amber-300 font-extrabold text-[11px] px-2.5 py-1 rounded-md border border-amber-500/30 flex items-center space-x-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>KPI 4 PILAR MOTORIS</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[11px] px-2.5 py-1 rounded-md border border-emerald-500/30">
                Bobot Total 100%
              </span>
              <span className="bg-sky-500/20 text-sky-300 font-bold text-[11px] px-2.5 py-1 rounded-md border border-sky-500/30 flex items-center space-x-1">
                <Lock className="w-3 h-3" />
                <span>Target Tetap (Read-Only)</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>Simulasi Kalkulator Evaluasi Kinerja</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Target resmi bulanan (Basis 25 HK): 
              <strong className="text-amber-300 font-semibold"> PF A Bejo Jahe Merah 5 Jt (Bobot 40%)</strong>, 
              <strong className="text-orange-300 font-semibold"> PF B Komix Sachet/Tube &amp; Promag 5 Jt (Bobot 25%)</strong>, 
              <strong className="text-blue-300 font-semibold"> Total Omset 27 Jt (Bobot 25%)</strong>, dan 
              <strong className="text-purple-300 font-semibold"> Total AA 400 Toko (Bobot 10%)</strong>.
            </p>

            {/* Criteria Threshold Legend (Total Score) */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-700/60 text-xs">
              <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                Ambang Batas Skor Keseluruhan:
              </span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>≤ 40% : EVALUASI</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>41 - 59% : DISPENSASI</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>≥ 60% : AMAN</span>
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <button
              onClick={pullTodaySalesData}
              className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${hasPulledData ? 'animate-spin' : ''}`} />
              <span>{hasPulledData ? 'Data Disinkron!' : 'Tarik Data Hari Ini'}</span>
            </button>
            <button
              onClick={handleCopyReport}
              className="bg-slate-700/80 hover:bg-slate-600 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-md transition flex items-center space-x-1.5 border border-slate-600 cursor-pointer"
            >
              {copyStatus ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-300" />
                  <span>Salin WA Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* MODE SWITCHER: KALKULATOR KESELURUHAN VS KALKULATOR HK */}
        <div className="mt-5 pt-4 border-t border-slate-700/60">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Mode Switcher Buttons */}
            <div className="md:col-span-6">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Pilih Mode Kalkulator
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setCalcMode('bulanan')}
                  className={`py-2 px-3 text-xs font-extrabold rounded-lg transition flex items-center justify-center space-x-2 cursor-pointer ${
                    calcMode === 'bulanan'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Kalkulator Keseluruhan (Bulanan)</span>
                </button>
                <button
                  onClick={() => setCalcMode('hk')}
                  className={`py-2 px-3 text-xs font-extrabold rounded-lg transition flex items-center justify-center space-x-2 cursor-pointer ${
                    calcMode === 'hk'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Kalkulator Sesuai HK (Hari Kerja)</span>
                </button>
              </div>
            </div>

            {/* Wilayah & Salesman Selector */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Wilayah Operasional
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedWilayah('Cianjur')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    selectedWilayah === 'Cianjur'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Cianjur
                </button>
                <button
                  onClick={() => setSelectedWilayah('Sukabumi')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    selectedWilayah === 'Sukabumi'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sukabumi
                </button>
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Motoris / Salesman
              </label>
              <select
                value={selectedSalesman}
                onChange={e => setSelectedSalesman(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {salesmenOptions.map(s => (
                  <option key={s.name} value={s.name} className="bg-slate-900 text-white">
                    {s.name} ({s.pangkalan})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Special HK Control Panel when HK mode is active */}
          {calcMode === 'hk' && (
            <div className="mt-3.5 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                <div className="flex items-center space-x-3">
                  <div className="bg-amber-500 text-slate-950 p-2.5 rounded-xl font-black text-xs shrink-0 shadow-sm flex items-center justify-center">
                    HK
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-amber-300">
                        Hari Kerja Berjalan: {hariKerja} HK
                      </span>
                      <span className="text-xs font-bold bg-amber-500/20 text-amber-200 px-2 py-0.5 rounded-md border border-amber-500/30">
                        Basis Target: {effectiveHK} / 25 HK {hariKerja > 25 ? '(Capped Maks 25 HK)' : `(${Math.round((hariKerja / 25) * 100)}%)`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Target pilar otomatis diproporsionalkan dari target bulanan penuh (maks. 25 HK).
                    </p>
                  </div>
                </div>

                {/* Direct HK Input - Ketik Langsung (Bukan Pilih-Pilih) */}
                <div className="flex items-center space-x-2 bg-slate-950/80 p-2 rounded-xl border border-amber-500/40 shrink-0">
                  <span className="text-xs font-bold text-slate-300 whitespace-nowrap pl-1">
                    Ketik HK:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleHkStep(-1)}
                    disabled={hariKerja <= 1}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold flex items-center justify-center transition cursor-pointer text-sm"
                    title="Kurangi 1 HK"
                  >
                    -
                  </button>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={hariKerjaText}
                      onChange={e => handleHkChange(e.target.value)}
                      onFocus={e => e.currentTarget.select()}
                      onBlur={handleHkBlur}
                      placeholder="HK"
                      className="w-16 bg-slate-900 border border-amber-400 text-amber-300 text-base font-black text-center rounded-lg py-1 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleHkStep(1)}
                    disabled={hariKerja >= 31}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold flex items-center justify-center transition cursor-pointer text-sm"
                    title="Tambah 1 HK"
                  >
                    +
                  </button>
                  <span className="text-xs font-extrabold text-amber-400 pr-1">HK</span>
                </div>
              </div>

              {/* Informative Note for > 25 HK rule (e.g. 26 or 27 HK bonus keuntungan motoris) */}
              {hariKerja > 25 ? (
                <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-start space-x-2.5 text-xs text-amber-200 bg-amber-500/10 p-2.5 rounded-lg">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">
                      Keuntungan Motoris (+{hariKerja - 25} Hari Kerja Bonus):
                    </span>{' '}
                    Bulan sekarang ada <strong>{hariKerja} HK</strong>. Target pilar maksimal tetap dihitung <strong>25 HK</strong> (100% target penuh bulanan).
                    Hari ke-26 s/d ke-{hariKerja} ({hariKerja - 25} HK bonus) <em>tidak menambah beban target</em>, sehingga seluruh realisasi omset & AA di {hariKerja - 25} hari tersebut murni menjadi keuntungan motoris untuk mempermudah mengejar target dan mengamankan status evaluasi AMAN (≥ 60%)!
                  </div>
                </div>
              ) : (
                <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-400">
                  <span>Target per HK: PF A Rp 200.000/HK • PF B Rp 200.000/HK • Total Omset Rp 1.080.000/HK • AA 16 Toko/HK</span>
                  <span className="text-slate-500">Maksimal target dihitung 25 HK</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* 4 DETAILED PILLAR CARDS (TARGET READ-ONLY + INPUT REALISASI TOTAL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ========================================================================= */}
        {/* PILAR 1: PF A (BEJO JAHE MERAH) - BOBOT 40% */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-amber-200/80 shadow-xs p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-1 rounded-md border border-amber-300 flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5 text-amber-700" />
                  <span>PILAR 1: PF A</span>
                </span>
                <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs">
                  BOBOT 40%
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Kontribusi Skor</span>
                <p className="text-base font-black text-amber-700">
                  {calcResults.scorePfA.toFixed(2)} <span className="text-xs font-semibold text-slate-400">/ 40.0 pts</span>
                </p>
              </div>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mt-2">
              Bejo Jahe Merah (LBMAV)
            </h3>
            <p className="text-xs text-slate-500">
              Produk fokus utama motoris. Kemasan pack (@ Rp 33.000/pack). Bobot nilai tertinggi (40%).
            </p>

            {/* Target (Read-Only) & Realisasi (Direct Clean Input) */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Target 100%</span>
                  <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Read-Only
                  </span>
                </label>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 select-all flex items-center justify-between">
                  <span>{formatRupiah(targetPfA)}</span>
                  <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                    {calcMode === 'bulanan' ? 'Bulanan' : `${effectiveHK} HK`}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {calcMode === 'hk' ? `Rp 200.000/HK × ${effectiveHK} HK` : 'Target Bulanan Tetap'}
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Realisasi Omset (Rp)
                </label>
                <SmartNumberInput
                  value={realisasiPfA}
                  onChange={setRealisasiPfA}
                  placeholder="0"
                  className="w-full bg-amber-50/50 border border-amber-300 rounded-xl px-3 py-2 text-xs font-extrabold text-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">{formatRupiah(realisasiPfA)}</span>
              </div>
            </div>
            {/* Physical Gap Breakdown for PF A Bejo */}
            {calcResults.gapPfA > 0 && (
              <div className="mt-3 bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 text-[11px]">
                <div className="flex items-center justify-between text-amber-950 font-bold mb-1">
                  <span>Estimasi Fisik Penutupan Gap:</span>
                  <span className="text-[10px] text-amber-800 font-semibold">{formatRupiah(calcResults.gapPfA)}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-amber-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-amber-900 block">Bejo Jahe Merah</span>
                    <span className="text-[10px] text-slate-500">Harga resmi Rp 33.000 / pack</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-amber-900">~{calcResults.bejoPacksNeeded100} pack</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Analysis Indicator */}
          <div className="mt-4 pt-3 border-t border-amber-100 flex items-center justify-between text-xs">
            {calcResults.gapPfA <= 0 ? (
              <div className="flex items-center space-x-1 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Target 100% Tuntas ({calcResults.pctPfA.toFixed(1)}%)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-slate-600">
                <span>
                  Gap menuju target 100%: <strong className="text-amber-800">{formatRupiah(calcResults.gapPfA)}</strong> (~{calcResults.bejoPacksNeeded100} pack)
                </span>
              </div>
            )}
            <span className="font-extrabold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded text-[11px]">
              Capaian: {calcResults.pctPfA.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PILAR 2: PF B (KOMIX SACHET, TUBE & PROMAG HERBAL) - BOBOT 25% */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-orange-200/80 shadow-xs p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="bg-orange-100 text-orange-900 text-xs font-black px-2.5 py-1 rounded-md border border-orange-300 flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5 text-orange-700" />
                  <span>PILAR 2: PF B</span>
                </span>
                <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs">
                  BOBOT 25%
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Kontribusi Skor</span>
                <p className="text-base font-black text-orange-700">
                  {calcResults.scorePfB.toFixed(2)} <span className="text-xs font-semibold text-slate-400">/ 25.0 pts</span>
                </p>
              </div>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mt-2">
              Komix Herbal Sachet, Tube &amp; Promag Herbal
            </h3>
            <p className="text-xs text-slate-500">
              Komix Herbal Sachet (@ Rp 13.000/pack), Komix Herbal Tube (@ Rp 12.100/pack), dan Promag Herbal (@ Rp 16.800/pack).
            </p>

            {/* Target (Read-Only) & Realisasi (Direct Clean Input) */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Target 100%</span>
                  <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Read-Only
                  </span>
                </label>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 select-all flex items-center justify-between">
                  <span>{formatRupiah(targetPfB)}</span>
                  <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                    {calcMode === 'bulanan' ? 'Bulanan' : `${effectiveHK} HK`}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {calcMode === 'hk' ? `Rp 200.000/HK × ${effectiveHK} HK` : 'Target Bulanan Tetap'}
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Realisasi Omset (Rp)
                </label>
                <SmartNumberInput
                  value={realisasiPfB}
                  onChange={setRealisasiPfB}
                  placeholder="0"
                  className="w-full bg-orange-50/50 border border-orange-300 rounded-xl px-3 py-2 text-xs font-extrabold text-orange-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <span className="text-[10px] text-orange-700 font-semibold mt-0.5 block">{formatRupiah(realisasiPfB)}</span>
              </div>
            </div>

            {/* Detailed Physical Gap Breakdown for PF B (Komix Sachet, Tube, Promag) */}
            {calcResults.gapPfB > 0 && (
              <div className="mt-3.5 bg-orange-50/80 border border-orange-200 rounded-xl p-3">
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <span className="font-extrabold text-orange-950 flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
                    <span>Rincian Kurang Gap Fisik ({formatRupiah(calcResults.gapPfB)}):</span>
                  </span>
                  <span className="text-[10px] text-orange-700 font-semibold">(Pilihan opsi per pack)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {/* Komix Sachet */}
                  <div className="bg-white p-2.5 rounded-lg border border-orange-200 shadow-2xs flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-orange-900 block">
                        Komix Herbal Sachet
                      </span>
                      <span className="text-[10px] text-slate-400">@ Rp 13.000 / pack</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-base font-black text-slate-900">
                        ~{calcResults.komixSachetNeeded100} <span className="text-xs font-bold text-slate-500">pack</span>
                      </div>
                    </div>
                  </div>

                  {/* Komix Tube */}
                  <div className="bg-white p-2.5 rounded-lg border border-orange-200 shadow-2xs flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-orange-900 block">
                        Komix Herbal Tube
                      </span>
                      <span className="text-[10px] text-slate-400">@ Rp 12.100 / pack</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-base font-black text-slate-900">
                        ~{calcResults.komixTubesNeeded100} <span className="text-xs font-bold text-slate-500">pack</span>
                      </div>
                    </div>
                  </div>

                  {/* Promag Herbal */}
                  <div className="bg-white p-2.5 rounded-lg border border-orange-200 shadow-2xs flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-orange-900 block">
                        Promag Herbal
                      </span>
                      <span className="text-[10px] text-slate-400">@ Rp 16.800 / pack</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-base font-black text-slate-900">
                        ~{calcResults.promagPacksNeeded100} <span className="text-xs font-bold text-slate-500">pack</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Analysis Indicator */}
          <div className="mt-4 pt-3 border-t border-orange-100 flex items-center justify-between text-xs">
            {calcResults.gapPfB <= 0 ? (
              <div className="flex items-center space-x-1 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Target 100% Tuntas ({calcResults.pctPfB.toFixed(1)}%)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-slate-600">
                <span>
                  Gap menuju target 100%: <strong className="text-orange-800">{formatRupiah(calcResults.gapPfB)}</strong> (~{calcResults.komixSachetNeeded100} pack Komix Sachet / {calcResults.komixTubesNeeded100} pack Komix Tube / {calcResults.promagPacksNeeded100} pack Promag)
                </span>
              </div>
            )}
            <span className="font-extrabold text-orange-900 bg-orange-100/80 px-2 py-0.5 rounded text-[11px]">
              Capaian: {calcResults.pctPfB.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PILAR 3: TOTAL OMSET SEMUA PRODUK - BOBOT 25% */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-blue-200/80 shadow-xs p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-900 text-xs font-black px-2.5 py-1 rounded-md border border-blue-300 flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
                  <span>PILAR 3: OMSET TOTAL</span>
                </span>
                <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs">
                  BOBOT 25%
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Kontribusi Skor</span>
                <p className="text-base font-black text-blue-700">
                  {calcResults.scoreTotalOmset.toFixed(2)} <span className="text-xs font-semibold text-slate-400">/ 25.0 pts</span>
                </p>
              </div>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mt-2">
              Total Omset Semua Produk
            </h3>
            <p className="text-xs text-slate-500">
              Akumulasi seluruh penjualan (PF A + PF B + NBC / Kalpanax, Entrostop, Fatigon, dll).
            </p>

            {/* Target (Read-Only) & Realisasi (Direct Clean Input) */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Target 100%</span>
                  <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Read-Only
                  </span>
                </label>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 select-all flex items-center justify-between">
                  <span>{formatRupiah(targetTotalOmset)}</span>
                  <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                    {calcMode === 'bulanan' ? 'Bulanan' : `${effectiveHK} HK`}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {calcMode === 'hk' ? `Rp 1.080.000/HK × ${effectiveHK} HK` : 'Target Bulanan Tetap'}
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Realisasi Total (Rp)
                </label>
                <SmartNumberInput
                  value={realisasiTotalOmset}
                  onChange={setRealisasiTotalOmset}
                  placeholder="0"
                  className="w-full bg-blue-50/50 border border-blue-300 rounded-xl px-3 py-2 text-xs font-extrabold text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-blue-700 font-semibold mt-0.5 block">{formatRupiah(realisasiTotalOmset)}</span>
              </div>
            </div>
          </div>

          {/* Bottom Analysis Indicator */}
          <div className="mt-4 pt-3 border-t border-blue-100 flex items-center justify-between text-xs">
            {calcResults.gapTotalOmset <= 0 ? (
              <div className="flex items-center space-x-1 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Target 100% Tuntas ({calcResults.pctTotalOmset.toFixed(1)}%)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-slate-600">
                <span>
                  Gap menuju target 100%: <strong className="text-blue-800">{formatRupiah(calcResults.gapTotalOmset)}</strong>
                </span>
              </div>
            )}
            <span className="font-extrabold text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded text-[11px]">
              Capaian: {calcResults.pctTotalOmset.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PILAR 4: TOTAL AA (ACTIVE ACCOUNT / TOKO AKTIF) - BOBOT 10% */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-purple-200/80 shadow-xs p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="bg-purple-100 text-purple-900 text-xs font-black px-2.5 py-1 rounded-md border border-purple-300 flex items-center space-x-1">
                  <Store className="w-3.5 h-3.5 text-purple-700" />
                  <span>PILAR 4: TOTAL AA</span>
                </span>
                <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs">
                  BOBOT 10%
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Kontribusi Skor</span>
                <p className="text-base font-black text-purple-700">
                  {calcResults.scoreAA.toFixed(2)} <span className="text-xs font-semibold text-slate-400">/ 10.0 pts</span>
                </p>
              </div>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mt-2">
              Total Active Account (AA)
            </h3>
            <p className="text-xs text-slate-500">
              Jumlah toko aktif yang bertransaksi / buka faktur pada rute kunjungan motoris.
            </p>

            {/* Target (Read-Only) & Realisasi (Direct Clean Input) */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Target 100%</span>
                  <span className="text-[9px] font-semibold text-slate-400 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Read-Only
                  </span>
                </label>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 select-all flex items-center justify-between">
                  <span>{targetAA} Toko</span>
                  <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                    {calcMode === 'bulanan' ? 'Bulanan' : `${effectiveHK} HK`}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {calcMode === 'hk' ? `16 Toko/HK × ${effectiveHK} HK` : 'Target Bulanan Tetap'}
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Realisasi AA (Toko)
                </label>
                <SmartNumberInput
                  value={realisasiAA}
                  onChange={setRealisasiAA}
                  placeholder="0"
                  className="w-full bg-purple-50/50 border border-purple-300 rounded-xl px-3 py-2 text-xs font-extrabold text-purple-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <span className="text-[10px] text-purple-700 font-semibold mt-0.5 block">{realisasiAA} Toko Berbelanja</span>
              </div>
            </div>
          </div>

          {/* Bottom Analysis Indicator */}
          <div className="mt-4 pt-3 border-t border-purple-100 flex items-center justify-between text-xs">
            {calcResults.gapAA <= 0 ? (
              <div className="flex items-center space-x-1 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Target 100% Tuntas ({realisasiAA} Toko)</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-slate-600">
                <span>
                  Gap menuju target 100%: <strong className="text-purple-800">{calcResults.gapAA}</strong> Toko lagi
                </span>
              </div>
            )}
            <span className="font-extrabold text-purple-900 bg-purple-100/80 px-2 py-0.5 rounded text-[11px]">
              Capaian: {calcResults.pctAA.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STATUS EVALUASI & RINCIAN HASIL KALKULASI (DITARUH DI BAWAH INPUT PILAR) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Overall Score Dial */}
          <div className="flex items-center space-x-5">
            <div className="relative flex items-center justify-center shrink-0">
              <div className={`w-28 h-28 rounded-full border-8 flex flex-col items-center justify-center shadow-inner ${calcResults.ringColor}`}>
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  {calcResults.totalScore.toFixed(1)}%
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                  Total Skor<br/>(Semua Bobot)
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className={`text-xs font-black px-3 py-1 rounded-full shadow-xs ${calcResults.badgeColor}`}>
                  STATUS: {calcResults.evalStatus}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Akumulasi Bobot: 40% + 25% + 25% + 10% = 100%
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-1 flex items-center space-x-2">
                <span>{calcResults.gradeLabel}</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 max-w-xl leading-relaxed">
                {calcResults.gradeDescription}
              </p>
              <div className="mt-2.5 flex items-center space-x-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>
                  <strong>Aturan Resmi:</strong> Batas AMAN (≥ 60%) dinilai dari <strong>Total Skor Bobot Keseluruhan</strong>, BUKAN 60% per pilar. Motoris aman jika total poin dari ke-4 pilar mencapai minimal 60.0 poin.
                </span>
              </div>
            </div>
          </div>

          {/* Minimal 60% Target Indicator for Total Score */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-right sm:min-w-[220px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Ambang Minimal AMAN
            </span>
            <div className="text-lg font-black text-emerald-700 mt-0.5 flex items-center sm:justify-end space-x-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Total Skor ≥ 60.0%</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1">
              {calcResults.totalScore >= 60 ? (
                <span className="text-emerald-700 font-bold">
                  ✅ Total skor sudah lolos batas AMAN!
                </span>
              ) : (
                <span>
                  Kurang <strong className="text-rose-600">{calcResults.pointsNeededToAman.toFixed(1)} poin lagi</strong> ke status AMAN
                </span>
              )}
            </p>
          </div>
        </div>

        {/* 4 Pillar Mini Progress Breakdown (Rincian Kalkulator) */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Rincian Capaian &amp; Kontribusi Skor 4 Pilar
            </span>
            <span className="text-[11px] text-slate-500 font-semibold">
              Total Skor: {calcResults.totalScore.toFixed(2)} / 100.0 pts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Pillar 1 Mini */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-extrabold text-amber-800">PF A (Bobot 40%)</span>
                <span className="font-black text-slate-900">{calcResults.scorePfA.toFixed(2)} pts</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (calcResults.scorePfA / 40) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Capaian: {calcResults.pctPfA.toFixed(1)}%</span>
                <span>Maks: 40.0 pts</span>
              </div>
            </div>

            {/* Pillar 2 Mini */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-extrabold text-orange-800">PF B (Bobot 25%)</span>
                <span className="font-black text-slate-900">{calcResults.scorePfB.toFixed(2)} pts</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (calcResults.scorePfB / 25) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Capaian: {calcResults.pctPfB.toFixed(1)}%</span>
                <span>Maks: 25.0 pts</span>
              </div>
            </div>

            {/* Pillar 3 Mini */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-extrabold text-blue-800">Total Omset (Bobot 25%)</span>
                <span className="font-black text-slate-900">{calcResults.scoreTotalOmset.toFixed(2)} pts</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (calcResults.scoreTotalOmset / 25) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Capaian: {calcResults.pctTotalOmset.toFixed(1)}%</span>
                <span>Maks: 25.0 pts</span>
              </div>
            </div>

            {/* Pillar 4 Mini */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="font-extrabold text-purple-800">Total Toko AA (Bobot 10%)</span>
                <span className="font-black text-slate-900">{calcResults.scoreAA.toFixed(2)} pts</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (calcResults.scoreAA / 10) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Capaian: {calcResults.pctAA.toFixed(1)}%</span>
                <span>Maks: 10.0 pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STRATEGIC GAP-TO-TARGET HELPER: STRATEGI MENUTUP TOTAL SKOR KE 60% AMAN */}
      <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="flex items-center space-x-2 text-emerald-900">
            <Target className="w-5 h-5 text-emerald-700" />
            <h3 className="font-black text-sm sm:text-base tracking-tight">
              Strategi Penutupan Gap: Kejar Total Skor Minimal 60% (Batas AMAN) Terlebih Dahulu
            </h3>
          </div>
          <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-md bg-emerald-600 text-white shadow-2xs">
            Total Skor Saat Ini: {calcResults.totalScore.toFixed(1)}% / 100%
          </span>
        </div>
        
        <p className="text-xs text-slate-600 mb-4 max-w-4xl leading-relaxed">
          Status <strong className="text-emerald-800">AMAN (≥ 60%)</strong> dihitung dari <strong>akumulasi bobot keseluruhan 4 pilar</strong>: 
          PF A (40%), PF B (25%), Total Omset (25%), dan Total AA (10%). Motoris <strong>{selectedSalesman}</strong> perlu mengamankan total skor minimal 60 poin terlebih dahulu agar keluar dari zona Evaluasi / Dispensasi.
        </p>

        {/* Formula & Rule Explanation Banner */}
        <div className="bg-white/90 border border-emerald-300 rounded-xl p-3.5 mb-4 text-xs text-slate-700">
          <div className="flex items-center space-x-2 text-emerald-900 font-extrabold mb-1">
            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Rumus Penilaian: AMAN (≥ 60%) Berdasarkan Total Skor Bobot Keseluruhan</span>
          </div>
          <p className="leading-relaxed text-slate-600">
            Penilaian evaluasi dihitung dari <strong>akumulasi 4 skor pilar</strong> (Maksimal 100 Poin), <strong>BUKAN</strong> 60% per masing-masing pilar:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-emerald-100 font-mono text-[11px]">
            <div className="bg-amber-50 p-2 rounded border border-amber-200">
              <span className="font-sans font-bold text-amber-900 block">PF A (40%)</span>
              <span className="text-amber-800">Capaian% × 0.40</span>
              <span className="text-[10px] text-slate-500 block">Maks. 40.0 pts</span>
            </div>
            <div className="bg-orange-50 p-2 rounded border border-orange-200">
              <span className="font-sans font-bold text-orange-900 block">PF B (25%)</span>
              <span className="text-orange-800">Capaian% × 0.25</span>
              <span className="text-[10px] text-slate-500 block">Maks. 25.0 pts</span>
            </div>
            <div className="bg-blue-50 p-2 rounded border border-blue-200">
              <span className="font-sans font-bold text-blue-900 block">Total Omset (25%)</span>
              <span className="text-blue-800">Capaian% × 0.25</span>
              <span className="text-[10px] text-slate-500 block">Maks. 25.0 pts</span>
            </div>
            <div className="bg-purple-50 p-2 rounded border border-purple-200">
              <span className="font-sans font-bold text-purple-900 block">Total AA (10%)</span>
              <span className="text-purple-800">Capaian% × 0.10</span>
              <span className="text-[10px] text-slate-500 block">Maks. 10.0 pts</span>
            </div>
          </div>
        </div>

        {calcResults.pointsNeededToAman > 0 ? (
          <div>
            {/* Alert Box: Points Needed */}
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 mb-4 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center space-x-2 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Motoris membutuhkan tambahan minimal <strong className="text-rose-700 text-sm">+{calcResults.pointsNeededToAman.toFixed(2)} Poin</strong> untuk menembus skor total <strong>60.0% (Batas AMAN)</strong>.
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded">
                Status Saat Ini: {calcResults.evalStatus}
              </span>
            </div>

            {/* 4 Pillar Strategic Options to Gain the Needed Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Option 1: PF A (Weight 40%) - Highest Leverage */}
              <div className="bg-white/95 backdrop-blur-xs p-4 rounded-xl border border-amber-300 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>Jalur 1: PF A Bejo</span>
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      Bobot 40% (Maks 40 pts)
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Bobot tertinggi (40%). Mendongkrak skor 1.6x lebih cepat dibanding pilar lainnya.
                  </p>

                  <div className="mt-3 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 text-xs">
                    <div className="text-[10px] text-slate-600">
                      Omset Bejo jika tutup sisa gap skor via PF A:
                    </div>
                    <div className="text-base font-black text-amber-900 mt-0.5">
                      +{formatRupiah(calcResults.pfAOmsetForAman)}
                    </div>
                    <div className="text-[11px] font-bold text-amber-800 mt-1">
                      ≈ {calcResults.bejoPacksForAman} Pack Bejo (@ Rp 33.000)
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between">
                  <span>Skor: {calcResults.scorePfA.toFixed(1)} / 40 pts</span>
                  <span>Target: {formatRupiah(targetPfA)}</span>
                </div>
              </div>

              {/* Option 2: PF B (Weight 25%) */}
              <div className="bg-white/95 backdrop-blur-xs p-4 rounded-xl border border-orange-300 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">
                      Jalur 2: PF B Herbal
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-300">
                      Bobot 25% (Maks 25 pts)
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Mendorong pemerataan Komix Herbal Sachet, Tube, dan Promag Herbal di warung / outlet.
                  </p>

                  <div className="mt-3 bg-orange-50/70 p-2.5 rounded-lg border border-orange-200 text-xs">
                    <div className="text-[10px] text-slate-600">
                      Omset PF B jika tutup sisa gap skor via PF B:
                    </div>
                    <div className="text-base font-black text-orange-900 mt-0.5">
                      +{formatRupiah(calcResults.pfBOmsetForAman)}
                    </div>
                    <div className="text-[10px] font-semibold text-orange-800 mt-1 space-y-0.5">
                      <div>• ~{calcResults.komixSachetForAman} Pack Komix Herbal Sachet (@ Rp 13.000)</div>
                      <div>• ~{calcResults.komixTubesForAman} Pack Komix Herbal Tube (@ Rp 12.100)</div>
                      <div>• ~{calcResults.promagPacksForAman} Pack Promag Herbal (@ Rp 16.800)</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between">
                  <span>Skor: {calcResults.scorePfB.toFixed(1)} / 25 pts</span>
                  <span>Target: {formatRupiah(targetPfB)}</span>
                </div>
              </div>

              {/* Option 3: Pilar Omset Total (Weight 25%) */}
              <div className="bg-white/95 backdrop-blur-xs p-4 rounded-xl border border-blue-300 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                      Jalur 3: Total Omset
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                      Bobot 25% (Maks 25 pts)
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Penjualan seluruh produk termasuk produk regular / NBC (Entrostop, Fatigon, dll).
                  </p>

                  <div className="mt-3 bg-blue-50/70 p-2.5 rounded-lg border border-blue-200 text-xs">
                    <div className="text-[10px] text-slate-600">
                      Omset jika tutup sisa gap skor via Total Omset:
                    </div>
                    <div className="text-base font-black text-blue-900 mt-0.5">
                      +{formatRupiah(calcResults.totalOmsetForAman)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Kenaikan omset produk apa pun otomatis menambah skor pilar ini.
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between">
                  <span>Skor: {calcResults.scoreTotalOmset.toFixed(1)} / 25 pts</span>
                  <span>Target: {formatRupiah(targetTotalOmset)}</span>
                </div>
              </div>

              {/* Option 4: Pilar AA (Weight 10%) */}
              <div className="bg-white/95 backdrop-blur-xs p-4 rounded-xl border border-purple-300 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                      Jalur 4: Toko AA
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300">
                      Bobot 10% (Maks 10 pts)
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Membuka faktur belanja baru di toko-toko rute kunjungan agar sebaran merata.
                  </p>

                  <div className="mt-3 bg-purple-50/70 p-2.5 rounded-lg border border-purple-200 text-xs">
                    <div className="text-[10px] text-slate-600">
                      Tambahan toko jika tutup sisa gap via AA:
                    </div>
                    <div className="text-base font-black text-purple-900 mt-0.5">
                      +{calcResults.aaTokoForAman} Toko Belanja
                    </div>
                    <div className="text-[10px] text-purple-700 mt-1">
                      Setiap 1 toko transaksi menambah skor pilar sebaran.
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between">
                  <span>Skor: {calcResults.scoreAA.toFixed(1)} / 10 pts</span>
                  <span>Target: {targetAA} Toko</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-emerald-300">
            <div className="flex items-center space-x-2 text-emerald-800 font-extrabold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>TOTAL SKOR KESELURUHAN TELAH MENCAPAI {calcResults.totalScore.toFixed(1)}% (STATUS AMAN)</span>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Selamat! Akumulasi skor dari keempat pilar yang dibobotkan telah melampaui batas minimal 60% (AMAN). Motoris <strong>{selectedSalesman}</strong> resmi terbebas dari status Evaluasi dan Dispensasi.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
              <span>Langkah selanjutnya: Optimalkan sisa target 100% pilar:</span>
              <span className="font-semibold text-amber-800">• PF A kurang {formatRupiah(calcResults.gapPfA)}</span>
              <span className="font-semibold text-orange-800">• PF B kurang {formatRupiah(calcResults.gapPfB)}</span>
              <span className="font-semibold text-purple-800">• AA kurang {calcResults.gapAA} toko</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
