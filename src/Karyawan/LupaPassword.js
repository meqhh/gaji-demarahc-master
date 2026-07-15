import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LupaPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");

  const handleResetPassword = async () => {
    // Validasi frontend
    if (!email || !password || !konfirmasiPassword) {
      alert("Semua data wajib diisi.");
      return;
    }

    if (password !== konfirmasiPassword) {
      alert("Konfirmasi password tidak sama.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/lupa-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          konfirmasiPassword,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Password berhasil diperbarui.");
        navigate("/login");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan pada server.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">

        <h2 className="text-2xl font-bold text-center mb-6">
          Lupa Password
        </h2>

        <input
          type="email"
          placeholder="Masukkan Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-3 mb-3"
        />

        <input
          type="password"
          placeholder="Password Baru"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg p-3 mb-3"
        />

        <input
          type="password"
          placeholder="Konfirmasi Password"
          value={konfirmasiPassword}
          onChange={(e) => setKonfirmasiPassword(e.target.value)}
          className="w-full border rounded-lg p-3 mb-4"
        />

        <button
          type="button"
          onClick={handleResetPassword}
          className="w-full bg-pink-400 hover:bg-pink-500 text-white p-3 rounded-lg transition"
        >
          Simpan Password
        </button>

      </div>
    </div>
  );
}

export default LupaPassword;