import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Product, DofHeader, DofDetail, CreateOrderPayload } from './src/types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_USERS, SQL_DDL_AND_SEED } from './src/data/sqlSchema';
import { calculateDofFee, calculateSHJ } from './src/utils/mathUtils';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Relational State with persistent-style operations
let products: Product[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let orders: DofHeader[] = JSON.parse(JSON.stringify(INITIAL_ORDERS));
let users = JSON.parse(JSON.stringify(INITIAL_USERS));

// Helper: enrich product with computed SHJ values
function enrichProduct(p: Product): Product {
  const shj = calculateSHJ(p.harga_grosir, p.harga_retail, p.persentase_dof);
  return {
    ...p,
    dof_fee: shj.dofFee,
    margin_retail: shj.marginRp,
    margin_percentage: shj.marginPersen
  };
}

// -------------------------------------------------------------
// 1. REST API: PRODUCTS (MASTER DATA & SHJ)
// -------------------------------------------------------------

// GET /api/products - Fetch product catalog
app.get('/api/products', (req: Request, res: Response) => {
  const enriched = products.map(enrichProduct);
  res.json({
    success: true,
    count: enriched.length,
    data: enriched
  });
});

// POST /api/products - Create new product
app.post('/api/products', (req: Request, res: Response) => {
  const { kode_produk, nama_produk, harga_grosir, harga_retail, persentase_dof } = req.body;

  if (!kode_produk || !nama_produk || harga_grosir === undefined || harga_retail === undefined) {
    return res.status(400).json({ success: false, error: 'Semua kolom wajib diisi!' });
  }

  const existing = products.find(p => p.kode_produk.toUpperCase() === String(kode_produk).toUpperCase());
  if (existing) {
    return res.status(409).json({ success: false, error: `Kode produk ${kode_produk} sudah terdaftar!` });
  }

  const newProduct: Product = {
    kode_produk: String(kode_produk).trim().toUpperCase(),
    nama_produk: String(nama_produk).trim(),
    harga_grosir: parseFloat(harga_grosir),
    harga_retail: parseFloat(harga_retail),
    persentase_dof: persentase_dof !== undefined ? parseFloat(persentase_dof) : 0.20
  };

  products.push(newProduct);
  res.status(201).json({
    success: true,
    message: 'Produk berhasil ditambahkan',
    data: enrichProduct(newProduct)
  });
});

// PUT /api/products/:id - Update product
app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { nama_produk, harga_grosir, harga_retail, persentase_dof } = req.body;

  const idx = products.findIndex(p => p.kode_produk === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
  }

  products[idx] = {
    ...products[idx],
    nama_produk: nama_produk !== undefined ? String(nama_produk).trim() : products[idx].nama_produk,
    harga_grosir: harga_grosir !== undefined ? parseFloat(harga_grosir) : products[idx].harga_grosir,
    harga_retail: harga_retail !== undefined ? parseFloat(harga_retail) : products[idx].harga_retail,
    persentase_dof: persentase_dof !== undefined ? parseFloat(persentase_dof) : products[idx].persentase_dof,
  };

  res.json({
    success: true,
    message: 'Produk berhasil diperbarui',
    data: enrichProduct(products[idx])
  });
});

// DELETE /api/products/:id - Delete product
app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = products.findIndex(p => p.kode_produk === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Produk tidak ditemukan' });
  }

  const deleted = products.splice(idx, 1)[0];
  res.json({
    success: true,
    message: `Produk ${deleted.nama_produk} berhasil dihapus`,
    data: deleted
  });
});

// -------------------------------------------------------------
// 2. REST API: ORDERS (DELIVERY ORDER FORM - NO APPROVAL SYSTEM)
// -------------------------------------------------------------

