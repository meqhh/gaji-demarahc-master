import React, { useMemo } from 'react';
import { Route } from 'react-router-dom';
import DynamicComponentRenderer from './DynamicComponentRenderer';
import { useMenus, useMenuPermission } from '../hooks/useMenuHooks';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

/**
 * Dynamic Route Generator Component
 * Creates routes from backend menu configuration
 * 
 * Usage:
 * <DynamicRouteGenerator role="admin" parentPath="/admin" />
 */
export const DynamicRouteGenerator = ({ 
  role = 'admin', 
  parentPath = '/admin',
  layoutComponent = null
}) => {
  const { menus, loading, error } = useMenus();

  // Get menusfor the specified role
  const roleMenus = useMemo(() => {
    if (!menus) return { mainMenus: [], settingsMenus: [] };

    // Filter menus for this role
    const mainMenus = menus.mainMenus?.filter(m => m.permissions?.view) || [];
    const settingsMenus = menus.settingsMenus?.filter(m => m.permissions?.view) || [];

    return { mainMenus, settingsMenus };
  }, [menus]);

  // Create routes from menu items
  const routes = useMemo(() => {
    const allMenus = [...roleMenus.mainMenus, ...roleMenus.settingsMenus];

    return allMenus.map(menu => (
      <Route
        key={menu.id}
        path={menu.path.replace(parentPath + '/', '')}
        element={
          <PermissionGuard 
            menuId={menu.id} 
            componentName={menu.component}
          />
        }
      />
    ));
  }, [roleMenus, parentPath]);

  if (loading) {
    return <Route path="*" element={<div>Memuat menu...</div>} />;
  }

  if (error) {
    console.error('Error loading menus:', error);
  }

  return routes;
};

/**
 * Permission Guard Wrapper
 * Checks user permission before rendering component
 */
const PermissionGuard = ({ menuId, componentName }) => {
  const { hasPermission, loading: permLoading } = useMenuPermission(menuId, 'view');
  const { userProfile } = useContext(AppContext);

  if (permLoading) {
    return <div>Memeriksa izin akses...</div>;
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-red-800 font-bold">Akses Ditolak</h2>
          <p className="text-red-700">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return <DynamicComponentRenderer componentName={componentName} />;
};

/**
 * Dynamic Menu Router
 * Comprehensive router that handles both admin and karyawan routes
 */
export const DynamicMenuRouter = () => {
  const { menus, loading, error } = useMenus();

  if (loading) {
    return (
      <Routes>
        <Route path="*" element={<div>Memuat sistem menu...</div>} />
      </Routes>
    );
  }

  if (error) {
    return (
      <Routes>
        <Route path="*" element={<div>Error: {error}</div>} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/admin/*" element={<DynamicLayout role="admin" baseRoute="/admin" />} />
      <Route path="/karyawan/*" element={<DynamicLayout role="karyawan" baseRoute="/karyawan" />} />
    </Routes>
  );
};

/**
 * Dynamic Layout Component
 * Wraps dynamic routes with appropriate layout
 */
const DynamicLayout = ({ role, baseRoute }) => {
  const { menus, loading } = useMenus();

  if (loading) {
    return <div>Memuat layout...</div>;
  }

  // Import appropriate layout based on role
  const LayoutComponent = role === 'admin' ? require('../Layout/LayoutAdmin').default : require('../Layout/LayoutKaryawan').default;

  return (
    <LayoutComponent>
      <DynamicRouteGenerator 
        role={role} 
        parentPath={baseRoute}
      />
    </LayoutComponent>
  );
};

export default DynamicRouteGenerator;
