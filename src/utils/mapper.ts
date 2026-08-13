import { CampusEvent } from '../contexts/DataContext';
import { EventItem } from '../types';

export function mapCampusEventToEventItem(event: CampusEvent): EventItem {
  return {
    id: event.id,
    slug: event.id,
    title: event.title,
    tagline: event.description.substring(0, 100),
    description: event.description,
    category: event.category as any,
    coverImage: event.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
    themeColor: 'amber',
    date: event.startTime,
    startTime: new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    endTime: new Date(event.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    timezone: 'Local',
    locationName: event.location,
    address: event.location,
    isVirtual: false,
    host: {
      id: event.organizerId || 'host1',
      name: 'Organizer',
      handle: '@organizer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      bio: '',
      verified: true,
      totalEventsHosted: 1,
      totalAttendees: event.registeredCount,
      location: event.location
    },
    tickets: [
      { id: 't1', name: 'General Admission', capacity: event.capacity, sold: event.registeredCount, description: 'Standard Entry' }
    ],
    guests: Array.from({length: event.registeredCount}).map((_, i) => ({
      id: `g${i}`, name: 'Guest', email: 'guest@example.com', avatar: '', ticketType: 'General', checkedIn: false, rsvpDate: '', status: 'confirmed'
    })),
    totalCapacity: event.capacity,
    featured: false,
    tags: []
  };
}
