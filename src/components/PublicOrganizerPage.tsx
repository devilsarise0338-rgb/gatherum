import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { Building, MapPin, Calendar, ArrowLeft, Download, Bell, BellRing, Share2 } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import TiltCard from "./TiltCard";
import toast from "react-hot-toast";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";

export default function PublicOrganizerPage() {
  const { id } = useParams<{ id: string }>();
  const { events, isLoading, error, getFollowedOrganizers, subscribeToOrganizer, unsubscribeFromOrganizer } = useData();
  const { user } = useAuth();
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  const organizerEvents = events.filter(e => e.organizerId === id && !e.isUnpublished);
  
  // We deduce organizer info from the first event, in a real app we'd fetch the organizer profile
  const department = organizerEvents.length > 0 ? organizerEvents[0].department : "Organizer";

  useEffect(() => {
    if (user && id) {
      getFollowedOrganizers().then(followed => {
        setIsFollowing(followed.includes(id));
      }).catch(console.error);
    }
  }, [id, getFollowedOrganizers, user]);

  const handleToggleFollow = async () => {
    if (!user) {
      toast.error("Please login to follow this organizer");
      return;
    }
    if (!id) return;
    
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await unsubscribeFromOrganizer(id);
        setIsFollowing(false);
        toast.success("Unsubscribed from organizer");
      } else {
        await subscribeToOrganizer(id);
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

  const handleDownloadIcs = () => {
    // Generate a simple ICS file for all upcoming events
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Gatherum//Events//EN",
    ];
    
    organizerEvents.forEach(event => {
      const start = new Date(event.date).toISOString().replace(/[-:]/g, '').split('.')[0] + "Z";
      const end = new Date(event.endTime).toISOString().replace(/[-:]/g, '').split('.')[0] + "Z";
      
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${event.id}@gatherum.poornima.org`);
      lines.push(`DTSTAMP:${start}`);
      lines.push(`DTSTART:${start}`);
      lines.push(`DTEND:${end}`);
      lines.push(`SUMMARY:${event.title}`);
      lines.push(`DESCRIPTION:${event.description}`);
      lines.push(`LOCATION:${event.location}`);
      lines.push("END:VEVENT");
    });
    
    lines.push("END:VCALENDAR");
    
    const blob = new Blob([lines.join("\r\n")], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${department.replace(/\s+/g, '_')}_Calendar.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Calendar feed downloaded");
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${department} on Gatherum`,
        url: window.location.href
      });
    } catch (err) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-light dark:bg-bg-dark">
      <Navbar />
      <main className="flex-grow pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/events" className="inline-flex items-center gap-2 text-primary hover:underline mb-8 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Discover
          </Link>

          {error ? (
            <ErrorState 
              title="Failed to load organizer" 
              message="There was a problem connecting to the server. Please try refreshing."
              onRetry={() => window.location.reload()}
            />
          ) : isLoading ? (
            <div className="space-y-8">
              <SkeletonLoader type="card" className="h-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SkeletonLoader type="card" className="h-[300px]" count={3} />
              </div>
            </div>
          ) : (
            <>
              <header className="bg-white dark:bg-surface-dark p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 shrink-0 border-4 border-white dark:border-surface-dark shadow-md z-10">
                  <Building className="w-12 h-12" />
                </div>
                
                <div className="flex-grow z-10">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{department}</h1>
                  <p className="text-gray-500 mb-6">Organizer on Gatherum • {organizerEvents.length} upcoming events</p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <button 
                      onClick={handleToggleFollow}
                      disabled={isFollowLoading}
                      className={`px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50 ${isFollowing ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-primary text-white hover:bg-primary-hover'}`}
                    >
                      {isFollowing ? <><BellRing className="w-4 h-4" /> Following</> : <><Bell className="w-4 h-4" /> Subscribe</>}
                    </button>
                    <button 
                      onClick={handleDownloadIcs}
                      className="px-4 py-2 rounded-full font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" /> .ics Feed
                    </button>
                    <button 
                      onClick={handleShare}
                      className="px-4 py-2 rounded-full font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                      <Share2 className="w-4 h-4" /> Share
                    </button>
                  </div>
                </div>
              </header>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" /> Upcoming Events
              </h2>
              
              {organizerEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {organizerEvents.map(event => (
                    <motion.div key={event.id} whileHover={{ y: -5 }}>
                      <TiltCard>
                        <Link 
                          to={`/events/${event.id}`}
                          className="block group bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 h-full"
                        >
                          <div className="h-40 bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                            <img src={event.posterUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-3 left-3 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary">
                              {event.category}
                            </div>
                          </div>
                          <div className="p-5 flex flex-col justify-between h-[calc(100%-10rem)]">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">{event.title}</h3>
                              <div className="space-y-1 mb-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 line-clamp-1">
                                  <MapPin className="w-4 h-4" />
                                  {event.location}
                                </p>
                              </div>
                            </div>
                            <div className="text-primary font-bold text-sm group-hover:underline mt-auto">
                              View Details →
                            </div>
                          </div>
                        </Link>
                      </TiltCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={<Calendar className="w-12 h-12" />}
                  title="No upcoming events"
                  description="This organizer hasn't scheduled any events yet. Subscribe to be notified when they do."
                />
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
