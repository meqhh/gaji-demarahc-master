import React, { createContext, useState, useEffect } from 'react';
import { REACT_APP_API_URL } from '../config/api';
import { getCurrentUser, getKaryawanList, createKaryawan, updateKaryawan as updateKaryawanApi, deleteKaryawan as deleteKaryawanApi, gajiApi, absensiApi, cutiApi, treatmentApi, slipGajiApi } from '../services/authService';

export const AppContext = createContext();

const saveToLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    const isQuotaError = error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22 || error.code === 1014);
    if (isQuotaError) {
      console.warn(`LocalStorage quota exceeded for ${key}, skipping persistence.`);
    } else {
      console.error(`Failed to persist ${key} to localStorage.`, error);
    }
  }
};

const normalizeText = (value) => String(value || '').trim().toLowerCase();

const normalizeCutiItem = (item) => {
  if (!item || typeof item !== 'object') return item;
  const normalized = { ...item };
  const id = normalized.id ?? normalized._id;
  if (id !== undefined && normalized.id === undefined) normalized.id = id;
  if (normalized.status !== undefined) {
    const status = String(normalized.status || '').trim();
    const statusMap = { pending: 'Pending', disetujui: 'Disetujui', ditolak: 'Ditolak' };
    normalized.status = statusMap[status.toLowerCase()] || status || 'Pending';
  }
  if (normalized.rejectionReason === undefined && normalized.rejection_reason !== undefined) {
    normalized.rejectionReason = normalized.rejection_reason;
  }
  if (normalized.updatedBy === undefined && normalized.updated_by !== undefined) {
    normalized.updatedBy = normalized.updated_by;
  }
  if (normalized.tanggal === undefined && normalized.tanggal_mulai !== undefined) {
    normalized.tanggal = normalized.tanggal_mulai;
  }
  return normalized;
};

const isSameKaryawanRecord = (left, right) => {
  if (!left || !right) return false;
  const leftId = left.id;
  const rightId = right.id;
  if (leftId !== undefined && rightId !== undefined && String(leftId) === String(rightId)) return true;
  const leftUserId = left.user_id ?? left.userId;
  const rightUserId = right.user_id ?? right.userId;
  if (leftUserId !== undefined && rightUserId !== undefined && String(leftUserId) === String(rightUserId)) return true;
  const leftEmail = normalizeText(left.email);
  const rightEmail = normalizeText(right.email);
  if (leftEmail && rightEmail && leftEmail === rightEmail) return true;
  const leftNama = normalizeText(left.nama || left.name);
  const rightNama = normalizeText(right.nama || right.name);
  if (leftNama && rightNama && leftNama === rightNama) return true;
  return false;
};

const dedupeKaryawanList = (items) => {
  if (!Array.isArray(items)) return [];
  const deduped = [];
  for (const item of items) {
    if (!item) continue;
    const exists = deduped.some((existing) => isSameKaryawanRecord(existing, item));
    if (!exists) deduped.push(item);
  }
  return deduped;
};

const isSameAbsensiRecord = (left, right) => {
  if (!left || !right) return false;
  if (left.id !== undefined && right.id !== undefined && String(left.id) === String(right.id)) return true;
  if (left.checkInId && right.checkInId && String(left.checkInId) === String(right.checkInId)) return true;
  if (
    left.karyawan_id !== undefined &&
    right.karyawan_id !== undefined &&
    String(left.karyawan_id) === String(right.karyawan_id) &&
    left.tanggal &&
    right.tanggal &&
    String(left.tanggal) === String(right.tanggal)
  ) return true;
  return false;
};

const mergeAbsensiData = (serverArr, localArr) => {
  if (!Array.isArray(serverArr)) return Array.isArray(localArr) ? localArr : [];
  if (!Array.isArray(localArr) || localArr.length === 0) return serverArr;
  const merged = [...serverArr];
  for (const localItem of localArr) {
    if (!localItem) continue;
    const existingIndex = merged.findIndex((serverItem) => isSameAbsensiRecord(serverItem, localItem));
    if (existingIndex > -1) {
      merged[existingIndex] = { ...merged[existingIndex], ...localItem };
    } else {
      merged.push(localItem);
    }
  }
  return merged;
};

