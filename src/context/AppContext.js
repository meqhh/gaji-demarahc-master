import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  // User Profile Data
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : {
      id: 'ADMIN001',
      name: 'Admin Panel',
      email: 'admin@demara.com',
      role: 'Administrator',
      phone: '+62 812-3456-7890',
      address: 'Jl. Merdeka No. 123, Jakarta',
      joinDate: '01 Januari 2024',
      department: 'Management',
      bio: 'Mengelola sistem administrasi Demara',
      photo: 'https://ui-avatars.com/api/?name=Admin+Panel&background=6B7280&color=fff&bold=true'
    };
  });

  // Karyawan Data
  const [karyawanData, setKaryawanData] = useState(() => {
    const saved = localStorage.getItem('karyawanData');
    return saved ? JSON.parse(saved) : [];
  });

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
    updateUserProfile: (updates) => setUserProfile(prev => ({ ...prev, ...updates })),

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
