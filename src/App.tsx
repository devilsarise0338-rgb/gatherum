import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
const Toaster = React.lazy(() => import("react-hot-toast").then(m => ({ default: m.Toaster })));
import { AppProvider, useApp } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { NavBar } from './components/common/NavBar';
import { Footer } from './components/common/Footer';
import { SplashIntro } from './components/SplashIntro';

import { Homepage } from './pages/Homepage';
import { ExplorePage } from './pages/ExplorePage';
import { EventDetailPage } from './pages/EventDetailPage';
import { EventCreatePage } from './pages/EventCreatePage';
import { AuthPage } from './pages/AuthPage';
import { HostDashboardPage } from './pages/HostDashboardPage';
import { GuestManagementPage } from './pages/GuestManagementPage';
import { TicketConfirmationPage } from './pages/TicketConfirmationPage';
import { MyEventsPage } from './pages/MyEventsPage';
import { HostPublicProfilePage } from './pages/HostPublicProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ProfileCompletionPage } from './pages/ProfileCompletionPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const MainContent: React.FC = () => {
  const { showSplash, setShowSplash } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C1917]">
      {showSplash && (
        <SplashIntro onComplete={() => setShowSplash(false)} />
      )}

      <NavBar />
      
      <main className="flex-1">
        <Suspense fallback={null}>
          <Toaster position="bottom-center" />
        </Suspense>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/create" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><EventCreatePage /></ProtectedRoute>} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><HostDashboardPage /></ProtectedRoute>} />
          <Route path="/guest-management/:eventId" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><GuestManagementPage /></ProtectedRoute>} />
          <Route path="/ticket/:rsvpId" element={<ProtectedRoute><TicketConfirmationPage /></ProtectedRoute>} />
          <Route path="/my-events" element={<ProtectedRoute><MyEventsPage /></ProtectedRoute>} />
          <Route path="/host/:hostId" element={<HostPublicProfilePage />} />
          <Route path="/complete-profile" element={<ProtectedRoute><ProfileCompletionPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><ProfileSettingsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppProvider>
            <MainContent />
          </AppProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
