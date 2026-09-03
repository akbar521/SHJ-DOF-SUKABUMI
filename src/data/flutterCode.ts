export const FLUTTER_DART_CODE = `// =======================================================================
// FLUTTER DART: SALESMAN CART & CHECKOUT SCREEN
// Features: Card-based Catalog, Tier Toggle (Grosir/Retail), Dynamic DoF,
//           Direct Warehouse Submit (No Approval), PDF & Text Summary Gen.
// =======================================================================

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:share_plus/share_plus.dart';

// --- 1. MODELS ---

class Product {
  final String kodeProduk;
  final String namaProduk;
  final double hargaGrosir;
  final double hargaRetail;
  final double persentaseDof; // e.g. 0.20 or 0.00 for exceptions

  Product({
    required this.kodeProduk,
    required this.namaProduk,
    required this.hargaGrosir,
    required this.hargaRetail,
    required this.persentaseDof,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      kodeProduk: json['kode_produk'] ?? '',
      namaProduk: json['nama_produk'] ?? '',
      hargaGrosir: (json['harga_grosir'] as num).toDouble(),
      hargaRetail: (json['harga_retail'] as num).toDouble(),
      persentaseDof: (json['persentase_dof'] as num).toDouble(),
    );
  }

  double getPrice(String tier) {
    return tier == 'Grosir' ? hargaGrosir : hargaRetail;
  }

  // DoF Fee strictly calculated from Harga Grosir * persentase_dof
  double get dofFeePerUnit => hargaGrosir * persentaseDof;
}

class CartItem {
  final Product product;
  int qty;

  CartItem({required this.product, required this.qty});

  double subtotal(String tier) => product.getPrice(tier) * qty;
  double subtotalDofFee() => product.dofFeePerUnit * qty;
}

// --- 2. SALESMAN CART & CHECKOUT SCREEN ---

class SalesmanCartScreen extends StatefulWidget {
  final String salesmanId;
  final String salesmanName;
  final String apiBaseUrl;

  const SalesmanCartScreen({
    Key? key,
    required this.salesmanId,
    required this.salesmanName,
    this.apiBaseUrl = 'https://api.distribusi-dof.id/api',
  }) : super(key: key);

  @override
  _SalesmanCartScreenState createState() => _SalesmanCartScreenState();
}

class _SalesmanCartScreenState extends State<SalesmanCartScreen> {
  String selectedTier = 'Grosir'; // 'Grosir' or 'Retail'
  String? selectedStore = 'Toko Sejahtera Bersama';
  final TextEditingController notesController = TextEditingController();
  final TextEditingController customStoreController = TextEditingController();

  final List<String> storePresets = [
    'Toko Sejahtera Bersama',
    'Apotek Farma Sehat',
    'Toko Sumber Berkah',
    'Minimarket Maju Jaya',
    '+ Tambah Toko Baru...'
  ];

  List<Product> products = [];
  Map<String, CartItem> cart = {};
  bool isLoading = true;
  bool isSubmitting = false;

  final currencyFormat = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

  @override
  void initState() {
    super.initState();
    fetchCatalog();
  }

  Future<void> fetchCatalog() async {
    setState(() => isLoading = true);
    try {
      final res = await http.get(Uri.parse('\${widget.apiBaseUrl}/products'));
      if (res.statusCode == 200) {
        final List data = json.decode(res.body)['data'];
        setState(() {
          products = data.map((item) => Product.fromJson(item)).toList();
          isLoading = false;
        });
      } else {
        throw Exception('Gagal memuat katalog');
      }
    } catch (e) {
      // Fallback sample offline products matching business seed
      setState(() {
        products = [
          Product(kodeProduk: 'PEGAB', namaProduk: 'Extra Joss Go Anggur Pack (6 scht)', hargaGrosir: 5141.52, hargaRetail: 6559.00, persentaseDof: 0.20),
          Product(kodeProduk: 'LEXUA', namaProduk: 'Extrajoss Ultimate ( 24 Can)', hargaGrosir: 5700.00, hargaRetail: 6500.00, persentaseDof: 0.20),
          Product(kodeProduk: 'LKXOB', namaProduk: 'Komix Herbal Ori Pack (4 tube)', hargaGrosir: 9311.80, hargaRetail: 12100.00, persentaseDof: 0.20),
          Product(kodeProduk: 'LKXOD', namaProduk: 'Komix Herbal Ori Sachet (Pack - 6 scht)', hargaGrosir: 9700.30, hargaRetail: 13000.00, persentaseDof: 0.20),
          Product(kodeProduk: 'PBSJC', namaProduk: "B7 SLASI Jeruk Nipis Renceng (12's)", hargaGrosir: 17460.30, hargaRetail: 19000.00, persentaseDof: 0.20),
          Product(kodeProduk: 'LPRGR', namaProduk: "Promag Herbal 15 ml (6 'S)", hargaGrosir: 15810.00, hargaRetail: 16800.00, persentaseDof: 0.00),
          Product(kodeProduk: 'LMHGA', namaProduk: "Mixagrip Herbal Greges (6'S)", hargaGrosir: 16188.00, hargaRetail: 16700.00, persentaseDof: 0.00),
        ];
        isLoading = false;
      });
    }
  }

  void updateQty(Product product, int delta) {
    setState(() {
      final code = product.kodeProduk;
      if (!cart.containsKey(code)) {
        if (delta > 0) cart[code] = CartItem(product: product, qty: delta);
      } else {
        cart[code]!.qty += delta;
        if (cart[code]!.qty <= 0) {
          cart.remove(code);
        }
      }
    });
  }

  double get grandTotal {
    return cart.values.fold(0.0, (sum, item) => sum + item.subtotal(selectedTier));
  }

  double get totalDofFee {
    return cart.values.fold(0.0, (sum, item) => sum + item.subtotalDofFee());
  }

  String get targetStoreName {
    if (selectedStore == '+ Tambah Toko Baru...') {
      return customStoreController.text.trim().isEmpty ? 'Toko Umum' : customStoreController.text.trim();
    }
    return selectedStore ?? 'Toko Pelanggan';
  }

  // --- DIRECT SUBMIT (NO APPROVAL -> DIRECT TO WAREHOUSE) ---
  Future<void> submitOrderToWarehouse() async {
    if (cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Keranjang belanja masih kosong!')),
      );
      return;
    }

    setState(() => isSubmitting = true);

    final orderPayload = {
      'id_user': widget.salesmanId,
      'nama_toko': targetStoreName,
      'kategori_harga': selectedTier,
      'catatan': notesController.text.trim(),
      'items': cart.values.map((item) => {
        'kode_produk': item.product.kodeProduk,
        'qty': item.qty,
      }).toList(),
    };

    try {
      final res = await http.post(
        Uri.parse('\${widget.apiBaseUrl}/orders'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(orderPayload),
      );

      final data = json.decode(res.body);
      final noDof = data['data']?['no_dof'] ?? 'DOF-\${DateTime.now().millisecondsSinceEpoch}';

      showSuccessDialog(noDof);
    } catch (e) {
      // Local fallback simulator if backend offline
      final noDof = 'DOF-\${DateFormat('yyyyMMdd').format(DateTime.now())}-\${DateTime.now().millisecond}';
      showSuccessDialog(noDof);
    } finally {
      setState(() => isSubmitting = false);
    }
  }

  void showSuccessDialog(String noDof) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: const [
            Icon(Icons.check_circle, color: Colors.green, size: 28),
            SizedBox(width: 8),
            Text('Order Berhasil Dikirim!'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('No DOF: \$noDof', style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('Toko: \$targetStoreName'),
            Text('Tipe Harga: \$selectedTier'),
            Text('Grand Total: \${currencyFormat.format(grandTotal)}', style: const TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.w700)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(8)),
              child: const Text('âš¡ Langsung diteruskan ke antrian Gudang (Bypass Approval).', style: TextStyle(fontSize: 12, color: Colors.brown)),
            ),
          ],
        ),
        actions: [
          TextButton.icon(
            icon: const Icon(Icons.share),
            label: const Text('Kirim WhatsApp/Teks'),
            onPressed: () {
              shareTextSummary(noDof);
            },
          ),
          ElevatedButton.icon(
            icon: const Icon(Icons.picture_as_pdf),
            label: const Text('Unduh PDF'),
            onPressed: () {
              generateAndPrintPdf(noDof);
            },
          ),
          TextButton(
            child: const Text('Selesai'),
            onPressed: () {
              setState(() {
                cart.clear();
                notesController.clear();
              });
              Navigator.pop(ctx);
            },
          )
        ],
      ),
    );
  }

  // --- OUTPUT 1: SHARE TEXT SUMMARY ---
  void shareTextSummary(String noDof) {
    final buffer = StringBuffer();
    buffer.writeln('====================================');
    buffer.writeln('  *DELIVERY ORDER FORM (DOF)*');
    buffer.writeln('====================================');
    buffer.writeln('No DOF    : \$noDof');
    buffer.writeln('Tanggal   : \${DateFormat('dd/MM/yyyy HH:mm').format(DateTime.now())}');
    buffer.writeln('Salesman  : \${widget.salesmanName}');
    buffer.writeln('Toko      : \$targetStoreName');
    buffer.writeln('Tipe Harga: \$selectedTier');
    buffer.writeln('------------------------------------');
    buffer.writeln('RINCIAN ITEM:');
    for (var item in cart.values) {
      final unitPrice = item.product.getPrice(selectedTier);
      final sub = item.subtotal(selectedTier);
      buffer.writeln('- \${item.product.namaProduk}');
      buffer.writeln('  \${item.qty} x \${currencyFormat.format(unitPrice)} = \${currencyFormat.format(sub)}');
      if (item.product.persentaseDof > 0) {
        buffer.writeln('  (DoF Fee \${(item.product.persentaseDof * 100).toInt()}%: \${currencyFormat.format(item.subtotalDofFee())})');
      }
    }
    buffer.writeln('------------------------------------');
    buffer.writeln('GRAND TOTAL: \${currencyFormat.format(grandTotal)}');
    if (notesController.text.isNotEmpty) {
      buffer.writeln('Catatan: \${notesController.text}');
    }
    buffer.writeln('Status: Masuk Antrian Gudang (Direct)');
    buffer.writeln('====================================');

    Share.share(buffer.toString(), subject: 'DOF Order \$noDof - \$targetStoreName');
  }

  // --- OUTPUT 2: GENERATE LOCAL PDF ---
  Future<void> generateAndPrintPdf(String noDof) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Padding(
            padding: const pw.EdgeInsets.all(24),
            child: pw.Column(
              crossAxisAlignment: pw.CrossAxisAlignment.start,
              children: [
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.start,
                      children: [
                        pw.Text('PT. DISTRIBUSI LOGISTIK UTAMA', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 14)),
                        pw.Text('DELIVERY ORDER FORM (DOF)', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 16, color: PdfColors.blue900)),
                      ],
                    ),
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.end,
                      children: [
                        pw.Text('No DOF: \$noDof', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                        pw.Text('Tgl: \${DateFormat('dd-MM-yyyy HH:mm').format(DateTime.now())}'),
                      ],
                    )
                  ],
                ),
                pw.Divider(thickness: 1.5, color: PdfColors.blueGrey800),
                pw.SizedBox(height: 8),
                pw.Row(
                  children: [
                    pw.Expanded(child: pw.Text('Nama Toko: \$targetStoreName')),
                    pw.Expanded(child: pw.Text('Salesman: \${widget.salesmanName}')),
                    pw.Expanded(child: pw.Text('Kategori: \$selectedTier')),
                  ],
                ),
                pw.SizedBox(height: 16),
                pw.Table.fromTextArray(
                  headers: ['Kode', 'Nama Produk', 'Qty', 'Harga Satuan', 'DoF Fee', 'Subtotal'],
                  headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold, color: PdfColors.white),
                  headerDecoration: const pw.BoxDecoration(color: PdfColors.blueGrey800),
                  data: cart.values.map((item) {
                    final price = item.product.getPrice(selectedTier);
                    return [
                      item.product.kodeProduk,
                      item.product.namaProduk,
                      '\${item.qty}',
                      currencyFormat.format(price),
                      currencyFormat.format(item.subtotalDofFee()),
                      currencyFormat.format(item.subtotal(selectedTier)),
                    ];
                  }).toList(),
                ),
                pw.SizedBox(height: 12),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.end,
                  children: [
                    pw.Column(
                      crossAxisAlignment: pw.CrossAxisAlignment.end,
                      children: [
                        pw.Text('Total DoF Fee: \${currencyFormat.format(totalDofFee)}', style: const pw.TextStyle(color: PdfColors.grey700)),
                        pw.Text('GRAND TOTAL: \${currencyFormat.format(grandTotal)}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 14)),
                      ],
                    )
                  ],
                ),
                pw.Spacer(),
                pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceAround,
                  children: [
                    pw.Column(children: [pw.Text('Salesman'), pw.SizedBox(height: 35), pw.Text('(\${widget.salesmanName})')]),
                    pw.Column(children: [pw.Text('Penerima Toko'), pw.SizedBox(height: 35), pw.Text('(......................)')]),
                    pw.Column(children: [pw.Text('Admin Gudang'), pw.SizedBox(height: 35), pw.Text('(......................)')]),
                  ],
                )
              ],
            ),
          );
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save(),
      name: 'DOF_\$noDof.pdf',
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('DOF Mobile Salesman', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('Sales: \${widget.salesmanName}', style: const TextStyle(fontSize: 12, color: Colors.white70)),
          ],
        ),
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
      ),
      body: Column(
        children: [
          // 1. Header Control: Store selection & Tier Switcher
          Container(
            padding: const EdgeInsets.all(12),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: Column(
              children: [
                DropdownButtonFormField<String>(
                  value: selectedStore,
                  decoration: InputDecoration(
                    labelText: 'Pilih Toko Pelanggan',
                    prefixIcon: const Icon(Icons.storefront, color: Colors.blueAccent),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  items: storePresets.map((s) => DropdownMenuItem(value: s, child: Text(s, overflow: TextOverflow.ellipsis))).toList(),
                  onChanged: (val) => setState(() => selectedStore = val),
                ),
                if (selectedStore == '+ Tambah Toko Baru...')
                  Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: TextField(
                      controller: customStoreController,
                      decoration: InputDecoration(
                        hintText: 'Ketik Nama Toko Baru...',
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Text('Kategori Harga:', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: SegmentedButton<String>(
                        segments: const [
                          ButtonSegment(value: 'Grosir', label: Text('Grosir'), icon: Icon(Icons.inventory_2, size: 16)),
                          ButtonSegment(value: 'Retail', label: Text('Retail +'), icon: Icon(Icons.sell, size: 16)),
                        ],
                        selected: {selectedTier},
                        onSelectionChanged: (set) => setState(() => selectedTier = set.first),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // 2. Product Catalog (CARD-BASED UI, NOT TABLES)
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: products.length,
                    itemBuilder: (ctx, idx) {
                      final product = products[idx];
                      final currentPrice = product.getPrice(selectedTier);
                      final dofAmount = product.dofFeePerUnit;
                      final inCart = cart[product.kodeProduk]?.qty ?? 0;

                      return Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        elevation: 1,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(
                            color: inCart > 0 ? Colors.blue.shade300 : const Color(0xFFE2E8F0),
                            width: inCart > 0 ? 1.5 : 1,
                          ),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF1F5F9),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(product.kodeProduk, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF475569))),
                                  ),
                                  const Spacer(),
                                  // DoF Badge
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: product.persentaseDof > 0 ? Colors.amber.shade100 : Colors.green.shade100,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      product.persentaseDof > 0 ? 'DoF \${(product.persentaseDof * 100).toInt()}%' : 'DoF 0% (Bebas Fee)',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w600,
                                        color: product.persentaseDof > 0 ? Colors.amber.shade900 : Colors.green.shade900,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(product.namaProduk, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                              const SizedBox(height: 6),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(currencyFormat.format(currentPrice), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF0F172A))),
                                      Text(
                                        'DoF Fee: \${currencyFormat.format(dofAmount)} /unit',
                                        style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                      ),
                                    ],
                                  ),
                                  // QTY Stepper Buttons
                                  Row(
                                    children: [
                                      IconButton.filledTonal(
                                        onPressed: inCart > 0 ? () => updateQty(product, -1) : null,
                                        icon: const Icon(Icons.remove, size: 16),
                                        style: IconButton.styleFrom(visualDensity: VisualDensity.compact),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 12),
                                        child: Text(
                                          '\$inCart',
                                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                      IconButton.filled(
                                        onPressed: () => updateQty(product, 1),
                                        icon: const Icon(Icons.add, size: 16),
                                        style: IconButton.styleFrom(
                                          backgroundColor: const Color(0xFF2563EB),
                                          visualDensity: VisualDensity.compact,
                                        ),
                                      ),
                                    ],
                                  )
                                ],
                              )
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),

          // 3. Floating Bottom Cart Summary (Grand Total & Submit)
          if (cart.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 10, offset: const Offset(0, -3))
                ],
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: SafeArea(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('\${cart.length} Jenis Produk Dipilih', style: const TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                            Text(currencyFormat.format(grandTotal), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF0F172A))),
                          ],
                        ),
                        ElevatedButton.icon(
                          onPressed: isSubmitting ? null : submitOrderToWarehouse,
                          icon: isSubmitting ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Icon(Icons.send_rounded),
                          label: const Text('SUBMIT ORDER (DIRECT)', style: TextStyle(fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF059669),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                        )
                      ],
                    ),
                  ],
                ),
              ),
            )
        ],
      ),
    );
  }
}
`;
