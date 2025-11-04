/**
 * 🚀 PRODUCTION BREAKOUT SCANNER FOR DIGITAL OCEAN
 *
 * Scans top 250 NIFTY stocks using 6-criteria technical analysis
 * Integrates with your existing Supabase database schema
 *
 * REQUIREMENTS:
 * - Node.js 18+
 * - Supabase client (@supabase/supabase-js)
 * - Running on DigitalOcean server
 *
 * DEPLOYMENT:
 * 1. Upload to server: scp breakout-scanner.js user@server:/app/
 * 2. Install deps: npm install @supabase/supabase-js
 * 3. Set environment variables in .env file
 * 4. Start with PM2: pm2 start breakout-scanner.js
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// =================================================================
// 🔧 CONFIGURATION
// =================================================================

const CONFIG = {
  // Supabase connection
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY, // Use service role for full access

  // Scanner settings
  SCAN_INTERVAL_MS: 30000, // 30 seconds
  BATCH_SIZE: 10, // Process 10 stocks at a time
  TOP_N_STOCKS: 250, // Top 250 liquid NIFTY stocks

  // Trading hours (IST) - 9:15 AM to 3:30 PM
  MARKET_OPEN_HOUR: 9,
  MARKET_OPEN_MINUTE: 15,
  MARKET_CLOSE_HOUR: 15,
  MARKET_CLOSE_MINUTE: 30,

  // Signal thresholds
  MIN_CONFIDENCE_TO_SAVE: 0.6, // Save signals with 60%+ confidence
  MIN_CRITERIA_MET: 4, // Minimum 4 out of 6 criteria

  // Technical analysis periods
  EMA_PERIOD: 20,
  RSI_PERIOD: 14,
  VOLUME_LOOKBACK_DAYS: 3,
};

// =================================================================
// 📊 DATABASE CLIENT
// =================================================================

class DatabaseClient {
  constructor() {
    this.supabase = createClient(
      CONFIG.SUPABASE_URL,
      CONFIG.SUPABASE_SERVICE_KEY
    );
  }

  /**
   * Get top 250 liquid NIFTY stocks from symbols table
   */
  async getNifty250Symbols() {
    try {
      const { data, error } = await this.supabase
        .from("symbols")
        .select("symbol, name, sector")
        .eq("exchange", "NSE")
        .in("type", ["EQ", "EQUITY"]) // Only equity stocks
        .limit(CONFIG.TOP_N_STOCKS);

      if (error) throw error;

      console.log(`✅ Loaded ${data.length} NSE symbols from database`);
      return data;
    } catch (error) {
      console.error("❌ Error loading symbols:", error);
      throw error;
    }
  }

  /**
   * Get historical 5-min data for a symbol (last 3 days)
   */
  async getHistoricalData(symbol, days = 3) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await this.supabase
        .from("historical_prices")
        .select("*")
        .eq("symbol", symbol)
        .gte("date", cutoffDate.toISOString().split("T")[0])
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`❌ Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get daily candles for EMA calculation
   */
  async getDailyCandles(symbol, days = 30) {
    try {
      const { data, error } = await this.supabase
        .from("historical_prices")
        .select("date, open, high, low, close, volume")
        .eq("symbol", symbol)
        .eq("time", "15:30") // Use 3:30 PM closing prices for daily candles
        .order("date", { ascending: true })
        .limit(days);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`❌ Error fetching daily candles for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Save breakout signal to database
   */
  async saveBreakoutSignal(signal) {
    try {
      const { data, error } = await this.supabase
        .from("breakout_signals")
        .insert([
          {
            symbol: signal.symbol,
            signal_type: signal.signal_type,
            probability: signal.probability,
            criteria_met: signal.criteria_met,
            daily_ema20: signal.daily_ema20,
            fivemin_ema20: signal.fivemin_ema20,
            rsi_value: signal.rsi_value,
            volume_ratio: signal.volume_ratio,
            predicted_direction: signal.predicted_direction,
            target_price: signal.target_price,
            stop_loss: signal.stop_loss,
            confidence: signal.confidence,
            current_price: signal.current_price,
            created_by: "system",
            is_public: true,
          },
        ])
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`❌ Error saving signal for ${signal.symbol}:`, error);
      return null;
    }
  }

  /**
   * Save scanner execution log
   */
  async saveScannerLog(success, data, config) {
    try {
      await this.supabase.from("auto_fetch_logs").insert([
        {
          success,
          data,
          config,
          executed_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("❌ Error saving scanner log:", error);
    }
  }
}

// =================================================================
// 🧮 TECHNICAL ANALYSIS ENGINE
// =================================================================

class TechnicalAnalyzer {
  /**
   * Calculate Exponential Moving Average (EMA)
   */
  calculateEMA(prices, period = 20) {
    if (prices.length < period) return null;

    const multiplier = 2 / (period + 1);

    // Calculate initial SMA
    let ema =
      prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

    // Calculate EMA
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier);
    }

    return ema;
  }

  /**
   * Calculate Relative Strength Index (RSI)
   */
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;

    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    const recentChanges = changes.slice(-period);
    const gains = recentChanges.map((change) => (change > 0 ? change : 0));
    const losses = recentChanges.map((change) =>
      change < 0 ? Math.abs(change) : 0
    );

    const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / period;
    const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    return rsi;
  }

  /**
   * Analyze stock using 6 criteria
   */
  analyzeStock(symbol, historicalData, dailyCandles) {
    if (!historicalData || historicalData.length === 0) {
      return null;
    }

    if (!dailyCandles || dailyCandles.length < CONFIG.EMA_PERIOD) {
      return null;
    }

    // Get current price (latest 5-min candle)
    const currentCandle = historicalData[historicalData.length - 1];
    const currentPrice = parseFloat(currentCandle.close);
    const openPrice = parseFloat(currentCandle.open);

    // 1. CRITERION 1: NIFTY 500/250 member (assumed true since we query from symbols table)
    const nifty250Member = true;

    // 2. CRITERION 2: Trading above Daily 20 EMA
    const dailyPrices = dailyCandles.map((candle) => parseFloat(candle.close));
    const dailyEMA20 = this.calculateEMA(dailyPrices, CONFIG.EMA_PERIOD);
    const aboveDailyEMA20 = dailyEMA20 ? currentPrice > dailyEMA20 : false;

    // 3. CRITERION 3: Trading above 5-minute 20 EMA
    const fiveMinPrices = historicalData.map((candle) =>
      parseFloat(candle.close)
    );
    const fiveMinEMA20 = this.calculateEMA(fiveMinPrices, CONFIG.EMA_PERIOD);
    const above5minEMA20 = fiveMinEMA20 ? currentPrice > fiveMinEMA20 : false;

    // 4. CRITERION 4: Volume condition (3-day avg <= previous day volume)
    const volumeCondition = this.checkVolumeCondition(historicalData);

    // 5. CRITERION 5: Opening price <= Current price
    const openPriceCondition = openPrice <= currentPrice;

    // 6. CRITERION 6: RSI between 50 and 80
    const rsi = this.calculateRSI(fiveMinPrices, CONFIG.RSI_PERIOD);
    const rsiInRange = rsi ? rsi > 50 && rsi < 80 : false;

    // Calculate criteria met
    const criteriaResults = [
      nifty250Member,
      aboveDailyEMA20,
      above5minEMA20,
      volumeCondition,
      openPriceCondition,
      rsiInRange,
    ];

    const criteriaMet = criteriaResults.filter(Boolean).length;
    const probability = criteriaMet / 6;

    // Determine signal type
    let signalType, predictedDirection;

    if (criteriaMet >= 5) {
      signalType = "BULLISH_BREAKOUT";
      predictedDirection = "UP";
    } else if (criteriaMet <= 2) {
      signalType = "BEARISH_BREAKDOWN";
      predictedDirection = "DOWN";
    } else {
      signalType = "NEUTRAL";
      predictedDirection = "SIDEWAYS";
    }

    // Calculate target and stop loss
    const targetPrice =
      predictedDirection === "UP"
        ? currentPrice * 1.02 // 2% target
        : currentPrice * 0.98;

    const stopLoss =
      predictedDirection === "UP"
        ? currentPrice * 0.99 // 1% stop loss
        : currentPrice * 1.01;

    // Calculate volume ratio
    const volumeRatio = this.calculateVolumeRatio(historicalData);

    return {
      symbol,
      signal_type: signalType,
      probability: parseFloat(probability.toFixed(2)),
      criteria_met: criteriaMet,
      daily_ema20: dailyEMA20 ? parseFloat(dailyEMA20.toFixed(2)) : null,
      fivemin_ema20: fiveMinEMA20 ? parseFloat(fiveMinEMA20.toFixed(2)) : null,
      rsi_value: rsi ? parseFloat(rsi.toFixed(2)) : null,
      volume_ratio: volumeRatio ? parseFloat(volumeRatio.toFixed(2)) : null,
      predicted_direction: predictedDirection,
      target_price: parseFloat(targetPrice.toFixed(2)),
      stop_loss: parseFloat(stopLoss.toFixed(2)),
      confidence: parseFloat(probability.toFixed(2)),
      current_price: parseFloat(currentPrice.toFixed(2)),

      // Additional info for logging
      criteria_details: {
        nifty250Member,
        aboveDailyEMA20,
        above5minEMA20,
        volumeCondition,
        openPriceCondition,
        rsiInRange,
      },
    };
  }

  /**
   * Check volume condition: 3-day avg volume <= previous day volume
   */
  checkVolumeCondition(historicalData) {
    try {
      // Group by date to get daily volumes
      const dailyVolumes = {};

      historicalData.forEach((candle) => {
        const date = candle.date;
        if (!dailyVolumes[date]) {
          dailyVolumes[date] = 0;
        }
        dailyVolumes[date] += parseInt(candle.volume || 0);
      });

      const volumes = Object.values(dailyVolumes);

      if (volumes.length < 4) return false; // Need at least 4 days

      const last3Days = volumes.slice(-4, -1); // Get last 3 days (excluding today)
      const previousDay = volumes[volumes.length - 2]; // Previous day volume

      const avg3Day = last3Days.reduce((sum, vol) => sum + vol, 0) / 3;

      return avg3Day <= previousDay;
    } catch (error) {
      console.error("Error calculating volume condition:", error);
      return false;
    }
  }

  /**
   * Calculate volume ratio (current vs average)
   */
  calculateVolumeRatio(historicalData) {
    try {
      const dailyVolumes = {};

      historicalData.forEach((candle) => {
        const date = candle.date;
        if (!dailyVolumes[date]) {
          dailyVolumes[date] = 0;
        }
        dailyVolumes[date] += parseInt(candle.volume || 0);
      });

      const volumes = Object.values(dailyVolumes);

      if (volumes.length < 2) return null;

      const currentVolume = volumes[volumes.length - 1];
      const avgVolume =
        volumes.slice(0, -1).reduce((sum, vol) => sum + vol, 0) /
        (volumes.length - 1);

      return avgVolume > 0 ? currentVolume / avgVolume : null;
    } catch (error) {
      return null;
    }
  }
}

