// Restored Dashboard (original-like) from template
import React, { useState, useEffect, useContext } from "react";
import { Bar } from "react-chartjs-2";
import { AppContext } from "../context/AppContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Dashboard() {
  const { karyawanData, absensiData, gajiData } = useContext(AppContext) || {};
  const [pendingAbsensi, setPendingAbsensi] = useState(0);

  useEffect(() => {
    const pending = (absensiData || []).filter((a) => a.status === "Menunggu").length;
    setPendingAbsensi(pending);
  }, [absensiData]);

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
    datasets: [
      {
        label: "Total Gaji (Rp)",
        data: [5000000, 7000000, 6000000, 8000000, 9000000, 10000000],
        backgroundColor: "#1f2937",
        borderColor: "#111827",
        borderWidth: 0,
        borderRadius: 4,
        barThickness: 50,
      },
    ],
  };

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
        .animate-slide-down { animation: slideDown 0.5s ease-out; }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -12px rgba(0,0,0,0.1); }
      `}</style>

      <div className="mb-8 animate-slide-down">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">Ringkasan data dan statistik sistem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 card-hover animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-600 uppercase">Total Karyawan</p>
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{(karyawanData || []).length}</p>
          <p className="text-xs text-green-600 mt-2">✓ Aktif</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 card-hover animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-600 uppercase">Kehadiran</p>
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z" clipRule="evenodd" /></svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">156/bln</p>
          <p className="text-xs text-blue-600 mt-2">↑ 95% rata-rata</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-600 uppercase">Total Gaji</p>
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M8.16 2.75a.75.75 0 00-1.32 0l-1.4 3.5H1.75a.75.75 0 000 1.5h3.26l-1.4 3.5a.75.75 0 001.32 0l1.4-3.5h3.26a.75.75 0 000-1.5H7.54l1.4-3.5zm3.68 3.5a.75.75 0 00-1.32 0l-1.4 3.5h3.26l-1.4-3.5z" /></svg>
          </div>
          <p className="text-xl font-bold text-gray-900">Rp. 43.5M</p>
          <p className="text-xs text-gray-500 mt-2">Desember 2025</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 card-hover animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-600 uppercase">Menunggu</p>
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" /></svg>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingAbsensi}</p>
          <p className="text-xs text-orange-600 mt-2">Perlu Dikonfirmasi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6 card-hover animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Pengeluaran Gaji Per Bulan</h2>
            <p className="text-sm text-gray-500 mt-1">Tren pengeluaran gaji 6 bulan terakhir</p>
          </div>
          <div className="h-80">
            <Bar 
              data={chartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: function(value) { return 'Rp ' + (value / 1000000).toFixed(0) + 'M'; } }
                  }
                }
              }} 
            />
          </div>
        </div>

        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.35s' }}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 card-hover">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Ringkasan Bulan Ini</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gaji Terbayar</span>
                <span className="text-sm font-bold text-green-600">100%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tingkat Kehadiran</span>
                <span className="text-sm font-bold text-green-600">95%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Absensi Tertunda</span>
                <span className="text-sm font-bold text-orange-600">{pendingAbsensi}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 card-hover">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Status Sistem</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-gray-600">Sistem Operasional</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-gray-600">Database Terhubung</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm text-gray-600">Backup Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
