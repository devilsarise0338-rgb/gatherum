-- ROLLBACK for 0022_private_helpers.sql — UNTESTED (no local DB available).
-- Preconditions: 0026..0023 already rolled back (reverse order). If 0023 was
-- applied, roll it back FIRST so get_event_organizer_summary is back on its
-- 0022 form before the policies below are restored; the helper swap itself
-- is order-independent.
-- Restores the three public helpers, all 21 policies with public.* references
-- (definitions match live pre-0022 state, verified via pg_policies capture on
-- 2026-10-06), the 0016 organizer-summary body, and the 0020-era grants.

-- ── 1. Public helpers (0001 bodies, verbatim) ────────────────────────────────
CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS role_enum AS $$
  SELECT role FROM public.profiles WHERE id = (select auth.uid());
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_event_organizer(p_event_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.events WHERE id = p_event_id AND organizer_id = (select auth.uid()));
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION is_event_team_member(p_event_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.event_team WHERE event_id = p_event_id AND user_id = (select auth.uid()));
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- ── 2. Policies with public.* references ─────────────────────────────────────
DROP POLICY IF EXISTS "Platform settings are insertable by admins" ON platform_settings;
CREATE POLICY "Platform settings are insertable by admins" ON platform_settings FOR INSERT WITH CHECK (get_auth_role() = 'admin');
DROP POLICY IF EXISTS "Platform settings are updatable by admins" ON platform_settings;
CREATE POLICY "Platform settings are updatable by admins" ON platform_settings FOR UPDATE USING (get_auth_role() = 'admin');
DROP POLICY IF EXISTS "Platform settings are deletable by admins" ON platform_settings;
CREATE POLICY "Platform settings are deletable by admins" ON platform_settings FOR DELETE USING (get_auth_role() = 'admin');

DROP POLICY IF EXISTS "Profiles are readable by owner or admin" ON profiles;
CREATE POLICY "Profiles are readable by owner or admin" ON profiles FOR SELECT USING ((select auth.uid()) = id OR get_auth_role() = 'admin');

DROP POLICY IF EXISTS "Events are readable by public (published) or organizers/team/admin" ON events;
CREATE POLICY "Events are readable by public (published) or organizers/team/admin" ON events FOR SELECT USING (
  is_unpublished = false OR
  organizer_id = (select auth.uid()) OR
  is_event_team_member(id) OR
  get_auth_role() = 'admin'
);
DROP POLICY IF EXISTS "Events are insertable by organizer or admin" ON events;
CREATE POLICY "Events are insertable by organizer or admin" ON events FOR INSERT WITH CHECK (
  ((select auth.uid()) = organizer_id AND get_auth_role() IN ('organizer', 'admin'))
  OR get_auth_role() = 'admin'
);
DROP POLICY IF EXISTS "Events are updatable by organizer or admin" ON events;
CREATE POLICY "Events are updatable by organizer or admin" ON events FOR UPDATE USING (
  (select auth.uid()) = organizer_id OR get_auth_role() = 'admin'
);
DROP POLICY IF EXISTS "Events are deletable by organizer or admin" ON events;
CREATE POLICY "Events are deletable by organizer or admin" ON events FOR DELETE USING (
  (select auth.uid()) = organizer_id OR get_auth_role() = 'admin'
);

DROP POLICY IF EXISTS "Registrations are readable by owner, event organizer, team, or admin" ON registrations;
CREATE POLICY "Registrations are readable by owner, event organizer, team, or admin" ON registrations FOR SELECT USING (
  user_id = (select auth.uid()) OR
  is_event_organizer(event_id) OR
  is_event_team_member(event_id) OR
  get_auth_role() = 'admin'
);
DROP POLICY IF EXISTS "Registrations are deletable by owner, event organizer, or admin" ON registrations;
CREATE POLICY "Registrations are deletable by owner, event organizer, or admin" ON registrations FOR DELETE USING (
  user_id = (select auth.uid()) OR
  is_event_organizer(event_id) OR
  get_auth_role() = 'admin'
);

