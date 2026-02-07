import { useEffect, useState, useCallback, useContext } from 'react';
import menuFetchService from '../services/menuFetchService';
import { AppContext } from '../context/AppContext';
import { MENU_CONFIG, ERROR_MESSAGES } from '../config/api';

/**
 * Hook: useMenus
 * Fetch and manage all menus for the authenticated user
 */
export const useMenus = (forceRefresh = false) => {
  const [menus, setMenus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await menuFetchService.getAllMenus(forceRefresh);
        setMenus(data);
      } catch (err) {
        setError(err.message || ERROR_MESSAGES.MENU_LOAD_ERROR);
        console.error('Error loading menus:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();

    // Subscribe to menu updates
    const unsubscribe = menuFetchService.subscribe((updatedMenus) => {
      setMenus(updatedMenus);
    });

    return unsubscribe;
  }, [forceRefresh]);

  const refetch = useCallback(() => {
    menuFetchService.refreshAllMenus();
  }, []);

  const invalidateCache = useCallback(() => {
    menuFetchService.clearCache();
  }, []);

  return {
    menus,
    loading,
    error,
    refetch,
    invalidateCache,
    hasMenus: menus?.mainMenus?.length > 0 || menus?.settingsMenus?.length > 0
  };
};

/**
 * Hook: useMainMenus
 * Fetch only main menus
 */
export const useMainMenus = (forceRefresh = false) => {
  const [mainMenus, setMainMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await menuFetchService.getMainMenus(forceRefresh);
        setMainMenus(data || []);
      } catch (err) {
        setError(err.message || ERROR_MESSAGES.MENU_LOAD_ERROR);
        console.error('Error loading main menus:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, [forceRefresh]);

  const refetch = useCallback(() => {
    menuFetchService.getMainMenus(true);
  }, []);

  return {
    mainMenus,
    loading,
    error,
    refetch
  };
};

/**
 * Hook: useSettingsMenus
 * Fetch only settings menus
 */
export const useSettingsMenus = (forceRefresh = false) => {
  const [settingsMenus, setSettingsMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await menuFetchService.getSettingsMenus(forceRefresh);
        setSettingsMenus(data || []);
      } catch (err) {
        setError(err.message || ERROR_MESSAGES.MENU_LOAD_ERROR);
        console.error('Error loading settings menus:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, [forceRefresh]);

  const refetch = useCallback(() => {
    menuFetchService.getSettingsMenus(true);
  }, []);

  return {
    settingsMenus,
    loading,
    error,
    refetch
  };
};

/**
 * Hook: useMenuById
 * Fetch a specific menu by id
 */
export const useMenuById = (menuId, forceRefresh = false) => {
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!menuId) {
      setLoading(false);
      return;
    }

    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await menuFetchService.getMenuById(menuId, forceRefresh);
        setMenu(data);
      } catch (err) {
        setError(err.message || ERROR_MESSAGES.MENU_NOT_FOUND);
        console.error(`Error loading menu ${menuId}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [menuId, forceRefresh]);

  const refetch = useCallback(() => {
    if (menuId) {
      menuFetchService.getMenuById(menuId, true);
    }
  }, [menuId]);

  return {
    menu,
    loading,
    error,
    refetch
  };
};

/**
 * Hook: useMenuPermission
 * Check if user has permission for a menu action
 */
export const useMenuPermission = (menuId, action = 'view') => {
  const [hasPermission, setHasPermission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!menuId) {
      setLoading(false);
      return;
    }

    const checkPermission = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await menuFetchService.checkPermission(menuId, action);
        setHasPermission(result);
      } catch (err) {
        setError(err.message);
        setHasPermission(false);
        console.error('Error checking permission:', err);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [menuId, action]);

  return {
    hasPermission,
    loading,
    error,
    canView: hasPermission === true && action === 'view',
    canCreate: hasPermission === true && action === 'create',
    canEdit: hasPermission === true && action === 'edit',
    canDelete: hasPermission === true && action === 'delete'
  };
};

/**
 * Hook: useRelatedMenus
 * Get menus related to a specific menu
 */
export const useRelatedMenus = (menuId, forceRefresh = false) => {
  const [relatedMenus, setRelatedMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!menuId) {
      setLoading(false);
      return;
    }

    const fetchRelated = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await menuFetchService.getRelatedMenus(menuId, forceRefresh);
        setRelatedMenus(data || []);
      } catch (err) {
        setError(err.message);
        console.error('Error loading related menus:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [menuId, forceRefresh]);

  return {
    relatedMenus,
    loading,
    error,
    hasRelated: relatedMenus.length > 0
  };
};

/**
 * Hook: useMenuPermissions
 * Get permission matrix for the current user
 */
export const useMenuPermissions = () => {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await menuFetchService.getPermissionMatrix();
        setPermissions(data);
      } catch (err) {
        setError(err.message);
        console.error('Error loading permissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  return {
    permissions,
    loading,
    error,
    getResourcePermissions: (resource) => permissions?.permissions?.[resource] || []
  };
};

/**
 * Hook: useApiEndpoint
 * Get API endpoint configuration for a resource
 */
export const useApiEndpoint = (resource) => {
  const [endpoint, setEndpoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!resource) {
      setLoading(false);
      return;
    }

    const fetchEndpoint = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await menuFetchService.getApiEndpoint(resource);
        setEndpoint(data);
      } catch (err) {
        setError(err.message);
        console.error(`Error loading endpoint for ${resource}:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchEndpoint();
  }, [resource]);

  return {
    endpoint,
    loading,
    error,
    baseUrl: endpoint?.baseUrl,
    methods: endpoint?.methods
  };
};

/**
 * Hook: useSyncConfig
 * Get sync configuration
 */
export const useSyncConfig = () => {
  const [syncConfig, setSyncConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await menuFetchService.getSyncConfig();
        setSyncConfig(data);
      } catch (err) {
        setError(err.message);
        console.error('Error loading sync config:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return {
    syncConfig,
    loading,
    error,
    isSyncEnabled: syncConfig?.enabled === true
  };
};

/**
 * Hook: useMenuNavigation
 * Get menu navigation information for current route
 */
export const useMenuNavigation = (currentPath) => {
  const [currentMenu, setCurrentMenu] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { menus } = useMenus();

  useEffect(() => {
    if (!menus || !currentPath) {
      setLoading(false);
      return;
    }

    // Find current menu
    const allMenus = [...(menus?.mainMenus || []), ...(menus?.settingsMenus || [])];
    const found = allMenus.find(m => m.path === currentPath);
    setCurrentMenu(found || null);

    // Build breadcrumbs
    const crumbs = [];
    if (menus?.role) {
      crumbs.push({
        label: menus.role === 'admin' ? 'Admin' : 'Dashboard',
        path: menus.role === 'admin' ? '/admin' : '/karyawan'
      });
    }
    if (found) {
      crumbs.push({
        label: found.label,
        path: found.path
      });
    }
    setBreadcrumbs(crumbs);

    setLoading(false);
  }, [menus, currentPath]);

  return {
    currentMenu,
    breadcrumbs,
    loading,
    error
  };
};

/**
 * Hook: useMenuComponent
 * Get the component for a menu item
 */
export const useMenuComponent = (menuId) => {
  const [component, setComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { menu } = useMenuById(menuId);

  useEffect(() => {
    if (menu?.component) {
      try {
        setLoading(true);
        // Component name is provided, actual component loading happens in routing
        setComponent(menu.component);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error loading component:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [menu]);

  return {
    component,
    loading,
    error
  };
};
