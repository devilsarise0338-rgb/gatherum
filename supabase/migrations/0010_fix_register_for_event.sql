-- 0010_fix_register_for_event.sql
-- Prevent registrations after event has ended or registration deadline has passed.
-- Also count 'attended' status in capacity check (attended students still occupy a seat).

CREATE OR REPLACE FUNCTION register_for_event(p_event_id uuid)
RETURNS registration_status_enum AS $$
DECLARE
  v_capacity int;
  v_registered_count int;
  v_status registration_status_enum;
  v_user_id uuid := (select auth.uid());
  v_end_time timestamptz;
  v_start_time timestamptz;
  v_deadline timestamptz;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT capacity, end_time, start_time, registration_deadline 
  INTO v_capacity, v_end_time, v_start_time, v_deadline 
  FROM events WHERE id = p_event_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event not found'; END IF;

  -- Check if event has ended (use end_time if available, otherwise start_time)
  IF COALESCE(v_end_time, v_start_time) < now() THEN
    RAISE EXCEPTION 'This event has already ended.';
  END IF;

  -- Check if registration deadline has passed
  IF v_deadline IS NOT NULL AND v_deadline < now() THEN
    RAISE EXCEPTION 'Registration deadline has passed.';
  END IF;

  -- Count both 'registered' and 'attended' students as occupying capacity
  SELECT count(*) INTO v_registered_count 
  FROM registrations 
  WHERE event_id = p_event_id AND status IN ('registered', 'attended');

  IF v_registered_count < v_capacity THEN
    v_status := 'registered';
  ELSE
    v_status := 'waitlisted';
  END IF;

  INSERT INTO registrations (event_id, user_id, status, created_at, attended) 
  VALUES (p_event_id, v_user_id, v_status, now(), false)
  ON CONFLICT (event_id, user_id) 
  DO UPDATE SET 
    status = EXCLUDED.status,
    created_at = EXCLUDED.created_at,
    attended = EXCLUDED.attended;
  
  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES (v_user_id, 'register_for_event', 'registrations', p_event_id, jsonb_build_object('status', v_status));

  RETURN v_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
