import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, getKaryawanList, createKaryawan, updateKaryawan as updateKaryawanApi, deleteKaryawan as deleteKaryawanApi, gajiApi, absensiApi, cutiApi, treatmentApi, slipGajiApi } from '../services/authService';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
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
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
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
            localStorage.setItem('userProfile', JSON.stringify(user));
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

  useEffect(() => {
    if (!userProfile || userProfile.role?.toString().toLowerCase() !== 'karyawan') return;

    const exists = Array.isArray(karyawanData) && karyawanData.some(k =>
      String(k.id) === String(userProfile.id) ||
      (k.email && userProfile.email && k.email === userProfile.email) ||
      (k.nama && userProfile.name && k.nama === userProfile.name)
    );

    if (exists) return;

    const newKaryawan = {
      id: userProfile.id || `EMP${Date.now()}`,
      nama: userProfile.name || userProfile.nama,
      email: userProfile.email || null,
      jabatan: 'Karyawan',
      gaji_pokok: 0,
      tunjangan: 0,
      no_hp: null,
      alamat: null
    };

    setKaryawanData(prev => Array.isArray(prev) ? [...prev, newKaryawan] : [newKaryawan]);
  }, [userProfile, karyawanData]);

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

        // Merge serverArr with any local-only entries stored in localStorage
        try {
          const localStr = localStorage.getItem('karyawanData');
          const localArr = localStr ? JSON.parse(localStr) : [];
          if (Array.isArray(localArr) && localArr.length > 0) {
            const merged = [...serverArr];
            const hasId = (id) => merged.some(m => m && (m.id === id || m.id === String(id)));
            localArr.forEach(localItem => {
              if (!localItem) return;
              // if local item not present on server by id or email, add it
              const exists = (localItem.id && hasId(localItem.id)) || merged.some(m => m.email && localItem.email && m.email === localItem.email);
              if (!exists) merged.push(localItem);
            });
            setKaryawanData(merged);
          } else {
            setKaryawanData(serverArr);
          }
        } catch (e) {
          setKaryawanData(serverArr);
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

    const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5555') + '/api';

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
        if (Array.isArray(cutiRes)) setCutiData(cutiRes);
        if (Array.isArray(treatmentRes)) setTreatmentData(treatmentRes);
      } catch (e) {
        console.error('Failed to fetch additional datasets', e);
      }
    })();
  }, [userProfile]);

  // Simpan karyawan data ke localStorage
  useEffect(() => {
    localStorage.setItem('karyawanData', JSON.stringify(karyawanData));
  }, [karyawanData]);

  // Simpan absensi data ke localStorage
  useEffect(() => {
    localStorage.setItem('absensiData', JSON.stringify(absensiData));
  }, [absensiData]);

  // Simpan gaji data ke localStorage
  useEffect(() => {
    localStorage.setItem('gajiData', JSON.stringify(gajiData));
  }, [gajiData]);

  // Simpan treatment data ke localStorage
  useEffect(() => {
    localStorage.setItem('treatmentData', JSON.stringify(treatmentData));
  }, [treatmentData]);

  // Simpan slip gaji data ke localStorage
  useEffect(() => {
    localStorage.setItem('slipGajiData', JSON.stringify(slipGajiData));
  }, [slipGajiData]);

  // Simpan cuti data ke localStorage
  useEffect(() => {
    localStorage.setItem('cutiData', JSON.stringify(cutiData));
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
      setKaryawanData(prev => Array.isArray(prev) ? prev.map(k => k.id === id ? { ...k, ...updates } : k) : []);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await updateKaryawanApi(token, id, updates);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) {
            setKaryawanData(prev => Array.isArray(prev) ? prev.map(k => k.id === id ? serverItem : k) : []);
          }
        } catch (e) {
          console.error('Failed to update karyawan on server:', e);
        }
      }
    },

    deleteKaryawan: async (id) => {
      // optimistic delete locally
      const prevSnapshot = Array.isArray(karyawanData) ? karyawanData.slice() : [];
      setKaryawanData(prev => Array.isArray(prev) ? prev.filter(k => k.id !== id) : []);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await deleteKaryawanApi(token, id);
        } catch (e) {
          console.error('Failed to delete karyawan on server:', e);
          // rollback on failure
          setKaryawanData(prevSnapshot);
        }
      }
    },
    getKaryawanById: (id) => karyawanData.find(k => k.id === id),

    // Absensi
    absensiData,
    setAbsensiData,
    addAbsensi: async (absensi) => {
      const tempId = absensi.id || `ABS${Date.now()}`;
      const tempItem = { ...absensi, id: tempId };
      setAbsensiData(prev => Array.isArray(prev) ? [...prev, tempItem] : [tempItem]);
      const token = localStorage.getItem('token');
      if (token) {
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
      setAbsensiData(prev => Array.isArray(prev) ? prev.map(a => a.id === id ? { ...a, ...updates } : a) : []);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await absensiApi.update(token, id, updates);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) setAbsensiData(prev => Array.isArray(prev) ? prev.map(a => a.id === id ? serverItem : a) : []);
        } catch (e) {
          console.error('Failed to update absensi on server:', e);
          setAbsensiData(prevSnapshot);
        }
      }
    },
    deleteAbsensi: async (id) => {
      const prevSnapshot = Array.isArray(absensiData) ? absensiData.slice() : [];
      setAbsensiData(prev => Array.isArray(prev) ? prev.filter(a => a.id !== id) : []);
      const token = localStorage.getItem('token');
      if (token) {
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
          if (serverItem) setCutiData(prev => Array.isArray(prev) ? prev.map(p => p.id === tempId ? serverItem : p) : [serverItem]);
        } catch (e) {
          console.error('Failed to create cuti on server:', e);
        }
      }
    },
    updateCuti: async (id, updates) => {
      const prevSnapshot = Array.isArray(cutiData) ? cutiData.slice() : [];
      setCutiData(prev => Array.isArray(prev) ? prev.map(c => c.id === id ? { ...c, ...updates } : c) : []);
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await cutiApi.update(token, id, updates);
          const serverItem = res && res.data ? res.data : null;
          if (serverItem) setCutiData(prev => Array.isArray(prev) ? prev.map(c => c.id === id ? serverItem : c) : []);
        } catch (e) {
          console.error('Failed to update cuti on server:', e);
          setCutiData(prevSnapshot);
        }
      }
    },
    deleteCuti: async (id) => {
      const prevSnapshot = Array.isArray(cutiData) ? cutiData.slice() : [];
      setCutiData(prev => Array.isArray(prev) ? prev.filter(c => c.id !== id) : []);
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
