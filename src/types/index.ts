export type UserRole = 'student' | 'organizer' | 'admin';
export type RegistrationStatus = 'registered' | 'waitlisted' | 'cancelled' | 'attended';

export interface Profile {
  id: string;
  role: UserRole;
  email: string | null;
  full_name: string | null;
  roll_number: string | null;
  branch: string | null;
  year_of_study: number | null;
  phone_number: string | null;
  avatar_url: string | null;
  public_rsvp: boolean;
  profile_completed: boolean;
  is_banned: boolean;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organizer_id: string | null;
  title: string | null;
  description: string | null;
  category: string | null;
  start_time: string;
  end_time: string | null;
  location: string | null;
  capacity: number;
  poster_url: string | null;
  is_unpublished: boolean;
  is_archived: boolean;
  registration_deadline: string | null;
  created_at: string;
  updated_at: string;
  // joined fields
  organizer?: Profile;
  registrations?: Registration[];
  // Canonical seat counts, maintained by DB triggers (see migrations 0002/0015).
  // taken = registered_count (registered + attended occupy a seat),
  // waitlist = waitlist_count. Do NOT reintroduce client-side counting.
  registered_count: number;
  waitlist_count: number;
}

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  ticket_id: string;
  attended: boolean;
  checked_in_at: string | null;
  created_at: string;
  // joined fields
  event?: Event;
  profile?: Profile;
}

export interface Announcement {
  id: string;
  event_id: string;
  organizer_id: string;
  message: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface PlatformSettings {
  id: number;
  signups_enabled: boolean;
  allowed_email_domain: string;
  maintenance_mode: boolean;
}
