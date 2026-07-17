import React, { useState, useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";

const TOTAL_JATAH_CUTI = 12;

export default function CutiKaryawan() {
  const { userProfile, karyawanData = [], cutiData = [], setCutiData, addCuti, updateCuti, deleteCuti, fetchCutiData } = useContext(AppContext);

  // Otomatis tarik data terbaru dari server saat komponen ini dirender (saat karyawan membuka menu Cuti)
  React.useEffect(() => {
    if (typeof fetchCutiData === 'function') {
      fetchCutiData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter cuti berdasarkan nama karyawan yang login
  const myCutiData = useMemo(() => {
    if (!userProfile?.name) return [];
    const allData = Array.isArray(cutiData) ? cutiData : [];
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

  // ─────────────────────────────────────────────
  // KALKULASI KUOTA CUTI
  // ─────────────────────────────────────────────

  // Cuti yang sudah DISETUJUI
  const cutiDisetujui = useMemo(() =>
    myCutiData
      .filter(item => item.status === "Disetujui")
      .reduce((total, item) => total + Number(item.lama || 0), 0),
    [myCutiData]
  );

  // Cuti yang masih PENDING (ikut dihitung agar tidak bisa spam)
  const cutiPending = useMemo(() =>
    myCutiData
      .filter(item => item.status === "Pending")
      .reduce((total, item) => total + Number(item.lama || 0), 0),
    [myCutiData]
  );

  // Total terpakai = Disetujui + Pending
  const cutiTerpakai = cutiDisetujui + cutiPending;

  // Sisa cuti efektif (yang bisa diajukan)
  const sisaCutiEfektif = TOTAL_JATAH_CUTI - cutiTerpakai;

  // Persentase pemakaian untuk progress bar
  const pctTerpakai = Math.min((cutiTerpakai / TOTAL_JATAH_CUTI) * 100, 100);
  const pctDisetujui = Math.min((cutiDisetujui / TOTAL_JATAH_CUTI) * 100, 100);
  const pctPending = Math.min((cutiPending / TOTAL_JATAH_CUTI) * 100, 100);

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

  // ─────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────

  const getUserName = () => userProfile?.name || userProfile?.nama || "";
  const getKaryawanId = () => userProfile?.id || userProfile?.user_id || userProfile?.karyawanId || '';

  const openTambahModal = () => {
    setFormData({ nama: getUserName(), tanggal: "", tanggalAkhir: "", lama: "", alasan: "", status: "Pending" });
    setShowTambahModal(true);
  };

  const handleDateChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    if (newFormData.tanggal && newFormData.tanggalAkhir) {
      try {
        const start = new Date(newFormData.tanggal);
        const end = new Date(newFormData.tanggalAkhir);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          newFormData.lama = diff > 0 ? diff : 0;
        }
      } catch (err) {}
    } else if (newFormData.tanggal && !newFormData.tanggalAkhir) {
      newFormData.lama = 1;
    } else {
      newFormData.lama = "";
    }
    setFormData(newFormData);
  };

  // ─────────────────────────────────────────────
  // TAMBAH CUTI — dengan validasi kuota
  // ─────────────────────────────────────────────
  const handleTambahCuti = async (e) => {
    e.preventDefault();
    const namaAkun = getUserName();
    if (!namaAkun) {
      alert("Nama karyawan tidak boleh kosong");
      return;
    }

    // Hitung durasi
    let lamaFinal = Number(formData.lama || 0);
    if (formData.tanggal && formData.tanggalAkhir && (!formData.lama || String(formData.lama).trim() === '')) {
      try {
        const start = new Date(formData.tanggal);
        const end = new Date(formData.tanggalAkhir);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        lamaFinal = diff > 0 ? diff : 1;
      } catch (err) {
        lamaFinal = 1;
      }
    }

    // ✅ CONSTRAINT: minimal 1 hari
    if (lamaFinal < 1) {
      alert("Durasi cuti minimal 1 hari.");
      return;
    }

    // ✅ CONSTRAINT: tidak melebihi batas per sekali pengajuan
    if (lamaFinal > TOTAL_JATAH_CUTI) {
      alert(`Durasi cuti tidak boleh lebih dari ${TOTAL_JATAH_CUTI} hari dalam satu pengajuan.`);
      return;
    }

    // ✅ CONSTRAINT: kuota efektif habis
    if (sisaCutiEfektif <= 0) {
      alert(`Kuota cuti Anda sudah habis.\n\nRincian:\n• Disetujui: ${cutiDisetujui} hari\n• Menunggu persetujuan: ${cutiPending} hari\n• Total terpakai: ${cutiTerpakai} dari ${TOTAL_JATAH_CUTI} hari`);
      return;
    }

    // ✅ CONSTRAINT: tidak melebihi sisa kuota efektif
    if (lamaFinal > sisaCutiEfektif) {
      alert(`Durasi cuti (${lamaFinal} hari) melebihi sisa kuota Anda.\n\nRincian:\n• Disetujui: ${cutiDisetujui} hari\n• Menunggu persetujuan: ${cutiPending} hari\n• Sisa kuota: ${sisaCutiEfektif} hari\n\nMaksimal yang bisa diajukan: ${sisaCutiEfektif} hari.`);
      return;
    }

    const newCuti = {
      ...formData,
      lama: lamaFinal,
      nama: namaAkun,
      karyawanId: getKaryawanId(),
      id: formData.id || `CUTI${Date.now()}`,
    };

    if (addCuti) {
      await addCuti(newCuti);
    } else if (setCutiData) {
      setCutiData(prev => Array.isArray(prev) ? [...prev, newCuti] : [newCuti]);
    }

    setFormData({ nama: "", tanggal: "", tanggalAkhir: "", lama: "", alasan: "", status: "Pending" });
    setShowTambahModal(false);
  };

  // ─────────────────────────────────────────────
  // EDIT CUTI — dengan validasi kuota
  // ─────────────────────────────────────────────
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
    if (!selectedCuti) return;

    let lamaFinal = Number(formData.lama || 0);
    if (formData.tanggal && formData.tanggalAkhir && (!formData.lama || String(formData.lama).trim() === '')) {
      try {
        const start = new Date(formData.tanggal);
        const end = new Date(formData.tanggalAkhir);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        lamaFinal = diff > 0 ? diff : 1;
      } catch (err) {
        lamaFinal = formData.lama || 1;
      }
    }

    // ✅ CONSTRAINT: minimal 1 hari
    if (lamaFinal < 1) {
      alert("Durasi cuti minimal 1 hari.");
      return;
    }

    // ✅ CONSTRAINT: kuota efektif saat edit
    // Kalau item yang sedang diedit adalah Pending, sisa efektif = sisaCutiEfektif + durasi asli item ini
    // (karena cutiPending sudah menghitung item ini, jadi "dikembalikan" dulu)
    const lamaAsli = Number(selectedCuti.lama || 0);
    const isPendingItem = selectedCuti.status === "Pending";
    const sisaEfektifUntukEdit = isPendingItem
      ? sisaCutiEfektif + lamaAsli   // kembalikan kuota dari pengajuan ini
      : sisaCutiEfektif;             // kalau Ditolak/Disetujui, tidak ada efek

    if (lamaFinal > TOTAL_JATAH_CUTI) {
      alert(`Durasi cuti tidak boleh lebih dari ${TOTAL_JATAH_CUTI} hari.`);
      return;
    }

    if (lamaFinal > sisaEfektifUntukEdit) {
      alert(`Durasi cuti (${lamaFinal} hari) melebihi sisa kuota Anda.\n\nSisa kuota tersedia untuk pengajuan ini: ${sisaEfektifUntukEdit} hari.`);
      return;
    }

    const targetId = selectedCuti.id || selectedCuti._id;
    const updates = {
      ...formData,
      lama: lamaFinal,
      nama: namaAkun,
      karyawanId: getKaryawanId(),
    };

    updateCuti(targetId, updates);
    setFormData({ nama: "", tanggal: "", tanggalAkhir: "", lama: "", alasan: "", status: "Pending" });
    setShowEditModal(false);
    setSelectedCuti(null);
  };

  // ─────────────────────────────────────────────
  // HAPUS CUTI
  // ─────────────────────────────────────────────
  const handleDelete = (item) => {
    setDeleteData({ ...item, id: item.id || item._id });
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    if (deleteData) {
      const idToDelete = deleteData.id || deleteData._id;
      if (idToDelete) {
        setCutiData(prev => Array.isArray(prev) ? prev.filter(c => String(c.id || c._id) !== String(idToDelete)) : []);
        try {
          await deleteCuti(idToDelete);
        } catch (error) {
          console.error('Gagal menghapus cuti:', error);
        }
      }
      setShowDelete(false);
      setDeleteData(null);
    }
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  // Sisa kuota di form modal (real-time)
  const lamaForm = Number(formData.lama || 0);

  // Warna progress bar
  const getProgressColor = () => {
    if (pctTerpakai >= 100) return "bg-red-500";
    if (pctTerpakai >= 75) return "bg-orange-500";
    return "bg-emerald-500";
  };

  // Status badge cuti
  const getStatusBadge = (status) => {
    const base = "px-3 py-1.5 rounded-full text-xs font-bold inline-block border";
    if (status === "Disetujui") return `${base} bg-emerald-50 text-emerald-700 border-emerald-200`;
    if (status === "Ditolak") return `${base} bg-red-50 text-red-600 border-red-200`;
    return `${base} bg-amber-50 text-amber-700 border-amber-200`;
  };

  return (
    <main className="p-6 md:p-8 bg-gray-50 min-h-screen">
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.5s ease-out forwards; opacity: 0; }
        .animate-slide-down { animation: slideDown 0.4s ease-out; }
        .card-hover { transition: all 0.25s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.1); }
      `}</style>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between animate-slide-down">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Cuti Karyawan</h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Kelola Pengajuan Cuti</span>
          </div>
        </div>
      </div>

      {/* ── INFO KUOTA CUTI ── */}
      <div className="mb-6 animate-slide-up">
        <div className="bg-white shadow-md rounded-2xl p-6 card-hover">

          {/* Progress Bar Utama */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-600">Pemakaian Kuota Cuti Tahunan</span>
              <span className={`text-sm font-bold ${sisaCutiEfektif <= 0 ? 'text-red-600' : sisaCutiEfektif <= 3 ? 'text-orange-600' : 'text-emerald-600'}`}>
                {cutiTerpakai} / {TOTAL_JATAH_CUTI} hari terpakai
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              {/* Segment Disetujui */}
              <div className="h-full flex rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 transition-all duration-700"
                  style={{ width: `${pctDisetujui}%` }}
                  title={`Disetujui: ${cutiDisetujui} hari`}
                />
                <div
                  className="bg-amber-400 transition-all duration-700"
                  style={{ width: `${pctPending}%` }}
                  title={`Pending: ${cutiPending} hari`}
                />
              </div>
            </div>
            {/* Legenda */}
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Disetujui</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />Menunggu</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-200 inline-block" />Tersedia</span>
            </div>
          </div>

          {/* Kartu Rincian */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Jatah</p>
              <p className="text-2xl font-bold text-gray-800">{TOTAL_JATAH_CUTI} <span className="text-sm font-normal text-gray-500">hari</span></p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Disetujui</p>
              <p className="text-2xl font-bold text-emerald-700">{cutiDisetujui} <span className="text-sm font-normal text-emerald-500">hari</span></p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Menunggu</p>
              <p className="text-2xl font-bold text-amber-700">{cutiPending} <span className="text-sm font-normal text-amber-500">hari</span></p>
            </div>
            <div className={`rounded-xl p-4 border ${sisaCutiEfektif <= 0 ? 'bg-red-50 border-red-100' : sisaCutiEfektif <= 3 ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
              <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${sisaCutiEfektif <= 0 ? 'text-red-600' : sisaCutiEfektif <= 3 ? 'text-orange-600' : 'text-blue-600'}`}>Sisa</p>
              <p className={`text-2xl font-bold ${sisaCutiEfektif <= 0 ? 'text-red-700' : sisaCutiEfektif <= 3 ? 'text-orange-700' : 'text-blue-700'}`}>
                {Math.max(sisaCutiEfektif, 0)} <span className="text-sm font-normal">hari</span>
              </p>
            </div>
          </div>

          {/* Peringatan jika kuota menipis / habis */}
          {sisaCutiEfektif <= 0 && (
            <div className="mt-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span><strong>Kuota cuti habis.</strong> Anda tidak dapat mengajukan cuti baru tahun ini.</span>
            </div>
          )}
          {sisaCutiEfektif > 0 && sisaCutiEfektif <= 3 && (
            <div className="mt-4 flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg px-4 py-3 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span><strong>Kuota hampir habis!</strong> Sisa {sisaCutiEfektif} hari lagi yang dapat diajukan.</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pencarian</label>
            <input
              type="text"
              placeholder="Cari tanggal, alasan, atau durasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-gray-800 bg-white focus:outline-none focus:border-gray-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Filter Status</label>
            <select
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-gray-800 bg-white focus:outline-none focus:border-gray-500 transition-colors"
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
            {sisaCutiEfektif > 0 ? (
              <button
                onClick={openTambahModal}
                className="w-full bg-gray-900 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Ajukan Cuti
              </button>
            ) : (
              <div className="w-full bg-red-50 text-red-600 px-6 py-2.5 rounded-lg font-semibold text-center border border-red-200 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                Kuota Cuti Habis
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabel Cuti */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden animate-slide-up" style={{ animationDelay: '0.25s' }}>
        <div className="bg-gray-900 p-5 text-white">
          <h2 className="text-lg font-bold">Riwayat Pengajuan Cuti</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">No</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Tanggal Mulai</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Tanggal Akhir</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Durasi</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Alasan</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={item.id || item._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-600 font-medium text-sm">{index + 1}</td>
                  <td className="px-6 py-4 text-gray-800 font-medium text-sm">{item.tanggal}</td>
                  <td className="px-6 py-4 text-gray-800 font-medium text-sm">{item.tanggalAkhir || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-bold border border-gray-200">{item.lama} hari</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">{item.alasan}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={getStatusBadge(item.status)}>{item.status}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedCuti(item)}
                        className="bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-600 transition-all"
                      >
                        Detail
                      </button>
                      {item.status === "Pending" && (
                        <>
                          <button
                            onClick={() => handleEdit(item)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition-all"
                          >
                            Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center py-16">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-gray-400 font-medium">Belum ada pengajuan cuti</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════ MODAL DETAIL ═══════════════ */}
      {selectedCuti && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h4 className="text-xl font-bold text-gray-900">Detail Pengajuan Cuti</h4>
              <button onClick={() => setSelectedCuti(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: "Nama Karyawan", value: selectedCuti.nama },
                { label: "Tanggal Mulai", value: selectedCuti.tanggal },
                { label: "Tanggal Akhir", value: selectedCuti.tanggalAkhir || '-' },
                { label: "Durasi", value: `${selectedCuti.lama} hari` },
                { label: "Alasan", value: selectedCuti.alasan },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
                  <p className="text-sm font-bold text-gray-800">{value}</p>
                </div>
              ))}
              <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-0.5">Status</p>
                <span className={getStatusBadge(selectedCuti.status)}>{selectedCuti.status}</span>
              </div>
              {selectedCuti.rejectionReason && (
                <div className="bg-red-50 rounded-xl p-3.5 border border-red-100">
                  <p className="text-xs text-red-500 font-medium mb-0.5">Alasan Penolakan</p>
                  <p className="text-sm text-red-700">{selectedCuti.rejectionReason}</p>
                </div>
              )}
            </div>
            <div className="p-6 pt-0 flex gap-3">
              {selectedCuti.status === "Pending" && (
                <button
                  className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all text-sm"
                  onClick={() => { handleEdit(selectedCuti); setSelectedCuti(null); }}
                >
                  Edit
                </button>
              )}
              <button
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all text-sm"
                onClick={() => setSelectedCuti(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL TAMBAH ═══════════════ */}
      {showTambahModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h4 className="text-xl font-bold text-gray-900">Pengajuan Cuti Baru</h4>
              <button onClick={() => setShowTambahModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
            </div>

            {/* Info kuota di dalam modal */}
            <div className="px-6 pt-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between text-sm">
                <span className="text-blue-700 font-medium">Sisa kuota cuti tersedia:</span>
                <span className={`font-bold text-lg ${sisaCutiEfektif <= 3 ? 'text-orange-600' : 'text-blue-700'}`}>
                  {Math.max(sisaCutiEfektif, 0)} hari
                </span>
              </div>
              {/* Warning real-time jika input melebihi kuota */}
              {lamaForm > 0 && lamaForm > sisaCutiEfektif && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Durasi {lamaForm} hari melebihi sisa kuota ({sisaCutiEfektif} hari)</span>
                </div>
              )}
            </div>

            <form onSubmit={handleTambahCuti} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Karyawan</label>
                <input
                  type="text"
                  value={getUserName() || "-"}
                  readOnly
                  className="w-full bg-gray-100 border-2 border-gray-200 px-4 py-2.5 rounded-xl focus:outline-none text-gray-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => handleDateChange('tanggal', e.target.value)}
                    required
                    className="w-full border-2 border-gray-200 px-3 py-2.5 rounded-xl focus:border-blue-400 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={formData.tanggalAkhir}
                    min={formData.tanggal}
                    onChange={(e) => handleDateChange('tanggalAkhir', e.target.value)}
                    required
                    className="w-full border-2 border-gray-200 px-3 py-2.5 rounded-xl focus:border-blue-400 outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  Durasi Cuti
                  {formData.lama > 0 && (
                    <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${Number(formData.lama) > sisaCutiEfektif ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                      {Number(formData.lama) > sisaCutiEfektif ? `Melebihi kuota!` : `${formData.lama} hari ✓`}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="1"
                  max={TOTAL_JATAH_CUTI}
                  value={formData.lama}
                  readOnly
                  placeholder="Otomatis dari tanggal"
                  className="w-full bg-gray-100 border-2 border-gray-200 px-4 py-2.5 rounded-xl focus:outline-none cursor-not-allowed text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Alasan Cuti</label>
                <textarea
                  value={formData.alasan}
                  onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                  placeholder="Masukkan alasan cuti..."
                  required
                  className="w-full border-2 border-gray-200 px-4 py-2.5 rounded-xl focus:border-blue-400 outline-none transition-colors h-24 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={sisaCutiEfektif <= 0 || (lamaForm > 0 && lamaForm > sisaCutiEfektif)}
                  className="flex-1 bg-gray-900 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ajukan Cuti
                </button>
                <button
                  type="button"
                  onClick={() => setShowTambahModal(false)}
                  className="flex-1 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL EDIT ═══════════════ */}
      {showEditModal && selectedCuti && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h4 className="text-xl font-bold text-gray-900">Edit Pengajuan Cuti</h4>
              <button onClick={() => { setShowEditModal(false); setSelectedCuti(null); }} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
            </div>

            {/* Info kuota edit */}
            {(() => {
              const lamaAsli = Number(selectedCuti.lama || 0);
              const isPendingItem = selectedCuti.status === "Pending";
              const sisaEdit = isPendingItem ? sisaCutiEfektif + lamaAsli : sisaCutiEfektif;
              const lamaFormNum = Number(formData.lama || 0);
              return (
                <div className="px-6 pt-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center justify-between text-sm">
                    <span className="text-blue-700 font-medium">Kuota tersedia untuk edit:</span>
                    <span className={`font-bold text-lg ${sisaEdit <= 3 ? 'text-orange-600' : 'text-blue-700'}`}>{sisaEdit} hari</span>
                  </div>
                  {lamaFormNum > 0 && lamaFormNum > sisaEdit && (
                    <div className="mt-2 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>Durasi {lamaFormNum} hari melebihi kuota tersedia ({sisaEdit} hari)</span>
                    </div>
                  )}
                </div>
              );
            })()}

            <form onSubmit={handleUpdateCuti} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nama Karyawan</label>
                <input
                  type="text"
                  value={formData.nama || userProfile?.name || ""}
                  readOnly
                  className="w-full bg-gray-100 border-2 border-gray-200 px-4 py-2.5 rounded-xl focus:outline-none text-gray-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => handleDateChange('tanggal', e.target.value)}
                    required
                    className="w-full border-2 border-gray-200 px-3 py-2.5 rounded-xl focus:border-blue-400 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={formData.tanggalAkhir}
                    min={formData.tanggal}
                    onChange={(e) => handleDateChange('tanggalAkhir', e.target.value)}
                    required
                    className="w-full border-2 border-gray-200 px-3 py-2.5 rounded-xl focus:border-blue-400 outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Durasi Cuti</label>
                <input
                  type="number"
                  min="1"
                  value={formData.lama}
                  readOnly
                  className="w-full bg-gray-100 border-2 border-gray-200 px-4 py-2.5 rounded-xl focus:outline-none cursor-not-allowed text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Alasan Cuti</label>
                <textarea
                  value={formData.alasan}
                  onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                  placeholder="Masukkan alasan cuti..."
                  required
                  className="w-full border-2 border-gray-200 px-4 py-2.5 rounded-xl focus:border-blue-400 outline-none transition-colors h-24 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gray-900 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-700 transition-all"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setSelectedCuti(null); }}
                  className="flex-1 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL DELETE ═══════════════ */}
      {showDelete && deleteData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm animate-slide-up p-6">
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Hapus Pengajuan Cuti?</h2>
              <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3.5 mb-5 text-sm">
              <p className="text-gray-800 font-semibold">{deleteData.tanggal}</p>
              <p className="text-gray-500 mt-0.5">{deleteData.lama} hari • {deleteData.alasan}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDelete(false); setDeleteData(null); }}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors text-sm"
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