export const AppContextProvider = ({ children }) => {
  const getCurrentRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem('userProfile'));
      return (user?.role || '').toLowerCase();
    } catch {
      return '';
    }
  };

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.nama && !parsed.name) parsed.name = parsed.nama;
      return parsed;
    } catch (e) {
      return null;
    }
  });

  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

  const [karyawanData, setKaryawanData] = useState(() => {
    const saved = localStorage.getItem('karyawanData');
    return saved ? JSON.parse(saved) : [];
  });
  const [karyawanLoading, setKaryawanLoading] = useState(false);
  const [karyawanError, setKaryawanError] = useState(null);

  const [absensiData, setAbsensiData] = useState(() => {
    const saved = localStorage.getItem('absensiData');
    return saved ? JSON.parse(saved) : [];
  });

  const [gajiData, setGajiData] = useState(() => {
    const saved = localStorage.getItem('gajiData');
    return saved ? JSON.parse(saved) : [];
  });

  const [catatanTreatment, setCatatanTreatment] = useState(() => {
    const saved = localStorage.getItem('catatanTreatment');
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

  useEffect(() => {
    saveToLocalStorage('userProfile', userProfile);
  }, [userProfile]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUserLoading(true);
      getCurrentUser(token)
        .then(res => {
          if (res.success && res.data) {
            const user = { ...res.data };
            if (user.nama && !user.name) user.name = user.nama;
            setUserProfile(user);
            saveToLocalStorage('userProfile', user);
            setUserError(null);
          }
        })
        .catch(err => {
          console.error('Failed to load user profile:', err);
          setUserError(err.message);
          setUserProfile(null);
          localStorage.removeItem('userProfile');
        })
        .finally(() => {
          setUserLoading(false);
        });
    } else {
      setUserProfile(null);
      localStorage.removeItem('userProfile');
      setUserLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setKaryawanLoading(true);
    setKaryawanError(null);

    getKaryawanList(token)
      .then(res => {
        if (!res) return;
        let serverArr = [];
        if (res.success && res.data) serverArr = Array.isArray(res.data) ? res.data : [];
        else if (Array.isArray(res)) serverArr = res;
        else if (res.karyawan && Array.isArray(res.karyawan)) serverArr = res.karyawan;
        else {
          const arr = Object.values(res).find(v => Array.isArray(v));
          if (Array.isArray(arr)) serverArr = arr;
        }

        try {
          const localStr = localStorage.getItem('karyawanData');
          const localArr = localStr ? JSON.parse(localStr) : [];
          if (Array.isArray(localArr) && localArr.length > 0) {
            const merged = [...serverArr];
            const findMatchIndex = (item) => merged.findIndex(m => {
              if (!m || !item) return false;
              if (m.id !== undefined && item.id !== undefined && String(m.id) === String(item.id)) return true;
              if (m.user_id !== undefined && item.user_id !== undefined && String(m.user_id) === String(item.user_id)) return true;
              if (m.email && item.email && String(m.email).toLowerCase() === String(item.email).toLowerCase()) return true;
              return false;
            });

            localArr.forEach(localItem => {
              if (!localItem) return;
              const index = findMatchIndex(localItem);
              if (index > -1) {
                merged[index] = { ...merged[index], ...localItem };
              } else {
                merged.push(localItem);
              }
            });

            setKaryawanData(dedupeKaryawanList(merged));
          } else {
            setKaryawanData(dedupeKaryawanList(serverArr));
          }
        } catch (e) {
          setKaryawanData(dedupeKaryawanList(serverArr));
        }
      })
      .catch(err => {
        console.error('Failed to load karyawan list:', err);
        setKaryawanError(err.message || String(err));
      })
      .finally(() => setKaryawanLoading(false));
  }, [userProfile]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const API_BASE = `${REACT_APP_API_URL.replace(/\/+$/, '')}/api`;

    const endpoints = {
      absensi: `${API_BASE}/absensi`,
      gaji: `${API_BASE}/gaji`,
      slipGaji: `${API_BASE}/slip-gaji`,
      cuti: `${API_BASE}/cuti`,
      treatment: `${API_BASE}/treatment`
    };

    const fetchResource = async (url) => {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        return json && json.data ? json.data : json;
      } catch (e) {
        console.error('Fetch resource failed', url, e);
        return null;
      }
    };

    (async () => {
      try {
        const [absensiRes, gajiRes, slipRes, cutiRes, treatmentRes] = await Promise.all([
          fetchResource(endpoints.absensi),
          fetchResource(endpoints.gaji),
          fetchResource(endpoints.slipGaji),
          fetchResource(endpoints.cuti),
          fetchResource(endpoints.treatment)
        ]);

        if (Array.isArray(absensiRes)) {
          try {
            const savedLocal = JSON.parse(localStorage.getItem('absensiData')) || [];
            setAbsensiData(mergeAbsensiData(absensiRes, savedLocal));
          } catch (mergeError) {
            setAbsensiData(absensiRes);
          }
        }

        if (Array.isArray(gajiRes)) {
          const normalizedServer = gajiRes.map(g => ({ ...g, id: g.id || g._id }));
          try {
            const savedLocal = JSON.parse(localStorage.getItem('gajiData')) || [];
            if (Array.isArray(savedLocal) && savedLocal.length > 0) {
              // Merge: ambil field lengkap dari localStorage, server cuma override yg non-empty
              const merged = normalizedServer.map(serverItem => {
                const localMatch = savedLocal.find(l => String(l.id) === String(serverItem.id));
                if (localMatch) {
                  const filteredServer = Object.fromEntries(
                    Object.entries(serverItem).filter(([k, v]) => v !== null && v !== undefined && v !== '')
                  );
                  return { ...localMatch, ...filteredServer, id: serverItem.id };
                }
                return serverItem;
              });
              // Pertahankan item lokal yg belum sinkron ke server (tempId "GAJI...")
              const localOnly = savedLocal.filter(l =>
                String(l.id || '').startsWith('GAJI') &&
                !normalizedServer.some(s => String(s.id) === String(l.id))
              );
              const finalData = [...merged, ...localOnly];
              setGajiData(finalData);
              try { localStorage.setItem('gajiData', JSON.stringify(finalData)); } catch (e) {}
            } else {
              setGajiData(normalizedServer);
              try { localStorage.setItem('gajiData', JSON.stringify(normalizedServer)); } catch (e) {}
            }
          } catch (e) {
            setGajiData(normalizedServer);
          }
        }

        if (Array.isArray(slipRes)) {
          const normalizedServer = slipRes.map(s => ({ ...s, id: s.id || s._id }));
          try {
            const savedLocal = JSON.parse(localStorage.getItem('slipGajiData')) || [];
            if (Array.isArray(savedLocal) && savedLocal.length > 0) {
              const merged = normalizedServer.map(serverItem => {
                const localMatch = savedLocal.find(l => String(l.id) === String(serverItem.id));
                if (localMatch) {
                  const filteredServer = Object.fromEntries(
                    Object.entries(serverItem).filter(([k, v]) => v !== null && v !== undefined && v !== '')
                  );
                  return { ...localMatch, ...filteredServer, id: serverItem.id };
                }
                return serverItem;
              });
              // Pertahankan tombstone (TOMB-) dan slip lokal yg belum sync (SLIP-)
              const localOnly = savedLocal.filter(l =>
                (String(l.id || '').startsWith('TOMB-') || String(l.id || '').startsWith('SLIP-')) &&
                !normalizedServer.some(s => String(s.id) === String(l.id))
              );
              setSlipGajiData([...merged, ...localOnly]);
            } else {
              setSlipGajiData(normalizedServer);
            }
          } catch (e) {
            setSlipGajiData(normalizedServer);
          }
        }

        if (Array.isArray(cutiRes)) {
          try {
            const savedLocalCuti = JSON.parse(localStorage.getItem('cutiData')) || [];
            const normalizedServerCuti = cutiRes.map(normalizeCutiItem);
            const normalizedLocalCuti = Array.isArray(savedLocalCuti) ? savedLocalCuti.map(normalizeCutiItem) : [];
            const mergedCuti = [...normalizedServerCuti];

            normalizedLocalCuti.forEach((localItem) => {
              if (!localItem) return;
              const localId = localItem.id ?? localItem._id;
              const isTempLocal = String(localId || '').startsWith('CUTI') || localItem.localTemp === true;
              const matchIndex = mergedCuti.findIndex((serverItem) => {
                if (!serverItem) return false;
                const serverId = serverItem.id ?? serverItem._id;
                return serverId !== undefined && localId !== undefined && String(serverId) === String(localId);
              });
              if (matchIndex > -1) {
                mergedCuti[matchIndex] = { ...mergedCuti[matchIndex], ...localItem };
              } else if (isTempLocal) {
                mergedCuti.push(localItem);
              }
            });

            setCutiData(mergedCuti.map(normalizeCutiItem));
          } catch (mergeError) {
            console.warn('Could not merge server and local cuti data, using server data only.', mergeError);
            setCutiData(cutiRes.map(normalizeCutiItem));
          }
        }

        if (Array.isArray(treatmentRes)) setTreatmentData(treatmentRes);
      } catch (e) {
        console.error('Failed to fetch additional datasets', e);
      }
    })();
  }, [userProfile]);

  useEffect(() => { saveToLocalStorage('karyawanData', karyawanData); }, [karyawanData]);
  useEffect(() => { saveToLocalStorage('absensiData', absensiData); }, [absensiData]);
  useEffect(() => { saveToLocalStorage('gajiData', gajiData); }, [gajiData]);
  useEffect(() => { saveToLocalStorage('treatmentData', treatmentData); }, [treatmentData]);
  useEffect(() => { saveToLocalStorage('catatanTreatment', catatanTreatment); }, [catatanTreatment]);
  useEffect(() => { saveToLocalStorage('slipGajiData', slipGajiData); }, [slipGajiData]);
  useEffect(() => { saveToLocalStorage('cutiData', cutiData); }, [cutiData]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== 'cutiData') return;
      try {
        const updated = event.newValue ? JSON.parse(event.newValue) : [];
        if (Array.isArray(updated)) setCutiData(updated);
      } catch (e) {
        console.error('Failed to sync cutiData from storage event:', e);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = {
    userProfile,
    setUserProfile,
    userLoading,
    userError,
    updateUserProfile: (updates) => setUserProfile(prev => ({ ...prev, ...updates })),

    karyawanData,
    karyawanLoading,
    karyawanError,
    setKaryawanData,
    addKaryawan: async (karyawan) => {
      const tempId = karyawan.id || `EMP${Date.now()}`;
      const tempItem = { ...karyawan, id: tempId };
      setKaryawanData(prev => Array.isArray(prev) ? [...prev, tempItem] : [tempItem]);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await createKaryawan(token, karyawan);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) {
            setKaryawanData(prev => Array.isArray(prev) ? prev.map(p => (p.id === tempId ? serverItem : p)) : [serverItem]);
          }
        } catch (e) {
          console.error('Failed to create karyawan on server:', e);
        }
      }
    },
    updateKaryawan: async (id, updates) => {
      setKaryawanData(prev => Array.isArray(prev) ? prev.map(k => String(k.id) === String(id) ? { ...k, ...updates } : k) : []);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await updateKaryawanApi(token, id, updates);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) {
            setKaryawanData(prev => Array.isArray(prev) ? prev.map(k => String(k.id) === String(id) ? serverItem : k) : []);
          }
        } catch (e) {
          console.error('Failed to update karyawan on server:', e);
        }
      }
    },
    deleteKaryawan: async (id) => {
      const target = Array.isArray(karyawanData) ? karyawanData.find(k => String(k?.id) === String(id)) : null;
      const targetNama = (target?.nama || '').toString().trim().toLowerCase();
      const targetEmail = (target?.email || '').toString().trim().toLowerCase();
      const hasMatchByKaryawan = (item) => {
        if (!item || typeof item !== 'object') return false;
        const itemKaryawanId = item.karyawan_id ?? item.karyawanId ?? item.id_karyawan ?? item.user_id;
        const itemNama = (item.nama || '').toString().trim().toLowerCase();
        const itemEmail = (item.email || '').toString().trim().toLowerCase();
        return (
          (itemKaryawanId !== undefined && itemKaryawanId !== null && String(itemKaryawanId) === String(id)) ||
          (targetNama && itemNama && itemNama === targetNama) ||
          (targetEmail && itemEmail && itemEmail === targetEmail)
        );
      };

      const prevSnapshot = {
        karyawanData: Array.isArray(karyawanData) ? karyawanData.slice() : [],
        absensiData: Array.isArray(absensiData) ? absensiData.slice() : [],
        gajiData: Array.isArray(gajiData) ? gajiData.slice() : [],
        treatmentData: Array.isArray(treatmentData) ? treatmentData.slice() : [],
        slipGajiData: Array.isArray(slipGajiData) ? slipGajiData.slice() : [],
        cutiData: Array.isArray(cutiData) ? cutiData.slice() : []
      };

      setKaryawanData(prev => Array.isArray(prev) ? prev.filter(k => !(String(k.id) === String(id) || (target && isSameKaryawanRecord(k, target)))) : []);
      setAbsensiData(prev => Array.isArray(prev) ? prev.filter(item => !hasMatchByKaryawan(item)) : []);
      setGajiData(prev => Array.isArray(prev) ? prev.filter(item => !hasMatchByKaryawan(item)) : []);
      setTreatmentData(prev => Array.isArray(prev) ? prev.filter(item => !hasMatchByKaryawan(item)) : []);
      setSlipGajiData(prev => Array.isArray(prev) ? prev.filter(item => !hasMatchByKaryawan(item)) : []);
      setCutiData(prev => Array.isArray(prev) ? prev.filter(item => !hasMatchByKaryawan(item)) : []);

      const token = localStorage.getItem('token');
      if (token) {
        try {
          await deleteKaryawanApi(token, id);
        } catch (e) {
          console.error('Failed to delete karyawan on server:', e);
          const message = String(e?.message || '').toLowerCase();
          const isNotFound = message.includes('tidak ditemukan') || message.includes('not found');
          if (!isNotFound) {
            setKaryawanData(prevSnapshot.karyawanData);
            setAbsensiData(prevSnapshot.absensiData);
            setGajiData(prevSnapshot.gajiData);
            setTreatmentData(prevSnapshot.treatmentData);
            setSlipGajiData(prevSnapshot.slipGajiData);
            setCutiData(prevSnapshot.cutiData);
          }
        }
      }
    },
    getKaryawanById: (id) => karyawanData.find(k => String(k.id) === String(id)),

    absensiData,
    setAbsensiData,
    addAbsensi: async (absensi) => {
      const tempId = absensi.id || `ABS${Date.now()}`;
      const tempItem = { ...absensi, id: tempId };
      setAbsensiData(prev => Array.isArray(prev) ? [...prev, tempItem] : [tempItem]);
      const token = localStorage.getItem('token');
      const canWriteAbsensiApi = getCurrentRole() === 'admin';
      if (token && canWriteAbsensiApi) {
        try {
          const res = await absensiApi.create(token, absensi);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) setAbsensiData(prev => Array.isArray(prev) ? prev.map(p => p.id === tempId ? serverItem : p) : [serverItem]);
        } catch (e) {
          console.error('Failed to create absensi on server:', e);
        }
      }
    },
    updateAbsensi: async (id, updates) => {
      const prevSnapshot = Array.isArray(absensiData) ? absensiData.slice() : [];
      setAbsensiData(prev => Array.isArray(prev) ? prev.map(a => String(a.id) === String(id) ? { ...a, ...updates } : a) : []);
      const token = localStorage.getItem('token');
      const canWriteAbsensiApi = getCurrentRole() === 'admin';
      if (token && canWriteAbsensiApi) {
        try {
          const res = await absensiApi.update(token, id, updates);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) setAbsensiData(prev => Array.isArray(prev) ? prev.map(a => String(a.id) === String(id) ? serverItem : a) : []);
        } catch (e) {
          console.error('Failed to update absensi on server:', e);
          setAbsensiData(prevSnapshot);
        }
      }
    },
    deleteAbsensi: async (id) => {
      const prevSnapshot = Array.isArray(absensiData) ? absensiData.slice() : [];
      setAbsensiData(prev => Array.isArray(prev) ? prev.filter(a => String(a.id) !== String(id)) : []);
      const token = localStorage.getItem('token');
      const canWriteAbsensiApi = getCurrentRole() === 'admin';
      if (token && canWriteAbsensiApi) {
        try {
          await absensiApi.delete(token, id);
        } catch (e) {
          console.error('Failed to delete absensi on server:', e);
          setAbsensiData(prevSnapshot);
        }
      }
    },
    getAbsensiByNama: (nama) => Array.isArray(absensiData) ? absensiData.filter(a => a.nama === nama) : [],

    gajiData,
    setGajiData,
    addGaji: async (gaji) => {
      const tempId = gaji.id || `GAJI${Date.now()}`;
      const tempItem = { ...gaji, id: tempId };
      const prevGajiData = Array.isArray(gajiData) ? gajiData.slice() : [];
      setGajiData(prev => Array.isArray(prev) ? [...prev, tempItem] : [tempItem]);

      const token = localStorage.getItem('token');
      if (token) {
        try {
           const res = await gajiApi.create(token, gaji);
          const serverItem = res?.data || (res && res.id ? res : null);
          if (serverItem) {
            // PENTING: gabungkan payload lokal (gaji) + server response.
            // Server hanya override field yang non-empty, biar field lengkap
            // (karyawan, pasien, treatment, harga, tanggal, dll) tidak hilang.
            const filteredServer = Object.fromEntries(
              Object.entries(serverItem).filter(([k, v]) => v !== null && v !== undefined && v !== '')
            );
            const normalized = { ...gaji, ...filteredServer, id: serverItem.id || serverItem._id };
            setGajiData(prev => Array.isArray(prev) ? prev.map(p => p.id === tempId ? normalized : p) : [normalized]);
          } else {
            // Server tidak balikin data, tapi item lokal udah ditambahkan tadi.
            // Biarkan saja tetap di state agar UI tidak kosong.
            console.warn('Server tidak balikin data gaji, pakai data lokal saja.');
          }
        } catch (e) {
          console.error('Failed to create gaji on server:', e);
          setGajiData(prevGajiData);
          alert('Gagal menyimpan gaji ke server. Data gaji lokal telah dibatalkan.');
        }
      }
    },
    updateGaji: async (id, updates) => {
      const prevSnapshot = Array.isArray(gajiData) ? gajiData.slice() : [];
      setGajiData(prev => Array.isArray(prev) ? prev.map(g => g.id === id ? { ...g, ...updates } : g) : []);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await gajiApi.update(token, id, updates);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) {
            setGajiData(prev => Array.isArray(prev) ? prev.map(g => g.id === id ? serverItem : g) : []);
          }
        } catch (e) {
          console.error('Failed to update gaji on server:', e);
          setGajiData(prevSnapshot);
        }
      }
    },
    // ✅ FIX UTAMA: deleteGaji - skip server kalau ID adalah temp ID lokal
    deleteGaji: async (id) => {
      const normalizedId = String(id).trim();
      const isTempId = /^(GAJI|TEMP-|SLIP)/i.test(normalizedId);
      console.log('deleteGaji called with id:', normalizedId, 'isTempId:', isTempId);

      const prevSnapshot = Array.isArray(gajiData) ? gajiData.slice() : [];

      const filtered = Array.isArray(gajiData)
        ? gajiData.filter(g => String(g.id).trim() !== normalizedId)
        : [];
      setGajiData(filtered);

      if (isTempId) {
        console.warn('Skipping server delete: ID lokal saja.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        await gajiApi.delete(token, normalizedId);
        console.log('Server delete sukses');
      } catch (e) {
        console.error('Failed to delete gaji on server:', e);
        const errorMsg = (e?.message || '').toString();

        if (errorMsg.includes('tidak ditemukan') || errorMsg.includes('not found')) {
          console.warn('Data sudah tidak ada di server, tetap hapus lokal.');
          return;
        }

        setGajiData(prevSnapshot);
        alert(`Gagal menghapus data dari server: ${errorMsg}. Data telah dikembalikan.`);
      }
    },
    getGajiByKaryawan: (nama) => Array.isArray(gajiData) ? gajiData.find(g => g.nama === nama) : undefined,

    treatmentData,
    setTreatmentData,
    addTreatment: async (treatment) => {
      const tempId = treatment.id || `TR${Date.now()}`;
      const tempItem = { ...treatment, id: tempId };
      setTreatmentData(prev => Array.isArray(prev) ? [...prev, tempItem] : [tempItem]);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await treatmentApi.create(token, treatment);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) setTreatmentData(prev => Array.isArray(prev) ? prev.map(p => p.id === tempId ? serverItem : p) : [serverItem]);
        } catch (e) {
          console.error('Failed to create treatment on server:', e);
        }
      }
    },
    updateTreatment: async (id, updates) => {
      const prevSnapshot = Array.isArray(treatmentData) ? treatmentData.slice() : [];
      setTreatmentData(prev => Array.isArray(prev) ? prev.map(t => t.id === id ? { ...t, ...updates } : t) : []);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await treatmentApi.update(token, id, updates);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) setTreatmentData(prev => Array.isArray(prev) ? prev.map(t => t.id === id ? serverItem : t) : []);
        } catch (e) {
          console.error('Failed to update treatment on server:', e);
          setTreatmentData(prevSnapshot);
        }
      }
    },
    deleteTreatment: async (id) => {
      const prevSnapshot = Array.isArray(treatmentData) ? treatmentData.slice() : [];
      setTreatmentData(prev => Array.isArray(prev) ? prev.filter(t => t.id !== id) : []);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await treatmentApi.delete(token, id);
        } catch (e) {
          console.error('Failed to delete treatment on server:', e);
          setTreatmentData(prevSnapshot);
        }
      }
    },
    getTreatmentById: (id) => Array.isArray(treatmentData) ? treatmentData.find(t => t.id === id) : undefined,

    slipGajiData,
    setSlipGajiData,
    addSlipGaji: async (slip) => {
      const tempId = slip.id || `SLIP${Date.now()}`;
      const tempItem = { ...slip, id: tempId };
      setSlipGajiData(prev => Array.isArray(prev) ? [...prev, tempItem] : [tempItem]);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await slipGajiApi.create(token, slip);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) {
            const normalized = { ...serverItem, id: serverItem.id || serverItem._id || tempId };
            setSlipGajiData(prev => Array.isArray(prev) ? prev.map(p => p.id === tempId ? normalized : p) : [normalized]);
          }
        } catch (e) {
          console.error('Failed to create slip gaji on server:', e);
        }
      }
    },
    updateSlipGaji: async (id, updates) => {
      const prevSnapshot = Array.isArray(slipGajiData) ? slipGajiData.slice() : [];
      setSlipGajiData(prev => Array.isArray(prev) ? prev.map(s => (String(s.id) === String(id) || String(s._id) === String(id)) ? { ...s, ...updates } : s) : []);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await slipGajiApi.update(token, id, updates);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) {
            const normalized = { ...serverItem, id: serverItem.id || serverItem._id || id };
            setSlipGajiData(prev => Array.isArray(prev) ? prev.map(s => (String(s.id) === String(id) || String(s._id) === String(id)) ? normalized : s) : []);
          }
        } catch (e) {
          console.error('Failed to update slip gaji on server:', e);
          setSlipGajiData(prevSnapshot);
        }
      }
    },
    deleteSlipGaji: async (id) => {
      const prevSnapshot = Array.isArray(slipGajiData) ? slipGajiData.slice() : [];
      setSlipGajiData(prev => Array.isArray(prev) ? prev.filter(s => (String(s.id) !== String(id) && String(s._id || '') !== String(id))) : []);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await slipGajiApi.delete(token, id);
        } catch (e) {
          console.error('Failed to delete slip gaji on server:', e);
          setSlipGajiData(prevSnapshot);
        }
      }
    },

    cutiData,
    setCutiData,
    addCuti: async (cuti) => {
      const tempId = cuti.id || `CUTI${Date.now()}`;
      const tempItem = { ...cuti, id: tempId, localTemp: true };
      setCutiData(prev => Array.isArray(prev) ? [...prev, tempItem] : [tempItem]);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await cutiApi.create(token, cuti);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) {
            const normalized = normalizeCutiItem({ ...serverItem, id: serverItem.id || serverItem._id || tempId });
            setCutiData(prev => Array.isArray(prev) ? prev.map(p => (p.id === tempId ? normalized : p)) : [normalized]);
          }
        } catch (e) {
          console.error('Failed to create cuti on server:', e);
        }
      }
    },
    updateCuti: async (id, updates) => {
      const normalizedId = id ?? updates?.id ?? updates?._id;
      if (!normalizedId || String(normalizedId).trim() === '' || String(normalizedId) === 'undefined') {
        const err = new Error('Invalid cuti id provided to updateCuti');
        console.error(err.message, { id, updates });
        throw err;
      }
      const isTempLocal = String(normalizedId).startsWith('CUTI');
      const prevSnapshot = Array.isArray(cutiData) ? cutiData.slice() : [];
      setCutiData(prev => Array.isArray(prev) ? prev.map(c => {
        const currentId = c.id ?? c._id;
        return currentId !== undefined && String(currentId) === String(normalizedId) ? { ...normalizeCutiItem(c), ...updates, id: normalizedId } : c;
      }) : []);

      if (isTempLocal) {
        console.warn('Skipping backend update for local-only temporary cuti item:', normalizedId);
        return;
      }

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await cutiApi.update(token, normalizedId, updates);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) {
            const normalized = normalizeCutiItem({ ...serverItem, id: serverItem.id || serverItem._id || normalizedId });
            setCutiData(prev => Array.isArray(prev) ? prev.map(c => {
              const currentId = c.id ?? c._id;
              return currentId !== undefined && String(currentId) === String(normalizedId) ? normalized : c;
            }) : []);
          }
        } catch (e) {
          console.error('Failed to update cuti on server:', e && (e.message || e));
          if (String(e.message).includes('Pengajuan cuti tidak ditemukan')) {
            setCutiData(prev => Array.isArray(prev) ? prev.filter(c => {
              const currentId = c.id ?? c._id;
              return String(currentId) !== String(normalizedId);
            }) : []);
          } else {
            setCutiData(prevSnapshot);
          }
          throw e;
        }
      }
    },
    deleteCuti: async (id) => {
      const prevSnapshot = Array.isArray(cutiData) ? cutiData.slice() : [];
      setCutiData(prev => Array.isArray(prev) ? prev.filter(c => String(c.id) !== String(id) && String(c._id) !== String(id)) : []);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await cutiApi.delete(token, id);
        } catch (e) {
          console.error('Failed to delete cuti on server:', e);
          setCutiData(prevSnapshot);
        }
      }
    },
    getCutiByKaryawan: (nama) => Array.isArray(cutiData) ? cutiData.filter(c => c.nama === nama) : [],
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};