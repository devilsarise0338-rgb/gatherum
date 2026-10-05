# PART 2 - Frontend core and styles (fresh dump, read from disk)

Source: live working tree. Stale dumps (full_code.md, code_dump.md) were NOT reused.

## Table of contents

| File | Lines |
|---|---|
| src/main.tsx | 12 |
| src/App.tsx | 229 |
| src/types/index.ts | 80 |
| src/lib/supabase.ts | 11 |
| src/lib/utils.ts | 19 |
| src/lib/exportExcel.ts | 149 |
| src/contexts/AuthContext.tsx | 73 |
| src/components/EventCard.tsx | 98 |
| src/components/Navbar.tsx | 137 |
| src/components/SafeImage.tsx | 44 |
| src/index.css | 909 |
| src/animations.css | 39 |

## src/main.tsx

````tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './animations.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

````

## src/App.tsx

````tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'motion/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';

// Pages
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import ArchivesPage from './pages/ArchivesPage';
import EventDetailPage from './pages/EventDetailPage';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import OrganizerEventWizard from './pages/OrganizerEventWizard';
import CheckInPage from './pages/CheckInPage';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';

/* ── Route Guards ── */
function RequireAuth({ children, role, allowIncomplete }: { children: React.ReactElement; role?: string | string[]; allowIncomplete?: boolean }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;

  if (profile?.is_banned) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: 'var(--off-white)' }}>
        <div style={{ fontSize: '3rem' }}>🚫</div>
        <h2 style={{ fontWeight: 700 }}>Account Suspended</h2>
        <p style={{ color: 'var(--ink-muted)' }}>Contact an administrator for assistance.</p>
      </div>
    );
  }

  // Force profile completion for new users
  if (!allowIncomplete && profile && !profile.profile_completed) {
    return <Navigate to="/profile" state={{ from: location, mustComplete: true }} replace />;
  }

  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (profile && !allowed.includes(profile.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

function AppRoutes() {
  const { session } = useAuth();

  return (
    <>
      {/* Navbar shown on all pages except auth */}
      <Routes>
        <Route path="/auth" element={null} />
        <Route path="*" element={<Navbar />} />
      </Routes>

      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/archives" element={<ArchivesPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route
          path="/auth"
          element={session ? <Navigate to="/" replace /> : <AuthPage />}
        />

        {/* Student */}
        <Route
          path="/student"
          element={<RequireAuth role={['student', 'organizer', 'admin']}><StudentDashboard /></RequireAuth>}
        />
        <Route
          path="/student/tickets"
          element={<RequireAuth role={['student', 'organizer', 'admin']}><StudentDashboard /></RequireAuth>}
        />

        {/* Organizer */}
        <Route
          path="/organizer"
          element={<RequireAuth role={['organizer', 'admin']}><OrganizerDashboard /></RequireAuth>}
        />
        <Route
          path="/organizer/events/new"
          element={<RequireAuth role={['organizer', 'admin']}><OrganizerEventWizard /></RequireAuth>}
        />
        <Route
          path="/organizer/events/:id"
          element={<RequireAuth role={['organizer', 'admin']}><OrganizerEventWizard /></RequireAuth>}
        />
        <Route
          path="/organizer/checkin/:eventId"
          element={<RequireAuth role={['organizer', 'admin']}><CheckInPage /></RequireAuth>}
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>}
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={<RequireAuth><ProfilePage /></RequireAuth>}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

/* ── The issue with rendering Navbar separately above Routes ── 
   We render it INSIDE a layout wrapper instead. */
function Layout() {
  const location = useLocation();
  const isAuth = location.pathname === '/auth';

  return (
    <>
      {!isAuth && <Navbar />}
      <AppRoutes />
    </>
  );
}

/* Simpler approach — just render Navbar + Routes sequentially */
/* Page transition wrapper */
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function RootRoutes() {
  const { session } = useAuth();
  const location = useLocation();
  const isAuth = location.pathname === '/auth';

  return (
    <>
      {!isAuth && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
          <Route path="/events" element={<PageWrapper><EventsPage /></PageWrapper>} />
          <Route path="/events/:id" element={<PageWrapper><EventDetailPage /></PageWrapper>} />
          <Route path="/auth" element={session ? <Navigate to="/" replace /> : <PageWrapper><AuthPage /></PageWrapper>} />

          {/* Student */}
          <Route path="/student" element={<RequireAuth role={['student', 'organizer', 'admin']}><PageWrapper><StudentDashboard /></PageWrapper></RequireAuth>} />
          <Route path="/student/tickets" element={<RequireAuth role={['student', 'organizer', 'admin']}><PageWrapper><StudentDashboard /></PageWrapper></RequireAuth>} />

          {/* Organizer */}
          <Route path="/organizer" element={<RequireAuth role={['organizer', 'admin']}><PageWrapper><OrganizerDashboard /></PageWrapper></RequireAuth>} />
          <Route path="/organizer/events/new" element={<RequireAuth role={['organizer', 'admin']}><PageWrapper><OrganizerEventWizard /></PageWrapper></RequireAuth>} />
          <Route path="/organizer/events/:id" element={<RequireAuth role={['organizer', 'admin']}><PageWrapper><OrganizerEventWizard /></PageWrapper></RequireAuth>} />
          <Route path="/organizer/checkin/:eventId" element={<RequireAuth role={['organizer', 'admin']}><PageWrapper><CheckInPage /></PageWrapper></RequireAuth>} />

          {/* Admin */}
          <Route path="/admin" element={<RequireAuth role="admin"><PageWrapper><AdminDashboard /></PageWrapper></RequireAuth>} />

          {/* Profile */}
          <Route path="/profile" element={<RequireAuth allowIncomplete><PageWrapper><ProfilePage /></PageWrapper></RequireAuth>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RootRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--white)',
              color: 'var(--ink)',
              border: '2px solid var(--border)',
              borderRadius: '4px',
              boxShadow: '5px 5px 0 var(--border)',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
            },
            success: {
              iconTheme: { primary: '#22C55E', secondary: 'white' },
            },
            error: {
              iconTheme: { primary: '#DC143C', secondary: 'white' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

````

## src/types/index.ts

````ts
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
  registration_count?: number;
}

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  status: RegistrationStatus;
  ticket_id: string;
  attended: boolean;
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

````

## src/lib/supabase.ts

````ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

````

## src/lib/utils.ts

````ts
import { Event } from '../types';

export function isEventAutoArchived(event: Partial<Event>): boolean {
  if (event.is_archived) return true;
  
  if (event.end_time) {
    const endPlusOneHour = new Date(event.end_time).getTime() + (60 * 60 * 1000);
    return Date.now() > endPlusOneHour;
  }
  
  if (event.start_time) {
    // Fallback if no end_time is provided: assume it lasts 2 hours, so archive 3 hours after start
    const startPlusThreeHours = new Date(event.start_time).getTime() + (3 * 60 * 60 * 1000);
    return Date.now() > startPlusThreeHours;
  }
  
  return false;
}

````

## src/lib/exportExcel.ts

````ts
import { supabase } from './supabase';
import * as XLSX from 'xlsx';
import { Registration, Profile, Event } from '../types';

export async function exportEventParticipants(eventId: string, eventTitle: string, currentUserId: string) {
  try {
    // 1. Verify Authorization
    // We fetch the event explicitly to ensure the user is the organizer.
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single();

    if (eventError || !eventData) {
      throw new Error('Event not found or unauthorized.');
    }

    // Technically we could allow team members here too if event_team table existed.
    // For now, only the primary organizer is checked.
    if (eventData.organizer_id !== currentUserId) {
      throw new Error('You are not authorized to export data for this event.');
    }

    // 2. Fetch Data
    // Join registrations with profiles to get student details
    const { data: regs, error: regsError } = await supabase
      .from('registrations')
      .select(`
        *,
        profile:profiles!inner (
          full_name,
          roll_number,
          branch,
          email,
          phone_number
        )
      `)
      .eq('event_id', eventId);

    if (regsError) throw new Error('Failed to fetch participants: ' + regsError.message);

    // 3. Filter Data
    const presentRows = [];
    const waitlistedRows = [];

    // Safely cast the joined profile since Supabase returns it as an array or object
    const getProfile = (r: any): Partial<Profile> => r.profile || {};

    let presentIdx = 1;
    let waitlistIdx = 1;

    for (const r of (regs || [])) {
      const p = getProfile(r);
      
      // Present Students
      if (r.status === 'attended' || r.attended === true) {
        presentRows.push({
          'Sr. No.': presentIdx++,
          'Student Name': p.full_name || 'Unknown',
          'Roll Number': p.roll_number || 'N/A',
          'Branch': p.branch || 'N/A',
          'Email': p.email || r.student_email || 'N/A',
          'Phone': p.phone_number || 'N/A',
          'Registration Status': 'Registered',
          'Attendance Status': 'Present',
          'Check-in Time': new Date(r.created_at).toLocaleString() // Note: No check_in_time field exists, fallback to created_at
        });
      }
      
      // Waitlisted Students
      else if (r.status === 'waitlisted') {
        waitlistedRows.push({
          'Sr. No.': waitlistIdx++,
          'Student Name': p.full_name || 'Unknown',
          'Roll Number': p.roll_number || 'N/A',
          'Branch': p.branch || 'N/A',
          'Email': p.email || r.student_email || 'N/A',
          'Phone': p.phone_number || 'N/A',
          'Registration Status': 'Waitlisted',
          'Waitlisted At': new Date(r.created_at).toLocaleString()
        });
      }
    }

    // Ensure we have at least one row with headers if empty
    if (presentRows.length === 0) {
      presentRows.push({
        'Sr. No.': 'No students present',
        'Student Name': '',
        'Roll Number': '',
        'Branch': '',
        'Email': '',
        'Phone': '',
        'Registration Status': '',
        'Attendance Status': '',
        'Check-in Time': ''
      });
    }

    if (waitlistedRows.length === 0) {
      waitlistedRows.push({
        'Sr. No.': 'No students waitlisted',
        'Student Name': '',
        'Roll Number': '',
        'Branch': '',
        'Email': '',
        'Phone': '',
        'Registration Status': '',
        'Waitlisted At': ''
      });
    }

    // 4. Generate Worksheets
    const wb = XLSX.utils.book_new();
    const wsPresent = XLSX.utils.json_to_sheet(presentRows);
    const wsWaitlisted = XLSX.utils.json_to_sheet(waitlistedRows);

    // Auto-size columns (rough approximation)
    const cols = [
      { wch: 8 },  // Sr No
      { wch: 25 }, // Name
      { wch: 15 }, // Roll No
      { wch: 15 }, // Branch
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 20 }, // Reg Status
      { wch: 20 }, // Att/Wait Status
      { wch: 25 }  // Time
    ];
    wsPresent['!cols'] = cols;
    wsWaitlisted['!cols'] = cols;

    // Append to workbook
    XLSX.utils.book_append_sheet(wb, wsPresent, 'Present Students');
    XLSX.utils.book_append_sheet(wb, wsWaitlisted, 'Waitlisted Students');

    // 5. Generate and Download
    const safeTitle = eventTitle.replace(/[\/\\:*?"<>|]/g, '').trim().replace(/\s+/g, '_');
    const filename = `Gatherum_${safeTitle}_Participants.xlsx`;

    XLSX.writeFile(wb, filename);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown error occurred' };
  }
}

````

## src/contexts/AuthContext.tsx

````tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) setProfile(data as Profile);
  }

  async function refreshProfile() {
    if (session?.user) await fetchProfile(session.user.id);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

````

## src/components/EventCard.tsx

````tsx
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../types';
import SafeImage from './SafeImage';
import { Calendar, MapPin, Users } from 'lucide-react';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

const CATEGORY_EMOJI: Record<string, string> = {
  Technical: '💻', Cultural: '🎭', Sports: '⚽', Workshop: '🔧',
  Seminar: '🎤', Competition: '🏆', Social: '🎉', Other: '📌',
};

export default function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `translate(-3px,-3px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg)`;
    card.style.boxShadow = `${8 + dx * 3}px ${8 + dy * 3}px 0 var(--shadow-color)`;
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = '';
    card.style.boxShadow = '';
  }

  const emoji = CATEGORY_EMOJI[event.category ?? ''] ?? '📅';
  const isPast = new Date(event.end_time ?? event.start_time) < new Date();
  const isFull = event.registration_count !== undefined
    ? event.registration_count >= event.capacity
    : false;

  return (
    <div
      ref={cardRef}
      className="event-card tilt-card"
      onClick={() => navigate(`/events/${event.id}`)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <SafeImage
        src={event.poster_url}
        alt={event.title ?? 'Event'}
        className="event-card-image"
        fallbackEmoji={emoji}
      />
      <div className="event-card-body">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          {event.category && <span className="tag">{event.category}</span>}
          {isPast && <span className="badge badge-ink">Ended</span>}
          {isFull && !isPast && <span className="badge badge-red">Full</span>}
          {event.is_unpublished && <span className="badge badge-yellow">Draft</span>}
        </div>
        <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.625rem', lineHeight: 1.3 }}>
          {event.title ?? 'Untitled Event'}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', color: 'var(--ink-muted)', fontSize: '0.8125rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Calendar size={13} />
            {formatDate(event.start_time)} · {formatTime(event.start_time)}
          </span>
          {event.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <MapPin size={13} />
              {event.location}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Users size={13} />
            {event.registration_count ?? 0} / {event.capacity} seats
          </span>
        </div>
      </div>
    </div>
  );
}

````

## src/components/Navbar.tsx

````tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const role = profile?.role;

  function isActive(path: string) {
    return location.pathname === path ? 'active' : '';
  }

  async function handleSignOut() {
    await signOut();
    navigate('/auth');
  }

  const links = [
    { label: 'Events', path: '/events' },
    ...(role === 'student' ? [{ label: 'Dashboard', path: '/student' }] : []),
    ...(role === 'organizer' ? [{ label: 'Dashboard', path: '/organizer' }] : []),
    ...(role === 'admin' ? [{ label: 'Admin', path: '/admin' }] : []),
  ];

  return (
    <header className="navbar" style={{ zIndex: 100 }}>
      <div className="navbar-inner">
        {/* Logo */}
        <div
          className="navbar-logo"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          Gather<span>um</span>
        </div>

        {/* Desktop nav */}
        <ul className="nav-links">
          {links.map(l => (
            <li key={l.path}>
              <span
                className={`nav-link ${isActive(l.path)}`}
                onClick={() => navigate(l.path)}
              >
                {l.label}
              </span>
            </li>
          ))}
          {profile ? (
            <>
              <li>
                <span className={`nav-link ${isActive('/profile')}`} onClick={() => navigate('/profile')}>
                  <User size={14} style={{ display: 'inline', marginRight: 4 }} />
                  Profile
                </span>
              </li>
              <li>
                <button className="btn btn-primary btn-sm" onClick={handleSignOut}>
                  <LogOut size={14} />
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <li>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')}>
                Sign In
              </button>
            </li>
          )}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="btn btn-ghost btn-sm"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <style>{`
          @media (max-width: 768px) {
            #mobile-menu-btn { display: flex !important; }
          }
        `}</style>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--white)',
          borderTop: '2px solid var(--border)',
          boxShadow: '0 8px 0 var(--border)',
          zIndex: 99,
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          {links.map(l => (
            <button
              key={l.path}
              className="btn btn-ghost"
              onClick={() => { navigate(l.path); setMenuOpen(false); }}
              style={{ justifyContent: 'flex-start' }}
            >
              {l.label}
            </button>
          ))}
          {profile ? (
            <>
              <button className="btn btn-ghost" onClick={() => { navigate('/profile'); setMenuOpen(false); }} style={{ justifyContent: 'flex-start' }}>
                Profile
              </button>
              <button className="btn btn-primary" onClick={handleSignOut}>Sign Out</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => { navigate('/auth'); setMenuOpen(false); }}>Sign In</button>
          )}
        </div>
      )}
    </header>
  );
}

````

## src/components/SafeImage.tsx

````tsx
import React from 'react';

interface Props {
  src: string | null | undefined;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackEmoji?: string;
}

export default function SafeImage({ src, alt, className, style, fallbackEmoji = '🎉' }: Props) {
  const [errored, setErrored] = React.useState(false);

  if (!src || errored) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--cream)',
          color: 'var(--ink-muted)',
          fontSize: '2.5rem',
          ...style,
        }}
        aria-label={alt}
      >
        {fallbackEmoji}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={() => setErrored(true)}
    />
  );
}

