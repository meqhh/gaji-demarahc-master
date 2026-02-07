# Dokumentasi Sistem Koneksi Terpadu Admin-Karyawan

## 📋 Daftar Isi
1. [Ringkasan Sistem](#ringkasan-sistem)
2. [Arsitektur Teknis](#arsitektur-teknis)
3. [Komponen Utama](#komponen-utama)
4. [Implementasi](#implementasi)
5. [API & Hooks](#api--hooks)
6. [Contoh Penggunaan](#contoh-penggunaan)
7. [Alur Data & Sinkronisasi](#alur-data--sinkronisasi)
8. [Keamanan & RBAC](#keamanan--rbac)
9. [Troubleshooting](#troubleshooting)

---

## Ringkasan Sistem

Sistem koneksi terpadu adalah infrastruktur yang menghubungkan halaman Admin dan Karyawan dengan:
- ✅ **Menu terpusat** dari satu konfigurasi (`menu_config.json`)
- ✅ **Sinkronisasi data real-time** dengan caching otomatis
- ✅ **RBAC (Role-Based Access Control)** untuk keamanan
- ✅ **Routing dinamis** yang konsisten
- ✅ **Notifikasi perubahan data** otomatis ke semua menu terkait

---

## Arsitektur Teknis

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌─────────────────────┐     │
│  │  Components      │         │   Custom Hooks      │     │
│  │  - Pages         │─────────│  - useNavigation    │     │
│  │  - Layouts       │         │  - useRBAC          │     │
│  │  - Sidebars      │         │  - useDataSync      │     │
│  └──────────────────┘         │  - useDataUpdate    │     │
│           │                   │  - useSyncStatus    │     │
│           │                   └─────────────────────┘     │
│           │                            │                  │
│           └────────────┬───────────────┘                  │
│                        │                                  │
│        ┌───────────────▼────────────────┐               │
│        │   Navigation Service           │               │
│        │   (mendapat config dari JSON)  │               │
│        └───────────────┬────────────────┘               │
│                        │                                  │
│        ┌───────────────▼────────────────┐               │
│        │   Data Sync Service            │               │
│        │   (cache + retry logic)        │               │
│        └───────────────┬────────────────┘               │
│                        │                                  │
│                        │ HTTP / WebSocket               │
│                        ▼                                  │
│        ┌──────────────────────────────┐               │
│        │    Backend (Express)         │               │
│        │ - Auth middleware            │               │
│        │ - RBAC middleware            │               │
│        │ - API routes (CRUD)          │               │
│        │ - Database                   │               │
│        └──────────────────────────────┘               │
│                                                        │
└────────────────────────────────────────────────────────┘

Data Flow:
User Login → TOKEN → AppContext → setRole → 
Navigation Service → Menu dinamis → 
Data Sync Service → Cache → Real-time updates
```

---

## Komponen Utama

### 1. **menu_config.json**
Konfigurasi terpusat untuk semua menu.

```json
{
  "menus": {
    "admin": {
      "mainMenu": [...]
      "settingsMenu": [...]
    },
    "karyawan": {
      "mainMenu": [...]
      "settingsMenu": [...]
    }
  },
  "rolePermissions": {...},
  "syncConfig": {...}
}
```

**Struktur Menu Item:**
```json
{
  "id": "karyawan",
  "label": "Data Karyawan",
  "path": "/admin/karyawan",
  "icon": "users",
  "component": "Karyawan",
  "requiredRole": ["admin"],
  "relatedKaryawanPath": "/karyawan/datadiri",
  "syncWith": ["karyawan.datadiri"],
  "dataSource": "api/karyawan",
  "permissions": {
    "create": true,
    "read": true,
    "update": true,
    "delete": true
  }
}
```

**Parameter Penjelasan:**
| Parameter | Tipe | Fungsi |
|-----------|------|--------|
| `id` | string | ID unik menu |
| `label` | string | Nama tampilan menu |
| `path` | string | Route path |
| `icon` | string | Icon name untuk sidebar |
| `component` | string | Nama komponen React |
| `requiredRole` | array | Role yang dapat akses |
| `relatedKaryawanPath` | string | Menu yang terhubung di halaman lain |
| `syncWith` | array | Menu yang tersinkronisasi |
| `dataSource` | string | ID API endpoint |
| `permissions` | object | CRUD permissions |

### 2. **navigationService.js**
Service untuk mengelola navigasi dinamis.

**Fungsi Utama:**
```javascript
navigationService.getMainMenu(role)          // Dapatkan main menu
navigationService.hasPermission(id, action)  // Cek permission
navigationService.getRelatedPath(path, role) // Dapatkan menu terhubung
navigationService.isValidPathForRole(path)   // Validasi path
navigationService.getBreadcrumb(path)        // Dapatkan breadcrumb
```

### 3. **dataSyncService.js**
Service untuk sinkronisasi dan caching data.

**Fungsi Utama:**
```javascript
dataSyncService.fetchData(dataSourceId, token)        // Fetch dengan cache
dataSyncService.updateData(id, newData, token)        // Update data
dataSyncService.subscribe(dataSourceId, callback)     // Subscribe perubahan
dataSyncService.invalidateCache(dataSourceId)         // Hapus cache
dataSyncService.setupAutoSync(dataSourceId, token)    // Auto-sync
```

### 4. **useUnifiedNavigation.js**
Custom hooks untuk integrasi mudah.

**Hooks Utama:**
- `useRBAC()` - Role-based access control
- `useNavigation()` - Navigasi dinamis
- `useDataSync()` - Sinkronisasi data
- `useDataUpdate()` - Update data
- `useSyncedMenu()` - Sinkronisasi menu
- `useSyncStatus()` - Status sinkronisasi

### 5. **SyncedNavigation.js**
Komponen siap pakai untuk sidebar dan breadcrumb.

---

## Implementasi

### Step 1: Setup AppContext dengan Role
```javascript
// src/context/AppContext.js
const [userProfile, setUserProfile] = useState(null);

// Pada logout
setUserProfile(null);
navigationService.setRole(null);
```

### Step 2: Update LayoutAdmin.js
```javascript
import { SyncedSidebar, SyncStatusIndicator } from '../components/SyncedNavigation';

function LayoutAdmin() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SyncedSidebar variant="admin" />
      <main className="flex-1">
        <Outlet />
      </main>
      <SyncStatusIndicator />
    </div>
  );
}
```

### Step 3: Update LayoutKaryawan.js
```javascript
import { SyncedSidebar, SyncStatusIndicator } from '../components/SyncedNavigation';

function LayoutKaryawan() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SyncedSidebar variant="karyawan" />
      <main className="flex-1">
        <Outlet />
      </main>
      <SyncStatusIndicator />
    </div>
  );
}
```

### Step 4: Gunakan Hooks di Component
```javascript
function DataKaryawan() {
  const { data, loading, refetch } = useDataSync('api/karyawan');
  const { updateData } = useDataUpdate();
  const { role, hasPermission } = useRBAC();

  const handleUpdate = async (id, newData) => {
    const success = await updateData('api/karyawan', id, newData);
    if (success) refetch();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {data?.map(item => (
        <div key={item.id}>
          {item.nama}
          {hasPermission('karyawan', 'update') && (
            <button onClick={() => handleUpdate(item.id, {...})}>Edit</button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## API & Hooks

### useRBAC Hook
```javascript
const { role, hasPermission, hasAccessToMenu, isAdmin, isKaryawan } = useRBAC();

// Cek permission
if (hasPermission('karyawan', 'create')) {
  // Tampilkan button Create
}
```

### useNavigation Hook
```javascript
const { mainMenu, settingsMenu, getMenuItemById, getRelatedPath } = useNavigation();

// Dapatkan path menu terhubung
const relatedPath = getRelatedPath('/admin/karyawan'); // /karyawan/datadiri
```

### useDataSync Hook
```javascript
const { data, loading, error, refetch, invalidateCache } = useDataSync(
  'api/karyawan',
  { autoFetch: true, autoSyncInterval: 30000 }
);
```

### useDataUpdate Hook
```javascript
const { updateData, updating, updateError } = useDataUpdate();

const result = await updateData('api/karyawan', 'id123', { nama: 'Baru' });
```

### useSyncStatus Hook
```javascript
const { syncStatus, isSyncing, isOffline } = useSyncStatus();

if (isOffline) {
  console.log('Mode offline - data akan disinkronkan saat online');
}
```

---

## Contoh Penggunaan

### Contoh 1: Menampilkan Data Tersinkronisasi
```javascript
import { useDataSync } from '../hooks/useUnifiedNavigation';

function KaryawanList() {
  const { data: karyawanList, loading, error, refetch } = useDataSync('api/karyawan');

  return (
    <div>
      {loading && <p>Memuat...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <table>
        <tbody>
          {karyawanList?.map(k => (
            <tr key={k.id}>
              <td>{k.nama}</td>
              <td>{k.posisi}</td>
              <td>
                <button onClick={() => refetch()}>Refresh</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Contoh 2: Update Data dengan Sinkronisasi
```javascript
import { useDataUpdate, useDataSync } from '../hooks/useUnifiedNavigation';

function EditKaryawan({ karyawanId }) {
  const { updateData, updating } = useDataUpdate();
  const { refetch } = useDataSync('api/karyawan');
  const [formData, setFormData] = useState({});

  const handleSave = async () => {
    const success = await updateData('api/karyawan', karyawanId, formData);
    if (success) {
      refetch(); // Refresh data di semua menu yang terhubung
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
      <input
        value={formData.nama || ''}
        onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
      />
      <button disabled={updating}>
        {updating ? 'Menyimpan...' : 'Simpan'}
      </button>
    </form>
  );
}
```

### Contoh 3: RBAC di Component
```javascript
import { useRBAC } from '../hooks/useUnifiedNavigation';

function AdminPanel() {
  const { isAdmin, hasPermission } = useRBAC();

  if (!isAdmin()) {
    return <div>Akses ditolak</div>;
  }

  return (
    <div>
      {hasPermission('karyawan', 'create') && (
        <button>Tambah Karyawan</button>
      )}
      {hasPermission('gaji', 'update') && (
        <button>Update Gaji</button>
      )}
    </div>
  );
}
```

---

## Alur Data & Sinkronisasi

### Skenario 1: Admin Update Data Karyawan
```
1. Admin membuka /admin/karyawan
2. useDataSync('api/karyawan') fetch data
3. Data di-cache dengan TTL 60000ms
4. Admin update data karyawan
5. updateData() mengirim PUT request ke backend
6. Backend update database
7. dataSyncService.notifySync() dipanggil
8. Semua subscribers di menu terhubung di-notifikasi
9. Karyawan melihat update di /karyawan/datadiri secara real-time
10. /admin/slip-gaji juga ter-refresh karena tersinkronisasi
```

### Skenario 2: Offline & Retry
```
1. User offline (tidak ada internet)
2. dataSyncService.retryQueue += request
3. SyncStatusIndicator menampilkan "Mode Offline"
4. User kembali online
5. processRetryQueue() otomatis mengirim request yang gagal
6. SyncStatusIndicator menampilkan "Sinkronisasi Data..."
7. Data di-sync dan cache di-update
8. Component ter-render ulang dengan data terbaru
```

### Skenario 3: Auto-Sync
```
1. Component mount dengan useDataSync('api/absensi')
2. Auto-fetch data dengan useEffect
3. setupAutoSync() start interval polling setiap 30000ms
4. Setiap interval, cek isDirty flag
5. Jika dirty, re-fetch data dari API
6. Cache di-update jika ada perubahan
7. Subscribers di-notifikasi
8. Component re-render dengan data terbaru
```

---

## Keamanan & RBAC

### Authorization Flow
```
┌────────────────────────────────────────┐
│ User Login                             │
└────────────────┬──────────────────────┘
                 │
                 ▼
        ┌────────────────┐
        │ Backend: auth  │
        │ middleware     │
        │ - Verify JWT   │
        │ - Set role     │
        └────────┬───────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Frontend:          │
        │ navigationService  │
        │ .setRole(role)     │
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ useRBAC hook:      │
        │ - Check role       │
        │ - Check perms      │
        │ - Filter menu      │
        └────────┬───────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ Component:         │
        │ - Show/hide btn    │
        │ - Enable/disable   │
        └────────────────────┘
```

### Role Permissions (menu_config.json)
```json
{
  "rolePermissions": {
    "admin": {
      "karyawan": ["create", "read", "update", "delete"],
      "gaji": ["create", "read", "update", "delete"],
      "datadiri": ["read", "update"]
    },
    "karyawan": {
      "datadiri": ["read", "update"],
      "slipgaji": ["read"],
      "absensi": ["read"],
      "cuti": ["create", "read", "update"]
    }
  }
}
```

### Backend Middleware (Recommended)
```javascript
// server/middleware/auth.js
export const checkPermission = (requiredPermissions) => {
  return (req, res, next) => {
    const { user } = req;
    
    // Validasi role
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Validasi resources (optional)
    if (requiredPermissions.includes('edit') && 
        !user.permissions.includes('edit')) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    next();
  };
};
```

---

## Troubleshooting

### Problem 1: Menu tidak muncul
**Penyebab:**
- Role tidak ter-set di AppContext
- Menu item tidak sesuai dengan role

**Solusi:**
```javascript
// Pastikan role ter-set saat login
useEffect(() => {
  if (userProfile?.role) {
    navigationService.setRole(userProfile.role);
  }
}, [userProfile?.role]);

// Debug: log menu yang tersedia
console.log('Available menus:', navigationService.getMainMenu());
```

### Problem 2: Data tidak tersinkronisasi
**Penyebab:**
- Cache tidak di-invalidate
- Subscribers tidak ter-subscribe
- API endpoint salah

**Solusi:**
```javascript
// Invalid cache secara manual
dataSyncService.invalidateCache('api/karyawan');

// Refetch dengan force refresh
const { data, refetch } = useDataSync('api/karyawan');
refetch(); // dipanggil dengan forceRefresh=true

// Debug: lihat cache status
console.log('Cache info:', dataSyncService.getCacheInfo('api/karyawan'));
```

### Problem 3: Permission denied
**Penyebab:**
- Token expired
- Role tidak sesuai
- Backend tidak implement RBAC

**Solusi:**
```javascript
// Pastikan token valid
const token = localStorage.getItem('token');
if (!token) {
  navigate('/login');
}

// Debug: log permission
console.log('Has create perm:', 
  navigationService.hasPermission('karyawan', 'create'));
```

### Problem 4: Offline mode tidak bekerja
**Penyebab:**
- Retry queue tidak di-process
- Cache tidak ter-save

**Solusi:**
```javascript
// Setup offline detection
const { isSyncing, isOffline } = useSyncStatus();

if (isOffline) {
  // Show notification
  console.warn('Anda sedang offline');
  // Data akan ter-sync saat online
}

// Manual process retry queue
dataSyncService.processRetryQueue();
```

---

## Performance Tips

1. **Gunakan forceRefresh hanya saat diperlukan**
   ```javascript
   // Good - hanya refresh saat diperlukan
   const handleUpdate = async () => {
     await updateData(...);
     refetch(); // forceRefresh internally
   };

   // Bad - selalu force refresh
   useDataSync('api/karyawan', { forceRefresh: true });
   ```

2. **Setup auto-sync dengan interval yang tepat**
   ```javascript
   // Real-time critical data
   useDataSync('api/absensi', { autoSyncInterval: 5000 });

   // Non-critical data
   useDataSync('api/karyawan', { autoSyncInterval: 60000 });
   ```

3. **Batch fetch multiple data sources**
   ```javascript
   const results = await dataSyncService.fetchMultiple(
     ['api/karyawan', 'api/gaji', 'api/absensi'],
     token
   );
   ```

4. **Monitor cache size**
   ```javascript
   const cache = dataSyncService.exportCache();
   console.log('Cache size (KB):', Object.values(cache)
     .reduce((sum, item) => sum + item.sizeKB, 0));
   ```

---

## Kesimpulan

Sistem koneksi terpadu ini menyediakan:
✅ Single source of truth untuk menu (`menu_config.json`)
✅ Real-time/automatic data sync antara Admin dan Karyawan
✅ RBAC yang robust dan fleksibel
✅ Offline support dengan retry mechanism
✅ Performance optimization dengan caching
✅ Developer-friendly dengan custom hooks
✅ Mudah di-maintain dan di-scale

Semua fitur dirancang untuk memastikan konsistensi data dan pengalaman pengguna yang seamless.
