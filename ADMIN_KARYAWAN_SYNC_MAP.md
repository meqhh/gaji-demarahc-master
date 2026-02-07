# 🔗 Admin ↔ Karyawan Menu Synchronization Map

**Purpose:** Show how Admin panel menus sync with Karyawan portal pages + data flow

---

## 📌 Synchronization Matrix

### 1. KARYAWAN (Employee Master Data)

| Admin Page | Karyawan Page | Data Shared | Sync Direction | Details |
|-----------|---------------|-------------|-----------------|---------|
| **Admin/Karyawan.js** | **Karyawan/DataDiri.js** | `karyawanData` | ↔ Bidirectional | Admin manages all; Karyawan edits own profile |
| | | via `updateKaryawan()` | | Changes propagate to both |

**Data Fields Synced:**
```
nama (name)
email
posisi (position)
departemen (department)
phone
address
joinDate
photo
emergencyContact
```

**Context Methods:**
- `updateKaryawan(id, updates)` - When Profile Settings saves
- `setKaryawanData(...)` - When Admin adds/deletes employee
- `getKaryawanById(id)` - Fetch for profile display

---

### 2. ABSENSI (Attendance)

| Admin Page | Karyawan Page | Data Shared | Sync Direction | Details |
|-----------|---------------|-------------|-----------------|---------|
| **Admin/Absensi.js** | **Karyawan/AbsensiKaryawan.js** | `absensiData` | → One-way (filtered) | Admin views all; Karyawan views own |
| | | | | Karyawan can add/edit own only |

**Data Fields Synced:**
```
id
nama (employee name)
posisi (position)
date
jamMasuk (check-in time)
jamKeluar (check-out time)
status (Hadir/Sakit/Izin/Libur/Menunggu)
```

**Context Methods:**
- `addAbsensi(record)` - Karyawan checks in
- `updateAbsensi(id, updates)` - Karyawan updates own record
- `getAbsensiByNama(nama)` - Filter for current employee

**Filtering Logic:**
```javascript
// Admin sees: ALL absensi records
const displayData = absensiData;

// Karyawan sees: Only their own records
const displayData = absensiData.filter(a => a.nama === userProfile.name);
```

---

### 3. GAJI (Salary)

| Admin Page | Karyawan Page | Data Shared | Sync Direction | Details |
|-----------|---------------|-------------|-----------------|---------|
| **Admin/Gaji.js** | **Karyawan/SlipgajiKaryawan.js** | `gajiData` | → One-way (read-only) | Admin manages; Karyawan views slips |

**Data Fields in Admin:**
```
id
karyawan (employee name)
pasien (patient/client name)
alamat (address)
treatment (service type)
harga (price)
fee (percentage or amount)
tanggal (date)
```

**Transformed for Karyawan:**
```
month (from tanggal)
amount (calculated from harga & fee)
employee info
transaction details
```

**Context Methods:**
- `addGaji(entry)` - Admin adds salary transaction
- `updateGaji(id, updates)` - Admin modifies entry
- `getGajiByKaryawan(nama)` - Fetch for karyawan slip

**Calculation:**
```javascript
const totalGaji = gajiData
  .filter(g => g.karyawan === currentKaryawan)
  .reduce((sum, g) => sum + g.harga, 0);
```

---

### 4. CUTI (Leave/Vacation)

| Admin Page | Karyawan Page | Data Shared | Sync Direction | Details |
|-----------|---------------|-------------|-----------------|---------|
| **Admin/CutiKaryawan.js** | **Karyawan/CutiKaryawan.js** | `cutiData` | ↔ Bidirectional | Admin approves; Karyawan requests |
| | | | | Both see status update in real-time |

**Data Fields:**
```
id
nama (employee name)
tanggal (leave date)
lama (duration in days)
alasan (reason)
status (Pending/Disetujui/Ditolak)
```

**Context Methods:**
- `addCuti(request)` - Karyawan submits leave request
- `updateCuti(id, updates)` - Admin approves/rejects (status change)
- `getCutiByKaryawan(nama)` - Filter for current employee

**Status Workflow:**
```
Karyawan.CutiKaryawan
  → Form: tanggal, lama, alasan
  → Submit: addCuti()
  → Status: "Pending"
    ↓
Admin.CutiKaryawan
  → Review request
  → Click "Setujui" or "Tolak"
  → Call: updateCuti(id, {status: "Disetujui"|"Ditolak"})
    ↓
Karyawan.CutiKaryawan (auto-refreshed)
  → Shows "Disetujui" ✓ or "Ditolak" ✗
```

