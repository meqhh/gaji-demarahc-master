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

export const AppContextProvider = ({ children }) => {
  const getCurrentRole = () => {
    const contextRole = userProfile?.role;
    if (contextRole) return String(contextRole).toLowerCase();
    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) return '';
      const parsedUser = JSON.parse(rawUser);
      return String(parsedUser?.role || '').toLowerCase();
    } catch (e) {
      return '';
    }
  };
  // User Profile Data - Load from API if authenticated
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      // Normalize backend field `nama` to `name` for frontend components
      if (parsed && parsed.nama && !parsed.name) parsed.name = parsed.nama;
      return parsed;
    } catch (e) {
      return null;
    }
  });

  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

  // Karyawan Data
  const [karyawanData, setKaryawanData] = useState(() => {
    const saved = localStorage.getItem('karyawanData');
    return saved ? JSON.parse(saved) : [];
  });
  const [karyawanLoading, setKaryawanLoading] = useState(false);
  const [karyawanError, setKaryawanError] = useState(null);

  // Absensi Data
  const [absensiData, setAbsensiData] = useState(() => {
    const saved = localStorage.getItem('absensiData');
    return saved ? JSON.parse(saved) : [];
  });

  // Gaji Data
  const [gajiData, setGajiData] = useState(() => {
    const saved = localStorage.getItem('gajiData');
    return saved ? JSON.parse(saved) : [];
  });

  // Treatment Data
  const [treatmentData, setTreatmentData] = useState(() => {
    const saved = localStorage.getItem('treatmentData');
    return saved ? JSON.parse(saved) : [];
  });

  // Slip Gaji Data
  const [slipGajiData, setSlipGajiData] = useState(() => {
    const saved = localStorage.getItem('slipGajiData');
    return saved ? JSON.parse(saved) : [];
  });

  // Cuti Data
  const [cutiData, setCutiData] = useState(() => {
    const saved = localStorage.getItem('cutiData');
    return saved ? JSON.parse(saved) : [];
  });

  // Simpan user profile ke localStorage
  useEffect(() => {
    saveToLocalStorage('userProfile', userProfile);
  }, [userProfile]);

  // Load user profile dari API jika ada token
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      setUserLoading(true);
      getCurrentUser(token)
        .then(res => {
          if (res.success && res.data) {
            // Normalize backend `nama` -> `name` to keep frontend consistent
            const user = { ...res.data };
            if (user.nama && !user.name) user.name = user.nama;
            setUserProfile(user);
            // Update localStorage userProfile dengan data fresh dari API
            saveToLocalStorage('userProfile', user);
            setUserError(null);
          }
        })
        .catch(err => {
          console.error('Failed to load user profile:', err);
          setUserError(err.message);
          // Clear invalid data jika token tidak valid
          setUserProfile(null);
          localStorage.removeItem('userProfile');
        })
        .finally(() => {
          setUserLoading(false);
        });
    } else {
      // Tidak ada token, pastikan userProfile kosong
      setUserProfile(null);
      localStorage.removeItem('userProfile');
      setUserLoading(false);
    }
  }, []);

  // Fetch karyawan list from backend when authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setKaryawanLoading(true);
    setKaryawanError(null);

    getKaryawanList(token)
      .then(res => {
        // Support API shapes { success, data } or direct array
        if (!res) return;
        // Extract server array
        let serverArr = [];
        if (res.success && res.data) serverArr = Array.isArray(res.data) ? res.data : [];
        else if (Array.isArray(res)) serverArr = res;
        else if (res.karyawan && Array.isArray(res.karyawan)) serverArr = res.karyawan;
        else {
          const arr = Object.values(res).find(v => Array.isArray(v));
          if (Array.isArray(arr)) serverArr = arr;
        }

        // Merge serverArr with any local-only or locally updated entries stored in localStorage.
        // Local changes should override the server values for the same karyawan record.
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

  // Fetch other datasets (absensi, gaji, slip gaji, cuti, treatment) when authenticated
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

        if (Array.isArray(absensiRes)) setAbsensiData(absensiRes);
        if (Array.isArray(gajiRes)) setGajiData(gajiRes);
        if (Array.isArray(slipRes)) setSlipGajiData(slipRes);

        if (Array.isArray(cutiRes)) {
          try {
            const savedLocalCuti = JSON.parse(localStorage.getItem('cutiData')) || [];
            const mergedCuti = Array.isArray(cutiRes) ? [...cutiRes] : [];

            savedLocalCuti.forEach((localItem) => {
              if (!localItem) return;
              const matchIndex = mergedCuti.findIndex((serverItem) => {
                if (!serverItem) return false;
                if (serverItem.id !== undefined && localItem.id !== undefined && String(serverItem.id) === String(localItem.id)) return true;
                if (serverItem._id !== undefined && localItem._id !== undefined && String(serverItem._id) === String(localItem._id)) return true;
                return false;
              });
              if (matchIndex > -1) {
                mergedCuti[matchIndex] = { ...mergedCuti[matchIndex], ...localItem };
              } else {
                mergedCuti.push(localItem);
              }
            });

            setCutiData(mergedCuti);
          } catch (mergeError) {
            console.warn('Could not merge server and local cuti data, using server data only.', mergeError);
            setCutiData(cutiRes);
          }
        }

        if (Array.isArray(treatmentRes)) setTreatmentData(treatmentRes);
      } catch (e) {
        console.error('Failed to fetch additional datasets', e);
      }
    })();
  }, [userProfile]);

  // Simpan karyawan data ke localStorage
  useEffect(() => {
    saveToLocalStorage('karyawanData', karyawanData);
  }, [karyawanData]);

  // Simpan absensi data ke localStorage
  useEffect(() => {
    saveToLocalStorage('absensiData', absensiData);
  }, [absensiData]);

  // Simpan gaji data ke localStorage
  useEffect(() => {
    saveToLocalStorage('gajiData', gajiData);
  }, [gajiData]);

  // Simpan treatment data ke localStorage
  useEffect(() => {
    saveToLocalStorage('treatmentData', treatmentData);
  }, [treatmentData]);

  // Simpan slip gaji data ke localStorage
  useEffect(() => {
    saveToLocalStorage('slipGajiData', slipGajiData);
  }, [slipGajiData]);

  // Simpan cuti data ke localStorage
  useEffect(() => {
    saveToLocalStorage('cutiData', cutiData);
  }, [cutiData]);

  const value = {
    // User Profile
    userProfile,
    setUserProfile,
    userLoading,
    userError,
    updateUserProfile: (updates) => setUserProfile(prev => ({ ...prev, ...updates })),

    // Karyawan
    karyawanData,
    karyawanLoading,
    karyawanError,
    setKaryawanData,
    addKaryawan: async (karyawan) => {
      // optimistic add locally
      const tempId = karyawan.id || `EMP${Date.now()}`;
      const tempItem = { ...karyawan, id: tempId };
      setKaryawanData(prev => Array.isArray(prev) ? [...prev, tempItem] : [tempItem]);

      // if authenticated, try to persist to server
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
      // optimistic update locally
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
      const target = Array.isArray(karyawanData)
        ? karyawanData.find(k => String(k?.id) === String(id))
        : null;
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

      // optimistic delete locally + sync related admin datasets
      const prevSnapshot = {
        karyawanData: Array.isArray(karyawanData) ? karyawanData.slice() : [],
        absensiData: Array.isArray(absensiData) ? absensiData.slice() : [],
        gajiData: Array.isArray(gajiData) ? gajiData.slice() : [],
        treatmentData: Array.isArray(treatmentData) ? treatmentData.slice() : [],
        slipGajiData: Array.isArray(slipGajiData) ? slipGajiData.slice() : [],
        cutiData: Array.isArray(cutiData) ? cutiData.slice() : []
      };

      setKaryawanData(prev => Array.isArray(prev)
        ? prev.filter(k => !(String(k.id) === String(id) || (target && isSameKaryawanRecord(k, target))))
        : []
      );
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
            // rollback only when server truly fails; keep local delete for stale/non-server records
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

    // Absensi
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

    // Gaji
    gajiData,
    setGajiData,
    addGaji: async (gaji) => {
      const tempId = gaji.id || `GAJI${Date.now()}`;
      const tempItem = { ...gaji, id: tempId };
      setGajiData(prev => Array.isArray(prev) ? [...prev, tempItem] : [tempItem]);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await gajiApi.create(token, gaji);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) setGajiData(prev => Array.isArray(prev) ? prev.map(p => p.id === tempId ? serverItem : p) : [serverItem]);
        } catch (e) {
          console.error('Failed to create gaji on server:', e);
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
          if (serverItem) setGajiData(prev => Array.isArray(prev) ? prev.map(g => g.id === id ? serverItem : g) : []);
        } catch (e) {
          console.error('Failed to update gaji on server:', e);
          setGajiData(prevSnapshot);
        }
      }
    },
    deleteGaji: async (id) => {
      const prevSnapshot = Array.isArray(gajiData) ? gajiData.slice() : [];
      setGajiData(prev => Array.isArray(prev) ? prev.filter(g => g.id !== id) : []);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await gajiApi.delete(token, id);
        } catch (e) {
          console.error('Failed to delete gaji on server:', e);
          setGajiData(prevSnapshot);
        }
      }
    },
    getGajiByKaryawan: (nama) => Array.isArray(gajiData) ? gajiData.find(g => g.nama === nama) : undefined,

    // Treatment
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

    // Slip Gaji
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
          if (serverItem) setSlipGajiData(prev => Array.isArray(prev) ? prev.map(p => p.id === tempId ? serverItem : p) : [serverItem]);
        } catch (e) {
          console.error('Failed to create slip gaji on server:', e);
        }
      }
    },
    updateSlipGaji: async (id, updates) => {
      const prevSnapshot = Array.isArray(slipGajiData) ? slipGajiData.slice() : [];
      setSlipGajiData(prev => Array.isArray(prev) ? prev.map(s => s.id === id ? { ...s, ...updates } : s) : []);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await slipGajiApi.update(token, id, updates);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) setSlipGajiData(prev => Array.isArray(prev) ? prev.map(s => s.id === id ? serverItem : s) : []);
        } catch (e) {
          console.error('Failed to update slip gaji on server:', e);
          setSlipGajiData(prevSnapshot);
        }
      }
    },
    deleteSlipGaji: async (id) => {
      const prevSnapshot = Array.isArray(slipGajiData) ? slipGajiData.slice() : [];
      setSlipGajiData(prev => Array.isArray(prev) ? prev.filter(s => s.id !== id) : []);
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

    // Cuti
    cutiData,
    setCutiData,
    addCuti: async (cuti) => {
      const tempId = cuti.id || `CUTI${Date.now()}`;
      const tempItem = { ...cuti, id: tempId };
      setCutiData(prev => Array.isArray(prev) ? [...prev, tempItem] : [tempItem]);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await cutiApi.create(token, cuti);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) {
            const normalized = { ...serverItem, id: serverItem.id || serverItem._id || tempId };
            setCutiData(prev => Array.isArray(prev) ? prev.map(p => (p.id === tempId ? normalized : p)) : [normalized]);
          }
        } catch (e) {
          console.error('Failed to create cuti on server:', e);
        }
      }
    },
    updateCuti: async (id, updates) => {
      const prevSnapshot = Array.isArray(cutiData) ? cutiData.slice() : [];
      setCutiData(prev => Array.isArray(prev) ? prev.map(c => (String(c.id) === String(id) || String(c._id) === String(id) ? { ...c, ...updates } : c)) : []);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await cutiApi.update(token, id, updates);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) {
            const normalized = { ...serverItem, id: serverItem.id || serverItem._id || id };
            setCutiData(prev => Array.isArray(prev) ? prev.map(c => (String(c.id) === String(id) || String(c._id) === String(id) ? normalized : c)) : []);
          }
        } catch (e) {
          console.error('Failed to update cuti on server:', e);
          setCutiData(prevSnapshot);
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
