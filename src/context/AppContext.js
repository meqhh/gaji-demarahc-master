import React, { createContext, useState, useEffect } from 'react';
import { getCurrentUser, getKaryawanList } from '../services/authService';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  // User Profile Data - Load from API if authenticated
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
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
        if (res.success && res.data) {
          setKaryawanData(Array.isArray(res.data) ? res.data : []);
        } else if (Array.isArray(res)) {
          setKaryawanData(res);
        } else if (res.karyawan && Array.isArray(res.karyawan)) {
          setKaryawanData(res.karyawan);
        } else {
          // fallback: try to set if object contains array-like fields
          const arr = Object.values(res).find(v => Array.isArray(v));
          if (Array.isArray(arr)) setKaryawanData(arr);
        }
      })
      .catch(err => {
        console.error('Failed to load karyawan list:', err);
        setKaryawanError(err.message || String(err));
      })
      .finally(() => setKaryawanLoading(false));
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

    // Gaji
    gajiData,
    setGajiData,
    addGaji: (gaji) => setGajiData(prev => Array.isArray(prev) ? [...prev, { ...gaji, id: gaji.id || String(Date.now()) }] : [{ ...gaji, id: gaji.id || String(Date.now()) }]),
    updateGaji: (id, updates) => setGajiData(prev => Array.isArray(prev) ? prev.map(g => g.id === id ? { ...g, ...updates } : g) : []),
    deleteGaji: (id) => setGajiData(prev => Array.isArray(prev) ? prev.filter(g => g.id !== id) : []),
    getGajiByKaryawan: (nama) => Array.isArray(gajiData) ? gajiData.find(g => g.nama === nama) : undefined,

    // Treatment
    treatmentData,
    setTreatmentData,
    addTreatment: (treatment) => setTreatmentData(prev => Array.isArray(prev) ? [...prev, { ...treatment, id: treatment.id || String(Date.now()) }] : [{ ...treatment, id: treatment.id || String(Date.now()) }]),
    updateTreatment: (id, updates) => setTreatmentData(prev => Array.isArray(prev) ? prev.map(t => t.id === id ? { ...t, ...updates } : t) : []),
    deleteTreatment: (id) => setTreatmentData(prev => Array.isArray(prev) ? prev.filter(t => t.id !== id) : []),
    getTreatmentById: (id) => Array.isArray(treatmentData) ? treatmentData.find(t => t.id === id) : undefined,

    // Slip Gaji
    slipGajiData,
    setSlipGajiData,
    addSlipGaji: (slip) => setSlipGajiData(prev => Array.isArray(prev) ? [...prev, { ...slip, id: slip.id || String(Date.now()) }] : [{ ...slip, id: slip.id || String(Date.now()) }]),
    updateSlipGaji: (id, updates) => setSlipGajiData(prev => Array.isArray(prev) ? prev.map(s => s.id === id ? { ...s, ...updates } : s) : []),
    deleteSlipGaji: (id) => setSlipGajiData(prev => Array.isArray(prev) ? prev.filter(s => s.id !== id) : []),
    getSlipGajiByKaryawan: (nama) => Array.isArray(slipGajiData) ? slipGajiData.filter(s => s.nama === nama) : [],

    // Cuti
    cutiData,
    setCutiData,
    addCuti: (cuti) => setCutiData(prev => Array.isArray(prev) ? [...prev, { ...cuti, id: cuti.id || String(Date.now()) }] : [{ ...cuti, id: cuti.id || String(Date.now()) }]),
    updateCuti: (id, updates) => setCutiData(prev => Array.isArray(prev) ? prev.map(c => c.id === id ? { ...c, ...updates } : c) : []),
    deleteCuti: (id) => setCutiData(prev => Array.isArray(prev) ? prev.filter(c => c.id !== id) : []),
    getCutiByKaryawan: (nama) => Array.isArray(cutiData) ? cutiData.filter(c => c.nama === nama) : [],
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
