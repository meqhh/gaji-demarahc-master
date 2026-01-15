# Gaji Demara - Backend API Documentation

Backend server untuk Sistem Manajemen Gaji Demara yang dibangun dengan Node.js, Express, dan MongoDB.

## Installation & Setup

### Prerequisites
- Node.js v16 atau lebih tinggi
- MongoDB (local atau cloud)

### Installation

```bash
cd server
npm install
```

### Konfigurasi Environment

Buat file `.env` di folder `server/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gaji-demara
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

### Menjalankan Server

**Development (dengan auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server akan berjalan di `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)

#### Register User
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "nama": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "karyawan"
}
```

#### Login
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "...",
      "nama": "John Doe",
      "email": "john@example.com",
      "role": "karyawan"
    }
  }
}
```

#### Get Current User
- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`

#### Get All Users (Admin Only)
- **GET** `/api/auth/users`
- **Headers:** `Authorization: Bearer <token>`

#### Update Profile
- **PUT** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "nama": "New Name",
  "email": "newemail@example.com"
}
```

### Karyawan (`/api/karyawan`)

#### Get All Karyawan
- **GET** `/api/karyawan`
- **Headers:** `Authorization: Bearer <token>`

#### Get Karyawan by ID
- **GET** `/api/karyawan/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Create Karyawan (Admin Only)
- **POST** `/api/karyawan`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "nama": "Ahmad Hidayat",
  "email": "ahmad@demara.com",
  "nip": "2024001",
  "posisi": "Software Engineer",
  "departemen": "IT",
  "tanggalMasuk": "2024-01-15",
  "gajiPokok": 5000000,
  "tunjangan": 500000,
  "noTelepon": "082134567890",
  "alamat": "Jl. Merdeka No. 123"
}
```

#### Update Karyawan (Admin Only)
- **PUT** `/api/karyawan/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Delete Karyawan (Admin Only)
- **DELETE** `/api/karyawan/:id`
- **Headers:** `Authorization: Bearer <token>`

### Cuti (`/api/cuti`)

#### Get All Cuti
- **GET** `/api/cuti`
- **Headers:** `Authorization: Bearer <token>`

#### Get Cuti by Karyawan
- **GET** `/api/cuti/karyawan/:karyawanId`
- **Headers:** `Authorization: Bearer <token>`

#### Create Cuti
- **POST** `/api/cuti`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "karyawanId": "ObjectId",
  "nama": "Ahmad Hidayat",
  "tanggal": "2024-02-15",
  "lama": 3,
  "alasan": "Liburan keluarga"
}
```

#### Update Cuti Status (Admin Only)
- **PUT** `/api/cuti/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "status": "Disetujui",
  "updatedBy": "Admin"
}
```
Atau untuk penolakan:
```json
{
  "status": "Ditolak",
  "rejectionReason": "Alasan penolakan...",
  "updatedBy": "Admin"
}
```

#### Delete Cuti (Admin Only)
- **DELETE** `/api/cuti/:id`
- **Headers:** `Authorization: Bearer <token>`

### Absensi (`/api/absensi`)

#### Get All Absensi
- **GET** `/api/absensi`
- **Headers:** `Authorization: Bearer <token>`

#### Get Absensi by Karyawan
- **GET** `/api/absensi/karyawan/:karyawanId`
- **Headers:** `Authorization: Bearer <token>`

#### Create Absensi (Admin Only)
- **POST** `/api/absensi`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "karyawanId": "ObjectId",
  "nama": "Ahmad Hidayat",
  "tanggal": "2024-02-15",
  "jamMasuk": "08:00",
  "jamKeluar": "17:00",
  "status": "Hadir",
  "keterangan": "Normal"
}
```

#### Update Absensi (Admin Only)
- **PUT** `/api/absensi/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Delete Absensi (Admin Only)
- **DELETE** `/api/absensi/:id`
- **Headers:** `Authorization: Bearer <token>`

### Gaji (`/api/gaji`)

#### Get All Gaji
- **GET** `/api/gaji`
- **Headers:** `Authorization: Bearer <token>`

#### Get Gaji by Karyawan
- **GET** `/api/gaji/karyawan/:karyawanId`
- **Headers:** `Authorization: Bearer <token>`

