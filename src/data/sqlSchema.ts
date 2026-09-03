import { Product, User, DofHeader } from '../types';

export const INITIAL_USERS: User[] = [
  // Motoris Sukabumi
  { id_user: 'MTR-001', nama_lengkap: 'RUSDIANA', role: 'salesman', dms_user: 'MMTW-SKI-CIBADAK', password: 'password123', telepon: '081234567891' },
  { id_user: 'MTR-002', nama_lengkap: 'AJENG RIVALDI', role: 'salesman', dms_user: 'MMTW-SKI-NYALINDUNG', password: 'password123', telepon: '081234567892' },
  { id_user: 'MTR-003', nama_lengkap: 'EGA', role: 'salesman', dms_user: 'MMTW-SKI-CIKOLE', password: 'password123', telepon: '081234567893' },
  { id_user: 'MTR-004', nama_lengkap: 'FACHRI', role: 'salesman', dms_user: 'MMTW-SKI-SUKARAJA', password: 'password123', telepon: '081234567894' },
  // Motoris Cianjur
  { id_user: 'MTR-CJR-001', nama_lengkap: 'HERU', role: 'salesman', dms_user: 'MMTW-SKI-CIKALONG', password: 'password123', telepon: '081234567801' },
  { id_user: 'MTR-CJR-002', nama_lengkap: 'HERPIN', role: 'salesman', dms_user: 'MMTW-SKI-CIAPANAS', password: 'password123', telepon: '081234567802' },
  { id_user: 'MTR-CJR-003', nama_lengkap: 'RIBCA', role: 'salesman', dms_user: 'MMTW-SKI-CIBEBER', password: 'password123', telepon: '081234567803' },
  { id_user: 'MTR-CJR-004', nama_lengkap: 'AHYAR', role: 'salesman', dms_user: 'MMTW-SKI-CIRANJANG', password: 'password123', telepon: '081234567804' },
  // Admin & Warehouse
  { id_user: 'USR-ADM', nama_lengkap: 'Dewi Lestari (Admin Finance)', role: 'admin', dms_user: 'ADM-MMTW-SKI', password: 'adminpassword', telepon: '081311223344' },
  { id_user: 'USR-WH1', nama_lengkap: 'Agus Warehouse Lead', role: 'warehouse', dms_user: 'WH-MMTW-SKI', password: 'whpassword', telepon: '081399887766' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    kode_produk: 'PEGAB',
    nama_produk: 'Extra Joss Go Anggur Pack (6 scht)',
    harga_grosir: 5141.52,
    harga_retail: 6559.00,
    persentase_dof: 0.20,
    wilayah: ['Sukabumi', 'Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 5141.52, harga_retail: 6559.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 5180.00, harga_retail: 6559.00, persentase_dof: 0.20 },
      PANJUNAN_SUKABUMI: { harga_grosir: 5141.52, harga_retail: 6559.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'PEMAB',
    nama_produk: 'Extra Joss Mangga LAKI Pack (6 scht)',
    harga_grosir: 5141.52,
    harga_retail: 6559.00,
    persentase_dof: 0.20,
    wilayah: ['Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 5141.52, harga_retail: 6559.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 5180.00, harga_retail: 6559.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'PEBJE',
    nama_produk: "Extrajoss Active Pack (12's)",
    harga_grosir: 12500.00,
    harga_retail: 15000.00,
    persentase_dof: 0.20,
    wilayah: ['Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 12500.00, harga_retail: 15000.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 12600.00, harga_retail: 15000.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'LEXUA',
    nama_produk: 'Extrajoss Ultimate ( 24 Can)',
    harga_grosir: 5700.00,
    harga_retail: 6500.00,
    persentase_dof: 0.20,
    wilayah: ['Sukabumi', 'Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 5700.00, harga_retail: 6500.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 5750.00, harga_retail: 6500.00, persentase_dof: 0.20 },
      PANJUNAN_SUKABUMI: { harga_grosir: 5700.00, harga_retail: 6500.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'LKXKD',
    nama_produk: 'Komix Herbal Kid Pack (4 Tube)',
    harga_grosir: 9311.80,
    harga_retail: 12000.00,
    persentase_dof: 0.20,
    wilayah: ['Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 9311.80, harga_retail: 12000.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 9350.00, harga_retail: 12000.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'LKXOB',
    nama_produk: 'Komix Herbal Ori Pack (4 tube)',
    harga_grosir: 9311.80,
    harga_retail: 12100.00,
    persentase_dof: 0.20,
    wilayah: ['Sukabumi', 'Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 9311.80, harga_retail: 12100.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 9350.00, harga_retail: 12100.00, persentase_dof: 0.20 },
      PANJUNAN_SUKABUMI: { harga_grosir: 9311.80, harga_retail: 12100.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'LKXLA',
    nama_produk: 'Komix Herbal Lemon Pack (4 tube)',
    harga_grosir: 9311.80,
    harga_retail: 12100.00,
    persentase_dof: 0.20,
    wilayah: ['Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 9311.80, harga_retail: 12100.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 9350.00, harga_retail: 12100.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'LKXOD',
    nama_produk: 'Komix Herbal Ori Sachet (Pack - 6 scht)',
    harga_grosir: 9700.30,
    harga_retail: 13000.00,
    persentase_dof: 0.20,
    wilayah: ['Sukabumi', 'Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 9700.30, harga_retail: 13000.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 9750.00, harga_retail: 13000.00, persentase_dof: 0.20 },
      PANJUNAN_SUKABUMI: { harga_grosir: 9700.30, harga_retail: 13000.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'LKXJA-LKXNA-LKXPA',
    nama_produk: 'Komix Herbal Rasa (Pack - 6 scht)',
    harga_grosir: 9700.30,
    harga_retail: 13000.00,
    persentase_dof: 0.20,
    wilayah: ['Sukabumi', 'Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 9700.30, harga_retail: 13000.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 9750.00, harga_retail: 13000.00, persentase_dof: 0.20 },
      PANJUNAN_SUKABUMI: { harga_grosir: 9700.30, harga_retail: 13000.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'KMXAD',
    nama_produk: "Komix Adult Box (30's)",
    harga_grosir: 42000.00,
    harga_retail: 48000.00,
    persentase_dof: 0.20,
    wilayah: ['Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 42000.00, harga_retail: 48000.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 42250.00, harga_retail: 48000.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'KMXKD',
    nama_produk: "Komix Kids Pack (10's)",
    harga_grosir: 18500.00,
    harga_retail: 22000.00,
    persentase_dof: 0.20,
    wilayah: ['Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 18500.00, harga_retail: 22000.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 18700.00, harga_retail: 22000.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'LBJAB',
    nama_produk: 'Bejo Anak Pack (12 scht)',
    harga_grosir: 24500.00,
    harga_retail: 27000.00,
    persentase_dof: 0.20,
    wilayah: ['Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 24500.00, harga_retail: 27000.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 24750.00, harga_retail: 27000.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'FTGKAP',
    nama_produk: 'Fatigon Kaplet',
    harga_grosir: 18000.00,
    harga_retail: 21000.00,
    persentase_dof: 0.20,
    wilayah: ['Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 18000.00, harga_retail: 21000.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 18200.00, harga_retail: 21000.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'LBMAV',
    nama_produk: 'Bejo Jahe Merah New (12 scht)',
    harga_grosir: 31084.00,
    harga_retail: 33000.00,
    persentase_dof: 0.20,
    wilayah: ['Sukabumi', 'Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 31084.00, harga_retail: 33000.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 31200.00, harga_retail: 33000.00, persentase_dof: 0.20 },
      PANJUNAN_SUKABUMI: { harga_grosir: 31084.00, harga_retail: 33000.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'ENTROT',
    nama_produk: 'Entrostop Tab',
    harga_grosir: 15000.00,
    harga_retail: 17500.00,
    persentase_dof: 0.20,
    wilayah: ['Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 15000.00, harga_retail: 17500.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 15150.00, harga_retail: 17500.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'PBSJC',
    nama_produk: "B7 SLASI Jeruk Nipis Renceng (12's)",
    harga_grosir: 17460.30,
    harga_retail: 19000.00,
    persentase_dof: 0.20,
    wilayah: ['Sukabumi', 'Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 17460.30, harga_retail: 19000.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 17500.00, harga_retail: 19000.00, persentase_dof: 0.20 },
      PANJUNAN_SUKABUMI: { harga_grosir: 17460.30, harga_retail: 19000.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'FTGSPR',
    nama_produk: 'Fatigon Spirit',
    harga_grosir: 22000.00,
    harga_retail: 25000.00,
    persentase_dof: 0.20,
    wilayah: ['Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 22000.00, harga_retail: 25000.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 22200.00, harga_retail: 25000.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'ENTROH',
    nama_produk: 'Entrostop Herbal Anak',
    harga_grosir: 16500.00,
    harga_retail: 19000.00,
    persentase_dof: 0.20,
    wilayah: ['Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 16500.00, harga_retail: 19000.00, persentase_dof: 0.20 },
      SIRAWING: { harga_grosir: 16700.00, harga_retail: 19000.00, persentase_dof: 0.20 }
    }
  },
  {
    kode_produk: 'LPRGR',
    nama_produk: "Promag Herbal 15 ml (6 'S)",
    harga_grosir: 15810.00,
    harga_retail: 16800.00,
    persentase_dof: 0.00,
    wilayah: ['Sukabumi', 'Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 15810.00, harga_retail: 16800.00, persentase_dof: 0.00 },
      SIRAWING: { harga_grosir: 15900.00, harga_retail: 16800.00, persentase_dof: 0.00 },
      PANJUNAN_SUKABUMI: { harga_grosir: 15810.00, harga_retail: 16800.00, persentase_dof: 0.00 }
    }
  },
  {
    kode_produk: 'LMHGA',
    nama_produk: "Mixagrip Herbal Greges (6'S)",
    harga_grosir: 16188.00,
    harga_retail: 16700.00,
    persentase_dof: 0.00,
    wilayah: ['Sukabumi', 'Cianjur'],
    subdist_prices: {
      PANJUNAN_CIANJUR: { harga_grosir: 16188.00, harga_retail: 16700.00, persentase_dof: 0.00 },
      SIRAWING: { harga_grosir: 16250.00, harga_retail: 16700.00, persentase_dof: 0.00 },
      PANJUNAN_SUKABUMI: { harga_grosir: 16188.00, harga_retail: 16700.00, persentase_dof: 0.00 }
    }
  }
];

export const INITIAL_ORDERS: DofHeader[] = [
  {
    no_dof: 'DOF-20260901-0001',
    tanggal_order: '2026-09-01T06:45:00.000Z',
    id_user: 'USR-001',
    nama_salesman: 'Budi Santoso (Salesman)',
    nama_toko: 'Toko Sejahtera Bersama',
    kategori_harga: 'Grosir',
    grand_total: 51415.20,
    total_dof_fee: 10283.04,
    status: 'PICKING',
    catatan: 'Prioritas kirim pagi sebelum jam 11:00',
    details: [
      {
        id_detail: 'DTL-101',
        no_dof: 'DOF-20260901-0001',
        kode_produk: 'PEGAB',
        nama_produk: 'Extra Joss Go Anggur Pack (6 scht)',
        qty: 10,
        harga_satuan: 5141.52,
        persentase_dof: 0.20,
        dof_fee_satuan: 1028.304,
        subtotal: 51415.20,
        subtotal_dof_fee: 10283.04
      }
    ]
  },
  {
    no_dof: 'DOF-20260901-0002',
    tanggal_order: '2026-09-01T07:10:00.000Z',
    id_user: 'USR-002',
    nama_salesman: 'Rian Pratama (Salesman)',
    nama_toko: 'Apotek Farma Sehat',
    kategori_harga: 'Retail',
    grand_total: 80600.00,
    total_dof_fee: 6416.80,
    status: 'PENDING_WAREHOUSE',
    catatan: 'Order langsung masuk antrian gudang (No Approval)',
    details: [
      {
        id_detail: 'DTL-102',
        no_dof: 'DOF-20260901-0002',
        kode_produk: 'LKXOB',
        nama_produk: 'Komix Herbal Ori Pack (4 tube)',
        qty: 4,
        harga_satuan: 12100.00,
        persentase_dof: 0.20,
        dof_fee_satuan: 1862.36,
        subtotal: 48400.00,
        subtotal_dof_fee: 7449.44
      },
      {
        id_detail: 'DTL-103',
        no_dof: 'DOF-20260901-0002',
        kode_produk: 'LPRGR',
        nama_produk: "Promag Herbal 15 ml (6 'S)",
        qty: 2,
        harga_satuan: 16800.00,
        persentase_dof: 0.00,
        dof_fee_satuan: 0.00,
        subtotal: 33600.00,
        subtotal_dof_fee: 0.00
      }
    ]
  }
];

export const SQL_DDL_AND_SEED = `-- ====================================================================
-- SISTEM MONITORING DELIVERY ORDER FORM (DOF) & STRUKTUR HARGA JUAL (SHJ)
-- Relational Database DDL & Seed Script (MySQL / PostgreSQL Compatible)
-- ====================================================================

-- 1. DROP EXISTING TABLES IF NEEDED
DROP TABLE IF EXISTS dof_detail;
DROP TABLE IF EXISTS dof_header;
DROP TABLE IF EXISTS produk;
DROP TABLE IF EXISTS users;

-- 2. TABLE: users
CREATE TABLE users (
    id_user VARCHAR(36) PRIMARY KEY,
    nama_lengkap VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('salesman', 'admin', 'warehouse')),
    password VARCHAR(255) NOT NULL,
    telepon VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLE: produk (Master Data Produk & Parameter DoF)
-- Decimal(10,2) or (12,4) ensures no precision loss for prices & percentages
CREATE TABLE produk (
    kode_produk VARCHAR(50) PRIMARY KEY,
    nama_produk VARCHAR(255) NOT NULL,
    harga_grosir DECIMAL(10, 2) NOT NULL,
    harga_retail DECIMAL(10, 2) NOT NULL,
    persentase_dof DECIMAL(3, 2) NOT NULL DEFAULT 0.20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLE: dof_header (Delivery Order Form Header)
-- No Approval System: Orders go straight into warehouse processing
CREATE TABLE dof_header (
    no_dof VARCHAR(50) PRIMARY KEY,
    tanggal_order TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_user VARCHAR(36) NOT NULL,
    nama_toko VARCHAR(200) NOT NULL,
    kategori_harga VARCHAR(20) NOT NULL CHECK (kategori_harga IN ('Grosir', 'Retail')),
    grand_total DECIMAL(12, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_WAREHOUSE' 
        CHECK (status IN ('PENDING_WAREHOUSE', 'PICKING', 'READY_FOR_DELIVERY', 'COMPLETED', 'CANCELLED')),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dof_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE RESTRICT
);

-- 5. TABLE: dof_detail (Item Lines in DOF)
CREATE TABLE dof_detail (
    id_detail BIGINT AUTO_INCREMENT PRIMARY KEY,
    no_dof VARCHAR(50) NOT NULL,
    kode_produk VARCHAR(50) NOT NULL,
    qty INT NOT NULL CHECK (qty > 0),
    harga_satuan DECIMAL(10, 2) NOT NULL,
    persentase_dof DECIMAL(3, 2) NOT NULL,
    dof_fee_satuan DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_detail_header FOREIGN KEY (no_dof) REFERENCES dof_header(no_dof) ON DELETE CASCADE,
    CONSTRAINT fk_detail_produk FOREIGN KEY (kode_produk) REFERENCES produk(kode_produk) ON DELETE RESTRICT
);

-- 6. INDEXES FOR HIGH-THROUGHPUT WAREHOUSE FULFILLMENT
CREATE INDEX idx_dof_status ON dof_header(status);
CREATE INDEX idx_dof_tanggal ON dof_header(tanggal_order);
CREATE INDEX idx_detail_dof ON dof_detail(no_dof);

-- ====================================================================
-- SEED DATA INSERTION
-- ====================================================================

-- Insert Users
INSERT INTO users (id_user, nama_lengkap, role, password, telepon) VALUES
('USR-001', 'Budi Santoso', 'salesman', 'password123', '081234567890'),
('USR-002', 'Rian Pratama', 'salesman', 'password123', '081298765432'),
('USR-ADM', 'Dewi Lestari (Finance Admin)', 'admin', 'adminpassword', '081311223344'),
('USR-WH1', 'Agus Warehouse Lead', 'warehouse', 'whpassword', '081399887766');

-- Insert Initial Products (Exact seed data with dynamic DoF percentage)
INSERT INTO produk (kode_produk, nama_produk, harga_grosir, harga_retail, persentase_dof) VALUES
('PEGAB', 'Extra Joss Go Anggur Pack (6 scht)', 5141.52, 6559.00, 0.20),
('LEXUA', 'Extrajoss Ultimate ( 24 Can)', 5700.00, 6500.00, 0.20),
('LKXOB', 'Komix Herbal Ori Pack (4 tube)', 9311.80, 12100.00, 0.20),
('LKXOD', 'Komix Herbal Ori Sachet (Pack - 6 scht)', 9700.30, 13000.00, 0.20),
('LKXJA-LKXNA-LKXPA', 'Komix Herbal Rasa (Pack - 6 scht)', 9700.30, 13000.00, 0.20),
('LBMAV', 'Bejo Jahe Merah New (12 scht)', 31084.00, 33000.00, 0.20),
('PBSJC', 'B7 SLASI Jeruk Nipis Renceng (12''s)', 17460.30, 19000.00, 0.20),
('LPRGR', 'Promag Herbal 15 ml (6 ''S)', 15810.00, 16800.00, 0.00),
('LMHGA', 'Mixagrip Herbal Greges (6''S)', 16188.00, 16700.00, 0.00);
`;
