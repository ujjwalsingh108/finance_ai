# 🚀 TrueData WebSocket Integration Guide

## Overview

The breakout scanner is now configured to use **TrueData** real-time market data feed for tick-by-tick price updates.

---

## 📊 TrueData Advantages

- ✅ **Affordable**: Much cheaper than Zerodha Kite Connect
- ✅ **No broker account needed**: Direct data subscription
- ✅ **Tick-by-tick data**: Real-time price and volume updates
- ✅ **Simple WebSocket**: Easy to integrate
- ✅ **NSE equity coverage**: Full coverage of NSE stocks

---

## 🔧 Setup Steps

### 1. **Get TrueData Credentials**

1. Visit https://www.truedata.in
2. Sign up for an account
3. Subscribe to real-time data plan
4. Get your **username** and **password**

**Pricing** (approx):
- Basic plan: ₹500-1000/month for real-time data
- Professional: ₹2000-3000/month for advanced features

---

### 2. **Configure Environment Variables**

Update your `.env` file (or create from `.env.websocket`):

```env
# Supabase (existing)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# TrueData (new)
TRUEDATA_USER=your_truedata_username
TRUEDATA_PASSWORD=your_truedata_password
TRUEDATA_WS_PORT=8082
```

---

### 3. **WebSocket Connection Flow**

```
1. Scanner loads 250 symbols from Supabase
         ↓
2. Connect to TrueData WebSocket:
   wss://push.truedata.in:8082?user=xxx&password=xxx
         ↓
3. Send subscription message:
   {
     "method": "addsymbol",
     "symbols": ["RELIANCE", "TCS", "INFY", ...],
     "bars": "tick"
   }
         ↓
4. Receive tick data:
   {
     "symbol": "RELIANCE",
     "ltp": 2450.50,
     "volume": 1234567,
     "timestamp": "2025-11-10 10:15:30"
   }
         ↓
5. Aggregate ticks into 5-min candles
         ↓
6. Calculate EMA/RSI and generate signals
```

---

## 📡 TrueData Message Formats

### **Subscription Request** (sent by scanner):
```json
{
  "method": "addsymbol",
  "symbols": ["RELIANCE", "TCS", "INFY"],
  "bars": "tick"
}
```

**Options for `bars`:**
- `"tick"` - Tick-by-tick data (recommended for breakout detection)
- `"1min"` - 1-minute OHLC bars (less granular but lower data volume)
- `"5min"` - 5-minute bars (direct candles, no aggregation needed)

### **Tick Data** (received from TrueData):
```json
{
  "symbol": "RELIANCE",
  "ltp": 2450.50,
  "open": 2440.00,
  "high": 2455.00,
  "low": 2435.00,
  "volume": 1234567,
  "timestamp": "2025-11-10 10:15:30"
}
```

---

## 🚀 Deployment

### **1. Update Files on Server**

```powershell
# From your local machine
cd C:\Users\ujjwa\Desktop\Projects\Private\finance_ai

# Upload updated scanner
scp -i C:\Users\ujjwa\droplet_ssh_key breakout-scanner-websocket.js root@143.244.129.143:/root/

# Upload updated .env with TrueData credentials
# First, update .env locally with your TrueData username/password
scp -i C:\Users\ujjwa\droplet_ssh_key .env.websocket root@143.244.129.143:/root/.env
```

### **2. Install Dependencies**

```bash
ssh -i C:\Users\ujjwa\droplet_ssh_key root@143.244.129.143

# Install ws (WebSocket library)
npm install ws

# Verify dependencies
npm list ws @supabase/supabase-js dotenv
```

### **3. Test Connection**

```bash
# Test with a few stocks first
# Edit the file to set TOP_N_STOCKS to 10
nano breakout-scanner-websocket.js
# Change: TOP_N_STOCKS: 250 → TOP_N_STOCKS: 10

# Run manually first to test
node breakout-scanner-websocket.js

# Expected output:
# 🚀 Initializing Enhanced Breakout Scanner (WebSocket)...
# ✅ Loaded 10 NSE symbols
# 📥 Loading historical data for all symbols...
# ✅ Loaded historical data for 10 symbols
# 🔌 Connecting to TrueData WebSocket...
# Connecting to: wss://push.truedata.in:8082
# ✅ WebSocket connected to TrueData
# 📡 Subscribing to 10 symbols...
# Sending: {"method":"addsymbol","symbols":["RELIANCE","TCS",...],"bars":"tick"}
```