````

## src/index.css

````css
/* ==========================================================================
   Gatherum Design System
   Crimson Red + Vivid Yellow + White | Light Brutalism 3D
   ========================================================================== */

@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

/* --- Tokens --- */
:root {
  --red: #DC143C;
  --red-dark: #A50E2D;
  --red-light: #FF3358;
  --yellow: #FFD600;
  --yellow-dark: #C8A800;
  --yellow-light: #FFE259;
  --white: #FFFDF7;
  --off-white: #F5F0E8;
  --cream: #EDE8DC;
  --ink: #1A1209;
  --ink-muted: #3D3120;
  --border: #1A1209;
  --shadow-color: #1A1209;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --shadow-sm: 3px 3px 0 var(--shadow-color);
  --shadow-md: 5px 5px 0 var(--shadow-color);
  --shadow-lg: 8px 8px 0 var(--shadow-color);
  --shadow-xl: 12px 12px 0 var(--shadow-color);
  --font-sans: 'Space Grotesk', system-ui, sans-serif;
  --font-mono: 'Space Mono', monospace;
  --transition: 120ms ease;
}

/* --- Reset --- */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  font-family: var(--font-sans);
  background-color: var(--off-white);
  color: var(--ink);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

img, video { max-width: 100%; display: block; }

a { color: inherit; text-decoration: none; }

