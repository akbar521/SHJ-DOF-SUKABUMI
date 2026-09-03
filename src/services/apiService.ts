import { Product, DofHeader, CreateOrderPayload, User } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_USERS } from '../data/sqlSchema';
import { calculateDofFee } from '../utils/mathUtils';

// Local storage fallback key for resilience
const LOCAL_STORAGE_PRODUCTS = 'dof_shj_products_v1';
const LOCAL_STORAGE_ORDERS = 'dof_shj_orders_v1';

export const api = {
  async getProducts(): Promise<Product[]> {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      if (Array.isArray(data.data) && data.data.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS, JSON.stringify(data.data));
        return data.data;
      }
      throw new Error('Empty response');
    } catch {
      const cached = localStorage.getItem(LOCAL_STORAGE_PRODUCTS);
      return cached ? JSON.parse(cached) : INITIAL_PRODUCTS;
    }
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menambahkan produk');
    return data.data;
  },

  async updateProduct(kode: string, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${encodeURIComponent(kode)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal mengupdate produk');
    return data.data;
  },

  async deleteProduct(kode: string): Promise<void> {
    const res = await fetch(`/api/products/${encodeURIComponent(kode)}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menghapus produk');
  },

  async getOrders(status?: string, search?: string): Promise<DofHeader[]> {
    try {
      const params = new URLSearchParams();
      if (status && status !== 'ALL') params.append('status', status);
      if (search) params.append('search', search);

      const res = await fetch(`/api/warehouse/orders?${params.toString()}`);
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      return data.data;
    } catch {
      const cached = localStorage.getItem(LOCAL_STORAGE_ORDERS);
      return cached ? JSON.parse(cached) : INITIAL_ORDERS;
    }
  },

  async createOrder(payload: CreateOrderPayload): Promise<DofHeader> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat order');
      return data.data;
    } catch {
      // Local fallback simulator if server is offline
      const dateNow = new Date();
      const dateStr = dateNow.toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const no_dof = `DOF-${dateStr}-${randomSuffix}`;
      
      let grandTotal = 0;
      let totalDofFee = 0;
      const details = payload.items.map((item, idx) => {
        const prod = INITIAL_PRODUCTS.find(p => p.kode_produk === item.kode_produk) || INITIAL_PRODUCTS[0];
        const unitPrice = payload.kategori_harga === 'Grosir' ? prod.harga_grosir : prod.harga_retail;
        const dofFeeUnit = calculateDofFee(prod.harga_grosir, prod.persentase_dof);
        const sub = Math.round(unitPrice * item.qty * 100) / 100;
        const subDof = Math.round(dofFeeUnit * item.qty * 100) / 100;
        grandTotal += sub;
        totalDofFee += subDof;
        return {
          id_detail: `DTL-${Date.now()}-${idx + 1}`,
          no_dof,
          kode_produk: prod.kode_produk,
          nama_produk: prod.nama_produk,
          qty: item.qty,
          harga_satuan: unitPrice,
          persentase_dof: prod.persentase_dof,
          dof_fee_satuan: dofFeeUnit,
          subtotal: sub,
          subtotal_dof_fee: subDof
        };
      });

      const fallbackOrder: DofHeader = {
        no_dof,
        tanggal_order: dateNow.toISOString(),
        id_user: payload.id_user,
        nama_salesman: 'Budi Santoso (Salesman)',
        nama_toko: payload.nama_toko,
        kategori_harga: payload.kategori_harga,
        grand_total: Math.round(grandTotal * 100) / 100,
        total_dof_fee: Math.round(totalDofFee * 100) / 100,
        status: 'PENDING_WAREHOUSE',
        catatan: payload.catatan || '',
        details
      };
      return fallbackOrder;
    }
  },

  async updateOrderStatus(noDof: string, status: string): Promise<DofHeader> {
    const res = await fetch(`/api/warehouse/orders/${encodeURIComponent(noDof)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal update status order');
    return data.data;
  },

  async resetDatabase(): Promise<void> {
    await fetch('/api/database/reset', { method: 'POST' });
  }
};
