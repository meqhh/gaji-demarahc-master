import React, { useState, useEffect } from 'react';
import Logo from '../Images/demaralogo.png';

export default function ProfileSettings() {
  const [profile, setProfile] = useState({ name: 'Admin User', email: 'demara.hr@example.com', avatar: '' });

  useEffect(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const handleChange = (key) => (e) => setProfile({ ...profile, [key]: e.target.value });

  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile({ ...profile, avatar: reader.result });
    reader.readAsDataURL(file);
  };

  const save = () => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    alert('Profil disimpan.');
  };

  return (
    <div>
      <div className="flex items-center space-x-4">
        <img src={Logo} alt="logo" className="w-14 h-auto" />
        <div>
          <h2 className="text-2xl font-bold text-[#CC45DE]">Pengaturan Profil</h2>
          <p className="text-sm text-gray-500">Atur informasi akun dan profil Anda.</p>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Informasi Dasar</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {profile.avatar ? (
                <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-pink-500 font-bold">{profile.name?.[0] ?? 'U'}</div>
              )}
            </div>
            <label className="mt-3 cursor-pointer text-sm text-gray-600">
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
              Ubah Foto
            </label>
          </div>

          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Nama Lengkap</label>
                <input value={profile.name} onChange={handleChange('name')} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Email</label>
                <input value={profile.email} onChange={handleChange('email')} className="mt-1 w-full border rounded px-3 py-2" />
              </div>
            </div>

            <div className="mt-6 flex items-center space-x-3">
              <button onClick={save} className="bg-[#CC45DE] text-white px-4 py-2 rounded-md">Simpan Perubahan</button>
              <button onClick={() => { setProfile({ name: 'Admin User', email: 'demara.hr@example.com', avatar: '' }); localStorage.removeItem('userProfile'); }} className="px-4 py-2 rounded-md border">Reset</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
