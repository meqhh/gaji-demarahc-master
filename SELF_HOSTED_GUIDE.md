# 🖥️ Self-Hosted VPS Deployment Guide

## Host Options

- **DigitalOcean** - $6/month (recommended)
- **Linode** - $5/month
- **AWS EC2** - Pay as you go
- **Vultr** - $3.50/month
- **Any Linux VPS** - Works with this guide

## Requirements

- Ubuntu 20.04+ or Debian 11+
- SSH access
- 1GB RAM minimum (2GB recommended)
- 10GB storage minimum

## Step-by-Step Setup

### 1. Create Droplet/Instance

**For DigitalOcean:**
1. Create new Droplet
2. Choose Ubuntu 22.04 LTS
3. Select $6/month plan (1GB RAM)
4. Choose data center nearest to you
5. Create SSH key (recommended) or use password
6. Create droplet

**For other providers:** Similar process, create Ubuntu 22.04 instance

### 2. Connect via SSH

**Windows (PowerShell):**
```powershell
ssh root@<your-ip-address>
# Enter password or use SSH key
```

**Mac/Linux:**
```bash
ssh root@<your-ip-address>
# Or with key file:
ssh -i /path/to/key root@<your-ip-address>
```

### 3. Update System

```bash
apt update
apt upgrade -y
```

### 4. Install Node.js

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
apt install -y nodejs npm

# Verify
node --version
npm --version
```

### 5. Install Git & Clone Project

```bash
apt install -y git

# Clone your project (or upload via SFTP)
git clone https://github.com/yourusername/gaji-demarahc.git
cd gaji-demarahc-master
```

Or **upload via SFTP:**
```bash
# On your computer
sftp root@<your-ip>
# cd /root/gaji-demarahc-master
# put -r * .
```

### 6. Install Dependencies

```bash
npm install
cd server
npm install
cd ..
```

### 7. Configure Environment

**Backend:** `server/.env`
```bash
nano server/.env
```

```
PORT=5000
NODE_ENV=production
JWT_SECRET=<generate-random-string>
```

Generate JWT_SECRET:
```bash
openssl rand -hex 32
```

**Frontend:** `src/.env`
```bash
nano src/.env
```

```
REACT_APP_API_URL=https://your-domain.com/api
```

### 8. Build Frontend

```bash
npm run build
# Creates optimized 'build/' folder
```

### 9. Install & Setup Nginx

Nginx will serve frontend + reverse proxy backend:

```bash
apt install -y nginx

# Create Nginx config
nano /etc/nginx/sites-available/default
```

Replace with:
```nginx
upstream backend {
  server localhost:5000;
}

