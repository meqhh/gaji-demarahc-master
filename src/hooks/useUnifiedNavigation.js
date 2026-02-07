/**
 * Custom Hooks untuk unified navigation, RBAC, dan data sync
 */

import { useContext, useEffect, useState, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import navigationService from './navigationService';
import dataSyncService from './dataSyncService';

/**
 * Hook untuk RBAC (Role-Based Access Control)
 */
export const useRBAC = () => {
  const { userProfile } = useContext(AppContext);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (userProfile?.role) {
      setRole(userProfile.role);
      navigationService.setRole(userProfile.role);
    }
  }, [userProfile]);

  const hasPermission = (menuId, action) => {
    return navigationService.hasPermission(menuId, action, role);
  };

  const hasAccessToMenu = (menuId) => {
    return navigationService.hasAccessToMenu(menuId, role);
  };

  const isAdmin = () => role === 'admin';
  const isKaryawan = () => role === 'karyawan';

  return {
    role,
    hasPermission,
    hasAccessToMenu,
    isAdmin,
    isKaryawan
  };
};

/**
 * Hook untuk navigasi dinamis
 */
export const useNavigation = () => {
  const { userProfile } = useContext(AppContext);
  const [mainMenu, setMainMenu] = useState([]);
  const [settingsMenu, setSettingsMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.role) {
      navigationService.setRole(userProfile.role);
      setMainMenu(navigationService.getMainMenu(userProfile.role));
      setSettingsMenu(navigationService.getSettingsMenu(userProfile.role));
      setLoading(false);
    }
  }, [userProfile?.role]);

  const getMenuItemById = (id) => {
    return navigationService.getMenuItemById(id, userProfile?.role);
  };

  const getRelatedPath = (path) => {
    return navigationService.getRelatedPath(path, userProfile?.role);
  };

  const isValidPath = (path) => {
    return navigationService.isValidPathForRole(path, userProfile?.role);
  };

  const getBreadcrumb = (path) => {
    return navigationService.getBreadcrumb(path);
  };

  return {
    mainMenu,
    settingsMenu,
    loading,
    getMenuItemById,
    getRelatedPath,
    isValidPath,
    getBreadcrumb
  };
};

/**
 * Hook untuk sinkronisasi data
 */
export const useDataSync = (dataSourceId, options = {}) => {
  const { userProfile } = useContext(AppContext);
  const token = localStorage.getItem('token');
  
  const {
    autoFetch = true,
    forceRefresh = false,
    autoSyncInterval = 30000
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCached, setIsCached] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!token || !dataSourceId) return;

    try {
      setLoading(true);
      const result = await dataSyncService.fetchData(
        dataSourceId,
        token,
        forceRefresh
      );

      setData(result.data);
      setIsCached(result.cached);
      setLastSync(result.timestamp);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, dataSourceId, forceRefresh]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && token) {
      fetchData();
    }
  }, [autoFetch, token, fetchData]);

  // Subscribe ke perubahan data
  useEffect(() => {
    if (!dataSourceId) return;

    const unsubscribe = dataSyncService.subscribe(dataSourceId, (syncData) => {
      setData(syncData.data);
      setLastSync(syncData.timestamp);
    });

    return unsubscribe;
  }, [dataSourceId]);

  // Setup auto-sync
  useEffect(() => {
    if (!autoFetch || !token) return;

    const stopAutoSync = dataSyncService.setupAutoSync(
      dataSourceId,
      token,
      autoSyncInterval
    );

    return stopAutoSync;
  }, [autoFetch, token, dataSourceId, autoSyncInterval]);

  const refetch = () => fetchData();

  const invalidateCache = () => {
    dataSyncService.invalidateCache(dataSourceId);
    refetch();
  };

  return {
    data,
    loading,
    error,
    isCached,
    lastSync,
    refetch,
    invalidateCache
  };
};

/**
 * Hook untuk update data dengan sinkronisasi
 */
export const useDataUpdate = () => {
  const { userProfile } = useContext(AppContext);
  const token = localStorage.getItem('token');

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const updateData = useCallback(async (
    dataSourceId,
    dataId,
    newData
  ) => {
    if (!token) {
      setUpdateError('Token tidak ditemukan');
      return false;
    }

    try {
      setUpdating(true);
      await dataSyncService.updateData(
        dataSourceId,
        dataId,
        newData,
        token,
        userProfile?.role
      );
      setUpdateError(null);
      return true;
    } catch (err) {
      setUpdateError(err.message);
      return false;
    } finally {
      setUpdating(false);
    }
  }, [token, userProfile?.role]);

  return {
    updateData,
    updating,
    updateError
  };
};

/**
 * Hook untuk menu synchronization antara Admin dan Karyawan
 */
export const useSyncedMenu = (menuId) => {
  const { userProfile } = useContext(AppContext);
  const [relatedMenus, setRelatedMenus] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    if (!menuId || !userProfile?.role) return;

    const menus = navigationService.getSyncMenus(menuId, userProfile.role);
    setRelatedMenus(menus);

    // Subscribe ke sync notifications
    const unsubscribe = navigationService.subscribe((syncData) => {
      if (syncData.menuId === menuId) {
        setSyncStatus(syncData);
      }
    });

    return unsubscribe;
  }, [menuId, userProfile?.role]);

  const getSyncStatus = () => dataSyncService.getSyncStatus();

  return {
    relatedMenus,
    syncStatus,
    getSyncStatus
  };
};

/**
 * Hook untuk breadcrumb navigation
 */
export const useBreadcrumb = (currentPath) => {
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  useEffect(() => {
    if (currentPath) {
      const crumbs = navigationService.getBreadcrumb(currentPath);
      setBreadcrumbs(crumbs);
    }
  }, [currentPath]);

  return breadcrumbs;
};

/**
 * Hook untuk loading indikator sinkronisasi
 */
export const useSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;

    const updateStatus = () => {
      setSyncStatus(dataSyncService.getSyncStatus());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, [token]);

  const isSyncing = syncStatus && (
    syncStatus.dirtyItems?.length > 0 ||
    syncStatus.retryQueueSize > 0
  );

  const isOffline = syncStatus && !syncStatus.isOnline;

  return {
    syncStatus,
    isSyncing,
    isOffline
  };
};
