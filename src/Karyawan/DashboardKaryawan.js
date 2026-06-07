import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardKaryawan() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const chartRef = useRef(null);
  const [showAbsensiModal, setShowAbsensiModal] = useState(false);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [todayAbsensi, setTodayAbsensi] = useState(null);
  const [attendanceType, setAttendanceType] = useState("");

  const { userProfile, absensiData = [], addAbsensi, updateAbsensi } = useContext(require('../context/AppContext').AppContext);
  const getCurrentUserName = () => userProfile?.name || userProfile?.nama || userProfile?.email || "Karyawan";
  const getCurrentUserEmail = () => userProfile?.email || "";
  const getCurrentUserId = () => userProfile?.karyawanId || userProfile?.id || null;

  const myAbsensi = Array.isArray(absensiData)
    ? absensiData.filter((a) => {
        if (!a) return false;
        if (getCurrentUserId() && String(a.karyawan_id || a.karyawanId || a.user_id || a.id_user || "") === String(getCurrentUserId())) return true;
        if (a.email && getCurrentUserEmail() && String(a.email).toLowerCase() === String(getCurrentUserEmail()).toLowerCase()) return true;
        if (a.nama && getCurrentUserName() && String(a.nama).toLowerCase() === String(getCurrentUserName()).toLowerCase()) return true;
        return false;
      })
    : [];

  const getTodayKey = () => new Date().toISOString().slice(0,10);
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

  const didLoginToday = () => {
    const lastLogin = localStorage.getItem('karyawanLastLogin');
    return lastLogin === getTodayKey();
  };

  const hasCheckedInToday = () => {
    return myAbsensi.some((a) => isSameAttendanceDay(a));
  };

  const formatDate = (d) => d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (d) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const getMonthLabel = (d) => d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const canCheckIn = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    return currentTime >= 480 && currentTime <= 1020;
  };

  const canCheckOut = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    return currentTime >= 1020;
  };

  const getAttendanceStatusMessage = () => {
    if (hasCheckedInToday()) {
      const today = getTodayItemLocal();
      if (today?.jamKeluar) {
        return 'Anda sudah absen pulang hari ini.';
      }
      if (!canCheckOut()) {
        return 'Anda sudah absen masuk hari ini. Absen keluar bisa dilakukan mulai pukul 17.00 WIB.';
      }
      return 'Anda sudah absen masuk hari ini. Silakan klik Keluar untuk absen pulang.';
    }

    if (!canCheckIn()) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      if (currentTime < 480) {
        return 'Absen masuk dibuka mulai pukul 08.00 WIB.';
      }
      return 'Absen masuk sudah ditutup. Anda hanya dapat absen keluar setelah pukul 17.00 WIB jika sudah melakukan absen masuk.';
    }

    return 'Silakan absen masuk antara pukul 08.00 dan 17.00 WIB.';
  };

  const handleCheckIn = () => {
    if (!canCheckIn()) {
      alert('Absensi masuk hanya dapat dilakukan antara pukul 08.00 dan 17.00 WIB.');
      return;
    }
      if (hasCheckedInToday()) {
      // Show today's attendance info
      const todayItem = myAbsensi.find((a) => isSameAttendanceDay(a));
      if (todayItem) {
        setTodayAbsensi(todayItem);
        setShowAbsensiModal(true);
      }
      return;
    }
    // Show check-in form
    setShowCheckInForm(true);
    setAttendanceType("");
  };

  const handleCheckInSubmit = () => {
    if (!attendanceType) {
      alert("Mohon pilih Attendance Type terlebih dahulu!");
      return;
    }

    const now = new Date();
    const checkInId = `CI-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    const newItem = {
      id: Date.now(),
      bulan: getMonthLabel(now),
      status: attendanceType,
      tanggal: formatDate(now),
      jamMasuk: formatTime(now),
      checkInId
    };

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

    // Close form and show attendance modal
    setShowCheckInForm(false);
    setAttendanceType("");
    setTodayAbsensi(newItem);
    setShowAbsensiModal(true);
  };


  const getTodayItemLocal = () => {
    return myAbsensi.find((a) => isSameAttendanceDay(a));
  };

    const handleCheckOut = () => {

  if (!canCheckOut()) {
    alert("Absensi pulang hanya dapat dilakukan mulai pukul 17.00 WIB.");
    return;
  }

  const today = new Date();
  const nowTime = formatTime(today);
  const todayItem = getTodayItemLocal();

  if (!todayItem) {
    alert("Belum ada absen masuk hari ini.");
    return;
  }

    if (todayItem.jamKeluar) {
      alert("Anda sudah absen keluar hari ini.");
      return;
    }

    const updatedTodayItem = {
      ...todayItem,
      jamKeluar: nowTime,
    };

    if (updateAbsensi) {
      updateAbsensi(todayItem.id, {
        jamKeluar: nowTime,
      });
    }

    setTodayAbsensi(updatedTodayItem);
    setShowAbsensiModal(true);
  };

  const handleReset = () => {
    setAttendanceType("");
  };

  const handleCancel = () => {
    setShowCheckInForm(false);
    setAttendanceType("");
  };

  useEffect(() => {
    // Load today's attendance if exists
    const todayItem = myAbsensi.find((a) => isSameAttendanceDay(a));
    if (todayItem) {
      setTodayAbsensi(todayItem);
    }
  }, [myAbsensi]);

  // Get today's date
  const today = new Date();
  const dayName = today.toLocaleDateString("id-ID", { weekday: "long" });
  const dateFormatted = today.toLocaleDateString("id-ID", { 
    day: "2-digit", 
    month: "long", 
    year: "numeric" 
  });

  // Chart data - attendance per day of week
  const chartDataValues = [
    { day: "Senin", value: 85 },
    { day: "Selasa", value: 90 },
    { day: "Rabu", value: 78 },
    { day: "Kamis", value: 95 },
    { day: "Jumat", value: 80 },
    { day: "Sabtu", value: 70 },
    { day: "Minggu", value: 75 }
  ];

  // Chart.js bar chart configuration with gradient bars
  const chartConfig = {
    labels: chartDataValues.map(d => d.day),
    datasets: [
      {
        label: 'Kehadiran (%)',
        data: chartDataValues.map(d => d.value * 10), // Scale values for better chart display
        backgroundColor: function(context) {
          const ctx = context.chart.ctx;
          const chartArea = context.chart.chartArea;
          if (!chartArea) return '#EC4899';
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, '#EC4899');    // Pink at top
          gradient.addColorStop(0.5, '#F2A4CF');   // Light pink middle
          gradient.addColorStop(1, '#F9E7F3');     // Very light pink at bottom
          return gradient;
        },
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 0,
        hoverBackgroundColor: '#DB2777',
        barThickness: 55,
        categoryPercentage: 0.65,
        barPercentage: 0.9,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        padding: 10,
        borderColor: 'transparent',
        displayColors: false,
        callbacks: {
          label: function(context) {
            return 'Kehadiran: ' + (context.parsed.y / 10).toFixed(0) + '%';
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1000,
        ticks: {
          font: { size: 11, weight: '500' },
          color: '#9CA3AF',
          stepSize: 100
        },
        grid: {
          color: '#E5E7EB',
          drawBorder: false,
          lineWidth: 0.5
        }
      },
      x: {
        ticks: {
          font: { size: 12, weight: '500' },
          color: '#374151',
          padding: 8
        },
        grid: {
          display: false,
          drawBorder: false
        }
      }
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
      `}</style>

      {/* Header Section */}
      <div className="animate-slide-up">
        <h1 className="text-4xl font-bold text-purple-700 mb-1">Welcome to Demara Health Care</h1>
        <p className="text-lg text-teal-600 font-medium">Simplifying Employee Management with Digital Solutions</p>
      </div>

      {/* Date Display */}
      <div className="text-gray-700 text-lg font-semibold animate-slide-up" style={{ animationDelay: '0.1s' }}>
        Hari ini: <span className="capitalize">{dayName}, {dateFormatted}</span>
      </div>

      {/* Status Bars Comparison */}
      <div className="bg-gray-100 rounded-lg p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {/* Masuk Bar (clickable: performs check-in and shows attendance modal) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-semibold">Masuk</span>
          </div>
          <div className="w-full bg-gray-300 rounded-lg h-12 overflow-hidden">
            <button onClick={handleCheckIn} className="w-full h-full flex items-center justify-start" aria-label="Absen Masuk">
              <div
                className={`bg-gradient-to-r from-green-400 to-emerald-400 h-full flex items-center text-gray-700 font-semibold pl-4 ${hasCheckedInToday() ? 'opacity-60' : 'cursor-pointer hover:from-green-500 hover:to-emerald-500'}`}
                style={{ width: '45%' }}
              >
                {hasCheckedInToday() ? 'Sudah Masuk' : 'Masuk'}
              </div>
            </button>
          </div>
        </div>
        {/* Keluar Button (visible when checked-in and not yet checked-out) */}
        <div className="mb-6">
          <div className="flex items-center justify-end">
            <button
              onClick={handleCheckOut}
              disabled={!hasCheckedInToday() || (getTodayItemLocal() && getTodayItemLocal().jamKeluar) || !canCheckOut()}
              className={`px-4 py-2 rounded-md font-medium ${!hasCheckedInToday() || (getTodayItemLocal() && getTodayItemLocal().jamKeluar) || !canCheckOut() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-amber-600 text-white hover:bg-amber-700'}`}
            >
              Keluar
            </button>
          </div>
        </div>

        {/* Absensi Bar (clickable) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-semibold">Absensi</span>
          </div>
          <div className="w-full bg-gray-300 rounded-lg h-12 overflow-hidden">
            <button
              onClick={handleCheckIn}
              disabled={hasCheckedInToday() || !canCheckIn()}
              className={`w-full h-full flex items-center justify-start ${hasCheckedInToday() || !canCheckIn() ? 'cursor-not-allowed' : ''}`}
              aria-label="Absen Masuk"
            >
              <div
                className={`bg-gradient-to-r from-green-400 to-emerald-400 h-full flex items-center text-gray-700 font-semibold pl-4 ${hasCheckedInToday() || !canCheckIn() ? 'opacity-60' : 'cursor-pointer hover:from-green-500 hover:to-emerald-500'}`}
                style={{ width: '95%' }}
              >
                {hasCheckedInToday() ? 'Sudah Absen' : 'Absensi'}
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="text-sm text-gray-600 mb-2">{getAttendanceStatusMessage()}</div>
        <div className="inline-flex items-center gap-2 text-xs text-gray-500 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
          <span className="font-semibold">Info:</span>
          <span>Absen masuk 08:00 - 17:00 WIB.</span>
          <span>Absen keluar mulai 17:00 WIB.</span>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-gray-100 rounded-lg p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <label className="font-semibold text-gray-700">Periode:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Dari"
          />
          <span className="text-gray-600 font-medium">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Hingga"
          />
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-gray-100 rounded-lg p-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="h-96 flex items-center justify-center bg-white rounded-lg">
          <Bar ref={chartRef} data={chartConfig} options={chartOptions} />
        </div>
      </div>

      {/* Motivational Quote Section */}
      <div className="bg-gray-100 rounded-lg p-12 text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <p className="text-4xl text-gray-700 font-light italic leading-relaxed">
          "Have a great day at work, stay positive and productive!"
        </p>
      </div>

      {/* Check In Attendance Form Modal */}
      {showCheckInForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black opacity-50" onClick={handleCancel}></div>
          <div className="bg-white rounded-lg shadow-xl z-10 max-w-lg w-full border border-gray-200 animate-slide-up">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Check In Attendance</h2>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-6">
              {/* Current Date Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Date
                </label>
                <input
                  type="text"
                  value={today.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                />
              </div>

              {/* Attendance Type Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Attendance Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={attendanceType}
                    onChange={(e) => setAttendanceType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white cursor-pointer pr-10"
                    required
                  >
                    <option value="">- Select one -</option>
                    <option value="Hadir">Hadir</option>
                    <option value="Izin">Izin</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Cuti">Cuti</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
                <button
                  onClick={handleCheckInSubmit}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Check In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
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
                onClick={() => {
                  setShowAbsensiModal(false);
                  navigate('/karyawan/absensi');
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-3 rounded-lg transition"
              >
                Lihat Riwayat
              </button>
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
    </div>
  );
}
