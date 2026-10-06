-- 0024_registration_gates.sql
-- Why this exists (plain words): banned users and users who never finished
-- their profile could still register (the RPC never looked at profiles), and
-- organizers then saw "Unknown / N/A" rows. Registration now requires a
-- completed, non-banned profile. Cancelling stays allowed for everyone.
-- Layered on the live 0014 body (idempotency, capacity lock, deadline and
-- ended checks all kept). NOT applied live in this session (awaiting approval).

CREATE OR REPLACE FUNCTION register_for_event(p_event_id uuid)
RETURNS public.registration_status_enum AS $$
DECLARE
  v_capacity int;
  v_registered_count int;
  v_status public.registration_status_enum;
  v_user_id uuid := (select auth.uid());
  v_end_time timestamptz;
  v_start_time timestamptz;
  v_deadline timestamptz;
  v_existing_id uuid;
  v_existing_status public.registration_status_enum;
  v_reg_id uuid;
  v_is_banned boolean;
  v_profile_completed boolean;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  -- Gate: suspended or incomplete profiles cannot take up event seats.
  -- A missing profile row counts as incomplete (finish it in the app first).
  SELECT is_banned, profile_completed INTO v_is_banned, v_profile_completed
  FROM public.profiles WHERE id = v_user_id;
  IF NOT FOUND OR v_is_banned THEN
    RAISE EXCEPTION 'Your account is suspended.';
  END IF;
  IF NOT v_profile_completed THEN
    RAISE EXCEPTION 'Please complete your profile before registering.';
  END IF;

  -- Lock the caller's own row first. Active states are idempotent: return as-is.
  SELECT id, status INTO v_existing_id, v_existing_status
  FROM public.registrations
  WHERE event_id = p_event_id AND user_id = v_user_id
  FOR UPDATE;

  IF FOUND AND v_existing_status IN ('registered', 'attended', 'waitlisted') THEN
    RETURN v_existing_status;
  END IF;

  -- Lock the event row so concurrent first-timers serialize on capacity.
  SELECT capacity, end_time, start_time, registration_deadline
  INTO v_capacity, v_end_time, v_start_time, v_deadline
  FROM public.events WHERE id = p_event_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event not found'; END IF;

  IF COALESCE(v_end_time, v_start_time) < now() THEN
    RAISE EXCEPTION 'This event has already ended.';
  END IF;

  IF v_deadline IS NOT NULL AND v_deadline < now() THEN
    RAISE EXCEPTION 'Registration deadline has passed.';
  END IF;

  -- Seats are occupied by registered AND attended students.
  SELECT count(*) INTO v_registered_count
  FROM public.registrations
  WHERE event_id = p_event_id AND status IN ('registered', 'attended');

  IF v_registered_count < v_capacity THEN
    v_status := 'registered';
  ELSE
    v_status := 'waitlisted';
  END IF;

  -- Only reached for first-timers or re-registers from 'cancelled'.
  INSERT INTO public.registrations (event_id, user_id, status, created_at, attended)
  VALUES (p_event_id, v_user_id, v_status, now(), false)
  ON CONFLICT (event_id, user_id)
  DO UPDATE SET
    status = EXCLUDED.status,
    created_at = EXCLUDED.created_at,
    attended = EXCLUDED.attended
  RETURNING id INTO v_reg_id;

  INSERT INTO public.audit_log (actor_id, action, target_table, target_id, details)
  VALUES (v_user_id, 'register_for_event', 'registrations', v_reg_id, jsonb_build_object('status', v_status));

  RETURN v_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

REVOKE ALL ON FUNCTION register_for_event(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION register_for_event(uuid) TO authenticated;
COMMENT ON FUNCTION register_for_event(uuid) IS 'Gate: completed, non-banned profile required. Cancelling stays open to all.';
