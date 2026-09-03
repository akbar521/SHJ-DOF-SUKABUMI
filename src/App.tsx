import { useState, useEffect, useCallback } from 'react';
import { Product } from './types';
import { api } from './services/apiService';
import { Navbar, ActiveTab } from './components/Navbar';
import { SimpleDofShjCalculator } from './components/SimpleDofShjCalculator';
import { ProductMasterData } from './components/ProductMasterData';
import { FlutterCodeViewer } from './components/FlutterCodeViewer';
import { SqlSchemaViewer } from './components/SqlSchemaViewer';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch initial data
  const loadData = useCallback(async () => {
    try {
      const prods = await api.getProducts();
      setProducts(prods);
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Product CRUD Handlers
  const handleAddProduct = async (productData: Partial<Product>) => {
    const created = await api.createProduct(productData);
    setProducts(prev => [...prev, created]);
  };

  const handleUpdateProduct = async (kode: string, productData: Partial<Product>) => {
    const updated = await api.updateProduct(kode, productData);
    setProducts(prev => prev.map(p => p.kode_produk === kode ? updated : p));
  };

  const handleDeleteProduct = async (kode: string) => {
    await api.deleteProduct(kode);
    setProducts(prev => prev.filter(p => p.kode_produk !== kode));
  };

  const handleResetDatabase = async () => {
    await api.resetDatabase();
    await loadData();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* PWA Mobile Install Banner */}
      <PWAInstallButton variant="banner" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-600">Memuat Sistem Laporan Harian Kalbe...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'calculator' && (
              <SimpleDofShjCalculator products={products} />
            )}

            {activeTab === 'master_data' && (
              <ProductMasterData
                products={products}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onResetDatabase={handleResetDatabase}
              />
            )}

            {activeTab === 'flutter_dart' && (
              <FlutterCodeViewer />
            )}

            {activeTab === 'sql_api' && (
              <SqlSchemaViewer />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>KALBE • Motoris MMTW Sukabumi</div>
          <div>Laporan Harian &amp; Struktur Harga Jual (SHJ &amp; DOF)</div>
        </div>
      </footer>

      {/* Connectivity / Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}
