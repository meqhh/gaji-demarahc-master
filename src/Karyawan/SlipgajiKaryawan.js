import React, { useState, useEffect, useContext, useMemo } from "react";
import Logo from "../Images/demaralogo.png";
import { AppContext } from "../context/AppContext";

export default function SlipgajiKaryawan() {
	const { slipGajiData = [], userProfile, karyawanData = [], gajiData = [] } = useContext(AppContext);
	const [selected, setSelected] = useState(null);
	const [showAllData, setShowAllData] = useState(false);

	// Format Rupiah helper
	const formatRupiah = (num) => {
		if (typeof num === 'string') {
			// Jika sudah format string, return as is
			if (num.includes('Rp')) return num;
			// Jika string angka, convert ke number
			num = parseInt(num.replace(/[^0-9]/g, '')) || 0;
		}
		return `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
	};

	const monthNames = [
		"Januari", "Februari", "Maret", "April", "Mei", "Juni",
		"Juli", "Agustus", "September", "Oktober", "November", "Desember"
	];

	const getMonthLabel = (dateString) => {
		if (!dateString) return "";
		const parsed = new Date(dateString);
		if (isNaN(parsed.getTime())) return "";
		return `${monthNames[parsed.getMonth()]} ${parsed.getFullYear()}`;
	};

	const deriveSlipsFromGajiData = useMemo(() => {
		if (!Array.isArray(gajiData) || gajiData.length === 0) return [];
		const groups = {};

		gajiData.forEach((record) => {
			const nama = record.karyawan || record.nama || "";
			if (!nama) return;
			const dateValue = record.tanggal || record.date || record.createdAt || new Date().toISOString();
			const periode = getMonthLabel(dateValue);
			const key = `${nama}||${periode}`;

			if (!groups[key]) {
				const karyawan = Array.isArray(karyawanData) ? karyawanData.find((k) => k.nama === nama) : null;
				groups[key] = {
					id: `AUTO-SLIP-${nama}-${periode}`,
					date: dateValue,
					nama,
					nip: karyawan?.nip || "",
					posisi: karyawan?.posisi || "Staff",
					departemen: karyawan?.departemen || "Klinik",
					gajiPokok: Number(karyawan?.gajiPokok || 0),
					uangTransport: Number(karyawan?.tunjanganTransport || 0),
					tunjangan: Number(karyawan?.tunjanganTransport || 0),
					feePaket: [],
					feeTindakan: 0,
					potongBpjsTk: Number(karyawan?.asuransi || karyawan?.bpjs || 0),
					potonganBPJS: Number(karyawan?.asuransi || karyawan?.bpjs || 0),
					potonganAsuransi: Number(karyawan?.asuransi || karyawan?.bpjs || 0),
					potonganTax: Number(karyawan?.pajak || 0),
					potonganPajak: Number(karyawan?.pajak || 0),
					periode,
					status: "Selesai",
					transactionDetails: []
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
			const totalPenghasilan = group.gajiPokok + group.uangTransport + group.feeTindakan;
			const totalPotongan = group.potongBpjsTk + group.potonganTax;
			return {
				...group,
				totalPenghasilan,
				totalPotongan,
				gajiNetto: totalPenghasilan - totalPotongan
			};
		});
	}, [gajiData, karyawanData]);

	const combinedSlipGajiData = useMemo(() => {
		if (!Array.isArray(slipGajiData)) return deriveSlipsFromGajiData;
		
		// Debug logging
		console.log("combinedSlipGajiData Debug:", {
			slipGajiDataLength: slipGajiData.length,
			slipGajiData: slipGajiData,
			deriveSlipsFromGajiDataLength: deriveSlipsFromGajiData.length,
			deriveSlipsFromGajiData: deriveSlipsFromGajiData
		});
		
		const manualKeys = new Set(slipGajiData.map((item) => `${item.nama}-${item.periode || getMonthLabel(item.date)}`));
		const derived = Array.isArray(deriveSlipsFromGajiData)
			? deriveSlipsFromGajiData.filter((item) => !manualKeys.has(`${item.nama}-${item.periode || getMonthLabel(item.date)}`))
			: [];
		return [...slipGajiData, ...derived];
	}, [slipGajiData, deriveSlipsFromGajiData]);

	// Convert transaction details from admin format to karyawan format
	const convertTransactionDetails = (adminDetails) => {
		if (!adminDetails || !Array.isArray(adminDetails)) return [];
		return adminDetails.map(td => ({
			tanggal: td.tanggal || "",
			namaPasien: td.namaPasien || "",
			klinik: td.klinik || td.klinikHomeService || "",
			klinikHomeService: td.klinik || td.klinikHomeService || "",
			tindakan: td.tindakan || "",
			harga: typeof td.harga === 'number' ? td.harga : parseInt(String(td.harga).replace(/[^0-9]/g, '')) || 0,
			feePersen: td.feePercent || td.feePersen || 0,
			feePercent: td.feePercent || td.feePersen || 0,
			totalFee: typeof td.totalFee === 'number' ? td.totalFee : (td.harga * (td.feePercent || 0) / 100),
			feeTransport: typeof td.feeTransport === 'number' ? td.feeTransport : parseInt(String(td.feeTransport || 0).replace(/[^0-9]/g, '')) || 0
		}));
	};

	// Convert fee paket from admin format to karyawan format
	const normalizeFeePaket = (adminFeePaket) => {
		if (!adminFeePaket) return [];
		const items = Array.isArray(adminFeePaket) ? adminFeePaket : [adminFeePaket];
		return items.filter(Boolean).map(fp => ({
			nama: fp?.namaPaket || fp?.nama || "",
			jumlah: typeof fp?.fee === 'number' ? fp.fee : parseInt(String(fp?.fee || fp?.jumlah || 0).replace(/[^0-9]/g, '')) || 0
		}));
	};

	// Get karyawan info from karyawanData
	const getKaryawanInfo = (nama) => {
		const karyawan = Array.isArray(karyawanData) ? karyawanData.find(k => k.nama === nama) : null;
		return {
			name: nama,
			id: karyawan?.id || karyawan?.nip || `EMP-${nama.substring(0, 3).toUpperCase()}-001`,
			position: karyawan?.posisi || "Staff",
			department: karyawan?.departemen || "Klinik"
		};
	};

	// Convert admin slip gaji data to karyawan format
	const convertSlipGajiData = (adminData) => {
		if (!adminData || !Array.isArray(adminData)) return [];

		return adminData.map((slip, index) => {
			// Get month from date or use current month
			const dateObj = slip.date ? new Date(slip.date) : new Date();
			const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
				"Juli", "Agustus", "September", "Oktober", "November", "Desember"];
			const month = `${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

			// Calculate totals (robust fallbacks to match Admin logic)
			const feePaketItems = normalizeFeePaket(slip.feePaket);
			const totalFeePaket = feePaketItems.reduce((sum, p) => sum + (Number(p.jumlah || p.fee || 0) || 0), 0);

			const gajiPokokNum = Number(slip.gajiPokok || slip.gaji || slip.totalGajiPokok || 0);
			const uangTransportNum = Number(slip.uangTransport || slip.tunjanganTransport || slip.tunjangan || 0);
			const feeTindakanNum = Number(slip.feeTindakan || slip.bonus || slip.totalFeeTindakan || 0);

			const totalPenghasilan = Number(slip.totalPenghasilan ?? slip.gajiKotor ?? (gajiPokokNum + uangTransportNum + feeTindakanNum + totalFeePaket));

			const potonganBPJSNum = Number(slip.potonganBPJS || slip.potonganAsuransi || slip.potongBpjsTk || 0);
			const potonganPajakNum = Number(slip.potonganPajak || slip.potonganTax || slip.pajak || 0);
			const totalPotongan = Number(slip.totalPotongan ?? (potonganBPJSNum + potonganPajakNum));

			const total = Number(slip.gajiNetto ?? slip.gajiKotor ?? totalPenghasilan - totalPotongan);

			return {
				id: slip.id || index + 1,
				month: month,
				date: slip.date || dateObj.toISOString().slice(0, 10),
				amount: formatRupiah(total),
				employee: getKaryawanInfo(slip.nama),
				gajiPokok: formatRupiah(gajiPokokNum),
				uangTransport: formatRupiah(uangTransportNum),
				tunjangan: formatRupiah(uangTransportNum),
				feePaket: normalizeFeePaket(slip.feePaket),
				feeTindakan: formatRupiah(feeTindakanNum),
				potongBpjsTk: formatRupiah(potonganBPJSNum),
				potonganBPJS: formatRupiah(potonganBPJSNum),
				potonganAsuransi: formatRupiah(potonganBPJSNum),
				potonganTax: formatRupiah(potonganPajakNum),
				totalPenghasilan: formatRupiah(totalPenghasilan),
				totalPotongan: formatRupiah(totalPotongan),
				gajiNetto: formatRupiah(total),
				transactionDetails: convertTransactionDetails(slip.transactionDetails)
			};
		});
	};

	// Filter slip gaji untuk ditampilkan hanya untuk karyawan login
	const slips = useMemo(() => {
		const currentUserName = userProfile?.name || userProfile?.nama || "";
		const source = Array.isArray(combinedSlipGajiData) ? combinedSlipGajiData : [];
		
		// Debug logging
		console.log("SlipgajiKaryawan Debug:", {
			userProfile,
			currentUserName,
			sourceLength: source.length,
			sourceData: source.slice(0, 3),
			combinedSlipGajiDataLength: Array.isArray(combinedSlipGajiData) ? combinedSlipGajiData.length : 0,
			showAllData
		});
		
		let filtered = source;
		
		// If user is logged in, filter by name (more flexible matching)
		if (currentUserName && !showAllData) {
			filtered = source.filter((slip) => {
				const slipName = slip.nama || slip.employee?.name || "";
				const normalizedSlipName = String(slipName).trim().toLowerCase();
				const normalizedUserName = String(currentUserName).trim().toLowerCase();
				return normalizedSlipName === normalizedUserName;
			});
		}
		
		return convertSlipGajiData(filtered);
	}, [combinedSlipGajiData, userProfile, karyawanData, showAllData]);

	function openSlip(slip) {
		setSelected(slip);
	}

	function closeSlip() {
		setSelected(null);
	}

	// Helper to parse Rupiah string to number
	const parseRupiah = (str) => {
		if (typeof str === 'number') return str;
		if (typeof str === 'string') {
			return parseInt(str.replace(/[^0-9]/g, '')) || 0;
		}
		return 0;
	};

	function generatePrintableSlip(slip) {
		const formatRupiah = (num) => {
			if (typeof num === 'string' && num.includes('Rp')) return num;
			const n = typeof num === 'number' ? num : parseRupiah(num);
			return `Rp ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
		};
		
		// Parse values from formatted strings
		const gajiPokokNum = parseRupiah(slip.gajiPokok);
		const uangTransportNum = parseRupiah(slip.uangTransport);
		const feeTindakanNum = parseRupiah(slip.feeTindakan);
		const potongBpjsNum = parseRupiah(slip.potonganBPJS || slip.potongBpjsTk || 0);
		const potongPajakNum = parseRupiah(slip.potonganTax || slip.potonganPajak || slip.pajak || 0);
		
		// Calculate totals from transaction details
		const totalFeeTindakan = slip.transactionDetails?.reduce((sum, t) => {
			if (t.totalFee) return sum + parseRupiah(t.totalFee);
			// Fallback calculation
			return sum + (parseRupiah(t.harga) * (t.feePersen || t.feePercent || 0) / 100);
		}, 0) || feeTindakanNum;
		
		const totalFeeTransport = slip.transactionDetails?.reduce((sum, t) => sum + parseRupiah(t.feeTransport || 0), 0) || 0;
		
		// Calculate fee paket total
		const totalFeePaket = normalizeFeePaket(slip.feePaket).reduce((sum, p) => sum + parseRupiah(p.jumlah || p.fee || 0), 0) || 0;
		
		const totalGajiSebelumPotongan = gajiPokokNum + uangTransportNum + totalFeePaket + totalFeeTindakan;
		const totalPotonganSlip = potongBpjsNum + potongPajakNum;
		const gajiNettoSlip = totalGajiSebelumPotongan - totalPotonganSlip;

		return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title>Slip Gaji - ${slip.month}</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		html, body { 
			width: 100%;
			height: 100%;
		}
		body { 
			font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			background: #f5f5f5;
			font-size: 12px;
			line-height: 1.5;
		}
		@page {
			size: A4;
			margin: 10mm;
		}
		.page {
			width: 210mm;
			height: 297mm;
			background: white;
			margin: 10px auto;
			padding: 20px;
			box-shadow: 0 0 10px rgba(0,0,0,0.1);
			display: flex;
			flex-direction: column;
			position: relative;
		}
		.header-section {
			display: flex;
			align-items: flex-start;
			gap: 15px;
			margin-bottom: 20px;
			padding-bottom: 15px;
			border-bottom: 2px solid #333;
		}
		.logo-container {
			width: 70px;
			height: 70px;
			flex-shrink: 0;
			background: #f0f0f0;
			border: 1px solid #ddd;
			border-radius: 4px;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.logo-container img {
			max-width: 100%;
			max-height: 100%;
			width: auto;
			height: auto;
		}
		.company-header {
			flex: 1;
		}
		.company-header h1 {
			font-size: 16px;
			font-weight: 700;
			color: #1a1a1a;
			margin-bottom: 2px;
		}
		.company-header .tagline {
			font-size: 11px;
			color: #666;
			font-weight: 600;
			margin-bottom: 6px;
		}
		.company-header .address {
			font-size: 10px;
			color: #888;
			line-height: 1.3;
		}
		.employee-section {
			margin-bottom: 15px;
			padding: 12px;
			background: #fafafa;
			border-left: 3px solid #007bff;
			font-size: 11px;
		}
		.employee-section p {
			margin: 4px 0;
			display: flex;
		}
		.employee-section strong {
			width: 100px;
			color: #333;
		}
		.main-table {
			width: 100%;
			border-collapse: collapse;
			margin: 15px 0;
			font-size: 10px;
			table-layout: fixed;
		}
		.main-table thead {
			background: #e8e8e8;
		}
		.main-table th {
			border: 1px solid #999;
			padding: 8px 4px;
			text-align: left;
			font-weight: 600;
			font-size: 9px;
			word-wrap: break-word;
		}
		.main-table td {
			border: 1px solid #999;
			padding: 6px 4px;
			word-wrap: break-word;
		}
		.main-table tr:nth-child(even) {
			background: #f9f9f9;
		}
		.text-right {
			text-align: right;
		}
		.text-center {
			text-align: center;
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
			flex-grow: 1;
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
			border-bottom: 2px solid #007bff;
			color: #333;
		}
		.summary-row {
			display: flex;
			justify-content: space-between;
			padding: 6px 0;
			border-bottom: 1px solid #eee;
			font-size: 11px;
		}
		.summary-row:last-child {
			border-bottom: none;
		}
		.summary-row.total {
			background: #f0f0f0;
			padding: 8px 5px;
			margin-top: 8px;
			font-weight: 700;
			border-top: 2px solid #333;
			border-bottom: 2px solid #333;
		}
		.summary-label {
			font-weight: 600;
			color: #333;
		}
		.summary-value {
			text-align: right;
			font-family: 'Courier New', monospace;
			font-weight: 600;
			color: #1a1a1a;
		}
		.footer-section {
			text-align: center;
			font-size: 9px;
			color: #888;
			padding-top: 15px;
			border-top: 1px solid #ddd;
			margin-top: auto;
		}
		.footer-section p {
			margin: 3px 0;
		}
		@media print {
			body { background: white; margin: 0; padding: 0; }
			.page { margin: 0; padding: 15mm; box-shadow: none; width: auto; height: auto; }
			@page { margin: 10mm; }
		}
	</style>
</head>
<body>
	<div class="page">
		<!-- Header -->
		<div class="header-section">
			<div class="logo-container">
				<img src="${Logo}" alt="Demara Logo">
			</div>
			<div class="company-header">
				<h1>DEMARA HEALTH CARE</h1>
				<div class="tagline">HAPPY MOMMY HEALTHY BABY</div>
				<div class="address">
					Jl. Raya No. 123, Jakarta, Indonesia<br>
					Tel: (021) 1234567 | Email: info@demaracare.com
				</div>
			</div>
		</div>

		<!-- Employee Info -->
		<div class="employee-section">
			<p><strong>Nama</strong> : ${slip.employee.name}</p>
			<p><strong>Posisi</strong> : ${slip.employee.position}</p>
			<p><strong>Periode</strong> : ${slip.month}</p>
		</div>

		<!-- Main Table -->
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
				${slip.transactionDetails && slip.transactionDetails.length > 0 ? 
					slip.transactionDetails.map(trans => {
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
							<td colspan="4" style="text-align: right; padding-right: 10px;"><strong>TOTAL</strong></td>
							<td class="text-right">-</td>
							<td class="text-right">-</td>
							<td class="text-right"><strong>${formatRupiah(totalFeeTindakan)}</strong></td>
							<td class="text-right"><strong>${formatRupiah(totalFeeTransport)}</strong></td>
						</tr>
					`
					: '<tr><td colspan="8" style="text-align: center; padding: 15px; color: #999;">Tidak ada data transaksi</td></tr>'
				}
			</tbody>
		</table>

		<!-- Summary Section -->
		<div class="summary-section">
			<!-- Left Box -->
			<div class="summary-box">
				<h3>RINCIAN GAJI</h3>
				<div class="summary-row">
					<span class="summary-label">GAJI POKOK</span>
					<span class="summary-value">${formatRupiah(slip.gajiPokok || 0)}</span>
				</div>
				<div class="summary-row">
					<span class="summary-label">UANG TRANSPORT</span>
					<span class="summary-value">${formatRupiah(slip.uangTransport || 0)}</span>
				</div>
				${slip.feePaket && slip.feePaket.length > 0 ? 
					slip.feePaket.map(p => `
						<div class="summary-row">
							<span class="summary-label">FEE PAKET ${p.nama || p.namaPaket || ""}</span>
							<span class="summary-value">${formatRupiah(p.jumlah || p.fee || 0)}</span>
						</div>
					`).join('') : ''
				}
				<div class="summary-row">
					<span class="summary-label">FEE TINDAKAN</span>
					<span class="summary-value">${formatRupiah(slip.feeTindakan || 0)}</span>
				</div>
				<div class="summary-row total">
					<span class="summary-label">TOTAL GAJI ${slip.month.split(' ')[0].toUpperCase()}</span>
					<span class="summary-value">${formatRupiah(totalGajiSebelumPotongan)}</span>
				</div>
			</div>

			<!-- Right Box -->
			<div class="summary-box">
				<h3>POTONGAN</h3>
				<div class="summary-row">
					<span class="summary-label">POTONG BPJS TK</span>
					<span class="summary-value">${formatRupiah(potongBpjsNum)}</span>
				</div>
				<div class="summary-row">
					<span class="summary-label">POTONG PAJAK</span>
					<span class="summary-value">${formatRupiah(potongPajakNum)}</span>
				</div>
				<div class="summary-row total">
					<span class="summary-label">TOTAL POTONGAN</span>
					<span class="summary-value">${formatRupiah(totalPotonganSlip)}</span>
				</div>
				<div class="summary-row total">
					<span class="summary-label">GAJI NETTO</span>
					<span class="summary-value">${formatRupiah(gajiNettoSlip)}</span>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<div class="footer-section">
			<p>Dokumen ini dicetak pada ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })} pukul ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
			<p>© Demara Health Care - Portal Karyawan</p>
		</div>
	</div>

		<div class="footer">
			<p>Dokumen ini digenerate pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
			<p style="color: #999; font-size: 12px;">Demara Health Care - Portal Karyawan</p>
		</div>
	</div>
