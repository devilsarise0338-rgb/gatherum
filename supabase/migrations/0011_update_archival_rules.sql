
-- Update the archival function to 1 hour instead of 24 hours
CREATE OR REPLACE FUNCTION archive_old_events()
RETURNS void AS $$
BEGIN
  UPDATE events 
  SET is_archived = true
  WHERE is_archived = false
    AND (
      (end_time IS NOT NULL AND end_time < now() - interval '1 hour')
      OR
      (end_time IS NULL AND start_time < now() - interval '1 hour')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

