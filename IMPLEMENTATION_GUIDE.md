# 🚀 Implementation Guide - Sistem Koneksi Terpadu Admin-Karyawan

## Quick Start (5 Langkah)

### Langkah 1: Update AppContext
**File:** `src/context/AppContext.js`

```javascript
import navigationService from '../services/navigationService';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);

  // Saat user login, set role ke navigation service
  const loginUser = (userData) => {
    setUserProfile(userData);
    navigationService.setRole(userData.role); // ← TAMBAH INI
  };

  // Saat user logout, reset role
  const logoutUser = () => {
    setUserProfile(null);
    navigationService.setRole(null); // ← TAMBAH INI
  };

  return (
    <AppContext.Provider value={{ userProfile, setUserProfile, loginUser, logoutUser }}>
      {children}
    </AppContext.Provider>
  );
};
```

### Langkah 2: Update LayoutAdmin.js
**File:** `src/Layout/LayoutAdmin.js`

```javascript
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SyncedSidebar, SyncStatusIndicator } from '../components/SyncedNavigation';
import HeaderAdmin from '../components/HeaderAdmin';

function LayoutAdmin() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar dengan menu dinamis */}
      <SyncedSidebar variant="admin" />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <HeaderAdmin />
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>

      {/* Status indicator */}
      <SyncStatusIndicator />
    </div>
  );
}

export default LayoutAdmin;
```

### Langkah 3: Update LayoutKaryawan.js
**File:** `src/Layout/LayoutKaryawan.js`

```javascript
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SyncedSidebar, SyncStatusIndicator } from '../components/SyncedNavigation';
import HeaderKaryawan from '../components/HeaderKaryawan';

function LayoutKaryawan() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar dengan menu dinamis */}
      <SyncedSidebar variant="karyawan" />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <HeaderKaryawan />
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>

      {/* Status indicator */}
      <SyncStatusIndicator />
    </div>
  );
}

export default LayoutKaryawan;
```

### Langkah 4: Update Component untuk Data Sync
**Example:** `src/Admin/Karyawan.js`

```javascript
import React, { useState } from 'react';
import { useDataSync, useDataUpdate, useRBAC } from '../hooks/useUnifiedNavigation';

function Karyawan() {
  const { data: karyawanData, loading, error, refetch } = useDataSync('api/karyawan', {
    autoFetch: true,
    autoSyncInterval: 30000
  });
  const { updateData, updating } = useDataUpdate();
  const { hasPermission } = useRBAC();
  const [editingId, setEditingId] = useState(null);

  const handleUpdate = async (id, newData) => {
    const success = await updateData('api/karyawan', id, newData);
    if (success) {
      setEditingId(null);
      refetch(); // Otomatis sync ke menu terhubung
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Data Karyawan</h1>
      
      {/* Toolbar */}
      <div className="mb-6 flex gap-4">
        {hasPermission('karyawan', 'create') && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Tambah Karyawan
          </button>
        )}
        <button onClick={() => refetch()} className="bg-gray-200 px-4 py-2 rounded">
          Refresh
        </button>
      </div>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Posisi</th>
            {hasPermission('karyawan', 'update') && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {karyawanData?.map((k, idx) => (
            <tr key={k.id}>
              <td>{idx + 1}</td>
              <td>{k.nama}</td>
              <td>{k.posisi}</td>
              {hasPermission('karyawan', 'update') && (
                <td>
                  <button
                    onClick={() => handleUpdate(k.id, { nama: 'Updated Name' })}
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Edit'}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Karyawan;
```

### Langkah 5: Update Component Karyawan
**Example:** `src/Karyawan/DataDiri.js`

