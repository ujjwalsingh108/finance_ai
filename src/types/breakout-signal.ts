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
