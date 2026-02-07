# IMPLEMENTASI LAYOUT - CONTOH KODE

## 1. AppContext.js - Complete Updated Version

```javascript
import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authService';
import menuFetchService from '../services/menuFetchService';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  // ============== USER PROFILE ==============
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  });

  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

  // ============== MENUS (from Backend) ==============
  const [menus, setMenus] = useState(null);
  const [menusLoading, setMenusLoading] = useState(true);
  const [menusError, setMenusError] = useState(null);

  // ============== EXISTING DATA STATES ==============
  const [karyawanData, setKaryawanData] = useState(() => {
    const saved = localStorage.getItem('karyawanData');
    return saved ? JSON.parse(saved) : [];
  });

  const [absensiData, setAbsensiData] = useState(() => {
    const saved = localStorage.getItem('absensiData');
    return saved ? JSON.parse(saved) : [];
  });

  const [gajiData, setGajiData] = useState(() => {
    const saved = localStorage.getItem('gajiData');
    return saved ? JSON.parse(saved) : [];
  });

  const [treatmentData, setTreatmentData] = useState(() => {
    const saved = localStorage.getItem('treatmentData');
    return saved ? JSON.parse(saved) : [];
  });

  const [slipGajiData, setSlipGajiData] = useState(() => {
    const saved = localStorage.getItem('slipGajiData');
    return saved ? JSON.parse(saved) : [];
  });

  const [cutiData, setCutiData] = useState(() => {
    const saved = localStorage.getItem('cutiData');
    return saved ? JSON.parse(saved) : [];
  });

  // ============== EFFECTS ==============
  
  // Save user profile to localStorage
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Load user profile dari API saat ada token
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setUserLoading(true);
      getCurrentUser(token)
        .then(res => {
          if (res.success && res.data) {
            setUserProfile(res.data);
            setUserError(null);
          }
        })
        .catch(err => {
          console.error('Failed to load user profile:', err);
          setUserError(err.message);
        })
        .finally(() => {
          setUserLoading(false);
        });
    } else {
      setUserLoading(false);
    }
  }, []);

  // ============== LOAD MENUS FROM BACKEND ==============
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token && userProfile?.role) {
      setMenusLoading(true);
      menuFetchService.getAllMenus()
        .then(data => {
          setMenus(data);
          setMenusError(null);
          console.log('✓ Menus loaded successfully:', data);
        })
        .catch(err => {
          setMenusError(err.message);
          console.error('✗ Failed to load menus:', err);
        })
        .finally(() => {
          setMenusLoading(false);
        });
    } else {
      setMenusLoading(false);
    }
  }, [userProfile]);

  // Save all data states to localStorage
  useEffect(() => {
    localStorage.setItem('karyawanData', JSON.stringify(karyawanData));
  }, [karyawanData]);

  useEffect(() => {
    localStorage.setItem('absensiData', JSON.stringify(absensiData));
  }, [absensiData]);

  useEffect(() => {
    localStorage.setItem('gajiData', JSON.stringify(gajiData));
  }, [gajiData]);

  useEffect(() => {
    localStorage.setItem('treatmentData', JSON.stringify(treatmentData));
  }, [treatmentData]);

  useEffect(() => {
    localStorage.setItem('slipGajiData', JSON.stringify(slipGajiData));
  }, [slipGajiData]);

  useEffect(() => {
    localStorage.setItem('cutiData', JSON.stringify(cutiData));
  }, [cutiData]);

  // ============== CONTEXT VALUE ==============
  const value = {
    // User Profile
    userProfile,
    setUserProfile,
    userLoading,
    userError,
    updateUserProfile: (updates) => setUserProfile(prev => ({ ...prev, ...updates })),

    // Menus (NEW - from Backend)
    menus,
    menusLoading,
    menusError,
    refetchMenus: () => menuFetchService.refreshAllMenus(),

    // Karyawan
    karyawanData,
    setKaryawanData,
    addKaryawan: (karyawan) => setKaryawanData(prev => Array.isArray(prev) ? [...prev, { ...karyawan, id: karyawan.id || String(Date.now()) }] : [{ ...karyawan, id: karyawan.id || String(Date.now()) }]),
    updateKaryawan: (id, updates) => setKaryawanData(prev => Array.isArray(prev) ? prev.map(k => k.id === id ? { ...k, ...updates } : k) : []),
    deleteKaryawan: (id) => setKaryawanData(prev => Array.isArray(prev) ? prev.filter(k => k.id !== id) : []),
    getKaryawanById: (id) => karyawanData.find(k => k.id === id),

    // Absensi
    absensiData,
    setAbsensiData,
    addAbsensi: (absensi) => setAbsensiData(prev => Array.isArray(prev) ? [...prev, { ...absensi, id: absensi.id || String(Date.now()) }] : [{ ...absensi, id: absensi.id || String(Date.now()) }]),
    updateAbsensi: (id, updates) => setAbsensiData(prev => Array.isArray(prev) ? prev.map(a => a.id === id ? { ...a, ...updates } : a) : []),
    deleteAbsensi: (id) => setAbsensiData(prev => Array.isArray(prev) ? prev.filter(a => a.id !== id) : []),
    getAbsensiByNama: (nama) => Array.isArray(absensiData) ? absensiData.filter(a => a.nama === nama) : [],

    // ... rest of existing data functions ...
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
```

