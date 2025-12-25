import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";

function AdminProfileSettings() {
  const { userProfile, updateUserProfile } = useContext(AppContext);

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState(userProfile);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [photoPreview, setPhotoPreview] = useState(userProfile?.photo || null);

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData({ ...formData, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateUserProfile(formData);
    setIsEditing(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const handleSavePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Password baru tidak cocok!");
      return;
    }
    alert("Password berhasil diubah!");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowPasswordModal(false);
  };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Pengaturan Profil</h1>
        <p className="text-gray-500">Kelola informasi akun dan keamanan Anda</p>
      </div>

      {/* Main Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left: Profile Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 card-hover animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Header Background */}
            <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-50"></div>

            {/* Profile Content */}
            <div className="px-8 pb-8">
              {/* Profile Photo & Name */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 mb-8 relative z-10">
                <div className="relative">
                  <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-4xl border-4 border-white shadow-md overflow-hidden">
                    {photoPreview ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" /> : formData.name.charAt(0)}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-2 right-2 bg-gray-900 text-white p-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-all">
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
                  <p className="text-gray-600 font-medium">{formData.role}</p>
                  <p className="text-sm text-gray-500 mt-1">{formData.bio}</p>
                </div>
              </div>

              {/* Form Section */}
              {!isEditing ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</p>
                      <p className="text-gray-900 font-medium mt-1">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Telepon</p>
                      <p className="text-gray-900 font-medium mt-1">{formData.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Departemen</p>
                      <p className="text-gray-900 font-medium mt-1">{formData.department}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bergabung</p>
                      <p className="text-gray-900 font-medium mt-1">{formData.joinDate}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Alamat</p>
                    <p className="text-gray-900 font-medium">{formData.address}</p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => { setFormData(userProfile); setPhotoPreview(userProfile?.photo || null); setIsEditing(true); }}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Nama</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Telepon</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Departemen</label>
                      <input type="text" name="department" value={formData.department} onChange={handleChange} className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Alamat</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Biografi</label>
                    <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" placeholder="Ceritakan tentang Anda..."></textarea>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all"
                    >
                      Simpan Perubahan
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Security & Info */}
        <div className="space-y-6">
          {/* Password Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 card-hover animate-slide-up p-6" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="font-bold text-gray-900">Keamanan</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">Ubah password akun Anda</p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full px-4 py-2.5 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-all"
            >
              Ubah Password
            </button>
          </div>

          {/* Account Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 card-hover animate-slide-up p-6" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-bold text-gray-900">Status Akun</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Aktif</span>
            </p>
            <p className="text-xs text-gray-500">Akun Anda dalam kondisi baik dan siap digunakan</p>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 card-hover animate-slide-up p-6" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-bold text-gray-900">Aktivitas Terakhir</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">Login: Hari ini, 09:30</p>
              <p className="text-gray-600">Edit Profil: 18 Desember 2025</p>
              <p className="text-gray-600">Ubah Password: 10 Desember 2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Ubah Password</h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password Saat Ini</label>
                <input type="password" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} placeholder="Masukkan password saat ini" className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password Baru</label>
                <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} placeholder="Masukkan password baru" className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Konfirmasi Password</label>
                <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} placeholder="Konfirmasi password baru" className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSavePassword} className="flex-1 px-6 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all">
                Simpan Password
              </button>
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminProfileSettings;
