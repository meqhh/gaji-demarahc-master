import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
// QR removed: using professional check-in ID instead of QR codes

export default function AbsensiKaryawan() {
	const navigate = useNavigate();
	const { userProfile, absensiData = [], addAbsensi, updateAbsensi, deleteAbsensi } = useContext(AppContext);

	const getCurrentUserName = () => userProfile?.name || userProfile?.nama || userProfile?.email || "Karyawan";
	const getCurrentUserEmail = () => userProfile?.email || "";
	const getCurrentUserId = () => userProfile?.karyawanId || userProfile?.id || null;

	const absensi = Array.isArray(absensiData)
		? absensiData.filter((a) => {
			if (!a) return false;
			if (getCurrentUserId() && String(a.karyawan_id || a.karyawanId || a.user_id || a.id_user || "") === String(getCurrentUserId())) return true;
			if (a.email && getCurrentUserEmail() && String(a.email).toLowerCase() === String(getCurrentUserEmail()).toLowerCase()) return true;
			if (a.nama && getCurrentUserName() && String(a.nama).toLowerCase() === String(getCurrentUserName()).toLowerCase()) return true;
			return false;
		})
		: [];

	const [selected, setSelected] = useState(null);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [showAbsensiModal, setShowAbsensiModal] = useState(false);
	const [todayAbsensi, setTodayAbsensi] = useState(null);

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

	const isSameAttendanceDay = (record, targetDate = new Date()) => {
		if (!record) return false;
		const targetKey = targetDate.toISOString().slice(0, 10);
		if (record.date && String(record.date).slice(0, 10) === targetKey) return true;
		if (record.tanggal) {
			const parsed = new Date(record.tanggal);
			if (!isNaN(parsed.getTime())) {
				return parsed.toISOString().slice(0, 10) === targetKey;
			}
		}
		return false;
	};

	const hasCheckedInToday = () => {
		return absensi.some((a) => isSameAttendanceDay(a));
	};

	const getTodayItem = () => {
		return absensi.find((a) => isSameAttendanceDay(a));
	};

	const getTodayKey = () => new Date().toISOString().slice(0,10); 

		const canCheckIn = () => {
		const now = new Date();

		console.log("Waktu sekarang:", now);
		console.log("Jam sekarang:", now.getHours());

		const currentHour = now.getHours();
		const currentMinute = now.getMinutes();

		const currentTime = currentHour * 60 + currentMinute;

		return currentTime >= 480 && currentTime <= 1020;
	};

		const canCheckOut = () => {
		const now = new Date();
		const currentHour = now.getHours();
		const currentMinute = now.getMinutes();

		return currentHour > 17 || (currentHour === 17 && currentMinute >= 0);
		};

	const didLoginToday = () => {
		const lastLogin = localStorage.getItem('karyawanLastLogin');
		return lastLogin === getTodayKey();
	};

	const handleCheckIn = () => {
		// Allow manual check-in - removed login restriction for manual attendance
		console.log("HANDLE CHECK IN DIPANGGIL");
    	console.log("HASIL canCheckIn:", canCheckIn());
		if (!canCheckIn()) {
		alert("Absensi belum dibuka. Silakan melakukan absensi masuk mulai pukul 08.00 WIB.");
		return;
	}

		if (hasCheckedInToday()) {
			// Show today's attendance info
			const todayItem = getTodayItem();
			if (todayItem) {
				setTodayAbsensi(todayItem);
				setShowAbsensiModal(true);
			}
			return;
		}
		const now = new Date();
		const checkInId = `CI-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
		const newItem = {
			id: Date.now(),
			bulan: getMonthLabel(now),
			status: 'Hadir',
			tanggal: formatDate(now),
			jamMasuk: formatTime(now),
			checkInId
		};
		// Save to global absensi (visible in admin panel)
		if (addAbsensi) {
			addAbsensi({
				...newItem,
				karyawan_id: getCurrentUserId(),
				nama: getCurrentUserName(),
				email: getCurrentUserEmail(),
				posisi: userProfile?.position || userProfile?.role || 'Staff',
				date: now.toISOString().slice(0, 10),
				jamKeluar: ''
			});
		}
		// Show attendance modal (same as dashboard)
		setTodayAbsensi(newItem);
		setShowAbsensiModal(true);
	};

	 const handleCheckOut = () => {

		if (!canCheckOut()) {
			alert("Absensi pulang hanya dapat dilakukan mulai pukul 17:00 WIB.");
			return;
		}
		const today = new Date();
		const nowTime = formatTime(today);
		const todayItem = getTodayItem();
		if (!todayItem) {
			alert('Belum ada absen masuk hari ini.');
			return;
		}
		if (todayItem.jamKeluar) {
			alert('Anda sudah absen keluar hari ini.');
			return;
		}
		if (updateAbsensi) {
			updateAbsensi(todayItem.id, { jamKeluar: nowTime });
		}
		setTodayAbsensi({ ...todayItem, jamKeluar: nowTime });
		setShowAbsensiModal(true);
	 };

	const getStatusColor = (status) => {
		switch(status) {
			case "Hadir": return "bg-green-100 text-green-700";
			case "Sakit": return "bg-yellow-100 text-yellow-700";
			case "Cuti": return "bg-blue-100 text-blue-700";
			case "Izin": return "bg-blue-100 text-blue-700";
			case "Alpha": return "bg-red-100 text-red-700";
			default: return "bg-gray-100 text-gray-700";
		}
	};
	

	return (
		<div className="min-h-screen bg-white p-8">
			<style>{`
				@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
				@keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
				.animate-slide-up { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
				.animate-slide-down { animation: slideDown 0.5s ease-out; }
			`}</style>
			<div className="max-w-5xl mx-auto">
				{/* Header with Actions */}
				<div className="mb-8 flex items-center justify-between animate-slide-down">
					<div>
						<h1 className="text-2xl font-bold text-gray-800">Absensi</h1>
						<p className="text-sm text-gray-500 mt-1">Riwayat kehadiran dan check-in Anda</p>
					</div>
					<div className="flex items-center gap-3">
						<button 
							onClick={handleCheckIn} 
							disabled={hasCheckedInToday()}
							className={`font-medium text-sm px-6 py-3 rounded-md transition ${
								hasCheckedInToday()
									? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
									: 'bg-gray-700 text-white hover:bg-gray-800'
							}`}
						>
							{hasCheckedInToday() ? 'Sudah Absen Hari Ini' : 'Absen Masuk'}
						</button>
						<button
							onClick={handleCheckOut}
							disabled={
								!hasCheckedInToday() ||
								(getTodayItem() && getTodayItem().jamKeluar)
							}
							className={`font-medium text-sm px-6 py-3 rounded-md transition ${
								!hasCheckedInToday() || (getTodayItem() && getTodayItem().jamKeluar)
									? 'bg-gray-300 text-gray-500 cursor-not-allowed'
									: 'bg-amber-600 text-white hover:bg-amber-700'
							}`}
						>
							Keluar
						</button>
					</div>
				</div>

				{/* Attendance Modal (same as dashboard) */}
				{showAbsensiModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowAbsensiModal(false)}></div>
						<div className="bg-white rounded-xl shadow-2xl z-10 max-w-md w-full p-8 border border-gray-200 animate-slide-up">
							<div className="text-center mb-6">
								<div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
									<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<h3 className="text-2xl font-bold text-gray-900 mb-2">
									{todayAbsensi ? 'Absensi Hari Ini' : 'Absen Berhasil'}
								</h3>
								<p className="text-sm text-gray-600">Informasi kehadiran Anda</p>
							</div>

							{todayAbsensi && (
								<div className="space-y-4 mb-6">
									<div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
										<div className="flex items-center justify-between mb-3">
											<span className="text-xs font-semibold text-gray-600 uppercase">Tanggal</span>
											<span className="text-gray-900 font-semibold">{todayAbsensi.tanggal}</span>
										</div>
										<div className="flex items-center justify-between mb-3">
											<span className="text-xs font-semibold text-gray-600 uppercase">Jam Masuk</span>
											<span className="text-green-700 font-bold text-lg">{todayAbsensi.jamMasuk}</span>
										</div>
										<div className="flex items-center justify-between mb-3">
											<span className="text-xs font-semibold text-gray-600 uppercase">Status</span>
											<span className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-xs font-semibold">
												{todayAbsensi.status}
											</span>
										</div>
										{todayAbsensi.checkInId && (
											<div className="flex items-center justify-between pt-3 border-t border-gray-200">
												<span className="text-xs font-semibold text-gray-600 uppercase">ID Check-in</span>
												<span className="text-gray-700 font-mono text-xs">{todayAbsensi.checkInId}</span>
											</div>
										)}
									</div>
								</div>
							)}

							<div className="flex gap-3">
								<button
									onClick={() => setShowAbsensiModal(false)}
									className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-4 py-3 rounded-lg transition"
								>
									Tutup
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Detail Modal (for viewing past attendance) */}
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
									<p className="text-gray-900 font-medium mt-1">{selected.jamMasuk || "-"}</p>
								</div>
								{selected.jamKeluar && (
									<div className="border-b border-gray-200 pb-4">
										<p className="text-xs font-semibold text-gray-600 uppercase">Jam Keluar</p>
										<p className="text-gray-900 font-medium mt-1">{selected.jamKeluar}</p>
									</div>
								)}
								<div className="border-b border-gray-200 pb-4">
									<p className="text-xs font-semibold text-gray-600 uppercase">Status</p>
									<p className="text-green-700 font-medium mt-1">{selected.status}</p>
								</div>
								{selected.checkInId && (
									<div className="border-b border-gray-200 pb-4">
										<p className="text-xs font-semibold text-gray-600 uppercase">ID Check-in</p>
										<p className="text-gray-700 font-mono text-sm mt-1">{selected.checkInId}</p>
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
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Jam Keluar</th>
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
												<td className="px-6 py-4 text-sm text-gray-700">{item.jamMasuk || "-"}</td>
												<td className="px-6 py-4 text-sm text-gray-700">{item.jamKeluar || "-"}</td>
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
														</div>
												</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium text-sm">
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
