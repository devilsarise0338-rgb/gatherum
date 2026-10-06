-- 0026_profile_quality.sql
-- Why this exists (plain words): two roll numbers differing only by case
-- ("ABC123" vs "abc123") could both exist, and new profiles defaulted to
-- public RSVPs. The unique index below is partial (ignores NULL/empty) and
-- was verified duplicate-free on 2026-10-06 before writing. Only NEW rows get
-- public_rsvp = false; existing users' choices are untouched. NOT applied
-- live in this session (awaiting approval).

-- Case-insensitive uniqueness for real roll numbers only.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_roll_number_unique_ci
  ON profiles (lower(roll_number))
  WHERE roll_number IS NOT NULL AND btrim(roll_number) != '';

-- New profiles default to private RSVPs; existing rows keep their value.
ALTER TABLE profiles ALTER COLUMN public_rsvp SET DEFAULT false;
