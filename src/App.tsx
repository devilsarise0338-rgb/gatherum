import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

import Home from './pages/Home';
import Explore from './pages/Explore';
import EventPage from './pages/EventPage';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentTickets from './pages/student/StudentTickets';
import VolunteerCheckIn from './pages/volunteer/VolunteerCheckIn';
import OrganizerEventCreation from './pages/organizer/OrganizerEventCreation';
import OrganizerEventManagement from './pages/organizer/OrganizerEventManagement';
import OrganizerCheckIn from './pages/organizer/OrganizerCheckIn';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminEventModeration from './pages/admin/AdminEventModeration';
import AdminSettings from './pages/admin/AdminSettings';
import AuthPage from './pages/AuthPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    const moveCursor = (e: MouseEvent) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };

    if (window.matchMedia('(pointer: fine)').matches) {
      document.addEventListener('mousemove', moveCursor);
    }

    return () => {
      document.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  useEffect(() => {
    // We add mouseenter/mouseleave events globally via event delegation or MutationObserver.
    // A simpler approach for React is to rely on global mouseover/mouseout events.
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button') || target.closest('.hover-target') || target.closest('.interactive')) {
        if (target.closest('.hover-target')) {
          cursor.classList.add('hover-solid');
        } else {
          cursor.classList.add('hover');
        }
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button') || target.closest('.hover-target') || target.closest('.interactive')) {
        cursor.classList.remove('hover');
        cursor.classList.remove('hover-solid');
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <div className="flex-grow flex flex-col w-full min-h-screen">
      <Routes>
        {/* Core Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Explore />} />
        <Route path="/events/:id" element={<EventPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Student Experience */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/tickets" element={<StudentTickets />} />
        </Route>

        {/* Volunteer Experience (Assume volunteers can be any role for now, but usually organizer/admin. We'll leave it to organizers/admins or custom role if exists. Gatherum didn't strictly separate volunteer as a role in DB, but wait, there is no volunteer role in AuthContext, let's allow organizer/admin) Wait, AuthContext defines Role as 'student' | 'organizer' | 'admin'. So let's just make volunteer accessible to organizers and admins? No, students can be volunteers? Let's just leave it protected for all authenticated users if we aren't sure, or look at how volunteer is handled. Wait, let's protect it so anyone logged in can access it if no allowedRoles is specified. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/volunteer" element={<VolunteerDashboard />} />
          <Route path="/volunteer/checkin/:eventId" element={<VolunteerCheckIn />} />
        </Route>

        {/* Organizer Experience */}
        <Route element={<ProtectedRoute allowedRoles={['organizer', 'admin']} />}>
          <Route path="/organizer" element={<OrganizerDashboard />} />
          <Route path="/organizer/events/new" element={<OrganizerEventCreation />} />
          <Route path="/organizer/events/:id" element={<OrganizerEventManagement />} />
          <Route path="/organizer/checkin/:eventId" element={<OrganizerCheckIn />} />
        </Route>

        {/* Admin Experience */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUserManagement />} />
          <Route path="/admin/moderation" element={<AdminEventModeration />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