#### Create Gaji (Admin Only)
- **POST** `/api/gaji`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "karyawanId": "ObjectId",
  "nama": "Ahmad Hidayat",
  "periode": "2024-02",
  "gajiPokok": 5000000,
  "tunjangan": 500000,
  "bonus": 200000,
  "potonganAsuransi": 200000,
  "potonganTax": 300000,
  "gajiKotor": 5700000,
  "gajiNetto": 5200000
}
```

#### Update Gaji (Admin Only)
- **PUT** `/api/gaji/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Delete Gaji (Admin Only)
- **DELETE** `/api/gaji/:id`
- **Headers:** `Authorization: Bearer <token>`

### Treatment (`/api/treatment`)

#### Get All Treatment
- **GET** `/api/treatment`
- **Headers:** `Authorization: Bearer <token>`

#### Get Treatment by Karyawan
- **GET** `/api/treatment/karyawan/:karyawanId`
- **Headers:** `Authorization: Bearer <token>`

#### Create Treatment (Admin Only)
- **POST** `/api/treatment`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "karyawanId": "ObjectId",
  "nama": "Ahmad Hidayat",
  "tipeLayanan": "Pemeriksaan Rutin",
  "tanggal": "2024-02-15",
  "rumahSakit": "RS Sentosa",
  "dokter": "Dr. Budi",
  "diagnosis": "Sehat",
  "treatment": "Vaksinasi",
  "biaya": 500000
}
```

#### Update Treatment (Admin Only)
- **PUT** `/api/treatment/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Delete Treatment (Admin Only)
- **DELETE** `/api/treatment/:id`
- **Headers:** `Authorization: Bearer <token>`

### Slip Gaji (`/api/slip-gaji`)

#### Get All Slip Gaji
- **GET** `/api/slip-gaji`
- **Headers:** `Authorization: Bearer <token>`

#### Get Slip Gaji by Karyawan
- **GET** `/api/slip-gaji/karyawan/:karyawanId`
- **Headers:** `Authorization: Bearer <token>`

#### Create Slip Gaji (Admin Only)
- **POST** `/api/slip-gaji`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
```json
{
  "gajiId": "ObjectId",
  "karyawanId": "ObjectId",
  "nama": "Ahmad Hidayat",
  "periode": "2024-02",
  "nip": "2024001",
  "posisi": "Software Engineer",
  "departemen": "IT"
}
```

#### Update Slip Gaji (Admin Only)
- **PUT** `/api/slip-gaji/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Delete Slip Gaji (Admin Only)
- **DELETE** `/api/slip-gaji/:id`
- **Headers:** `Authorization: Bearer <token>`

## Features

✅ Authentication dengan JWT
✅ Role-based access control (Admin & Karyawan)
✅ CRUD operations untuk semua entity
✅ MongoDB integration
✅ Password hashing dengan bcryptjs
✅ Error handling & validation
✅ CORS support
✅ Environment configuration

## Security

- Passwords di-hash menggunakan bcryptjs
- JWT untuk authentication
- Role-based authorization
- CORS untuk cross-origin requests
- Input validation

## Database Schema

### User
- nama
- email (unique)
- password (hashed)
- role (admin/karyawan)
- isActive
- lastLogin
- timestamps

### Karyawan
- nama
- email (unique)
- nip (unique)
- posisi
- departemen
- tanggalMasuk
- statusKepegawaian
- gajiPokok
- tunjangan
- timestamps

### Cuti
- karyawanId (reference)
- nama
- tanggal
- lama
- alasan
- status (Pending/Disetujui/Ditolak)
- rejectionReason
- updatedBy
- timestamps

### Absensi
- karyawanId (reference)
- nama
- tanggal
- jamMasuk/jamKeluar
- status
- keterangan
- timestamps

### Gaji
- karyawanId (reference)
- nama
- periode
- components (gajiPokok, tunjangan, bonus, etc)
- status (Draft/Proses/Selesai)
- timestamps

### Treatment
- karyawanId (reference)
- nama
- tipeLayanan
- tanggal
- details
- status
- timestamps

### SlipGaji
- karyawanId (reference)
- gajiId (reference)
- details lengkap slip
- timestamps

## Error Responses

```json
{
  "success": false,
  "message": "Error description"
}
```

## Support

Untuk bantuan, hubungi: admin@demara.com
