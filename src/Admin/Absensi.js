import React, { useState, useEffect } from "react";

function Absensi() {
  // Data awal
  const defaultAbsensi = [
    {
      id: 1,
      nama: "Syardatul Maula",
      posisi: "Bidan",
      date: "2025-08-13",
      jamMasuk: "07:30",
      jamKeluar: "17:00",
      status: "Hadir",
    },
    {
      id: 2,
      nama: "Ridwan",
      posisi: "Driver",
      date: "2025-08-13",
      jamMasuk: "07:30",
      jamKeluar: "15:30",
      status: "Hadir",
    },
    {
      id: 3,
      nama: "Firda",
      posisi: "Bidan",
      date: "2025-08-13",
      jamMasuk: "07:30",
      jamKeluar: "17:00",
      status: "Hadir",
    },
    {
      id: 4,
      nama: "Mela Anjasari",
      posisi: "Bidan",
      date: "2025-08-13",
      jamMasuk: "07:30",
      jamKeluar: "17:00",
      status: "Hadir",
    },
    {
      id: 5,
      nama: "Yuyun Puspitayani H",
      posisi: "Admin",
      date: "2025-08-13",
      jamMasuk: "07:30",
      jamKeluar: "17:00",
      status: "Hadir",
    },
    {
      id: 6,
      nama: "Filga Tri Adab",
      posisi: "Bidan",
      date: "2025-08-13",
      jamMasuk: "07:30",
      jamKeluar: "17:00",
      status: "Hadir",
    },
  ];

  const [absensi, setAbsensi] = useState(() => {
    const saved = localStorage.getItem("absensiData");
    const initial = saved ? JSON.parse(saved) : defaultAbsensi;

    // Merge with the same 30 sample names from Karyawan data
    const sampleNames = [
      "Ahmad Fikri",
      "Siti Hapsari",
      "Budi Santoso",
      "Dewi Lestari",
      "Rizky Pratama",
      "Intan Permata",
      "Aulia Rahman",
      "Rina Kurnia",
      "Taufik Hidayat",
      "Maya Sari",
      "Fajar Nugroho",
      "Rina Dewi",
      "Andi Wijaya",
      "Lina Marlina",
      "Hendra Saputra",
      "Nadia Safitri",
      "Yusuf Ramadhan",
      "Siska Amelia",
      "Ricky Adi",
      "Putri Anggraini",
      "Doni Prasetyo",
      "Vina Oktavia",
      "Eko Saputra",
      "Linda Kusuma",
      "Hesti Rahma",
      "Ardiansyah",
      "Nina Mariana",
      "Galih Pratama",
      "Fitriani",
      "Slamet Widodo",
    ];

    const existingNames = initial.map((a) => a.nama);
    let nextId = Math.max(...initial.map((a) => a.id || 0), 0) + 1;

    sampleNames.forEach((name) => {
      if (!existingNames.includes(name)) {
        initial.push({
          id: nextId++,
          nama: name,
          posisi: "Staff",
          date: "2025-12-17",
          jamMasuk: "08:00",
          jamKeluar: "17:00",
          status: "Hadir",
        });
      }
    });

    return initial;
  });

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    posisi: "",
    date: "",
    jamMasuk: "",
    jamKeluar: "",
    status: "Hadir",
  });

  // Filter state
  const [filterBulanTahun, setFilterBulanTahun] = useState("Agustus 2025");
  const [filterKaryawan, setFilterKaryawan] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua Status");

  // Simpan ke localStorage
  useEffect(() => {
    localStorage.setItem("absensiData", JSON.stringify(absensi));
  }, [absensi]);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  // Saat klik Edit
  const handleEdit = (item) => {
    setEditData(item);
    setFormData({
      nama: item.nama,
      posisi: item.posisi,
      date: item.date,
      jamMasuk: item.jamMasuk,
      jamKeluar: item.jamKeluar,
      status: item.status,
    });
    setShowModal(true);
  };

  // Saat klik Tambah
  const handleAdd = () => {
    setEditData(null);
    setFormData({
      nama: "",
      posisi: "",
      date: "",
      jamMasuk: "",
      jamKeluar: "",
      status: "Hadir",
    });
    setShowModal(true);
  };

  // Simpan data (tambah/edit)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editData) {
      setAbsensi((prev) =>
        prev.map((a) =>
          a.id === editData.id ? { ...formData, id: editData.id } : a
        )
      );
    } else {
      setAbsensi((prev) => [
        ...prev,
        { ...formData, id: Date.now() },
      ]);
    }
    setShowModal(false);
    setEditData(null);
  };

  // Hapus data
  const handleDelete = (item) => {
    setDeleteData(item);
    setShowDelete(true);
  };

  const confirmDelete = () => {
    if (deleteData) {
      setAbsensi((prev) => prev.filter((a) => a.id !== deleteData.id));
      setShowDelete(false);
      setDeleteData(null);
    }
  };

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
        .animate-slide-down { animation: slideDown 0.5s ease-out; }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-8px); box-shadow: 0 20px 50px -15px rgba(0,0,0,0.15); }
      `}</style>

      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between animate-slide-down">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Absensi Karyawan</h1>
          <p className="text-gray-600 text-sm">Kelola data kehadiran dan absensi karyawan</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-6 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <span>+</span> Aksi
        </button>
      </div>

      {/* Absensi Karyawan Card */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden card-hover animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Daftar Absensi ({absensi.length})</h2>
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 border-b border-gray-200 bg-gray-50">
          <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <label className="block text-sm font-bold text-gray-700 mb-2">Bulan/Tahun</label>
            <select 
              value={filterBulanTahun}
              onChange={(e) => setFilterBulanTahun(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg font-semibold text-gray-800 bg-white cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10"
            >
              <option>Januari 2025</option>
              <option>Februari 2025</option>
              <option>Agustus 2025</option>
            </select>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Karyawan</label>
            <select 
              value={filterKaryawan}
              onChange={(e) => setFilterKaryawan(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg font-semibold text-gray-800 bg-white cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10"
            >
              <option>Semua</option>
              <option>Syardatul Maula</option>
              <option>Ridwan</option>
              <option>Firda</option>
            </select>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <label className="block text-sm font-bold text-gray-700 mb-2">Persetujuan Atasan</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg font-semibold text-gray-800 bg-white cursor-pointer hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10"
            >
              <option>Semua Status</option>
              <option>Hadir</option>
              <option>Izin</option>
              <option>Sakit</option>
              <option>Alpha</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Nama</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Posisi</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Tanggal</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Jam Masuk</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Jam Keluar</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {absensi.map((a, i) => (
                <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-800 font-semibold">{a.nama}</td>
                  <td className="px-6 py-4 text-gray-700">{a.posisi}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{a.date}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{a.jamMasuk}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{a.jamKeluar}</td>
                  <td className="px-6 py-4">
                    {a.status === "Hadir" && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200">✓ Hadir</span>}
                    {a.status === "Izin" && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Izin</span>}
                    {a.status === "Sakit" && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">Sakit</span>}
                    {a.status === "Alpha" && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">✕ Alpha</span>}
                  </td>
                  <td className="px-6 py-4 text-center flex items-center justify-center gap-1">
                    <button onClick={() => handleEdit(a)} className="text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm">Edit</button>
                    <button onClick={() => handleDelete(a)} className="text-red-600 font-semibold hover:text-red-700 transition-colors text-sm">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 animate-slide-up">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editData ? "Edit Absensi" : "Tambah Absensi Baru"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Nama Karyawan</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Masukkan nama"
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10 transition"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Posisi</label>
                <input
                  type="text"
                  value={formData.posisi}
                  onChange={(e) => setFormData({ ...formData, posisi: e.target.value })}
                  placeholder="Masukkan posisi"
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10 transition"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Tanggal</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10 transition"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">Jam Masuk</label>
                  <input
                    type="time"
                    value={formData.jamMasuk}
                    onChange={(e) => setFormData({ ...formData, jamMasuk: e.target.value })}
                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10 transition"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">Jam Keluar</label>
                  <input
                    type="time"
                    value={formData.jamKeluar}
                    onChange={(e) => setFormData({ ...formData, jamKeluar: e.target.value })}
                    className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10 transition"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10 transition"
                >
                  <option value="Hadir">Hadir</option>
                  <option value="Izin">Izin</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Alpha">Alpha</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2.5 rounded-lg font-semibold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg font-semibold transition"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* === Modal Delete Absensi === */}
      {showDelete && deleteData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 animate-slide-up">
            {/* Icon & Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Hapus Data Absensi</h2>
              <p className="text-sm text-gray-500">Anda akan menghapus:</p>
            </div>

            {/* Data yang akan dihapus */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-gray-900 font-medium">{deleteData.nama}</p>
              <p className="text-sm text-gray-600 mt-1">{deleteData.posisi} • {deleteData.date}</p>
            </div>

            {/* Warning Text */}
            <p className="text-sm text-gray-600 mb-6 text-center">
              Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen.
            </p>

            {/* Action Buttons */}
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
  );
}

export default Absensi;