DROP POLICY IF EXISTS "Event templates are readable by owner or admin" ON event_templates;
CREATE POLICY "Event templates are readable by owner or admin" ON event_templates FOR SELECT USING (organizer_id = (select auth.uid()) OR get_auth_role() = 'admin');
DROP POLICY IF EXISTS "Event templates are insertable by owner or admin" ON event_templates;
CREATE POLICY "Event templates are insertable by owner or admin" ON event_templates FOR INSERT WITH CHECK (organizer_id = (select auth.uid()) OR get_auth_role() = 'admin');
DROP POLICY IF EXISTS "Event templates are updatable by owner or admin" ON event_templates;
CREATE POLICY "Event templates are updatable by owner or admin" ON event_templates FOR UPDATE USING (organizer_id = (select auth.uid()) OR get_auth_role() = 'admin');
DROP POLICY IF EXISTS "Event templates are deletable by owner or admin" ON event_templates;
CREATE POLICY "Event templates are deletable by owner or admin" ON event_templates FOR DELETE USING (organizer_id = (select auth.uid()) OR get_auth_role() = 'admin');

DROP POLICY IF EXISTS "Announcements are readable by public (published events) or organizers/team/admin" ON announcements;
CREATE POLICY "Announcements are readable by public (published events) or organizers/team/admin" ON announcements FOR SELECT USING (
  EXISTS (SELECT 1 FROM events WHERE id = event_id AND is_unpublished = false) OR
  organizer_id = (select auth.uid()) OR
  is_event_team_member(event_id) OR
  get_auth_role() = 'admin'
);
DROP POLICY IF EXISTS "Announcements are insertable by organizer or admin" ON announcements;
CREATE POLICY "Announcements are insertable by organizer or admin" ON announcements FOR INSERT WITH CHECK (
  (organizer_id = (select auth.uid()) AND (is_event_organizer(event_id) OR is_event_team_member(event_id)))
  OR get_auth_role() = 'admin'
);
DROP POLICY IF EXISTS "Announcements are updatable by organizer or admin" ON announcements;
CREATE POLICY "Announcements are updatable by organizer or admin" ON announcements FOR UPDATE USING (
  organizer_id = (select auth.uid()) OR get_auth_role() = 'admin'
);
DROP POLICY IF EXISTS "Announcements are deletable by organizer or admin" ON announcements;
CREATE POLICY "Announcements are deletable by organizer or admin" ON announcements FOR DELETE USING (
  organizer_id = (select auth.uid()) OR get_auth_role() = 'admin'
);

DROP POLICY IF EXISTS "Feedbacks are readable by student or organizer/admin after event" ON feedbacks;
CREATE POLICY "Feedbacks are readable by student or organizer/admin after event" ON feedbacks FOR SELECT USING (
  user_id = (select auth.uid()) OR
  (is_event_organizer(event_id) OR get_auth_role() = 'admin')
);

DROP POLICY IF EXISTS "Event team is readable by member, organizer, or admin" ON event_team;
CREATE POLICY "Event team is readable by member, organizer, or admin" ON event_team FOR SELECT USING (
  user_id = (select auth.uid()) OR
  is_event_organizer(event_id) OR
  get_auth_role() = 'admin'
);

DROP POLICY IF EXISTS "Calendar follows are readable by follower, followed organizer, or admin" ON calendar_follows;
CREATE POLICY "Calendar follows are readable by follower, followed organizer, or admin" ON calendar_follows FOR SELECT USING (
  follower_id = (select auth.uid()) OR
  followed_organizer_id = (select auth.uid()) OR
  get_auth_role() = 'admin'
);

-- ── 3. Organizer summary back to the 0016 body ────────────────────────────────
CREATE OR REPLACE FUNCTION get_event_organizer_summary(p_event_id uuid)
RETURNS TABLE (full_name text, avatar_url text) AS $$
  SELECT p.full_name, p.avatar_url
  FROM events e
  JOIN profiles p ON p.id = e.organizer_id
  WHERE e.id = p_event_id
    AND (
      e.is_unpublished = false
      OR e.organizer_id = (select auth.uid())
      OR is_event_team_member(e.id)
      OR get_auth_role() = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE;

-- ── 4. Grants back to the pre-0022 (0020-era) state ───────────────────────────
GRANT EXECUTE ON FUNCTION public.get_auth_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_event_organizer(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_event_team_member(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_event_organizer_summary(uuid) TO anon, authenticated;

-- The private schema is left in place but unused (harmless, unexposed).
-- To remove it entirely (only when nothing references it):
--   DROP SCHEMA private CASCADE;  -- DESTRUCTIVE, needs explicit approval.

-- Keep migration history consistent if you abandon 0022 (not if re-applying):
--   DELETE FROM supabase_migrations.schema_migrations WHERE version = '0022';
