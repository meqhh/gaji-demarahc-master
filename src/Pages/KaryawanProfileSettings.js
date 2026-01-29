import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";

function KaryawanProfileSettings() {
  const { karyawanData, getKaryawanById } = useContext(AppContext);

  // Identify logged-in karyawan by stored id
  const loggedKaryawanId = localStorage.getItem("karyawanId");
  const storedEmail = localStorage.getItem("karyawanEmail") || "";

  const defaultProfile = {
    name: "Portal Karyawan",
    email: storedEmail || "karyawan@demara.com",
    phone: "+62 812-3456-7891",
    address: "Jl. Melati No. 456, Jakarta",
    joinDate: "15 Februari 2024",
    position: "Bidan",
    department: "Kesehatan Ibu & Anak",
    photo: storedEmail ? (localStorage.getItem(`karyawan_photo_${storedEmail}`) || `https://ui-avatars.com/api/?name=${encodeURIComponent(storedEmail)}&background=6B7280&color=fff`) : "https://ui-avatars.com/api/?name=Portal+Karyawan&background=6B7280&color=fff",
    emergencyContact: {
      name: "Siti Rahma",
      relation: "Istri",
      phone: "+62 812-0000-1111"
    },
    notifications: {
      email: true,
      whatsapp: false
    }
  };

  const [profileData, setProfileData] = useState(defaultProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData);
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(profileData.photo);
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome — Windows', location: 'Jakarta, ID', lastActive: 'Sekarang' },
    { id: 2, device: 'Safari — iPhone', location: 'Bandung, ID', lastActive: '2 hari lalu' }
  ]);
  const [recentActivity] = useState([
    { id: 1, time: '2025-12-20 09:12', activity: 'Login berhasil dari Chrome — Windows' },
    { id: 2, time: '2025-12-18 18:03', activity: 'Ubah data profil' }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNestedChange = (section, key, value) => {
    setFormData({ ...formData, [section]: { ...formData[section], [key]: value } });
  };

  const handleSave = () => {
    setProfileData(formData);
    // Save employee photo to localStorage (independent from admin)
    localStorage.setItem(`karyawan_photo_${formData.email}`, formData.photo);
    localStorage.setItem("karyawan_photo", formData.photo);
    setIsEditing(false);
  };

  const handlePhotoUpload = (e) => {
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

  const handlePasswordChange = () => {
    if (passwordForm.newPass !== passwordForm.confirm) {
      alert("Password baru dan konfirmasi tidak cocok.");
      return;
    }
    // placeholder: call API to change password
    setPasswordForm({ current: "", newPass: "", confirm: "" });
    alert("Permintaan ubah kata sandi dikirim.");
  };

  // When component mounts or karyawanData changes, try to populate profile from registered karyawan
  useEffect(() => {
    if (loggedKaryawanId) {
      // Prefer AppContext lookup
      let k = typeof getKaryawanById === 'function' ? getKaryawanById(loggedKaryawanId) : undefined;
      if (!k && Array.isArray(karyawanData)) {
        k = karyawanData.find(x => x.id === loggedKaryawanId || x.email === storedEmail || x.username === storedEmail);
      }
      if (k) {
        const mapped = {
          name: k.nama || k.name || "",
          email: k.email || storedEmail || "",
          phone: k.phone || "",
          address: k.address || "",
          joinDate: k.createdAt ? (new Date(k.createdAt)).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric'}) : (k.joinDate || defaultProfile.joinDate),
          position: k.posisi || k.position || defaultProfile.position,
          department: k.departemen || k.department || defaultProfile.department,
          photo: localStorage.getItem(`karyawan_photo_${k.email}`) || k.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(k.nama || k.username || '')}&background=6B7280&color=fff`,
          emergencyContact: k.emergencyContact || defaultProfile.emergencyContact,
          notifications: k.notifications || defaultProfile.notifications
        };
        setProfileData(mapped);
        setFormData(mapped);
        setPhotoPreview(mapped.photo);
      }
    }
  }, [loggedKaryawanId, karyawanData, getKaryawanById]);

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <style>{`\n        @keyframes slideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }\n        .animate-slide-in { animation: slideIn 0.35s ease-out; }\n      `}</style>

      <div className="mb-6 animate-slide-in">
        <h1 className="text-3xl font-semibold text-gray-900">Pengaturan Profil</h1>
        <p className="text-sm text-gray-600 mt-1">Perbarui informasi pribadi, keamanan akun, dan preferensi notifikasi Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile summary */}
        <section className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex flex-col items-center gap-4">
            <img src={photoPreview} alt={profileData.name} className="w-24 h-24 rounded-full object-cover border border-gray-200 shadow-sm" />
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">{profileData.name}</h2>
              <p className="text-sm text-gray-600">{profileData.position} • {profileData.department}</p>
              <p className="text-xs text-gray-500 mt-1">Bergabung sejak {profileData.joinDate}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-gray-700">
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div className="font-medium text-gray-900">{profileData.email}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Telepon</div>
              <div className="font-medium text-gray-900">{profileData.phone}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Alamat</div>
              <div className="font-medium text-gray-900">{profileData.address}</div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4 space-y-2">
            <button onClick={() => { setFormData(profileData); setIsEditing(true); }} className="w-full text-sm py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Edit Profil</button>
            <label className="w-full block">
              <span className="w-full text-sm py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer text-center">Ubah Foto</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        </section>

        {/* Right: Forms */}
        <section className="lg:col-span-2 space-y-6">
          {/* Personal Info Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Informasi Pribadi</h3>
              {!isEditing && <span className="text-sm text-gray-500">Lihat / Edit</span>}
            </div>

            <div className="mt-4">
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Nama Lengkap</div>
                    <div className="font-medium text-gray-900">{profileData.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Email</div>
                    <div className="font-medium text-gray-900">{profileData.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Telepon</div>
                    <div className="font-medium text-gray-900">{profileData.phone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Alamat</div>
                    <div className="font-medium text-gray-900">{profileData.address}</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Photo Upload Section */}
                    <div className="col-span-2 border border-gray-200 rounded-lg p-6 text-center bg-white">
                      <img src={photoPreview} alt="Preview" className="w-24 h-24 rounded-full mx-auto mb-3 object-cover border border-gray-200" />
                      <label className="block">
                        <span className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 cursor-pointer inline-block">Pilih Foto</span>
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG atau GIF (max 5MB)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-700">Nama Lengkap</label>
                      <input name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Email</label>
                      <input name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-700">Telepon</label>
                      <input name="phone" value={formData.phone} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300" />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Alamat</label>
                      <input name="address" value={formData.address} onChange={handleChange} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300" />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Batal</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-gray-900 text-white rounded-md">Simpan</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Keamanan Akun</h3>
              <span className="text-sm text-gray-500">Ubah kata sandi & 2FA</span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-700">Kata Sandi Saat Ini</label>
                <input type="password" value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Kata Sandi Baru</label>
                <input type="password" value={passwordForm.newPass} onChange={e => setPasswordForm({...passwordForm, newPass: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Konfirmasi Kata Sandi</label>
                <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
              </div>
              <div className="flex items-end justify-end">
                <button onClick={handlePasswordChange} className="px-4 py-2 bg-gray-900 text-white rounded-md">Ubah Kata Sandi</button>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4">
              <h4 className="text-sm font-medium text-gray-900">Autentikasi Dua Faktor (2FA)</h4>
              <p className="text-sm text-gray-600 mt-1">2FA menambahkan lapisan keamanan: selain kata sandi, Anda memerlukan kode verifikasi pada perangkat terdaftar.</p>
              <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${twoFaEnabled ? 'text-green-600' : 'text-gray-600'}`}>{twoFaEnabled ? 'Aktif' : 'Tidak aktif'}</span>
                  <button onClick={() => { setTwoFaEnabled(!twoFaEnabled); if (!twoFaEnabled) alert('2FA diaktifkan (mock).'); else alert('2FA dinonaktifkan (mock).'); }} className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-800 hover:bg-gray-50">{twoFaEnabled ? 'Nonaktifkan 2FA' : 'Aktifkan 2FA'}</button>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    if (!twoFaEnabled) return alert('Aktifkan 2FA terlebih dahulu.');
                    if (!showRecovery && recoveryCodes.length === 0) {
                      const codes = Array.from({length:6}).map((_,i)=>Math.random().toString(36).slice(2,10).toUpperCase());
                      setRecoveryCodes(codes);
                    }
                    setShowRecovery(!showRecovery);
                  }} className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-800 hover:bg-gray-50">{showRecovery ? 'Sembunyikan Kode Pemulihan' : 'Tampilkan Kode Pemulihan'}</button>
                  <button onClick={() => { if (!twoFaEnabled) return alert('Aktifkan 2FA terlebih dahulu.'); const codes = Array.from({length:6}).map((_,i)=>Math.random().toString(36).slice(2,10).toUpperCase()); setRecoveryCodes(codes); setShowRecovery(true); alert('Kode pemulihan baru digenerate (mock).'); }} className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-800 hover:bg-gray-50">Regenerate</button>
                </div>
              </div>

              {showRecovery && recoveryCodes.length > 0 && (
                <div className="mt-3 bg-gray-50 border border-gray-200 p-3 rounded text-sm text-gray-800">
                  <div className="text-xs text-gray-500 mb-2">Simpan kode pemulihan ini di tempat aman. Setiap kode hanya sekali pakai.</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {recoveryCodes.map((c, i) => <div key={i} className="p-2 bg-white border border-gray-200 rounded text-center font-mono text-sm">{c}</div>)}
                  </div>
                </div>
              )}

              {/* Active sessions */}
              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-900">Sesi Aktif</h5>
                <p className="text-xs text-gray-500 mt-1">Tutup sesi pada perangkat yang tidak Anda kenali.</p>
                <div className="mt-3 space-y-2">
                  {sessions.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{s.device}</div>
                        <div className="text-xs text-gray-500">{s.location} • {s.lastActive}</div>
                      </div>
                      <div>
                        <button onClick={() => { setSessions(prev => prev.filter(x=>x.id!==s.id)); alert('Sesi ditutup (mock).'); }} className="px-2 py-1 text-sm border border-gray-300 rounded-md">Sign out</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-end">
                  <button onClick={() => { setSessions([]); alert('Semua sesi lain telah ditutup (mock).'); }} className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-800 hover:bg-gray-50">Sign out all other sessions</button>
                </div>
              </div>

              {/* Recent activity */}
              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-900">Aktivitas Terakhir</h5>
                <div className="mt-2 text-sm text-gray-700 space-y-2">
                  {recentActivity.map(r => (
                    <div key={r.id} className="text-xs text-gray-600">{r.time} — {r.activity}</div>
                  ))}
                </div>
              </div>

              {/* Security tips */}
              <div className="mt-6 border-t border-gray-100 pt-4">
                <h5 className="text-sm font-medium text-gray-900">Tips Keamanan</h5>
                <ul className="mt-2 text-sm text-gray-700 list-disc ml-5 space-y-1">
                  <li>Gunakan kata sandi unik minimal 8 karakter.</li>
                  <li>Aktifkan 2FA untuk perlindungan tambahan.</li>
                  <li>Keluar dari sesi pada perangkat publik.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Notifications & Emergency */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900">Notifikasi & Kontak Darurat</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Preferensi Notifikasi</div>
                <div className="mt-2 flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.notifications.email} onChange={e => handleNestedChange('notifications', 'email', e.target.checked)} />
                    <span className="text-sm text-gray-800">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.notifications.whatsapp} onChange={e => handleNestedChange('notifications', 'whatsapp', e.target.checked)} />
                    <span className="text-sm text-gray-800">WhatsApp</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Kontak Darurat</div>
                <div className="mt-2 text-sm text-gray-800">
                  <div className="font-medium">{profileData.emergencyContact.name} ({profileData.emergencyContact.relation})</div>
                  <div className="text-gray-600">{profileData.emergencyContact.phone}</div>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input placeholder="Nama" value={formData.emergencyContact.name} onChange={e => handleNestedChange('emergencyContact', 'name', e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 text-sm" />
                  <input placeholder="Relasi" value={formData.emergencyContact.relation} onChange={e => handleNestedChange('emergencyContact', 'relation', e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 text-sm" />
                  <input placeholder="Telepon" value={formData.emergencyContact.phone} onChange={e => handleNestedChange('emergencyContact', 'phone', e.target.value)} className="border border-gray-300 rounded-md px-2 py-1 text-sm" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => { setFormData(profileData); }} className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700">Reset</button>
              <button onClick={() => setProfileData(formData)} className="px-4 py-2 bg-gray-900 text-white rounded-md">Simpan Perubahan</button>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900">Privasi & Data</h3>
            <p className="text-sm text-gray-600 mt-2">Kelola akses data dan unduh salinan data pribadi Anda.</p>
            <div className="mt-4 flex gap-3">
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700">Unduh Data (JSON)</button>
              <button className="px-3 py-2 border border-red-300 text-red-600 rounded-md text-sm">Hapus Akun (Permintaan)</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default KaryawanProfileSettings;
