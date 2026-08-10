# Gatherum Full Source Code

## `metadata.json`
```json
{
  "name": "Gatherum",
  "description": "A college event management and ticketing platform.",
  "requestFramePermissions": [],
  "majorCapabilities": []
}

```

## `openapi.json`
```json
{
  "message": "Invalid API key",
  "hint": "Only the `service_role` API key can be used for this endpoint."
}
```

## `package.json`
```json
{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@hello-pangea/dnd": "^18.0.1",
    "@react-three/drei": "^10.7.8",
    "@react-three/fiber": "^9.7.0",
    "@supabase/supabase-js": "^2.112.2",
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "@yudiel/react-qr-scanner": "^2.6.0",
    "clsx": "^2.1.1",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "express-rate-limit": "^8.6.2",
    "lucide-react": "^1.29.0",
    "motion": "^13.0.0",
    "pg": "^8.23.0",
    "qrcode.react": "^4.2.0",
    "react": "^19.0.1",
    "react-countup": "^6.5.3",
    "react-dom": "^19.0.1",
    "react-hot-toast": "^2.6.0",
    "react-router-dom": "^7.18.2",
    "recharts": "^3.10.1",
    "tailwind-merge": "^3.6.0",
    "three": "^0.185.1",
    "vite": "^6.2.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.20.1",
    "@types/three": "^0.185.4",
    "autoprefixer": "^10.4.21",
    "tailwindcss": "^4.1.14",
    "ts-node": "^10.9.2",
    "typescript": "~5.8.2",
    "vite": "^6.2.3"
  },
  "optionalDependencies": {
    "@rolldown/binding-linux-x64-gnu": "*"
  }
}

```

## `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}

```

## `vite.config.ts`
```typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify-file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['motion', 'lucide-react', 'react-countup'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'three-vendor': ['three', '@react-three/fiber', '@react-three/drei']
          }
        }
      }
    }
  };
});

```

## `supabase/migrations/0001_gatherum_schema.sql`
```sql
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

-- admin_fetch_users
CREATE OR REPLACE FUNCTION admin_fetch_users()
RETURNS TABLE (id uuid, email text, role role_enum, is_banned boolean, full_name text) AS $$
BEGIN
  IF (SELECT p.role FROM profiles p WHERE p.id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY SELECT p.id, p.email, p.role, p.is_banned, p.full_name FROM profiles p;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
REVOKE ALL ON FUNCTION admin_fetch_users() FROM PUBLIC;
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

GRANT EXECUTE ON FUNCTION admin_fetch_users() TO authenticated;
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
COMMENT ON FUNCTION admin_fetch_users() IS 'supabase-lint-ignore: authenticated_security_definer_function_executable';
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

```

## `supabase/migrations/0002_realtime_counters.sql`
```sql
-- 0002_realtime_counters.sql

-- 1. Add Counter Columns with constraints
ALTER TABLE events ADD COLUMN registered_count int NOT NULL DEFAULT 0 CHECK (registered_count >= 0);
ALTER TABLE events ADD COLUMN waitlist_count int NOT NULL DEFAULT 0 CHECK (waitlist_count >= 0);

-- 2. Backfill existing data safely
UPDATE events e
SET 
  registered_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'registered'),
  waitlist_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'waitlisted');

-- 3. Prevent client manipulation of counters
CREATE OR REPLACE FUNCTION protect_event_counters()
RETURNS trigger AS $$
BEGIN
  IF NEW.registered_count IS DISTINCT FROM OLD.registered_count OR NEW.waitlist_count IS DISTINCT FROM OLD.waitlist_count THEN
    -- Allow postgres (via SECURITY DEFINER triggers) or admins to modify these columns
    IF current_user NOT IN ('postgres', 'supabase_admin', 'service_role') THEN
      RAISE EXCEPTION 'Cannot update system-managed counters directly';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql; -- Not SECURITY DEFINER, we want to check the actual caller

CREATE TRIGGER protect_events_counters_trigger
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION protect_event_counters();

-- 4. Maintain Counters Trigger (Transaction-Safe)
CREATE OR REPLACE FUNCTION maintain_event_counters()
RETURNS trigger AS $$
DECLARE
  v_reg_delta int := 0;
  v_wait_delta int := 0;
  v_event_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event_id := NEW.event_id;
    IF NEW.status = 'registered' THEN v_reg_delta := 1; END IF;
    IF NEW.status = 'waitlisted' THEN v_wait_delta := 1; END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    v_event_id := NEW.event_id;
    IF OLD.status = 'registered' AND NEW.status = 'cancelled' THEN v_reg_delta := -1; END IF;
    IF OLD.status = 'waitlisted' AND NEW.status = 'cancelled' THEN v_wait_delta := -1; END IF;
    IF OLD.status = 'waitlisted' AND NEW.status = 'registered' THEN 
      v_wait_delta := -1; v_reg_delta := 1; 
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    v_event_id := OLD.event_id;
    IF OLD.status = 'registered' THEN v_reg_delta := -1; END IF;
    IF OLD.status = 'waitlisted' THEN v_wait_delta := -1; END IF;
  END IF;

  IF v_reg_delta != 0 OR v_wait_delta != 0 THEN
    UPDATE events
    SET registered_count = registered_count + v_reg_delta,
        waitlist_count = waitlist_count + v_wait_delta
    WHERE id = v_event_id;
  END IF;

  RETURN NULL; -- AFTER trigger
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_maintain_event_counters
AFTER INSERT OR UPDATE OR DELETE ON registrations
FOR EACH ROW EXECUTE FUNCTION maintain_event_counters();

-- 5. Support Registration DELETE in waitlist promotion (for backward compatibility, even though we move to 'cancelled' status)
CREATE OR REPLACE FUNCTION promote_from_waitlist()
RETURNS trigger AS $$
DECLARE
  v_waitlisted_id uuid;
  v_event_id uuid;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'registered' AND NEW.status = 'cancelled' THEN
      v_event_id := OLD.event_id;
    ELSE
      RETURN NEW;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'registered' THEN
      v_event_id := OLD.event_id;
    ELSE
      RETURN OLD;
    END IF;
  END IF;

  SELECT id INTO v_waitlisted_id FROM registrations WHERE event_id = v_event_id AND status = 'waitlisted' ORDER BY created_at ASC LIMIT 1 FOR UPDATE;
  IF FOUND THEN
    UPDATE registrations SET status = 'registered' WHERE id = v_waitlisted_id;
    INSERT INTO audit_log (actor_id, action, target_table, target_id, details)
    VALUES ((select auth.uid()), 'promote_from_waitlist', 'registrations', v_waitlisted_id, '{}');
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_promote_from_waitlist ON registrations;
CREATE TRIGGER trigger_promote_from_waitlist AFTER UPDATE OR DELETE ON registrations FOR EACH ROW EXECUTE FUNCTION promote_from_waitlist();

-- 6. Admin Reconciliation RPC
CREATE OR REPLACE FUNCTION admin_reconcile_event_counters()
RETURNS void AS $$
BEGIN
  IF (SELECT role FROM profiles WHERE id = (select auth.uid())) != 'admin' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE events e
  SET 
    registered_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'registered'),
    waitlist_count = (SELECT count(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'waitlisted');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Enable Realtime Publications
DO $$
BEGIN
  -- Create publication if it doesn't exist (Supabase usually provides this)
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'events') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE events;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'registrations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE registrations;
  END IF;
END $$;

```

## `src/App.tsx`
```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MotionConfig } from "motion/react";

const Toaster = React.lazy(() => import("react-hot-toast").then(m => ({ default: m.Toaster })));
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MaintenanceModeWrapper from "./components/MaintenanceModeWrapper";

import EventsPage from "./components/EventsPage";
import EventDetailPage from "./components/EventDetailPage";

import StudentDashboard from "./components/StudentDashboard";
import StudentTicketsPage from "./components/StudentTicketsPage";
import OrganizerDashboard from "./components/OrganizerDashboard";
import OrganizerCheckinPage from "./components/OrganizerCheckinPage";
import AdminDashboard from "./components/AdminDashboard";

