import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { useData, EventCategory } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { Calendar, MapPin, Users, Search, AlertCircle } from "lucide-react";
import { pageTransition } from "../utils/motion";
import TiltCard from "./TiltCard";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";

export default function EventsPage() {
  const { events, isLoading, error } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | "All">("All");



  const filteredEvents = events.filter((event) => {
    if (event.isUnpublished && user?.role !== "admin") return false;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories: (EventCategory | "All")[] = ["All", "Social", "Academic", "Sports", "Arts", "Club"];

  return (
    <motion.div 
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-bg-light dark:bg-bg-dark min-h-[calc(100vh-4rem)] transition-colors py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Discover Events</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl">Find out what's happening around campus. Register for events, join clubs, and make the most of your college experience.</p>
        </header>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8" role="search" aria-label="Events search and filters">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <label htmlFor="search-events" className="sr-only">Search events</label>
            <input
              id="search-events"
              type="text"
              placeholder="Search events, clubs, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl leading-5 bg-white dark:bg-surface-dark text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide" role="group" aria-label="Event categories">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                aria-pressed={categoryFilter === cat}
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark ${
                  categoryFilter === cat
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Event Grid */}
        <div aria-live="polite">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="status" aria-label="Loading events">
              <SkeletonLoader type="card" count={6} />
            </div>
          ) : error ? (
            <div className="py-12">
              <EmptyState 
                icon={<AlertCircle className="w-8 h-8" />}
                title="Failed to load events"
                description="There was a problem connecting to the server. Please try refreshing the page."
                actionText="Refresh Page"
                onAction={() => window.location.reload()}
              />
            </div>
          ) : filteredEvents.length > 0 ? (
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
              role="list"
            >
              {filteredEvents.map((event) => (
                <motion.div key={event.id} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }} role="listitem">
                  <TiltCard>
                    <Link 
                      to={`/events/${event.id}`}
                      aria-label={`View details for ${event.title}`}
                      className="group flex flex-col h-full bg-white dark:bg-surface-dark rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-2xl transition-shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-bg-dark shadow-md"
                    >
                      <div className="h-48 relative overflow-hidden bg-gray-100 dark:bg-gray-800" aria-hidden="true">
                        <img src={event.posterUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-4 right-4 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 dark:text-white shadow-sm">
                          {event.category}
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{event.title}</h3>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4 text-primary" aria-hidden="true" />
                            <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="w-4 h-4 text-accent" aria-hidden="true" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2">{event.description}</p>
                        
                        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                            <Users className="w-4 h-4" aria-hidden="true" />
                            <span>{event.registeredCount} / {event.capacity}</span>
                          </div>
                          <span className="text-primary font-bold text-sm">View →</span>
                        </div>
                      </div>
                    </Link>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="py-12">
              <EmptyState 
                icon={<Search className="w-8 h-8" />}
                title="No events found"
                description="We couldn't find any events matching your search criteria. Try adjusting your filters."
                actionText="Clear Filters"
                onAction={() => {
                  setSearchTerm("");
                  setCategoryFilter("All");
                }}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
