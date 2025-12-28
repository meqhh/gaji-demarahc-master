import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardKaryawan() {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [absensiData, setAbsensiData] = useState([]);
  const chartRef = useRef(null);
  const [showAbsensiModal, setShowAbsensiModal] = useState(false);
  const [todayAbsensi, setTodayAbsensi] = useState(null);

  const { userProfile, addAbsensi } = useContext(require('../context/AppContext').AppContext);

  const storageKey = userProfile?.email ? `absensi_${userProfile.email}` : 'absensi_guest';

  const getTodayKey = () => new Date().toISOString().slice(0,10);

  const didLoginToday = () => {
    const lastLogin = localStorage.getItem('karyawanLastLogin');
    return lastLogin === getTodayKey();
  };

  const hasCheckedInToday = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const today = new Date();
      return saved.some(a => {
        try {
          const aDate = new Date(a.tanggal);
          return aDate.getFullYear() === today.getFullYear() && aDate.getMonth() === today.getMonth() && aDate.getDate() === today.getDate();
        } catch (e) {
          return a.tanggal && a.tanggal.includes(String(today.getDate()));
        }
      });
    } catch (e) {
      return false;
    }
  };

  const formatDate = (d) => d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (d) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const getMonthLabel = (d) => d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const handleCheckIn = () => {
    // Allow manual check-in - removed login restriction
    if (hasCheckedInToday()) {
      // Show today's attendance info
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const today = new Date();
      const todayItem = saved.find(a => {
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
      checkInId,
      note: userProfile?.name ? `Absen manual oleh ${userProfile.name}` : 'Absen manual karyawan'
    };

    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    localStorage.setItem(storageKey, JSON.stringify([newItem, ...saved]));

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

    // Show attendance modal instead of navigating
    setTodayAbsensi(newItem);
    setShowAbsensiModal(true);
  };

  useEffect(() => {
    // Load absensi data from localStorage
    const data = JSON.parse(localStorage.getItem("absensiData") || "[]");
    setAbsensiData(data);
    
    // Load today's attendance if exists
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const today = new Date();
    const todayItem = saved.find(a => {
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
    }
  }, [storageKey]);

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

        {/* Absensi Bar (clickable) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-semibold">Absensi</span>
          </div>
          <div className="w-full bg-gray-300 rounded-lg h-12 overflow-hidden">
            <button
              onClick={handleCheckIn}
              className="w-full h-full flex items-center justify-start"
              aria-label="Absen Masuk"
            >
              <div
                className={`bg-gradient-to-r from-green-400 to-emerald-400 h-full flex items-center text-gray-700 font-semibold pl-4 ${hasCheckedInToday() ? 'opacity-60' : 'cursor-pointer hover:from-green-500 hover:to-emerald-500'}`}
                style={{ width: '95%' }}
              >
                {hasCheckedInToday() ? 'Sudah Absen' : 'Absensi'}
              </div>
            </button>
          </div>
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
