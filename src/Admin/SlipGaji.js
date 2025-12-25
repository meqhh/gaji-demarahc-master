import React, { useState, useEffect } from "react";

function SlipGaji() {
  const [bulan, setBulan] = useState("Agustus 2025");
  const [karyawan, setKaryawan] = useState("Semua");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  const defaultDataGaji = [
    { id: 1, nama: "Syardatul Maula", posisi: "Bidan", total: 6759250, status: "Dikirim", gajiPokok: 2000000, tunjangan: 1500000, bonus: 500000, potongan: 241750 },
    { id: 2, nama: "Firda", posisi: "Bidan", total: 8456850, status: "Belum Dikirim", gajiPokok: 2000000, tunjangan: 1800000, bonus: 800000, potongan: 143150 },
    { id: 3, nama: "Filga Tri Adhab", posisi: "Bidan", total: 7321250, status: "Belum Dikirim", gajiPokok: 2000000, tunjangan: 1700000, bonus: 700000, potongan: 178750 },
    { id: 4, nama: "Yuyun Puspitayani H", posisi: "Bidan", total: 5365250, status: "Dikirim", gajiPokok: 2000000, tunjangan: 1300000, bonus: 400000, potongan: 334750 },
  ];

  const sampleNames = [
    "Ahmad Fikri", "Siti Hapsari", "Budi Santoso", "Dewi Lestari", "Rizky Pratama",
    "Intan Permata", "Aulia Rahman", "Rina Kurnia", "Taufik Hidayat", "Maya Sari",
    "Fajar Nugroho", "Rina Dewi", "Andi Wijaya", "Lina Marlina", "Hendra Saputra",
    "Nadia Safitri", "Yusuf Ramadhan", "Siska Amelia", "Ricky Adi", "Putri Anggraini",
    "Doni Prasetyo", "Vina Oktavia", "Eko Saputra", "Linda Kusuma", "Hesti Rahma",
    "Ardiansyah", "Nina Mariana", "Galih Pratama", "Fitriani", "Slamet Widodo"
  ];

  const [dataGaji, setDataGaji] = useState(defaultDataGaji);

  useEffect(() => {
    const stored = defaultDataGaji;
    const existingNames = stored.map((g) => g.nama);
    const merged = [...stored];

    let nextId = Math.max(...stored.map(g => g.id), 0) + 1;

    sampleNames.forEach((name) => {
      if (!existingNames.includes(name)) {
        merged.push({
          id: nextId,
          nama: name,
          posisi: "Staff",
          total: 5500000,
          status: "Belum Dikirim",
          gajiPokok: 2000000,
          tunjangan: 1500000,
          bonus: 300000,
          potongan: 300000
        });
        nextId += 1;
      }
    });

    setDataGaji(merged);
  }, []);

  const filteredData = dataGaji.filter((item) =>
    karyawan === "Semua" ? true : item.nama === karyawan
  );

  const formatRupiah = (angka) =>
    `Rp. ${angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;

  const handleDetail = (item) => {
    setSelectedData(item);
    setShowDetail(true);
  };

  const handleCetak = (item) => {
    // Buat window baru untuk print dengan HTML yang sederhana dan aman
    const printWindow = window.open('', '', 'height=700,width=900');
    const content = `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Slip Gaji - ${item.nama}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
            .container { max-width: 700px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo { font-size: 18px; font-weight: bold; color: #6b21a8; }
            .company { font-size: 12px; color: #666; }
            .row { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #eee; }
            .label { font-weight:600; color:#333; }
            .value { color:#111; }
            .total { font-weight:700; font-size:18px; margin-top:12px; }
            @media print { body { margin:0; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">DEMARA HEALTH CARE</div>
              <div class="company">Happy Mommy Healthy Baby</div>
              <h3>SLIP GAJI - ${bulan}</h3>
            </div>
            <div class="row"><div class="label">Nama Karyawan</div><div class="value">${item.nama}</div></div>
            <div class="row"><div class="label">Posisi</div><div class="value">${item.posisi}</div></div>
            <div class="row"><div class="label">Periode</div><div class="value">${bulan}</div></div>
            <div class="row"><div class="label">Status</div><div class="value">${item.status}</div></div>
            <h4 style="margin-top:16px;">Komponen Gaji</h4>
            <div class="row"><div class="label">Gaji Pokok</div><div class="value">${formatRupiah(item.gajiPokok)}</div></div>
            <div class="row"><div class="label">Tunjangan</div><div class="value">${formatRupiah(item.tunjangan)}</div></div>
            <div class="row"><div class="label">Bonus</div><div class="value">${formatRupiah(item.bonus)}</div></div>
            <h4 style="margin-top:16px;">Potongan</h4>
            <div class="row"><div class="label">Total Potongan</div><div class="value">${formatRupiah(item.potongan)}</div></div>
            <div class="total">TOTAL GAJI BERSIH: ${formatRupiah(item.total)}</div>
            <div style="margin-top:20px;font-size:12px;color:#777">Dicetak pada: ${new Date().toLocaleDateString('id-ID')}</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>`;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const handleDelete = (item) => {
    setDeleteData(item);
    setShowDelete(true);
  };

  const confirmDelete = () => {
    if (deleteData) {
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
          <h1 className="text-4xl font-bold text-purple-600 mb-1">Slip Gaji</h1>
          <div className="flex items-center gap-2 text-gray-500">
            <span className="inline-block text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" />
              </svg>
            </span>
            <span className="text-gray-400">Slip Gaji</span>
          </div>
        </div>
      </div>

      {/* Slip Gaji Card */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden card-hover animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="border-b-2 border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900">Slip Gaji</h2>
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 border-b border-gray-200 bg-gray-50">
          <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <label className="block text-sm font-bold text-gray-700 mb-2">Bulan/Tahun</label>
            <select 
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-800 bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:border-purple-400"
            >
              <option>Juli 2025</option>
              <option>Agustus 2025</option>
              <option>September 2025</option>
            </select>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <label className="block text-sm font-bold text-gray-700 mb-2">Pilih Karyawan</label>
            <select
              value={karyawan}
              onChange={(e) => setKaryawan(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-800 bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:border-purple-400"
            >
              <option>Semua</option>
              {dataGaji.map((item) => (
                <option key={item.id}>{item.nama}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">No.</th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Nama Karyawan</th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Posisi</th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Total Gaji</th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Status</th>
                <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-all animate-slide-up"
                  style={{ animationDelay: `${0.25 + index * 0.05}s` }}
                >
                  <td className="px-8 py-5 bg-gray-100 text-gray-800 font-semibold">{String(index + 1).padStart(2, "0")}.</td>
                  <td className="px-8 py-5 bg-gray-100 text-gray-800 font-medium">{item.nama}</td>
                  <td className="px-8 py-5 bg-gray-100 text-gray-800">{item.posisi}</td>
                  <td className="px-8 py-5 bg-gray-100 text-gray-800 font-semibold">{formatRupiah(item.total)}</td>
                  <td className="px-8 py-5 bg-gray-100 text-center">
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold inline-block ${
                        item.status === "Dikirim"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 bg-gray-100 text-left space-x-2">
                    <button 
                      onClick={() => handleDetail(item)}
                      className="text-green-600 hover:text-green-700 font-bold text-sm transition-colors"
                    >
                      Detail
                    </button>
                    <button 
                      onClick={() => handleCetak(item)}
                      className="text-blue-600 hover:text-blue-700 font-bold text-sm transition-colors"
                    >
                      Cetak
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="text-red-600 hover:text-red-700 font-bold text-sm transition-colors"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-2xl text-gray-400">📭 Belum ada slip gaji untuk periode ini</p>
            </div>
          )}
        </div>
      </div>

      {/* === Modal Detail Slip Gaji === */}
      {showDetail && selectedData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-semibold text-gray-900">Detail Slip Gaji</h2>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-gray-400 hover:text-gray-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500">Informasi lengkap slip gaji {selectedData.nama}</p>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Data Karyawan */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Karyawan</label>
                  <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg">
                    <p className="text-gray-900 font-medium">{selectedData.nama}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Posisi</label>
                  <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg">
                    <p className="text-gray-900 font-medium">{selectedData.posisi}</p>
                  </div>
                </div>
              </div>

              {/* Periode & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Periode</label>
                  <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg">
                    <p className="text-gray-900 font-medium">{bulan}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-lg">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                        selectedData.status === "Dikirim"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {selectedData.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Komponen Gaji */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Komponen Gaji</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-700">Gaji Pokok</span>
                    <span className="font-semibold text-gray-900">{formatRupiah(selectedData.gajiPokok)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-700">Tunjangan</span>
                    <span className="font-semibold text-gray-900">{formatRupiah(selectedData.tunjangan)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-700">Bonus</span>
                    <span className="font-semibold text-gray-900">{formatRupiah(selectedData.bonus)}</span>
                  </div>
                </div>
              </div>

              {/* Potongan */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Potongan</h3>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-700">Total Potongan</span>
                  <span className="font-semibold text-gray-900">{formatRupiah(selectedData.potongan)}</span>
                </div>
              </div>

              {/* Total Gaji Bersih */}
              <div className="bg-gray-900 text-white p-6 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">TOTAL GAJI BERSIH</span>
                  <span className="text-2xl font-bold">{formatRupiah(selectedData.total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleCetak(selectedData)}
                  className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Cetak
                </button>
                <button
                  onClick={() => setShowDetail(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === Modal Delete Slip Gaji === */}
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
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Hapus Slip Gaji</h2>
              <p className="text-sm text-gray-500">Anda akan menghapus:</p>
            </div>

            {/* Data yang akan dihapus */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-gray-900 font-medium">{deleteData.nama}</p>
              <p className="text-sm text-gray-600 mt-1">{deleteData.posisi} • {bulan}</p>
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

export default SlipGaji;
