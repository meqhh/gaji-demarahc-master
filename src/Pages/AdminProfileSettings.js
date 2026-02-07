import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { updateUserProfile } from "../services/authService";

function AdminProfileSettings() {
  const context = useContext(AppContext);
  const userProfile = context?.userProfile || null;
  const userLoading = context?.userLoading || false;
  const updateContext = context?.updateUserProfile || (() => {});

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    alamat: '',
    biografi: '',
    departemen: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  // Departemen options
  const departemenOptions = [
    'HR',
    'Keuangan',
    'IT',
    'Operasional',
    'Admin',
    'Kesehatan',
    'Pendidikan',
    'Lainnya'
  ];

  useEffect(() => {
    if (userProfile) {
      setFormData({
        nama: userProfile.nama || '',
        email: userProfile.email || '',
        telepon: userProfile.telepon || '',
        alamat: userProfile.alamat || '',
        biografi: userProfile.biografi || '',
        departemen: userProfile.departemen || ''
      });
    }
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError("");
      setSaveMessage("");

      const token = localStorage.getItem('token');
      if (!token) {
        setSaveError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      const response = await updateUserProfile(token, {
        nama: formData.nama,
        email: formData.email,
        telepon: formData.telepon || null,
        alamat: formData.alamat || null,
        biografi: formData.biografi || null,
        departemen: formData.departemen || null
      });

      if (response.success && response.data) {
        updateContext(response.data);
        setSaveMessage("Profil berhasil diperbarui!");
        setIsEditing(false);
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (error) {
      setSaveError(error.message || "Gagal menyimpan profil");
    } finally {
      setIsSaving(false);
    }
  };

  if (userLoading) {
    return (
      <main className="p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat profil Anda...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!userProfile || !formData) {
    return (
      <main className="p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600">Data profil tidak tersedia</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
        .animate-slide-down { animation: slideDown 0.5s ease-out; }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -12px rgba(0,0,0,0.1); }
      `}</style>

      {/* Header */}
      <div className="mb-8 animate-slide-down">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Pengaturan Profil Admin</h1>
        <p className="text-gray-500">Kelola informasi profil akun Anda</p>
      </div>

      {/* Alert Messages */}
      {saveMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 animate-slide-up">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {saveMessage}
          </div>
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-slide-up">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {saveError}
          </div>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 card-hover animate-slide-up">
        {/* Header Background */}
        <div className="h-24 bg-gradient-to-r from-gray-900 to-gray-700"></div>

        {/* Profile Content */}
        <div className="px-8 pb-8 pt-4">
          {/* Profile Info Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            <div className="-mt-20 flex-shrink-0">
              <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-4xl border-4 border-white shadow-md">
                {formData.nama?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
            <div className="flex-1 pt-2">
              <h2 className="text-2xl font-bold text-gray-900">{formData.nama}</h2>
              <p className="text-gray-600 font-medium">Admin</p>
              {formData.departemen && <p className="text-sm text-gray-500 mt-1">Departemen: {formData.departemen}</p>}
            </div>
          </div>

          {/* Form Section */}
          {!isEditing ? (
            <div>
              {/* View Mode */}
              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nama</p>
                    <p className="text-gray-900 font-medium">{formData.nama || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</p>
                    <p className="text-gray-900 font-medium break-all">{formData.email || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Telepon</p>
                    <p className="text-gray-900 font-medium">{formData.telepon || <span className="text-gray-400 italic">Tidak diisi</span>}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Departemen</p>
                    <p className="text-gray-900 font-medium">{formData.departemen || <span className="text-gray-400 italic">Tidak diisi</span>}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Alamat</p>
                  <p className="text-gray-900 font-medium">{formData.alamat || <span className="text-gray-400 italic">Tidak diisi</span>}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Biografi</p>
                  <p className="text-gray-900 font-medium">{formData.biografi || <span className="text-gray-400 italic">Tidak diisi</span>}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profil
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Edit Mode */}
              {/* Nama & Email - Read Only */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 mb-4">
                  <strong>Catatan:</strong> Nama dan Email otomatis diambil dari akun registrasi Anda dan tidak dapat diubah di sini.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Nama (Tidak Dapat Diubah)</label>
                    <input type="text" value={formData.nama} disabled className="w-full border border-gray-300 px-4 py-2.5 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Email (Tidak Dapat Diubah)</label>
                    <input type="email" value={formData.email} disabled className="w-full border border-gray-300 px-4 py-2.5 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed" />
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Telepon</label>
                  <input
                    type="tel"
                    name="telepon"
                    value={formData.telepon}
                    onChange={handleChange}
                    placeholder="Contoh: +62 812 3456 7890"
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Departemen</label>
                  <select
                    name="departemen"
                    value={formData.departemen}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                  >
                    <option value="">-- Pilih Departemen --</option>
                    {departemenOptions.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Alamat</label>
                <input
                  type="text"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  placeholder="Masukkan alamat Anda"
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Biografi</label>
                <textarea
                  name="biografi"
                  value={formData.biografi}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Ceritakan tentang diri Anda..."
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Simpan Perubahan
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      nama: userProfile.nama || '',
                      email: userProfile.email || '',
                      telepon: userProfile.telepon || '',
                      alamat: userProfile.alamat || '',
                      biografi: userProfile.biografi || '',
                      departemen: userProfile.departemen || ''
                    });
                  }}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Account Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <h3 className="font-bold text-gray-900">Status Akun</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Aktif</span>
          </p>
          <p className="text-xs text-gray-500">Akun Anda dalam kondisi baik dan siap digunakan</p>
        </div>

        {/* Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <h3 className="font-bold text-gray-900">Petunjuk</h3>
          </div>
          <ul className="text-xs text-gray-600 space-y-2">
            <li>✓ Nama dan Email tidak dapat diubah</li>
            <li>✓ Isi kolom lainnya sesuai data aktual</li>
            <li>✓ Perubahan langsung tersimpan ke database</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default AdminProfileSettings;
