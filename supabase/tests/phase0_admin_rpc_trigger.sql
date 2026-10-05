-- Phase 0 regression test: admin RPCs vs. profiles trigger + check-in binding.
-- SAFE TO RUN ANYWHERE: everything runs in one transaction ending in ROLLBACK,
-- so no data ever persists. Fixtures reuse EXISTING profiles (discovered
-- read-only); the test event/registration rows are deleted before rollback.
--
-- Run after `supabase db reset` (scratch DB with signups done through the app):
--   supabase db execute -f supabase/tests/phase0_admin_rpc_trigger.sql
-- Or via Supabase MCP execute_sql (paste the whole file).
--
-- Requires: at least one admin profile, one student profile, and preferably
-- one organizer profile. Missing fixtures SKIP gracefully (NOTICE, no failure).
-- Simulates JWTs the way PostgREST does: auth.uid() reads
-- request.jwt.claim.sub, auth.role() reads request.jwt.claim.role.

BEGIN;

-- ── Fixture discovery (read-only; no inserts into profiles) ─────────────────
DO $$
DECLARE
  v_admin uuid;
  v_student uuid;
  v_org uuid;
BEGIN
  SELECT id INTO v_admin FROM profiles WHERE role = 'admin' ORDER BY created_at LIMIT 1;
  SELECT id INTO v_student FROM profiles WHERE role = 'student' AND NOT is_banned ORDER BY created_at LIMIT 1;
  SELECT id INTO v_org FROM profiles WHERE role = 'organizer' ORDER BY created_at LIMIT 1;

  IF v_student IS NULL THEN
    RAISE EXCEPTION 'SKIP: need at least one student profile (sign up via the app first)';
  END IF;
  IF v_org IS NULL THEN
    RAISE EXCEPTION 'SKIP: need at least one organizer profile for check-in tests';
  END IF;

  IF v_admin IS NULL THEN
    -- No dedicated admin: the organizer doubles as a TRANSIENT admin for
    -- TEST 1/2/5 (via the same flag mechanism the admin RPCs use), then is
    -- restored to organizer before the check-in tests. All rolled back.
    PERFORM set_config('app.allow_restricted_update', 'on', true);
    UPDATE profiles SET role = 'admin' WHERE id = v_org;
    v_admin := v_org;
    RAISE NOTICE 'NOTE: no admin profile; organizer % acts as transient admin (restored + rolled back)', v_org;
  END IF;

  PERFORM set_config('phase0.admin', v_admin::text, true);
  PERFORM set_config('phase0.student', v_student::text, true);
  PERFORM set_config('phase0.org', v_org::text, true);
END $$;

-- ── Helper: act as a given user id ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION pg_temp.act_as(p_user uuid) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', p_user::text, true);
  PERFORM set_config('request.jwt.claim.role', 'authenticated', true);
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', p_user::text, 'role', 'authenticated')::text, true);
END;
$$ LANGUAGE plpgsql;

-- ── TEST 1 (positive): admin can change a role via RPC ────────────────────────
DO $$
DECLARE v_admin uuid := current_setting('phase0.admin', true)::uuid;
DECLARE v_student uuid := current_setting('phase0.student', true)::uuid;
DECLARE v role_enum;
BEGIN
  PERFORM pg_temp.act_as(v_admin);
  PERFORM admin_update_user_role(v_student, 'organizer');
  SELECT role INTO v FROM profiles WHERE id = v_student;
  IF v = 'organizer' THEN RAISE NOTICE 'TEST 1 admin_update_user_role: PASS';
  ELSE RAISE EXCEPTION 'TEST 1 admin_update_user_role: FAIL (role=%)', v; END IF;
END $$;

-- ── TEST 2 (positive): admin can ban via RPC ──────────────────────────────────
DO $$
DECLARE v_admin uuid := current_setting('phase0.admin', true)::uuid;
DECLARE v_student uuid := current_setting('phase0.student', true)::uuid;
DECLARE v boolean;
BEGIN
  PERFORM pg_temp.act_as(v_admin);
  PERFORM admin_toggle_user_ban(v_student, true);
  SELECT is_banned INTO v FROM profiles WHERE id = v_student;
  IF v THEN RAISE NOTICE 'TEST 2 admin_toggle_user_ban: PASS';
  ELSE RAISE EXCEPTION 'TEST 2 admin_toggle_user_ban: FAIL'; END IF;
END $$;

-- ── TEST 3 (negative): student direct role update must fail ───────────────────
-- NOTE: the bypass flag is transaction-scoped, and this whole file is one
-- transaction, so reset it explicitly here. This mirrors production, where
-- each API request runs in its own transaction (and since migration 0018 the
-- admin RPCs reset the flag themselves after use).
DO $$
DECLARE v_student uuid := current_setting('phase0.student', true)::uuid;
BEGIN
  PERFORM set_config('app.allow_restricted_update', 'off', true);
  PERFORM pg_temp.act_as(v_student);
  UPDATE profiles SET role = 'admin' WHERE id = v_student;
  RAISE EXCEPTION 'TEST 3 student role self-escalation: FAIL (update allowed)';
EXCEPTION WHEN OTHERS THEN
  IF SQLERRM LIKE '%Cannot update restricted fields directly%' THEN
    RAISE NOTICE 'TEST 3 student role self-escalation blocked: PASS';
  ELSE RAISE; END IF;
