// Breakout Signal Interface
export type BreakoutSignal = {
  id: number;
  symbol: string;
  signal_type: "BULLISH_BREAKOUT" | "BEARISH_BREAKDOWN" | "NEUTRAL";
  probability: number;
  criteria_met_count: number;
  current_price: number;
  daily_ema20: number;
  fivemin_ema20: number;
  rsi_value: number;
  volume_ratio: number;
  predicted_direction: "UP" | "DOWN" | "SIDEWAYS";
  target_price: number;
  stop_loss: number;
  confidence_score: number;
  created_at: string;
  market_session: string;
};
