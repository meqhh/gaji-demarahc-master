import React, { useState, useEffect, useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";

// === Modal Tambah/Edit Tindakan === //
function FeeTindakanModal({ show, onClose, onSubmit, initialData, karyawanOptions = [] }) {
  const [form, setForm] = useState(
    initialData || { karyawan: "", pasien: "", alamat: "", treatment: "", harga: "", fee: "", tanggal: "" }
  );

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm({ ...form, [id]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form); 
    setForm({ karyawan: "", pasien: "", alamat: "", treatment: "", harga: "", fee: "", tanggal: "" });
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
          {/* Pilih Karyawan */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Karyawan</label>
            <select
              id="karyawan"
              value={form.karyawan || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
              required
            >
              <option value="">Pilih Karyawan</option>
              {karyawanOptions.map((nama) => (
                <option key={nama} value={nama}>
                  {nama}
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal</label>
            <input
              type="date"
              id="tanggal"
              value={form.tanggal || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
              required
            />
          </div>

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
  const context = useContext(AppContext);
  const absensiData = context?.absensiData || []; // Only used for filter options (karyawan names)

  const defaultGajiData = [
    { id: 1, karyawan: "Syardatul Maula", pasien: "Andi Susilo", alamat: "Jl. Merdeka 12", treatment: "Home Visit - Pemeriksaan", harga: 150000, fee: 20, tanggal: "2025-08-13" },
    { id: 2, karyawan: "Ridwan", pasien: "Siti Aminah", alamat: "Perum. Bunga", treatment: "Imunisasi", harga: 200000, fee: 25, tanggal: "2025-08-13" },
    { id: 3, karyawan: "Firda", pasien: "Budi Santoso", alamat: "Jl. Melati", treatment: "Postnatal Care", harga: 300000, fee: 15, tanggal: "2025-08-13" },
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

  // Initialize gaji data for all karyawan from absensi
  useEffect(() => {
    if (!absensiData || absensiData.length === 0) return;

    // Check if initialization already done
    const initKey = 'gajiDataInitialized';
    if (localStorage.getItem(initKey) === 'true') return;

    // Get unique karyawan names from absensi
    const uniqueKaryawan = absensiData
      .map((a) => a?.nama)
      .filter((name) => name && name.trim() !== "")
      .filter((name, index, self) => self.indexOf(name) === index);

    if (uniqueKaryawan.length === 0) return;

    // Get existing gaji data
    const existingGaji = gajiData || [];
    const existingKaryawan = existingGaji
      .map((g) => g.karyawan)
      .filter((name) => name);

    // Create gaji data for karyawan that don't have gaji data yet
    const newGajiData = [];
    const treatments = [
      "Home Visit - Pemeriksaan",
      "Imunisasi",
      "Postnatal Care",
      "Konsultasi",
      "Pemeriksaan Rutin",
      "Vaksinasi"
    ];
    const addresses = [
      "Jl. Merdeka",
      "Perum. Bunga",
      "Jl. Melati",
      "Jl. Sudirman",
      "Jl. Gatot Subroto"
    ];

    uniqueKaryawan.forEach((karyawanName, index) => {
      // Skip if karyawan already has gaji data
      if (existingKaryawan.includes(karyawanName)) return;

      // Get absensi dates for this karyawan
      const karyawanAbsensi = absensiData.filter(a => a.nama === karyawanName);
      
      // Create 2-3 sample gaji entries for each karyawan
      const numEntries = Math.min(3, karyawanAbsensi.length || 2);
      for (let i = 0; i < numEntries; i++) {
        // Use date from absensi if available, otherwise use current date
        let gajiDate;
        if (karyawanAbsensi[i] && karyawanAbsensi[i].date) {
          gajiDate = karyawanAbsensi[i].date;
        } else {
          const randomDate = new Date();
          randomDate.setDate(randomDate.getDate() - (index * 7 + i * 3));
          gajiDate = randomDate.toISOString().split('T')[0];
        }
        
        newGajiData.push({
          id: Date.now() + index * 1000 + i,
          karyawan: karyawanName,
          pasien: `Pasien ${karyawanName} ${i + 1}`,
          alamat: addresses[index % addresses.length] + ` ${i + 1}`,
          treatment: treatments[(index + i) % treatments.length],
          harga: 150000 + (index * 25000) + (i * 50000),
          fee: 15 + (index % 10),
          tanggal: gajiDate
        });
      }
    });

    // Add new gaji data if any
    if (newGajiData.length > 0) {
      setGajiData((prev) => {
        const updated = [...prev, ...newGajiData];
        localStorage.setItem(initKey, 'true');
        return updated;
      });
    } else {
      localStorage.setItem(initKey, 'true');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [absensiData]); // Only run when absensiData changes

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
  const [filterTanggal, setFilterTanggal] = useState("");
  const [filterBulan, setFilterBulan] = useState("Semua Bulan");
  const [filterTahun, setFilterTahun] = useState("Semua Tahun");
  const [filterKaryawan, setFilterKaryawan] = useState("Semua");

  // Get unique karyawan names from absensi data
  const uniqueKaryawanNames = useMemo(() => {
    const names = absensiData
      .map((a) => a?.nama)
      .filter((name) => name && name.trim() !== "")
      .filter((name, index, self) => self.indexOf(name) === index) // Get unique names
      .sort(); // Sort alphabetically
    return names;
  }, [absensiData]);

  // Get all months (Januari - Desember)
  const uniqueMonths = useMemo(() => {
    return ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  }, []);

  // Get all years (2010 - 2025)
  const uniqueYears = useMemo(() => {
    const years = [];
    for (let year = 2025; year >= 2010; year--) {
      years.push(year.toString());
    }
    return years;
  }, []);

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

  const formatRupiah = (angka) =>
    `Rp. ${Number(angka).toLocaleString('id-ID')}`;

  // Filter gaji data based on selected filters
  const filteredGajiData = useMemo(() => {
    // If no filters are active, show all data
    const hasActiveFilters = filterTanggal || 
                            (filterBulan && filterBulan !== "Semua Bulan") || 
                            (filterTahun && filterTahun !== "Semua Tahun") || 
                            (filterKaryawan && filterKaryawan !== "Semua");
    
    if (!hasActiveFilters) {
      return gajiData || [];
    }

    return (gajiData || []).filter((g) => {
      if (!g) return false;

      // Filter by date (if gaji data has date field)
      if (filterTanggal && g.tanggal) {
        try {
          const gajiDate = new Date(g.tanggal).toISOString().split('T')[0];
          if (gajiDate !== filterTanggal) return false;
        } catch (e) {
          return false;
        }
      }

      // Filter by month (if gaji data has date field)
      if (filterBulan && filterBulan !== "Semua Bulan" && g.tanggal) {
        try {
          const d = new Date(g.tanggal);
          if (isNaN(d.getTime())) return false;
          const monthName = d.toLocaleDateString('id-ID', { month: 'long' });
          if (monthName !== filterBulan) return false;
        } catch (e) {
          return false;
        }
      }

      // Filter by year (if gaji data has date field)
      if (filterTahun && filterTahun !== "Semua Tahun" && g.tanggal) {
        try {
          const d = new Date(g.tanggal);
          if (isNaN(d.getTime())) return false;
          const year = d.getFullYear().toString();
          if (year !== filterTahun) return false;
        } catch (e) {
          return false;
        }
      }

      // Filter by karyawan (match with karyawan field first, then pasien)
      if (filterKaryawan && filterKaryawan !== "Semua") {
        const karyawanName = g.karyawan ? g.karyawan.toLowerCase() : '';
        const pasienName = g.pasien ? g.pasien.toLowerCase() : '';
        const filterName = filterKaryawan.toLowerCase();
        // Match with karyawan field (primary) or pasien field (fallback)
        if (karyawanName !== filterName && pasienName !== filterName) return false;
      }

      return true;
    });
  }, [gajiData, filterTanggal, filterBulan, filterTahun, filterKaryawan]);

  // Hitung total dari filtered data
  const totalFeeTindakan = filteredGajiData.reduce(
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

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.1); }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
        .animate-slide-down { animation: slideDown 0.5s ease-out; }
      `}</style>

      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between animate-slide-down">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Gaji</h1>
          <p className="text-gray-600 text-sm">Kelola data gaji dan fee karyawan</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-slide-up">
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Tanggal</label>
          <input
            type="date"
            value={filterTanggal}
            onChange={(e) => setFilterTanggal(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-800 bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10"
          />
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Bulan</label>
          <select 
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-800 bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10"
          >
            <option>Semua Bulan</option>
            {uniqueMonths.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Tahun</label>
          <select 
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-800 bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10"
          >
            <option>Semua Tahun</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Karyawan</label>
          <select 
            value={filterKaryawan}
            onChange={(e) => setFilterKaryawan(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-800 bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10"
          >
            <option>Semua</option>
            {uniqueKaryawanNames.map((nama) => (
              <option key={nama} value={nama}>
                {nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel Gaji */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden card-hover animate-slide-up mb-8" style={{ animationDelay: '0.3s' }}>
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Gaji Tindakan ({filteredGajiData.length})</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filterTanggal && `Tanggal: ${new Date(filterTanggal).toLocaleDateString('id-ID')} • `}
            {filterBulan !== "Semua Bulan" && `Bulan: ${filterBulan} • `}
            {filterTahun !== "Semua Tahun" && `Tahun: ${filterTahun} • `}
            {filterKaryawan !== "Semua" && `Karyawan: ${filterKaryawan}`}
            {!filterTanggal && filterBulan === "Semua Bulan" && filterTahun === "Semua Tahun" && filterKaryawan === "Semua" && "Menampilkan Semua Data"}
          </p>
        </div>
        
        {filteredGajiData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Karyawan</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Tanggal</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Pasien</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Alamat</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Treatment</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Harga</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Fee</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Total Fee</th>
                </tr>
              </thead>
              <tbody>
                {filteredGajiData.map((g, idx) => (
                  <tr
                    key={g.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-gray-800 font-semibold">{g.karyawan || g.pasien || "-"}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{g.tanggal ? new Date(g.tanggal).toLocaleDateString('id-ID') : "-"}</td>
                    <td className="px-6 py-4 text-gray-700">{g.pasien}</td>
                    <td className="px-6 py-4 text-gray-700">{g.alamat}</td>
                    <td className="px-6 py-4 text-gray-700">{g.treatment}</td>
                    <td className="px-6 py-4 text-gray-700">Rp {Number(g.harga).toLocaleString("id-ID")}</td>
                    <td className="px-6 py-4 text-gray-700">{g.fee}%</td>
                    <td className="px-6 py-4 text-gray-800 font-semibold">Rp {(Number(g.harga) * Number(g.fee) / 100).toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-base">Tidak ada data gaji yang sesuai dengan filter yang dipilih</p>
            <p className="text-sm text-gray-400 mt-2">Coba ubah filter atau pastikan ada data gaji</p>
          </div>
        )}

        {/* Tombol Tambah */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200">
          <button
            onClick={() => { setEditData(null); setEditType("tindakan"); setShowModalTindakan(true); }}
            className="px-6 py-2.5 border border-gray-300 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <span>+</span> Tambah Tindakan
          </button>
        </div>
      </div>

      {/* Komponen Gaji */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden card-hover animate-slide-up" style={{ animationDelay: '0.45s' }}>
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Komponen Gaji</h2>
        </div>
        
        <div className="px-6 py-6 space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700 font-medium">Gaji Pokok</span>
            <span className="font-semibold text-gray-900">{formatRupiah(gajiPokok)}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700 font-medium">Tunjangan</span>
            <span className="font-semibold text-gray-900">{formatRupiah(tunjangan)}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700 font-medium">Bonus</span>
            <span className="font-semibold text-gray-900">{formatRupiah(bonus)}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700 font-medium">Total Fee Tindakan</span>
            <span className="font-semibold text-gray-900">{formatRupiah(totalFeeTindakan)}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700 font-medium">Total Fee Paket</span>
            <span className="font-semibold text-gray-900">{formatRupiah(totalFeePaket)}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-700 font-medium">Tunjangan Transport</span>
            <span className="font-semibold text-gray-900">{formatRupiah(feeTransport)}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <span className="text-gray-700 font-medium">Potongan BPJS/TK</span>
            <span className="font-semibold text-gray-900">-{formatRupiah(potonganBPJSTK)}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t-2 border-gray-300">
            <span className="text-lg font-bold text-gray-900">Total Gaji Bersih</span>
            <span className="text-lg font-bold text-gray-900">{formatRupiah(totalGaji)}</span>
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
          karyawanOptions={uniqueKaryawanNames}
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
