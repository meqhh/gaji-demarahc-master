import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMainMenus, useSettingsMenus, useMenuPermission } from '../hooks/useMenuHooks';
import * as Icons from 'lucide-react';

/**
 * Icon Component
 * Maps icon names to actual icon components
 */
const IconComponent = ({ iconName, className = 'w-5 h-5' }) => {
  if (!iconName) return null;

  // Map icon names to lucide-react icons
  const iconMap = {
    'LayoutDashboard': 'LayoutDashboard',
    'Users': 'Users',
    'Clock': 'Clock',
    'Calendar': 'Calendar',
    'DollarSign': 'DollarSign',
    'FileText': 'FileText',
    'Stethoscope': 'Stethoscope',
    'User': 'User',
    'Lock': 'Lock',
    'HelpCircle': 'HelpCircle',
    'LogOut': 'LogOut',
    'Menu': 'Menu',
    'X': 'X'
  };

  const mappedIcon = iconMap[iconName] || iconName;
  const Icon = Icons[mappedIcon];

  if (!Icon) {
    console.warn(`Icon not found: ${iconName}`);
    return <div className={`${className} bg-gray-300 rounded`} />;
  }

  return <Icon className={className} />;
};

/**
 * Menu Item Component
 */
const MenuItem = ({ menu, isActive, isSettings = false }) => {
  const { hasPermission, loading } = useMenuPermission(menu.id, 'view');

  if (loading) {
    return null;
  }

  if (!hasPermission) {
    return null;
  }

  return (
    <Link
      to={menu.path}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      title={menu.metadata?.description}
    >
      <IconComponent iconName={menu.icon} className="w-5 h-5" />
      <span className="text-sm font-medium">{menu.label}</span>
      {menu.metadata?.new && (
        <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
          Baru
        </span>
      )}
    </Link>
  );
};

/**
 * Dynamic Sidebar Component
 * Renders menus from backend configuration
 */
export const DynamicSidebar = ({ isOpen = true, onClose = null, variant = 'admin' }) => {
  const location = useLocation();
  const { mainMenus, loading: mainLoading, error: mainError } = useMainMenus();
  const { settingsMenus, loading: settingsLoading, error: settingsError } = useSettingsMenus();

  const isLoading = mainLoading || settingsLoading;
  const hasError = mainError || settingsError;

  if (hasError) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="text-red-600 text-sm">
          <p className="font-bold mb-2">Error memuat menu</p>
          <p className="text-xs">{mainError || settingsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      ${isOpen ? 'w-64' : 'w-0'} 
      bg-white border-r border-gray-200 
      overflow-y-auto transition-all duration-300
      flex flex-col
    `}>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h2 className="font-bold text-lg">
          {variant === 'admin' ? 'Admin Panel' : 'Menu'}
        </h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="md:hidden p-1 hover:bg-gray-100 rounded"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Menus */}
      <nav className="flex-1 p-4">
        <div className="mb-6">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : mainMenus && mainMenus.length > 0 ? (
            <div className="space-y-2">
              {mainMenus.map(menu => (
                <MenuItem
                  key={menu.id}
                  menu={menu}
                  isActive={location.pathname === menu.path}
                  isSettings={false}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Tidak ada menu utama</p>
          )}
        </div>

        {/* Divider */}
        {settingsMenus && settingsMenus.length > 0 && (
          <div className="border-t border-gray-200 my-4" />
        )}

        {/* Settings Menus */}
        {isLoading ? null : settingsMenus && settingsMenus.length > 0 ? (
          <div className="space-y-2">
            {settingsMenus.map(menu => (
              <MenuItem
                key={menu.id}
                menu={menu}
                isActive={location.pathname === menu.path}
                isSettings={true}
              />
            ))}
          </div>
        ) : null}
      </nav>

      {/* Footer Info */}
      <div className="border-t border-gray-200 p-4 text-xs text-gray-500">
        <p className="mb-2">Versi Sistem: 1.0.0</p>
        <p>Data real-time dari backend</p>
      </div>
    </div>
  );
};

/**
 * Export
 */
export default DynamicSidebar;
