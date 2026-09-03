import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = React.useState(false);
  const wasOffline = React.useRef(false);

  React.useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
    } else if (wasOffline.current) {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (showReconnected && isOnline) {
    return (
      <div 
        id="reconnected-banner"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 flex items-center justify-between sm:justify-start gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-fade-in border border-emerald-400/40"
      >
        <span className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-emerald-200" />
          <span>Koneksi Kembali Online</span>
        </span>
      </div>
    );
  }

  if (isOnline) return null;

  return (
    <div 
      id="offline-banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-50 flex items-center justify-between sm:justify-start gap-3 rounded-xl bg-slate-900/95 backdrop-blur-md px-4 py-3 text-xs font-semibold text-white shadow-2xl border border-amber-500/40"
    >
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
        <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
        <div>
          <span className="font-bold text-amber-300">Mode Offline Aktif</span>
          <p className="text-[11px] text-slate-300 font-normal">Kalkulator, cetak PDF & susun laporan tetap berfungsi lancar tanpa sinyal/internet.</p>
        </div>
      </div>
    </div>
  );
};
