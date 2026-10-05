-- 0018_admin_flag_reset.sql
-- Why this exists (plain words): migration 0012 lets the two admin RPCs set a
-- transaction-local bypass flag for the profiles trigger. That flag stayed on
-- for the rest of the transaction. Via the API each request is its own
-- transaction so nothing leaks between requests, but resetting the flag right
-- after the privileged UPDATE makes the bypass statement-scoped instead of
-- transaction-scoped — safer against any future chained calls in one txn.

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

REVOKE ALL ON FUNCTION admin_update_user_role(uuid, role_enum) FROM PUBLIC;
REVOKE ALL ON FUNCTION admin_toggle_user_ban(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_update_user_role(uuid, role_enum) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_toggle_user_ban(uuid, boolean) TO authenticated;
COMMENT ON FUNCTION admin_update_user_role(uuid, role_enum) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION admin_toggle_user_ban(uuid, boolean) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