button, input, textarea, select {
  font-family: inherit;
  font-size: inherit;
}

/* --- Scrollbar --- */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: var(--cream); }
::-webkit-scrollbar-thumb { background: var(--ink); border-radius: 4px; }

/* --- Typography --- */
.text-mono { font-family: var(--font-mono); }
.text-xs { font-size: 0.75rem; }
.text-sm { font-size: 0.875rem; }
.text-base { font-size: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: 2rem; }
.text-4xl { font-size: 2.5rem; }
.text-5xl { font-size: 3.5rem; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.uppercase { text-transform: uppercase; }
.tracking-wide { letter-spacing: 0.08em; }
.tracking-widest { letter-spacing: 0.2em; }
.hide-on-mobile { display: block; }
.resp-flex-wrap { display: flex; }
.resp-card-pad { padding: 2rem; }
.resp-ml-auto { margin-left: auto; }

@media (max-width: 768px) {
  .hide-on-mobile { display: none !important; }
  .resp-flex-wrap { flex-wrap: wrap !important; }
  .resp-card-pad { padding: 1.25rem !important; }
  .resp-ml-auto { margin-left: 0 !important; width: 100%; justify-content: flex-start; }
}

/* --- Brutalist Card --- */
.card {
  background: var(--white);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition: transform var(--transition), box-shadow var(--transition);
}
.card:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-lg);
}
.card-red {
  background: var(--red);
  color: var(--white);
}
.card-yellow {
  background: var(--yellow);
  color: var(--ink);
}
.card-ink {
  background: var(--ink);
  color: var(--white);
}

