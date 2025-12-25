import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const [searchActive, setSearchActive] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const notifications = [
    { id: 1, message: "5 absensi perlu disetujui", time: "5 menit yang lalu", read: false },
    { id: 2, message: "Slip gaji bulan Desember sudah siap", time: "1 jam yang lalu", read: true },
  ];

  const navigate = useNavigate();
  const location = useLocation();

  const baseForCurrent = () => (location.pathname.startsWith("/admin") ? "/admin" : "/karyawan");

  const goTo = (slug) => {
    const base = baseForCurrent();
    navigate(`${base}/${slug}`);
    setShowProfile(false);
    setShowNotifications(false);
  };

  const handleLogout = () => {
    // open confirmation modal
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowProfile(false);
    localStorage.removeItem('karyawanLoggedIn');
    localStorage.removeItem('karyawanEmail');
    localStorage.removeItem('rememberEmail');
    setShowLogoutModal(false);
    navigate('/login', { replace: true });
  };

  return (
    <header className="flex items-center justify-between bg-white shadow-sm px-6 py-4 rounded-md">
      <div className="flex items-center space-x-3 flex-1">
        <button className="p-2 rounded-md hover:bg-gray-100 transition">
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="text-lg font-semibold text-gray-800">Dashboard</div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Search */}
        <div className="relative hidden md:block">
          <div className="flex items-center">
            <input
              placeholder="Cari karyawan, gaji..."
              onFocus={() => setSearchActive(true)}
              onBlur={() => setSearchActive(false)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-72 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
            />
            <svg className="absolute left-3 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notifications.some(n => !n.read) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Notifikasi</h3>
              </div>
              <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {notifications.map(notif => (
                  <li
                    key={notif.id}
                    className={`p-4 hover:bg-gray-50 transition cursor-pointer ${notif.read ? '' : 'bg-pink-50'}`}
                  >
                    <p className="text-sm text-gray-700">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-gray-800">Admin User</div>
              <div className="text-xs text-gray-500">Administrator</div>
            </div>
            <svg className={`w-4 h-4 text-gray-600 transition ${showProfile ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">demara.hr@example.com</p>
              </div>
              <ul className="divide-y divide-gray-100">
                <li>
                  <button onClick={() => goTo('profile')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                    ⚙️ Pengaturan Profil
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('security')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                    🔒 Keamanan
                  </button>
                </li>
                <li>
                  <button onClick={() => goTo('help')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                    ❓ Bantuan
                  </button>
                </li>
                <li>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition font-medium">
                    🚪 Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)}>
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Keluar</h3>
                <p className="text-sm text-gray-600 mt-2">Apakah Anda yakin ingin keluar dari akun ini?</p>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">Batal</button>
                <button onClick={confirmLogout} className="px-4 py-2 bg-gray-800 text-white rounded-lg">Keluar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
