-- 0013_checkin_event_binding.sql
-- Why this exists (plain words): check_in_by_ticket() only looked at the
-- ticket's own event and ignored which event page the scan happened on, so a
-- ticket for event A scanned on event B's check-in page gave no clear error.
-- Admins (who can do everything else) were also rejected. This rewrite:
--   1. takes the page's event id and rejects mismatches with 'event_mismatch',
--   2. allows organizer, team member, OR admin of that event,
--   3. stamps registrations.checked_in_at so exports show the real check-in time.

ALTER TABLE registrations ADD COLUMN IF NOT EXISTS checked_in_at timestamptz;

-- Remove the old single-argument version so PostgREST exposes exactly one
-- check_in_by_ticket(ticket_id, event_id) endpoint (no overload ambiguity).
DROP FUNCTION IF EXISTS check_in_by_ticket(text);

CREATE OR REPLACE FUNCTION check_in_by_ticket(p_ticket_id text, p_event_id uuid)
RETURNS text AS $$
DECLARE
  v_reg_id uuid;
  v_reg_event_id uuid;
  v_attended boolean;
BEGIN
  SELECT id, event_id, attended INTO v_reg_id, v_reg_event_id, v_attended
  FROM registrations WHERE ticket_id = p_ticket_id;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;

  -- The ticket must belong to the event being checked in. IS DISTINCT FROM
  -- also rejects a NULL page event instead of silently passing.
  IF v_reg_event_id IS DISTINCT FROM p_event_id THEN RETURN 'event_mismatch'; END IF;

  IF NOT (
    EXISTS (SELECT 1 FROM events WHERE id = v_reg_event_id AND organizer_id = (select auth.uid())) OR
    EXISTS (SELECT 1 FROM event_team WHERE event_id = v_reg_event_id AND user_id = (select auth.uid())) OR
    (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
  ) THEN
    RETURN 'unauthorized';
  END IF;

  IF v_attended THEN RETURN 'already_checked_in'; END IF;

  UPDATE registrations
  SET attended = true, status = 'attended', checked_in_at = now()
  WHERE id = v_reg_id;

  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES ((select auth.uid()), 'check_in_by_ticket', 'registrations', v_reg_id, '{}');

  RETURN 'success';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION check_in_by_ticket(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION check_in_by_ticket(text, uuid) TO authenticated;
COMMENT ON FUNCTION check_in_by_ticket(text, uuid) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