/* --- Buttons --- */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-weight: 700;
  font-size: 0.875rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition), background var(--transition);
  box-shadow: var(--shadow-sm);
  white-space: nowrap;
  letter-spacing: 0.04em;
  user-select: none;
}
.btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: var(--shadow-md);
}
.btn:active {
  transform: translate(0, 0);
  box-shadow: none;
}
.btn-primary {
  background: var(--red);
  color: var(--white);
}
.btn-secondary {
  background: var(--yellow);
  color: var(--ink);
}
.btn-ghost {
  background: transparent;
  color: var(--ink);
}
.btn-dark {
  background: var(--ink);
  color: var(--white);
}
.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
}
.btn-lg {
  padding: 0.875rem 2rem;
  font-size: 1rem;
}
.btn:disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* --- Inputs --- */
.input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: var(--white);
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.9375rem;
  color: var(--ink);
  transition: box-shadow var(--transition), transform var(--transition);
  outline: none;
  box-shadow: var(--shadow-sm);
}
.input:focus {
  box-shadow: var(--shadow-md);
  transform: translate(-1px, -1px);
}
.input::placeholder { color: #9A8E80; }

.label {
  display: block;
  font-weight: 700;
  font-size: 0.8125rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 0.375rem;
}

.form-group { margin-bottom: 1.25rem; }

/* --- Badge --- */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
}
.badge-red { background: var(--red); color: var(--white); }
.badge-yellow { background: var(--yellow); color: var(--ink); }
.badge-ink { background: var(--ink); color: var(--white); }
.badge-white { background: var(--white); color: var(--ink); }

