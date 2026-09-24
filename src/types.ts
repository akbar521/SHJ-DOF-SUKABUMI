export type Role = 'salesman' | 'admin' | 'warehouse';

export type PriceCategory = 'Grosir' | 'Retail';

export type Wilayah = 'Sukabumi' | 'Cianjur';

export type SubdistKey = 
  | 'CIKALONG' 
  | 'CIPANAS' 
  | 'CIBEBER' 
  | 'CIRANJANG' 
  | 'CIBADAK' 
  | 'NYALINDUNG' 
  | 'CIKOLE' 
  | 'SUKARAJA';

export interface ProductSubdistPrice {
  harga_grosir: number;
  harga_retail: number;
  persentase_dof?: number;
}

export interface User {
  id_user: string;
  nama_lengkap: string;
  role: Role;
  dms_user?: string;
  password?: string;
  telepon?: string;
}

export interface Product {
  kode_produk: string;
  nama_produk: string;
  harga_grosir: number;    // DECIMAL(10,2) or DECIMAL(12,4)
  harga_retail: number;    // DECIMAL(10,2) or DECIMAL(12,4)
  persentase_dof: number;  // DECIMAL(3,2), e.g. 0.20 or 0.00
  wilayah?: Wilayah[];     // e.g. ['Sukabumi', 'Cianjur']
  subdist_prices?: Partial<Record<SubdistKey, ProductSubdistPrice>>; // Custom prices per subdist
  // Derived SHJ fields
  dof_fee?: number;        // persentase_dof * harga_grosir
  margin_retail?: number;  // harga_retail - (harga_grosir + dof_fee)
  margin_percentage?: number;
}

export type OrderStatus = 'PENDING_WAREHOUSE' | 'PICKING' | 'READY_FOR_DELIVERY' | 'COMPLETED' | 'CANCELLED';

export interface DofHeader {
  no_dof: string;
  tanggal_order: string;
  id_user: string;
  nama_toko: string;
  kategori_harga: PriceCategory;
  grand_total: number; // DECIMAL(12,2)
  total_dof_fee: number;
  status: OrderStatus;
  nama_salesman?: string;
  catatan?: string;
  details?: DofDetail[];
}

export interface DofDetail {
  id_detail: string | number;
  no_dof: string;
  kode_produk: string;
  nama_produk?: string;
  qty: number;
  harga_satuan: number;
  persentase_dof: number;
  dof_fee_satuan: number;
  subtotal: number; // DECIMAL(12,2)
  subtotal_dof_fee: number;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export interface CreateOrderPayload {
  id_user: string;
  nama_toko: string;
  kategori_harga: PriceCategory;
  catatan?: string;
  items: {
    kode_produk: string;
    qty: number;
  }[];
}

export interface SHJCalculation {
  kode_produk: string;
  nama_produk: string;
  harga_grosir: number;
  persentase_dof: number;
  dof_fee: number;
  total_hpp_dof: number; // harga_grosir + dof_fee
  harga_retail: number;
  margin_rp: number; // harga_retail - total_hpp_dof
  margin_persen: number; // (margin_rp / total_hpp_dof) * 100
}
