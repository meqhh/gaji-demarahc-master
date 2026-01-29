# Backend Setup Guide - File-Based Database

## Overview
This backend uses **Node.js + Express** with **JSON file-based storage** instead of MongoDB. Data is persisted in `server/data/` directory as JSON files.

## Why File-Based Storage?
✅ No MongoDB installation required  
✅ Zero external dependencies  
✅ Perfect for development & small deployments  
✅ Easy backup (just copy JSON files)  
✅ Human-readable data format  

## Step 1: Install Dependencies

```bash
cd server
npm install
```

## Step 2: Configure Environment

File: `server/.env`
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

⚠️ **Important:** Change `JWT_SECRET` before production deployment!

## Step 3: Start Backend Server

```bash
cd server
npm run dev
```

Expected output:
```
✓ File-based database initialized
Server running on http://localhost:5000
🚀 Server berjalan di http://localhost:5000
📚 API Documentation tersedia di http://localhost:5000/api
🏥 Health check di http://localhost:5000/api/health
```

## Step 4: Test Server (di terminal baru)

```bash
# Test health check
curl http://localhost:5000/api/health

# Response:
# {"success":true,"message":"Server is running","timestamp":"..."}
```

## Step 5: Create Admin User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Admin Demara",
    "email": "admin@demara.com",
    "password": "admin123",
    "role": "admin"
  }'
```

## Step 6: Login & Get Token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demara.com",
    "password": "admin123"
  }'
```

Response akan berisi `token`. Copy token ini untuk request berikutnya.

## Step 7: Test API Endpoints

```bash
# Get all karyawan (ganti TOKEN_ANDA)
curl http://localhost:5000/api/karyawan \
  -H "Authorization: Bearer TOKEN_ANDA"
```

## Sekarang Frontend sudah bisa connect ke Backend!

Update frontend API URL untuk production:

### React Frontend Integration

Di file environment atau config:

```javascript
// src/api/config.js
export const API_BASE_URL = 'http://localhost:5000/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  return response.json();
};
```

Gunakan:
```javascript
import { apiCall } from './api/config';

// Login
const data = await apiCall('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// Get karyawan
const karyawan = await apiCall('/karyawan');
```

## Troubleshooting

### MongoDB Connection Error
```
✗ MongoDB connection failed: ...
```
**Solution:**
- Pastikan MongoDB sudah running: `mongod` atau service sudah start
- Cek `.env` MONGODB_URI benar
- Untuk Atlas, whitelist IP Anda

### Port 5000 sudah digunakan
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Token Invalid
Pastikan:
- Token ada d    i header: `Authorization: Bearer <token>`
- Token belum expired (7 hari)
- `JWT_SECRET` di `.env` sama

## Files Structure

```
server/
├── .env                    # Environment variables ⚙️
├── server.js              # Main server ✨
├── package.json           # Dependencies
├── README.md              # Full documentation
├── API_DOCUMENTATION.md   # API reference
├── models/                # Database schemas
├── controllers/           # Business logic
├── routes/                # API endpoints
└── middleware/            # JWT auth
```

## Next Steps

1. ✅ Backend berjalan
2. ✅ Database connected
3. ✅ Admin user dibuat
4. 🔜 Connect frontend ke backend API
5. 🔜 Test semua endpoints
6. 🔜 Deploy ke production

## Support & Help

- Dokumentasi API: `server/API_DOCUMENTATION.md`
- Setup Panduan: `server/README.md`
- Issues? Check MongoDB & JWT_SECRET

Happy coding! 🚀
