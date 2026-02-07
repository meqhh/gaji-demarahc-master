/**
 * UNIFIED SYSTEM - INTEGRATION EXAMPLES
 * 
 * Contoh implementasi konkret sistem koneksi terpadu
 * Gunakan sebagai referensi saat mengupdate component existing
 */

// ============================================================
// EXAMPLE 1: Update SidebarAdmin.js dengan menu dinamis
// ============================================================

import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useNavigation, useRBAC, useSyncStatus } from '../hooks/useUnifiedNavigation';

function SidebarAdmin() {
  const { mainMenu, settingsMenu } = useNavigation();
  const { hasAccessToMenu } = useRBAC();
  const { isSyncing, isOffline } = useSyncStatus();
  const location = useLocation();

  const linkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-150 font-medium text-sm ${
      isActive
        ? 'bg-gray-900 text-white shadow-md'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  // Filter menu berdasarkan role
  const filteredMainMenu = useMemo(() => {
    return mainMenu.filter(item => hasAccessToMenu(item.id));
  }, [mainMenu, hasAccessToMenu]);

  const filteredSettingsMenu = useMemo(() => {
    return settingsMenu.filter(item => hasAccessToMenu(item.id));
  }, [settingsMenu, hasAccessToMenu]);

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-screen shadow-md overflow-y-auto">
      {/* Logo/Header */}
      <div className="px-6 py-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-xs text-gray-500 mt-1">v2.0 - Unified System</p>
      </div>

      {/* Main Menu */}
      <div className="flex-1 px-4 py-6 space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-4 mb-4">
          Menu Utama
        </h3>
        {filteredMainMenu.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            className={linkClass}
            title={item.description}
          >
            {/* Placeholder untuk icon - replace dengan icon component */}
            <span className="text-lg">📋</span>
            <span className="flex-1">{item.label}</span>
            
            {/* Sync indicator - biru dot jika tersinkronisasi */}
            {item.syncWith?.length > 0 && (
              <span
                className="inline-block w-2 h-2 bg-blue-500 rounded-full"
                title={`Tersinkronisasi dengan: ${item.syncWith.join(', ')}`}
              />
            )}
          </NavLink>
        ))}
      </div>

      <hr className="border-gray-200" />

      {/* Settings Menu */}
      <div className="px-4 py-6 space-y-2 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-4 mb-4">
          Pengaturan
        </h3>
        {filteredSettingsMenu.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            className={linkClass}
            title={item.description}
          >
            <span className="text-lg">⚙️</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Status Bar */}
      <div className="px-4 py-3 border-t border-gray-200 space-y-2 bg-gray-50">
        {isSyncing && (
          <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-100 px-3 py-2 rounded animate-pulse">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-spin" />
            <span>Sinkronisasi...</span>
          </div>
        )}
        {isOffline && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-100 px-3 py-2 rounded">
            <span>⚠️</span>
            <span>Mode Offline</span>
          </div>
        )}
      </div>
    </aside>
  );
}

export { SidebarAdmin };

// ============================================================
// EXAMPLE 2: Update Data Component dengan Real-time Sync
// ============================================================

import React, { useState, useCallback } from 'react';
import { useDataSync, useDataUpdate, useRBAC } from '../hooks/useUnifiedNavigation';

