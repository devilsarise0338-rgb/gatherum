import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { Calendar, MapPin, Users, ArrowLeft, Building, Clock, AlertTriangle, CheckCircle2, Loader2, Bell, BellRing } from "lucide-react";
import toast from "react-hot-toast";
import { pageTransition, successAnimation } from "../utils/motion";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { useAccessibleMotion } from "../hooks/useAccessibleMotion";
import { supabase } from "../lib/supabase";
import { EventService } from "../services/api";

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { events, isLoading, error, registrations, registerForEvent, joinWaitlist, cancelRegistration, checkConflict, getPublicAttendeeSignal, getFollowedOrganizers, subscribeToOrganizer, unsubscribeFromOrganizer } = useData();
  const { user } = useAuth();
  const prefersReducedMotion = useAccessibleMotion();
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictEvent, setConflictEvent] = useState<any>(null);
  const [publicAttendees, setPublicAttendees] = useState<{studentId: string; studentEmail?: string}[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const [isRegistering, setIsRegistering] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const contextEvent = events.find(e => e.id === id);
  const [liveEvent, setLiveEvent] = useState(contextEvent);

  useEffect(() => {
    setLiveEvent(contextEvent);
  }, [contextEvent]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`event:${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${id}`
        },
        (payload) => {
          setLiveEvent(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              registeredCount: payload.new.registered_count ?? prev.registeredCount,
              waitlistCount: payload.new.waitlist_count ?? prev.waitlistCount,
              capacity: payload.new.capacity ?? prev.capacity
            };
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Sync state just in case we missed updates during connection
          EventService.getEventById(id).then(updated => {
            if (updated) setLiveEvent(updated);
          });
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          // Reconnect logic handles refetching when it resubscribes
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const event = liveEvent;

  useEffect(() => {
    if (event) {
      getPublicAttendeeSignal(event.id).then(setPublicAttendees).catch(console.error);
      if (user && event.organizerId) {
        getFollowedOrganizers().then(followed => {
          setIsFollowing(followed.includes(event.organizerId!));
        }).catch(console.error);
      }
    }
  }, [event, getPublicAttendeeSignal, getFollowedOrganizers, user]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SkeletonLoader type="card" className="h-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <SkeletonLoader type="header" />
            <SkeletonLoader type="text" count={5} />
          </div>
          <div className="md:col-span-1">
            <SkeletonLoader type="card" className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState 
          title="Failed to load event" 
          message="There was a problem connecting to the server. Please try refreshing."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState 
          icon={<AlertTriangle className="w-8 h-8" />}
          title="Event not found"
          description="The event you are looking for does not exist or has been removed."
          actionText="Browse Events"
          actionHref="/events"
        />
      </div>
    );
  }

  const isFull = event.registeredCount >= event.capacity;
  
  let userReg = null;
  if (user) {
    userReg = registrations.find(r => r.eventId === event.id && r.studentId === user?.id);
  }

  const performRegistration = async (action: () => Promise<void>) => {
    setIsRegistering(true);
    
    // Safety 8-second timeout
    timeoutRef.current = setTimeout(() => {
      setIsRegistering(false);
      toast.error("Network timeout. Please try again.");
    }, 8000);

    try {
      // Simulate slight network delay for the UX
      await new Promise(r => setTimeout(r, 600));
      await action();
      toast.success("Registration successful!");
    } catch (err) {
      toast.error("Failed to register. Please try again.");
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsRegistering(false);
    }
  };

  const handleRegisterClick = () => {
    if (!user) return; // In a real app, redirect to login
    
    const conflict = checkConflict(event.id);
    if (conflict) {
      setConflictEvent(conflict);
      setShowConflictModal(true);
    } else {
      performRegistration(() => isFull ? joinWaitlist(event.id) : registerForEvent(event.id));
    }
  };

  const confirmRegistrationDespiteConflict = () => {
    setShowConflictModal(false);
    performRegistration(() => isFull ? joinWaitlist(event.id) : registerForEvent(event.id));
  };

  const handleCancelClick = async () => {
    try {
      await cancelRegistration(event.id);
      toast.success("Registration cancelled");
    } catch (err) {
      toast.error("Failed to cancel registration");
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      toast.error("Please login to follow this organizer");
      return;
    }
    if (!event.organizerId) return;
    
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await unsubscribeFromOrganizer(event.organizerId);
        setIsFollowing(false);
        toast.success("Unsubscribed from organizer");
      } else {
        await subscribeToOrganizer(event.organizerId);
        setIsFollowing(true);
        toast.success("Subscribed! You'll be notified of their new events.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update subscription");
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <motion.div 
      variants={prefersReducedMotion ? {} : pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-bg-light dark:bg-bg-dark min-h-[calc(100vh-4rem)] transition-colors pb-24"
    >
      {/* Hero Banner */}
      <div className="w-full h-64 md:h-96 relative bg-gray-900 overflow-hidden" aria-hidden="true">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          src={event.posterUrl} 
          alt={event.title} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-light dark:from-bg-dark via-transparent to-transparent"></div>
        <div className="absolute top-6 left-6 z-10">
          <Link to="/events" className="flex items-center gap-2 text-white bg-black/40 hover:bg-black/60 backdrop-blur-md px-4 py-2 rounded-full transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-transparent">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10"
      >
        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 dark:border-gray-800">
          
          <div className="flex flex-col md:flex-row gap-8 justify-between items-start mb-8">
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
              }}
              className="flex-1"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 mb-4 text-xs font-bold uppercase tracking-wider">
                {event.category}
              </motion.div>
              <motion.h1 variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{event.title}</motion.h1>
              
              <div className="flex flex-col gap-3 text-gray-600 dark:text-gray-300 text-sm md:text-base">
                <motion.div variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(event.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <p>{new Date(event.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                  </div>
                </motion.div>
                
                <motion.div variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent-darker dark:text-accent shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{event.location}</p>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Get Directions</a>
                  </div>
                </motion.div>
                
                <motion.div variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/c/${event.organizerId}`} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <Building className="w-5 h-5" />
                    </Link>
                    <div>
                      <Link to={`/c/${event.organizerId}`} className="font-semibold text-gray-900 dark:text-white hover:underline block">
                        {event.department}
                      </Link>
                      <p className="text-sm text-gray-500">Organizer</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleToggleFollow}
                    disabled={isFollowLoading}
                    className={`px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50 ${isFollowing ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
                  >
                    {isFollowing ? <><BellRing className="w-4 h-4" /> Following</> : <><Bell className="w-4 h-4" /> Follow</>}
                  </button>
                </motion.div>
                
                {publicAttendees.length > 0 && (
                  <motion.div variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Who's going</p>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {publicAttendees.slice(0, 5).map((att, i) => (
                          <div key={att.studentId} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-white dark:border-surface-dark flex items-center justify-center text-primary font-bold text-xs shadow-sm" title={att.studentEmail}>
                            {att.studentEmail?.charAt(0).toUpperCase() || '?'}
                          </div>
                        ))}
                      </div>
                      {publicAttendees.length > 5 && (
                        <div className="text-sm text-gray-500 font-medium ml-2">
                          +{publicAttendees.length - 5} more
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Registration Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-full md:w-80 bg-gray-50 dark:bg-bg-dark rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shrink-0"
            >
              <h3 className="font-bold text-xl mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">Registration</h3>
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 dark:text-gray-400">Status</span>
                <div className="flex flex-col items-end">
                  <span className={`font-bold ${isFull ? 'text-accent' : 'text-primary'}`}>
                    {isFull ? 'At Capacity' : 'Available'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {event.registeredCount} / {event.capacity} registered
                  </span>
                </div>
              </div>
              
              {user?.role === 'student' ? (
                <>
                  {userReg ? (
                    <AnimatePresence>
                      <motion.div 
                        variants={successAnimation}
                        initial="initial"
                        animate="animate"
                        className="space-y-4"
                        role="status"
                      >
                        <div className={`p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2 ${
                          userReg.status === 'waitlisted' 
                            ? 'bg-accent/10 text-accent-darker dark:text-accent' 
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        }`}>
                          {userReg.status !== 'waitlisted' && <CheckCircle2 className="w-5 h-5" aria-hidden="true" />}
                          {userReg.status === 'waitlisted' 
                            ? `On Waitlist (Position #${userReg.waitlistPosition})` 
                            : 'You are registered!'}
                        </div>
                        <button 
                          onClick={handleCancelClick}
                          className="w-full py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                          Cancel {userReg.status === 'waitlisted' ? 'Waitlist' : 'Registration'}
                        </button>
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <button 
                      onClick={handleRegisterClick}
                      disabled={isRegistering}
                      className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-bg-dark relative flex items-center justify-center ${
                        isFull 
                          ? 'bg-accent shadow-accent/30 hover:bg-yellow-500 focus:ring-accent disabled:bg-accent/80' 
                          : 'bg-primary shadow-primary/30 hover:bg-primary-hover focus:ring-primary disabled:bg-primary/80'
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {isRegistering ? (
                          <motion.div
                            key="spinner"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="text"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            {isFull ? 'Join Waitlist' : 'Register Now'}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  {user ? (
                    <div className="text-center p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm text-gray-600 dark:text-gray-300">
                      Only students can register for events.
                    </div>
                  ) : (
                    <Link 
                      to="/login"
                      className="block text-center w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] bg-primary shadow-primary/30 hover:bg-primary-hover"
                    >
                      Log in to Register
                    </Link>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          <div className="prose dark:prose-invert max-w-none border-t border-gray-100 dark:border-gray-800 pt-8">
            <h2 className="text-2xl font-bold mb-4">About this event</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
              {event.description}
            </p>
          </div>
          
        </div>
      </motion.div>

      {/* Conflict Modal */}
      <AnimatePresence>
        {showConflictModal && conflictEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="conflict-title">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-white dark:bg-surface-dark rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <h2 id="conflict-title" className="text-2xl font-bold text-center mb-2">Schedule Conflict</h2>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
                This event overlaps with another event you are currently registered for:
              </p>
              
              <div className="bg-gray-50 dark:bg-bg-dark p-4 rounded-xl mb-8 border border-gray-200 dark:border-gray-700">
                <h4 className="font-bold text-gray-900 dark:text-white mb-1">{conflictEvent.title}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {new Date(conflictEvent.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - 
                    {new Date(conflictEvent.endTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowConflictModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRegistrationDespiteConflict}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 dark:focus:ring-offset-bg-dark"
                >
                  Register Anyway
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
