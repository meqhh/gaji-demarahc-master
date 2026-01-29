# 🚀 Deployment Guide - Standalone (No Laragon Required)

## Overview
Your Gaji Demara project is now a **standalone web application** that runs independently without Laragon. It includes:
- ✅ React frontend (frontend)
- ✅ Node.js backend (server)
- ✅ File-based JSON database
- ✅ Complete authentication system

## Option 1: Local Development (Windows/Mac/Linux)

### Requirements
- Node.js 16+ ([Download](https://nodejs.org/))
- Any code editor (VS Code, etc.)

### Setup

**1. Clone/Extract Project**
```bash
cd gaji-demarahc-master
```

**2. Install Dependencies**
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..
```

**3. Start Both Servers**

Open 2 terminals:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Output: Server running on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm start
# Output: Compiled successfully! http://localhost:3000
```

**4. Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## Option 2: Production Build (For Deployment)

### Build Frontend
```bash
npm run build
```
Creates: `build/` folder with static files (ready for web server)

### Run Backend in Production
```bash
cd server
NODE_ENV=production npm start
```

### Full Stack Deployment

**Option A: Docker (Recommended)**
```bash
docker-compose up -d
```
Requires `docker-compose.yml` (create below)

**Option B: Linux/Windows Server**
```bash
# Terminal 1 - Backend
cd server
npm install
NODE_ENV=production npm start

# Terminal 2 - Frontend (served by Node.js)
cd ..
npm install
npm run build
# Upload 'build/' folder to web server
```

**Option C: Separate Web Servers**
- Backend: Node.js server (port 5000)
- Frontend: Nginx/Apache serving `build/` folder
- Update frontend API URL in `build/index.html`

---

## Setup & Configuration

### Environment Variables

**Frontend:** `src/.env`
```
REACT_APP_API_URL=http://localhost:5000/api
```

**Backend:** `server/.env`
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

### For Production Deployment

Update `server/.env`:
```
PORT=5000
NODE_ENV=production
JWT_SECRET=<generate-strong-random-string>
```

Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update `src/.env` or `build/index.html`:
```
REACT_APP_API_URL=https://your-domain.com/api
```

---

## Deployment Options

### 1. Vercel (Recommended for Frontend)
Frontend only - fast & free

```bash
npm install -g vercel
vercel
```

Then update backend URL in deployed frontend.

### 2. Heroku (Backend + Frontend)
Full stack - paid but simple

```bash
heroku login
heroku create gaji-demara
git push heroku main
```

### 3. AWS/Google Cloud/DigitalOcean
Maximum flexibility - requires setup

```bash
# On your server
git clone <repo>
cd gaji-demarahc-master
npm install && cd server && npm install
cd ..
npm run build
npm start &  # Backend in background
```

### 4. Self-Hosted (VPS)
Most control - cheapest long-term

Setup steps in `SELF_HOSTED_GUIDE.md`

---

## Docker Deployment

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    image: node:18
    working_dir: /app/server
    volumes:
      - .:/app
    environment:
      - NODE_ENV=production
      - JWT_SECRET=your_secret_key
    ports:
      - "5000:5000"
    command: npm start

  frontend:
    image: node:18
    working_dir: /app
    volumes:
      - .:/app
    ports:
      - "3000:3000"
    command: npm start
    depends_on:
      - backend
```

Run:
```bash
docker-compose up -d
```

---

## Data Backup

Your data is stored in JSON files:
```
server/data/
├── users.json      # User accounts
└── karyawan.json   # Employee data
```

**Backup:**
```bash
cp -r server/data server/data.backup
```

**Restore:**
```bash
cp -r server/data.backup server/data
```

---

## Performance Tips

### Frontend
- Build is already optimized
- Use CDN for `build/` folder
- Enable gzip compression on web server

### Backend
- Use nginx/reverse proxy
- Enable caching headers
- Monitor `server/data/` file sizes
- Consider database migration if >100k records

### Database
- JSON files perfect for <10k records
- For production: migrate to SQLite or PostgreSQL
- Implement automated backups

---

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### CORS Errors
Check `server/server.js`:
```javascript
app.use(cors());
```

Backend CORS should allow frontend origin.

### Slow Performance
- Check Node.js memory: `node --max-old-space-size=4096 server.js`
- Monitor file I/O in `server/data/`
- Consider caching with Redis

### Frontend Not Connecting to Backend
- Check `REACT_APP_API_URL` in frontend `.env`
- Verify backend is running on correct port
- Check CORS headers

---

## Next Steps

1. **Test Locally First**
   ```bash
   npm install
   npm start  # Frontend
   cd server && npm run dev  # Backend (new terminal)
   ```

2. **Build for Production**
   ```bash
   npm run build
   cd server && npm install --production
   ```

3. **Deploy** (Choose option above)

4. **Monitor & Maintain**
   - Check `server/data/` backups
   - Monitor server logs
   - Update dependencies monthly

---

## Support Files

- `QUICK_START.md` - Fast local setup
- `BACKEND_SETUP.md` - Backend details
- `MIGRATION_SUMMARY.md` - Database info

## No More Laragon Required! 🎉

Your project is now a professional standalone web application ready for deployment anywhere.