/* --- Layout --- */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}
.section { padding: 4rem 0; }

/* --- Grid --- */
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }

@media (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
  .text-5xl { font-size: 2.5rem; }
  .text-4xl { font-size: 2rem; }
}

/* --- Utility --- */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-1 { gap: 0.25rem; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.gap-6 { gap: 1.5rem; }
.gap-8 { gap: 2rem; }
.w-full { width: 100%; }
.h-full { height: 100%; }
.relative { position: relative; }
.absolute { position: absolute; }
.overflow-hidden { overflow: hidden; }
.text-center { text-align: center; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.mt-6 { margin-top: 1.5rem; }
.mt-8 { margin-top: 2rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.rounded { border-radius: var(--radius-md); }
.border { border: 2px solid var(--border); }
.opacity-0 { opacity: 0; }
.opacity-50 { opacity: 0.5; }
.cursor-pointer { cursor: pointer; }
.min-h-screen { min-height: 100vh; }
.hidden { display: none; }
.block { display: block; }
.inline-flex { display: inline-flex; }

/* --- Noise texture overlay --- */
.noise::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  border-radius: inherit;
}

/* --- 3D Tilt wrapper --- */
.tilt-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  transform-style: preserve-3d;
}

/* --- Animated underline --- */
.underline-anim {
  position: relative;
}
.underline-anim::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 0;
  height: 3px;
  background: var(--red);
  transition: width 0.25s ease;
}
.underline-anim:hover::after { width: 100%; }

