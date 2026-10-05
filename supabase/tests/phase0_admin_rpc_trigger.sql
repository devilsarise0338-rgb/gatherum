-- Phase 0A verification test: admin RPCs vs. profiles trigger + check-in binding.
-- THIS FILE IS NOT A MIGRATION. Run it manually against a scratch database:
--
--   supabase db reset                       # clean local DB, applies 0001..0013
--   supabase db execute -f supabase/tests/phase0_admin_rpc_trigger.sql
--   # or: psql "$POSTGRES_URL" -f supabase/tests/phase0_admin_rpc_trigger.sql
--
-- Uses throwaway UUIDs only. All assertions print NOTICE lines ending in
-- PASS or FAIL. Any FAIL aborts the transaction (ROLLBACK).
--
-- Simulates JWTs the way PostgREST does: auth.uid() reads
-- request.jwt.claim.sub, auth.role() reads request.jwt.claim.role.

BEGIN;

-- ── Fixtures (direct inserts as DB owner; RLS is not involved here) ──────────
INSERT INTO profiles (id, role, email, full_name, profile_completed)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin',   'phase0-admin@test.local',   'Phase0 Admin',   true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'student', 'phase0-student@test.local', 'Phase0 Student', true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'student', 'phase0-org@test.local',     'Phase0 Org',     true)
ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

-- ── TEST 1 (positive): admin can change a role via RPC ────────────────────────
SELECT set_config('request.jwt.claim.sub',  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', true);
SELECT set_config('request.jwt.claim.role', 'authenticated', true);
SELECT set_config('request.jwt.claims',
  '{"sub":"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11","role":"authenticated"}', true);

SELECT admin_update_user_role('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'organizer');
DO $$
DECLARE v role_enum;
BEGIN
  SELECT role INTO v FROM profiles WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
  IF v = 'organizer' THEN RAISE NOTICE 'TEST 1 admin_update_user_role: PASS';
  ELSE RAISE EXCEPTION 'TEST 1 admin_update_user_role: FAIL (role=%)', v; END IF;
END $$;

-- ── TEST 2 (positive): admin can ban via RPC ──────────────────────────────────
SELECT admin_toggle_user_ban('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', true);
DO $$
DECLARE v boolean;
BEGIN
  SELECT is_banned INTO v FROM profiles WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
  IF v THEN RAISE NOTICE 'TEST 2 admin_toggle_user_ban: PASS';
  ELSE RAISE EXCEPTION 'TEST 2 admin_toggle_user_ban: FAIL'; END IF;
END $$;

-- ── TEST 3 (negative): student direct role update must fail ───────────────────
SELECT set_config('request.jwt.claim.sub',  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', true);
SELECT set_config('request.jwt.claims',
  '{"sub":"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22","role":"authenticated"}', true);
DO $$
BEGIN
  UPDATE profiles SET role = 'admin' WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
  RAISE EXCEPTION 'TEST 3 student role self-escalation: FAIL (update allowed)';
EXCEPTION WHEN OTHERS THEN
  IF SQLERRM LIKE '%Cannot update restricted fields directly%' THEN
    RAISE NOTICE 'TEST 3 student role self-escalation blocked: PASS';
  ELSE RAISE; END IF;
END $$;

-- ── TEST 4 (negative): student direct unban must fail ─────────────────────────
DO $$
BEGIN
  UPDATE profiles SET is_banned = false WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
  RAISE EXCEPTION 'TEST 4 student self-unban: FAIL (update allowed)';
EXCEPTION WHEN OTHERS THEN
  IF SQLERRM LIKE '%Cannot update restricted fields directly%' THEN
    RAISE NOTICE 'TEST 4 student self-unban blocked: PASS';
  ELSE RAISE; END IF;
END $$;

-- ── TEST 5 (negative): non-admin RPC call must fail ───────────────────────────
DO $$
BEGIN
  PERFORM admin_update_user_role('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'student');
  RAISE EXCEPTION 'TEST 5 non-admin RPC: FAIL (allowed)';
EXCEPTION WHEN OTHERS THEN
  IF SQLERRM LIKE '%Unauthorized%' THEN
    RAISE NOTICE 'TEST 5 non-admin RPC rejected: PASS';
  ELSE RAISE; END IF;
END $$;

-- ── Check-in binding fixtures ────────────────────────────────────────────────
INSERT INTO events (id, organizer_id, title, start_time, end_time, location, capacity, is_unpublished)
VALUES
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Phase0 Event A', now() + interval '1 day', now() + interval '2 days', 'Hall A', 50, false),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Phase0 Event B', now() + interval '1 day', now() + interval '2 days', 'Hall B', 50, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO registrations (event_id, user_id, status, ticket_id, attended)
VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'registered', 'PHASE0-TICKET-1', false)
ON CONFLICT (event_id, user_id) DO UPDATE SET status = 'registered', ticket_id = 'PHASE0-TICKET-1', attended = false;

-- Act as the organizer of Event A
SELECT set_config('request.jwt.claim.sub',  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', true);
SELECT set_config('request.jwt.claims',
  '{"sub":"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33","role":"authenticated"}', true);

-- ── TEST 6 (negative): ticket of A scanned on B's page must be rejected ──────
DO $$
DECLARE r text;
BEGIN
  SELECT check_in_by_ticket('PHASE0-TICKET-1', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02') INTO r;
  IF r = 'event_mismatch' THEN RAISE NOTICE 'TEST 6 wrong-event check-in rejected: PASS';
  ELSE RAISE EXCEPTION 'TEST 6 wrong-event check-in: FAIL (got %)', r; END IF;
END $$;

-- ── TEST 7 (positive): correct event checks in ────────────────────────────────
DO $$
DECLARE r text;
BEGIN
  SELECT check_in_by_ticket('PHASE0-TICKET-1', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01') INTO r;
  IF r = 'success' THEN RAISE NOTICE 'TEST 7 correct-event check-in: PASS';
  ELSE RAISE EXCEPTION 'TEST 7 correct-event check-in: FAIL (got %)', r; END IF;
END $$;

-- ── TEST 8: double check-in is idempotent ─────────────────────────────────────
DO $$
DECLARE r text;
BEGIN
  SELECT check_in_by_ticket('PHASE0-TICKET-1', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01') INTO r;
  IF r = 'already_checked_in' THEN RAISE NOTICE 'TEST 8 double check-in idempotent: PASS';
  ELSE RAISE EXCEPTION 'TEST 8 double check-in: FAIL (got %)', r; END IF;
END $$;

-- ── Cleanup fixtures ─────────────────────────────────────────────────────────
DELETE FROM registrations WHERE ticket_id = 'PHASE0-TICKET-1';
DELETE FROM events WHERE id IN ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02');
DELETE FROM profiles WHERE id IN ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33');

ROLLBACK;
