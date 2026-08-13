export type EventCategory = 'Design & Tech' | 'Art & Culture' | 'Wellness & Rituals' | 'Culinary & Wine' | 'Music & Night' | 'Founders & VC';

export type EventColorTheme = 'amber' | 'emerald' | 'terracotta' | 'cobalt' | 'burgundy';

export interface Host {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  verified: boolean;
  totalEventsHosted: number;
  totalAttendees: number;
  location: string;
  website?: string;
  twitter?: string;
  instagram?: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  avatar: string;
  ticketType: string;
  checkedIn: boolean;
  checkInTime?: string;
  rsvpDate: string;
  status: 'confirmed' | 'pending' | 'waitlist' | 'cancelled';
}

export interface TicketType {
  id: string;
  name: string;
  price: number; // 0 for free
  capacity: number;
  sold: number;
  description: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: EventCategory;
  coverImage: string;
  themeColor: EventColorTheme;
  date: string; // ISO string or formatted
  startTime: string;
  endTime: string;
  timezone: string;
  locationName: string;
  address: string;
  isVirtual: boolean;
  virtualLink?: string;
  host: Host;
  tickets: TicketType[];
  guests: Guest[];
  totalCapacity: number;
  featured?: boolean;
  tags: string[];
  requirements?: string[];
  spotifyPlaylist?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatar: string;
  bio: string;
  joinedDate: string;
  googleLinked: boolean;
}

export interface RSVPRecord {
  id: string;
  eventId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  guestName: string;
  guestEmail: string;
  quantity: number;
  totalPrice: number;
  qrCodeUrl: string;
  confirmedAt: string;
  status: 'valid' | 'used' | 'cancelled';
}
