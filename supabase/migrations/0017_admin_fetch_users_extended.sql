-- 0017_admin_fetch_users_extended.sql
-- Why this exists (plain words): the Admin Users tab needs roll numbers and
-- join dates for a college demo, but admin_fetch_users() only returned five
-- columns. This extends it additively. Changing a return type requires
-- DROP + CREATE (CREATE OR REPLACE cannot change outputs), so grants are
-- re-issued here too.

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

REVOKE ALL ON FUNCTION admin_fetch_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_fetch_users() TO authenticated;
COMMENT ON FUNCTION admin_fetch_users() IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
