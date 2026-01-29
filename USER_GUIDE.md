# Panduan Penggunaan Fitur Baru

## 1. Delete Function di Menu Slip Gaji

### Cara Menggunakan:
1. Masuk ke **Admin Panel** → **Menu Slip Gaji**
2. Lihat daftar slip gaji yang tersedia
3. Cari slip gaji yang ingin dihapus
4. Klik tombol **"Hapus"** (ikon trash/sampah) di baris slip gaji tersebut
5. Modal konfirmasi akan muncul menampilkan data slip gaji yang akan dihapus
6. Klik **"Hapus"** untuk mengkonfirmasi penghapusan
7. Slip gaji akan dihapus dari sistem dan tidak akan terlihat lagi

### Cara Kerja Backend:
- Data disimpan di AppContext (state management React)
- Data juga di-backup di localStorage browser
- Saat delete, data dihapus dari kedua tempat tersebut
- Perubahan otomatis ter-sinkronisasi di semua komponen yang menggunakan data tersebut

---

## 2. Sinkronisasi Data Karyawan ke Menu Lainnya

### Scenario: Menambah Karyawan Baru

#### Langkah 1: Tambah Karyawan di Menu Karyawan
1. Masuk ke **Admin Panel** → **Menu Karyawan**
2. Klik tombol **"+ Tambah Karyawan"**
3. Isi semua form yang diperlukan:
   - Nama (required)
   - Posisi (required)
   - No. HP
   - Email (required)
   - Alamat
   - Tempat Lahir
   - Tanggal Lahir
   - Tanggal Masuk (required)
   - Tanggal Kontrak
   - Lama Kontrak
   - Foto (optional)
4. Klik **"Simpan"** untuk menambahkan karyawan

#### Langkah 2: Karyawan Otomatis Muncul di Menu Lainnya
Setelah menambahkan karyawan, data karyawan akan **otomatis tersedia** di:

1. **Menu Absensi**
   - Buka Admin Panel → Menu Absensi
   - Pada filter "Pilih Karyawan", karyawan baru akan muncul di list
   - Bisa langsung membuat data absensi untuk karyawan baru

2. **Menu Gaji**
   - Buka Admin Panel → Menu Gaji
   - Pada dropdown "Pilih Karyawan", karyawan baru akan muncul
   - Bisa langsung menambahkan data gaji/tindakan untuk karyawan baru

3. **Menu Cuti Karyawan**
   - Buka Admin Panel → Menu Cuti Karyawan
   - Pada filter "Pilih Karyawan", karyawan baru akan muncul
   - Bisa langsung membuat data cuti untuk karyawan baru

### Menu yang TIDAK Terpengaruh
- **Dashboard**: Tetap menampilkan statistik yang sama, tidak ada karyawan otomatis
- **Treatment**: Tetap independent, tidak ada karyawan otomatis

---

## 3. Implementasi Technical Details

### State Management
```
AppContext (Context API)
├── karyawanData (daftar semua karyawan)
├── absensiData (daftar absensi)
├── gajiData (daftar gaji)
├── cutiData (daftar cuti)
└── slipGajiData (daftar slip gaji)
```

### Data Flow untuk Sinkronisasi
```
User Add Karyawan
    ↓
addKaryawan() in Karyawan.js
    ↓
AppContext.addKaryawan()
    ↓
karyawanData updated in state
    ↓
localStorage updated
    ↓
Absensi.js, Gaji.js, CutiKaryawan.js
    ↓
uniqueKaryawanNames computed dengan karyawanData
    ↓
UI di-render dengan karyawan baru
```

### Data Flow untuk Delete Slip Gaji
```
User Klik Delete
    ↓
handleDelete() -> setShowDelete(true)
    ↓
User Klik Confirm Delete
    ↓
confirmDelete() -> deleteSlipGaji(id)
    ↓
AppContext.deleteSlipGaji()
    ↓
slipGajiData updated (remove item dengan id tersebut)
    ↓
localStorage updated
    ↓
SlipGaji.js re-render dengan data terbaru
    ↓
Data hilang dari list
```

---

## 4. Troubleshooting

### Karyawan Tidak Muncul di Menu Lain
**Solusi:**
1. Refresh halaman (F5)
2. Check browser localStorage (F12 → Application → LocalStorage)
3. Pastikan karyawan sudah tersimpan dengan klik "Simpan"

### Delete Tidak Berfungsi
**Solusi:**
1. Check browser console (F12 → Console) untuk error message
2. Pastikan AppContext sudah loaded dengan benar
3. Try refresh halaman sebelum delete

### Data Hilang Setelah Refresh
**Solusi:**
1. Data seharusnya tetap ada (disimpan di localStorage)
2. Check localStorage di F12 → Application → LocalStorage
3. Jika hilang, kemungkinan localStorage dibersihkan (clear browser data)

---

## 5. Best Practices

✅ **Lakukan:**
- Selalu klik "Simpan" saat menambah data
- Konfirmasi sebelum delete data penting
- Refresh halaman jika ada data yang tidak sinkron
- Backup data penting di database (jika menggunakan backend)

❌ **Jangan:**
- Jangan close browser tanpa save
- Jangan clear localStorage tanpa backup
- Jangan mengandalkan localStorage sebagai backup jangka panjang

---

## 6. Feature Status

| Fitur | Status | Menu yang Affected |
|-------|--------|-------------------|
| Delete Slip Gaji | ✅ Working | Slip Gaji |
| Sync Karyawan | ✅ Working | Absensi, Gaji, Cuti |
| Independent Dashboard | ✅ No Change | Dashboard |
| Independent Treatment | ✅ No Change | Treatment |

---

**Last Updated:** 2025-01-24
**Version:** 1.0.0