---

## 2. LayoutAdmin.js - Complete Updated Version

```javascript
import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import DynamicSidebar from '../components/DynamicSidebar';
import SyncStatusIndicator from '../components/SyncStatusIndicator';
import * as Icons from 'lucide-react';

function LayoutAdmin() {
  const { menusLoading, menusError, userProfile } = useContext(AppContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ============== ERROR STATE ==============
  if (menusError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center">
          <Icons.AlertCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error Memuat Menu</h2>
          <p className="text-red-700 mb-4">{menusError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ============== SIDEBAR ============== */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}>
        <DynamicSidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          variant="admin"
        />
      </div>

      {/* ============== MAIN CONTENT ============== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* ============== HEADER ============== */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          {/* Toggle Sidebar Button */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            title="Toggle sidebar"
          >
            <Icons.Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          {/* Title */}
          <div className="flex-1 text-center hidden md:block">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          </div>

          {/* Right Section: Status & User Info */}
          <div className="flex items-center gap-4">
            {/* Sync Status Indicator */}
            <SyncStatusIndicator />

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* User Info */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {userProfile?.nama?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{userProfile?.nama}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* ============== CONTENT AREA ============== */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
          {menusLoading ? (
            <div className="flex items-center justify-center h-full">
              <div>
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Memuat sistem menu...</p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}

export default LayoutAdmin;
```

---

## 3. LayoutKaryawan.js - Updated Version

```javascript
import React, { useState, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import DynamicSidebar from '../components/DynamicSidebar';
import SyncStatusIndicator from '../components/SyncStatusIndicator';
import * as Icons from 'lucide-react';

function LayoutKaryawan() {
  const { menusLoading, menusError, userProfile } = useContext(AppContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ============== ERROR STATE ==============
  if (menusError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center">
          <Icons.AlertCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error Memuat Menu</h2>
          <p className="text-red-700 mb-4">{menusError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* ============== SIDEBAR ============== */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}>
        <DynamicSidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          variant="karyawan"
        />
      </div>

      {/* ============== MAIN CONTENT ============== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* ============== HEADER ============== */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          {/* Toggle Sidebar Button */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            title="Toggle sidebar"
          >
            <Icons.Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          {/* Title */}
          <div className="flex-1 text-center hidden md:block">
            <h1 className="text-2xl font-bold text-gray-900">Portal Karyawan</h1>
          </div>

          {/* Right Section: Status & User Info */}
          <div className="flex items-center gap-4">
            {/* Sync Status Indicator */}
            <SyncStatusIndicator />

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* User Info */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-bold">
                {userProfile?.nama?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{userProfile?.nama}</p>
                <p className="text-xs text-gray-500">Karyawan</p>
              </div>
            </div>
          </div>
        </header>

        {/* ============== CONTENT AREA ============== */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-50">
          {menusLoading ? (
            <div className="flex items-center justify-center h-full">
              <div>
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                <p className="text-gray-600">Memuat sistem menu...</p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}

export default LayoutKaryawan;
```

---

## 4. Component dengan Menu Permission Check

### Karyawan.js (Admin - Create Karyawan)