/* --- Stripe pattern --- */
.stripes {
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 8px,
    rgba(0,0,0,0.05) 8px,
    rgba(0,0,0,0.05) 16px
  );
}

/* --- Tag --- */
.tag {
  display: inline-block;
  padding: 0.125rem 0.625rem;
  background: var(--yellow);
  color: var(--ink);
  border: 2px solid var(--ink);
  font-size: 0.75rem;
  font-weight: 700;
  font-family: var(--font-mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: 2px;
}

/* --- Divider --- */
.divider {
  border: none;
  border-top: 2px solid var(--border);
  margin: 1.5rem 0;
}

/* --- Alert / Toast --- */
.alert {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.875rem;
}
.alert-error { background: var(--red); color: var(--white); }
.alert-success { background: #22C55E; color: var(--white); }
.alert-warn { background: var(--yellow); color: var(--ink); }

/* --- Loader --- */
.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--cream);
  border-top-color: var(--red);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* --- Page loader --- */
.page-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--off-white);
}

/* --- Navbar --- */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--white);
  border-bottom: 2px solid var(--border);
  box-shadow: 0 4px 0 var(--border);
}
.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}
.navbar-logo {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.5rem;
  color: var(--red);
  letter-spacing: -0.02em;
}
.navbar-logo span { color: var(--ink); }
.nav-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  list-style: none;
}
.nav-link {
  padding: 0.375rem 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  transition: background var(--transition), border-color var(--transition);
  cursor: pointer;
}
.nav-link:hover, .nav-link.active {
  background: var(--yellow);
  border-color: var(--border);
}

@media (max-width: 768px) {
  .nav-links { display: none; }
  .nav-links.open {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--white);
    border-top: 2px solid var(--border);
    padding: 1rem;
    box-shadow: 0 8px 0 var(--border);
    z-index: 99;
  }
}

/* --- Event Card --- */
.event-card {
  background: var(--white);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
}
.event-card:hover {
  transform: translate(-3px, -3px);
  box-shadow: var(--shadow-xl);
}
.event-card-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 2px solid var(--border);
}
.event-card-image-placeholder {
  width: 100%;
  height: 180px;
  background: var(--cream);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 2px solid var(--border);
  font-size: 3rem;
}
.event-card-body { padding: 1rem; }

/* --- Ticket --- */
.ticket {
  background: var(--white);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  position: relative;
}
.ticket::before, .ticket::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: var(--off-white);
  border: 2px solid var(--border);
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
}
.ticket::before { left: -11px; }
.ticket::after { right: -11px; }
.ticket-header {
  background: var(--red);
  color: var(--white);
  padding: 1rem 1.5rem;
  border-bottom: 2px dashed var(--border);
}
.ticket-body { padding: 1.25rem 1.5rem; }

/* --- Hero section --- */
.hero {
  min-height: 90vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: var(--off-white);
}
.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.hero-content { position: relative; z-index: 2; }

/* --- Stats --- */
.stat-block {
  text-align: center;
  padding: 1.5rem;
  background: var(--white);
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
.stat-number {
  font-family: var(--font-mono);
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--red);
  line-height: 1;
}
.stat-label {
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-muted);
  margin-top: 0.25rem;
}

