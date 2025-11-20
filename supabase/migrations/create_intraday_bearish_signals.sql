-- Create intraday_bearish_signals table for bearish intraday equity strategy
-- This table stores signals for stocks that meet bearish intraday criteria

CREATE TABLE IF NOT EXISTS public.intraday_bearish_signals (
    id BIGSERIAL PRIMARY KEY,
    symbol TEXT NOT NULL,
    signal_type TEXT DEFAULT 'BEARISH_INTRADAY',
    probability NUMERIC(3,2) NOT NULL DEFAULT 0.0,
    criteria_met INTEGER NOT NULL DEFAULT 0, -- Out of 6 criteria
    current_price NUMERIC(10,2) NOT NULL,
    opening_price NUMERIC(10,2) NOT NULL,
    daily_ema20 NUMERIC(10,2),
    fivemin_ema20 NUMERIC(10,2),
    rsi_value NUMERIC(5,2),
    avg_volume_3days BIGINT,
    previous_day_volume BIGINT,
    volume_ratio NUMERIC(10,2), -- avg_volume_3days / previous_day_volume
    is_nifty250 BOOLEAN DEFAULT TRUE,
    target_price NUMERIC(10,2),
    stop_loss NUMERIC(10,2),
    confidence NUMERIC(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    created_by TEXT,
    is_public BOOLEAN DEFAULT TRUE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_intraday_bearish_signals_symbol ON public.intraday_bearish_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_intraday_bearish_signals_created_at ON public.intraday_bearish_signals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intraday_bearish_signals_probability ON public.intraday_bearish_signals(probability DESC);
CREATE INDEX IF NOT EXISTS idx_intraday_bearish_signals_nifty250 ON public.intraday_bearish_signals(is_nifty250);
CREATE INDEX IF NOT EXISTS idx_intraday_bearish_signals_criteria ON public.intraday_bearish_signals(criteria_met DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.intraday_bearish_signals ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON public.intraday_bearish_signals
    FOR SELECT
    USING (is_public = TRUE);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated insert" ON public.intraday_bearish_signals
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow users to update their own signals
CREATE POLICY "Allow users to update own signals" ON public.intraday_bearish_signals
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own signals
CREATE POLICY "Allow users to delete own signals" ON public.intraday_bearish_signals
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE public.intraday_bearish_signals IS 'Stores intraday bearish signals for NIFTY 250 stocks based on 6 technical criteria';

-- Add comments to important columns
COMMENT ON COLUMN public.intraday_bearish_signals.criteria_met IS 'Number of criteria met out of 6 total criteria';
COMMENT ON COLUMN public.intraday_bearish_signals.volume_ratio IS 'Ratio of average 3-day volume to previous day volume';
COMMENT ON COLUMN public.intraday_bearish_signals.is_nifty250 IS 'Whether the stock is part of NIFTY 250 index';
