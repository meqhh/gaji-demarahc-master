import React, { useState, useEffect, useRef } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DashboardKaryawan() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [absensiData, setAbsensiData] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    // Load absensi data from localStorage
    const data = JSON.parse(localStorage.getItem("absensiData") || "[]");
    setAbsensiData(data);
  }, []);

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
        {/* Masuk Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-semibold">Masuk</span>
          </div>
          <div className="w-full bg-gray-300 rounded-lg h-12 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-400 to-emerald-400 h-full flex items-center justify-center text-gray-700 font-semibold"
              style={{ width: '45%' }}
            >
              Masuk
            </div>
          </div>
        </div>

        {/* Absensi Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-700 font-semibold">Absensi</span>
          </div>
          <div className="w-full bg-gray-300 rounded-lg h-12 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-400 to-emerald-400 h-full flex items-center justify-center text-gray-700 font-semibold"
              style={{ width: '95%' }}
            >
              Absensi
            </div>
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
    </div>
  );
}