/* --- Table --- */
.table-wrapper {
  overflow-x: auto;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
.table {
  width: 100%;
  border-collapse: collapse;
  background: var(--white);
}
.table th {
  background: var(--ink);
  color: var(--white);
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.8125rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--cream);
  font-size: 0.9375rem;
}
.table tr:last-child td { border-bottom: none; }
.table tr:hover td { background: var(--off-white); }

/* --- Modal --- */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(26,18,9,0.7);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
.modal {
  background: var(--white);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: 2rem;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

/* --- Accordion --- */
.accordion-item {
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  margin-bottom: 0.5rem;
  overflow: hidden;
}
.accordion-trigger {
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--white);
  border: none;
  text-align: left;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background var(--transition);
}
.accordion-trigger:hover { background: var(--off-white); }
.accordion-content {
  padding: 0 1rem 0.875rem;
  background: var(--off-white);
  font-size: 0.9375rem;
}

/* --- Tabs --- */
.tabs {
  display: flex;
  border-bottom: 2px solid var(--border);
  margin-bottom: 1.5rem;
  gap: 0.25rem;
}
.tab {
  padding: 0.5rem 1.25rem;
  font-weight: 700;
  font-size: 0.875rem;
  border: 2px solid transparent;
  border-bottom: none;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: background var(--transition), border-color var(--transition);
  background: transparent;
}
.tab:hover { background: var(--cream); }
.tab.active {
  background: var(--red);
  color: var(--white);
  border-color: var(--border);
  border-bottom-color: var(--red);
  margin-bottom: -2px;
}

/* --- Scan result badge --- */
.scan-success { background: #22C55E; border: 2px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem; text-align: center; color: white; }
.scan-error { background: var(--red); border: 2px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem; text-align: center; color: white; }
.scan-warn { background: var(--yellow); border: 2px solid var(--border); border-radius: var(--radius-md); padding: 1.5rem; text-align: center; color: var(--ink); }

/* --- Three.js canvas wrapper --- */
.canvas-wrapper {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* --- Floating decoration --- */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}
@keyframes float2 {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(-8deg); }
}
.float-1 { animation: float 6s ease-in-out infinite; }
.float-2 { animation: float2 8s ease-in-out infinite; }
.float-3 { animation: float 5s ease-in-out infinite 1s; }

/* --- QR container --- */
.qr-container {
  background: var(--white);
  border: 3px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 1rem;
  display: inline-block;
}

/* --- Select --- */
.select {
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: var(--white);
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.9375rem;
  color: var(--ink);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%231A1209' stroke-width='2' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.875rem center;
  padding-right: 2.5rem;
}
.select:focus { box-shadow: var(--shadow-md); }

/* --- Textarea --- */
.textarea {
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: var(--white);
  border: 2px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.9375rem;
  color: var(--ink);
  resize: vertical;
  min-height: 100px;
  box-shadow: var(--shadow-sm);
  outline: none;
  transition: box-shadow var(--transition), transform var(--transition);
}
.textarea:focus {
  box-shadow: var(--shadow-md);
  transform: translate(-1px, -1px);
}

/* --- Progress bar --- */
.progress-bar {
  height: 12px;
  background: var(--cream);
  border: 2px solid var(--border);
  border-radius: 100px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--red);
  border-radius: 100px;
  transition: width 0.5s ease;
}
.progress-fill.yellow { background: var(--yellow); }
.progress-fill.green { background: #22C55E; }

/* --- Sidebar layout --- */
.app-layout {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 260px;
  background: var(--ink);
  color: var(--white);
  border-right: 2px solid var(--border);
  flex-shrink: 0;
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}
.sidebar-logo {
  font-family: var(--font-mono);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--red);
  padding: 0 1.5rem 1.5rem;
  border-bottom: 2px solid rgba(255,255,255,0.1);
}
.sidebar-nav { list-style: none; padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background var(--transition);
  color: rgba(255,255,255,0.75);
}
.sidebar-item:hover { background: rgba(255,255,255,0.1); color: var(--white); }
.sidebar-item.active { background: var(--red); color: var(--white); }
.main-content { flex: 1; overflow-x: hidden; }

@media (max-width: 768px) {
  .sidebar { display: none; }
  .app-layout { flex-direction: column; }
}

