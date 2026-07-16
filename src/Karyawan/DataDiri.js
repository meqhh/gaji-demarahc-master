import React, { useState, useEffect, useContext, useCallback } from "react";
import { AppContext } from "../context/AppContext";
import { updateKaryawanProfile, getProfileOptions, getKaryawanById } from "../services/authService";

const buildStorageKeys = (identity) => ({
  profileKey: `karyawanProfileData:${identity}`,
  draftKey: `karyawanProfileDraft:${identity}`
});

export default function DataDiri() {
  const { userProfile, karyawanData: contextKaryawanData = [], setKaryawanData } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [karyawanData, setLocalKaryawanData] = useState({
    nama: "",
    tempatLahir: "",
    tanggalLahir: "",
    status: "",
    posisi: "",
    alamat: "",
    noTelepon: "",
    email: "",
    scanKontrak: "",
    scanTtd: "",
    foto: ""
  });

  const [formData, setFormData] = useState(karyawanData);
  const [dropdownOptions, setDropdownOptions] = useState({
    status: [],
    posisi: [],
    tempatLahir: []
  });
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null); 
  const [saveError, setSaveError] = useState('');

  const user = userProfile || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const identity = user?.id || user?.user_id || user?.karyawanId || 'guest';
  const storageKeys = buildStorageKeys(identity);

  // Semua field pada data diri kini bisa diisi manual oleh karyawan.
  const getEditableFields = () => [];

  const isFieldReadOnly = (fieldName) => {
    return getEditableFields().includes(fieldName);
  };

  // Fetch dropdown options
  useEffect(() => {
    const fetchOptions = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        setLoadingOptions(true);
        const response = await getProfileOptions(token);
        if (response.success && response.data) {
          setDropdownOptions({
            status: response.data.status || [],
            posisi: response.data.posisi || [],
            tempatLahir: response.data.tempatLahir || []
          });
        }
      } catch (error) {
        console.warn('Gagal fetch dropdown options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const resolveCurrentKaryawan = () => {
    const karyawanId = localStorage.getItem('karyawanId') || user?.karyawanId || user?.id || user?.user_id;
    const userId = user?.id || user?.user_id;
    const userEmail = user?.email;
    if (!Array.isArray(contextKaryawanData)) return null;
    return (
      contextKaryawanData.find((k) =>
        (karyawanId && String(k.id) === String(karyawanId)) ||
        (k.user_id && userId && String(k.user_id) === String(userId)) ||
        (k.email && userEmail && String(k.email).toLowerCase() === String(userEmail).toLowerCase())
      ) || null
    );
  };

  const parseDateForInput = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.split('T')[0];
      return d.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  const mapKaryawanToForm = (item, fallbackUser = null) => ({
    nama: item?.nama || item?.name || fallbackUser?.nama || fallbackUser?.name || '',
    tempatLahir: (item?.tempatLahir || item?.tempat_lahir || item?.tempatTanggalLahir || '').toLowerCase(),
    tanggalLahir: parseDateForInput(item?.tanggalLahir || item?.tanggal_lahir || ''),
    status: (item?.status || '').toLowerCase(),
    posisi: (item?.posisi || item?.jabatan || '').toLowerCase(),
    alamat: item?.alamat || item?.address || '',
    noTelepon: item?.no_hp || item?.noTelepon || '',
    email: item?.email || fallbackUser?.email || '',
    scanKontrak: item?.scanKontrak || item?.scan_kontrak || '',
    scanTtd: item?.scanTtd || item?.scan_ttd || '',
    foto: item?.foto || item?.photo || ''
  });

  // Helper function untuk mendapatkan label dari value di dropdown
  const getOptionLabel = (optionType, value) => {
    if (!value) return value;
    const options = dropdownOptions[optionType];
    if (!options || options.length === 0) return value;
    const option = options.find(opt => String(opt.value).toLowerCase() === String(value).toLowerCase());
    return option ? option.label : value;
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const fetchProfileFromServer = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setProfileLoading(false);
      return;
    }

    try {
      const savedDraft = localStorage.getItem(storageKeys.draftKey);
      if (savedDraft && isEditing) {
        const draftData = JSON.parse(savedDraft);
        setFormData(draftData);
        setLocalKaryawanData(draftData);
        setProfileLoading(false);
        return;
      }
    } catch (_) {}

    try {
      setProfileLoading(true);
      const karyawanId = localStorage.getItem('karyawanId')
        || userProfile?.karyawanId
        || resolveCurrentKaryawan()?.id;

      if (karyawanId) {
        const res = await getKaryawanById(token, karyawanId);
        if (res?.success && res?.data) {
          const serverData = mapKaryawanToForm(res.data, user);
          setLocalKaryawanData(serverData);
          setFormData(serverData);
          try {
            localStorage.setItem(storageKeys.profileKey, JSON.stringify(serverData));
          } catch (_) {}
          return;
        }
      }
      if (Array.isArray(contextKaryawanData) && contextKaryawanData.length > 0) {
        const found = resolveCurrentKaryawan();
        if (found) {
          const data = mapKaryawanToForm(found, user);
          setLocalKaryawanData(data);
          setFormData(data);
          return;
        }
      }

      try {
        const saved = localStorage.getItem(storageKeys.profileKey);
        if (saved) {
          const data = JSON.parse(saved);
          setLocalKaryawanData(data);
          setFormData(data);
          return;
        }
      } catch (_) {}

      if (user) {
        const fallback = mapKaryawanToForm(null, user);
        setLocalKaryawanData(fallback);
        setFormData(fallback);
      }
    } catch (error) {
      console.warn('Gagal fetch profil dari server, menggunakan fallback.', error);
      try {
        const saved = localStorage.getItem(storageKeys.profileKey);
        if (saved) {
          const data = JSON.parse(saved);
          setLocalKaryawanData(data);
          setFormData(data);
        }
      } catch (_) {}
    } finally {
      setProfileLoading(false);
    }
  }, [userProfile, contextKaryawanData, storageKeys.profileKey, storageKeys.draftKey]);

  useEffect(() => {
    fetchProfileFromServer();
  }, [fetchProfileFromServer]);

  // Persist draft while user is editing so data is not lost when navigating.
  useEffect(() => {
    if (!isEditing) return;
    try {
      localStorage.setItem(storageKeys.draftKey, JSON.stringify(formData));
    } catch (error) {
      console.warn('Gagal menyimpan draft data diri.', error);
    }
  }, [formData, isEditing, storageKeys.draftKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const currentKaryawan = resolveCurrentKaryawan();
    const karyawanId = localStorage.getItem('karyawanId') || userProfile?.karyawanId || currentKaryawan?.id;

    // Update semua field data diri yang bisa diedit oleh karyawan
    const updates = {
      nama: formData.nama,
      no_hp: formData.noTelepon,
      alamat: formData.alamat,
      email: formData.email,
      tempatLahir: formData.tempatLahir || "",
      tanggalLahir: formData.tanggalLahir || "",
      status: formData.status,
      jabatan: formData.posisi,
      scanKontrak: formData.scanKontrak,
      scanTtd: formData.scanTtd,
      foto: formData.foto
    };

    if (token && karyawanId) {
      try {
        setSaveStatus('saving');
        const result = await updateKaryawanProfile(token, karyawanId, updates);
        if (result && result.success === false) {
          throw new Error(result.message || 'Gagal menyimpan ke server');
        }
      } catch (error) {
        console.warn('Gagal menyimpan data ke server:', error);
        setSaveStatus('error');
        setSaveError(error.message || 'Gagal menyimpan data ke server');
        return; 
      }
    }

    const updatedLocal = { 
      ...formData
    };
    setLocalKaryawanData(updatedLocal);

    if (typeof setKaryawanData === 'function') {
      const updatedContextKaryawan = {
        id: currentKaryawan?.id || karyawanId || `EMP${Date.now()}`,
        user_id: currentKaryawan?.user_id || userProfile?.id || null,
        nama: formData.nama,
        email: formData.email,
        jabatan: formData.posisi || 'Karyawan',
        posisi: formData.posisi,
        no_hp: formData.noTelepon,
        alamat: formData.alamat,
        tempatLahir: formData.tempatLahir,
        tanggalLahir: formData.tanggalLahir,
        scanKontrak: formData.scanKontrak,
        scanTtd: formData.scanTtd,
        foto: formData.foto,
        status: formData.status
      };

      setKaryawanData(prev => {
        const current = Array.isArray(prev) ? [...prev] : [];
        const existsIndex = current.findIndex(k => {
          if (!k) return false;
          const sameId = k.id !== undefined && updatedContextKaryawan.id !== undefined && String(k.id) === String(updatedContextKaryawan.id);
          const sameUser = k.user_id !== undefined && updatedContextKaryawan.user_id !== undefined && String(k.user_id) === String(updatedContextKaryawan.user_id);
          const sameEmail = k.email && updatedContextKaryawan.email && String(k.email).toLowerCase() === String(updatedContextKaryawan.email).toLowerCase();
          return sameId || sameUser || sameEmail;
        });
        if (existsIndex > -1) {
          current[existsIndex] = { ...current[existsIndex], ...updatedContextKaryawan };
          return current;
        }
        return [...current, updatedContextKaryawan];
      });
    }

    try {
      localStorage.removeItem(storageKeys.profileKey);
      localStorage.removeItem(storageKeys.draftKey);
    } catch (error) {
      console.warn('Gagal membersihkan cache localStorage.', error);
    }

    setIsEditing(false);
    setSaveStatus('success');
    setSaveError('');
    setTimeout(() => setSaveStatus(null), 3000);
    setTimeout(() => fetchProfileFromServer(), 300);
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newFormData = { ...formData, foto: reader.result };
      setFormData(newFormData);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (fieldName) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, [fieldName]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const ImagePreviewBox = ({ src, label, emptyText = 'Belum ada gambar' }) => (
    <div
      className="w-full rounded-md border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center"
      style={{ minHeight: '130px' }}
    >
      {src ? (
        <img
          src={src}
          alt={label}
          className="w-full object-contain"
          style={{ maxHeight: '200px' }}
        />
      ) : (
        <div className="flex flex-col items-center gap-1 py-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-gray-400 italic">{emptyText}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      {profileLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-500">Memuat data profil...</span>
          </div>
        </div>
      )}
      {!profileLoading && (
        <>
        {/* Header */}
        <div className="mb-8 rounded-xl border border-gray-200 bg-gradient-to-r from-white to-gray-50 px-5 py-4 shadow-sm">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Data Diri</h1>
          <p className="mt-1 text-sm font-medium text-gray-700">Informasi pribadi dan profesional Anda</p>
        </div>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left: Profile Photo */}
            <div className="flex flex-col items-center">
              <div className="w-40 h-52 bg-gray-100 rounded-md overflow-hidden shadow-sm border border-gray-200 mb-4 flex items-center justify-center">
                {isEditing ? (
                  formData.foto ? (
                    <img src={formData.foto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-300 text-sm">No Photo</div>
                  )
                ) : (
                  karyawanData.foto ? (
                    <img src={karyawanData.foto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-gray-300 text-sm">No Photo</div>
                  )
                )}
              </div>
              
              {isEditing && (
                <label className="bg-gray-700 text-white font-medium text-sm px-5 py-2 rounded-md cursor-pointer hover:bg-gray-800 transition w-full text-center">
                  Ganti Foto
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleUpload} 
                    className="hidden" 
                  />
                </label>
              )}

              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-700 text-white font-medium text-sm px-5 py-2 rounded-md hover:bg-gray-800 transition w-full"
                >
                  Ubah Data
                </button>
              )}
            </div>

            {/* Right: Employee Data */}
            <div className="lg:col-span-3">
              {!isEditing ? (
                <div className="space-y-0">
                  <div className="grid grid-cols-2 gap-y-0 gap-x-8">
                    {/* Row 1 */}
                    <div className="border-b border-gray-200 py-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nama</div>
                      <div className="text-gray-900 font-medium text-base mt-1">{karyawanData.nama}</div>
                    </div>

                    <div className="border-b border-gray-200 py-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tempat, Tanggal Lahir</div>
                      <div className="text-gray-900 font-medium text-base mt-1">
                        {getOptionLabel('tempatLahir', karyawanData.tempatLahir)}
                        {karyawanData.tanggalLahir ? `, ${formatDateDisplay(karyawanData.tanggalLahir)}` : ''}
                      </div>
                    </div>

                    {/* Row 2 */}
                    <div className="border-b border-gray-200 py-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</div>
                      <div className="text-gray-900 font-medium text-base mt-1">{getOptionLabel('status', karyawanData.status)}</div>
                    </div>

                    <div className="border-b border-gray-200 py-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Posisi</div>
                      <div className="text-gray-900 font-medium text-base mt-1">{karyawanData.posisi}</div>
                    </div>

                    {/* Row 3 */}
                    <div className="border-b border-gray-200 py-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Alamat</div>
                      <div className="text-gray-900 font-medium text-base mt-1">{karyawanData.alamat}</div>
                    </div>

                    <div className="border-b border-gray-200 py-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">No Telepon</div>
                      <div className="text-gray-900 font-medium text-base mt-1">{karyawanData.noTelepon}</div>
                    </div>

                    {/* Row 4 */}
                    <div className="border-b border-gray-200 py-4 col-span-2">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</div>
                      <div className="text-gray-900 font-medium text-base mt-1">{karyawanData.email}</div>
                    </div>

                    <div className="border-b border-gray-200 py-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Scan / Foto Kontrak</div>
                      <ImagePreviewBox src={karyawanData.scanKontrak} label="Scan Kontrak" emptyText="Belum ada scan kontrak" />
                    </div>

                    <div className="border-b border-gray-200 py-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Scan / Foto TTD</div>
                      <ImagePreviewBox src={karyawanData.scanTtd} label="Scan TTD" emptyText="Belum ada scan TTD" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                    <p className="text-xs text-blue-700 font-medium">
                      ℹ️ Silakan perbarui data diri Anda. Nama, alamat, no telepon, dan email dapat diisi secara manual.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-semibold block mb-2 ${isFieldReadOnly('nama') ? 'text-gray-400' : 'text-gray-700'}`}>Nama</label>
                      <input 
                        type="text" 
                        name="nama" 
                        value={formData.nama} 
                        onChange={handleChange}
                        disabled={isFieldReadOnly('nama')}
                        className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-transparent transition ${
                          isFieldReadOnly('nama') 
                            ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' 
                            : 'border-gray-300 text-gray-800 focus:ring-gray-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Tempat Lahir</label>
                      <input
                        type="text"
                        name="tempatLahir"
                        placeholder="Ketik tempat lahir"
                        value={formData.tempatLahir}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Tanggal Lahir</label>
                      <input
                        type="date"
                        name="tanggalLahir"
                        value={formData.tanggalLahir}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Status</label>
                      <select 
                        name="status" 
                        value={formData.status} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent bg-white"
                      >
                        <option value="">Pilih Status</option>
                        {dropdownOptions.status.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Posisi</label>
                      <select 
                        name="posisi" 
                        value={formData.posisi} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent bg-white"
                      >
                        <option value="">Pilih Posisi</option>
                        {dropdownOptions.posisi.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className={`text-xs font-semibold block mb-2 ${isFieldReadOnly('alamat') ? 'text-gray-400' : 'text-gray-700'}`}>Alamat</label>
                      <input 
                        type="text" 
                        name="alamat" 
                        value={formData.alamat} 
                        onChange={handleChange}
                        disabled={isFieldReadOnly('alamat')}
                        className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-transparent transition ${
                          isFieldReadOnly('alamat') 
                            ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' 
                            : 'border-gray-300 text-gray-800 focus:ring-gray-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs font-semibold block mb-2 ${isFieldReadOnly('noTelepon') ? 'text-gray-400' : 'text-gray-700'}`}>No Telepon</label>
                      <input 
                        type="text" 
                        name="noTelepon" 
                        value={formData.noTelepon} 
                        onChange={handleChange}
                        disabled={isFieldReadOnly('noTelepon')}
                        className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-transparent transition ${
                          isFieldReadOnly('noTelepon') 
                            ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' 
                            : 'border-gray-300 text-gray-800 focus:ring-gray-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs font-semibold block mb-2 ${isFieldReadOnly('email') ? 'text-gray-400' : 'text-gray-700'}`}>Email</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange}
                        disabled={isFieldReadOnly('email')}
                        className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-transparent transition ${
                          isFieldReadOnly('email') 
                            ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed' 
                            : 'border-gray-300 text-gray-800 focus:ring-gray-400'
                        }`}
                      />
                    </div>

                    <div className="col-span-1">
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Scan / Foto Kontrak</label>
                      <ImagePreviewBox src={formData.scanKontrak} label="Scan Kontrak" emptyText="Belum ada gambar" />
                      <label className="mt-2 flex items-center justify-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 transition border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4" />
                        </svg>
                        Upload Scan Kontrak
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload('scanKontrak')}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="col-span-1">
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Scan / Foto TTD</label>
                      <ImagePreviewBox src={formData.scanTtd} label="Scan TTD" emptyText="Belum ada gambar" />
                      <label className="mt-2 flex items-center justify-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 transition border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4" />
                        </svg>
                        Upload Scan TTD
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload('scanTtd')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 flex-wrap">
                    <button 
                      onClick={handleSave}
                      disabled={saveStatus === 'saving'}
                      className="bg-gray-700 hover:bg-gray-800 text-white font-medium text-sm px-6 py-2 rounded-md transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saveStatus === 'saving' && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {saveStatus === 'saving' ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        setSaveStatus(null);
                        setFormData(karyawanData);
                      }}
                      disabled={saveStatus === 'saving'}
                      className="bg-gray-400 hover:bg-gray-500 text-white font-medium text-sm px-6 py-2 rounded-md transition disabled:opacity-60"
                    >
                      Batal
                    </button>
                  </div>
                  {saveStatus === 'error' && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-xs text-red-700 font-medium">❌ {saveError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
