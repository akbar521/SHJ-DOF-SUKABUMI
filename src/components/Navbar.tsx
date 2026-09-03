import { User } from '../types';
import { 
  Calculator,
  Smartphone, 
  Warehouse, 
  Layers, 
  Code2, 
  Database, 
  UserCheck, 
  Boxes
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export type ActiveTab = 'calculator' | 'master_data' | 'flutter_dart' | 'sql_api';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export function Navbar({
  activeTab,
  setActiveTab,
}: NavbarProps) {
  return (
    <header className="bg-[#0F172A] border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and System Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 px-2.5 py-1.5 rounded-lg shadow-xs flex items-center justify-center border border-emerald-500/50">
              <span className="text-white font-black tracking-wider text-xs">KALBE</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                  LAPORAN HARIAN
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  DOF & SHJ
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 font-semibold tracking-wide">
                MOTORIS MMTW SUKABUMI (PANJUNAN)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <PWAInstallButton variant="navbar" />
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none border-t border-slate-800/80 pt-1">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-t-lg text-xs font-bold transition whitespace-nowrap border-b-2 ${
              activeTab === 'calculator'
                ? 'bg-slate-800/90 text-emerald-400 border-emerald-500 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Sukabumi (Panjunan)</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.2 rounded font-bold border border-emerald-500/30">
              Utama
            </span>
          </button>

          <button
            onClick={() => setActiveTab('master_data')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-t-lg text-xs font-bold transition whitespace-nowrap border-b-2 ${
              activeTab === 'master_data'
                ? 'bg-slate-800/90 text-indigo-400 border-indigo-500 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Master Data & SHJ Monitor</span>
          </button>

          <button
            onClick={() => setActiveTab('flutter_dart')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-t-lg text-xs font-bold transition whitespace-nowrap border-b-2 ${
              activeTab === 'flutter_dart'
                ? 'bg-slate-800/90 text-cyan-400 border-cyan-500 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Flutter Dart Code</span>
          </button>

          <button
            onClick={() => setActiveTab('sql_api')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-t-lg text-xs font-bold transition whitespace-nowrap border-b-2 ${
              activeTab === 'sql_api'
                ? 'bg-slate-800/90 text-emerald-400 border-emerald-500 shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>SQL Schema & REST API</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
