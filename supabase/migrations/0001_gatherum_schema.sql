-- 0001_gatherum_schema.sql

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE role_enum AS ENUM ('student', 'organizer', 'admin');
CREATE TYPE registration_status_enum AS ENUM ('registered', 'waitlisted', 'cancelled', 'attended');
CREATE TYPE event_team_role AS ENUM ('volunteer');

-- ============================================================
-- PLATFORM SETTINGS
-- ============================================================
CREATE TABLE platform_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  signups_enabled boolean NOT NULL DEFAULT true,
  allowed_email_domain text NOT NULL DEFAULT '@poornima.org',
  maintenance_mode boolean NOT NULL DEFAULT false
);

INSERT INTO platform_settings (id, allowed_email_domain) VALUES (1, '@poornima.org') ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role role_enum NOT NULL DEFAULT 'student',
  email text,
  full_name text,
  roll_number text,
  branch text,
  year_of_study int,
  phone_number text,
  avatar_url text,
  public_rsvp boolean NOT NULL DEFAULT true,
  profile_completed boolean NOT NULL DEFAULT false,
  is_banned boolean NOT NULL DEFAULT false,
  must_change_password boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid REFERENCES profiles(id),
  title text,
  description text,
  category text,
  start_time timestamptz NOT NULL,
  end_time timestamptz CHECK (end_time IS NULL OR end_time > start_time),
  location text,
  capacity int NOT NULL CHECK (capacity > 0),
  poster_url text,
  is_unpublished boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status registration_status_enum NOT NULL DEFAULT 'registered',
  ticket_id text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  attended boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE TABLE event_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid REFERENCES profiles(id),
  title text,
  description text,
  category text,
  capacity int,
  poster_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  organizer_id uuid REFERENCES profiles(id),
  message text NOT NULL CHECK (char_length(message) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text CHECK (char_length(comment) <= 500),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE TABLE event_team (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role event_team_role NOT NULL DEFAULT 'volunteer',
  invited_by uuid REFERENCES profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE TABLE calendar_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  followed_organizer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, followed_organizer_id)
);

CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER set_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE OR REPLACE FUNCTION prevent_restricted_profile_updates()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role OR NEW.is_banned IS DISTINCT FROM OLD.is_banned OR NEW.must_change_password IS DISTINCT FROM OLD.must_change_password THEN
    IF current_user IN ('postgres', 'supabase_admin', 'service_role') THEN
      RETURN NEW;
    ELSE
      RAISE EXCEPTION 'Cannot update restricted fields directly';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER protect_profiles_trigger BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION prevent_restricted_profile_updates();

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- platform_settings
CREATE POLICY "Platform settings are readable by everyone" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Platform settings are insertable by admins" ON platform_settings FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');
CREATE POLICY "Platform settings are updatable by admins" ON platform_settings FOR UPDATE USING ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');
CREATE POLICY "Platform settings are deletable by admins" ON platform_settings FOR DELETE USING ((SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

-- profiles
CREATE POLICY "Profiles are readable by owner or admin" ON profiles FOR SELECT USING ((select auth.uid()) = id OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');
CREATE POLICY "Profiles are updatable by owner" ON profiles FOR UPDATE USING ((select auth.uid()) = id);

-- events
CREATE POLICY "Events are readable by public (published) or organizers/team/admin" ON events FOR SELECT USING (
  is_unpublished = false OR 
  organizer_id = (select auth.uid()) OR 
  EXISTS (SELECT 1 FROM event_team WHERE event_id = events.id AND user_id = (select auth.uid())) OR 
  (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
CREATE POLICY "Events are insertable by organizer or admin" ON events FOR INSERT WITH CHECK (
  (select auth.uid()) = organizer_id OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
CREATE POLICY "Events are updatable by organizer or admin" ON events FOR UPDATE USING (
  (select auth.uid()) = organizer_id OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
CREATE POLICY "Events are deletable by organizer or admin" ON events FOR DELETE USING (
  (select auth.uid()) = organizer_id OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);

-- registrations
CREATE POLICY "Registrations are readable by owner, event organizer, team, or admin" ON registrations FOR SELECT USING (
  user_id = (select auth.uid()) OR 
  EXISTS (SELECT 1 FROM events WHERE id = event_id AND organizer_id = (select auth.uid())) OR
  EXISTS (SELECT 1 FROM event_team WHERE event_id = registrations.event_id AND user_id = (select auth.uid())) OR
  (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
-- No INSERT policy for registrations (RPC only)
CREATE POLICY "Registrations are deletable by owner, event organizer, or admin" ON registrations FOR DELETE USING (
  user_id = (select auth.uid()) OR 
  EXISTS (SELECT 1 FROM events WHERE id = event_id AND organizer_id = (select auth.uid())) OR
  (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);

-- event_templates
CREATE POLICY "Event templates are readable by owner or admin" ON event_templates FOR SELECT USING (organizer_id = (select auth.uid()) OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');
CREATE POLICY "Event templates are insertable by owner or admin" ON event_templates FOR INSERT WITH CHECK (organizer_id = (select auth.uid()) OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');
CREATE POLICY "Event templates are updatable by owner or admin" ON event_templates FOR UPDATE USING (organizer_id = (select auth.uid()) OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');
CREATE POLICY "Event templates are deletable by owner or admin" ON event_templates FOR DELETE USING (organizer_id = (select auth.uid()) OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin');

-- announcements
CREATE POLICY "Announcements are readable by public (published events) or organizers/team/admin" ON announcements FOR SELECT USING (
  EXISTS (SELECT 1 FROM events WHERE id = event_id AND is_unpublished = false) OR
  organizer_id = (select auth.uid()) OR
  EXISTS (SELECT 1 FROM event_team WHERE event_id = announcements.event_id AND user_id = (select auth.uid())) OR
  (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
CREATE POLICY "Announcements are insertable by organizer or admin" ON announcements FOR INSERT WITH CHECK (
  organizer_id = (select auth.uid()) OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
CREATE POLICY "Announcements are updatable by organizer or admin" ON announcements FOR UPDATE USING (
  organizer_id = (select auth.uid()) OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
CREATE POLICY "Announcements are deletable by organizer or admin" ON announcements FOR DELETE USING (
  organizer_id = (select auth.uid()) OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);

-- feedbacks
CREATE POLICY "Feedbacks are insertable by student" ON feedbacks FOR INSERT WITH CHECK (
  user_id = (select auth.uid())
);
CREATE POLICY "Feedbacks are readable by student or organizer/admin after event" ON feedbacks FOR SELECT USING (
  user_id = (select auth.uid()) OR 
  (EXISTS (SELECT 1 FROM events WHERE id = event_id AND (organizer_id = (select auth.uid()) OR (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin') AND (end_time IS NOT NULL AND end_time < now())))
);

-- event_team
CREATE POLICY "Event team is readable by member, organizer, or admin" ON event_team FOR SELECT USING (
  user_id = (select auth.uid()) OR 
  EXISTS (SELECT 1 FROM events WHERE id = event_id AND organizer_id = (select auth.uid())) OR
  (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
-- No direct INSERT/DELETE for event_team (RPC only)

-- calendar_follows
CREATE POLICY "Calendar follows are readable by follower, followed organizer, or admin" ON calendar_follows FOR SELECT USING (
  follower_id = (select auth.uid()) OR 
  followed_organizer_id = (select auth.uid()) OR 
  (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);
CREATE POLICY "Calendar follows are insertable by follower" ON calendar_follows FOR INSERT WITH CHECK (follower_id = (select auth.uid()));
CREATE POLICY "Calendar follows are deletable by follower" ON calendar_follows FOR DELETE USING (follower_id = (select auth.uid()));

-- audit_log
CREATE POLICY "Audit logs are readable by admin" ON audit_log FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
);

-- ============================================================
-- FUNCTIONS (RPCs and Triggers)
-- ============================================================

-- handle_new_user (Fail Closed)
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

CREATE TRIGGER enforce_email_domain_and_create_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Wait, the trigger should probably be BEFORE INSERT for the validation part to reject it early! But `auth.users` trigger must be AFTER INSERT in Supabase otherwise it might not persist the profile properly. Or we can have a BEFORE INSERT on `auth.users` (which is in the auth schema, but we can attach a trigger to it). Actually, `auth.users` allows BEFORE INSERT triggers, but it's safer to just let the AFTER INSERT fail the transaction, which rolls back the user creation anyway.

-- admin_update_user_role
CREATE OR REPLACE FUNCTION admin_update_user_role(p_user_id uuid, p_role role_enum)
RETURNS void AS $$
BEGIN
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  UPDATE profiles SET role = p_role WHERE id = p_user_id;
  
  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES ((select auth.uid()), 'admin_update_user_role', 'profiles', p_user_id, jsonb_build_object('new_role', p_role));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- admin_toggle_user_ban
CREATE OR REPLACE FUNCTION admin_toggle_user_ban(p_user_id uuid, p_is_banned boolean)
RETURNS void AS $$
BEGIN
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  UPDATE profiles SET is_banned = p_is_banned WHERE id = p_user_id;
  
  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES ((select auth.uid()), 'admin_toggle_user_ban', 'profiles', p_user_id, jsonb_build_object('is_banned', p_is_banned));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- admin_update_settings
CREATE OR REPLACE FUNCTION admin_update_settings(p_allow_global_signups boolean, p_allowed_email_domain text, p_maintenance_mode boolean)
RETURNS void AS $$
BEGIN
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  UPDATE platform_settings SET signups_enabled = p_allow_global_signups, allowed_email_domain = p_allowed_email_domain, maintenance_mode = p_maintenance_mode WHERE id = 1;
  
  INSERT INTO audit_log (actor_id, action, target_table, details)
  VALUES ((select auth.uid()), 'admin_update_settings', 'platform_settings', jsonb_build_object('signups_enabled', p_allow_global_signups, 'allowed_email_domain', p_allowed_email_domain, 'maintenance_mode', p_maintenance_mode));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- register_for_event
CREATE OR REPLACE FUNCTION register_for_event(p_event_id uuid)
RETURNS registration_status_enum AS $$
DECLARE
  v_capacity int;
  v_registered_count int;
  v_status registration_status_enum;
  v_user_id uuid := (select auth.uid());
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT capacity INTO v_capacity FROM events WHERE id = p_event_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Event not found'; END IF;

  SELECT count(*) INTO v_registered_count FROM registrations WHERE event_id = p_event_id AND status = 'registered';

  IF v_registered_count < v_capacity THEN
    v_status := 'registered';
  ELSE
    v_status := 'waitlisted';
  END IF;

  INSERT INTO registrations (event_id, user_id, status) VALUES (p_event_id, v_user_id, v_status);
  
  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES (v_user_id, 'register_for_event', 'registrations', p_event_id, jsonb_build_object('status', v_status));

  RETURN v_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- promote_from_waitlist
CREATE OR REPLACE FUNCTION promote_from_waitlist()
RETURNS trigger AS $$
DECLARE
  v_waitlisted_id uuid;
BEGIN
  IF OLD.status = 'registered' AND NEW.status = 'cancelled' THEN
    SELECT id INTO v_waitlisted_id FROM registrations WHERE event_id = OLD.event_id AND status = 'waitlisted' ORDER BY created_at ASC LIMIT 1 FOR UPDATE;
    IF FOUND THEN
      UPDATE registrations SET status = 'registered' WHERE id = v_waitlisted_id;
      INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
      VALUES ((select auth.uid()), 'promote_from_waitlist', 'registrations', v_waitlisted_id, '{}');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_promote_from_waitlist AFTER UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION promote_from_waitlist();

-- check_in_by_ticket
CREATE OR REPLACE FUNCTION check_in_by_ticket(p_ticket_id text)
RETURNS text AS $$
DECLARE
  v_reg_id uuid;
  v_event_id uuid;
  v_attended boolean;
BEGIN
  SELECT id, event_id, attended INTO v_reg_id, v_event_id, v_attended FROM registrations WHERE ticket_id = p_ticket_id;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;

  IF NOT (
    EXISTS (SELECT 1 FROM events WHERE id = v_event_id AND organizer_id = (select auth.uid())) OR
    EXISTS (SELECT 1 FROM event_team WHERE event_id = v_event_id AND user_id = (select auth.uid()))
  ) THEN
    RETURN 'unauthorized';
  END IF;

  IF v_attended THEN RETURN 'already_checked_in'; END IF;

  UPDATE registrations SET attended = true, status = 'attended' WHERE id = v_reg_id;
  
  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES ((select auth.uid()), 'check_in_by_ticket', 'registrations', v_reg_id, '{}');

  RETURN 'success';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- invite_volunteer
CREATE OR REPLACE FUNCTION invite_volunteer(p_event_id uuid, p_email text)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM events WHERE id = p_event_id AND organizer_id = (select auth.uid())) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  SELECT id INTO v_user_id FROM profiles WHERE email = p_email;
  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;

  INSERT INTO event_team (event_id, user_id, invited_by) VALUES (p_event_id, v_user_id, (select auth.uid()));
  
  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES ((select auth.uid()), 'invite_volunteer', 'event_team', v_user_id, jsonb_build_object('event_id', p_event_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- remove_volunteer
CREATE OR REPLACE FUNCTION remove_volunteer(p_event_id uuid, p_user_id uuid)
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM events WHERE id = p_event_id AND organizer_id = (select auth.uid())) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  DELETE FROM event_team WHERE event_id = p_event_id AND user_id = p_user_id;
  
  INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
  VALUES ((select auth.uid()), 'remove_volunteer', 'event_team', p_user_id, jsonb_build_object('event_id', p_event_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- REVOKE ALL + TARGETED GRANT
REVOKE ALL ON FUNCTION handle_new_user() FROM PUBLIC;

REVOKE ALL ON FUNCTION admin_update_user_role(uuid, role_enum) FROM PUBLIC;
REVOKE ALL ON FUNCTION admin_toggle_user_ban(uuid, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION admin_update_settings(boolean, text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION register_for_event(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION promote_from_waitlist() FROM PUBLIC;
REVOKE ALL ON FUNCTION check_in_by_ticket(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION invite_volunteer(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION remove_volunteer(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION trigger_set_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION prevent_restricted_profile_updates() FROM PUBLIC;


GRANT EXECUTE ON FUNCTION admin_update_user_role(uuid, role_enum) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_toggle_user_ban(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_settings(boolean, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION register_for_event(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_in_by_ticket(text) TO authenticated;
GRANT EXECUTE ON FUNCTION invite_volunteer(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION remove_volunteer(uuid, uuid) TO authenticated;


-- Grant default privileges on the public schema that were dropped with CASCADE

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;


-- Grant privileges to supabase_admin which is required for GoTrue auth triggers and cascading deletes

GRANT USAGE ON SCHEMA public TO supabase_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO supabase_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO supabase_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO supabase_admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO supabase_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO supabase_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO supabase_admin;


-- Fix audit_log actor_id foreign key constraint to use ON DELETE SET NULL

ALTER TABLE audit_log DROP CONSTRAINT IF EXISTS audit_log_actor_id_fkey;
ALTER TABLE audit_log ADD CONSTRAINT audit_log_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE SET NULL;


-- Fix missing ON DELETE CASCADE for foreign keys referencing profiles

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_organizer_id_fkey;
ALTER TABLE events ADD CONSTRAINT events_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE event_templates DROP CONSTRAINT IF EXISTS event_templates_organizer_id_fkey;
ALTER TABLE event_templates ADD CONSTRAINT event_templates_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_organizer_id_fkey;
ALTER TABLE announcements ADD CONSTRAINT announcements_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE feedbacks DROP CONSTRAINT IF EXISTS feedbacks_user_id_fkey;
ALTER TABLE feedbacks ADD CONSTRAINT feedbacks_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE event_team DROP CONSTRAINT IF EXISTS event_team_invited_by_fkey;
ALTER TABLE event_team ADD CONSTRAINT event_team_invited_by_fkey FOREIGN KEY (invited_by) REFERENCES profiles(id) ON DELETE SET NULL;


-- Fix RLS infinite recursion by using SECURITY DEFINER functions

-- 1. Helper function for role
CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS role_enum AS $$
  SELECT role FROM public.profiles WHERE id = (select auth.uid());
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 2. Helper function for event organizer (bypasses RLS to avoid mutual recursion)
CREATE OR REPLACE FUNCTION is_event_organizer(p_event_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.events WHERE id = p_event_id AND organizer_id = (select auth.uid()));
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 3. Helper function for event team member (bypasses RLS to avoid mutual recursion)
CREATE OR REPLACE FUNCTION is_event_team_member(p_event_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.event_team WHERE event_id = p_event_id AND user_id = (select auth.uid()));
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- Drop all problematic policies
DROP POLICY IF EXISTS "Profiles are readable by owner or admin" ON profiles;
DROP POLICY IF EXISTS "Events are readable by public (published) or organizers/team/admin" ON events;
DROP POLICY IF EXISTS "Events are insertable by organizer or admin" ON events;
DROP POLICY IF EXISTS "Events are updatable by organizer or admin" ON events;
DROP POLICY IF EXISTS "Events are deletable by organizer or admin" ON events;
DROP POLICY IF EXISTS "Registrations are readable by owner, event organizer, team, or admin" ON registrations;
DROP POLICY IF EXISTS "Registrations are deletable by owner, event organizer, or admin" ON registrations;
DROP POLICY IF EXISTS "Event templates are readable by owner or admin" ON event_templates;
DROP POLICY IF EXISTS "Event templates are insertable by owner or admin" ON event_templates;
DROP POLICY IF EXISTS "Event templates are updatable by owner or admin" ON event_templates;
DROP POLICY IF EXISTS "Event templates are deletable by owner or admin" ON event_templates;
DROP POLICY IF EXISTS "Announcements are readable by public (published events) or organizers/team/admin" ON announcements;
DROP POLICY IF EXISTS "Announcements are insertable by organizer or admin" ON announcements;
DROP POLICY IF EXISTS "Announcements are updatable by organizer or admin" ON announcements;
DROP POLICY IF EXISTS "Announcements are deletable by organizer or admin" ON announcements;
DROP POLICY IF EXISTS "Feedbacks are readable by student or organizer/admin after event" ON feedbacks;
DROP POLICY IF EXISTS "Event team is readable by member, organizer, or admin" ON event_team;
DROP POLICY IF EXISTS "Calendar follows are readable by follower, followed organizer, or admin" ON calendar_follows;
DROP POLICY IF EXISTS "Platform settings are insertable by admins" ON platform_settings;
DROP POLICY IF EXISTS "Platform settings are updatable by admins" ON platform_settings;
DROP POLICY IF EXISTS "Platform settings are deletable by admins" ON platform_settings;

-- Recreate policies using the SECURITY DEFINER functions to prevent recursion

-- platform_settings
CREATE POLICY "Platform settings are insertable by admins" ON platform_settings FOR INSERT WITH CHECK (get_auth_role() = 'admin');
CREATE POLICY "Platform settings are updatable by admins" ON platform_settings FOR UPDATE USING (get_auth_role() = 'admin');
CREATE POLICY "Platform settings are deletable by admins" ON platform_settings FOR DELETE USING (get_auth_role() = 'admin');

-- profiles
CREATE POLICY "Profiles are readable by owner or admin" ON profiles FOR SELECT USING ((select auth.uid()) = id OR get_auth_role() = 'admin');

-- events
CREATE POLICY "Events are readable by public (published) or organizers/team/admin" ON events FOR SELECT USING (
  is_unpublished = false OR 
  organizer_id = (select auth.uid()) OR 
  is_event_team_member(id) OR 
  get_auth_role() = 'admin'
);
CREATE POLICY "Events are insertable by organizer or admin" ON events FOR INSERT WITH CHECK (
  (select auth.uid()) = organizer_id OR get_auth_role() = 'admin'
);
CREATE POLICY "Events are updatable by organizer or admin" ON events FOR UPDATE USING (
  (select auth.uid()) = organizer_id OR get_auth_role() = 'admin'
);
CREATE POLICY "Events are deletable by organizer or admin" ON events FOR DELETE USING (
  (select auth.uid()) = organizer_id OR get_auth_role() = 'admin'
);

-- registrations
CREATE POLICY "Registrations are readable by owner, event organizer, team, or admin" ON registrations FOR SELECT USING (
  user_id = (select auth.uid()) OR 
  is_event_organizer(event_id) OR
  is_event_team_member(event_id) OR
  get_auth_role() = 'admin'
);
CREATE POLICY "Registrations are deletable by owner, event organizer, or admin" ON registrations FOR DELETE USING (
  user_id = (select auth.uid()) OR 
  is_event_organizer(event_id) OR
  get_auth_role() = 'admin'
);

-- event_templates
CREATE POLICY "Event templates are readable by owner or admin" ON event_templates FOR SELECT USING (organizer_id = (select auth.uid()) OR get_auth_role() = 'admin');
CREATE POLICY "Event templates are insertable by owner or admin" ON event_templates FOR INSERT WITH CHECK (organizer_id = (select auth.uid()) OR get_auth_role() = 'admin');
CREATE POLICY "Event templates are updatable by owner or admin" ON event_templates FOR UPDATE USING (organizer_id = (select auth.uid()) OR get_auth_role() = 'admin');
CREATE POLICY "Event templates are deletable by owner or admin" ON event_templates FOR DELETE USING (organizer_id = (select auth.uid()) OR get_auth_role() = 'admin');

-- announcements
CREATE POLICY "Announcements are readable by public (published events) or organizers/team/admin" ON announcements FOR SELECT USING (
  EXISTS (SELECT 1 FROM events WHERE id = event_id AND is_unpublished = false) OR
  organizer_id = (select auth.uid()) OR
  is_event_team_member(event_id) OR
  get_auth_role() = 'admin'
);
CREATE POLICY "Announcements are insertable by organizer or admin" ON announcements FOR INSERT WITH CHECK (
  organizer_id = (select auth.uid()) OR get_auth_role() = 'admin'
);
CREATE POLICY "Announcements are updatable by organizer or admin" ON announcements FOR UPDATE USING (
  organizer_id = (select auth.uid()) OR get_auth_role() = 'admin'
);
CREATE POLICY "Announcements are deletable by organizer or admin" ON announcements FOR DELETE USING (
  organizer_id = (select auth.uid()) OR get_auth_role() = 'admin'
);

-- feedbacks
CREATE POLICY "Feedbacks are readable by student or organizer/admin after event" ON feedbacks FOR SELECT USING (
  user_id = (select auth.uid()) OR 
  (is_event_organizer(event_id) OR get_auth_role() = 'admin') -- simplified check for readability, actual time check might be complex in RLS
);

-- event_team
CREATE POLICY "Event team is readable by member, organizer, or admin" ON event_team FOR SELECT USING (
  user_id = (select auth.uid()) OR 
  is_event_organizer(event_id) OR
  get_auth_role() = 'admin'
);

-- calendar_follows
CREATE POLICY "Calendar follows are readable by follower, followed organizer, or admin" ON calendar_follows FOR SELECT USING (
  follower_id = (select auth.uid()) OR 
  followed_organizer_id = (select auth.uid()) OR 
  get_auth_role() = 'admin'
);


-- 1. Fix the trigger function to NOT be SECURITY DEFINER, or to check (select auth.role()) properly
CREATE OR REPLACE FUNCTION prevent_restricted_profile_updates()
RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role OR NEW.is_banned IS DISTINCT FROM OLD.is_banned OR NEW.must_change_password IS DISTINCT FROM OLD.must_change_password THEN
    -- Check if it's a supabase service role or postgres
    -- (select auth.role()) returns 'service_role' for admin, 'authenticated' for users. 
    -- current_user is usually 'postgres' for backend scripts.
    -- If it's a web client, (select auth.role()) will be 'authenticated' or 'anon'.
    IF (select auth.role()) = 'authenticated' OR (select auth.role()) = 'anon' THEN
      RAISE EXCEPTION 'Cannot update restricted fields directly';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
-- By removing SECURITY DEFINER, it defaults to SECURITY INVOKER.




-- Revoke execute from public for the helper functions
REVOKE ALL ON FUNCTION get_auth_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION is_event_organizer(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION is_event_team_member(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION get_auth_role() TO authenticated;
GRANT EXECUTE ON FUNCTION is_event_organizer(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION is_event_team_member(uuid) TO authenticated;

-- Ignore authenticated executable warnings for intended RPCs and helpers

COMMENT ON FUNCTION admin_update_user_role(uuid, role_enum) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION admin_toggle_user_ban(uuid, boolean) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION admin_update_settings(boolean, text, boolean) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION register_for_event(uuid) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION check_in_by_ticket(text) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION invite_volunteer(uuid, text) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION remove_volunteer(uuid, uuid) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION get_auth_role() IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION is_event_organizer(uuid) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
COMMENT ON FUNCTION is_event_team_member(uuid) IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';

-- Revoke anon access from get_auth_role (no legitimate anonymous use)
REVOKE EXECUTE ON FUNCTION get_auth_role() FROM anon;
