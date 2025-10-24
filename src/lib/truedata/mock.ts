type EventCallback = (data: any) => void;

// Mock implementation for development
const mockRtFeed = {
  listeners: new Map<string, EventCallback[]>(),
  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  },
  emit(event: string, data: any) {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  },
};

const mockRtConnect = (
  username: string,
  password: string,
  symbols: string[],
  port: number,
  token1: number,
  token2: number
) => {
  console.log("Mock TrueData connected with:", { username, symbols, port });

  // Simulate ticks every few seconds
  setInterval(() => {
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    mockRtFeed.emit("tick", {
      symbol: randomSymbol,
      lastTradedPrice: Math.random() * 1000,
      time: new Date().toISOString(),
    });
  }, 2000);
};

export const rtConnect = mockRtConnect;
export const rtFeed = mockRtFeed;
