import { useMemo } from "react";
import { useData, CampusEvent, Registration, Announcement } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";

export function useMyOrganizerEvents() {
  const { events, registrations } = useData();
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) return { myEvents: [], activeEventsCount: 0, totalAttendees: 0 };

    // Admins see all events, organizers see only theirs.
    const myEvents = user.role === "admin" 
      ? events 
      : events.filter(e => e.organizerId === user.id);
      
    const activeEventsCount = myEvents.length;
    
    // Total attendees for these scoped events
    const myEventIds = new Set(myEvents.map(e => e.id));
    const totalAttendees = registrations.filter(
      r => r.status === "registered" && myEventIds.has(r.eventId)
    ).length;

    return { myEvents, activeEventsCount, totalAttendees };
  }, [events, registrations, user]);
}

export function useStudentDashboard(volunteeringEventIds: string[]) {
  const { events, registrations, announcements } = useData();
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) {
      return { 
        upcomingEvents: [], pastEvents: [], waitlistedEvents: [], 
        volunteeringEvents: [], recommendedEvents: [], relevantAnnouncements: [] 
      };
    }

    const userRegs = registrations.filter(r => r.studentId === user.id);
    const now = new Date().getTime();
    
    const registeredItems = userRegs
      .filter(r => r.status === "registered")
      .map(r => ({ reg: r, event: events.find(e => e.id === r.eventId) }))
      .filter(item => item.event);

    const upcomingEvents = registeredItems
      .filter(item => new Date(item.event!.endTime).getTime() > now)
      .sort((a, b) => new Date(a.event!.startTime).getTime() - new Date(b.event!.startTime).getTime());

    const pastEvents = registeredItems
      .filter(item => new Date(item.event!.endTime).getTime() <= now)
      .sort((a, b) => new Date(b.event!.startTime).getTime() - new Date(a.event!.startTime).getTime());

    const waitlistedEvents = userRegs
      .filter(r => r.status === "waitlisted")
      .map(r => ({ reg: r, event: events.find(e => e.id === r.eventId) }))
      .filter(item => item.event);

    const volunteeringEvents = events
      .filter(e => volunteeringEventIds.includes(e.id))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

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

    return { 
      upcomingEvents, 
      pastEvents, 
      waitlistedEvents, 
      volunteeringEvents, 
      recommendedEvents, 
      relevantAnnouncements 
    };
  }, [events, registrations, announcements, user, volunteeringEventIds]);
}

export function useAdminStats() {
  const { events, registrations } = useData();
  const { users } = useAuth();

  return useMemo(() => {
    const totalUsers = users.length;
    const totalEvents = events.length;
    const activeEvents = events.filter(e => !e.isUnpublished).length;
    const totalTickets = registrations.filter(r => r.status === "registered").length;
    const totalWaitlist = registrations.filter(r => r.status === "waitlisted").length;

    return { totalUsers, totalEvents, activeEvents, totalTickets, totalWaitlist };
  }, [events, registrations, users]);
}
