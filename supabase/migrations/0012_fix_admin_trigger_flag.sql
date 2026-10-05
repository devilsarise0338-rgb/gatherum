-- 0012_fix_admin_trigger_flag.sql
-- Why this exists (plain words): the profiles trigger that blocks students from
-- making themselves admins ALSO blocked the real admin RPCs. Reason: inside a
-- SECURITY DEFINER function, auth.role() still reads the caller's JWT, which is
-- 'authenticated' even for admins — so every admin role/ban update raised
-- 'Cannot update restricted fields directly'.
-- Fix: the two admin RPCs set a transaction-local flag before updating; the
-- trigger honours that flag. The flag auto-resets at transaction end and cannot
-- be set by API clients (PostgREST exposes no set_config), so direct student
-- updates are still rejected.

CREATE OR REPLACE FUNCTION prevent_restricted_profile_updates()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.is_banned IS DISTINCT FROM OLD.is_banned
     OR NEW.must_change_password IS DISTINCT FROM OLD.must_change_password THEN
    -- Internal bypass, set ONLY by trusted SECURITY DEFINER admin RPCs in the
    -- same transaction (see below). Third arg `true` = local to transaction.
    IF current_setting('app.allow_restricted_update', true) = 'on' THEN
      RETURN NEW;
    END IF;
    -- Service-role / SQL-level administration (e.g. first-admin bootstrap).
    IF (select auth.role()) = 'service_role' THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Cannot update restricted fields directly';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- The trigger itself already exists (protect_profiles_trigger from 0001);
-- replacing the function body above is enough. Recreate defensively anyway.
DROP TRIGGER IF EXISTS protect_profiles_trigger ON profiles;
CREATE TRIGGER protect_profiles_trigger
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION prevent_restricted_profile_updates();

-- Harden admin_update_user_role: verify admin, set the flag, then update.
CREATE OR REPLACE FUNCTION admin_update_user_role(p_user_id uuid, p_role role_enum)
RETURNS void AS $$
BEGIN
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  PERFORM set_config('app.allow_restricted_update', 'on', true);
  UPDATE profiles SET role = p_role WHERE id = p_user_id;

  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES ((select auth.uid()), 'admin_update_user_role', 'profiles', p_user_id, jsonb_build_object('new_role', p_role));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Harden admin_toggle_user_ban the same way.
CREATE OR REPLACE FUNCTION admin_toggle_user_ban(p_user_id uuid, p_is_banned boolean)
RETURNS void AS $$
BEGIN
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  PERFORM set_config('app.allow_restricted_update', 'on', true);
  UPDATE profiles SET is_banned = p_is_banned WHERE id = p_user_id;

  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES ((select auth.uid()), 'admin_toggle_user_ban', 'profiles', p_user_id, jsonb_build_object('is_banned', p_is_banned));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Re-assert intended grants (CREATE OR REPLACE keeps them, but be explicit).
REVOKE ALL ON FUNCTION admin_update_user_role(uuid, role_enum) FROM PUBLIC;
REVOKE ALL ON FUNCTION admin_toggle_user_ban(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_update_user_role(uuid, role_enum) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_toggle_user_ban(uuid, boolean) TO authenticated;
COMMENT ON FUNCTION admin_update_user_role(uuid, role_enum) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION admin_toggle_user_ban(uuid, boolean) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
