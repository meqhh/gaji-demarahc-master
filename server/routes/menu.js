import express from 'express';
import * as menuController from '../controllers/menuController.js';
import { auth, adminOnly } from '../middleware/auth.js';

const router = express.Router();

/**
 * Public route - health check
 */
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Menu service is running' });
});

/**
 * Protected routes - require authentication
 */

// Get all menus (main + settings) for authenticated user
router.get('/', auth, menuController.getAllMenus);

// Get main menus only
router.get('/main', auth, menuController.getMainMenus);

// Get settings menus only
router.get('/settings', auth, menuController.getSettingsMenus);

// Get specific menu by id
router.get('/:menuId', auth, menuController.getMenuById);

// Check permission for menu action
router.get('/:menuId/permission/:action', auth, menuController.checkPermission);

// Get related menus
router.get('/:menuId/related', auth, menuController.getRelatedMenus);

// Get permission matrix for the user's role
router.get('/permissions/matrix', auth, menuController.getPermissionMatrix);

// Get API endpoint configuration
router.get('/api-endpoints/:resource', auth, menuController.getApiEndpoint);

// Get sync configuration
router.get('/sync-config', auth, menuController.getSyncConfig);

/**
 * Admin-only routes - require authentication and admin role
 */

// Add new menu
router.post('/', auth, adminOnly, menuController.addMenu);

// Update menu
router.put('/:menuId', auth, adminOnly, menuController.updateMenu);

// Delete menu
router.delete('/:menuId', auth, adminOnly, menuController.deleteMenu);

/**
 * Error handling for undefined routes
 */
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Menu endpoint not found'
  });
});

export default router;
