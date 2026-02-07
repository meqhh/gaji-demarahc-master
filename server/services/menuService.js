import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MENU_CONFIG_PATH = path.join(__dirname, '../data/menuConfig.json');

/**
 * Menu Service
 * Manages menu configuration, permissions, and caching
 */
class MenuService {
  constructor() {
    this.menuConfig = null;
    this.lastLoadTime = 0;
    this.loadInterval = 5000; // Reload config every 5 seconds in development
    this.initializeConfig();
  }

  /**
   * Initialize and load menu configuration
   */
  initializeConfig() {
    try {
      const data = fs.readFileSync(MENU_CONFIG_PATH, 'utf-8');
      this.menuConfig = JSON.parse(data);
      this.lastLoadTime = Date.now();
      console.log('✓ Menu configuration loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load menu configuration:', error);
      throw new Error('Failed to load menu configuration');
    }
  }

  /**
   * Reload configuration if file has changed
   */
  reloadConfigIfNeeded() {
    const now = Date.now();
    if (now - this.lastLoadTime > this.loadInterval) {
      try {
        const stats = fs.statSync(MENU_CONFIG_PATH);
        if (stats.mtimeMs > this.lastLoadTime) {
          this.initializeConfig();
        }
      } catch (error) {
        console.error('Error reloading menu config:', error);
      }
    }
  }

  /**
   * Get main menus for a specific role
   * @param {string} role - User role (admin, karyawan)
   * @returns {Array} Array of menu items
   */
  getMainMenus(role) {
    this.reloadConfigIfNeeded();
    
    if (!this.menuConfig?.roles?.[role]) {
      throw new Error(`Invalid role: ${role}`);
    }

    return (this.menuConfig.roles[role].menus || [])
      .sort((a, b) => a.order - b.order)
      .map(menu => this.filterMenuData(menu));
  }

  /**
   * Get settings menus for a specific role
   * @param {string} role - User role (admin, karyawan)
   * @returns {Array} Array of settings menu items
   */
  getSettingsMenus(role) {
    this.reloadConfigIfNeeded();
    
    if (!this.menuConfig?.roles?.[role]) {
      throw new Error(`Invalid role: ${role}`);
    }

    return (this.menuConfig.roles[role].settingsMenus || [])
      .sort((a, b) => a.order - b.order)
      .map(menu => this.filterMenuData(menu));
  }

  /**
   * Get all menus (main + settings) for a role
   * @param {string} role - User role
   * @returns {Object} Object with mainMenus and settingsMenus arrays
   */
  getAllMenus(role) {
    return {
      mainMenus: this.getMainMenus(role),
      settingsMenus: this.getSettingsMenus(role),
      role: role,
      roleLabel: this.menuConfig.roles[role]?.label
    };
  }

  /**
   * Get a single menu item by id
   * @param {string} role - User role
   * @param {string} menuId - Menu item id
   * @returns {Object} Menu item object
   */
  getMenuById(role, menuId) {
    this.reloadConfigIfNeeded();
    
    const allMenus = [
      ...(this.menuConfig.roles[role]?.menus || []),
      ...(this.menuConfig.roles[role]?.settingsMenus || [])
    ];

    const menu = allMenus.find(m => m.id === menuId);
    if (!menu) {
      throw new Error(`Menu not found: ${menuId}`);
    }

    return this.filterMenuData(menu);
  }

