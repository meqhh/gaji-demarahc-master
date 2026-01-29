# Technical Documentation - Implementation Details

## Overview
Implementasi fitur delete pada menu Slip Gaji dan sinkronisasi data karyawan ke menu lainnya menggunakan React Context API dan localStorage.

---

## Architecture

### State Management dengan AppContext
```
AppContextProvider (src/context/AppContext.js)
├── Provider wraps entire application
├── Manages global state:
│   ├── karyawanData
│   ├── absensiData
│   ├── gajiData
│   ├── cutiData
│   ├── slipGajiData
│   └── treatmentData
└── Auto-sync ke localStorage via useEffect
```

### Component Structure
```
Admin Panel
├── Karyawan (source of employee data)
│   ├── addKaryawan() → AppContext.addKaryawan()
│   ├── updateKaryawan() → AppContext.updateKaryawan()
│   └── deleteKaryawan() → AppContext.deleteKaryawan()
├── Absensi (consumer of karyawanData)
│   ├── Reads: karyawanData, absensiData
│   └── Updates uniqueKaryawanNames from karyawanData
├── Gaji (consumer of karyawanData)
│   ├── Reads: karyawanData, gajiData
│   └── Updates uniqueKaryawanNames from karyawanData
├── SlipGaji (consumer of slipGajiData)
│   ├── Reads: slipGajiData
│   ├── Delete: deleteSlipGaji() → AppContext.deleteSlipGaji()
│   └── Updates dataGaji from slipGajiData
├── CutiKaryawan (consumer of karyawanData)
│   ├── Reads: karyawanData, cutiData
│   └── Updates uniqueKaryawanNames from karyawanData
├── Dashboard (independent)
└── Treatment (independent)
```

---

## Implementation Details

### 1. Delete Function in SlipGaji

**File:** `src/Admin/SlipGaji.js`

#### Imports
```javascript
import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
```

#### Context Integration
```javascript
function SlipGaji() {
  const { slipGajiData = [], deleteSlipGaji } = useContext(AppContext);
  
  // ... component code ...
}
```

#### Delete Logic
```javascript
const handleDelete = (item) => {
  setDeleteData(item);
  setShowDelete(true);
};

const confirmDelete = () => {
  if (deleteData) {
    if (typeof deleteSlipGaji === 'function') {
      deleteSlipGaji(deleteData.id);
    }
    setShowDelete(false);
    setDeleteData(null);
  }
};
```

#### AppContext Implementation
```javascript
// In AppContext.js
deleteSlipGaji: (id) => setSlipGajiData(prev => 
  Array.isArray(prev) ? prev.filter(s => s.id !== id) : []
)
```

#### Data Persistence
```javascript
// useEffect di AppContext auto-saves to localStorage
useEffect(() => {
  localStorage.setItem('slipGajiData', JSON.stringify(slipGajiData));
}, [slipGajiData]);
```

---

### 2. Karyawan Data Synchronization

**Files:** 
- `src/Admin/Absensi.js`
- `src/Admin/Gaji.js`
- `src/Admin/CutiKaryawan.js`

#### Pattern: Get Karyawan Names
```javascript
const uniqueKaryawanNames = useMemo(() => {
  // Priority 1: Get from karyawanData
  const karyawanNames = Array.isArray(karyawanData) && karyawanData.length > 0
    ? karyawanData
        .map((k) => k?.nama)
        .filter((name) => name && name.trim() !== "")
    : [];
  
  // Priority 2: Get from existing data (absensi, gaji, cuti)
  const existingNames = Array.isArray(existingData) 
    ? existingData
        .map((item) => item?.nama)
        .filter((name) => name && name.trim() !== "")
    : [];
  
  // Combine and deduplicate
  const allNames = [...karyawanNames, ...existingNames];
  return allNames
    .filter((name, index, self) => self.indexOf(name) === index)
    .sort();
}, [absensiData/gajiData/cutiData, karyawanData]);
```

#### Priority Order
1. Data dari `karyawanData` (master list)
2. Data dari absensi/gaji/cuti (existing records)
3. Combine dan sort alphabetically

---

## Data Flow Diagrams

### Add Karyawan Flow
```
User Input (Karyawan Form)
    ↓
handleTambah() in Karyawan.js
    ↓
addKaryawan(newKaryawan)
    ↓
AppContext.addKaryawan()
    ↓
setKaryawanData([...prev, newKaryawan])
    ↓
useEffect updates localStorage
    ↓
Absensi/Gaji/CutiKaryawan components
    ↓
useMemo recalculates uniqueKaryawanNames (includes new karyawan)
    ↓
Components re-render with updated list
```

