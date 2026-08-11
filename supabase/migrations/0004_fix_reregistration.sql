-- 0004_fix_reregistration.sql
-- Fix UNIQUE constraint error when users try to register again after cancelling

CREATE OR REPLACE FUNCTION register_for_event(p_event_id uuid)
RETURNS registration_status_enum AS $$
DECLARE
  v_capacity int;
  v_registered_count int;
  v_status registration_status_enum;
  v_user_id uuid := (select auth.uid());
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT capacity INTO v_capacity FROM events WHERE id = p_event_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event not found'; END IF;

  SELECT count(*) INTO v_registered_count FROM registrations WHERE event_id = p_event_id AND status = 'registered';

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
