import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";

// All treatment data comes from AppContext/backend (no hardcoded master data)

const TREATMENT_FEE_DEDUCTION = 75000; // Rp75.000 potongan per treatment
const MAX_TREATMENT_FEE = 250000; // Rp250.000 maksimal fee
const MIN_TREATMENT_FEE = 25000; // Rp25.000 minimal fee setelah potongan

// FEE OTOMATIS BERDASARKAN KATEGORI
function getFeeByCategory(category) {
  const lower = String(category || '').toLowerCase();

  if (
    lower.includes("package") ||
    lower.includes("bundle") ||
    lower.includes("deal")
  ) {
    return 10; // fee paket/bundling
  }

  return 15; // fee single treatment
}

// Hitung fee treatment dengan batasan max dan potongan Rp75.000
function calculateTreatmentFee(harga, category) {
  const percentageRate = getFeeByCategory(category);
  const calculatedFee = (harga * percentageRate) / 100;
  
  // Cap fee agar tidak jadi jutaan
  const cappedFee = Math.min(calculatedFee, MAX_TREATMENT_FEE);
  
  // Kurangi dengan potongan Rp75.000
  const netFee = cappedFee - TREATMENT_FEE_DEDUCTION;
  
  if (cappedFee > 0 && netFee <= 0) {
    return MIN_TREATMENT_FEE;
  }
  
  return Math.max(netFee, 0);
}