### Delete Slip Gaji Flow
```
User clicks Delete button
    ↓
handleDelete(item)
    ↓
Modal konfirmasi ditampilkan
    ↓
User clicks Confirm
    ↓
confirmDelete()
    ↓
deleteSlipGaji(deleteData.id)
    ↓
AppContext.deleteSlipGaji(id)
    ↓
setSlipGajiData(prev => prev.filter(s => s.id !== id))
    ↓
useEffect updates localStorage
    ↓
SlipGaji component
    ↓
dataGaji state updates (from slipGajiData)
    ↓
Component re-renders without deleted item
```

---

## Code Snippets

### Adding Karyawan to Absensi
```javascript
// In Absensi.js
const uniqueKaryawanNames = useMemo(() => {
  const karyawanNames = Array.isArray(karyawanData) && karyawanData.length > 0
    ? karyawanData
        .map((k) => k?.nama)
        .filter((name) => name && name.trim() !== "")
    : [];
  
  const absensiNames = absensi
    .map((a) => a?.nama)
    .filter((name) => name && name.trim() !== "");
  
  const allNames = [...karyawanNames, ...absensiNames];
  const uniqueNames = allNames
    .filter((name, index, self) => self.indexOf(name) === index)
    .sort();
  
  return uniqueNames;
}, [absensi, karyawanData]);
```

### Deleting from Slip Gaji
```javascript
// In AppContext.js
deleteSlipGaji: (id) => setSlipGajiData(prev => 
  Array.isArray(prev) ? prev.filter(s => s.id !== id) : []
),

// In SlipGaji.js
const confirmDelete = () => {
  if (deleteData) {
    if (typeof deleteSlipGaji === 'function') {
      deleteSlipGaji(deleteData.id);
    }
    setShowDelete(false);
    setDeleteData(null);
  }
};
```

---

## Dependency Management

### useMemo Dependencies
```javascript
// Absensi.js
useMemo(..., [absensi, karyawanData])

// Gaji.js
useMemo(..., [absensiData, karyawanData])

// CutiKaryawan.js
useMemo(..., [absensiData, karyawanData])
```

**Why these dependencies?**
- `absensi/absensiData`: Existing records from absensi data
- `karyawanData`: Master list of employees
- When either changes, recalculate the unique names list

### useEffect Dependencies
```javascript
// SlipGaji.js
useEffect(..., [slipGajiData]) // Watch context data changes

// CutiKaryawan.js
useEffect(..., [absensiData, cutiData, setCutiData, karyawanData])
```

---

## localStorage Structure

### Keys
```javascript
{
  "karyawanData": "[...]",
  "absensiData": "[...]",
  "gajiData": "[...]",
  "cutiData": "[...]",
  "slipGajiData": "[...]",
  "userProfile": "{...}"
}
```

### Data Format
```javascript
// karyawanData
[
  {
    id: "001",
    nama: "Ahmad Fikri",
    posisi: "Bidan",
    nohp: "08123456789",
    email: "ahmad@example.com",
    ...
  },
  ...
]

// slipGajiData
[
  {
    id: 1,
    nama: "Syardatul Maula",
    posisi: "Bidan",
    total: 5970000,
    status: "Dikirim",
    ...
  },
  ...
]
```

---

## Error Handling

### Type Checking
```javascript
// Check if function exists before calling
if (typeof deleteSlipGaji === 'function') {
  deleteSlipGaji(deleteData.id);
}

// Check if array
const karyawanNames = Array.isArray(karyawanData) && karyawanData.length > 0
  ? karyawanData.map(...)
  : [];
```

### Null/Undefined Safety
```javascript
// Safe property access
const karyawanNames = Array.isArray(karyawanData)
  ? karyawanData
      .map((k) => k?.nama) // Optional chaining
      .filter((name) => name && name.trim() !== "")
  : [];
```

---

## Performance Optimization

### useMemo Usage
```javascript
// Prevent unnecessary recalculations
const uniqueKaryawanNames = useMemo(() => {
  // Heavy computation here
  return [...];
}, [absensi, karyawanData]); // Only recalc when dependencies change
```

### localStorage Updates
```javascript
// useEffect handles auto-save
useEffect(() => {
  localStorage.setItem('karyawanData', JSON.stringify(karyawanData));
}, [karyawanData]); // Only save when karyawanData changes
```

---

## Testing Checklist

- [ ] Add karyawan appears in Absensi list
- [ ] Add karyawan appears in Gaji list
- [ ] Add karyawan appears in Cuti list
- [ ] Delete slip gaji removes item from UI
- [ ] Delete slip gaji persists after refresh
- [ ] Dashboard unaffected by changes
- [ ] Treatment unaffected by changes
- [ ] No console errors
- [ ] Data persists in localStorage

---

## Future Improvements

1. Add loading states during API calls
2. Add error toast notifications
3. Add undo functionality for delete
4. Implement server-side persistence
5. Add role-based access control
6. Add audit logging for deletions
7. Add batch operations support

---

**Document Version:** 1.0.0
**Last Updated:** 2025-01-24
**Maintainer:** Development Team
