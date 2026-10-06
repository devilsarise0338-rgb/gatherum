-- ROLLBACK for 0026_profile_quality.sql — UNTESTED (no local DB available).
-- Drops the case-insensitive roll-number uniqueness and restores the old
-- public-RSVP default. Existing data is NOT touched (neither direction ever
-- rewrites rows, only the default for future inserts).

DROP INDEX IF EXISTS profiles_roll_number_unique_ci;
ALTER TABLE profiles ALTER COLUMN public_rsvp SET DEFAULT true;

-- Keep migration history consistent if you abandon 0026 (not if re-applying):
--   DELETE FROM supabase_migrations.schema_migrations WHERE version = '0026';
