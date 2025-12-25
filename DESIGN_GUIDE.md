# PANDUAN UPDATE DESAIN PROFESIONAL UNTUK SEMUA HALAMAN ADMIN

## Prinsip Desain Global:
1. **Warna**: Hitam, Abu-abu, Putih (Professional Minimalist)
2. **Border**: Gray-200 (#E5E7EB) untuk card
3. **Padding**: 1.5rem (24px) untuk card besar
4. **Font**: Font weight 600-700 untuk heading

## Template Komponen Card Standar:

```jsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 card-hover animate-slide-up">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-bold text-gray-900">Judul Seksi</h3>
    <button className="text-gray-400 hover:text-gray-600">×</button>
  </div>
  {/* Content */}
</div>
```

## Perubahan untuk Setiap Halaman:

### 1. DASHBOARD (Priority 1)
Sudah diupdate dengan:
- 4 KPI card dengan icon SVG
- Chart yang lebih clean
- Summary statistics side panel
- Status system indicator

### 2. KARYAWAN (Priority 2)
Perubahan:
- Header: Text abu-abu, kurangi gradien
- Tabel: Border gray-200, padding konsisten
- Modal: Background white dengan border gray-200
- Button: Gray-900 background, no gradient
- Hapus emoji, gunakan icon SVG

### 3. ABSENSI (Priority 3)
Perubahan:
- Minimal color palette
- Status badge dengan background pastel
- Clean table layout
- Professional form inputs

### 4. GAJI (Priority 4)
Perubahan:
- Remove gradient backgrounds
- Use consistent gray borders
- Professional number formatting
- Add summary statistics

### 5. SLIP GAJI (Priority 5)
Perubahan:
- Clean white card layout
- Gray border styling
- Professional font sizing
- Remove decorative colors

### 6. TREATMENT (Priority 6)
Sudah diupdate dengan struktur yang sama seperti Karyawan

### 7. SECURITY (Priority 7)
Perubahan:
- Professional security section layout
- Gray sidebar
- List items dengan border-left gray
- Toggle switches styling

### 8. HELP (Priority 8)
Perubahan:
- FAQ layout dengan professional styling
- Gray dividers
- Consistent typography

## CSS Classes untuk Gunakan:

```css
.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -12px rgba(0,0,0,0.1);
}

/* Button Styling */
.btn-primary {
  background-color: #1f2937;
  color: white;
  border: none;
  padding: 0.625rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

.btn-primary:hover {
  background-color: #111827;
}

.btn-secondary {
  background-color: white;
  color: #374151;
  border: 1px solid #e5e7eb;
  padding: 0.625rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
}

.btn-secondary:hover {
  background-color: #f9fafb;
  border-color: #d1d5db;
}

/* Input Styling */
.input-field {
  border: 1px solid #d1d5db;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: #1f2937;
  box-shadow: 0 0 0 3px rgba(31, 41, 55, 0.1);
}

/* Badge Styling */
.badge-success {
  background-color: #dcfce7;
  color: #166534;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-warning {
  background-color: #fef3c7;
  color: #92400e;
}

.badge-danger {
  background-color: #fee2e2;
  color: #991b1b;
}
```

## Struktur Header Standar:

```jsx
<div className="mb-8 animate-slide-down">
  <h1 className="text-3xl font-bold text-gray-900 mb-1">Judul Halaman</h1>
  <p className="text-gray-500 text-sm">Deskripsi singkat</p>
</div>
```

## Update Checklist:

- [x] Dashboard - Professional & minimal
- [ ] Karyawan - Update styling
- [ ] Absensi - Update styling
- [ ] Gaji - Update styling
- [ ] Slip Gaji - Update styling
- [ ] Treatment - Done
- [ ] Security - Update styling
- [ ] Help - Update styling
- [ ] Profile Settings - Done

## Catatan Penting:
1. Hapus semua gradient yang berwarna (hanya gunakan putih/abu-abu)
2. Gunakan icon SVG standard Material Design
3. Konsisten dengan border gray-200 untuk semua card
4. Font weight minimal 600 untuk text yang prominent
5. Gunakan opacity 0.5-0.7 untuk text secondary