```javascript
import React, { useState } from 'react';
import { useDataSync, useDataUpdate, useRBAC } from '../hooks/useUnifiedNavigation';

function DataDiri() {
  const { data: myData, loading, refetch } = useDataSync('api/karyawan', {
    autoFetch: true
  });
  const { updateData, updating } = useDataUpdate();
  const { userProfile } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(myData?.[0] || {});

  const handleSave = async () => {
    const success = await updateData(
      'api/karyawan',
      userProfile?.id,
      formData
    );
    if (success) {
      setIsEditing(false);
      refetch(); // Sinkronisasi ke /admin/karyawan otomatis
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Data Diri Saya</h1>
      
      {isEditing ? (
        <form>
          <input
            value={formData.nama || ''}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            placeholder="Nama"
          />
          <input
            value={formData.posisi || ''}
            onChange={(e) => setFormData({ ...formData, posisi: e.target.value })}
            placeholder="Posisi"
          />
          <button onClick={handleSave} disabled={updating}>
            {updating ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button onClick={() => setIsEditing(false)}>Batal</button>
        </form>
      ) : (
        <div>
          <p>Nama: {myData?.[0]?.nama}</p>
          <p>Posisi: {myData?.[0]?.posisi}</p>
          <button onClick={() => setIsEditing(true)}>Edit</button>
        </div>
      )}
    </div>
  );
}

export default DataDiri;
```

---

## Checklist Implementasi

- [ ] Copy `menu_config.json` ke `src/config/`
- [ ] Copy `navigationService.js` ke `src/services/`
- [ ] Copy `dataSyncService.js` ke `src/services/`
- [ ] Copy `useUnifiedNavigation.js` ke `src/hooks/`
- [ ] Copy `SyncedNavigation.js` ke `src/components/`
- [ ] Update `AppContext.js` dengan `navigationService.setRole()`
- [ ] Update `LayoutAdmin.js` dengan `<SyncedSidebar>`
- [ ] Update `LayoutKaryawan.js` dengan `<SyncedSidebar>`
- [ ] Update `Karyawan.js` untuk menggunakan `useDataSync`
- [ ] Update `DataDiri.js` untuk menggunakan `useDataSync`
- [ ] Test menu navigation di kedua halaman
- [ ] Test data sync dengan update dari admin
- [ ] Test RBAC permissions
- [ ] Test offline mode

---

## Testing Scenarios

### Test 1: Menu Navigation
```
1. Login sebagai admin
2. Lihat semua menu muncul di sidebar
3. Klik menu berbeda
4. Verifikasi breadcrumb berubah
5. Login sebagai karyawan
6. Lihat hanya menu yang relevan
7. Verifikasi tidak ada akses ke admin menu
```

### Test 2: Data Synchronization
```
1. Admin buka /admin/karyawan
2. Update nama karyawan
3. Karyawan buka /karyawan/datadiri
4. Verifikasi data sudah terupdate (tidak perlu refresh)
5. Admin buka /admin/gaji
6. Verifikasi data karyawan konsisten
```

### Test 3: RBAC Permissions
```
1. Login admin
2. Verifikasi button "Tambah Karyawan" muncul
3. Logout
4. Login karyawan
5. Verifikasi button "Tambah" tidak muncul
6. Verifikasi karyawan hanya bisa lihat data pribadi
```

### Test 4: Offline Mode
```
1. Open DevTools → Network → Offline
2. Admin/Karyawan buka halaman
3. Verifikasi menampilkan "Mode Offline"
4. Buat update sedang offline
5. Update disimpan di retry queue
6. Go Online
7. Verifikasi menampilkan "Sinkronisasi Data..."
8. Verifikasi data ter-update setelah sync
```

---

## File Structure Setelah Implementasi

```
src/
├── config/
│   └── menu_config.json          ← Configuration menu terpusat
├── services/
│   ├── navigationService.js       ← Navigation & menu logic
│   ├── dataSyncService.js         ← Sync & cache logic
│   └── authService.js             ← (existing)
├── hooks/
│   └── useUnifiedNavigation.js    ← Custom hooks untuk integration
├── components/
│   ├── SyncedNavigation.js        ← Sidebar & breadcrumb components
│   ├── HeaderAdmin.js             ← (updated)
│   ├── HeaderKaryawan.js          ← (updated)
│   └── ...
├── Layout/
│   ├── LayoutAdmin.js             ← (updated)
│   ├── LayoutKaryawan.js          ← (updated)
│   └── ...
├── context/
│   └── AppContext.js              ← (updated)
└── ...
```

---

## API Integration