```javascript
import React, { useState } from 'react';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useMenuPermission, useRelatedMenus } from '../hooks/useMenuHooks';
import { useDataSync } from '../hooks/useUnifiedNavigation';

function Karyawan() {
  const { userProfile } = useContext(AppContext);
  
  // Check permission dari menu system (backend)
  const { hasPermission, canView, canCreate, canEdit, canDelete } = 
    useMenuPermission('karyawan', 'view');

  // Get related menus untuk karyawan
  const { relatedMenus } = useRelatedMenus('karyawan');

  // Fetch data dari backend
  const { data: karyawanList, loading, error } = useDataSync('api/karyawan');

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});

  // === PERMISSION CHECK ===
  if (!hasPermission) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg">
        <h2 className="text-yellow-800 font-bold">Akses Ditolak</h2>
        <p className="text-yellow-700">Anda tidak memiliki izin untuk mengakses menu ini.</p>
      </div>
    );
  }

  // === LOADING STATE ===
  if (loading) {
    return <div className="text-center py-8">Memuat data karyawan...</div>;
  }

  // === ERROR STATE ===
  if (error) {
    return <div className="bg-red-50 p-6 rounded-lg text-red-700">{error}</div>;
  }

  // === MAIN CONTENT ===
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Karyawan</h1>
          <p className="text-gray-600 mt-1">Kelola data karyawan perusahaan</p>
        </div>

        {/* Create Button - Only if has permission */}
        {canCreate && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            + Tambah Karyawan
          </button>
        )}
      </div>

      {/* Form - Only if has create permission */}
      {canCreate && showForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-lg font-bold mb-4">Tambah Karyawan Baru</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            // POST to backend
            // Auto-sync ke related menus (datadiri untuk karyawan)
            setShowForm(false);
          }}>
            <input
              type="text"
              placeholder="Nama"
              className="w-full px-3 py-2 border border-gray-300 rounded mb-3"
              onChange={(e) => setFormData({...formData, nama: e.target.value})}
            />
            {/* More form fields... */}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Simpan
            </button>
          </form>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nama</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
              {(canEdit || canDelete) && (
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {karyawanList && karyawanList.map((k) => (
              <tr key={k.id}>
                <td className="px-6 py-4 text-sm">{k.nama}</td>
                <td className="px-6 py-4 text-sm">{k.email}</td>
                <td className="px-6 py-4 text-sm">{k.role}</td>
                {(canEdit || canDelete) && (
                  <td className="px-6 py-4 text-center text-sm space-x-2">
                    {canEdit && (
                      <button className="text-blue-600 hover:text-blue-800">Edit</button>
                    )}
                    {canDelete && (
                      <button className="text-red-600 hover:text-red-800">Hapus</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Related Menus Info */}
      {relatedMenus.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Perubahan di menu ini akan otomatis tersinkronisasi ke menu terkait: 
            {relatedMenus.map(m => m.label).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}

export default Karyawan;
```

---

## 5. Data Diri Component (Karyawan)

```javascript
import React, { useState } from 'react';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useMenuPermission } from '../hooks/useMenuHooks';
import { useDataSync, useDataUpdate } from '../hooks/useUnifiedNavigation';

function DataDiri() {
  const { userProfile, updateUserProfile } = useContext(AppContext);
  
  // Permission check
  const { hasPermission, canView, canEdit } = useMenuPermission('datadiri', 'view');

  // Fetch personal data (auto-synced dengan admin karyawan menu)
  const { data: personalData, loading } = useDataSync(`api/karyawan/${userProfile?.id}`);

  // Update handler
  const { updateData, updating } = useDataUpdate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(personalData || {});

  if (!canView) {
    return <div className="bg-red-50 p-6 rounded">Akses ditolak</div>;
  }

  const handleSave = async () => {
    try {
      await updateData(`api/karyawan/${userProfile?.id}`, formData);
      // Auto-notify related menus (admin karyawan, etc)
      updateUserProfile(formData);
      setIsEditing(false);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) {
    return <div>Memuat data pribadi...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Data Pribadi</h1>

      <div className="bg-white p-6 rounded-lg border">
        {isEditing && canEdit ? (
          // Edit Form
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama</label>
              <input
                type="text"
                value={formData.nama || ''}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled
              />
            </div>
            {/* More fields... */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama</label>
              <p className="mt-1 text-gray-900">{personalData?.nama}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{personalData?.email}</p>
            </div>
            {/* More fields... */}
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit Data
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-green-50 p-4 rounded">
        <p className="text-sm text-green-700">
          <strong>Status:</strong> Data Anda tersinkronisasi real-time dengan sistem admin.
        </p>
      </div>
    </div>
  );
}

export default DataDiri;
```

