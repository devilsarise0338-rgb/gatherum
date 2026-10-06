-- ROLLBACK for 0023_function_privileges_audit.sql — UNTESTED (no local DB available).
-- Preconditions: 0026..0024 already rolled back (reverse order); 0022 still
-- applied (its rollback comes later). Restores each function to its exact
-- pre-0023 body (0018/0017/0015/0013/0016/0001, verified against the repo
-- files) and the 0022-era grants. Default-privilege changes are left in place
-- (they only affect future objects; re-adding auto-exposure would be worse).

-- ── admin_update_user_role / admin_toggle_user_ban back to 0018 ───────────────
CREATE OR REPLACE FUNCTION admin_update_user_role(p_user_id uuid, p_role role_enum)
RETURNS void AS $$
BEGIN
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

-- ── admin_update_settings back to 0001 (no explicit null guard) ──────────────
CREATE OR REPLACE FUNCTION admin_update_settings(p_allow_global_signups boolean, p_allowed_email_domain text, p_maintenance_mode boolean)
RETURNS void AS $$
BEGIN
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE platform_settings SET signups_enabled = p_allow_global_signups, allowed_email_domain = p_allowed_email_domain, maintenance_mode = p_maintenance_mode WHERE id = 1;

  INSERT INTO audit_log (actor_id, action, target_table, details)
  VALUES ((select auth.uid()), 'admin_update_settings', 'platform_settings', jsonb_build_object('signups_enabled', p_allow_global_signups, 'allowed_email_domain', p_allowed_email_domain, 'maintenance_mode', p_maintenance_mode));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ── admin_fetch_users back to 0017 (extended columns, no null guard) ─────────
-- (DROP + CREATE, exactly as 0017 does it.)
DROP FUNCTION IF EXISTS admin_fetch_users();
CREATE FUNCTION admin_fetch_users()
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
  IF (SELECT p.role FROM profiles p WHERE p.id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY
    SELECT p.id, p.email, p.role, p.is_banned, p.full_name, p.roll_number, p.created_at
    FROM profiles p
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ── admin_reconcile_event_counters back to 0015 (no null guard) ───────────────
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

-- ── check_in_by_ticket back to 0013 (no explicit null guard) ─────────────────
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

-- ── get_public_platform_stats back to 0016 ────────────────────────────────────
CREATE OR REPLACE FUNCTION get_public_platform_stats()
RETURNS TABLE (total_events bigint, total_registrations bigint, total_organizers bigint) AS $$
  SELECT
    (SELECT count(*) FROM events WHERE is_unpublished = false AND is_archived = false),
    (SELECT count(*) FROM registrations WHERE status IN ('registered', 'attended')),
    (SELECT count(*) FROM profiles WHERE role = 'organizer');
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

-- ── get_event_organizer_summary back to the 0022 form ─────────────────────────
CREATE OR REPLACE FUNCTION get_event_organizer_summary(p_event_id uuid)
RETURNS TABLE (full_name text, avatar_url text) AS $$
  SELECT p.full_name, p.avatar_url
  FROM events e
  JOIN profiles p ON p.id = e.organizer_id
  WHERE e.id = p_event_id
    AND (
      e.is_unpublished = false
      OR e.organizer_id = (select auth.uid())
      OR private.is_event_team_member(e.id)
      OR private.get_auth_role() = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

-- ── Grants back to the 0022-era state ─────────────────────────────────────────
REVOKE ALL ON FUNCTION admin_update_user_role(uuid, role_enum) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION admin_toggle_user_ban(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION admin_update_settings(boolean, text, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION admin_fetch_users() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION admin_reconcile_event_counters() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION check_in_by_ticket(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION admin_update_user_role(uuid, role_enum) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_toggle_user_ban(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_settings(boolean, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_fetch_users() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_reconcile_event_counters() TO authenticated;
GRANT EXECUTE ON FUNCTION check_in_by_ticket(text, uuid) TO authenticated;
REVOKE ALL ON FUNCTION get_public_platform_stats() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION get_event_organizer_summary(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_public_platform_stats() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_event_organizer_summary(uuid) TO anon, authenticated;

-- Keep migration history consistent if you abandon 0023 (not if re-applying):
--   DELETE FROM supabase_migrations.schema_migrations WHERE version = '0023';
