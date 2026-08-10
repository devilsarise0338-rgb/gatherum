/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MotionConfig } from "motion/react";

const Toaster = React.lazy(() => import("react-hot-toast").then(m => ({ default: m.Toaster })));
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/SignUpPage";
import ProtectedRoute from "./components/ProtectedRoute";
import MaintenanceModeWrapper from "./components/MaintenanceModeWrapper";

import EventsPage from "./components/EventsPage";
import EventDetailPage from "./components/EventDetailPage";

import StudentDashboard from "./components/StudentDashboard";
import StudentTicketsPage from "./components/StudentTicketsPage";
import OrganizerDashboard from "./components/OrganizerDashboard";
import OrganizerCheckinPage from "./components/OrganizerCheckinPage";
import AdminDashboard from "./components/AdminDashboard";

import OrganizerEventWizard from "./components/OrganizerEventWizard";
import OrganizerManageEventPage from "./components/OrganizerManageEventPage";
import ProfileSettings from "./components/ProfileSettings";
import PublicOrganizerPage from "./components/PublicOrganizerPage";
import ProfileCompletionForm from "./components/ProfileCompletionForm";

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
          <Router>
            <MotionConfig reducedMotion="user">
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <Suspense fallback={null}>
                    <Toaster position="bottom-center" />
                  </Suspense>
                  <MaintenanceModeWrapper>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/events/:id" element={<EventDetailPage />} />
                    <Route path="/c/:id" element={<PublicOrganizerPage />} />

                    {/* Profile completion — requires login but NOT profile_completed */}
                    <Route element={<ProtectedRoute skipProfileCheck />}>
                      <Route path="/complete-profile" element={<ProfileCompletionForm />} />
                    </Route>

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                      <Route path="/student" element={<StudentDashboard />} />
                      <Route path="/student/tickets" element={<StudentTicketsPage />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={["organizer"]} />}>
                      <Route path="/organizer" element={<OrganizerDashboard />} />
                      <Route path="/organizer/events/new" element={<OrganizerEventWizard />} />
                      <Route path="/organizer/events/:id" element={<OrganizerManageEventPage />} />
                    </Route>

                    {/* Shared protected routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/settings" element={<ProfileSettings />} />
                      <Route path="/organizer/checkin/:eventId" element={<OrganizerCheckinPage />} />
                    </Route>

                    <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                      <Route path="/admin/*" element={<AdminDashboard />} />
                    </Route>
                  </Routes>
                </MaintenanceModeWrapper>
              </main>
              <Footer />
            </div>
            </MotionConfig>
          </Router>
      </DataProvider>
    </AuthProvider>
  );
}
