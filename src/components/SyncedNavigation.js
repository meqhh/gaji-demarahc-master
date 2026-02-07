/**
 * Synced Navigation Component - Komponen untuk menampilkan menu dengan sinkronisasi otomatis
 */

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  useNavigation,
  useRBAC,
  useSyncStatus
} from '../hooks/useUnifiedNavigation';

/**
 * Synced Sidebar Component
 */
export const SyncedSidebar = ({ variant = 'admin' }) => {
  const location = useLocation();
  const { mainMenu, settingsMenu, loading } = useNavigation();
  const { role, hasAccessToMenu } = useRBAC();
  const { isSyncing, isOffline } = useSyncStatus();

  const getIconComponent = (iconName) => {
    // Map icon names ke SVG
    const icons = {
      'chart-bar': (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="11" width="4" height="8" rx="1" />
          <rect x="10" y="7" width="4" height="12" rx="1" />
          <rect x="17" y="3" width="4" height="16" rx="1" />
        </svg>
      ),
      'users': (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="9" cy="8" r="3" />
          <path d="M2 20c1.5-4 6-6 10-6s8.5 2 10 6" />
          <circle cx="18" cy="8" r="3" />
          <path d="M14 20c0-2.5 2-4 4-4" />
        </svg>
      ),
      'money': (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 6v12M9 9h6a2 2 0 012 2v2a2 2 0 01-2 2H9" />
        </svg>
      ),
      'calendar': (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ),
      'document': (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
      'calendar-x': (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
          <path d="M9 13l6 6M15 13l-6 6" />
        </svg>
      ),
      'heart': (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
      'user': (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="3" />
          <path d="M6 21v-2a6 6 0 016-6h6a6 6 0 016 6v2" />
        </svg>
      ),
      'user-circle': (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="10" r="3" />
          <path d="M8 18c0-1.66 2.24-3 4-3s4 1.34 4 3" />
        </svg>
      ),
      'lock': (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      ),
      'help-circle': (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
        </svg>
      )
    };

    return icons[iconName] || icons['chart-bar'];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>
    );
  }

  const linkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-150 font-medium text-sm ${
      isActive
        ? variant === 'admin'
          ? 'bg-gray-900 text-white shadow-md'
          : 'bg-[#CC45DE] text-white shadow-md'
        : variant === 'admin'
        ? 'text-gray-700 hover:bg-gray-100'
        : 'text-gray-700 hover:bg-[#CC45DE] hover:text-white'
    }`;

  const filteredMainMenu = mainMenu.filter(item => hasAccessToMenu(item.id));
  const filteredSettingsMenu = settingsMenu.filter(item => hasAccessToMenu(item.id));

  return (
    <aside className={`w-60 bg-white border-r border-gray-200 flex flex-col h-screen overflow-y-auto ${
      variant === 'admin' ? 'shadow-md' : ''
    }`}>
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">
          {variant === 'admin' ? 'Admin' : 'Karyawan'}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {role === 'admin' ? 'Akses Penuh' : 'Data Pribadi'}
        </p>
      </div>

      {/* Main Menu */}
      <div className="flex-1 px-4 py-6 space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-4 mb-4">
          Menu Utama
        </h3>
        {filteredMainMenu.map(item => (
          <Link
            key={item.id}
            to={item.path}
            className={linkClass({ isActive: location.pathname === item.path })}
            title={item.description}
          >
            <div className="flex-shrink-0 text-gray-600">
              {getIconComponent(item.icon)}
            </div>
            <span className="flex-1">{item.label}</span>
            {item.syncWith?.length > 0 && (
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" title="Tersinkronisasi" />
            )}
          </Link>
        ))}
      </div>

      <hr className="my-2 border-gray-200" />

      {/* Settings Menu */}
      <div className="px-4 py-6 space-y-2 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-4 mb-4">
          Pengaturan
        </h3>
        {filteredSettingsMenu.map(item => (
          <Link
            key={item.id}
            to={item.path}
            className={linkClass({ isActive: location.pathname === item.path })}
            title={item.description}
          >
            <div className="flex-shrink-0 text-gray-600">
              {getIconComponent(item.icon)}
            </div>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Sync Status */}
      <div className="px-4 py-3 border-t border-gray-200 space-y-2">
        {isSyncing && (
          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded">
            <div className="animate-spin w-3 h-3">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="1" />
              </svg>
            </div>
            <span>Sinkronisasi...</span>
          </div>
        )}
        {isOffline && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
            </svg>
            <span>Offline</span>
          </div>
        )}
      </div>
    </aside>
  );
};

/**
 * Sync Status Indicator Component
 */
export const SyncStatusIndicator = () => {
  const { syncStatus, isSyncing, isOffline } = useSyncStatus();

  if (!syncStatus) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOffline ? (
        <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
          </svg>
          <span className="text-sm font-medium">Mode Offline</span>
        </div>
      ) : isSyncing ? (
        <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin w-4 h-4">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1" />
            </svg>
          </div>
          <span className="text-sm font-medium">Sinkronisasi Data...</span>
        </div>
      ) : null}
    </div>
  );
};

/**
 * Breadcrumb Component
 */
export const SyncedBreadcrumb = ({ path }) => {
  const breadcrumbs = require('../hooks/useUnifiedNavigation').useBreadcrumb(path);

  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span>/</span>}
          <Link
            to={crumb.path}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            {crumb.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default SyncedSidebar;
