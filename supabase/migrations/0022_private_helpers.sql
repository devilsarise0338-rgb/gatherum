-- 0022_private_helpers.sql
-- Why this exists (plain words): three helper functions used inside RLS
-- policies lived in the public API schema, so the linter (rightly) flagged
-- them as callable by anon/authenticated. Moving them to a `private` schema
-- removes them from the API entirely, while GRANTs let policies keep working
-- for both anon and logged-in users. Bodies are byte-identical in logic.
-- NOTE: not applied to live DB in this session (awaiting approval).

-- ── 1. Private schema + helpers ──────────────────────────────────────────────
-- `private` is NOT in supabase/config.toml `schemas`, so PostgREST never
-- exposes it. USAGE lets policies resolve the names; nothing else is granted.
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

-- Stop future private-schema functions from auto-exposing (same leak as 0020).
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA private
  REVOKE ALL ON FUNCTIONS FROM anon, authenticated, PUBLIC;

-- Empty search_path + fully qualified names: nothing attacker-controlled can
-- shadow these lookups. STABLE lets Postgres cache per statement.
CREATE OR REPLACE FUNCTION private.get_auth_role()
RETURNS public.role_enum
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = ''
AS $$ SELECT role FROM public.profiles WHERE id = (select auth.uid()); $$;

