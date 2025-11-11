/**
 * 🚀 ENHANCED BREAKOUT SCANNER WITH WEBSOCKET TICK-BY-TICK DATA
 *
 * Combines historical 5-min data with real-time tick data for:
 * - Earlier breakout detection (before 5-min candle closes)
 * - More accurate real-time EMA/RSI calculations
 * - Instant signal generation on breakout confirmation
 *
 * ARCHITECTURE:
 * 1. Load historical 1-day 5-min data from Supabase
 * 2. Subscribe to WebSocket tick data for all 250 stocks
 * 3. Aggregate ticks into current 5-min candle
 * 4. Merge current candle with historical data
 * 5. Recalculate EMA/RSI on every significant price move
 * 6. Trigger signals immediately when criteria met
 *
 * REQUIREMENTS:
 * - Node.js 18+
 * - ws (WebSocket client): npm install ws
 * - @supabase/supabase-js
 * - Real-time market data feed (e.g., Zerodha Kite Connect, IIFL, Angel One)
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const WebSocket = require("ws");

// =================================================================
// 🔧 CONFIGURATION
// =================================================================

const CONFIG = {
  // Supabase connection
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // TrueData WebSocket configuration
  TRUEDATA_USER: process.env.TRUEDATA_USER,
  TRUEDATA_PASSWORD: process.env.TRUEDATA_PASSWORD,
  TRUEDATA_WS_PORT: process.env.TRUEDATA_WS_PORT || "8082",
  TRUEDATA_WS_URL: "wss://push.truedata.in",

  // Scanner settings
  TOP_N_STOCKS: 250,
  CANDLE_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
  MIN_CONFIDENCE_TO_SAVE: 0.6,
  MIN_CRITERIA_MET: 4,

  // Trading hours (IST)
  MARKET_OPEN_HOUR: 9,
  MARKET_OPEN_MINUTE: 15,
  MARKET_CLOSE_HOUR: 15,
  MARKET_CLOSE_MINUTE: 30,

  // Technical analysis
  EMA_PERIOD: 20,
  RSI_PERIOD: 14,

  // Performance optimization
  TICK_AGGREGATION_THRESHOLD: 100, // Recalculate after 100 ticks or price change > 0.1%
  PRICE_CHANGE_THRESHOLD: 0.001, // 0.1% price change triggers recalculation
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

  async getNifty250Symbols() {
    try {
      const { data, error } = await this.supabase
        .from("symbols")
        .select("symbol, name, sector") // WebSocket providers typically use symbol name or you can add instrument_token later
        .eq("exchange", "NSE")
        .in("type", ["EQ", "EQUITY", "STOCK"])
        .limit(CONFIG.TOP_N_STOCKS);

      if (error) throw error;
      console.log(`✅ Loaded ${data.length} NSE symbols`);
      return data;
    } catch (error) {
      console.error("❌ Error loading symbols:", error);
      throw error;
    }
  }

  async getHistoricalData(symbol, days = 1) {
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

  async getDailyCandles(symbol, days = 30) {
    try {
      const { data, error } = await this.supabase
        .from("historical_prices")
        .select("date, open, high, low, close, volume")
        .eq("symbol", symbol)
        .eq("time", "15:30")
        .order("date", { ascending: true })
        .limit(days);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`❌ Error fetching daily candles for ${symbol}:`, error);
      return [];
    }
  }

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
            created_by: "websocket_scanner",
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
}

// =================================================================
// 📡 WEBSOCKET MANAGER (TRUEDATA)
// =================================================================

class WebSocketManager {
  constructor(symbols) {
    this.symbols = symbols;
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.tickHandlers = new Map(); // symbol -> handler function
  }

  /**
   * Connect to TrueData WebSocket and subscribe to all symbols
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        console.log("🔌 Connecting to TrueData WebSocket...");

        // TrueData WebSocket URL format
        const url = `${CONFIG.TRUEDATA_WS_URL}:${CONFIG.TRUEDATA_WS_PORT}?user=${CONFIG.TRUEDATA_USER}&password=${CONFIG.TRUEDATA_PASSWORD}`;
        console.log(
          `Connecting to: ${CONFIG.TRUEDATA_WS_URL}:${CONFIG.TRUEDATA_WS_PORT}`
        );

        this.ws = new WebSocket(url);

        this.ws.on("open", () => {
          console.log("✅ WebSocket connected to TrueData");
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Subscribe to all symbols using TrueData format
          const symbolList = this.symbols.map((s) => s.symbol);
          this.subscribe(symbolList);

          resolve();
        });

        this.ws.on("message", (data) => {
          this.handleMessage(data);
        });

        this.ws.on("error", (error) => {
          console.error("❌ WebSocket error:", error);
          reject(error);
        });

        this.ws.on("close", () => {
          console.log("🔌 WebSocket disconnected");
          this.isConnected = false;
          this.attemptReconnect();
        });
      } catch (error) {
        console.error("❌ WebSocket connection failed:", error);
        reject(error);
      }
    });
  }

  /**
   * Subscribe to symbols using TrueData format
   */
  subscribe(symbols) {
    if (!this.isConnected) {
      console.error("❌ Cannot subscribe: WebSocket not connected");
      return;
    }

    // TrueData subscription format
    const subscribeMessage = {
      method: "addsymbol",
      symbols: symbols,
      bars: "tick", // Use "tick" for tick-by-tick data, or "1min" for 1-min bars
    };

    console.log(`📡 Subscribing to ${symbols.length} symbols...`);
    console.log("Sending:", JSON.stringify(subscribeMessage));
    this.ws.send(JSON.stringify(subscribeMessage));
  }

  /**
   * Handle incoming tick data from TrueData
   */
  handleMessage(data) {
    try {
      // TrueData sends JSON tick data
      const ticks = this.parseTickData(data);

      ticks.forEach((tick) => {
        const handler = this.tickHandlers.get(tick.symbol);
        if (handler) {
          handler(tick);
        }
      });
    } catch (error) {
      console.error("❌ Error handling tick data:", error);
    }
  }

  /**
   * Parse tick data from TrueData WebSocket message
   */
  parseTickData(data) {
    try {
      const parsed = JSON.parse(data);

      // TrueData tick format (based on common patterns):
      // {
      //   "symbol": "RELIANCE",
      //   "ltp": 2450.50,
      //   "open": 2440.00,
      //   "high": 2455.00,
      //   "low": 2435.00,
      //   "close": 2450.50,
      //   "volume": 1234567,
      //   "timestamp": "2025-11-10 10:15:30"
      // }
      // OR could be an array of ticks

      // Handle both single tick and array of ticks
      const tickArray = Array.isArray(parsed) ? parsed : [parsed];

      return tickArray.map((tick) => ({
        symbol: tick.symbol || tick.Symbol,
        ltp: parseFloat(tick.ltp || tick.LTP || tick.close),
        volume: parseInt(tick.volume || tick.Volume || 0),
        timestamp: tick.timestamp || tick.Timestamp || new Date().toISOString(),
        open: parseFloat(tick.open || tick.Open || tick.ltp),
        high: parseFloat(tick.high || tick.High || tick.ltp),
        low: parseFloat(tick.low || tick.Low || tick.ltp),
      }));
    } catch (error) {
      console.error("Error parsing TrueData tick:", error);
      return [];
    }
  }

  /**
   * Register tick handler for a symbol
   */
  onTick(symbol, handler) {
    this.tickHandlers.set(symbol, handler);
  }

  /**
   * Attempt to reconnect
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(
      `🔄 Reconnecting in ${delay / 1000}s (attempt ${this.reconnectAttempts})`
    );

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error("❌ Reconnection failed:", error);
      });
    }, delay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// =================================================================
// 🕯️ CANDLE AGGREGATOR
// =================================================================

class CandleAggregator {
  constructor(symbol) {
    this.symbol = symbol;
    this.currentCandle = null;
    this.candleStartTime = null;
    this.ticks = [];
  }

  /**
   * Process incoming tick
   */
  processTick(tick) {
    const tickTime = new Date(tick.timestamp);
    const candleTime = this.getCandleStartTime(tickTime);

    // New candle started
    if (
      !this.currentCandle ||
      this.candleStartTime.getTime() !== candleTime.getTime()
    ) {
      const completedCandle = this.currentCandle;

      // Reset for new candle
      this.candleStartTime = candleTime;
      this.currentCandle = {
        symbol: this.symbol,
        date: candleTime.toISOString().split("T")[0],
        time: candleTime.toTimeString().slice(0, 5),
        open: tick.ltp,
        high: tick.ltp,
        low: tick.ltp,
        close: tick.ltp,
        volume: tick.volume || 0,
        timestamp: candleTime,
      };
      this.ticks = [];

      return { newCandle: true, completedCandle };
    }

    // Update current candle
    this.currentCandle.high = Math.max(this.currentCandle.high, tick.ltp);
    this.currentCandle.low = Math.min(this.currentCandle.low, tick.ltp);
    this.currentCandle.close = tick.ltp;
    this.currentCandle.volume = tick.volume || this.currentCandle.volume;

    this.ticks.push(tick);

    return { newCandle: false, currentCandle: this.currentCandle };
  }

  /**
   * Get candle start time for 5-min interval
   */
  getCandleStartTime(time) {
    const candleTime = new Date(time);
    const minutes = candleTime.getMinutes();
    const roundedMinutes = Math.floor(minutes / 5) * 5;
    candleTime.setMinutes(roundedMinutes, 0, 0);
    return candleTime;
  }

  getCurrentCandle() {
    return this.currentCandle;
  }
}

