## File: supabase/migrations/0002_realtime_counters.sql

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


## File: src/services/api.ts

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
      date: d.date,
      endTime: d.end_time,
      location: d.location,
      department: d.department,
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
    const { data, error } = await supabase.from('events').select('id, title, description, date, end_time, location, department, category, capacity, registered_count, waitlist_count, poster_url, is_unpublished, organizer_id').eq('id', eventId).single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      date: data.date,
      endTime: data.end_time,
      location: data.location,
      department: data.department,
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
      date: eventData.date,
      end_time: eventData.endTime,
      location: eventData.location,
      department: eventData.department,
      category: eventData.category,
      capacity: eventData.capacity,
      poster_url: eventData.posterUrl,
      is_unpublished: eventData.isUnpublished,
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
      student_id,
      status,
      waitlist_position,
      ticket_id,
      attended,
      profiles:student_id(email)
    `).eq('event_id', eventId);
    if (error) throw error;
    return data.map((d: any) => ({
      id: d.id,
      eventId: d.event_id,
      studentId: d.student_id,
      studentEmail: d.profiles?.email,
      status: d.status,
      waitlistPosition: d.waitlist_position,
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
    const { data, error } = await supabase.from('registrations').select('*, profiles(email)');
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      eventId: d.event_id,
      studentId: d.student_id,
      studentEmail: (d as any).profiles?.email,
      status: d.status,
      waitlistPosition: d.waitlist_position,
      ticketId: d.ticket_id,
      attended: d.attended
    })) as Registration[];
  },
  getRegistrationsForOrganizer: async (eventId: string): Promise<Registration[]> => {
    const { data, error } = await supabase.from('registrations').select('*, profiles(email)').eq('event_id', eventId);
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      eventId: d.event_id,
      studentId: d.student_id,
      studentEmail: (d as any).profiles?.email,
      status: d.status,
      waitlistPosition: d.waitlist_position,
      ticketId: d.ticket_id,
      attended: d.attended
    })) as Registration[];
  },

  getPublicAttendeeSignal: async (eventId: string): Promise<{studentId: string; studentEmail?: string}[]> => {
    // Queries only attendees with public_rsvp = true
    const { data, error } = await supabase
      .from('registrations')
      .select('student_id, profiles!inner(email, public_rsvp)')
      .eq('event_id', eventId)
      .eq('status', 'registered')
      .eq('profiles.public_rsvp', true);
    
    if (error) throw error;
    return data.map(d => ({
      studentId: d.student_id,
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
      .eq('student_id', userData.user.id);
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
      title: d.title,
      content: d.content,
      timestamp: d.timestamp
    }));
  },
  
  getFeedbacks: async (): Promise<Feedback[]> => {
    const { data, error } = await supabase.from('feedbacks').select('*, profiles(email)');
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      eventId: d.event_id,
      studentId: d.student_id,
      studentEmail: (d as any).profiles?.email,
      rating: d.rating,
      comment: d.comment
    }));
  },

  addAnnouncement: async (announcement: Omit<Announcement, "id" | "timestamp">): Promise<void> => {
    const { error } = await supabase.from('announcements').insert({
      event_id: announcement.eventId,
      title: announcement.title,
      content: announcement.content
    });
    if (error) throw error;
  },

  addFeedback: async (feedback: Omit<Feedback, "id">): Promise<void> => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const { error } = await supabase.from('feedbacks').insert({
      event_id: feedback.eventId,
      student_id: userData.user.id,
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
      name: d.name,
      title: d.title,
      description: d.description,
      location: d.location,
      department: d.department,
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
      name: template.name,
      title: template.title,
      description: template.description,
      location: template.location,
      department: template.department,
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


## File: src/contexts/DataContext.tsx

```typescript
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
  date: string;
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
  status: "registered" | "waitlisted";
  waitlistPosition?: number;
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
  name: string;
  title: string;
  description: string;
  location: string;
  department: string;
  category: EventCategory;
  capacity: number;
  posterUrl: string;
}

export interface Announcement {
  id: string;
  eventId: string;
  title: string;
  content: string;
  timestamp: string;
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
  addAnnouncement: (announcement: Omit<Announcement, "id" | "timestamp">) => Promise<void>;
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
        const tStart = parseDate(targetEvent.date);
        const tEnd = parseDate(targetEvent.endTime);
        const rStart = parseDate(registeredEvent.date);
        const rEnd = parseDate(registeredEvent.endTime);
        
        if (tStart < rEnd && tEnd > rStart) {
          return registeredEvent;
        }
      }
    }
    return null;
  }, [user, events, registrations]);

  const registerForEvent = useCallback(async (eventId: string) => {
    await RegistrationService.register(eventId);
    const regs = await RegistrationService.getRegistrations();
    setRegistrations(regs);
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e));
  }, []);

  const joinWaitlist = useCallback(async (eventId: string) => {
    await RegistrationService.register(eventId);
    const regs = await RegistrationService.getRegistrations();
    setRegistrations(regs);
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, waitlistCount: e.waitlistCount + 1 } : e));
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
    deleteEvent, unpublishEvent
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


## File: src/components/EventDetailPage.tsx

```typescript
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

  useEffect(() => {
    if (event) {
      getPublicAttendeeSignal(event.id).then(setPublicAttendees).catch(console.error);
      if (user && event.organizerId) {
        getFollowedOrganizers().then(followed => {
          setIsFollowing(followed.includes(event.organizerId!));
        }).catch(console.error);
      }
    }
  }, [event, getPublicAttendeeSignal, getFollowedOrganizers, user]);

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
    userReg = registrations.find(r => r.eventId === event.id && r.studentId === user?.id);
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
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <p>{new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
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
                            ? `On Waitlist (Position #${userReg.waitlistPosition})` 
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
                    {new Date(conflictEvent.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - 
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


## File: src/components/OrganizerManageEventPage.tsx

```typescript
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
  const eventAnnouncements = announcements.filter(a => a.eventId === event.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
              studentId: payload.new.student_id,
              status: payload.new.status,
              waitlistPosition: payload.new.waitlist_position,
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
              waitlistPosition: payload.new.waitlist_position,
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

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;
    addAnnouncement({
      eventId: event.id,
      title: announcementTitle,
      content: announcementContent
    });
    setAnnouncementTitle("");
    setAnnouncementContent("");
    toast.success("Announcement broadcasted");
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
                            onClick={() => removeRegistrant(reg.id)}
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
                        <h4 className="font-bold text-gray-900 dark:text-white">{ann.title}</h4>
                        <span className="text-xs text-gray-500">{new Date(ann.timestamp).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{ann.content}</p>
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


## File: src/components/OrganizerCheckinPage.tsx

```typescript
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
                studentId: payload.new.student_id,
                status: payload.new.status,
                waitlistPosition: payload.new.waitlist_position,
                ticketId: payload.new.ticket_id,
                attended: payload.new.attended
              }]);
              // Refresh to get joined data like email
              RegistrationService.getRegistrationsForOrganizer(eventId).then(setRegistrations);
            } else if (payload.eventType === 'UPDATE') {
              setRegistrations(prev => prev.map(r => r.id === payload.new.id ? {
                ...r,
                status: payload.new.status,
                waitlistPosition: payload.new.waitlist_position,
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
  
  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes.length > 0) {
      const qrValue = detectedCodes[0].rawValue;
      if (qrValue) {
        processCheckIn(qrValue);
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

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const reg = registrations.find(r => 
      r.ticketId === searchQuery || (r.studentEmail || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (reg && reg.ticketId) {
      processCheckIn(reg.ticketId);
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
  const totalCount = registrations.length;

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


