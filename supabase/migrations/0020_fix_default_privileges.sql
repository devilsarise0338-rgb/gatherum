-- 0020_fix_default_privileges.sql
-- Why this exists (plain words), two related fixes found via advisors + live test:
-- 1. Migration 0001 set ALTER DEFAULT PRIVILEGES granting ALL on future public
--    functions to anon/authenticated. So every DROP+CREATE since (e.g.
--    admin_fetch_users in 0017) silently regained an anon EXECUTE grant.
--    This revokes those defaults for anon/authenticated/PUBLIC going forward.
-- 2. Anonymous reads of events/announcements crashed with
--    "permission denied for function is_event_team_member", because RLS
--    policies call helper functions and anon could not execute them. The three
--    helpers are harmless for anon (auth.uid() is NULL, so they return
--    false/NULL), but required for public reads to evaluate at all.

-- Stop future functions from auto-granting to anon/authenticated/PUBLIC.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM anon, authenticated, PUBLIC;

-- Strip existing role/PUBLIC grants on all current public functions.
-- (supabase_admin/postgres/service_role keep theirs; platform machinery.)
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated, PUBLIC;

-- Re-grant exactly the intended API.
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
GRANT EXECUTE ON FUNCTION get_public_platform_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_event_organizer_summary(uuid) TO anon, authenticated;

-- RLS helpers: needed by authenticated AND anon policy evaluation.
GRANT EXECUTE ON FUNCTION get_auth_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_event_organizer(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_event_team_member(uuid) TO anon, authenticated;
