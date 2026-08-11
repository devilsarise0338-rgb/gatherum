-- 0003_fix_cancel_registration.sql
-- Fixes: cancelRegistration silently no-ops because no RLS UPDATE policy exists on registrations.
-- Adds a SECURITY DEFINER RPC consistent with register_for_event / check_in_by_ticket.

CREATE OR REPLACE FUNCTION cancel_registration(p_event_id uuid)
RETURNS void AS $$
DECLARE
  v_user_id uuid := (select auth.uid());
  v_reg_id uuid;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT id INTO v_reg_id FROM registrations
  WHERE event_id = p_event_id AND user_id = v_user_id AND status IN ('registered', 'waitlisted');

  IF NOT FOUND THEN RAISE EXCEPTION 'Active registration not found'; END IF;

  UPDATE registrations SET status = 'cancelled' WHERE id = v_reg_id;

  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES (v_user_id, 'cancel_registration', 'registrations', v_reg_id, '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION cancel_registration(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION cancel_registration(uuid) TO authenticated;
COMMENT ON FUNCTION cancel_registration(uuid) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';

-- Support Registration DELETE in waitlist promotion (for backward compatibility, even though we move to 'cancelled' status)
CREATE OR REPLACE FUNCTION promote_from_waitlist()
RETURNS trigger AS $$
DECLARE
  v_waitlisted_id uuid;
  v_event_id uuid;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'registered' AND NEW.status = 'cancelled' THEN
      v_event_id := OLD.event_id;
    ELSE
      RETURN NEW;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'registered' THEN
      v_event_id := OLD.event_id;
    ELSE
      RETURN OLD;
    END IF;
  END IF;

  SELECT id INTO v_waitlisted_id FROM registrations WHERE event_id = v_event_id AND status = 'waitlisted' ORDER BY created_at ASC LIMIT 1 FOR UPDATE;
  IF FOUND THEN
    UPDATE registrations SET status = 'registered' WHERE id = v_waitlisted_id;
    INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
    VALUES ((select auth.uid()), 'promote_from_waitlist', 'registrations', v_waitlisted_id,
      jsonb_build_object('triggered_by_op', TG_OP, 'context', 'auto_promotion'));
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