server {
  listen 80;
  server_name your-domain.com www.your-domain.com;

  # Serve static frontend
  location / {
    root /root/gaji-demarahc-master/build;
    try_files $uri /index.html;
  }

  # Proxy API to backend
  location /api {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Enable Nginx:
```bash
nginx -t  # Test config
systemctl start nginx
systemctl enable nginx
```

### 10. Install & Setup PM2 (Process Manager)

PM2 keeps your backend running:

```bash
npm install -g pm2

# Start backend with PM2
cd /root/gaji-demarahc-master/server
pm2 start server.js --name "gaji-backend"

# Make it start on reboot
pm2 startup
pm2 save
```

Verify:
```bash
pm2 list
pm2 logs gaji-backend
```

### 11. Setup SSL (Free HTTPS)

```bash
apt install -y certbot python3-certbot-nginx

certbot --nginx -d your-domain.com -d www.your-domain.com
# Follow prompts to setup HTTPS
```

Verify in browser: https://your-domain.com ✅

### 12. Configure Firewall

```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
ufw status
```

---

## Daily Operations

### Monitor Backend

```bash
pm2 logs gaji-backend
pm2 status
pm2 restart gaji-backend
pm2 stop gaji-backend
```

### Update Project

```bash
cd /root/gaji-demarahc-master
git pull
npm install
cd server && npm install && cd ..
npm run build
pm2 restart gaji-backend
```

### Backup Data

```bash
# Backup user data
tar czf backup-$(date +%Y%m%d).tar.gz server/data/

# Save to safe location
scp backup-*.tar.gz your-computer:/backups/
```

### Check Disk Space

```bash
df -h
du -sh server/data/
```

### View Nginx Logs

```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## Security Setup

### Create Non-Root User

```bash
useradd -m -s /bin/bash appuser
usermod -aG sudo appuser
su appuser
cd ~
```

Then re-run installation as appuser.

### Setup SSH Key

```bash
# On your computer
ssh-keygen -t rsa -b 4096 -f ~/.ssh/gaji-demara

# Copy key to server
cat ~/.ssh/gaji-demara.pub | ssh root@<ip> 'cat >> ~/.ssh/authorized_keys'

# Disable password auth
ssh root@<ip>
nano /etc/ssh/sshd_config
# Change: PasswordAuthentication no
systemctl restart ssh
```

### Fail2Ban (Brute Force Protection)

```bash
apt install -y fail2ban
systemctl enable fail2ban
systemctl start fail2ban
```

---

## Monitoring & Maintenance

### Install Monitoring Tools

```bash
# CPU/Memory monitoring
apt install -y htop
htop

# Disk usage
ncdu /root/gaji-demarahc-master

# Network
nethogs
```

### Auto-Backup Script

Create `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR
tar czf $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz /root/gaji-demarahc-master/server/data/
# Keep last 7 days only
find $BACKUP_DIR -name "backup-*.tar.gz" -mtime +7 -delete
```

Make executable:
```bash
chmod +x backup.sh

# Add to crontab (runs daily at 2 AM)
crontab -e
# Add: 0 2 * * * /root/backup.sh
```

### Automatic Updates

```bash
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

---

## Troubleshooting

### Backend not running
```bash
pm2 logs gaji-backend
pm2 restart gaji-backend
```

### Port 5000 in use
```bash
lsof -i :5000
kill -9 <PID>
```

### Nginx not working
```bash
nginx -t
systemctl restart nginx
systemctl status nginx
```

### SSL certificate expired
```bash
certbot renew
```

### Database files too large
```bash
du -sh server/data/
# If >1GB, consider migrating to PostgreSQL
```

### Out of memory
```bash
free -h
# If <200MB free, migrate to larger instance or optimize
```

---

## Performance Optimization

### Enable Gzip Compression

Edit `/etc/nginx/nginx.conf`:
```nginx
gzip on;
gzip_types text/html text/plain text/css application/json;
gzip_min_length 1000;
```

### Cache Static Files

Add to nginx config:
```nginx
location ~* \.(js|css|png|jpg|gif|woff)$ {
  expires 365d;
  add_header Cache-Control "public, immutable";
}
```

### Increase File Limits

```bash
nano /etc/security/limits.conf
# Add:
# * soft nofile 65535
# * hard nofile 65535
```

---

## Cost Breakdown (Monthly)

- **DigitalOcean 1GB Droplet:** $6
- **Domain name:** $12/year (~$1/month)
- **SSL Certificate:** Free (Let's Encrypt)
- **Bandwidth:** 1TB included
- **Total:** ~$7/month

---

## Advanced: Custom Domain

1. Buy domain (GoDaddy, Namecheap, etc.)
2. Point nameservers to:
   - ns1.digitalocean.com
   - ns2.digitalocean.com
   - ns3.digitalocean.com
3. Create DNS records in DigitalOcean:
   - A record: @ → your-ip
   - A record: www → your-ip
4. Wait 24-48 hours for DNS propagation
5. Setup SSL with certbot

---

## Scaling Up

When you need more power:

1. **Upgrade Droplet** - Add more RAM/CPU
2. **Migrate to Database** - If data >100k records, use PostgreSQL
3. **Add Caching** - Implement Redis
4. **Load Balancing** - Multiple servers with load balancer

---

## Next Steps

1. ✅ Deploy project
2. ✅ Setup SSL
3. ✅ Configure backups
4. ✅ Monitor performance
5. 🔜 Optimize & scale as needed

Your application is now live! 🎉

**Visit:** https://your-domain.com
