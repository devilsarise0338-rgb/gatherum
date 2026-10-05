-- supabase/seed.sql — safe demo data only (no real emails, no passwords).
-- Applied by `supabase db reset` after all migrations. Idempotent: safe to
-- re-run. Demo users are NOT created here (auth.users rows cannot be safely
-- fabricated); sign up through the app, then promote via the SQL in README.
-- Demo events attach to the earliest organizer/admin profile if one exists,
-- otherwise this seed only ensures platform_settings and does nothing else.

INSERT INTO platform_settings (id, signups_enabled, allowed_email_domain, maintenance_mode)
VALUES (1, true, '@poornima.org', false)
ON CONFLICT (id) DO UPDATE SET
  signups_enabled = EXCLUDED.signups_enabled,
  allowed_email_domain = EXCLUDED.allowed_email_domain,
  maintenance_mode = EXCLUDED.maintenance_mode;

DO $$
DECLARE
  v_org uuid;
BEGIN
  SELECT id INTO v_org FROM profiles
  WHERE role IN ('organizer', 'admin')
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_org IS NULL THEN
    RAISE NOTICE 'seed: no organizer/admin profile yet; skipping demo events (sign up, promote, re-seed)';
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM events WHERE title = 'Demo: Campus Hack Night') THEN
    INSERT INTO events (organizer_id, title, description, category, start_time, end_time, location, capacity, is_unpublished, is_archived)
    VALUES (v_org, 'Demo: Campus Hack Night', 'A friendly overnight hackathon. Bring a laptop; teams form on the spot.',
      'Technical', now() + interval '7 days', now() + interval '7 days 8 hours', 'Main Auditorium', 80, false, false);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM events WHERE title = 'Demo: Draft Workshop (example)') THEN
    INSERT INTO events (organizer_id, title, description, category, start_time, end_time, location, capacity, is_unpublished, is_archived)
    VALUES (v_org, 'Demo: Draft Workshop (example)', 'An unpublished example organizers can edit and publish.',
      'Workshop', now() + interval '14 days', now() + interval '14 days 2 hours', 'Lab 4', 40, true, false);
  END IF;
END $$;
