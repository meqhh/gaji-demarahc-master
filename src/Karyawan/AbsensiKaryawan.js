import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
// QR removed: using professional check-in ID instead of QR codes

export default function AbsensiKaryawan() {
	const { userProfile, addAbsensi } = useContext(AppContext);

	const defaultAbsensi = [
		{ id: 1, bulan: "Agustus, 2025", status: "Hadir", tanggal: "13 Aug 2025", jamMasuk: "07:30", checkInId: "CI-20250813-001" },
		{ id: 2, bulan: "Agustus, 2025", status: "Hadir", tanggal: "12 Aug 2025", jamMasuk: "07:30", checkInId: "CI-20250812-001" },
		{ id: 3, bulan: "Agustus, 2025", status: "Hadir", tanggal: "11 Aug 2025", jamMasuk: "07:30", checkInId: "CI-20250811-001" },
		{ id: 4, bulan: "Agustus, 2025", status: "Hadir", tanggal: "10 Aug 2025", jamMasuk: "07:30", checkInId: "CI-20250810-001" },
		{ id: 5, bulan: "Agustus, 2025", status: "Hadir", tanggal: "09 Aug 2025", jamMasuk: "07:30", checkInId: "CI-20250809-001" },
		{ id: 6, bulan: "Agustus, 2025", status: "Hadir", tanggal: "08 Aug 2025", jamMasuk: "07:30", checkInId: "CI-20250808-001" },
	];

	// store absensi per-user so admin and karyawan have separate lists
	const storageKey = userProfile?.email ? `absensi_${userProfile.email}` : 'absensi_guest';

	const [absensi, setAbsensi] = useState(() => {
		const saved = localStorage.getItem(storageKey);
		return saved ? JSON.parse(saved) : defaultAbsensi;
	});

	useEffect(() => {
		localStorage.setItem(storageKey, JSON.stringify(absensi));
	}, [absensi, storageKey]);

	const [selected, setSelected] = useState(null);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

	const openDetail = (item) => {
		setSelected(item);
		setIsDetailModalOpen(true);
	};

	const closeDetailModal = () => {
		setSelected(null);
		setIsDetailModalOpen(false);
	};

	// QR removed: use receipt modal instead

	const formatDate = (d) => {
		return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
	};

	const formatTime = (d) => {
		return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
	};

	const getMonthLabel = (d) => {
		return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
	};

	const hasCheckedInToday = () => {
		const today = new Date();
		return absensi.some(a => {
			try {
				const aDate = new Date(a.tanggal);
				return aDate.getFullYear() === today.getFullYear() && aDate.getMonth() === today.getMonth() && aDate.getDate() === today.getDate();
			} catch (e) {
				return a.tanggal.includes(today.getDate().toString()) && a.bulan.includes(today.getFullYear());
			}
		});
	};

	const getTodayKey = () => new Date().toISOString().slice(0,10); // YYYY-MM-DD

	const didLoginToday = () => {
		const lastLogin = localStorage.getItem('karyawanLastLogin');
		return lastLogin === getTodayKey();
	};

	const handleCheckIn = () => {
		// ensure user logged in today and hasn't checked in yet
		if (!didLoginToday()) {
			alert('Absen hanya tersedia setelah Anda login hari ini. Silakan login kembali untuk melakukan absen.');
			return;
		}
		const now = new Date();
		if (hasCheckedInToday()) {
			alert('Anda sudah melakukan absen untuk hari ini.');
			return;
		}
		const checkInId = `CI-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
		const newItem = {
			id: Date.now(),
			bulan: getMonthLabel(now),
			status: 'Hadir',
			tanggal: formatDate(now),
			jamMasuk: formatTime(now),
			checkInId,
			note: userProfile?.name ? `Absen oleh ${userProfile.name}` : 'Absen karyawan'
		};
		setAbsensi(prev => [newItem, ...prev]);
		// Also add to global absensi (visible in admin panel)
		addAbsensi({
			...newItem,
			nama: userProfile?.name || userProfile?.email || 'Karyawan',
			email: userProfile?.email || 'guest'
		});
		// Open professional receipt (detail) after check-in
		setSelected(newItem);
		setIsDetailModalOpen(true);
	};

	const getStatusColor = (status) => {
		switch(status) {
			case "Hadir": return "bg-green-100 text-green-700";
			case "Sakit": return "bg-yellow-100 text-yellow-700";
			case "Cuti": return "bg-blue-100 text-blue-700";
			default: return "bg-gray-100 text-gray-700";
		}
	};

	return (
		<div className="min-h-screen bg-white p-8">
			<div className="max-w-5xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-800">Absensi</h1>
					<p className="text-sm text-gray-500 mt-1">Riwayat kehadiran dan check-in Anda</p>
				</div>

				{/* Check-in Button */}
				<div className="mb-8">
					<button 
						onClick={handleCheckIn} 
						disabled={hasCheckedInToday() || !didLoginToday()}
						className={`font-medium text-sm px-6 py-3 rounded-md transition ${
							hasCheckedInToday() || !didLoginToday()
								? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
								: 'bg-gray-700 text-white hover:bg-gray-800'
						}`}
					>
						{hasCheckedInToday() ? 'Sudah Absen Hari Ini' : (!didLoginToday() ? 'Absen hanya setelah login' : 'Absen Masuk')}
					</button>
				</div>

				{/* Detail Modal */}
				{isDetailModalOpen && selected && (
					<div className="fixed inset-0 z-50 flex items-center justify-center">
						<div className="absolute inset-0 bg-black opacity-50" onClick={closeDetailModal}></div>
						<div className="bg-white rounded-lg shadow-lg z-10 max-w-lg w-full p-8 border border-gray-200">
							<h3 className="text-lg font-bold text-gray-800 mb-6">Detail Absensi</h3>
							<div className="space-y-4">
								<div className="border-b border-gray-200 pb-4">
									<p className="text-xs font-semibold text-gray-600 uppercase">Tanggal</p>
									<p className="text-gray-900 font-medium mt-1">{selected.tanggal}</p>
								</div>
								<div className="border-b border-gray-200 pb-4">
									<p className="text-xs font-semibold text-gray-600 uppercase">Jam Masuk</p>
									<p className="text-gray-900 font-medium mt-1">{selected.jamMasuk}</p>
								</div>
								<div className="border-b border-gray-200 pb-4">
									<p className="text-xs font-semibold text-gray-600 uppercase">Status</p>
									<p className="text-green-700 font-medium mt-1">{selected.status}</p>
								</div>
								<div className="border-b border-gray-200 pb-4">
									<p className="text-xs font-semibold text-gray-600 uppercase">ID Check-in</p>
									<p className="text-gray-700 font-mono text-sm mt-1">{selected.checkInId}</p>
								</div>
								{selected.note && (
									<div className="pb-4">
										<p className="text-xs font-semibold text-gray-600 uppercase">Catatan</p>
										<p className="text-gray-700 text-sm mt-1">{selected.note}</p>
									</div>
								)}
							</div>
											<div className="mt-6 flex gap-2">
												<button 
													onClick={() => {
													if (selected?.checkInId && navigator?.clipboard) {
														navigator.clipboard.writeText(selected.checkInId);
														alert('ID check-in disalin ke clipboard');
													} else {
														setIsDetailModalOpen(false);
													}
												}} 
													className="flex-1 bg-gray-700 hover:bg-gray-800 text-white font-medium text-sm px-4 py-2 rounded-md transition"
												>
													Salin ID
												</button>
												<button 
													onClick={closeDetailModal} 
													className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm px-4 py-2 rounded-md transition"
												>
													Tutup
												</button>
											</div>
						</div>
					</div>
				)}

				{/* QR Modal */}
				{/* QR modal removed - replaced by professional receipt in detail modal */}

				{/* Table */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="bg-gray-50 border-b border-gray-200">
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">No.</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Tanggal</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Jam Masuk</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Aksi</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{absensi.length > 0 ? (
									absensi.map((item, index) => (
										<tr key={item.id} className="hover:bg-gray-50 transition">
											<td className="px-6 py-4 text-sm text-gray-700 font-medium">{index + 1}</td>
											<td className="px-6 py-4 text-sm text-gray-700">{item.tanggal}</td>
											<td className="px-6 py-4 text-sm text-gray-700">{item.jamMasuk}</td>
											<td className="px-6 py-4 text-sm">
												<span className={`px-3 py-1 rounded-md text-xs font-semibold ${getStatusColor(item.status)}`}>
													{item.status}
												</span>
											</td>
											<td className="px-6 py-4 text-sm">
												<div className="flex gap-2">
													<button 
														onClick={() => openDetail(item)} 
														className="text-gray-700 hover:text-gray-900 font-medium text-sm transition"
													>
														Detail
													</button>
													{/* QR button removed */}
												</div>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium text-sm">
											Tidak ada data absensi.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
