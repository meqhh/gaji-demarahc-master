import React, { useState, useEffect } from "react";

function SlipGaji() {
  const [bulan, setBulan] = useState("Agustus 2025");
  const [karyawan, setKaryawan] = useState("Semua");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteData, setDeleteData] = useState(null);

  // Generate all month/year options from 2010 to current year + 1
  const generateMonthYearOptions = () => {
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const options = [];
    const currentYear = new Date().getFullYear();
    const endYear = currentYear + 1; // Include next year
    
    for (let year = 2010; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) {
        options.push(`${monthNames[month]} ${year}`);
      }
    }
    
    return options;
  };

  const monthYearOptions = generateMonthYearOptions();

  // Helper function to generate sample transaction details
  const generateTransactionDetails = (nama) => {
    return [
      { tanggal: "01/11/2024", namaPasien: "karintha", klinik: "klinik", tindakan: "laktasi", harga: 250000, feePercent: 10, feeTransport: 20000 },
      { tanggal: "02/11/2024", namaPasien: "yeni", klinik: "bumi sakinah", tindakan: "pijit bayi", harga: 155000, feePercent: 10, feeTransport: 15000 },
      { tanggal: "04/11/2024", namaPasien: "vhytta", klinik: "cipta asri", tindakan: "baby spa", harga: 165000, feePercent: 10, feeTransport: 0 },
      { tanggal: "05/11/2024", namaPasien: "dewi", klinik: "royal vasa", tindakan: "pijit anak", harga: 280000, feePercent: 10, feeTransport: 20000 },
      { tanggal: "06/11/2024", namaPasien: "titania", klinik: "ruko marbella", tindakan: "laktasi + oksitosin", harga: 350000, feePercent: 10, feeTransport: 0 },
      { tanggal: "07/11/2024", namaPasien: "suci reski amalia", klinik: "golden prima", tindakan: "pijit hamil", harga: 150000, feePercent: 10, feeTransport: 15000 },
    ];
  };

  // Helper function to generate fee paket
  const generateFeePaket = (nama) => {
    return [
      { namaPaket: "RISNIKHO", fee: 100000 },
      { namaPaket: "EVY", fee: 100000 },
      { namaPaket: "SURI LIM", fee: 200000 },
      { namaPaket: "IWENSARI", fee: 100000 },
      { namaPaket: "KHOSFYANTI", fee: 200000 },
      { namaPaket: "KOMEINA", fee: 100000 },
    ];
  };

  const defaultDataGaji = [
    { 
      id: 1, 
      nama: "Syardatul Maula", 
      posisi: "Bidan", 
      total: 5970000, 
      status: "Dikirim", 
      gajiPokok: 1500000, 
      uangTransport: 460000,
      feePaket: generateFeePaket("Syardatul Maula"),
      feeTindakan: 3210000,
      potonganBPJS: 50000,
      transactionDetails: generateTransactionDetails("Syardatul Maula")
    },
    { 
      id: 2, 
      nama: "Firda", 
      posisi: "Bidan", 
      total: 8456850, 
      status: "Belum Dikirim", 
      gajiPokok: 2000000, 
      uangTransport: 500000,
      feePaket: generateFeePaket("Firda"),
      feeTindakan: 4000000,
      potonganBPJS: 43150,
      transactionDetails: generateTransactionDetails("Firda")
    },
    { 
      id: 3, 
      nama: "Filga Tri Adhab", 
      posisi: "Bidan", 
      total: 7321250, 
      status: "Belum Dikirim", 
      gajiPokok: 2000000, 
      uangTransport: 450000,
      feePaket: generateFeePaket("Filga Tri Adhab"),
      feeTindakan: 3500000,
      potonganBPJS: 182750,
      transactionDetails: generateTransactionDetails("Filga Tri Adhab")
    },
    { 
      id: 4, 
      nama: "Yuyun Puspitayani H", 
      posisi: "Bidan", 
      total: 5365250, 
      status: "Dikirim", 
      gajiPokok: 1500000, 
      uangTransport: 400000,
      feePaket: generateFeePaket("Yuyun Puspitayani H"),
      feeTindakan: 2500000,
      potonganBPJS: 334750,
      transactionDetails: generateTransactionDetails("Yuyun Puspitayani H")
    },
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
    const printWindow = window.open('', '', 'height=700,width=1200');
    const totalFeeTindakan = item.transactionDetails?.reduce((sum, t) => sum + (t.harga * t.feePercent) / 100, 0) || 0;
    const totalFeeTransport = item.transactionDetails?.reduce((sum, t) => sum + (t.feeTransport || 0), 0) || 0;
    const totalGajiSebelumPotongan = (item.gajiPokok || 0) + (item.uangTransport || 0) + 
      (item.feePaket?.reduce((sum, p) => sum + p.fee, 0) || 0) + (item.feeTindakan || 0);
    
    const content = `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Slip Gaji - ${item.nama}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              color: #222;
              font-size: 11px;
            }
            .container { 
              max-width: 1000px; 
              margin: 0 auto;
              background: white;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 2px solid #333;
            }
            .header h1 {
              font-size: 20px;
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 5px;
            }
            .header .subtitle {
              font-size: 12px;
              color: #666;
            }
            .employee-info {
              margin: 15px 0;
              padding: 10px;
              background: #f9f9f9;
              border-left: 3px solid #333;
              font-size: 11px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              font-size: 10px;
            }
            thead {
              background: #333;
              color: white;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px 6px;
              text-align: left;
            }
            th {
              font-weight: 600;
              font-size: 9px;
            }
            tbody tr:nth-child(even) {
              background: #f9f9f9;
            }
            .text-right {
              text-align: right;
            }
            .total-row {
              background: #e8e8e8;
              font-weight: 600;
            }
            .summary-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin: 20px 0;
            }
            .summary-box {
              border: 1px solid #ddd;
              padding: 15px;
              background: #fafafa;
            }
            .summary-box h3 {
              font-size: 11px;
              font-weight: 700;
              margin-bottom: 10px;
              padding-bottom: 8px;
              border-bottom: 2px solid #333;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              border-bottom: 1px solid #eee;
              font-size: 11px;
            }
            .summary-row.total {
              background: #f0f0f0;
              padding: 8px 5px;
              margin-top: 8px;
              font-weight: 700;
              border-top: 2px solid #333;
              border-bottom: 2px solid #333;
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
              <h1>DEMARA HEALTH CARE</h1>
              <div class="subtitle">HAPPY MOMMY HEALTHY BABY</div>
              <div class="subtitle">SLIP GAJI - ${bulan}</div>
            </div>
            
            <div class="employee-info">
              <strong>Nama:</strong> ${item.nama} | <strong>Posisi:</strong> ${item.posisi} | <strong>Periode:</strong> ${bulan}
            </div>

            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Nama Pasien</th>
                  <th>Klinik/Home Service</th>
                  <th>Tindakan</th>
                  <th class="text-right">Harga</th>
                  <th class="text-right">FEE</th>
                  <th class="text-right">TOTAL</th>
                  <th class="text-right">FEE TRANSPORT</th>
                </tr>
              </thead>
              <tbody>
                ${item.transactionDetails && item.transactionDetails.length > 0 ? 
                  item.transactionDetails.map(trans => {
                    const totalFee = (trans.harga * trans.feePercent) / 100;
                    return `
                      <tr>
                        <td>${trans.tanggal}</td>
                        <td>${trans.namaPasien}</td>
                        <td>${trans.klinik}</td>
                        <td>${trans.tindakan}</td>
                        <td class="text-right">${formatRupiah(trans.harga)}</td>
                        <td class="text-right">${trans.feePercent}%</td>
                        <td class="text-right">${formatRupiah(totalFee)}</td>
                        <td class="text-right">${trans.feeTransport > 0 ? formatRupiah(trans.feeTransport) : "-"}</td>
                      </tr>
                    `;
                  }).join('') + `
                      <tr class="total-row">
                        <td colspan="4" class="text-right"><strong>TOTAL</strong></td>
                        <td class="text-right">-</td>
                        <td class="text-right">-</td>
                        <td class="text-right"><strong>${formatRupiah(totalFeeTindakan)}</strong></td>
                        <td class="text-right"><strong>${formatRupiah(totalFeeTransport)}</strong></td>
                      </tr>
                    `
                  : '<tr><td colspan="8" style="text-align:center;padding:15px;">Tidak ada data transaksi</td></tr>'
                }
              </tbody>
            </table>

            <div class="summary-section">
              <div class="summary-box">
                <h3>RINCIAN GAJI</h3>
                <div class="summary-row">
                  <span>GAJI POKOK</span>
                  <span>${formatRupiah(item.gajiPokok || 0)}</span>
                </div>
                <div class="summary-row">
                  <span>UANG TRANSPORT</span>
                  <span>${formatRupiah(item.uangTransport || 0)}</span>
                </div>
                ${item.feePaket && item.feePaket.length > 0 ? 
                  item.feePaket.map(p => `
                    <div class="summary-row">
                      <span>FEE PAKET ${p.namaPaket}</span>
                      <span>${formatRupiah(p.fee)}</span>
                    </div>
                  `).join('') : ''
                }
                <div class="summary-row">
                  <span>FEE TINDAKAN</span>
                  <span>${formatRupiah(item.feeTindakan || 0)}</span>
                </div>
                <div class="summary-row total">
                  <span>TOTAL GAJI ${bulan.split(' ')[0].toUpperCase()}</span>
                  <span>${formatRupiah(totalGajiSebelumPotongan)}</span>
                </div>
              </div>

              <div class="summary-box">
                <h3>POTONGAN</h3>
                <div class="summary-row">
                  <span>POTONG BPJS TK</span>
                  <span>${formatRupiah(item.potonganBPJS || 0)}</span>
                </div>
                <div class="summary-row total">
                  <span>TOTAL GAJI</span>
                  <span>${formatRupiah(item.total)}</span>
                </div>
              </div>
            </div>

            <div style="margin-top:20px;font-size:10px;color:#777;text-align:center;border-top:1px solid #ddd;padding-top:10px">
              Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} 
              pukul ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <script>setTimeout(() => window.print(), 250);</script>
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
              {monthYearOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
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
          <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl p-8 animate-slide-up max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-semibold text-gray-900">Detail Slip Gaji - {selectedData.nama}</h2>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-gray-400 hover:text-gray-600 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500">Periode: {bulan}</p>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Tabel Detail Transaksi */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Transaksi</h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">Tanggal</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">Nama Pasien</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">Klinik/Home Service</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">Tindakan</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b">Harga</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b">FEE</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b">TOTAL</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 border-b">FEE TRANSPORT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedData.transactionDetails && selectedData.transactionDetails.length > 0 ? (
                        selectedData.transactionDetails.map((trans, idx) => {
                          const totalFee = (trans.harga * trans.feePercent) / 100;
                          return (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2 text-gray-700">{trans.tanggal}</td>
                              <td className="px-4 py-2 text-gray-700">{trans.namaPasien}</td>
                              <td className="px-4 py-2 text-gray-700">{trans.klinik}</td>
                              <td className="px-4 py-2 text-gray-700">{trans.tindakan}</td>
                              <td className="px-4 py-2 text-right text-gray-700">{formatRupiah(trans.harga)}</td>
                              <td className="px-4 py-2 text-right text-gray-700">{trans.feePercent}%</td>
                              <td className="px-4 py-2 text-right font-semibold text-gray-900">{formatRupiah(totalFee)}</td>
                              <td className="px-4 py-2 text-right text-gray-700">{trans.feeTransport > 0 ? formatRupiah(trans.feeTransport) : "-"}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-gray-400">Tidak ada data transaksi</td>
                        </tr>
                      )}
                      {selectedData.transactionDetails && selectedData.transactionDetails.length > 0 && (
                        <tr className="bg-gray-100 font-semibold">
                          <td colSpan={4} className="px-4 py-3 text-right text-gray-900">TOTAL</td>
                          <td className="px-4 py-3 text-right text-gray-700">-</td>
                          <td className="px-4 py-3 text-right text-gray-700">-</td>
                          <td className="px-4 py-3 text-right text-gray-900">
                            {formatRupiah(selectedData.transactionDetails.reduce((sum, t) => sum + (t.harga * t.feePercent) / 100, 0))}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900">
                            {formatRupiah(selectedData.transactionDetails.reduce((sum, t) => sum + (t.feeTransport || 0), 0))}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Gaji */}
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">Rincian Gaji</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">GAJI POKOK</span>
                      <span className="font-semibold text-gray-900">{formatRupiah(selectedData.gajiPokok || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">UANG TRANSPORT</span>
                      <span className="font-semibold text-gray-900">{formatRupiah(selectedData.uangTransport || 0)}</span>
                    </div>
                    {selectedData.feePaket && selectedData.feePaket.length > 0 && (
                      <>
                        {selectedData.feePaket.map((paket, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-700">FEE PAKET {paket.namaPaket}</span>
                            <span className="font-semibold text-gray-900">{formatRupiah(paket.fee)}</span>
                          </div>
                        ))}
                      </>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">FEE TINDAKAN</span>
                      <span className="font-semibold text-gray-900">{formatRupiah(selectedData.feeTindakan || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 mt-2 border-t border-gray-300 font-bold">
                      <span className="text-gray-900">TOTAL GAJI {bulan.split(' ')[0].toUpperCase()}</span>
                      <span className="text-gray-900">
                        {formatRupiah(
                          (selectedData.gajiPokok || 0) +
                          (selectedData.uangTransport || 0) +
                          (selectedData.feePaket?.reduce((sum, p) => sum + p.fee, 0) || 0) +
                          (selectedData.feeTindakan || 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">Potongan</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">POTONG BPJS TK</span>
                      <span className="font-semibold text-gray-900">{formatRupiah(selectedData.potonganBPJS || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 mt-2 border-t border-gray-300 font-bold">
                      <span className="text-gray-900">TOTAL GAJI</span>
                      <span className="text-gray-900">{formatRupiah(selectedData.total)}</span>
                    </div>
                  </div>
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
