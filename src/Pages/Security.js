import React, { useState } from 'react';
import Logo from '../Images/demaralogo.png';

export default function Security() {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [twoFA, setTwoFA] = useState(() => localStorage.getItem('twoFA') === 'true');

  const changePassword = () => {
    if (!oldPass || !newPass) return alert('Lengkapi semua field.');
    if (newPass !== confirmPass) return alert('Konfirmasi kata sandi tidak cocok.');
    // Simulate save
    alert('Kata sandi berhasil diperbarui.');
    setOldPass(''); setNewPass(''); setConfirmPass('');
  };

  const toggle2FA = () => {
    const next = !twoFA;
    setTwoFA(next);
    localStorage.setItem('twoFA', String(next));
    alert(`Autentikasi dua faktor ${next ? 'diaktifkan' : 'dinonaktifkan'}.`);
  };

  return (
    <div>
      <div className="flex items-center space-x-4">
        <img src={Logo} alt="logo" className="w-14 h-auto" />
        <div>
          <h2 className="text-2xl font-bold text-[#CC45DE]">Keamanan Akun</h2>
          <p className="text-sm text-gray-500">Ubah kata sandi dan kelola autentikasi dua faktor.</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Ubah Kata Sandi</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600">Kata Sandi Lama</label>
              <input type="password" value={oldPass} onChange={e=>setOldPass(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Kata Sandi Baru</label>
              <input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Konfirmasi Kata Sandi</label>
              <input type="password" value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" />
            </div>
            <div className="mt-3">
              <button onClick={changePassword} className="bg-[#CC45DE] text-white px-4 py-2 rounded-md">Perbarui Kata Sandi</button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Autentikasi Dua Faktor (2FA)</h3>
          <p className="text-sm text-gray-600 mb-4">Dengan 2FA, akun Anda lebih terlindungi walaupun kata sandi bocor.</p>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Status 2FA</div>
              <div className="text-xs text-gray-500">{twoFA ? 'Aktif' : 'Non-aktif'}</div>
            </div>
            <div>
              <button onClick={toggle2FA} className={`px-4 py-2 rounded-md ${twoFA ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                {twoFA ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-2">Sesi Aktif</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <div className="font-medium">Windows — Chrome</div>
                  <div className="text-xs text-gray-500">Terakhir aktif 2 jam lalu</div>
                </div>
                <button className="text-xs text-red-600">Logout sesi</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
