declare module "truedata-nodejs" {
  interface TickData {
    symbol: string;
    lastTradedPrice: number;
    time: string;
  }

  interface TouchlineData {
    symbol: string;
    bestBidPrice: number;
    bestAskPrice: number;
    volumeTradedToday: number;
  }

  interface RTFeed {
    on(event: "tick", callback: (tick: TickData) => void): void;
    on(event: "touchline", callback: (touchline: TouchlineData) => void): void;
    on(event: "marketstatus", callback: (status: any) => void): void;
    on(event: "heartbeat", callback: (hb: any) => void): void;
  }

  export const rtFeed: RTFeed;

  export function rtConnect(
    username: string,
    password: string,
    symbols: string[],
    port: number,
    token1: number,
    token2: number
  ): void;
}
