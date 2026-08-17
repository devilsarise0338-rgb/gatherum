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
function RequireAuth({ children, role }: { children: React.ReactElement; role?: string | string[] }) {
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
          <Route path="/profile" element={<RequireAuth><PageWrapper><ProfilePage /></PageWrapper></RequireAuth>} />

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
