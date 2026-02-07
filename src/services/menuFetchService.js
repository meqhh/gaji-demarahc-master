import { REACT_APP_API_URL } from '../config/api';

const API_BASE = `${REACT_APP_API_URL || 'http://localhost:5000'}/api`;

/**
 * Menu Service - Frontend
 * Handles fetching and caching menus from backend
 */
class MenuFetchService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.isLoading = false;
    this.subscribers = [];
  }

  /**
   * Get token from localStorage
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Get auth headers
   */
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Check if cache is valid
   */
  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const isExpired = Date.now() - cached.timestamp > this.cacheTimeout;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get from cache
   */
  getFromCache(key) {
    if (this.isCacheValid(key)) {
      return this.cache.get(key).data;
    }
    return null;
  }

  /**
   * Set cache
   */
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Invalidate cache entry
   */
  invalidateCache(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Subscribe to menu updates
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify subscribers
   */
  notify(menus) {
    this.subscribers.forEach(callback => callback(menus));
  }

  /**
   * Fetch all menus (with cache)
   */
  async getAllMenus(forceRefresh = false) {
    const cacheKey = 'allMenus';

    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      this.isLoading = true;
      const response = await fetch(`${API_BASE}/menus`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch menus: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch menus');
      }

      this.setCache(cacheKey, data.data);
      this.notify(data.data);

      return data.data;
    } catch (error) {
      console.error('Error fetching menus:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get main menus only
   */
  async getMainMenus(forceRefresh = false) {
    const cacheKey = 'mainMenus';

    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      this.isLoading = true;
      const response = await fetch(`${API_BASE}/menus/main`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch main menus: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch menus');
      }

      this.setCache(cacheKey, data.data);
      return data.data;
    } catch (error) {
      console.error('Error fetching main menus:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get settings menus only
   */
  async getSettingsMenus(forceRefresh = false) {
    const cacheKey = 'settingsMenus';

    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      this.isLoading = true;
      const response = await fetch(`${API_BASE}/menus/settings`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch settings menus: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch menus');
      }

      this.setCache(cacheKey, data.data);
      return data.data;
    } catch (error) {
      console.error('Error fetching settings menus:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Get menu by id
   */
  async getMenuById(menuId, forceRefresh = false) {
    const cacheKey = `menu_${menuId}`;

    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await fetch(`${API_BASE}/menus/${menuId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied to this menu');
        }
        if (response.status === 404) {
          throw new Error('Menu not found');
        }
        throw new Error(`Failed to fetch menu: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch menu');
      }

      this.setCache(cacheKey, data.data);
      return data.data;
    } catch (error) {
      console.error(`Error fetching menu ${menuId}:`, error);
      throw error;
    }
  }

  /**
   * Check permission for menu action
   */
  async checkPermission(menuId, action = 'view') {
    try {
      const response = await fetch(`${API_BASE}/menus/${menuId}/permission/${action}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to check permission: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to check permission');
      }

      return data.data.hasPermission;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Get related menus
   */
  async getRelatedMenus(menuId, forceRefresh = false) {
    const cacheKey = `relatedMenus_${menuId}`;

    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await fetch(`${API_BASE}/menus/${menuId}/related`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch related menus: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch related menus');
      }

      this.setCache(cacheKey, data.data);
      return data.data;
    } catch (error) {
      console.error('Error fetching related menus:', error);
      return [];
    }
  }

  /**
   * Get permission matrix
   */
  async getPermissionMatrix(forceRefresh = false) {
    const cacheKey = 'permissionMatrix';

    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await fetch(`${API_BASE}/menus/permissions/matrix`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch permission matrix: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch permissions');
      }

      this.setCache(cacheKey, data.data);
      return data.data;
    } catch (error) {
      console.error('Error fetching permission matrix:', error);
      throw error;
    }
  }

  /**
   * Get API endpoint configuration
   */
  async getApiEndpoint(resource) {
    const cacheKey = `apiEndpoint_${resource}`;

    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await fetch(`${API_BASE}/menus/api-endpoints/${resource}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch API endpoint: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch endpoint');
      }

      this.setCache(cacheKey, data.data);
      return data.data;
    } catch (error) {
      console.error(`Error fetching endpoint for ${resource}:`, error);
      throw error;
    }
  }

  /**
   * Get sync configuration
   */
  async getSyncConfig(forceRefresh = false) {
    const cacheKey = 'syncConfig';

    if (!forceRefresh) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await fetch(`${API_BASE}/menus/sync-config`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sync config: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch sync config');
      }

      this.setCache(cacheKey, data.data);
      return data.data;
    } catch (error) {
      console.error('Error fetching sync config:', error);
      throw error;
    }
  }

  /**
   * Refresh all menus
   */
  async refreshAllMenus() {
    this.clearCache();
    return this.getAllMenus(true);
  }
}

// Singleton instance
const menuFetchService = new MenuFetchService();

export default menuFetchService;
