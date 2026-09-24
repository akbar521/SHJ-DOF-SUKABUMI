import React, { useState, useMemo, useEffect } from 'react';
import { Product, SubdistKey, Wilayah } from '../types';
import { 
  SUBDIST_LIST, 
  CIANJUR_MOTORIS, 
  SUKABUMI_MOTORIS 
} from '../data/subdistConfig';
import { formatRupiah } from '../utils/mathUtils';
import { generatePdfReport } from '../utils/pdfGenerator';
import { 
  generateDailyActivityReport, 
  generateDofShjReport,
  formatIndonesianFullDate, 
  NBC_PRODUCT_SHORT_NAMES 
} from '../utils/waReportFormatter';
import { 
  Copy, 
  Check, 
  Download, 
  RotateCcw, 
  Sparkles, 
  User as UserIcon, 
  Calendar, 
  Plus, 
  Minus, 
  CheckCircle2, 
  MessageSquare, 
  PhoneCall, 
  Target, 
  AlertCircle, 
  Award, 
  Layers, 
  MapPin,
  TrendingUp,
  Store
} from 'lucide-react';

interface SimpleDofShjCalculatorProps {
  products: Product[];
}

export function SimpleDofShjCalculator({ products }: SimpleDofShjCalculatorProps) {
  // 1. Regional & Pangkalan Setup (Cianjur & Sukabumi)
  const [selectedWilayah, setSelectedWilayah] = useState<Wilayah>('Cianjur');
  const [selectedSubdist, setSelectedSubdist] = useState<SubdistKey>('CIKALONG');

  // Active Pangkalan Info
  const activeSubdistInfo = useMemo(() => {
    return SUBDIST_LIST.find(s => s.key === selectedSubdist) || SUBDIST_LIST[0];
  }, [selectedSubdist]);

  // Salesman & DMS Identitas
  const [salesmanName, setSalesmanName] = useState('HERU');
  const [userDms, setUserDms] = useState('MMTW-SKI-CIKALONG');
  const [reportDate, setReportDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Select Cianjur Salesman (HERU -> Cikalong, HERPIN -> Cipanas, RIBCA -> Cibeber, AHYAR -> Ciranjang)
  const handleSelectCianjurSalesman = (motoris: typeof CIANJUR_MOTORIS[0]) => {
    setSalesmanName(motoris.name);
    if (motoris.dmsCode) {
      setUserDms(motoris.dmsCode);
    }
    const matchingSub = SUBDIST_LIST.find(s => s.wilayah === 'Cianjur' && s.defaultSalesman === motoris.name);
    if (matchingSub) {
      setSelectedSubdist(matchingSub.key);
    }
  };

  // Select Sukabumi Salesman (RUSDIANA -> Cibadak, HIKMATIAR -> Nyalindung, EGA -> Cikole, FACHRI -> Sukaraja)
  const handleSelectSukabumiSalesman = (motoris: typeof SUKABUMI_MOTORIS[0]) => {
    setSalesmanName(motoris.name);
    if (motoris.dmsCode) {
      setUserDms(motoris.dmsCode);
    }
    const matchingSub = SUBDIST_LIST.find(s => s.wilayah === 'Sukabumi' && s.defaultSalesman === motoris.name);
    if (matchingSub) {
      setSelectedSubdist(matchingSub.key);
    }
  };

  // Switch Wilayah
  const handleSelectWilayah = (wil: Wilayah) => {
    setSelectedWilayah(wil);
    if (wil === 'Cianjur') {
      setSelectedSubdist('CIKALONG');
      setSalesmanName('HERU');
      setUserDms('MMTW-SKI-CIKALONG');
    } else {
      setSelectedSubdist('CIBADAK');
      setSalesmanName('RUSDIANA');
      setUserDms('MMTW-SKI-CIBADAK');
    }
  };

  // 2. Kinerja Kunjungan
  const [realCall, setRealCall] = useState<number>(30);
  const [ec, setEc] = useState<number>(8);
  const [noo, setNoo] = useState<number>(8);

  // 3. Evaluasi (Not EC Breakdown)
  const [stockCukup, setStockCukup] = useState<number>(2);
  const [pemilikTidakAda, setPemilikTidakAda] = useState<number>(6);
  const [belumPernahJual, setBelumPernahJual] = useState<number>(3);
  const [pernahJualSM, setPernahJualSM] = useState<number>(1);
  const [alasanLain, setAlasanLain] = useState<number>(10);
  const [totalBranding, setTotalBranding] = useState<number>(2);

  // 4. Quantities state mapping: { [kode_produk]: qty }
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    products.forEach(p => {
      if (p.kode_produk === 'PEGAB') initial[p.kode_produk] = 21; // Go Anggur
      else if (p.kode_produk === 'LEXUA') initial[p.kode_produk] = 10; // Ultimate
      else if (p.kode_produk === 'LKXOD') initial[p.kode_produk] = 2; // Komix Ori
      else if (p.kode_produk === 'LKXJA-LKXNA-LKXPA') initial[p.kode_produk] = 2; // Komix Rasa
      else if (p.kode_produk === 'PBSJC') initial[p.kode_produk] = 3; // Slasi
      else if (p.kode_produk === 'LBMAV') initial[p.kode_produk] = 1; // PF A: Bejo Jahe Merah
      else if (p.kode_produk === 'LPRGR') initial[p.kode_produk] = 1; // PF B: Promag Herbal
      else initial[p.kode_produk] = 0;
    });
    return initial;
  });

  // UI state for copy notification
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Update quantity handler
  const handleQtyChange = (kode_produk: string, newQty: number) => {
    const val = isNaN(newQty) ? 0 : Math.max(0, Math.floor(newQty));
    setQuantities(prev => ({
      ...prev,
      [kode_produk]: val
    }));
  };

  const handleStepQty = (kode_produk: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[kode_produk] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [kode_produk]: next };
    });
  };

  const handleResetAll = () => {
    const resetObj: Record<string, number> = {};
    products.forEach(p => {
      resetObj[p.kode_produk] = 0;
    });
    setQuantities(resetObj);
    setRealCall(30);
    setEc(0);
    setNoo(0);
    setStockCukup(0);
    setPemilikTidakAda(0);
    setBelumPernahJual(0);
    setPernahJualSM(0);
    setAlasanLain(0);
    setTotalBranding(0);
  };

  const handleFillSample = () => {
    const sampleObj: Record<string, number> = {};
    products.forEach(p => {
      if (selectedWilayah === 'Cianjur') {
        if (p.kode_produk === 'PEGAB') sampleObj[p.kode_produk] = 20;
        else if (p.kode_produk === 'PEMAB') sampleObj[p.kode_produk] = 10;
        else if (p.kode_produk === 'PEBJE') sampleObj[p.kode_produk] = 5;
        else if (p.kode_produk === 'LEXUA') sampleObj[p.kode_produk] = 12;
        else if (p.kode_produk === 'LKXOB') sampleObj[p.kode_produk] = 4;
        else if (p.kode_produk === 'LKXOD') sampleObj[p.kode_produk] = 6;
        else if (p.kode_produk === 'LBMAV') sampleObj[p.kode_produk] = 2;
        else if (p.kode_produk === 'LPRGR') sampleObj[p.kode_produk] = 1;
        else if (p.kode_produk === 'PBSJC') sampleObj[p.kode_produk] = 3;
        else sampleObj[p.kode_produk] = 0;
      } else {
        if (p.kode_produk === 'PEGAB') sampleObj[p.kode_produk] = 21;
        else if (p.kode_produk === 'LEXUA') sampleObj[p.kode_produk] = 10;
        else if (p.kode_produk === 'LKXOD') sampleObj[p.kode_produk] = 2;
        else if (p.kode_produk === 'LKXJA-LKXNA-LKXPA') sampleObj[p.kode_produk] = 2;
        else if (p.kode_produk === 'PBSJC') sampleObj[p.kode_produk] = 3;
        else if (p.kode_produk === 'LBMAV') sampleObj[p.kode_produk] = 1;
        else if (p.kode_produk === 'LPRGR') sampleObj[p.kode_produk] = 1;
        else sampleObj[p.kode_produk] = 0;
      }
    });
    setQuantities(sampleObj);
    setRealCall(30);
    setEc(8);
    setNoo(8);
    setStockCukup(2);
    setPemilikTidakAda(6);
    setBelumPernahJual(3);
    setPernahJualSM(1);
    setAlasanLain(10);
    setTotalBranding(2);
  };

  // Filter products by selected Wilayah
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedWilayah === 'Cianjur') {
        return !p.wilayah || p.wilayah.includes('Cianjur');
      }
      return !p.wilayah || p.wilayah.includes('Sukabumi');
    });
  }, [products, selectedWilayah]);

  // Calculated items with PF / NBC flags
  const calculatedItems = useMemo(() => {
    return filteredProducts.map(p => {
      const qty = quantities[p.kode_produk] || 0;
      const subRetail = p.harga_retail * qty;
      const isPfA = p.kode_produk === 'LBMAV';
      const isPfB = p.kode_produk === 'LPRGR';
      const isPf = isPfA || isPfB;

      return {
        product: p,
        effectiveProduct: p,
        qty,
        subRetail,
        isPfA,
        isPfB,
        isPf,
        shortName: NBC_PRODUCT_SHORT_NAMES[p.kode_produk] || p.nama_produk
      };
    });
  }, [filteredProducts, quantities]);

  // Total summary
  const summary = useMemo(() => {
    let totalQty = 0;
    let totalRetail = 0;

    let omsetPfA = 0;
    let qtyPfA = 0;
    let omsetPfB = 0;
    let qtyPfB = 0;

    let qtyNbc = 0;
    let omsetNbc = 0;

    calculatedItems.forEach(item => {
      totalQty += item.qty;
      totalRetail += item.subRetail;

      if (item.isPfA) {
        qtyPfA += item.qty;
        omsetPfA += item.subRetail;
      } else if (item.isPfB) {
        qtyPfB += item.qty;
        omsetPfB += item.subRetail;
      } else {
        qtyNbc += item.qty;
        omsetNbc += item.subRetail;
      }
    });

    const totalSetoran = omsetPfA + omsetPfB + omsetNbc;
    const totalNotEcOriginal = Math.max(0, realCall - ec);
    const totalAlasanTerisi = stockCukup + pemilikTidakAda + belumPernahJual + pernahJualSM + alasanLain;
    const remainingNotEc = Math.max(0, totalNotEcOriginal - totalAlasanTerisi);

    return {
      totalQty,
      totalRetail,
      qtyPfA,
      omsetPfA,
      qtyPfB,
      omsetPfB,
      qtyNbc,
      omsetNbc,
      totalSetoran,
      totalNotEc: remainingNotEc,
      totalNotEcOriginal,
      totalAlasanTerisi,
      remainingNotEc
    };
  }, [calculatedItems, realCall, ec, stockCukup, pemilikTidakAda, belumPernahJual, pernahJualSM, alasanLain]);

  const totalNotEcOriginal = Math.max(0, realCall - ec);
  const totalAlasanTerisi = stockCukup + pemilikTidakAda + belumPernahJual + pernahJualSM + alasanLain;
  const remainingNotEc = Math.max(0, totalNotEcOriginal - totalAlasanTerisi);

  // Auto-clamp reasons if total reasons exceed totalNotEcOriginal
  useEffect(() => {
    const maxBudget = Math.max(0, realCall - ec);
    const currentSum = stockCukup + pemilikTidakAda + belumPernahJual + pernahJualSM + alasanLain;
    if (currentSum > maxBudget) {
      let excess = currentSum - maxBudget;
      let newAlasanLain = alasanLain;
      let newPernahJualSM = pernahJualSM;
      let newBelumPernahJual = belumPernahJual;
      let newPemilikTidakAda = pemilikTidakAda;
      let newStockCukup = stockCukup;

      if (excess > 0 && newAlasanLain > 0) {
        const dec = Math.min(newAlasanLain, excess);
        newAlasanLain -= dec;
        excess -= dec;
      }
      if (excess > 0 && newPernahJualSM > 0) {
        const dec = Math.min(newPernahJualSM, excess);
        newPernahJualSM -= dec;
        excess -= dec;
      }
      if (excess > 0 && newBelumPernahJual > 0) {
        const dec = Math.min(newBelumPernahJual, excess);
        newBelumPernahJual -= dec;
        excess -= dec;
      }
      if (excess > 0 && newPemilikTidakAda > 0) {
        const dec = Math.min(newPemilikTidakAda, excess);
        newPemilikTidakAda -= dec;
        excess -= dec;
      }
      if (excess > 0 && newStockCukup > 0) {
        const dec = Math.min(newStockCukup, excess);
        newStockCukup -= dec;
        excess -= dec;
      }

      setAlasanLain(newAlasanLain);
      setPernahJualSM(newPernahJualSM);
      setBelumPernahJual(newBelumPernahJual);
      setPemilikTidakAda(newPemilikTidakAda);
      setStockCukup(newStockCukup);
    }
  }, [realCall, ec, stockCukup, pemilikTidakAda, belumPernahJual, pernahJualSM, alasanLain]);

  const handleUpdateReason = (
    field: 'stockCukup' | 'pemilikTidakAda' | 'belumPernahJual' | 'pernahJualSM' | 'alasanLain',
    valueOrDelta: number,
    isDelta: boolean
  ) => {
    const curValues = {
      stockCukup,
      pemilikTidakAda,
      belumPernahJual,
      pernahJualSM,
      alasanLain,
    };
    const currentVal = curValues[field];
    const sumOthers = (stockCukup + pemilikTidakAda + belumPernahJual + pernahJualSM + alasanLain) - currentVal;
    const maxAllowed = Math.max(0, totalNotEcOriginal - sumOthers);

    let nextVal = isDelta ? currentVal + valueOrDelta : valueOrDelta;
    if (nextVal < 0) nextVal = 0;
    if (nextVal > maxAllowed) nextVal = maxAllowed;

    if (field === 'stockCukup') setStockCukup(nextVal);
    else if (field === 'pemilikTidakAda') setPemilikTidakAda(nextVal);
    else if (field === 'belumPernahJual') setBelumPernahJual(nextVal);
    else if (field === 'pernahJualSM') setPernahJualSM(nextVal);
    else if (field === 'alasanLain') setAlasanLain(nextVal);
  };

  // UI state for report format - default to Daily Activity
  const [activeReportTab, setActiveReportTab] = useState<'daily' | 'itemized'>('daily');

  // Pangkalan Report Label
  const dynamicSubdistReportLabel = activeSubdistInfo.label;

  // Generate Daily Activity Report Text
  const dailyReportText = useMemo(() => {
    return generateDailyActivityReport({
      salesmanName,
      userDms,
      reportDate,
      wilayah: selectedWilayah,
      subdistName: dynamicSubdistReportLabel,
      realCall,
      ec,
      noo,
      items: calculatedItems.map(item => ({
        product: item.product,
        qty: item.qty
      })),
      stockCukup,
      pemilikTidakAda,
      belumPernahJual,
      pernahJualSM,
      alasanLain,
      totalBranding
    });
  }, [
    salesmanName,
    userDms,
    reportDate,
    selectedWilayah,
    dynamicSubdistReportLabel,
    realCall,
    ec,
    noo,
    calculatedItems,
    stockCukup,
    pemilikTidakAda,
    belumPernahJual,
    pernahJualSM,
    alasanLain,
    totalBranding
  ]);

  // Generate Itemized Sales Report Text
  const itemizedReportText = useMemo(() => {
    return generateDofShjReport({
      salesmanName,
      userDms,
      reportDate,
      wilayah: selectedWilayah,
      subdistName: dynamicSubdistReportLabel,
      realCall,
      ec,
      noo,
      items: calculatedItems.map(item => ({
        product: item.product,
        qty: item.qty
      }))
    });
  }, [
    salesmanName,
    userDms,
    reportDate,
    selectedWilayah,
    dynamicSubdistReportLabel,
    realCall,
    ec,
    noo,
    calculatedItems
  ]);

  const activeReportText = activeReportTab === 'daily' ? dailyReportText : itemizedReportText;

  // Copy to clipboard
  const handleCopyReport = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(activeReportText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = activeReportText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  // Download PDF
  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      generatePdfReport({
        salesmanName: `${salesmanName} (${userDms})`,
        storeName: activeReportTab === 'daily' ? 'REPORT DAILY ACTIVITY' : 'RINCIAN PENJUALAN HARIAN',
        reportDate: formatIndonesianFullDate(reportDate),
        wilayah: selectedWilayah,
        subdistName: dynamicSubdistReportLabel,
        notes: `Real Call: ${realCall} | EC: ${ec} | NOO: ${noo} | Setoran Omset: ${formatRupiah(summary.totalSetoran, true)}`,
        items: calculatedItems.map(item => ({
          product: item.product,
          qty: item.qty
        }))
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Header & Active Motoris Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex flex-col items-center justify-center text-white shadow-xs border border-emerald-700">
              <span className="text-xs font-black tracking-wider leading-none">KALBE</span>
              <span className="text-[8px] font-bold text-emerald-200 tracking-tighter mt-0.5">FARMA</span>
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Laporan Harian Penjualan
                </h1>
                <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border shadow-2xs ${
                  selectedWilayah === 'Cianjur' 
                    ? 'bg-blue-100 text-blue-800 border-blue-300' 
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  MOTORIS MMTW {selectedWilayah.toUpperCase()}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${activeSubdistInfo.badgeColor}`}>
                  Pangkalan: {activeSubdistInfo.label}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  selectedWilayah === 'Cianjur'
                    ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                  Salesman: {salesmanName}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kalkulasi <strong>Daily Activity Report</strong> &amp; <strong>Omset Setoran</strong> untuk Pangkalan {activeSubdistInfo.label} dan salesman {salesmanName}.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyReport}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                copied 
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : `📋 Salin ${activeReportTab === 'daily' ? 'Daily Report' : 'Rincian'} (WA)`}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Membuat...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={handleFillSample}
              className="flex items-center space-x-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
              title="Isi contoh lengkap sesuai format"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Isi Contoh</span>
            </button>

            <button
              onClick={handleResetAll}
              className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer"
              title="Reset semua isian"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Wilayah & Pangkalan / Motoris Selector Section */}
        <div className="pt-4 pb-2 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center space-x-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Wilayah Operasional:</span>
              </label>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleSelectWilayah('Cianjur')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer flex items-center space-x-1.5 ${
                    selectedWilayah === 'Cianjur'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>CIANJUR</span>
                  <span className="text-[10px] opacity-80">(4 Pangkalan)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectWilayah('Sukabumi')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer flex items-center space-x-1.5 ${
                    selectedWilayah === 'Sukabumi'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>SUKABUMI</span>
                  <span className="text-[10px] opacity-80">(4 Pangkalan)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Salesman Buttons */}
          {selectedWilayah === 'Cianjur' ? (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pilih Salesman / Pangkalan Cianjur:</span>
                </span>
                <span className="text-[10px] text-slate-400">DMS &amp; Pangkalan terintegrasi</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CIANJUR_MOTORIS.map((m) => {
                  const isSelected = salesmanName.toUpperCase() === m.name.toUpperCase();
                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => handleSelectCianjurSalesman(m)}
                      className={`p-3 rounded-xl text-left border transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {m.areaHint?.toUpperCase() || 'CIANJUR'}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="font-extrabold text-sm text-slate-900 mt-1.5">{m.name}</div>
                      <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
                        Pangkalan: <span className="text-blue-700">{m.areaHint}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate" title={m.dmsCode}>
                        {m.dmsCode}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pilih Salesman / Pangkalan Sukabumi:</span>
                </span>
                <span className="text-[10px] text-slate-400">DMS &amp; Pangkalan terintegrasi</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SUKABUMI_MOTORIS.map((m) => {
                  const isSelected = salesmanName.toUpperCase() === m.name.toUpperCase();
                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => handleSelectSukabumiSalesman(m)}
                      className={`p-3 rounded-xl text-left border transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {m.areaHint?.toUpperCase() || 'SUKABUMI'}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div className="font-extrabold text-sm text-slate-900 mt-1.5">{m.name}</div>
                      <div className="text-[11px] text-slate-600 font-semibold mt-0.5">
                        Pangkalan: <span className="text-emerald-700">{m.areaHint}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate" title={m.dmsCode}>
                        {m.dmsCode}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Custom Edit Inputs for Motoris & Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 mt-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Nama Salesman / Motoris
            </label>
            <input
              type="text"
              value={salesmanName}
              onChange={(e) => setSalesmanName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              User DMS
            </label>
            <input
              type="text"
              value={userDms}
              onChange={(e) => setUserDms(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-emerald-600" />
                <span>Tanggal Laporan</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setReportDate(today);
                }}
                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 transition cursor-pointer"
                title="Setel ke tanggal hari ini"
              >
                Hari Ini
              </button>
            </div>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            />
            <div className="text-[11px] text-slate-500 mt-1 truncate">
              {formatIndonesianFullDate(reportDate)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Kinerja Kunjungan Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Real Call */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
              <PhoneCall className="w-3 h-3 text-blue-500" />
              <span>1. Real Call</span>
            </span>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setRealCall(prev => Math.max(0, prev - 1))}
                className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <button 
                onClick={() => setRealCall(prev => prev + 1)}
                className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <input
              type="number"
              value={realCall}
              onChange={(e) => setRealCall(parseInt(e.target.value) || 0)}
              className="w-20 font-mono font-bold text-xl text-slate-900 bg-transparent focus:outline-none"
            />
            <span className="text-xs text-slate-400">Toko</span>
          </div>
        </div>

        {/* EC (Effective Call) */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1">
              <Target className="w-3 h-3 text-emerald-600" />
              <span>EC (Effective Call)</span>
            </span>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setEc(prev => Math.max(0, prev - 1))}
                className="w-5 h-5 rounded bg-emerald-100 hover:bg-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <button 
                onClick={() => setEc(prev => prev + 1)}
                className="w-5 h-5 rounded bg-emerald-100 hover:bg-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <input
              type="number"
              value={ec}
              onChange={(e) => setEc(parseInt(e.target.value) || 0)}
              className="w-20 font-mono font-bold text-xl text-emerald-700 bg-transparent focus:outline-none"
            />
            <span className="text-xs text-emerald-600">Toko Order</span>
          </div>
        </div>

        {/* NOO (New Open Outlet) */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center space-x-1">
              <Award className="w-3 h-3 text-blue-600" />
              <span>NOO (New Outlet)</span>
            </span>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setNoo(prev => Math.max(0, prev - 1))}
                className="w-5 h-5 rounded bg-blue-100 hover:bg-blue-200 text-xs font-bold text-blue-800 flex items-center justify-center cursor-pointer"
              >
                -
              </button>
              <button 
                onClick={() => setNoo(prev => prev + 1)}
                className="w-5 h-5 rounded bg-blue-100 hover:bg-blue-200 text-xs font-bold text-blue-800 flex items-center justify-center cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
          <div className="mt-1 flex items-baseline space-x-2">
            <input
              type="number"
              value={noo}
              onChange={(e) => setNoo(parseInt(e.target.value) || 0)}
              className="w-20 font-mono font-bold text-xl text-blue-700 bg-transparent focus:outline-none"
            />
            <span className="text-xs text-blue-600">Toko Baru</span>
          </div>
        </div>

        {/* Not EC */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1">
            <Store className="w-3 h-3 text-amber-600" />
            <span>Not EC (Toko Belum Order)</span>
          </span>
          <div className="mt-1 flex items-baseline space-x-2">
            <div className="font-mono font-bold text-xl text-amber-700">
              {totalNotEcOriginal}
            </div>
            <span className="text-xs text-amber-600">Toko (Real Call - EC)</span>
          </div>
        </div>
      </div>

      {/* 3. Sales & Omset Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Unit Qty */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>TOTAL QTY TERJUAL</span>
          </span>
          <div className="text-2xl font-extrabold text-slate-800 mt-2 font-mono">
            {summary.totalQty} <span className="text-sm font-normal text-slate-500">Unit</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total semua item produk yang berhasil terjual hari ini.
          </p>
        </div>

        {/* Produk Fokus (PF A & PF B) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>PENCAPAIAN PRODUK FOKUS (PF)</span>
          </span>
          <div className="text-xl font-bold text-slate-800 mt-2 font-mono">
            {formatRupiah(summary.omsetPfA + summary.omsetPfB, true)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            PF A: {summary.qtyPfA} unit ({formatRupiah(summary.omsetPfA, true)}) | PF B: {summary.qtyPfB} unit ({formatRupiah(summary.omsetPfB, true)})
          </p>
        </div>

        {/* Total Setoran Omset (Retail) */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>TOTAL OMSET SETORAN</span>
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded border border-emerald-500/30">
              Wajib Setor
            </span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-300 mt-2 font-mono truncate">
            {formatRupiah(summary.totalSetoran, true)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            PF: {formatRupiah(summary.omsetPfA + summary.omsetPfB, true)} | NBC: {formatRupiah(summary.omsetNbc, true)}
          </p>
        </div>
      </div>

      {/* 4. Section Produk Fokus (PF) & NBC Input Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Daftar Produk: Input Penjualan dan Omset Retail</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Isi Qty untuk menghitung otomatis Total Omset Setoran Penjualan ({activeSubdistInfo.label}).
            </p>
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300 text-[10px]">
              PF = Fokus
            </span>
            <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px]">
              NBC
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-bold">
                <th className="p-3 w-10 text-center">No</th>
                <th className="p-3">Kat</th>
                <th className="p-3">Nama Produk SKU</th>
                <th className="p-3 min-w-[140px] text-center">Qty (Unit)</th>
                <th className="p-3 text-right text-blue-700">Harga Retail</th>
                <th className="p-3 text-right">Subtotal Omset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {calculatedItems.map((item, index) => {
                const p = item.product;
                const isSelected = item.qty > 0;

                return (
                  <tr 
                    key={p.kode_produk}
                    className={`transition ${
                      isSelected ? 'bg-emerald-50/30' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="p-3 text-center text-slate-400 font-mono">
                      {index + 1}
                    </td>

                    {/* Category badge */}
                    <td className="p-3">
                      {item.isPfA ? (
                        <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-300">
                          PF A
                        </span>
                      ) : item.isPfB ? (
                        <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-300">
                          PF B
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 font-semibold text-[10px] px-2 py-0.5 rounded-full">
                          NBC
                        </span>
                      )}
                    </td>

                    {/* Product Name */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{p.nama_produk}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-2">
                        <span>SKU: {p.kode_produk}</span>
                        <span>•</span>
                        <span>Panggilan: <strong>{item.shortName}</strong></span>
                      </div>
                    </td>

                    {/* Qty Controls */}
                    <td className="p-3">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleStepQty(p.kode_produk, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold flex items-center justify-center transition cursor-pointer"
                          title="Kurangi 1"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        
                        <input
                          type="number"
                          min="0"
                          value={item.qty === 0 ? '' : item.qty}
                          onChange={(e) => handleQtyChange(p.kode_produk, parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className={`w-14 text-center font-mono font-bold text-sm py-1 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                            isSelected 
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900' 
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        />

                        <button
                          onClick={() => handleStepQty(p.kode_produk, 1)}
                          className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 active:scale-95 text-emerald-800 font-bold flex items-center justify-center transition cursor-pointer"
                          title="Tambah 1"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Quick Qty Preset Pills */}
                      <div className="flex items-center justify-center space-x-1 mt-1">
                        {[5, 10, 20].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => handleStepQty(p.kode_produk, preset)}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold cursor-pointer"
                          >
                            +{preset}
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Harga Retail */}
                    <td className="p-3 text-right font-mono font-bold text-blue-600">
                      {formatRupiah(p.harga_retail, true)}
                    </td>

                    {/* Omset Subtotal */}
                    <td className="p-3 text-right font-mono">
                      <div className="font-bold text-slate-900">
                        {formatRupiah(item.subRetail, true)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold">
                <td colSpan={3} className="p-3 text-right">
                  TOTAL KESELURUHAN:
                </td>
                <td className="p-3 text-center font-mono text-purple-300 text-sm">
                  {summary.totalQty} Unit
                </td>
                <td className="p-3 text-right font-mono text-blue-300">
                  -
                </td>
                <td className="p-3 text-right font-mono text-emerald-300 text-sm">
                  {formatRupiah(summary.totalSetoran, true)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 5. Section Evaluasi Kunjungan (Not EC Breakdown) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>5. Evaluasi Alasan Toko Belum Order</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rincian alasan toko Not EC (Real Call {realCall} - EC {ec} = {totalNotEcOriginal} Toko). Setiap alasan yang diisi mengurangi sisa Not EC.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center space-x-2 transition ${
              remainingNotEc === 0 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-amber-50 text-amber-900 border-amber-300'
            }`}>
              <span>Total Not EC Tersisa:</span>
              <span className={`font-mono text-base font-extrabold ${remainingNotEc === 0 ? 'text-emerald-700' : 'text-amber-800'}`}>
                {remainingNotEc}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                / {totalNotEcOriginal}
              </span>
            </div>
          </div>
        </div>

        {remainingNotEc === 0 ? (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-3.5 py-2.5 text-xs flex items-center justify-between">
            <span className="flex items-center space-x-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Total Not EC telah <strong>0</strong>. Semua alasan toko belum order sudah teralokasi penuh (tidak bisa menambahkan lagi).</span>
            </span>
          </div>
        ) : (
          <div className="mt-3 bg-amber-50/70 border border-amber-200 text-amber-900 rounded-xl px-3.5 py-2 text-xs flex items-center justify-between">
            <span>
              Tersisa <strong>{remainingNotEc}</strong> toko Not EC yang belum dialokasikan ke alasan di bawah.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
          {/* Stock Cukup */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[10px] font-bold uppercase text-slate-500">Stock Cukup</div>
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={() => handleUpdateReason('stockCukup', -1, true)}
                disabled={stockCukup <= 0}
                className="w-7 h-7 rounded bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition flex items-center justify-center cursor-pointer shadow-2xs"
                title="Kurangi 1"
              >
                -
              </button>
              <input
                type="number"
                min={0}
                max={stockCukup + remainingNotEc}
                value={stockCukup}
                onChange={(e) => handleUpdateReason('stockCukup', parseInt(e.target.value) || 0, false)}
                className="w-12 text-center font-mono font-bold text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
              />
              <button
                type="button"
                onClick={() => handleUpdateReason('stockCukup', 1, true)}
                disabled={remainingNotEc <= 0}
                className="w-7 h-7 rounded bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition flex items-center justify-center cursor-pointer shadow-2xs"
                title={remainingNotEc <= 0 ? 'Total Not EC sudah 0 (tidak bisa menambahkan lagi)' : 'Tambah 1'}
              >
                +
              </button>
            </div>
          </div>

          {/* Pemilik Tidak Ada */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[10px] font-bold uppercase text-slate-500">Pemilik Tidak Ada</div>
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={() => handleUpdateReason('pemilikTidakAda', -1, true)}
                disabled={pemilikTidakAda <= 0}
                className="w-7 h-7 rounded bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition flex items-center justify-center cursor-pointer shadow-2xs"
                title="Kurangi 1"
              >
                -
              </button>
              <input
                type="number"
                min={0}
                max={pemilikTidakAda + remainingNotEc}
                value={pemilikTidakAda}
                onChange={(e) => handleUpdateReason('pemilikTidakAda', parseInt(e.target.value) || 0, false)}
                className="w-12 text-center font-mono font-bold text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
              />
              <button
                type="button"
                onClick={() => handleUpdateReason('pemilikTidakAda', 1, true)}
                disabled={remainingNotEc <= 0}
                className="w-7 h-7 rounded bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition flex items-center justify-center cursor-pointer shadow-2xs"
                title={remainingNotEc <= 0 ? 'Total Not EC sudah 0 (tidak bisa menambahkan lagi)' : 'Tambah 1'}
              >
                +
              </button>
            </div>
          </div>

          {/* Belum Pernah Jual */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[10px] font-bold uppercase text-slate-500">Belum Pernah Jual</div>
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={() => handleUpdateReason('belumPernahJual', -1, true)}
                disabled={belumPernahJual <= 0}
                className="w-7 h-7 rounded bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition flex items-center justify-center cursor-pointer shadow-2xs"
                title="Kurangi 1"
              >
                -
              </button>
              <input
                type="number"
                min={0}
                max={belumPernahJual + remainingNotEc}
                value={belumPernahJual}
                onChange={(e) => handleUpdateReason('belumPernahJual', parseInt(e.target.value) || 0, false)}
                className="w-12 text-center font-mono font-bold text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
              />
              <button
                type="button"
                onClick={() => handleUpdateReason('belumPernahJual', 1, true)}
                disabled={remainingNotEc <= 0}
                className="w-7 h-7 rounded bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition flex items-center justify-center cursor-pointer shadow-2xs"
                title={remainingNotEc <= 0 ? 'Total Not EC sudah 0 (tidak bisa menambahkan lagi)' : 'Tambah 1'}
              >
                +
              </button>
            </div>
          </div>

          {/* Pernah Jual tapi SM */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[10px] font-bold uppercase text-slate-500">Slow Moving (SM)</div>
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={() => handleUpdateReason('pernahJualSM', -1, true)}
                disabled={pernahJualSM <= 0}
                className="w-7 h-7 rounded bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition flex items-center justify-center cursor-pointer shadow-2xs"
                title="Kurangi 1"
              >
                -
              </button>
              <input
                type="number"
                min={0}
                max={pernahJualSM + remainingNotEc}
                value={pernahJualSM}
                onChange={(e) => handleUpdateReason('pernahJualSM', parseInt(e.target.value) || 0, false)}
                className="w-12 text-center font-mono font-bold text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
              />
              <button
                type="button"
                onClick={() => handleUpdateReason('pernahJualSM', 1, true)}
                disabled={remainingNotEc <= 0}
                className="w-7 h-7 rounded bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition flex items-center justify-center cursor-pointer shadow-2xs"
                title={remainingNotEc <= 0 ? 'Total Not EC sudah 0 (tidak bisa menambahkan lagi)' : 'Tambah 1'}
              >
                +
              </button>
            </div>
          </div>

          {/* Alasan Lain */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[10px] font-bold uppercase text-slate-500">Alasan Lain</div>
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={() => handleUpdateReason('alasanLain', -1, true)}
                disabled={alasanLain <= 0}
                className="w-7 h-7 rounded bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition flex items-center justify-center cursor-pointer shadow-2xs"
                title="Kurangi 1"
              >
                -
              </button>
              <input
                type="number"
                min={0}
                max={alasanLain + remainingNotEc}
                value={alasanLain}
                onChange={(e) => handleUpdateReason('alasanLain', parseInt(e.target.value) || 0, false)}
                className="w-12 text-center font-mono font-bold text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded"
              />
              <button
                type="button"
                onClick={() => handleUpdateReason('alasanLain', 1, true)}
                disabled={remainingNotEc <= 0}
                className="w-7 h-7 rounded bg-white border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 transition flex items-center justify-center cursor-pointer shadow-2xs"
                title={remainingNotEc <= 0 ? 'Total Not EC sudah 0 (tidak bisa menambahkan lagi)' : 'Tambah 1'}
              >
                +
              </button>
            </div>
          </div>

          {/* Total Branding */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-emerald-800">
              <span>Total Branding</span>
              <span className="bg-emerald-200/80 text-emerald-950 px-1.5 py-0.5 rounded text-[10px] font-extrabold border border-emerald-300">
                / 10
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={() => setTotalBranding(prev => Math.max(0, prev - 1))}
                disabled={totalBranding <= 0}
                className="w-7 h-7 rounded bg-emerald-100 text-xs font-bold text-emerald-800 hover:bg-emerald-200 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-2xs"
                title="Kurangi 1"
              >
                -
              </button>
              <div className="flex items-center space-x-1 font-mono font-bold text-emerald-900">
                <input
                  type="number"
                  min={0}
                  value={totalBranding}
                  onChange={(e) => setTotalBranding(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-10 text-center font-mono font-bold text-sm bg-transparent text-emerald-900 focus:outline-none"
                />
                <span className="text-emerald-700 text-xs font-extrabold">/10</span>
              </div>
              <button
                type="button"
                onClick={() => setTotalBranding(prev => prev + 1)}
                className="w-7 h-7 rounded bg-emerald-100 text-xs font-bold text-emerald-800 hover:bg-emerald-200 transition flex items-center justify-center cursor-pointer shadow-2xs"
                title="Tambah 1 (bisa melebihi target 10)"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Live WhatsApp Preview */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              <MessageSquare className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Live Preview: Generator Pesan WhatsApp
              </h3>
              <p className="text-[11px] text-slate-400">
                Pilih format yang ingin disalin langsung ke grup WhatsApp.
              </p>
            </div>
          </div>

          {/* Format Selector Tabs */}
          <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveReportTab('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeReportTab === 'daily'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Report Daily Activity
            </button>
            <button
              onClick={() => setActiveReportTab('itemized')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeReportTab === 'itemized'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Rincian Penjualan Item
            </button>
          </div>

          <button
            onClick={handleCopyReport}
            className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'BERHASIL TERSALIN!' : `📋 SALIN FORMAT ${activeReportTab === 'daily' ? 'DAILY' : 'RINCIAN'} KE WA`}</span>
          </button>
        </div>

        {/* Monospace WhatsApp Chat Bubble Preview */}
        <div className="mt-3 bg-slate-950/90 rounded-xl p-4 border border-slate-800/80 overflow-x-auto">
          <pre className="font-mono text-xs sm:text-sm text-emerald-400 whitespace-pre leading-relaxed select-all">
            {activeReportText}
          </pre>
        </div>
      </div>
    </div>
  );
}
