import React, { useState, useEffect, useContext, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import Logo from "../Images/demaralogo.png";

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

  const formatPrintRupiah = (value) => {
    const normalized = typeof value === 'string'
      ? Number(String(value).replace(/[^0-9,-]/g, '').replace(',', '.'))
      : Number(value);
    const n = Number.isNaN(normalized) ? 0 : normalized;
    return `Rp ${n.toLocaleString('id-ID')}`;
  };

  const normalizeAdminSlipForPrint = (item) => {
    const month = item.periode || getMonthLabel(item.date || item.tanggal || item.createdAt) || 'Tanpa Periode';
    const transactionDetails = Array.isArray(item.transactionDetails)
      ? item.transactionDetails.map((trans) => ({
          tanggal: trans.tanggal || trans.date || trans.createdAt || '',
          namaPasien: trans.namaPasien || trans.pasien || '',
          klinik: trans.klinikHomeService || trans.klinik || '',
          tindakan: trans.tindakan || trans.treatment || '',
          harga: Number(trans.harga || 0),
          feePercent: Number(trans.feePercent ?? trans.feePersen ?? 0),
          feeTransport: Number(trans.feeTransport || 0),
        }))
      : [];

    const feePaketArray = Array.isArray(item.feePaket)
      ? item.feePaket.map((p) => ({
          nama: p.nama || p.namaPaket || '',
          jumlah: Number(p.jumlah || p.fee || p.amount || 0),
        }))
      : typeof item.feePaket === 'number'
        ? [{ nama: 'Fee Paket', jumlah: Number(item.feePaket) }]
        : [];

    return {
      month,
      employee: {
        name: item.nama || item.karyawan || '',
        position: item.posisi || item.departemen || '',
      },
      gajiPokok: Number(item.gajiPokok || item.gaji || item.totalGajiPokok || 0),
      uangTransport: Number(item.tunjanganTransport || item.tunjangan || item.transport || 0),
      feeTindakan: Number(item.feeTindakan || item.bonus || item.totalFeeTindakan || 0),
      feePaket: feePaketArray,
      potongBpjsTk: Number(item.potonganAsuransi || item.potonganBPJS || 0),
      potonganBPJS: Number(item.potonganAsuransi || item.potonganBPJS || 0),
      amount: formatPrintRupiah(item.gajiNetto ?? item.totalPenghasilan ?? item.gajiKotor ?? 0),
      transactionDetails,
    };
  };

  const normalizeAdminSlipForDisplay = (item) => {
    if (!item || typeof item !== 'object') return item;

    const gajiPokok = Number(item.gajiPokok || item.gaji || item.totalGajiPokok || 0);
    const tunjanganTransport = Number(item.tunjanganTransport || item.tunjangan || 0);
    const feeTindakan = Number(item.feeTindakan || item.bonus || item.totalFeeTindakan || 0);
    const feePaket = Array.isArray(item.feePaket)
      ? item.feePaket.reduce((sum, fee) => sum + Number((fee.total ?? fee.amount ?? fee.jumlah ?? fee.fee) || 0), 0)
      : Number(item.feePaket || item.totalFeePaket || 0);
    const potonganBPJS = Number(item.potonganBPJS || item.potonganAsuransi || item.bpjs || item.asuransi || 0);
    const potonganPajak = Number(item.potonganPajak || item.potonganTax || item.pajak || 0);
    const totalPenghasilan = Number(item.totalPenghasilan ?? item.gajiKotor ?? gajiPokok + tunjanganTransport + feeTindakan + feePaket);
    const totalPotongan = Number(item.totalPotongan ?? potonganBPJS + potonganPajak);
    const gajiNetto = Number(item.gajiNetto ?? totalPenghasilan - totalPotongan);

    const transactionDetails = Array.isArray(item.transactionDetails)
      ? item.transactionDetails.map((trans) => ({
          ...trans,
          tanggal: trans.tanggal || trans.date || trans.createdAt || '',
          namaPasien: trans.namaPasien || trans.pasien || '',
          klinikHomeService: trans.klinikHomeService || trans.klinik || '',
          tindakan: trans.tindakan || trans.treatment || '',
          harga: Number(trans.harga || 0),
          feePercent: Number(trans.feePercent ?? trans.feePersen ?? 0),
          totalFee: Number(trans.totalFee || Math.round((Number(trans.harga || 0) * Number((trans.feePercent ?? trans.feePersen) || 0)) / 100)),
          feeTransport: Number(trans.feeTransport || 0),
        }))
      : [];

    return {
      ...item,
      gajiPokok,
      tunjanganTransport,
      feeTindakan,
      feePaket,
      potonganBPJS,
      potonganPajak,
      totalPenghasilan,
      totalPotongan,
      gajiNetto,
      transactionDetails,
    };
  };

  const generateAdminPrintableSlip = (item) => {
    const slip = normalizeAdminSlipForPrint(item);
    const totalFeeTindakan = slip.transactionDetails.reduce((sum, t) => {
      return sum + Math.round((Number(t.harga) || 0) * (Number(t.feePercent) || 0) / 100);
    }, 0) || slip.feeTindakan;
    const totalFeeTransport = slip.transactionDetails.reduce((sum, t) => sum + Number(t.feeTransport || 0), 0);
    const totalFeePaket = slip.feePaket.reduce((sum, p) => sum + Number(p.jumlah || 0), 0);
    const totalGajiSebelumPotongan = Number(slip.gajiPokok || 0) + Number(slip.uangTransport || 0) + totalFeePaket + totalFeeTindakan;

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Slip Gaji - ${slip.month}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; min-height: 100%; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; font-size: 12px; line-height: 1.5; }
    @page { size: A4; margin: 10mm; }
    .page { width: 210mm; min-height: 297mm; background: white; margin: 10px auto; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); display: flex; flex-direction: column; position: relative; }
    .header-section { display: flex; align-items: flex-start; gap: 15px; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #333; }
    .logo-container { width: 70px; height: 70px; flex-shrink: 0; background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
    .logo-container img { max-width: 100%; max-height: 100%; width: auto; height: auto; }
    .company-header { flex: 1; }
    .company-header h1 { font-size: 16px; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
    .company-header .tagline { font-size: 11px; color: #666; font-weight: 600; margin-bottom: 6px; }
    .company-header .address { font-size: 10px; color: #888; line-height: 1.3; }
    .employee-section { margin-bottom: 15px; padding: 12px; background: #fafafa; border-left: 3px solid #007bff; font-size: 11px; }
    .employee-section p { margin: 4px 0; display: flex; }
    .employee-section strong { width: 100px; color: #333; }
    .main-table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 10px; table-layout: fixed; }
    .main-table thead { background: #e8e8e8; }
    .main-table th, .main-table td { border: 1px solid #999; padding: 8px 4px; word-wrap: break-word; }
    .main-table th { font-weight: 600; font-size: 9px; text-align: left; }
    .main-table tr:nth-child(even) { background: #f9f9f9; }
    .text-right { text-align: right; }
    .total-row { background: #e8e8e8; font-weight: 600; }
    .summary-section { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; flex-grow: 1; }
    .summary-box { border: 1px solid #ddd; padding: 15px; background: #fafafa; }
    .summary-box h3 { font-size: 11px; font-weight: 700; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #007bff; color: #333; }
    .summary-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; font-size: 11px; }
    .summary-row:last-child { border-bottom: none; }
    .summary-row.total { background: #f0f0f0; padding: 8px 5px; margin-top: 8px; font-weight: 700; border-top: 2px solid #333; border-bottom: 2px solid #333; }
    .summary-label { font-weight: 600; color: #333; }
    .summary-value { text-align: right; font-family: 'Courier New', monospace; font-weight: 600; color: #1a1a1a; }
    .footer-section { text-align: center; font-size: 9px; color: #888; padding-top: 15px; border-top: 1px solid #ddd; margin-top: auto; }
    .footer-section p { margin: 3px 0; }
    @media print { body { background: white; margin: 0; padding: 0; } .page { margin: 0; padding: 15mm; box-shadow: none; width: auto; min-height: auto; } @page { margin: 10mm; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="header-section">
      <div class="logo-container"><img src="${Logo}" alt="Demara Logo" /></div>
      <div class="company-header">
        <h1>DEMARA HEALTH CARE</h1>
        <div class="tagline">HAPPY MOMMY HEALTHY BABY</div>
        <div class="address">Jl. Raya No. 123, Jakarta, Indonesia<br />Tel: (021) 1234567 | Email: info@demaracare.com</div>
      </div>
    </div>
    <div class="employee-section">
      <p><strong>Nama</strong> : ${slip.employee.name}</p>
      <p><strong>Posisi</strong> : ${slip.employee.position}</p>
      <p><strong>Periode</strong> : ${slip.month}</p>
    </div>
    <table class="main-table">
      <thead>
        <tr>
          <th style="width: 10%;">Tanggal</th>
          <th style="width: 15%;">Nama Pasien</th>
          <th style="width: 15%;">Klinik / Home Service</th>
          <th style="width: 15%;">Tindakan</th>
          <th style="width: 10%;" class="text-right">Harga</th>
          <th style="width: 7%;" class="text-right">FEE</th>
          <th style="width: 12%;" class="text-right">TOTAL</th>
          <th style="width: 12%;" class="text-right">FEE TRANSPORT</th>
        </tr>
      </thead>
      <tbody>
        ${slip.transactionDetails && slip.transactionDetails.length > 0 ? slip.transactionDetails.map((trans) => {
          const totalFee = Math.round((Number(trans.harga) || 0) * (Number(trans.feePercent) || 0) / 100);
          return `<tr>
            <td>${trans.tanggal || '-'}</td>
            <td>${trans.namaPasien || '-'}</td>
            <td>${trans.klinik || '-'}</td>
            <td>${trans.tindakan || '-'}</td>
            <td class="text-right">${formatPrintRupiah(trans.harga)}</td>
            <td class="text-right">${trans.feePercent || 0}%</td>
            <td class="text-right">${formatPrintRupiah(totalFee)}</td>
            <td class="text-right">${trans.feeTransport > 0 ? formatPrintRupiah(trans.feeTransport) : '-'}</td>
          </tr>`
        }).join('') : '<tr><td colspan="8" style="text-align: center; padding: 15px; color: #999;">Tidak ada data transaksi</td></tr>'}
        ${slip.transactionDetails && slip.transactionDetails.length > 0 ? `
          <tr class="total-row">
            <td colspan="4" style="text-align: right; padding-right: 10px;"><strong>TOTAL</strong></td>
            <td class="text-right">-</td>
            <td class="text-right">-</td>
            <td class="text-right"><strong>${formatPrintRupiah(totalFeeTindakan)}</strong></td>
            <td class="text-right"><strong>${formatPrintRupiah(totalFeeTransport)}</strong></td>
          </tr>` : ''}
      </tbody>
    </table>
    <div class="summary-section">
      <div class="summary-box">
        <h3>RINCIAN GAJI</h3>
        <div class="summary-row"><span class="summary-label">GAJI POKOK</span><span class="summary-value">${formatPrintRupiah(slip.gajiPokok)}</span></div>
        <div class="summary-row"><span class="summary-label">UANG TRANSPORT</span><span class="summary-value">${formatPrintRupiah(slip.uangTransport)}</span></div>
        ${slip.feePaket.map((p) => `
          <div class="summary-row"><span class="summary-label">FEE PAKET ${p.nama || ''}</span><span class="summary-value">${formatPrintRupiah(p.jumlah)}</span></div>
        `).join('')}
        <div class="summary-row"><span class="summary-label">FEE TINDAKAN</span><span class="summary-value">${formatPrintRupiah(slip.feeTindakan)}</span></div>
        <div class="summary-row total"><span class="summary-label">TOTAL GAJI</span><span class="summary-value">${formatPrintRupiah(totalGajiSebelumPotongan)}</span></div>
      </div>
      <div class="summary-box">
        <h3>POTONGAN</h3>
        <div class="summary-row"><span class="summary-label">POTONG BPJS TK</span><span class="summary-value">${formatPrintRupiah(slip.potonganBPJS)}</span></div>
        <div class="summary-row total"><span class="summary-label">TOTAL GAJI</span><span class="summary-value">${slip.amount}</span></div>
      </div>
    </div>
    <div class="footer-section">
      <p>Dokumen ini dicetak pada ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })} pukul ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
      <p>© Demara Health Care - Portal Admin</p>
    </div>
  </div>
</body>
</html>`;
  };

  const getSlipSummary = (item) => {
    if (!item) return {
      gajiPokok: 0,
      tunjanganTransport: 0,
      feeTindakan: 0,
      feePaket: 0,
      totalGross: 0,
      potonganBPJS: 0,
      potonganPajak: 0,
      totalPotongan: 0,
      gajiNetto: 0,
    };

    const gajiPokok = Number(item.gajiPokok || item.gaji || item.totalGajiPokok || 0);
    const tunjanganTransport = Number(item.tunjanganTransport || item.tunjangan || 0);
    const feeTindakan = Number(item.feeTindakan || item.bonus || item.totalFeeTindakan || 0);
    const feePaket = Array.isArray(item.feePaket)
      ? item.feePaket.reduce((sum, fee) => sum + Number(fee.total ?? fee.amount ?? fee.jumlah ?? fee.fee ?? 0), 0)
      : Number(item.feePaket || item.totalFeePaket || 0);
    const totalGross = Number(item.totalPenghasilan ?? item.gajiKotor ?? gajiPokok + tunjanganTransport + feeTindakan + feePaket);
    const potonganBPJS = Number(item.potonganBPJS || item.potonganAsuransi || item.bpjs || item.asuransi || 0);
    const potonganPajak = Number(item.potonganPajak || item.potonganTax || item.pajak || 0);
    const totalPotongan = Number(item.totalPotongan ?? potonganBPJS + potonganPajak);
    const gajiNetto = Number(item.gajiNetto ?? item.totalPenghasilan ?? totalGross - totalPotongan);

    return {
      gajiPokok,
      tunjanganTransport,
      feeTindakan,
      feePaket,
      totalGross,
      potonganBPJS,
      potonganPajak,
      totalPotongan,
      gajiNetto,
    };
  };

  const deriveSlipsFromGajiData = useMemo(() => {
    if (!Array.isArray(gajiData) || gajiData.length === 0) return [];

    const BPJSTK_DEDUCTION = 75000; // Fixed BPJSTK deduction
    const groups = {};

    gajiData.forEach((record) => {
      const nama = record.karyawan || record.nama || "";
      if (!nama) return;

      const dateValue = record.tanggal || record.date || record.createdAt || new Date().toISOString();
      const periode = getMonthLabel(dateValue) || "Tanpa Periode";
      const key = `${nama}||${periode}`;

      if (!groups[key]) {
        const karyawan = Array.isArray(karyawanData)
          ? karyawanData.find((k) => String(k.nama || k.name) === String(nama))
          : null;

        groups[key] = {
          id: `AUTO-SLIP-${nama}-${periode}`,
          gajiId: record.id || record._id || "",
          karyawanId: karyawan?.id || record.karyawanId || "",
          nama,
          nip: karyawan?.nip || "",
          posisi: karyawan?.posisi || karyawan?.position || "",
          departemen: karyawan?.departemen || karyawan?.department || "",
          gajiPokok: Number(karyawan?.gajiPokok || record.gajiPokok || record.gaji || 0),
          tunjangan: Number(karyawan?.tunjanganTransport || record.tunjanganTransport || record.tunjangan || 0),
          bonus: Number(record.bonus || 0),
          potonganAsuransi: Number(record.potonganAsuransi || record.potonganBPJS || 0) + BPJSTK_DEDUCTION,
          potonganTax: Number(record.potonganTax || record.potonganPajak || 0),
          feeTindakan: 0,
          feePaket: [],
          transactionDetails: [],
          periode,
          status: record.status || "Selesai",
          date: dateValue
        };
      }

      const group = groups[key];
      const harga = Number(record.harga || 0);
      const feePercent = Number(record.fee || 0);
      const totalFee = Math.round((harga * feePercent) / 100);

      group.feeTindakan += totalFee;
      group.transactionDetails.push({
        tanggal: record.tanggal || record.date || "",
        namaPasien: record.pasien || record.namaPasien || "",
        klinikHomeService: record.klinik || record.klinikHomeService || "",
        tindakan: record.treatment || record.tindakan || "",
        harga,
        feePercent,
        totalFee,
        feeTransport: Number(record.feeTransport || 0)
      });
    });

    return Object.values(groups).map((group) => {
              const totalPenghasilan =
          group.gajiPokok +
          group.tunjangan +
          group.bonus +
          group.feeTindakan;

        // BPJS sudah fixed
        const bpjs = group.potonganAsuransi;

        // 💥 PAJAK AUTO (misal 5% dari penghasilan)
        const pajak = Math.round(totalPenghasilan * 0.05);

        // total potongan sekarang
        const totalPotongan = bpjs + pajak;

        const gajiNetto = totalPenghasilan - totalPotongan;

      return {
        ...group,
        totalPenghasilan,
        bpjs,
        pajak,
        totalPotongan,
        gajiNetto
      };
    });
  }, [gajiData, karyawanData]);

  const getSlipNormalizedKey = (item) => {
    if (!item) return "";
    const name = String(item.nama || item.karyawan || item.employee?.name || "").trim().toLowerCase();
    const periode = String(item.periode || getMonthLabel(item.date || item.tanggal || item.createdAt) || "Tanpa Periode").trim().toLowerCase();
    return `${name}||${periode}`;
  };

  const combinedSlipGajiData = useMemo(() => {
    if (!Array.isArray(slipGajiData)) return deriveSlipsFromGajiData;
    const existingKeys = new Set(slipGajiData.map((item) => getSlipNormalizedKey(item)));
    const derived = Array.isArray(deriveSlipsFromGajiData)
      ? deriveSlipsFromGajiData.filter((item) => !existingKeys.has(getSlipNormalizedKey(item)))
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

  const displaySlipData = useMemo(() => {
    return Array.isArray(filteredData) ? filteredData.map(normalizeAdminSlipForDisplay) : [];
  }, [filteredData]);

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
    setSelectedData(normalizeAdminSlipForDisplay(item));
    setShowDetail(true);
  };

  const handleDelete = (item) => {
    if (!item) return;
    const idOrAlt = item.id || item._id || '';
    const isDerived = String(idOrAlt).startsWith('AUTO-SLIP-');
    const isLocalTempSlip = String(idOrAlt).startsWith('SLIP-');
    const matchingGajiRecord = Array.isArray(gajiData) ? gajiData.some((g) => {
      const namaMatch = (g.nama || g.karyawan || '').toLowerCase() === (item.nama || '').toLowerCase();
      const periodeMatch = normalizePeriode(g.periode, g.tanggal || g.date) === normalizePeriode(item.periode, item.date);
      return namaMatch && periodeMatch;
    }) : false;
    const shouldTombstone = isDerived || item.gajiId || matchingGajiRecord;

    if (shouldTombstone) {
      const tomb = {
        id: `TOMB-${Date.now()}`,
        nama: item.nama,
        periode: item.periode || bulan,
        _tombstone: true
      };
      setSlipGajiData(prev => Array.isArray(prev) ? [...prev, tomb] : [tomb]);
    }

    if (!isDerived && !isLocalTempSlip) {
      const serverId = item.id || item._id || idOrAlt;
      deleteSlipGaji(serverId);
    } else {
      setSlipGajiData(prev => Array.isArray(prev) ? prev.filter(s => String(s.id) !== String(idOrAlt) && String(s._id || '') !== String(idOrAlt)) : []);
    }

    showToast("✗ Slip gaji berhasil dihapus!");
  };

  const handlePrint = (item) => {
    const printWindow = window.open('', '', 'height=900,width=1200');
    if (!printWindow) {
      alert('Silakan izinkan popup agar dapat mencetak slip gaji.');
      return;
    }
    const normalizedItem = normalizeAdminSlipForDisplay(item);
    const content = generateAdminPrintableSlip(normalizedItem);
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  const selectedSlipSummary = selectedData ? getSlipSummary(selectedData) : getSlipSummary();

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
              {displaySlipData.length > 0 ? (
                displaySlipData.map((item, idx) => (
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded p-4 bg-gray-50">
                  <h3 className="font-bold text-sm text-gray-900 mb-3 pb-2 border-b">Data Karyawan</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Nama</span><span className="font-medium">{selectedData.nama}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">NIP</span><span className="font-medium">{selectedData.nip || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Posisi</span><span className="font-medium">{selectedData.posisi || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Departemen</span><span className="font-medium">{selectedData.departemen || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Periode</span><span className="font-medium">{selectedData.periode || selectedData.date || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Status</span><span className="font-medium">{selectedData.status || "Selesai"}</span></div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded p-4 bg-gray-50">
                  <h3 className="font-bold text-sm text-gray-900 mb-3 pb-2 border-b">Komponen Penghasilan</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Gaji Pokok</span><span className="font-medium">{formatRupiah(selectedSlipSummary.gajiPokok)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Tunjangan Transport</span><span className="font-medium">{formatRupiah(selectedSlipSummary.tunjanganTransport)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Fee Tindakan</span><span className="font-medium">{formatRupiah(selectedSlipSummary.feeTindakan)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Fee Paket</span><span className="font-medium">{formatRupiah(selectedSlipSummary.feePaket)}</span></div>
                    <div className="border-t border-gray-200 pt-2 mt-2 font-bold text-gray-900"><span>Total Penghasilan</span><span>{formatRupiah(selectedSlipSummary.totalGross)}</span></div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded p-4 bg-gray-50">
                  <h3 className="font-bold text-sm text-gray-900 mb-3 pb-2 border-b">Potongan</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">BPJS/TK</span><span className="font-medium">-{formatRupiah(selectedSlipSummary.potonganBPJS)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Pajak</span><span className="font-medium">-{formatRupiah(selectedSlipSummary.potonganPajak)}</span></div>
                    <div className="border-t border-gray-200 pt-2 mt-2 font-bold text-red-900 bg-red-50 p-2 rounded"><span>Total Potongan</span><span>-{formatRupiah(selectedSlipSummary.totalPotongan)}</span></div>
                    <div className="bg-green-50 rounded p-3 mt-3 text-center">
                      <p className="text-xs font-semibold text-green-600 uppercase mb-1">Gaji Bersih</p>
                      <p className="text-2xl font-bold text-green-900">{formatRupiah(selectedSlipSummary.gajiNetto)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Details - Treatment List */}
              {selectedData.transactionDetails && selectedData.transactionDetails.length > 0 && (
                <div className="border border-gray-200 rounded p-4 bg-gray-50">
                  <h3 className="font-bold text-sm text-gray-900 mb-4 pb-2 border-b">Detail Tindakan ({selectedData.transactionDetails.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-300 bg-white">
                          <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Tanggal</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Pasien</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Klinik</th>
                          <th className="px-3 py-2 text-left font-semibold text-gray-700 text-xs">Tindakan</th>
                          <th className="px-3 py-2 text-right font-semibold text-gray-700 text-xs">Harga</th>
                          <th className="px-3 py-2 text-right font-semibold text-gray-700 text-xs">Fee (15%)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedData.transactionDetails.map((td, idx) => (
                          <tr key={idx} className="border-b border-gray-200 hover:bg-white">
                            <td className="px-3 py-2 text-gray-700">{td.tanggal ? new Date(td.tanggal).toLocaleDateString('id-ID') : "-"}</td>
                            <td className="px-3 py-2 text-gray-700">{td.namaPasien || "-"}</td>
                            <td className="px-3 py-2 text-gray-700">{td.klinikHomeService || "-"}</td>
                            <td className="px-3 py-2 text-gray-700">{td.tindakan || "-"}</td>
                            <td className="px-3 py-2 text-right text-gray-700">{formatRupiah(td.harga || 0)}</td>
                            <td className="px-3 py-2 text-right font-semibold text-gray-800">{formatRupiah(td.totalFee || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
              <button onClick={() => handlePrint(selectedData)} className="flex-1 bg-gray-800 text-white py-2 rounded font-medium hover:bg-gray-900">Cetak</button>
              <button onClick={() => setShowDetail(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded font-medium hover:bg-gray-50">Tutup</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

export default SlipGaji;
