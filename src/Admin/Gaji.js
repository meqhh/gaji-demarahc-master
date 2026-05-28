import React, { useState, useEffect, useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";

// === Modal Tambah/Edit Tindakan === //
function FeeTindakanModal({ 
  show, 
  onClose, 
  onSubmit, 
  initialData, 
  karyawanOptions = [],
  kompGaji = {},
  onKompGajiChange = () => {},
  totalFeeTindakan = 0,
  totalFeePaket = 0,
  formatRupiah = (n) => {
    const value = Number(n);
    if (Number.isNaN(value)) return 'Rp 0';
    return `Rp ${Math.round(value * 1000).toLocaleString('id-ID')}`;
  }
}) {
  const [form, setForm] = useState(
    initialData || { karyawan: "", pasien: "", alamat: "", treatment: "", harga: "", fee: "", tanggal: "" }
  );

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ karyawan: "", pasien: "", alamat: "", treatment: "", harga: "", fee: "", tanggal: "" });
    }
  }, [initialData, show]);

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

  // Hitung total gaji
  const totalGross = (kompGaji.gajiPokok || 0) + totalFeeTindakan + totalFeePaket + (kompGaji.tunjanganTransport || 0);
  const totalGajiBersih = totalGross - (kompGaji.potonganBPJS || 0);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down overflow-y-auto py-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-0 animate-slide-up my-auto">
        {/* Header - Simple */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{initialData ? "Edit Tindakan" : "Tambah Tindakan"}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <form className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]" onSubmit={handleSubmit}>
          {/* Grid 2 Kolom */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* ===== KOLOM KIRI - DATA TINDAKAN ===== */}
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2">Data Tindakan</h3>

              {/* Service Data Section */}
              <div className="space-y-5">
                {/* Karyawan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Karyawan</label>
                  <select
                    id="karyawan"
                    value={form.karyawan || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700"
                    required
                  >
                    <option value="">- Pilih Karyawan -</option>
                    {karyawanOptions.map((nama) => (
                      <option key={nama} value={nama}>
                        {nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tanggal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal</label>
                  <input
                    type="date"
                    id="tanggal"
                    value={form.tanggal || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700"
                    required
                  />
                </div>

                {/* Nama Pasien */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Pasien</label>
                  <input
                    id="pasien"
                    placeholder="Masukkan nama pasien"
                    value={form.pasien}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700 placeholder-gray-400"
                    required
                  />
                </div>

                {/* Alamat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                  <textarea
                    id="alamat"
                    placeholder="Masukkan alamat pasien"
                    value={form.alamat}
                    onChange={handleChange}
                    rows="2"
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700 placeholder-gray-400 resize-none"
                    required
                  />
                </div>

                {/* Treatment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Treatment</label>
                  <input
                    id="treatment"
                    placeholder="Masukkan jenis treatment"
                    value={form.treatment}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700 placeholder-gray-400"
                    required
                  />
                </div>

                {/* Harga & Fee */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Harga</label>
                    <input
                      type="number"
                      id="harga"
                      placeholder="0"
                      min="0"
                      value={form.harga}
                      onChange={handleChange}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-1">{formatRupiah(form.harga || 0)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fee (%)</label>
                    <input
                      type="number"
                      id="fee"
                      placeholder="0"
                      min="0"
                      max="100"
                      value={form.fee}
                      onChange={handleChange}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-1">{formatRupiah((Number(form.harga || 0) * Number(form.fee || 0)) / 100)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== KOLOM KANAN - KOMPONEN GAJI ===== */}
            <div className="space-y-5">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2">Komponen Gaji</h3>

              {/* Salary Components */}
              <div className="space-y-5">
                {/* Gaji Pokok */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gaji Pokok</label>
                  <input
                    type="number"
                    id="gajiPokok"
                    placeholder="0"
                    min="0"
                    value={kompGaji.gajiPokok || ''}
                    onChange={(e) => onKompGajiChange({ ...kompGaji, gajiPokok: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700"
                  />
                  <p className="text-xs text-gray-600 mt-1">{formatRupiah(kompGaji.gajiPokok || 0)}</p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-3"></div>

                {/* Fee Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Fee Tindakan</span>
                    <span className="text-sm font-medium text-gray-900">{formatRupiah(totalFeeTindakan)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">Fee Paket</span>
                    <span className="text-sm font-medium text-gray-900">{formatRupiah(totalFeePaket)}</span>
                  </div>
                </div>

                {/* Tunjangan Transport */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tunjangan Transport</label>
                  <input
                    type="number"
                    id="tunjanganTransport"
                    placeholder="0"
                    min="0"
                    value={kompGaji.tunjanganTransport || ''}
                    onChange={(e) => onKompGajiChange({ ...kompGaji, tunjanganTransport: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700"
                  />
                  <p className="text-xs text-gray-600 mt-1">{formatRupiah(kompGaji.tunjanganTransport || 0)}</p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 pt-3"></div>

                {/* Potongan BPJS */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Potongan BPJS/TK</label>
                  <input
                    type="number"
                    id="potonganBPJS"
                    placeholder="0"
                    min="0"
                    value={kompGaji.potonganBPJS || ''}
                    onChange={(e) => onKompGajiChange({ ...kompGaji, potonganBPJS: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700"
                  />
                  <p className="text-xs text-gray-600 mt-1">-{formatRupiah(kompGaji.potonganBPJS || 0)}</p>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-gray-300 pt-3"></div>

                {/* Total Gaji Bersih */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Total Gaji Bersih</p>
                  <p className="text-xl font-bold text-gray-900">{formatRupiah(totalGajiBersih)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-300 flex justify-end gap-3">
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

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ pasien: "", paket: "", hargaPaket: "", fee: "" });
    }
  }, [initialData, show]);

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
  const absensiData = context?.absensiData || []; 
  const karyawanData = context?.karyawanData || [];
  const gajiData = context?.gajiData || [];
  const addGaji = context?.addGaji;
  const updateGaji = context?.updateGaji;
  const deleteGaji = context?.deleteGaji;

  const [feePaketData, setFeePaketData] = useState(() => {
    try {
      const saved = localStorage.getItem("feePaketData");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("feePaketData", JSON.stringify(feePaketData));
  }, [feePaketData]);

  // State untuk komponen gaji
  const [kompGaji, setKompGaji] = useState(() => {
    try {
      const saved = localStorage.getItem("kompGaji");
      return saved ? JSON.parse(saved) : {
        gajiPokok: 0,
        tunjanganTransport: 0,
        potonganBPJS: 0
      };
    } catch (e) {
      return {
        gajiPokok: 0,
        tunjanganTransport: 0,
        potonganBPJS: 0
      };
    }
  });

  useEffect(() => {
    localStorage.setItem("kompGaji", JSON.stringify(kompGaji));
  }, [kompGaji]);

  const [showModalTindakan, setShowModalTindakan] = useState(false);
  const [showModalPaket, setShowModalPaket] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editType, setEditType] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  
  // Filter state
  const [filterTanggal, setFilterTanggal] = useState("");
  const [filterKaryawan, setFilterKaryawan] = useState("Semua");

  // Get unique karyawan names from active karyawan data only
  const uniqueKaryawanNames = useMemo(() => {
    const karyawanNames = Array.isArray(karyawanData) && karyawanData.length > 0
      ? karyawanData
          .map((k) => k?.nama)
          .filter((name) => name && name.trim() !== "")
      : [];

    return [...new Set(karyawanNames)].sort();
  }, [karyawanData]);

  // Tambah atau Edit Tindakan
  const handleTindakanSubmit = (data) => {
    if (editData) {
      // Edit existing
      updateGaji(editData.id, data);
      setEditData(null);
      setEditType(null);
    } else {
      // Add new
      addGaji({ ...data, id: Date.now() });
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

  // Delete with confirmation
  const handleDelete = (item, type) => {
    setDeleteData(item);
    setDeleteType(type);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteData && deleteType) {
      if (deleteType === "tindakan") {
        deleteGaji(deleteData.id);
      } else {
        setFeePaketData(feePaketData.filter((f) => f.id !== deleteData.id));
      }
      setDeleteData(null);
      setDeleteType(null);
      setShowDeleteConfirm(false);
    }
  };



  // Handle change komponen gaji
  const handleKompGajiChange = (e) => {
    const { id, value } = e.target;
    setKompGaji({
      ...kompGaji,
      [id]: parseFloat(value) || 0
    });
  };

  const formatRupiah = (angka) => {
    const value = Number(angka);
    if (Number.isNaN(value)) return 'Rp 0';
    return `Rp ${Math.round(value * 1000).toLocaleString('id-ID')}`;
  };

  // Filter gaji data based on selected filters
  const filteredGajiData = useMemo(() => {
    // If no filters are active, show all data
    const hasActiveFilters = filterTanggal || (filterKaryawan && filterKaryawan !== "Semua");
    
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

      // Filter by karyawan (match with karyawan field first, then pasien)
      if (filterKaryawan && filterKaryawan !== "Semua") {
        const karyawanName = g.karyawan ? g.karyawan.toLowerCase() : '';
        const pasienName = g.pasien ? g.pasien.toLowerCase() : '';
        const filterName = filterKaryawan.toLowerCase();
        if (karyawanName !== filterName && pasienName !== filterName) return false;
      }

      return true;
    });
  }, [gajiData, filterTanggal, filterKaryawan]);

  // Hitung total dari filtered data
  const totalFeeTindakan = filteredGajiData.reduce(
    (acc, g) => acc + (Number(g.harga) * Number(g.fee)) / 100,
    0
  );
  const totalFeePaket = feePaketData.reduce(
    (acc, f) => acc + Number(f.fee),
    0
  );

  // Hitung total gaji
const totalGross =
  (kompGaji.gajiPokok || 0) +
  totalFeeTindakan +
  totalFeePaket +
  (kompGaji.tunjanganTransport || 0);

const totalGajiBersih =
  totalGross - (kompGaji.potonganBPJS || 0);

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

      {/* Tabel Gaji & Komponen Gaji Side by Side */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Kolom Tabel Gaji */}
        <div>
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden card-hover animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">Gaji Tindakan ({filteredGajiData.length})</h2>
              <p className="text-sm text-gray-600 mt-1">
                {filterTanggal && `Tanggal: ${new Date(filterTanggal).toLocaleDateString('id-ID')} • `}
                {filterKaryawan !== "Semua" && `Karyawan: ${filterKaryawan}`}
                {!filterTanggal && filterKaryawan === "Semua" && "Menampilkan Semua Data"}
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
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Treatment</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Harga</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Fee</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Total Fee</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wide">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGajiData.map((g, idx) => (
                      <tr
                        key={g.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-gray-800 font-semibold text-sm">{g.karyawan || g.pasien || "-"}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{g.tanggal ? new Date(g.tanggal).toLocaleDateString('id-ID') : "-"}</td>
                        <td className="px-6 py-4 text-gray-700 text-sm">{g.pasien}</td>
                        <td className="px-6 py-4 text-gray-700 text-sm">{g.treatment}</td>
                        <td className="px-6 py-4 text-gray-700 text-sm">{formatRupiah(Number(g.harga) || 0)}</td>
                        <td className="px-6 py-4 text-gray-700 text-sm">{g.fee}%</td>
                        <td className="px-6 py-4 text-gray-800 font-semibold text-sm">{formatRupiah((Number(g.harga) * Number(g.fee || 0)) / 100)}</td>
                        <td className="px-6 py-4 text-center text-sm space-x-2 flex items-center justify-center">
                          <button
                            onClick={() => { setEditData(g); setEditType("tindakan"); setShowModalTindakan(true); }}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(g, "tindakan")}
                            className="px-3 py-1.5 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition"
                          >
                            Hapus
                          </button>
                        </td>
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
        </div>
      </div>

      {/* === Modal === */}
      {editType === "tindakan" && (
        <FeeTindakanModal
          show={showModalTindakan}
          onClose={() => setShowModalTindakan(false)}
          onSubmit={handleTindakanSubmit}
          initialData={
            editData || (filterKaryawan && filterKaryawan !== "Semua" ? { karyawan: filterKaryawan } : null)
          }
          karyawanOptions={uniqueKaryawanNames}
          kompGaji={kompGaji}
          onKompGajiChange={setKompGaji}
          totalFeeTindakan={totalFeeTindakan}
          totalFeePaket={totalFeePaket}
          formatRupiah={formatRupiah}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Data</h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gaji;
