import React, { useState, useEffect } from "react";

function AdminSecurity() {
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [storedPassword, setStoredPassword] = useState(() => localStorage.getItem("adminPassword") || "Admin@123");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => JSON.parse(localStorage.getItem("twoFactorEnabled")) || false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [backupCodes, setBackupCodes] = useState(() => JSON.parse(localStorage.getItem("backupCodes")) || []);
  const [sessions, setSessions] = useState(() => JSON.parse(localStorage.getItem("sessions")) || [
    { id: 's1', device: 'Chrome - Windows', location: 'Jakarta, ID', lastActive: '2025-12-24 08:10', current: true },
    { id: 's2', device: 'Firefox - MacOS', location: 'Bandung, ID', lastActive: '2025-12-23 21:33', current: false }
  ]);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem("loginHistory")) || [
    { id: 'h1', when: '2025-12-24 08:10', device: 'Chrome - Windows', result: 'Sukses' },
    { id: 'h2', when: '2025-12-23 20:12', device: 'Mobile App', result: 'Gagal (kata sandi)' }
  ]);

  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem("loginHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem("twoFactorEnabled", JSON.stringify(twoFactorEnabled));
  }, [twoFactorEnabled]);

  useEffect(() => {
    localStorage.setItem("backupCodes", JSON.stringify(backupCodes));
  }, [backupCodes]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    const next = { ...passwordData, [name]: value };
    setPasswordData(next);
    if (name === 'newPassword') {
      evaluatePassword(value);
    }
  };

  const evaluatePassword = (p) => {
    const checks = [];
    if (p.length >= 8) checks.push('length');
    if (/[A-Z]/.test(p)) checks.push('upper');
    if (/[a-z]/.test(p)) checks.push('lower');
    if (/[0-9]/.test(p)) checks.push('number');
    if (/[^A-Za-z0-9]/.test(p)) checks.push('symbol');
    setPasswordErrors([
      { key: 'length', ok: p.length >= 8, label: 'Minimal 8 karakter' },
      { key: 'upper', ok: /[A-Z]/.test(p), label: 'Memiliki huruf besar (A-Z)' },
      { key: 'lower', ok: /[a-z]/.test(p), label: 'Memiliki huruf kecil (a-z)' },
      { key: 'number', ok: /[0-9]/.test(p), label: 'Memiliki angka (0-9)' },
      { key: 'symbol', ok: /[^A-Za-z0-9]/.test(p), label: 'Memiliki simbol (!@#$...)' }
    ]);
    setPasswordStrength(checks.length);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (currentPassword !== storedPassword) {
      setSuccessMessage('');
      setPasswordErrors((prev) => [...prev, { key: 'current', ok: false, label: 'Kata sandi saat ini salah' }]);
      return;
    }
    if (newPassword !== confirmPassword) {
      setSuccessMessage('');
      setPasswordErrors((prev) => [...prev, { key: 'match', ok: false, label: 'Konfirmasi kata sandi tidak cocok' }]);
      return;
    }
    if (passwordStrength < 3) {
      setSuccessMessage('');
      setPasswordErrors((prev) => [...prev, { key: 'weak', ok: false, label: 'Kata sandi terlalu lemah' }]);
      return;
    }
    // Simulate storing password
    setStoredPassword(newPassword);
    localStorage.setItem('adminPassword', newPassword);
    setSuccessMessage('Kata sandi berhasil diperbarui!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowPasswordForm(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // 2FA handlers
  const generateBackupCodes = () => {
    const codes = Array.from({ length: 6 }).map(() => Math.random().toString(36).slice(2, 10).toUpperCase());
    setBackupCodes(codes);
    return codes;
  };

  const toggleTwoFactor = () => {
    if (!twoFactorEnabled) {
      generateBackupCodes();
      setTwoFactorEnabled(true);
    } else {
      setTwoFactorEnabled(false);
      setBackupCodes([]);
    }
  };

  // Sessions & history
  const revokeSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <main className="p-8 bg-gray-50 min-h-screen">
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
        .animate-slide-down { animation: slideDown 0.5s ease-out; }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-8px); box-shadow: 0 20px 50px -15px rgba(0,0,0,0.15); }
      `}</style>

      {/* Header */}
      <div className="mb-8 animate-slide-down">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Keamanan Akun</h1>
        <p className="text-gray-600 font-medium">Kelola pengaturan keamanan: sandi, 2FA, sesi aktif, dan riwayat login</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-600 text-green-700 rounded-lg animate-slide-down">
          <p className="font-semibold">✓ {successMessage}</p>
        </div>
      )}

      {/* Password Change Card */}
      <div className="bg-white shadow rounded-xl overflow-hidden card-hover animate-slide-up mb-8" style={{ animationDelay: '0.1s' }}>
        <div className="px-8 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1l-8 4v6c0 8 8 12 8 12s8-4 8-12V5l-8-4z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            Ubah Kata Sandi
          </h2>
          <p className="text-sm text-gray-600 mt-1">Perbarui kata sandi Anda secara berkala untuk keamanan maksimal</p>
        </div>

        <div className="p-8">
          {!showPasswordForm ? (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              🔐 Ubah Kata Sandi
            </button>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kata Sandi Saat Ini</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kata Sandi Baru</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Minimal 8 karakter"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-all"
                  required
                  minLength="8"
                />
                <p className="text-xs text-gray-500 mt-2">Gunakan kombinasi huruf besar, kecil, angka, dan simbol</p>

                <div className="mt-3">
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${(passwordStrength / 5) * 100}%` }} className="h-2 bg-gray-800 transition-width"></div>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs">
                    {passwordErrors.map((pe) => (
                      <div key={pe.key} className={pe.ok ? 'text-green-600' : 'text-gray-500'}>• {pe.label}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Konfirmasi kata sandi baru"
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-all"
                  required
                  minLength="8"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  ✓ Simpan Kata Sandi
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPasswordForm(false); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPasswordErrors([]); setPasswordStrength(0); }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  ✕ Batal
                </button>
              </div>
            </form>
          )}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">
              {successMessage}
            </div>
          )}
        </div>
      </div>

      {/* Two-Factor Authentication Card */}
      <div className="bg-white shadow rounded-xl overflow-hidden card-hover animate-slide-up mb-8" style={{ animationDelay: '0.2s' }}>
        <div className="px-8 py-6 border-b border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Autentikasi Dua Faktor
          </h2>
          <p className="text-sm text-gray-600 mt-1">Tambahkan lapisan keamanan ekstra dengan autentikasi dua faktor</p>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900">Status: <span className={twoFactorEnabled ? "text-green-600" : "text-gray-500"}>{twoFactorEnabled ? "Aktif" : "Tidak Aktif"}</span></p>
              <p className="text-sm text-gray-600 mt-2">
                {twoFactorEnabled
                  ? "Autentikasi dua faktor sedang aktif. Gunakan backup codes jika perlu."
                  : "Aktifkan autentikasi dua faktor untuk keamanan tambahan."
                }
              </p>
            </div>
            <button
              onClick={toggleTwoFactor}
              className={`px-6 py-2 rounded-lg font-semibold text-white transition-colors ${twoFactorEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-800 hover:bg-gray-700'}`}
            >
              {twoFactorEnabled ? "Nonaktifkan" : "Aktifkan"}
            </button>
          </div>

          {twoFactorEnabled && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded">
              <p className="text-sm text-gray-900 font-semibold">Metode Autentikasi:</p>
              <ul className="text-sm text-gray-700 mt-3 space-y-2">
                <li>• SMS ke nomor terdaftar</li>
                <li>• Aplikasi autentikator (Google Authenticator, Authy)</li>
              </ul>

              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-800">Backup Codes</p>
                <p className="text-xs text-gray-600 mb-2">Simpan kode ini di tempat aman. Setiap kode hanya bisa dipakai sekali.</p>
                <div className="grid grid-cols-2 gap-2">
                  {(backupCodes.length ? backupCodes : generateBackupCodes()).map((c, i) => (
                    <div key={i} className="p-2 bg-white border border-gray-100 rounded text-sm text-gray-800">{c}</div>
                  ))}
                </div>
                <div className="mt-3">
                  <button onClick={() => generateBackupCodes()} className="px-3 py-1 bg-gray-800 text-white rounded text-sm">Regenerate Codes</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sessions & History */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Sesi Aktif</h3>
          <p className="text-sm text-gray-600 mb-4">Kelola perangkat yang sedang masuk ke akun Anda.</p>
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 border border-gray-100 rounded">
                <div>
                  <div className="text-sm font-medium text-gray-900">{s.device}</div>
                  <div className="text-xs text-gray-500">{s.location} • {s.lastActive}</div>
                </div>
                <div className="flex items-center gap-2">
                  {s.current ? <span className="text-xs text-gray-500">(This device)</span> : <button onClick={() => revokeSession(s.id)} className="text-sm text-red-600">Revoke</button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Riwayat Login</h3>
          <p className="text-sm text-gray-600 mb-4">Catatan percobaan login terakhir.</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between p-2 rounded border border-gray-100">
                <div className="text-sm text-gray-800">{h.when} — {h.device}</div>
                <div className={`text-sm ${h.result === 'Sukses' ? 'text-green-600' : 'text-red-600'}`}>{h.result}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={clearHistory} className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-700">Clear History</button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminSecurity;
