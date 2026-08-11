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
    const { error } = await supabase.rpc('cancel_registration', { p_event_id: eventId });
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
      .select('user_id, profiles!event_team_user_id_fkey!inner(email)')
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
