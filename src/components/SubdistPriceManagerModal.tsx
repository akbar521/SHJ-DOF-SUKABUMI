import React, { useState } from 'react';
import { Product, SubdistKey, ProductSubdistPrice } from '../types';
import { SUBDIST_LIST, resolveSubdistPrice } from '../data/subdistConfig';
import { formatRupiah } from '../utils/mathUtils';
import { X, Check, RotateCcw, Building2, TrendingDown, DollarSign } from 'lucide-react';

interface SubdistPriceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  activeSubdist: SubdistKey;
  customOverrides: Record<string, Record<string, ProductSubdistPrice>>;
  onSavePrice: (subdistKey: SubdistKey, kodeProduk: string, newGrosir: number, newRetail?: number) => void;
  onResetPrices: (subdistKey?: SubdistKey) => void;
}

export const SubdistPriceManagerModal: React.FC<SubdistPriceManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  activeSubdist,
  customOverrides,
  onSavePrice,
  onResetPrices
}) => {
  const [editingSubdist, setEditingSubdist] = useState<SubdistKey>(
    activeSubdist === 'SIRAWING' ? 'SIRAWING' : 'PANJUNAN_CIANJUR'
  );

  // Local draft state for quick editing
  const [draftPrices, setDraftPrices] = useState<Record<string, { grosir: string; retail: string }>>({});
  const [hasChanges, setHasChanges] = useState(false);

  if (!isOpen) return null;

  // Filter 20 products for Cianjur
  const cianjurProducts = products.filter(
    p => !p.wilayah || p.wilayah.includes('Cianjur')
  );

  const handlePriceChange = (kode: string, field: 'grosir' | 'retail', val: string) => {
    setDraftPrices(prev => ({
      ...prev,
      [kode]: {
        ...prev[kode],
        [field]: val
      }
    }));
    setHasChanges(true);
  };

  const handleSaveAll = () => {
    Object.entries(draftPrices).forEach(([kode, vals]: [string, { grosir: string; retail: string }]) => {
      const g = parseFloat(vals.grosir);
      const r = parseFloat(vals.retail);
      if (!isNaN(g)) {
        onSavePrice(editingSubdist, kode, g, !isNaN(r) ? r : undefined);
      }
    });
    setDraftPrices({});
    setHasChanges(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Pengaturan Harga Grosir Subdist Cianjur
              </h2>
              <p className="text-xs text-slate-500">
                Sesuaikan harga grosir pengambilan barang antara <strong>PANJUNAN CIANJUR</strong> dan <strong>SIRAWING</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subdist Tab Selector */}
        <div className="px-5 pt-4 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setEditingSubdist('PANJUNAN_CIANJUR');
                setDraftPrices({});
                setHasChanges(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                editingSubdist === 'PANJUNAN_CIANJUR'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>PANJUNAN CIANJUR</span>
            </button>
            <button
              onClick={() => {
                setEditingSubdist('SIRAWING');
                setDraftPrices({});
                setHasChanges(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                editingSubdist === 'SIRAWING'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>SIRAWING</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => {
                if (window.confirm(`Kembalikan harga ${editingSubdist} ke standar awal pabrik?`)) {
                  onResetPrices(editingSubdist);
                  setDraftPrices({});
                  setHasChanges(false);
                }
              }}
              className="text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 transition flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset Standar</span>
            </button>
            {hasChanges && (
              <button
                onClick={handleSaveAll}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1 rounded-lg transition flex items-center space-x-1 shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            )}
          </div>
        </div>

        {/* Comparison & Edit Table */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="py-2.5 px-3 w-12 text-center">No</th>
                  <th className="py-2.5 px-3">SKU &amp; Nama Produk</th>
                  <th className="py-2.5 px-3 text-right bg-blue-50/50">Grosir Panjunan</th>
                  <th className="py-2.5 px-3 text-right bg-amber-50/50">Grosir Sirawing</th>
                  <th className="py-2.5 px-3 text-right">Selisih</th>
                  <th className="py-2.5 px-3 text-right">Harga Retail</th>
                  <th className="py-2.5 px-3 text-center">DoF %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cianjurProducts.map((p, idx) => {
                  const panjunanPrice = resolveSubdistPrice(p, 'PANJUNAN_CIANJUR', customOverrides);
                  const sirawingPrice = resolveSubdistPrice(p, 'SIRAWING', customOverrides);
                  const diff = sirawingPrice.harga_grosir - panjunanPrice.harga_grosir;

                  const isCurrentPanjunan = editingSubdist === 'PANJUNAN_CIANJUR';
                  const activePrice = isCurrentPanjunan ? panjunanPrice : sirawingPrice;

                  const currentDraftGrosir = draftPrices[p.kode_produk]?.grosir !== undefined
                    ? draftPrices[p.kode_produk].grosir
                    : activePrice.harga_grosir.toString();

                  return (
                    <tr key={p.kode_produk} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{p.nama_produk}</div>
                        <div className="text-[10px] font-mono text-emerald-700 font-semibold">{p.kode_produk}</div>
                      </td>
                      <td className={`py-2 px-3 text-right ${isCurrentPanjunan ? 'bg-blue-50/70 font-bold' : ''}`}>
                        {isCurrentPanjunan ? (
                          <div className="inline-flex items-center space-x-1">
                            <span className="text-[10px] text-slate-400">Rp</span>
                            <input
                              type="number"
                              step="any"
                              value={currentDraftGrosir}
                              onChange={(e) => handlePriceChange(p.kode_produk, 'grosir', e.target.value)}
                              className="w-24 bg-white border border-blue-400 rounded px-1.5 py-0.5 text-right font-mono font-bold text-slate-900 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                        ) : (
                          <span className="font-mono">{formatRupiah(panjunanPrice.harga_grosir, true)}</span>
                        )}
                      </td>
                      <td className={`py-2 px-3 text-right ${!isCurrentPanjunan ? 'bg-amber-50/70 font-bold' : ''}`}>
                        {!isCurrentPanjunan ? (
                          <div className="inline-flex items-center space-x-1">
                            <span className="text-[10px] text-slate-400">Rp</span>
                            <input
                              type="number"
                              step="any"
                              value={currentDraftGrosir}
                              onChange={(e) => handlePriceChange(p.kode_produk, 'grosir', e.target.value)}
                              className="w-24 bg-white border border-amber-400 rounded px-1.5 py-0.5 text-right font-mono font-bold text-slate-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            />
                          </div>
                        ) : (
                          <span className="font-mono">{formatRupiah(sirawingPrice.harga_grosir, true)}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[11px]">
                        {diff === 0 ? (
                          <span className="text-slate-400">Sama</span>
                        ) : diff > 0 ? (
                          <span className="text-amber-700 font-bold">+{formatRupiah(diff, true)}</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">{formatRupiah(diff, true)}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {formatRupiah(activePrice.harga_retail, true)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          activePrice.persentase_dof > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {(activePrice.persentase_dof * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            * Perubahan harga disimpan secara aman dan otomatis diterapkan pada kalkulasi DOF &amp; SHJ saat subdist dipilih.
          </p>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <button
                onClick={handleSaveAll}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
              >
                Simpan &amp; Terapkan
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
