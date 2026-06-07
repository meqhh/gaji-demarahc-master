import React, { useState, useEffect, useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";

function Absensi() {
  const context = useContext(AppContext);
  
  // All hooks must be called before any conditional returns
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
  const [filterTanggal, setFilterTanggal] = useState("");
  const [filterKaryawan, setFilterKaryawan] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [showAksiMenu, setShowAksiMenu] = useState(false);

  // Get context values safely
  const absensiData = context?.absensiData;
  const addAbsensi = context?.addAbsensi;
  const updateAbsensi = context?.updateAbsensi;
  const deleteAbsensi = context?.deleteAbsensi;
  const setAbsensiData = context?.setAbsensiData;
  const karyawanData = context?.karyawanData;

  // Use absensiData from context - ensure it's always an array
  const absensi = Array.isArray(absensiData) ? absensiData : [];

  // Get unique karyawan names from karyawanData only
  const uniqueKaryawanNames = useMemo(() => {
    const karyawanNames = Array.isArray(karyawanData) && karyawanData.length > 0
      ? karyawanData
          .map((k) => k?.nama)
          .filter((name) => name && name.trim() !== "")
      : [];

    return [...new Set(karyawanNames)].sort();
  }, [karyawanData]);

  // No default dummy data - all data from backend API

  // Initialize from localStorage/backend API (no dummy data)
  useEffect(() => {
    if (!context || !setAbsensiData) {
      return;
    }

    try {
      const saved = localStorage.getItem("absensiData");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setAbsensiData(parsed);
          }
        } catch (parseError) {
          console.error("Error parsing absensiData from localStorage:", parseError);
        }
      }
    } catch (error) {
      console.error("Error initializing absensi data:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Check if context is available for rendering
  if (!context) {
    return <div>Error: AppContext tidak tersedia</div>;
  }

  // helper: convert a date string to a readable label in id-ID
  const getDateLabel = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
    } catch (e) {
      console.error("Error parsing date:", dateStr, e);
      return "";
    }
  };

  const isSameDate = (dateA, dateB) => {
    const a = new Date(dateA);
    const b = new Date(dateB);
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return false;
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  // filtered list based on selected date, karyawan and status
  const filteredAbsensi = absensi.filter((a) => {
    if (!a) return false;

    if (filterTanggal) {
      const filterDate = `${filterTanggal}T00:00:00`;
      if (!isSameDate(a.date || a.tanggal, filterDate)) return false;
    }

    if (filterKaryawan && filterKaryawan !== "Semua") {
      if (!a.nama || a.nama.toLowerCase() !== filterKaryawan.toLowerCase()) return false;
    }

    if (filterStatus && filterStatus !== "Semua Status") {
      if (!a.status || a.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
    }

    return true;
  });

  // Data is automatically saved to localStorage via AppContext useEffect

  // Handle Hal Absensi (Export/Print) - must be after filteredAbsensi definition
  const handleHalAbsensi = () => {
    setShowAksiMenu(false);
    const printWindow = window.open('', '', 'height=700,width=900');
    const today = new Date();
    const dateStr = today.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });

    const content = `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Hal Absensi - ${dateStr}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              color: #222;
              font-size: 12px;
            }
            .container { 
              max-width: 900px; 
              margin: 0 auto;
              background: white;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #333;
            }
            .header h1 {
              font-size: 24px;
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 5px;
            }
            .header .subtitle {
              font-size: 14px;
              color: #666;
              margin-top: 5px;
            }
            .info-section {
              margin-bottom: 20px;
              padding: 15px;
              background: #f9f9f9;
              border-left: 4px solid #333;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
              font-size: 12px;
            }
            .info-label {
              font-weight: 600;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 11px;
            }
            thead {
              background: #333;
              color: white;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px 8px;
              text-align: left;
            }
            th {
              font-weight: 600;
              font-size: 11px;
            }
            tbody tr:nth-child(even) {
              background: #f9f9f9;
            }
            .status-hadir {
              color: #059669;
              font-weight: 600;
            }
            .status-izin {
              color: #2563eb;
              font-weight: 600;
            }
            .status-sakit {
              color: #d97706;
              font-weight: 600;
            }
            .status-alpha {
              color: #dc2626;
              font-weight: 600;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #ddd;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
            @media print {
              body { margin: 0; padding: 10mm; }
              .container { max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>HAL ABSENSI KARYAWAN</h1>
              <div class="subtitle">DEMARA HEALTH CARE</div>
              <div class="subtitle">Tanggal Cetak: ${dateStr}</div>
            </div>
            
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Tanggal:</span>
                <span>${filterTanggal ? getDateLabel(filterTanggal) : "Semua Tanggal"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Data:</span>
                <span><strong>${filteredAbsensi.length} record</strong></span>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>Posisi</th>
                  <th>Tanggal</th>
                  <th>Jam Masuk</th>
                  <th>Jam Keluar</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredAbsensi.map((a, index) => {
                  const statusClass = a.status === "Hadir" ? "status-hadir" : 
                                     a.status === "Izin" ? "status-izin" :
                                     a.status === "Sakit" ? "status-sakit" :
                                     a.status === "Alpha" ? "status-alpha" : "";
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td>${a.nama || "-"}</td>
                      <td>${a.posisi || "-"}</td>
                      <td>${a.date || "-"}</td>
                      <td>${a.jamMasuk || "-"}</td>
                      <td>${a.jamKeluar || "-"}</td>
                      <td class="${statusClass}">${a.status || "-"}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <div class="footer">
              <p>Dokumen ini dicetak secara otomatis dari sistem absensi Demara Health Care</p>
              <p>© ${today.getFullYear()} Demara Health Care - Happy Mommy Healthy Baby</p>
            </div>
          </div>
        </body>
      </html>`;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Saat klik Edit
  const handleEdit = (item) => {
    if (!item) return;
    setEditData(item);
    setFormData({
      nama: item.nama || "",
      posisi: item.posisi || "",
      date: item.date || "",
      jamMasuk: item.jamMasuk || "",
      jamKeluar: item.jamKeluar || "",
      status: item.status || "Hadir",
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
    
    // Validasi form
    if (!formData.nama || !formData.posisi || !formData.date || !formData.jamMasuk || !formData.jamKeluar) {
      alert("Mohon lengkapi semua field yang wajib diisi!");
      return;
    }
    
    try {
      if (editData) {
        // Update existing absensi - ensure ID is consistent
        const idToUpdate = editData.id;
        // Use setAbsensiData directly to ensure proper update
        if (setAbsensiData) {
          setAbsensiData(prev => {
            const current = Array.isArray(prev) ? prev : [];
            return current.map(a => {
              // Compare both as numbers and strings to handle both cases
              if (a.id === idToUpdate || String(a.id) === String(idToUpdate)) {
                return { ...a, ...formData, id: a.id }; // Keep original ID
              }
              return a;
            });
          });
        } else {
          updateAbsensi(idToUpdate, formData);
        }
        console.log("Data absensi berhasil diupdate:", { id: idToUpdate, data: formData });
      } else {
        // Add new absensi - ensure ID is number to match existing data
        const newId = Date.now();
        const newAbsensi = {
          ...formData,
          id: newId,
        };

        if (addAbsensi) {
          // Use context addAbsensi for optimistic render + server sync
          addAbsensi(newAbsensi);
        } else if (setAbsensiData) {
          setAbsensiData(prev => {
            const current = Array.isArray(prev) ? prev : [];
            return [...current, newAbsensi];
          });
        }

        console.log("Data absensi berhasil ditambahkan:", newAbsensi);
      }
      
      // Close modal and reset
      setShowModal(false);
      setEditData(null);
      // Reset form
      setFormData({
        nama: "",
        posisi: "",
        date: "",
        jamMasuk: "",
        jamKeluar: "",
        status: "Hadir",
      });
    } catch (error) {
      console.error("Error saat menyimpan absensi:", error);
      alert("Terjadi kesalahan saat menyimpan data. Silakan coba lagi.");
    }
  };

  // Hapus data langsung
  const handleDelete = (item) => {
    const idToDelete = item?.id;
    if (!idToDelete) return;

    if (typeof setAbsensiData === 'function') {
      setAbsensiData((prev) => {
        const current = Array.isArray(prev) ? prev : [];
        return current.filter((a) => !(a.id === idToDelete || String(a.id) === String(idToDelete)));
      });
    } else if (typeof deleteAbsensi === 'function') {
      deleteAbsensi(idToDelete);
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
        <div className="relative">
          <button
            onClick={() => setShowAksiMenu(!showAksiMenu)}
            className="px-6 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
          >
            <span>+</span> Aksi
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showAksiMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowAksiMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2">
                <button
                  onClick={handleAdd}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Absensi
                </button>
                <button
                  onClick={handleHalAbsensi}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Hal Absensi
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Absensi Karyawan Card */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden card-hover animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Daftar Absensi ({filteredAbsensi.length})</h2>
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-gray-200 bg-gray-50">
          <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal</label>
            <input
              type="date"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg font-semibold text-gray-800 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10"
            />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Karyawan</label>
            <select
              value={filterKaryawan}
              onChange={(e) => setFilterKaryawan(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg font-semibold text-gray-800 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10"
            >
              <option>Semua</option>
              {uniqueKaryawanNames.map((nama) => (
                <option key={nama} value={nama}>
                  {nama}
                </option>
              ))}
            </select>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <label className="block text-sm font-bold text-gray-700 mb-2">Status Absensi</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg font-semibold text-gray-800 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10"
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
              {Array.isArray(filteredAbsensi) && filteredAbsensi.length > 0 ? (
                filteredAbsensi.map((a, i) => {
                  if (!a || !a.id) return null;
                  return (
                    <tr key={a.id || i} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-800 font-semibold">{a.nama || "-"}</td>
                      <td className="px-6 py-4 text-gray-700">{a.posisi || "-"}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{a.date || "-"}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{a.jamMasuk || "-"}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{a.jamKeluar || "-"}</td>
                      <td className="px-6 py-4">
                        {a.status === "Hadir" && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200">✓ Hadir</span>}
                        {a.status === "Izin" && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Izin</span>}
                        {a.status === "Sakit" && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">Sakit</span>}
                        {a.status === "Alpha" && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">✕ Alpha</span>}
                        {!a.status && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">-</span>}
                      </td>
                      <td className="px-6 py-4 text-center flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(a)} className="text-blue-600 font-semibold hover:text-blue-700 transition-colors text-sm">Edit</button>
                        <button onClick={() => handleDelete(a)} className="text-red-600 font-semibold hover:text-red-700 transition-colors text-sm">Hapus</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data absensi
                  </td>
                </tr>
              )}
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
                <select
                  value={formData.nama}
                  onChange={(e) => {
                    const nama = e.target.value;
                    // find posisi from karyawanData if available
                    const match = Array.isArray(karyawanData) ? karyawanData.find(k => k && k.nama === nama) : null;
                    setFormData({ ...formData, nama, posisi: match ? (match.posisi || "") : "" });
                  }}
                  className="w-full border border-gray-200 p-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-opacity-10 transition"
                  required
                >
                  <option value="">Pilih Karyawan</option>
                  {uniqueKaryawanNames.map((nama) => (
                    <option key={nama} value={nama}>{nama}</option>
                  ))}
                </select>
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

    </main>
  );
}

export default Absensi;
