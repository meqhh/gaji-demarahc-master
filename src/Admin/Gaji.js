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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jam Lembur</label>
                    <input
                      type="number"
                      id="lemburJam"
                      placeholder="0"
                      min="0"
                      value={kompGaji.lemburJam || ''}
                      onChange={(e) => onKompGajiChange({ ...kompGaji, lemburJam: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nilai Kinerja</label>
                    <input
                      type="number"
                      id="nilaiKinerja"
                      placeholder="0"
                      min="0"
                      max="100"
                      value={kompGaji.nilaiKinerja || ''}
                      onChange={(e) => onKompGajiChange({ ...kompGaji, nilaiKinerja: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Potongan Pajak</label>
                    <input
                      type="number"
                      id="potonganPajak"
                      placeholder="0"
                      min="0"
                      value={kompGaji.potonganPajak || ''}
                      onChange={(e) => onKompGajiChange({ ...kompGaji, potonganPajak: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Potongan Kasbon</label>
                    <input
                      type="number"
                      id="potonganKasbon"
                      placeholder="0"
                      min="0"
                      value={kompGaji.potonganKasbon || ''}
                      onChange={(e) => onKompGajiChange({ ...kompGaji, potonganKasbon: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700"
                    />
                    <p className="text-xs text-gray-600 mt-1">Potongan kasbon langsung dipotong</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Potongan Alpha</label>
                    <input
                      type="number"
                      id="potonganAlpha"
                      placeholder="0"
                      min="0"
                      value={kompGaji.potonganAlpha || ''}
                      onChange={(e) => onKompGajiChange({ ...kompGaji, potonganAlpha: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Potongan Telat</label>
                    <input
                      type="number"
                      id="potonganTelat"
                      placeholder="0"
                      min="0"
                      value={kompGaji.potonganTelat || ''}
                      onChange={(e) => onKompGajiChange({ ...kompGaji, potonganTelat: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all bg-white text-gray-700"
                    />
                  </div>
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
  const {
  absensiData = [],
  karyawanData = [],
  treatmentData = [],
  gajiData = [],
  addSlipGaji
  } = useContext(AppContext);
  console.log("treatmentData:", treatmentData);

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
        potonganBPJS: 0,
        lemburJam: 0,
        nilaiKinerja: 0,
        potonganPajak: 0,
        potonganAlpha: 0,
        potonganTelat: 0,
        potonganKasbon: 0,
        bonusKehadiran: 0,
        bonusLembur: 0,
        bonusKinerja: 0,
        bonusJabatan: 0
      };
    } catch (e) {
      return {
        gajiPokok: 0,
        tunjanganTransport: 0,
        potonganBPJS: 0,
        lemburJam: 0,
        nilaiKinerja: 0,
        potonganPajak: 0,
        potonganAlpha: 0,
        potonganTelat: 0,
        potonganKasbon: 0,
        bonusKehadiran: 0,
        bonusLembur: 0,
        bonusKinerja: 0,
        bonusJabatan: 0
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
    if (deleteType === "paket") {
      setFeePaketData(
        feePaketData.filter((f) => f.id !== deleteData.id)
      );
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

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const getMonthLabel = (dateString) => {
    if (!dateString) return "";
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return "";
    return `${monthNames[parsed.getMonth()]} ${parsed.getFullYear()}`;
  };

  const normalizeDateForFilter = (value) => {
    if (!value) return "";
    const trimmed = String(value).trim();

    // Direct ISO / yyyy-mm-dd
    const isoMatch = trimmed.match(/^\d{4}-\d{2}-\d{2}/);
    if (isoMatch) return isoMatch[0];

    // Indonesian / European day-first formats, like 31/12/2024 or 31-12-2024
    const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (dmyMatch) {
      const [, day, month, year] = dmyMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Fallback to Date parsing
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().slice(0, 10);
  };

  const normalizeMonthYear = (dateString) => {
    if (!dateString) return "";
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return "";
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const year = parsed.getFullYear();
    return `${month}-${year}`;
  };

  // Filter gaji data based on selected filters
  const filteredGajiData = useMemo(() => {
    let data = Array.isArray(gajiData) ? [...gajiData] : [];

    if (filterTanggal) {
      const normalizedFilterDate = normalizeDateForFilter(filterTanggal);
      const normalizedFilterMonthYear = normalizeMonthYear(filterTanggal);
      const targetMonthLabel = getMonthLabel(filterTanggal);

      data = data.filter((item) => {
        const itemDateRaw = item.tanggal || item.date || item.createdAt || item.dateString;
        const itemDate = normalizeDateForFilter(itemDateRaw);

        if (itemDate && normalizedFilterDate && itemDate === normalizedFilterDate) {
          return true;
        }

        if (item.periode && normalizedFilterMonthYear) {
          const periode = String(item.periode).trim();
          if (periode === normalizedFilterMonthYear || periode === targetMonthLabel) {
            return true;
          }
        }

        return false;
      });
    }

    if (filterKaryawan !== "Semua") {
      data = data.filter((item) => item.karyawan === filterKaryawan || item.nama === filterKaryawan);
    }

    return data;
  }, [gajiData, filterTanggal, filterKaryawan]);

  const getGajiFeeMeta = (g) => {
    const feePercent = g.feePercent !== undefined && g.feePercent !== null ? Number(g.feePercent) : undefined;
    const feeAmount = g.feeAmount !== undefined && g.feeAmount !== null ? Number(g.feeAmount) : undefined;
    const bonusAmount = g.bonus !== undefined && g.bonus !== null ? Number(g.bonus) : undefined;
    const feeValue = g.fee !== undefined && g.fee !== null ? Number(g.fee) : undefined;
    const hargaValue = Number(g.harga || 0);

    if (!Number.isNaN(feeAmount) && feeAmount > 0) {
      return { amount: feeAmount, percent: feePercent };
    }

    if (!Number.isNaN(bonusAmount) && bonusAmount > 0) {
      return { amount: bonusAmount, percent: feePercent };
    }

    if (!Number.isNaN(feePercent) && feePercent >= 0) {
      return { amount: Math.round((hargaValue * feePercent) / 100), percent: feePercent };
    }

    if (!Number.isNaN(feeValue) && feeValue > 100) {
      return { amount: feeValue };
    }

    if (!Number.isNaN(feeValue) && feeValue >= 0) {
      return { amount: Math.round((hargaValue * feeValue) / 100), percent: feeValue };
    }

    return { amount: 0 };
  };

  // Hitung total dari filtered data
  const totalFeeTindakan = filteredGajiData.reduce(
    (acc, g) => acc + getGajiFeeMeta(g).amount,
    0
  );
  const totalFeePaket = feePaketData.reduce(
    (acc, f) => acc + Number(f.fee),
    0
  );

  const selectedKaryawan = useMemo(() => {
    if (!filterKaryawan || filterKaryawan === "Semua") return null;
    return Array.isArray(karyawanData)
      ? karyawanData.find((k) => k.nama === filterKaryawan)
      : null;
  }, [filterKaryawan, karyawanData]);

  const currentPeriode = filterTanggal ? getMonthLabel(filterTanggal) : getMonthLabel(new Date().toISOString());

  const selectedAbsensi = useMemo(() => {
    if (!selectedKaryawan || !Array.isArray(absensiData)) return [];
    return absensiData.filter((item) => {
      if (!item || !item.nama) return false;
      if (item.nama !== selectedKaryawan.nama) return false;
      const periode = getMonthLabel(item.tanggal || item.date || item.dateString || item.date || item.createdAt);
      return periode === currentPeriode;
    });
  }, [absensiData, selectedKaryawan, currentPeriode]);

  const hadirCount = selectedAbsensi.filter((item) => String(item.status).toLowerCase() === "hadir").length;
  const alphaCount = selectedAbsensi.filter((item) => String(item.status).toLowerCase() === "alpha").length;
  const lateCount = selectedAbsensi.filter((item) => /telat|terlambat/i.test(String(item.status))).length;
  const totalAbsensiDays = selectedAbsensi.length;

  const gajiPokok = Number(kompGaji.gajiPokok || selectedKaryawan?.gajiPokok || 0);
  const tunjanganTransport = Number(kompGaji.tunjanganTransport || selectedKaryawan?.tunjanganTransport || 0);
  const potonganBPJS = Number(kompGaji.potonganBPJS || selectedKaryawan?.asuransi || selectedKaryawan?.bpjs || 0);

  const defaultPajak = Math.round(((gajiPokok + totalFeeTindakan + totalFeePaket + tunjanganTransport) * 0.05));
  const potonganPajak = Number(kompGaji.potonganPajak || selectedKaryawan?.pajak || defaultPajak);

  const bonusKehadiranAuto = totalAbsensiDays > 0 && alphaCount === 0 && hadirCount / totalAbsensiDays >= 0.9 ? Math.round(gajiPokok * 0.05) : 0;
  const bonusLemburAuto = Math.round((Number(kompGaji.lemburJam || 0) * (gajiPokok / 173)) * 1.5);
  const bonusKinerjaAuto = Number(kompGaji.nilaiKinerja || selectedKaryawan?.nilaiKinerja || 0) >= 90
    ? Math.round(gajiPokok * 0.1)
    : Number(kompGaji.nilaiKinerja || selectedKaryawan?.nilaiKinerja || 0) >= 75
      ? Math.round(gajiPokok * 0.05)
      : Math.round(gajiPokok * 0.02);

  const getJabatanBonus = (posisi) => {
    if (!posisi) return 0;
    const title = posisi.toLowerCase();
    if (title.includes("manager") || title.includes("kepala") || title.includes("supervisor")) return Math.round(gajiPokok * 0.08);
    if (title.includes("admin") || title.includes("senior") || title.includes("koordinator")) return Math.round(gajiPokok * 0.05);
    return Math.round(gajiPokok * 0.03);
  };

  const bonusKehadiran = Number(kompGaji.bonusKehadiran || bonusKehadiranAuto);
  const bonusLembur = Number(kompGaji.bonusLembur || bonusLemburAuto);
  const bonusKinerja = Number(kompGaji.bonusKinerja || bonusKinerjaAuto);
  const bonusJabatan = Number(kompGaji.bonusJabatan || getJabatanBonus(selectedKaryawan?.posisi));

  const totalBonus = bonusKehadiran + bonusLembur + bonusKinerja + bonusJabatan;
  const totalPotongan = potonganBPJS + Number(kompGaji.potonganAlpha || alphaCount * 50000) + Number(kompGaji.potonganTelat || lateCount * 25000) + potonganPajak + Number(kompGaji.potonganKasbon || 0);
  const totalGross = gajiPokok + tunjanganTransport + totalFeeTindakan + totalFeePaket + totalBonus;
  const totalGajiBersih = totalGross - totalPotongan;

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
                        {(() => {
                          const feeMeta = getGajiFeeMeta(g);
                          return (
                            <>
                              <td className="px-6 py-4 text-gray-700 text-sm">
                                {feeMeta.percent !== undefined ? `${feeMeta.percent}%` : formatRupiah(feeMeta.amount)}
                              </td>
                              <td className="px-6 py-4 text-gray-800 font-semibold text-sm">{formatRupiah(feeMeta.amount)}</td>
                            </>
                          );
                        })()}
                        <td className="px-6 py-4 text-center text-sm space-x-2 flex items-center justify-center">
                          {/*
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
                          */}
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
              </div> {/* bg-white shadow-sm */}
          </div>   {/* Kolom Tabel Gaji */}
        </div>     {/* Grid */}

      {/* Komponen Gaji Summary Section */}
      {selectedKaryawan && filterKaryawan !== "Semua" && (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden card-hover animate-slide-up mb-8">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">Komponen Gaji - {selectedKaryawan.nama}</h2>
            <p className="text-sm text-gray-600 mt-1">Periode: {currentPeriode}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Column 1: Penghasilan */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b pb-2">KOMPONEN PENGHASILAN</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Gaji Pokok</span>
                    <span className="text-sm font-medium text-gray-900">{formatRupiah(gajiPokok)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tunjangan Transport</span>
                    <span className="text-sm font-medium text-gray-900">{formatRupiah(tunjanganTransport)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fee Tindakan</span>
                    <span className="text-sm font-medium text-gray-900">{formatRupiah(totalFeeTindakan)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fee Paket</span>
                    <span className="text-sm font-medium text-gray-900">{formatRupiah(totalFeePaket)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Subtotal Penghasilan</span>
                    <span className="text-sm font-bold text-gray-900">{formatRupiah(gajiPokok + tunjanganTransport + totalFeeTindakan + totalFeePaket)}</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Bonus */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b pb-2">BONUS</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Kehadiran</span>
                    <span className="text-sm font-medium text-gray-900">{formatRupiah(bonusKehadiran)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lembur</span>
                    <span className="text-sm font-medium text-gray-900">{formatRupiah(bonusLembur)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Kinerja</span>
                    <span className="text-sm font-medium text-gray-900">{formatRupiah(bonusKinerja)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Jabatan</span>
                    <span className="text-sm font-medium text-gray-900">{formatRupiah(bonusJabatan)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Total Bonus</span>
                    <span className="text-sm font-bold text-gray-900">{formatRupiah(totalBonus)}</span>
                  </div>
                </div>
              </div>

              {/* Column 3: Potongan & Total */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b pb-2">POTONGAN</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">BPJS/TK</span>
                    <span className="text-sm font-medium text-gray-900">-{formatRupiah(potonganBPJS)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Alpha</span>
                    <span className="text-sm font-medium text-gray-900">-{formatRupiah(Number(kompGaji.potonganAlpha || alphaCount * 50000))}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Telat</span>
                    <span className="text-sm font-medium text-gray-900">-{formatRupiah(Number(kompGaji.potonganTelat || lateCount * 25000))}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pajak</span>
                    <span className="text-sm font-medium text-gray-900">-{formatRupiah(potonganPajak)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Kasbon</span>
                    <span className="text-sm font-medium text-gray-900">-{formatRupiah(Number(kompGaji.potonganKasbon || 0))}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">Total Potongan</span>
                    <span className="text-sm font-bold text-gray-900">-{formatRupiah(totalPotongan)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary & Total */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Gaji Kotor</p>
                <p className="text-2xl font-bold text-blue-900">{formatRupiah(totalGross)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-xs text-red-600 font-semibold uppercase mb-1">Total Potongan</p>
                <p className="text-2xl font-bold text-red-900">-{formatRupiah(totalPotongan)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-xs text-green-600 font-semibold uppercase mb-1">Gaji Bersih</p>
                <p className="text-2xl font-bold text-green-900">{formatRupiah(totalGajiBersih)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  // Reset all komponen gaji to default
                  setKompGaji({
                    gajiPokok: 0,
                    tunjanganTransport: 0,
                    lemburJam: 0,
                    nilaiKinerja: 0,
                    bonusKehadiran: 0,
                    bonusLembur: 0,
                    bonusKinerja: 0,
                    bonusJabatan: 0,
                    potonganPajak: 0,
                    potonganKasbon: 0,
                    potonganAlpha: 0,
                    potonganTelat: 0,
                    potonganBPJS: 0
                  });
                  setFeePaketData([]);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={async () => {
                  // Validation
                  if (!selectedKaryawan || !filterKaryawan || filterKaryawan === "Semua") {
                    alert("Silakan pilih karyawan terlebih dahulu");
                    return;
                  }

                  // Create slip gaji data
                  const slipData = {
                    id: `SLIP-${selectedKaryawan.id || selectedKaryawan.nama}-${Date.now()}`,
                    karyawanId: selectedKaryawan.id || selectedKaryawan.nama,
                    nama: selectedKaryawan.nama,
                    nip: selectedKaryawan.nip || "",
                    posisi: selectedKaryawan.posisi || "",
                    departemen: selectedKaryawan.departemen || "",
                    periode: currentPeriode,
                    date: filterTanggal || new Date().toISOString(),
                    gajiPokok: gajiPokok,
                    tunjanganTransport: tunjanganTransport,
                    feeTindakan: totalFeeTindakan,
                    feePaket: totalFeePaket,
                    bonusKehadiran: bonusKehadiran,
                    bonusLembur: bonusLembur,
                    bonusKinerja: bonusKinerja,
                    bonusJabatan: bonusJabatan,
                    totalBonus: totalBonus,
                    potonganBPJS: potonganBPJS,
                    potonganAlpha: Number(kompGaji.potonganAlpha || alphaCount * 50000),
                    potonganTelat: Number(kompGaji.potonganTelat || lateCount * 25000),
                    potonganPajak: potonganPajak,
                    potonganKasbon: Number(kompGaji.potonganKasbon || 0),
                    totalPotongan: totalPotongan,
                    totalPenghasilan: gajiPokok + tunjanganTransport + totalFeeTindakan + totalFeePaket + totalBonus,
                    gajiKotor: totalGross,
                    gajiNetto: totalGajiBersih,
                    status: "Selesai",
                    tanggalGajian: new Date().toISOString()
                  };

                  // Debug log
                  console.log("Admin saving slip gaji:", slipData);

                  // Add to context
                  try {
                    await addSlipGaji(slipData);
                    console.log("Slip gaji saved successfully");
                  } catch (error) {
                    console.error("Error saving slip gaji:", error);
                  }
                  
                  // Show success message
                  alert(`Slip Gaji untuk ${selectedKaryawan.nama} berhasil disimpan!`);
                  
                  // Reset form
                  setKompGaji({
                    gajiPokok: 0,
                    tunjanganTransport: 0,
                    lemburJam: 0,
                    nilaiKinerja: 0,
                    bonusKehadiran: 0,
                    bonusLembur: 0,
                    bonusKinerja: 0,
                    bonusJabatan: 0,
                    potonganPajak: 0,
                    potonganKasbon: 0,
                    potonganAlpha: 0,
                    potonganTelat: 0,
                    potonganBPJS: 0
                  });
                  setFeePaketData([]);
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Simpan Slip Gaji
              </button>
            </div>
          </div>
        </div>
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
