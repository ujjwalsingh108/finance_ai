/**
 * Shared WebSocket Scanner
 * Single WebSocket connection for both BULLISH and BEARISH signals
 * Monitors NIFTY 50 stocks and analyzes for both patterns simultaneously
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const WebSocket = require("ws");

// =================================================================
// 🔧 CONFIGURATION
// =================================================================

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
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  TRUEDATA_USER: process.env.TRUEDATA_USER,
  TRUEDATA_PASSWORD: process.env.TRUEDATA_PASSWORD,
  TRUEDATA_WS_PORT: process.env.TRUEDATA_WS_PORT || "8086",
  TRUEDATA_WS_URL: process.env.TRUEDATA_WS_URL || "wss://push.truedata.in",

  TOP_N_STOCKS: 50,
  CANDLE_INTERVAL_MS: 5 * 60 * 1000,
  MIN_CONFIDENCE_TO_SAVE: 0.6,
  MIN_CRITERIA_MET: 4,

  MARKET_OPEN_HOUR: 9,
  MARKET_OPEN_MINUTE: 15,
  MARKET_CLOSE_HOUR: 15,
  MARKET_CLOSE_MINUTE: 30,

  EMA_PERIOD: 20,
  RSI_PERIOD: 14,
  MIN_CANDLES_FOR_ANALYSIS: 15,
  USE_ADAPTIVE_EMA: true,

  TICK_AGGREGATION_THRESHOLD: 100,
  PRICE_CHANGE_THRESHOLD: 0.001,
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

  async getNifty50Symbols() {
    try {
      const { data, error } = await this.supabase
        .from("nse_equity_symbols")
        .select("symbol, instrument_token, exchange, type")
        .eq("exchange", "NSE")
        .eq("type", "stock")
        .in("symbol", NIFTY_50_SYMBOLS)
        .order("symbol", { ascending: true });

      if (error) throw error;
      console.log(`✅ Loaded ${data.length} Nifty 50 symbols`);
      return data;
    } catch (error) {
      console.error("❌ Error loading symbols:", error);
      throw error;
    }
  }

  async getHistoricalData(symbol, candlesNeeded = 25) {
    try {
      const { data, error } = await this.supabase
        .from("historical_prices")
        .select("*")
        .eq("symbol", symbol)
        .gte("time", "09:15")
        .lte("time", "15:30")
        .order("date", { ascending: false })
        .order("time", { ascending: false })
        .limit(candlesNeeded);

      if (error) throw error;
      return (data || []).reverse();
    } catch (error) {
      console.error(`❌ Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  async getDailyCandles(symbol, days = 30) {
    try {
      const daysToFetch = days + 10;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysToFetch);

      const { data, error } = await this.supabase
        .from("historical_prices")
        .select("date, time, open, high, low, close, volume")
        .eq("symbol", symbol)
        .eq("time", "15:30")
        .gte("date", startDate.toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(days);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`❌ Error fetching daily candles for ${symbol}:`, error);
      return [];
    }
  }

  async saveBullishSignal(signal) {
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
            created_by: "shared_websocket_scanner",
            is_public: true,
          },
        ])
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(
        `❌ Error saving bullish signal for ${signal.symbol}:`,
        error
      );
      return null;
    }
  }

  async saveBearishSignal(signal) {
    try {
      const { data, error } = await this.supabase
        .from("intraday_bearish_signals")
        .insert([
          {
            symbol: signal.symbol,
            signal_type: signal.signal_type,
            probability: signal.probability,
            criteria_met: signal.criteria_met,
            current_price: signal.current_price,
            opening_price: signal.opening_price,
            daily_ema20: signal.daily_ema20,
            fivemin_ema20: signal.fivemin_ema20,
            rsi_value: signal.rsi_value,
            volume_ratio: signal.volume_ratio,
            target_price: signal.target_price,
            stop_loss: signal.stop_loss,
            confidence: signal.confidence,
            created_by: "shared_websocket_scanner",
          },
        ])
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(
        `❌ Error saving bearish signal for ${signal.symbol}:`,
        error
      );
      return null;
    }
  }
}

// =================================================================
// 📡 SHARED WEBSOCKET MANAGER
// =================================================================

class SharedWebSocketManager {
  constructor(symbols) {
    this.symbols = symbols;
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.tickHandlers = new Map();
    this.tokenToSymbol = new Map();

    symbols.forEach((s) => {
      if (s.instrument_token) {
        this.tokenToSymbol.set(s.instrument_token.toString(), s.symbol);
      }
    });

    console.log(`📊 Token mapping created: ${this.tokenToSymbol.size} tokens`);
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        const url = `${CONFIG.TRUEDATA_WS_URL}:${CONFIG.TRUEDATA_WS_PORT}?user=${CONFIG.TRUEDATA_USER}&password=${CONFIG.TRUEDATA_PASSWORD}`;
        console.log(
          `📡 Connecting to TrueData WebSocket: ${CONFIG.TRUEDATA_WS_URL}:${CONFIG.TRUEDATA_WS_PORT}`
        );

        this.ws = new WebSocket(url);

        this.ws.on("open", () => {
          console.log("✅ WebSocket connected to TrueData");
          this.isConnected = true;
          this.reconnectAttempts = 0;

          const symbolList = this.symbols.map((s) => s.symbol);
          this.subscribe(symbolList);

          resolve();
        });

        this.ws.on("message", (data) => this.handleMessage(data));

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

  subscribe(symbols) {
    if (!this.isConnected) {
      console.error("❌ Cannot subscribe: WebSocket not connected");
      return;
    }

    const subscribeMessage = {
      method: "addsymbol",
      symbols: symbols,
      bars: "tick",
    };

    console.log(`📡 Subscribing to ${symbols.length} symbols...`);
    this.ws.send(JSON.stringify(subscribeMessage));
  }

  handleMessage(data) {
    try {
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

  parseTickData(data) {
    try {
      const rawString = data.toString();
      const parsed = JSON.parse(rawString);

      if (parsed.trade && Array.isArray(parsed.trade)) {
        return this.parseTradeArray(parsed.trade);
      }

      if (parsed.bidask) return [];
      if (parsed.success && parsed.message === "HeartBeat") return [];

      if (Array.isArray(parsed)) {
        return parsed.flatMap((trade) => this.parseTradeArray(trade));
      }

      if (parsed.symbol || parsed.Symbol || parsed.sym) {
        return [this.normalizeTick(parsed)];
      }

      if (parsed.data && Array.isArray(parsed.data)) {
        return parsed.data.flatMap((trade) => this.parseTradeArray(trade));
      }

      return [];
    } catch (error) {
      return [];
    }
  }

  parseTradeArray(trade) {
    try {
      if (!Array.isArray(trade) || trade.length < 8) return [];

      const token = trade[0].toString();
      const symbol = this.tokenToSymbol.get(token);

      if (!symbol) return [];

      const tick = {
        symbol: symbol,
        ltp: parseFloat(trade[2]) || 0,
        volume: parseInt(trade[3]) || 0,
        timestamp: trade[1] || new Date().toISOString(),
        open: parseFloat(trade[2]) || 0,
        high: parseFloat(trade[7]) || parseFloat(trade[2]) || 0,
        low: parseFloat(trade[6]) || parseFloat(trade[2]) || 0,
      };

      return [tick];
    } catch (error) {
      return [];
    }
  }

  normalizeTick(tick) {
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

  onTick(symbol, handler) {
    this.tickHandlers.set(symbol, handler);
  }

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
        console.error("Reconnection failed:", error);
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

  processTick(tick) {
    const tickTime = new Date(tick.timestamp);
    const candleTime = this.getCandleStartTime(tickTime);

    if (
      !this.currentCandle ||
      this.candleStartTime.getTime() !== candleTime.getTime()
    ) {
      const completedCandle = this.currentCandle;

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

    this.currentCandle.high = Math.max(this.currentCandle.high, tick.ltp);
    this.currentCandle.low = Math.min(this.currentCandle.low, tick.ltp);
    this.currentCandle.close = tick.ltp;
    this.currentCandle.volume = tick.volume || this.currentCandle.volume;

    this.ticks.push(tick);

    return { newCandle: false, currentCandle: this.currentCandle };
  }

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
// 🧮 TECHNICAL ANALYSIS ENGINE
// =================================================================

class TechnicalAnalyzer {
  calculateEMA(prices, period = 20) {
    if (prices.length === 0) return null;

    const actualPeriod = CONFIG.USE_ADAPTIVE_EMA
      ? Math.min(period, prices.length)
      : period;
    if (prices.length < actualPeriod) return null;

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

  calculateATR(dailyCandles) {
    if (!dailyCandles || dailyCandles.length < 14) return null;

    const recentCandles = dailyCandles.slice(-14);
    const atrSum = recentCandles.reduce((sum, candle) => {
      return sum + (parseFloat(candle.high) - parseFloat(candle.low));
    }, 0);

    return atrSum / 14;
  }

  checkVolumeCondition(candles) {
    try {
      const dailyVolumes = {};

      candles.forEach((candle) => {
        if (!dailyVolumes[candle.date]) {
          dailyVolumes[candle.date] = 0;
        }
        dailyVolumes[candle.date] += parseInt(candle.volume || 0);
      });

      const volumes = Object.values(dailyVolumes);
      if (volumes.length < 4) return false; // Need at least 4 days (3 days avg + 1 previous day)

      // Get last 3 days (excluding previous day)
      const last3DaysVolumes = volumes.slice(-4, -1); // [-4, -3, -2]
      const previousDayVolume = volumes[volumes.length - 2]; // -2 index

      const avgLast3Days =
        last3DaysVolumes.reduce((sum, vol) => sum + vol, 0) / 3;

      // Average of last 3 days should be > previous day's volume
      return avgLast3Days > previousDayVolume;
    } catch (error) {
      return false;
    }
  }

  // Check volume condition using pre-aggregated daily candles
  checkVolumeConditionFromDaily(dailyCandles) {
    try {
      if (!dailyCandles || dailyCandles.length < 4) return false;

      const volumes = dailyCandles.map((c) => parseInt(c.volume || 0));

      // Get last 3 days volumes (excluding previous day)
      const last3DaysVolumes = volumes.slice(-4, -1); // [-4, -3, -2]
      const previousDayVolume = volumes[volumes.length - 2]; // -2 index

      const avgLast3Days =
        last3DaysVolumes.reduce((sum, vol) => sum + vol, 0) / 3;

      // Average of last 3 days should be > previous day's volume
      return avgLast3Days > previousDayVolume;
    } catch (error) {
      return false;
    }
  }

  calculateVolumeRatio(dailyCandles) {
    try {
      if (!dailyCandles || dailyCandles.length < 2) return null;

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

  // BULLISH Analysis
  analyzeBullish(symbol, historicalCandles, currentCandle, dailyCandles) {
    if (
      !currentCandle ||
      historicalCandles.length < CONFIG.MIN_CANDLES_FOR_ANALYSIS
    ) {
      return null;
    }

    const allCandles = [...historicalCandles, currentCandle];
    const currentPrice = parseFloat(currentCandle.close);
    const openPrice = parseFloat(currentCandle.open);

    const nifty50Member = true;

    let dailyEMA20 = null;
    let aboveDailyEMA20 = true;

    if (dailyCandles && dailyCandles.length >= CONFIG.EMA_PERIOD) {
      const dailyPrices = dailyCandles.map((c) => parseFloat(c.close));
      dailyEMA20 = this.calculateEMA(dailyPrices, CONFIG.EMA_PERIOD);
      aboveDailyEMA20 = dailyEMA20 ? currentPrice > dailyEMA20 : true;
    }

    const fiveMinPrices = allCandles.map((c) => parseFloat(c.close));
    const fiveMinEMA20 = this.calculateEMA(fiveMinPrices, CONFIG.EMA_PERIOD);
    const above5minEMA20 = fiveMinEMA20 ? currentPrice > fiveMinEMA20 : false;

    const volumeCondition = this.checkVolumeCondition(allCandles);
    const openPriceCondition = openPrice <= currentPrice;

    const rsi = this.calculateRSI(fiveMinPrices, CONFIG.RSI_PERIOD);
    const rsiInRange = rsi ? rsi > 50 && rsi < 80 : false;

    const criteriaResults = [
      nifty50Member,
      aboveDailyEMA20,
      above5minEMA20,
      volumeCondition,
      openPriceCondition,
      rsiInRange,
    ];

    const criteriaMet = criteriaResults.filter(Boolean).length;
    const probability = criteriaMet / 6;

    if (criteriaMet < 4) return null;

    let signalType, predictedDirection;

    if (criteriaMet >= 5) {
      signalType = "BULLISH_BREAKOUT";
      predictedDirection = "UP";
    } else {
      signalType = "NEUTRAL";
      predictedDirection = "SIDEWAYS";
    }

    const targetPrice =
      predictedDirection === "UP" ? currentPrice * 1.02 : currentPrice * 0.98;
    const stopLoss =
      predictedDirection === "UP" ? currentPrice * 0.99 : currentPrice * 1.01;
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
    };
  }

  // BEARISH Analysis
  analyzeBearish(symbol, historicalCandles, currentCandle, dailyCandles) {
    if (
      !currentCandle ||
      historicalCandles.length < CONFIG.MIN_CANDLES_FOR_ANALYSIS
    ) {
      return null;
    }

    const allCandles = [...historicalCandles, currentCandle];
    const currentPrice = parseFloat(currentCandle.close);
    const openPrice = parseFloat(currentCandle.open);

    const nifty50Member = true;

    // Daily EMA check - optional if not enough data, use adaptive EMA
    let dailyEMA20 = null;
    let belowDailyEMA20 = true; // Default to true if no daily data

    if (dailyCandles && dailyCandles.length > 0) {
      const dailyPrices = dailyCandles.map((c) => parseFloat(c.close));
      dailyEMA20 = this.calculateEMA(dailyPrices, CONFIG.EMA_PERIOD); // Uses adaptive EMA
      belowDailyEMA20 = dailyEMA20 ? currentPrice < dailyEMA20 : true;
    }

    const fiveMinPrices = allCandles.map((c) => parseFloat(c.close));
    const fiveMinEMA20 = this.calculateEMA(fiveMinPrices, CONFIG.EMA_PERIOD);
    const below5minEMA20 = fiveMinEMA20 ? currentPrice < fiveMinEMA20 : false;

    // Volume: Avg of last 3 days > previous day (use daily candles directly)
    const volumeCondition = this.checkVolumeConditionFromDaily(dailyCandles);

    // Opening price > Current price (gap down / selling pressure)
    const openPriceCondition = openPrice > currentPrice;

    const rsi = this.calculateRSI(fiveMinPrices, CONFIG.RSI_PERIOD);
    const rsiInRange = rsi ? rsi > 20 && rsi < 50 : false;

    const criteriaResults = [
      nifty50Member,
      belowDailyEMA20,
      below5minEMA20,
      volumeCondition,
      openPriceCondition,
      rsiInRange,
    ];

    const criteriaMet = criteriaResults.filter(Boolean).length;
    const probability = criteriaMet / 6;

    if (criteriaMet < 4) return null;

    const signalType = "BEARISH_INTRADAY";

    const atr = this.calculateATR(dailyCandles);
    const targetPrice = currentPrice - (atr || currentPrice * 0.02) * 1.5;
    const stopLoss = currentPrice + (atr || currentPrice * 0.02) * 0.75;

    const volumeRatio = this.calculateVolumeRatio(dailyCandles);

    return {
      symbol,
      signal_type: signalType,
      probability: parseFloat(probability.toFixed(2)),
      criteria_met: criteriaMet,
      current_price: parseFloat(currentPrice.toFixed(2)),
      opening_price: parseFloat(openPrice.toFixed(2)),
      daily_ema20: dailyEMA20 ? parseFloat(dailyEMA20.toFixed(2)) : null,
      fivemin_ema20: fiveMinEMA20 ? parseFloat(fiveMinEMA20.toFixed(2)) : null,
      rsi_value: rsi ? parseFloat(rsi.toFixed(2)) : null,
      volume_ratio: volumeRatio ? parseFloat(volumeRatio.toFixed(2)) : null,
      target_price: parseFloat(targetPrice.toFixed(2)),
      stop_loss: parseFloat(stopLoss.toFixed(2)),
      confidence: parseFloat(probability.toFixed(2)),
    };
  }
}

// =================================================================
// 🚀 SHARED DUAL SCANNER
// =================================================================

class SharedDualScanner {
  constructor() {
    this.db = new DatabaseClient();
    this.analyzer = new TechnicalAnalyzer();
    this.wsManager = null;
    this.symbols = [];
    this.candleAggregators = new Map();
    this.historicalData = new Map();
    this.dailyCandles = new Map();
    this.lastBullishSignalTime = new Map();
    this.lastBearishSignalTime = new Map();
    this.tickCount = new Map();
  }

  async initialize() {
    console.log("🚀 Initializing Shared Dual Scanner (Bullish + Bearish)...");
    console.log(`📊 Single WebSocket connection for both signal types`);

    try {
      this.symbols = await this.db.getNifty50Symbols();

      if (this.symbols.length === 0) {
        console.error("❌ No symbols loaded");
        return false;
      }

      await this.loadHistoricalData();

      this.wsManager = new SharedWebSocketManager(this.symbols);
      await this.wsManager.connect();

      this.setupTickHandlers();

      return true;
    } catch (error) {
      console.error("❌ Initialization failed:", error);
      return false;
    }
  }

  async loadHistoricalData() {
    const promises = this.symbols.map(async (symbolData) => {
      const symbol = symbolData.symbol;
      const historical = await this.db.getHistoricalData(symbol, 25);
      const daily = await this.db.getDailyCandles(symbol, 30);

      this.historicalData.set(symbol, historical);
      this.dailyCandles.set(symbol, daily);
      this.candleAggregators.set(symbol, new CandleAggregator(symbol));
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

    const result = aggregator.processTick(tick);

    if (result.newCandle && result.completedCandle) {
      const historical = this.historicalData.get(symbol);
      if (historical) {
        historical.push(result.completedCandle);
        if (historical.length > 25) historical.shift();
      }
    }

    const count = (this.tickCount.get(symbol) || 0) + 1;
    this.tickCount.set(symbol, count);

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

    // Analyze for BULLISH signals
    const bullishSignal = this.analyzer.analyzeBullish(
      symbol,
      historical,
      currentCandle,
      daily
    );
    if (
      bullishSignal &&
      bullishSignal.probability >= CONFIG.MIN_CONFIDENCE_TO_SAVE &&
      bullishSignal.criteria_met >= CONFIG.MIN_CRITERIA_MET
    ) {
      const lastSignalTime = this.lastBullishSignalTime.get(symbol);
      const now = Date.now();

      if (!lastSignalTime || now - lastSignalTime > 5 * 60 * 1000) {
        console.log(`\n🟢 BULLISH SIGNAL: ${symbol}`);
        console.log(`   Criteria: ${bullishSignal.criteria_met}/6`);
        console.log(
          `   Confidence: ${(bullishSignal.probability * 100).toFixed(0)}%`
        );
        console.log(`   Current Price: ₹${bullishSignal.current_price}`);

        const saved = await this.db.saveBullishSignal(bullishSignal);
        if (saved) {
          console.log(`   ✅ Bullish signal saved`);
          this.lastBullishSignalTime.set(symbol, now);
        }
      }
    }

    // Analyze for BEARISH signals
    const bearishSignal = this.analyzer.analyzeBearish(
      symbol,
      historical,
      currentCandle,
      daily
    );
    if (
      bearishSignal &&
      bearishSignal.probability >= CONFIG.MIN_CONFIDENCE_TO_SAVE &&
      bearishSignal.criteria_met >= CONFIG.MIN_CRITERIA_MET
    ) {
      const lastSignalTime = this.lastBearishSignalTime.get(symbol);
      const now = Date.now();

      if (!lastSignalTime || now - lastSignalTime > 5 * 60 * 1000) {
        console.log(`\n🔴 BEARISH SIGNAL: ${symbol}`);
        console.log(`   Criteria: ${bearishSignal.criteria_met}/6`);
        console.log(
          `   Confidence: ${(bearishSignal.probability * 100).toFixed(0)}%`
        );
        console.log(`   Current Price: ₹${bearishSignal.current_price}`);

        const saved = await this.db.saveBearishSignal(bearishSignal);
        if (saved) {
          console.log(`   ✅ Bearish signal saved`);
          this.lastBearishSignalTime.set(symbol, now);
        }
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
    console.log("🚀 Starting shared dual scanner...");
    console.log(
      `📊 Monitoring ${this.symbols.length} symbols for BULLISH & BEARISH signals`
    );

    setInterval(() => {
      if (!this.isMarketOpen()) {
        console.log("⏸️  Market closed - scanner idle");
      }
    }, 60000);

    setInterval(() => {
      const totalTicks = Array.from(this.tickCount.values()).reduce(
        (sum, count) => sum + count,
        0
      );
      console.log(`📊 Total ticks received: ${totalTicks}`);
    }, 5 * 60 * 1000);
  }

  async shutdown() {
    console.log("🛑 Shutting down shared dual scanner...");
    if (this.wsManager) {
      this.wsManager.disconnect();
    }
  }
}

// =================================================================
// 🎬 MAIN EXECUTION
// =================================================================

(async () => {
  const scanner = new SharedDualScanner();

  try {
    const initialized = await scanner.initialize();

    if (!initialized) {
      console.error("❌ Initialization failed");
      process.exit(1);
    }

    await scanner.start();

    console.log("✅ Shared dual scanner is running!");
    console.log("   🟢 Bullish signals → breakout_signals");
    console.log("   🔴 Bearish signals → intraday_bearish_signals");
    console.log("   Press Ctrl+C to stop");

    process.on("SIGINT", async () => {
      await scanner.shutdown();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
})();