CREATE OR REPLACE FUNCTION private.is_event_organizer(p_event_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = ''
AS $$ SELECT EXISTS (SELECT 1 FROM public.events WHERE id = p_event_id AND organizer_id = (select auth.uid())); $$;

CREATE OR REPLACE FUNCTION private.is_event_team_member(p_event_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = ''
AS $$ SELECT EXISTS (SELECT 1 FROM public.event_team WHERE event_id = p_event_id AND user_id = (select auth.uid())); $$;

REVOKE ALL ON FUNCTION private.get_auth_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_event_organizer(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_event_team_member(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.get_auth_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_event_organizer(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_event_team_member(uuid) TO anon, authenticated;

-- ── 2. Recreate every dependent policy against private.* (same logic) ────────
-- platform_settings
DROP POLICY IF EXISTS "Platform settings are insertable by admins" ON platform_settings;
CREATE POLICY "Platform settings are insertable by admins" ON platform_settings FOR INSERT WITH CHECK (private.get_auth_role() = 'admin');
DROP POLICY IF EXISTS "Platform settings are updatable by admins" ON platform_settings;
CREATE POLICY "Platform settings are updatable by admins" ON platform_settings FOR UPDATE USING (private.get_auth_role() = 'admin');
DROP POLICY IF EXISTS "Platform settings are deletable by admins" ON platform_settings;
CREATE POLICY "Platform settings are deletable by admins" ON platform_settings FOR DELETE USING (private.get_auth_role() = 'admin');

-- profiles
DROP POLICY IF EXISTS "Profiles are readable by owner or admin" ON profiles;
CREATE POLICY "Profiles are readable by owner or admin" ON profiles FOR SELECT USING ((select auth.uid()) = id OR private.get_auth_role() = 'admin');

-- events
DROP POLICY IF EXISTS "Events are readable by public (published) or organizers/team/admin" ON events;
CREATE POLICY "Events are readable by public (published) or organizers/team/admin" ON events FOR SELECT USING (
  is_unpublished = false OR
  organizer_id = (select auth.uid()) OR
  private.is_event_team_member(id) OR
  private.get_auth_role() = 'admin'
);
DROP POLICY IF EXISTS "Events are insertable by organizer or admin" ON events;
CREATE POLICY "Events are insertable by organizer or admin" ON events FOR INSERT WITH CHECK (
  ((select auth.uid()) = organizer_id AND private.get_auth_role() IN ('organizer', 'admin'))
  OR private.get_auth_role() = 'admin'
);
DROP POLICY IF EXISTS "Events are updatable by organizer or admin" ON events;
CREATE POLICY "Events are updatable by organizer or admin" ON events FOR UPDATE USING (
  (select auth.uid()) = organizer_id OR private.get_auth_role() = 'admin'
);
DROP POLICY IF EXISTS "Events are deletable by organizer or admin" ON events;
CREATE POLICY "Events are deletable by organizer or admin" ON events FOR DELETE USING (
  (select auth.uid()) = organizer_id OR private.get_auth_role() = 'admin'
);

-- registrations
DROP POLICY IF EXISTS "Registrations are readable by owner, event organizer, team, or admin" ON registrations;
CREATE POLICY "Registrations are readable by owner, event organizer, team, or admin" ON registrations FOR SELECT USING (
  user_id = (select auth.uid()) OR
  private.is_event_organizer(event_id) OR
  private.is_event_team_member(event_id) OR
  private.get_auth_role() = 'admin'
);
DROP POLICY IF EXISTS "Registrations are deletable by owner, event organizer, or admin" ON registrations;
CREATE POLICY "Registrations are deletable by owner, event organizer, or admin" ON registrations FOR DELETE USING (
  user_id = (select auth.uid()) OR
  private.is_event_organizer(event_id) OR
  private.get_auth_role() = 'admin'
);

-- event_templates
DROP POLICY IF EXISTS "Event templates are readable by owner or admin" ON event_templates;
CREATE POLICY "Event templates are readable by owner or admin" ON event_templates FOR SELECT USING (organizer_id = (select auth.uid()) OR private.get_auth_role() = 'admin');
DROP POLICY IF EXISTS "Event templates are insertable by owner or admin" ON event_templates;
CREATE POLICY "Event templates are insertable by owner or admin" ON event_templates FOR INSERT WITH CHECK (organizer_id = (select auth.uid()) OR private.get_auth_role() = 'admin');
DROP POLICY IF EXISTS "Event templates are updatable by owner or admin" ON event_templates;
CREATE POLICY "Event templates are updatable by owner or admin" ON event_templates FOR UPDATE USING (organizer_id = (select auth.uid()) OR private.get_auth_role() = 'admin');
DROP POLICY IF EXISTS "Event templates are deletable by owner or admin" ON event_templates;
CREATE POLICY "Event templates are deletable by owner or admin" ON event_templates FOR DELETE USING (organizer_id = (select auth.uid()) OR private.get_auth_role() = 'admin');

-- announcements
DROP POLICY IF EXISTS "Announcements are readable by public (published events) or organizers/team/admin" ON announcements;
CREATE POLICY "Announcements are readable by public (published events) or organizers/team/admin" ON announcements FOR SELECT USING (
  EXISTS (SELECT 1 FROM events WHERE id = event_id AND is_unpublished = false) OR
  organizer_id = (select auth.uid()) OR
  private.is_event_team_member(event_id) OR
  private.get_auth_role() = 'admin'
);
DROP POLICY IF EXISTS "Announcements are insertable by organizer or admin" ON announcements;
CREATE POLICY "Announcements are insertable by organizer or admin" ON announcements FOR INSERT WITH CHECK (
  (organizer_id = (select auth.uid()) AND (private.is_event_organizer(event_id) OR private.is_event_team_member(event_id)))
  OR private.get_auth_role() = 'admin'
);
DROP POLICY IF EXISTS "Announcements are updatable by organizer or admin" ON announcements;
CREATE POLICY "Announcements are updatable by organizer or admin" ON announcements FOR UPDATE USING (
  organizer_id = (select auth.uid()) OR private.get_auth_role() = 'admin'
);
DROP POLICY IF EXISTS "Announcements are deletable by organizer or admin" ON announcements;
CREATE POLICY "Announcements are deletable by organizer or admin" ON announcements FOR DELETE USING (
  organizer_id = (select auth.uid()) OR private.get_auth_role() = 'admin'
);

-- feedbacks (read only; the INSERT policy uses no helpers)
DROP POLICY IF EXISTS "Feedbacks are readable by student or organizer/admin after event" ON feedbacks;
CREATE POLICY "Feedbacks are readable by student or organizer/admin after event" ON feedbacks FOR SELECT USING (
  user_id = (select auth.uid()) OR
  (private.is_event_organizer(event_id) OR private.get_auth_role() = 'admin')
);

-- event_team
DROP POLICY IF EXISTS "Event team is readable by member, organizer, or admin" ON event_team;
CREATE POLICY "Event team is readable by member, organizer, or admin" ON event_team FOR SELECT USING (
  user_id = (select auth.uid()) OR
  private.is_event_organizer(event_id) OR
  private.get_auth_role() = 'admin'
);

-- calendar_follows
DROP POLICY IF EXISTS "Calendar follows are readable by follower, followed organizer, or admin" ON calendar_follows;
CREATE POLICY "Calendar follows are readable by follower, followed organizer, or admin" ON calendar_follows FOR SELECT USING (
  follower_id = (select auth.uid()) OR
  followed_organizer_id = (select auth.uid()) OR
  private.get_auth_role() = 'admin'
);

-- ── 3. Point the one function body that calls the helpers at private.* ──────
CREATE OR REPLACE FUNCTION get_event_organizer_summary(p_event_id uuid)
RETURNS TABLE (full_name text, avatar_url text) AS $$
  SELECT p.full_name, p.avatar_url
  FROM events e
  JOIN profiles p ON p.id = e.organizer_id
  WHERE e.id = p_event_id
    AND (
      e.is_unpublished = false
      OR e.organizer_id = (select auth.uid())
      OR private.is_event_team_member(e.id)
      OR private.get_auth_role() = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION get_event_organizer_summary(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_event_organizer_summary(uuid) TO anon, authenticated;

-- ── 4. Drop the public helpers (no CASCADE: fails loudly if anything still ──
-- depends on them, rolling the whole migration back instead of breaking it).
DROP FUNCTION IF EXISTS public.get_auth_role();
DROP FUNCTION IF EXISTS public.is_event_organizer(uuid);
DROP FUNCTION IF EXISTS public.is_event_team_member(uuid);
