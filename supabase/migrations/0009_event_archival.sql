-- Migration: 0009_event_archival.sql
-- Description: Add soft archival support and pg_cron job to auto-archive old events.

-- 1. Add is_archived column to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- 2. Create the archival function
CREATE OR REPLACE FUNCTION archive_old_events()
RETURNS void AS $$
BEGIN
  -- Mark events as archived if they ended > 24 hours ago.
  -- If end_time is null, fallback to start_time.
  UPDATE events 
  SET is_archived = true
  WHERE is_archived = false
    AND (
      (end_time IS NOT NULL AND end_time < now() - interval '24 hours')
      OR
      (end_time IS NULL AND start_time < now() - interval '24 hours')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Enable pg_cron (Supabase handles this, but it's good practice to ensure extension)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 4. Schedule the cron job to run hourly
-- It will check and archive any events that qualify.
SELECT cron.schedule(
  'auto-archive-events',
  '0 * * * *', -- Every hour at minute 0
  'SELECT archive_old_events()'
);
