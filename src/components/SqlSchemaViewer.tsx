import { useState } from 'react';
import { SQL_DDL_AND_SEED } from '../data/sqlSchema';
import { Copy, Check, Download, Database, Server, Terminal, ShieldCheck, Zap } from 'lucide-react';

export function SqlSchemaViewer() {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'SQL' | 'API'>('SQL');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_DDL_AND_SEED);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([SQL_DDL_AND_SEED], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dof_shj_schema_and_seed.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTestApi = async (endpoint: string, method: string = 'GET', body?: object) => {
    setIsLoadingApi(true);
    setTestResponse(null);
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'API Request failed';
      setTestResponse(JSON.stringify({ error: message }, null, 2));
    } finally {
      setIsLoadingApi(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>Database Architecture & REST API Spec</span>
          </div>
          <h2 className="text-lg font-black text-white mt-1">
            Relational SQL Schema & Backend REST API Endpoints
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict decimal precision handling (DECIMAL(10,2), DECIMAL(12,4)), dynamic DoF column, and RESTful CRUD endpoints.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-slate-800 p-1 rounded-xl flex space-x-1 border border-slate-700">
            <button
              onClick={() => setActiveTab('SQL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'SQL' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              SQL Script & Seed
            </button>
            <button
              onClick={() => setActiveTab('API')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'API' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              REST API Console
            </button>
          </div>

          {activeTab === 'SQL' && (
            <>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold border border-slate-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin SQL'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh .sql</span>
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'SQL' ? (
        <div className="space-y-4">
          {/* Rules highlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Ketelitian Angka Pecahan (Decimal)</span>
              </div>
              <p className="text-xs text-slate-600">
                Kolom harga menggunakan <code>DECIMAL(10,2)</code> dan <code>DECIMAL(12,2)</code> untuk mencegah rounding loss pada nilai seperti <code>5141.52</code> atau <code>17460.30</code>.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Dynamic DoF Column (No Hardcode)</span>
              </div>
              <p className="text-xs text-slate-600">
                Kolom <code>persentase_dof DECIMAL(3,2)</code> pada tabel <code>produk</code> memungkinkan konfigurasi fleksibel (20%, 0% bebas fee untuk Promag/Mixagrip, atau nilai lain).
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5 mb-1">
                <Server className="w-4 h-4 text-blue-600" />
                <span>Relational Integrity & Foreign Keys</span>
              </div>
              <p className="text-xs text-slate-600">
                Tabel <code>dof_header</code> berelasi ke <code>users</code> dan <code>dof_detail</code> berelasi ke <code>dof_header</code> (Cascade) & <code>produk</code> (Restrict).
              </p>
            </div>
          </div>

          {/* SQL Editor Screen */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="font-mono text-xs text-slate-400 ml-2">dof_shj_schema_and_seed.sql</span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">PostgreSQL / MySQL 8.x Compatible</span>
            </div>

            <div className="p-4 max-h-[560px] overflow-y-auto font-mono text-xs text-emerald-300 leading-relaxed bg-slate-950 selection:bg-emerald-700 selection:text-white">
              <pre className="whitespace-pre">
                <code>{SQL_DDL_AND_SEED}</code>
              </pre>
            </div>
          </div>
        </div>
      ) : (
        /* REST API Documentation & Live Test Harness */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Endpoints List */}
            <div className="space-y-3">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-blue-600" />
                  <span>REST API Endpoints Specification</span>
                </h3>

                {/* 1. GET /api/products */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="bg-emerald-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded">GET</span>
                      <span className="font-mono text-xs font-bold text-slate-800">/api/products</span>
                    </div>
                    <button
                      onClick={() => handleTestApi('/api/products')}
                      className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 px-2.5 py-1 rounded-md font-semibold transition"
                    >
                      Test Run
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Mengambil seluruh katalog produk beserta kalkulasi SHJ & DoF Fee.</p>
                </div>

                {/* 2. POST /api/orders */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded">POST</span>
                      <span className="font-mono text-xs font-bold text-slate-800">/api/orders</span>
                    </div>
                    <button
                      onClick={() => handleTestApi('/api/orders', 'POST', {
                        id_user: 'USR-001',
                        nama_toko: 'Apotek Mandiri Jaya (API Test)',
                        kategori_harga: 'Grosir',
                        catatan: 'Order dari console tester',
                        items: [
                          { kode_produk: 'PEGAB', qty: 5 },
                          { kode_produk: 'LPRGR', qty: 2 }
                        ]
                      })}
                      className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 px-2.5 py-1 rounded-md font-semibold transition"
                    >
                      Test Run
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Submit DOF Order langsung ke antrian gudang (No Approval System).</p>
                </div>

                {/* 3. GET /api/warehouse/orders */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="bg-emerald-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded">GET</span>
                      <span className="font-mono text-xs font-bold text-slate-800">/api/warehouse/orders</span>
                    </div>
                    <button
                      onClick={() => handleTestApi('/api/warehouse/orders')}
                      className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 px-2.5 py-1 rounded-md font-semibold transition"
                    >
                      Test Run
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Live stream antrian order masuk untuk staf gudang dan picking.</p>
                </div>

                {/* 4. GET /api/shj/monitor */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="bg-purple-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded">GET</span>
                      <span className="font-mono text-xs font-bold text-slate-800">/api/shj/monitor</span>
                    </div>
                    <button
                      onClick={() => handleTestApi('/api/shj/monitor')}
                      className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 px-2.5 py-1 rounded-md font-semibold transition"
                    >
                      Test Run
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Metrik Struktur Harga Jual, margin profit, dan akumulasi DoF fee.</p>
                </div>
              </div>
            </div>

            {/* Live API Console Output */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col min-h-[400px]">
              <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <span className="font-mono text-xs text-slate-300">Live JSON Response Output</span>
                {isLoadingApi && <span className="text-[11px] text-amber-400 font-mono animate-pulse">Fetching...</span>}
              </div>

              <div className="p-4 flex-1 overflow-y-auto font-mono text-xs text-emerald-400 leading-relaxed bg-slate-950">
                {testResponse ? (
                  <pre className="whitespace-pre-wrap">{testResponse}</pre>
                ) : (
                  <div className="text-slate-500 text-center py-20">
                    Klik tombol "Test Run" di sebelah kiri untuk melihat respons JSON live dari backend REST API.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
