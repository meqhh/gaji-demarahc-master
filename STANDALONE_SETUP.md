# 🎯 Standalone Setup Guide (No Laragon)

## What You Need

1. **Node.js 16+** - Download from https://nodejs.org/
   - Windows: Download `.msi` installer and install
   - Mac: `brew install node`
   - Linux: `sudo apt install nodejs npm`

2. **Code Editor (Optional)**
   - VS Code: https://code.visualstudio.com/
   - Or any text editor you prefer

3. **Terminal/Command Prompt**
   - Windows: PowerShell or Command Prompt
   - Mac/Linux: Terminal

## Installation Steps

### Step 1: Navigate to Project Folder

**Windows:**
```bash
cd D:\laragon\www\gaji-demarahc-master
```

**Mac/Linux:**
```bash
cd /path/to/gaji-demarahc-master
```

### Step 2: Install All Dependencies

```bash
npm install
cd server
npm install
cd ..
```

This installs:
- Frontend: React, Router, Tailwind CSS, etc.
- Backend: Express, bcryptjs, JWT, etc.

### Step 3: Run Backend Server

**Open Terminal 1:**

```bash
cd server
npm run dev
```

**Expected Output:**
```
✓ File-based database initialized
Server running on http://localhost:5000
```

**Backend is now ready!** ✅

### Step 4: Run Frontend (New Terminal)

**Open Terminal 2:**

```bash
npm start
```

**Expected Output:**
```
Compiled successfully!
Local: http://localhost:3000
```

### Step 5: Access Application

Open browser: **http://localhost:3000**

You should see login page!

---

## Quick Test

1. Click "Daftar" (Register)
2. Fill:
   - Nama: Test User
   - Email: test@example.com
   - Password: password123
3. Click Register
4. Should auto-login and show dashboard ✓

---

## File Structure

```
gaji-demarahc-master/
├── src/                      # React frontend
│   ├── App.js
│   ├── components/
│   ├── services/
│   └── .env                  # Frontend config
├── server/                   # Node.js backend
│   ├── controllers/
│   ├── routes/
│   ├── database/
│   ├── data/                 # Auto-created (JSON storage)
│   ├── server.js
│   └── .env                  # Backend config
├── public/                   # Static files
├── build/                    # Production build (created by `npm run build`)
├── package.json              # Frontend config
└── DEPLOYMENT_GUIDE.md       # Deployment instructions
```

---

## Common Commands

### Development

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm start
```

### Production Build

```bash
# Build frontend
npm run build

# Create optimized files in 'build/' folder
```

### Install New Dependencies

```bash
# Frontend
npm install package-name

# Backend
cd server
npm install package-name
```

---

## Environment Configuration

### Frontend: `src/.env`
```
REACT_APP_API_URL=http://localhost:5000/api
```

For production, change to:
```
REACT_APP_API_URL=https://your-domain.com/api
```

### Backend: `server/.env`
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

For production:
```
PORT=5000
NODE_ENV=production
JWT_SECRET=<strong-random-string>
```

---

## Data Storage

Your data is stored in JSON files:

```
server/data/
├── users.json        # User accounts
└── karyawan.json     # Employee data
```

**Backup your data:**
```bash
cp -r server/data server/data.backup
```

---

## Troubleshooting

### Node.js not found
```bash
# Check if installed
node --version
npm --version

# If not: Download from https://nodejs.org/
```

### Port 5000 already in use

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <number> /F
```

**Mac/Linux:**
```bash
lsof -i :5000
kill -9 <PID>
```

### Dependencies not installing
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -r node_modules package-lock.json

# Reinstall
npm install
```

### Frontend shows blank page
1. Check console (F12)
2. Verify backend is running
3. Check `src/.env` has correct API URL
4. Hard refresh (Ctrl+F5)

### Backend won't start
```bash
# Check logs for errors
cd server
npm run dev

# If module not found: npm install
```

---

## Production Deployment

See `DEPLOYMENT_GUIDE.md` for:
- Docker deployment
- Cloud hosting (Vercel, Heroku)
- Self-hosted VPS
- Nginx/Apache setup

---

## Features

✅ User authentication (register/login)
✅ Employee management
✅ Salary management
✅ Leave management
✅ Attendance tracking
✅ Professional UI with Tailwind CSS
✅ Responsive design
✅ Dark mode ready

---

## Technology Stack

**Frontend:**
- React 19
- React Router 7
- Tailwind CSS 3
- Chart.js
- React Icons

**Backend:**
- Node.js
- Express.js
- bcryptjs (password hashing)
- JWT (authentication)
- File-based JSON database

**Database:**
- JSON files (server/data/)
- No external database needed
- Auto-backup compatible

---

## Need Help?

**Check these files:**
- `DEPLOYMENT_GUIDE.md` - Full deployment guide
- `BACKEND_SETUP.md` - Backend details
- `QUICK_START.md` - Fast testing
- `MIGRATION_SUMMARY.md` - Database info

**Common issues:**
- Port in use: Kill process on port 5000/3000
- Module not found: Run `npm install`
- API not working: Verify backend is running
- Data not saving: Check `server/data/` permissions

---

## You're Ready! 🎉

```bash
# All-in-one setup:
npm install
cd server && npm install && cd ..
npm run server &    # Terminal 1
npm start          # Terminal 2 (in new window)
```

App running at: **http://localhost:3000** 🚀