// POST /api/orders - Direct Order Creation into Warehouse Queue
app.post('/api/orders', (req: Request, res: Response) => {
  const payload: CreateOrderPayload = req.body;

  if (!payload.nama_toko || !payload.kategori_harga || !payload.items || !payload.items.length) {
    return res.status(400).json({ success: false, error: 'Data order tidak lengkap (toko, kategori_harga, items wajib diisi)' });
  }

  const dateNow = new Date();
  const dateStr = dateNow.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const no_dof = `DOF-${dateStr}-${randomSuffix}`;

  const user = users.find((u: { id_user: string }) => u.id_user === payload.id_user) || users[0];

  let grandTotal = 0;
  let totalDofFee = 0;
  const details: DofDetail[] = [];

  for (let i = 0; i < payload.items.length; i++) {
    const item = payload.items[i];
    const product = products.find(p => p.kode_produk === item.kode_produk);
    if (!product) {
      return res.status(404).json({ success: false, error: `Produk dengan kode ${item.kode_produk} tidak ditemukan` });
    }

    const qty = parseInt(String(item.qty), 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, error: `Jumlah qty untuk ${product.nama_produk} tidak valid` });
    }

    // Determine unit price based on selected price tier
    const unitPrice = payload.kategori_harga === 'Grosir' ? product.harga_grosir : product.harga_retail;
    
    // DoF Fee strictly = persentase_dof * harga_grosir (NOT harga_retail)
    const dofFeePerUnit = calculateDofFee(product.harga_grosir, product.persentase_dof);
    
    // Subtotals with high precision math
    const itemSubtotal = Math.round(unitPrice * qty * 100) / 100;
    const itemDofSubtotal = Math.round(dofFeePerUnit * qty * 100) / 100;

    grandTotal += itemSubtotal;
    totalDofFee += itemDofSubtotal;

    details.push({
      id_detail: `DTL-${Date.now()}-${i + 1}`,
      no_dof,
      kode_produk: product.kode_produk,
      nama_produk: product.nama_produk,
      qty,
      harga_satuan: unitPrice,
      persentase_dof: product.persentase_dof,
      dof_fee_satuan: dofFeePerUnit,
      subtotal: itemSubtotal,
      subtotal_dof_fee: itemDofSubtotal
    });
  }

  // Core Business Rule: Direct into Warehouse Queue (No Approval)
  const newOrder: DofHeader = {
    no_dof,
    tanggal_order: dateNow.toISOString(),
    id_user: user.id_user,
    nama_salesman: user.nama_lengkap,
    nama_toko: payload.nama_toko,
    kategori_harga: payload.kategori_harga,
    grand_total: Math.round(grandTotal * 100) / 100,
    total_dof_fee: Math.round(totalDofFee * 100) / 100,
    status: 'PENDING_WAREHOUSE', // Direct into Warehouse stream
    catatan: payload.catatan || '',
    details
  };

  orders.unshift(newOrder); // Add to beginning for real-time live feed

  res.status(201).json({
    success: true,
    message: 'Order DOF berhasil dibuat dan langsung masuk antrian gudang (No Approval).',
    data: newOrder
  });
});

// GET /api/orders or /api/warehouse/orders - Live Fulfillment Stream
app.get(['/api/orders', '/api/warehouse/orders'], (req: Request, res: Response) => {
  const { status, search } = req.query;

  let filtered = [...orders];

  if (status && status !== 'ALL') {
    filtered = filtered.filter(o => o.status === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(o => 
      o.no_dof.toLowerCase().includes(q) ||
      o.nama_toko.toLowerCase().includes(q) ||
      (o.nama_salesman && o.nama_salesman.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
});

// PATCH /api/warehouse/orders/:id/status - Update fulfillment status
app.patch('/api/warehouse/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['PENDING_WAREHOUSE', 'PICKING', 'READY_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Status tidak valid' });
  }

  const order = orders.find(o => o.no_dof === id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order tidak ditemukan' });
  }

  order.status = status;

  res.json({
    success: true,
    message: `Status order ${order.no_dof} diperbarui menjadi ${status}`,
    data: order
  });
});

// -------------------------------------------------------------
// 3. REST API: SHJ MONITORING & SYSTEM STATS
// -------------------------------------------------------------

app.get('/api/shj/monitor', (req: Request, res: Response) => {
  const productShj = products.map(p => {
    const shj = calculateSHJ(p.harga_grosir, p.harga_retail, p.persentase_dof);
    return {
      kode_produk: p.kode_produk,
      nama_produk: p.nama_produk,
      harga_grosir: p.harga_grosir,
      persentase_dof: p.persentase_dof,
      dof_fee: shj.dofFee,
      total_hpp_dof: shj.totalHppDof,
      harga_retail: p.harga_retail,
      margin_rp: shj.marginRp,
      margin_persen: shj.marginPersen
    };
  });

  const totalCatalogValue = products.reduce((acc, p) => acc + p.harga_grosir, 0);
  const totalOrdersAmount = orders.reduce((acc, o) => acc + o.grand_total, 0);
  const totalDofCollected = orders.reduce((acc, o) => acc + (o.total_dof_fee || 0), 0);

  res.json({
    success: true,
    data: {
      products_shj: productShj,
      summary: {
        total_products: products.length,
        total_orders: orders.length,
        pending_warehouse: orders.filter(o => o.status === 'PENDING_WAREHOUSE').length,
        picking: orders.filter(o => o.status === 'PICKING').length,
        ready_for_delivery: orders.filter(o => o.status === 'READY_FOR_DELIVERY').length,
        completed: orders.filter(o => o.status === 'COMPLETED').length,
        total_catalog_value: totalCatalogValue,
        total_revenue: totalOrdersAmount,
        total_dof_fee: totalDofCollected
      }
    }
  });
});

// GET /api/database/sql - Raw SQL scripts
app.get('/api/database/sql', (req: Request, res: Response) => {
  res.json({
    success: true,
    sql: SQL_DDL_AND_SEED
  });
});

// POST /api/database/reset - Reset to factory seed
app.post('/api/database/reset', (req: Request, res: Response) => {
  products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
  users = JSON.parse(JSON.stringify(INITIAL_USERS));

  res.json({
    success: true,
    message: 'Database berhasil di-reset ke data seed awal.',
    total_products: products.length,
    total_orders: orders.length
  });
});

// -------------------------------------------------------------
// VITE INTEGRATION & SERVER START
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DOF & SHJ System] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