---

### 5. SLIP GAJI (Salary Slips)

| Admin Page | Karyawan Page | Data Shared | Sync Direction | Details |
|-----------|---------------|-------------|-----------------|---------|
| **Admin/SlipGaji.js** | **Karyawan/SlipgajiKaryawan.js** | `slipGajiData` | → One-way (read-only) | Admin generates; Karyawan views |

**Data Fields:**
```
id
periode (month/year)
karyawan (employee name)
gajiPokok (base salary)
tunjangan (allowances)
bonus
feeTindakan (treatment fees)
feePaket (package fees)
potonganAsur ansi (insurance deduction)
potonganTax (tax deduction)
status (Draft/Proses/Selesai)
```

**Context Methods:**
- `addSlipGaji(slip)` - Admin generates new slip
- `updateSlipGaji(id, updates)` - Admin finalizes
- `getSlipGajiByKaryawan(nama)` - Fetch for current karyawan

**Admin → Karyawan Data Transformation:**
```javascript
// Admin data
{
  id: 1,
  karyawan: "Rina Bidan",
  periode: "Januari 2026",
  ...details
}

// Karyawan sees (converted format)
{
  employee: { name: "Rina Bidan", id: "...", position: "Bidan" }
  month: "Januari 2026"
  amount: "Rp 12.500.000" (formatted)
  ...
}
```

---

### 6. TREATMENT (Service Catalog)

| Admin Page | Karyawan Page | Data Shared | Sync Direction | Details |
|-----------|---------------|-------------|-----------------|---------|
| **Admin/Treatment.js** | **Karyawan/TreatmentKaryawan.js** | `treatmentData` | → One-way (read-only) | Admin maintains catalog; Karyawan views |
| | | | | Reference data only (not transactional) |

**Data Fields:**
```
id
nama (service name)
category (treatment type)
harga (price)
fee (commission percentage)
deskripsi (description - optional)
```

**Context Methods:**
- `addTreatment(treatment)` - Admin adds service
- `updateTreatment(id, updates)` - Admin updates pricing
- `deleteTreatment(id)` - Admin removes service
- `getTreatmentById(id)` - Reference lookup

**Use Cases:**
- Admin: Manage service menu, update prices, track offerings
- Karyawan: View available services, reference for documentation

---

### 7. DASHBOARD (Summary & Statistics)

| Admin Page | Karyawan Page | Data Shared | Sync Direction | Details |
|-----------|---------------|-------------|-----------------|---------|
| **Admin/Dashboard.js** | **Karyawan/DashboardKaryawan.js** | Multiple sources | → One-way (calculated) | Admin sees system-wide; Karyawan sees personal |

**Admin Dashboard Displays:**
```javascript
// From karyawanData
totalKaryawan = karyawanData.length

// From absensiData
totalKehadiran = absensiData.filter(a => a.status === "Hadir").length

// From gajiData
totalGaji = gajiData.reduce((sum, g) => sum + g.harga, 0)

// From cutiData
totalPending = cutiData.filter(c => c.status === "Pending").length

// Charts: Monthly salary distribution from gajiData
```

**Karyawan Dashboard Displays (In Progress):**
```
- My attendance this month
- My salary pending
- My approved leave
- Upcoming shifts
- Personal quick stats
```

---

## 🔄 Real-Time Sync Flow

### Example: Admin adds salary transaction

```
┌─────────────────────────────────────────────────────────┐
│  Admin.Gaji.js                                          │
│  User clicks "Tambah Gaji"                              │
│  Form submitted with:                                   │
│  {                                                      │
│    karyawan: "Rina Bidan",                              │
│    harga: 1500000,                                      │
│    tanggal: "2026-02-07"                                │
│  }                                                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ↓ addGaji(data)
┌──────────────────────────────────────────────────────────┐
│  AppContext.js                                           │
│  addGaji: (gaji) =>                                      │
│    setGajiData(prev => [...prev, { ...gaji, id: ... }]) │
│                                                          │
│  TRIGGERS:                                               │
│  • gajiData state updates → all subscribers notified     │
│  • useEffect -> localStorage.setItem('gajiData', ...)    │
└──────────────────┬───────────────────────────────────────┘
                   │
         ┌─────────┴──────────┬─────────────┐
         │                    │             │
         ↓                    ↓             ↓
    ┌─────────┐          ┌─────────┐   ┌─────────┐
    │ Admin   │          │localStorage │ Karyawan│
    │ Page    │          │  (backup)   │ Portal  │
    │Updates  │          │ gajiData    │ Reflects│
    │Chart    │          │ saved ✓     │Changes  │
    └─────────┘          └─────────┘   └─────────┘
                             (next mount)
```

