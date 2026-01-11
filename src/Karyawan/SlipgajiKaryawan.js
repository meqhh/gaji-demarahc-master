import React, { useState, useEffect, useContext, useMemo } from "react";
import Logo from "../Images/demaralogo.png";
import { AppContext } from "../context/AppContext";

export default function SlipgajiKaryawan() {
	const { slipGajiData = [], userProfile, karyawanData = [] } = useContext(AppContext);
	const [selected, setSelected] = useState(null);

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

	// Convert transaction details from admin format to karyawan format
	const convertTransactionDetails = (adminDetails) => {
		if (!adminDetails || !Array.isArray(adminDetails)) return [];
		return adminDetails.map(td => ({
			tanggal: td.tanggal || "",
			namaPasien: td.namaPasien || "",
			klinikHomeService: td.klinik || td.klinikHomeService || "",
			tindakan: td.tindakan || "",
			harga: typeof td.harga === 'number' ? td.harga : parseInt(String(td.harga).replace(/[^0-9]/g, '')) || 0,
			feePersen: td.feePercent || td.feePersen || 0,
			totalFee: typeof td.totalFee === 'number' ? td.totalFee : (td.harga * (td.feePercent || 0) / 100),
			feeTransport: typeof td.feeTransport === 'number' ? td.feeTransport : parseInt(String(td.feeTransport || 0).replace(/[^0-9]/g, '')) || 0
		}));
	};

	// Convert fee paket from admin format to karyawan format
	const convertFeePaket = (adminFeePaket) => {
		if (!adminFeePaket || !Array.isArray(adminFeePaket)) return [];
		return adminFeePaket.map(fp => ({
			nama: fp.namaPaket || fp.nama || "",
			jumlah: typeof fp.fee === 'number' ? fp.fee : parseInt(String(fp.fee || fp.jumlah).replace(/[^0-9]/g, '')) || 0
		}));
	};

	// Get karyawan info from karyawanData
	const getKaryawanInfo = (nama) => {
		const karyawan = Array.isArray(karyawanData) ? karyawanData.find(k => k.nama === nama) : null;
		return {
			name: nama,
			id: karyawan?.id || `EMP-${nama.substring(0, 3).toUpperCase()}-001`,
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

			// Calculate totals
			const totalPenghasilan = (slip.gajiPokok || 0) + 
				(slip.uangTransport || 0) + 
				(slip.feePaket?.reduce((sum, p) => sum + (p.fee || p.jumlah || 0), 0) || 0) + 
				(slip.feeTindakan || 0);
			const totalPotongan = slip.potongBpjsTk || slip.potonganBPJS || 0;
			const total = totalPenghasilan - totalPotongan;

			return {
				id: slip.id || index + 1,
				month: month,
				date: slip.date || dateObj.toISOString().slice(0, 10),
				amount: formatRupiah(total),
				employee: getKaryawanInfo(slip.nama),
				gajiPokok: formatRupiah(slip.gajiPokok || 0),
				uangTransport: formatRupiah(slip.uangTransport || 0),
				feePaket: convertFeePaket(slip.feePaket),
				feeTindakan: formatRupiah(slip.feeTindakan || 0),
				potongBpjsTk: formatRupiah(slip.potongBpjsTk || slip.potonganBPJS || 0),
				totalPenghasilan: formatRupiah(totalPenghasilan),
				totalPotongan: formatRupiah(totalPotongan),
				transactionDetails: convertTransactionDetails(slip.transactionDetails)
			};
		});
	};

	// Filter slip gaji berdasarkan karyawan yang login
	const slips = useMemo(() => {
		if (!userProfile || !userProfile.name) {
			// Jika tidak ada userProfile, return empty array
			return [];
		}

		// Filter slip gaji berdasarkan nama karyawan
		const filteredSlips = Array.isArray(slipGajiData) 
			? slipGajiData.filter(slip => {
				// Match berdasarkan nama (case insensitive)
				const slipNama = (slip.nama || "").toLowerCase().trim();
				const userNama = (userProfile.name || "").toLowerCase().trim();
				return slipNama === userNama;
			})
			: [];

		// Convert to karyawan format
		return convertSlipGajiData(filteredSlips);
	}, [slipGajiData, userProfile, karyawanData]);

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
		const potongBpjsNum = parseRupiah(slip.potongBpjsTk);
		
		// Calculate totals from transaction details
		const totalFeeTindakan = slip.transactionDetails?.reduce((sum, t) => {
			if (t.totalFee) return sum + parseRupiah(t.totalFee);
			// Fallback calculation
			return sum + (parseRupiah(t.harga) * (t.feePersen || t.feePercent || 0) / 100);
		}, 0) || feeTindakanNum;
		
		const totalFeeTransport = slip.transactionDetails?.reduce((sum, t) => sum + parseRupiah(t.feeTransport || 0), 0) || 0;
		
		// Calculate fee paket total
		const totalFeePaket = slip.feePaket?.reduce((sum, p) => sum + parseRupiah(p.jumlah || p.fee || 0), 0) || 0;
		
		const totalGajiSebelumPotongan = gajiPokokNum + uangTransportNum + totalFeePaket + totalFeeTindakan;

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
			width: 60px;
			height: 60px;
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
		.signature-section {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			gap: 20px;
			margin-top: 30px;
			text-align: center;
			font-size: 10px;
		}
		.signature-box {
			padding-top: 30px;
		}
		.signature-box p {
			margin-bottom: 3px;
		}
		.signature-line {
			border-top: 1px solid #333;
			margin-top: 30px;
			padding-top: 5px;
			font-weight: 600;
			min-height: 20px;
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
				<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" alt="Logo">
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
					<span class="summary-value">${formatRupiah(slip.potonganBPJS || 0)}</span>
				</div>
				<div class="summary-row total">
					<span class="summary-label">TOTAL GAJI</span>
					<span class="summary-value">${slip.amount}</span>
				</div>
			</div>
		</div>

		<!-- Signature Section -->
		<div class="signature-section">
			<div class="signature-box">
				<p style="font-weight: 600;">Diketahui oleh,</p>
				<p style="font-size: 9px; color: #999; margin-top: 2px;">Manager</p>
				<div class="signature-line"></div>
			</div>
			<div class="signature-box">
				<p style="font-weight: 600;">Disetujui oleh,</p>
				<p style="font-size: 9px; color: #999; margin-top: 2px;">Human Resources</p>
				<div class="signature-line"></div>
			</div>
			<div class="signature-box">
				<p style="font-weight: 600;">Diterima oleh,</p>
				<p style="font-size: 9px; color: #999; margin-top: 2px;">Karyawan</p>
				<div class="signature-line"></div>
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
										<td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
											Tidak ada data slip gaji.
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
							{/* Tabel Detail Transaksi */}
							<div>
								<h4 className="text-lg font-semibold text-gray-900 mb-4">Detail Transaksi</h4>
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
											{selected.transactionDetails && selected.transactionDetails.length > 0 ? (
												selected.transactionDetails.map((trans, idx) => {
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
													const totalFee = trans.totalFee ? parseRupiah(trans.totalFee) : (parseRupiah(trans.harga) * (trans.feePersen || trans.feePercent || 0) / 100);
													const klinikHomeService = trans.klinikHomeService || trans.klinik || "";
													return (
														<tr key={idx} className="border-b hover:bg-gray-50">
															<td className="px-4 py-2 text-gray-700">{trans.tanggal || ""}</td>
															<td className="px-4 py-2 text-gray-700">{trans.namaPasien || ""}</td>
															<td className="px-4 py-2 text-gray-700">{klinikHomeService}</td>
															<td className="px-4 py-2 text-gray-700">{trans.tindakan || ""}</td>
															<td className="px-4 py-2 text-right text-gray-700">{formatRupiah(trans.harga)}</td>
															<td className="px-4 py-2 text-right text-gray-700">{trans.feePersen || trans.feePercent || 0}%</td>
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
											{selected.transactionDetails && selected.transactionDetails.length > 0 && (
												<tr className="bg-gray-100 font-semibold">
													<td colSpan={4} className="px-4 py-3 text-right text-gray-900">TOTAL</td>
													<td className="px-4 py-3 text-right text-gray-700">-</td>
													<td className="px-4 py-3 text-right text-gray-700">-</td>
													<td className="px-4 py-3 text-right text-gray-900">
														{(() => {
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
															const total = selected.transactionDetails.reduce((sum, t) => {
																if (t.totalFee) return sum + parseRupiah(t.totalFee);
																return sum + (parseRupiah(t.harga) * (t.feePersen || t.feePercent || 0) / 100);
															}, 0);
															return formatRupiah(total);
														})()}
													</td>
													<td className="px-4 py-3 text-right text-gray-900">
														{(() => {
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
															const total = selected.transactionDetails.reduce((sum, t) => sum + parseRupiah(t.feeTransport || 0), 0);
															return formatRupiah(total);
														})()}
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
											<span className="font-semibold text-gray-900">
												{(() => {
													const formatRupiah = (num) => `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
													return formatRupiah(selected.gajiPokok || 0);
												})()}
											</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-gray-700">UANG TRANSPORT</span>
											<span className="font-semibold text-gray-900">
												{(() => {
													const formatRupiah = (num) => `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
													return formatRupiah(selected.uangTransport || 0);
												})()}
											</span>
										</div>
										{selected.feePaket && selected.feePaket.length > 0 && (
											<>
												{selected.feePaket.map((paket, idx) => {
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
														<div key={idx} className="flex justify-between text-sm">
															<span className="text-gray-700">FEE PAKET ({paket.nama || paket.namaPaket || ""})</span>
															<span className="font-semibold text-gray-900">
																{formatRupiah(paket.jumlah || paket.fee || 0)}
															</span>
														</div>
													);
												})}
											</>
										)}
										<div className="flex justify-between text-sm">
											<span className="text-gray-700">FEE TINDAKAN</span>
											<span className="font-semibold text-gray-900">
												{(() => {
													const formatRupiah = (num) => `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
													return formatRupiah(selected.feeTindakan || 0);
												})()}
											</span>
										</div>
										<div className="flex justify-between text-sm pt-2 mt-2 border-t border-gray-300 font-bold">
											<span className="text-gray-900">TOTAL GAJI BERSIH</span>
											<span className="text-gray-900">
												{selected.amount || (() => {
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
													const gajiPokok = parseRupiah(selected.gajiPokok);
													const uangTransport = parseRupiah(selected.uangTransport);
													const feePaket = selected.feePaket?.reduce((sum, p) => sum + parseRupiah(p.jumlah || p.fee || 0), 0) || 0;
													const feeTindakan = parseRupiah(selected.feeTindakan);
													const potongan = parseRupiah(selected.potongBpjsTk);
													const total = gajiPokok + uangTransport + feePaket + feeTindakan - potongan;
													return formatRupiah(total);
												})()}
											</span>
										</div>
									</div>
								</div>

								<div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
									<h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b">Potongan</h3>
									<div className="space-y-2">
										<div className="flex justify-between text-sm">
											<span className="text-gray-700">POTONG BPJS TK</span>
											<span className="font-semibold text-gray-900">
												{(() => {
													const formatRupiah = (num) => `Rp ${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
													return formatRupiah(selected.potonganBPJS || 0);
												})()}
											</span>
										</div>
										<div className="flex justify-between text-sm pt-2 mt-2 border-t border-gray-300 font-bold">
											<span className="text-gray-900">TOTAL GAJI</span>
											<span className="text-gray-900">{selected.amount}</span>
										</div>
									</div>
								</div>
							</div>

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