/* --- Avatar --- */
.avatar {
  border-radius: 50%;
  border: 2px solid var(--border);
  object-fit: cover;
  background: var(--cream);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-family: var(--font-mono);
  flex-shrink: 0;
}
.avatar-sm { width: 32px; height: 32px; font-size: 0.75rem; }
.avatar-md { width: 48px; height: 48px; font-size: 1rem; }
.avatar-lg { width: 72px; height: 72px; font-size: 1.5rem; }

/* ==========================================================================
   RESPONSIVE — Global overrides
   ========================================================================== */

/* Tablet (≤ 900px) */
@media (max-width: 900px) {
  /* Event detail page 2-col → 1-col */
  .resp-event-grid {
    grid-template-columns: 1fr !important;
  }

  /* Stats row wrap */
  .resp-stats-row {
    grid-template-columns: 1fr 1fr !important;
  }

  /* Details grid 2-col stays but shrinks */
  .resp-details-grid {
    grid-template-columns: 1fr 1fr !important;
  }

  .section { padding: 2.5rem 0; }
}

/* Mobile (≤ 640px) */
@media (max-width: 640px) {
  .container {
    padding: 0 1rem;
  }

  .section { padding: 2rem 0; }

  /* Stats go 1 col */
  .resp-stats-row {
    grid-template-columns: 1fr !important;
  }

  /* Details grid 1 col */
  .resp-details-grid {
    grid-template-columns: 1fr !important;
  }

  /* Form grids 1 col */
  .resp-form-grid {
    grid-template-columns: 1fr !important;
  }

  /* Tabs wrap */
  .tabs {
    flex-wrap: wrap;
  }

  /* Smaller heading */
  h1 {
    font-size: 1.5rem !important;
  }

  /* Card shadow reduce on mobile for cleaner look */
  .card {
    box-shadow: var(--shadow-sm);
  }
  .card:hover {
    box-shadow: var(--shadow-md);
  }

  /* Avatar sizes reduced */
  .avatar-lg { width: 56px; height: 56px; font-size: 1.25rem; }
}

/* Small mobile (≤ 400px) */
@media (max-width: 400px) {
  .container {
    padding: 0 0.75rem;
  }

  .btn {
    font-size: 0.8125rem;
    padding: 0.5rem 0.875rem;
  }
}

/* Brutalist React Datepicker */
.react-datepicker-wrapper { display: block; }
.react-datepicker__input-container input { width: 100%; }
.react-datepicker { font-family: inherit !important; border: 2px solid var(--border) !important; border-radius: var(--radius-sm) !important; box-shadow: var(--shadow-md) !important; background-color: var(--white) !important; color: var(--ink) !important; }
.react-datepicker__header { background-color: var(--yellow) !important; border-bottom: 2px solid var(--border) !important; border-top-left-radius: 2px !important; border-top-right-radius: 2px !important; padding-top: 10px !important; }
.react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header { font-weight: 700 !important; color: var(--ink) !important; }
.react-datepicker__day-name { color: var(--ink) !important; font-weight: 600 !important; }
.react-datepicker__day { color: var(--ink) !important; border-radius: 2px !important; transition: all 0.2s; }
.react-datepicker__day:hover { background-color: var(--red) !important; color: white !important; transform: scale(1.1); }
.react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range, .react-datepicker__month-text--selected, .react-datepicker__quarter-text--selected, .react-datepicker__year-text--selected { background-color: var(--red) !important; color: var(--white) !important; font-weight: 700 !important; box-shadow: 2px 2px 0 var(--border) !important; }
.react-datepicker__time-container { border-left: 2px solid var(--border) !important; }
.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected { background-color: var(--red) !important; color: white !important; font-weight: 700 !important; }
.react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li:hover { background-color: var(--yellow) !important; color: var(--ink) !important; }

````

## src/animations.css

````css
/* Smooth page transition */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.page-enter { animation: fadeUp 0.5s ease forwards; }

/* Hover lift for all cards */
.card, .event-card {
  transition: transform 0.18s cubic-bezier(0.22,1,0.36,1), box-shadow 0.18s ease !important;
}

/* Bento grid responsive fix */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.bento-span-2 {
  grid-column: span 2;
}

@media (max-width: 900px) {
  .bento-grid {
    grid-template-columns: 1fr 1fr !important;
  }
  .bento-span-2 {
    grid-column: span 2 !important;
  }
}
@media (max-width: 640px) {
  .bento-grid {
    grid-template-columns: 1fr !important;
  }
  .bento-span-2 {
    grid-column: 1 !important;
  }
}

````

