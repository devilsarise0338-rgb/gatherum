import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
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
import AuthCallbackPage from './pages/AuthCallbackPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { safeRedirect } from './lib/auth';

// Dismissible nudge for signed-in users who never finished their profile.
// Guarded routes force /profile; public pages (Home) show this instead.
function IncompleteProfileBanner() {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = React.useState(false);

  if (!profile || profile.profile_completed || dismissed) return null;
  if (location.pathname.startsWith('/profile') || location.pathname.startsWith('/auth')) return null;

  return (
    <div style={{
      background: 'var(--yellow)', color: 'var(--ink)',
      borderBottom: '2px solid var(--border)',
      padding: '0.625rem 1rem', display: 'flex', alignItems: 'center',
      justifyContent: 'center', gap: '0.75rem', fontWeight: 600, fontSize: '0.875rem',
      flexWrap: 'wrap',
    }}>
      <span>Finish your profile to register for events.</span>
      <button className="btn btn-dark btn-sm" onClick={() => navigate('/profile')}>Complete profile</button>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

/* ── Route Guards ── */
/* Exported for unit tests (RequireAuth.test.tsx); not used elsewhere. */
export function RequireAuth({ children, role, allowIncomplete }: { children: React.ReactElement; role?: string | string[]; allowIncomplete?: boolean }) {
  const { user, profile, loading, profileError, refreshProfile, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;

  // Never render guarded pages blind: no profile yet means still resolving.
  // On permanent failure show Retry/Sign out instead of hanging or leaking.
  if (!profile) {
    if (profileError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: 'var(--off-white)', padding: '1rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <h2 style={{ fontWeight: 700 }}>Couldn't load your profile</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', maxWidth: 440 }}>{profileError}</p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary btn-sm" onClick={() => refreshProfile()}>Retry</button>
            <button className="btn btn-ghost btn-sm" onClick={() => signOut()}>Sign out</button>
          </div>
        </div>
      );
    }
    return (
      <div className="page-loader">
        <div className="spinner" />
      </div>
    );
  }

  if (profile.is_banned) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: 'var(--off-white)' }}>
        <div style={{ fontSize: '3rem' }}>🚫</div>
        <h2 style={{ fontWeight: 700 }}>Account Suspended</h2>
        <p style={{ color: 'var(--ink-muted)' }}>Contact an administrator for assistance.</p>
      </div>
    );
  }

  // Force profile completion for new users
  if (!allowIncomplete && !profile.profile_completed) {
    return <Navigate to="/profile" state={{ from: location, mustComplete: true }} replace />;
  }

  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(profile.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

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
  const isAuth = location.pathname === '/auth' || location.pathname.startsWith('/auth/');

  return (
    <>
      {!isAuth && <Navbar />}
      <IncompleteProfileBanner />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public */}
          <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
          <Route path="/events" element={<PageWrapper><EventsPage /></PageWrapper>} />
          <Route path="/archives" element={<PageWrapper><ArchivesPage /></PageWrapper>} />
          <Route path="/events/:id" element={<PageWrapper><EventDetailPage /></PageWrapper>} />
          <Route
            path="/auth"
            element={
              session ? (
                <Navigate to={safeRedirect((location.state as { from?: unknown } | null)?.from)} replace />
              ) : (
                <PageWrapper><AuthPage /></PageWrapper>
              )
            }
          />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/auth/reset" element={<ResetPasswordPage />} />

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


function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: 'var(--off-white)', padding: '1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem' }}>⚠️</div>
      <h2 style={{ fontWeight: 700 }}>Something went wrong</h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', maxWidth: 440 }}>{message}</p>
      <button className="btn btn-primary" onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <RootRoutes />
        </ErrorBoundary>
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
