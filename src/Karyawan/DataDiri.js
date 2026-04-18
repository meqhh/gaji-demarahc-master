import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { updateKaryawanProfile, getProfileOptions } from "../services/authService";

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
    tanggalMasuk: "",
    tanggalKontrak: "",
    foto: ""
  });

  const [formData, setFormData] = useState(karyawanData);
  const [dropdownOptions, setDropdownOptions] = useState({
    status: [],
    posisi: [],
    tempatLahir: []
  });
  const [loadingOptions, setLoadingOptions] = useState(false);
  
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

  const mapKaryawanToForm = (item, fallbackUser = null) => ({
    nama: item?.nama || item?.name || fallbackUser?.nama || fallbackUser?.name || '',
    tempatLahir: item?.tempatLahir || item?.tempat_lahir || item?.tempatTanggalLahir || '',
    tanggalLahir: item?.tanggalLahir || item?.tanggal_lahir || '',
    status: item?.status || '',
    posisi: item?.posisi || item?.jabatan || '',
    alamat: item?.alamat || item?.address || '',
    noTelepon: item?.no_hp || item?.noTelepon || '',
    email: item?.email || fallbackUser?.email || '',
    tanggalMasuk: item?.tglMasuk || item?.tanggalMasuk || item?.tanggal_masuk || '',
    tanggalKontrak: item?.tglKontrak || item?.tanggalKontrak || item?.tanggal_kontrak || '',
    foto: item?.foto || item?.photo || ''
  });

  // Helper function untuk mendapatkan label dari value di dropdown
  const getOptionLabel = (optionType, value) => {
    const options = dropdownOptions[optionType];
    if (!options || options.length === 0) return value;
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  useEffect(() => {
    const saved = localStorage.getItem(storageKeys.profileKey);
    const savedDraft = localStorage.getItem(storageKeys.draftKey);

    try {
      // Prioritize draft (latest in-progress edit), then saved profile.
      if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        setFormData(draftData);
        setLocalKaryawanData(draftData);
        return;
      }

      if (saved) {
        const data = JSON.parse(saved);
        setLocalKaryawanData(data);
        setFormData(data);
        return;
      }
    } catch (error) {
      console.warn('Data profil di localStorage tidak valid, menggunakan data fallback.', error);
    }

    if (user) {
      const fallback = mapKaryawanToForm(null, user);

      // Prefer context karyawan record if available
      if (Array.isArray(contextKaryawanData) && contextKaryawanData.length > 0) {
        const found = resolveCurrentKaryawan();
        if (found) {
          const data = mapKaryawanToForm(found, user);
          setLocalKaryawanData(data);
          setFormData(data);
          return;
        }
      }

      setLocalKaryawanData(fallback);
      setFormData(fallback);
    }
  }, [contextKaryawanData, userProfile, storageKeys.profileKey, storageKeys.draftKey]);

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
      tanggalMasuk: formData.tanggalMasuk,
      tanggalKontrak: formData.tanggalKontrak,
      foto: formData.foto
    };

    if (token && karyawanId) {
      try {
        await updateKaryawanProfile(token, karyawanId, updates);
      } catch (error) {
        console.warn('Gagal menyimpan data ke server, melanjutkan penyimpanan lokal saja.', error);
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
        tanggalMasuk: formData.tanggalMasuk,
        tanggalKontrak: formData.tanggalKontrak,
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
      localStorage.setItem(storageKeys.profileKey, JSON.stringify(updatedLocal));
      localStorage.removeItem(storageKeys.draftKey);
    } catch (error) {
      console.warn('LocalStorage quota exceeded while saving karyawanData, skipping persistence.', error);
    }

    setIsEditing(false);
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

  return (
    <div className="space-y-6 pb-8">
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
                        {karyawanData.tanggalLahir ? `, ${karyawanData.tanggalLahir}` : ''}
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
                    <div className="border-b border-gray-200 py-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</div>
                      <div className="text-gray-900 font-medium text-base mt-1">{karyawanData.email}</div>
                    </div>

                    <div className="border-b border-gray-200 py-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tanggal Masuk</div>
                      <div className="text-gray-900 font-medium text-base mt-1">{karyawanData.tanggalMasuk}</div>
                    </div>

                    {/* Row 5 */}
                    <div className="py-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tanggal Kontrak</div>
                      <div className="text-gray-900 font-medium text-base mt-1">{karyawanData.tanggalKontrak}</div>
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

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Tanggal Masuk</label>
                      <input 
                        type="date" 
                        name="tanggalMasuk" 
                        value={formData.tanggalMasuk} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Tanggal Kontrak</label>
                      <input 
                        type="date" 
                        name="tanggalKontrak" 
                        value={formData.tanggalKontrak} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button 
                      onClick={handleSave}
                      className="bg-gray-700 hover:bg-gray-800 text-white font-medium text-sm px-6 py-2 rounded-md transition"
                    >
                      Simpan
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(karyawanData);
                      }}
                      className="bg-gray-400 hover:bg-gray-500 text-white font-medium text-sm px-6 py-2 rounded-md transition"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
