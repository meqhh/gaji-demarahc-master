# ⚡ Quick Start - MySQL Setup (3 Menit)

## 🎯 Langkah-langkah Cepat

### 1️⃣ Update `.env` di folder `server/`
Pastikan MySQL credentials benar:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=demara_gaji
```

### 2️⃣ Setup Database (Terminal 1)
```bash
cd server
npm run setup-db
```
✅ Tunggu hingga `Database setup complete!`

### 3️⃣ Start Backend (Terminal 1)
```bash
npm run dev
```
✅ Tunggu hingga `✓ MySQL database connected`

### 4️⃣ Start Frontend (Terminal 2)
```bash
# Dari folder project root, bukan dari server folder
npm start
```
✅ Browser otomatis buka `http://localhost:3000`

### 5️⃣ Test
- Register akun baru
- Login
- Tambah data karyawan
- ✨ SELESAI!

---

## 🛠️ Jika ada error:

**Error: "Connection refused"**
- Pastikan MySQL Server sudah running
- Windows Laragon: Klik tombol START MySQL

**Error: "Access denied"**
- Check username & password di `.env`
- Default Laragon: root / (kosong)

**Error: "Unknown database 'demara_gaji'"**
- Jalankan: `npm run setup-db`

---

## 📍 File yang berubah:

✅ `/server/.env` - Tambah konfigurasi MySQL
✅ `/server/database/mysql.js` - Connection MySQL
✅ `/server/database/mysqlDb.js` - Database operations
✅ `/server/controllers/` - Update untuk async
✅ `/demara_gaji.sql` - Database struktur

---

**Database sudah siap! 🚀**
