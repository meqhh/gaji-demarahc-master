# 🐳 Docker Deployment Guide

## What is Docker?

Docker packages your entire application (backend + frontend + dependencies) into containers that run identically on any machine.

## Benefits

✅ Works on Windows, Mac, Linux  
✅ No need to install Node.js locally  
✅ Easy scaling  
✅ Perfect for cloud deployment  
✅ Consistent development/production  

## Prerequisites

1. **Docker Desktop** - https://www.docker.com/products/docker-desktop
   - Windows: Download `.exe` installer
   - Mac: Download `.dmg` installer
   - Linux: `apt install docker.io`

2. **Docker Compose** (usually included with Docker Desktop)
   - Check: `docker-compose --version`

## Quick Start with Docker Compose

### 1. Prepare Environment File

Create `.env.docker` in project root:
```
JWT_SECRET=your_super_secret_key_here
NODE_ENV=production
REACT_APP_API_URL=http://localhost:5000/api
```

### 2. Build Images

```bash
# From project root
docker-compose build
```

This creates Docker images for:
- Backend (Node.js server)
- Frontend (React app)
- Nginx (reverse proxy)

### 3. Start Containers

```bash
docker-compose up -d
```

**Output:**
```
Creating gaji-backend ...  done
Creating gaji-frontend ... done
Creating gaji-nginx ...    done
```

### 4. Access Application

**Frontend:** http://localhost:3000  
**Backend API:** http://localhost:5000/api  

### 5. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 6. Stop Containers

```bash
docker-compose down
```

---

## File Structure

```
gaji-demarahc-master/
├── Dockerfile                # Frontend container config
├── server/
│   ├── Dockerfile           # Backend container config
│   └── server.js
├── docker-compose.yml       # Multi-container orchestration
├── src/                     # React code
└── .env.docker              # Docker environment
```

---

## Docker Compose Explained

**docker-compose.yml:**
```yaml
services:
  backend:
    build: ./server           # Build from server/Dockerfile
    ports:
      - "5000:5000"          # Port mapping
    volumes:
      - ./server/data:...    # Persistent data
    environment:
      - JWT_SECRET=...       # Config variables
    restart: unless-stopped   # Auto-restart

  frontend:
    build: .                  # Build from root Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - backend              # Start backend first
```

---

## Common Commands

### View Running Containers
```bash
docker-compose ps
```

### Restart a Service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Rebuild After Code Changes
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

### Clean Everything
```bash
docker-compose down -v
# -v removes volumes (data)
```

### Execute Command in Container
```bash
# Access backend shell
docker exec -it gaji-backend sh

# View backend logs
docker exec gaji-backend cat server.log

# Access frontend
docker exec -it gaji-frontend sh
```

---

## Development Workflow

### Option 1: Docker Compose (Recommended)

**Pros:**
- Easy setup
- Matches production
- Everything in containers

**Steps:**
```bash
docker-compose up -d
# Code changes are reflected with hot reload
docker-compose logs -f
```

### Option 2: Local Development

**Pros:**
- Faster development
- Direct debugging

**Steps:**
```bash
# Run backend in Docker, frontend locally
docker-compose up -d backend

# Then run frontend normally
npm start
```

---

## Production Deployment

### Option A: Docker Hub Registry

Push to Docker Hub for cloud deployment:

```bash
# Login to Docker Hub
docker login

# Tag images
docker tag gaji-backend myusername/gaji-backend:latest
docker tag gaji-frontend myusername/gaji-frontend:latest

# Push to registry
docker push myusername/gaji-backend:latest
docker push myusername/gaji-frontend:latest

# Pull and run on server
docker pull myusername/gaji-backend:latest
docker pull myusername/gaji-frontend:latest
docker-compose -f docker-compose.prod.yml up -d
```

### Option B: Deploy to AWS/Google Cloud

Use managed container services:
- **AWS ECS** - Elastic Container Service
- **Google Cloud Run**
- **Azure Container Instances**

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

### Option C: DigitalOcean App Platform

1. Push to GitHub
2. Connect to DigitalOcean
3. Configure docker-compose.yml
4. Deploy one-click

---

## Data Persistence

Your data is stored in volumes:

```yaml
volumes:
  - ./server/data:/app/data
```

This means:
- Data survives `docker-compose down`
- Backup with: `cp -r server/data backup/`
- Restore with: `cp -r backup/data server/`

---

## Monitoring & Maintenance

### Check Container Health
```bash
docker-compose ps
docker stats

# Shows CPU/Memory usage
```

### View Resource Usage
```bash
docker system df
docker system prune  # Clean up unused images
```

### Backup Data
```bash
# While running
docker-compose exec backend tar czf /app/data-backup.tar.gz /app/data

# Copy from container
docker cp gaji-backend:/app/data-backup.tar.gz ./

# Or simple file copy
cp -r server/data server/data.backup
```

---

## Troubleshooting

### Container won't start
```bash
docker-compose logs backend
# Check error messages
```

### Port already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <number> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Memory issues
```bash
# Increase Docker memory in Docker Desktop
# Settings → Resources → Memory: 4GB+
```

### Changes not reflecting
```bash
# Rebuild images
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Clean slate
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d
```

---

## Security Best Practices

### 1. Use Secrets for Sensitive Data

Create `.env` file (not committed to git):
```
JWT_SECRET=<very-long-random-string>
DB_PASSWORD=<secure-password>
```

Reference in `docker-compose.yml`:
```yaml
environment:
  - JWT_SECRET=${JWT_SECRET}
```

### 2. Don't Run as Root

Dockerfile should specify:
```dockerfile
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs
```

### 3. Use Minimal Base Images

Use `alpine` for smaller, secure images:
```dockerfile
FROM node:18-alpine  # 150MB vs 900MB
```

### 4. Regular Updates

```bash
docker pull node:18-alpine
docker-compose build
```

---

## Performance Optimization

### Multi-Stage Build

Reduces image size:
```dockerfile
# Build stage
FROM node:18 AS builder
RUN npm run build

# Runtime stage
FROM node:18-alpine
COPY --from=builder /app/build .
```

### Caching Layers

Order from least to most changed:
```dockerfile
COPY package*.json ./
RUN npm ci
COPY . .  # Application code (changes frequently)
```

### Production Compose File

Create `docker-compose.prod.yml`:
```yaml
services:
  backend:
    restart: always
    resources:
      limits:
        cpus: '1'
        memory: 512M
```

---

## Docker vs Traditional VPS

| Feature | Docker | VPS |
|---------|--------|-----|
| Setup | 5 minutes | 30 minutes |
| Updates | Easy | Manual |
| Scaling | Simple | Complex |
| Performance | Minimal overhead | Native |
| Learning Curve | Moderate | Steep |
| Cost | Same | Same |

---

## Next Steps

1. ✅ Install Docker Desktop
2. ✅ Run `docker-compose up`
3. ✅ Test at localhost:3000
4. ✅ Read `DEPLOYMENT_GUIDE.md` for cloud deployment
5. 🔜 Deploy to production

---

## Useful Resources

- Docker Docs: https://docs.docker.com/
- Docker Hub: https://hub.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Official Node.js images: https://hub.docker.com/_/node

---

**You're ready to containerize!** 🐳
