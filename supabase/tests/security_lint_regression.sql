-- supabase/tests/security_lint_regression.sql
-- Regression proof for the linter remediation (0021-0026 + private helpers).
-- RUN THIS ONLY AFTER 0021-0026 ARE APPLIED (post-push state).
-- Verified pre-push (2026-10-06, rolled back, zero leftovers): A1/A2/A3/A4/A5
-- pass; A6 passes vacuously (bucket empty — the listing hole itself is proven
-- by the live "Public Access" policy, closed by 0021); S1/S2/O1/M1/B3 pass;
-- D1, B1, B2, G1, G2 fail exactly as predicted (each documents a hole the
-- pending migrations close).
--
-- SAFE ANYWHERE: single transaction ending in ROLLBACK — nothing persists.
-- Role switching uses SET LOCAL ROLE (works in DO blocks, verified live).
-- Fixtures reuse EXISTING profiles (read-only discovery); raw INSERTs run as
-- the session owner BEFORE any role switch (RLS would block them otherwise).
-- Run: supabase db execute -f supabase/tests/security_lint_regression.sql
--      (or paste into MCP execute_sql / SQL editor).
--
-- Manual REST checks this file CANNOT do (needs anon key + HTTP):
--   curl anon list:  GET /storage/v1/object/list/images  -> 400/empty (post-0021)
--   curl anon RPC:   POST /rest/v1/rpc/private...        -> 404 (schema unexposed)
--   curl anon event: GET /rest/v1/events (logged out)    -> only published rows

BEGIN;

-- ── Fixtures ─────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_admin uuid; v_student uuid; v_org uuid;
BEGIN
  SELECT id INTO v_admin FROM profiles WHERE role = 'admin' ORDER BY created_at LIMIT 1;
  SELECT id INTO v_student FROM profiles WHERE role = 'student' AND NOT is_banned ORDER BY created_at LIMIT 1;
  SELECT id INTO v_org FROM profiles WHERE role = 'organizer' ORDER BY created_at LIMIT 1;
  IF v_student IS NULL OR v_org IS NULL THEN
    RAISE EXCEPTION 'SKIP: need a student and an organizer profile';
  END IF;
  IF v_admin IS NULL THEN
    PERFORM set_config('app.allow_restricted_update', 'on', true);
    UPDATE profiles SET role = 'admin' WHERE id = v_org;
    PERFORM set_config('app.allow_restricted_update', 'off', true);
    v_admin := v_org;
    RAISE NOTICE 'NOTE: transient admin (restored + rolled back)';
  END IF;
  PERFORM set_config('sec.admin', v_admin::text, true);
  PERFORM set_config('sec.student', v_student::text, true);
  PERFORM set_config('sec.org', v_org::text, true);

  -- Raw inserts run as owner (RLS would block student/anon inserts by design).
  INSERT INTO events (id, organizer_id, title, start_time, end_time, location, capacity, is_unpublished)
  VALUES
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', v_org, 'SecTest Event', now() + interval '1 day', now() + interval '2 days', 'Hall', 5, false),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', v_org, 'SecTest Draft', now() + interval '1 day', now() + interval '2 days', 'Lab', 10, true);
  INSERT INTO registrations (event_id, user_id, status, ticket_id, attended)
  VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', v_student, 'registered', 'SEC-REG-1', false);
END $$;

-- ── A1 anon reads published events ────────────────────────────────────────────
DO $$
DECLARE n int;
BEGIN
  SET LOCAL ROLE anon;
  PERFORM set_config('request.jwt.claims', '{}', true);
  SELECT count(*) INTO n FROM events WHERE is_unpublished = false;
  RAISE NOTICE 'A1 anon published read: PASS (%)', n;
END $$;

-- ── A2 anon public RPCs work ──────────────────────────────────────────────────
DO $$
DECLARE v_ev uuid; a int; b int;
BEGIN
  SET LOCAL ROLE anon;
  PERFORM set_config('request.jwt.claims', '{}', true);
  SELECT count(*) INTO a FROM get_public_platform_stats();
  SELECT id INTO v_ev FROM events WHERE is_unpublished = false AND is_archived = false LIMIT 1;
  IF v_ev IS NOT NULL THEN
    SELECT count(*) INTO b FROM get_event_organizer_summary(v_ev);
  ELSE
    b := 0;
  END IF;
  RAISE NOTICE 'A2 anon public RPCs: PASS';
