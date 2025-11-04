# 🚀 QUICK START - Deploy in 10 Minutes

Follow these exact steps to deploy your breakout scanner to DigitalOcean.

---

## ⚡ Step 1: Create DigitalOcean Droplet (3 minutes)

1. Go to https://www.digitalocean.com/
2. Click **Create** → **Droplets**
3. Choose:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic - $12/month (2GB RAM, 1 CPU)
   - **Region**: Bangalore (blr1) or Mumbai
4. Click **Create Droplet**
5. Wait for IP address (example: `143.198.123.45`)

---

## 💻 Step 2: Upload Files to Server (2 minutes)

Open PowerShell on your computer and run:

```powershell
# Replace YOUR_SERVER_IP with actual IP from Step 1
$SERVER_IP = "143.198.123.45"

# Upload scanner files
scp breakout-scanner.js root@${SERVER_IP}:/root/
scp .env.scanner root@${SERVER_IP}:/root/.env
scp package.scanner.json root@${SERVER_IP}:/root/package.json
scp deploy.sh root@${SERVER_IP}:/root/

# If prompted for password, enter the one from DigitalOcean email
```

---

## 🔑 Step 3: Get Supabase Credentials (1 minute)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (example: `https://abc123.supabase.co`)
   - **service_role secret** (long key starting with `eyJhbGc...`)

---

## 🖥️ Step 4: Deploy on Server (3 minutes)

```bash
# Connect to server (use password from DigitalOcean email)
ssh root@YOUR_SERVER_IP

# Make deploy script executable
chmod +x deploy.sh

# Run automated deployment
./deploy.sh

# When prompted, edit .env file:
nano .env

# Replace these lines with YOUR values from Step 3:
SUPABASE_URL=https://abc123.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Save: Ctrl+O, Enter, Ctrl+X
```

Press Enter to continue the deployment.

---

## ✅ Step 5: Verify It's Working (1 minute)

```bash
# Check scanner status
pm2 status

# Should show:
# ┌────┬────────────────────┬──────┬──────┬────────┐
# │ id │ name               │ mode │ ↺    │ status │
# ├────┼────────────────────┼──────┼──────┼────────┤
# │ 0  │ breakout-scanner   │ fork │ 0    │ online │
# └────┴────────────────────┴──────┴──────┴────────┘

# View live logs
pm2 logs breakout-scanner

# You should see:
# ✅ Loaded X NSE symbols from database
# ✅ Scanner initialized with X symbols
# 🔍 Starting Scan #1...
```

---

## 🎯 Step 6: Check Database (1 minute)

1. Go to Supabase Dashboard → **Table Editor**
2. Open **breakout_signals** table
3. You should see new signals appearing (during market hours)
4. Open **auto_fetch_logs** table
5. You should see scan logs with `success: true`

---

## 🎉 Done! Your Scanner is Live

### What's Happening Now:

- ✅ Scanner runs every 30 seconds during market hours (9:15 AM - 3:30 PM IST)
- ✅ Analyzes 250 NIFTY stocks using 6-criteria technical analysis
- ✅ Saves high-confidence signals to database
- ✅ Your Next.js frontend receives real-time updates
- ✅ Auto-restarts if server reboots

---

## 📊 Useful Commands

```bash
# View logs
pm2 logs breakout-scanner

# Monitor CPU/Memory
pm2 monit

# Restart scanner
pm2 restart breakout-scanner

# Stop scanner
pm2 stop breakout-scanner

# Check status
pm2 status
```

---

## 🔧 Troubleshooting

### Scanner shows "offline"
```bash
pm2 logs breakout-scanner --err
# Check error logs and verify .env credentials
```

### No signals appearing
```bash
# Check if market is open (Mon-Fri, 9:15 AM - 3:30 PM IST)
date

# Manually test database connection
node -e "require('dotenv').config(); console.log(process.env.SUPABASE_URL)"
```

### Frontend not updating
```sql
-- Run in Supabase SQL Editor (apply RLS policies)
\i simple-working-rls.sql
```

---

## 🎯 Expected Performance

During market hours, every 30 seconds you should see:
- **5-20 signals generated** (depends on market conditions)
- **2-5 high confidence signals** (80%+ probability)
- **8-15 seconds execution time** per scan
- **<30% CPU usage**
- **~300-500 MB RAM usage**

---

## 📱 Next Steps

1. **Monitor for 1-2 days** to ensure stability
2. **Fine-tune parameters** in .env if needed
3. **Set up alerts** for high-confidence signals
4. **Add more stocks** by updating TOP_N_STOCKS in .env

---

## 🆘 Need Help?

Check the detailed guides:
- **DEPLOYMENT-GUIDE.md** - Full deployment instructions
- **SCANNER-READY.md** - Technical overview
- **simple-working-rls.sql** - Database security policies

---

**That's it! Your breakout scanner is now live on DigitalOcean! 🎉**