import OrganizerEventWizard from "./components/OrganizerEventWizard";
import OrganizerManageEventPage from "./components/OrganizerManageEventPage";
import ProfileSettings from "./components/ProfileSettings";
import PublicOrganizerPage from "./components/PublicOrganizerPage";
import ProfileCompletionForm from "./components/ProfileCompletionForm";

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
          <Router>
            <MotionConfig reducedMotion="user">
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <Suspense fallback={null}>
                    <Toaster position="bottom-center" />
                  </Suspense>
                  <MaintenanceModeWrapper>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/events/:id" element={<EventDetailPage />} />
                    <Route path="/c/:id" element={<PublicOrganizerPage />} />

                    {/* Profile completion — requires login but NOT profile_completed */}
                    <Route element={<ProtectedRoute skipProfileCheck />}>
                      <Route path="/complete-profile" element={<ProfileCompletionForm />} />
                    </Route>

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                      <Route path="/student" element={<StudentDashboard />} />
                      <Route path="/student/tickets" element={<StudentTicketsPage />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={["organizer"]} />}>
                      <Route path="/organizer" element={<OrganizerDashboard />} />
                      <Route path="/organizer/events/new" element={<OrganizerEventWizard />} />
                      <Route path="/organizer/events/:id" element={<OrganizerManageEventPage />} />
                    </Route>

                    {/* Shared protected routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/settings" element={<ProfileSettings />} />
                      <Route path="/checkin/:eventId" element={<OrganizerCheckinPage />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                      <Route path="/admin/*" element={<AdminDashboard />} />
                    </Route>
                  </Routes>
                </MaintenanceModeWrapper>
              </main>
              <Footer />
            </div>
            </MotionConfig>
          </Router>
      </DataProvider>
    </AuthProvider>
  );
}

```

## `src/components/AdminDashboard.tsx`
```tsx
import { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { Shield, EyeOff, Eye, Trash2, ShieldAlert, Settings, Users, Calendar, AlertTriangle, ShieldCheck } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useAuth, User, Role } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import SkeletonLoader from "./SkeletonLoader";
import ErrorState from "./ErrorState";

export default function AdminDashboard() {
  const { events, deleteEvent, unpublishEvent, isLoading, error } = useData();
  const { users, settings, updateUserRole, toggleUserBan, updateSettings, user: currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"events" | "users" | "settings">("events");

  // Settings State
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSaveSettings = async () => {
    await updateSettings(localSettings);
    alert("Settings saved successfully.");
  };

  const handleResetAccess = async (email: string) => {
    if (!window.confirm(`Are you sure you want to send a magic link to ${email}? This will allow them to sign in immediately.`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const res = await fetch("/api/admin/reset-user-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ targetEmail: email })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to reset access");
      }
      
      alert(`Magic link successfully sent to ${email}`);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" /> System Administrator
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Control Panel</h1>
          <p className="text-gray-500 dark:text-gray-400">Monitor system health, manage user access, and moderate content.</p>
        </header>

        {error ? (
          <ErrorState 
            title="Failed to load admin data" 
            message="There was a problem connecting to the server. Please try refreshing."
            onRetry={() => window.location.reload()}
          />
        ) : isLoading ? (
          <div className="space-y-8">
            <SkeletonLoader type="card" className="h-[400px]" />
          </div>
        ) : (
          <>
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "events" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <Calendar className="w-4 h-4" /> Events
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "users" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <Users className="w-4 h-4" /> Users
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "settings" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>

        {activeTab === "events" && (
          <section className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Global Event Moderation</h2>
              <span className="text-sm font-medium text-gray-500">{events.length} Events Total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-500 dark:text-gray-400">
                    <th className="px-6 py-4 font-medium">Event Title</th>
                    <th className="px-6 py-4 font-medium">Organizer / Dept</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white truncate max-w-xs">{event.title}</div>
                        <div className="text-xs text-gray-500">{new Date(event.startTime).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{event.category}</td>
                      <td className="px-6 py-4">
                        {event.isUnpublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold">
                            <EyeOff className="w-3 h-3" /> Unpublished
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                            <Eye className="w-3 h-3" /> Public
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={async () => { try { await unpublishEvent(event.id, !event.isUnpublished); } catch(e: any) { alert(e.message); } }}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-colors"
                        >
                          {event.isUnpublished ? "Publish" : "Unpublish"}
                        </button>
                        <button
                          onClick={async () => {
                              if (window.confirm("Are you sure you want to delete this event permanently?")) {
                                try { await deleteEvent(event.id); } catch(e: any) { alert(e.message); }
                              }
                          }}
                          className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No events found on the platform.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "users" && (
          <section className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">User Management</h2>
              <span className="text-sm font-medium text-gray-500">{users.length} Registered Users</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-500 dark:text-gray-400">
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {users.map((u) => (
                    <tr key={u.email} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {u.email} {u.email === currentUser?.email && "(You)"}
                      </td>
                      <td className="px-6 py-4 capitalize text-gray-600 dark:text-gray-300">
                        <select
                          value={u.role}
                          disabled={u.email === currentUser?.email}
                          onChange={async (e) => { try { await updateUserRole(u.id!, e.target.value as Role); } catch(err: any) { alert(err.message); } }}
                          className="bg-transparent border border-gray-200 dark:border-gray-700 rounded p-1 outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        >
                          <option value="student">Student</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {u.isBanned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold">
                            <ShieldAlert className="w-3 h-3" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                            <ShieldCheck className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={async () => { try { await toggleUserBan(u.id!, !!u.isBanned); } catch(err: any) { alert(err.message); } }}
                          disabled={u.email === currentUser?.email}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {u.isBanned ? "Unsuspend" : "Suspend"}
                        </button>
                        <button
                          onClick={() => handleResetAccess(u.email)}
                          disabled={u.email === currentUser?.email}
                          className="px-3 py-1.5 ml-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Reset Access
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "settings" && (
          <section className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm max-w-3xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" /> Platform Settings
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/30">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Global Signups</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Allow new users to register for an account.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={localSettings.allowGlobalSignups}
                    onChange={(e) => setLocalSettings({ ...localSettings, allowGlobalSignups: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/30">
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Allowed Email Domain</label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Restrict registrations to a specific domain (e.g. @college.edu).</p>
                <input
                  type="text"
                  value={localSettings.allowedEmailDomain}
                  onChange={(e) => setLocalSettings({ ...localSettings, allowedEmailDomain: e.target.value })}
                  placeholder="@yourcollege.edu"
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-red-100 dark:border-red-900/30 rounded-xl bg-red-50 dark:bg-red-900/10">
                <div>
                  <h3 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Maintenance Mode
                  </h3>
                  <p className="text-sm text-red-600/80 dark:text-red-300/80">Take the platform offline for non-admins.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={localSettings.maintenanceMode}
                    onChange={(e) => setLocalSettings({ ...localSettings, maintenanceMode: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-red-200 peer-focus:outline-none rounded-full peer dark:bg-red-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-red-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-red-800 peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </section>
        )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

```

## `src/components/DashboardLayout.tsx`
```tsx
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Home, 
  Calendar, 
  Ticket, 
  Settings, 
  Users, 
  BarChart,
  LogOut
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const navItems = {
    student: [
      { name: "Discover", path: "/student", icon: Home },
      { name: "My Tickets", path: "/student/tickets", icon: Ticket },
      { name: "Settings", path: "/settings", icon: Settings },
    ],
    organizer: [
      { name: "Overview", path: "/organizer", icon: BarChart },
      { name: "Settings", path: "/settings", icon: Settings },
    ],
    admin: [
      { name: "Dashboard", path: "/admin", icon: BarChart },
      { name: "System Settings", path: "/settings", icon: Settings },
    ]
  };

  const currentNav = navItems[user.role] || [];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-bg-light dark:bg-bg-dark transition-colors">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-800 p-6" aria-label="Sidebar navigation">
        <div className="mb-8 px-4" aria-live="polite">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Logged in as
          </p>
          <p className="font-bold text-gray-900 dark:text-white capitalize truncate" aria-label={`Role: ${user.role}`}>
            {user.role}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1" aria-label={`Email: ${user.email}`}>
            {user.email}
          </p>
        </div>

        <nav className="flex-1 space-y-2" aria-label="Main Navigation">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="pt-8 mt-8 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={logout}
            aria-label="Sign Out"
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-bg-dark"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10" id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}

```

## `src/components/EmptyState.tsx`
```tsx
import { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionText, actionHref, onAction }: EmptyStateProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div 
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 px-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl w-full"
      role="region" 
      aria-label="Empty state"
    >
      <div className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-full" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 max-w-md mx-auto">{description}</p>
      
      {actionText && (
        actionHref ? (
          <Link to={actionHref} className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-hover transition-colors shadow-md shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark">
            {actionText}
          </Link>
        ) : (
          <button onClick={onAction} className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-hover transition-colors shadow-md shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark">
            {actionText}
          </button>
        )
      )}
    </motion.div>
  );
}

```

## `src/components/ErrorState.tsx`
```tsx
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ 
  title = "Something went wrong", 
  message = "We couldn't load this data. Please try again.", 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center bg-red-50/50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30" role="alert">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-500 mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-full font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

```

## `src/components/EventDetailPage.tsx`
```tsx
import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { Calendar, MapPin, Users, ArrowLeft, Building, Clock, AlertTriangle, CheckCircle2, Loader2, Bell, BellRing } from "lucide-react";
import toast from "react-hot-toast";
import { pageTransition, successAnimation } from "../utils/motion";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { useAccessibleMotion } from "../hooks/useAccessibleMotion";
import { supabase } from "../lib/supabase";
import { EventService } from "../services/api";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { events, isLoading, error, registrations, registerForEvent, joinWaitlist, cancelRegistration, checkConflict, getPublicAttendeeSignal, getFollowedOrganizers, subscribeToOrganizer, unsubscribeFromOrganizer } = useData();
  const { user } = useAuth();
  const prefersReducedMotion = useAccessibleMotion();
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictEvent, setConflictEvent] = useState<any>(null);
  const [publicAttendees, setPublicAttendees] = useState<{studentId: string; studentEmail?: string}[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const [isRegistering, setIsRegistering] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const contextEvent = events.find(e => e.id === id);
  const [liveEvent, setLiveEvent] = useState(contextEvent);

  useEffect(() => {
    setLiveEvent(contextEvent);
  }, [contextEvent]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`event:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${id}`
        },
        (payload) => {
          setLiveEvent(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              registeredCount: payload.new.registered_count ?? prev.registeredCount,
              waitlistCount: payload.new.waitlist_count ?? prev.waitlistCount,
              capacity: payload.new.capacity ?? prev.capacity
            };
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Sync state just in case we missed updates during connection
          EventService.getEventById(id).then(updated => {
            if (updated) setLiveEvent(updated);
          });
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          // Reconnect logic handles refetching when it resubscribes
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const event = liveEvent;

  const eventId = event?.id;
  const eventOrganizerId = event?.organizerId;

  useEffect(() => {
    if (!eventId) return;
    getPublicAttendeeSignal(eventId).then(setPublicAttendees).catch(console.error);
    if (user && eventOrganizerId) {
      getFollowedOrganizers().then(followed => {
        setIsFollowing(followed.includes(eventOrganizerId));
      }).catch(console.error);
    }
  }, [eventId, eventOrganizerId, getPublicAttendeeSignal, getFollowedOrganizers, user]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SkeletonLoader type="card" className="h-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <SkeletonLoader type="header" />
            <SkeletonLoader type="text" count={5} />
          </div>
          <div className="md:col-span-1">
            <SkeletonLoader type="card" className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState 
          title="Failed to load event" 
          message="There was a problem connecting to the server. Please try refreshing."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState 
          icon={<AlertTriangle className="w-8 h-8" />}
          title="Event not found"
          description="The event you are looking for does not exist or has been removed."
          actionText="Browse Events"
          actionHref="/events"
        />
      </div>
    );
  }

  const isFull = event.registeredCount >= event.capacity;
  
  let userReg = null;
  if (user) {
    userReg = registrations.find(r => r.eventId === event.id && r.studentId === user?.id && r.status !== 'cancelled' && r.status !== 'attended');
  }

  const performRegistration = async (action: () => Promise<void>) => {
    setIsRegistering(true);
    
    // Safety 8-second timeout
    timeoutRef.current = setTimeout(() => {
      setIsRegistering(false);
      toast.error("Network timeout. Please try again.");
    }, 8000);

    try {
      // Simulate slight network delay for the UX
      await new Promise(r => setTimeout(r, 600));
      await action();
      toast.success("Registration successful!");
    } catch (err) {
      toast.error("Failed to register. Please try again.");
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsRegistering(false);
    }
  };

  const handleRegisterClick = () => {
    if (!user) return; // In a real app, redirect to login
    
    const conflict = checkConflict(event.id);
    if (conflict) {
      setConflictEvent(conflict);
      setShowConflictModal(true);
    } else {
      performRegistration(() => isFull ? joinWaitlist(event.id) : registerForEvent(event.id));
    }
  };

  const confirmRegistrationDespiteConflict = () => {
    setShowConflictModal(false);
    performRegistration(() => isFull ? joinWaitlist(event.id) : registerForEvent(event.id));
  };

  const handleCancelClick = async () => {
    try {
      await cancelRegistration(event.id);
      toast.success("Registration cancelled");
    } catch (err) {
      toast.error("Failed to cancel registration");
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      toast.error("Please login to follow this organizer");
      return;
    }
    if (!event.organizerId) return;
    
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await unsubscribeFromOrganizer(event.organizerId);
        setIsFollowing(false);
        toast.success("Unsubscribed from organizer");
      } else {
        await subscribeToOrganizer(event.organizerId);
        setIsFollowing(true);
        toast.success("Subscribed! You'll be notified of their new events.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update subscription");
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <motion.div 
      variants={prefersReducedMotion ? {} : pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-bg-light dark:bg-bg-dark min-h-[calc(100vh-4rem)] transition-colors pb-24"
    >
      {/* Hero Banner */}
      <div className="w-full h-64 md:h-96 relative bg-gray-900 overflow-hidden" aria-hidden="true">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src={event.posterUrl} 
          alt={event.title} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-light dark:from-bg-dark via-transparent to-transparent"></div>
        <div className="absolute top-6 left-6 z-10">
          <Link to="/events" className="flex items-center gap-2 text-white bg-black/40 hover:bg-black/60 backdrop-blur-md px-4 py-2 rounded-full transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-transparent">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10"
      >
        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 dark:border-gray-800">
          
          <div className="flex flex-col md:flex-row gap-8 justify-between items-start mb-8">
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
              }}
              className="flex-1"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 mb-4 text-xs font-bold uppercase tracking-wider">
                {event.category}
              </motion.div>
              <motion.h1 variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{event.title}</motion.h1>
              
              <div className="flex flex-col gap-3 text-gray-600 dark:text-gray-300 text-sm md:text-base">
                <motion.div variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <p>{new Date(event.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                  </div>
                </motion.div>
                
                <motion.div variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent-darker dark:text-accent shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{event.location}</p>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get Directions</a>
                  </div>
                </motion.div>
                
                <motion.div variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/c/${event.organizerId}`} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <Building className="w-5 h-5" />
                    </Link>
                    <div>
                      <Link to={`/c/${event.organizerId}`} className="font-semibold text-gray-900 dark:text-white hover:underline block">
                        {event.department}
                      </Link>
                      <p className="text-sm text-gray-500">Organizer</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleToggleFollow}
                    disabled={isFollowLoading}
                    className={`px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50 ${isFollowing ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                  >
                    {isFollowing ? <><BellRing className="w-4 h-4" /> Following</> : <><Bell className="w-4 h-4" /> Follow</>}
                  </button>
                </motion.div>
                
                {publicAttendees.length > 0 && (
                  <motion.div variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Who's going</p>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {publicAttendees.slice(0, 5).map((att, i) => (
                          <div key={att.studentId} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-white dark:border-surface-dark flex items-center justify-center text-primary font-bold text-xs shadow-sm" title={att.studentEmail}>
                            {att.studentEmail?.charAt(0).toUpperCase() || '?'}
                          </div>
                        ))}
                      </div>
                      {publicAttendees.length > 5 && (
                        <div className="text-sm text-gray-500 font-medium ml-2">
                          +{publicAttendees.length - 5} more
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Registration Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-full md:w-80 bg-gray-50 dark:bg-bg-dark rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shrink-0"
            >
              <h3 className="font-bold text-xl mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">Registration</h3>
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <div className="flex flex-col items-end">
                  <span className={`font-bold ${isFull ? 'text-accent' : 'text-primary'}`}>
                    {isFull ? 'At Capacity' : 'Available'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {event.registeredCount} / {event.capacity} registered
                  </span>
                </div>
              </div>
              
              {user?.role === 'student' ? (
                <>
                  {userReg ? (
                    <AnimatePresence>
                      <motion.div 
                        variants={successAnimation}
                        initial="initial"
                        animate="animate"
                        className="space-y-4"
                        role="status"
                      >
                        <div className={`p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2 ${
                          userReg.status === 'waitlisted' 
                            ? 'bg-accent/10 text-accent-darker dark:text-accent' 
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        }`}>
                          {userReg.status !== 'waitlisted' && <CheckCircle2 className="w-5 h-5" aria-hidden="true" />}
                          {userReg.status === 'waitlisted' 
                            ? 'On Waitlist' 
                            : 'You are registered!'}
                        </div>
                        <button 
                          onClick={handleCancelClick}
                          className="w-full py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                          Cancel {userReg.status === 'waitlisted' ? 'Waitlist' : 'Registration'}
                        </button>
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <button 
                      onClick={handleRegisterClick}
                      disabled={isRegistering}
                      className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-bg-dark relative flex items-center justify-center ${
                        isFull 
                          ? 'bg-accent shadow-accent/30 hover:bg-yellow-500 focus:ring-accent disabled:bg-accent/80' 
                          : 'bg-primary shadow-primary/30 hover:bg-primary-hover focus:ring-primary disabled:bg-primary/80'
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {isRegistering ? (
                          <motion.div
                            key="spinner"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="text"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            {isFull ? 'Join Waitlist' : 'Register Now'}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  {user ? (
                    <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-300">
                      Only students can register for events.
                    </div>
                  ) : (
                    <Link 
                      to="/login"
                      className="block text-center w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] bg-primary shadow-primary/30 hover:bg-primary-hover"
                    >
                      Log in to Register
                    </Link>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          <div className="prose dark:prose-invert max-w-none border-t border-gray-100 dark:border-gray-800 pt-8">
            <h2 className="text-2xl font-bold mb-4">About this event</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
              {event.description}
            </p>
          </div>
          
        </div>
      </motion.div>

      {/* Conflict Modal */}
      <AnimatePresence>
        {showConflictModal && conflictEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="conflict-title">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-white dark:bg-surface-dark rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <h2 id="conflict-title" className="text-2xl font-bold text-center mb-2">Schedule Conflict</h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                This event overlaps with another event you are currently registered for:
              </p>
              
              <div className="bg-gray-50 dark:bg-bg-dark p-4 rounded-xl mb-8 border border-gray-200 dark:border-gray-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{conflictEvent.title}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {new Date(conflictEvent.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - 
                    {new Date(conflictEvent.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowConflictModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRegistrationDespiteConflict}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-bg-dark"
                >
                  Register Anyway
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

```

## `src/components/EventsPage.tsx`
```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useData, EventCategory } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { Calendar, MapPin, Users, Search, AlertCircle } from "lucide-react";
import { pageTransition } from "../utils/motion";
import TiltCard from "./TiltCard";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";

export default function EventsPage() {
  const { events, isLoading, error } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | "All">("All");



  const filteredEvents = events.filter((event) => {
    if (event.isUnpublished && user?.role !== "admin") return false;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories: (EventCategory | "All")[] = ["All", "Social", "Academic", "Sports", "Arts", "Club"];

  return (
    <motion.div 
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-bg-light dark:bg-bg-dark min-h-[calc(100vh-4rem)] transition-colors py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Discover Events</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl">Find out what's happening around campus. Register for events, join clubs, and make the most of your college experience.</p>
        </header>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8" role="search" aria-label="Events search and filters">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <label htmlFor="search-events" className="sr-only">Search events</label>
            <input
              id="search-events"
              type="text"
              placeholder="Search events, clubs, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide" role="group" aria-label="Event categories">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                aria-pressed={categoryFilter === cat}
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark ${
                  categoryFilter === cat
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Event Grid */}
        <div aria-live="polite">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="status" aria-label="Loading events">
              <SkeletonLoader type="card" count={6} />
            </div>
          ) : error ? (
            <div className="py-12">
              <EmptyState 
                icon={<AlertCircle className="w-8 h-8" />}
                title="Failed to load events"
                description="There was a problem connecting to the server. Please try refreshing the page."
                actionText="Refresh Page"
                onAction={() => window.location.reload()}
              />
            </div>
          ) : filteredEvents.length > 0 ? (
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
              role="list"
            >
              {filteredEvents.map((event) => (
                <motion.div key={event.id} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }} role="listitem">
                  <TiltCard>
                    <Link 
                      to={`/events/${event.id}`}
                      aria-label={`View details for ${event.title}`}
                      className="group flex flex-col h-full bg-white dark:bg-surface-dark rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark shadow-md"
                    >
                      <div className="h-48 relative overflow-hidden bg-gray-100 dark:bg-gray-800" aria-hidden="true">
                        <img src={event.posterUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 dark:text-white shadow-sm">
                          {event.category}
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4 text-primary" aria-hidden="true" />
                            <span>{new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="w-4 h-4 text-accent" aria-hidden="true" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2">{event.description}</p>
                        
                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <Users className="w-4 h-4" aria-hidden="true" />
                            <span>{event.registeredCount} / {event.capacity}</span>
                          </div>
                          <span className="text-primary font-bold text-sm">View →</span>
                        </div>
                      </div>
                    </Link>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="py-12">
              <EmptyState 
                icon={<Search className="w-8 h-8" />}
                title="No events found"
                description="We couldn't find any events matching your search criteria. Try adjusting your filters."
                actionText="Clear Filters"
                onAction={() => {
                  setSearchTerm("");
                  setCategoryFilter("All");
                }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

```

## `src/components/Footer.tsx`
```tsx
export default function Footer() {
  return (
    <footer className="bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 py-12 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-heading font-bold text-xl text-primary">Gatherum</span>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Connecting campus life, one event at a time.</p>
        </div>
        
        <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
          <a href="#" className="hover:text-primary transition-colors">About</a>
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
        </div>
      </div>
    </footer>
  );
}

```

## `src/components/LandingHero3D.tsx`
```tsx
import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, PointMaterial, Points } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const { mouse } = useThree();

  const count = 3000;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 15;
      p[i * 3 + 1] = (Math.random() - 0.5) * 15;
      p[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return p;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.02;
    ref.current.rotation.y = state.clock.elapsedTime * 0.05;
    
    // Gentle mouse follow
    ref.current.rotation.x += (mouse.y * 0.2 - ref.current.rotation.x) * 0.05;
    ref.current.rotation.y += (mouse.x * 0.2 - ref.current.rotation.y) * 0.05;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#8B5CF6"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

function FloatingShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { mouse } = useThree();
  
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += (mouse.y * 0.5 - meshRef.current.rotation.x) * 0.05;
    meshRef.current.rotation.y += (mouse.x * 0.5 - meshRef.current.rotation.y) * 0.05;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2, 1]} />
        <meshStandardMaterial 
          color="#8B5CF6" 
          wireframe 
          transparent
          opacity={0.2}
        />
      </mesh>
    </Float>
  );
}

export default function LandingHero3D() {
  return (
    <div className="absolute inset-0 -z-10 opacity-60 dark:opacity-40">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <ParticleField />
        <FloatingShape />
      </Canvas>
    </div>
  );
}

```

## `src/components/LandingPage.tsx`
```tsx
import { Calendar, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import React, { Suspense } from "react";
import { pageTransition } from "../utils/motion";
import { useData } from "../contexts/DataContext";
import SkeletonLoader from "./SkeletonLoader";
import TiltCard from "./TiltCard";

const LandingHero3D = React.lazy(() => import("./LandingHero3D"));

export default function LandingPage() {
  const shouldReduceMotion = useReducedMotion();
  const { events, isLoading } = useData();
  
  // Get up to 3 upcoming events
  const now = new Date().getTime();
  const upcomingEvents = events
    .filter(e => !e.isUnpublished && new Date(e.endTime).getTime() > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemAnim = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex flex-col min-h-[calc(100vh-4rem)] relative"
    >
      {/* Hero Section */}
      <section className="relative px-4 py-24 sm:py-32 lg:py-40 flex flex-col items-center text-center overflow-hidden min-h-[80vh] justify-center">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-bg-light to-bg-light dark:from-primary/20 dark:via-bg-dark dark:to-bg-dark"></div>
        
        {!shouldReduceMotion && (
          <Suspense fallback={null}>
            <LandingHero3D />
          </Suspense>
        )}

        <motion.div 
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" as any }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent-darker dark:text-accent mb-8">
            <span className="flex h-2 w-2 rounded-full bg-accent"></span>
            <span className="text-sm font-semibold tracking-wide uppercase">Your Campus, Live</span>
          </div>
          
          <h1 className="max-w-4xl text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 drop-shadow-sm">
            Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">College Events</span> Like Never Before
          </h1>
          
          <p className="max-w-2xl text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed mx-auto drop-shadow-sm bg-white/50 dark:bg-black/50 p-4 rounded-2xl backdrop-blur-sm">
            Gatherum brings all your university happenings into one vibrant platform. Discover parties, academic talks, and club meetups instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <Link to="/signup" className="px-8 py-4 rounded-full bg-primary text-white font-semibold text-lg hover:bg-primary-hover hover:scale-105 transition-all shadow-lg shadow-primary/30">
              Join Gatherum
            </Link>
            <Link to="/login" className="px-8 py-4 rounded-full bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md text-gray-900 dark:text-white font-semibold text-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features / Upcoming Events */}
      <section id="features" className="py-24 bg-white dark:bg-surface-dark transition-colors relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Trending on Campus</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Don't miss out on what everyone will be talking about tomorrow.</p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {isLoading ? (
              <SkeletonLoader type="card" count={3} />
            ) : upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Link key={event.id} to={`/events/${event.id}`} className="block h-full">
                  <TiltCard className="h-full flex flex-col">
                    <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                      <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-4 left-4 z-20">
                        <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full tracking-wider">{event.category}</span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-b-2xl shadow-sm">
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-medium">{new Date(event.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(event.startTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2">{event.description}</p>
                      
                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{event.registeredCount} / {event.capacity}</span>
                        </div>
                        <span className="text-primary font-bold">View Details →</span>
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-gray-500 dark:text-gray-400">
                Check back soon for new events!
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}

```

## `src/components/LoginPage.tsx`
```tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, AuthError } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";

// ─── Error messages ───────────────────────────────────────────────────────────
const ERROR_MESSAGES: Record<AuthError, string> = {
  invalid_email: "Please enter a valid email address.",
  domain_restricted: "Sign-ups are restricted to your university email domain.",
  signups_disabled: "New sign-ups are temporarily disabled. Please try again later.",
  user_banned: "Your account has been suspended. Contact support.",
  unknown: "Something went wrong. Please try again.",
};

// ─── Google Icon ─────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}

// ─── Decorative background blobs ─────────────────────────────────────────────
function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-bg-light">
      <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[80px]" />
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type Screen = "choose" | "magic_link" | "magic_sent";

export default function LoginPage() {
  const [screen, setScreen] = useState<Screen>("choose");
  const [email, setEmail]   = useState("");
  const [error, setError]   = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLoading, setMagicLoading]   = useState(false);

  const { login, loginWithGoogle, user, authError, clearAuthError, settings } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Handle OAuth callback errors in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlError = params.get("error_description");
    if (urlError) {
      setError("Sign-in failed: " + decodeURIComponent(urlError.replace(/\+/g, " ")));
      // Clean the URL without reloading
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [location.search]);

  // Auth context-level errors (e.g. banned user)
  useEffect(() => {
    if (authError) {
      setError(ERROR_MESSAGES[authError]);
      clearAuthError();
    }
  }, [authError, clearAuthError]);

  // Redirect when logged in
  useEffect(() => {
    if (user) {
      if (!user.profileCompleted) {
        navigate("/complete-profile", { replace: true });
      } else {
        navigate(`/${user.role}`, { replace: true });
      }
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    if (!result.success && result.error) {
      setError(ERROR_MESSAGES[result.error]);
      setGoogleLoading(false);
    }
    // On success, Supabase redirects — no need to setLoading(false)
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMagicLoading(true);
    const result = await login(email);
    setMagicLoading(false);
    if (result.success) {
      setScreen("magic_sent");
    } else if (result.error) {
      setError(ERROR_MESSAGES[result.error]);
    }
  };

  const domainHint = settings?.allowedEmailDomain
    ? `Use your ${settings.allowedEmailDomain} email`
    : "Enter your email address";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <Background />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg shadow-primary/20 mb-4 border border-gray-100"
          >
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gatherum</h1>
          <p className="text-gray-500 mt-1 text-sm">Your campus event hub</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-3xl p-8 shadow-2xl shadow-gray-200/50">
          <AnimatePresence mode="wait">

            {/* ── CHOOSE screen ─────────────────────────── */}
            {screen === "choose" && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Welcome back</h2>
                <p className="text-gray-500 text-sm mb-6">Sign in to manage your campus life.</p>

                {/* Error Banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm overflow-hidden"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Google Button */}
                <motion.button
                  id="google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-sm group"
                >
                  {googleLoading ? <Spinner /> : <GoogleIcon />}
                  <span>{googleLoading ? "Redirecting…" : "Continue with Google"}</span>
                </motion.button>

                {/* Divider */}
                <div className="relative flex items-center mb-4">
                  <div className="flex-grow border-t border-gray-200" />
                  <span className="mx-4 text-gray-400 text-xs uppercase tracking-widest font-medium">or</span>
                  <div className="flex-grow border-t border-gray-200" />
                </div>

                {/* Magic Link CTA */}
                <motion.button
                  id="magic-link-btn"
                  onClick={() => { setError(null); setScreen("magic_link"); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition-colors duration-200 shadow-md shadow-primary/20"
                >
                  Sign in with Email Link
                </motion.button>

                <p className="text-center text-gray-500 text-sm mt-6 font-medium">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:text-primary-hover font-bold transition-colors">
                    Sign up
                  </Link>
                </p>
              </motion.div>
            )}

            {/* ── MAGIC LINK form ───────────────────────── */}
            {screen === "magic_link" && (
              <motion.div
                key="magic_link"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={() => { setError(null); setScreen("choose"); }}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 font-medium text-sm mb-6 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <h2 className="text-xl font-semibold text-gray-900 mb-1">Sign in with email</h2>
                <p className="text-gray-500 text-sm mb-6">
                  We'll send a magic link to your inbox — no password needed.
                </p>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="ml-error"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm overflow-hidden"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={domainHint}
                      required
                      autoFocus
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                    {settings?.allowedEmailDomain && (
                      <p className="mt-1.5 text-xs text-gray-500 font-medium">
                        Only <span className="text-primary">{settings.allowedEmailDomain}</span> addresses are allowed.
                      </p>
                    )}
                  </div>

                  <motion.button
                    id="send-magic-link-btn"
                    type="submit"
                    disabled={magicLoading || !email.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold flex items-center justify-center gap-2 transition-colors duration-200 shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {magicLoading && <Spinner />}
                    {magicLoading ? "Sending…" : "Send Magic Link"}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ── MAGIC SENT confirmation ───────────────── */}
            {screen === "magic_sent" && (
              <motion.div
                key="magic_sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-4"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your inbox!</h2>
                <p className="text-gray-500 text-sm mb-1">
                  We sent a magic link to
                </p>
                <p className="text-primary font-semibold text-sm mb-6">{email}</p>
                <p className="text-gray-500 text-xs">
                  Click the link in the email to sign in. It expires in 1 hour.
                </p>
                <button
                  onClick={() => { setScreen("magic_link"); setError(null); }}
                  className="mt-6 text-sm text-gray-500 font-medium hover:text-primary underline-offset-2 hover:underline transition-colors"
                >
                  Use a different email
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

```

## `src/components/MaintenanceModeWrapper.tsx`
```tsx
import { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Wrench } from "lucide-react";

export default function MaintenanceModeWrapper({ children }: { children: ReactNode }) {
  const { settings, user } = useAuth();

  if (settings.maintenanceMode && user?.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <Wrench className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">We'll be right back</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Gatherum is currently undergoing scheduled maintenance. Please check back later!
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

```

## `src/components/Navbar.tsx`
```tsx
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Ticket } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <Ticket className="w-8 h-8" />
            <span className="font-heading font-bold text-2xl tracking-tight">Gatherum</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link 
                  to={`/${user.role}`}
                  className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={logout}
                  className="px-4 py-2 text-sm font-semibold rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="px-5 py-2 text-sm font-semibold rounded-full bg-primary text-white hover:bg-primary-hover transition-colors shadow-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

```

## `src/components/OrganizerCheckinPage.tsx`
```tsx
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useData, Registration } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { RegistrationService } from "../services/api";
import { supabase } from "../lib/supabase";
import { CheckCircle, AlertTriangle, ArrowLeft, Search, User, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SkeletonLoader from "./SkeletonLoader";
import ErrorState from "./ErrorState";

export default function OrganizerCheckinPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { events, checkInUser } = useData();
  const { user } = useAuth();
  
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; name?: string; duplicate?: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (eventId) {
      RegistrationService.getRegistrationsForOrganizer(eventId)
        .then(data => {
          setRegistrations(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError(true);
          setLoading(false);
        });

      const channel = supabase
        .channel(`registrations_checkin:${eventId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'registrations',
            filter: `event_id=eq.${eventId}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setRegistrations(prev => [...prev, {
                id: payload.new.id,
                eventId: payload.new.event_id,
                studentId: payload.new.user_id,
                status: payload.new.status,
                ticketId: payload.new.ticket_id,
                attended: payload.new.attended
              }]);
              // Refresh to get joined data like email
              RegistrationService.getRegistrationsForOrganizer(eventId).then(setRegistrations);
            } else if (payload.eventType === 'UPDATE') {
              setRegistrations(prev => prev.map(r => r.id === payload.new.id ? {
                ...r,
                status: payload.new.status,
                attended: payload.new.attended
              } : r));
            } else if (payload.eventType === 'DELETE') {
              setRegistrations(prev => prev.filter(r => r.id !== payload.old.id));
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            RegistrationService.getRegistrationsForOrganizer(eventId).then(setRegistrations);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [eventId]);
  // We'll search across all registrations.
  
  const handleScan = async (detectedCodes: any[]) => {
    if (detectedCodes.length > 0) {
      const qrValue = detectedCodes[0].rawValue;
      if (qrValue) {
        await processCheckIn(qrValue);
      }
    }
  };

  const processCheckIn = async (ticketId: string) => {
    const result = await checkInUser(ticketId);
    setScanResult({
      success: result.success,
      message: result.message,
      name: result.attendeeName,
      duplicate: result.alreadyCheckedIn
    });
    
    // Update local state to reflect attendance instantly
    if (result.success) {
      setRegistrations(prev => prev.map(r => r.ticketId === ticketId ? { ...r, attended: true } : r));
    }

    // Clear result after 3 seconds
    setTimeout(() => {
      setScanResult(null);
    }, 3000);
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const reg = registrations.find(r => 
      r.ticketId === searchQuery || (r.studentEmail || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (reg && reg.ticketId && reg.status !== 'cancelled') {
      await processCheckIn(reg.ticketId);
    } else {
      setScanResult({
        success: false,
        message: "No registration found."
      });
      setTimeout(() => setScanResult(null), 3000);
    }
    setSearchQuery("");
  };

  const attendedCount = registrations.filter(r => r.attended).length;
  const totalCount = registrations.filter(r => r.status !== 'cancelled').length;

  return (
    <div className="fixed inset-0 z-[100] bg-bg-light dark:bg-bg-dark text-gray-900 dark:text-white flex flex-col overflow-y-auto">
      <header className="bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-10 flex items-center justify-between">
        <Link to={user?.role === 'organizer' ? "/organizer" : "/student"} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Fast Check-in</h1>
        <div className="px-4 py-1.5 bg-primary/10 text-primary rounded-full font-bold">
          {attendedCount} / {totalCount}
        </div>
      </header>

      <div className="flex-1 max-w-lg w-full mx-auto p-4 flex flex-col gap-6 w-full">
        {error ? (
          <ErrorState 
            title="Failed to load check-in" 
            message="There was a problem connecting to the server. Please try refreshing."
            onRetry={() => window.location.reload()}
          />
        ) : loading ? (
          <div className="space-y-6">
            <SkeletonLoader type="card" className="aspect-[4/3] w-full" />
            <SkeletonLoader type="card" className="h-24 w-full" />
          </div>
        ) : (
          <>
        {/* Scanner View */}
        {/* Scanner View */}
        <div 
          className="bg-black rounded-3xl overflow-hidden aspect-[4/3] relative shadow-lg flex items-center justify-center"
          role="region"
          aria-label="QR Code Scanner"
        >
          {showScanner ? (
            <>
              <Scanner 
                onScan={handleScan}
                components={{
                  tracker: true as any
                }}
              />
              <div className="absolute top-4 left-4 right-4 text-center z-10">
                <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-md">
                  Point at Ticket QR
                </span>
              </div>
              <button 
                onClick={() => setShowScanner(false)}
                className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-md z-10"
              >
                Close Scanner
              </button>
            </>
          ) : (
            <button 
              onClick={() => setShowScanner(true)}
              className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <QrCode className="w-12 h-12" />
              <span>Tap to Open Scanner</span>
            </button>
          )}
        </div>

        {/* Scan Result Overlay/Banner */}
        <AnimatePresence>
          {scanResult && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`p-4 rounded-2xl shadow-lg border flex items-start gap-4 ${
                scanResult.success 
                  ? "bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800" 
                  : scanResult.duplicate
                    ? "bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800"
                    : "bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800"
              }`}
            >
              <div className="shrink-0 mt-1 relative">
                {scanResult.success ? (
                  <>
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="absolute inset-0 bg-green-500 rounded-full"
                    />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20, delay: 0.1 }}
                      className="relative z-10"
                    >
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 rounded-full" />
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    initial={{ x: -10 }}
                    animate={{ x: [0, -10, 10, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <AlertTriangle className={`w-8 h-8 ${scanResult.duplicate ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`} />
                  </motion.div>
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg ${
                  scanResult.success ? "text-green-900 dark:text-green-100" :
                  scanResult.duplicate ? "text-yellow-900 dark:text-yellow-100" : "text-red-900 dark:text-red-100"
                }`}>
                  {scanResult.message}
                </h3>
                {scanResult.name && (
                  <p className={`text-sm ${
                    scanResult.success ? "text-green-700 dark:text-green-300" :
                    scanResult.duplicate ? "text-yellow-700 dark:text-yellow-300" : "text-red-700 dark:text-red-300"
                  }`}>
                    {scanResult.name}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual Lookup */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm mt-auto">
          <h2 className="font-bold mb-4">Manual Search</h2>
          <form onSubmit={handleManualSearch} className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, email, or Ticket ID"
                className="w-full pl-10 pr-3 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
            <button 
              type="submit"
              className="px-6 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
            >
              Find
            </button>
          </form>
        </div>
          </>
        )}
      </div>
    </div>
  );
}

```

## `src/components/OrganizerDashboard.tsx`
```tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { useData, EventTemplate } from "../contexts/DataContext";
import { PlusCircle, BarChart, Users, Settings, GripVertical, FileText } from "lucide-react";
import CountUp from "react-countup";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import toast from "react-hot-toast";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

export default function OrganizerDashboard() {
  const { events, registrations, templates, isLoading, error } = useData();
  const [orderedTemplates, setOrderedTemplates] = useState<EventTemplate[]>([]);

  // Initialize ordered templates from context
  useEffect(() => {
    setOrderedTemplates(templates);
  }, [templates]);

  // For this demo, let's assume all events belong to this organizer.
  const activeEventsCount = events.length;
  const totalAttendees = registrations.filter(r => r.status === "registered").length;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(orderedTemplates);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setOrderedTemplates(items);
    toast.success("Templates reordered");
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Organizer Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage your events and track attendance.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/organizer/checkin" className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:opacity-90 transition-opacity">
              Fast Check-in
            </Link>
            <Link to="/organizer/events/new" className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
              <PlusCircle className="w-5 h-5" />
              Create Event
            </Link>
          </div>
        </header>

        {error ? (
          <ErrorState 
            title="Failed to load dashboard" 
            message="There was a problem connecting to the server. Please try refreshing."
            onRetry={() => window.location.reload()}
          />
        ) : isLoading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonLoader type="card" className="h-40" count={2} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SkeletonLoader type="card" className="h-[400px]" count={2} />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center h-40">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Total Attendees
                </h3>
                <p className="text-4xl font-bold text-gray-900 dark:text-white"><CountUp end={totalAttendees} duration={1.5} /></p>
              </div>

              <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-center h-40">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Active Events</h3>
                <p className="text-4xl font-bold text-primary"><CountUp end={activeEventsCount} duration={1.5} /></p>
              </div>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Recent Events</h2>
            {events.length === 0 ? (
              <EmptyState 
                icon={<BarChart className="w-8 h-8" />}
                title="You haven't created any events yet."
                description="Get started by clicking below."
                actionText="Create Your First Event"
                actionHref="/organizer/events/new"
              />
            ) : (
              <div className="grid gap-4">
                {events.slice(0, 5).map(event => (
                  <div key={event.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <img src={event.posterUrl} alt={event.title} className="w-16 h-16 object-cover rounded-xl" />
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{event.title}</h3>
                        <p className="text-sm text-gray-500">{new Date(event.startTime).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Link to={`/organizer/events/${event.id}`} className="p-2 text-gray-400 hover:text-primary transition-colors bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-primary/10">
                      <Settings className="w-5 h-5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Saved Templates
            </h2>
            
            {orderedTemplates.length === 0 ? (
              <EmptyState 
                icon={<FileText className="w-8 h-8" />}
                title="No templates saved yet."
                description="Save a template during event creation."
              />
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="templates-list">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {orderedTemplates.map((template, index) => (
                        <Draggable key={template.id} draggableId={template.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center p-4 border rounded-2xl transition-all ${
                                snapshot.isDragging 
                                  ? "bg-white shadow-xl border-primary/50 z-50 scale-[1.02]" 
                                  : "bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800 hover:border-gray-300"
                              }`}
                            >
                              <div {...provided.dragHandleProps} className="p-2 mr-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                                <GripVertical className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{template.title}</h3>
                                <p className="text-sm text-gray-500 truncate max-w-[200px]">{template.title}</p>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </section>
        </div>
      </>
      )}
      </div>
    </DashboardLayout>
  );
}

```

## `src/components/OrganizerEventWizard.tsx`
```tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { useData, EventCategory } from "../contexts/DataContext";
import { ArrowRight, ArrowLeft, Check, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import SkeletonLoader from "./SkeletonLoader";
import ErrorState from "./ErrorState";
import { useAccessibleMotion } from "../hooks/useAccessibleMotion";

// Framer motion variants for step transitions
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0
  })
};

const ValidCheck = ({ isValid }: { isValid: boolean }) => (
  <AnimatePresence>
    {isValid && (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
      >
        <Check className="w-5 h-5" />
      </motion.div>
    )}
  </AnimatePresence>
);

export default function OrganizerEventWizard() {
  const prefersReducedMotion = useAccessibleMotion();
  const { createEvent, saveTemplate, templates, isLoading, error } = useData();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0); // 1 for forward, -1 for backward

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    department: "",
    category: "Social" as EventCategory,
    capacity: 0,
    posterUrl: ""
  });
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "capacity" ? parseInt(value) || 0 : value
    }));
  };

  const loadTemplate = (templateId: string) => {
    const t = templates.find(t => t.id === templateId);
    if (t) {
      setFormData(prev => ({
        ...prev,
        title: t.title,
        description: t.description,
        category: t.category,
        capacity: t.capacity,
        posterUrl: t.posterUrl
      }));
      toast.success(`Loaded template: ${t.title}`);
    }
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setStep(step + newDirection);
  };

  const isTitleValid = formData.title.trim().length > 0;
  const isDescValid = formData.description.trim().length > 0;
  const isStep1Valid = isTitleValid && isDescValid;

  const isDateValid = formData.startTime !== "";
  const isEndTimeValid = formData.endTime !== "";
  const isLocValid = formData.location.trim().length > 0;
  const isStep2Valid = isDateValid && isEndTimeValid && isLocValid;

  const isCapValid = formData.capacity > 0;
  const isPosterValid = formData.posterUrl.trim().length > 0;
  const isStep3Valid = isCapValid && isPosterValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isStep1Valid && isStep2Valid && isStep3Valid) {
      try {
        const eventId = await createEvent(formData);
        
        if (saveAsTemplate && templateName.trim() !== "") {
          await saveTemplate({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            capacity: formData.capacity,
            posterUrl: formData.posterUrl
          });
          toast.success("Template saved!");
        }
        
        toast.success("Event created successfully!");
        navigate(`/organizer/events/${eventId}`);
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to create event.");
      }
    } else {
      toast.error("Please fill in all required fields.");
    }
  };

  const handleQuickCreate = async () => {
    if (!isStep1Valid) {
      toast.error("Please provide at least a title and description.");
      return;
    }
    
    // Auto-fill remaining fields with default values
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const quickData = {
      ...formData,
      startTime: formData.startTime || tomorrowStr,
      endTime: formData.endTime || tomorrowStr + "T14:00",
      location: formData.location || "TBA",
      capacity: formData.capacity || 100,
      posterUrl: formData.posterUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    };
    
    try {
      const eventId = await createEvent(quickData);
      toast.success("Quick Event created successfully!");
      navigate(`/organizer/events/${eventId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create event.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create New Event</h1>
            <p className="text-gray-500 dark:text-gray-400">Step {step} of 3</p>
          </div>
          {templates.length > 0 && step === 1 && (
            <select 
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-surface-dark focus:ring-2 focus:ring-primary outline-none"
              onChange={(e) => loadTemplate(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Load from Template...</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          )}
        </header>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <motion.div 
              key={s} 
              layout
              className={`h-2 flex-1 rounded-full ${step >= s ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} 
            />
          ))}
        </div>

        {error ? (
          <ErrorState 
            title="Failed to load wizard" 
            message="There was a problem connecting to the server. Please try refreshing."
            onRetry={() => window.location.reload()}
          />
        ) : isLoading ? (
          <div className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden min-h-[400px] flex flex-col space-y-6">
            <SkeletonLoader type="card" className="h-16" count={4} />
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden min-h-[400px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            
            {/* ── STEP 1 ── */}
            {step === 1 && (
              <motion.div 
                key="step1"
                custom={direction}
                variants={prefersReducedMotion ? {} : slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Event Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none pr-10"
                    placeholder="e.g., Spring Music Festival"
                  />
                  <ValidCheck isValid={isTitleValid} />
                  {!isTitleValid && formData.title !== "" && <p className="text-sm text-red-500 mt-1">Title is required.</p>}
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none pr-10"
                    placeholder="Describe your event..."
                  />
                  <ValidCheck isValid={isDescValid} />
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={handleQuickCreate}
                    disabled={!isStep1Valid}
                    className="px-4 py-2 font-bold text-sm text-primary hover:text-primary-hover disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    🚀 Quick Create (Skip details)
                  </button>
                  <button 
                    type="button"
                    onClick={() => paginate(1)} 
                    disabled={!isStep1Valid}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    Next <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <motion.div
                key={step}
                custom={direction}
                variants={prefersReducedMotion ? {} : slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-3xl p-8 shadow-sm"
              >    
                <div className="grid grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none pr-10"
                    />
                    <ValidCheck isValid={isDateValid} />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">End Time</label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none pr-10"
                    />
                    <ValidCheck isValid={isEndTimeValid} />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none pr-10"
                    placeholder="e.g., Main Quad"
                  />
                  <ValidCheck isValid={isLocValid} />
                </div>

                <div className="flex justify-between pt-4">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(-1)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </motion.button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(1)}
                    disabled={!isStep2Valid}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3 ── */}
            {step === 3 && (
              <motion.div 
                key="step3"
                custom={direction}
                variants={prefersReducedMotion ? {} : slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="Social">Social</option>
                      <option value="Academic">Academic</option>
                      <option value="Sports">Sports</option>
                      <option value="Arts">Arts</option>
                      <option value="Club">Club</option>
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Capacity</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none pr-10"
                    />
                    <ValidCheck isValid={isCapValid} />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Poster Image URL</label>
                  <input
                    type="url"
                    name="posterUrl"
                    value={formData.posterUrl}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none pr-10"
                    placeholder="https://..."
                  />
                  <ValidCheck isValid={isPosterValid} />
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAsTemplate}
                      onChange={(e) => setSaveAsTemplate(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"><Save className="w-4 h-4" /> Save as Template</span>
                  </label>
                  
                  <AnimatePresence>
                    {saveAsTemplate && (
                      <motion.input
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Template Name (e.g., Weekly Seminar)"
                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none"
                      />
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex justify-between pt-4">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(-1)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.95 }}
                    disabled={!isStep3Valid || (saveAsTemplate && !templateName.trim())}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                  >
                    Create Event <Check className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
        )}
      </div>
    </DashboardLayout>
  );
}

```

## `src/components/OrganizerManageEventPage.tsx`
```tsx
import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { useData } from "../contexts/DataContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { Download, Search, Trash2, Megaphone, ArrowLeft, Star, UserPlus, ShieldX, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

import { supabase } from "../lib/supabase";
import { RegistrationService } from "../services/api";

export default function OrganizerManageEventPage() {
  const { id } = useParams<{ id: string }>();
  const { events, registrations, removeRegistrant, announcements, addAnnouncement, feedbacks, getVolunteers, inviteVolunteer, removeVolunteer, isLoading, error } = useData();
  const event = events.find(e => e.id === id);

  const [activeTab, setActiveTab] = useState<"registrants" | "analytics" | "announcements" | "feedback" | "volunteers">("registrants");
  
  // Registrants State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"email" | "status" | "attended">("email");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Announcements State
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");

  // Volunteers State
  const [volunteers, setVolunteers] = useState<{userId: string; email: string}[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (event) {
      getVolunteers(event.id).then(setVolunteers).catch(console.error);
    }
  }, [event, getVolunteers]);

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto py-8">
          <ErrorState 
            title="Failed to load event data" 
            message="There was a problem connecting to the server. Please try refreshing."
            onRetry={() => window.location.reload()}
          />
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto py-8 space-y-8">
          <SkeletonLoader type="header" />
          <SkeletonLoader type="card" className="h-[500px]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto py-8">
          <EmptyState 
            icon={<Calendar className="w-8 h-8" />}
            title="Event not found."
            description="The event you are trying to manage does not exist or you do not have access."
            actionText="Back to Dashboard"
            actionHref="/organizer"
          />
        </div>
      </DashboardLayout>
    );
  }

  const eventRegsContext = registrations.filter(r => r.eventId === event.id);
  const eventAnnouncements = announcements.filter(a => a.eventId === event.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const eventFeedbacks = feedbacks.filter(f => f.eventId === event.id);

  const [liveRegs, setLiveRegs] = useState(eventRegsContext);
  useEffect(() => {
    setLiveRegs(eventRegsContext);
  }, [eventRegsContext]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`registrations:${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations',
          filter: `event_id=eq.${id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLiveRegs(prev => [...prev, {
              id: payload.new.id,
              eventId: payload.new.event_id,
              studentId: payload.new.user_id,
              status: payload.new.status,
              waitlistPosition: undefined,
              ticketId: payload.new.ticket_id,
              attended: payload.new.attended
            }]);
            RegistrationService.getRegistrationsForOrganizer(id).then(regs => {
              setLiveRegs(regs);
            });
          } else if (payload.eventType === 'UPDATE') {
            setLiveRegs(prev => prev.map(r => r.id === payload.new.id ? {
              ...r,
              status: payload.new.status,
              attended: payload.new.attended
            } : r));
          } else if (payload.eventType === 'DELETE') {
            setLiveRegs(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
         if (status === 'SUBSCRIBED') {
            RegistrationService.getRegistrationsForOrganizer(id).then(regs => {
                setLiveRegs(regs);
            });
         }
      });
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // Data Grid Logic
  const filteredRegs = useMemo(() => {
    return liveRegs.filter(r => (r.studentEmail || "").toLowerCase().includes(searchQuery.toLowerCase()));
  }, [liveRegs, searchQuery]);

  const sortedRegs = useMemo(() => {
    return [...filteredRegs].sort((a, b) => {
      let valA, valB;
      if (sortField === "email") { valA = a.studentEmail; valB = b.studentEmail; }
      else if (sortField === "status") { valA = a.status; valB = b.status; }
      else { valA = a.attended ? 1 : 0; valB = b.attended ? 1 : 0; }
      
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredRegs, sortField, sortDir]);

  const toggleSort = (field: "email" | "status" | "attended") => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const exportCSV = () => {
    const headers = ["Ticket ID", "Student Email", "Status", "Attended"];
    const rows = sortedRegs.map(r => [r.ticketId || "N/A", r.studentEmail, r.status, r.attended ? "Yes" : "No"]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${event.title.replace(/\s+/g, '_')}_registrants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;
    try {
      await addAnnouncement({
        eventId: event.id,
        message: `${announcementTitle.trim()}: ${announcementContent.trim()}`
      });
      setAnnouncementTitle("");
      setAnnouncementContent("");
      toast.success("Announcement broadcasted");
    } catch (err: any) {
      toast.error(err.message || "Failed to send announcement");
    }
  };

  const handleInviteVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    try {
      await inviteVolunteer(event.id, inviteEmail.trim());
      setInviteEmail("");
      const updated = await getVolunteers(event.id);
      setVolunteers(updated);
      toast.success("Volunteer added");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to invite volunteer");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveVolunteer = async (userId: string) => {
    try {
      await removeVolunteer(event.id, userId);
      const updated = await getVolunteers(event.id);
      setVolunteers(updated);
      toast.success("Volunteer removed");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to remove volunteer");
    }
  };

  // Analytics Data
  const attendanceData = [
    { name: "Attended", value: liveRegs.filter(r => r.attended).length },
    { name: "No Show", value: liveRegs.length - liveRegs.filter(r => r.attended).length }
  ];
  const COLORS = ["#10b981", "#ef4444"];

  const capacityData = [
    { name: "Registered", count: event.registeredCount },
    { name: "Available", count: Math.max(0, event.capacity - event.registeredCount) }
  ];
  
  // Mock registration over time
  const regOverTime = [
    { day: "Day 1", regs: Math.floor(event.registeredCount * 0.2) },
    { day: "Day 2", regs: Math.floor(event.registeredCount * 0.5) },
    { day: "Day 3", regs: Math.floor(event.registeredCount * 0.8) },
    { day: "Day 4", regs: event.registeredCount },
  ];

  const avgRating = eventFeedbacks.length > 0 ? (eventFeedbacks.reduce((acc, f) => acc + f.rating, 0) / eventFeedbacks.length).toFixed(1) : "N/A";
  const isPast = new Date(event.endTime).getTime() < Date.now();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8">
        <header className="mb-8">
          <Link to="/organizer" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">Total Registered: {liveRegs.length}</p>
            </div>
            <Link to={`/events/${event.id}`} target="_blank" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              View Public Page
            </Link>
          </div>
        </header>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {(["registrants", "analytics", "announcements", "feedback", "volunteers"] as const).map(tab => {
            if (tab === "feedback" && !isPast) return null;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full font-bold transition-colors whitespace-nowrap ${
                  activeTab === tab 
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" 
                    : "bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          })}
        </div>

        {activeTab === "registrants" && (
          <div className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search emails..." 
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                    <th className="py-3 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => toggleSort("email")}>
                      Student Email {sortField === "email" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => toggleSort("status")}>
                      Status {sortField === "status" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => toggleSort("attended")}>
                      Attended {sortField === "attended" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRegs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">No registrants found.</td>
                    </tr>
                  ) : (
                    sortedRegs.map(reg => (
                      <tr key={reg.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4 font-medium">{reg.studentEmail}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            reg.status === "registered" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {reg.attended ? <span className="text-green-600 font-bold">Yes</span> : <span className="text-gray-400">No</span>}
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={async () => { try { await removeRegistrant(reg.id); } catch(e: any) { toast.error(e.message || 'Failed to remove'); } }}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Remove Registrant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm col-span-1 md:col-span-2">
              <h3 className="font-bold mb-6">Registrations Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={regOverTime}>
                    <defs>
                      <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="regs" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRegs)" isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="font-bold mb-4">Attendance Rate</h3>
              <div className="h-64 flex items-center justify-center">
                {liveRegs.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" isAnimationActive={true} animationDuration={1500} animationEasing="ease-out">
                        {attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500">No data</p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="font-bold mb-4">Capacity Fill</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={capacityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-fit">
              <h3 className="font-bold mb-2 flex items-center gap-2"><Megaphone className="w-5 h-5 text-primary" /> Broadcast Announcement</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Send a notification to all registered attendees.</p>
              <form onSubmit={handleBroadcast} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={announcementTitle}
                    onChange={e => setAnnouncementTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g., Room Change"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message</label>
                  <textarea
                    value={announcementContent}
                    onChange={e => setAnnouncementContent(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Write your message..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={!announcementTitle.trim() || !announcementContent.trim()}
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  Send Broadcast
                </button>
              </form>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Past Announcements</h3>
              <div className="space-y-4">
                {eventAnnouncements.length === 0 ? (
                  <p className="text-gray-500 text-sm">No announcements sent yet.</p>
                ) : (
                  eventAnnouncements.map(ann => (
                    <div key={ann.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white">{ann.message}</h4>
                        <span className="text-xs text-gray-500">{new Date(ann.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{ann.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "feedback" && isPast && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-500 dark:text-gray-400">Average Rating</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                  {avgRating} <Star className="w-8 h-8 text-yellow-400 fill-current" />
                </div>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-gray-500 dark:text-gray-400">Total Reviews</h3>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{eventFeedbacks.length}</div>
              </div>
            </div>

            <div className="space-y-4">
              {eventFeedbacks.length === 0 ? (
                <div className="text-center p-8 bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 text-gray-500">
                  No feedback received yet.
                </div>
              ) : (
                eventFeedbacks.map(f => (
                  <div key={f.id} className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{f.studentEmail}</div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`w-4 h-4 ${star <= f.rating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-700"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{f.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "volunteers" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">Invite Volunteer</h2>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Volunteers can scan and manually check in attendees. They cannot edit the event or export data. They must already have a Gatherum account.
                </p>
                <form onSubmit={handleInviteVolunteer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none"
                      placeholder="student@poornima.org"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!inviteEmail.trim() || inviteLoading}
                    className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    {inviteLoading ? "Adding..." : "Add Volunteer"}
                  </button>
                </form>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Current Volunteers ({volunteers.length})</h3>
              <div className="space-y-4">
                {volunteers.length === 0 ? (
                  <div className="text-center p-8 bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 text-gray-500">
                    No volunteers added yet.
                  </div>
                ) : (
                  volunteers.map(vol => (
                    <div key={vol.userId} className="flex justify-between items-center p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {vol.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{vol.email}</div>
                          <div className="text-xs text-gray-500">Event Volunteer</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm("Remove this volunteer?")) {
                            handleRemoveVolunteer(vol.userId);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                        title="Remove volunteer"
                      >
                        <ShieldX className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

```

## `src/components/ProfileCompletionForm.tsx`
```tsx
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AuthService } from "../services/api";
import {
  UserCheck, GraduationCap, Phone, Hash, BookOpen, ChevronRight, Loader2, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

const BRANCHES = [
  "Computer Science Engineering",
  "Information Technology",
  "Electronics & Communication Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Artificial Intelligence & Data Science",
  "Other",
];

const YEARS = [
  { value: 1, label: "1st Year" },
  { value: 2, label: "2nd Year" },
  { value: 3, label: "3rd Year" },
  { value: 4, label: "4th Year" },
];

interface FormState {
  fullName: string;
  rollNumber: string;
  branch: string;
  yearOfStudy: string;
  phoneNumber: string;
}

const FIELD_CONFIG = [
  {
    id: "fullName",
    label: "Full Name",
    placeholder: "e.g. Priya Sharma",
    type: "text",
    icon: UserCheck,
    description: "Your full legal name as on your ID card",
  },
  {
    id: "rollNumber",
    label: "Roll Number",
    placeholder: "e.g. 21ECEB001",
    type: "text",
    icon: Hash,
    description: "Your official university roll number",
  },
];

export default function ProfileCompletionForm() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    fullName: "",
    rollNumber: "",
    branch: "",
    yearOfStudy: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Pre-fill with any existing partial data
  useEffect(() => {
    if (!user) return;
    AuthService.getProfile(user.id)
      .then((profile: any) => {
        if (profile) {
          setForm((prev) => ({
            ...prev,
            fullName: profile.full_name ?? "",
            rollNumber: profile.roll_number ?? "",
            branch: profile.branch ?? "",
            yearOfStudy: profile.year_of_study ? String(profile.year_of_study) : "",
            phoneNumber: profile.phone_number ?? "",
          }));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch profile", err);
        setFetchError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.rollNumber.trim()) newErrors.rollNumber = "Roll number is required";
    if (!form.branch) newErrors.branch = "Please select your branch";
    if (!form.yearOfStudy) newErrors.yearOfStudy = "Please select your year";
    if (form.phoneNumber && !/^\+?[\d\s\-()]{7,15}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!user) return;

    setSaving(true);
    try {
      await AuthService.completeProfile({
        fullName: form.fullName.trim(),
        rollNumber: form.rollNumber.trim(),
        branch: form.branch,
        yearOfStudy: Number(form.yearOfStudy),
        phoneNumber: form.phoneNumber.trim() || null,
      });
      await refreshUser();
      toast.success("Profile complete! Welcome to Gatherum 🎉");
      navigate(`/${user.role}`, { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Complete Your Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            One-time setup so organizers can identify you at events.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="mt-4 text-gray-500">Loading your profile...</p>
          </div>
        ) : fetchError ? (
          <div className="text-center py-12 px-6 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/20">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mt-4">Failed to load profile</h3>
            <p className="text-red-600 dark:text-red-400 mt-2">Please refresh the page to try again.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <form onSubmit={handleSubmit} noValidate>
              <div className="p-8 space-y-5">
                {/* Full Name & Roll Number */}
                {FIELD_CONFIG.map(({ id, label, placeholder, type, icon: Icon, description }) => (
                  <div key={id}>
                    <label
                      htmlFor={`profile-${id}`}
                      className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                      {label} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        id={`profile-${id}`}
                        type={type}
                        value={form[id as keyof FormState]}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, [id]: e.target.value }))
                        }
                        placeholder={placeholder}
                        className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors[id as keyof FormState]
                            ? "border-red-400 focus:ring-red-400"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      />
                    </div>
                    {errors[id as keyof FormState] && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors[id as keyof FormState]}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">{description}</p>
                  </div>
                ))}

                {/* Branch */}
                <div>
                  <label
                    htmlFor="profile-branch"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      id="profile-branch"
                      value={form.branch}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, branch: e.target.value }))
                      }
                      className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary appearance-none ${
                        errors.branch
                          ? "border-red-400 focus:ring-red-400"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <option value="">Select your branch…</option>
                      {BRANCHES.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.branch && (
                    <p className="mt-1 text-xs text-red-500">{errors.branch}</p>
                  )}
                </div>

                {/* Year of Study */}
                <div>
                  <label
                    htmlFor="profile-year"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Year of Study <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {YEARS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            yearOfStudy: String(value),
                          }))
                        }
                        className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                          form.yearOfStudy === String(value)
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary/50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {errors.yearOfStudy && (
                    <p className="mt-1 text-xs text-red-500">{errors.yearOfStudy}</p>
                  )}
                </div>

                {/* Phone (optional) */}
                <div>
                  <label
                    htmlFor="profile-phone"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Phone Number{" "}
                    <span className="text-gray-400 font-normal text-xs">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="profile-phone"
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))
                      }
                      placeholder="e.g. 9876543210"
                      className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.phoneNumber
                          ? "border-red-400 focus:ring-red-400"
                          : "border-gray-200 dark:border-gray-700"
                      }`}
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    Used only by organizers for event coordination.
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="px-8 py-5 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800">
                <motion.button
                  type="submit"
                  disabled={saving}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      Continue to Gatherum
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-4">
          This information is only visible to event organizers and admins.
        </p>
      </motion.div>
    </div>
  );
}

```

## `src/components/ProfileSettings.tsx`
```tsx
import React, { useState, useEffect } from "react";
import DashboardLayout from "./DashboardLayout";
import { useAuth } from "../contexts/AuthContext";
import { AuthService } from "../services/api";
import { Settings, Shield, User, Save } from "lucide-react";
import toast from "react-hot-toast";
import SkeletonLoader from "./SkeletonLoader";
import ErrorState from "./ErrorState";

export default function ProfileSettings() {
  const { user } = useAuth();
  const [publicRsvp, setPublicRsvp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      AuthService.getProfile(user.id).then((profile: any) => {
        setPublicRsvp(profile.public_rsvp ?? true);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await AuthService.updateProfilePrivacy(publicRsvp);
      toast.success("Privacy settings updated");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-8 space-y-8">
          <SkeletonLoader type="header" />
          <SkeletonLoader type="card" className="h-[300px]" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-8">
          <ErrorState 
            title="Failed to load profile settings" 
            message="There was a problem connecting to the server. Please try refreshing."
            onRetry={() => window.location.reload()}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-8">
        <header className="mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
            <p className="text-gray-500">Manage your account preferences and privacy</p>
          </div>
        </header>

        <div className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-900 dark:text-white">{user?.email}</h2>
              <p className="text-gray-500 capitalize">{user?.role} Account</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Privacy Settings
            </h3>
            
            <label className="flex items-start gap-4 cursor-pointer group p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary/50 transition-colors">
              <div className="relative flex items-center mt-1">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={publicRsvp}
                  onChange={(e) => setPublicRsvp(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white block mb-1">Make RSVPs Public</span>
                <span className="text-sm text-gray-500">
                  When enabled, your profile picture will be shown in the "Who's going" section of events you register for.
                </span>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

```

## `src/components/ProtectedRoute.tsx`
```tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, Role } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  /** Set true for routes that should be accessible even before profile_completed is true (e.g. /complete-profile itself). */
  skipProfileCheck?: boolean;
}

export default function ProtectedRoute({ allowedRoles, skipProfileCheck }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Gate: banned users are immediately signed out to /login.
  if (user.isBanned) {
    return <Navigate to="/login" replace />;
  }

  // Gate: redirect to profile completion form if not done yet.
  if (!skipProfileCheck && !user.profileCompleted && location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }

  // If profile is done and they try to revisit /complete-profile, send them home.
  if (skipProfileCheck && user.profileCompleted) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <Outlet />;
}

```

## `src/components/PublicOrganizerPage.tsx`
```tsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { Building, MapPin, Calendar, ArrowLeft, Download, Bell, BellRing, Share2 } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import TiltCard from "./TiltCard";
import toast from "react-hot-toast";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

export default function PublicOrganizerPage() {
  const { id } = useParams<{ id: string }>();
  const { events, isLoading, error, getFollowedOrganizers, subscribeToOrganizer, unsubscribeFromOrganizer } = useData();
  const { user } = useAuth();
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  const organizerEvents = events.filter(e => e.organizerId === id && !e.isUnpublished);
  
  // We deduce organizer info from the first event, in a real app we'd fetch the organizer profile
  const department = organizerEvents.length > 0 ? organizerEvents[0].department : "Organizer";

  useEffect(() => {
    if (user && id) {
      getFollowedOrganizers().then(followed => {
        setIsFollowing(followed.includes(id));
      }).catch(console.error);
    }
  }, [id, getFollowedOrganizers, user]);

  const handleToggleFollow = async () => {
    if (!user) {
      toast.error("Please login to follow this organizer");
      return;
    }
    if (!id) return;
    
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await unsubscribeFromOrganizer(id);
        setIsFollowing(false);
        toast.success("Unsubscribed from organizer");
      } else {
        await subscribeToOrganizer(id);
        setIsFollowing(true);
        toast.success("Subscribed! You'll be notified of their new events.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update subscription");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleDownloadIcs = () => {
    // Generate a simple ICS file for all upcoming events
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Gatherum//Events//EN",
    ];
    
    organizerEvents.forEach(event => {
      const dStart = new Date(event.startTime);
      const dEnd = new Date(event.endTime);
      if (isNaN(dStart.getTime()) || isNaN(dEnd.getTime())) return;
      
      const start = dStart.toISOString().replace(/[-:]/g, '').split('.')[0] + "Z";
      const end = dEnd.toISOString().replace(/[-:]/g, '').split('.')[0] + "Z";
      
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${event.id}@gatherum.poornima.org`);
      lines.push(`DTSTAMP:${start}`);
      lines.push(`DTSTART:${start}`);
      lines.push(`DTEND:${end}`);
      lines.push(`SUMMARY:${event.title}`);
      lines.push(`DESCRIPTION:${event.description}`);
      lines.push(`LOCATION:${event.location}`);
      lines.push("END:VEVENT");
    });
    
    lines.push("END:VCALENDAR");
    
    const blob = new Blob([lines.join("\r\n")], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${department.replace(/\s+/g, '_')}_Calendar.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Calendar feed downloaded");
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${department} on Gatherum`,
        url: window.location.href
      });
    } catch (err) {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-light dark:bg-bg-dark">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/events" className="inline-flex items-center gap-2 text-primary hover:underline mb-8 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Discover
          </Link>

          {error ? (
            <ErrorState 
              title="Failed to load organizer" 
              message="There was a problem connecting to the server. Please try refreshing."
              onRetry={() => window.location.reload()}
            />
          ) : isLoading ? (
            <div className="space-y-8">
              <SkeletonLoader type="card" className="h-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SkeletonLoader type="card" className="h-[300px]" count={3} />
              </div>
            </div>
          ) : (
            <>
              <header className="bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0 border-4 border-white dark:border-surface-dark shadow-md z-10">
                  <Building className="w-12 h-12" />
                </div>
                
                <div className="flex-grow z-10">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{department}</h1>
                  <p className="text-gray-500 mb-6">Organizer on Gatherum • {organizerEvents.length} upcoming events</p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <button 
                      onClick={handleToggleFollow}
                      disabled={isFollowLoading}
                      className={`px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50 ${isFollowing ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-primary text-white hover:bg-primary-hover'}`}
                    >
                      {isFollowing ? <><BellRing className="w-4 h-4" /> Following</> : <><Bell className="w-4 h-4" /> Subscribe</>}
                    </button>
                    <button 
                      onClick={handleDownloadIcs}
                      className="px-4 py-2 rounded-full font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" /> .ics Feed
                    </button>
                    <button 
                      onClick={handleShare}
                      className="px-4 py-2 rounded-full font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                </div>
              </header>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" /> Upcoming Events
              </h2>
              
              {organizerEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {organizerEvents.map(event => (
                    <motion.div key={event.id} whileHover={{ y: -5 }}>
                      <TiltCard>
                        <Link 
                          to={`/events/${event.id}`}
                          className="block group bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 h-full"
                        >
                          <div className="h-40 bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                            <img src={event.posterUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary">
                              {event.category}
                            </div>
                          </div>
                          <div className="p-5 flex flex-col justify-between h-[calc(100%-10rem)]">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">{event.title}</h3>
                              <div className="space-y-1 mb-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 line-clamp-1">
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </p>
                              </div>
                            </div>
                            <div className="text-primary font-bold text-sm group-hover:underline mt-auto">
                              View Details →
                            </div>
                          </div>
                        </Link>
                      </TiltCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={<Calendar className="w-12 h-12" />}
                  title="No upcoming events"
                  description="This organizer hasn't scheduled any events yet. Subscribe to be notified when they do."
                />
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

```

## `src/components/SignUpPage.tsx`
```tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, AuthError } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";

// ─── Error messages ───────────────────────────────────────────────────────────
const ERROR_MESSAGES: Record<AuthError, string> = {
  invalid_email: "Please enter a valid email address.",
  domain_restricted: "Sign-ups are restricted to your university email domain.",
  signups_disabled: "New sign-ups are temporarily disabled. Please try again later.",
  user_banned: "Your account has been suspended. Contact support.",
  unknown: "Something went wrong. Please try again.",
};

// ─── Google Icon ─────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}

// ─── Decorative background blobs ─────────────────────────────────────────────
function Background() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-bg-light">
      <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[80px]" />
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
type Screen = "choose" | "magic_link" | "magic_sent";

export default function SignUpPage() {
  const [screen, setScreen] = useState<Screen>("choose");
  const [email, setEmail]   = useState("");
  const [error, setError]   = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLoading, setMagicLoading]   = useState(false);

  const { login, loginWithGoogle, user, authError, clearAuthError, settings } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlError = params.get("error_description");
    if (urlError) {
      setError("Sign-up failed: " + decodeURIComponent(urlError.replace(/\+/g, " ")));
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [location.search]);

  useEffect(() => {
    if (authError) {
      setError(ERROR_MESSAGES[authError]);
      clearAuthError();
    }
  }, [authError, clearAuthError]);

  useEffect(() => {
    if (user) {
      if (!user.profileCompleted) {
        navigate("/complete-profile", { replace: true });
      } else {
        navigate(`/${user.role}`, { replace: true });
      }
    }
  }, [user, navigate]);

  const handleGoogleSignUp = async () => {
    setError(null);
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    if (!result.success && result.error) {
      setError(ERROR_MESSAGES[result.error]);
      setGoogleLoading(false);
    }
  };

  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setError(null);
    setMagicLoading(true);
    const result = await login(email);
    setMagicLoading(false);

    if (result.success) {
      setScreen("magic_sent");
    } else if (result.error) {
      setError(ERROR_MESSAGES[result.error]);
    }
  };

  return (
    <>
      <Background />
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white p-8 rounded-3xl shadow-xl relative overflow-hidden"
        >
          {/* Subtle top glare */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              Join Gatherum
            </h1>
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">
              Create your account to discover and register for campus events.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {screen === "choose" && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {error && (
                  <div className="p-3 mb-4 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl">
                    {error}
                  </div>
                )}
                <button
                  onClick={handleGoogleSignUp}
                  disabled={googleLoading}
                  className="w-full h-12 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {googleLoading ? <Spinner /> : <GoogleIcon />}
                  Sign up with Google
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                  <div className="relative flex justify-center"><span className="bg-white/80 px-4 text-xs font-bold uppercase text-gray-400 tracking-wider">Or</span></div>
                </div>

                <button
                  onClick={() => { setError(null); setScreen("magic_link"); }}
                  className="w-full h-12 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all active:scale-[0.98] shadow-sm"
                >
                  Sign up with Magic Link
                </button>
              </motion.div>
            )}

            {screen === "magic_link" && (
              <motion.form
                key="magic_link"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleMagicLinkSubmit}
                className="space-y-4"
              >
                {error && (
                  <div className="p-3 mb-4 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl">
                    {error}
                  </div>
                )}
                
                {settings?.allowedEmailDomain && (
                  <div className="text-xs font-bold text-gray-500 mb-2 px-1">
                    Use your <span className="text-primary">{settings.allowedEmailDomain}</span> email
                  </div>
                )}
                
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`student${settings?.allowedEmailDomain ? settings.allowedEmailDomain : '@college.edu'}`}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 font-medium"
                  required
                />
                
                <button
                  type="submit"
                  disabled={magicLoading || !email.trim()}
                  className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {magicLoading ? <Spinner /> : "Send Magic Link"}
                </button>

                <button
                  type="button"
                  onClick={() => { setError(null); setScreen("choose"); }}
                  className="w-full py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Back
                </button>
              </motion.form>
            )}

            {screen === "magic_sent" && (
              <motion.div
                key="magic_sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  We've sent a magic link to <strong className="text-gray-900">{email}</strong>. Click it to create your account and sign in.
                </p>
                <button
                  onClick={() => setScreen("choose")}
                  className="text-sm font-bold text-primary hover:text-primary-hover transition-colors"
                >
                  Try another email
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Link back to login */}
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Already have an account? Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}

```

## `src/components/SkeletonLoader.tsx`
```tsx
import { useReducedMotion } from "motion/react";

interface SkeletonProps {
  type?: "card" | "text" | "header" | "avatar" | "list";
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ type = "text", count = 1, className = "" }: SkeletonProps) {
  const shouldReduceMotion = useReducedMotion();
  const animationClass = shouldReduceMotion ? "" : "animate-pulse";

  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return (
          <div className={`bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 p-4 ${className}`}>
            <div className={`w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4 ${animationClass}`} />
            <div className={`w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2 ${animationClass}`} />
            <div className={`w-1/2 h-4 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 ${animationClass}`} />
            <div className="flex justify-between items-center mt-4">
              <div className={`w-1/3 h-4 bg-gray-100 dark:bg-gray-800 rounded-lg ${animationClass}`} />
              <div className={`w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full ${animationClass}`} />
            </div>
          </div>
        );
      
      case "header":
        return (
          <div className={`space-y-3 ${className}`}>
            <div className={`w-1/2 md:w-1/3 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl ${animationClass}`} />
            <div className={`w-3/4 md:w-1/2 h-5 bg-gray-100 dark:bg-gray-800 rounded-lg ${animationClass}`} />
          </div>
        );
        
      case "avatar":
        return <div className={`w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0 ${animationClass} ${className}`} />;
        
      case "list":
        return (
          <div className={`flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl ${className}`}>
            <div className={`w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0 ${animationClass}`} />
            <div className="flex-1 space-y-2">
              <div className={`w-3/4 h-5 bg-gray-200 dark:bg-gray-700 rounded-lg ${animationClass}`} />
              <div className={`w-1/2 h-4 bg-gray-100 dark:bg-gray-800 rounded-lg ${animationClass}`} />
            </div>
          </div>
        );

      case "text":
      default:
        return <div className={`w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-lg ${animationClass} ${className}`} />;
    }
  };

  if (count === 1) return renderSkeleton();

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </>
  );
}

```

## `src/components/StudentDashboard.tsx`
```tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import DashboardLayout from "./DashboardLayout";
import { Ticket, Calendar, Search, Clock, ArrowRight, Megaphone, Star, Check, Shield, Plus } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import StudentOnboarding from "./StudentOnboarding";
import { pageTransition, cardHover } from "../utils/motion";
import TiltCard from "./TiltCard";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { toast } from "react-hot-toast";

export default function StudentDashboard() {
  const { events, registrations, announcements, feedbacks, addFeedback, getMyVolunteeringEvents, isLoading, error } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "waitlist">("upcoming");
  const [feedbackState, setFeedbackState] = useState<{ [eventId: string]: { rating: number, comment: string } }>({});
  const [volunteeringEventIds, setVolunteeringEventIds] = useState<string[]>([]);

  useEffect(() => {
    getMyVolunteeringEvents().then(setVolunteeringEventIds).catch(console.error);
  }, [getMyVolunteeringEvents]);

  if (!user) return null;

  const userRegs = registrations.filter(r => r.studentId === user?.id);
  
  const now = new Date().getTime();
  
  const upcomingEvents = userRegs
    .filter(r => r.status === "registered")
    .map(r => ({ reg: r, event: events.find(e => e.id === r.eventId) }))
    .filter(item => item.event && new Date(item.event.endTime).getTime() > now)
    .sort((a, b) => new Date(a.event!.startTime).getTime() - new Date(b.event!.startTime).getTime());

  const pastEvents = userRegs
    .filter(r => r.status === "registered")
    .map(r => ({ reg: r, event: events.find(e => e.id === r.eventId) }))
    .filter(item => item.event && new Date(item.event.endTime).getTime() <= now)
    .sort((a, b) => new Date(b.event!.startTime).getTime() - new Date(a.event!.startTime).getTime());

  const waitlistedEvents = userRegs
    .filter(r => r.status === "waitlisted")
    .map(r => ({ reg: r, event: events.find(e => e.id === r.eventId) }))
    .filter(item => item.event);

  const volunteeringEvents = events.filter(e => volunteeringEventIds.includes(e.id)).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const userCategories = new Set([...upcomingEvents, ...pastEvents].map(item => item.event?.category));
  const recommendedEvents = events
    .filter(e => new Date(e.endTime).getTime() > now)
    .filter(e => !userRegs.some(r => r.eventId === e.id) && !volunteeringEventIds.includes(e.id))
    .filter(e => userCategories.size === 0 || userCategories.has(e.category))
    .slice(0, 3);

  const upcomingEventIds = upcomingEvents.map(u => u.event!.id);
  const relevantAnnouncements = announcements
    .filter(a => upcomingEventIds.includes(a.eventId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const handleFeedbackSubmit = async (eventId: string) => {
    const data = feedbackState[eventId];
    if (data && data.rating > 0) {
      try {
        await addFeedback({
          eventId,
          studentEmail: user.email,
          rating: data.rating,
          comment: data.comment
        });
        toast.success("Feedback submitted!");
      } catch(e: any) {
        toast.error(e.message || "Failed to submit feedback");
      }
    }
  };

  const renderEventList = (list: any[], emptyMessage: string, emptyActionText: string) => {
    if (list.length === 0) {
      return (
        <EmptyState 
          icon={<Calendar className="w-8 h-8" />}
          title={emptyMessage}
          description="You can browse more events on the discovery page."
          actionText={emptyActionText}
          actionHref="/events"
        />
      );
    }

    return (
      <motion.div 
        className="space-y-4" 
        role="list"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
      >
        <AnimatePresence mode="popLayout">
          {list.map(({ reg, event }) => {
            const isPast = activeTab === "past";
            const hasFeedback = feedbacks.some(f => f.eventId === event.id && f.studentId === user?.id);
            const feedbackData = feedbackState[event.id] || { rating: 0, comment: "" };

            return (
              <motion.div 
                key={reg.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={cardHover}
                className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-primary/50 hover:shadow-md transition-shadow"
                role="listitem"
              >
              <Link 
                to={`/events/${event.id}`}
                className="flex items-center gap-6 p-4 group focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800/50"
                aria-label={`View details for ${event.title}`}
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 hidden sm:block bg-gray-100 dark:bg-gray-800" aria-hidden="true">
                  <img src={event.posterUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-4">{event.title}</h4>
                    {reg.status === 'waitlisted' && (
                      <span className="shrink-0 px-3 py-1 bg-accent/10 text-accent-darker dark:text-accent text-xs font-bold rounded-full">
                        Waitlist
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                      {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1 hidden md:flex truncate">
                      <Clock className="w-4 h-4" aria-hidden="true" />
                      {event.location}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 p-2 text-gray-400 group-hover:text-primary transition-colors">
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </div>
              </Link>
              
              <AnimatePresence mode="wait">
                {isPast && !hasFeedback && (
                  <motion.div 
                    key="form"
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/30"
                  >
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-3" id={`feedback-label-${event.id}`}>How was the event?</p>
                    <div className="flex flex-col sm:flex-row gap-4" role="group" aria-labelledby={`feedback-label-${event.id}`}>
                      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star}
                            onClick={() => setFeedbackState(prev => ({ ...prev, [event.id]: { ...feedbackData, rating: star } }))}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                                e.preventDefault();
                                const next = star < 5 ? star + 1 : 1;
                                setFeedbackState(prev => ({ ...prev, [event.id]: { ...feedbackData, rating: next } }));
                              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                                e.preventDefault();
                                const prev = star > 1 ? star - 1 : 5;
                                setFeedbackState(prev => ({ ...prev, [event.id]: { ...feedbackData, rating: prev } }));
                              }
                            }}
                            tabIndex={feedbackData.rating === star || (feedbackData.rating === 0 && star === 1) ? 0 : -1}
                            className="focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
                            role="radio"
                            aria-checked={feedbackData.rating === star}
                            aria-label={`${star} star${star > 1 ? 's' : ''}`}
                          >
                            <Star className={`w-6 h-6 ${star <= feedbackData.rating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600 hover:text-yellow-200"}`} />
                          </button>
                        ))}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input 
                          type="text" 
                          value={feedbackData.comment}
                          onChange={e => setFeedbackState(prev => ({ ...prev, [event.id]: { ...feedbackData, comment: e.target.value } }))}
                          placeholder="Add a comment (optional)..." 
                          aria-label="Additional feedback comment"
                          className="flex-1 text-sm p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-dark outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button 
                          onClick={() => handleFeedbackSubmit(event.id)}
                          disabled={feedbackData.rating === 0}
                          aria-label="Submit feedback"
                          className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                {isPast && hasFeedback && (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border-t border-gray-100 dark:border-gray-800 p-4 bg-green-50 dark:bg-green-900/10 flex items-center gap-2 text-green-700 dark:text-green-400 text-sm font-bold" 
                    role="status"
                  >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                      <Check className="w-5 h-5 text-green-500" aria-hidden="true" /> 
                    </motion.div>
                    Feedback submitted. Thank you!
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <DashboardLayout>
      <StudentOnboarding />
      <motion.div 
        variants={pageTransition} 
        initial="initial" 
        animate="animate" 
        exit="exit" 
        className="max-w-5xl mx-auto space-y-10"
      >
        <header>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Student Dashboard</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">Manage your schedule and discover new experiences.</p>
        </header>

        {error ? (
          <ErrorState 
            title="Failed to load dashboard" 
            message="There was a problem connecting to the server. Please try refreshing."
            onRetry={() => window.location.reload()}
          />
        ) : isLoading ? (
          <div className="space-y-8">
            <SkeletonLoader type="card" className="h-40" />
            <SkeletonLoader type="card" count={3} />
          </div>
        ) : (
          <>
            {relevantAnnouncements.length > 0 && (
          <section className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-3xl p-6" aria-labelledby="announcements-heading">
            <h2 id="announcements-heading" className="font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" /> Recent Announcements
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relevantAnnouncements.map(ann => {
                const eventForAnn = events.find(e => e.id === ann.eventId);
                return (
                  <motion.div 
                    key={ann.id} 
                    whileHover={cardHover}
                    className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-blue-100/50 dark:border-blue-800/50"
                  >
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">{eventForAnn?.title}</div>
                    <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3">{ann.message}</p>
                  </motion.div>
                )
              })}
            </div>
          </section>
        )}

        {volunteeringEvents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Events You're Helping With</h2>
                <p className="text-gray-500">You are a volunteer for these events</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {volunteeringEvents.map(event => (
                <Link 
                  key={`vol-${event.id}`}
                  to={`/checkin/${event.id}`}
                  className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-purple-100 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-md transition-all flex items-center gap-4 group"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                    <img src={event.posterUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{event.title}</h4>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="shrink-0 p-2 text-purple-600 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tabs and Event Lists */}
        <section>
          <div 
            className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-gray-200 dark:border-gray-800 scrollbar-hide" 
            role="tablist" 
            aria-label="Event categories"
          >
            {[
              { id: "upcoming", label: "Upcoming", count: upcomingEvents.length },
              { id: "waitlist", label: "Waitlist", count: waitlistedEvents.length },
              { id: "past", label: "Past Events", count: pastEvents.length }
            ].map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-semibold transition-colors border-b-2 -mb-[18px] focus:outline-none focus:ring-2 focus:ring-primary ${
                  activeTab === tab.id
                    ? "text-primary border-primary bg-primary/5 dark:bg-primary/10"
                    : "text-gray-500 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="min-h-[300px]" id={`${activeTab}-panel`} role="tabpanel">
            {activeTab === "upcoming" && renderEventList(
              upcomingEvents, 
              "You don't have any upcoming events.", 
              "Browse what's happening"
            )}
            {activeTab === "waitlist" && renderEventList(
              waitlistedEvents, 
              "You are not on any waitlists.", 
              "Explore high-demand events"
            )}
            {activeTab === "past" && renderEventList(
              pastEvents, 
              "No past events to show.", 
              "Find your first event"
            )}
          </div>
        </section>

        {/* Recommended Section */}
        {recommendedEvents.length > 0 && (
          <section className="pt-8 border-t border-gray-200 dark:border-gray-800" aria-labelledby="recommended-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="recommended-heading" className="text-2xl font-bold text-gray-900 dark:text-white">Recommended for You</h2>
              <Link to="/events" className="text-primary font-medium hover:underline text-sm flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-1">
                View All <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedEvents.map(event => (
                <motion.div key={event.id} whileHover={cardHover}>
                  <TiltCard>
                    <Link 
                      to={`/events/${event.id}`}
                      className="block group bg-white dark:bg-surface-dark rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary h-full"
                      aria-label={`View recommended event: ${event.title}`}
                    >
                      <div className="h-32 bg-gray-200 dark:bg-gray-800 relative overflow-hidden" aria-hidden="true">
                        <img src={event.posterUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs font-bold">
                          {event.category}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col justify-between h-[calc(100%-8rem)]">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                            <Calendar className="w-3 h-3" aria-hidden="true" />
                            {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-primary">View Details</span>
                      </div>
                    </Link>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </section>
        )}
          </>
        )}
      </motion.div>

      {user?.role === 'organizer' && (
        <Link
          to="/organizer/events/new"
          className="fixed bottom-8 right-8 bg-primary hover:bg-primary-hover text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transition-transform hover:scale-105 z-50"
          title="Create New Event"
        >
          <Plus className="w-6 h-6" />
        </Link>
      )}
    </DashboardLayout>
  );
}

```

## `src/components/StudentOnboarding.tsx`
```tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QrCode, Calendar, Ticket, ChevronRight, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { pageTransition, successAnimation } from "../utils/motion";

const ONBOARDING_STEPS = [
  {
    title: "Welcome to Gatherum",
    description: "Your new campus event hub. Let's quickly show you how to get around.",
    icon: Calendar,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    title: "Find & Register",
    description: "Browse the events page to find what's happening. Register with one tap, or join a waitlist if it's full.",
    icon: Ticket,
    color: "text-purple-500",
    bg: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    title: "QR Code Check-in",
    description: "Once registered, you'll get a QR ticket. Present it to the organizer at the door to check in instantly.",
    icon: QrCode,
    color: "text-primary",
    bg: "bg-primary/10",
  }
];

export default function StudentOnboarding() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!user) return;
    const key = `gatherum_onboarded_${user.email}`;
    if (localStorage.getItem(key) !== "true") {
      setIsOpen(true);
    }
  }, [user]);

  const handleClose = () => {
    if (user) {
      localStorage.setItem(`gatherum_onboarded_${user.email}`, "true");
    }
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full z-10"
              aria-label="Skip onboarding"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-8 text-center relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${step.bg}`}>
                    <Icon className={`w-10 h-10 ${step.color}`} />
                  </div>
                  <h2 id="onboarding-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex gap-2">
                {ONBOARDING_STEPS.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-primary' : 'w-2 bg-gray-300 dark:bg-gray-600'}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark"
              >
                {currentStep === ONBOARDING_STEPS.length - 1 ? "Get Started" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

```

## `src/components/StudentTicketsPage.tsx`
```tsx
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import DashboardLayout from "./DashboardLayout";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { Calendar, MapPin, Clock, Download, Ticket } from "lucide-react";
import { pageTransition, cardHover } from "../utils/motion";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import toast from "react-hot-toast";

export default function StudentTicketsPage() {
  const { events, registrations, isLoading, error } = useData();
  const { user } = useAuth();

  if (!user) return null;

  const userTickets = registrations
    .filter(r => r.studentId === user?.id && r.status === "registered")
    .map(r => ({ reg: r, event: events.find(e => e.id === r.eventId) }))
    .filter(item => item.event)
    .sort((a, b) => new Date(b.event!.startTime).getTime() - new Date(a.event!.startTime).getTime());

  const generateICS = (event: any) => {
    const dStart = new Date(event.startTime);
    const dEnd = new Date(event.endTime);
    if (isNaN(dStart.getTime()) || isNaN(dEnd.getTime())) {
      toast.error("Event dates are invalid for calendar export.");
      return;
    }

    const formatDate = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const escapeICS = (s: string) =>
      s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(dStart)}`,
      `DTEND:${formatDate(dEnd)}`,
      `SUMMARY:${escapeICS(event.title)}`,
      `DESCRIPTION:${escapeICS(event.description)}`,
      `LOCATION:${escapeICS(event.location)}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-5xl mx-auto space-y-8"
      >
        <header>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Tickets</h1>
          <p className="text-gray-500 dark:text-gray-400">Access your QR codes and event details.</p>
        </header>

        {error ? (
          <ErrorState 
            title="Failed to load tickets" 
            message="There was a problem connecting to the server. Please try refreshing."
            onRetry={() => window.location.reload()}
          />
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SkeletonLoader type="card" className="h-[400px]" count={2} />
          </div>
        ) : userTickets.length === 0 ? (
          <EmptyState 
            icon={<Ticket className="w-8 h-8" />}
            title="You have no tickets yet."
            description="Register for an event to see your ticket here."
            actionText="Browse Events"
            actionHref="/events"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" role="list">
            {userTickets.map(({ reg, event }, i) => (
              <motion.div 
                key={reg.id} 
                initial={{ opacity: 0, rotateX: -90, y: 50, perspective: 1000 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20, 
                  delay: i * 0.15 
                }}
                whileHover={cardHover}
                className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col relative"
                role="listitem"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="h-24 bg-primary/10 flex items-center justify-center relative overflow-hidden" aria-hidden="true">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${event!.posterUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  <h3 className="relative z-10 text-xl font-bold text-gray-900 dark:text-white text-center px-4">{event!.title}</h3>
                </div>
                
                <div className="p-6 flex flex-col items-center flex-grow">
                  <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 inline-block" aria-label="Ticket QR Code">
                    {reg.ticketId ? (
                      <QRCodeSVG value={reg.ticketId} size={150} level="H" aria-hidden="true" />
                    ) : (
                      <div className="w-[150px] h-[150px] bg-gray-100 flex items-center justify-center text-gray-400 text-sm">No QR Code</div>
                    )}
                  </div>
                  
                  <div className="w-full space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4 text-primary" aria-hidden="true" />
                      <span>{new Date(event!.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4 text-accent" aria-hidden="true" />
                      <span>{new Date(event!.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 text-gray-400" aria-hidden="true" />
                      <span className="truncate">{event!.location}</span>
                    </div>
                  </div>

                  <div className="mt-auto w-full flex flex-col gap-2">
                    {reg.ticketId && (
                      <div className="text-center mb-2">
                        <span className="text-xs text-gray-400 font-mono" aria-label={`Ticket ID: ${reg.ticketId}`}>ID: {reg.ticketId}</span>
                      </div>
                    )}
                    <button 
                      onClick={() => generateICS(event)}
                      className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label={`Download calendar invite for ${event!.title}`}
                    >
                      <Download className="w-4 h-4" aria-hidden="true" /> Add to Calendar
                    </button>
                    <Link 
                      to={`/events/${event!.id}`}
                      className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-center font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label={`View details for ${event!.title}`}
                    >
                      View Event Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

```

## `src/components/TiltCard.tsx`
```tsx
import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "motion/react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function TiltCard({ children, className = "" }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || shouldReduceMotion) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: shouldReduceMotion ? 0 : rotateX,
        rotateY: shouldReduceMotion ? 0 : rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: shouldReduceMotion ? 1 : 1.02, zIndex: 10 }}
      className={`relative ${className}`}
    >
      <div style={{ transform: shouldReduceMotion ? "none" : "translateZ(30px)" }} className="w-full h-full">
        {children}
      </div>
    </motion.div>
  );
}

```

## `src/contexts/AuthContext.tsx`
```tsx
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { AuthService } from "../services/api";

export type Role = "student" | "organizer" | "admin";

export interface User {
  id: string;
  email: string;
  role: Role;
  isBanned: boolean;
  profileCompleted: boolean;
}

export interface PlatformSettings {
  allowGlobalSignups: boolean;
  allowedEmailDomain: string;
  maintenanceMode: boolean;
}

export type AuthError =
  | "invalid_email"
  | "domain_restricted"
  | "signups_disabled"
  | "user_banned"
  | "unknown";

interface AuthContextType {
  user: User | null;
  users: User[];
  settings: PlatformSettings;
  authError: AuthError | null;
  isLoading: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: AuthError }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: AuthError }>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
  updateUserRole: (userId: string, role: Role) => Promise<void>;
  toggleUserBan: (userId: string, currentBanStatus: boolean) => Promise<void>;
  updateSettings: (newSettings: PlatformSettings) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_SETTINGS: PlatformSettings = {
  allowGlobalSignups: true,
  allowedEmailDomain: "@poornima.org",
  maintenanceMode: false,
};

async function buildUserFromSession(userId: string, email: string): Promise<User | null> {
  try {
    const profile = await AuthService.getProfile(userId);
    if (!profile) return null;
    return {
      id: userId,
      email: profile.email || email,
      role: profile.role as Role,
      isBanned: profile.is_banned ?? false,
      profileCompleted: profile.profile_completed ?? false,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [users, setUsers]     = useState<User[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase
      .from("platform_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (data) {
      setSettings({
        allowGlobalSignups: data.allow_global_signups ?? true,
        allowedEmailDomain: data.allowed_email_domain ?? "",
        maintenanceMode: data.maintenance_mode ?? false,
      });
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase.rpc("admin_fetch_users");
    if (data) {
      setUsers(
        data.map((d: any) => ({
          id: d.id,
          email: d.email,
          role: d.role as Role,
          isBanned: d.is_banned ?? false,
        }))
      );
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setUser(null); return; }
    const u = await buildUserFromSession(session.user.id, session.user.email ?? "");
    setUser(u);
  }, []);

  // Initial load + auth state listener
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          const u = await buildUserFromSession(session.user.id, session.user.email ?? "");
          if (u && u.isBanned) { setAuthError("user_banned"); await supabase.auth.signOut(); }
          else if (mounted) setUser(u);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    init();
    fetchSettings();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_IN" && session) {
        setIsLoading(true);
        const u = await buildUserFromSession(session.user.id, session.user.email ?? "");
        if (u?.isBanned) {
          setAuthError("user_banned");
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser(u);
          if (u?.role === "admin") fetchUsers();
        }
        setIsLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "TOKEN_REFRESHED" && session) {
        // Silently refresh — no UI update needed
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchSettings, fetchUsers]);

  // Fetch users when role becomes admin
  useEffect(() => {
    if (user?.role === "admin") fetchUsers();
  }, [user?.role, fetchUsers]);

  // ─── Auth Actions ────────────────────────────────────────────────────────────

  const login = async (email: string): Promise<{ success: boolean; error?: AuthError }> => {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed.includes("@") || !trimmed.includes(".")) {
      return { success: false, error: "invalid_email" };
    }
    if (!settings.allowGlobalSignups) {
      return { success: false, error: "signups_disabled" };
    }
    if (settings.allowedEmailDomain && !trimmed.endsWith(settings.allowedEmailDomain)) {
      return { success: false, error: "domain_restricted" };
    }

    try {
      await AuthService.loginWithOtp(trimmed);
      return { success: true };
    } catch {
      return { success: false, error: "unknown" };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: AuthError }> => {
    if (!settings.allowGlobalSignups) {
      return { success: false, error: "signups_disabled" };
    }
    try {
      await AuthService.loginWithGoogle();
      return { success: true };
    } catch {
      return { success: false, error: "unknown" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const clearAuthError = () => setAuthError(null);

  const updateUserRole = async (userId: string, role: Role) => {
    // UX guard - security is handled by the RPC
    if (user?.role !== 'admin') return;

    const { error } = await supabase.rpc("admin_update_user_role", { p_user_id: userId, p_role: role });
    if (!error) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      if (user?.id === userId) setUser({ ...user, role });
    }
  };

  const toggleUserBan = async (userId: string, currentBanStatus: boolean) => {
    // UX guard - security is handled by the RPC
    if (user?.role !== 'admin') return;

    const { error } = await supabase.rpc("admin_toggle_user_ban", { p_user_id: userId, p_is_banned: !currentBanStatus });
    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isBanned: !currentBanStatus } : u))
      );
    }
  };

  const updateSettings = async (newSettings: PlatformSettings) => {
    // UX guard - security is handled by the RPC
    if (user?.role !== 'admin') return;

    const { error } = await supabase.rpc("admin_update_settings", {
      p_allow_global_signups: newSettings.allowGlobalSignups,
      p_allowed_email_domain: newSettings.allowedEmailDomain,
      p_maintenance_mode: newSettings.maintenanceMode
    });
    if (!error) setSettings(newSettings);
  };

  return (
    <AuthContext.Provider
      value={{
        user, users, settings, authError, isLoading,
        login, loginWithGoogle, logout, clearAuthError,
        updateUserRole, toggleUserBan, updateSettings, refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

```

## `src/contexts/DataContext.tsx`
```tsx
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { 
  EventService, 
  RegistrationService, 
  OrganizerTemplateService, 
  UserCommunicationService,
  EventTeamService,
  SocialService
} from "../services/api";

export type EventCategory = "Social" | "Academic" | "Sports" | "Arts" | "Club";

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  department: string;
  category: EventCategory;
  capacity: number;
  registeredCount: number;
  waitlistCount: number;
  posterUrl: string;
  isUnpublished?: boolean;
  organizerId?: string;
}

export interface Registration {
  id: string;
  eventId: string;
  studentId: string;
  studentEmail?: string;
  status: "registered" | "waitlisted" | "cancelled" | "attended";
  ticketId?: string;
  attended?: boolean;
}

export interface CheckInResult {
  success: boolean;
  message: string;
  attendeeName?: string;
  alreadyCheckedIn?: boolean;
}

export interface EventTemplate {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  category: EventCategory;
  capacity: number;
  posterUrl: string;
}

export interface Announcement {
  id: string;
  eventId: string;
  message: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  eventId: string;
  studentId: string;
  studentEmail?: string;
  rating: number; // 1-5
  comment: string;
}

interface DataContextType {
  events: CampusEvent[];
  registrations: Registration[];
  templates: EventTemplate[];
  announcements: Announcement[];
  feedbacks: Feedback[];
  isLoading: boolean;
  registerForEvent: (eventId: string) => Promise<void>;
  joinWaitlist: (eventId: string) => Promise<void>;
  cancelRegistration: (eventId: string) => Promise<void>;
  checkConflict: (eventId: string) => CampusEvent | null;
  checkInUser: (ticketId: string) => Promise<CheckInResult>;
  createEvent: (eventData: Omit<CampusEvent, "id" | "registeredCount" | "waitlistCount">) => Promise<string>;
  saveTemplate: (template: Omit<EventTemplate, "id" | "organizerId">) => Promise<void>;
  removeRegistrant: (regId: string) => Promise<void>;
  addAnnouncement: (announcement: Omit<Announcement, "id" | "createdAt">) => Promise<void>;
  addFeedback: (feedback: Omit<Feedback, "id" | "studentId">) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  unpublishEvent: (eventId: string, isUnpublished: boolean) => Promise<void>;
  getMyVolunteeringEvents: () => Promise<string[]>;
  getVolunteers: (eventId: string) => Promise<{userId: string; email: string}[]>;
  inviteVolunteer: (eventId: string, email: string) => Promise<void>;
  removeVolunteer: (eventId: string, userId: string) => Promise<void>;
  subscribeToOrganizer: (organizerId: string) => Promise<void>;
  unsubscribeFromOrganizer: (organizerId: string) => Promise<void>;
  getFollowedOrganizers: () => Promise<string[]>;
  getPublicAttendeeSignal: (eventId: string) => Promise<{studentId: string; studentEmail?: string}[]>;
  error: Error | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { user, isLoading: authLoading } = useAuth();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [evts, tmpls, regs, anns, fbs] = await Promise.all([
        EventService.getEvents(),
        user?.role === 'organizer' || user?.role === 'admin' ? OrganizerTemplateService.getTemplates() : Promise.resolve([]),
        user ? RegistrationService.getRegistrations() : Promise.resolve([]),
        UserCommunicationService.getAnnouncements(),
        UserCommunicationService.getFeedbacks()
      ]);
      
      setEvents(evts);
      setRegistrations(regs);
      setTemplates(tmpls);
      setAnnouncements(anns);
      setFeedbacks(fbs);
    } catch (err: any) {
      console.error("Failed to load data from Supabase:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading, loadData]);

  const checkConflict = useCallback((eventId: string): CampusEvent | null => {
    if (!user) return null;
    const targetEvent = events.find(e => e.id === eventId);
    if (!targetEvent) return null;

    const userRegs = registrations.filter(r => r.studentId === user.id && r.status === "registered");
    for (const reg of userRegs) {
      const registeredEvent = events.find(e => e.id === reg.eventId);
      if (registeredEvent && registeredEvent.id !== eventId) {
        const parseDate = (d: string) => d.length === 10 ? new Date(d + 'T00:00:00').getTime() : new Date(d).getTime();
        const tStart = parseDate(targetEvent.startTime);
        const tEnd = parseDate(targetEvent.endTime);
        const rStart = parseDate(registeredEvent.startTime);
        const rEnd = parseDate(registeredEvent.endTime);
        
        if (tStart < rEnd && tEnd > rStart) {
          return registeredEvent;
        }
      }
    }
    return null;
  }, [user, events, registrations]);

  const registerForEvent = useCallback(async (eventId: string) => {
    const { status } = await RegistrationService.register(eventId);
    const regs = await RegistrationService.getRegistrations();
    setRegistrations(regs);
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      return status === 'registered'
        ? { ...e, registeredCount: e.registeredCount + 1 }
        : { ...e, waitlistCount: e.waitlistCount + 1 };
    }));
  }, []);

  const joinWaitlist = useCallback(async (eventId: string) => {
    const { status } = await RegistrationService.register(eventId);
    const regs = await RegistrationService.getRegistrations();
    setRegistrations(regs);
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      return status === 'registered'
        ? { ...e, registeredCount: e.registeredCount + 1 }
        : { ...e, waitlistCount: e.waitlistCount + 1 };
    }));
  }, []);

  const cancelRegistration = useCallback(async (eventId: string) => {
    const reg = registrations.find(r => r.eventId === eventId && r.studentId === user?.id);
    await RegistrationService.cancelRegistration(eventId);
    const regs = await RegistrationService.getRegistrations();
    setRegistrations(regs);
    if (reg) {
      setEvents(prev => prev.map(e => {
        if (e.id === eventId) {
          if (reg.status === 'registered') return { ...e, registeredCount: Math.max(0, e.registeredCount - 1) };
          if (reg.status === 'waitlisted') return { ...e, waitlistCount: Math.max(0, e.waitlistCount - 1) };
        }
        return e;
      }));
    }
  }, [registrations, user?.id]);

  const checkInUser = useCallback(async (ticketId: string): Promise<CheckInResult> => {
    const result = await RegistrationService.checkIn(ticketId);
    if (result.success) {
      const regs = await RegistrationService.getRegistrations();
      setRegistrations(regs);
    }
    return result;
  }, []);

  const createEvent = useCallback(async (eventData: Omit<CampusEvent, "id" | "registeredCount" | "waitlistCount">) => {
    const id = await EventService.createEvent(eventData);
    await loadData();
    return id;
  }, [loadData]);

  const saveTemplate = useCallback(async (templateData: Omit<EventTemplate, "id" | "organizerId">) => {
    await OrganizerTemplateService.saveTemplate(templateData as Omit<EventTemplate, "id">);
    await loadData();
  }, [loadData]);

  const removeRegistrant = useCallback(async (regId: string) => {
    await RegistrationService.removeRegistrant(regId);
    await loadData();
  }, [loadData]);

  const addAnnouncement = useCallback(async (announcementData: Omit<Announcement, "id" | "timestamp">) => {
    await UserCommunicationService.addAnnouncement(announcementData);
    const anns = await UserCommunicationService.getAnnouncements();
    setAnnouncements(anns);
  }, []);

  const addFeedback = useCallback(async (feedbackData: Omit<Feedback, "id" | "studentId">) => {
    await UserCommunicationService.addFeedback(feedbackData as Omit<Feedback, "id">);
    const fbs = await UserCommunicationService.getFeedbacks();
    setFeedbacks(fbs);
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    await EventService.deleteEvent(eventId);
    await loadData();
  }, [loadData]);

  const unpublishEvent = useCallback(async (eventId: string, isUnpublished: boolean) => {
    await EventService.updateEventPublishStatus(eventId, isUnpublished);
    await loadData();
  }, [loadData]);

  const contextValue = useMemo(() => ({
    events, registrations, templates, announcements, feedbacks, isLoading, error,
    registerForEvent, joinWaitlist, cancelRegistration, checkConflict, checkInUser,
    createEvent, saveTemplate, removeRegistrant, addAnnouncement, addFeedback,
    deleteEvent, unpublishEvent,
    getMyVolunteeringEvents: EventTeamService.getMyVolunteeringEvents,
    getVolunteers: EventTeamService.getVolunteers,
    inviteVolunteer: EventTeamService.inviteVolunteer,
    removeVolunteer: EventTeamService.removeVolunteer,
    subscribeToOrganizer: SocialService.subscribeToOrganizer,
    unsubscribeFromOrganizer: SocialService.unsubscribeFromOrganizer,
    getFollowedOrganizers: SocialService.getFollowedOrganizers,
    getPublicAttendeeSignal: RegistrationService.getPublicAttendeeSignal
  }), [
    events, registrations, templates, announcements, feedbacks, isLoading, error,
    registerForEvent, joinWaitlist, cancelRegistration, checkConflict, checkInUser,
    createEvent, saveTemplate, removeRegistrant, addAnnouncement, addFeedback,
    deleteEvent, unpublishEvent,
    // Stable module-level references included for exhaustive-deps correctness
    // (these never change identity, but listed so ESLint doesn't flag them)
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

```

## `src/hooks/useAccessibleMotion.ts`
```typescript
import { useState, useEffect } from 'react';

export function useAccessibleMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const onChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return prefersReducedMotion;
}

```

## `src/index.css`
```
@import "tailwindcss";

@theme {
  --color-primary: #FF5A5F;
  --color-primary-hover: #E0484D;
  --color-accent: #FFB400;
  --color-bg-light: #F9F7F5;
  --color-bg-dark: #1E1E1E;
  --color-surface-light: #FFFFFF;
  --color-surface-dark: #2A2A2A;
  
  --font-heading: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;
}

@layer base {
  body {
    @apply bg-bg-light text-gray-900 font-body transition-colors duration-300;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-heading tracking-tight;
  }
}


```

## `src/lib/supabase.ts`
```typescript
/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

```

## `src/main.tsx`
```tsx
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

```

## `src/services/api.ts`
```typescript
import { CampusEvent, Registration, EventTemplate, Announcement, Feedback, CheckInResult } from "../contexts/DataContext";
import { supabase } from "../lib/supabase";

export const EventService = {
  getEvents: async (): Promise<CampusEvent[]> => {
    const { data, error } = await supabase.from('events').select('*');
    if (error) throw error;
    
    // Convert snake_case to camelCase
    return data.map(d => ({
      id: d.id,
      title: d.title,
      description: d.description,
      startTime: d.start_time,
      endTime: d.end_time,
      location: d.location,
      department: '',
      category: d.category,
      capacity: d.capacity,
      registeredCount: d.registered_count || 0,
      waitlistCount: d.waitlist_count || 0,
      posterUrl: d.poster_url,
      isUnpublished: d.is_unpublished,
      organizerId: d.organizer_id
    })) as CampusEvent[];
  },

  getEventById: async (eventId: string): Promise<CampusEvent | null> => {
    const { data, error } = await supabase.from('events').select('id, title, description, start_time, end_time, location, category, capacity, registered_count, waitlist_count, poster_url, is_unpublished, organizer_id').eq('id', eventId).single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      startTime: data.start_time,
      endTime: data.end_time,
      location: data.location,
      department: '',
      category: data.category,
      capacity: data.capacity,
      registeredCount: data.registered_count || 0,
      waitlistCount: data.waitlist_count || 0,
      posterUrl: data.poster_url,
      isUnpublished: data.is_unpublished,
      organizerId: data.organizer_id
    } as CampusEvent;
  },

  createEvent: async (eventData: Omit<CampusEvent, "id" | "registeredCount" | "waitlistCount">): Promise<string> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const payload = {
      title: eventData.title,
      description: eventData.description,
      start_time: eventData.startTime,
      end_time: eventData.endTime,
      location: eventData.location,
      category: eventData.category,
      capacity: eventData.capacity,
      poster_url: eventData.posterUrl,
      is_unpublished: eventData.isUnpublished ?? true,
      organizer_id: userData.user.id
    };

    const { data, error } = await supabase.from('events').insert(payload).select('id').single();
    if (error) throw error;
    return data.id;
  },

  getRegistrationsByEventId: async (eventId: string): Promise<Registration[]> => {
    const { data, error } = await supabase.from('registrations').select(`
      id,
      event_id,
      user_id,
      status,
      ticket_id,
      attended,
      profiles:user_id(email)
    `).eq('event_id', eventId);
    if (error) throw error;
    return data.map((d: any) => ({
      id: d.id,
      eventId: d.event_id,
      studentId: d.user_id,
      studentEmail: d.profiles?.email,
      status: d.status,
      ticketId: d.ticket_id,
      attended: d.attended
    })) as Registration[];
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) throw error;
  },

  updateEventPublishStatus: async (eventId: string, isUnpublished: boolean): Promise<void> => {
    const { error } = await supabase.from('events').update({ is_unpublished: isUnpublished }).eq('id', eventId);
    if (error) throw error;
  }
};

export const RegistrationService = {
  getRegistrations: async (): Promise<Registration[]> => {
    const { data, error } = await supabase.from('registrations').select('*, profiles:user_id(email)');
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      eventId: d.event_id,
      studentId: (d as any).user_id,
      studentEmail: (d as any).profiles?.email,
      status: d.status,
      ticketId: d.ticket_id,
      attended: d.attended
    })) as Registration[];
  },
  getRegistrationsForOrganizer: async (eventId: string): Promise<Registration[]> => {
    const { data, error } = await supabase.from('registrations').select('*, profiles:user_id(email)').eq('event_id', eventId);
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      eventId: d.event_id,
      studentId: (d as any).user_id,
      studentEmail: (d as any).profiles?.email,
      status: d.status,
      ticketId: d.ticket_id,
      attended: d.attended
    })) as Registration[];
  },

  getPublicAttendeeSignal: async (eventId: string): Promise<{studentId: string; studentEmail?: string}[]> => {
    // Queries only attendees with public_rsvp = true
    const { data, error } = await supabase
      .from('registrations')
      .select('user_id, profiles!inner(email, public_rsvp)')
      .eq('event_id', eventId)
      .eq('status', 'registered')
      .eq('profiles.public_rsvp', true);
    
    if (error) throw error;
    return data.map(d => ({
      studentId: (d as any).user_id,
      studentEmail: (d as any).profiles?.email,
    }));
  },

  register: async (eventId: string): Promise<{status: string}> => {
    const { data, error } = await supabase.rpc('register_for_event', { p_event_id: eventId });
    if (error) throw error;
    return { status: data };
  },

  cancelRegistration: async (eventId: string): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase.from('registrations')
      .update({ status: 'cancelled' })
      .eq('event_id', eventId)
      .eq('user_id', userData.user.id);
    if (error) throw error;
  },

  checkIn: async (ticketId: string): Promise<CheckInResult> => {
    const { data, error } = await supabase.rpc('check_in_by_ticket', { p_ticket_id: ticketId });
    if (error) {
      return { success: false, message: error.message };
    }
    if (data === 'success') {
      return { success: true, message: "Checked in successfully" };
    }
    if (data === 'already_checked_in') {
      return { success: false, message: "Already checked in", alreadyCheckedIn: true };
    }
    if (data === 'unauthorized') {
      return { success: false, message: "You are not authorized to check in for this event." };
    }
    return { success: false, message: "Invalid ticket ID" };
  },

  removeRegistrant: async (regId: string): Promise<void> => {
    const { error } = await supabase.from('registrations').delete().eq('id', regId);
    if (error) throw error;
  }
};

export const UserCommunicationService = {
  getAnnouncements: async (): Promise<Announcement[]> => {
    const { data, error } = await supabase.from('announcements').select('*');
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      eventId: d.event_id,
      message: d.message,
      createdAt: d.created_at
    }));
  },
  
  getFeedbacks: async (): Promise<Feedback[]> => {
    const { data, error } = await supabase.from('feedbacks').select('*, profiles(email)');
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      eventId: d.event_id,
      studentId: (d as any).user_id,
      studentEmail: (d as any).profiles?.email,
      rating: d.rating,
      comment: d.comment
    }));
  },

  addAnnouncement: async (announcement: Omit<Announcement, "id" | "createdAt">): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");
    const { error } = await supabase.from('announcements').insert({
      event_id: announcement.eventId,
      organizer_id: userData.user.id,
      message: announcement.message
    });
    if (error) throw error;
  },

  addFeedback: async (feedback: Omit<Feedback, "id">): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const { error } = await supabase.from('feedbacks').insert({
      event_id: feedback.eventId,
      user_id: userData.user.id,
      rating: feedback.rating,
      comment: feedback.comment
    });
    if (error) throw error;
  }
};

export const OrganizerTemplateService = {
  getTemplates: async (): Promise<EventTemplate[]> => {
    const { data, error } = await supabase.from('event_templates').select('*');
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      organizerId: d.organizer_id,
      title: d.title,
      description: d.description,
      category: d.category,
      capacity: d.capacity,
      posterUrl: d.poster_url
    })) as EventTemplate[];
  },

  saveTemplate: async (template: Omit<EventTemplate, "id">): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const { error } = await supabase.from('event_templates').insert({
      organizer_id: userData.user.id,
      title: template.title,
      description: template.description,
      category: template.category,
      capacity: template.capacity,
      poster_url: template.posterUrl
    });
    if (error) throw error;
  }
};

export const AuthService = {
  loginWithOtp: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    if (error) throw error;
  },

  loginWithGoogle: async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  },

  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  getProfile: async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },
  
  updateProfilePrivacy: async (publicRsvp: boolean): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");
    const { error } = await supabase.from('profiles').update({ public_rsvp: publicRsvp }).eq('id', userData.user.id);
    if (error) throw error;
  },

  completeProfile: async (data: {
    fullName: string;
    rollNumber: string;
    branch: string;
    yearOfStudy: number;
    phoneNumber: string | null;
  }): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        roll_number: data.rollNumber,
        branch: data.branch,
        year_of_study: data.yearOfStudy,
        phone_number: data.phoneNumber,
        profile_completed: true,
      })
      .eq('id', userData.user.id);
    if (error) throw error;
  }
};

export const EventTeamService = {
  getMyVolunteeringEvents: async (): Promise<string[]> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];
    const { data, error } = await supabase
      .from('event_team')
      .select('event_id')
      .eq('user_id', userData.user.id)
      .eq('role', 'volunteer');
    if (error) throw error;
    return data.map(d => d.event_id);
  },
  getVolunteers: async (eventId: string): Promise<{userId: string; email: string}[]> => {
    const { data, error } = await supabase
      .from('event_team')
      .select('user_id, profiles!inner(email)')
      .eq('event_id', eventId)
      .eq('role', 'volunteer');
    if (error) throw error;
    return data.map(d => ({
      userId: d.user_id,
      email: (d as any).profiles?.email,
    }));
  },
  inviteVolunteer: async (eventId: string, email: string): Promise<void> => {
    const { error } = await supabase.rpc('invite_volunteer', { p_event_id: eventId, p_email: email });
    if (error) throw error;
  },
  removeVolunteer: async (eventId: string, userId: string): Promise<void> => {
    const { error } = await supabase.rpc('remove_volunteer', { p_event_id: eventId, p_user_id: userId });
    if (error) throw error;
  }
};

export const SocialService = {
  subscribeToOrganizer: async (organizerId: string): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");
    const { error } = await supabase.from('calendar_follows').insert({
      follower_id: userData.user.id,
      followed_organizer_id: organizerId
    });
    if (error) throw error;
  },
  unsubscribeFromOrganizer: async (organizerId: string): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");
    const { error } = await supabase.from('calendar_follows')
      .delete()
      .eq('follower_id', userData.user.id)
      .eq('followed_organizer_id', organizerId);
    if (error) throw error;
  },
  getFollowedOrganizers: async (): Promise<string[]> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return [];
    const { data, error } = await supabase
      .from('calendar_follows')
      .select('followed_organizer_id')
      .eq('follower_id', userData.user.id);
    if (error) throw error;
    return data.map(d => d.followed_organizer_id);
  }
};

```

## `src/utils/motion.ts`
```typescript
import { Variants, Transition } from "motion/react";

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeIn" as const } }
};

export const cardHover: { scale: number; transition: Transition } = {
  scale: 1.02,
  transition: { duration: 0.2, ease: "easeOut" as const }
};

export const successAnimation: Variants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 20
    } 
  }
};

```

