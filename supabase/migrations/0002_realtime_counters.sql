-- 0002_realtime_counters.sql

-- 1. Add Counter Columns with constraints
ALTER TABLE events ADD COLUMN registered_count int NOT NULL DEFAULT 0 CHECK (registered_count >= 0);
ALTER TABLE events ADD COLUMN waitlist_count int NOT NULL DEFAULT 0 CHECK (waitlist_count >= 0);

-- 2. Backfill existing data safely
UPDATE events e
SET 
  registered_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'registered'),
  waitlist_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'waitlisted');

-- 3. Prevent client manipulation of counters
-- NOTE: This check relies on maintain_event_counters being SECURITY DEFINER — its internal
-- UPDATE runs as the function owner (postgres), which is what legitimately satisfies this guard.
-- Do not remove SECURITY DEFINER from maintain_event_counters without revisiting this trigger.
CREATE OR REPLACE FUNCTION protect_event_counters()
RETURNS trigger AS $$
BEGIN
  IF NEW.registered_count IS DISTINCT FROM OLD.registered_count OR NEW.waitlist_count IS DISTINCT FROM OLD.waitlist_count THEN
    -- Allow postgres (via SECURITY DEFINER triggers) or admins to modify these columns
    IF current_user NOT IN ('postgres', 'supabase_admin', 'service_role') THEN
      RAISE EXCEPTION 'Cannot update system-managed counters directly';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql; -- Not SECURITY DEFINER, we want to check the actual caller

CREATE TRIGGER protect_events_counters_trigger
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION protect_event_counters();

-- 4. Maintain Counters Trigger (Transaction-Safe)
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

  RETURN NULL; -- AFTER trigger
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_maintain_event_counters
AFTER INSERT OR UPDATE OR DELETE ON registrations
FOR EACH ROW EXECUTE FUNCTION maintain_event_counters();

-- 5. Support Registration DELETE in waitlist promotion (for backward compatibility, even though we move to 'cancelled' status)
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
    VALUES ((select auth.uid()), 'promote_from_waitlist', 'registrations', v_waitlisted_id, '{}');
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_promote_from_waitlist ON registrations;
CREATE TRIGGER trigger_promote_from_waitlist AFTER UPDATE OR DELETE ON registrations FOR EACH ROW EXECUTE FUNCTION promote_from_waitlist();

-- 6. Admin Reconciliation RPC
CREATE OR REPLACE FUNCTION admin_reconcile_event_counters()
RETURNS void AS $$
BEGIN
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE events e
  SET 
    registered_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'registered'),
    waitlist_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'waitlisted');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Enable Realtime Publications
DO $$
BEGIN
  -- Create publication if it doesn't exist (Supabase usually provides this)
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'events') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE events;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'registrations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
  END IF;
END $$;
