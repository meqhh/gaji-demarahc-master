import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
// QR removed: using professional check-in ID instead of QR codes

export default function AbsensiKaryawan() {
	const navigate = useNavigate();
	const { userProfile, addAbsensi, updateAbsensi } = useContext(AppContext);

	// No default dummy data - all data from backend API/localStorage
	const storageKey = userProfile?.email ? `absensi_${userProfile.email}` : 'absensi_guest';

	const [absensi, setAbsensi] = useState(() => {
		const saved = localStorage.getItem(storageKey);
		return saved ? JSON.parse(saved) : [];
	});

	useEffect(() => {
		localStorage.setItem(storageKey, JSON.stringify(absensi));
	}, [absensi, storageKey]);

	const [selected, setSelected] = useState(null);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
	const [showAbsensiModal, setShowAbsensiModal] = useState(false);
	const [todayAbsensi, setTodayAbsensi] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [editData, setEditData] = useState(null);
	const [formData, setFormData] = useState({
		tanggal: "",
		jamMasuk: "",
		jamKeluar: "",
		status: "Hadir",
	});
	const [showDelete, setShowDelete] = useState(false);
	const [deleteData, setDeleteData] = useState(null);

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

	const getTodayItem = () => {
		const today = new Date();
		return absensi.find(a => {
			try {
				const aDate = new Date(a.tanggal);
				return aDate.getFullYear() === today.getFullYear() && aDate.getMonth() === today.getMonth() && aDate.getDate() === today.getDate();
			} catch (e) {
				return a.tanggal && a.tanggal.includes(String(today.getDate()));
			}
		});
	};

	const getTodayKey = () => new Date().toISOString().slice(0,10); // YYYY-MM-DD

	const didLoginToday = () => {
		const lastLogin = localStorage.getItem('karyawanLastLogin');
		return lastLogin === getTodayKey();
	};

	const handleCheckIn = () => {
		// Allow manual check-in - removed login restriction for manual attendance
		if (hasCheckedInToday()) {
			// Show today's attendance info
			const today = new Date();
			const todayItem = absensi.find(a => {
				try {
					const aDate = new Date(a.tanggal);
					return aDate.getFullYear() === today.getFullYear() && 
						   aDate.getMonth() === today.getMonth() && 
						   aDate.getDate() === today.getDate();
				} catch (e) {
					return a.tanggal && a.tanggal.includes(String(today.getDate()));
				}
			});
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
		setAbsensi(prev => [newItem, ...prev]);
		// Also add to global absensi (visible in admin panel)
		if (addAbsensi) {
			addAbsensi({
				...newItem,
				nama: userProfile?.name || userProfile?.email || 'Karyawan',
				email: userProfile?.email || 'guest',
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
		const today = new Date();
		const nowTime = formatTime(today);
		const todayItem = absensi.find(a => {
			try {
				const aDate = new Date(a.tanggal);
				return aDate.getFullYear() === today.getFullYear() && aDate.getMonth() === today.getMonth() && aDate.getDate() === today.getDate();
			} catch (e) {
				return a.tanggal && a.tanggal.includes(String(today.getDate()));
			}
		});
		if (!todayItem) {
			alert('Belum ada absen masuk hari ini.');
			return;
		}
		if (todayItem.jamKeluar) {
			alert('Anda sudah absen keluar hari ini.');
			return;
		}
		const updated = absensi.map(a => a.id === todayItem.id ? { ...a, jamKeluar: nowTime } : a);
		setAbsensi(updated);
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

	// Handle Add
	const handleAdd = () => {
		setEditData(null);
		setFormData({
			tanggal: new Date().toISOString().slice(0, 10),
			jamMasuk: "",
			jamKeluar: "",
			status: "Hadir",
		});
		setShowModal(true);
	};

	// Handle Edit
	const handleEdit = (item) => {
		if (!item) return;
		setEditData(item);
		// Convert tanggal format to YYYY-MM-DD if needed
		let tanggalValue = "";
		if (item.tanggal) {
			try {
				const dateObj = new Date(item.tanggal);
				if (!isNaN(dateObj.getTime())) {
					tanggalValue = dateObj.toISOString().slice(0, 10);
				} else {
					// Try to parse format like "13 Aug 2025"
					const parts = item.tanggal.split(" ");
					if (parts.length === 3) {
						const months = { "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "Mei": "05", "Jun": "06", "Jul": "07", "Agt": "08", "Aug": "08", "Sep": "09", "Okt": "10", "Nov": "11", "Des": "12" };
						const month = months[parts[1]] || "01";
						tanggalValue = `${parts[2]}-${month}-${parts[0].padStart(2, '0')}`;
					}
				}
			} catch (e) {
				tanggalValue = new Date().toISOString().slice(0, 10);
			}
		}
		setFormData({
			tanggal: tanggalValue || new Date().toISOString().slice(0, 10),
			jamMasuk: item.jamMasuk || "",
			jamKeluar: item.jamKeluar || "",
			status: item.status || "Hadir",
		});
		setShowModal(true);
	};

	// Handle Submit (Add/Edit)
	const handleSubmit = (e) => {
		e.preventDefault();
		
		if (!formData.tanggal || !formData.jamMasuk || !formData.status) {
			alert("Mohon lengkapi semua field yang wajib diisi!");
			return;
		}

		try {
			const tanggalFormatted = formatDate(new Date(formData.tanggal));
			const bulanFormatted = getMonthLabel(new Date(formData.tanggal));
			const checkInId = editData?.checkInId || `CI-${new Date(formData.tanggal).getFullYear()}${String(new Date(formData.tanggal).getMonth()+1).padStart(2,'0')}${String(new Date(formData.tanggal).getDate()).padStart(2,'0')}-${String(new Date().getHours()).padStart(2,'0')}${String(new Date().getMinutes()).padStart(2,'0')}`;

			if (editData) {
				// Update existing
				const updatedAbsensi = absensi.map(a => {
					if (a.id === editData.id) {
						return {
							...a,
							tanggal: tanggalFormatted,
							bulan: bulanFormatted,
							jamMasuk: formData.jamMasuk,
							jamKeluar: formData.jamKeluar || "",
							status: formData.status,
							checkInId: a.checkInId || checkInId
						};
					}
					return a;
				});
				setAbsensi(updatedAbsensi);
				
				// Update global absensi
				if (addAbsensi) {
					const globalData = {
						id: editData.id,
						nama: userProfile?.name || userProfile?.email || 'Karyawan',
						email: userProfile?.email || 'guest',
						posisi: userProfile?.position || userProfile?.role || 'Staff',
						date: formData.tanggal,
						jamMasuk: formData.jamMasuk,
						jamKeluar: formData.jamKeluar || "",
						status: formData.status
					};
					// Note: We need updateAbsensi from context, but for now we'll use addAbsensi
					// In a real app, you'd want to use updateAbsensi
				}
			} else {
				// Add new
				const newItem = {
					id: Date.now(),
					bulan: bulanFormatted,
					status: formData.status,
					tanggal: tanggalFormatted,
					jamMasuk: formData.jamMasuk,
					jamKeluar: formData.jamKeluar || "",
					checkInId: checkInId
				};
				setAbsensi(prev => [newItem, ...prev]);
				
				// Add to global absensi
				if (addAbsensi) {
					addAbsensi({
						...newItem,
						nama: userProfile?.name || userProfile?.email || 'Karyawan',
						email: userProfile?.email || 'guest',
						posisi: userProfile?.position || userProfile?.role || 'Staff',
						date: formData.tanggal
					});
				}
			}
			
			setShowModal(false);
			setEditData(null);
			setFormData({
				tanggal: "",
				jamMasuk: "",
				jamKeluar: "",
				status: "Hadir",
			});
		} catch (error) {
			console.error("Error saat menyimpan absensi:", error);
			alert("Terjadi kesalahan saat menyimpan data. Silakan coba lagi.");
		}
	};

	// Handle Delete
	const handleDelete = (item) => {
		setDeleteData(item);
		setShowDelete(true);
	};

	const confirmDelete = () => {
		if (deleteData) {
			setAbsensi(prev => prev.filter(a => a.id !== deleteData.id));
			setShowDelete(false);
			setDeleteData(null);
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
							disabled={!hasCheckedInToday() || (getTodayItem() && getTodayItem().jamKeluar)}
							className={`font-medium text-sm px-6 py-3 rounded-md transition ${
								!hasCheckedInToday() || (getTodayItem() && getTodayItem().jamKeluar)
									? 'bg-gray-300 text-gray-500 cursor-not-allowed'
									: 'bg-amber-600 text-white hover:bg-amber-700'
							}`}
						>
							Keluar
						</button>
						<button
							onClick={handleAdd}
							className="px-6 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
						>
							<span>+</span> Tambah Absensi
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

				{/* Modal Form Add/Edit */}
				{showModal && (
					<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 p-4">
						<div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 animate-slide-up">
							<h3 className="text-2xl font-bold text-gray-900 mb-6">
								{editData ? "Edit Absensi" : "Tambah Absensi Baru"}
							</h3>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="text-sm font-bold text-gray-700 block mb-2">Tanggal</label>
									<input
										type="date"
										value={formData.tanggal}
										onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
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
										<option value="Cuti">Cuti</option>
										<option value="Alpha">Alpha</option>
									</select>
								</div>

								<div className="flex gap-3 pt-4 border-t border-gray-200 mt-6">
									<button
										type="button"
										onClick={() => {
											setShowModal(false);
											setEditData(null);
											setFormData({
												tanggal: "",
												jamMasuk: "",
												jamKeluar: "",
												status: "Hadir",
											});
										}}
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

				{/* Modal Delete */}
				{showDelete && deleteData && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
						<div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 animate-slide-up">
							<div className="text-center mb-6">
								<div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
									<svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
									</svg>
								</div>
								<h2 className="text-xl font-semibold text-gray-900 mb-2">Hapus Data Absensi</h2>
								<p className="text-sm text-gray-500">Anda akan menghapus:</p>
							</div>

							{deleteData && (
								<div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
									<p className="text-gray-900 font-medium">{deleteData.tanggal || "-"}</p>
									<p className="text-sm text-gray-600 mt-1">{deleteData.jamMasuk || "-"} • {deleteData.status || "-"}</p>
								</div>
							)}

							<p className="text-sm text-gray-600 mb-6 text-center">
								Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen.
							</p>

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
														<button onClick={() => openDetail(item)} className="text-gray-700 hover:text-gray-900 font-medium text-sm transition">Detail</button>
														<button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-700 font-semibold transition-colors text-sm">Edit</button>
														<button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-700 font-semibold transition-colors text-sm">Hapus</button>
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
