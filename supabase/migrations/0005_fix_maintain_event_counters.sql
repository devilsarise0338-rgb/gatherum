-- 0005_fix_maintain_event_counters.sql
-- Fixes: counters not incrementing when re-registering from 'cancelled' status

CREATE OR REPLACE FUNCTION maintain_event_counters()
RETURNS trigger AS $$
DECLARE
  v_reg_delta int := 0;
  v_wait_delta int := 0;
  v_event_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_id := NEW.event_id;
    IF NEW.status = 'registered' THEN v_reg_delta := 1; END IF;
    IF NEW.status = 'waitlisted' THEN v_wait_delta := 1; END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    v_event_id := NEW.event_id;
    IF OLD.status = 'registered' AND NEW.status = 'cancelled' THEN v_reg_delta := -1; END IF;
    IF OLD.status = 'waitlisted' AND NEW.status = 'cancelled' THEN v_wait_delta := -1; END IF;
    IF OLD.status = 'waitlisted' AND NEW.status = 'registered' THEN 
      v_wait_delta := -1; v_reg_delta := 1; 
    END IF;
    IF OLD.status = 'cancelled' AND NEW.status = 'registered' THEN v_reg_delta := 1; END IF;
    IF OLD.status = 'cancelled' AND NEW.status = 'waitlisted' THEN v_wait_delta := 1; END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_event_id := OLD.event_id;
    IF OLD.status = 'registered' THEN v_reg_delta := -1; END IF;
    IF OLD.status = 'waitlisted' THEN v_wait_delta := -1; END IF;
  END IF;

  IF v_reg_delta != 0 OR v_wait_delta != 0 THEN
    UPDATE events
    SET registered_count = registered_count + v_reg_delta,
        waitlist_count = waitlist_count + v_wait_delta
    WHERE id = v_event_id;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Backfill Existing Counters to fix any corruption from previous missing states
UPDATE events e
SET 
  registered_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'registered'),
  waitlist_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'waitlisted');
