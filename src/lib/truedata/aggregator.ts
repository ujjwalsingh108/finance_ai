import { createClient } from "@supabase/supabase-js";

export interface TickData {
  symbol: string;
  timestamp: string;
  ltp: number;
  volume: number;
  high?: number;
  low?: number;
  open?: number;
}

export interface OneMinuteBar {
  symbol: string;
  timestamp: string; // Rounded to minute
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  tradeCount: number;
  vwap: number;
}

export class OneMinuteAggregator {
  private bars = new Map<string, OneMinuteBar>(); // key: "symbol_minute"
  private timers = new Map<string, NodeJS.Timeout>(); // key: "symbol_minute"
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for server-side operations
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  constructor() {
    console.log("OneMinuteAggregator initialized");
  }

  // Process incoming tick data
  async processTick(tick: TickData): Promise<void> {
    if (!tick.symbol || !tick.ltp || !tick.timestamp) {
      console.warn("Invalid tick data:", tick);
      return;
    }

    // Round timestamp to the minute
    const tickTime = new Date(tick.timestamp);
    const minuteTime = new Date(tickTime);
    minuteTime.setSeconds(0, 0); // Round down to minute

    const minuteKey = `${tick.symbol}_${minuteTime.toISOString()}`;

    // Get or create 1-minute bar
    let bar = this.bars.get(minuteKey);

    if (!bar) {
      // Create new 1-minute bar
      bar = {
        symbol: tick.symbol,
        timestamp: minuteTime.toISOString(),
        open: tick.ltp,
        high: tick.high || tick.ltp,
        low: tick.low || tick.ltp,
        close: tick.ltp,
        volume: tick.volume || 0,
        tradeCount: 1,
        vwap: tick.ltp,
      };

      this.bars.set(minuteKey, bar);

      // Set timer to save and clean up after minute ends
      const timer = setTimeout(() => {
        this.saveAndCleanupBar(minuteKey);
      }, this.getMillisecondsUntilNextMinute(tickTime));

      this.timers.set(minuteKey, timer);

      console.log(
        `Created new 1-minute bar for ${
          tick.symbol
        } at ${minuteTime.toISOString()}`
      );
    } else {
      // Update existing bar
      bar.high = Math.max(bar.high, tick.high || tick.ltp);
      bar.low = Math.min(bar.low, tick.low || tick.ltp);
      bar.close = tick.ltp; // Always use latest price as close

      // Update volume and VWAP
      const newVolume = bar.volume + (tick.volume || 0);
      if (newVolume > 0) {
        bar.vwap =
          (bar.vwap * bar.volume + tick.ltp * (tick.volume || 0)) / newVolume;
      }
      bar.volume = newVolume;
      bar.tradeCount += 1;

      this.bars.set(minuteKey, bar);
    }
  }

  // Save bar to database and clean up memory
  private async saveAndCleanupBar(minuteKey: string): Promise<void> {
    const bar = this.bars.get(minuteKey);
    if (!bar) return;

    try {
      // Call the upsert function in Supabase
      const { error } = await this.supabase.rpc("upsert_nse_eq_1min_data", {
        p_symbol: bar.symbol,
        p_timestamp: bar.timestamp,
        p_open: bar.open,
        p_high: bar.high,
        p_low: bar.low,
        p_close: bar.close,
        p_volume: bar.volume,
        p_trade_count: bar.tradeCount,
        p_vwap: bar.vwap,
      });

      if (error) {
        console.error(`Error saving 1-minute bar for ${bar.symbol}:`, error);
      } else {
        console.log(
          `✅ Saved 1-minute bar: ${bar.symbol} ${bar.timestamp} OHLC(${bar.open}/${bar.high}/${bar.low}/${bar.close}) Vol:${bar.volume}`
        );
      }
    } catch (error) {
      console.error(`Failed to save 1-minute bar for ${bar.symbol}:`, error);
    }

    // Clean up
    this.bars.delete(minuteKey);
    const timer = this.timers.get(minuteKey);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(minuteKey);
    }
  }

  // Calculate milliseconds until next minute boundary
  private getMillisecondsUntilNextMinute(currentTime: Date): number {
    const nextMinute = new Date(currentTime);
    nextMinute.setMinutes(nextMinute.getMinutes() + 1);
    nextMinute.setSeconds(0, 0);
    return nextMinute.getTime() - currentTime.getTime();
  }

  // Force save all pending bars (useful for shutdown)
  async saveAllPendingBars(): Promise<void> {
    console.log(`Saving ${this.bars.size} pending bars...`);
    const promises = Array.from(this.bars.keys()).map((key) =>
      this.saveAndCleanupBar(key)
    );
    await Promise.all(promises);
  }

  // Get current bar status (for debugging)
  getBarStatus(): {
    symbol: string;
    minute: string;
    ohlc: string;
    volume: number;
  }[] {
    return Array.from(this.bars.values()).map((bar) => ({
      symbol: bar.symbol,
      minute: bar.timestamp,
      ohlc: `${bar.open}/${bar.high}/${bar.low}/${bar.close}`,
      volume: bar.volume,
    }));
  }

  // Clean up resources
  destroy(): void {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.bars.clear();
    console.log("OneMinuteAggregator destroyed");
  }
}

// Export singleton instance
export const oneMinuteAggregator = new OneMinuteAggregator();
