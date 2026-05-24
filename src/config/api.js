/**
 * Frontend API Configuration
 * Centralized configuration for API endpoints and feature flags
 */

// Detect environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Helper to normalize the configured API URL
const normalizeApiUrl = (url) => {
  if (!url) return url;
  const normalized = String(url)
    .trim()
    .replace(/\/api(?:\/+)?$/i, '')
    .replace(/\/+$/,'');
  return normalized;
};

// API Base URL
export const REACT_APP_API_URL =
  normalizeApiUrl(process.env.REACT_APP_API_URL) ||
  (isDevelopment ? 'http://localhost:5000' : window.location.origin);

export const API_BASE_URL = `${REACT_APP_API_URL.replace(/\/+$/, '')}/api`;

// Feature Flags
export const FEATURES = {
  enableMenuDynamicLoading: true,
  enableMenuCaching: true,
  enableAutoSync: true,
  enableOfflineMode: true,
  enableAuditLogging: false,
  enableDebugMode: isDevelopment
};

// API Configuration
export const API_CONFIG = {
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  syncInterval: 30000 // 30 seconds
};

// Menu Configuration
export const MENU_CONFIG = {
  autoLoadMenus: true,
  renderComponentsFromBackend: true,
  useStaticMenuFallback: false,
  updateInterval: 30000
};

// Error Messages
export const ERROR_MESSAGES = {
  MENU_NOT_FOUND: 'Menu tidak ditemukan',
  ACCESS_DENIED: 'Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman ini',
  INVALID_ROLE: 'Role tidak valid',
  NETWORK_ERROR: 'Jaringan tidak tersedia. Periksa koneksi internet Anda',
  UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui',
  MENU_LOAD_ERROR: 'Gagal memuat menu sistem'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login berhasil!',
  LOGOUT_SUCCESS: 'Logout berhasil',
  UPDATE_SUCCESS: 'Data berhasil diperbarui',
  DELETE_SUCCESS: 'Data berhasil dihapus',
  CREATE_SUCCESS: 'Data berhasil dibuat'
};

export default {
  REACT_APP_API_URL,
  FEATURES,
  API_CONFIG,
  MENU_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