### Backend Endpoints yang Diperlukan

Pastikan backend sudah punya endpoints ini:

```
GET    /api/karyawan              → Ambil semua karyawan
GET    /api/karyawan/:id          → Ambil karyawan by ID
POST   /api/karyawan              → Tambah karyawan
PUT    /api/karyawan/:id          → Update karyawan
DELETE /api/karyawan/:id          → Hapus karyawan

GET    /api/gaji                  → Ambil semua gaji
PUT    /api/gaji/:id              → Update gaji

GET    /api/absensi               → Ambil semua absensi
PUT    /api/absensi/:id           → Update absensi

GET    /api/slip-gaji             → Ambil slip gaji
GET    /api/cuti                  → Ambil data cuti
PUT    /api/cuti/:id              → Update cuti

GET    /api/treatment             → Ambil treatment
```

### Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SYNC_INTERVAL=30000
REACT_APP_CACHE_DURATION=60000
```

---

## Common Issues & Solutions

### Issue 1: Menu tidak update setelah role berubah
**Solusi:**
```javascript
// Di component yang render menu
const { userProfile } = useContext(AppContext);
const { mainMenu } = useNavigation();

// dependency array harus include userProfile.role
useEffect(() => {
  navigationService.setRole(userProfile?.role);
}, [userProfile?.role]); // ← PENTING
```

### Issue 2: Data tidak tersinkronisasi antar tab
**Solusi:**
```javascript
// Gunakan localStorage + SharedWorker untuk cross-tab sync
// Atau gunakan polling interval yang lebih pendek
const { data } = useDataSync('api/karyawan', {
  autoSyncInterval: 5000 // Lebih sering untuk real-time
});
```

### Issue 3: Cache tidak cleared setelah login baru
**Solusi:**
```javascript
// Di login handler
const handleLogin = async (email, password) => {
  const result = await login(email, password);
  if (result.success) {
    // Clear semua cache
    dataSyncService.invalidateAllCache();
    // Set role baru
    navigationService.setRole(result.user.role);
  }
};
```

---

## Performance Optimization

### 1. Lazy Load Data
```javascript
const { data, loading } = useDataSync('api/karyawan', {
  autoFetch: false // Manual fetch
});

// Fetch hanya saat tab aktif
useEffect(() => {
  if (isTabActive) {
    fetchData();
  }
}, [isTabActive]);
```

### 2. Batch Operations
```javascript
// Daripada multiple fetch, gunakan batch
const data = await dataSyncService.fetchMultiple(
  ['api/karyawan', 'api/gaji', 'api/absensi'],
  token
);
```

### 3. Implement Virtual Scrolling
```javascript
// Untuk list besar (>1000 items)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={karyawanData.length}
  itemSize={50}
>
  {Row}
</FixedSizeList>
```

---

## Monitoring & Debugging

### Enable Debug Logging
```javascript
// src/utils/logger.js
const DEBUG = process.env.NODE_ENV === 'development';

export const debug = (service, ...args) => {
  if (DEBUG) {
    console.log(`[${service}]`, ...args);
  }
};
```

### Check Cache Status
```javascript
// Di browser console
import dataSyncService from './services/dataSyncService';
console.log(dataSyncService.exportCache());
console.log(dataSyncService.getSyncStatus());
```

### Monitor API Calls
```javascript
// Network tab di DevTools
// Filter: `api/`
// Monitor request/response times
```

---

## Next Steps

1. ✅ Implement struktur dasar (langkah 1-5)
2. ✅ Test menu navigation & permissions
3. ✅ Integrate real API endpoints
4. ✅ Setup error handling & notifications
5. ✅ Implement WebSocket untuk real-time sync (optional)
6. ✅ Add offline sync dengan IndexedDB (optional)
7. ✅ Performance optimization & monitoring

---

## Support & Resources

- 📚 Full Documentation: `UNIFIED_SYSTEM_DOCUMENTATION.md`
- 🔧 API Reference: `src/services/navigationService.js`
- 🎯 Hook Examples: `src/hooks/useUnifiedNavigation.js`
- 🎨 Component Demo: `src/components/SyncedNavigation.js`