</body>
</html>`;
	}

	function downloadSlip(slip) {
		const content = generatePrintableSlip(slip);
		const w = window.open('', '_blank');
		if (w) {
			w.document.write(content);
			w.document.close();
			w.focus();
			setTimeout(() => w.print(), 500);
		} else {
			alert('Silakan izinkan popup agar dapat mengunduh slip.');
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-4xl font-bold text-gray-800">Slip Gaji</h1>
						<p className="text-gray-600 text-sm mt-1">Lihat riwayat dan detail slip gaji Anda</p>
					</div>
				</div>

				{/* Debug Info Alert */}
				{Array.isArray(combinedSlipGajiData) && combinedSlipGajiData.length > 0 && (
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
						<div className="text-xs text-blue-800 space-y-1">
							<div><strong>Data Tersedia:</strong> {combinedSlipGajiData.length} slip gaji</div>
							<div><strong>Akun User:</strong> {userProfile?.name || userProfile?.nama || "Unknown"}</div>
							{slips.length === 0 && <div className="text-orange-600"><strong>Catatan:</strong> Tidak ada yang match dengan nama user. Klik tombol di bawah untuk melihat semua data.</div>}
						</div>
					</div>
				)}

				{/* Breadcrumb */}
				<div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
					<span className="inline-block text-gray-400">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
						  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" />
						</svg>
					</span>
					<span>&gt;</span>
					<span className="text-gray-400">Slip Gaji</span>
				</div>

				{/* Table */}
				<div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="bg-gray-50 border-b border-gray-200">
									<th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">No.</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bulan</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Action</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{slips.length > 0 ? (
									slips.map((slip, index) => (
										<tr key={slip.id} className="hover:bg-gray-50 transition">
											<td className="px-6 py-4 text-sm text-gray-700 font-medium">{index + 1}</td>
											<td className="px-6 py-4 text-sm text-gray-700">{slip.month}</td>
											<td className="px-6 py-4 text-sm text-gray-700">
												{new Date(slip.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
											</td>
											<td className="px-6 py-4 text-sm">
												<button 
													onClick={() => openSlip(slip)}
													className="text-red-500 hover:text-red-700 font-medium transition"
												>
													Detail
												</button>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={4} className="px-6 py-12">
											<div className="text-center space-y-4">
												<div className="text-gray-400 font-medium">Tidak ada data slip gaji.</div>
												<div className="text-xs text-gray-500 space-y-2 bg-gray-50 p-4 rounded">
													<div><strong>Debug Info:</strong></div>
													<div>User: {userProfile?.name || userProfile?.nama || "Unknown"}</div>
													<div>Data tersedia: {Array.isArray(combinedSlipGajiData) ? combinedSlipGajiData.length : 0} item</div>
													{Array.isArray(combinedSlipGajiData) && combinedSlipGajiData.length > 0 && (
														<div className="mt-2">
															<div><strong>Data yang tersedia:</strong></div>
															{combinedSlipGajiData.slice(0, 3).map((d, i) => (
																<div key={i}>- {d.nama} ({d.periode})</div>
															))}
														</div>
													)}
												</div>
												{combinedSlipGajiData.length > 0 && (
													<button
														onClick={() => setShowAllData(!showAllData)}
														className="text-blue-600 hover:text-blue-800 underline text-sm"
													>
														{showAllData ? "Tampilkan Data Saya" : "Tampilkan Semua Data"}
													</button>
												)}
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Modal Detail */}
			{selected && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
						{/* Modal Header */}
						<div className="sticky top-0 bg-gray-900 text-white px-8 py-6 flex justify-between items-center">
							<div>
								<h3 className="text-2xl font-bold">Detail Slip Gaji - {selected.employee.name}</h3>
								<p className="text-gray-400 text-sm mt-1">{selected.month}</p>
							</div>
							<button 
								onClick={closeSlip} 
								className="text-2xl leading-none hover:bg-gray-800 w-10 h-10 flex items-center justify-center rounded transition"
							>
								✕
							</button>
						</div>

						{/* Modal Content */}
						<div className="p-8 space-y-6">
							{/* Data Karyawan */}
							<div className="grid grid-cols-2 gap-6">
								<div className="border border-gray-200 rounded p-4 bg-gray-50">
									<h3 className="font-bold text-sm text-gray-900 mb-3 pb-2 border-b">Data Karyawan</h3>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between"><span className="text-gray-600">Nama</span><span className="font-medium">{selected.employee.name}</span></div>
										<div className="flex justify-between"><span className="text-gray-600">NIP</span><span className="font-medium">{selected.employee.id || "-"}</span></div>
										<div className="flex justify-between"><span className="text-gray-600">Posisi</span><span className="font-medium">{selected.employee.position}</span></div>
										<div className="flex justify-between"><span className="text-gray-600">Departemen</span><span className="font-medium">{selected.employee.department || "-"}</span></div>
									</div>
								</div>

								<div className="border border-gray-200 rounded p-4 bg-gray-50">
									<h3 className="font-bold text-sm text-gray-900 mb-3 pb-2 border-b">Penghasilan</h3>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between"><span className="text-gray-600">Gaji Pokok</span><span className="font-medium">
											{(() => {
												const parseRupiah = (str) => {
													if (typeof str === 'number') return str;
													if (typeof str === 'string') return parseInt(str.replace(/[^0-9]/g, '')) || 0;
													return 0;
												};
												const formatRupiah = (num) => `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
												return formatRupiah(parseRupiah(selected.gajiPokok));
											})()}
										</span></div>
										<div className="flex justify-between"><span className="text-gray-600">Tunjangan Transport</span><span className="font-medium">
											{(() => {
												const parseRupiah = (str) => {
													if (typeof str === 'number') return str;
													if (typeof str === 'string') return parseInt(str.replace(/[^0-9]/g, '')) || 0;
													return 0;
												};
												const formatRupiah = (num) => `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
												return formatRupiah(parseRupiah(selected.uangTransport));
											})()}
										</span></div>
										<div className="flex justify-between"><span className="text-gray-600">Fee Tindakan</span><span className="font-medium">
											{(() => {
												const parseRupiah = (str) => {
													if (typeof str === 'number') return str;
													if (typeof str === 'string') return parseInt(str.replace(/[^0-9]/g, '')) || 0;
													return 0;
												};
												const formatRupiah = (num) => `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
												return formatRupiah(parseRupiah(selected.feeTindakan));
											})()}
										</span></div>
										<div className="flex justify-between"><span className="text-gray-600">Fee Paket</span><span className="font-medium">
											{(() => {
												const parseRupiah = (str) => {
													if (typeof str === 'number') return str;
													if (typeof str === 'string') return parseInt(str.replace(/[^0-9]/g, '')) || 0;
													return 0;
												};
												const formatRupiah = (num) => `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
												const total = normalizeFeePaket(selected.feePaket).reduce((sum, p) => sum + parseRupiah(p.jumlah || p.fee || 0), 0) || 0;
												return formatRupiah(total);
											})()}
										</span></div>
										<div className="flex justify-between border-t pt-2 mt-2 font-bold text-blue-900 bg-blue-50 p-2 rounded"><span>Gaji Kotor</span><span>
											{(() => {
												const parseRupiah = (str) => {
													if (typeof str === 'number') return str;
													if (typeof str === 'string') return parseInt(str.replace(/[^0-9]/g, '')) || 0;
													return 0;
												};
												const formatRupiah = (num) => `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
												const gajiPokok = parseRupiah(selected.gajiPokok);
												const uangTransport = parseRupiah(selected.uangTransport);
												const feeTindakan = parseRupiah(selected.feeTindakan);
												const feePaket = normalizeFeePaket(selected.feePaket).reduce((sum, p) => sum + parseRupiah(p.jumlah || p.fee || 0), 0) || 0;
												return formatRupiah(gajiPokok + uangTransport + feeTindakan + feePaket);
											})()}
										</span></div>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-6">
								<div className="border border-gray-200 rounded p-4 bg-gray-50">
									<h3 className="font-bold text-sm text-gray-900 mb-3 pb-2 border-b">Potongan</h3>
									<div className="space-y-2 text-sm">
										<div className="flex justify-between"><span className="text-gray-600">BPJS/TK</span><span className="font-medium">-
											{(() => {
												const parseRupiah = (str) => {
													if (typeof str === 'number') return str;
													if (typeof str === 'string') return parseInt(str.replace(/[^0-9]/g, '')) || 0;
													return 0;
												};
												const formatRupiah = (num) => `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
								return formatRupiah(parseRupiah(selected.potonganBPJS || selected.potongBpjsTk || 0));
							})()}
						</span></div>
						<div className="flex justify-between"><span className="text-gray-600">Pajak</span><span className="font-medium">-
							{(() => {
								const parseRupiah = (str) => {
									if (typeof str === 'number') return str;
									if (typeof str === 'string') return parseInt(str.replace(/[^0-9]/g, '')) || 0;
									return 0;
								};
								const formatRupiah = (num) => `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
								return formatRupiah(parseRupiah(selected.potonganPajak || selected.potonganTax || selected.pajak || 0));
							})()}
						</span></div>
						<div className="flex justify-between border-t pt-2 mt-2 font-bold text-red-900 bg-red-50 p-2 rounded"><span>Total Potongan</span><span>-
							{(() => {
								const parseRupiah = (str) => {
									if (typeof str === 'number') return str;
									if (typeof str === 'string') return parseInt(str.replace(/[^0-9]/g, '')) || 0;
									return 0;
								};
								const formatRupiah = (num) => `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
								return formatRupiah(
									parseRupiah(selected.potonganBPJS || selected.potongBpjsTk || 0) +
									parseRupiah(selected.potonganPajak || selected.potonganTax || selected.pajak || 0)
								);
							})()}
							</span></div>
						</div>
					</div>

					<div className="bg-green-50 border border-green-200 rounded p-4 flex flex-col justify-center items-center">
						<p className="text-xs font-semibold text-green-600 mb-2">GAJI BERSIH</p>
						<p className="text-3xl font-bold text-green-900">{selected.amount}</p>
					</div>
				</div>

				{/* Tabel Detail Transaksi */}
							{selected.transactionDetails && selected.transactionDetails.length > 0 && (
								<div className="border border-gray-200 rounded p-4 bg-gray-50">
									<h3 className="font-bold text-sm text-gray-900 mb-4 pb-2 border-b">Detail Tindakan ({selected.transactionDetails.length})</h3>
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
												{selected.transactionDetails.map((td, idx) => {
													const parseRupiah = (str) => {
														if (typeof str === 'number') return str;
														if (typeof str === 'string') return parseInt(str.replace(/[^0-9]/g, '')) || 0;
														return 0;
													};
													const formatRupiah = (num) => {
														if (typeof num === 'string' && num.includes('Rp')) return num;
														const n = typeof num === 'number' ? num : parseRupiah(num);
														return `Rp ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
													};
													return (
														<tr key={idx} className="border-b border-gray-200 hover:bg-white">
															<td className="px-3 py-2 text-gray-700">{td.tanggal ? new Date(td.tanggal).toLocaleDateString('id-ID') : "-"}</td>
															<td className="px-3 py-2 text-gray-700">{td.namaPasien || "-"}</td>
															<td className="px-3 py-2 text-gray-700">{td.klinikHomeService || "-"}</td>
															<td className="px-3 py-2 text-gray-700">{td.tindakan || "-"}</td>
															<td className="px-3 py-2 text-right text-gray-700">{formatRupiah(td.harga || 0)}</td>
															<td className="px-3 py-2 text-right font-semibold text-gray-800">{formatRupiah(td.totalFee || 0)}</td>
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>
								</div>
							)}

							{/* Action Buttons */}
							<div className="flex gap-3 pt-4 border-t border-gray-200">
								<button 
									onClick={() => downloadSlip(selected)} 
									className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition"
								>
									Cetak / Unduh PDF
								</button>
								<button 
									onClick={closeSlip} 
									className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold transition"
								>
									Tutup
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
