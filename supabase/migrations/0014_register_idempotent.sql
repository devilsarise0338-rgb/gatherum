-- 0014_register_idempotent.sql
-- Why this exists (plain words): re-registering while already registered (e.g.
-- double-click) recomputed a FRESH status and overwrote the row — flipping
-- registered->waitlisted, resetting attended, and rewriting created_at (which
-- also jumped the waitlist queue). Now an existing active registration is
-- returned untouched; only 'cancelled' rows (or first-timers) are processed.
-- Also fixes the audit row, which wrongly stored the EVENT id as target_id.

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
  v_existing_id uuid;
  v_existing_status registration_status_enum;
  v_reg_id uuid;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  -- Lock the caller's own row first. Active states are idempotent: return as-is.
  SELECT id, status INTO v_existing_id, v_existing_status
  FROM registrations
  WHERE event_id = p_event_id AND user_id = v_user_id
  FOR UPDATE;

  IF FOUND AND v_existing_status IN ('registered', 'attended', 'waitlisted') THEN
    RETURN v_existing_status;
  END IF;

  -- Lock the event row so concurrent first-timers serialize on capacity.
  SELECT capacity, end_time, start_time, registration_deadline
  INTO v_capacity, v_end_time, v_start_time, v_deadline
  FROM events WHERE id = p_event_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event not found'; END IF;

  IF COALESCE(v_end_time, v_start_time) < now() THEN
    RAISE EXCEPTION 'This event has already ended.';
  END IF;

  IF v_deadline IS NOT NULL AND v_deadline < now() THEN
    RAISE EXCEPTION 'Registration deadline has passed.';
  END IF;

  -- Seats are occupied by registered AND attended students.
  SELECT count(*) INTO v_registered_count
  FROM registrations
  WHERE event_id = p_event_id AND status IN ('registered', 'attended');

  IF v_registered_count < v_capacity THEN
    v_status := 'registered';
  ELSE
    v_status := 'waitlisted';
  END IF;

  -- Only reached for first-timers or re-registers from 'cancelled'.
  INSERT INTO registrations (event_id, user_id, status, created_at, attended)
  VALUES (p_event_id, v_user_id, v_status, now(), false)
  ON CONFLICT (event_id, user_id)
  DO UPDATE SET
    status = EXCLUDED.status,
    created_at = EXCLUDED.created_at,
    attended = EXCLUDED.attended
  RETURNING id INTO v_reg_id;

  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES (v_user_id, 'register_for_event', 'registrations', v_reg_id, jsonb_build_object('status', v_status));

  RETURN v_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION register_for_event(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION register_for_event(uuid) TO authenticated;
COMMENT ON FUNCTION register_for_event(uuid) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
