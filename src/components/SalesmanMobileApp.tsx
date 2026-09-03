import { useState, useMemo } from 'react';
import { Product, PriceCategory, CartItem, DofHeader, User } from '../types';
import { calculateDofFee, formatRupiah, formatDecimal, formatPercentage } from '../utils/mathUtils';
import { generateDofPdf, generateTextSummary } from '../utils/pdfGenerator';
import { 
  Store, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Send, 
  FileText, 
  Share2, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Layers, 
  Search, 
  Smartphone, 
  Maximize2, 
  Minimize2,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SalesmanMobileAppProps {
  products: Product[];
  currentUser: User;
  onOrderCreated: (order: DofHeader) => void;
  isSimulatedDevice?: boolean;
}

export function SalesmanMobileApp({
  products,
  currentUser,
  onOrderCreated,
  isSimulatedDevice = false
}: SalesmanMobileAppProps) {
  const [selectedTier, setSelectedTier] = useState<PriceCategory>('Grosir');
  const [selectedStore, setSelectedStore] = useState<string>('Toko Sejahtera Bersama');
  const [customStore, setCustomStore] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'DOF_ACTIVE' | 'DOF_FREE'>('ALL');
  
  // Cart state: map of kode_produk -> qty
  const [cartQuantities, setCartQuantities] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<DofHeader | null>(null);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(isSimulatedDevice);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const storeOptions = [
    'Toko Sejahtera Bersama',
    'Apotek Farma Sehat',
    'Toko Sumber Berkah',
    'Minimarket Maju Jaya',
    'Koperasi Berkah Abadi',
    '+ Tambah Toko Baru...'
  ];

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.nama_produk.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.kode_produk.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
      if (categoryFilter === 'DOF_ACTIVE') return p.persentase_dof > 0;
      if (categoryFilter === 'DOF_FREE') return p.persentase_dof === 0;
      return true;
    });
  }, [products, searchQuery, categoryFilter]);

  // Cart list
  const cartItems: CartItem[] = useMemo(() => {
    return Object.entries(cartQuantities)
      .filter(([_, qty]) => Number(qty) > 0)
      .map(([kode, qty]) => {
        const product = products.find(p => p.kode_produk === kode);
        return product ? { product, qty: Number(qty) } : null;
      })
      .filter((item): item is CartItem => item !== null);
  }, [cartQuantities, products]);

  // Calculated totals with precise math
  const { grandTotal, totalDofFee, totalItemCount } = useMemo(() => {
    let gTotal = 0;
    let dofFeeTotal = 0;
    let count = 0;

    cartItems.forEach(item => {
      const unitPrice = selectedTier === 'Grosir' ? item.product.harga_grosir : item.product.harga_retail;
      const dofFeeUnit = calculateDofFee(item.product.harga_grosir, item.product.persentase_dof);
      gTotal += unitPrice * item.qty;
      dofFeeTotal += dofFeeUnit * item.qty;
      count += item.qty;
    });

    return {
      grandTotal: Math.round(gTotal * 100) / 100,
      totalDofFee: Math.round(dofFeeTotal * 100) / 100,
      totalItemCount: count
    };
  }, [cartItems, selectedTier]);

  const updateQty = (kode_produk: string, delta: number) => {
    setCartQuantities(prev => {
      const current = prev[kode_produk] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const clone = { ...prev };
        delete clone[kode_produk];
        return clone;
      }
      return { ...prev, [kode_produk]: next };
    });
  };

  const setDirectQty = (kode_produk: string, val: number) => {
    const next = Math.max(0, isNaN(val) ? 0 : val);
    setCartQuantities(prev => {
      if (next === 0) {
        const clone = { ...prev };
        delete clone[kode_produk];
        return clone;
      }
      return { ...prev, [kode_produk]: next };
    });
  };

  const getEffectiveStoreName = () => {
    if (selectedStore === '+ Tambah Toko Baru...') {
      return customStore.trim() || 'Toko Pelanggan Baru';
    }
    return selectedStore;
  };

  // Submit Order (Bypass Approval -> Directly into Warehouse Queue)
  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);

    try {
      const payload = {
        id_user: currentUser.id_user,
        nama_toko: getEffectiveStoreName(),
        kategori_harga: selectedTier,
        catatan: notes.trim(),
        items: cartItems.map(item => ({
          kode_produk: item.product.kode_produk,
          qty: item.qty
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal mengirim order');

      const created: DofHeader = json.data;
      setCreatedOrder(created);
      onOrderCreated(created);

      // Trigger Celebration Confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengirim order';
      alert(`Error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySummary = (order: DofHeader) => {
    const text = generateTextSummary(order);
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleResetForm = () => {
    setCartQuantities({});
    setNotes('');
    setCreatedOrder(null);
  };

  return (
    <div className={`mx-auto transition-all duration-300 ${isPhoneFrame ? 'max-w-md py-2' : 'max-w-4xl py-1'}`}>
      {/* Top Frame Control Bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Mobile Sales Interface
        </h2>
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 hidden sm:inline text-[11px]">Sales: <strong className="text-slate-700">{currentUser.nama_lengkap}</strong></span>
          <button 
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium shadow-xs transition"
            title={isPhoneFrame ? "Tampilan Lebar" : "Tampilan Smartphone"}
          >
            {isPhoneFrame ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{isPhoneFrame ? 'Expand' : 'Phone Mode'}</span>
          </button>
        </div>
      </div>

      {/* Main Mobile App Canvas */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[640px]">
        {/* Top Store & Tier Header */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Store / Outlet Name</p>
            <p className="text-sm font-semibold text-slate-800">{getEffectiveStoreName()}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs ${
              selectedTier === 'Grosir' ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white'
            }`}>
              {selectedTier === 'Grosir' ? 'Harga Grosir' : 'Retail +'}
            </span>
          </div>
        </div>

        {/* Business Rule / Bypass Callout */}
        <div className="bg-blue-50/70 border-b border-blue-100/80 px-4 py-2.5 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-semibold text-[11px]">Direct Order Dispatch:</span>
            <span className="text-[11px] text-blue-800">Order langsung terdistribusi ke antrian gudang tanpa approval.</span>
          </div>
          <div className="hidden sm:block text-[10px] font-mono text-blue-700 bg-white/80 border border-blue-200 px-1.5 py-0.5 rounded">
            DoF: 20% / 0% Free
          </div>
        </div>

        {/* Store Selection & Price Tier Controls */}
        <div className="p-4 bg-white border-b border-slate-200 space-y-3">
          {/* Store Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Store className="w-3.5 h-3.5 text-slate-500" />
                <span>Pilih Toko / Outlet</span>
              </span>
              <span className="text-[10px] font-normal text-slate-400">Pilih dari preset</span>
            </label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition font-medium"
            >
              {storeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            {selectedStore === '+ Tambah Toko Baru...' && (
              <input
                type="text"
                value={customStore}
                onChange={(e) => setCustomStore(e.target.value)}
                placeholder="Masukkan nama toko baru..."
                className="mt-2 w-full bg-amber-50/60 border border-amber-300 text-slate-900 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            )}
          </div>

          {/* Price Tier Toggle: Grosir vs Retail + */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Struktur Kategori Harga (Price Tier)
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedTier('Grosir')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  selectedTier === 'Grosir'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Harga Grosir</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTier('Retail')}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  selectedTier === 'Retail'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Retail + Tier</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Catalog Filter & Search */}
        <div className="px-4 pt-3 pb-1 flex flex-col sm:flex-row gap-2 bg-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau kode produk..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto text-[11px]">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition font-medium ${
                categoryFilter === 'ALL' ? 'bg-slate-800 text-white border-slate-800 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Semua ({products.length})
            </button>
            <button
              onClick={() => setCategoryFilter('DOF_ACTIVE')}
              className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition font-medium ${
                categoryFilter === 'DOF_ACTIVE' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              DoF 20%
            </button>
            <button
              onClick={() => setCategoryFilter('DOF_FREE')}
              className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition font-medium ${
                categoryFilter === 'DOF_FREE' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Bebas Fee (0%)
            </button>
          </div>
        </div>

        {/* Product Catalog: CARD-BASED UI */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-medium">Tidak ada produk yang cocok dengan pencarian.</p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const qty = cartQuantities[product.kode_produk] || 0;
              const currentPrice = selectedTier === 'Grosir' ? product.harga_grosir : product.harga_retail;
              const dofFeeUnit = calculateDofFee(product.harga_grosir, product.persentase_dof);
              const isSelected = qty > 0;

              return (
                <div
                  key={product.kode_produk}
                  className={`border rounded-xl p-3.5 bg-white transition shadow-xs ${
                    isSelected
                      ? 'border-blue-500 ring-1 ring-blue-200 bg-blue-50/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Row: Title + Code & DoF badge */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug">
                        {product.nama_produk}
                      </h4>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
                          {product.kode_produk}
                        </span>
                        {product.persentase_dof > 0 ? (
                          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded-full font-medium">
                            DoF {formatPercentage(product.persentase_dof)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-full font-medium">
                            Bebas Fee (0%)
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shrink-0 shadow-xs">
                        {qty} di keranjang
                      </span>
                    )}
                  </div>

                  {/* Bottom Row: Price + Stepper */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-blue-600">
                        {formatRupiah(currentPrice, true)}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        DoF Fee: {formatRupiah(dofFeeUnit, true)}/unit
                      </div>
                    </div>

                    {/* Stepper with Professional Polish layout */}
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
                      <button
                        type="button"
                        onClick={() => updateQty(product.kode_produk, -1)}
                        disabled={qty === 0}
                        className={`w-6 h-6 bg-white border border-slate-200 rounded shadow-xs flex items-center justify-center text-xs font-bold transition ${
                          qty > 0 ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed border-slate-100'
                        }`}
                        title="Kurangi Qty"
                      >
                        -
                      </button>

                      <span className="text-xs font-bold w-5 text-center text-slate-800 font-mono">
                        {qty}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateQty(product.kode_produk, 1)}
                        className="w-6 h-6 bg-white border border-slate-200 rounded shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
                        title="Tambah Qty"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal preview if selected */}
                  {isSelected && (
                    <div className="mt-2.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-medium">Subtotal ({qty} item):</span>
                      <span className="font-bold text-slate-900">{formatRupiah(currentPrice * qty, true)}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Order Notes Field */}
        <div className="p-3 bg-white border-t border-slate-200">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Catatan Tambahan untuk Gudang (Opsional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Kirim sebelum pukul 12.00, packing terpisah..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        {/* Bottom Checkout Panel in Professional Polish dark slate style */}
        <div className="p-4 bg-slate-900 text-white rounded-t-2xl shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-[11px] text-slate-400 block">Total Amount ({totalItemCount} Units)</span>
              <span className="text-lg font-bold text-white tracking-tight">{formatRupiah(grandTotal, true)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Est. DoF Fee:</span>
              <span className="text-xs font-bold text-amber-400">{formatRupiah(totalDofFee, true)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmitOrder}
            disabled={cartItems.length === 0 || isSubmitting}
            className={`w-full py-3 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 ${
              cartItems.length > 0 && !isSubmitting
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-950/30 active:scale-[0.99] cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>SUBMITTING TO WAREHOUSE...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>SUBMIT TO WAREHOUSE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Modal: Generates PDF and Text Summary */}
      {createdOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-center text-base font-extrabold text-slate-900">
              Order Berhasil Diterbitkan!
            </h3>
            <p className="text-center text-xs text-slate-500 mt-0.5">
              No. DOF: <span className="font-mono font-bold text-blue-600">{createdOrder.no_dof}</span>
            </p>

            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2">
              <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Bypass Approval Aktif:</strong> Order langsung dialirkan ke antrian packing live warehouse dashboard.
              </div>
            </div>

            <div className="mt-3 bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs text-slate-700 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Toko:</span>
                <span className="font-semibold text-slate-900">{createdOrder.nama_toko}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tier Harga:</span>
                <span className="font-semibold">{createdOrder.kategori_harga}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Item:</span>
                <span className="font-semibold">{createdOrder.details?.reduce((acc, d) => acc + d.qty, 0)} Unit</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-950">
                <span>Grand Total:</span>
                <span className="text-blue-700">{formatRupiah(createdOrder.grand_total, true)}</span>
              </div>
            </div>

            {/* Output Actions: PDF and Text Summary */}
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => generateDofPdf(createdOrder)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Unduh PDF Surat Jalan & DOF Invoice</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopySummary(createdOrder)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition border border-slate-300"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText ? 'Teks Tersalin ke Clipboard!' : 'Salin Ringkasan Pesanan (WhatsApp/Teks)'}</span>
              </button>
            </div>

            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium py-1"
              >
                Tutup & Buat Order Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
