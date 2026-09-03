import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, Share2, PlusSquare, X, CheckCircle2, WifiOff } from 'lucide-react';

export const PWAInstallButton: React.FC<{ variant?: 'navbar' | 'banner' | 'card' }> = ({ variant = 'navbar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed in standalone PWA mode, hide
  if (isInstalled) {
    return null;
  }

  if (variant === 'banner') {
    if (dismissed) return null;

    return (
      <>
        <div 
          id="pwa-mobile-banner"
          className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white px-3.5 py-2.5 shadow-md border-b border-emerald-600/40"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4 text-emerald-200" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight truncate">
                  Pasang di HP (Bisa Dibuka Offline)
                </p>
                <p className="text-[11px] text-emerald-200 leading-tight truncate">
                  Akses langsung dari layar utama HP layaknya aplikasi tanpa kuota
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                id="btn-install-banner"
                onClick={async () => {
                  if (isInstallable) {
                    await install();
                  } else {
                    setShowGuide(true);
                  }
                }}
                className="bg-white text-emerald-900 hover:bg-emerald-50 active:scale-95 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pasang di HP</span>
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="p-1 text-emerald-300 hover:text-white rounded transition cursor-pointer"
                title="Tutup banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {showGuide && (
          <PWAInstallModal isIOS={isIOS} onClose={() => setShowGuide(false)} />
        )}
      </>
    );
  }

  // Variant navbar
  return (
    <>
      <button
        type="button"
        id="btn-pwa-install-nav"
        onClick={async () => {
          if (isInstallable) {
            await install();
          } else {
            setShowGuide(true);
          }
        }}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-900/40 hover:bg-emerald-800/50 hover:text-white border border-emerald-500/30 transition cursor-pointer active:scale-95"
        title="Pasang aplikasi di layar utama HP atau Komputer"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
        <span className="hidden xs:inline">Pasang di HP</span>
        <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1 py-0.2 rounded font-bold border border-emerald-400/30">
          PWA
        </span>
      </button>

      {showGuide && (
        <PWAInstallModal isIOS={isIOS} onClose={() => setShowGuide(false)} />
      )}
    </>
  );
};

const PWAInstallModal: React.FC<{ isIOS: boolean; onClose: () => void }> = ({ isIOS, onClose }) => {
  return (
    <div 
      id="pwa-install-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pasang di Layar Utama HP
              </h3>
              <p className="text-xs text-slate-500">Motoris MMTW Sukabumi (Kalbe)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200/60 flex items-start space-x-2.5 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Keunggulan Dipasang di HP:</span>
              <ul className="mt-1 space-y-1 text-[11px] text-emerald-800 list-disc list-inside">
                <li>Bisa dibuka langsung dari icon di layar HP (Home Screen)</li>
                <li><strong>100% Offline</strong>: kalkulator & buat laporan tanpa butuh kuota/sinyal</li>
                <li>Tampilan layar penuh (Full Screen) tanpa bilah browser</li>
              </ul>
            </div>
          </div>

          {isIOS ? (
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2.5 text-xs text-slate-700">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>Panduan untuk iPhone / iPad (Safari):</span>
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                  <span>Tekan tombol <strong>Bagikan / Share</strong> (<Share2 className="w-3.5 h-3.5 inline text-blue-600 mx-0.5" />) di bilah bawah browser Safari.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                  <span>Gulir ke bawah dan ketuk <strong>Tambahkan ke Layar Utama</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-slate-700 mx-0.5" />).</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                  <span>Tekan tombol <strong>Tambah</strong> di pojok kanan atas. Selesai!</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2.5 text-xs text-slate-700">
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>Panduan untuk HP Android (Google Chrome):</span>
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                  <span>Ketuk ikon menu <strong>titik tiga (⋮)</strong> di sudut kanan atas browser Chrome.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                  <span>Pilih <strong>Install aplikasi</strong> atau <strong>Tambahkan ke Layar Utama</strong>.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                  <span>Ketuk <strong>Install</strong>. Icon aplikasi akan langsung muncul di menu HP Anda!</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer shadow-md"
        >
          Tutup & Kembali
        </button>
      </div>
    </div>
  );
};
