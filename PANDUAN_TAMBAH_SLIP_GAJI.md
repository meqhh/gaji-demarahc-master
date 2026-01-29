# PANDUAN PENGGUNAAN FITUR TAMBAH SLIP GAJI

## 🎯 Ringkasan Singkat

Fitur baru **"Tambah Slip Gaji"** telah ditambahkan ke menu Slip Gaji dengan desain profesional. Anda sekarang dapat menambahkan data slip gaji karyawan baru langsung dari interface tanpa perlu manual input di code.

---

## 📍 Lokasi Button

**Di mana button-nya?**
- Masuk ke: **Admin Panel → Slip Gaji**
- Button **"Tambah Slip Gaji"** ada di **top-right header** sebelah judul
- Warna: **Purple gradient** dengan icon plus (+)
- Hover effect: Button akan membesar ketika di-hover

**Visual:**
```
┌─────────────────────────────────────────────────────────┐
│  Slip Gaji                          [+ Tambah Slip Gaji] │
│  Slip Gaji                                               │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Cara Menggunakan

### Step 1: Klik Button "Tambah Slip Gaji"
```
1. Masuk Admin Panel
2. Pilih menu "Slip Gaji"
3. Cari button "Tambah Slip Gaji" di top-right
4. Klik button tersebut
```

**Hasil:** Modal form akan terbuka

### Step 2: Isi Form Data

**Form terdiri dari:**

| Field | Tipe | Required | Keterangan |
|-------|------|----------|-----------|
| Nama Karyawan | Dropdown | ✅ Ya | Pilih dari daftar karyawan |
| Posisi | Text | ✅ Ya | Contoh: Bidan, Staff, Manajer |
| Gaji Pokok | Number | ✅ Ya | Contoh: 2000000 |
| Uang Transport | Number | ❌ Opsional | Contoh: 500000 |
| Fee Tindakan | Number | ❌ Opsional | Contoh: 4000000 |
| Potongan BPJS | Number | ❌ Opsional | Contoh: 50000 |
| Status | Dropdown | ✅ Ya | "Belum Dikirim" atau "Dikirim" |

**Catatan Penting:**
- **Nama Karyawan**: Dropdown otomatis mengambil dari master karyawan
- **Total Gaji**: Dihitung otomatis, TIDAK perlu di-input manual
  ```
  Total = Gaji Pokok + Uang Transport + Fee Tindakan - Potongan BPJS
  ```

### Step 3: Submit Form

**Opsi:**
- **Simpan Slip Gaji** - Simpan data baru
- **Batal** - Batal tanpa menyimpan
- **Close (X)** - Tutup modal tanpa menyimpan

---

## 📋 Contoh Lengkap

### Menambah Slip Gaji untuk Karyawan "Ahmad Fikri"

**Data yang diinput:**
```
Nama Karyawan    : Ahmad Fikri        (pilih dari dropdown)
Posisi           : Bidan              (ketik: "Bidan")
Gaji Pokok       : 2000000            (ketik: "2000000")
Uang Transport   : 500000             (ketik: "500000")
Fee Tindakan     : 4000000            (ketik: "4000000")
Potongan BPJS    : 50000              (ketik: "50000")
Status           : Belum Dikirim      (pilih dari dropdown)
```

**Hasil Kalkulasi Otomatis:**
```
Total Gaji = 2,000,000 + 500,000 + 4,000,000 - 50,000 = 6,450,000
```

**Output dalam Table:**
```
No. | Nama Karyawan | Posisi | Total Gaji      | Status          | Aksi
----|---------------|--------|-----------------|-----------------|-----
... | Ahmad Fikri   | Bidan  | Rp 6.450.000    | Belum Dikirim    | ...
```

---

## ✨ Fitur-Fitur Modal

### Header
- **Judul**: "Tambah Slip Gaji"
- **Subtitle**: "Tambahkan data slip gaji karyawan baru"
- **Close Button**: (X) untuk menutup modal

### Form Layout
- **Responsive**: Desktop 2-column, Mobile 1-column
- **Visual Feedback**: 
  - Input border berubah warna saat focus
  - Purple focus ring untuk highlight
  
### Info Box
```
💡 Informasi:
Total Gaji akan dihitung otomatis: 
Gaji Pokok + Uang Transport + Fee Tindakan - Potongan BPJS
```

### Footer Buttons
- **Batal** - Border button, abu-abu
- **Simpan Slip Gaji** - Gradient purple button

---

## ✅ Checklist Verifikasi

Setelah menambah data, verifikasi:

- [ ] Data muncul di table Slip Gaji
- [ ] Nama karyawan tampil sesuai yang di-input
- [ ] Total Gaji dihitung dengan benar
- [ ] Status tampil sesuai pilihan
- [ ] Data bisa di-detail (klik "Detail")
- [ ] Data bisa di-print (klik "Cetak")
- [ ] Data bisa di-delete (klik "Hapus")
- [ ] **PENTING**: Refresh page → Data tetap ada (tidak hilang)

---

## 🔍 Data Storage

**Di mana data disimpan?**
1. Local component state (dataGaji)
2. Browser localStorage (persistence)
3. App context (untuk sync ke menu lain)

**Artinya:**
- Data akan tetap ada setelah **page refresh**
- Data akan tetap ada setelah **tutup browser** (reload page)
- Data **NOT** sync ke server (hanya localStorage)

---

## 🚨 Validasi & Pesan Error

### Required Fields Validation
Jika Anda mencoba submit tanpa mengisi required fields:

```
Alert: "Silakan isi nama, posisi, dan gaji pokok"
```

**Required Fields:**
- ✅ Nama Karyawan (wajib pilih dari dropdown)
- ✅ Posisi (wajib text)
- ✅ Gaji Pokok (wajib number)

**Optional Fields** (bisa kosongkan):
- Uang Transport
- Fee Tindakan
- Potongan BPJS
- Status (auto default "Belum Dikirim")

---

## 💡 Tips & Tricks

### 1. Menambah Karyawan Baru
Jika nama karyawan yang ingin ditambahkan tidak ada di dropdown:
1. Pergi ke menu **Karyawan**
2. Klik **"Tambah Karyawan"**
3. Isi data karyawan baru
4. Kembali ke **Slip Gaji**
5. Refresh page (F5)
6. Nama baru akan muncul di dropdown

### 2. Format Number
- **Benar**: 2000000 (tanpa titik atau koma)
- **Benar**: 2000000 (angka biasa)
- **Salah**: 2.000.000 (dengan titik)
- **Salah**: Rp 2.000.000 (dengan Rp)

Aplikasi akan otomatis parse ke number dengan benar.

### 3. Mengedit Data
Data yang sudah ditambahkan:
- ❌ Tidak bisa di-edit langsung dari table
- ✅ Bisa di-delete (klik "Hapus")
- ✅ Bisa ditambah ulang dengan data baru
- ✅ Bisa di-print dan di-detail untuk verifikasi

---

## 📱 Responsive Design

### Desktop (layar besar)
- Form: 2-column grid
- Modal width: max 42rem
- Optimal untuk input cepat

### Tablet/Mobile (layar kecil)
- Form: 1-column stack
- Modal full-width dengan padding
- Scroll otomatis jika content overflow

---

## ⚠️ Penting!

### Data Backup
- Saat ini data hanya disimpan di **localStorage browser**
- **Jika clear browser cache/cookies**: Data akan hilang
- Rekomendasi: Gunakan Karyawan → export atau backup manual

### Multi-Browser
- Data **berbeda** untuk setiap browser
- Data di Chrome **tidak sama** dengan di Firefox
- Gunakan browser yang sama untuk konsistensi

### Browser Storage Limit
- Setiap browser memiliki limit localStorage
- Tidak perlu khawatir dengan data dalam jumlah normal
- Limit biasanya 5-10 MB per domain

---

## 🆘 Troubleshooting

### Problem: Modal tidak terbuka saat klik button
**Solusi:**
1. Refresh page (F5)
2. Cek browser console (F12) untuk error
3. Tunggu page fully loaded sebelum klik button

### Problem: Dropdown nama kosong
**Solusi:**
1. Pastikan sudah tambah karyawan di menu Karyawan
2. Refresh page (F5)
3. Nama baru akan muncul di dropdown

### Problem: Data tidak muncul di table setelah simpan
**Solusi:**
1. Cek filter bulan/karyawan
2. Ubah filter ke "Semua" untuk lihat semua data
3. Refresh page (F5)

### Problem: Validasi error saat simpan
**Solusi:**
1. Baca pesan alert dengan teliti
2. Pastikan Nama, Posisi, Gaji Pokok terisi
3. Coba lagi dengan data yang benar

---

## 📞 Support

Jika menemukan bug atau error:
1. Buka browser Developer Tools (F12)
2. Pergi ke Console tab
3. Screenshot error message
4. Report dengan screenshot dan langkah reproduksi

---

**Last Updated:** January 24, 2026
**Version:** 1.0 - Release
**Status:** ✅ Production Ready
