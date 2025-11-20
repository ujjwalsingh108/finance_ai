# Intraday Bearish Strategy

## Overview
This strategy identifies bearish intraday trading opportunities in NIFTY 250 stocks using 6 technical criteria.

## Strategy Criteria

### 1. NIFTY 250 Universe
- Only scans stocks that are part of the NIFTY 250 index
- Ensures liquidity and reduces low-volume risks

### 2. Below Daily 20 EMA
- Stock must be trading below the 20-period Exponential Moving Average on the daily timeframe
- Indicates medium-term bearish trend

### 3. Below 5-Minute 20 EMA
- Stock must be trading below the 20-period EMA on the 5-minute timeframe
- Confirms short-term bearish momentum

### 4. Volume Surge
- Average volume of last 3 days must be greater than previous day's volume
- Indicates increasing selling pressure

### 5. Gap Down / Opening Weakness
- Opening price must be higher than current market price
- Shows selling from the open, bearish sentiment

### 6. RSI Range (20-50)
- RSI must be between 20 and 50
- Avoids oversold bounces (RSI < 20)
- Confirms bearish momentum (RSI < 50)

## Scoring System
- **6/6 criteria**: Highest probability bearish setup
- **5/6 criteria**: Strong bearish setup
- **4/6 criteria**: Moderate bearish setup
- **< 4/6 criteria**: Not displayed (filtered out)

## Risk Management

### Target Price
- Set at 1.5x ATR (Average True Range) below current price
- Conservative downside target

### Stop Loss
- Set at 0.75x ATR above current price
- Protects against false signals and reversals

### Recommended Position Size
- Risk 1-2% of capital per trade
- Use stop loss to calculate position size

## Database Schema

### Table: `intraday_bearish_signals`

```sql
- id: Primary key
- symbol: Stock symbol (TEXT)
- signal_type: 'BEARISH_INTRADAY'
- probability: Decimal (0.00 to 1.00)
- criteria_met: Integer (0 to 6)
- current_price: Current market price
- opening_price: Opening price of the day
- daily_ema20: 20 EMA on daily chart
- fivemin_ema20: 20 EMA on 5-min chart
- rsi_value: RSI(14) value
- avg_volume_3days: Average volume of last 3 days
- previous_day_volume: Previous day's volume
- volume_ratio: avg_volume_3days / previous_day_volume
- is_nifty250: Boolean flag
- target_price: Calculated target
- stop_loss: Calculated stop loss
- confidence: Confidence score (0.00 to 1.00)
- created_at: Timestamp
```

## Usage

### Running the Scanner

```bash
# Install dependencies (if not already installed)
npm install @supabase/supabase-js

# Run the scanner
node scripts/intraday-bearish-scanner.js
```

### Accessing via UI

1. Navigate to `/screener`
2. Click on "Intraday Equity Bearish" card
3. View all active bearish signals
4. Auto-refreshes every 15 seconds

### API Access

```javascript
// Fetch latest bearish signals
const { data, error } = await supabase
  .from('intraday_bearish_signals')
  .select('*')
  .gte('created_at', new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString())
  .gte('probability', 0.6)
  .eq('is_nifty250', true)
  .order('probability', { ascending: false });
```

## Migration

To create the database table, run the migration:

```bash
# Apply migration to Supabase
supabase db push
```

Or manually execute:
```bash
psql -h <your-supabase-host> -d postgres -f supabase/migrations/create_intraday_bearish_signals.sql
```

## Automation

### Recommended Schedule
- Run scanner every 5 minutes during market hours (9:15 AM - 3:30 PM IST)
- Clear old signals (> 4 hours) before each scan

### Cron Job Example (Linux)
```bash
# Edit crontab
crontab -e

# Add entry (runs every 5 minutes during market hours, Mon-Fri)
*/5 9-15 * * 1-5 cd /path/to/finance_ai && node scripts/intraday-bearish-scanner.js >> logs/bearish-scanner.log 2>&1
```

### PM2 Example
```bash
pm2 start scripts/intraday-bearish-scanner.js --name "bearish-scanner" --cron "*/5 9-15 * * 1-5"
```

## Trading Guidelines

### When to Enter
- Signal appears with 5-6 criteria met
- Confirm entry on 5-minute chart break below support
- Enter near current price or on pullback to 5-min EMA20

### When to Exit
1. **Target Hit**: Exit at target price (1.5x ATR down)
2. **Stop Loss Hit**: Exit at stop loss (0.75x ATR up)
3. **Time Stop**: Exit 15 minutes before market close if no movement
4. **Reversal**: Exit if price breaks above 5-min EMA20 with strong volume

### Avoid Trading When
- Low volume periods (11:30 AM - 1:00 PM)
- Major news events or earnings announcements
- Market-wide strong uptrends
- Signal has < 4 criteria met

## Performance Monitoring

Track these metrics:
- Win rate (% of profitable trades)
- Average reward:risk ratio
- Maximum drawdown
- Best performing criteria combinations

## Future Enhancements

1. **Machine Learning**: Train model on historical signals
2. **News Sentiment**: Integrate negative news detection
3. **Sector Analysis**: Filter by sector weakness
4. **Options Strategy**: Suggest bear put spreads
5. **Real-time Alerts**: Push notifications for new signals

## Support

For issues or questions:
- Check logs: `logs/bearish-scanner.log`
- Database issues: Verify Supabase connection
- Missing data: Ensure historical data tables are populated

---

**Disclaimer**: This strategy is for educational purposes. Always use proper risk management and consult with a financial advisor before trading.