END $$;

-- ── A3 anon cannot execute privileged RPCs ─────────────────────────────────────
-- Accepts gate denial (permission denied: anon lacks EXECUTE, the intended
-- state) or body rejection (Not authenticated: defense-in-depth guards).
DO $$ BEGIN
  SET LOCAL ROLE anon;
  PERFORM set_config('request.jwt.claims', '{}', true);
  BEGIN PERFORM register_for_event('00000000-0000-0000-0000-000000000000');
    RAISE EXCEPTION 'A3 register anon: FAIL (allowed)';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%Not authenticated%' AND SQLERRM NOT LIKE '%permission denied%' THEN RAISE; END IF;
  END;
  BEGIN PERFORM cancel_registration('00000000-0000-0000-0000-000000000000');
    RAISE EXCEPTION 'A3 cancel anon: FAIL (allowed)';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%Not authenticated%' AND SQLERRM NOT LIKE '%permission denied%' THEN RAISE; END IF;
  END;
  BEGIN PERFORM admin_fetch_users();
    RAISE EXCEPTION 'A3 admin_fetch anon: FAIL (allowed)';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%Not authenticated%' AND SQLERRM NOT LIKE '%permission denied%' THEN RAISE; END IF;
  END;
  BEGIN PERFORM invite_volunteer('00000000-0000-0000-0000-000000000000', 'x@y.z');
    RAISE EXCEPTION 'A3 invite anon: FAIL (allowed)';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%Unauthorized%' AND SQLERRM NOT LIKE '%permission denied%' THEN RAISE; END IF;
  END;
  RAISE NOTICE 'A3 anon cannot execute privileged RPCs: PASS';
END $$;

-- ── A4 anon check-in is rejected at the gate ───────────────────────────────────
DO $$
DECLARE r text;
BEGIN
  SET LOCAL ROLE anon;
  PERFORM set_config('request.jwt.claims', '{}', true);
  BEGIN
    SELECT check_in_by_ticket('NOPE', '00000000-0000-0000-0000-000000000000') INTO r;
    IF r = 'unauthorized' THEN RAISE NOTICE 'A4 anon check-in rejected: PASS';
    ELSE RAISE EXCEPTION 'A4 anon check-in: FAIL (got %)', r; END IF;
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%permission denied%' THEN
      RAISE NOTICE 'A4 anon check-in denied at gate: PASS';
    ELSE RAISE; END IF;
  END;
END $$;

-- ── A5 anon sees no unpublished events ─────────────────────────────────────────
DO $$
DECLARE n int;
BEGIN
  SET LOCAL ROLE anon;
  PERFORM set_config('request.jwt.claims', '{}', true);
  SELECT count(*) INTO n FROM events WHERE is_unpublished = true;
  IF n = 0 THEN RAISE NOTICE 'A5 anon sees no drafts: PASS';
  ELSE RAISE EXCEPTION 'A5 anon sees drafts: FAIL (%)', n; END IF;
END $$;

-- ── A6 anon cannot list the images bucket (post-0021) ──────────────────────────
DO $$
DECLARE n int;
BEGIN
  SET LOCAL ROLE anon;
  PERFORM set_config('request.jwt.claims', '{}', true);
  SELECT count(*) INTO n FROM storage.objects WHERE bucket_id = 'images';
  IF n = 0 THEN RAISE NOTICE 'A6 anon bucket listing blocked: PASS';
  ELSE RAISE EXCEPTION 'A6 anon bucket listing: FAIL (%)', n; END IF;
END $$;

-- ── S1 student registers + cancels through RPCs ───────────────────────────────
DO $$
DECLARE
  v_student uuid := current_setting('sec.student')::uuid;
  v_ev uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01';
  st text;
