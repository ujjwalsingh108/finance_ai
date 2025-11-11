# 🚀 WebSocket Enhanced Scanner - TrueData Integration

## Overview

The WebSocket-enhanced scanner uses TrueData for real-time tick-by-tick data combined with historical 5-min candles from Supabase for accurate breakout detection.

---

## 📊 How It Works

### Data Flow

```
Historical Data (Supabase)          Real-Time Ticks (TrueData WebSocket)
         |                                   |
         v                                   v
   [78 5-min candles]               [Tick aggregator]
   from yesterday                    builds current candle
         |                                   |
         +-------------------+---------------+
                             |
                             v
                   [Merged candle array]
                             |
                             v
                   [Calculate EMA/RSI]
                             |
                             v
                   [Check 6 criteria]
                             |
                             v
                   [Generate signal if met]
```

### Benefits Over Batch Scanning

| Feature | Batch Scanner (30s) | WebSocket Scanner |
|---------|---------------------|-------------------|
| Detection Speed | Every 30 seconds | Real-time (< 1s) |
| Data Freshness | 5-min delayed | Tick-by-tick |
| Breakout Accuracy | After candle close | During candle formation |
| Early Entry | ❌ No | ✅ Yes (2-4 min earlier) |
| False Signals | More (stale data) | Fewer (live confirmation) |

---

## 🔧 Setup Requirements

### Install Dependencies

```bash
npm install ws @supabase/supabase-js dotenv
```

### Environment Variables

Add to your `.env` file:

```env
# Existing Supabase config
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# TrueData WebSocket Config
TRUEDATA_USER=your_truedata_username
TRUEDATA_PASSWORD=your_truedata_password
TRUEDATA_WS_PORT=8082
```

---

## 🚀 Deployment

### 1. Update Package JSON

Add to `package.scanner.json`:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "dotenv": "^16.3.1",
    "ws": "^8.14.2"
  }
}
```

### 2. Upload to Server

```powershell
# Upload scanner
scp -i C:\Users\ujjwa\droplet_ssh_key breakout-scanner-websocket.js root@143.244.129.143:/root/

# Upload updated package.json
scp -i C:\Users\ujjwa\droplet_ssh_key package.scanner.json root@143.244.129.143:/root/package.json

# Upload .env with TrueData credentials
scp -i C:\Users\ujjwa\droplet_ssh_key .env.scanner root@143.244.129.143:/root/.env
```

### 3. Install & Run

```bash
ssh -i C:\Users\ujjwa\droplet_ssh_key root@143.244.129.143

# Install dependencies
npm install

# Stop old scanner
pm2 stop breakout-scanner

# Start TrueData WebSocket scanner
pm2 start breakout-scanner-websocket.js --name truedata-scanner

# Save PM2 config
pm2 save

# View logs
pm2 logs truedata-scanner
```

---

## 📊 Performance Optimization

### For 250 Stocks:

**TrueData Bar Options**:

1. **Tick Data** (recommended for earliest detection):
   ```javascript
   bars: "tick"
   ```
   - ✅ Earliest breakout detection
   - ✅ Most accurate real-time EMA/RSI
   - ⚠️ Higher data volume (~10-50 ticks/second per stock)
   - ⚠️ More CPU usage for tick aggregation

2. **1-Minute Bars** (balanced):
   ```javascript
   bars: "1min"
   ```
   - ✅ Lower data volume
   - ✅ Still real-time (1-min granularity)
   - ⚠️ Slightly delayed breakout detection (up to 1 min)

3. **5-Minute Bars** (lowest overhead):
   ```javascript
   bars: "5min"
   ```
   - ✅ No aggregation needed (direct candles)
   - ✅ Lowest CPU/memory usage
   - ⚠️ No early detection advantage

### Tick Aggregation Settings

Only recalculate if:
```javascript
// 1. Price changed > 0.1%
PRICE_CHANGE_THRESHOLD: 0.001

// 2. Every 100 ticks
TICK_AGGREGATION_THRESHOLD: 100
```

### Signal Deduplication

Prevent spam:
```javascript
// Don't send same signal within 5 minutes
if (!lastSignal || now - lastSignal > 5 * 60 * 1000) {
  saveSignal();
}
```

---

## 🧪 Testing

### Test with Few Stocks First:

```javascript
// In breakout-scanner-websocket.js
const CONFIG = {
  TOP_N_STOCKS: 10, // Start with 10 stocks
  // ... rest of config
};
```

### Monitor Logs:

```bash
pm2 logs truedata-scanner --lines 100
```

**Expected output**:
```
🔌 Connecting to TrueData WebSocket...
✅ WebSocket connected to TrueData
📡 Subscribed to 10 instruments
🕯️ New candle: RELIANCE @ 10:25
🎯 SIGNAL: RELIANCE - BULLISH_BREAKOUT (83% confidence) @ ₹2450.50
```

---

## 🔍 Troubleshooting

### WebSocket Not Connecting:
```bash
# Check credentials
cat .env | grep TRUEDATA

# Check network connectivity
curl -I https://push.truedata.in
```

### No Ticks Received:
- Verify TrueData subscription is active
- Check if market is open (Mon-Fri 9:15 AM - 3:30 PM IST)
- Ensure symbols exist in your Supabase `symbols` table

### High Memory Usage:
```bash
# Reduce stocks or switch to 1min bars
# In breakout-scanner-websocket.js:
TOP_N_STOCKS: 100,  # Instead of 250
bars: "1min"  # Instead of "tick"
```

---

## � Expected Performance

### Data Volume (250 stocks, market hours):

| Mode | Ticks/Sec | Data/Hour | Total/Day |
|------|-----------|-----------|-----------|
| Tick | 2000-5000 | ~50 MB | ~300 MB |
| 1min | 250-500 | ~5 MB | ~30 MB |
| 5min | 50-100 | ~1 MB | ~6 MB |

### Server Resource Usage ($12/month droplet - 2GB RAM):

| Mode | RAM Usage | CPU Usage |
|------|-----------|-----------|
| Tick (250 stocks) | 500-800 MB | 20-40% |
| 1min (250 stocks) | 300-500 MB | 10-20% |
| Tick (100 stocks) | 300-500 MB | 10-20% |

---

## � Best Practices

1. **Start small**: Test with 10-50 stocks first
2. **Monitor resources**: Use `pm2 monit` to watch CPU/RAM
3. **Choose appropriate bar type**: 
   - Use `"tick"` for early detection (if server can handle)
   - Use `"1min"` for balanced performance
   - Use `"5min"` if CPU/RAM is constrained
4. **Scale gradually**: 50 → 100 → 250 stocks
5. **Check signals**: Verify in Supabase `breakout_signals` table

---

## 📊 Useful Commands

```bash
# View logs
pm2 logs truedata-scanner

# Monitor CPU/Memory
pm2 monit

# Restart scanner
pm2 restart truedata-scanner

# Stop scanner
pm2 stop truedata-scanner

# Check status
pm2 status
```

---

**Your WebSocket scanner is ready to detect breakouts in real-time! 🎉**