function KaryawanAdmin() {
  const { data: karyawanData, loading, error, refetch } = useDataSync('api/karyawan', {
    autoFetch: true,
    autoSyncInterval: 30000
  });
  const { updateData, updating, updateError } = useDataUpdate();
  const { role, hasPermission } = useRBAC();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Filter data berdasarkan search
  const filteredData = karyawanData?.filter(k =>
    k.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    k.posisi.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Handle update
  const handleUpdate = useCallback(async () => {
    if (!editingId) return;

    const success = await updateData('api/karyawan', editingId, editForm);
    if (success) {
      setEditingId(null);
      setEditForm({});
      // refetch() dipanggil otomatis oleh dataSyncService.notifySync()
      // tapi bisa dipanggil manual juga
      refetch();
    } else {
      alert('Error: ' + updateError);
    }
  }, [editingId, editForm, updateData, updateError]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin inline-block">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
            </svg>
          </div>
          <p className="text-gray-500 mt-4">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 font-semibold">Error: {error}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Data Karyawan</h1>
        <p className="text-gray-600 mt-2">
          Total: {filteredData.length} karyawan | Last sync: {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex gap-4 items-center">
        {hasPermission('karyawan', 'create') && (
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            + Tambah Karyawan
          </button>
        )}
        
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Cari nama atau posisi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Refresh Button */}
        <button
          onClick={() => refetch()}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          title="Refresh data"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">No</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nama</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Posisi</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              {hasPermission('karyawan', 'update') && (
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((karyawan, idx) => (
              <tr
                key={karyawan.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-gray-900">{idx + 1}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{karyawan.nama}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{karyawan.posisi}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{karyawan.email || '-'}</td>
                
                {hasPermission('karyawan', 'update') && (
                  <td className="px-6 py-4 text-sm space-x-2">
                    {editingId === karyawan.id ? (
                      <>
                        <button
                          onClick={handleUpdate}
                          disabled={updating}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {updating ? '...' : 'Simpan'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(karyawan.id);
                            setEditForm(karyawan);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
                          Hapus
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredData.length === 0 && (
          <div className="px-6 py-12 text-center text-gray-500">
            <p>Tidak ada data karyawan</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Edit Karyawan</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                <input
                  type="text"
                  value={editForm.nama || ''}
                  onChange={(e) => setEditForm({ ...editForm, nama: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posisi</label>
                <input
                  type="text"
                  value={editForm.posisi || ''}
                  onChange={(e) => setEditForm({ ...editForm, posisi: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {updating ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export { KaryawanAdmin };

// ============================================================
// EXAMPLE 3: Component Karyawan dengan Auto-Sync dari Admin
// ============================================================

import React from 'react';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { useDataSync, useDataUpdate, useSyncedMenu } from '../hooks/useUnifiedNavigation';

function DataDiriKaryawan() {
  const { userProfile } = useContext(AppContext);
  const { data, loading, error, refetch } = useDataSync('api/karyawan', {
    autoFetch: true,
    autoSyncInterval: 10000 // Lebih sering untuk data pribadi
  });
  const { updateData, updating } = useDataUpdate();
  const { syncStatus } = useSyncedMenu('datadiri');
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({});

  // Dapatkan data pribadi user saat ini
  const myData = data?.find(k => k.id === userProfile?.id);

  React.useEffect(() => {
    if (myData) {
      setFormData(myData);
    }
  }, [myData]);

  const handleSave = async () => {
    const success = await updateData('api/karyawan', myData.id, formData);
    if (success) {
      setIsEditing(false);
      // refetch otomatis via dataSyncService
      // Data juga ter-sync ke admin panel
    }
  };

  if (loading) {
    return <div className="p-8">Loading data pribadi...</div>;
  }

  if (!myData) {
    return <div className="p-8 text-red-600">Data tidak ditemukan</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Data Diri Saya</h1>

      {/* Sync Status */}
      {syncStatus && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          Tersinkronisasi dengan menu admin: {syncStatus.syncWith.join(', ')}
        </div>
      )}

      {!isEditing ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Nama</label>
            <p className="text-lg font-medium text-gray-900">{myData.nama}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Posisi</label>
            <p className="text-lg font-medium text-gray-900">{myData.posisi}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
            <p className="text-lg font-medium text-gray-900">{myData.email}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Data
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
            <input
              type="text"
              value={formData.nama || ''}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Posisi</label>
            <input
              type="text"
              value={formData.posisi || ''}
              onChange={(e) => setFormData({ ...formData, posisi: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={updating}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { DataDiriKaryawan };

// ============================================================
// EXAMPLE 4: HOW TO INJECT INTO EXISTING COMPONENTS
// ============================================================

/*
BEFORE:
```
function Karyawan() {
  const [karyawanData, setKaryawanData] = useState([]);
  
  useEffect(() => {
    // Fetch manual
    fetch('/api/karyawan')
      .then(res => res.json())
      .then(data => setKaryawanData(data));
  }, []);
  
  return (...)
}
```

AFTER:
```
import { useDataSync } from '../hooks/useUnifiedNavigation';

function Karyawan() {
  // Replace semua state fetch logic dengan hook
  const { data: karyawanData, loading, error, refetch } = useDataSync('api/karyawan');
  
  return (...)
}
```

MINIMAL CHANGE - MAXIMUM BENEFIT!
*/
