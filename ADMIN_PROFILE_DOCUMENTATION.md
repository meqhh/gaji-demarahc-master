# Dokumentasi: Halaman Pengaturan Profil Admin - Integrasi Data Real

## Ringkasan Implementasi

Halaman Pengaturan Profil Admin telah dibuat dengan terhubung langsung ke data registrasi pengguna dari database, tanpa menggunakan data dummy.

## Perubahan yang Dilakukan

### 1. **Backend - Update User Model** (`server/models/User.js`)
Ditambahkan field profil ke dalam User Schema:
- `telepon` (String, optional)
- `alamat` (String, optional)
- `biografi` (String, optional)
- `departemen` (String, enum: HR, Keuangan, IT, Operasional, Admin, Kesehatan, Pendidikan, Lainnya)

```javascript
telepon: { type: String, default: null }
alamat: { type: String, default: null }
biografi: { type: String, default: null }
departemen: {
  type: String,
  enum: ['HR', 'Keuangan', 'IT', 'Operasional', 'Admin', 'Kesehatan', 'Pendidikan', 'Lainnya'],
  default: null
}
```

### 2. **Backend - Update Auth Controller** (`server/controllers/authController.js`)
Fungsi `updateUser` diperbarui untuk menangani semua field profil:
- Menerima: nama, email, telepon, alamat, biografi, departemen
- Validasi departemen enum
- Field dapat diset ke null (kosong) untuk yang optional
- Menyimpan ke database melalui usersDB

### 3. **Frontend - Profile Service** (`src/services/authService.js`)
Ditambahkan fungsi baru:
```javascript
export const updateUserProfile = async (token, profileData) => {
  // PUT /api/auth/profile
  // Mengirim data profil ke server
}
```

### 4. **Frontend - AppContext Update** (`src/context/AppContext.js`)
Perubahan signifikan:
- `userProfile` sekarang diambil dari API setelah login
- Ditambahkan `userLoading` dan `userError` state
- useEffect baru untuk load data dari API jika token tersedia
- Data disimpan ke localStorage untuk cache

```javascript
// Load user data dari API jika ada token
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    getCurrentUser(token)
      .then(res => {
        if (res.success && res.data) {
          setUserProfile(res.data);
        }
      })
      .catch(err => setUserError(err.message));
  }
}, []);
```

### 5. **Frontend - AdminProfileSettings Component** (`src/Pages/AdminProfileSettings.js`)
Komponen baru yang:
- **Memuat data real** dari AppContext (yang terhubung ke API)
- **Menampilkan status loading** saat data dimuat
- **Nama & Email readonly** karena otomatis dari registrasi
- **Departemen dropdown** dengan 8 opsi: HR, Keuangan, IT, Operasional, Admin, Kesehatan, Pendidikan, Lainnya
- **Field optional kosong** awalnya: Telepon, Alamat, Biografi
- **Validasi dan error handling** saat menyimpan
- **Modal success/error** untuk feedback pengguna
- **Hanya tampilkan data admin yang login** (dari token)

## Alur Data

```
Login (Email + Password)
    ↓
Backend: Generate JWT Token
    ↓
Frontend: Simpan token ke localStorage
    ↓
AppContext: Load user profile via API /auth/me
    ↓
AdminProfileSettings: Tampilkan data di UI
    ↓
Edit Profil: Kirim ke /api/auth/profile (PUT)
    ↓
Backend: Update di database
    ↓
Frontend: Update AppContext + UI
```

## Fitur Utama

### ✅ Integrasi Data Real
- Data diambil langsung dari database user registration
- Tidak ada dummy data sama sekali
- Setiap login refresh data dari server

### ✅ Keamanan
- Token-based authentication (JWT)
- Nama & Email tidak dapat diubah (read-only)
- Hanya user yang login yang bisa akses profil mereka sendiri
- Password hashing di backend

### ✅ User Experience
- Loading indicator saat fetch data
- Error handling dengan pesan user-friendly
- Success message setelah update
- Departemen dropdown dengan opsi lengkap
- Auto-disable tombol saat saving

### ✅ Data Integrity
- Field optional kosong awalnya (tidak ada default)
- Validasi enum untuk departemen
- Timestamp otomatis (createdAt, updatedAt)
- Null values untuk field yang tidak diisi

## Field Profil Admin

### Read-Only (dari registrasi):
- Nama
- Email

### Editable (dapat dikosongkan):
- Telepon (kosong default)
- Alamat (kosong default)
- Biografi (kosong default)
- Departemen (dropdown, kosong default)

## Testing Checklist

### 1. Test Login
```
Email: admin@demara.com
Password: [sesuai registrasi]
Expected: Redirect ke /admin/dashboard + load profil
```

### 2. Test Profil Loaded
```
Path: /admin/profile
Expected: 
- Data nama & email terisi otomatis
- Field lain kosong jika belum diisi
- Loading indicator hilang setelah data load
```

### 3. Test Edit Profil
```
Click "Edit Profil"
Expected:
- Mode edit aktif
- Nama & email disabled (gray)
- Form fields editable
```

### 4. Test Save Profil
```
1. Isi Telepon: +62 812 3456 7890
2. Pilih Departemen: IT
3. Isi Alamat: Jl. Merdeka No. 123
4. Isi Biografi: Admin sistem
5. Click "Simpan Perubahan"

Expected:
- Loading state dengan spinner
- Success message: "Profil berhasil diperbarui!"
- Data tersimpan ke database
- Refresh page menampilkan data terbaru
```

### 5. Test Validation
```
Departemen: Pilih opsi yang valid
Expected: Hanya enum values yang diterima
```

### 6. Test Error Handling
```
Scenario: Server tidak responding
Expected: Error message + dapat retry
```

## File yang Diubah/Dibuat

### Backend
- ✅ `server/models/User.js` - Updated schema
- ✅ `server/controllers/authController.js` - Updated updateUser function
- ✅ `server/routes/auth.js` - Route sudah ada (PUT /profile)

### Frontend
- ✅ `src/services/authService.js` - Added updateUserProfile
- ✅ `src/context/AppContext.js` - Updated to load from API
- ✅ `src/Pages/AdminProfileSettings.js` - New component (replaced old one)

## Dependencies
- React Context API (existing)
- React Hooks (existing)
- Tailwind CSS (existing)
- localStorage (native)

## Notes
- File-based database (users.json) di `server/data/`
- JWT token expiry: 7 hari
- Admin registration key required untuk daftar sebagai admin
- Profile update langsung ke database (real-time)

## Troubleshooting

### Masalah: Data profil tidak load
- **Solusi**: Pastikan token ada di localStorage setelah login
- Check browser DevTools > Application > LocalStorage

### Masalah: Tidak bisa save profil
- **Solusi**: Pastikan backend server running di port 5000
- Check server console untuk error messages

### Masalah: Field berubah jadi read-only
- **Solusi**: Browser cache. Clear localStorage dan login ulang

## Next Steps (Optional)
1. Tambah profile picture upload
2. Tambah password change modal
3. Tambah activity logging
4. Tambah export data profil
5. Tambah soft delete untuk akun
