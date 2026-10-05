-- 0019_advisor_hardening.sql
-- Why this exists (plain words): `supabase db advisors` (security) flagged two
-- real issues after 0010-0018: (1) two functions had a mutable search_path,
-- and (2) several internal functions were still callable by anon/authenticated
-- because Postgres grants EXECUTE to PUBLIC by default and earlier migrations
-- only revoked role-specific grants. This revokes PUBLIC execution on every
-- function, re-grants exactly the intended API, and pins the two search paths.
-- Trigger/cron functions need no grants: the system invokes them directly.

-- 1. Close the PUBLIC default for every function at once.
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

-- 2. Pin search_path on the two flagged functions (bodies otherwise unchanged).
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
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION archive_old_events()
RETURNS void AS $$
BEGIN
  -- Mark events as archived if they ended > 1 hour ago.
  -- If end_time is null, fallback to start_time.
  UPDATE events
  SET is_archived = true
  WHERE is_archived = false
    AND (
      (end_time IS NOT NULL AND end_time < now() - interval '1 hour')
      OR
      (end_time IS NULL AND start_time < now() - interval '1 hour')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Re-grant exactly the intended API (same list as 0016/0017, made explicit).
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

COMMENT ON FUNCTION archive_old_events() IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
