# 🎯 COMPLETE GUIDE: Automated Historical Data Fetching

You're absolutely right - PostgreSQL's HTTP extension is causing too many issues. Here are **3 better alternatives**:

---

## ✅ **Option 1: GitHub Actions (Recommended - FREE)**

### Setup:
1. Copy `.github/workflows/auto-fetch-historical.yml` to your repository
2. Add GitHub Secret:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvd3hwYXpza2tpZ3p3ZHd6d3lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkwNjA2OSwiZXhwIjoyMDcwNDgyMDY5fQ.K6Z9uMXOmAGNKPUN4tKdjFLtqUIJa-KSCe3H1ustti4`

3. Commit and push the workflow file
4. The workflow will run automatically every 5 minutes during trading hours

### Test manually:
- Go to Actions tab in GitHub
- Select "Auto-Fetch Historical Data"
- Click "Run workflow"

---

## ✅ **Option 2: Node.js Script with System Cron**

### Setup:
1. Install Node.js on your server
2. Set environment variable:
   ```bash
   export SUPABASE_SERVICE_ROLE_KEY="your_key_here"
   ```

3. Run manually to test:
   ```bash
   node scripts/trigger-edge-function.js
   ```

4. Add to crontab (Linux/Mac):
   ```bash
   crontab -e
   ```
   
   Add this line:
   ```
   */5 * * * * cd /path/to/finance_ai && node scripts/trigger-edge-function.js >> /var/log/auto-fetch.log 2>&1
   ```

5. For Windows Task Scheduler:
   - Open Task Scheduler
   - Create Basic Task
   - Trigger: Daily, repeat every 5 minutes
   - Action: Start program `node.exe`
   - Arguments: `C:\path\to\finance_ai\scripts\trigger-edge-function.js`

---

## ✅ **Option 3: Cloudflare Workers (Alternative)**

Create a Cloudflare Worker to call your Edge Function:

```javascript
export default {
  async scheduled(event, env, ctx) {
    const response = await fetch('https://kowxpazskkigzwdwzwyq.supabase.co/functions/v1/auto-fetch-historical', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        trigger: 'cloudflare_worker',
        timestamp: new Date().toISOString()
      })
    });
    
    console.log(await response.json());
  }
}
```

Set cron trigger: `*/5 * * * *`

---

## ✅ **Option 4: EasyCron.com (Simplest - FREE tier available)**

1. Go to https://www.easycron.com/
2. Create free account
3. Create new cron job:
   - URL: `https://kowxpazskkigzwdwzwyq.supabase.co/functions/v1/auto-fetch-historical`
   - Cron Expression: `*/5 * * * *`
   - HTTP Method: POST
   - HTTP Headers:
     ```
     Content-Type: application/json
     Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvd3hwYXpza2tpZ3p3ZHd6d3lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkwNjA2OSwiZXhwIjoyMDcwNDgyMDY5fQ.K6Z9uMXOmAGNKPUN4tKdjFLtqUIJa-KSCe3H1ustti4
     ```
   - Request Body:
     ```json
     {"trigger": "easycron", "timestamp": "{{now}}"}
     ```

---

## 📊 **Monitoring Your System**

After setup, monitor execution in Supabase:

```sql
-- Check recent executions
SELECT * FROM public.auto_fetch_logs ORDER BY executed_at DESC LIMIT 10;

-- Check success rate
SELECT 
  success,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM public.auto_fetch_logs
GROUP BY success;

-- Check total records fetched
SELECT COUNT(*) as total_records FROM public.historical_prices;

-- Check records per symbol
SELECT symbol, COUNT(*) as records 
FROM public.historical_prices 
GROUP BY symbol 
ORDER BY records DESC 
LIMIT 10;
```

---

## 🎯 **Recommended Approach**

**For your case, I recommend GitHub Actions because:**
1. ✅ **FREE** - No cost for public repos
2. ✅ **Reliable** - Runs on GitHub's infrastructure  
3. ✅ **Simple** - Just commit the workflow file
4. ✅ **Logs** - Built-in execution logs
5. ✅ **No server needed** - Runs in the cloud

---

## 🔧 **Fixing Your Current Edge Function Issue**

The error "Authentication failed: Bad Request" suggests TrueData credentials are missing. Make sure:

1. Go to Supabase Dashboard → Edge Functions → auto-fetch-historical
2. Check Environment Variables:
   - `TRUEDATA_USER` = Trial138
   - `TRUEDATA_PASSWORD` = ujjwal138
   - `SUPABASE_URL` = https://kowxpazskkigzwdwzwyq.supabase.co
   - `SUPABASE_SERVICE_ROLE_KEY` = your_key

3. Redeploy the Edge Function after adding variables

---

## 🚀 **Quick Start (GitHub Actions)**

1. Run this command:
   ```bash
   git add .github/workflows/auto-fetch-historical.yml
   git commit -m "Add auto-fetch workflow"
   git push
   ```

2. Add the secret in GitHub repo settings

3. Done! Your system will run automatically every 5 minutes during trading hours

No more PostgreSQL HTTP extension headaches! 🎉