END $$;

-- ── TEST 4 (negative): student direct ban-flag update must fail ────────────────
DO $$
DECLARE v_student uuid := current_setting('phase0.student', true)::uuid;
BEGIN
  PERFORM pg_temp.act_as(v_student);
  UPDATE profiles SET is_banned = false WHERE id = v_student;
  RAISE EXCEPTION 'TEST 4 student ban-flag write: FAIL (update allowed)';
EXCEPTION WHEN OTHERS THEN
  IF SQLERRM LIKE '%Cannot update restricted fields directly%' THEN
    RAISE NOTICE 'TEST 4 student ban-flag write blocked: PASS';
  ELSE RAISE; END IF;
END $$;

-- ── TEST 5 (negative): non-admin RPC call must fail ─────────────────────────────
DO $$
DECLARE v_admin uuid := current_setting('phase0.admin', true)::uuid;
DECLARE v_student uuid := current_setting('phase0.student', true)::uuid;
BEGIN
  PERFORM pg_temp.act_as(v_student);
  PERFORM admin_update_user_role(v_admin, 'student');
  RAISE EXCEPTION 'TEST 5 non-admin RPC: FAIL (allowed)';
EXCEPTION WHEN OTHERS THEN
  IF SQLERRM LIKE '%Unauthorized%' THEN
    RAISE NOTICE 'TEST 5 non-admin RPC rejected: PASS';
  ELSE RAISE; END IF;
END $$;

-- ── Restore organizer (if it acted as transient admin) ────────────────────────
-- Check-in TESTs 6-8 must exercise the pure-organizer branch, not the admin one.
DO $$
DECLARE
  v_org uuid := current_setting('phase0.org', true)::uuid;
  v_admin uuid := current_setting('phase0.admin', true)::uuid;
  v_role role_enum;
BEGIN
  IF v_org = v_admin THEN
    PERFORM set_config('app.allow_restricted_update', 'on', true);
    UPDATE profiles SET role = 'organizer' WHERE id = v_org;
  END IF;
  SELECT role INTO v_role FROM profiles WHERE id = v_org;
  IF v_role != 'organizer' THEN
    RAISE EXCEPTION 'Check-in fixture error: expected organizer, got %', v_role;
  END IF;
  RAISE NOTICE 'Organizer branch armed for check-in tests: PASS';
END $$;

-- ── Check-in fixtures (rolled back at the end) ─────────────────────────────────
DO $$
DECLARE
  v_org uuid := current_setting('phase0.org', true)::uuid;
  v_admin uuid := current_setting('phase0.admin', true)::uuid;
  v_student uuid := current_setting('phase0.student', true)::uuid;
BEGIN
  INSERT INTO events (id, organizer_id, title, start_time, end_time, location, capacity, is_unpublished)
  VALUES
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', v_org, 'Phase0 Event A', now() + interval '1 day', now() + interval '2 days', 'Hall A', 50, false),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', v_admin, 'Phase0 Event B', now() + interval '1 day', now() + interval '2 days', 'Hall B', 50, false);

  INSERT INTO registrations (event_id, user_id, status, ticket_id, attended)
  VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', v_student, 'registered', 'PHASE0-TICKET-1', false);
END $$;

-- ── TEST 6 (negative): ticket of A scanned on B's page must be rejected ─────────
DO $$
DECLARE v_org uuid := current_setting('phase0.org', true)::uuid;
DECLARE r text;
BEGIN
  PERFORM pg_temp.act_as(v_org);
  SELECT check_in_by_ticket('PHASE0-TICKET-1', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02') INTO r;
  IF r = 'event_mismatch' THEN RAISE NOTICE 'TEST 6 wrong-event check-in rejected: PASS';
  ELSE RAISE EXCEPTION 'TEST 6 wrong-event check-in: FAIL (got %)', r; END IF;
END $$;

-- ── TEST 7 (positive): correct event checks in ────────────────────────────────────
DO $$
DECLARE v_org uuid := current_setting('phase0.org', true)::uuid;
DECLARE r text;
BEGIN
  PERFORM pg_temp.act_as(v_org);
  SELECT check_in_by_ticket('PHASE0-TICKET-1', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01') INTO r;
  IF r = 'success' THEN RAISE NOTICE 'TEST 7 correct-event check-in: PASS';
  ELSE RAISE EXCEPTION 'TEST 7 correct-event check-in: FAIL (got %)', r; END IF;
END $$;

-- ── TEST 8: double check-in is idempotent ───────────────────────────────────────────
DO $$
DECLARE v_org uuid := current_setting('phase0.org', true)::uuid;
DECLARE r text;
BEGIN
  PERFORM pg_temp.act_as(v_org);
  SELECT check_in_by_ticket('PHASE0-TICKET-1', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01') INTO r;
  IF r = 'already_checked_in' THEN RAISE NOTICE 'TEST 8 double check-in idempotent: PASS';
  ELSE RAISE EXCEPTION 'TEST 8 double check-in: FAIL (got %)', r; END IF;
END $$;

-- ── Cleanup + rollback (nothing persists) ───────────────────────────────────────────
DELETE FROM registrations WHERE ticket_id = 'PHASE0-TICKET-1';
DELETE FROM events WHERE id IN ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02');

ROLLBACK;