**Timeline:**
1. **T+0ms**: Admin clicks "Tambah"
2. **T+10ms**: `addGaji()` called
3. **T+15ms**: `setGajiData()` updates context
4. **T+20ms**: Auto-save to localStorage
5. **T+25ms**: Karyawan pages re-render with new data
6. **T+30ms**: Dashboard recalculates totals
7. **T+50ms**: UI fully updated (no page refresh needed!)

---

## 🎯 Data Isolation & Access Control

### Admin Can See / Edit
```javascript
// ✅ All employees (karyawanData)
// ✅ All attendance (absensiData)
// ✅ All salary (gajiData)
// ✅ All leave requests (cutiData)
// ✅ All slips (slipGajiData)
// ✅ Service catalog (treatmentData)
// ✅ System statistics (Dashboard)
```

### Karyawan Can See / Edit
```javascript
// ✅ Own profile (DataDiri) - can edit
// ✅ Own attendance (AbsensiKaryawan) - can add/edit own
// ✅ Own leave requests (CutiKaryawan) - can submit
// ✅ Own salary (SlipgajiKaryawan) - view-only
// ✅ Service catalog (TreatmentKaryawan) - view-only
// ❌ Other employees' data (not visible)
// ❌ System-wide statistics (Dashboard limited)
```

---

## 🔐 Access Control Implementation

```javascript
// In Karyawan pages:

const { userProfile, karyawanData, absensiData, ... } = useContext(AppContext);

// Filter view to current user only
const myAbsensi = absensiData.filter(a => a.nama === userProfile.name);
const myLeave = cutiData.filter(c => c.nama === userProfile.name);
const mySlips = slipGajiData.filter(s => s.nama === userProfile.name);

// Only allow editing own data
const canEdit = (recordNama) => recordNama === userProfile.name;
```

---

## 📝 Menu Structure Summary

```
┌─ ADMIN PANEL ──────────────────────────────────────┐
│  ├─ Dashboard          (System Overview)            │
│  ├─ Karyawan           (Employee Master)        ─┐ │
│  ├─ Absensi            (Attendance Tracking)     │ │
│  ├─ Gaji               (Salary Transactions)      │ │
│  ├─ Cuti Karyawan      (Leave Management)         │ │
│  ├─ Slip Gaji          (Salary Slip Generation)  │ │
│  └─ Treatment          (Service Catalog)         ─┘ │
└────────────────────────────────────────┬────────────┘
                                         │
             ┌───────────────────────────┴────────────────────────┐
             │ SHARED VIA APPCONTEXT (real-time sync)            │
             └────────────────────────┬────────────────────────┬──┘
                                      │                        │
        ┌─────────────────────────────┘                        │
        │                                                       │
┌─ KARYAWAN PORTAL ─────────────────────────────────┐          │
│  ├─ Dashboard (Personal)                          │          │
│  ├─ Data Diri          (Profile)          ◄──────┘          │
│  ├─ Absensi            (My Attendance)                       │
│  ├─ Cuti               (My Leave Requests)                   │
│  ├─ Slip Gaji          (My Salary Slips)  ◄──────────────────┘
│  └─ Treatment          (Service Catalog - Ref Only)
└─────────────────────────────────────────────────────┘
```

---

## ✅ Verification Checklist

- [ ] Open Admin/Karyawan.js → Add new employee
- [ ] Check AppContext → karyawanData updated
- [ ] Check localStorage → karyawanData saved
- [ ] Open Karyawan/DataDiri.js → New employee appears
- [ ] Edit Karyawan/DataDiri.js → Saves to context
- [ ] Check Admin/Karyawan.js → Updated employee visible
- [ ] Open Admin/Absensi.js → Add attendance
- [ ] Check Karyawan/AbsensiKaryawan.js → Own attendance visible
- [ ] Open Admin/CutiKaryawan.js → See pending requests
- [ ] Open Karyawan/CutiKaryawan.js → User can request leave
- [ ] Admin approves leave → Check Karyawan sees status update immediately
- [ ] Open Admin/Dashboard.js → Stats update with real data
- [ ] Refresh Karyawan portal → All data persists (from localStorage)

---

**Last Updated:** 2026-02-07  
**System:** GAJI-DEMARAHC v2.0 - Unified Zero-Dummy Data System
