import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";

function Karyawan() {
  const { karyawanData = [], setKaryawanData, addKaryawan, updateKaryawan, deleteKaryawan, absensiData = [] } = useContext(AppContext);
  
  const [showTambah, setShowTambah] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({});

  const getFieldValue = (obj, ...keys) => {
    if (!obj) return undefined;
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
        return obj[key];
      }
    }
    return undefined;
  };

  const normalizeKaryawan = (item) => {
    if (!item) return item;
    return {
      ...item,
      posisi: getFieldValue(item, "posisi", "jabatan"),
      nohp: getFieldValue(item, "nohp", "no_hp", "noTelepon", "no_telepon"),
      tglMasuk: getFieldValue(item, "tglMasuk", "tgl_masuk", "tanggalMasuk", "tanggal_masuk"),
      tglKontrak: getFieldValue(item, "tglKontrak", "tgl_kontrak", "tanggalKontrak", "tanggal_kontrak"),
      lamaKontrak: getFieldValue(item, "lamaKontrak", "lama_kontrak"),
      tanggalLahir: getFieldValue(item, "tanggalLahir", "tanggal_lahir"),
      tempatLahir: getFieldValue(item, "tempatLahir", "tempat_lahir", "tempatTanggalLahir", "tempat_tanggal_lahir"),
      foto: getFieldValue(item, "foto", "photo"),
      email: getFieldValue(item, "email", "user_email", "userEmail"),
      alamat: getFieldValue(item, "alamat", "address"),
      status: getFieldValue(item, "status") || "",
    };
  };

  // Initialize data on mount - only load from localStorage, no default data
  useEffect(() => {
    try {
      // Only load from localStorage if exists, otherwise keep empty
      const stored = JSON.parse(localStorage.getItem("karyawanData")) || [];
      if (stored.length > 0) {
        setKaryawanData(stored);
      } else {
        // Ensure empty array if no data in localStorage
        setKaryawanData([]);
      }
    } catch (err) {
      console.error("Gagal load data dari localStorage", err);
      setKaryawanData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize karyawan data from absensi - DISABLED: No auto-initialization
  // useEffect(() => {
  //   // Disabled - no automatic initialization from absensi
  // }, [absensiData]);

  // persistence handled by AppContext

  /* ===========================
     🔧 HELPER FUNCTIONS
  ============================ */

  // Konversi file ke base64
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  // Format tanggal untuk tampilan
  const formatTanggalDisplay = (dateStr) => {
    if (!dateStr) return "";
    const bulan = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agt", "Sep", "Okt", "Nov", "Des",
    ];
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return `${String(d.getDate()).padStart(2, "0")} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
  };

  const calcAge = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d)) return "—";
    const diff = Date.now() - d.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const calcTenure = (startStr) => {
    if (!startStr) return "—";
    const start = new Date(startStr);
    if (isNaN(start)) return "—";
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();
    const totalMonths = years * 12 + months;
    if (totalMonths < 12) return `${totalMonths} bulan`;
    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    return m === 0 ? `${y} tahun` : `${y} tahun ${m} bulan`;
  };

  // ID otomatis
  const getNextId = () => {
    if (!Array.isArray(karyawanData) || karyawanData.length === 0) return "001";
    const lastId = Math.max(...karyawanData.map((k) => parseInt(k.id)));
    return String(lastId + 1).padStart(3, "0");
  };


  // Upload file + preview
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await toBase64(file);
      setPreview(base64);
      setFormData({ ...formData, foto: base64 });
    }
  };

  // Tambah data
  const handleTambah = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fotoFile = form.foto.files[0];
    let fotoBase64 = null;

    if (fotoFile) fotoBase64 = await toBase64(fotoFile);

    const newKaryawan = {
      id: getNextId(),
      nama: form.nama.value,
      posisi: form.posisi.value,
      status: form.status?.value || "",
      nohp: form.nohp.value,
      email: form.email.value,
      alamat: form.alamat.value,
      tempatLahir: form.tempatLahir.value,
      tanggalLahir: form.tanggalLahir.value,
      tglMasuk: form.tglMasuk.value,
      tglKontrak: form.tglKontrak.value,
      lamaKontrak: form.lamaKontrak.value,
      foto: fotoBase64,
    };

    if (typeof addKaryawan === 'function') {
      addKaryawan(newKaryawan);
    } else if (typeof setKaryawanData === 'function') {
      const currentData = Array.isArray(karyawanData) ? karyawanData : [];
      setKaryawanData([...currentData, newKaryawan]);
    }
    form.reset();
    setPreview(null);
    setShowTambah(false);
  };

  // Edit data
  const handleEdit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fotoFile = form.foto.files[0];
    let fotoBase64 = editData.foto;

    if (fotoFile) fotoBase64 = await toBase64(fotoFile);

    const updated = {
      ...editData,
      nama: form.nama.value,
      posisi: form.posisi.value,
      status: form.status?.value || "",
      nohp: form.nohp.value,
      email: form.email.value,
      alamat: form.alamat.value,
      tempatLahir: form.tempatLahir.value,
      tanggalLahir: form.tanggalLahir.value,
      tglMasuk: form.tglMasuk.value,
      tglKontrak: form.tglKontrak.value,
      lamaKontrak: form.lamaKontrak.value,
      foto: fotoBase64,
    };

    if (typeof updateKaryawan === 'function') {
      updateKaryawan(updated.id, updated);
    } else if (typeof setKaryawanData === 'function') {
      setKaryawanData((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
    }
    setShowEdit(false);
  };

  // Hapus data
  const handleHapus = (item) => {
    setDeleteData(item);
    setShowDelete(true);
  };

  const confirmDelete = () => {
    if (deleteData) {
      if (typeof deleteKaryawan === 'function') {
        deleteKaryawan(deleteData.id);
      } else if (typeof setKaryawanData === 'function') {
        setKaryawanData((prev) => Array.isArray(prev) ? prev.filter((k) => String(k.id) !== String(deleteData.id)) : []);
      }
      setShowDelete(false);
      setDeleteData(null);
    }
  };

  /* ===========================
     🧩 RETURN UI
  ============================ */
  return (
    <div className="space-y-8 pb-8">
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(204, 69, 222, 0.3); }
          50% { box-shadow: 0 0 15px rgba(204, 69, 222, 0.6); }
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(204, 69, 222, 0.2);
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
        .animate-slide-down {
          animation: slideDown 0.6s ease-out forwards;
        }
      `}</style>

      <main>
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between animate-slide-down">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Data Karyawan</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="inline-block text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" />
                </svg>
              </span>
              <span className="text-gray-400">Data Karyawan</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTambah(true)}
              className="px-6 py-3 border-2 border-cyan-400 text-cyan-600 font-bold rounded-lg hover:bg-cyan-50 transition-all duration-300 flex items-center gap-2"
            >
              <span>+</span> Tambah Data
            </button>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden card-hover animate-slide-up">
          <div className="border-b-2 border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900">Data Karyawan</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-white">
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">No.</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Id</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Nama</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Posisi</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Tgl Masuk</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(karyawanData) && karyawanData.map((k, idx) => (
                  <tr
                    key={k.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <td className="px-8 py-5 bg-gray-100 text-gray-800 font-semibold">{idx + 1}.</td>
                    <td className="px-8 py-5 bg-gray-100 text-gray-800">{k.id}</td>
                    <td className="px-8 py-5 bg-gray-100 text-gray-800 font-medium">{k.nama}</td>
                    <td className="px-8 py-5 bg-gray-100 text-gray-800">{getFieldValue(k, "posisi", "jabatan") || "—"}</td>
                    <td className="px-8 py-5 bg-gray-100 text-gray-800">{formatTanggalDisplay(getFieldValue(k, "tglMasuk", "tgl_masuk", "tanggalMasuk", "tanggal_masuk"))}</td>
                    <td className="px-8 py-5 bg-gray-100 text-center space-x-2">
                      <button
                        onClick={() => {
                          setDetailData(normalizeKaryawan(k));
                          setShowDetail(true);
                        }}
                        className="text-blue-600 font-bold hover:text-blue-700 transition-colors text-sm"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => {
                          const normalized = normalizeKaryawan(k);
                          setEditData(normalized);
                          setPreview(normalized.foto);
                          setShowEdit(true);
                        }}
                        className="text-orange-600 font-bold hover:text-orange-700 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleHapus(k)}
                        className="text-red-600 font-bold hover:text-red-700 transition-colors text-sm"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!Array.isArray(karyawanData) || karyawanData.length === 0) && (
              <div className="text-center py-16">
                <p className="text-2xl text-gray-400">📭 Belum ada data karyawan</p>
                <p className="text-gray-500 mt-2">Klik tombol "Tambah Data" untuk menambahkan data</p>
              </div>
            )}
          </div>
        </div>

        {/* === Modal Tambah === */}
        {showTambah && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down"
            onClick={() => setShowTambah(false)}
          >
            <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-8 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-semibold text-gray-900">Tambah Karyawan Baru</h2>
                  <button
                    onClick={() => setShowTambah(false)}
                    className="text-gray-400 hover:text-gray-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-500">Masukkan data karyawan baru ke dalam sistem</p>
              </div>
              <form onSubmit={handleTambah} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["Nama", "nama"],
                    ["Posisi", "posisi"],
                    ["Status", "status"],
                    ["Nomor HP", "nohp"],
                    ["Email", "email", "email"],
                    ["Tempat Lahir", "tempatLahir"],
                    ["Tanggal Lahir", "tanggalLahir", "date"],
                    ["Lama Kontrak", "lamaKontrak"],
                    ["Tanggal Masuk", "tglMasuk", "date"],
                    ["Tanggal Kontrak", "tglKontrak", "date"],
                  ].map(([label, name, type = "text"]) => (
                    <div key={name}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                      <input
                        name={name}
                        type={type}
                        className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
                        required={["nama", "posisi", "nohp", "email", "tglMasuk"].includes(name)}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
                  <textarea
                    name="alamat"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors bg-white"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Foto</label>
                  <input
                    name="foto"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 outline-none transition-all bg-white"
                  />
                  {preview && (
                    <img src={preview} alt="preview" className="w-20 h-20 rounded-full mt-3 object-cover border border-gray-200" />
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowTambah(false)}
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
        )}


        {/* === Modal Detail === */}
        {showDetail && detailData && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down"
            onClick={() => setShowDetail(false)}
          >
            <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-8 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-semibold text-gray-900">Detail Karyawan</h2>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="text-gray-400 hover:text-gray-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-500">Informasi lengkap karyawan</p>
              </div>

              <div className="space-y-6">
                {/* Foto dan Nama Utama */}
                <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                  <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                    {detailData.foto ? (
                      <img src={detailData.foto} alt="Foto Karyawan" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">-</div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{detailData.nama}</h3>
                    <p className="text-gray-600">{getFieldValue(detailData, "posisi", "jabatan") || "—"}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {detailData.id}</p>
                  </div>
                </div>

                {/* Informasi Pribadi */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Informasi Pribadi</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                      <p className="text-gray-900">{detailData.status || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nomor HP</label>
                      <p className="text-gray-900">{getFieldValue(detailData, "nohp", "no_hp") || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                      <p className="text-gray-900">{detailData.email || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Alamat</label>
                      <p className="text-gray-900">{detailData.alamat || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Tempat Lahir</label>
                      <p className="text-gray-900">{detailData.tempatLahir || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Lahir</label>
                      <p className="text-gray-900">{formatTanggalDisplay(detailData.tanggalLahir) || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Umur</label>
                      <p className="text-gray-900">{calcAge(detailData.tanggalLahir)} tahun</p>
                    </div>
                  </div>
                </div>

                {/* Informasi Pekerjaan */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Informasi Pekerjaan</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Masuk</label>
                      <p className="text-gray-900">{formatTanggalDisplay(detailData.tglMasuk) || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Masa Kerja</label>
                      <p className="text-gray-900">{calcTenure(detailData.tglMasuk)}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Tanggal Kontrak</label>
                      <p className="text-gray-900">{formatTanggalDisplay(detailData.tglKontrak) || '—'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Lama Kontrak</label>
                      <p className="text-gray-900">{detailData.lamaKontrak || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetail(false)}
                    className="px-6 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === Modal Edit === */}
        {showEdit && editData && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down"
            onClick={() => setShowEdit(false)}
          >
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-semibold text-gray-900">Edit Karyawan</h2>
                  <button
                    onClick={() => setShowEdit(false)}
                    className="text-gray-400 hover:text-gray-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-500">Perbarui informasi karyawan</p>
              </div>

              <form onSubmit={handleEdit} className="space-y-6">
                {/* Row 1: Nama & Posisi */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nama</label>
                    <input
                      name="nama"
                      defaultValue={editData.nama}
                      type="text"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Posisi</label>
                    <input
                      name="posisi"
                      defaultValue={editData.posisi}
                      type="text"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Row 2: Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <input
                    name="status"
                    defaultValue={editData.status}
                    type="text"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors"
                  />
                </div>

                {/* Row 3: No HP & Email */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">No. HP</label>
                    <input
                      name="nohp"
                      defaultValue={editData.nohp}
                      type="text"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      name="email"
                      defaultValue={editData.email}
                      type="email"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Alamat */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
                  <textarea
                    name="alamat"
                    defaultValue={editData.alamat}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors"
                    rows="3"
                  />
                </div>

                {/* Row 3: Tempat Lahir & Tanggal Lahir */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tempat Lahir</label>
                    <input
                      name="tempatLahir"
                      defaultValue={editData.tempatLahir}
                      type="text"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Lahir</label>
                    <input
                      name="tanggalLahir"
                      defaultValue={editData.tanggalLahir}
                      type="date"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Row 4: Tanggal Masuk & Tanggal Kontrak */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Masuk</label>
                    <input
                      name="tglMasuk"
                      defaultValue={editData.tglMasuk}
                      type="date"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Kontrak</label>
                    <input
                      name="tglKontrak"
                      defaultValue={editData.tglKontrak}
                      type="date"
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Lama Kontrak */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lama Kontrak</label>
                  <input
                    name="lamaKontrak"
                    defaultValue={editData.lamaKontrak}
                    type="text"
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-colors"
                  />
                </div>

                {/* Upload Foto */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Foto Baru</label>
                  <input
                    name="foto"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 outline-none transition-colors cursor-pointer"
                  />
                  {preview && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600 mb-2">Preview Foto</p>
                      <img src={preview} alt="preview" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEdit(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                <button
                    type="submit"
                    className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                    Simpan Perubahan
                </button>
              </div>
              </form>
            </div>
          </div>
        )}

        {/* === Modal Delete === */}
        {showDelete && deleteData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 animate-slide-up">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Hapus Karyawan</h2>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-gray-900 font-medium">{deleteData.nama}</p>
                <p className="text-sm text-gray-600 mt-1">{getFieldValue(deleteData, "posisi", "jabatan") || "—"}</p>
              </div>
              
              <p className="text-sm text-gray-600 mb-6 text-center">
                Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDelete(false);
                    setDeleteData(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Karyawan;
