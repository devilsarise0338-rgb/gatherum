import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import DashboardLayout from "./DashboardLayout";
import { Ticket, Calendar, Search, Clock, ArrowRight, Megaphone, Star, Check, Shield, Plus } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import StudentOnboarding from "./StudentOnboarding";
import { pageTransition, cardHover } from "../utils/motion";
import TiltCard from "./TiltCard";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { toast } from "react-hot-toast";

export default function StudentDashboard() {
  const { events, registrations, announcements, feedbacks, addFeedback, getMyVolunteeringEvents, isLoading, error } = useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "waitlist">("upcoming");
  const [feedbackState, setFeedbackState] = useState<{ [eventId: string]: { rating: number, comment: string } }>({});
  const [volunteeringEventIds, setVolunteeringEventIds] = useState<string[]>([]);

  useEffect(() => {
    getMyVolunteeringEvents().then(setVolunteeringEventIds).catch(console.error);
  }, [getMyVolunteeringEvents]);

  if (!user) return null;

  const userRegs = registrations.filter(r => r.studentId === user?.id);
  
  const now = new Date().getTime();
  
  const upcomingEvents = userRegs
    .filter(r => r.status === "registered")
    .map(r => ({ reg: r, event: events.find(e => e.id === r.eventId) }))
    .filter(item => item.event && new Date(item.event.endTime).getTime() > now)
    .sort((a, b) => new Date(a.event!.startTime).getTime() - new Date(b.event!.startTime).getTime());

  const pastEvents = userRegs
    .filter(r => r.status === "registered")
    .map(r => ({ reg: r, event: events.find(e => e.id === r.eventId) }))
    .filter(item => item.event && new Date(item.event.endTime).getTime() <= now)
    .sort((a, b) => new Date(b.event!.startTime).getTime() - new Date(a.event!.startTime).getTime());

  const waitlistedEvents = userRegs
    .filter(r => r.status === "waitlisted")
    .map(r => ({ reg: r, event: events.find(e => e.id === r.eventId) }))
    .filter(item => item.event);

  const volunteeringEvents = events.filter(e => volunteeringEventIds.includes(e.id)).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const userCategories = new Set([...upcomingEvents, ...pastEvents].map(item => item.event?.category));
  const recommendedEvents = events
    .filter(e => new Date(e.endTime).getTime() > now)
    .filter(e => !userRegs.some(r => r.eventId === e.id) && !volunteeringEventIds.includes(e.id))
    .filter(e => userCategories.size === 0 || userCategories.has(e.category))
    .slice(0, 3);

  const upcomingEventIds = upcomingEvents.map(u => u.event!.id);
  const relevantAnnouncements = announcements
    .filter(a => upcomingEventIds.includes(a.eventId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const handleFeedbackSubmit = async (eventId: string) => {
    const data = feedbackState[eventId];
    if (data && data.rating > 0) {
      try {
        await addFeedback({
          eventId,
          studentEmail: user.email,
          rating: data.rating,
          comment: data.comment
        });
        toast.success("Feedback submitted!");
      } catch(e: any) {
        toast.error(e.message || "Failed to submit feedback");
      }
    }
  };

  const renderEventList = (list: any[], emptyMessage: string, emptyActionText: string) => {
    if (list.length === 0) {
      return (
        <EmptyState 
          icon={<Calendar className="w-8 h-8" />}
          title={emptyMessage}
          description="You can browse more events on the discovery page."
          actionText={emptyActionText}
          actionHref="/events"
        />
      );
    }

    return (
      <motion.div 
        className="space-y-4" 
        role="list"
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
      >
        <AnimatePresence mode="popLayout">
          {list.map(({ reg, event }) => {
            const isPast = activeTab === "past";
            const hasFeedback = feedbacks.some(f => f.eventId === event.id && f.studentId === user?.id);
            const feedbackData = feedbackState[event.id] || { rating: 0, comment: "" };

            return (
              <motion.div 
                key={reg.id} 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={cardHover}
                className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:border-primary/50 hover:shadow-md transition-shadow"
                role="listitem"
              >
              <Link 
                to={`/events/${event.id}`}
                className="flex items-center gap-6 p-4 group focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-800/50"
                aria-label={`View details for ${event.title}`}
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 hidden sm:block bg-gray-100 dark:bg-gray-800" aria-hidden="true">
                  <img src={event.posterUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-4">{event.title}</h4>
                    {reg.status === 'waitlisted' && (
                      <span className="shrink-0 px-3 py-1 bg-accent/10 text-accent-darker dark:text-accent text-xs font-bold rounded-full">
                        Waitlist
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" aria-hidden="true" />
                      {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1 hidden md:flex truncate">
                      <Clock className="w-4 h-4" aria-hidden="true" />
                      {event.location}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 p-2 text-gray-400 group-hover:text-primary transition-colors">
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </div>
              </Link>
              
              <AnimatePresence mode="wait">
                {isPast && !hasFeedback && (
                  <motion.div 
                    key="form"
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    className="border-t border-gray-100 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/30"
                  >
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-3" id={`feedback-label-${event.id}`}>How was the event?</p>
                    <div className="flex flex-col sm:flex-row gap-4" role="group" aria-labelledby={`feedback-label-${event.id}`}>
                      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star}
                            onClick={() => setFeedbackState(prev => ({ ...prev, [event.id]: { ...feedbackData, rating: star } }))}
                            onKeyDown={(e) => {
                              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                                e.preventDefault();
                                const next = star < 5 ? star + 1 : 1;
                                setFeedbackState(prev => ({ ...prev, [event.id]: { ...feedbackData, rating: next } }));
                              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                                e.preventDefault();
                                const prev = star > 1 ? star - 1 : 5;
                                setFeedbackState(prev => ({ ...prev, [event.id]: { ...feedbackData, rating: prev } }));
                              }
                            }}
                            tabIndex={feedbackData.rating === star || (feedbackData.rating === 0 && star === 1) ? 0 : -1}
                            className="focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
                            role="radio"
                            aria-checked={feedbackData.rating === star}
                            aria-label={`${star} star${star > 1 ? 's' : ''}`}
                          >
                            <Star className={`w-6 h-6 ${star <= feedbackData.rating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600 hover:text-yellow-200"}`} />
                          </button>
                        ))}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input 
                          type="text" 
                          value={feedbackData.comment}
                          onChange={e => setFeedbackState(prev => ({ ...prev, [event.id]: { ...feedbackData, comment: e.target.value } }))}
                          placeholder="Add a comment (optional)..." 
                          aria-label="Additional feedback comment"
                          className="flex-1 text-sm p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-dark outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button 
                          onClick={() => handleFeedbackSubmit(event.id)}
                          disabled={feedbackData.rating === 0}
                          aria-label="Submit feedback"
                          className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                {isPast && hasFeedback && (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border-t border-gray-100 dark:border-gray-800 p-4 bg-green-50 dark:bg-green-900/10 flex items-center gap-2 text-green-700 dark:text-green-400 text-sm font-bold" 
                    role="status"
                  >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                      <Check className="w-5 h-5 text-green-500" aria-hidden="true" /> 
                    </motion.div>
                    Feedback submitted. Thank you!
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <DashboardLayout>
      <StudentOnboarding />
      <motion.div 
        variants={pageTransition} 
        initial="initial" 
        animate="animate" 
        exit="exit" 
        className="max-w-5xl mx-auto space-y-10"
      >
        <header>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Student Dashboard</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">Manage your schedule and discover new experiences.</p>
        </header>

        {error ? (
          <ErrorState 
            title="Failed to load dashboard" 
            message="There was a problem connecting to the server. Please try refreshing."
            onRetry={() => window.location.reload()}
          />
        ) : isLoading ? (
          <div className="space-y-8">
            <SkeletonLoader type="card" className="h-40" />
            <SkeletonLoader type="card" count={3} />
          </div>
        ) : (
          <>
            {relevantAnnouncements.length > 0 && (
          <section className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-3xl p-6" aria-labelledby="announcements-heading">
            <h2 id="announcements-heading" className="font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" /> Recent Announcements
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {relevantAnnouncements.map(ann => {
                const eventForAnn = events.find(e => e.id === ann.eventId);
                return (
                  <motion.div 
                    key={ann.id} 
                    whileHover={cardHover}
                    className="bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-blue-100/50 dark:border-blue-800/50"
                  >
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">{eventForAnn?.title}</div>
                    <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3">{ann.message}</p>
                  </motion.div>
                )
              })}
            </div>
          </section>
        )}

        {volunteeringEvents.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Events You're Helping With</h2>
                <p className="text-gray-500">You are a volunteer for these events</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {volunteeringEvents.map(event => (
                <Link 
                  key={`vol-${event.id}`}
                  to={`/checkin/${event.id}`}
                  className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-purple-100 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-md transition-all flex items-center gap-4 group"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                    <img src={event.posterUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white truncate">{event.title}</h4>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.startTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="shrink-0 p-2 text-purple-600 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tabs and Event Lists */}
        <section>
          <div 
            className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-gray-200 dark:border-gray-800 scrollbar-hide" 
            role="tablist" 
            aria-label="Event categories"
          >
            {[
              { id: "upcoming", label: "Upcoming", count: upcomingEvents.length },
              { id: "waitlist", label: "Waitlist", count: waitlistedEvents.length },
              { id: "past", label: "Past Events", count: pastEvents.length }
            ].map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-semibold transition-colors border-b-2 -mb-[18px] focus:outline-none focus:ring-2 focus:ring-primary ${
                  activeTab === tab.id
                    ? "text-primary border-primary bg-primary/5 dark:bg-primary/10"
                    : "text-gray-500 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="min-h-[300px]" id={`${activeTab}-panel`} role="tabpanel">
            {activeTab === "upcoming" && renderEventList(
              upcomingEvents, 
              "You don't have any upcoming events.", 
              "Browse what's happening"
            )}
            {activeTab === "waitlist" && renderEventList(
              waitlistedEvents, 
              "You are not on any waitlists.", 
              "Explore high-demand events"
            )}
            {activeTab === "past" && renderEventList(
              pastEvents, 
              "No past events to show.", 
              "Find your first event"
            )}
          </div>
        </section>

        {/* Recommended Section */}
        {recommendedEvents.length > 0 && (
          <section className="pt-8 border-t border-gray-200 dark:border-gray-800" aria-labelledby="recommended-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="recommended-heading" className="text-2xl font-bold text-gray-900 dark:text-white">Recommended for You</h2>
              <Link to="/events" className="text-primary font-medium hover:underline text-sm flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-1">
                View All <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedEvents.map(event => (
                <motion.div key={event.id} whileHover={cardHover}>
                  <TiltCard>
                    <Link 
                      to={`/events/${event.id}`}
                      className="block group bg-white dark:bg-surface-dark rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary h-full"
                      aria-label={`View recommended event: ${event.title}`}
                    >
                      <div className="h-32 bg-gray-200 dark:bg-gray-800 relative overflow-hidden" aria-hidden="true">
                        <img src={event.posterUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs font-bold">
                          {event.category}
                        </div>
                      </div>
                      <div className="p-4 flex flex-col justify-between h-[calc(100%-8rem)]">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                            <Calendar className="w-3 h-3" aria-hidden="true" />
                            {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-primary">View Details</span>
                      </div>
                    </Link>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </section>
        )}
          </>
        )}
      </motion.div>

      {user?.role === 'organizer' && (
        <Link
          to="/organizer/events/new"
          className="fixed bottom-8 right-8 bg-primary hover:bg-primary-hover text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 transition-transform hover:scale-105 z-50"
          title="Create New Event"
        >
          <Plus className="w-6 h-6" />
        </Link>
      )}
    </DashboardLayout>
  );
}