BEGIN
  SET LOCAL ROLE authenticated;
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_student::text, 'role', 'authenticated')::text, true);
  -- fixture row exists as 'registered' from setup; cancel then re-register twice
  PERFORM cancel_registration(v_ev);
  SELECT status INTO st FROM registrations WHERE event_id = v_ev AND user_id = v_student;
  IF st != 'cancelled' THEN RAISE EXCEPTION 'S1 cancel: FAIL (%)', st; END IF;
  SELECT register_for_event(v_ev) INTO st;
  IF st != 'registered' THEN RAISE EXCEPTION 'S1 re-register: FAIL (%)', st; END IF;
  SELECT register_for_event(v_ev) INTO st;
  IF st != 'registered' THEN RAISE EXCEPTION 'S1 idempotent: FAIL (%)', st; END IF;
  RAISE NOTICE 'S1 student register/cancel/idempotent: PASS';
END $$;

-- ── S2 student cannot touch others or escalate ─────────────────────────────────
DO $$
DECLARE v_student uuid := current_setting('sec.student')::uuid;
DECLARE n int;
BEGIN
  SET LOCAL ROLE authenticated;
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_student::text, 'role', 'authenticated')::text, true);
  SELECT count(*) INTO n FROM profiles WHERE id != v_student;
  IF n != 0 THEN RAISE EXCEPTION 'S2 cross-profile read: FAIL'; END IF;
  BEGIN UPDATE profiles SET role = 'admin' WHERE id = v_student;
    RAISE EXCEPTION 'S2 self-escalation: FAIL (allowed)';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%Cannot update restricted fields directly%' THEN RAISE; END IF;
  END;
  RAISE NOTICE 'S2 student boundaries: PASS';
END $$;

-- ── D1 organizer summary hidden for drafts even to owner (post-0023) ──────────
DO $$
DECLARE
  v_org uuid := current_setting('sec.org')::uuid;
  n int;
BEGIN
  SET LOCAL ROLE authenticated;
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_org::text, 'role', 'authenticated')::text, true);
  SELECT count(*) INTO n FROM get_event_organizer_summary('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02');
  IF n = 0 THEN RAISE NOTICE 'D1 draft summary hidden: PASS';
  ELSE RAISE EXCEPTION 'D1 draft summary: FAIL (leaked)'; END IF;
END $$;

-- ── O1 organizer check-in own event only ───────────────────────────────────────
DO $$
DECLARE
  v_org uuid := current_setting('sec.org')::uuid;
  v_ev uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01';
  r text;
BEGIN
  SET LOCAL ROLE authenticated;
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_org::text, 'role', 'authenticated')::text, true);
  SELECT check_in_by_ticket('SEC-REG-1', v_ev) INTO r;
  IF r != 'success' THEN RAISE EXCEPTION 'O1 own check-in: FAIL (%)', r; END IF;
  SELECT check_in_by_ticket('SEC-REG-1', '00000000-0000-0000-0000-000000000000') INTO r;
  IF r != 'event_mismatch' THEN RAISE EXCEPTION 'O1 mismatch: FAIL (%)', r; END IF;
  RAISE NOTICE 'O1 organizer check-in: PASS';
END $$;

-- ── M1 admin RPCs incl. trigger interplay ──────────────────────────────────────
DO $$
DECLARE
  v_admin uuid := current_setting('sec.admin')::uuid;
  v_student uuid := current_setting('sec.student')::uuid;
  ro text; b boolean; c int;
BEGIN
  SET LOCAL ROLE authenticated;
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_admin::text, 'role', 'authenticated')::text, true);
  PERFORM admin_update_user_role(v_student, 'organizer');
  PERFORM admin_toggle_user_ban(v_student, true);
  SELECT count(*) INTO c FROM admin_fetch_users();
  SELECT role, is_banned INTO ro, b FROM profiles WHERE id = v_student;
  IF ro = 'organizer' AND b AND c > 0 THEN RAISE NOTICE 'M1 admin RPCs: PASS';
  ELSE RAISE EXCEPTION 'M1 admin RPCs: FAIL (%, %, %)', ro, b, c; END IF;
END $$;

-- ── B1 banned users cannot register (post-0024), cancelling stays open ────────
DO $$
DECLARE
  v_student uuid := current_setting('sec.student')::uuid;
  v_ev uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01';
  st text;
