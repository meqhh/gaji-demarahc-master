import React, { useState, useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";

export default function CutiKaryawan() {
  const { userProfile, karyawanData = [], cutiData = [], setCutiData, addCuti, updateCuti, deleteCuti } = useContext(AppContext);

  // Filter cuti berdasarkan nama karyawan yang login
  const myCutiData = useMemo(() => {
    if (!userProfile?.name) return [];
    
    // All data comes from backend API/context only (no dummy data)
    const allData = Array.isArray(cutiData) ? cutiData : [];
    
    // Filter berdasarkan nama karyawan yang login
    return allData.filter(c => c.nama && c.nama.toLowerCase() === userProfile.name.toLowerCase());
  }, [cutiData, userProfile?.name]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuti, setSelectedCuti] = useState(null);
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteData, setDeleteData] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    tanggal: "",
    tanggalAkhir: "",
    lama: "",
    alasan: "",
    status: "Pending",
  });

  // Filter data berdasarkan status dan pencarian
  const filteredData = myCutiData.filter((item) => {
    const matchStatus = filterStatus === "all" || item.status === filterStatus;
    const matchSearch = 
      searchQuery === "" ||
      item.tanggal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alasan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lama?.toString().includes(searchQuery);
    return matchStatus && matchSearch;
  });

  // Jatah cuti tahunan
  const totalJatahCuti = 12;

  // Total cuti yang sudah disetujui
  const cutiTerpakai = myCutiData
    .filter(item => item.status === "Disetujui")
    .reduce((total, item) => total + Number(item.lama || 0), 0);

  // Sisa cuti
  const sisaCuti = totalJatahCuti - cutiTerpakai;

  // Set modal data saat modal dibuka; nama diisi manual oleh user
  const openTambahModal = () => {
    setFormData({ nama: userProfile?.name || "", tanggal: "", tanggalAkhir: "", lama: "", alasan: "", status: "Pending" });
    setShowTambahModal(true);
  };

  // Tambah data cuti
  const handleTambahCuti = async (e) => {
    e.preventDefault();
    const namaAkun = userProfile?.name;
    if (!namaAkun) {
      alert("Nama karyawan tidak boleh kosong");
      return;
    }

    const newCuti = {
        ...formData,
        nama: namaAkun,
        id: formData.id || `CUTI${Date.now()}`,
      };

    // If tanggalAkhir provided and lama empty, compute lama (inclusive)
    if (formData.tanggal && formData.tanggalAkhir && (!formData.lama || String(formData.lama).trim() === '')) {
      try {
        const start = new Date(formData.tanggal);
        const end = new Date(formData.tanggalAkhir);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        newCuti.lama = diff > 0 ? diff : 1;
      } catch (err) {
        newCuti.lama = formData.lama || 1;
      }
    }

    if (addCuti) {
      await addCuti(newCuti);
    } else if (setCutiData) {
      setCutiData(prev => Array.isArray(prev) ? [...prev, newCuti] : [newCuti]);
    }

    setFormData({ nama: "", tanggal: "", tanggalAkhir: "", lama: "", alasan: "", status: "Pending" });
    setShowTambahModal(false);
  };

  // Edit data cuti
  const handleEdit = (item) => {
    const namaAkun = userProfile?.name || item.nama || "";
    setFormData({
      nama: namaAkun,
      tanggal: item.tanggal || "",
      tanggalAkhir: item.tanggalAkhir || "",
      lama: item.lama || "",
      alasan: item.alasan || "",
      status: item.status || "Pending",
    });
    setSelectedCuti({ ...item, id: item.id || item._id });
    setShowEditModal(true);
  };

  const handleUpdateCuti = (e) => {
    e.preventDefault();
    const namaAkun = String(formData.nama || "").trim();
    if (!namaAkun) {
      alert("Nama karyawan tidak boleh kosong");
      return;
    }
    if (selectedCuti) {
      const updates = {
        ...formData,
        nama: namaAkun,
      };
      if (formData.tanggal && formData.tanggalAkhir && (!formData.lama || String(formData.lama).trim() === '')) {
        try {
          const start = new Date(formData.tanggal);
          const end = new Date(formData.tanggalAkhir);
          const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          updates.lama = diff > 0 ? diff : 1;
        } catch (err) {
          updates.lama = formData.lama || 1;
        }
      }
      const targetId = selectedCuti.id || selectedCuti._id;
      updateCuti(targetId, updates);
      setFormData({ nama: "", tanggal: "", tanggalAkhir: "", lama: "", alasan: "", status: "Pending" });
      setShowEditModal(false);
      setSelectedCuti(null);
    }
  };

  // Hapus data cuti
  const handleDelete = (item) => {
    setDeleteData(item);
    setShowDelete(true);
  };

  const confirmDelete = () => {
    if (deleteData) {
      deleteCuti(deleteData.id);
      setShowDelete(false);
      setDeleteData(null);
    }
  };

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
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
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-slide-down {
          animation: slideDown 0.5s ease-out;
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between animate-slide-down">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Cuti Karyawan</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="inline-block text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <span className="text-gray-500">Kelola Pengajuan Cuti</span>
          </div>
        </div>
      </div>

      {/* INFO CUTI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-slide-up">

        <div className="bg-white shadow-md rounded-xl p-5">
          <p className="text-gray-500 font-medium">Total Jatah Cuti</p>
          <p className="text-2xl font-bold text-gray-900">{totalJatahCuti} hari</p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-5">
          <p className="text-gray-500 font-medium">Cuti Terpakai</p>
          <p className="text-2xl font-bold text-gray-900">{cutiTerpakai} hari</p>
        </div>

        <div className="bg-white shadow-md rounded-xl p-5">
          <p className="text-gray-500 font-medium">Sisa Cuti</p>
          <p className="text-2xl font-bold text-gray-900">{sisaCuti} hari</p>
        </div>

      </div>

      {/* Filter & Search Section */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pencarian</label>
              <input
              type="text"
              placeholder="Cari berdasarkan tanggal, alasan, atau lama cuti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-800 bg-white focus:outline-none focus:border-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Filter Status</label>
            <select
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-800 bg-white focus:outline-none focus:border-gray-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
          <div className="flex items-end">
              <button
              onClick={openTambahModal}
              className="w-full bg-gray-800 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:bg-gray-700 transition-all"
            >
              + Ajukan Cuti
            </button>
          </div>
        </div>
      </div>

      {/* Tabel Cuti */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="bg-gray-900 p-6 text-white border-b border-gray-700">
          <h2 className="text-xl font-bold">Daftar Pengajuan Cuti</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">No</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Tanggal Mulai</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Tanggal Akhir</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Durasi (hari)</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Alasan</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Status</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={item.id || item._id} className="border-b border-gray-100 hover:bg-gray-50 transition-all animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <td className="px-6 py-4 text-gray-800 font-semibold">{index + 1}</td>
                  <td className="px-6 py-4 text-gray-800 font-medium">{item.tanggal}</td>
                  <td className="px-6 py-4 text-gray-800 font-medium">{item.tanggalAkhir || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-semibold border border-gray-300">{item.lama} hari</span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{item.alasan}</td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-4 py-2 rounded text-sm font-semibold inline-block border ${
                        item.status === "Disetujui"
                          ? "bg-gray-100 text-gray-800 border-gray-300"
                          : item.status === "Ditolak"
                          ? "bg-gray-50 text-gray-600 border-gray-200"
                          : "bg-gray-200 text-gray-700 border-gray-300"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      onClick={() => setSelectedCuti(item)}
                      className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-all"
                    >
                      Detail
                    </button>
                    {item.status === "Pending" && (
                      <>
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-gray-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-gray-700 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="bg-gray-500 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-gray-600 transition-all"
                    >
                      Hapus
                    </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-500">Belum ada pengajuan cuti</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail */}
      {selectedCuti && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-2xl font-bold text-gray-900">Detail Pengajuan Cuti</h4>
              <button onClick={() => setSelectedCuti(null)} className="text-2xl text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 border-l-4 border-gray-500 p-4 rounded">
                <p className="text-sm text-gray-600">Nama Karyawan</p>
                <p className="text-lg font-bold text-gray-800">{selectedCuti.nama}</p>
              </div>
              <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
                <p className="text-sm text-gray-600 font-medium">Tanggal Mulai</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{selectedCuti.tanggal}</p>
              </div>
              <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
                <p className="text-sm text-gray-600 font-medium">Tanggal Akhir</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{selectedCuti.tanggalAkhir || '-'}</p>
              </div>
              <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
                <p className="text-sm text-gray-600 font-medium">Durasi Cuti</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{selectedCuti.lama} hari</p>
              </div>
              <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
                <p className="text-sm text-gray-600 font-medium">Alasan</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{selectedCuti.alasan}</p>
              </div>
              <div className={`border-l-4 p-4 rounded ${
                selectedCuti.status === "Disetujui" ? "bg-gray-50 border-gray-500" :
                selectedCuti.status === "Ditolak" ? "bg-gray-50 border-gray-400" :
                "bg-gray-50 border-gray-400"
              }`}>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-bold text-gray-800">{selectedCuti.status}</p>
              </div>
            </div>

            <div className="flex gap-3 text-center">
              {selectedCuti.status === "Pending" && (
                <button
                  className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all"
                  onClick={() => handleEdit(selectedCuti)}
                >
                  Edit
                </button>
              )}
              <button
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                onClick={() => setSelectedCuti(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Cuti */}
      {showTambahModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-2xl font-bold text-gray-900">Pengajuan Cuti Baru</h4>
              <button onClick={() => setShowTambahModal(false)} className="text-2xl text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleTambahCuti} className="space-y-4">
              <div className="w-full bg-gray-100 border-2 border-gray-200 px-4 py-2 rounded-lg">
                {userProfile?.name || "-"}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Mulai</label>
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  required
                  className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Akhir (opsional)</label>
                <input
                  type="date"
                  value={formData.tanggalAkhir}
                  onChange={(e) => setFormData({ ...formData, tanggalAkhir: e.target.value })}
                  className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Durasi Cuti (hari)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.lama}
                  onChange={(e) => setFormData({ ...formData, lama: e.target.value })}
                  placeholder="Masukkan jumlah hari (atau biarkan kosong untuk dihitung dari tanggal)"
                  required
                  className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Alasan Cuti</label>
                <textarea
                  value={formData.alasan}
                  onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                  placeholder="Masukkan alasan cuti"
                  required
                  className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all h-24 resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowTambahModal(false)}
                  className="flex-1 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Cuti */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-2xl font-bold text-gray-900">Edit Pengajuan Cuti</h4>
              <button onClick={() => { setShowEditModal(false); setSelectedCuti(null); }} className="text-2xl text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <form onSubmit={handleUpdateCuti} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nama Karyawan</label>
                  <input
                    type="text"
                    value={formData.nama || userProfile?.name || ""}
                    readOnly
                    placeholder="Nama akan terisi otomatis"
                    required
                    autoComplete="off"
                    className="w-full bg-gray-100 border-2 border-gray-200 px-4 py-2 rounded-lg focus:outline-none transition-all"
                  />
                </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Mulai</label>
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  required
                  className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Akhir (opsional)</label>
                <input
                  type="date"
                  value={formData.tanggalAkhir}
                  onChange={(e) => setFormData({ ...formData, tanggalAkhir: e.target.value })}
                  className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Durasi Cuti (hari)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.lama}
                  onChange={(e) => setFormData({ ...formData, lama: e.target.value })}
                  placeholder="Masukkan jumlah hari (atau biarkan kosong untuk dihitung dari tanggal)"
                  required
                  className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Alasan Cuti</label>
                <textarea
                  value={formData.alasan}
                  onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                  placeholder="Masukkan alasan cuti"
                  required
                  className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all h-24 resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedCuti(null); }}
                  className="flex-1 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDelete && deleteData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 animate-slide-up">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Hapus Pengajuan Cuti</h2>
              <p className="text-sm text-gray-500">Anda akan menghapus:</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-gray-900 font-medium">{deleteData.tanggal}</p>
              <p className="text-sm text-gray-600 mt-1">{deleteData.lama} hari • {deleteData.alasan}</p>
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
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

