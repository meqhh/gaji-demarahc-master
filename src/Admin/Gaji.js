import React, { useState, useEffect } from "react";

// === Modal Tambah/Edit Tindakan === //
function FeeTindakanModal({ show, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(
    initialData || { pasien: "", alamat: "", treatment: "", harga: "", fee: "" }
  );

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form); 
    setForm({ pasien: "", alamat: "", treatment: "", harga: "", fee: "" });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 animate-slide-up">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-semibold text-gray-900">
              {initialData ? "Edit Tindakan" : "Tambah Tindakan"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-500">Kelola data tindakan dan fee</p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Nama Pasien */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Pasien</label>
            <input
              id="pasien"
              placeholder="Masukkan nama pasien"
              value={form.pasien}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
              required
            />
          </div>

          {/* Alamat */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
            <input
              id="alamat"
              placeholder="Masukkan alamat"
              value={form.alamat}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
              required
            />
          </div>

          {/* Jenis Treatment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Treatment</label>
            <input
              id="treatment"
              placeholder="Masukkan jenis treatment"
              value={form.treatment}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
              required
            />
          </div>

          {/* Harga & Fee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Harga Treatment</label>
              <input
                type="number"
                id="harga"
                placeholder="Masukkan harga"
                value={form.harga}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fee (%)</label>
              <input
                type="number"
                id="fee"
                placeholder="Masukkan fee"
                value={form.fee}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// === Modal Tambah/Edit Fee Paket === //
function FeePaketModal({ show, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(
    initialData || { pasien: "", paket: "", hargaPaket: "", fee: "" }
  );

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ pasien: "", paket: "", hargaPaket: "", fee: "" });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 animate-slide-up">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-semibold text-gray-900">
              {initialData ? "Edit Fee Paket" : "Tambah Fee Paket"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-500">Kelola data paket dan fee</p>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Nama Pasien */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Pasien</label>
            <input
              id="pasien"
              placeholder="Masukkan nama pasien"
              value={form.pasien}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
              required
            />
          </div>

          {/* Jenis Paket */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Paket</label>
            <input
              id="paket"
              placeholder="Masukkan jenis paket"
              value={form.paket}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
              required
            />
          </div>

          {/* Harga Paket & Fee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Harga Paket</label>
              <input
                type="number"
                id="hargaPaket"
                placeholder="Masukkan harga paket"
                value={form.hargaPaket}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Fee</label>
              <input
                type="number"
                id="fee"
                placeholder="Masukkan fee"
                value={form.fee}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// === Halaman Gaji === //
function Gaji() {
  const defaultGajiData = [
    { id: 1, pasien: "Andi Susilo", alamat: "Jl. Merdeka 12", treatment: "Home Visit - Pemeriksaan", harga: 150000, fee: 20 },
    { id: 2, pasien: "Siti Aminah", alamat: "Perum. Bunga", treatment: "Imunisasi", harga: 200000, fee: 25 },
    { id: 3, pasien: "Budi Santoso", alamat: "Jl. Melati", treatment: "Postnatal Care", harga: 300000, fee: 15 },
  ];

  const defaultFeePaket = [
    { id: 1, pasien: "Andi Susilo", paket: "Paket Antenatal", hargaPaket: 500000, fee: 80000 },
    { id: 2, pasien: "Siti Aminah", paket: "Paket Persalinan", hargaPaket: 1200000, fee: 200000 },
  ];

  const [gajiData, setGajiData] = useState(() => {
    try {
      const saved = localStorage.getItem("gajiData");
      return saved ? JSON.parse(saved) : defaultGajiData;
    } catch (e) {
      return defaultGajiData;
    }
  });

  const [feePaketData, setFeePaketData] = useState(() => {
    try {
      const saved = localStorage.getItem("feePaketData");
      return saved ? JSON.parse(saved) : defaultFeePaket;
    } catch (e) {
      return defaultFeePaket;
    }
  });

  useEffect(() => {
    localStorage.setItem("gajiData", JSON.stringify(gajiData));
  }, [gajiData]);

  useEffect(() => {
    localStorage.setItem("feePaketData", JSON.stringify(feePaketData));
  }, [feePaketData]);
  const [showModalTindakan, setShowModalTindakan] = useState(false);
  const [showModalPaket, setShowModalPaket] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editType, setEditType] = useState(null);
  
  // Filter state
  const [filterTanggal, setFilterTanggal] = useState("02");
  const [filterBulan, setFilterBulan] = useState("Juli");
  const [filterTahun, setFilterTahun] = useState("2025");
  const [filterKaryawan, setFilterKaryawan] = useState("Bidan Iga");

  // Tambah atau Edit Tindakan
  const handleTindakanSubmit = (data) => {
    if (editData) {
      setGajiData(gajiData.map((g) => (g.id === editData.id ? { ...data, id: g.id } : g)));
      setEditData(null);
      setEditType(null);
    } else {
      setGajiData([...gajiData, { ...data, id: Date.now() }]);
    }
  };

  // Tambah atau Edit Fee Paket
  const handlePaketSubmit = (data) => {
    if (editData) {
      setFeePaketData(feePaketData.map((f) => (f.id === editData.id ? { ...data, id: f.id } : f)));
      setEditData(null);
      setEditType(null);
    } else {
      setFeePaketData([...feePaketData, { ...data, id: Date.now() }]);
    }
  };

  // Delete
  const handleDelete = (id, type) => {
    if (type === "tindakan") {
      setGajiData(gajiData.filter((g) => g.id !== id));
    } else {
      setFeePaketData(feePaketData.filter((f) => f.id !== id));
    }
  };

  // Hitung total
  const totalFeeTindakan = gajiData.reduce(
    (acc, g) => acc + (Number(g.harga) * Number(g.fee)) / 100,
    0
  );
  const totalFeePaket = feePaketData.reduce(
    (acc, f) => acc + Number(f.fee),
    0
  );

  const gajiPokok = 2000000;
  const tunjangan = 1500000;
  const bonus = 300000;
  const feeTransport = 100000;
  const potonganBPJSTK = 50000;

  const grossFromFees = totalFeeTindakan + totalFeePaket + feeTransport;
  const gross = gajiPokok + tunjangan + bonus + grossFromFees;
  const totalGaji = gross - potonganBPJSTK;

  const formatRupiah = (angka) =>
    `Rp. ${Number(angka).toLocaleString('id-ID')}`;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-8px); box-shadow: 0 20px 50px -15px rgba(0,0,0,0.15); }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
        .animate-slide-down { animation: slideDown 0.5s ease-out; }
      `}</style>

      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between animate-slide-down">
        <div>
          <h1 className="text-4xl font-bold text-purple-600 mb-1">Gaji</h1>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="inline-block text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" />
              </svg>
            </span>
            <span className="text-gray-400">Gaji</span>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Tanggal</label>
          <select 
            value={filterTanggal}
            onChange={(e) => setFilterTanggal(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-800 bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:border-purple-400"
          >
            <option>01</option>
            <option>02</option>
            <option>03</option>
          </select>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Bulan</label>
          <select 
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-800 bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:border-purple-400"
          >
            <option>Januari</option>
            <option>Februari</option>
            <option>Maret</option>
            <option>April</option>
            <option>Mei</option>
            <option>Juni</option>
            <option>Juli</option>
          </select>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Tahun</label>
          <select 
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-800 bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:border-purple-400"
          >
            <option>2023</option>
            <option>2024</option>
            <option>2025</option>
          </select>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Karyawan</label>
          <select 
            value={filterKaryawan}
            onChange={(e) => setFilterKaryawan(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-800 bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:border-purple-400"
          >
            <option>Bidan Iga</option>
            <option>Bidan Siti</option>
            <option>Bidan Rina</option>
          </select>
        </div>
      </div>

      {/* Tabel Gaji */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden card-hover animate-slide-up mb-8" style={{ animationDelay: '0.3s' }}>
        <div className="border-b-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Gaji  <span className="text-gray-400 ml-2">Tabel tindakan per pasien</span></h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Pasien</th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Alamat</th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Treatment</th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Harga</th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Fee</th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Harga</th>
              </tr>
            </thead>
            <tbody>
              {gajiData.map((g, idx) => (
                <tr
                  key={g.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-all animate-slide-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <td className="px-8 py-5 bg-gray-100 text-gray-800 font-medium">{g.pasien}</td>
                  <td className="px-8 py-5 bg-gray-100 text-gray-800">{g.alamat}</td>
                  <td className="px-8 py-5 bg-gray-100 text-gray-800">{g.treatment}</td>
                  <td className="px-8 py-5 bg-gray-100 text-gray-800">Rp {Number(g.harga).toLocaleString("id-ID")}</td>
                  <td className="px-8 py-5 bg-gray-100 text-gray-800">{g.fee}%</td>
                  <td className="px-8 py-5 bg-gray-100 text-gray-800">Rp {(Number(g.harga) * Number(g.fee) / 100).toLocaleString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {gajiData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">📭 Belum ada data tindakan</p>
            </div>
          )}
        </div>

        {/* Tombol Tambah */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={() => { setEditData(null); setEditType("tindakan"); setShowModalTindakan(true); }}
            className="px-6 py-2.5 border-2 border-cyan-400 text-cyan-600 font-bold rounded-lg hover:bg-cyan-50 transition-all duration-300 flex items-center gap-2"
          >
            <span>+</span> Tambah gaji
          </button>
        </div>
      </div>

      {/* Komponen Gaji */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden card-hover animate-slide-up" style={{ animationDelay: '0.35s' }}>
        <div className="border-b-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Komponen Gaji</h2>
        </div>
        
        <div className="p-8 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-gray-800 font-semibold">Gaji Pokok</span>
            <span className="font-semibold text-gray-800">{formatRupiah(gajiPokok)}</span>
          </div>

          <div className="flex items-center justify-between pb-2">
            <span className="text-gray-800 font-semibold">Tunjangan</span>
            <span className="font-semibold text-gray-800">{formatRupiah(tunjangan)}</span>
          </div>

          <div className="flex items-center justify-between pb-2">
            <span className="text-gray-800 font-semibold">Bonus</span>
            <span className="font-semibold text-gray-800">{formatRupiah(bonus)}</span>
          </div>

          <div className="flex items-center justify-between pb-2">
            <span className="text-gray-800 font-semibold">Total Fee Tindakan</span>
            <span className="font-semibold text-gray-800">{formatRupiah(totalFeeTindakan)}</span>
          </div>

          <div className="flex items-center justify-between pb-2">
            <span className="text-gray-800 font-semibold">Total Fee Paket</span>
            <span className="font-semibold text-gray-800">{formatRupiah(totalFeePaket)}</span>
          </div>

          <div className="flex items-center justify-between pb-2">
            <span className="text-gray-800 font-semibold">Tunjangan Transport</span>
            <span className="font-semibold text-gray-800">{formatRupiah(feeTransport)}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-gray-800 font-semibold">Potongan BPJS/TK</span>
            <span className="font-semibold text-gray-800">-{formatRupiah(potonganBPJSTK)}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-lg font-bold text-gray-900">Total Gaji Bersih</span>
            <span className="text-lg font-bold text-purple-600">{formatRupiah(totalGaji)}</span>
          </div>
        </div>
      </div>

      {/* === Modal === */}
      {editType === "tindakan" && (
        <FeeTindakanModal
          show={showModalTindakan}
          onClose={() => setShowModalTindakan(false)}
          onSubmit={handleTindakanSubmit}
          initialData={editData}
        />
      )}
      {editType === "paket" && (
        <FeePaketModal
          show={showModalPaket}
          onClose={() => setShowModalPaket(false)}
          onSubmit={handlePaketSubmit}
          initialData={editData}
        />
      )}
    </div>
  );
}

export default Gaji;
