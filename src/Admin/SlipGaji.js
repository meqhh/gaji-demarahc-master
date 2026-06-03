import React, { useState, useEffect, useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const getMonthLabel = (dateString) => {
  if (!dateString) return "";
  const parsed = new Date(dateString);
  if (!isNaN(parsed.getTime())) {
    return `${monthNames[parsed.getMonth()]} ${parsed.getFullYear()}`;
  }
  return "";
};

const normalizePeriode = (periode, dateValue) => {
  if (!periode && !dateValue) return "Tanpa Periode";
  if (periode && typeof periode === 'string') {
    const normalized = getMonthLabel(periode);
    if (normalized) return normalized;
    return periode;
  }
  return getMonthLabel(dateValue) || String(periode || "Tanpa Periode");
};

function SlipGaji() {
  const { karyawanData = [], slipGajiData = [], gajiData = [], absensiData = [], addSlipGaji, deleteSlipGaji, setSlipGajiData } = useContext(AppContext);
  
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [bulan, setBulan] = useState(`${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`);
  const [filterKaryawan, setFilterKaryawan] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  // Generate month/year options
  const monthYearOptions = useMemo(() => {
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const options = [];
    for (let year = 2024; year <= 2030; year++) {
      for (let month = 0; month < 12; month++) {
        options.push(`${monthNames[month]} ${year}`);
      }
    }
    return options;
  }, []);

  // Toast
  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  // Format Rupiah
  const formatRupiah = (angka) => {
    if (!angka) return "Rp 0";
    return `Rp ${parseInt(angka).toLocaleString("id-ID")}`;
  };

  // Format number for input display (with Rp prefix)
  const formatInputNumber = (num) => {
    const n = parseInt(num) || 0;
    return `Rp ${n.toLocaleString("id-ID")}`;
  };

  const deriveSlipsFromGajiData = useMemo(() => {
    if (!Array.isArray(gajiData) || gajiData.length === 0) return [];

    const BPJSTK_DEDUCTION = 75000; // Fixed BPJSTK deduction

    // Map directly from gajiData - each gaji entry becomes a slip entry
    return gajiData.map((record) => {
      const nama = record.karyawan || record.nama || "";
      const karyawan = Array.isArray(karyawanData)
        ? karyawanData.find((k) => k.nama === nama || String(k.id) === String(record.karyawanId))
        : null;
      const dateValue = record.tanggal || record.date || record.createdAt;
      // Only generate periode from date if date exists; don't default to current date
      const periode = normalizePeriode(record.periode, dateValue);

      const gajiPokok = Number(record.gajiPokok || record.gaji || 0);
      const tunjangan = Number(record.tunjangan || record.tunjanganTransport || 0);
      const bonus = Number(record.bonus || 0);
      const potonganAsuransiExisting = Number(record.potonganAsuransi || record.potonganBPJS || 0);
      const potonganTax = Number(record.potonganTax || record.potonganPajak || 0);
      const totalPenghasilan = Number(record.gajiKotor || (gajiPokok + tunjangan + bonus));
      const totalPotongan = potonganAsuransiExisting + potonganTax + BPJSTK_DEDUCTION;
      const gajiNetto = totalPenghasilan - totalPotongan;

      return {
        id: record.id || record._id || `AUTO-SLIP-${nama}-${periode}`,
        karyawanId: karyawan?.id || record.karyawanId || "",
        gajiId: record.id || record._id || "",
        nama,
        nip: karyawan?.nip || "",
        posisi: karyawan?.posisi || "",
        departemen: karyawan?.departemen || "",
        gajiPokok,
        tunjangan,
        bonus,
        potonganAsuransi: potonganAsuransiExisting + BPJSTK_DEDUCTION,
        potonganTax,
        totalPenghasilan,
        totalPotongan,
        gajiNetto,
        periode: periode || "Tanpa Periode",
        status: record.status || "Selesai",
        date: dateValue || new Date().toISOString()
      };
    });
  }, [gajiData, karyawanData]);

  const combinedSlipGajiData = useMemo(() => {
    if (!Array.isArray(slipGajiData)) return deriveSlipsFromGajiData;
    const existingKeys = new Set(slipGajiData.map((item) => `${item.nama}-${item.periode}`));
    const derived = Array.isArray(deriveSlipsFromGajiData)
      ? deriveSlipsFromGajiData.filter((item) => !existingKeys.has(`${item.nama}-${item.periode}`))
      : [];
    return [...slipGajiData, ...derived];
  }, [slipGajiData, deriveSlipsFromGajiData]);

  // Filter data
  const filteredData = useMemo(() => {
    return combinedSlipGajiData.filter((item) => {
      // hide tombstone entries
      if (item._tombstone) return false;
      const matchKaryawan = filterKaryawan === "Semua" || item.nama === filterKaryawan;
      // More flexible periode matching: if periode is not set or is null, show it anyway
      // This helps with newly created gaji records without explicit periode
      const matchPeriode = !item.periode || item.periode === "Tanpa Periode" || item.periode === bulan || getMonthLabel(item.periode) === bulan;
      const matchSearch = searchQuery === "" || 
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nip?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchKaryawan && matchPeriode && matchSearch;
    });
  }, [combinedSlipGajiData, filterKaryawan, bulan, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = combinedSlipGajiData.length;
    const draft = combinedSlipGajiData.filter(d => d.status === "Draft").length;
    const proses = combinedSlipGajiData.filter(d => d.status === "Proses").length;
    const selesai = combinedSlipGajiData.filter(d => d.status === "Selesai").length;
    return { total, draft, proses, selesai };
  }, [combinedSlipGajiData]);

  // Debug: Log data flow
  useEffect(() => {
    console.log('[SlipGaji] gajiData:', gajiData);
    console.log('[SlipGaji] deriveSlipsFromGajiData:', deriveSlipsFromGajiData);
    console.log('[SlipGaji] combinedSlipGajiData:', combinedSlipGajiData);
    console.log('[SlipGaji] filteredData:', filteredData);
    console.log('[SlipGaji] bulan filter:', bulan);
    console.log('[SlipGaji] stats:', stats);
  }, [gajiData, deriveSlipsFromGajiData, combinedSlipGajiData, filteredData, bulan, stats]);

  const handleDetail = (item) => {
    setSelectedData(item);
    setShowDetail(true);
  };

  const handleDelete = (item) => {
    setDeleteData(item);
    setShowDelete(true);
  };

  const confirmDelete = () => {
    if (deleteData) {
      const idOrAlt = deleteData.id || deleteData._id || '';
      const isDerived = String(idOrAlt).startsWith('AUTO-SLIP-');
      const isLocalTempSlip = String(idOrAlt).startsWith('SLIP-');
      const matchingGajiRecord = Array.isArray(gajiData) ? gajiData.some((g) => {
        const namaMatch = (g.nama || g.karyawan || '').toLowerCase() === (deleteData.nama || '').toLowerCase();
        const periodeMatch = normalizePeriode(g.periode, g.tanggal || g.date) === normalizePeriode(deleteData.periode, deleteData.date);
        return namaMatch && periodeMatch;
      }) : false;
      const shouldTombstone = isDerived || deleteData.gajiId || matchingGajiRecord;

      if (shouldTombstone) {
        const tomb = {
          id: `TOMB-${Date.now()}`,
          nama: deleteData.nama,
          periode: deleteData.periode || bulan,
          _tombstone: true
        };
        setSlipGajiData(prev => Array.isArray(prev) ? [...prev, tomb] : [tomb]);
      }

      if (!isDerived && !isLocalTempSlip) {
        const serverId = deleteData.id || deleteData._id || idOrAlt;
        deleteSlipGaji(serverId);
      } else {
        // If it is a derived or local temp slip, remove locally only.
        setSlipGajiData(prev => Array.isArray(prev) ? prev.filter(s => String(s.id) !== String(idOrAlt) && String(s._id || '') !== String(idOrAlt)) : []);
      }

      showToast("✗ Slip gaji berhasil dihapus!");
      setShowDelete(false);
      setDeleteData(null);
    }
  };

  const handlePrint = (item) => {
    const printWindow = window.open('', '', 'height=900,width=1200');
    const content = `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Slip Gaji - ${item.nama}</title>
        <style>
          * { margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; padding: 40px; background: white; }
          .container { max-width: 900px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #000; padding-bottom: 20px; }
          .header h1 { font-size: 22px; font-weight: bold; margin-bottom: 3px; }
          .header p { font-size: 12px; color: #333; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
          .box { border: 1px solid #ddd; padding: 15px; background: #fafafa; }
          .box h3 { font-size: 12px; font-weight: bold; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #000; }
          .row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
          .row span:first-child { font-weight: bold; color: #333; }
          .row.total { border-top: 2px solid #000; padding-top: 6px; margin-top: 6px; font-weight: bold; }
          @media print { body { margin: 0; padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SLIP GAJI KARYAWAN</h1>
            <p>DEMARA HEALTH CARE</p>
            <p>Periode: ${item.periode}</p>
          </div>
          
          <div class="grid">
            <div class="box">
              <h3>DATA KARYAWAN</h3>
              <div class="row"><span>Nama</span><span>${item.nama}</span></div>
              <div class="row"><span>NIP</span><span>${item.nip || "-"}</span></div>
              <div class="row"><span>Posisi</span><span>${item.posisi}</span></div>
              <div class="row"><span>Departemen</span><span>${item.departemen || "-"}</span></div>
            </div>
            <div class="box">
              <h3>PENGHASILAN</h3>
              <div class="row"><span>Gaji Pokok</span><span>${formatRupiah(item.gajiPokok)}</span></div>
              <div class="row"><span>Tunjangan</span><span>${formatRupiah(item.tunjangan)}</span></div>
              <div class="row"><span>Bonus</span><span>${formatRupiah(item.bonus)}</span></div>
              <div class="row total"><span>Total Penghasilan</span><span>${formatRupiah(item.totalPenghasilan)}</span></div>
            </div>
          </div>
          
          <div class="grid">
            <div class="box">
              <h3>POTONGAN</h3>
              <div class="row"><span>Asuransi</span><span>${formatRupiah(item.potonganAsuransi)}</span></div>
              <div class="row"><span>Pajak</span><span>${formatRupiah(item.potonganTax)}</span></div>
              <div class="row total"><span>Total Potongan</span><span>${formatRupiah(item.totalPotongan)}</span></div>
            </div>
            <div class="box">
              <h3>RINGKASAN</h3>
              <div class="row" style="font-weight: bold; font-size: 13px; padding: 8px 0; border-top: 2px solid #000;">
                <span>GAJI NETTO</span>
                <span>${formatRupiah(item.gajiNetto)}</span>
              </div>
            </div>
          </div>
          
          <div style="margin-top: 50px; text-align: center; font-size: 11px; color: #666;">
            <p>Dicetak: ${new Date().toLocaleDateString('id-ID')}</p>
          </div>
        </div>
        <script>setTimeout(() => window.print(), 250);</script>
      </body>
    </html>`;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <main className="p-8 bg-white min-h-screen">
      {/* Toast */}
      {toastVisible && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-6 py-3 rounded shadow-lg z-50 text-sm font-medium">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Slip Gaji</h1>
          <p className="text-sm text-gray-600 mt-1">Data slip gaji otomatis dari menu Gaji</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total },
          { label: 'Draft', value: stats.draft },
          { label: 'Proses', value: stats.proses },
          { label: 'Selesai', value: stats.selesai }
        ].map((stat, idx) => (
          <div key={idx} className="bg-gray-50 border border-gray-200 rounded p-4">
            <p className="text-xs font-semibold text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-200 rounded overflow-hidden">
        {/* Filter */}
        <div className="border-b border-gray-200 p-6 bg-gray-50">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Periode</label>
              <select 
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-600"
              >
                {monthYearOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Karyawan</label>
              <select
                value={filterKaryawan}
                onChange={(e) => setFilterKaryawan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-600"
              >
                <option>Semua</option>
                {Array.isArray(karyawanData) && karyawanData.map((k) => (
                  <option key={k.id} value={k.nama}>{k.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Cari</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nama atau NIP..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-bold text-gray-700">No</th>
                <th className="px-6 py-3 text-left font-bold text-gray-700">Nama</th>
                <th className="px-6 py-3 text-left font-bold text-gray-700">NIP</th>
                <th className="px-6 py-3 text-left font-bold text-gray-700">Posisi</th>
                <th className="px-6 py-3 text-right font-bold text-gray-700">Gaji Netto</th>
                <th className="px-6 py-3 text-left font-bold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left font-bold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-700 font-medium">{idx + 1}</td>
                    <td className="px-6 py-3 text-gray-900 font-medium">{item.nama}</td>
                    <td className="px-6 py-3 text-gray-600 text-xs">{item.nip || "-"}</td>
                    <td className="px-6 py-3 text-gray-700">{item.posisi}</td>
                    <td className="px-6 py-3 text-right text-gray-900 font-semibold">{formatRupiah(item.gajiNetto)}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        item.status === "Selesai" ? "bg-gray-200 text-gray-800" :
                        item.status === "Proses" ? "bg-gray-300 text-gray-900" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 space-x-2">
                      <button onClick={() => handleDetail(item)} className="text-gray-700 hover:text-gray-900 font-medium text-xs">Detail</button>
                      <button onClick={() => handlePrint(item)} className="text-gray-700 hover:text-gray-900 font-medium text-xs">Cetak</button>
                      <button onClick={() => handleDelete(item)} className="text-gray-600 hover:text-red-700 font-medium text-xs">Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    Belum ada slip gaji
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      {showDetail && selectedData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Detail Slip Gaji</h2>
              <button onClick={() => setShowDetail(false)} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded p-4 bg-gray-50">
                  <h3 className="font-bold text-sm text-gray-900 mb-3 pb-2 border-b">Data Karyawan</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Nama</span><span className="font-medium">{selectedData.nama}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">NIP</span><span className="font-medium">{selectedData.nip || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Posisi</span><span className="font-medium">{selectedData.posisi}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Departemen</span><span className="font-medium">{selectedData.departemen || "-"}</span></div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded p-4 bg-gray-50">
                  <h3 className="font-bold text-sm text-gray-900 mb-3 pb-2 border-b">Penghasilan</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Gaji Pokok</span><span className="font-medium">{formatRupiah(selectedData.gajiPokok)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Tunjangan</span><span className="font-medium">{formatRupiah(selectedData.tunjangan)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Bonus</span><span className="font-medium">{formatRupiah(selectedData.bonus)}</span></div>
                    <div className="flex justify-between border-t pt-2 mt-2 font-bold text-gray-900"><span>Total</span><span>{formatRupiah(selectedData.totalPenghasilan)}</span></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded p-4 bg-gray-50">
                  <h3 className="font-bold text-sm text-gray-900 mb-3 pb-2 border-b">Potongan</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Asuransi</span><span className="font-medium">{formatRupiah(selectedData.potonganAsuransi)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Pajak</span><span className="font-medium">{formatRupiah(selectedData.potonganTax)}</span></div>
                    <div className="flex justify-between border-t pt-2 mt-2 font-bold text-gray-900"><span>Total</span><span>{formatRupiah(selectedData.totalPotongan)}</span></div>
                  </div>
                </div>

                <div className="bg-gray-800 text-white rounded p-4 flex flex-col justify-center items-center">
                  <p className="text-xs font-semibold text-gray-300 mb-2">GAJI NETTO</p>
                  <p className="text-3xl font-bold">{formatRupiah(selectedData.gajiNetto)}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
              <button onClick={() => handlePrint(selectedData)} className="flex-1 bg-gray-800 text-white py-2 rounded font-medium hover:bg-gray-900">Cetak</button>
              <button onClick={() => setShowDetail(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded font-medium hover:bg-gray-50">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDelete && deleteData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Hapus Slip Gaji?</h2>
            <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
              <p className="font-medium text-gray-900">{deleteData.nama}</p>
              <p className="text-sm text-gray-600">{deleteData.posisi} • {bulan}</p>
            </div>
            <p className="text-sm text-gray-600 mb-6">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded font-medium hover:bg-gray-50">Batal</button>
              <button onClick={confirmDelete} className="flex-1 bg-gray-800 text-white py-2 rounded font-medium hover:bg-gray-900">Hapus</button>
            </div>
          </div>
        </div>
      )}


    </main>
  );
}

export default SlipGaji;