BEGIN
  PERFORM set_config('app.allow_restricted_update', 'on', true);
  UPDATE profiles SET is_banned = true WHERE id = v_student;
  PERFORM set_config('app.allow_restricted_update', 'off', true);
  SET LOCAL ROLE authenticated;
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_student::text, 'role', 'authenticated')::text, true);
  BEGIN PERFORM register_for_event(v_ev);
    RAISE EXCEPTION 'B1 banned register: FAIL (allowed)';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%suspended%' THEN RAISE; END IF;
  END;
  -- Cancelling while banned stays allowed.
  PERFORM cancel_registration(v_ev);
  SELECT status INTO st FROM registrations WHERE event_id = v_ev AND user_id = v_student;
  IF st != 'cancelled' THEN RAISE EXCEPTION 'B1 banned cancel: FAIL (%)', st; END IF;
  RESET ROLE;
  PERFORM set_config('app.allow_restricted_update', 'on', true);
  UPDATE profiles SET is_banned = false WHERE id = v_student;
  PERFORM set_config('app.allow_restricted_update', 'off', true);
  RAISE NOTICE 'B1 banned register blocked, cancel open: PASS';
END $$;

-- ── B2 incomplete profiles cannot register (post-0024) ───────────────────────
DO $$
DECLARE
  v_student uuid := current_setting('sec.student')::uuid;
  v_ev uuid := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01';
BEGIN
  UPDATE profiles SET profile_completed = false WHERE id = v_student;
  SET LOCAL ROLE authenticated;
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_student::text, 'role', 'authenticated')::text, true);
  BEGIN PERFORM register_for_event(v_ev);
    RAISE EXCEPTION 'B2 incomplete register: FAIL (allowed)';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%complete your profile%' THEN RAISE; END IF;
  END;
  RESET ROLE;
  UPDATE profiles SET profile_completed = true WHERE id = v_student;
  RAISE NOTICE 'B2 incomplete register blocked: PASS';
END $$;

-- ── B3 must_change_password is guard-locked like role/is_banned ──────────────
DO $$
DECLARE v_student uuid := current_setting('sec.student')::uuid;
BEGIN
  SET LOCAL ROLE authenticated;
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', v_student::text, 'role', 'authenticated')::text, true);
  BEGIN UPDATE profiles SET must_change_password = true WHERE id = v_student;
    RAISE EXCEPTION 'B3 must_change_password write: FAIL (allowed)';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM NOT LIKE '%Cannot update restricted fields directly%' THEN RAISE; END IF;
  END;
  RESET ROLE;
  RAISE NOTICE 'B3 must_change_password blocked: PASS';
END $$;

-- ── G1 mixed-case college email passes the trigger (post-0025) ───────────────
DO $$ BEGIN
  INSERT INTO auth.users(id, email) VALUES (gen_random_uuid(), 'SecMixed@Poornima.org');
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'SecMixed@Poornima.org') THEN
    RAISE EXCEPTION 'G1 mixed-case signup: FAIL (no profile row)';
  END IF;
  DELETE FROM profiles WHERE email = 'SecMixed@Poornima.org';
  DELETE FROM auth.users WHERE email = 'SecMixed@Poornima.org';
  RAISE NOTICE 'G1 mixed-case signup: PASS';
END $$;

-- ── G2 non-college email rejected with the stable prefix (post-0025) ─────────
DO $$ BEGIN
  INSERT INTO auth.users(id, email) VALUES (gen_random_uuid(), 'secprobe@gmail.com');
  RAISE EXCEPTION 'G2 gmail signup: FAIL (allowed)';
EXCEPTION WHEN OTHERS THEN
  IF SQLERRM NOT LIKE 'DOMAIN_NOT_ALLOWED:%' THEN RAISE; END IF;
  RAISE NOTICE 'G2 gmail rejected with prefix: PASS';
END $$;

-- ── Cleanup + rollback (nothing persists) ───────────────────────────────────────
RESET ROLE;
DELETE FROM registrations WHERE ticket_id IN ('SEC-REG-1');
DELETE FROM events WHERE id IN ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02');
ROLLBACK;
