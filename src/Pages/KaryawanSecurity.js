import React, { useState } from "react";

function KaryawanSecurity() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Login History Data
  const [loginHistory] = useState([
    { id: 1, device: "Chrome - Windows 10", location: "Jakarta, Indonesia", date: "24 Des 2025", time: "14:30", status: "Aktif Sekarang" },
    { id: 2, device: "Safari - iPhone 12", location: "Jakarta, Indonesia", date: "23 Des 2025", time: "09:15", status: "Daring" },
    { id: 3, device: "Chrome - Windows 10", location: "Jakarta, Indonesia", date: "22 Des 2025", time: "16:45", status: "Daring" },
    { id: 4, device: "Firefox - Ubuntu", location: "Bandung, Indonesia", date: "20 Des 2025", time: "11:20", status: "Daring" },
  ]);

  // Active Sessions
  const [activeSessions] = useState([
    { id: 1, device: "Desktop Windows", browser: "Chrome", lastActive: "Sekarang" },
    { id: 2, device: "Mobile iPhone", browser: "Safari", lastActive: "1 jam lalu" },
  ]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword.length >= 8) {
      setSuccessMessage("Kata sandi berhasil diperbarui!");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleLogoutSession = (id) => {
    setSuccessMessage("Sesi berhasil dihapus dari perangkat tersebut");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <main className="p-8 bg-white min-h-screen">
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
        .animate-slide-down { animation: slideDown 0.5s ease-out; }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
      `}</style>

      {/* Header */}
      <div className="mb-8 animate-slide-down">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Keamanan Akun</h1>
        <p className="text-gray-600 text-sm">Kelola kata sandi dan pengaturan keamanan akun Anda</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg animate-slide-down">
          <p className="font-medium text-sm">✓ {successMessage}</p>
        </div>
      )}

      {/* Password Change Card */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden card-hover animate-slide-up mb-6" style={{ animationDelay: '0.1s' }}>
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1l-8 4v6c0 8 8 12 8 12s8-4 8-12V5l-8-4z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            Ubah Kata Sandi
          </h2>
          <p className="text-sm text-gray-600 mt-1">Perbarui kata sandi Anda secara berkala untuk keamanan maksimal</p>
        </div>

        <div className="p-6">
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded font-medium text-sm hover:bg-gray-800 transition-all duration-300"
            >
              Ubah Kata Sandi
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Kata Sandi Saat Ini</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full border border-gray-300 px-4 py-2 rounded font-medium text-gray-700 text-sm focus:border-gray-400 focus:ring-1 focus:ring-gray-300 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Kata Sandi Baru</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Minimal 8 karakter"
                  className="w-full border border-gray-300 px-4 py-2 rounded font-medium text-gray-700 text-sm focus:border-gray-400 focus:ring-1 focus:ring-gray-300 outline-none transition-all"
                  required
                  minLength="8"
                />
                <p className="text-xs text-gray-600 mt-1.5">Gunakan kombinasi huruf besar, kecil, angka, dan simbol untuk keamanan maksimal</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Konfirmasi kata sandi baru"
                  className="w-full border border-gray-300 px-4 py-2 rounded font-medium text-gray-700 text-sm focus:border-gray-400 focus:ring-1 focus:ring-gray-300 outline-none transition-all"
                  required
                  minLength="8"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 text-white rounded font-medium text-sm hover:bg-gray-800 transition-all duration-300"
                >
                  Simpan Kata Sandi
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium text-sm hover:bg-gray-50 transition-all duration-300"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Two-Factor Authentication Card */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Autentikasi Dua Faktor
          </h2>
          <p className="text-sm text-gray-600 mt-1">Tambahkan lapisan keamanan ekstra untuk melindungi akun Anda</p>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Status: <span className={twoFactorEnabled ? "text-gray-900 font-semibold" : "text-gray-600"}>{twoFactorEnabled ? "Aktif" : "Tidak Aktif"}</span></p>
              <p className="text-sm text-gray-600 mt-2">
                {twoFactorEnabled 
                  ? "Autentikasi dua faktor sedang aktif pada akun Anda."
                  : "Aktifkan autentikasi dua faktor untuk keamanan tambahan."
                }
              </p>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`px-6 py-2 rounded font-medium text-sm text-white transition-all duration-300 ${
                twoFactorEnabled
                  ? "bg-gray-600 hover:bg-gray-700"
                  : "bg-gray-900 hover:bg-gray-800"
              }`}
            >
              {twoFactorEnabled ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </div>

          {twoFactorEnabled && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm font-medium text-gray-900">Metode Autentikasi:</p>
              <ul className="text-sm text-gray-700 mt-3 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>SMS ke nomor terdaftar: +62 812-XXXX-XXXX</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>Aplikasi autentikator (Google Authenticator, Authy)</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions Card */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden card-hover animate-slide-up mt-6" style={{ animationDelay: '0.3s' }}>
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <path d="M2 17h20" />
            </svg>
            Sesi Aktif
          </h2>
          <p className="text-sm text-gray-600 mt-1">Perangkat yang saat ini terhubung dengan akun Anda</p>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <path d="M2 17h20" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session.device}</p>
                    <p className="text-xs text-gray-600 mt-1">{session.browser} • {session.lastActive}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleLogoutSession(session.id)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded hover:bg-gray-100 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Login History Card */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden card-hover animate-slide-up mt-6" style={{ animationDelay: '0.4s' }}>
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Riwayat Login
          </h2>
          <p className="text-sm text-gray-600 mt-1">Aktivitas login terakhir pada akun Anda</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-900">Perangkat</th>
                <th className="text-left px-6 py-3 font-medium text-gray-900">Lokasi</th>
                <th className="text-left px-6 py-3 font-medium text-gray-900">Tanggal & Waktu</th>
                <th className="text-left px-6 py-3 font-medium text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {loginHistory.map((item, idx) => (
                <tr key={item.id} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-6 py-4 text-gray-900 font-medium">{item.device}</td>
                  <td className="px-6 py-4 text-gray-700">{item.location}</td>
                  <td className="px-6 py-4 text-gray-700">{item.date} - {item.time}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded ${
                      item.status === 'Aktif Sekarang' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Tips Card */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden card-hover animate-slide-up mt-6" style={{ animationDelay: '0.5s' }}>
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M12 12h.01" />
            </svg>
            Tips Keamanan
          </h2>
          <p className="text-sm text-gray-600 mt-1">Panduan untuk menjaga keamanan akun Anda</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm font-medium text-gray-900 mb-2 flex items-start gap-2">
                <span className="text-base">🔑</span>
                Gunakan Kata Sandi yang Kuat
              </p>
              <p className="text-xs text-gray-600">Kombinasikan huruf besar, kecil, angka, dan simbol. Hindari informasi pribadi yang mudah ditebak.</p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm font-medium text-gray-900 mb-2 flex items-start gap-2">
                <span className="text-base">🛡️</span>
                Aktifkan Autentikasi Dua Faktor
              </p>
              <p className="text-xs text-gray-600">Tambahkan lapisan keamanan ekstra dengan mengaktifkan 2FA untuk perlindungan maksimal.</p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm font-medium text-gray-900 mb-2 flex items-start gap-2">
                <span className="text-base">👁️</span>
                Pantau Riwayat Login
              </p>
              <p className="text-xs text-gray-600">Periksa secara berkala riwayat login dan sesi aktif. Logout dari perangkat yang tidak dikenali.</p>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <p className="text-sm font-medium text-gray-900 mb-2 flex items-start gap-2">
                <span className="text-base">🔗</span>
                Jangan Bagikan Link Login
              </p>
              <p className="text-xs text-gray-600">Jangan pernah bagikan link login atau kode verifikasi kepada siapapun, bahkan pihak HR.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default KaryawanSecurity;