// =================================================================
// 🧮 TECHNICAL ANALYSIS ENGINE (ENHANCED)
// =================================================================

class TechnicalAnalyzer {
  calculateEMA(prices, period = 20) {
    if (prices.length < period) return null;

    const multiplier = 2 / (period + 1);
    let ema =
      prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier);
    }

    return ema;
  }

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
   * Analyze stock with real-time + historical data
   */
  analyzeStock(symbol, historicalCandles, currentCandle, dailyCandles) {
    if (
      !currentCandle ||
      !dailyCandles ||
      dailyCandles.length < CONFIG.EMA_PERIOD
    ) {
      return null;
    }

    // Merge historical + current candle
    const allCandles = [...historicalCandles, currentCandle];
    const currentPrice = parseFloat(currentCandle.close);
    const openPrice = parseFloat(currentCandle.open);

    // 1. NIFTY 250 member (assumed true)
    const nifty250Member = true;

    // 2. Trading above Daily 20 EMA
    const dailyPrices = dailyCandles.map((c) => parseFloat(c.close));
    const dailyEMA20 = this.calculateEMA(dailyPrices, CONFIG.EMA_PERIOD);
    const aboveDailyEMA20 = dailyEMA20 ? currentPrice > dailyEMA20 : false;

    // 3. Trading above 5-minute 20 EMA (includes current candle!)
    const fiveMinPrices = allCandles.map((c) => parseFloat(c.close));
    const fiveMinEMA20 = this.calculateEMA(fiveMinPrices, CONFIG.EMA_PERIOD);
    const above5minEMA20 = fiveMinEMA20 ? currentPrice > fiveMinEMA20 : false;

    // 4. Volume condition
    const volumeCondition = this.checkVolumeCondition(allCandles);

    // 5. Opening price <= Current price
    const openPriceCondition = openPrice <= currentPrice;

    // 6. RSI between 50 and 80
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

    const targetPrice =
      predictedDirection === "UP" ? currentPrice * 1.02 : currentPrice * 0.98;

    const stopLoss =
      predictedDirection === "UP" ? currentPrice * 0.99 : currentPrice * 1.01;

    const volumeRatio = this.calculateVolumeRatio(allCandles);

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

  checkVolumeCondition(candles) {
    try {
      const dailyVolumes = {};

      candles.forEach((candle) => {
        const date = candle.date;
        if (!dailyVolumes[date]) {
          dailyVolumes[date] = 0;
        }
        dailyVolumes[date] += parseInt(candle.volume || 0);
      });

      const volumes = Object.values(dailyVolumes);

      if (volumes.length < 2) return false;

      const previousDay = volumes[volumes.length - 2];
      const currentDay = volumes[volumes.length - 1];

      return currentDay >= previousDay;
    } catch (error) {
      return false;
    }
  }

  calculateVolumeRatio(candles) {
    try {
      const dailyVolumes = {};

      candles.forEach((candle) => {
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
// 🚀 ENHANCED SCANNER WITH WEBSOCKET
// =================================================================

class EnhancedBreakoutScanner {
  constructor() {
    this.db = new DatabaseClient();
    this.analyzer = new TechnicalAnalyzer();
    this.wsManager = null;
    this.symbols = [];
    this.candleAggregators = new Map(); // symbol -> CandleAggregator
    this.historicalData = new Map(); // symbol -> historical candles
    this.dailyCandles = new Map(); // symbol -> daily candles
    this.lastSignalTime = new Map(); // symbol -> timestamp (prevent duplicate signals)
    this.tickCount = new Map(); // symbol -> tick count
  }

  async initialize() {
    console.log("🚀 Initializing Enhanced Breakout Scanner (WebSocket)...");
    console.log(`📊 Configuration:
      - Top Stocks: ${CONFIG.TOP_N_STOCKS}
      - Min Confidence: ${CONFIG.MIN_CONFIDENCE_TO_SAVE}
      - EMA Period: ${CONFIG.EMA_PERIOD}
      - RSI Period: ${CONFIG.RSI_PERIOD}
    `);

    try {
      // Load symbols
      this.symbols = await this.db.getNifty250Symbols();

      if (this.symbols.length === 0) {
        throw new Error("No symbols loaded");
      }

      // Load historical data for all symbols
      console.log("📥 Loading historical data for all symbols...");
      await this.loadHistoricalData();

      // Initialize WebSocket
      this.wsManager = new WebSocketManager(this.symbols);
      await this.wsManager.connect();

      // Set up tick handlers
      this.setupTickHandlers();

      console.log(`✅ Scanner initialized with ${this.symbols.length} symbols`);
      return true;
    } catch (error) {
      console.error("❌ Initialization failed:", error);
      return false;
    }
  }

  async loadHistoricalData() {
    const promises = this.symbols.map(async (symbolData) => {
      const symbol = symbolData.symbol;

      const [historical, daily] = await Promise.all([
        this.db.getHistoricalData(symbol, 1),
        this.db.getDailyCandles(symbol, 30),
      ]);

      this.historicalData.set(symbol, historical);
      this.dailyCandles.set(symbol, daily);
      this.candleAggregators.set(symbol, new CandleAggregator(symbol));
      this.tickCount.set(symbol, 0);
    });

    await Promise.all(promises);
    console.log(`✅ Loaded historical data for ${this.symbols.length} symbols`);
  }

  setupTickHandlers() {
    this.symbols.forEach((symbolData) => {
      const symbol = symbolData.symbol;

      this.wsManager.onTick(symbol, (tick) => {
        this.handleTick(symbol, tick);
      });
    });
  }

  handleTick(symbol, tick) {
    const aggregator = this.candleAggregators.get(symbol);
    if (!aggregator) return;

    // Process tick into candle
    const result = aggregator.processTick(tick);

    // If new candle started, add completed candle to historical data
    if (result.newCandle && result.completedCandle) {
      const historical = this.historicalData.get(symbol) || [];
      historical.push(result.completedCandle);
      this.historicalData.set(symbol, historical);

      console.log(`🕯️ New candle: ${symbol} @ ${result.completedCandle.time}`);
    }

    // Increment tick count
    const count = (this.tickCount.get(symbol) || 0) + 1;
    this.tickCount.set(symbol, count);

    // Recalculate only if:
    // 1. Significant price change (> 0.1%)
    // 2. Every 100 ticks
    const shouldRecalculate =
      count % CONFIG.TICK_AGGREGATION_THRESHOLD === 0 ||
      this.hasSignificantPriceChange(symbol, tick.ltp);

    if (shouldRecalculate) {
      this.analyzeSymbol(symbol);
    }
  }

  hasSignificantPriceChange(symbol, currentPrice) {
    const aggregator = this.candleAggregators.get(symbol);
    if (!aggregator) return false;

    const candle = aggregator.getCurrentCandle();
    if (!candle) return false;

    const priceChange = Math.abs(currentPrice - candle.open) / candle.open;
    return priceChange >= CONFIG.PRICE_CHANGE_THRESHOLD;
  }

  async analyzeSymbol(symbol) {
    const historical = this.historicalData.get(symbol);
    const daily = this.dailyCandles.get(symbol);
    const aggregator = this.candleAggregators.get(symbol);

    if (!historical || !daily || !aggregator) return;

    const currentCandle = aggregator.getCurrentCandle();
    if (!currentCandle) return;

    // Analyze with real-time data
    const signal = this.analyzer.analyzeStock(
      symbol,
      historical,
      currentCandle,
      daily
    );

    if (!signal) return;

    // Save high-confidence signals (prevent duplicates within 5 minutes)
    if (
      signal.probability >= CONFIG.MIN_CONFIDENCE_TO_SAVE &&
      signal.criteria_met >= CONFIG.MIN_CRITERIA_MET
    ) {
      const lastSignal = this.lastSignalTime.get(symbol);
      const now = Date.now();

      if (!lastSignal || now - lastSignal > 5 * 60 * 1000) {
        await this.db.saveBreakoutSignal(signal);
        this.lastSignalTime.set(symbol, now);

        console.log(
          `🎯 SIGNAL: ${symbol} - ${signal.signal_type} (${(
            signal.probability * 100
          ).toFixed(0)}% confidence) @ ₹${signal.current_price}`
        );
      }
    }
  }

  isMarketOpen() {
    const now = new Date();
    const istTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const hour = istTime.getHours();
    const minute = istTime.getMinutes();
    const day = istTime.getDay();

    if (day === 0 || day === 6) return false;

    const marketOpen =
      hour > CONFIG.MARKET_OPEN_HOUR ||
      (hour === CONFIG.MARKET_OPEN_HOUR && minute >= CONFIG.MARKET_OPEN_MINUTE);
    const marketClose =
      hour < CONFIG.MARKET_CLOSE_HOUR ||
      (hour === CONFIG.MARKET_CLOSE_HOUR &&
        minute <= CONFIG.MARKET_CLOSE_MINUTE);

    return marketOpen && marketClose;
  }

  async start() {
    console.log("🚀 Starting enhanced scanner...");

    // Monitor market hours
    setInterval(() => {
      if (!this.isMarketOpen() && this.wsManager.isConnected) {
        console.log("🔒 Market closed, disconnecting WebSocket...");
        this.wsManager.disconnect();
      } else if (this.isMarketOpen() && !this.wsManager.isConnected) {
        console.log("📈 Market open, reconnecting WebSocket...");
        this.wsManager.connect();
      }
    }, 60000); // Check every minute
  }

  async shutdown() {
    console.log("🛑 Shutting down scanner...");
    if (this.wsManager) {
      this.wsManager.disconnect();
    }
  }
}

// =================================================================
// 🎬 MAIN EXECUTION
// =================================================================

(async () => {
  const scanner = new EnhancedBreakoutScanner();

  try {
    const initialized = await scanner.initialize();

    if (!initialized) {
      console.error("❌ Failed to initialize scanner");
      process.exit(1);
    }

    await scanner.start();

    console.log("✅ Scanner is running with WebSocket tick-by-tick data!");
    console.log("   Press Ctrl+C to stop");

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\n🛑 Received SIGINT, shutting down...");
      await scanner.shutdown();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
})();