### **4. Run with PM2**

```bash
# Stop old scanner
pm2 stop breakout-scanner

# Start TrueData scanner
pm2 start breakout-scanner-websocket.js --name truedata-scanner

# Save PM2 config
pm2 save

# Monitor logs
pm2 logs truedata-scanner
```

**Expected logs during market hours:**
```
🕯️ New candle: RELIANCE @ 10:25
🎯 SIGNAL: RELIANCE - BULLISH_BREAKOUT (83% confidence) @ ₹2450.50
🕯️ New candle: TCS @ 10:25
```

---

## 🎯 Performance Optimization

### **For 250 Stocks:**

TrueData handles multiple symbol subscriptions efficiently, but optimize based on data volume:

**Option 1: Tick Data** (recommended for early detection)
```javascript
bars: "tick"
```
- ✅ Earliest breakout detection
- ✅ Most accurate real-time EMA/RSI
- ⚠️ Higher data volume (~10-50 ticks/second per stock during active trading)
- ⚠️ More CPU usage for tick aggregation

**Option 2: 1-Minute Bars** (balanced)
```javascript
bars: "1min"
```
- ✅ Lower data volume
- ✅ Still real-time (1-min granularity)
- ⚠️ Slightly delayed breakout detection (up to 1 min)

**Option 3: 5-Minute Bars** (direct candles)
```javascript
bars: "5min"
```
- ✅ No aggregation needed (TrueData sends ready candles)
- ✅ Lowest CPU/memory usage
- ⚠️ No early detection advantage over batch scanner

**Recommendation**: Start with `"tick"` for 100 stocks, monitor CPU/memory. Scale to 250 if server handles well.

---

## 📊 Expected Data Volume

For **250 stocks** during market hours (9:15 AM - 3:30 PM):

| Mode | Ticks/Sec | Data/Hour | Total/Day |
|------|-----------|-----------|-----------|
| Tick | 2000-5000 | ~50 MB | ~300 MB |
| 1min | 250-500 | ~5 MB | ~30 MB |
| 5min | 50-100 | ~1 MB | ~6 MB |

**Server Impact** ($12/month droplet - 2GB RAM):
- Tick mode: ~500-800 MB RAM, 20-40% CPU
- 1min mode: ~300-500 MB RAM, 10-20% CPU

---

## 🔍 Troubleshooting

### **WebSocket Connection Failed**
```bash
# Check credentials
echo $TRUEDATA_USER
echo $TRUEDATA_PASSWORD

# Test connection manually
node -e "const WebSocket = require('ws'); const ws = new WebSocket('wss://push.truedata.in:8082?user=YOUR_USER&password=YOUR_PASS'); ws.on('open', () => console.log('Connected!')); ws.on('error', (e) => console.error(e));"
```

### **No Tick Data Received**
- Verify TrueData subscription is active
- Check if market is open (Mon-Fri 9:15 AM - 3:30 PM IST)
- Ensure symbols exist in TrueData database (use correct symbol names)

### **High Memory Usage**
```bash
# Reduce number of stocks
# In breakout-scanner-websocket.js:
TOP_N_STOCKS: 100  # Instead of 250

# Or switch to 1min bars instead of ticks
bars: "1min"  # Instead of "tick"
```

---

## 🔄 Switch Between Tick and Bar Data

Edit `breakout-scanner-websocket.js`, line ~244:

```javascript
// For tick-by-tick (earliest detection):
bars: "tick"

// For 1-minute bars (balanced):
bars: "1min"

// For 5-minute bars (lowest overhead):
bars: "5min"
```

Then restart:
```bash
pm2 restart truedata-scanner
```

---

## 📈 Monitor Scanner Performance

```bash
# Live logs
pm2 logs truedata-scanner

# Performance stats
pm2 monit

# Check signals in database
# (from your local machine with Supabase Studio)
# Go to breakout_signals table and filter by:
# created_by = 'websocket_scanner'
# created_at > now() - interval '1 hour'
```

---

## 🎉 Next Steps

1. ✅ Get TrueData credentials
2. ✅ Update `.env` file with credentials
3. ✅ Test with 10 stocks locally
4. ✅ Deploy to server
5. ✅ Start with 100 stocks
6. ✅ Monitor for 1 trading day
7. ✅ Scale to 250 stocks if server handles well

**Your scanner is now ready to detect breakouts in real-time with TrueData! 🚀**
