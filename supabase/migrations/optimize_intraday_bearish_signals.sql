-- Optimize intraday_bearish_signals table by removing unnecessary columns
-- This migration removes redundant columns and keeps only essential data

-- First, drop all existing policies that depend on columns we're removing
DROP POLICY IF EXISTS "Allow users to update own signals" ON public.intraday_bearish_signals;
DROP POLICY IF EXISTS "Allow users to delete own signals" ON public.intraday_bearish_signals;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.intraday_bearish_signals;
DROP POLICY IF EXISTS "Allow public read access" ON public.intraday_bearish_signals;

-- Remove unnecessary columns
ALTER TABLE public.intraday_bearish_signals 
  DROP COLUMN IF EXISTS avg_volume_3days,
  DROP COLUMN IF EXISTS previous_day_volume,
  DROP COLUMN IF EXISTS is_nifty250,
  DROP COLUMN IF EXISTS user_id CASCADE,
  DROP COLUMN IF EXISTS is_public CASCADE;

-- Update default for created_by
ALTER TABLE public.intraday_bearish_signals 
  ALTER COLUMN created_by SET DEFAULT 'intraday-bearish-scanner';

-- Recreate simplified RLS policies (public read access only)
-- Allow public read access for all signals
CREATE POLICY "Allow public read access" ON public.intraday_bearish_signals
    FOR SELECT
    USING (true);

-- Allow system/authenticated users to insert signals
CREATE POLICY "Allow system insert" ON public.intraday_bearish_signals
    FOR INSERT
    WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.intraday_bearish_signals IS 'Stores intraday bearish signals based on 6 technical criteria (optimized schema)';

-- Optimized indexes (drop old, create new)
DROP INDEX IF EXISTS idx_intraday_bearish_signals_nifty250;

-- Create composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_bearish_signals_lookup 
  ON public.intraday_bearish_signals(created_at DESC, probability DESC, criteria_met DESC)
  WHERE probability >= 0.6;

-- Summary of optimizations:
-- 1. Removed avg_volume_3days (can be calculated from volume_ratio * previous day volume if needed)
-- 2. Removed previous_day_volume (redundant - volume_ratio is sufficient)
-- 3. Removed is_nifty250 (implicit - all scanned stocks are from NIFTY)
-- 4. Removed user_id (not needed for system-generated signals)
-- 5. Removed is_public (all signals are public by default)
-- 6. Simplified RLS policies for public read and system insert only
-- 7. Created composite index for faster queries on recent high-probability signals
