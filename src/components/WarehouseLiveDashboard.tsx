import { useState, useMemo, useEffect } from 'react';
import { DofHeader, OrderStatus } from '../types';
import { formatRupiah, formatDecimal } from '../utils/mathUtils';
import { generateDofPdf, generateTextSummary } from '../utils/pdfGenerator';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Search, 
  Filter, 
  Printer, 
  FileText, 
  RefreshCw, 
  Radio, 
  ChevronRight, 
  CheckSquare, 
  Square,
  AlertTriangle,
  User,
  Store,
  ArrowRight,
  TrendingUp,
  Boxes
} from 'lucide-react';

interface WarehouseLiveDashboardProps {
  orders: DofHeader[];
  onUpdateStatus: (noDof: string, status: OrderStatus) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function WarehouseLiveDashboard({
  orders,
  onUpdateStatus,
  onRefresh
}: WarehouseLiveDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<DofHeader | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Auto select first order if none selected
  useEffect(() => {
    if (orders.length > 0 && !selectedOrder) {
      setSelectedOrder(orders[0]);
    } else if (selectedOrder) {
      // Keep selected order updated with fresh data
      const updated = orders.find(o => o.no_dof === selectedOrder.no_dof);
      if (updated) setSelectedOrder(updated);
    }
  }, [orders, selectedOrder]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDof = o.no_dof.toLowerCase().includes(q);
        const matchStore = o.nama_toko.toLowerCase().includes(q);
        const matchSales = o.nama_salesman?.toLowerCase().includes(q);
        return matchDof || matchStore || matchSales;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    return {
      pending: orders.filter(o => o.status === 'PENDING_WAREHOUSE').length,
      picking: orders.filter(o => o.status === 'PICKING').length,
      ready: orders.filter(o => o.status === 'READY_FOR_DELIVERY').length,
      completed: orders.filter(o => o.status === 'COMPLETED').length,
      totalVolume: orders.reduce((acc, o) => acc + o.grand_total, 0),
      totalUnits: orders.reduce((acc, o) => acc + (o.details?.reduce((sum, d) => sum + d.qty, 0) || 0), 0)
    };
  }, [orders]);

