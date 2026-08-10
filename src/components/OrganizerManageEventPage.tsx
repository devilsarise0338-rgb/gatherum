import React, { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { useData } from "../contexts/DataContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import { Download, Search, Trash2, Megaphone, ArrowLeft, Star, UserPlus, ShieldX, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

import { supabase } from "../lib/supabase";
import { RegistrationService } from "../services/api";

export default function OrganizerManageEventPage() {
  const { id } = useParams<{ id: string }>();
  const { events, registrations, removeRegistrant, announcements, addAnnouncement, feedbacks, getVolunteers, inviteVolunteer, removeVolunteer, isLoading, error } = useData();
  const event = events.find(e => e.id === id);

  const [activeTab, setActiveTab] = useState<"registrants" | "analytics" | "announcements" | "feedback" | "volunteers">("registrants");
  
  // Registrants State
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"email" | "status" | "attended">("email");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  // Announcements State
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");

  // Volunteers State
  const [volunteers, setVolunteers] = useState<{userId: string; email: string}[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (event) {
      getVolunteers(event.id).then(setVolunteers).catch(console.error);
    }
  }, [event, getVolunteers]);

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto py-8">
          <ErrorState 
            title="Failed to load event data" 
            message="There was a problem connecting to the server. Please try refreshing."
            onRetry={() => window.location.reload()}
          />
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto py-8 space-y-8">
          <SkeletonLoader type="header" />
          <SkeletonLoader type="card" className="h-[500px]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto py-8">
          <EmptyState 
            icon={<Calendar className="w-8 h-8" />}
            title="Event not found."
            description="The event you are trying to manage does not exist or you do not have access."
            actionText="Back to Dashboard"
            actionHref="/organizer"
          />
        </div>
      </DashboardLayout>
    );
  }

  const eventRegsContext = registrations.filter(r => r.eventId === event.id);
  const eventAnnouncements = announcements.filter(a => a.eventId === event.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const eventFeedbacks = feedbacks.filter(f => f.eventId === event.id);

  const [liveRegs, setLiveRegs] = useState(eventRegsContext);
  useEffect(() => {
    setLiveRegs(eventRegsContext);
  }, [eventRegsContext]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`registrations:${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations',
          filter: `event_id=eq.${id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLiveRegs(prev => [...prev, {
              id: payload.new.id,
              eventId: payload.new.event_id,
              studentId: payload.new.user_id,
              status: payload.new.status,
              waitlistPosition: undefined,
              ticketId: payload.new.ticket_id,
              attended: payload.new.attended
            }]);
            RegistrationService.getRegistrationsForOrganizer(id).then(regs => {
              setLiveRegs(regs);
            });
          } else if (payload.eventType === 'UPDATE') {
            setLiveRegs(prev => prev.map(r => r.id === payload.new.id ? {
              ...r,
              status: payload.new.status,
              attended: payload.new.attended
            } : r));
          } else if (payload.eventType === 'DELETE') {
            setLiveRegs(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
         if (status === 'SUBSCRIBED') {
            RegistrationService.getRegistrationsForOrganizer(id).then(regs => {
                setLiveRegs(regs);
            });
         }
      });
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  // Data Grid Logic
  const filteredRegs = useMemo(() => {
    return liveRegs.filter(r => (r.studentEmail || "").toLowerCase().includes(searchQuery.toLowerCase()));
  }, [liveRegs, searchQuery]);

  const sortedRegs = useMemo(() => {
    return [...filteredRegs].sort((a, b) => {
      let valA, valB;
      if (sortField === "email") { valA = a.studentEmail; valB = b.studentEmail; }
      else if (sortField === "status") { valA = a.status; valB = b.status; }
      else { valA = a.attended ? 1 : 0; valB = b.attended ? 1 : 0; }
      
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredRegs, sortField, sortDir]);

  const toggleSort = (field: "email" | "status" | "attended") => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const exportCSV = () => {
    const headers = ["Ticket ID", "Student Email", "Status", "Attended"];
    const rows = sortedRegs.map(r => [r.ticketId || "N/A", r.studentEmail, r.status, r.attended ? "Yes" : "No"]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${event.title.replace(/\s+/g, '_')}_registrants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementContent.trim()) return;
    try {
      await addAnnouncement({
        eventId: event.id,
        message: `${announcementTitle.trim()}: ${announcementContent.trim()}`
      });
      setAnnouncementTitle("");
      setAnnouncementContent("");
      toast.success("Announcement broadcasted");
    } catch (err: any) {
      toast.error(err.message || "Failed to send announcement");
    }
  };

  const handleInviteVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    try {
      await inviteVolunteer(event.id, inviteEmail.trim());
      setInviteEmail("");
      const updated = await getVolunteers(event.id);
      setVolunteers(updated);
      toast.success("Volunteer added");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to invite volunteer");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveVolunteer = async (userId: string) => {
    try {
      await removeVolunteer(event.id, userId);
      const updated = await getVolunteers(event.id);
      setVolunteers(updated);
      toast.success("Volunteer removed");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to remove volunteer");
    }
  };

  // Analytics Data
  const attendanceData = [
    { name: "Attended", value: liveRegs.filter(r => r.attended).length },
    { name: "No Show", value: liveRegs.length - liveRegs.filter(r => r.attended).length }
  ];
  const COLORS = ["#10b981", "#ef4444"];

  const capacityData = [
    { name: "Registered", count: event.registeredCount },
    { name: "Available", count: Math.max(0, event.capacity - event.registeredCount) }
  ];
  
  // Mock registration over time
  const regOverTime = [
    { day: "Day 1", regs: Math.floor(event.registeredCount * 0.2) },
    { day: "Day 2", regs: Math.floor(event.registeredCount * 0.5) },
    { day: "Day 3", regs: Math.floor(event.registeredCount * 0.8) },
    { day: "Day 4", regs: event.registeredCount },
  ];

  const avgRating = eventFeedbacks.length > 0 ? (eventFeedbacks.reduce((acc, f) => acc + f.rating, 0) / eventFeedbacks.length).toFixed(1) : "N/A";
  const isPast = new Date(event.endTime).getTime() < Date.now();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8">
        <header className="mb-8">
          <Link to="/organizer" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{event.title}</h1>
              <p className="text-gray-600 dark:text-gray-400">Total Registered: {liveRegs.length}</p>
            </div>
            <Link to={`/events/${event.id}`} target="_blank" className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              View Public Page
            </Link>
          </div>
        </header>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {(["registrants", "analytics", "announcements", "feedback", "volunteers"] as const).map(tab => {
            if (tab === "feedback" && !isPast) return null;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full font-bold transition-colors whitespace-nowrap ${
                  activeTab === tab 
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900" 
                    : "bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          })}
        </div>

        {activeTab === "registrants" && (
          <div className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search emails..." 
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors">
                <Download className="w-4 h-4" /> Export CSV
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
                    <th className="py-3 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => toggleSort("email")}>
                      Student Email {sortField === "email" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => toggleSort("status")}>
                      Status {sortField === "status" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => toggleSort("attended")}>
                      Attended {sortField === "attended" && (sortDir === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRegs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">No registrants found.</td>
                    </tr>
                  ) : (
                    sortedRegs.map(reg => (
                      <tr key={reg.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4 font-medium">{reg.studentEmail}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            reg.status === "registered" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {reg.attended ? <span className="text-green-600 font-bold">Yes</span> : <span className="text-gray-400">No</span>}
                        </td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={async () => { try { await removeRegistrant(reg.id); } catch(e: any) { toast.error(e.message || 'Failed to remove'); } }}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Remove Registrant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm col-span-1 md:col-span-2">
              <h3 className="font-bold mb-6">Registrations Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={regOverTime}>
                    <defs>
                      <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="regs" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRegs)" isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="font-bold mb-4">Attendance Rate</h3>
              <div className="h-64 flex items-center justify-center">
                {liveRegs.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" isAnimationActive={true} animationDuration={1500} animationEasing="ease-out">
                        {attendanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500">No data</p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="font-bold mb-4">Capacity Fill</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={capacityData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm h-fit">
              <h3 className="font-bold mb-2 flex items-center gap-2"><Megaphone className="w-5 h-5 text-primary" /> Broadcast Announcement</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Send a notification to all registered attendees.</p>
              <form onSubmit={handleBroadcast} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <input
                    type="text"
                    value={announcementTitle}
                    onChange={e => setAnnouncementTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g., Room Change"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Message</label>
                  <textarea
                    value={announcementContent}
                    onChange={e => setAnnouncementContent(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Write your message..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={!announcementTitle.trim() || !announcementContent.trim()}
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  Send Broadcast
                </button>
              </form>
            </div>
            
            <div>
              <h3 className="font-bold mb-4">Past Announcements</h3>
              <div className="space-y-4">
                {eventAnnouncements.length === 0 ? (
                  <p className="text-gray-500 text-sm">No announcements sent yet.</p>
                ) : (
                  eventAnnouncements.map(ann => (
                    <div key={ann.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white">{ann.message}</h4>
                        <span className="text-xs text-gray-500">{new Date(ann.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{ann.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "feedback" && isPast && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-500 dark:text-gray-400">Average Rating</h3>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                  {avgRating} <Star className="w-8 h-8 text-yellow-400 fill-current" />
                </div>
              </div>
              <div className="text-right">
                <h3 className="font-bold text-gray-500 dark:text-gray-400">Total Reviews</h3>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{eventFeedbacks.length}</div>
              </div>
            </div>

            <div className="space-y-4">
              {eventFeedbacks.length === 0 ? (
                <div className="text-center p-8 bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 text-gray-500">
                  No feedback received yet.
                </div>
              ) : (
                eventFeedbacks.map(f => (
                  <div key={f.id} className="bg-white dark:bg-surface-dark p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{f.studentEmail}</div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`w-4 h-4 ${star <= f.rating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-700"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{f.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "volunteers" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-24">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900 dark:text-white">Invite Volunteer</h2>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Volunteers can scan and manually check in attendees. They cannot edit the event or export data. They must already have a Gatherum account.
                </p>
                <form onSubmit={handleInviteVolunteer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-bg-dark focus:ring-2 focus:ring-primary outline-none"
                      placeholder="student@poornima.org"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!inviteEmail.trim() || inviteLoading}
                    className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
                  >
                    {inviteLoading ? "Adding..." : "Add Volunteer"}
                  </button>
                </form>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Current Volunteers ({volunteers.length})</h3>
              <div className="space-y-4">
                {volunteers.length === 0 ? (
                  <div className="text-center p-8 bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 text-gray-500">
                    No volunteers added yet.
                  </div>
                ) : (
                  volunteers.map(vol => (
                    <div key={vol.userId} className="flex justify-between items-center p-4 bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {vol.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{vol.email}</div>
                          <div className="text-xs text-gray-500">Event Volunteer</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm("Remove this volunteer?")) {
                            handleRemoveVolunteer(vol.userId);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                        title="Remove volunteer"
                      >
                        <ShieldX className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
