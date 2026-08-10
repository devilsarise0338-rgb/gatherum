import { useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { Shield, EyeOff, Eye, Trash2, ShieldAlert, Settings, Users, Calendar, AlertTriangle, ShieldCheck } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useAuth, User, Role } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import SkeletonLoader from "./SkeletonLoader";
import ErrorState from "./ErrorState";

export default function AdminDashboard() {
  const { events, deleteEvent, unpublishEvent, isLoading, error } = useData();
  const { users, settings, updateUserRole, toggleUserBan, updateSettings, user: currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"events" | "users" | "settings">("events");

  // Settings State
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSaveSettings = () => {
    updateSettings(localSettings);
    alert("Settings saved successfully.");
  };

  const handleResetAccess = async (email: string) => {
    if (!window.confirm(`Are you sure you want to send a magic link to ${email}? This will allow them to sign in immediately.`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const res = await fetch("/api/admin/reset-user-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ targetEmail: email })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to reset access");
      }
      
      alert(`Magic link successfully sent to ${email}`);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4" /> System Administrator
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Control Panel</h1>
          <p className="text-gray-500 dark:text-gray-400">Monitor system health, manage user access, and moderate content.</p>
        </header>

        {error ? (
          <ErrorState 
            title="Failed to load admin data" 
            message="There was a problem connecting to the server. Please try refreshing."
            onRetry={() => window.location.reload()}
          />
        ) : isLoading ? (
          <div className="space-y-8">
            <SkeletonLoader type="card" className="h-[400px]" />
          </div>
        ) : (
          <>
        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
          <button
            onClick={() => setActiveTab("events")}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "events" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <Calendar className="w-4 h-4" /> Events
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "users" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <Users className="w-4 h-4" /> Users
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 font-bold text-sm rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "settings" ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <Settings className="w-4 h-4" /> Settings
          </button>
        </div>

        {activeTab === "events" && (
          <section className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Global Event Moderation</h2>
              <span className="text-sm font-medium text-gray-500">{events.length} Events Total</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-500 dark:text-gray-400">
                    <th className="px-6 py-4 font-medium">Event Title</th>
                    <th className="px-6 py-4 font-medium">Organizer / Dept</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white truncate max-w-xs">{event.title}</div>
                        <div className="text-xs text-gray-500">{new Date(event.startTime).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{event.department}</td>
                      <td className="px-6 py-4">
                        {event.isUnpublished ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold">
                            <EyeOff className="w-3 h-3" /> Unpublished
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                            <Eye className="w-3 h-3" /> Public
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => unpublishEvent(event.id, !event.isUnpublished)}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-colors"
                        >
                          {event.isUnpublished ? "Publish" : "Unpublish"}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this event permanently?")) {
                              deleteEvent(event.id);
                            }
                          }}
                          className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No events found on the platform.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "users" && (
          <section className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">User Management</h2>
              <span className="text-sm font-medium text-gray-500">{users.length} Registered Users</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-500 dark:text-gray-400">
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                  {users.map((u) => (
                    <tr key={u.email} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {u.email} {u.email === currentUser?.email && "(You)"}
                      </td>
                      <td className="px-6 py-4 capitalize text-gray-600 dark:text-gray-300">
                        <select
                          value={u.role}
                          disabled={u.email === currentUser?.email}
                          onChange={(e) => updateUserRole(u.id!, e.target.value as Role)}
                          className="bg-transparent border border-gray-200 dark:border-gray-700 rounded p-1 outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        >
                          <option value="student">Student</option>
                          <option value="organizer">Organizer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {u.isBanned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold">
                            <ShieldAlert className="w-3 h-3" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                            <ShieldCheck className="w-3 h-3" /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => toggleUserBan(u.id!, !!u.isBanned)}
                          disabled={u.email === currentUser?.email}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {u.isBanned ? "Unsuspend" : "Suspend"}
                        </button>
                        <button
                          onClick={() => handleResetAccess(u.email)}
                          disabled={u.email === currentUser?.email}
                          className="px-3 py-1.5 ml-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Reset Access
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "settings" && (
          <section className="bg-white dark:bg-surface-dark p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm max-w-3xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" /> Platform Settings
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/30">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Global Signups</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Allow new users to register for an account.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={localSettings.allowGlobalSignups}
                    onChange={(e) => setLocalSettings({ ...localSettings, allowGlobalSignups: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800/30">
                <label className="block font-bold text-gray-900 dark:text-white mb-1">Allowed Email Domain</label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Restrict registrations to a specific domain (e.g. @college.edu).</p>
                <input
                  type="text"
                  value={localSettings.allowedEmailDomain}
                  onChange={(e) => setLocalSettings({ ...localSettings, allowedEmailDomain: e.target.value })}
                  placeholder="@yourcollege.edu"
                  className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-red-100 dark:border-red-900/30 rounded-xl bg-red-50 dark:bg-red-900/10">
                <div>
                  <h3 className="font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Maintenance Mode
                  </h3>
                  <p className="text-sm text-red-600/80 dark:text-red-300/80">Take the platform offline for non-admins.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={localSettings.maintenanceMode}
                    onChange={(e) => setLocalSettings({ ...localSettings, maintenanceMode: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-red-200 peer-focus:outline-none rounded-full peer dark:bg-red-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-red-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-red-800 peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-hover transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </section>
        )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
