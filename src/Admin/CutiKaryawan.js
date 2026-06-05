import React, { useState, useContext, useEffect, useMemo } from "react";
import { AppContext } from "../context/AppContext";

function CutiKaryawan() {
  const { userProfile, cutiData = [], setCutiData, addCuti, updateCuti, absensiData = [], karyawanData = [] } = useContext(AppContext);
  
  const normalizeKaryawanDisplayName = (value) => {
    if (!value) return "";
    const text = String(value).trim();
    if (text.includes("@")) {
      return text.split("@")[0] || text;
    }
    return text;
  };

  // Get unique karyawan names/options - prioritize from karyawanData, then from absensi data
  const uniqueKaryawanOptions = useMemo(() => {
    const rawNames = Array.isArray(karyawanData) && karyawanData.length > 0
      ? karyawanData.map((k) => k?.nama)
      : [];

    const absensiNames = Array.isArray(absensiData)
      ? absensiData.map((a) => a?.nama)
      : [];

    const allNames = [...rawNames, ...absensiNames]
      .map((name) => {
        const value = String(name || "").trim();
        const label = normalizeKaryawanDisplayName(value);
        return value && label ? { value, label } : null;
      })
      .filter(Boolean);

    const uniqueMap = new Map();
    allNames.forEach((item) => {
      if (!uniqueMap.has(item.value)) {
        uniqueMap.set(item.value, item);
      }
    });

    return Array.from(uniqueMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [absensiData, karyawanData]);
  
  // All cuti data comes from localStorage/backend API (no auto-generation)
  // Dummy data auto-generation removed to comply with zero-dummy requirement

  const dataCuti = cutiData;

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterKaryawan, setFilterKaryawan] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuti, setSelectedCuti] = useState(null);
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    tanggal: "",
    lama: "",
    alasan: "",
    status: "Pending",
  });

  // professional status change states
  const [statusChangeTarget, setStatusChangeTarget] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // filter data berdasarkan status, karyawan, dan pencarian
  const filteredData = dataCuti.filter((item) => {
    const matchStatus = filterStatus === "all" || item.status === filterStatus;
    const matchKaryawan = filterKaryawan === "Semua" || item.nama === filterKaryawan;
    const matchSearch = 
      searchQuery === "" ||
      item.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tanggal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alasan?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lama?.toString().includes(searchQuery);
    return matchStatus && matchKaryawan && matchSearch;
  });

  // ubah status
  const ubahStatus = (statusBaru) => {
    if (selectedCuti) {
      updateCuti(selectedCuti.id, { status: statusBaru });
      setSelectedCuti(null);
    }
  };

  // ubah status langsung dari baris tabel — sekarang dengan konfirmasi dan alasan penolakan
  const handleRowStatusChange = (item, newStatus) => {
    if (!item || !item.id) return;
    setStatusChangeTarget(item);
    setPendingStatus(newStatus);
    setRejectionReason("");
    // if rejecting, require reason; else show simple confirm
    setShowStatusConfirm(true);
  };

  const confirmStatusChange = () => {
  if (!statusChangeTarget) return;

  const updates = {
    status: pendingStatus,
    updatedBy: userProfile?.name || "Admin",
    updatedAt: new Date().toISOString(),
  };

  console.log("TARGET CUTI:", statusChangeTarget);
  console.log("ID CUTI:", statusChangeTarget?.id);
  console.log("UPDATE:", updates);

  updateCuti(statusChangeTarget.id, updates);

    // show toast
    setToastMessage(`Status untuk ${statusChangeTarget.nama} diubah menjadi ${pendingStatus}`);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 4000);

    // reset
    setStatusChangeTarget(null);
    setPendingStatus(null);
    setRejectionReason("");
    setShowStatusConfirm(false);
  };

  // tambah data cuti
  const handleTambahCuti = (e) => {
    e.preventDefault();
    addCuti(formData);
    setFormData({ nama: "", tanggal: "", lama: "", alasan: "", status: "Pending" });
    setShowTambahModal(false);
  };

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
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
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

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Pengajuan", value: dataCuti.length, color: "bg-gray-800" },
            { label: "Pending", value: dataCuti.filter(d => d.status === "Pending").length, color: "bg-gray-600" },
            { label: "Disetujui", value: dataCuti.filter(d => d.status === "Disetujui").length, color: "bg-gray-700" },
            { label: "Ditolak", value: dataCuti.filter(d => d.status === "Ditolak").length, color: "bg-gray-500" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`${stat.color} rounded-lg p-6 text-white shadow-md card-hover animate-slide-up`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter & Search Section */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Pencarian</label>
              <input
                type="text"
                placeholder="Cari berdasarkan nama, tanggal, atau alasan..."
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
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Karyawan</label>
              <select
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-800 bg-white focus:outline-none focus:border-gray-500"
                value={filterKaryawan}
                onChange={(e) => setFilterKaryawan(e.target.value)}
              >
                <option value="Semua">Semua Karyawan</option>
                {uniqueKaryawanOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowTambahModal(true)}
                className="w-full bg-gray-800 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:bg-gray-700 transition-all"
              >
                + Ajukan Cuti
              </button>
            </div>
          </div>
        </div>

        {/* Tabel Libur */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-gray-900 p-6 text-white border-b border-gray-700">
            <h2 className="text-xl font-bold">Daftar Pengajuan Cuti</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">No</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Nama Karyawan</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Tanggal Cuti</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Durasi (hari)</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Alasan</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td className="px-6 py-4 text-gray-800 font-semibold">{index + 1}</td>
                    <td className="px-6 py-4 text-gray-800 font-medium">{item.nama}</td>
                    <td className="px-6 py-4 text-gray-800 font-medium">{item.tanggal}</td>
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
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <select
                          value={item.status}
                          onChange={(e) => handleRowStatusChange(item, e.target.value)}
                          className="px-3 py-1.5 border rounded text-sm font-semibold bg-white text-gray-700"
                          aria-label={`Ubah status pengajuan ${item.nama}`}>
                          <option value="Pending">Pending</option>
                          <option value="Disetujui">Disetujui</option>
                          <option value="Ditolak">Ditolak</option>
                        </select>

                        <button
                          onClick={() => setSelectedCuti(item)}
                          className="bg-gray-700 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-gray-600 transition-all"
                        >
                          Detail
                        </button>
                      </div>
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-2xl font-bold text-gray-900">Detail Pengajuan Cuti</h4>
                <button onClick={() => setSelectedCuti(null)} className="text-2xl text-gray-500 hover:text-gray-700">✕</button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
                  <p className="text-sm text-gray-600 font-medium">Nama Karyawan</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{selectedCuti.nama}</p>
                </div>
                  <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
                  <p className="text-sm text-gray-600 font-medium">Tanggal Cuti</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{selectedCuti.tanggal}</p>
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
                  <p className="text-sm text-gray-600 font-medium">Status</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{selectedCuti.status}</p>
                </div>
              </div>

              {selectedCuti.status === "Pending" && (
                <div className="flex gap-3 mb-6">
                  <button
                    className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
                    onClick={() => ubahStatus("Disetujui")}
                  >
                    Setujui
                  </button>
                  <button
                    className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-all"
                    onClick={() => ubahStatus("Ditolak")}
                  >
                    Tolak
                  </button>
                </div>
              )}

              <div className="text-center">
                <button
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                  onClick={() => setSelectedCuti(null)}
                >
                  ✕ Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Change Confirm Modal */}
        {showStatusConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-900">Konfirmasi Perubahan Status</h4>
                <button onClick={() => setShowStatusConfirm(false)} className="text-2xl text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <p className="text-sm text-gray-700 mb-4">Anda akan mengubah status pengajuan <strong>{statusChangeTarget?.nama}</strong> menjadi <strong>{pendingStatus}</strong>.</p>

              {pendingStatus === "Ditolak" && (
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Alasan Penolakan (wajib)</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Jelaskan alasan penolakan..."
                    className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all h-24 resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowStatusConfirm(false);
                    setStatusChangeTarget(null);
                    setPendingStatus(null);
                    setRejectionReason("");
                  }}
                  className="px-4 py-2 border rounded text-gray-700 font-medium hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => confirmStatusChange()}
                  className="px-4 py-2 bg-gray-800 text-white rounded font-semibold hover:bg-gray-700"
                  disabled={pendingStatus === "Ditolak" && rejectionReason.trim() === ""}
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastVisible && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
              <p className="font-semibold">{toastMessage}</p>
            </div>
          </div>
        )}

        {/* Modal Tambah Cuti */}
        {showTambahModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-2xl font-bold text-gray-900">Pengajuan Cuti Baru</h4>
                <button onClick={() => setShowTambahModal(false)} className="text-2xl text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form onSubmit={handleTambahCuti} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nama Karyawan</label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Ketik nama karyawan"
                    required
                    autoComplete="off"
                    className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Cuti</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    required
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
                    placeholder="Masukkan jumlah hari"
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
      </main>
    </div>
  );
}

export default CutiKaryawan;
