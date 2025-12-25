import React, { useState } from "react";

function CutiKaryawan() {
  const [dataCuti, setDataCuti] = useState([
    { id: 1, nama: "Siti Rahma", tanggal: "2025-11-10", lama: 3, alasan: "Acara keluarga", status: "Pending" },
    { id: 2, nama: "Budi Santoso", tanggal: "2025-11-15", lama: 2, alasan: "Sakit", status: "Pending" },
    { id: 3, nama: "Dewi Lestari", tanggal: "2025-11-20", lama: 1, alasan: "Keperluan pribadi", status: "Disetujui" },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCuti, setSelectedCuti] = useState(null);
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    tanggal: "",
    lama: "",
    alasan: "",
    status: "Pending",
  });

  // filter status
  const filteredData = dataCuti.filter(
    (item) => filterStatus === "all" || item.status === filterStatus
  );

  // ubah status
  const ubahStatus = (statusBaru) => {
    setDataCuti((prevData) =>
      prevData.map((item) =>
        item.id === selectedCuti.id ? { ...item, status: statusBaru } : item
      )
    );
    setSelectedCuti(null);
  };

  // tambah data cuti
  const handleTambahCuti = (e) => {
    e.preventDefault();
    const newCuti = {
      id: dataCuti.length + 1,
      ...formData,
    };
    setDataCuti([...dataCuti, newCuti]);
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
        <div className="mb-8 animate-slide-down">
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 rounded-2xl p-8 text-white shadow-2xl">
            <h1 className="text-4xl font-bold mb-2">🏖️ Kelola Cuti Karyawan</h1>
            <p className="text-sm opacity-90">Manage leave requests and approvals</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Pengajuan", value: dataCuti.length, icon: "📋", color: "from-blue-600 to-blue-400" },
            { label: "Pending", value: dataCuti.filter(d => d.status === "Pending").length, icon: "⏳", color: "from-yellow-600 to-yellow-400" },
            { label: "Disetujui", value: dataCuti.filter(d => d.status === "Disetujui").length, icon: "✅", color: "from-green-600 to-green-400" },
            { label: "Ditolak", value: dataCuti.filter(d => d.status === "Ditolak").length, icon: "❌", color: "from-red-600 to-red-400" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-lg card-hover animate-slide-up`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 font-semibold">{stat.label}</p>
                  <p className="text-4xl font-bold mt-2">{stat.value}</p>
                </div>
                <span className="text-5xl opacity-80">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filter & Tambah */}
        <div className="flex justify-between items-center mb-6 gap-4 animate-slide-down">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Filter Status</label>
            <select
              className="border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white font-semibold text-gray-700"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">📋 Semua Status</option>
              <option value="Pending">⏳ Pending</option>
              <option value="Disetujui">✅ Disetujui</option>
              <option value="Ditolak">❌ Ditolak</option>
            </select>
          </div>

          <div className="flex-1"></div>

          <button
            onClick={() => setShowTambahModal(true)}
            className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2 self-end"
          >
            <span>➕</span> Tambah Cuti
          </button>
        </div>

        {/* Tabel Cuti */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 p-6 text-white">
            <h2 className="text-xl font-bold">📋 Daftar Pengajuan Cuti</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">No</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">👤 Nama Karyawan</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">📅 Tanggal Cuti</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">📆 Lama (hari)</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">💭 Alasan</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">📌 Status</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">🔧 Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-purple-50 transition-all animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td className="px-6 py-4 text-gray-800 font-semibold">{index + 1}</td>
                    <td className="px-6 py-4 text-gray-800 font-medium">{item.nama}</td>
                    <td className="px-6 py-4 text-gray-700">{item.tanggal}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">{item.lama}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.alasan}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold inline-block ${
                          item.status === "Disetujui"
                            ? "bg-green-100 text-green-800"
                            : item.status === "Ditolak"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.status === "Disetujui" && "✅"} {item.status === "Ditolak" && "❌"} {item.status === "Pending" && "⏳"} {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedCuti(item)}
                        className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                      >
                        👁️ Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <p className="text-2xl text-gray-400">📭 Belum ada pengajuan cuti</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Detail */}
        {selectedCuti && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-2xl font-bold text-gray-800">📋 Detail Pengajuan</h4>
                <button onClick={() => setSelectedCuti(null)} className="text-2xl text-gray-500 hover:text-gray-700">✕</button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-gray-600">👤 Nama Karyawan</p>
                  <p className="text-lg font-bold text-gray-800">{selectedCuti.nama}</p>
                </div>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="text-sm text-gray-600">📅 Tanggal Cuti</p>
                  <p className="text-lg font-bold text-gray-800">{selectedCuti.tanggal}</p>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="text-sm text-gray-600">📆 Lama Cuti</p>
                  <p className="text-lg font-bold text-gray-800">{selectedCuti.lama} hari</p>
                </div>
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                  <p className="text-sm text-gray-600">💭 Alasan</p>
                  <p className="text-lg font-bold text-gray-800">{selectedCuti.alasan}</p>
                </div>
                <div className={`border-l-4 p-4 rounded ${
                  selectedCuti.status === "Disetujui" ? "bg-green-50 border-green-500" :
                  selectedCuti.status === "Ditolak" ? "bg-red-50 border-red-500" :
                  "bg-yellow-50 border-yellow-500"
                }`}>
                  <p className="text-sm text-gray-600">📌 Status</p>
                  <p className="text-lg font-bold text-gray-800">{selectedCuti.status}</p>
                </div>
              </div>

              {selectedCuti.status === "Pending" && (
                <div className="flex gap-3 mb-6">
                  <button
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                    onClick={() => ubahStatus("Disetujui")}
                  >
                    ✅ Setujui
                  </button>
                  <button
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                    onClick={() => ubahStatus("Ditolak")}
                  >
                    ❌ Tolak
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

        {/* Modal Tambah Cuti */}
        {showTambahModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-2xl font-bold text-gray-800">➕ Pengajuan Cuti Baru</h4>
                <button onClick={() => setShowTambahModal(false)} className="text-2xl text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <form onSubmit={handleTambahCuti} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nama Karyawan</label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Masukkan nama karyawan"
                    required
                    className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Cuti</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    required
                    className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Lama Cuti (hari)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lama}
                    onChange={(e) => setFormData({ ...formData, lama: e.target.value })}
                    placeholder="Masukkan jumlah hari"
                    required
                    className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Alasan Cuti</label>
                  <textarea
                    value={formData.alasan}
                    onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                    placeholder="Masukkan alasan cuti"
                    required
                    className="w-full border-2 border-gray-200 px-4 py-2 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all h-24 resize-none"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                  >
                    ✅ Simpan
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
