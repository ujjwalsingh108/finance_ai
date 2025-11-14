require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const WebSocket = require("ws");

// =================================================================
// 🔧 CONFIGURATION
// =================================================================

// Top 50 most liquid NSE stocks (Nifty 50 constituents)
// These are most likely to have tick data in TrueData trial
const NIFTY_50_SYMBOLS = [
  "RELIANCE",
  "TCS",
  "HDFCBANK",
  "INFY",
  "ICICIBANK",
  "HINDUNILVR",
  "ITC",
  "SBIN",
  "BHARTIARTL",
  "BAJFINANCE",
  "KOTAKBANK",
  "LT",
  "AXISBANK",
  "ASIANPAINT",
  "MARUTI",
  "SUNPHARMA",
  "TITAN",
  "ULTRACEMCO",
  "DMART",
  "NESTLEIND",
  "WIPRO",
  "HCLTECH",
  "ADANIENT",
  "ONGC",
  "NTPC",
  "POWERGRID",
  "M&M",
  "TATAMOTORS",
  "JSWSTEEL",
  "TATASTEEL",
  "BAJAJFINSV",
  "TECHM",
  "COALINDIA",
  "INDUSINDBK",
  "ADANIPORTS",
  "CIPLA",
  "GRASIM",
  "HDFCLIFE",
  "SBILIFE",
  "DIVISLAB",
  "DRREDDY",
  "EICHERMOT",
  "APOLLOHOSP",
  "HEROMOTOCO",
  "BRITANNIA",
  "SHREECEM",
  "BAJAJ-AUTO",
  "TATACONSUM",
  "HINDALCO",
  "UPL",
];

