/**
 * Data Sync Service - Mengelola sinkronisasi data real-time antara Admin dan Karyawan
 * Menggunakan WebSocket atau polling untuk real-time updates
 */

import menuConfig from '../config/menu_config.json';

class DataSyncService {
  constructor() {
    this.config = menuConfig;
    this.cache = new Map();
    this.syncSubscribers = new Map();
    this.isDirty = new Map();
    this.retryQueue = [];
    this.isOnline = navigator.onLine;

    // Listen to online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processRetryQueue();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Fetch data dengan caching
   */
  async fetchData(dataSourceId, token, forceRefresh = false) {
    // Cek cache jika tidak force refresh
    if (!forceRefresh && this.cache.has(dataSourceId)) {
      const cached = this.cache.get(dataSourceId);
      if (!this.isCacheExpired(dataSourceId)) {
        return {
          data: cached.data,
          cached: true,
          timestamp: cached.timestamp
        };
      }
    }

    const dataSource = this.config.syncConfig.dataSources.find(
      ds => ds.id === dataSourceId
    );

    if (!dataSource) {
      throw new Error(`Data source not found: ${dataSourceId}`);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${dataSource.endpoint}`,
        {
          method: dataSource.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Simpan ke cache
      if (dataSource.cacheEnabled) {
        this.cache.set(dataSourceId, {
          data: data.data || data,
          timestamp: Date.now(),
          expiry: Date.now() + (dataSource.cacheDuration || 60000)
        });
      }

      this.isDirty.set(dataSourceId, false);

      return {
        data: data.data || data,
        cached: false,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Error fetching ${dataSourceId}:`, error);

      // Tambahkan ke retry queue jika offline
      if (!this.isOnline) {
        this.retryQueue.push({ dataSourceId, token });
      }

      throw error;
    }
  }

  /**
   * Update data (akan otomatis mensinkronisasi ke menu yang terhubung)
   */
  async updateData(
    dataSourceId,
    dataId,
    newData,
    token,
    role = 'admin'
  ) {
    try {
      const dataSource = this.config.syncConfig.dataSources.find(
        ds => ds.id === dataSourceId
      );

      if (!dataSource) {
        throw new Error(`Data source not found: ${dataSourceId}`);
      }

      // Determinate endpoint untuk update
      const updateEndpoint = `${dataSource.endpoint}/${dataId}`;

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${updateEndpoint}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newData)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      // Mark sebagai dirty untuk refetch
      this.isDirty.set(dataSourceId, true);

      // Notify semua subscribers
      this.notifySync(dataSourceId, result.data || result);

      return result;
    } catch (error) {
      console.error(`Error updating ${dataSourceId}:`, error);
      throw error;
    }
  }

  /**
   * Invalidate cache untuk data source tertentu
   */
  invalidateCache(dataSourceId) {
    this.cache.delete(dataSourceId);
    this.isDirty.set(dataSourceId, true);
  }

  /**
   * Invalidate semua cache
   */
  invalidateAllCache() {
    this.cache.clear();
    this.isDirty.clear();
  }

  /**
   * Cek apakah cache sudah expired
   */
  isCacheExpired(dataSourceId) {
    if (!this.cache.has(dataSourceId)) return true;

    const cached = this.cache.get(dataSourceId);
    return cached.expiry < Date.now();
  }

  /**
   * Subscribe ke perubahan data tertentu
   */
  subscribe(dataSourceId, callback) {
    if (!this.syncSubscribers.has(dataSourceId)) {
      this.syncSubscribers.set(dataSourceId, []);
    }

    this.syncSubscribers.get(dataSourceId).push(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.syncSubscribers.get(dataSourceId);
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }

  /**
   * Notify semua subscribers tentang perubahan data
   */
  notifySync(dataSourceId, data) {
    if (!this.syncSubscribers.has(dataSourceId)) return;

    const subscribers = this.syncSubscribers.get(dataSourceId);
    subscribers.forEach(callback => {
      try {
        callback({
          dataSourceId,
          data,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Error in sync subscriber:', error);
      }
    });
  }

  /**
   * Proses retry queue untuk data yang gagal
   */
  async processRetryQueue() {
    if (this.retryQueue.length === 0) return;

    console.log(`Processing ${this.retryQueue.length} retry items...`);

    const queue = [...this.retryQueue];
    this.retryQueue = [];

    for (const item of queue) {
      try {
        await this.fetchData(item.dataSourceId, item.token, true);
      } catch (error) {
        // Tambahkan kembali ke retry queue
        this.retryQueue.push(item);
      }
    }
  }

  /**
   * Dapatkan status sync
   */
  getSyncStatus() {
    const dirtyItems = Array.from(this.isDirty.entries())
      .filter(([, isDirty]) => isDirty)
      .map(([id]) => id);

    return {
      isOnline: this.isOnline,
      cachedItems: this.cache.size,
      dirtyItems,
      retryQueueSize: this.retryQueue.length,
      timestamp: Date.now()
    };
  }

  /**
   * Dapatkan info cache
   */
  getCacheInfo(dataSourceId) {
    if (!this.cache.has(dataSourceId)) return null;

    const cached = this.cache.get(dataSourceId);
    return {
      exists: true,
      timestamp: cached.timestamp,
      expiry: cached.expiry,
      isExpired: cached.expiry < Date.now(),
      dataSize: JSON.stringify(cached.data).length
    };
  }

  /**
   * Setup auto-sync untuk data source tertentu
   */
  setupAutoSync(dataSourceId, token, interval = 30000) {
    const dataSource = this.config.syncConfig.dataSources.find(
      ds => ds.id === dataSourceId
    );

    if (!dataSource) {
      throw new Error(`Data source not found: ${dataSourceId}`);
    }

    const syncInterval = setInterval(() => {
      if (!this.isDirty.get(dataSourceId)) return;

      this.fetchData(dataSourceId, token, true)
        .catch(error => console.error(`Auto-sync failed for ${dataSourceId}:`, error));
    }, interval);

    // Return function to stop auto-sync
    return () => clearInterval(syncInterval);
  }

  /**
   * Batch fetch multiple data sources
   */
  async fetchMultiple(dataSourceIds, token) {
    const promises = dataSourceIds.map(id =>
      this.fetchData(id, token).catch(error => ({
        id,
        error: error.message
      }))
    );

    const results = await Promise.allSettled(promises);

    return results.reduce((acc, result, index) => {
      const dataSourceId = dataSourceIds[index];
      if (result.status === 'fulfilled') {
        acc[dataSourceId] = result.value;
      } else {
        acc[dataSourceId] = {
          error: result.reason?.message || 'Unknown error'
        };
      }
      return acc;
    }, {});
  }

  /**
   * Export cache untuk debugging
   */
  exportCache() {
    const exported = {};
    this.cache.forEach((value, key) => {
      exported[key] = {
        ...value,
        sizeKB: JSON.stringify(value.data).length / 1024
      };
    });
    return exported;
  }
}

// Export singleton instance
export default new DataSyncService();