  const handleStatusChange = async (noDof: string, nextStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(noDof, nextStatus);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal update status';
      alert(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const toggleItemCheck = (id_detail: string | number) => {
    setCheckedItems(prev => ({
      ...prev,
      [id_detail]: !prev[id_detail]
    }));
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_WAREHOUSE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
            <span>Antrian Gudang (Bypass)</span>
          </span>
        );
      case 'PICKING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <Package className="w-3 h-3" />
            <span>Sedang Picking / Packing</span>
          </span>
        );
      case 'READY_FOR_DELIVERY':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
            <Truck className="w-3 h-3" />
            <span>Siap Kirim / Loading</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            <span>Terkirim & Selesai</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Metrics Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Radio className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Warehouse Logistics & Fulfillment Dashboard
                </h2>
                <div className="flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                  <span>Live Stream</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Bypass Approval: Pesanan salesman langsung masuk ke antrian logistik gudang secara real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 shadow-xs transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Antrian</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="text-[11px] text-amber-700 font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Antrian Baru</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.pending}</div>
            <div className="text-[10px] text-slate-500">Menunggu diproses</div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="text-[11px] text-blue-700 font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Sedang Picking</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.picking}</div>
            <div className="text-[10px] text-slate-500">Proses pengambilan barang</div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="text-[11px] text-indigo-700 font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>Siap Kirim</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.ready}</div>
            <div className="text-[10px] text-slate-500">Packing selesai & siap jalan</div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Terkirim</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.completed}</div>
            <div className="text-[10px] text-slate-500">Fulfillment sukses</div>
          </div>

          <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-slate-900 text-white rounded-xl p-3 shadow-xs">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Nilai DOF</div>
            <div className="text-base font-bold text-white mt-1 truncate">
              {formatRupiah(stats.totalVolume, true)}
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">{stats.totalUnits} unit barang</div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Orders Stream List (Left) + Order Detail & Picking Checklist (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Order Stream Queue */}
        <div className="lg:col-span-5 space-y-3">
          {/* Filter and Search */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari No. DOF, Nama Toko, Salesman..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Semua ({orders.length})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING_WAREHOUSE')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'PENDING_WAREHOUSE' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Antrian ({stats.pending})
              </button>
              <button
                onClick={() => setStatusFilter('PICKING')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'PICKING' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                Picking ({stats.picking})
              </button>
              <button
                onClick={() => setStatusFilter('READY_FOR_DELIVERY')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  statusFilter === 'READY_FOR_DELIVERY' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                Siap Kirim ({stats.ready})
              </button>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Tidak ada antrian order untuk filter ini.</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrder?.no_dof === order.no_dof;
                const itemCount = order.details?.reduce((sum, d) => sum + d.qty, 0) || 0;

                return (
                  <div
                    key={order.no_dof}
                    onClick={() => setSelectedOrder(order)}
                    className={`bg-white rounded-xl p-3.5 border transition cursor-pointer shadow-sm relative ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-100 bg-blue-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-xs text-slate-900">{order.no_dof}</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded font-semibold">
                            {order.kategori_harga}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 mt-0.5">{order.nama_toko}</h4>
                        <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                          <span>Sales: {order.nama_salesman || 'Salesman'}</span>
                          <span>•</span>
                          <span>{new Date(order.tanggal_order).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900">
                          {formatRupiah(order.grand_total, true)}
                        </div>
                        <div className="text-[10px] text-slate-500">{itemCount} items</div>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                      {getStatusBadge(order.status)}
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Order Picklist & Fulfillment Workflow */}
        <div className="lg:col-span-7">
          {selectedOrder ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-black text-blue-700">{selectedOrder.no_dof}</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{selectedOrder.nama_toko}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Order Masuk: {new Date(selectedOrder.tanggal_order).toLocaleString('id-ID')} | Tier: <strong>{selectedOrder.kategori_harga}</strong>
                  </div>
                </div>

                {/* Print & PDF Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => generateDofPdf(selectedOrder)}
                    className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
                    title="Unduh & Cetak Surat Jalan PDF"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Cetak Surat Jalan</span>
                  </button>
                </div>
              </div>

              {/* Status Progression Controls (Workflow Bar) */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Update Status Alur Fulfillment (Gudang):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.no_dof, 'PICKING')}
                    disabled={isUpdating || selectedOrder.status === 'PICKING'}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 border ${
                      selectedOrder.status === 'PICKING'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>1. Mulai Picking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.no_dof, 'READY_FOR_DELIVERY')}
                    disabled={isUpdating || selectedOrder.status === 'READY_FOR_DELIVERY'}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 border ${
                      selectedOrder.status === 'READY_FOR_DELIVERY'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-indigo-50 hover:text-indigo-700'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>2. Siap Kirim (Packing OK)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.no_dof, 'COMPLETED')}
                    disabled={isUpdating || selectedOrder.status === 'COMPLETED'}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 border ${
                      selectedOrder.status === 'COMPLETED'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>3. Selesai Terkirim</span>
                  </button>
                </div>
              </div>

              {/* Interactive Item Picklist (Checklist for Warehouse Operators) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    <span>Item Picklist & Packing Verification ({selectedOrder.details?.length || 0} SKU)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Centang saat mengambil barang fisik</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                  {selectedOrder.details?.map((item) => {
                    const isChecked = !!checkedItems[item.id_detail];

                    return (
                      <div
                        key={item.id_detail}
                        onClick={() => toggleItemCheck(item.id_detail)}
                        className={`p-3 transition cursor-pointer flex items-center justify-between ${
                          isChecked ? 'bg-emerald-50/60 text-slate-800' : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <button
                            type="button"
                            className={`mt-0.5 ${isChecked ? 'text-emerald-600' : 'text-slate-400'}`}
                          >
                            {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                          </button>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                {item.kode_produk}
                              </span>
                              {item.persentase_dof > 0 ? (
                                <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-semibold">
                                  DoF {(item.persentase_dof * 100).toFixed(0)}%
                                </span>
                              ) : (
                                <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-semibold">
                                  Bebas DoF
                                </span>
                              )}
                            </div>
                            <div className={`text-xs font-bold mt-1 ${isChecked ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                              {item.nama_produk || item.kode_produk}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Harga: {formatRupiah(item.harga_satuan, true)} • DoF Fee: {formatRupiah(item.dof_fee_satuan, true)}/unit
                            </div>
                          </div>
                        </div>

                        <div className="text-right pl-3 shrink-0">
                          <div className="text-sm font-black text-slate-900">
                            {item.qty} <span className="text-xs font-normal text-slate-600">Unit</span>
                          </div>
                          <div className="text-xs font-bold text-blue-700">
                            {formatRupiah(item.subtotal, true)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Financial Summary */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="text-xs text-slate-600">
                    Salesman: <strong className="text-slate-900">{selectedOrder.nama_salesman || 'Budi Santoso'}</strong>
                  </div>
                  {selectedOrder.catatan && (
                    <div className="text-xs text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 mt-1">
                      Catatan: "{selectedOrder.catatan}"
                    </div>
                  )}
                </div>

                <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                  <div className="text-[11px] text-slate-500">
                    Total DoF Fee: <span className="font-bold text-amber-700">{formatRupiah(selectedOrder.total_dof_fee || 0, true)}</span>
                  </div>
                  <div className="text-base font-black text-slate-950">
                    Grand Total: {formatRupiah(selectedOrder.grand_total, true)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Pilih Order di Kolom Kiri</h3>
              <p className="text-xs text-slate-400 mt-1">Klik salah satu order untuk melihat picklist dan memproses barang gudang.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
