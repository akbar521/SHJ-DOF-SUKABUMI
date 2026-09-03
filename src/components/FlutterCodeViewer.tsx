import { useState } from 'react';
import { FLUTTER_DART_CODE } from '../data/flutterCode';
import { Copy, Check, Download, Code2, Smartphone, Sparkles, Layers, Box } from 'lucide-react';

export function FlutterCodeViewer() {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(FLUTTER_DART_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([FLUTTER_DART_CODE], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'salesman_cart_screen.dart';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Smartphone className="w-4 h-4" />
            <span>Mobile App Architecture Deliverable (Flutter)</span>
          </div>
          <h2 className="text-lg font-black text-white mt-1">
            Flutter Dart: Salesman Cart & Checkout Screen
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Production-ready Dart code with Card-based product catalog, Tier toggle, direct warehouse submit, and local PDF & Text summary generators.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin Kode Dart'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh .dart File</span>
          </button>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 mb-1">
            <Box className="w-4 h-4" />
            <span>Card-Based UI (Not Tables)</span>
          </div>
          <p className="text-xs text-slate-600">
            Katalog produk dirender dengan widget Card elegan, stepper tombol (+/-), badge DoF, dan selector tier harga (Grosir/Retail).
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Direct Submit (No Approval)</span>
          </div>
          <p className="text-xs text-slate-600">
            Order dikirim langsung via REST API ke antrian gudang tanpa fase approval manajerial untuk menjamin throughput logistik instan.
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-700 mb-1">
            <Layers className="w-4 h-4" />
            <span>Local PDF & WhatsApp Sharing</span>
          </div>
          <p className="text-xs text-slate-600">
            Menggunakan package <code>pdf</code> & <code>printing</code> untuk render Surat Jalan/Invoice A4 dan <code>share_plus</code> untuk ringkasan teks.
          </p>
        </div>
      </div>

      {/* Code Editor Preview */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="font-mono text-xs text-slate-400 ml-2">lib/screens/salesman_cart_screen.dart</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 font-semibold">Flutter 3.x / Dart 3</span>
        </div>

        <div className="p-4 max-h-[560px] overflow-y-auto font-mono text-xs text-slate-200 leading-relaxed bg-slate-950 selection:bg-blue-600 selection:text-white">
          <pre className="whitespace-pre">
            <code>{FLUTTER_DART_CODE}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
