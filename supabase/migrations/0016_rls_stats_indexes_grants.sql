-- 0016_rls_stats_indexes_grants.sql
-- Why this exists (plain words): close write-path holes that RLS left open
-- (any logged-in student could INSERT events; anyone could post announcements
-- to others' events or feedback without attending), give the frontend
-- aggregate/organizer data WITHOUT making profiles publicly readable, add the
-- missing indexes, tighten function grants, and make the archive cron job
-- safe to re-run.

-- ── 1. events INSERT: must be an organizer/admin creating own event ──────────
DROP POLICY IF EXISTS "Events are insertable by organizer or admin" ON events;
CREATE POLICY "Events are insertable by organizer or admin" ON events FOR INSERT WITH CHECK (
  ((select auth.uid()) = organizer_id AND get_auth_role() IN ('organizer', 'admin'))
  OR get_auth_role() = 'admin'
);

-- ── 2. announcements INSERT: must own the event (or be team/admin) ───────────
DROP POLICY IF EXISTS "Announcements are insertable by organizer or admin" ON announcements;
CREATE POLICY "Announcements are insertable by organizer or admin" ON announcements FOR INSERT WITH CHECK (
  (organizer_id = (select auth.uid())
    AND (is_event_organizer(event_id) OR is_event_team_member(event_id)))
  OR get_auth_role() = 'admin'
);

-- ── 3. feedbacks INSERT: must have attended/registered and event must be over ─
DROP POLICY IF EXISTS "Feedbacks are insertable by student" ON feedbacks;
CREATE POLICY "Feedbacks are insertable by attendee after event" ON feedbacks FOR INSERT WITH CHECK (
  user_id = (select auth.uid())
  AND EXISTS (
    SELECT 1 FROM registrations r
    WHERE r.event_id = feedbacks.event_id
      AND r.user_id = (select auth.uid())
      AND r.status IN ('attended', 'registered')
  )
  AND EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = feedbacks.event_id
      AND COALESCE(e.end_time, e.start_time) < now()
  )
);

-- ── 4. Public aggregate stats (SECURITY DEFINER, numbers only) ───────────────
-- The homepage needs totals but profiles must NOT become publicly readable.
CREATE OR REPLACE FUNCTION get_public_platform_stats()
RETURNS TABLE (total_events bigint, total_registrations bigint, total_organizers bigint) AS $$
  SELECT
    (SELECT count(*) FROM events WHERE is_unpublished = false AND is_archived = false),
    (SELECT count(*) FROM registrations WHERE status IN ('registered', 'attended')),
    (SELECT count(*) FROM profiles WHERE role = 'organizer');
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

REVOKE ALL ON FUNCTION get_public_platform_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_public_platform_stats() TO anon, authenticated;

-- ── 5. Public-safe organizer summary (name + avatar only) ────────────────────
-- Replaces the profiles join in EventDetailPage, which anon/students cannot
-- read. Draft events stay hidden unless the caller owns/teams/admins them.
CREATE OR REPLACE FUNCTION get_event_organizer_summary(p_event_id uuid)
RETURNS TABLE (full_name text, avatar_url text) AS $$
  SELECT p.full_name, p.avatar_url
  FROM events e
  JOIN profiles p ON p.id = e.organizer_id
  WHERE e.id = p_event_id
    AND (
      e.is_unpublished = false
      OR e.organizer_id = (select auth.uid())
      OR is_event_team_member(e.id)
      OR get_auth_role() = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

REVOKE ALL ON FUNCTION get_event_organizer_summary(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_event_organizer_summary(uuid) TO anon, authenticated;

-- ── 6. Indexes (none existed; FK/ordering columns scanned sequentially) ───────
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- ── 7. Least-privilege EXECUTE grants (functions only) ───────────────────────
-- Conservative cut: revoke function execution from anon/authenticated, then
-- re-grant exactly the RPCs the frontend calls. Trigger/internal functions
-- (handle_new_user, maintain/promote triggers, etc.) are never callable via
-- the API after this. Table-level grants are intentionally left alone here:
-- PostgREST needs SELECT for reads and tightening them risks breaking the app
-- without a live DB test — see TODO in the final report.
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

GRANT EXECUTE ON FUNCTION admin_update_user_role(uuid, role_enum) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_toggle_user_ban(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_settings(boolean, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_fetch_users() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_reconcile_event_counters() TO authenticated;
GRANT EXECUTE ON FUNCTION register_for_event(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_registration(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_in_by_ticket(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION invite_volunteer(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_volunteer(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_auth_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_event_organizer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_event_team_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_platform_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_event_organizer_summary(uuid) TO anon, authenticated;

-- ── 8. Idempotent archive schedule (unschedule-before-schedule) ──────────────
DO $$
BEGIN
  BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron extension unavailable here; skipping archive schedule';
    RETURN;
  END;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'auto-archive-events') THEN
    PERFORM cron.unschedule('auto-archive-events');
  END IF;
  PERFORM cron.schedule('auto-archive-events', '0 * * * *', 'SELECT archive_old_events()');
EXCEPTION WHEN invalid_schema_name THEN
  RAISE NOTICE 'pg_cron schema unavailable here; skipping archive schedule';
END $$;
