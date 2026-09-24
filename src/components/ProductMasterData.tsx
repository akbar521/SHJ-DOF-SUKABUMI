import { useState, FormEvent } from 'react';
import { Product } from '../types';
import { formatRupiah, formatDecimal } from '../utils/mathUtils';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  RotateCcw, 
  Search, 
  Sparkles,
  Layers
} from 'lucide-react';

interface ProductMasterDataProps {
  products: Product[];
  onAddProduct: (product: Partial<Product>) => Promise<void>;
  onUpdateProduct: (kode: string, product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (kode: string) => Promise<void>;
  onResetDatabase: () => Promise<void>;
}

export function ProductMasterData({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetDatabase
}: ProductMasterDataProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingKode, setEditingKode] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Form states
  const [formKode, setFormKode] = useState<string>('');
  const [formNama, setFormNama] = useState<string>('');
  const [formRetail, setFormRetail] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const filteredProducts = products.filter(p => 
    p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.kode_produk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEdit = (product: Product) => {
    setEditingKode(product.kode_produk);
    setIsAdding(false);
    setFormKode(product.kode_produk);
    setFormNama(product.nama_produk);
    setFormRetail(product.harga_retail.toString());
  };

  const cancelForm = () => {
    setEditingKode(null);
    setIsAdding(false);
    setFormKode('');
    setFormNama('');
    setFormRetail('');
  };

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formRetail) {
      alert('Nama produk dan harga retail wajib diisi');
      return;
    }

    setIsSaving(true);
    try {
      const retail = parseFloat(formRetail);

      if (isAdding) {
        if (!formKode.trim()) {
          alert('Kode produk wajib diisi');
          return;
        }
        await onAddProduct({
          kode_produk: formKode.trim().toUpperCase(),
          nama_produk: formNama.trim(),
          harga_grosir: 0,
          harga_retail: retail,
          persentase_dof: 0.00
        });
      } else if (editingKode) {
        await onUpdateProduct(editingKode, {
          nama_produk: formNama.trim(),
          harga_retail: retail
        });
      }
      cancelForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan produk';
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (kode: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${nama}" (${kode})?`)) {
      try {
        await onDeleteProduct(kode);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Gagal menghapus produk';
        alert(message);
      }
    }
  };

  const handleReset = async () => {
    if (confirm('Reset semua master data dan antrian order ke data awal?')) {
      setIsResetting(true);
      await onResetDatabase();
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Master Data Produk</span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mt-0.5">
            Manajemen Produk &amp; Harga
          </h2>
          <p className="text-xs text-slate-500">
            Kelola kode produk, harga grosir, dan harga retail.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 transition"
            title="Reset ke Seed Data Awal"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Seed Awal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              cancelForm();
              setIsAdding(true);
            }}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingKode) && (
        <form onSubmit={handleSaveProduct} className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isAdding ? 'Tambah Produk Master Baru' : `Edit Produk: ${editingKode}`}</span>
            </h3>
            <button
              type="button"
              onClick={cancelForm}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Kode Produk (PK)</label>
              <input
                type="text"
                disabled={!isAdding}
                value={formKode}
                onChange={(e) => setFormKode(e.target.value.toUpperCase())}
                placeholder="Contoh: PEGBX"
                className={`w-full px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-800 border ${
                  isAdding ? 'border-slate-700 text-white focus:border-blue-500' : 'border-slate-800 text-slate-400 cursor-not-allowed'
                }`}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Nama Produk Lengkap</label>
              <input
                type="text"
                value={formNama}
                onChange={(e) => setFormNama(e.target.value)}
                placeholder="Nama produk dan kemasan..."
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Harga Jual Retail (Rp)</label>
              <input
                type="number"
                step="0.01"
                value={formRetail}
                onChange={(e) => setFormRetail(e.target.value)}
                placeholder="6559.00"
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-slate-800 border border-slate-700 text-white font-mono focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={cancelForm}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Produk'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode atau nama produk di katalog..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total: <strong className="text-slate-900">{filteredProducts.length} SKU</strong>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-3">Kode SKU</th>
                <th className="p-3">Nama Produk</th>
                <th className="p-3 text-right">Harga Retail</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p, idx) => {
                const isEven = idx % 2 === 0;

                return (
                  <tr key={p.kode_produk} className={isEven ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/40 hover:bg-slate-50'}>
                    <td className="p-3 font-mono font-bold text-slate-800">{p.kode_produk}</td>
                    <td className="p-3 font-semibold text-slate-900">{p.nama_produk}</td>
                    <td className="p-3 text-right font-mono font-bold text-blue-600">
                      {formatRupiah(p.harga_retail, true)}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Produk & Harga"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.kode_produk, p.nama_produk)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
