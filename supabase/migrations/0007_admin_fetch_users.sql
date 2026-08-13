-- Migration to add admin_fetch_users RPC for AdminDashboard users tab

-- Create the RPC function
CREATE OR REPLACE FUNCTION admin_fetch_users()
RETURNS TABLE (id uuid, email text, role role_enum, is_banned boolean, full_name text) AS $$
BEGIN
  IF (SELECT p.role FROM profiles p WHERE p.id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY SELECT p.id, p.email, p.role, p.is_banned, p.full_name FROM profiles p;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke default public execution
REVOKE ALL ON FUNCTION admin_fetch_users() FROM PUBLIC;

-- Grant execution to authenticated users (role check inside function handles authorization)
GRANT EXECUTE ON FUNCTION admin_fetch_users() TO authenticated;

-- Ignore authenticated executable warnings for intended RPCs and helpers
COMMENT ON FUNCTION admin_fetch_users() IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
