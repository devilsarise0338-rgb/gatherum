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
  createEvent: (data: Omit<CampusEvent, 'id' | 'organizerId' | 'registeredCount' | 'waitlistCount'>) => Promise<string>;
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