export default function TreatmentKaryawan() {
  const { treatmentData = [], addTreatment, addGaji, userProfile } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [showCatat, setShowCatat] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [pasien, setPasien] = useState("");
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0,10));

  // FILTER DATA BY SEARCH
  const filteredData = Array.isArray(treatmentData) ? treatmentData.filter((item) =>
    String(item.nama || '').toLowerCase().includes(search.toLowerCase()) ||
    String(item.category || '').toLowerCase().includes(search.toLowerCase())
  ) : [];

  // Format harga ke Rupiah
  const formatHarga = (harga) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(harga) || 0);
  };

  return (
    <div className="space-y-8 pb-8">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(204, 69, 222, 0.2); }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
        .animate-slide-down { animation: slideDown 0.6s ease-out forwards; }
      `}</style>

      <main>
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between animate-slide-down">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Daftar Treatment</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="inline-block text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" />
                </svg>
              </span>
              <span className="text-gray-400">Treatment Layanan</span>
            </div>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden card-hover animate-slide-up">
          <div className="border-b-2 border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900">📋 Daftar Treatment Tersedia</h2>
          </div>

          {/* Search Bar */}
          <div className="bg-gray-50 p-6 border-b-2 border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Cari treatment berdasarkan nama atau kategori..."
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-semibold text-gray-700"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">Total ditemukan: <span className="font-bold text-purple-600">{filteredData.length}</span> treatment</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-white">
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">No.</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Nama Treatment</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Kategori</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Harga</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Fee (%)</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((t, idx) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <td className="px-8 py-5 bg-gray-100 text-gray-800 font-semibold">{idx + 1}.</td>
                    <td className="px-8 py-5 bg-gray-100 text-gray-800 font-medium">{t.nama}</td>
                    <td className="px-8 py-5 bg-gray-100 text-gray-800 text-sm">{t.category}</td>
                    <td className="px-8 py-5 bg-gray-100 text-gray-800 font-semibold">{formatHarga(t.harga)}</td>
                    <td className="px-8 py-5 bg-gray-100 text-gray-800">{getFeeByCategory(t.category)}%</td>
                    <td className="px-8 py-5 bg-gray-100 text-center">
                      <div className="space-x-2">
                        <button
                          onClick={() => { setDetailData(t); setShowDetail(true); }}
                          className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
                        >
                          Detail
                        </button>

                        <button
                          onClick={() => { setSelectedTreatment(t); setPasien(''); setTanggal(new Date().toISOString().slice(0,10)); setShowCatat(true); }}
                          className="text-green-600 font-bold hover:text-green-700 transition-colors"
                        >
                          Catat
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && (
              <div className="text-center py-16">
                <p className="text-2xl text-gray-400">📭 Belum ada data treatment</p>
              </div>
            )}
          </div>
        </div>

        {/* === Modal Detail === */}
        {showDetail && detailData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">👁️ Detail Treatment</h2>
                <button onClick={() => setShowDetail(false)} className="text-2xl text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">🏷️ Nama Treatment</label>
                  <p className="border-2 border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-gray-800 font-medium">{detailData.nama}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">📂 Kategori</label>
                  <p className="border-2 border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-gray-800 font-medium">{detailData.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">💰 Harga</label>
                  <p className="border-2 border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-gray-800 font-medium">{formatHarga(detailData.harga)}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">📊 Fee</label>
                  <p className="border-2 border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-gray-800 font-medium">{getFeeByCategory(detailData.category)}%</p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setShowDetail(false)} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all">✕ Tutup</button>
              </div>
            </div>
          </div>
        )}

        {/* === Modal Catat (Karyawan) === */}
        {showCatat && selectedTreatment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-[520px]">
              <h2 className="text-xl font-bold mb-4">Catat Treatment</h2>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-semibold">Nama Karyawan</label>
                  <input type="text" value={(userProfile && (userProfile.name || userProfile.nama)) || ""} disabled className="w-full border p-2 rounded bg-gray-100" />
                </div>

                <div>
                  <label className="block text-sm font-semibold">Tanggal</label>
                  <input type="date" value={tanggal} onChange={(e)=>setTanggal(e.target.value)} className="w-full border p-2 rounded" />
                </div>

                <div>
                  <label className="block text-sm font-semibold">Nama Pasien</label>
                  <input type="text" value={pasien} onChange={(e)=>setPasien(e.target.value)} className="w-full border p-2 rounded" />
                </div>

                <div>
                  <label className="block text-sm font-semibold">Treatment</label>
                  <input type="text" value={selectedTreatment.nama} disabled className="w-full border p-2 rounded bg-gray-100" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold">Harga</label>
                    <input type="number" value={selectedTreatment.harga} disabled className="w-full border p-2 rounded bg-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">Fee (%)</label>
                    <input type="number" value={getFeeByCategory(selectedTreatment.category)} disabled className="w-full border p-2 rounded bg-gray-100" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold">Total Fee</label>
                  <p className="p-2 border rounded bg-gray-50">{formatHarga(calculateTreatmentFee(selectedTreatment.harga, selectedTreatment.category))}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={()=>setShowCatat(false)} className="px-4 py-2 border rounded">Batal</button>
                <button onClick={async ()=>{
                  if(!pasien){ alert('Masukkan nama pasien'); return; }

                  const feePercent = 15;
                  const feeAmount = Math.round((Number(selectedTreatment.harga || 0) * feePercent) / 100);

                  const treatmentPayload = {
                    karyawanId: userProfile?.id || userProfile?._id || null,
                    nama: (userProfile && (userProfile.name || userProfile.nama)) || '',
                    tipeLayanan: selectedTreatment.category || 'Treatment',
                    tanggal: new Date(tanggal).toISOString(),
                    treatment: selectedTreatment.nama,
                    biaya: selectedTreatment.harga || 0,
                    pasien: pasien,
                    fee: feeAmount,
                    feePercent,
                    feeAmount
                  };

                  try{
                    if(addTreatment) await addTreatment(treatmentPayload);

                    // create gaji entry
                    const now = new Date(tanggal);
                    const periode = `${String(now.getMonth() + 1).padStart(2,'0')}-${now.getFullYear()}`;
                    const gajiPokok = Number(userProfile?.gajiPokok || 0);
                    const tunjangan = Number(userProfile?.tunjangan || 0);
                    const potonganAsuransi = Number(userProfile?.asuransi || 0);
                    const potonganTax = Number(userProfile?.pajak || 0);
                    const gajiKotor = gajiPokok + feeAmount + tunjangan;
                    const gajiNetto = gajiKotor - potonganAsuransi - potonganTax;

                    const gajiPayload = {
                      karyawanId: userProfile?.id || userProfile?._id || null,
                      karyawan: (userProfile && (userProfile.name || userProfile.nama)) || '',
                      nama: (userProfile && (userProfile.name || userProfile.nama)) || '',
                      tanggal: new Date(tanggal).toISOString(),
                      pasien,
                      treatment: selectedTreatment.nama,
                      harga: selectedTreatment.harga || 0,
                      fee: feePercent,
                      feePercent,
                      feeAmount,
                      periode,
                      gajiPokok,
                      tunjangan,
                      bonus: feeAmount,
                      potonganAsuransi,
                      potonganTax,
                      gajiKotor,
                      gajiNetto
                    };

                    if(addGaji) await addGaji(gajiPayload);

                    setShowCatat(false);
                    setSelectedTreatment(null);
                    setPasien('');
                    alert('Treatment dan data gaji berhasil dicatat');
                  }catch(err){
                    console.error('Gagal simpan catat karyawan:', err);
                    alert('Gagal menyimpan data. Cek koneksi ke server.');
                  }
                }} className="px-4 py-2 bg-green-600 text-white rounded">Simpan</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