  /**
   * Check if user has permission for a menu action
   * @param {string} role - User role
   * @param {string} menuId - Menu item id
   * @param {string} action - Action (view, create, edit, delete)
   * @returns {boolean}
   */
  hasPermission(role, menuId, action = 'view') {
    this.reloadConfigIfNeeded();

    try {
      const menu = this.getMenuById(role, menuId);
      return menu.permissions?.[action] === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all menus the user has access to based on permissions
   * @param {string} role - User role
   * @returns {Object} Filtered menus by permission
   */
  getAccessibleMenus(role) {
    const mainMenus = this.getMainMenus(role).filter(menu =>
      this.hasPermission(role, menu.id, 'view')
    );

    const settingsMenus = this.getSettingsMenus(role).filter(menu =>
      this.hasPermission(role, menu.id, 'view')
    );

    return {
      mainMenus,
      settingsMenus,
      role,
      roleLabel: this.menuConfig.roles[role]?.label
    };
  }

  /**
   * Get permission matrix for a role
   * @param {string} role - User role
   * @returns {Object} Permission matrix
   */
  getPermissions(role) {
    this.reloadConfigIfNeeded();
    return this.menuConfig.permissionMatrix?.[role] || {};
  }

  /**
   * Get related menus for a menu item
   * @param {string} role - User role
   * @param {string} menuId - Menu item id
   * @returns {Array} Array of related menu ids
   */
  getRelatedMenus(role, menuId) {
    try {
      const menu = this.getMenuById(role, menuId);
      return menu.relatedMenus || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get API endpoint configuration for a resource
   * @param {string} resource - Resource name (karyawan, absensi, etc)
   * @returns {Object} API endpoint configuration
   */
  getApiEndpoint(resource) {
    this.reloadConfigIfNeeded();
    return this.menuConfig.apiEndpoints?.[resource] || null;
  }

  /**
   * Get sync configuration
   * @returns {Object} Sync configuration
   */
  getSyncConfig() {
    this.reloadConfigIfNeeded();
    return this.menuConfig.syncConfig || {};
  }

  /**
   * Filter sensitive data from menu before sending to client
   * @param {Object} menu - Menu item
   * @returns {Object} Filtered menu item
   */
  filterMenuData(menu) {
    const {
      id,
      label,
      path,
      icon,
      component,
      order,
      permissions,
      metadata,
      relatedMenus,
      linkedAdminMenu
    } = menu;

    return {
      id,
      label,
      path,
      icon,
      component,
      order,
      permissions,
      metadata,
      relatedMenus,
      linkedAdminMenu
    };
  }

  /**
   * Get complete menu structure
   * @returns {Object} Complete menu configuration
   */
  getCompleteConfig() {
    this.reloadConfigIfNeeded();
    return this.menuConfig;
  }

  /**
   * Add a new menu (development/admin feature)
   * @param {string} role - Target role
   * @param {Object} menuItem - New menu item
   * @param {boolean} isSettings - Is this a settings menu
   * @returns {Object} Updated configuration
   */
  addMenu(role, menuItem, isSettings = false) {
    this.reloadConfigIfNeeded();

    if (!this.menuConfig.roles[role]) {
      throw new Error(`Invalid role: ${role}`);
    }

    const menuArray = isSettings
      ? this.menuConfig.roles[role].settingsMenus
      : this.menuConfig.roles[role].menus;

    // Check for duplicate
    if (menuArray.some(m => m.id === menuItem.id)) {
      throw new Error(`Menu with id ${menuItem.id} already exists`);
    }

    // Add default order
    if (!menuItem.order) {
      menuItem.order = (menuArray.length || 0) + 1;
    }

    menuArray.push(menuItem);
    this.saveConfig();

    return this.filterMenuData(menuItem);
  }

  /**
   * Update existing menu
   * @param {string} role - Target role
   * @param {string} menuId - Menu id
   * @param {Object} updates - Updates to apply
   * @param {boolean} isSettings - Is this a settings menu
   * @returns {Object} Updated menu item
   */
  updateMenu(role, menuId, updates, isSettings = false) {
    this.reloadConfigIfNeeded();

    const menuArray = isSettings
      ? this.menuConfig.roles[role].settingsMenus
      : this.menuConfig.roles[role].menus;

    const menuIndex = menuArray.findIndex(m => m.id === menuId);
    if (menuIndex === -1) {
      throw new Error(`Menu not found: ${menuId}`);
    }

    menuArray[menuIndex] = {
      ...menuArray[menuIndex],
      ...updates,
      id: menuArray[menuIndex].id // Prevent id change
    };

    this.saveConfig();
    return this.filterMenuData(menuArray[menuIndex]);
  }

  /**
   * Delete menu
   * @param {string} role - Target role
   * @param {string} menuId - Menu id
   * @param {boolean} isSettings - Is this a settings menu
   * @returns {boolean} Success
   */
  deleteMenu(role, menuId, isSettings = false) {
    this.reloadConfigIfNeeded();

    const menuArray = isSettings
      ? this.menuConfig.roles[role].settingsMenus
      : this.menuConfig.roles[role].menus;

    const menuIndex = menuArray.findIndex(m => m.id === menuId);
    if (menuIndex === -1) {
      throw new Error(`Menu not found: ${menuId}`);
    }

    menuArray.splice(menuIndex, 1);
    this.saveConfig();

    return true;
  }

  /**
   * Save configuration back to file
   * @private
   */
  saveConfig() {
    try {
      fs.writeFileSync(
        MENU_CONFIG_PATH,
        JSON.stringify(this.menuConfig, null, 2),
        'utf-8'
      );
      this.lastLoadTime = Date.now();
      console.log('✓ Menu configuration saved');
    } catch (error) {
      console.error('❌ Failed to save menu configuration:', error);
      throw new Error('Failed to save menu configuration');
    }
  }
}

// Singleton instance
const menuService = new MenuService();

export default menuService;
