/**
 * Navigation Service - Mengelola navigasi dinamis antara Admin dan Karyawan
 * Menggunakan menu_config.json sebagai single source of truth
 */

import menuConfig from '../config/menu_config.json';

class NavigationService {
  constructor() {
    this.config = menuConfig;
    this.currentRole = null;
    this.syncListeners = [];
  }

  /**
   * Set role saat ini (admin/karyawan)
   */
  setRole(role) {
    this.currentRole = role;
  }

  /**
   * Dapatkan menu untuk role tertentu
   */
  getMenuForRole(role = this.currentRole) {
    if (!role) return null;
    return this.config.menus[role] || null;
  }

  /**
   * Dapatkan semua menu utama
   */
  getMainMenu(role = this.currentRole) {
    const menus = this.getMenuForRole(role);
    return menus ? menus.mainMenu : [];
  }

  /**
   * Dapatkan semua menu settings
   */
  getSettingsMenu(role = this.currentRole) {
    const menus = this.getMenuForRole(role);
    return menus ? menus.settingsMenu : [];
  }

  /**
   * Dapatkan menu item berdasarkan ID
   */
  getMenuItemById(id, role = this.currentRole) {
    const menus = this.getMenuForRole(role);
    if (!menus) return null;

    const mainItem = menus.mainMenu.find(m => m.id === id);
    if (mainItem) return mainItem;

    const settingsItem = menus.settingsMenu.find(m => m.id === id);
    return settingsItem || null;
  }

  /**
   * Dapatkan menu item berdasarkan path
   */
  getMenuItemByPath(path) {
    for (const role of ['admin', 'karyawan']) {
      const menus = this.getMenuForRole(role);
      if (!menus) continue;

      const mainItem = menus.mainMenu.find(m => m.path === path);
      if (mainItem) return mainItem;

      const settingsItem = menus.settingsMenu.find(m => m.path === path);
      if (settingsItem) return settingsItem;
    }
    return null;
  }

  /**
   * Dapatkan path menu yang terhubung dengan menu lain
   */
  getRelatedPath(fromPath, role = this.currentRole) {
    const menuItem = this.getMenuItemByPath(fromPath);
    if (!menuItem) return null;

    if (role === 'admin' && menuItem.relatedKaryawanPath) {
      return menuItem.relatedKaryawanPath;
    }
    if (role === 'karyawan' && menuItem.relatedAdminPath) {
      return menuItem.relatedAdminPath;
    }
    return null;
  }

  /**
   * Cek apakah role memiliki akses ke menu tertentu
   */
  hasAccessToMenu(menuId, role = this.currentRole) {
    const menuItem = this.getMenuItemById(menuId, role);
    if (!menuItem) return false;

    return menuItem.requiredRole.includes(role);
  }

  /**
   * Cek permission untuk operasi tertentu
   */
  hasPermission(menuId, action, role = this.currentRole) {
    const menuItem = this.getMenuItemById(menuId, role);
    if (!menuItem || !menuItem.permissions) return false;

    return menuItem.permissions[action] === true;
  }

  /**
   * Dapatkan semua menu yang tersinkronisasi
   */
  getSyncMenus(menuId, role = this.currentRole) {
    const menuItem = this.getMenuItemById(menuId, role);
    if (!menuItem) return [];

    return menuItem.syncWith || [];
  }

  /**
   * Filter menu berdasarkan permissions
   */
  filterMenuByPermission(menus, action, role = this.currentRole) {
    return menus.filter(menu => {
      return !menu.permissions || menu.permissions[action] !== false;
    });
  }

  /**
   * Dapatkan struktur navigasi lengkap
   */
  getCompleteNavigation(role = this.currentRole) {
    const menus = this.getMenuForRole(role);
    if (!menus) return null;

    return {
      mainMenu: menus.mainMenu.map(item => ({
        id: item.id,
        label: item.label,
        path: item.path,
        icon: item.icon,
        description: item.description,
        syncWith: item.syncWith || []
      })),
      settingsMenu: menus.settingsMenu.map(item => ({
        id: item.id,
        label: item.label,
        path: item.path,
        icon: item.icon,
        description: item.description
      }))
    };
  }

  /**
   * Validasi path untuk role tertentu
   */
  isValidPathForRole(path, role = this.currentRole) {
    const menuItem = this.getMenuItemByPath(path);
    if (!menuItem) return false;

    return menuItem.requiredRole.includes(role);
  }

  /**
   * Subscribe ke perubahan (untuk real-time sync)
   */
  subscribe(callback) {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Broadcast perubahan ke semua listeners
   */
  notifySync(menuId, data) {
    const menuItem = this.getMenuItemById(menuId);
    if (!menuItem) return;

    this.syncListeners.forEach(callback => {
      callback({
        menuId,
        syncWith: menuItem.syncWith || [],
        data,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Dapatkan breadcrumb navigation
   */
  getBreadcrumb(path) {
    const menuItem = this.getMenuItemByPath(path);
    if (!menuItem) return [];

    const role = this.currentRole;
    return [
      {
        label: role === 'admin' ? 'Dashboard Admin' : 'Dashboard Karyawan',
        path: role === 'admin' ? '/admin/dashboard' : '/karyawan/dashboard'
      },
      {
        label: menuItem.label,
        path: menuItem.path
      }
    ];
  }

  /**
   * Export semua menu untuk keperluan debugging
   */
  exportMenuConfig() {
    return JSON.parse(JSON.stringify(this.config));
  }
}

// Export singleton instance
export default new NavigationService();
