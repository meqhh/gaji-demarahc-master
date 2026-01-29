import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../services/authService";
import Logo from "../Images/demaralogo.png";

function Register() {
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    document.title = "Daftar - Demara";
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Validation
      if (!formData.nama || !formData.email || !formData.password) {
        setError("Semua field harus diisi");
        setIsLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Password tidak cocok");
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError("Password minimal 6 karakter");
        setIsLoading(false);
        return;
      }

      // Call backend register API
      const registerResponse = await registerUser({
        nama: formData.nama,
        email: formData.email,
        password: formData.password
      });

      if (registerResponse.success) {
        setSuccess("Pendaftaran berhasil! Sedang login...");
        
        // Auto-login setelah register
        setTimeout(async () => {
          try {
            const loginResponse = await loginUser(formData.email, formData.password);
            
            if (loginResponse.success) {
              const { token, user } = loginResponse.data;
              
              // Save ke localStorage
              localStorage.setItem("token", token);
              localStorage.setItem("user", JSON.stringify(user));
              localStorage.setItem("karyawanLoggedIn", "true");
              localStorage.setItem("karyawanUsername", user.nama);
              localStorage.setItem("karyawanId", user.id);
              localStorage.setItem("karyawanEmail", user.email);

              // Mark last login
              const todayKey = new Date().toISOString().slice(0, 10);
              localStorage.setItem('karyawanLastLogin', todayKey);

              // Redirect ke dashboard
              navigate("/karyawan/dashboard");
            }
          } catch (loginErr) {
            // Jika auto-login gagal, arahkan ke login page
            navigate("/login");
          }
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Pendaftaran gagal. Silakan coba lagi.");
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
        .float-slow { animation: floatY 6.5s ease-in-out infinite; }
        .float-medium { animation: floatY 5.2s ease-in-out infinite; }
        .float-fast { animation: floatY 4.2s ease-in-out infinite; }
        .icon-glow { filter: drop-shadow(0 8px 18px rgba(240,130,180,0.12)); }
        .icon-small { width: 40px; height: 40px; }
        .icon-mid { width: 72px; height: 72px; }
        .input-focus:focus {
          border-color: #16a34a;
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
        }
      `}</style>

      {/* Animated elements */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 8, pointerEvents: 'none' }}>
        <svg className="float-slow icon-glow icon-small" style={{ position: 'absolute', left: '6%', top: '6%', opacity: 0.9 }} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="#E89DB1" strokeWidth="1.5" opacity="0.8"/><circle cx="12" cy="12" r="6" fill="none" stroke="#D87BA3" strokeWidth="1" opacity="0.5"/></svg>
        <svg className="float-medium icon-glow icon-mid" style={{ position: 'absolute', left: '14%', top: '28%', opacity: 0.85 }} viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor: '#F4B8D7', stopOpacity: 1}} /><stop offset="100%" style={{stopColor: '#E89DB1', stopOpacity: 1}} /></linearGradient></defs><circle cx="12" cy="12" r="9" fill="url(#grad1)" opacity="0.7"/></svg>
      </div>

      <div className="hidden lg:flex lg:w-5/12 items-center justify-center overflow-hidden relative bg-white">
        <div className="absolute top-20 left-20 w-16 h-16 rounded-full bg-pink-300 opacity-25 blur-2xl"></div>
        <div className="absolute top-12 right-32 w-12 h-12 rounded-full bg-purple-300 opacity-20 blur-2xl"></div>
      </div>

      {/* Right form section */}
      <div className="flex-1 w-full lg:w-7/12 flex items-center justify-center bg-white px-6 py-8 relative z-20 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="mb-4">
              <img src={Logo} alt="Demara Logo" className="w-20 h-20 object-contain" />
            </div>
            <h1 className="text-4xl font-bold text-green-600 text-center">Daftar Akun</h1>
            <p className="text-gray-600 mt-3 text-center leading-relaxed">Buat akun baru untuk mengakses sistem manajemen karyawan Demara Health Care</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <p className="text-green-700 font-medium text-sm">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Nama */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Nama Lengkap</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Nama lengkap Anda"
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-700 bg-white input-focus transition-all duration-300 disabled:bg-gray-100 disabled:opacity-60"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@example.com"
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-700 bg-white input-focus transition-all duration-300 disabled:bg-gray-100 disabled:opacity-60"
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-700 bg-white input-focus transition-all duration-300 disabled:bg-gray-100 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Konfirmasi Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi password Anda"
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-700 bg-white input-focus transition-all duration-300 disabled:bg-gray-100 disabled:opacity-60"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoading ? "Sedang mendaftar..." : "Daftar Sekarang"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-gray-500 text-sm">Atau</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Link to login */}
          <div className="text-center">
            <p className="text-gray-700 text-sm mb-4">Sudah memiliki akun?</p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full px-6 py-3 border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold rounded-lg transition-all duration-300"
            >
              Kembali ke Login
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs mt-10">
            © 2025 <span className="font-semibold text-green-600">Demara</span> Health Care. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
