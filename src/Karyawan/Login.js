import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/authService";
import { AppContext } from "../context/AppContext";
import Logo from "../Images/demaralogo.png";
import Hero from "../Images/loginkaryawan.png";

function Login() {
  const appContext = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "Login - Demara";
  }, []);

  useEffect(() => {
    if (location && location.state && location.state.successMessage) {
      setInfo(location.state.successMessage);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError("Email dan password harus diisi");
        setIsLoading(false);
        return;
      }

      // Call backend API
      const response = await loginUser(email, password);

      if (response.success) {
        const { token, user } = response.data;

        // PENTING: Clear semua data lama sebelum set yang baru
        // Ini mencegah data karyawan lama tertinggal saat admin login
        localStorage.removeItem("userProfile");
        localStorage.removeItem("karyawanLoggedIn");
        localStorage.removeItem("karyawanUsername");
        localStorage.removeItem("karyawanId");
        localStorage.removeItem("karyawanEmail");
        localStorage.removeItem("user");

        // Save token dan user info fresh
        if (user && user.nama && !user.name) user.name = user.nama;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("userProfile", JSON.stringify(user));
        if (appContext && typeof appContext.setUserProfile === 'function') {
          appContext.setUserProfile(user);
        }
        
        // Simpan juga dengan prefix sesuai role untuk compatibility
        if (user.role === 'admin') {
          localStorage.setItem("adminLoggedIn", "true");
          localStorage.setItem("adminEmail", user.email);
          // Clear karyawan keys saat admin login
          localStorage.removeItem("karyawanLoggedIn");
          localStorage.removeItem("karyawanEmail");
        } else {
          localStorage.setItem("karyawanLoggedIn", "true");
          localStorage.setItem("karyawanUsername", user.nama);
          localStorage.setItem("karyawanId", user.karyawanId || user.id);
          localStorage.setItem("karyawanEmail", user.email);
          // Clear admin keys saat karyawan login
          localStorage.removeItem("adminLoggedIn");
          localStorage.removeItem("adminEmail");
        }

        // Mark last login
        const todayKey = new Date().toISOString().slice(0, 10);
        localStorage.setItem('karyawanLastLogin', todayKey);

        // Route berdasarkan role
        if (user.role === 'admin') {
          navigate("/admin/dashboard");
        } else {
          navigate("/karyawan/dashboard");
        }
      }
    } catch (err) {
      setError(err.message || "Login gagal. Periksa email dan password Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white relative">
      <style>{`
        @keyframes floatY {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.9 }
          50% { transform: translateY(-18px) translateX(4px) scale(1.03); opacity: 1 }
          100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.9 }
        }
        @keyframes driftX {
          0% { transform: translateX(0) }
          50% { transform: translateX(8px) }
          100% { transform: translateX(0) }
        }
        .float-slow { animation: floatY 6.5s ease-in-out infinite; }
        .float-medium { animation: floatY 5.2s ease-in-out infinite; }
        .float-fast { animation: floatY 4.2s ease-in-out infinite; }
        .drift { animation: driftX 9s linear infinite; }
        .icon-glow { filter: drop-shadow(0 8px 18px rgba(240,130,180,0.12)); }
        .icon-small { width: 40px; height: 40px; }
        .icon-mid { width: 72px; height: 72px; }
      `}</style>

      {/* Animated professional geometric elements */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 8, pointerEvents: 'none' }}>
        <svg className="float-slow icon-glow icon-small" style={{ position: 'absolute', left: '6%', top: '6%', opacity: 0.9 }} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="#E89DB1" strokeWidth="1.5" opacity="0.8"/><circle cx="12" cy="12" r="6" fill="none" stroke="#D87BA3" strokeWidth="1" opacity="0.5"/></svg>
        <svg className="float-medium icon-glow icon-mid" style={{ position: 'absolute', left: '14%', top: '28%', opacity: 0.85 }} viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor: '#F4B8D7', stopOpacity: 1}} /><stop offset="100%" style={{stopColor: '#E89DB1', stopOpacity: 1}} /></linearGradient></defs><circle cx="12" cy="12" r="9" fill="url(#grad1)" opacity="0.7"/></svg>
        <svg className="float-fast icon-glow icon-small" style={{ position: 'absolute', left: '8%', bottom: '12%', opacity: 0.85 }} viewBox="0 0 24 24" aria-hidden="true"><line x1="2" y1="2" x2="22" y2="2" stroke="#D87BA3" strokeWidth="1.5" opacity="0.6"/><line x1="2" y1="12" x2="22" y2="12" stroke="#E89DB1" strokeWidth="1.5" opacity="0.5"/><line x1="2" y1="22" x2="22" y2="22" stroke="#D87BA3" strokeWidth="1.5" opacity="0.6"/></svg>
        <svg className="float-medium drift icon-glow icon-small" style={{ position: 'absolute', right: '10%', top: '10%', opacity: 0.8 }} viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="2.5" fill="#E89DB1" opacity="0.7"/><circle cx="6" cy="18" r="2.5" fill="#D87BA3" opacity="0.6"/><circle cx="18" cy="12" r="2.5" fill="#F4B8D7" opacity="0.7"/></svg>
      </div>

      {/* Left decorative column */}
      <div className="hidden lg:flex lg:w-5/12 items-center justify-center overflow-hidden relative bg-white">
        <div className="absolute top-20 left-20 w-16 h-16 rounded-full bg-pink-300 opacity-25 blur-2xl"></div>
        <div className="absolute top-12 right-32 w-12 h-12 rounded-full bg-purple-300 opacity-20 blur-2xl"></div>
        <div className="absolute top-24 right-12 w-8 h-8 rounded-full bg-purple-300 opacity-15 blur-xl"></div>
      </div>

      {/* Hero image */}
      <img
        src={Hero}
        alt="Demara Health Care"
        className="hidden lg:block absolute z-10 pointer-events-none"
        style={{ left: '42%', top: '50%', transform: 'translate(-50%, -50%)', width: '920px', maxWidth: '80vw' }}
      />

      {/* Right form section */}
      <div className="flex-1 w-full lg:w-7/12 flex items-center justify-center bg-white px-8 py-12 relative z-20">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-12">
            <div className="mb-4">
              <img src={Logo} alt="Demara Logo" className="w-32 h-32 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 text-center leading-tight">DEMARA HEALTH CARE</h1>
            <p className="text-sm font-semibold text-purple-500 mt-3 text-center">HAPPY MOMMY HEALTHY BABY</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
              {info && (
                <div className="text-green-700 text-sm text-center bg-green-50 p-3 rounded-xl border border-green-200">{info}</div>
              )}
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-xl border border-red-200">{error}</div>
              )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-5 py-3 border-2 border-pink-300 rounded-xl placeholder-gray-300 text-gray-700 bg-white focus:outline-none focus:border-purple-400 focus:ring-0 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-5 py-3 border-2 border-pink-300 rounded-xl placeholder-gray-300 text-gray-700 bg-white focus:outline-none focus:border-purple-400 focus:ring-0 transition-all duration-300"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-2 border-pink-300 accent-pink-400 cursor-pointer"
                  disabled={isLoading}
                />
                <span className="text-gray-600">Ingat Saya</span>
              </label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-purple-500 hover:text-purple-600 font-semibold transition-colors"
              >
                Lupa Password?
              </button>
            </div>

            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="px-12 py-3 bg-pink-300 hover:bg-pink-400 text-gray-600 font-semibold rounded-2xl shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 w-full"
              >
                {isLoading ? "Loading..." : "Login"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-6">
            © 2025 <span className="font-bold text-green-600">Demara</span> Health Care - All Rights Reserved
          </p>

          {/* Register Section */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm mb-3">Belum memiliki akun?</p>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full px-4 py-2.5 border-2 border-green-600 text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-all duration-300"
            >
              Daftar Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