// =================================================================
// 🚀 MAIN BREAKOUT SCANNER
// =================================================================

class BreakoutScanner {
  constructor() {
    this.db = new DatabaseClient();
    this.analyzer = new TechnicalAnalyzer();
    this.symbols = [];
    this.isScanning = false;
    this.scanCount = 0;
  }

  /**
   * Initialize scanner
   */
  async initialize() {
    console.log("🚀 Initializing Breakout Scanner...");
    console.log(`📊 Configuration:
      - Scan Interval: ${CONFIG.SCAN_INTERVAL_MS / 1000}s
      - Batch Size: ${CONFIG.BATCH_SIZE}
      - Top N Stocks: ${CONFIG.TOP_N_STOCKS}
      - Min Confidence: ${CONFIG.MIN_CONFIDENCE_TO_SAVE}
    `);

    try {
      // Load NIFTY 250 symbols from database
      this.symbols = await this.db.getNifty250Symbols();

      if (this.symbols.length === 0) {
        throw new Error("No symbols loaded from database");
      }

      console.log(`✅ Scanner initialized with ${this.symbols.length} symbols`);
      return true;
    } catch (error) {
      console.error("❌ Initialization failed:", error);
      return false;
    }
  }

  /**
   * Check if market is open
   */
  isMarketOpen() {
    const now = new Date();
    const istTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const hour = istTime.getHours();
    const minute = istTime.getMinutes();
    const day = istTime.getDay();

    // Check if weekend
    if (day === 0 || day === 6) {
      return false;
    }

    // Check market hours (9:15 AM - 3:30 PM IST)
    const marketOpen =
      hour > CONFIG.MARKET_OPEN_HOUR ||
      (hour === CONFIG.MARKET_OPEN_HOUR && minute >= CONFIG.MARKET_OPEN_MINUTE);
    const marketClose =
      hour < CONFIG.MARKET_CLOSE_HOUR ||
      (hour === CONFIG.MARKET_CLOSE_HOUR &&
        minute <= CONFIG.MARKET_CLOSE_MINUTE);

    return marketOpen && marketClose;
  }