const CONFIG = {
  // Supabase connection
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // TrueData WebSocket configuration
  TRUEDATA_USER: process.env.TRUEDATA_USER,
  TRUEDATA_PASSWORD: process.env.TRUEDATA_PASSWORD,
  TRUEDATA_WS_PORT: process.env.TRUEDATA_WS_PORT || "8086",
  TRUEDATA_WS_URL: process.env.TRUEDATA_WS_URL || "wss://push.truedata.in",

  // Scanner settings
  TOP_N_STOCKS: 50, // TrueData trial allows 50 symbols
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
  MIN_CANDLES_FOR_ANALYSIS: 15, // Minimum candles needed (instead of 20)
  USE_ADAPTIVE_EMA: true, // Use shorter EMA if not enough data

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
      // Query Nifty 50 symbols specifically (trial API supports 50 symbols)
      const { data, error } = await this.supabase
        .from("nse_equity_symbols")
        .select("symbol, instrument_token, exchange, type")
        .eq("exchange", "NSE")
        .eq("type", "stock")
        .in("symbol", NIFTY_50_SYMBOLS)
        .order("symbol", { ascending: true });

      if (error) throw error;

      console.log(
        `✅ Loaded ${data.length} Nifty 50 symbols (TrueData trial supports 50)`
      );
      console.log(
        `📊 [DEBUG] First 10 symbols:`,
        data.slice(0, 10).map((s) => s.symbol)
      );
      console.log(
        `📊 [DEBUG] Last 10 symbols:`,
        data.slice(-10).map((s) => s.symbol)
      );
      console.log(
        `📊 [DEBUG] Token mapping sample:`,
        data.slice(0, 5).map((s) => `${s.instrument_token} -> ${s.symbol}`)
      );

      // Store first symbol for detailed debugging
      this.firstSymbol = data[0]?.symbol;

      return data;
    } catch (error) {
      console.error("❌ Error loading symbols:", error);
      throw error;
    }
  }

  async getHistoricalData(symbol, candlesNeeded = 25) {
    try {
      // Fetch last N 5-min candles (may span multiple days)
      // We need at least 20 candles for EMA20, fetch 25 to be safe
      const { data, error } = await this.supabase
        .from("historical_prices")
        .select("*")
        .eq("symbol", symbol)
        .gte("time", "09:15") // Only market hours
        .lte("time", "15:30") // Only market hours
        .order("date", { ascending: false })
        .order("time", { ascending: false })
        .limit(candlesNeeded);

      if (error) throw error;

      // Reverse to get chronological order (oldest to newest)
      const sortedData = (data || []).reverse();

      // Debug: Log first symbol's historical data
      if (symbol === this.firstSymbol) {
        console.log(`📊 [DEBUG] Historical data for ${symbol}:`, {
          candles: sortedData.length,
          dateRange:
            sortedData[0]?.date +
            " to " +
            sortedData[sortedData.length - 1]?.date,
          timeRange:
            sortedData[0]?.time +
            " to " +
            sortedData[sortedData.length - 1]?.time,
          sample: sortedData[0],
        });
      }

      return sortedData;
    } catch (error) {
      console.error(`❌ Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  async getDailyCandles(symbol, days = 30) {
    try {
      // Fetch last candle of each day (15:30) for previous days
      // This gives us proper daily OHLCV data
      const daysToFetch = days + 10; // Extra buffer for weekends/holidays
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysToFetch);

      const { data, error } = await this.supabase
        .from("historical_prices")
        .select("date, time, open, high, low, close, volume")
        .eq("symbol", symbol)
        .eq("time", "15:30") // Market closing time - represents daily candle
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(days);

      if (error) throw error;

      // Debug: Log first symbol's daily data
      if (symbol === this.firstSymbol) {
        console.log(`📊 [DEBUG] Daily candles for ${symbol}:`, {
          candles: data?.length || 0,
          dateRange: data?.[0]?.date + " to " + data?.[data.length - 1]?.date,
          lastClose: data?.[data.length - 1]?.close,
        });
      }

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
    this.tokenToSymbol = new Map(); // instrument_token -> symbol
    this.firstTickLogged = false;
    this.noHandlerWarned = false;
    this.rawMessageLogged = false;
    this.parsedStructureLogged = false;
    this.firstValidTickLogged = false;
    this.unknownTokenWarned = false;
    this.unknownFormatLogged = false;

    // Build token-to-symbol mapping from database
    symbols.forEach((s) => {
      if (s.instrument_token) {
        this.tokenToSymbol.set(s.instrument_token.toString(), s.symbol);
      }
    });

    console.log(
      `📊 [DEBUG] Token mapping created: ${this.tokenToSymbol.size} tokens`
    );

    // Show sample mappings
    const sampleMappings = Array.from(this.tokenToSymbol.entries()).slice(
      0,
      10
    );
    console.log(`📊 [DEBUG] Sample token mappings:`);
    sampleMappings.forEach(([token, symbol]) => {
      console.log(`   ${token} -> ${symbol}`);
    });
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
      // Debug: Log raw message to understand format
      if (!this.rawMessageLogged) {
        console.log(`📡 [DEBUG] Raw WebSocket message:`, data.toString());
        this.rawMessageLogged = true;
      }

      // TrueData sends JSON tick data
      const ticks = this.parseTickData(data);

      // Debug: Log first tick received
      if (!this.firstTickLogged && ticks.length > 0) {
        console.log(`📡 [DEBUG] First tick received:`, ticks[0]);
        this.firstTickLogged = true;
      }

      ticks.forEach((tick) => {
        const handler = this.tickHandlers.get(tick.symbol);
        if (handler) {
          handler(tick);
        } else if (!this.noHandlerWarned) {
          console.log(`⚠️ [DEBUG] No handler for symbol: ${tick.symbol}`);
          this.noHandlerWarned = true;
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
      const rawString = data.toString();
      const parsed = JSON.parse(rawString);

      // Debug: Log parsed structure for first message
      if (!this.parsedStructureLogged) {
        console.log(
          `📊 [DEBUG] Parsed tick structure:`,
          JSON.stringify(parsed, null, 2)
        );
        this.parsedStructureLogged = true;
      }

      // TrueData WebSocket format patterns:

      // Pattern 1: Trade data with instrument token
      // { trade: [token, timestamp, ltp, volume, avgPrice, totalVolume, low, high, ...] }
      if (parsed.trade && Array.isArray(parsed.trade)) {
        return this.parseTradeArray(parsed.trade);
      }

      // Pattern 2: Bid/Ask data (skip for now)
      if (parsed.bidask) {
        return [];
      }

      // Pattern 3: Heartbeat (skip)
      if (parsed.success && parsed.message === "HeartBeat") {
        return [];
      }

      // Pattern 4: Array of trade data
      if (Array.isArray(parsed)) {
        return parsed.flatMap((item) => {
          if (item.trade && Array.isArray(item.trade)) {
            return this.parseTradeArray(item.trade);
          }
          return [];
        });
      }

      // Pattern 5: Legacy format with symbol field
      if (parsed.symbol || parsed.Symbol || parsed.sym) {
        return [this.normalizeTick(parsed)];
      }

      // Pattern 6: Nested data property
      if (parsed.data && Array.isArray(parsed.data)) {
        return parsed.data.flatMap((item) => {
          if (item.trade && Array.isArray(item.trade)) {
            return this.parseTradeArray(item.trade);
          }
          return [this.normalizeTick(item)];
        });
      }

      if (!this.unknownFormatLogged) {
        console.log(`⚠️ [DEBUG] Unknown tick format:`, parsed);
        this.unknownFormatLogged = true;
      }
      return [];
    } catch (error) {
      console.error("Error parsing TrueData tick:", error);
      return [];
    }
  }

  /**
   * Parse TrueData trade array format
   * Format: [token, timestamp, ltp, volume, avgPrice, totalVolume, low, high, lowerCircuit, upperCircuit, ...]
   */
  parseTradeArray(trade) {
    try {
      if (!Array.isArray(trade) || trade.length < 8) {
        return [];
      }

      const token = trade[0].toString();
      const symbol = this.tokenToSymbol.get(token);

      if (!symbol) {
        if (!this.unknownTokenWarned) {
          console.log(
            `⚠️ [UNMAPPED TOKEN] ${token} - LTP: ₹${trade[2]}, Vol: ${trade[3]}, High: ₹${trade[7]}, Low: ₹${trade[6]}`
          );
          console.log(
            `   💡 This token is not in the nse_equity_symbols table or not in monitored symbols`
          );
          this.unknownTokenWarned = true;
        }
        return [];
      }

      const tick = {
        symbol: symbol,
        ltp: parseFloat(trade[2]) || 0,
        volume: parseInt(trade[3]) || 0,
        timestamp: trade[1] || new Date().toISOString(),
        open: parseFloat(trade[2]) || 0, // Use LTP as open if not available
        high: parseFloat(trade[7]) || parseFloat(trade[2]) || 0,
        low: parseFloat(trade[6]) || parseFloat(trade[2]) || 0,
      };

      // Debug: Log first valid tick
      if (!this.firstValidTickLogged) {
        console.log(`✅ [DEBUG] First parsed tick:`, tick);
        this.firstValidTickLogged = true;
      }

      return [tick];
    } catch (error) {
      console.error("Error parsing trade array:", error);
      return [];
    }
  }

  /**
   * Normalize tick data to standard format
   */
  normalizeTick(tick) {
    // Try multiple field name variations
    const symbol =
      tick.symbol || tick.Symbol || tick.sym || tick.SYM || tick.tradingSymbol;
    const ltp = parseFloat(
      tick.ltp ||
        tick.LTP ||
        tick.lastPrice ||
        tick.last_price ||
        tick.close ||
        tick.Close ||
        0
    );
    const volume = parseInt(
      tick.volume || tick.Volume || tick.vol || tick.VOL || 0
    );
    const timestamp =
      tick.timestamp ||
      tick.Timestamp ||
      tick.time ||
      tick.Time ||
      new Date().toISOString();

    return {
      symbol: symbol,
      ltp: ltp,
      volume: volume,
      timestamp: timestamp,
      open: parseFloat(tick.open || tick.Open || tick.o || ltp),
      high: parseFloat(tick.high || tick.High || tick.h || ltp),
      low: parseFloat(tick.low || tick.Low || tick.l || ltp),
    };
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
    this.firstCandleLogged = false;
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

      // Debug: Log first candle creation
      if (!this.firstCandleLogged) {
        console.log(`🕯️ [DEBUG] First candle created for ${this.symbol}:`, {
          time: candleTime.toTimeString().slice(0, 5),
          price: tick.ltp,
        });
        this.firstCandleLogged = true;
      }

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
  constructor() {
    this.analysisLogCount = {};
    this.insufficientDataWarned = false;
  }

  calculateEMA(prices, period = 20) {
    if (prices.length === 0) return null;

    // Adaptive EMA: Use available data if less than required period
    const actualPeriod = CONFIG.USE_ADAPTIVE_EMA
      ? Math.min(period, prices.length)
      : period;

    if (prices.length < actualPeriod) {
      console.log(
        `⚠️ [DEBUG] Not enough prices for EMA${period}: ${prices.length} candles (using EMA${actualPeriod})`
      );
      return null;
    }

    const multiplier = 2 / (actualPeriod + 1);
    let ema =
      prices.slice(0, actualPeriod).reduce((sum, price) => sum + price, 0) /
      actualPeriod;

    for (let i = actualPeriod; i < prices.length; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier);
    }

    return ema;
  }

  calculateRSI(prices, period = 14) {
    if (prices.length < 2) return null;

    // Adaptive RSI: Use available data if less than required period
    const actualPeriod = CONFIG.USE_ADAPTIVE_EMA
      ? Math.min(period, Math.max(5, prices.length - 1))
      : period;

    if (prices.length < actualPeriod + 1) return null;

    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    const recentChanges = changes.slice(-actualPeriod);
    const gains = recentChanges.map((change) => (change > 0 ? change : 0));
    const losses = recentChanges.map((change) =>
      change < 0 ? Math.abs(change) : 0
    );

    const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / actualPeriod;
    const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / actualPeriod;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    return rsi;
  }

  /**
   * Analyze stock with real-time + historical data
   */
  analyzeStock(symbol, historicalCandles, currentCandle, dailyCandles) {
    // Relaxed requirement: Only need current candle and some historical data
    if (
      !currentCandle ||
      historicalCandles.length < CONFIG.MIN_CANDLES_FOR_ANALYSIS
    ) {
      if (!this.insufficientDataWarned) {
        console.log(`⚠️ [DEBUG] ${symbol} - Insufficient data:`, {
          hasCurrentCandle: !!currentCandle,
          historicalCandles: historicalCandles?.length || 0,
          minRequired: CONFIG.MIN_CANDLES_FOR_ANALYSIS,
        });
        this.insufficientDataWarned = true;
      }
      return null;
    }

    // Merge historical + current candle
    const allCandles = [...historicalCandles, currentCandle];
    const currentPrice = parseFloat(currentCandle.close);
    const openPrice = parseFloat(currentCandle.open);

    // 1. NIFTY 250 member (assumed true)
    const nifty250Member = true;

    // 2. Trading above Daily 20 EMA (OPTIONAL - skip if no daily data)
    let dailyEMA20 = null;
    let aboveDailyEMA20 = true; // Assume true if no daily data

    if (dailyCandles && dailyCandles.length >= CONFIG.EMA_PERIOD) {
      const dailyPrices = dailyCandles.map((c) => parseFloat(c.close));
      dailyEMA20 = this.calculateEMA(dailyPrices, CONFIG.EMA_PERIOD);
      aboveDailyEMA20 = dailyEMA20 ? currentPrice > dailyEMA20 : true;
    } else {
      console.log(
        `ℹ️ [DEBUG] ${symbol} - Skipping daily EMA (insufficient daily data: ${
          dailyCandles?.length || 0
        } candles)`
      );
    }

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

    // Debug: Log analysis for first symbol periodically
    if (!this.analysisLogCount) this.analysisLogCount = {};
    if (!this.analysisLogCount[symbol]) this.analysisLogCount[symbol] = 0;
    this.analysisLogCount[symbol]++;

    // Log every 100th analysis or when criteria >= 4
    const shouldLog = this.analysisLogCount[symbol] % 100 === 1;

    if (shouldLog) {
      console.log(`📊 [DEBUG] Analysis for ${symbol}:`, {
        currentPrice: currentPrice.toFixed(2),
        historicalCandles: historicalCandles.length,
        allCandles: allCandles.length,
        dailyEMA20: dailyEMA20?.toFixed(2),
        fiveMinEMA20: fiveMinEMA20?.toFixed(2),
        rsi: rsi?.toFixed(2),
        criteria: {
          "1_nifty250": nifty250Member,
          "2_aboveDailyEMA": aboveDailyEMA20,
          "3_above5minEMA": above5minEMA20,
          "4_volume": volumeCondition,
          "5_priceUp": openPriceCondition,
          "6_rsiRange": rsiInRange,
        },
      });
    }

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

    // Debug: Log when criteria >= 4
    if (criteriaMet >= 4) {
      console.log(`🎯 [DEBUG] High criteria for ${symbol}:`, {
        criteriaMet,
        probability: (probability * 100).toFixed(0) + "%",
        signalType,
        currentPrice: currentPrice.toFixed(2),
      });
    }

    const targetPrice =
      predictedDirection === "UP" ? currentPrice * 1.02 : currentPrice * 0.98;

    const stopLoss =
      predictedDirection === "UP" ? currentPrice * 0.99 : currentPrice * 1.01;

    // Calculate volume ratio from daily candles (not 5-min candles)
    const volumeRatio = this.calculateVolumeRatio(dailyCandles);

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

  /**
   * Calculate volume ratio: Current day volume / Average of previous days
   * Now works with pre-aggregated daily candles
   */
  calculateVolumeRatio(dailyCandles) {
    try {
      if (!dailyCandles || dailyCandles.length < 2) return null;

      // Daily candles already have aggregated volume per day
      const volumes = dailyCandles.map((c) => parseInt(c.volume || 0));

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
    this.tickCountLogged = false;
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
        this.db.getHistoricalData(symbol, CONFIG.EMA_PERIOD + 5), // Fetch 25 candles for EMA20
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

    // Debug: Log tick count for first symbol
    if (!this.tickCountLogged && count === 1) {
      console.log(`📈 [DEBUG] First tick for ${symbol}, count: ${count}`);
      this.tickCountLogged = true;
    }

    // Recalculate only if:
    // 1. Significant price change (> 0.1%)
    // 2. Every 100 ticks
    const shouldRecalculate =
      count % CONFIG.TICK_AGGREGATION_THRESHOLD === 0 ||
      this.hasSignificantPriceChange(symbol, tick.ltp);

    if (shouldRecalculate) {
      if (count % CONFIG.TICK_AGGREGATION_THRESHOLD === 0) {
        console.log(`🔄 [DEBUG] Analyzing ${symbol} at tick ${count}`);
      }
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

    if (!historical || !daily || !aggregator) {
      console.log(`⚠️ [DEBUG] Missing data for ${symbol}:`, {
        hasHistorical: !!historical,
        hasDaily: !!daily,
        hasAggregator: !!aggregator,
      });
      return;
    }

    const currentCandle = aggregator.getCurrentCandle();
    if (!currentCandle) {
      console.log(`⚠️ [DEBUG] No current candle for ${symbol}`);
      return;
    }

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
        console.log(`💾 [DEBUG] Saving signal for ${symbol}...`);
        const saved = await this.db.saveBreakoutSignal(signal);

        if (saved) {
          this.lastSignalTime.set(symbol, now);
          console.log(
            `🎯 SIGNAL SAVED: ${symbol} - ${signal.signal_type} (${(
              signal.probability * 100
            ).toFixed(0)}% confidence) @ ₹${signal.current_price}`
          );
        } else {
          console.log(`❌ [DEBUG] Failed to save signal for ${symbol}`);
        }
      } else {
        console.log(
          `⏭️ [DEBUG] Skipping duplicate signal for ${symbol} (last signal was ${Math.round(
            (now - lastSignal) / 1000
          )}s ago)`
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
    console.log(
      `📊 Monitoring ${this.symbols.length} Nifty 50 symbols for tick data...`
    );

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

    // Monitor tick data reception every 5 minutes
    setInterval(() => {
      const symbolsWithTicks = [];
      const symbolsWithoutTicks = [];

      this.symbols.forEach((symbolData) => {
        const count = this.tickCount.get(symbolData.symbol) || 0;
        if (count > 0) {
          symbolsWithTicks.push(`${symbolData.symbol}(${count})`);
        } else {
          symbolsWithoutTicks.push(symbolData.symbol);
        }
      });

      console.log(
        `\n📊 TICK DATA STATUS (${new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
        })}):`
      );
      console.log(`   ✅ Receiving ticks: ${symbolsWithTicks.length} symbols`);
      console.log(`   ❌ No ticks yet: ${symbolsWithoutTicks.length} symbols`);

      if (symbolsWithTicks.length > 0) {
        console.log(
          `   Top 10 active: ${symbolsWithTicks.slice(0, 10).join(", ")}`
        );
      }

      if (symbolsWithoutTicks.length > 0 && symbolsWithoutTicks.length <= 10) {
        console.log(`   Missing ticks: ${symbolsWithoutTicks.join(", ")}`);
      }
    }, 5 * 60 * 1000); // Every 5 minutes
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
