-- 0025_handle_new_user.sql
-- Why this exists (plain words): signup emails were compared case-sensitively,
-- so "Student@Poornima.org" was rejected even though it belongs to the college.
-- The check is now a case-insensitive suffix match, a missing email is
-- rejected outright, and failures carry a stable DOMAIN_NOT_ALLOWED: prefix so
-- the app can show a friendly message instead of raw DB errors. Open-signup
-- behavior when no domain is configured is unchanged. NOT applied live in
-- this session (awaiting approval).

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_allowed_domain text;
  v_signups_enabled boolean;
BEGIN
  SELECT allowed_email_domain, signups_enabled INTO v_allowed_domain, v_signups_enabled FROM public.platform_settings WHERE id = 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Platform settings not found, signups rejected.';
  END IF;

  IF NOT v_signups_enabled THEN
    RAISE EXCEPTION 'Global signups are currently disabled.';
  END IF;

  IF new.email IS NULL THEN
    RAISE EXCEPTION 'DOMAIN_NOT_ALLOWED: an email address is required.';
  END IF;

  IF v_allowed_domain IS NOT NULL AND v_allowed_domain != ''
     AND right(lower(new.email), length(v_allowed_domain)) != lower(v_allowed_domain) THEN
    RAISE EXCEPTION 'DOMAIN_NOT_ALLOWED: Users must use a % email.', v_allowed_domain;
  END IF;

  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'student');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger-only function: no API role may call it directly.
REVOKE ALL ON FUNCTION handle_new_user() FROM PUBLIC, anon, authenticated;
