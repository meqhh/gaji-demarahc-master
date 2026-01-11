import React from "react";
import { NavLink } from "react-router-dom";
import Logo from "../Images/demaralogo.png";

function SidebarAdmin() {
  const linkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-150 font-medium text-sm ${
      isActive 
        ? 'bg-[#CC45DE] text-white shadow-md' 
        : 'text-gray-700 hover:bg-[#CC45DE] hover:text-white'
    }`;

  const menuItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="11" width="4" height="8" rx="1" />
          <rect x="10" y="7" width="4" height="12" rx="1" />
          <rect x="17" y="3" width="4" height="16" rx="1" />
        </svg>
      ),
    },
    {
      path: '/admin/karyawan',
      label: 'Data Karyawan',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="9" cy="8" r="3" />
          <path d="M2 20c1.5-4 6-6 10-6s8.5 2 10 6" />
        </svg>
      ),
    },
    {
      path: '/admin/gaji',
      label: 'Gaji',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M8 9h8M8 15h8M12 6v-2" />
        </svg>
      ),
    },
    {
      path: '/admin/absensi',
      label: 'Absensi',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M8 2v4M16 2v4" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
    {
      path: '/admin/cuti',
      label: 'Cuti Karyawan',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M8 2v4M16 2v4" />
          <path d="M3 10h18" />
        </svg>
      ),
    },
    {
      path: '/admin/slip-gaji',
      label: 'Slip Gaji',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="4" y="3" width="14" height="18" rx="2" />
          <path d="M8 7h6M8 11h8M8 15h6" />
        </svg>
      ),
    },
    {
      path: '/admin/treatment',
      label: 'Treatment',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8" />
          <path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
    },
  ];



  return (
    <aside className="w-60 bg-gradient-to-b from-pink-100 to-purple-50 p-5 min-h-screen flex flex-col shadow-lg border-r-2 border-pink-200 fixed left-0 top-0 bottom-0">
      {/* Logo Section */}
      <div className="flex flex-col items-center pb-5 border-b-2 border-pink-300">
        <img src={Logo} alt="Logo" className="w-32 h-auto mb-2" />
        <h1 className="text-center text-xs font-bold text-gray-800 uppercase tracking-wide">Demara Admin</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-7 flex-1">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink to={item.path} className={linkClass}>
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer Info */}
      <div className="pt-5 border-t-2 border-pink-300">
        {/* Copyright */}
        <div className="bg-white bg-opacity-70 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-700 font-bold">Admin Panel</p>
          <p className="text-xs text-gray-500 mt-1">© {new Date().getFullYear()} Demara</p>
        </div>
      </div>
    </aside>
  );
}

export default SidebarAdmin;
