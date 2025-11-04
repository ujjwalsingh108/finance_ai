# 🚀 DEPLOYMENT GUIDE - Breakout Scanner on DigitalOcean

Complete step-by-step guide to deploy your breakout prediction scanner on DigitalOcean.

---

## 📋 Prerequisites

- DigitalOcean account
- Supabase project with the required tables
- SSH access to server
- Your Supabase credentials

---

## 🖥️ Step 1: Create DigitalOcean Droplet

### Option A: Via DigitalOcean Dashboard

1. Go to [DigitalOcean](https://www.digitalocean.com/)
2. Click **Create** → **Droplets**
3. Choose configuration:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($12/month - 2GB RAM, 1 CPU)
   - **Region**: Bangalore/Mumbai (closest to Indian market)
   - **Authentication**: SSH Key (recommended) or Password
4. Click **Create Droplet**

### Option B: Via CLI (doctl)

```bash
# Install doctl and authenticate
# https://docs.digitalocean.com/reference/doctl/how-to/install/

doctl compute droplet create breakout-scanner \
  --image ubuntu-22-04-x64 \
  --size s-1vcpu-2gb \
  --region blr1 \
  --ssh-keys YOUR_SSH_KEY_ID
```

---

## 🔧 Step 2: Server Setup

### Connect to your droplet

```bash
ssh root@YOUR_DROPLET_IP
```

### Update system and install Node.js

```bash
# Update system packages
apt update && apt upgrade -y

# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x

# Install PM2 for process management
npm install -g pm2

# Install Git (if needed)
apt install -y git
```

---

## 📁 Step 3: Deploy Scanner Code

### Option A: Upload files directly

```bash
# On your local machine (PowerShell)
scp breakout-scanner.js root@YOUR_DROPLET_IP:/root/
scp .env.scanner root@YOUR_DROPLET_IP:/root/.env
scp package.json root@YOUR_DROPLET_IP:/root/
```

### Option B: Clone from Git repository

```bash
# On the server
cd /root
git clone YOUR_REPO_URL
cd YOUR_REPO_NAME
```

### Create package.json

```bash
# Create package.json if not exists
cat > package.json << 'EOF'
{
  "name": "breakout-scanner",
  "version": "1.0.0",
  "description": "Real-time breakout prediction scanner for NIFTY stocks",
  "main": "breakout-scanner.js",
  "scripts": {
    "start": "node breakout-scanner.js",
    "dev": "node breakout-scanner.js",
    "pm2": "pm2 start breakout-scanner.js --name breakout-scanner"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.38.4",
    "dotenv": "^16.3.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF
```

---

## 🔑 Step 4: Configure Environment Variables

```bash
# Edit .env file
nano .env

# Add your Supabase credentials (paste from Supabase dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Save: Ctrl+O, Enter, Ctrl+X
```

### Get Supabase credentials:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

---

## 📦 Step 5: Install Dependencies

```bash
# Install required npm packages
npm install

# Verify installation
npm list
```

---

## 🧪 Step 6: Test Scanner

```bash
# Test run (will stop after one scan if market is closed)
node breakout-scanner.js

# You should see:
# ✅ Loaded X NSE symbols from database
# ✅ Scanner initialized with X symbols
# 🔍 Starting Scan #1...
```

### If you get errors:

**Error: No symbols loaded**
```bash
# Check your symbols table in Supabase
# Make sure you have NSE symbols with exchange='NSE'
```

**Error: Missing environment variables**
```bash
# Verify .env file exists and has correct values
cat .env
```

**Error: Connection refused**
```bash
# Check Supabase URL and ensure server can reach internet
ping supabase.com
```

---

## 🚀 Step 7: Start with PM2 (Production)

```bash
# Start scanner with PM2
pm2 start breakout-scanner.js --name "breakout-scanner"

# Configure PM2 to start on server reboot
pm2 startup
# Copy and run the command it shows

# Save current PM2 process list
pm2 save

# Verify it's running
pm2 status
```

### PM2 Commands

```bash
# View logs
pm2 logs breakout-scanner

# View live logs (tail -f style)
pm2 logs breakout-scanner --lines 100

# Monitor CPU/Memory
pm2 monit

# Restart scanner
pm2 restart breakout-scanner

# Stop scanner
pm2 stop breakout-scanner

# Delete from PM2
pm2 delete breakout-scanner
```

---

## 📊 Step 8: Verify It's Working

### Check Supabase Database

1. Go to Supabase Dashboard → **Table Editor**
2. Open **breakout_signals** table
3. You should see new signals appearing every 30 seconds (during market hours)

### Check Scanner Logs

```bash
# View last 50 lines of logs
pm2 logs breakout-scanner --lines 50

# You should see:
# ✅ Scan #X Complete
# - Signals Generated: Y
# - Duration: Z seconds
```

### Check Auto Fetch Logs

```sql
-- Run in Supabase SQL Editor
SELECT * FROM auto_fetch_logs 
ORDER BY executed_at DESC 
LIMIT 10;
```

---

## 📈 Step 9: Monitor Performance

### Server Resources

```bash
# Check CPU and memory usage
htop

# Check disk space
df -h

# Check network usage
iftop
```

### PM2 Dashboard (Optional)

```bash
# Install PM2 web dashboard
pm2 install pm2-server-monit

# Access at http://YOUR_DROPLET_IP:9615
```

### Set up monitoring alerts (Optional)

```bash
# Install PM2 keymetrics (free tier available)
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY
```

---

## 🔥 Troubleshooting

### Scanner not generating signals

```bash
# Check if market is open
date # Should show Mon-Fri, 9:15 AM - 3:30 PM IST

# Check logs for errors
pm2 logs breakout-scanner --err

# Restart scanner
pm2 restart breakout-scanner
```

### High CPU/Memory usage

```bash
# Check current usage
pm2 monit

# Reduce batch size in code:
# CONFIG.BATCH_SIZE = 5 (default is 10)

# Increase scan interval:
# CONFIG.SCAN_INTERVAL_MS = 60000 (60 seconds instead of 30)
```

### Database connection issues

```bash
# Test Supabase connection
curl -I https://your-project.supabase.co

# Check if service role key is correct
cat .env | grep SUPABASE_SERVICE_ROLE_KEY
```

---

## 🔄 Updating Scanner Code

```bash
# Stop scanner
pm2 stop breakout-scanner

# Update code (via Git or SCP)
git pull origin main
# OR
# Upload new breakout-scanner.js via SCP

# Restart scanner
pm2 restart breakout-scanner

# Verify new version is running
pm2 logs breakout-scanner --lines 20
```

---

## 🔐 Security Best Practices

1. **Firewall Setup**
```bash
# Install UFW firewall
apt install ufw

# Allow SSH
ufw allow 22/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

2. **Update .env permissions**
```bash
chmod 600 .env
```

3. **Regular updates**
```bash
# Set up automatic security updates
apt install unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

4. **Backup important data**
```bash
# Backup .env file
cp .env .env.backup
```

---

## 📊 Expected Performance

| Metric | Value |
|--------|-------|
| Scan Interval | 30 seconds |
| Stocks per Scan | 250 |
| Signals per Scan | 5-15 (varies) |
| CPU Usage | 10-30% |
| Memory Usage | 300-500 MB |
| Network | ~10-50 MB/hour |

---

## ✅ Success Checklist

- [ ] DigitalOcean droplet created and accessible
- [ ] Node.js 18+ installed
- [ ] PM2 installed and configured
- [ ] Scanner code uploaded
- [ ] .env file configured with Supabase credentials
- [ ] npm dependencies installed
- [ ] Test run successful
- [ ] PM2 process running
- [ ] PM2 startup configured (auto-restart on reboot)
- [ ] Signals appearing in breakout_signals table
- [ ] Logs appearing in auto_fetch_logs table
- [ ] Frontend receiving real-time updates

---

## 🎯 Next Steps

1. Monitor scanner for 1-2 days to ensure stability
2. Adjust `MIN_CONFIDENCE_TO_SAVE` based on signal quality
3. Fine-tune `BATCH_SIZE` for optimal performance
4. Set up alerts for scanner failures
5. Create daily reports of signals generated
6. Implement email/SMS notifications for high-confidence signals

---

## 📞 Support

If you encounter issues:

1. Check PM2 logs: `pm2 logs breakout-scanner`
2. Check Supabase logs in dashboard
3. Verify database schema matches expected structure
4. Test database queries manually in Supabase SQL Editor

---

## 🎉 You're Live!

Your breakout scanner is now running 24/7 on DigitalOcean, analyzing 250 NIFTY stocks every 30 seconds during market hours and sending real-time signals to your Next.js dashboard!

Monitor performance for a few days and adjust parameters as needed.
