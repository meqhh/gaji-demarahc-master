import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";

// All treatment data comes from AppContext/backend (no hardcoded master data)

export default function TreatmentKaryawan() {
  const { treatmentData = [] } = useContext(AppContext);
  { id: 1, nama: "Pijat Bayi Sehat", category: "Baby Treatment", harga: 150000 },
  { id: 2, nama: "Pijat Balita", category: "Baby Treatment", harga: 185000 },
  { id: 3, nama: "Pijat Pediatric Bayi", category: "Baby Treatment", harga: 195000 },
  { id: 4, nama: "Pijat Pediatric Balita", category: "Baby Treatment", harga: 165000 },
  { id: 5, nama: "Baby Spa (Pijat + Swim + Gym)", category: "Baby Treatment", harga: 275000 },

  { id: 6, nama: "Haircut Bayi", category: "Baby Treatment", harga: 100000 },
  { id: 7, nama: "Haircut + Nails Cut", category: "Baby Treatment", harga: 150000 },
  { id: 8, nama: "Pijat Bayi + Haircut", category: "Baby Treatment", harga: 275000 },

  { id: 9, nama: "Tindik Steril Manual", category: "Baby Treatment", harga: 150000 },
  { id: 10, nama: "Tindik Steril dr Evoo (One Push)", category: "Baby Treatment", harga: 700000 },

  { id: 11, nama: "Happy Pregnancy", category: "Mommy Treatment", harga: 350000 },
  { id: 12, nama: "Happy Mommy (Pijat Ibu Nifas)", category: "Mommy Treatment", harga: 350000 },
  { id: 13, nama: "Happy Buna (Pijat Ibu Pasca SC)", category: "Mommy Treatment", harga: 350000 },
  { id: 14, nama: "Release Pregnancy Massage", category: "Mommy Treatment", harga: 350000 },
  { id: 15, nama: "Comfort Mommy Massage", category: "Mommy Treatment", harga: 550000 },

  { id: 16, nama: "Konsultasi Laktasi", category: "Laktasi Treatment", harga: 150000 },
  { id: 17, nama: "Pijat Laktasi + Oksitosin", category: "Laktasi Treatment", harga: 275000 },
  { id: 18, nama: "Pijat Laktasi", category: "Laktasi Treatment", harga: 400000 },
  { id: 19, nama: "Pijat Arugaan Laktasi (New)", category: "Laktasi Treatment", harga: 550000 },

  // Happy Deals Package
  { id: 20, nama: "Happy Deals 1 (Pijat Laktasi + Pijat Oksitosin + Pijat Bayi)", category: "Happy Deals", harga: 550000, fee: 10 },
  { id: 21, nama: "Happy Deals 2 (Pijat Oksitosin + Pijat Bayi Pediatric)", category: "Happy Deals", harga: 525000, fee: 10 },
  { id: 22, nama: "Happy Deals 3 (Pijat Laktasi + Konsultasi & Belajar Menyusui + Pijat Bayi)", category: "Happy Deals", harga: 690000, fee: 10 },
  { id: 23, nama: "Happy Deals 4 (Pijat Laktasi + Konsultasi Menyusui)", category: "Happy Deals", harga: 290000, fee: 10 },
  { id: 24, nama: "Happy Deals 5 (Pijat Laktasi + Belajar Menyusui + Konsultasi)", category: "Happy Deals", harga: 400000, fee: 10 },
  { id: 25, nama: "Happy Deals 6 (Pijat Laktasi Payudara saja + Pijat Pediatric)", category: "Happy Deals", harga: 440000, fee: 10 },

  // Gift For Mom
  { id: 26, nama: "Gift For Mom 1 (Konsultasi + Pijat Laktasi + Pijat Oksitosin)", category: "Gift For Mom", harga: 550000, fee: 10 },
  { id: 27, nama: "Gift For Mom 2 (Full Paket + Pijat Bayi)", category: "Gift For Mom", harga: 950000, fee: 10 },

  // Konselor Laktasi Services
  { id: 28, nama: "Konsultasi Laktasi (Konselor Laktasi)", category: "Konselor Laktasi", harga: 250000, fee: 10 },
  { id: 29, nama: "Konsultasi + Pijat Laktasi (Konselor Laktasi)", category: "Konselor Laktasi", harga: 500000, fee: 10 },

  // Konsultasi MPASI
  { id: 30, nama: "Konsultasi MP-ASI (60 menit)", category: "Konselor Laktasi", harga: 250000, fee: 10 },

  // Layanan lainnya
  { id: 31, nama: "Konsultasi + Belajar Posisi & Pelekatan Menyusui", category: "Konselor Laktasi", harga: 450000, fee: 10 },
  { id: 32, nama: "Konsultasi + Terapi Bingung Puting", category: "Konselor Laktasi", harga: 450000, fee: 10 },
  { id: 33, nama: "Konsultasi + Terapi Oral Bayi (Finger Feeding)", category: "Konselor Laktasi", harga: 500000, fee: 10 },

  // Paket Pendampingan Laktasi (Bidan Konselor)
  { id: 34, nama: "4x Pijat Laktasi + Oksitosin (Dengan Konselor Laktasi)", category: "Paket Laktasi", harga: 1800000, fee: 10 },
  { id: 35, nama: "6x Pijat Laktasi + Oksitosin (Dengan Konselor Laktasi)", category: "Paket Laktasi", harga: 2700000, fee: 10 },
  { id: 36, nama: "10x Pijat Laktasi + Oksitosin (Dengan Konselor Laktasi)", category: "Paket Laktasi", harga: 4000000, fee: 10 },

  // Mom & Baby Treatment Package
  { id: 37, nama: "Paket Mom & Baby (Konsultasi + Pijat Laktasi + Oksitosin + Pijat Bayi)", category: "Mom & Baby Treatment", harga: 750000, fee: 10 },

  // Paket New Mom
  { id: 38, nama: "Paket New Mom (Konsultasi + Pijat Laktasi + Oksitosin + Belajar DBF)", category: "Mom & Baby Treatment", harga: 750000, fee: 10 },

  // Paket Re-Laktasi
  { id: 39, nama: "Paket Re-Laktasi (Konsultasi + Teknik Menyusui + SNS + Pijat Laktasi)", category: "Re-Laktasi Package", harga: 750000, fee: 10 },

  // Breastfeeding Classes
  { id: 40, nama: "Breastfeeding Class (Ibu saja)", category: "Breastfeeding Class", harga: 450000, fee: 10 },
  { id: 41, nama: "Breastfeeding & New Born Class (Pasangan)", category: "Breastfeeding Class", harga: 750000, fee: 10 },

  // Postnatal / Comfort Massage Packages
  { id: 42, nama: "Pemasangan Gurita/Bengkung", category: "Postnatal Package", harga: 600000, fee: 10 },

  { id: 43, nama: "Comfort Mommy Massage 14 Hari (4x Pijat)", category: "Postnatal Package", harga: 1500_000, fee: 10 },
  { id: 44, nama: "Comfort Mommy Massage 30 Hari (3x Pijat)", category: "Postnatal Package", harga: 1200_000, fee: 10 },
  { id: 45, nama: "Comfort Mommy Massage 4x (Free 1x Pijat Bayi)", category: "Postnatal Package", harga: 2000_000, fee: 10 },
  { id: 46, nama: "Comfort Mommy Massage 6x (Free 2x Pijat Bayi)", category: "Postnatal Package", harga: 3000_000, fee: 10 },

  // Paket ASI Lancar
  { id: 47, nama: "Bundle 4x Pijat Laktasi (Free 1x Pijat Bayi)", category: "Paket ASI Lancar", harga: 1000_000, fee: 10 },
  { id: 48, nama: "Bundle 6x Pijat Laktasi (Free 2x Pijat Bayi)", category: "Paket ASI Lancar", harga: 1500_000, fee: 10 },

  { id: 49, nama: "Bundle 4x Laktasi Oksitosin (Free 2x Pijat Bayi)", category: "Paket ASI Lancar", harga: 1500_000, fee: 10 },
  { id: 50, nama: "Bundle 6x Laktasi Oksitosin (Free 1x Pijat Laktasi + 1x Pijat Bayi)", category: "Paket ASI Lancar", harga: 2250_000, fee: 10 },

  // Buna Baby Package
  { id: 51, nama: "Buna Baby 4x Laktasi + 4x Pijat Bayi", category: "Buna Baby Package", harga: 1650000, fee: 10 },
  { id: 52, nama: "Buna Baby 6x Laktasi + 6x Pijat Bayi (Free 1x Laktasi + 1x Pijat Bayi)", category: "Buna Baby Package", harga: 2450000, fee: 10 },
  { id: 53, nama: "Buna Baby 10x Laktasi + 10x Pijat Bayi (Free 2x Laktasi + 2x Pijat Bayi)", category: "Buna Baby Package", harga: 3900000, fee: 10 },

  // Baby Pediatric Package
  { id: 54, nama: "Baby Package 4x Pijat Pediatric", category: "Baby Package", harga: 650000, fee: 10 },
  { id: 55, nama: "Baby Package 6x Pijat Pediatric (Free 1x Pijat Bayi)", category: "Baby Package", harga: 950000, fee: 10 },
  { id: 56, nama: "Baby Package 10x Pijat Pediatric (Free 2x Pijat Bayi)", category: "Baby Package", harga: 1650000, fee: 10 },

  // Re-Laktasi Arugaan Package

// Treatment list is loaded from AppContext/backend - no hardcoded data

// FEE OTOMATIS BERDASARKAN KATEGORI
function getFeeByCategory(category) {
  const lower = category.toLowerCase();

  if (
    lower.includes("package") ||
    lower.includes("bundle") ||
    lower.includes("deal")
  ) {
    return 10; // fee paket/bundling
  }

  return 15; // fee single treatment
}

function TreatmentKaryawan() {
  const { treatmentData = [] } = useContext(AppContext);
  const [search, setSearch] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);

  // FILTER DATA BY SEARCH
  const filteredData = treatmentData.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  // Format harga ke Rupiah
  const formatHarga = (harga) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(harga);
  };

  return (
    <div className="space-y-8 pb-8">
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(204, 69, 222, 0.2);
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
        .animate-slide-down {
          animation: slideDown 0.6s ease-out forwards;
        }
      `}</style>

      <main>
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between animate-slide-down">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">Daftar Treatment</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="inline-block text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" />
                </svg>
              </span>
              <span className="text-gray-400">Treatment Layanan</span>
            </div>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="bg-white shadow-md rounded-xl overflow-hidden card-hover animate-slide-up">
          <div className="border-b-2 border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900">📋 Daftar Treatment Tersedia</h2>
          </div>

          {/* Search Bar */}
          <div className="bg-gray-50 p-6 border-b-2 border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="🔍 Cari treatment berdasarkan nama atau kategori..."
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all font-semibold text-gray-700"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">Total ditemukan: <span className="font-bold text-purple-600">{filteredData.length}</span> treatment</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-white">
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">No.</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Nama Treatment</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Kategori</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Harga</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Fee (%)</th>
                  <th className="px-8 py-5 text-left text-sm font-bold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((t, idx) => (
                  <tr
                    key={t.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <td className="px-8 py-5 bg-gray-100 text-gray-800 font-semibold">{idx + 1}.</td>
                    <td className="px-8 py-5 bg-gray-100 text-gray-800 font-medium">{t.nama}</td>
                    <td className="px-8 py-5 bg-gray-100 text-gray-800 text-sm">{t.category}</td>
                    <td className="px-8 py-5 bg-gray-100 text-gray-800 font-semibold">{formatHarga(t.harga)}</td>
                    <td className="px-8 py-5 bg-gray-100 text-gray-800">{getFeeByCategory(t.category)}%</td>
                    <td className="px-8 py-5 bg-gray-100 text-center">
                      <button
                        onClick={() => {
                          setDetailData(t);
                          setShowDetail(true);
                        }}
                        className="text-blue-600 font-bold hover:text-blue-700 transition-colors"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && (
              <div className="text-center py-16">
                <p className="text-2xl text-gray-400">📭 Belum ada data treatment</p>
              </div>
            )}
          </div>
        </div>

        {/* === Modal Detail === */}
        {showDetail && detailData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-down">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">👁️ Detail Treatment</h2>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-2xl text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">🏷️ Nama Treatment</label>
                  <p className="border-2 border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-gray-800 font-medium">{detailData.nama}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">📂 Kategori</label>
                  <p className="border-2 border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-gray-800 font-medium">{detailData.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">💰 Harga</label>
                  <p className="border-2 border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-gray-800 font-medium">{formatHarga(detailData.harga)}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">📊 Fee</label>
                  <p className="border-2 border-gray-200 px-4 py-3 rounded-lg bg-gray-50 text-gray-800 font-medium">{getFeeByCategory(detailData.category)}%</p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetail(false)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  ✕ Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default TreatmentKaryawan;
