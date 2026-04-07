# 🗄️ MySQL Database Setup Guide

Sebelumnya project ini menggunakan database JSON file-based. Sekarang sudah diubah ke **MySQL** dengan struktur database yang lebih robust.

## 📋 Prerequisites

Pastikan sudah install:
- **MySQL Server** (versi 5.7+)
- **Node.js** (sudah ada)

Jika belum install MySQL:
- **Windows**: Download dari [mysql.com](https://dev.mysql.com/downloads/mysql/) atau gunakan Laragon
- **MacOS**: `brew install mysql` atau use Laragon
- **Linux**: `sudo apt-get install mysql-server`

---

## ⚙️ 1. Configure Database Connection

Edit file `.env` di folder `server/`:

```env
PORT=5555
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_this_in_production
ADMIN_REGISTER_KEY=admin123

# MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          # Kosongkan jika tidak ada password (default Laragon)
DB_NAME=demara_gaji
```

### Contoh konfigurasi untuk berbagai setup:

**Laragon (Default)**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=demara_gaji
```

**Custom MySQL Server**
```env
DB_HOST=localhost/192.168.x.x
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=demara_gaji
```

---

## 🚀 2. Setup Database

### Terminal 1: Jalankan setup script

```bash
cd server
npm run setup-db
```

**Output yang diharapkan:**
```
📊 Starting database setup...
✓ Database demara_gaji created/exists
✓ Database tables created successfully
✓ Database setup complete!
```

### Apa yang dilakukan script setup:
1. ✓ Membuat database `demara_gaji`
2. ✓ Membuat semua tabel (users, karyawan, cuti, absensi, gaji, treatment, slip_gaji)
3. ✓ Setup primary keys dan foreign keys
4. ✓ Setup AUTO_INCREMENT untuk setiap tabel

---

## 3️⃣ 3. Run Application

### Terminal 1: Start Backend (MySQL connected)
```bash
cd server
npm run dev
```

**Expected output:**
```
✓ MySQL database connected
🚀 Server berjalan di http://localhost:5555
```

### Terminal 2: Start Frontend
```bash
npm start
```

**Expected output:**
```
Compiled successfully!
Local: http://localhost:3000
```

---

## ✅ 4. Test the Application

1. **Open Browser**: http://localhost:3000
2. **Register Account**: Klik "Daftar" dan isi data
3. **Login**: Gunakan email & password yang terdaftar
4. **Create Employee**: Tambah data karyawan
5. **Check Database**: 

```bash
# Verify data di MySQL
mysql -u root -p demara_gaji
# Query example:
# SELECT * FROM users;
# SELECT * FROM karyawan;
```

---

## 📊 Database Tables

### `users` - Untuk Authentication
```sql
- id (INT PRIMARY KEY AUTO_INCREMENT)
- name (VARCHAR)
- email (VARCHAR UNIQUE)
- password (VARCHAR)
- role (VARCHAR) - 'admin' atau 'karyawan'
- created_at (TIMESTAMP)
```

### `karyawan` - Data Karyawan
```sql
- id (INT PRIMARY KEY AUTO_INCREMENT)
- nama (VARCHAR)
- jabatan (VARCHAR)
- gaji_pokok (DECIMAL)
- tunjangan (DECIMAL)
- no_hp (VARCHAR)
- alamat (TEXT)
- created_at (TIMESTAMP)
```

### `cuti` - Leave Management
```sql
- id (INT PRIMARY KEY)
- karyawan_id (INT FK)
- tanggal_mulai (DATE)
- tanggal_selesai (DATE)
- alasan (TEXT)
- status (ENUM: pending, disetujui, ditolak)
```

### `absensi` - Attendance
```sql
- id (INT PRIMARY KEY)
- karyawan_id (INT FK)
- tanggal (DATE)
- status (ENUM: hadir, izin, sakit, alpha)
```

### `slip_gaji` - Payslips
```sql
- id (INT PRIMARY KEY)
- karyawan_id (INT FK)
- bulan (VARCHAR)
- tahun (INT)
- gaji_pokok (DECIMAL)
- bonus (DECIMAL)
- potongan (DECIMAL)
- total_gaji (DECIMAL)
```

---

## 🔧 Troubleshooting

### ❌ "Connection Refused" Error
```
Fix: Pastikan MySQL server sudah running
Windows: net start MySQL80
Mac: brew services start mysql
Linux: sudo systemctl start mysql
```

### ❌ "Access Denied" Error
```
Fix: Check credentials di .env
Default Laragon: user=root, password=(kosong)
```

### ❌ "Database already exists" Warning
```
Ini normal, setup akan lanjut ke create tables
```

### ❌ "Unknown database 'demara_gaji'"
```
Fix: Run setup script terlebih dahulu:
npm run setup-db
```

---

## 📝 API Endpoints (Unchanged)

Semua API endpoints tetap sama:
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/karyawan` - Get all employees
- `POST /api/karyawan` - Create employee
- `GET /api/cuti` - Get leave requests
- `GET /api/absensi` - Get attendance
- `GET /api/slip-gaji` - Get payslips

---

## 🔄 Migrasi Data dari JSON (jika punya data lama)

Jika sebelumnya ada data di file JSON, Anda bisa:

1. Export data dari `server/data/users.json`
2. Insert ke table users di MySQL
3. Lakukan hal yang sama untuk `karyawan.json` → table karyawan

Contoh:
```bash
# Export dari JSON dan import ke MySQL
# Bisa menggunakan tools seperti MySQL Workbench atau command line
```

---

## ✨ Benefits MySQL vs JSON

| Aspek | JSON | MySQL |
|-------|------|-------|
| **Performance** | Slow untuk data besar | Fast dengan indexing |
| **Concurrency** | Tidak aman | ACID transactions |
| **Backup** | Manual | Automated |
| **Scalability** | Limited | Unlimited rows |
| **Query** | Linear search | SQL queries |

---

## 📞 Support

Jika ada masalah:
1. Check `.env` configuration
2. Verify MySQL is running
3. Check error message di terminal
4. Review MySQL logs

---

**Selamat! Database sudah berhasil migrasi ke MySQL! 🚀**
