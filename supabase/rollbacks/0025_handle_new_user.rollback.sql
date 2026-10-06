-- ROLLBACK for 0025_handle_new_user.sql — UNTESTED (no local DB available).
-- Restores the exact 0001 body (case-sensitive LIKE, no NULL-email guard,
-- original message without prefix). Mixed-case college emails will be
-- rejected again after this rollback.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_allowed_domain text;
  v_signups_enabled boolean;
BEGIN
  SELECT allowed_email_domain, signups_enabled INTO v_allowed_domain, v_signups_enabled FROM platform_settings WHERE id = 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Platform settings not found, signups rejected.';
  END IF;

  IF NOT v_signups_enabled THEN
    RAISE EXCEPTION 'Global signups are currently disabled.';
  END IF;

  IF v_allowed_domain IS NOT NULL AND v_allowed_domain != '' AND new.email NOT LIKE '%' || v_allowed_domain THEN
    RAISE EXCEPTION 'Users must use a % email.', v_allowed_domain;
  END IF;

  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'student');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION handle_new_user() FROM PUBLIC, anon, authenticated;

-- Keep migration history consistent if you abandon 0025 (not if re-applying):
--   DELETE FROM supabase_migrations.schema_migrations WHERE version = '0025';
