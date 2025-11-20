// Breakout Signal Interface
export type BreakoutSignal = {
  id: number;
  symbol: string;
  signal_type: "BULLISH_BREAKOUT" | "BEARISH_BREAKDOWN" | "NEUTRAL";
  probability: number;
  criteria_met: number;
  current_price: number;
  daily_ema20: number;
  fivemin_ema20: number;
  rsi_value: number;
  volume_ratio: number;
  predicted_direction: "UP" | "DOWN" | "SIDEWAYS";
  target_price: number;
  stop_loss: number;
  confidence: number;
  created_at: string;
  user_id?: string;
  created_by?: string;
  is_public?: boolean;
};

// Intraday Bearish Signal Interface (Optimized Schema)
export type IntradayBearishSignal = {
  id: number;
  symbol: string;
  signal_type: "BEARISH_INTRADAY";
  probability: number;
  criteria_met: number; // Out of 6 criteria
  current_price: number;
  opening_price: number;
  daily_ema20: number;
  fivemin_ema20: number;
  rsi_value: number;
  volume_ratio: number; // avg_volume_3days / previous_day_volume
  target_price: number;
  stop_loss: number;
  confidence: number;
  created_at: string;
  created_by?: string;
};
