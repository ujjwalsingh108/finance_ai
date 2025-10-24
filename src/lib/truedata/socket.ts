import WebSocket from "ws";
import { oneMinuteAggregator, type TickData } from "./aggregator";

export class TrueDataSocketClient {
  private ws: WebSocket | null = null;
  private handlers: { [key: string]: Array<(data: any) => void> } = {};
  private tokenToSymbolMap: Map<string, string> = new Map();

  constructor(
    private userId: string,
    private password: string,
    private port: number = 8082,
    private symbols: string[] = []
  ) {}

  connect() {
    const url = `wss://push.truedata.in:${this.port}?user=${this.userId}&password=${this.password}`;
    console.log("Connecting to:", url);

    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      console.log("WebSocket connected to TrueData");

      if (this.symbols.length > 0) {
        const message = {
          method: "addsymbol",
          symbols: this.symbols,
          bars: "1min", // Request 1-minute bar data instead of ticks
        };

        console.log("Sending:", JSON.stringify(message));
        this.ws?.send(JSON.stringify(message));
      }

      this.emit("connected", { success: true });
    });

    this.ws.on("message", (data: Buffer) => {
      const message = data.toString();
      console.log("Received:", message);

      try {
        const parsed = JSON.parse(message);

        // Handle different message types
        if (parsed.success === true && parsed.symbollist) {
          // Initial symbol data with full OHLCV info
          parsed.symbollist.forEach((symbolData: any[]) => {
            const tickData = this.parseSymbolData(symbolData);
            if (tickData) {
              // Store token to symbol mapping for bid/ask updates
              this.tokenToSymbolMap.set(tickData.tokenId, tickData.symbol);
              // Send to aggregator for 1-minute bar creation
              this.sendToAggregator(tickData);
              this.emit("tick", tickData);
            }
          });
        } else if (parsed.bars) {
          // 1-minute bar data
          parsed.bars.forEach((barData: any[]) => {
            const oneMinuteData = this.parseBarData(barData);
            if (oneMinuteData) {
              this.emit("bar", oneMinuteData);
            }
          });
        } else if (parsed.bidask) {
          // Bid/Ask updates - map token back to symbol
          const bidAskData = this.parseBidAskData(parsed.bidask);
          if (bidAskData) {
            // Send to aggregator for 1-minute bar updates
            this.sendToAggregator(bidAskData);
            this.emit("tick", bidAskData);
          }
        } else if (message.startsWith('["bar"')) {
          // Individual bar data
          if (parsed[0] === "bar" && Array.isArray(parsed[1])) {
            const barData = this.parseBarData(parsed[1]);
            if (barData) {
              this.emit("bar", barData);
            }
          }
        } else if (message.startsWith('["trade"')) {
          // Trade data (if any)
          if (parsed[0] === "trade" && Array.isArray(parsed[1])) {
            const tickData = this.parseTickData(parsed[1]);
            if (tickData) {
              this.emit("tick", tickData);
            }
          }
        } else if (parsed.success === true && parsed.message === "HeartBeat") {
          // Heartbeat - just log, don't emit
          console.log("Heartbeat received");
        } else if (parsed.success === false) {
          // Error messages
          this.emit("error", parsed);
        }
      } catch (error) {
        console.error("Parse error:", error);
      }
    });

    this.ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      this.emit("error", error);
    });

    this.ws.on("close", () => {
      console.log("WebSocket closed");
      this.ws = null;
      this.emit("disconnected", {});
    });
  }

  private parseSymbolData(data: any[]) {
    // Format: [symbol, tokenId, timestamp, ltp, ltq, atp, volume, open, high, low, prevClose, oi, prevOi, turnover, bid, bidQty, ask, askQty]
    const [
      symbol,
      tokenId,
      timestamp,
      ltp,
      ltq,
      atp,
      volume,
      open,
      high,
      low,
      prevClose,
      oi,
      prevOi,
      turnover,
      bid,
      bidQty,
      ask,
      askQty,
    ] = data;

    return {
      symbol: symbol,
      tokenId: tokenId,
      timestamp: timestamp || new Date().toISOString(),
      ltp: parseFloat(ltp) || 0,
      lastTradedQuantity: parseInt(ltq) || 0,
      avgTradedPrice: parseFloat(atp) || 0,
      volume: parseInt(volume) || 0,
      open: parseFloat(open) || 0,
      high: parseFloat(high) || 0,
      low: parseFloat(low) || 0,
      close: parseFloat(prevClose) || 0,
      openInterest: parseInt(oi) || 0,
      prevOpenInterest: parseInt(prevOi) || 0,
      turnover: parseFloat(turnover) || 0,
      bestBid: parseFloat(bid) || 0,
      bestBidQty: parseInt(bidQty) || 0,
      bestAsk: parseFloat(ask) || 0,
      bestAskQty: parseInt(askQty) || 0,
      dataType: "full",
    };
  }

  private parseBidAskData(data: any[]) {
    // Format: [tokenId, timestamp, bid, bidQty, ask, askQty]
    const [tokenId, timestamp, bid, bidQty, ask, askQty] = data;

    // Map tokenId back to symbol name
    const symbol = this.tokenToSymbolMap.get(tokenId) || tokenId;

    return {
      symbol: symbol,
      tokenId: tokenId,
      timestamp: timestamp || new Date().toISOString(),
      bestBid: parseFloat(bid) || 0,
      bestBidQty: parseInt(bidQty) || 0,
      bestAsk: parseFloat(ask) || 0,
      bestAskQty: parseInt(askQty) || 0,
      dataType: "bidask",
    };
  }

  private parseBarData(data: any[]) {
    // 1-minute bar format: [Symbol ID, timestamp, open, high, low, close, volume, oi]
    const [symbolId, timestamp, open, high, low, close, volume, oi] = data;

    // Map tokenId back to symbol name if it's a token, otherwise use as-is
    const symbol = this.tokenToSymbolMap.get(symbolId) || symbolId;

    return {
      symbol: symbol,
      tokenId: symbolId,
      timestamp: timestamp || new Date().toISOString(),
      open: parseFloat(open) || 0,
      high: parseFloat(high) || 0,
      low: parseFloat(low) || 0,
      close: parseFloat(close) || 0,
      ltp: parseFloat(close) || 0, // Use close as LTP for bars
      volume: parseInt(volume) || 0,
      openInterest: parseInt(oi) || 0,
      dataType: "1min_bar",
    };
  }

  private parseTickData(data: string[]) {
    const [tokenId, timestamp, ltp, ltq, atp, ttq, open, high, low, prevClose] =
      data;

    return {
      symbol: tokenId,
      timestamp: timestamp || new Date().toISOString(),
      ltp: parseFloat(ltp) || 0,
      lastTradedQuantity: parseInt(ltq) || 0,
      avgTradedPrice: parseFloat(atp) || 0,
      volume: parseInt(ttq) || 0,
      open: parseFloat(open) || 0,
      high: parseFloat(high) || 0,
      low: parseFloat(low) || 0,
      close: parseFloat(prevClose) || 0,
      dataType: "trade",
    };
  }

  // Send tick data to 1-minute aggregator
  private sendToAggregator(tickData: any): void {
    // Only aggregate if ltp and timestamp are present
    if (typeof tickData.ltp === "number" && tickData.timestamp) {
      try {
        const aggregatorTick: TickData = {
          symbol: tickData.symbol,
          timestamp: tickData.timestamp,
          ltp: tickData.ltp,
          volume: tickData.volume || 0,
          high: tickData.high,
          low: tickData.low,
          open: tickData.open,
        };
        oneMinuteAggregator.processTick(aggregatorTick);
      } catch (error) {
        console.error("Error sending tick to aggregator:", error);
      }
    } else {
      // Optionally log or ignore bid/ask-only updates
      // console.log("Skipping aggregation for non-tick/bar data:", tickData);
    }
  }

  on(event: string, handler: (data: any) => void) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }

  private emit(event: string, data: any) {
    if (this.handlers[event]) {
      this.handlers[event].forEach((handler) => handler(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.handlers = {};
    this.tokenToSymbolMap.clear();
  }
}
