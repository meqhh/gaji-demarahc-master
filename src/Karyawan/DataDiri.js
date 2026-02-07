import React, { useState, useEffect } from "react";
import ProfilImage from "../Images/profil.jpg";

export default function DataDiri() {
  const [isEditing, setIsEditing] = useState(false);
  const [karyawanData, setKaryawanData] = useState({
    nama: "",
    tempatTanggalLahir: "",
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

  useEffect(() => {
    // Load from login data first
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setKaryawanData(prev => ({
        ...prev,
        nama: userData.nama || '',
        email: userData.email || ''
      }));
      setFormData(prev => ({
        ...prev,
        nama: userData.nama || '',
        email: userData.email || ''
      }));
    }
    
    // Then try to load saved data from localStorage
    const saved = localStorage.getItem("karyawanData");
    if (saved) {
      const data = JSON.parse(saved);
      setKaryawanData(data);
      setFormData(data);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Save data to localStorage without requiring foto
    const toSave = { ...formData };
    setKaryawanData(toSave);
    localStorage.setItem("karyawanData", JSON.stringify(toSave));
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Data Diri</h1>
        <p className="text-sm text-gray-500 mt-1">Informasi pribadi dan profesional Anda</p>
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
                      <div className="text-gray-900 font-medium text-base mt-1">{karyawanData.tempatTanggalLahir}</div>
                    </div>

                    {/* Row 2 */}
                    <div className="border-b border-gray-200 py-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</div>
                      <div className="text-gray-900 font-medium text-base mt-1">{karyawanData.status}</div>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Nama</label>
                      <input 
                        type="text" 
                        name="nama" 
                        value={formData.nama} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Tempat, Tanggal Lahir</label>
                      <input 
                        type="text" 
                        name="tempatTanggalLahir" 
                        value={formData.tempatTanggalLahir} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Status</label>
                      <input 
                        type="text" 
                        name="status" 
                        value={formData.status} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Posisi</label>
                      <input 
                        type="text" 
                        name="posisi" 
                        value={formData.posisi} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Alamat</label>
                      <input 
                        type="text" 
                        name="alamat" 
                        value={formData.alamat} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">No Telepon</label>
                      <input 
                        type="text" 
                        name="noTelepon" 
                        value={formData.noTelepon} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Email</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Tanggal Masuk</label>
                      <input 
                        type="text" 
                        name="tanggalMasuk" 
                        value={formData.tanggalMasuk} 
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-2">Tanggal Kontrak</label>
                      <input 
                        type="text" 
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