  /**
   * Scan all stocks
   */
  async scanAllStocks() {
    if (this.isScanning) {
      console.log("⏭️  Scan already in progress, skipping...");
      return;
    }

    if (!this.isMarketOpen()) {
      console.log("🔒 Market is closed, skipping scan");
      return;
    }

    this.isScanning = true;
    this.scanCount++;

    const scanStartTime = Date.now();
    console.log(
      `\n🔍 Starting Scan #${this.scanCount} at ${new Date().toISOString()}`
    );

    let processedCount = 0;
    let signalCount = 0;
    const signals = [];

    try {
      // Process stocks in batches
      for (let i = 0; i < this.symbols.length; i += CONFIG.BATCH_SIZE) {
        const batch = this.symbols.slice(i, i + CONFIG.BATCH_SIZE);

        const batchPromises = batch.map(async (symbolData) => {
          try {
            const symbol = symbolData.symbol;

            // Fetch historical data
            const [historicalData, dailyCandles] = await Promise.all([
              this.db.getHistoricalData(symbol, CONFIG.VOLUME_LOOKBACK_DAYS),
              this.db.getDailyCandles(symbol, 30),
            ]);

            // Analyze stock
            const signal = this.analyzer.analyzeStock(
              symbol,
              historicalData,
              dailyCandles
            );

            processedCount++;

            // Save high-confidence signals
            if (
              signal &&
              signal.probability >= CONFIG.MIN_CONFIDENCE_TO_SAVE &&
              signal.criteria_met >= CONFIG.MIN_CRITERIA_MET
            ) {
              await this.db.saveBreakoutSignal(signal);
              signals.push(signal);
              signalCount++;

              console.log(
                `  ✅ ${symbol}: ${signal.signal_type} (${(
                  signal.probability * 100
                ).toFixed(0)}% confidence)`
              );
            }

            return signal;
          } catch (error) {
            console.error(
              `  ❌ Error processing ${symbolData.symbol}:`,
              error.message
            );
            return null;
          }
        });

        await Promise.all(batchPromises);

        // Small delay between batches to avoid overwhelming database
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const scanDuration = ((Date.now() - scanStartTime) / 1000).toFixed(2);

      console.log(`\n✅ Scan #${this.scanCount} Complete:
        - Processed: ${processedCount}/${this.symbols.length} stocks
        - Signals Generated: ${signalCount}
        - Duration: ${scanDuration}s
      `);

      // Save scan log
      await this.db.saveScannerLog(
        true,
        {
          scan_number: this.scanCount,
          signals_generated: signalCount,
          stocks_processed: processedCount,
          duration_seconds: parseFloat(scanDuration),
          timestamp: new Date().toISOString(),
        },
        CONFIG
      );
    } catch (error) {
      console.error("❌ Scan failed:", error);

      await this.db.saveScannerLog(
        false,
        {
          error: error.message,
          scan_number: this.scanCount,
          timestamp: new Date().toISOString(),
        },
        CONFIG
      );
    } finally {
      this.isScanning = false;
    }
  }

  /**
   * Start continuous scanning
   */
  start() {
    console.log(`\n🎯 Starting continuous breakout scanning...
      Scan interval: Every ${CONFIG.SCAN_INTERVAL_MS / 1000} seconds
      Press Ctrl+C to stop
    `);

    // Run first scan immediately
    this.scanAllStocks();

    // Schedule regular scans
    setInterval(() => {
      this.scanAllStocks();
    }, CONFIG.SCAN_INTERVAL_MS);
  }
}

// =================================================================
// 🏃 STARTUP
// =================================================================

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        🎯 BREAKOUT PREDICTION SCANNER v1.0                ║
║        6-Criteria Technical Analysis System                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

  // Validate environment variables
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_SERVICE_KEY) {
    console.error("❌ Missing required environment variables:");
    console.error("   - SUPABASE_URL");
    console.error("   - SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  // Create and initialize scanner
  const scanner = new BreakoutScanner();
  const initialized = await scanner.initialize();

  if (!initialized) {
    console.error("❌ Scanner initialization failed");
    process.exit(1);
  }

  // Start scanning
  scanner.start();

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n\n🛑 Shutting down scanner...");
    console.log("📊 Final stats:");
    console.log(`   - Total scans: ${scanner.scanCount}`);
    console.log("   - Status: Stopped");
    process.exit(0);
  });
}

// Run the scanner
main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});

module.exports = { BreakoutScanner, TechnicalAnalyzer };
