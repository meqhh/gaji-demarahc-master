import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

function LoginRegister() {
  const { setUserProfile, karyawanData, setKaryawanData } = useContext(AppContext);
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Login form
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });

  // Register form
  const [registerData, setRegisterData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    nip: "",
    posisi: "",
    departemen: ""
  });

  useEffect(() => {
    document.title = "Login & Register - Demara";
  }, []);

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    setTimeout(() => {
      const { username, password } = loginData;

      if (!username || !password) {
        setError("Username dan password harus diisi");
        setIsLoading(false);
        return;
      }

      // Admin login
      if (username === "admin" && password === "demo123") {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("userRole", "admin");
        navigate("/admin/dashboard");
        setIsLoading(false);
        return;
      }

      // Check karyawan by email/nip
      const karyawan = karyawanData.find(k => 
        (k.email === username || k.nip === username) && k.password === password
      );

      if (karyawan) {
        localStorage.setItem("karyawanLoggedIn", "true");
        localStorage.setItem("userRole", "karyawan");
        localStorage.setItem("karyawanId", karyawan.id);
        localStorage.setItem("karyawanUsername", karyawan.nama);
        setUserProfile({
          id: karyawan.id,
          name: karyawan.nama,
          email: karyawan.email,
          nip: karyawan.nip,
          posisi: karyawan.posisi
        });
        navigate("/karyawan/dashboard");
        setIsLoading(false);
        return;
      }

      // Demo karyawan
      if (username === "karyawan" && password === "demo123") {
        localStorage.setItem("karyawanLoggedIn", "true");
        localStorage.setItem("userRole", "karyawan");
        navigate("/karyawan/dashboard");
        setIsLoading(false);
        return;
      }

      setError("Username atau password salah");
      setIsLoading(false);
    }, 600);
  };

  // Handle register
  const handleRegister = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    const { nama, email, password, confirmPassword, nip, posisi, departemen } = registerData;

    // Validation
    if (!nama || !email || !password || !confirmPassword || !nip || !posisi || !departemen) {
      setError("Semua field harus diisi");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      setIsLoading(false);
      return;
    }

    // Check email already exists
    if (karyawanData.some(k => k.email === email)) {
      setError("Email sudah terdaftar");
      setIsLoading(false);
      return;
    }

    // Check NIP already exists
    if (karyawanData.some(k => k.nip === nip)) {
      setError("NIP sudah terdaftar");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      // Add new karyawan
      const newKaryawan = {
        id: `EMP${Date.now()}`,
        nama,
        email,
        nip,
        password,
        posisi,
        departemen,
        gajiPokok: 0,
        tunjangan: 0,
        asuransi: 0,
        pajak: 0,
        createdAt: new Date().toISOString()
      };

      setKaryawanData([...karyawanData, newKaryawan]);
      
      setMessage("Pendaftaran berhasil! Silahkan login dengan akun Anda.");
      setRegisterData({
        nama: "",
        email: "",
        password: "",
        confirmPassword: "",
        nip: "",
        posisi: "",
        departemen: ""
      });
      
      setTimeout(() => {
        setIsLogin(true);
        setMessage("");
      }, 2000);

      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.5s ease-out; }
      `}</style>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DEMARA</h1>
          <p className="text-sm text-gray-600">Sistem Manajemen SDM Kesehatan</p>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8">
          {/* Tab Toggle */}
          <div className="flex gap-0 mb-8 border-b border-gray-200">
            <button
              onClick={() => { setIsLogin(true); setError(""); setMessage(""); }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                isLogin
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); setMessage(""); }}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                !isLogin
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-gray-100 border border-gray-300 text-gray-800 text-sm rounded fade-in">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-gray-100 border border-gray-300 text-gray-800 text-sm rounded fade-in">
              {message}
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Email atau NIP
                </label>
                <input
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  placeholder="admin@demara.com atau karyawan NIP"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-200"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Masukkan password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-200"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm mt-6"
              >
                {isLoading ? "Memproses..." : "Masuk"}
              </button>

              <div className="text-center text-xs text-gray-600 pt-4">
                <p>Demo Admin: admin / demo123</p>
                <p>Demo Karyawan: karyawan / demo123</p>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={registerData.nama}
                  onChange={(e) => setRegisterData({ ...registerData, nama: e.target.value })}
                  placeholder="Nama lengkap"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-200"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  placeholder="Email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-200"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  NIP
                </label>
                <input
                  type="text"
                  value={registerData.nip}
                  onChange={(e) => setRegisterData({ ...registerData, nip: e.target.value })}
                  placeholder="Nomor Induk Pegawai"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-200"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Posisi
                </label>
                <input
                  type="text"
                  value={registerData.posisi}
                  onChange={(e) => setRegisterData({ ...registerData, posisi: e.target.value })}
                  placeholder="Posisi/Jabatan"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-200"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Departemen
                </label>
                <input
                  type="text"
                  value={registerData.departemen}
                  onChange={(e) => setRegisterData({ ...registerData, departemen: e.target.value })}
                  placeholder="Departemen"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-200"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-200"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  placeholder="Konfirmasi password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-200"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm mt-4"
              >
                {isLoading ? "Mendaftar..." : "Daftar Sekarang"}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <p>&copy; 2024 Demara Health Care. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default LoginRegister;
