-- 0023_function_privileges_audit.sql
-- Why this exists (plain words): belt-and-braces for the function API. It
-- stops future functions from auto-exposing, re-locks every RPC to exactly
-- its intended callers, adds explicit "not authenticated" guards where a NULL
-- JWT could previously slip past a role comparison, and narrows the organizer
-- summary to public, non-archived events only. NOT applied live in this
-- session (awaiting approval).

-- ── 1. Stop future auto-exposure (both roles that own objects) ───────────────
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM anon, authenticated, PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM anon, authenticated, PUBLIC;

-- ── 2. Re-lock the 10 authenticated RPCs (exact live signatures) ─────────────
REVOKE ALL ON FUNCTION register_for_event(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION cancel_registration(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION check_in_by_ticket(text, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION invite_volunteer(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION remove_volunteer(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION admin_update_user_role(uuid, role_enum) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION admin_toggle_user_ban(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION admin_update_settings(boolean, text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION admin_fetch_users() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION admin_reconcile_event_counters() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION register_for_event(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_registration(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_in_by_ticket(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION invite_volunteer(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_volunteer(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_user_role(uuid, role_enum) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_toggle_user_ban(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_settings(boolean, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_fetch_users() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_reconcile_event_counters() TO authenticated;

-- ── 3. Trigger/internal functions: no API execution for anyone ──────────────
-- (Triggers fire regardless of EXECUTE grants; this only closes direct calls.)
REVOKE ALL ON FUNCTION handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION maintain_event_counters() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION promote_from_waitlist() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION prevent_restricted_profile_updates() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION protect_event_counters() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION trigger_set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION archive_old_events() FROM PUBLIC, anon, authenticated;

-- ── 4. Explicit unauthenticated rejection (NULL uid slipped past != checks) ──
CREATE OR REPLACE FUNCTION admin_update_user_role(p_user_id uuid, p_role role_enum)
RETURNS void AS $$
BEGIN
  IF (select auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  PERFORM set_config('app.allow_restricted_update', 'on', true);
  UPDATE profiles SET role = p_role WHERE id = p_user_id;
  PERFORM set_config('app.allow_restricted_update', 'off', true);

  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES ((select auth.uid()), 'admin_update_user_role', 'profiles', p_user_id, jsonb_build_object('new_role', p_role));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION admin_toggle_user_ban(p_user_id uuid, p_is_banned boolean)
RETURNS void AS $$
BEGIN
  IF (select auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  PERFORM set_config('app.allow_restricted_update', 'on', true);
  UPDATE profiles SET is_banned = p_is_banned WHERE id = p_user_id;
  PERFORM set_config('app.allow_restricted_update', 'off', true);

  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES ((select auth.uid()), 'admin_toggle_user_ban', 'profiles', p_user_id, jsonb_build_object('is_banned', p_is_banned));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION admin_update_settings(p_allow_global_signups boolean, p_allowed_email_domain text, p_maintenance_mode boolean)
RETURNS void AS $$
BEGIN
  IF (select auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE platform_settings SET signups_enabled = p_allow_global_signups, allowed_email_domain = p_allowed_email_domain, maintenance_mode = p_maintenance_mode WHERE id = 1;

  INSERT INTO audit_log (actor_id, action, target_table, details)
  VALUES ((select auth.uid()), 'admin_update_settings', 'platform_settings', jsonb_build_object('signups_enabled', p_allow_global_signups, 'allowed_email_domain', p_allowed_email_domain, 'maintenance_mode', p_maintenance_mode));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION admin_fetch_users()
RETURNS TABLE (
  id uuid,
  email text,
  role role_enum,
  is_banned boolean,
  full_name text,
  roll_number text,
  created_at timestamptz
) AS $$
BEGIN
  IF (select auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF (SELECT p.role FROM profiles p WHERE p.id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT p.id, p.email, p.role, p.is_banned, p.full_name, p.roll_number, p.created_at
    FROM profiles p
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION admin_reconcile_event_counters()
RETURNS void AS $$
BEGIN
  IF (select auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE events e
  SET
    registered_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status IN ('registered', 'attended')),
    waitlist_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'waitlisted');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION check_in_by_ticket(p_ticket_id text, p_event_id uuid)
RETURNS text AS $$
DECLARE
  v_reg_id uuid;
  v_reg_event_id uuid;
  v_attended boolean;
BEGIN
  IF (select auth.uid()) IS NULL THEN RETURN 'unauthorized'; END IF;

  SELECT id, event_id, attended INTO v_reg_id, v_reg_event_id, v_attended
  FROM registrations WHERE ticket_id = p_ticket_id;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;

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

-- Re-assert grants after the replaces (CREATE OR REPLACE keeps them; explicit).
GRANT EXECUTE ON FUNCTION admin_update_user_role(uuid, role_enum) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_toggle_user_ban(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_settings(boolean, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_fetch_users() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_reconcile_event_counters() TO authenticated;
GRANT EXECUTE ON FUNCTION check_in_by_ticket(text, uuid) TO authenticated;

-- ── 5. Public RPCs: confirm safe fields, narrow organizer summary ────────────
-- get_public_platform_stats returns aggregate counts only (no personal data).
CREATE OR REPLACE FUNCTION get_public_platform_stats()
RETURNS TABLE (total_events bigint, total_registrations bigint, total_organizers bigint) AS $$
  SELECT
    (SELECT count(*) FROM events WHERE is_unpublished = false AND is_archived = false),
    (SELECT count(*) FROM registrations WHERE status IN ('registered', 'attended')),
    (SELECT count(*) FROM profiles WHERE role = 'organizer');
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- Organizer summary: name + avatar ONLY, and only for PUBLIC, non-archived
-- events. Draft-event owners lose the card (they already have the edit UI).
CREATE OR REPLACE FUNCTION get_event_organizer_summary(p_event_id uuid)
RETURNS TABLE (full_name text, avatar_url text) AS $$
  SELECT p.full_name, p.avatar_url
  FROM events e
  JOIN profiles p ON p.id = e.organizer_id
  WHERE e.id = p_event_id
    AND e.is_unpublished = false
    AND e.is_archived = false;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION get_public_platform_stats() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION get_event_organizer_summary(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_public_platform_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_event_organizer_summary(uuid) TO anon, authenticated;
