-- 0015_promote_counters_atomic.sql
-- Why this exists (plain words), two fixes:
-- 1. Two people cancelling at the same instant could both promote the SAME
--    waitlisted student (double promotion). The pick-and-promote is now a
--    single UPDATE with FOR UPDATE SKIP LOCKED, so exactly one cancel wins
--    each waitlisted row, and capacity is re-checked first.
-- 2. The seat counters missed transitions (registered<->waitlisted swaps,
--    attended->cancelled, DELETEs). Deltas are now computed from seat
--    categories, covering every transition. Attended students occupy a seat,
--    matching the capacity check in register_for_event.

CREATE OR REPLACE FUNCTION promote_from_waitlist()
RETURNS trigger AS $$
DECLARE
  v_promoted_id uuid;
  v_capacity int;
  v_taken int;
BEGIN
  -- Only a freed 'registered' seat triggers promotion.
  IF NOT ((TG_OP = 'UPDATE' AND OLD.status = 'registered' AND NEW.status = 'cancelled')
       OR (TG_OP = 'DELETE' AND OLD.status = 'registered')) THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;

  -- Re-check capacity: another concurrent registration may have taken the seat.
  SELECT capacity INTO v_capacity FROM events WHERE id = OLD.event_id;
  IF NOT FOUND THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;

  SELECT count(*) INTO v_taken FROM registrations
  WHERE event_id = OLD.event_id AND status IN ('registered', 'attended');

  IF v_taken >= v_capacity THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
  END IF;

  -- Atomic: pick the earliest waitlisted row and promote it in one statement.
  -- SKIP LOCKED means a concurrent cancel skips a row already being promoted.
  UPDATE registrations SET status = 'registered'
  WHERE id = (
    SELECT id FROM registrations
    WHERE event_id = OLD.event_id AND status = 'waitlisted'
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING id INTO v_promoted_id;

  IF FOUND THEN
    INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
    VALUES ((select auth.uid()), 'promote_from_waitlist', 'registrations', v_promoted_id,
      jsonb_build_object('triggered_by_op', TG_OP, 'context', 'auto_promotion'));
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_promote_from_waitlist ON registrations;
CREATE TRIGGER trigger_promote_from_waitlist
AFTER UPDATE OR DELETE ON registrations
FOR EACH ROW EXECUTE FUNCTION promote_from_waitlist();

-- Full transition matrix via seat categories:
--   seat  = registered OR attended (occupies capacity)
--   wait  = waitlisted
-- Anything else (cancelled) occupies nothing.
CREATE OR REPLACE FUNCTION maintain_event_counters()
RETURNS trigger AS $$
DECLARE
  v_old_seat int := 0;
  v_new_seat int := 0;
  v_old_wait int := 0;
  v_new_wait int := 0;
  v_event_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_event_id := OLD.event_id;
  ELSE
    v_event_id := NEW.event_id;
  END IF;

  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.status IN ('registered', 'attended') THEN v_new_seat := 1; END IF;
    IF NEW.status = 'waitlisted' THEN v_new_wait := 1; END IF;
  END IF;

  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    IF OLD.status IN ('registered', 'attended') THEN v_old_seat := 1; END IF;
    IF OLD.status = 'waitlisted' THEN v_old_wait := 1; END IF;
  END IF;

  IF (v_new_seat - v_old_seat) != 0 OR (v_new_wait - v_old_wait) != 0 THEN
    UPDATE events
    SET registered_count = registered_count + (v_new_seat - v_old_seat),
        waitlist_count = waitlist_count + (v_new_wait - v_old_wait)
    WHERE id = v_event_id;
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_maintain_event_counters ON registrations;
CREATE TRIGGER trigger_maintain_event_counters
AFTER INSERT OR UPDATE OR DELETE ON registrations
FOR EACH ROW EXECUTE FUNCTION maintain_event_counters();

-- Backfill under the same definition (attended occupies a seat).
UPDATE events e
SET
  registered_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status IN ('registered', 'attended')),
  waitlist_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'waitlisted');

-- Keep the admin reconciliation RPC consistent with the same definition.
CREATE OR REPLACE FUNCTION admin_reconcile_event_counters()
RETURNS void AS $$
BEGIN
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE events e
  SET
    registered_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status IN ('registered', 'attended')),
    waitlist_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'waitlisted');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION admin_reconcile_event_counters() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_reconcile_event_counters() TO authenticated;