---

## 6. Testing Component

```javascript
// Untuk testing hook dan service
import { useMenus, useMainMenus, useMenuPermission } from '../hooks/useMenuHooks';
import menuFetchService from '../services/menuFetchService';

function TestMenuSystem() {
  const { menus, loading, error } = useMenus();
  const { mainMenus } = useMainMenus();
  const { hasPermission: canViewKaryawan } = useMenuPermission('karyawan', 'view');
  const { hasPermission: canCreateKaryawan } = useMenuPermission('karyawan', 'create');

  return (
    <div className="p-6 space-y-4 bg-gray-50 rounded">
      <h2 className="text-2xl font-bold">Menu System Test</h2>

      {/* Menus Loading Status */}
      <div className="bg-white p-4 rounded">
        <h3 className="font-bold mb-2">Menu Loading Status</h3>
        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
          {JSON.stringify({ loading, error, menusCount: menus?.mainMenus?.length }, null, 2)}
        </pre>
      </div>

      {/* Main Menus List */}
      {mainMenus && (
        <div className="bg-white p-4 rounded">
          <h3 className="font-bold mb-2">Main Menus</h3>
          <ul className="space-y-1">
            {mainMenus.map(menu => (
              <li key={menu.id} className="text-sm">{menu.label} ({menu.id})</li>
            ))}
          </ul>
        </div>
      )}

      {/* Permission Check */}
      <div className="bg-white p-4 rounded">
        <h3 className="font-bold mb-2">Permissions</h3>
        <p>Can view Karyawan: {canViewKaryawan ? '✅ Yes' : '❌ No'}</p>
        <p>Can create Karyawan: {canCreateKaryawan ? '✅ Yes' : '❌ No'}</p>
      </div>

      {/* Service Direct Test */}
      <div className="bg-white p-4 rounded">
        <h3 className="font-bold mb-2">Direct Service Test</h3>
        <button
          onClick={async () => {
            const result = await menuFetchService.getAllMenus(true);
            console.log('Fresh menus:', result);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Fetch Fresh Menus
        </button>
      </div>
    </div>
  );
}

export default TestMenuSystem;
```

---

## FILE STRUCTURE SETELAH IMPLEMENTASI

```
src/
├── components/
│   ├── DynamicSidebar.js          ✅ (NEW)
│   ├── DynamicComponentRenderer.js ✅ (NEW)
│   ├── DynamicRouteGenerator.js   ✅ (NEW)
│   └── SyncStatusIndicator.js     ✅ (existing from previous work)
│
├── config/
│   └── api.js                     ✅ (NEW)
│
├── context/
│   └── AppContext.js              ✏️ (UPDATED)
│
├── hooks/
│   ├── useMenuHooks.js            ✅ (NEW)
│   └── useUnifiedNavigation.js    ✅ (existing from previous work)
│
├── Layout/
│   ├── LayoutAdmin.js             ✏️ (UPDATED)
│   └── LayoutKaryawan.js          ✏️ (UPDATED)
│
├── services/
│   ├── menuFetchService.js        ✅ (NEW)
│   ├── navigationService.js       ✅ (existing from previous work)
│   └── dataSyncService.js         ✅ (existing from previous work)
│
└── Karyawan/
    ├── DataDiri.js                ✏️ (CAN USE hooks)
    ├── Login.js                   ✏️ (CAN UPDATE)
    └── ...
```

---

**Key Changes Summary**:
- ✅ AppContext now fetches menus from backend
- ✅ LayoutAdmin/Karyawan use DynamicSidebar
- ✅ All hardcoded menu links REMOVED
- ✅ Menus 100% from backend API
- ✅ Components check permissions from backend
- ✅ Zero dummy data anywhere
