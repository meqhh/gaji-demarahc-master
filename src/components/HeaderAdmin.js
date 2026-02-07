import React, { useState, useRef, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

function HeaderAdmin() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { userProfile } = useContext(AppContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // User data dari context - tanpa data dummy
  const adminUser = {
    name: userProfile?.nama || "",
    email: userProfile?.email || "",
    position: "Admin",
    department: userProfile?.department || "",
    // Foto profil - dari context atau default
    photo: userProfile?.photo || `https://ui-avatars.com/api/?name=${userProfile?.nama || "User"}&background=6366F1&color=fff&bold=true&size=128`
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    setShowLogoutModal(false);
    navigate('/login', { replace: true });
  };

  // Close dropdown ketika klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <header className="fixed top-0 left-60 right-0 bg-gradient-to-r from-white to-gray-50 shadow-lg z-40 h-16 flex items-center justify-between px-8 border-b border-gray-200">
      <div className="text-sm text-gray-600">
        <span className="font-semibold text-gray-800">
          {adminUser.name ? `Selamat datang, ${adminUser.name}` : "Selamat datang"}
        </span>
      </div>

      <div className="relative" ref={dropdownRef}>
        {/* Dropdown Toggle Button - Profile Avatar */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-all duration-300 group"
          title={adminUser.name || "Admin Panel"}
        >
          {/* Profile Avatar with Photo */}
          <img 
            src={adminUser.photo} 
            alt={adminUser.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-300 group-hover:border-gray-400 transition-all shadow-sm"
          />
          
          {/* Dropdown Icon */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-all transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-0 animate-slide-down z-50 overflow-hidden">
            
            {/* User Card Header - Enhanced */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-6">
              <div className="flex items-center gap-4">
                <img 
                  src={adminUser.photo}
                  alt={adminUser.name}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-md"
                />
                <div className="flex-1">
                  <p className="font-bold text-base text-gray-900">{adminUser.name}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{adminUser.position}</p>
                  {adminUser.department && <p className="text-xs text-gray-500 mt-1">{adminUser.department}</p>}
                  <p className="text-xs text-gray-400 mt-2">{adminUser.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items Section 1 */}
            <div className="px-0 py-2">
              {/* Pengaturan Profil */}
              <Link
                to="/admin/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors duration-150 text-gray-700 hover:text-gray-900 text-sm group border-l-2 border-transparent hover:border-gray-400"
              >
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Pengaturan Profil</p>
                  <p className="text-xs text-gray-500 mt-0.5">Kelola informasi akun Anda</p>
                </div>
              </Link>

              {/* Keamanan */}
              <Link
                to="/admin/security"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors duration-150 text-gray-700 hover:text-gray-900 text-sm group border-l-2 border-transparent hover:border-gray-400"
              >
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 1l-8 4v6c0 8 8 12 8 12s8-4 8-12V5l-8-4z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Keamanan</p>
                  <p className="text-xs text-gray-500 mt-0.5">Password & autentikasi</p>
                </div>
              </Link>

              {/* Bantuan & Dukungan */}
              <Link
                to="/admin/help"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors duration-150 text-gray-700 hover:text-gray-900 text-sm group border-l-2 border-transparent hover:border-gray-400"
              >
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9 9c0-1.657 1.343-3 3-3s3 1.343 3 3c0 1-0.5 1.5-1 2v2" />
                    <line x1="12" y1="19" x2="12" y2="20" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Bantuan & Dukungan</p>
                  <p className="text-xs text-gray-500 mt-0.5">FAQ dan panduan lengkap</p>
                </div>
              </Link>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200"></div>

            {/* Menu Items Section 2 */}
            <div className="px-0 py-2">
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors duration-150 text-gray-700 hover:text-gray-900 text-sm text-left group border-l-2 border-transparent hover:border-gray-400"
              >
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Keluar</p>
                  <p className="text-xs text-gray-500 mt-0.5">Logout dari panel admin</p>
                </div>
              </button>
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)}>
                <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Keluar dari Admin</h3>
                    <p className="text-sm text-gray-600 mt-2">Apakah Anda yakin ingin keluar dari panel admin?</p>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setShowLogoutModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">Batal</button>
                    <button onClick={confirmLogout} className="px-4 py-2 bg-gray-800 text-white rounded-lg">Keluar</button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Info */}
            <div className="bg-gray-50 border-t border-gray-200 px-5 py-3">
              <p className="text-xs text-gray-600 text-center">
                <span className="font-medium">Demara HR System</span> © {new Date().getFullYear()}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default HeaderAdmin;
